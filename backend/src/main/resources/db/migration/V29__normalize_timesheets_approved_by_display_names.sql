-- =============================================================================
-- Migration: V29__normalize_timesheets_approved_by_display_names.sql
-- Module: Timesheets (CMS Projects Module)
-- Description: Normalizes any existing approved_by usernames to display names
-- =============================================================================

UPDATE public.project_timesheets
SET approved_by = 'Akshit Ujjain'
WHERE approved_by = 'akshit.ujjain' OR approved_by = 'akshit';

UPDATE public.project_timesheets
SET approved_by = 'Gaurav Tripathy'
WHERE approved_by = 'gaurav.tripathy' OR approved_by = 'gaurav';

