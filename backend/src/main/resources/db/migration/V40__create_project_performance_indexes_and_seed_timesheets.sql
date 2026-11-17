-- =============================================================================
-- Migration: V40__create_project_performance_indexes_and_seed_timesheets.sql
-- Module: Reports & Control - Project Dashboard / Performance & Delivery
-- Description: Adds high-performance indexes for project aggregation queries,
--              status/health tracking, task due-date lookups, and seeds realistic
--              timesheet records to populate delivery metrics and project costs.
-- =============================================================================

-- 1. High-Performance Indexes for Project Reporting & Filtering
CREATE INDEX IF NOT EXISTS idx_projects_status_health ON public.projects(status, health);
CREATE INDEX IF NOT EXISTS idx_projects_planned_end_date ON public.projects(planned_end_date);
CREATE INDEX IF NOT EXISTS idx_projects_code_name ON public.projects(project_code, project_name);

CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON public.project_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status_due_date ON public.project_tasks(status, due_date);

CREATE INDEX IF NOT EXISTS idx_project_timesheets_proj_billable ON public.project_timesheets(project_id, is_billable);
CREATE INDEX IF NOT EXISTS idx_project_timesheets_proj_amount ON public.project_timesheets(project_id, billable_amount);

