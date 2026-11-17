-- V8__create_employees_and_candidates_tables.sql
-- Description: Create hr_candidates table with constraints, indexes, triggers, and seed data

CREATE TABLE IF NOT EXISTS public.hr_candidates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Interviewing', 'Offered', 'Hired', 'Rejected')),
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for candidate lookups, filtering, and pipeline metrics
CREATE INDEX IF NOT EXISTS idx_hr_candidates_status ON public.hr_candidates(status);
CREATE INDEX IF NOT EXISTS idx_hr_candidates_department ON public.hr_candidates(department);
CREATE INDEX IF NOT EXISTS idx_hr_candidates_created_date ON public.hr_candidates(created_date);
CREATE INDEX IF NOT EXISTS idx_hr_candidates_department_status ON public.hr_candidates(department, status);

-- Trigger for hr_candidates updated_at column
DROP TRIGGER IF EXISTS trigger_hr_candidates_updated_at ON public.hr_candidates;
CREATE TRIGGER trigger_hr_candidates_updated_at
BEFORE UPDATE ON public.hr_candidates
FOR EACH ROW
EXECUTE FUNCTION update_collections_updated_at_column();

