-- V18__create_finance_payments_tables.sql
-- Description: Create finance_payments table and counter for Finance Payments module

CREATE TABLE IF NOT EXISTS public.finance_payments (
    id VARCHAR(50) PRIMARY KEY,
    payment_date DATE NOT NULL,
    invoice_id VARCHAR(50) NOT NULL,
    client_id VARCHAR(50) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    invoice_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    mode VARCHAR(50) NOT NULL,
    reference_no VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    variance_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_payments_date ON public.finance_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_finance_payments_status ON public.finance_payments(status);
CREATE INDEX IF NOT EXISTS idx_finance_payments_client ON public.finance_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_finance_payments_invoice ON public.finance_payments(invoice_id);

CREATE TABLE IF NOT EXISTS public.finance_payment_counter (
    year_month VARCHAR(10) PRIMARY KEY,
    last_number INTEGER NOT NULL DEFAULT 0
);

-- Seed initial sequence counter for October 2026
INSERT INTO public.finance_payment_counter (year_month, last_number)
VALUES ('202610', 122)
ON CONFLICT (year_month) DO UPDATE SET last_number = EXCLUDED.last_number;

-- Seed Calibrated Finance Payment Records (128 records)
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202609-001', '2026-09-05', 'INV-2026-001', 'CL-001', 'TechCorp Solutions', 950000.00, 950000.00, 'Bank Transfer', 'UTR901001', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202609-002', '2026-09-12', 'INV-2026-002', 'CL-002', 'Apex Retail', 1375000.00, 1375000.00, 'NEFT', 'NEFT901002', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202609-003', '2026-09-15', 'INV-2026-003', 'CL-003', 'Innovate Labs', 50000.00, 50000.00, 'UPI', 'UPI901003', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202609-004', '2026-09-18', 'INV-2026-004', 'CL-004', 'Alpha Logistics', 345339.00, 388817.00, 'RTGS', 'RTGS901004', 'Partially Matched', 43478.00, 'Phase 1 partial balance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202609-005', '2026-09-22', 'INV-2026-005', 'CL-005', 'Horizon Health', 400000.00, 400000.00, 'Bank Transfer', 'UTR901005', 'Pending', 0.00, 'Hold for audit')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202609-006', '2026-09-26', 'INV-2026-006', 'CL-006', 'Zenith Media', 372727.00, 372727.00, 'Cheque', 'CHQ901006', 'Pending', 0.00, 'Cheque in transit')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-001', '2026-10-02', 'INV-2026-001', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'Bank Transfer', 'BAN100001', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-002', '2026-10-03', 'INV-2026-002', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'NEFT', 'NEF100002', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-003', '2026-10-04', 'INV-2026-003', 'CL-003', 'Innovate Labs', 21700.00, 21700.00, 'UPI', 'UPI100003', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-004', '2026-10-01', 'INV-2026-004', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'Cheque', 'CHE100004', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-005', '2026-10-02', 'INV-2026-005', 'CL-005', 'Horizon Health', 18900.00, 18900.00, 'RTGS', 'RTG100005', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-006', '2026-10-03', 'INV-2026-006', 'CL-006', 'Zenith Media', 21700.00, 21700.00, 'Bank Transfer', 'BAN100006', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-007', '2026-10-04', 'INV-2026-007', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'NEFT', 'NEF100007', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-008', '2026-10-01', 'INV-2026-008', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'UPI', 'UPI100008', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-009', '2026-10-02', 'INV-2026-009', 'CL-003', 'Innovate Labs', 27500.00, 29500.00, 'Cheque', 'CHE100009', 'Partially Matched', 2000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-010', '2026-10-03', 'INV-2026-010', 'CL-004', 'Alpha Logistics', 18900.00, 18900.00, 'RTGS', 'RTG100010', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-011', '2026-10-04', 'INV-2026-011', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'Bank Transfer', 'BAN100011', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-012', '2026-10-01', 'INV-2026-012', 'CL-006', 'Zenith Media', 21700.00, 21700.00, 'NEFT', 'NEF100012', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-013', '2026-10-02', 'INV-2026-013', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'UPI', 'UPI100013', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-014', '2026-10-03', 'INV-2026-014', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'Cheque', 'CHE100014', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-015', '2026-10-04', 'INV-2026-015', 'CL-003', 'Innovate Labs', 18900.00, 18900.00, 'RTGS', 'RTG100015', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-016', '2026-10-01', 'INV-2026-016', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'Bank Transfer', 'BAN100016', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-017', '2026-10-02', 'INV-2026-017', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'NEFT', 'NEF100017', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-018', '2026-10-03', 'INV-2026-018', 'CL-006', 'Zenith Media', 27500.00, 29500.00, 'UPI', 'UPI100018', 'Partially Matched', 2000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-019', '2026-10-04', 'INV-2026-019', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'Cheque', 'CHE100019', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-020', '2026-10-01', 'INV-2026-020', 'CL-002', 'Apex Retail', 18900.00, 18900.00, 'RTGS', 'RTG100020', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-021', '2026-10-02', 'INV-2026-021', 'CL-003', 'Innovate Labs', 21700.00, 21700.00, 'Bank Transfer', 'BAN100021', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-022', '2026-10-03', 'INV-2026-022', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'NEFT', 'NEF100022', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-023', '2026-10-04', 'INV-2026-023', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'UPI', 'UPI100023', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-024', '2026-10-01', 'INV-2026-024', 'CL-006', 'Zenith Media', 21700.00, 21700.00, 'Cheque', 'CHE100024', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-025', '2026-10-02', 'INV-2026-025', 'CL-001', 'TechCorp Solutions', 18900.00, 18900.00, 'RTGS', 'RTG100025', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-026', '2026-10-03', 'INV-2026-026', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'Bank Transfer', 'BAN100026', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-027', '2026-10-04', 'INV-2026-027', 'CL-003', 'Innovate Labs', 27500.00, 29500.00, 'NEFT', 'NEF100027', 'Partially Matched', 2000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-028', '2026-10-01', 'INV-2026-028', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'UPI', 'UPI100028', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-029', '2026-10-02', 'INV-2026-029', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'Cheque', 'CHE100029', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-030', '2026-10-03', 'INV-2026-030', 'CL-006', 'Zenith Media', 18900.00, 18900.00, 'RTGS', 'RTG100030', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-031', '2026-10-04', 'INV-2026-031', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'Bank Transfer', 'BAN100031', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-032', '2026-10-01', 'INV-2026-032', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'NEFT', 'NEF100032', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-033', '2026-10-02', 'INV-2026-033', 'CL-003', 'Innovate Labs', 21700.00, 21700.00, 'UPI', 'UPI100033', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-034', '2026-10-03', 'INV-2026-034', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'Cheque', 'CHE100034', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-035', '2026-10-04', 'INV-2026-035', 'CL-005', 'Horizon Health', 18900.00, 18900.00, 'RTGS', 'RTG100035', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-036', '2026-10-01', 'INV-2026-036', 'CL-006', 'Zenith Media', 27500.00, 29500.00, 'Bank Transfer', 'BAN100036', 'Partially Matched', 2000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-037', '2026-10-02', 'INV-2026-037', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'NEFT', 'NEF100037', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-038', '2026-10-03', 'INV-2026-038', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'UPI', 'UPI100038', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-039', '2026-10-04', 'INV-2026-039', 'CL-003', 'Innovate Labs', 21700.00, 21700.00, 'Cheque', 'CHE100039', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-040', '2026-10-01', 'INV-2026-040', 'CL-004', 'Alpha Logistics', 18900.00, 18900.00, 'RTGS', 'RTG100040', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-041', '2026-10-02', 'INV-2026-041', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'Bank Transfer', 'BAN100041', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-042', '2026-10-03', 'INV-2026-042', 'CL-006', 'Zenith Media', 21700.00, 21700.00, 'NEFT', 'NEF100042', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-043', '2026-10-04', 'INV-2026-043', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'UPI', 'UPI100043', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-044', '2026-10-01', 'INV-2026-044', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'Cheque', 'CHE100044', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-045', '2026-10-02', 'INV-2026-045', 'CL-003', 'Innovate Labs', 27500.00, 29500.00, 'RTGS', 'RTG100045', 'Partially Matched', 2000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-046', '2026-10-03', 'INV-2026-046', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'Bank Transfer', 'BAN100046', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-047', '2026-10-04', 'INV-2026-047', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'NEFT', 'NEF100047', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-048', '2026-10-01', 'INV-2026-048', 'CL-006', 'Zenith Media', 21700.00, 21700.00, 'UPI', 'UPI100048', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-049', '2026-10-02', 'INV-2026-049', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'Cheque', 'CHE100049', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-050', '2026-10-03', 'INV-2026-050', 'CL-002', 'Apex Retail', 18900.00, 18900.00, 'RTGS', 'RTG100050', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-051', '2026-10-04', 'INV-2026-051', 'CL-003', 'Innovate Labs', 21700.00, 21700.00, 'Bank Transfer', 'BAN100051', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-052', '2026-10-01', 'INV-2026-052', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'NEFT', 'NEF100052', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-053', '2026-10-02', 'INV-2026-053', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'UPI', 'UPI100053', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-054', '2026-10-03', 'INV-2026-054', 'CL-006', 'Zenith Media', 27500.00, 29500.00, 'Cheque', 'CHE100054', 'Partially Matched', 2000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-055', '2026-10-04', 'INV-2026-055', 'CL-001', 'TechCorp Solutions', 18900.00, 18900.00, 'RTGS', 'RTG100055', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-056', '2026-10-01', 'INV-2026-056', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'Bank Transfer', 'BAN100056', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-057', '2026-10-02', 'INV-2026-057', 'CL-003', 'Innovate Labs', 21700.00, 21700.00, 'NEFT', 'NEF100057', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-058', '2026-10-03', 'INV-2026-058', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'UPI', 'UPI100058', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-059', '2026-10-04', 'INV-2026-059', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'Cheque', 'CHE100059', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-060', '2026-10-01', 'INV-2026-060', 'CL-006', 'Zenith Media', 18900.00, 18900.00, 'RTGS', 'RTG100060', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-061', '2026-10-02', 'INV-2026-061', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'Bank Transfer', 'BAN100061', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-062', '2026-10-03', 'INV-2026-062', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'NEFT', 'NEF100062', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-063', '2026-10-04', 'INV-2026-063', 'CL-003', 'Innovate Labs', 27500.00, 29500.00, 'UPI', 'UPI100063', 'Partially Matched', 2000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-064', '2026-10-01', 'INV-2026-064', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'Cheque', 'CHE100064', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-065', '2026-10-02', 'INV-2026-065', 'CL-005', 'Horizon Health', 18900.00, 18900.00, 'RTGS', 'RTG100065', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-066', '2026-10-03', 'INV-2026-066', 'CL-006', 'Zenith Media', 21700.00, 21700.00, 'Bank Transfer', 'BAN100066', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-067', '2026-10-04', 'INV-2026-067', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'NEFT', 'NEF100067', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-068', '2026-10-01', 'INV-2026-068', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'UPI', 'UPI100068', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-069', '2026-10-02', 'INV-2026-069', 'CL-003', 'Innovate Labs', 21700.00, 21700.00, 'Cheque', 'CHE100069', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-070', '2026-10-03', 'INV-2026-070', 'CL-004', 'Alpha Logistics', 18900.00, 18900.00, 'RTGS', 'RTG100070', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-071', '2026-10-04', 'INV-2026-071', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'Bank Transfer', 'BAN100071', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-072', '2026-10-01', 'INV-2026-072', 'CL-006', 'Zenith Media', 27500.00, 29500.00, 'NEFT', 'NEF100072', 'Partially Matched', 2000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-073', '2026-10-02', 'INV-2026-073', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'UPI', 'UPI100073', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-074', '2026-10-03', 'INV-2026-074', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'Cheque', 'CHE100074', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-075', '2026-10-04', 'INV-2026-075', 'CL-003', 'Innovate Labs', 18900.00, 18900.00, 'RTGS', 'RTG100075', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-076', '2026-10-01', 'INV-2026-076', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'Bank Transfer', 'BAN100076', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-077', '2026-10-02', 'INV-2026-077', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'NEFT', 'NEF100077', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-078', '2026-10-03', 'INV-2026-078', 'CL-006', 'Zenith Media', 21700.00, 21700.00, 'UPI', 'UPI100078', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-079', '2026-10-04', 'INV-2026-079', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'Cheque', 'CHE100079', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-080', '2026-10-01', 'INV-2026-080', 'CL-002', 'Apex Retail', 18900.00, 18900.00, 'RTGS', 'RTG100080', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-081', '2026-10-02', 'INV-2026-081', 'CL-003', 'Innovate Labs', 27500.00, 29500.00, 'Bank Transfer', 'BAN100081', 'Partially Matched', 2000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-082', '2026-10-03', 'INV-2026-082', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'NEFT', 'NEF100082', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-083', '2026-10-04', 'INV-2026-083', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'UPI', 'UPI100083', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-084', '2026-10-01', 'INV-2026-084', 'CL-006', 'Zenith Media', 21700.00, 21700.00, 'Cheque', 'CHE100084', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-085', '2026-10-02', 'INV-2026-085', 'CL-001', 'TechCorp Solutions', 18900.00, 18900.00, 'RTGS', 'RTG100085', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-086', '2026-10-03', 'INV-2026-086', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'Bank Transfer', 'BAN100086', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-087', '2026-10-04', 'INV-2026-087', 'CL-003', 'Innovate Labs', 21700.00, 21700.00, 'NEFT', 'NEF100087', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-088', '2026-10-01', 'INV-2026-088', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'UPI', 'UPI100088', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-089', '2026-10-02', 'INV-2026-089', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'Cheque', 'CHE100089', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-090', '2026-10-03', 'INV-2026-090', 'CL-006', 'Zenith Media', 27500.00, 29500.00, 'RTGS', 'RTG100090', 'Partially Matched', 2000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-091', '2026-10-04', 'INV-2026-091', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'Bank Transfer', 'BAN100091', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-092', '2026-10-01', 'INV-2026-092', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'NEFT', 'NEF100092', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-093', '2026-10-02', 'INV-2026-093', 'CL-003', 'Innovate Labs', 21700.00, 21700.00, 'UPI', 'UPI100093', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-094', '2026-10-03', 'INV-2026-094', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'Cheque', 'CHE100094', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-095', '2026-10-04', 'INV-2026-095', 'CL-005', 'Horizon Health', 18900.00, 18900.00, 'RTGS', 'RTG100095', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-096', '2026-10-01', 'INV-2026-096', 'CL-006', 'Zenith Media', 21700.00, 21700.00, 'Bank Transfer', 'BAN100096', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-097', '2026-10-02', 'INV-2026-097', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'NEFT', 'NEF100097', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-098', '2026-10-03', 'INV-2026-098', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'UPI', 'UPI100098', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-099', '2026-10-04', 'INV-2026-099', 'CL-003', 'Innovate Labs', 27500.00, 29500.00, 'Cheque', 'CHE100099', 'Partially Matched', 2000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-100', '2026-10-01', 'INV-2026-100', 'CL-004', 'Alpha Logistics', 18900.00, 18900.00, 'RTGS', 'RTG100100', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-101', '2026-10-02', 'INV-2026-101', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'Bank Transfer', 'BAN100101', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-102', '2026-10-03', 'INV-2026-102', 'CL-006', 'Zenith Media', 21700.00, 21700.00, 'NEFT', 'NEF100102', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-103', '2026-10-04', 'INV-2026-103', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'UPI', 'UPI100103', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-104', '2026-10-01', 'INV-2026-104', 'CL-002', 'Apex Retail', 21700.00, 21700.00, 'Cheque', 'CHE100104', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-105', '2026-10-02', 'INV-2026-105', 'CL-003', 'Innovate Labs', 18900.00, 18900.00, 'RTGS', 'RTG100105', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-106', '2026-10-03', 'INV-2026-106', 'CL-004', 'Alpha Logistics', 21700.00, 21700.00, 'Bank Transfer', 'BAN100106', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-107', '2026-10-04', 'INV-2026-107', 'CL-005', 'Horizon Health', 21700.00, 21700.00, 'NEFT', 'NEF100107', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-108', '2026-10-01', 'INV-2026-108', 'CL-006', 'Zenith Media', 27500.00, 30500.00, 'UPI', 'UPI100108', 'Partially Matched', 3000.00, 'Partial milestone settlement')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-109', '2026-10-02', 'INV-2026-109', 'CL-001', 'TechCorp Solutions', 21700.00, 21700.00, 'Cheque', 'CHE100109', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-110', '2026-10-03', 'INV-2026-110', 'CL-002', 'Apex Retail', 20000.00, 20000.00, 'RTGS', 'RTG100110', 'Pending', 0.00, 'Awaiting clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-111', '2026-10-04', 'INV-2026-111', 'CL-003', 'Innovate Labs', 21700.00, 21700.00, 'Bank Transfer', 'BAN100111', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-112', '2026-10-01', 'INV-2026-112', 'CL-004', 'Alpha Logistics', 26500.00, 26500.00, 'NEFT', 'NEF100112', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-122', '2026-10-28', 'INV-2026-128', 'CL-001', 'TechCorp Solutions', 70800.00, 70800.00, 'Bank Transfer', 'UTR123456789', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-121', '2026-10-25', 'INV-2026-127', 'CL-003', 'Innovate Labs', 236000.00, 236000.00, 'NEFT', 'NEFT987654', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-120', '2026-10-22', 'INV-2026-126', 'CL-004', 'Alpha Logistics', 94400.00, 94400.00, 'UPI', 'UPI334455', 'Pending', 0.00, 'Waiting for clearance')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-119', '2026-10-20', 'INV-2026-125', 'CL-002', 'Apex Retail', 177000.00, 177000.00, 'Cheque', 'CHQ005678', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-118', '2026-10-18', 'INV-2026-124', 'CL-005', 'Horizon Health', 30000.00, 45000.00, 'Bank Transfer', 'UTR445566', 'Partially Matched', 15000.00, 'Advance payment for phase 2')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-117', '2026-10-15', 'INV-2026-123', 'CL-001', 'TechCorp Solutions', 295000.00, 295000.00, 'NEFT', 'NEFT776655', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-116', '2026-10-12', 'INV-2026-122', 'CL-006', 'Zenith Media', 64900.00, 64900.00, 'UPI', 'UPI223344', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-115', '2026-10-10', 'INV-2026-121', 'CL-003', 'Innovate Labs', 206500.00, 206500.00, 'Bank Transfer', 'UTR998877', 'Pending', 0.00, 'Client requested split receipt')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-114', '2026-10-08', 'INV-2026-120', 'CL-002', 'Apex Retail', 112100.00, 112100.00, 'Cheque', 'CHQ112233', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
INSERT INTO public.finance_payments (id, payment_date, invoice_id, client_id, client_name, amount, invoice_amount, mode, reference_no, status, variance_amount, notes)
VALUES ('PAY-202610-113', '2026-10-05', 'INV-2026-119', 'CL-004', 'Alpha Logistics', 153400.00, 153400.00, 'NEFT', 'NEFT554433', 'Matched', 0.00, '-')
ON CONFLICT (id) DO UPDATE SET
  payment_date = EXCLUDED.payment_date,
  invoice_id = EXCLUDED.invoice_id,
  client_id = EXCLUDED.client_id,
  client_name = EXCLUDED.client_name,
  amount = EXCLUDED.amount,
  invoice_amount = EXCLUDED.invoice_amount,
  mode = EXCLUDED.mode,
  reference_no = EXCLUDED.reference_no,
  status = EXCLUDED.status,
  variance_amount = EXCLUDED.variance_amount,
  notes = EXCLUDED.notes;
