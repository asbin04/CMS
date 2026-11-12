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

-- 2. Seed Realistic Timesheet Records (Idempotent)
INSERT INTO public.project_timesheets (
    timesheet_id, timesheet_date, employee_id, employee_name,
    project_id, task_id, hours, is_billable, billable_rate, billable_amount,
    approval_status, assigned_approver, approved_by, estimated_labor_cost
) VALUES
    ('TS-2026-0001', '2026-10-02', 'EMP-001', 'Amit Sharma', 'PRJ-001', 'TSK-00128', 8.00, true, 1500.00, 12000.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6400.00),
    ('TS-2026-0002', '2026-10-03', 'EMP-001', 'Amit Sharma', 'PRJ-001', 'TSK-00128', 8.00, true, 1500.00, 12000.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6400.00),
    ('TS-2026-0003', '2026-10-04', 'EMP-001', 'Amit Sharma', 'PRJ-001', 'TSK-00128', 4.00, true, 1500.00, 6000.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 3200.00),
    ('TS-2026-0004', '2026-10-08', 'EMP-004', 'Sneha Nair', 'PRJ-001', 'TSK-00127', 8.00, true, 1600.00, 12800.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6800.00),
    ('TS-2026-0005', '2026-10-09', 'EMP-004', 'Sneha Nair', 'PRJ-001', 'TSK-00127', 8.00, true, 1600.00, 12800.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6800.00),
    ('TS-2026-0006', '2026-10-10', 'EMP-004', 'Sneha Nair', 'PRJ-001', 'TSK-00127', 8.00, true, 1600.00, 12800.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6800.00),
    ('TS-2026-0007', '2026-10-16', 'EMP-001', 'Amit Sharma', 'PRJ-001', 'TSK-00123', 8.00, true, 1500.00, 12000.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6400.00),
    ('TS-2026-0008', '2026-10-17', 'EMP-001', 'Amit Sharma', 'PRJ-001', 'TSK-00123', 8.00, true, 1500.00, 12000.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6400.00),
    ('TS-2026-0009', '2026-10-18', 'EMP-001', 'Amit Sharma', 'PRJ-001', 'TSK-00123', 4.00, true, 1500.00, 6000.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 3200.00),
    ('TS-2026-0010', '2026-09-16', 'EMP-003', 'Rohan Verma', 'PRJ-002', 'TSK-00126', 8.00, true, 1400.00, 11200.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 5600.00),
    ('TS-2026-0011', '2026-09-17', 'EMP-003', 'Rohan Verma', 'PRJ-002', 'TSK-00126', 8.00, true, 1400.00, 11200.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 5600.00),
    ('TS-2026-0012', '2026-09-22', 'EMP-004', 'Sneha Nair', 'PRJ-002', 'TSK-00122', 8.00, true, 1600.00, 12800.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6800.00),
    ('TS-2026-0013', '2026-09-23', 'EMP-004', 'Sneha Nair', 'PRJ-002', 'TSK-00122', 8.00, true, 1600.00, 12800.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6800.00),
    ('TS-2026-0014', '2026-09-24', 'EMP-004', 'Sneha Nair', 'PRJ-002', 'TSK-00122', 8.00, true, 1600.00, 12800.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6800.00),
    ('TS-2026-0015', '2026-09-25', 'EMP-004', 'Sneha Nair', 'PRJ-002', 'TSK-00122', 8.00, true, 1600.00, 12800.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6800.00),
    ('TS-2026-0016', '2026-09-12', 'EMP-008', 'Divya Patel', 'PRJ-003', 'TSK-00125', 8.00, true, 1450.00, 11600.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 5800.00),
    ('TS-2026-0017', '2026-09-13', 'EMP-008', 'Divya Patel', 'PRJ-003', 'TSK-00125', 8.00, true, 1450.00, 11600.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 5800.00),
    ('TS-2026-0018', '2026-09-14', 'EMP-008', 'Divya Patel', 'PRJ-003', 'TSK-00125', 8.00, true, 1450.00, 11600.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 5800.00),
    ('TS-2026-0019', '2026-09-27', 'EMP-005', 'Vikram Shah', 'PRJ-003', 'TSK-00124', 8.00, true, 1500.00, 12000.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6000.00),
    ('TS-2026-0020', '2026-08-20', 'EMP-008', 'Divya Patel', 'PRJ-004', 'TSK-00121', 8.00, true, 1400.00, 11200.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 5600.00),
    ('TS-2026-0021', '2026-08-21', 'EMP-008', 'Divya Patel', 'PRJ-004', 'TSK-00121', 8.00, true, 1400.00, 11200.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 5600.00),
    ('TS-2026-0022', '2026-08-25', 'EMP-005', 'Vikram Shah', 'PRJ-005', 'TSK-00120', 8.00, true, 1550.00, 12400.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6200.00),
    ('TS-2026-0023', '2026-08-26', 'EMP-005', 'Vikram Shah', 'PRJ-005', 'TSK-00120', 8.00, true, 1550.00, 12400.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6200.00),
    ('TS-2026-0024', '2026-07-10', 'EMP-001', 'Amit Sharma', 'PRJ-006', 'TSK-00119', 8.00, true, 1500.00, 12000.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6400.00),
    ('TS-2026-0025', '2026-07-02', 'EMP-004', 'Sneha Nair', 'PRJ-007', 'TSK-00118', 8.00, true, 1600.00, 12800.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6800.00),
    ('TS-2026-0026', '2026-06-15', 'EMP-003', 'Rohan Verma', 'PRJ-008', 'TSK-00117', 8.00, true, 1400.00, 11200.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 5600.00),
    ('TS-2026-0027', '2026-05-10', 'EMP-008', 'Divya Patel', 'PRJ-009', 'TSK-00116', 8.00, true, 1400.00, 11200.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 5600.00),
    ('TS-2026-0028', '2026-04-10', 'EMP-005', 'Vikram Shah', 'PRJ-010', 'TSK-00115', 8.00, true, 1500.00, 12000.00, 'Approved', 'CEO – Akshit Ujjain', 'Akshit Ujjain', 6000.00),
    ('TS-2026-0029', '2026-11-01', 'EMP-001', 'Amit Sharma', 'PRJ-001', 'TSK-00114', 6.00, true, 1500.00, 9000.00, 'Pending', 'CEO – Akshit Ujjain', NULL, 4800.00)
ON CONFLICT (timesheet_id) DO NOTHING;

