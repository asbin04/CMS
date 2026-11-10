-- =============================================================================
-- Migration: V31__alter_project_developments_qa_handoff_date_nullable.sql
-- Module: Development (CMS Projects Module)
-- Description: Makes qa_handoff_date nullable to permit developments in early
--              phases (e.g., In Progress / Dev) prior to QA handoff.
--              Ensures project_module_counters has the year-based period key
--              for atomic ID generation in DEV-YYYY-NNNN format.
-- =============================================================================

ALTER TABLE public.project_developments
    ALTER COLUMN qa_handoff_date DROP NOT NULL;

-- Ensure current year counter entry exists for DEV-YYYY-NNNN atomic sequence
INSERT INTO public.project_module_counters (entity_type, period_key, current_value, updated_at)
VALUES ('DEVELOPMENT', TO_CHAR(CURRENT_DATE, 'YYYY'), 0, CURRENT_TIMESTAMP)
ON CONFLICT (entity_type, period_key) DO NOTHING;

