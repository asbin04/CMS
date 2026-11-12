-- Replace visible "CEO" UI labels with "Admin" while keeping internal security role codes unchanged.

UPDATE public.dashboard_settings
SET dashboard_title = 'Admin Dashboard'
WHERE dashboard_title = 'CEO Dashboard';

UPDATE public.user_settings
SET role_label = 'ADMIN'
WHERE UPPER(role_label) = 'CEO';

UPDATE public.project_requirements
SET assigned_approver = 'Admin – Akshit Ujjain'
WHERE assigned_approver = 'CEO – Akshit Ujjain';

UPDATE public.project_timesheets
SET assigned_approver = 'Admin – Akshit Ujjain'
WHERE assigned_approver = 'CEO – Akshit Ujjain';

