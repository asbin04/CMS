-- =============================================================================
-- Migration: V26__expand_requirements_priority_and_status_constraints.sql
-- Module: Timesheets & Requirements (CMS Projects Module)
-- Description: Expands check constraints on project_requirements to allow:
--              - Priority: 'Critical', 'High', 'Medium', 'Low'
--              - Status: 'In Progress', 'Pending Approval', 'Completed', 'Under Review'
-- =============================================================================

DO $$
BEGIN
    -- 1. Expand priority check constraint
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_requirements_priority'
    ) THEN
        ALTER TABLE public.project_requirements
            DROP CONSTRAINT chk_requirements_priority;
    END IF;

    ALTER TABLE public.project_requirements
        ADD CONSTRAINT chk_requirements_priority
        CHECK (priority IN ('Critical', 'High', 'Medium', 'Low'));

    -- 2. Expand status check constraint
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_requirements_status'
    ) THEN
        ALTER TABLE public.project_requirements
            DROP CONSTRAINT chk_requirements_status;
    END IF;

    ALTER TABLE public.project_requirements
        ADD CONSTRAINT chk_requirements_status
        CHECK (status IN ('In Progress', 'Pending Approval', 'Completed', 'Under Review'));
END $$;

