-- V19__create_expenses_and_finance_targets_tables.sql
-- Description: DDL definitions for expenses and finance_targets tables, with composite indexes on invoices and payments

-- 1. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id BIGSERIAL PRIMARY KEY,
    expense_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    is_project_expense BOOLEAN NOT NULL DEFAULT FALSE,
    project_label VARCHAR(255),
    description TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_is_project_expense ON public.expenses(is_project_expense);

-- 2. Finance Targets Table
CREATE TABLE IF NOT EXISTS public.finance_targets (
    id BIGSERIAL PRIMARY KEY,
    metric_key VARCHAR(100) NOT NULL UNIQUE,
    target_value NUMERIC(14, 2) NOT NULL,
    comparison_direction VARCHAR(20) NOT NULL DEFAULT 'HIGHER_IS_BETTER',
    basis VARCHAR(30) NOT NULL DEFAULT 'MONTHLY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Composite and date indexes for high-performance period queries
CREATE INDEX IF NOT EXISTS idx_collections_invoices_invoice_date ON public.collections_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_collections_payments_invoice_id_date ON public.collections_payments(invoice_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_collections_payments_payment_date ON public.collections_payments(payment_date);

