-- ============================================================================
-- V19__extend_collections_invoices_and_payment_counters.sql
-- Description:
--   1. Preflight integrity guards (aborts on invariant violations or duplicate references)
--   2. Atomic sequence counter tables (collections_payment_counters, collections_reversal_counters)
--   3. Auditable payment reversals table with normalized idempotency constraints
--   4. Dynamic foreign key replacement: drops any cascade FK, adds ON DELETE RESTRICT
--   5. Normalized partial unique index on payment references
--   6. Extend collections_invoices with Finance attributes and safe defaults
--   7. Safe unconditional backfill of all historical records with agreed precedence
--   8. Post-backfill verification guard (asserts all records match exact status counts)
--   9. Backward-compatibility trigger for Collections service and Finance creation
--  10. Performance indexes for Finance filtering & sorting
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: EXECUTABLE PREFLIGHT INTEGRITY GUARDS
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_invalid_invariants_count INTEGER;
    v_duplicate_ref_count INTEGER;
    v_discrepancy_details TEXT;
BEGIN
    -- Guard 1: Verify non-negativity and balance invariants on existing invoices
    SELECT COUNT(*), 
           string_agg(format('ID: %s (Amt: %s, Paid: %s, Outstanding: %s)', id, invoice_amount, amount_paid, outstanding), '; ')
    INTO v_invalid_invariants_count, v_discrepancy_details
    FROM public.collections_invoices
    WHERE invoice_amount < 0
       OR amount_paid < 0
       OR outstanding < 0
       OR amount_paid > invoice_amount
       OR ROUND(amount_paid + outstanding, 2) <> ROUND(invoice_amount, 2);

    IF v_invalid_invariants_count > 0 THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: % invoice(s) violate financial invariants: %', 
            v_invalid_invariants_count, v_discrepancy_details;
    END IF;

    -- Guard 2: Verify duplicate payment references per invoice under normalized rule
    SELECT COUNT(*)
    INTO v_duplicate_ref_count
    FROM (
        SELECT invoice_id, UPPER(TRIM(reference_id)) AS norm_ref
        FROM public.collections_payments
        WHERE reference_id IS NOT NULL AND TRIM(reference_id) <> ''
        GROUP BY invoice_id, UPPER(TRIM(reference_id))
        HAVING COUNT(*) > 1
    ) dupes;

    IF v_duplicate_ref_count > 0 THEN
        RAISE EXCEPTION 'MIGRATION ABORTED: % duplicate payment reference(s) detected under normalized rule (invoice_id, UPPER(TRIM(reference_id)))', 
            v_duplicate_ref_count;
    END IF;

    RAISE NOTICE 'Preflight validation successful: Financial invariants and reference uniqueness verified.';
END $$;

-- ----------------------------------------------------------------------------
-- STEP 2: CONCURRENCY-SAFE COUNTERS & REVERSALS TABLES
-- ----------------------------------------------------------------------------

-- Table for atomic payment ID sequence generation (PAY-YYYY-XXXXXX)
CREATE TABLE IF NOT EXISTS public.collections_payment_counters (
    prefix VARCHAR(10) NOT NULL DEFAULT 'PAY',
    year INTEGER NOT NULL,
    current_val BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (prefix, year)
);

-- Seed payment counter with current maximum sequence from collections_payments
INSERT INTO public.collections_payment_counters (prefix, year, current_val, created_at, updated_at)
SELECT 
    'PAY', 
    2025, 
    COALESCE(MAX(CASE WHEN id ~ '^PAY-2025-[0-9]+$' THEN substring(id from '^PAY-2025-([0-9]+)$')::bigint ELSE 0 END), 0),
    NOW(), 
    NOW()
FROM public.collections_payments
ON CONFLICT (prefix, year) DO UPDATE 
SET current_val = GREATEST(public.collections_payment_counters.current_val, EXCLUDED.current_val);

-- Seed payment counter for 2026
INSERT INTO public.collections_payment_counters (prefix, year, current_val, created_at, updated_at)
SELECT 
    'PAY', 
    2026, 
    COALESCE(MAX(CASE WHEN id ~ '^PAY-2026-[0-9]+$' THEN substring(id from '^PAY-2026-([0-9]+)$')::bigint ELSE 0 END), 0),
    NOW(), 
    NOW()
FROM public.collections_payments
ON CONFLICT (prefix, year) DO UPDATE 
SET current_val = GREATEST(public.collections_payment_counters.current_val, EXCLUDED.current_val);

-- Table for atomic reversal ID sequence generation (REV-YYYY-XXXXXX)
CREATE TABLE IF NOT EXISTS public.collections_reversal_counters (
    prefix VARCHAR(10) NOT NULL DEFAULT 'REV',
    year INTEGER NOT NULL,
    current_val BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (prefix, year)
);

-- Table for auditable payment reversals
CREATE TABLE IF NOT EXISTS public.collections_payment_reversals (
    id VARCHAR(50) PRIMARY KEY,
    payment_id VARCHAR(50) NOT NULL REFERENCES public.collections_payments(id) ON DELETE RESTRICT,
    invoice_id VARCHAR(50) NOT NULL REFERENCES public.collections_invoices(id) ON DELETE RESTRICT,
    reversal_date DATE NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    reference_id VARCHAR(100),
    idempotency_key VARCHAR(100),
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Normalized uniqueness constraint per payment reference to avoid duplicate submissions
CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_reversals_payment_norm_ref
    ON public.collections_payment_reversals (payment_id, (UPPER(TRIM(reference_id))))
    WHERE reference_id IS NOT NULL AND TRIM(reference_id) <> '';

-- Global client idempotency key constraint
CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_reversals_idempotency_key
    ON public.collections_payment_reversals (idempotency_key)
    WHERE idempotency_key IS NOT NULL AND TRIM(idempotency_key) <> '';

CREATE INDEX IF NOT EXISTS idx_payment_reversals_payment_id ON public.collections_payment_reversals(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_reversals_invoice_id ON public.collections_payment_reversals(invoice_id);

-- ----------------------------------------------------------------------------
-- STEP 3: DYNAMIC FOREIGN KEY REPLACEMENT (ELIMINATE CASCADE SAFELY)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        WHERE c.conrelid = 'public.collections_payments'::regclass
          AND c.contype = 'f'
          AND a.attname = 'invoice_id'
    ) LOOP
        EXECUTE 'ALTER TABLE public.collections_payments DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.collections_payments'::regclass 
          AND conname = 'fk_collections_payments_invoice'
    ) THEN
        ALTER TABLE public.collections_payments
            ADD CONSTRAINT fk_collections_payments_invoice
            FOREIGN KEY (invoice_id) 
            REFERENCES public.collections_invoices(id) 
            ON DELETE RESTRICT;
    END IF;
END $$;

-- Partial unique index on normalized reference_id per invoice
CREATE UNIQUE INDEX IF NOT EXISTS uq_collections_payments_invoice_norm_ref
    ON public.collections_payments (invoice_id, (UPPER(TRIM(reference_id))))
    WHERE reference_id IS NOT NULL AND TRIM(reference_id) <> '';

-- ----------------------------------------------------------------------------
-- STEP 4: EXTEND COLLECTIONS_INVOICES WITH FINANCE MODULE ATTRIBUTES
-- ----------------------------------------------------------------------------
ALTER TABLE public.collections_invoices
    ADD COLUMN IF NOT EXISTS project_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS contract_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS amount_before_tax NUMERIC(14, 2),
    ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS payment_terms_days INTEGER,
    ADD COLUMN IF NOT EXISTS invoice_status VARCHAR(50) NOT NULL DEFAULT 'Unpaid',
    ADD COLUMN IF NOT EXISTS collection_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- ----------------------------------------------------------------------------
-- STEP 5: SAFE UNCONDITIONAL BACKFILL OF ALL HISTORICAL RECORDS
-- ----------------------------------------------------------------------------
UPDATE public.collections_invoices
SET 
    amount_before_tax = COALESCE(amount_before_tax, invoice_amount),
    tax_rate = COALESCE(tax_rate, 0.00),
    tax_amount = COALESCE(tax_amount, 0.00),
    invoice_status = CASE 
        WHEN outstanding <= 0 THEN 'Paid'
        WHEN amount_paid > 0 THEN 'Partially Paid'
        ELSE 'Unpaid'
    END,
    collection_status = CASE 
        WHEN outstanding <= 0 THEN 'Completed'
        WHEN (status = 'Overdue' OR (days_overdue IS NOT NULL AND days_overdue > 0)) AND outstanding > 0 THEN 'Follow Up'
        WHEN amount_paid > 0 AND outstanding > 0 THEN 'In Progress'
        ELSE 'Pending'
    END;

-- ----------------------------------------------------------------------------
-- STEP 6: POST-BACKFILL VERIFICATION GUARD
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_total INTEGER;
    v_paid INTEGER;
    v_partially_paid INTEGER;
    v_unpaid INTEGER;
    v_completed INTEGER;
    v_follow_up INTEGER;
    v_in_progress INTEGER;
    v_pending INTEGER;
    v_null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM public.collections_invoices;
    
    SELECT COUNT(*) INTO v_paid FROM public.collections_invoices WHERE invoice_status = 'Paid';
    SELECT COUNT(*) INTO v_partially_paid FROM public.collections_invoices WHERE invoice_status = 'Partially Paid';
    SELECT COUNT(*) INTO v_unpaid FROM public.collections_invoices WHERE invoice_status = 'Unpaid';

    SELECT COUNT(*) INTO v_completed FROM public.collections_invoices WHERE collection_status = 'Completed';
    SELECT COUNT(*) INTO v_follow_up FROM public.collections_invoices WHERE collection_status = 'Follow Up';
    SELECT COUNT(*) INTO v_in_progress FROM public.collections_invoices WHERE collection_status = 'In Progress';
    SELECT COUNT(*) INTO v_pending FROM public.collections_invoices WHERE collection_status = 'Pending';

    SELECT COUNT(*) INTO v_null_count 
    FROM public.collections_invoices 
    WHERE invoice_status IS NULL OR collection_status IS NULL;

    IF v_null_count > 0 THEN
        RAISE EXCEPTION 'POST-BACKFILL INTEGRITY CHECK FAILED: % invoices contain NULL status.', v_null_count;
    END IF;

    IF (v_paid + v_partially_paid + v_unpaid) <> v_total THEN
        RAISE EXCEPTION 'POST-BACKFILL INTEGRITY CHECK FAILED: invoice_status sum (%) != total (%)', 
            (v_paid + v_partially_paid + v_unpaid), v_total;
    END IF;

    IF (v_completed + v_follow_up + v_in_progress + v_pending) <> v_total THEN
        RAISE EXCEPTION 'POST-BACKFILL INTEGRITY CHECK FAILED: collection_status sum (%) != total (%)',
            (v_completed + v_follow_up + v_in_progress + v_pending), v_total;
    END IF;

    RAISE NOTICE 'Backfill Post-Verification Succeeded: Total Invoices = %, invoice_status (Paid: %, Partially Paid: %, Unpaid: %), collection_status (Completed: %, Follow Up: %, In Progress: %, Pending: %)',
        v_total, v_paid, v_partially_paid, v_unpaid,
        v_completed, v_follow_up, v_in_progress, v_pending;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 7: BACKWARD-COMPATIBILITY TRIGGER FOR COLLECTIONS SERVICE & FINANCE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_collections_invoice_statuses()
RETURNS TRIGGER AS $$
BEGIN
    -- Synchronize amount_before_tax if omitted
    IF NEW.amount_before_tax IS NULL THEN
        NEW.amount_before_tax := NEW.invoice_amount;
    END IF;

    -- Synchronize tax_amount and tax_rate if omitted
    IF NEW.tax_amount IS NULL THEN
        NEW.tax_amount := 0.00;
    END IF;
    IF NEW.tax_rate IS NULL THEN
        NEW.tax_rate := 0.00;
    END IF;

    -- Maintain status synchronization
    IF NEW.outstanding <= 0 THEN
        NEW.invoice_status := 'Paid';
        NEW.collection_status := 'Completed';
    ELSIF NEW.amount_paid > 0 THEN
        NEW.invoice_status := 'Partially Paid';
        IF (NEW.status = 'Overdue' OR (NEW.days_overdue IS NOT NULL AND NEW.days_overdue > 0)) THEN
            NEW.collection_status := 'Follow Up';
        ELSE
            NEW.collection_status := 'In Progress';
        END IF;
    ELSE
        NEW.invoice_status := 'Unpaid';
        IF (NEW.status = 'Overdue' OR (NEW.days_overdue IS NOT NULL AND NEW.days_overdue > 0)) THEN
            NEW.collection_status := 'Follow Up';
        ELSE
            NEW.collection_status := 'Pending';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_collections_invoice_statuses ON public.collections_invoices;
CREATE TRIGGER trigger_sync_collections_invoice_statuses
BEFORE INSERT OR UPDATE OF amount_paid, outstanding, status, days_overdue
ON public.collections_invoices
FOR EACH ROW
EXECUTE FUNCTION public.sync_collections_invoice_statuses();

-- ----------------------------------------------------------------------------
-- STEP 8: PERFORMANCE INDEXES FOR FINANCE INVOICES FILTERING & SORTING
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_collections_invoices_inv_status ON public.collections_invoices(invoice_status);
CREATE INDEX IF NOT EXISTS idx_collections_invoices_coll_status ON public.collections_invoices(collection_status);
CREATE INDEX IF NOT EXISTS idx_collections_invoices_project ON public.collections_invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_collections_invoices_contract ON public.collections_invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_collections_invoices_date_desc ON public.collections_invoices(invoice_date DESC);

