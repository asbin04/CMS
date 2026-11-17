-- V16__create_payroll_tables.sql
-- Description: Create hr_payroll_records table, hr_payroll_counters sequence table, triggers, indexes, and seed records matching UI requirements.

-- 1. Create table for Payroll Records
CREATE TABLE IF NOT EXISTS public.hr_payroll_records (
    id BIGSERIAL PRIMARY KEY,
    payroll_id VARCHAR(50) NOT NULL UNIQUE,
    payroll_month VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('Full Time', 'Contract', 'Part Time', 'Intern')),
    monthly_ctc NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    working_days INTEGER NOT NULL DEFAULT 22,
    paid_days INTEGER NOT NULL DEFAULT 22,
    lop_days INTEGER NOT NULL DEFAULT 0,
    basic_pay NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    hra NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    allowances NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    gross_salary NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    deductions NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Paid' CHECK (payment_status IN ('Paid', 'Pending', 'Processing', 'Failed')),
    payment_date DATE,
    payment_mode VARCHAR(50) DEFAULT 'Bank Transfer',
    bank_name VARCHAR(100) DEFAULT 'HDFC Bank',
    bank_account VARCHAR(50) DEFAULT 'XXXXXXXX4589',
    pan_number VARCHAR(20) DEFAULT 'ABCDE1234F',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for fast search, filter, and sorting queries
CREATE INDEX IF NOT EXISTS idx_payroll_payroll_id ON public.hr_payroll_records(payroll_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month ON public.hr_payroll_records(payroll_month);
CREATE INDEX IF NOT EXISTS idx_payroll_emp_id ON public.hr_payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_emp_name ON public.hr_payroll_records(employee_name);
CREATE INDEX IF NOT EXISTS idx_payroll_type ON public.hr_payroll_records(employment_type);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON public.hr_payroll_records(payment_status);
CREATE INDEX IF NOT EXISTS idx_payroll_created_at ON public.hr_payroll_records(created_at);

-- 3. Automatic updated_at trigger maintenance
DROP TRIGGER IF EXISTS trigger_hr_payroll_records_updated_at ON public.hr_payroll_records;
CREATE TRIGGER trigger_hr_payroll_records_updated_at
BEFORE UPDATE ON public.hr_payroll_records
FOR EACH ROW
EXECUTE FUNCTION update_collections_updated_at_column();

-- 4. Atomic sequence counter table for Payroll IDs
CREATE TABLE IF NOT EXISTS public.hr_payroll_counters (
    prefix VARCHAR(50) PRIMARY KEY,
    current_val BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Initialize atomic sequence counter to 0 for clean start
INSERT INTO public.hr_payroll_counters (prefix, current_val)
VALUES ('PAY', 0)
ON CONFLICT (prefix) DO NOTHING;
