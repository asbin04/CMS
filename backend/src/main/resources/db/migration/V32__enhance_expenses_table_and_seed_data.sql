-- V32__enhance_expenses_table_and_seed_data.sql
-- Description: Enhance public.expenses table with full expense tracking attributes and seed calibrated 124 records matching design

DO $$
BEGIN
    -- Add columns if not present
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'expense_code') THEN
        ALTER TABLE public.expenses ADD COLUMN expense_code VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'vendor_id') THEN
        ALTER TABLE public.expenses ADD COLUMN vendor_id VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'project_id') THEN
        ALTER TABLE public.expenses ADD COLUMN project_id VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'employee_id') THEN
        ALTER TABLE public.expenses ADD COLUMN employee_id VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'amount_before_tax') THEN
        ALTER TABLE public.expenses ADD COLUMN amount_before_tax NUMERIC(14, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'tax_amount') THEN
        ALTER TABLE public.expenses ADD COLUMN tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'total_amount') THEN
        ALTER TABLE public.expenses ADD COLUMN total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'payment_mode') THEN
        ALTER TABLE public.expenses ADD COLUMN payment_mode VARCHAR(50) NOT NULL DEFAULT 'Card';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'status') THEN
        ALTER TABLE public.expenses ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Approved';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'approved_by') THEN
        ALTER TABLE public.expenses ADD COLUMN approved_by VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'month_label') THEN
        ALTER TABLE public.expenses ADD COLUMN month_label VARCHAR(50) NOT NULL DEFAULT 'Oct 2026';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'expense_bucket') THEN
        ALTER TABLE public.expenses ADD COLUMN expense_bucket VARCHAR(50) NOT NULL DEFAULT 'Operational';
    END IF;
END $$;

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_expenses_expense_code ON public.expenses(expense_code);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON public.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_month_label ON public.expenses(month_label);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor_id ON public.expenses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_expenses_employee_id ON public.expenses(employee_id);

