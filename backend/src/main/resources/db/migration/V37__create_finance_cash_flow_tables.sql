-- =============================================================================
-- Migration: V37__create_finance_cash_flow_tables.sql
-- Module: Finance (Cash Flow Management)
-- Description: Creates finance_cash_flows table, finance_cash_flow_counters sequence
--              table, financial calculation check constraints, audit triggers, and performance indexes.
-- =============================================================================

-- 1. Finance Cash Flows Table
CREATE TABLE IF NOT EXISTS public.finance_cash_flows (
    id BIGSERIAL PRIMARY KEY,
    cash_flow_id VARCHAR(50) NOT NULL UNIQUE,
    period VARCHAR(50) NOT NULL,
    period_code VARCHAR(10) NOT NULL UNIQUE,

    -- Inflows
    opening_cash NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (opening_cash >= 0),
    collections NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (collections >= 0),
    other_inflows NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (other_inflows >= 0),
    total_inflows NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_inflows >= 0),

    -- Outflows
    vendor_payments NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (vendor_payments >= 0),
    payroll_payments NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (payroll_payments >= 0),
    operating_expenses NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (operating_expenses >= 0),
    other_outflows NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (other_outflows >= 0),
    total_outflows NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_outflows >= 0),

    -- Derived Balances
    net_cash_flow NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    closing_cash NUMERIC(15, 2) NOT NULL DEFAULT 0.00,

    -- Status & Audit
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Completed', 'Pending', 'Draft', 'Projected')),
    notes TEXT,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Business & Mathematical Integrity Constraints
    CONSTRAINT chk_cf_period_code_format CHECK (period_code ~ '^\d{4}-(0[1-9]|1[0-2])$'),
    CONSTRAINT chk_cf_total_inflows CHECK (total_inflows = (collections + other_inflows)),
    CONSTRAINT chk_cf_total_outflows CHECK (total_outflows = (vendor_payments + payroll_payments + operating_expenses + other_outflows)),
    CONSTRAINT chk_cf_net_cash_flow CHECK (net_cash_flow = (total_inflows - total_outflows)),
    CONSTRAINT chk_cf_closing_cash CHECK (closing_cash = (opening_cash + net_cash_flow))
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cf_period_code ON public.finance_cash_flows(period_code DESC);
CREATE INDEX IF NOT EXISTS idx_cf_status ON public.finance_cash_flows(status);
CREATE INDEX IF NOT EXISTS idx_cf_cash_flow_id ON public.finance_cash_flows(cash_flow_id);
CREATE INDEX IF NOT EXISTS idx_cf_created_at ON public.finance_cash_flows(created_at DESC);

-- Attach update_updated_at trigger if trigger function exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'update_collections_updated_at_column'
    ) THEN
        DROP TRIGGER IF EXISTS trigger_finance_cash_flows_updated_at ON public.finance_cash_flows;
        CREATE TRIGGER trigger_finance_cash_flows_updated_at
        BEFORE UPDATE ON public.finance_cash_flows
        FOR EACH ROW
        EXECUTE FUNCTION update_collections_updated_at_column();
    END IF;
END $$;

-- 2. Finance Cash Flow Counters Table (Atomic Year-based Sequence Generator)
CREATE TABLE IF NOT EXISTS public.finance_cash_flow_counters (
    period_year VARCHAR(10) PRIMARY KEY,
    last_number INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
