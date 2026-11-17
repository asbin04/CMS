-- ==============================================================================
-- Migration: V26__create_project_uats_table.sql
-- Description: DDL and seed records for UAT (User Acceptance Testing) management
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.project_uats (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    requirement_id VARCHAR(50) NOT NULL,
    test_date DATE NOT NULL,
    test_case VARCHAR(50) NOT NULL,
    expected_result TEXT NOT NULL,
    actual_result TEXT NOT NULL,
    tester_name VARCHAR(100) NOT NULL,
    tester_initials VARCHAR(10) NOT NULL,
    tester_color VARCHAR(20) NOT NULL DEFAULT 'indigo',
    status VARCHAR(50) NOT NULL DEFAULT 'Passed',
    defect_id VARCHAR(50),
    client_approval VARCHAR(50) NOT NULL DEFAULT 'Pending',
    approval_date DATE,
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_uats_project_id ON public.project_uats(project_id);
CREATE INDEX IF NOT EXISTS idx_project_uats_status ON public.project_uats(status);
CREATE INDEX IF NOT EXISTS idx_project_uats_client_approval ON public.project_uats(client_approval);
CREATE INDEX IF NOT EXISTS idx_project_uats_tester_name ON public.project_uats(tester_name);
CREATE INDEX IF NOT EXISTS idx_project_uats_test_date ON public.project_uats(test_date);

