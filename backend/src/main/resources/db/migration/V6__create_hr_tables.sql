-- V6__create_hr_tables.sql
-- Description: Create HR summary and recent activities tables

CREATE TABLE IF NOT EXISTS public.hr_summary (
    id BIGSERIAL PRIMARY KEY,
    active_employees INTEGER NOT NULL DEFAULT 0,
    on_notice INTEGER NOT NULL DEFAULT 0,
    total_monthly_ctc NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    new_hires_this_month INTEGER NOT NULL DEFAULT 0,
    open_candidates INTEGER NOT NULL DEFAULT 997,
    candidates_over_30_days INTEGER NOT NULL DEFAULT 0,
    pending_leave_approvals INTEGER NOT NULL DEFAULT 0,
    attendance_records INTEGER NOT NULL DEFAULT 997,
    half_days INTEGER NOT NULL DEFAULT 0,
    late_records INTEGER NOT NULL DEFAULT 0,
    employees_exiting INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_activities (
    id VARCHAR(50) PRIMARY KEY,
    activity_date VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    type_color VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_activities_sort_order ON public.hr_activities(sort_order);
