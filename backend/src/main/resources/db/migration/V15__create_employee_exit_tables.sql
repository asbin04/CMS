-- V15__create_employee_exit_tables.sql
-- Description: Create employee_exit_records, employee_exit_counters, triggers, indexes, and seed initial records

-- 1. Create table for Employee Exit records
CREATE TABLE IF NOT EXISTS public.employee_exit_records (
    id BIGSERIAL PRIMARY KEY,
    exit_id VARCHAR(50) NOT NULL UNIQUE,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    resignation_date DATE NOT NULL,
    approval_date DATE,
    notice_period_days INTEGER NOT NULL DEFAULT 30 CHECK (notice_period_days >= 0),
    last_working_day DATE NOT NULL,
    exit_type VARCHAR(50) NOT NULL CHECK (exit_type IN ('Resignation', 'Termination', 'Retirement', 'Absconding')),
    reason VARCHAR(500) NOT NULL,
    exit_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (exit_status IN ('Approved', 'Pending', 'In Review', 'Rejected')),
    assets_returned VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (assets_returned IN ('Returned', 'Pending', '-')),
    full_and_final_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (full_and_final_status IN ('Approved', 'Pending', 'In Review')),
    notes TEXT,
    notice_completion_date DATE,
    exit_readiness VARCHAR(50) NOT NULL DEFAULT 'Not Started' CHECK (exit_readiness IN ('Completed', 'In Progress', 'Not Started')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for search, filter, and sorting queries
CREATE INDEX IF NOT EXISTS idx_employee_exit_exit_id ON public.employee_exit_records(exit_id);
CREATE INDEX IF NOT EXISTS idx_employee_exit_emp_id ON public.employee_exit_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_exit_emp_name ON public.employee_exit_records(employee_name);
CREATE INDEX IF NOT EXISTS idx_employee_exit_status ON public.employee_exit_records(exit_status);
CREATE INDEX IF NOT EXISTS idx_employee_exit_type ON public.employee_exit_records(exit_type);
CREATE INDEX IF NOT EXISTS idx_employee_exit_notice_days ON public.employee_exit_records(notice_period_days);
CREATE INDEX IF NOT EXISTS idx_employee_exit_resignation_date ON public.employee_exit_records(resignation_date);
CREATE INDEX IF NOT EXISTS idx_employee_exit_lwd ON public.employee_exit_records(last_working_day);
CREATE INDEX IF NOT EXISTS idx_employee_exit_readiness ON public.employee_exit_records(exit_readiness);

-- 3. Automatic updated_at trigger maintenance
DROP TRIGGER IF EXISTS trigger_employee_exit_records_updated_at ON public.employee_exit_records;
CREATE TRIGGER trigger_employee_exit_records_updated_at
BEFORE UPDATE ON public.employee_exit_records
FOR EACH ROW
EXECUTE FUNCTION update_collections_updated_at_column();

-- 4. Atomic, concurrency-safe Exit ID sequence counter table
CREATE TABLE IF NOT EXISTS public.employee_exit_counters (
    prefix VARCHAR(20) PRIMARY KEY,
    current_val BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Initialize atomic sequence counter to 0 for clean start
INSERT INTO public.employee_exit_counters (prefix, current_val)
VALUES ('EXI', 0)
ON CONFLICT (prefix) DO NOTHING;
