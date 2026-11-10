-- V7__seed_hr_data.sql
-- Description: Seed initial HR dashboard summary and activities data

INSERT INTO public.hr_summary (
    id, active_employees, on_notice, total_monthly_ctc, new_hires_this_month,
    open_candidates, candidates_over_30_days, pending_leave_approvals,
    attendance_records, half_days, late_records, employees_exiting, last_updated
) VALUES (
    1, 0, 0, 0.00, 0,
    997, 0, 0,
    997, 0, 0, 0, NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hr_activities (id, activity_date, type, type_color, description, status, sort_order)
VALUES
    ('act-1', '15 Mar 2025', 'Attendance', '#2563EB', 'Attendance records updated for Mar 15, 2025', 'Completed', 1),
    ('act-2', '14 Mar 2025', 'Recruitment', '#9333EA', 'New candidate added to system', 'Completed', 2),
    ('act-3', '14 Mar 2025', 'Leave', '#D97706', 'Leave request submitted', 'Pending', 3),
    ('act-4', '13 Mar 2025', 'Employee', '#2563EB', 'Employee profile updated', 'Completed', 4),
    ('act-5', '12 Mar 2025', 'Recruitment', '#9333EA', 'Candidate moved to next stage', 'Completed', 5)
ON CONFLICT (id) DO NOTHING;
