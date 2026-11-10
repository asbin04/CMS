-- =============================================================================
-- Migration: V30__create_project_developments_table.sql
-- Module: Development (CMS Projects Module)
-- Description: Creates project_developments table with referential integrity,
--              composite foreign keys (project-task, project-requirement),
--              employee mapping, check constraints, and performance indexes.
--              Initializes atomic ID generator sequence in project_module_counters.
-- =============================================================================

-- 1. Ensure composite unique constraint on public.project_requirements (project_id, requirement_id)
--    This is required to support the composite foreign key fk_dev_project_requirement.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_project_requirements_project_id_id'
    ) THEN
        ALTER TABLE public.project_requirements
            ADD CONSTRAINT uq_project_requirements_project_id_id UNIQUE (project_id, requirement_id);
    END IF;
END $$;

-- 2. Project Developments Table
CREATE TABLE IF NOT EXISTS public.project_developments (
    development_id VARCHAR(50) NOT NULL,
    project_id VARCHAR(50) NOT NULL,
    requirement_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    developer_id VARCHAR(50),
    developer_name VARCHAR(255) NOT NULL,
    repository_url VARCHAR(500) NOT NULL,
    branch VARCHAR(255) NOT NULL,
    environment VARCHAR(50) NOT NULL,
    build_version VARCHAR(50) NOT NULL,
    code_review_status VARCHAR(50) NOT NULL DEFAULT 'In Review',
    qa_handoff_date DATE NOT NULL,
    release_id VARCHAR(50) NOT NULL DEFAULT '-',
    status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
    technical_notes TEXT,
    documentation_link VARCHAR(500),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_project_developments PRIMARY KEY (development_id),
    CONSTRAINT fk_dev_project FOREIGN KEY (project_id)
        REFERENCES public.projects (project_code) ON DELETE RESTRICT,
    CONSTRAINT fk_dev_requirement FOREIGN KEY (requirement_id)
        REFERENCES public.project_requirements (requirement_id) ON DELETE RESTRICT,
    CONSTRAINT fk_dev_task FOREIGN KEY (task_id)
        REFERENCES public.project_tasks (id) ON DELETE RESTRICT,
    -- Enforce that a development record cannot reference a requirement from another project
    CONSTRAINT fk_dev_project_requirement FOREIGN KEY (project_id, requirement_id)
        REFERENCES public.project_requirements (project_id, requirement_id) ON DELETE RESTRICT,
    -- Enforce that a development record cannot reference a task from another project
    CONSTRAINT fk_dev_project_task FOREIGN KEY (project_id, task_id)
        REFERENCES public.project_tasks (project_id, id) ON DELETE RESTRICT,
    -- Reference to employees table
    CONSTRAINT fk_dev_developer FOREIGN KEY (developer_id)
        REFERENCES public.employees (employee_id) ON DELETE SET NULL,
    -- Check constraints
    CONSTRAINT chk_dev_environment CHECK (environment IN ('Dev', 'QA', 'Staging', 'Prod')),
    CONSTRAINT chk_dev_code_review_status CHECK (code_review_status IN ('Approved', 'In Review', 'Changes Requested')),
    CONSTRAINT chk_dev_status CHECK (status IN ('In Progress', 'QA', 'Released'))
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_project_developments_project_id ON public.project_developments (project_id);
CREATE INDEX IF NOT EXISTS idx_project_developments_requirement_id ON public.project_developments (requirement_id);
CREATE INDEX IF NOT EXISTS idx_project_developments_task_id ON public.project_developments (task_id);
CREATE INDEX IF NOT EXISTS idx_project_developments_developer_id ON public.project_developments (developer_id);
CREATE INDEX IF NOT EXISTS idx_project_developments_status ON public.project_developments (status);
CREATE INDEX IF NOT EXISTS idx_project_developments_code_review_status ON public.project_developments (code_review_status);
CREATE INDEX IF NOT EXISTS idx_project_developments_environment ON public.project_developments (environment);
CREATE INDEX IF NOT EXISTS idx_project_developments_created_at ON public.project_developments (created_at);

-- 4. Seed counter in project_module_counters for atomic ID generation
INSERT INTO public.project_module_counters (entity_type, period_key, current_value, updated_at)
VALUES ('DEVELOPMENT', 'GLOBAL', 0, CURRENT_TIMESTAMP)
ON CONFLICT (entity_type, period_key) DO NOTHING;

