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

-- Insert 10 primary Figma design rows
INSERT INTO public.project_uats (
    id, project_id, requirement_id, test_date, test_case,
    expected_result, actual_result, tester_name, tester_initials, tester_color,
    status, defect_id, client_approval, approval_date, comments
) VALUES
('UAT-2026-0483', 'PRJ-001', 'REQ-2026-0184', '2026-10-28', 'TC-001', 'User can login with valid credentials', 'Login successful', 'Amit Sharma', 'AS', 'indigo', 'Passed', NULL, 'Approved', '2026-10-28', 'Working as expected'),
('UAT-2026-0482', 'PRJ-001', 'REQ-2026-0185', '2026-10-28', 'TC-002', 'Dashboard loads with key metrics', 'Dashboard displayed correctly', 'Sneha Nair', 'SN', 'purple', 'Passed', NULL, 'Approved', '2026-10-28', NULL),
('UAT-2026-0481', 'PRJ-002', 'REQ-2026-0182', '2026-10-27', 'TC-003', 'User can create an appointment', 'Appointment created successfully', 'Divya Patel', 'DP', 'blue', 'Passed', NULL, 'Approved', '2026-10-27', 'Validation successful'),
('UAT-2026-0480', 'PRJ-002', 'REQ-2026-0181', '2026-10-27', 'TC-004', 'System sends email notification', 'Email not received', 'Rohan Verma', 'RV', 'purple', 'Failed', 'DEF-0147', 'Pending', NULL, 'Email service issue'),
('UAT-2026-0479', 'PRJ-003', 'REQ-2026-0180', '2026-10-26', 'TC-005', 'Report export in PDF format', 'PDF exported successfully', 'Vikram Shah', 'VK', 'lime', 'Passed', NULL, 'Approved', '2026-10-26', NULL),
('UAT-2026-0478', 'PRJ-003', 'REQ-2026-0179', '2026-10-25', 'TC-006', 'Apply filters in reports', 'Filters working correctly', 'Sneha Nair', 'SN', 'purple', 'Passed', NULL, 'Approved', '2026-10-25', NULL),
('UAT-2026-0477', 'PRJ-004', 'REQ-2026-0178', '2026-10-24', 'TC-007', 'User can update profile details', 'Profile not updated', 'Amit Sharma', 'AS', 'indigo', 'Failed', 'DEF-0146', 'Pending', NULL, 'Validation error on save'),
('UAT-2026-0476', 'PRJ-004', 'REQ-2026-0177', '2026-10-24', 'TC-008', 'System logs user activity', 'User activity logged correctly', 'Divya Patel', 'DP', 'blue', 'Passed', NULL, 'Approved', '2026-10-24', NULL),
('UAT-2026-0475', 'PRJ-005', 'REQ-2026-0176', '2026-10-22', 'TC-009', 'Generate invoice for booking', 'Invoice generated successfully', 'Rohan Verma', 'RV', 'purple', 'Passed', NULL, 'Approved', '2026-10-22', NULL),
('UAT-2026-0474', 'PRJ-005', 'REQ-2026-0175', '2026-10-21', 'TC-010', 'Cancel booking and refund', 'Refund not initiated', 'Vikram Shah', 'VK', 'lime', 'Failed', 'DEF-0145', 'Pending', NULL, 'Refund service integration issue')
ON CONFLICT (id) DO NOTHING;

-- Seed remaining records to exactly calibrate metrics:
-- Total = 324, Passed = 182 (7 in primary + 175), In Testing = 96 (0 in primary + 96), Failed = 46 (3 in primary + 43), Client Approved = 168 (7 in primary + 161)
DO $$
DECLARE
    i INT;
    proj_code VARCHAR(50);
    req_code VARCHAR(50);
    tc_code VARCHAR(50);
    t_name VARCHAR(100);
    t_init VARCHAR(10);
    t_color VARCHAR(20);
    t_date DATE;
    c_approval VARCHAR(50);
    app_date DATE;
BEGIN
    -- 1. Seed 175 more Passed UATs (bringing Passed total to 182)
    -- Of these, 161 will be Client Approved (bringing Approved total to 168)
    FOR i IN 1..175 LOOP
        proj_code := 'PRJ-00' || ((i % 5) + 1);
        req_code := 'REQ-2026-0' || (100 + (i % 70));
        tc_code := 'TC-' || LPAD((10 + i)::TEXT, 3, '0');
        t_date := ('2026-10-01'::DATE + ((i * 3) % 25));
        
        CASE (i % 5)
            WHEN 0 THEN t_name := 'Amit Sharma'; t_init := 'AS'; t_color := 'indigo';
            WHEN 1 THEN t_name := 'Sneha Nair'; t_init := 'SN'; t_color := 'purple';
            WHEN 2 THEN t_name := 'Divya Patel'; t_init := 'DP'; t_color := 'blue';
            WHEN 3 THEN t_name := 'Rohan Verma'; t_init := 'RV'; t_color := 'purple';
            ELSE t_name := 'Vikram Shah'; t_init := 'VK'; t_color := 'lime';
        END CASE;

        IF i <= 161 THEN
            c_approval := 'Approved';
            app_date := t_date;
        ELSE
            c_approval := 'Pending';
            app_date := NULL;
        END IF;

        INSERT INTO public.project_uats (
            id, project_id, requirement_id, test_date, test_case,
            expected_result, actual_result, tester_name, tester_initials, tester_color,
            status, defect_id, client_approval, approval_date, comments
        ) VALUES (
            'UAT-2026-0' || (300 - i),
            proj_code,
            req_code,
            t_date,
            tc_code,
            'Verify business workflow functionality under test scenario ' || i,
            'Execution passed validation criteria seamlessly',
            t_name,
            t_init,
            t_color,
            'Passed',
            NULL,
            c_approval,
            app_date,
            'Passed all quality gates'
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;

    -- 2. Seed 96 In Testing UATs (bringing In Testing total to 96)
    FOR i IN 1..96 LOOP
        proj_code := 'PRJ-00' || ((i % 5) + 1);
        req_code := 'REQ-2026-0' || (170 + (i % 50));
        tc_code := 'TC-' || LPAD((200 + i)::TEXT, 3, '0');
        t_date := ('2026-10-15'::DATE + ((i * 2) % 15));

        CASE (i % 5)
            WHEN 0 THEN t_name := 'Divya Patel'; t_init := 'DP'; t_color := 'blue';
            WHEN 1 THEN t_name := 'Amit Sharma'; t_init := 'AS'; t_color := 'indigo';
            WHEN 2 THEN t_name := 'Sneha Nair'; t_init := 'SN'; t_color := 'purple';
            WHEN 3 THEN t_name := 'Vikram Shah'; t_init := 'VK'; t_color := 'lime';
            ELSE t_name := 'Rohan Verma'; t_init := 'RV'; t_color := 'purple';
        END CASE;

        INSERT INTO public.project_uats (
            id, project_id, requirement_id, test_date, test_case,
            expected_result, actual_result, tester_name, tester_initials, tester_color,
            status, defect_id, client_approval, approval_date, comments
        ) VALUES (
            'UAT-2026-0' || (120 - i),
            proj_code,
            req_code,
            t_date,
            tc_code,
            'Verify user acceptance criteria for ongoing sprint module ' || i,
            'Test execution in progress in incubation staging',
            t_name,
            t_init,
            t_color,
            'In Testing',
            NULL,
            'Pending',
            NULL,
            'Currently in test cycle'
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;

    -- 3. Seed 43 more Failed UATs with defects (bringing Defect Logged total to 46)
    FOR i IN 1..43 LOOP
        proj_code := 'PRJ-00' || ((i % 5) + 1);
        req_code := 'REQ-2026-0' || (220 + (i % 30));
        tc_code := 'TC-' || LPAD((300 + i)::TEXT, 3, '0');
        t_date := ('2026-10-10'::DATE + ((i * 3) % 18));

        CASE (i % 5)
            WHEN 0 THEN t_name := 'Rohan Verma'; t_init := 'RV'; t_color := 'purple';
            WHEN 1 THEN t_name := 'Vikram Shah'; t_init := 'VK'; t_color := 'lime';
            WHEN 2 THEN t_name := 'Amit Sharma'; t_init := 'AS'; t_color := 'indigo';
            WHEN 3 THEN t_name := 'Divya Patel'; t_init := 'DP'; t_color := 'blue';
            ELSE t_name := 'Sneha Nair'; t_init := 'SN'; t_color := 'purple';
        END CASE;

        INSERT INTO public.project_uats (
            id, project_id, requirement_id, test_date, test_case,
            expected_result, actual_result, tester_name, tester_initials, tester_color,
            status, defect_id, client_approval, approval_date, comments
        ) VALUES (
            'UAT-2026-0' || (20 - i),
            proj_code,
            req_code,
            t_date,
            tc_code,
            'Verify edge case handling and error bounds for component ' || i,
            'Observed error code mismatch during boundary test',
            t_name,
            t_init,
            t_color,
            'Failed',
            'DEF-0' || (100 + i),
            'Pending',
            NULL,
            'Bug logged and assigned to engineering'
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

