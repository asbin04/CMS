-- =============================================================================
-- Migration: V25__create_timesheets_and_requirements_tables.sql
-- Module: Timesheets & Requirements (CMS Projects Module)
-- Description: Creates project_timesheets, project_requirements, and
--              project_module_counters tables.
--              Guarantees timesheets strictly associate tasks with matching projects.
--              Guarantees requirements strictly associate projects with matching clients.
-- =============================================================================

-- 1. Ensure composite unique constraints on existing projects and project_tasks
--    so timesheets and requirements can enforce relational integrity via foreign keys.
DO $$
BEGIN
    -- For timesheets: ensure (project_id, id) is unique in project_tasks
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_project_tasks_project_id_id'
    ) THEN
        ALTER TABLE public.project_tasks
            ADD CONSTRAINT uq_project_tasks_project_id_id UNIQUE (project_id, id);
    END IF;

    -- For requirements: ensure (project_code, client_id) is unique in projects
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_projects_code_client'
    ) THEN
        ALTER TABLE public.projects
            ADD CONSTRAINT uq_projects_code_client UNIQUE (project_code, client_id);
    END IF;
END $$;

-- 2. Project Module Counters Table (Atomic Sequence Allocation)
CREATE TABLE IF NOT EXISTS public.project_module_counters (
    entity_type VARCHAR(50) NOT NULL,
    period_key VARCHAR(10) NOT NULL,
    current_value BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_project_module_counters PRIMARY KEY (entity_type, period_key)
);

-- 3. Project Timesheets Table
CREATE TABLE IF NOT EXISTS public.project_timesheets (
    timesheet_id VARCHAR(50) NOT NULL,
    timesheet_date DATE NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    project_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    hours NUMERIC(5, 2) NOT NULL,
    is_billable BOOLEAN NOT NULL DEFAULT TRUE,
    billable_rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    billable_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    estimated_labor_cost NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    labor_cost_override BOOLEAN NOT NULL DEFAULT FALSE,
    labor_cost_override_by VARCHAR(100),
    labor_cost_override_at TIMESTAMPTZ,
    labor_cost_override_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_project_timesheets PRIMARY KEY (timesheet_id),
    CONSTRAINT fk_timesheets_employee FOREIGN KEY (employee_id)
        REFERENCES public.employees (employee_id) ON DELETE RESTRICT,
    CONSTRAINT fk_timesheets_project FOREIGN KEY (project_id)
        REFERENCES public.projects (project_code) ON DELETE RESTRICT,
    CONSTRAINT fk_timesheets_task FOREIGN KEY (task_id)
        REFERENCES public.project_tasks (id) ON DELETE RESTRICT,
    -- Enforce that a timesheet cannot associate a task with the wrong project
    CONSTRAINT fk_timesheets_project_task FOREIGN KEY (project_id, task_id)
        REFERENCES public.project_tasks (project_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_timesheets_hours CHECK (hours >= 0.00 AND hours <= 24.00),
    CONSTRAINT chk_timesheets_approval_status CHECK (approval_status IN ('Pending', 'Approved', 'Rejected'))
);

-- 4. Project Requirements Table
CREATE TABLE IF NOT EXISTS public.project_requirements (
    requirement_id VARCHAR(50) NOT NULL,
    project_id VARCHAR(50) NOT NULL,
    client_id VARCHAR(64) NOT NULL,
    requirement_date DATE NOT NULL,
    requirement_type VARCHAR(100) NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
    owner_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
    scope_freeze BOOLEAN NOT NULL DEFAULT FALSE,
    scope_frozen_at TIMESTAMPTZ,
    scope_frozen_by VARCHAR(100),
    approved_by VARCHAR(100),
    approval_date DATE,
    completion_percentage INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_project_requirements PRIMARY KEY (requirement_id),
    CONSTRAINT fk_requirements_project FOREIGN KEY (project_id)
        REFERENCES public.projects (project_code) ON DELETE RESTRICT,
    CONSTRAINT fk_requirements_owner FOREIGN KEY (owner_id)
        REFERENCES public.employees (employee_id) ON DELETE RESTRICT,
    -- Enforce that a requirement cannot associate a project with an incorrect client
    CONSTRAINT fk_requirements_project_client FOREIGN KEY (project_id, client_id)
        REFERENCES public.projects (project_code, client_id) ON DELETE RESTRICT,
    CONSTRAINT chk_requirements_priority CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    CONSTRAINT chk_requirements_status CHECK (status IN ('In Progress', 'Pending Approval', 'Completed', 'Under Review')),
    CONSTRAINT chk_requirements_completion CHECK (completion_percentage >= 0 AND completion_percentage <= 100)
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_project_timesheets_employee_id ON public.project_timesheets (employee_id);
CREATE INDEX IF NOT EXISTS idx_project_timesheets_project_id ON public.project_timesheets (project_id);
CREATE INDEX IF NOT EXISTS idx_project_timesheets_task_id ON public.project_timesheets (task_id);
CREATE INDEX IF NOT EXISTS idx_project_timesheets_date ON public.project_timesheets (timesheet_date);
CREATE INDEX IF NOT EXISTS idx_project_timesheets_approval_status ON public.project_timesheets (approval_status);
CREATE INDEX IF NOT EXISTS idx_project_timesheets_is_billable ON public.project_timesheets (is_billable);

CREATE INDEX IF NOT EXISTS idx_project_requirements_project_id ON public.project_requirements (project_id);
CREATE INDEX IF NOT EXISTS idx_project_requirements_client_id ON public.project_requirements (client_id);
CREATE INDEX IF NOT EXISTS idx_project_requirements_owner_id ON public.project_requirements (owner_id);
CREATE INDEX IF NOT EXISTS idx_project_requirements_status ON public.project_requirements (status);
CREATE INDEX IF NOT EXISTS idx_project_requirements_priority ON public.project_requirements (priority);
CREATE INDEX IF NOT EXISTS idx_project_requirements_date ON public.project_requirements (requirement_date);
CREATE INDEX IF NOT EXISTS idx_project_requirements_scope_freeze ON public.project_requirements (scope_freeze);
