-- R__seed_approvals_data.sql
-- Description: Repeatable seed approvals demo data for development profile only

-- 1. Employee Approvals
INSERT INTO public.employee_approvals (employee_name, employee_code, request_type, applied_date, from_date, to_date, duration, reason, status, sort_order)
SELECT v.employee_name, v.employee_code, v.request_type, v.applied_date, v.from_date, v.to_date, v.duration, v.reason, v.status, v.sort_order
FROM (VALUES
    ('Arun S', 'EMP-0012', 'Sick Leave', '12 Mar 2025', '14 Mar 2025', '16 Mar 2025', '3 days', 'Not feeling well due to fever.', 'Pending', 1),
    ('Priya D', 'EMP-0045', 'Work From Home', '11 Mar 2025', '12 Mar 2025', '13 Mar 2025', '2 days', 'Personal work at home.', 'Pending', 2),
    ('Rahul K', 'EMP-0032', 'Earned Leave', '10 Mar 2025', '18 Mar 2025', '20 Mar 2025', '3 days', 'Family function.', 'Approved', 3),
    ('Sneha K', 'EMP-0051', 'Sick Leave', '09 Mar 2025', '09 Mar 2025', '10 Mar 2025', '2 days', 'Medical checkup.', 'Rejected', 4),
    ('Manoj J', 'EMP-0021', 'Work From Home', '08 Mar 2025', '10 Mar 2025', '11 Mar 2025', '2 days', 'Home repair work.', 'Pending', 5),
    ('Ananya Roy', 'EMP-0019', 'Casual Leave', '07 Mar 2025', '12 Mar 2025', '12 Mar 2025', '1 day', 'Personal appointment.', 'Approved', 6),
    ('Vikram Singh', 'EMP-0028', 'Earned Leave', '06 Mar 2025', '21 Mar 2025', '25 Mar 2025', '5 days', 'Annual vacation with family.', 'Approved', 7),
    ('Kavita Nair', 'EMP-0062', 'Work From Home', '05 Mar 2025', '06 Mar 2025', '07 Mar 2025', '2 days', 'Mild sprain recovery.', 'Pending', 8)
) AS v(employee_name, employee_code, request_type, applied_date, from_date, to_date, duration, reason, status, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM public.employee_approvals e WHERE e.employee_code = v.employee_code
);

-- 2. Client Approvals
INSERT INTO public.client_approvals (approval_id, client_name, request_type, reference_id, requester, request_date, due_date, amount, status, sort_order)
SELECT v.approval_id, v.client_name, v.request_type, v.reference_id, v.requester, v.request_date, v.due_date, v.amount, v.status, v.sort_order
FROM (VALUES
    ('APP-CL-001', 'Acme Corp', 'Invoice Approval', 'INV-2025-089', 'Rajesh Verma', '11 Mar 2025', '15 Mar 2025', '₹ 1,45,000', 'Pending', 1),
    ('APP-CL-002', 'Nexus Retail', 'Discount Approval', 'DISC-Q1-012', 'Priya Sharma', '10 Mar 2025', '14 Mar 2025', '₹ 35,000', 'Approved', 2),
    ('APP-CL-003', 'Zenith Global', 'Contract Approval', 'CONT-2025-04', 'Vikram Roy', '08 Mar 2025', '12 Mar 2025', '₹ 8,50,000', 'Pending', 3),
    ('APP-CL-004', 'Apex Infra', 'Invoice Approval', 'INV-2025-094', 'Sneha Gupta', '07 Mar 2025', '10 Mar 2025', '₹ 2,20,000', 'Approved', 4),
    ('APP-CL-005', 'Starlight Media', 'Scope Change Approval', 'CR-2025-03', 'Amit Joshi', '05 Mar 2025', '08 Mar 2025', '₹ 75,000', 'Rejected', 5)
) AS v(approval_id, client_name, request_type, reference_id, requester, request_date, due_date, amount, status, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM public.client_approvals c WHERE c.approval_id = v.approval_id
);

-- 3. Ticket & Asset Approvals
INSERT INTO public.ticket_asset_approvals (approval_id, record_type, record_code, title, client_requester, approval_type, priority, request_date, assigned_approver, status, sort_order)
SELECT v.approval_id, v.record_type, v.record_code, v.title, v.client_requester, v.approval_type, v.priority, v.request_date, v.assigned_approver, v.status, v.sort_order
FROM (VALUES
    ('APP-TK-001', 'Ticket', 'TKT-4412', 'Server Disk Space Upgrade', 'FinEdge Systems', 'Infra / Cloud', 'High', '12 Mar 2025', 'Dinesh Kumar', 'Pending', 1),
    ('APP-AST-002', 'Asset', 'AST-089', 'MacBook Pro M3 Allocation', 'Suman Rao (UI/UX)', 'Asset Allocation', 'Medium', '11 Mar 2025', 'Neha Mehta', 'Approved', 2),
    ('APP-TK-003', 'Ticket', 'TKT-4389', 'Production Hotfix Deployment', 'CloudNine Ltd', 'Bug / Hotfix', 'High', '10 Mar 2025', 'Rajesh Verma', 'Approved', 3),
    ('APP-AST-004', 'Asset', 'AST-094', 'Ergonomic Chair Request', 'Manoj Patel (Eng)', 'Hardware Asset', 'Low', '09 Mar 2025', 'Admin Team', 'Pending', 4),
    ('APP-TK-005', 'Ticket', 'TKT-4350', 'Firewall Rule Exception', 'CoreBank Corp', 'Security / Access', 'High', '08 Mar 2025', 'Security Lead', 'Rejected', 5),
    ('APP-AST-006', 'Asset', 'AST-101', 'Dual Monitor Setup', 'Priya Sharma (PM)', 'Asset Allocation', 'Low', '06 Mar 2025', 'IT Support', 'Approved', 6)
) AS v(approval_id, record_type, record_code, title, client_requester, approval_type, priority, request_date, assigned_approver, status, sort_order)
WHERE NOT EXISTS (
    SELECT 1 FROM public.ticket_asset_approvals t WHERE t.approval_id = v.approval_id
);
