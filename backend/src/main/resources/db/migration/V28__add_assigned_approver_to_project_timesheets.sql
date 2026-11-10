-- =============================================================================
-- Migration: V28__add_assigned_approver_to_project_timesheets.sql
-- Module: Timesheets & Requirements (CMS Projects Module)
-- Description: Adds assigned_approver column to project_timesheets to support
--              both CEO (Akshit Ujjain) and MD (Gaurav Tripathy) as approvers.
-- =============================================================================

ALTER TABLE public.project_timesheets
    ADD COLUMN IF NOT EXISTS assigned_approver VARCHAR(100) DEFAULT 'CEO – Akshit Ujjain';

