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

-- Initialize sequence counter to 0 for clean start
INSERT INTO public.finance_payment_counter (year_month, last_number)
VALUES ('DEFAULT', 0)
ON CONFLICT (year_month) DO NOTHING;
