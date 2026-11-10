-- V25__create_uiux_designs_table.sql
-- Description: DDL definitions and initial seed data for UI/UX design deliverables with RLS controls

CREATE TABLE IF NOT EXISTS public.uiux_designs (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    requirement_id VARCHAR(50) NOT NULL,
    screen_feature VARCHAR(255) NOT NULL,
    design_type VARCHAR(50) NOT NULL DEFAULT 'UI Design',
    version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    designer VARCHAR(100) NOT NULL,
    designer_initials VARCHAR(10) NOT NULL,
    tool VARCHAR(50) NOT NULL DEFAULT 'Figma',
    prototype_url VARCHAR(500) DEFAULT 'https://www.figma.com',
    client_feedback VARCHAR(500),
    feedback_date DATE,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    approved_by VARCHAR(100),
    approval_date DATE,
    change_request VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
    notes VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uiux_designs_project_id ON public.uiux_designs(project_id);
CREATE INDEX IF NOT EXISTS idx_uiux_designs_requirement_id ON public.uiux_designs(requirement_id);
CREATE INDEX IF NOT EXISTS idx_uiux_designs_status ON public.uiux_designs(status);
CREATE INDEX IF NOT EXISTS idx_uiux_designs_approval_status ON public.uiux_designs(approval_status);
CREATE INDEX IF NOT EXISTS idx_uiux_designs_design_type ON public.uiux_designs(design_type);
CREATE INDEX IF NOT EXISTS idx_uiux_designs_designer ON public.uiux_designs(designer);

-- Row Level Security
ALTER TABLE public.uiux_designs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.uiux_designs FROM anon, authenticated;

-- Initial Seed Data matching Figma specifications
INSERT INTO public.uiux_designs (
    id, project_id, requirement_id, screen_feature, design_type, version, designer, designer_initials,
    tool, prototype_url, client_feedback, feedback_date, approval_status, approved_by, approval_date,
    change_request, status, notes
) VALUES
('DES-2026-0186', 'PRJ-001', 'REQ-2026-0184', 'Login Screen', 'UI Design', 'v1.2', 'Amit Sharma', 'AS', 'Figma', 'https://www.figma.com', 'Looks good, update spacing', '2026-10-28', 'Pending', NULL, NULL, 'CR-014', 'In Progress', 'Spacing updates'),
('DES-2026-0185', 'PRJ-001', 'REQ-2026-0185', 'Dashboard', 'UI/UX', 'v2.0', 'Sneha Nair', 'SN', 'Figma', 'https://www.figma.com', 'Approved', '2026-10-27', 'Approved', 'Rohan Verma', '2026-10-27', NULL, 'Completed', NULL),
('DES-2026-0184', 'PRJ-002', 'REQ-2026-0182', 'Appointment Booking', 'UI Design', 'v1.1', 'Divya Patel', 'DP', 'Figma', 'https://www.figma.com', 'Add calendar filter', '2026-10-25', 'Pending', NULL, NULL, 'CR-013', 'In Progress', 'Add filter'),
('DES-2026-0183', 'PRJ-002', 'REQ-2026-0181', 'Patient Profile', 'UI Design', 'v1.3', 'Rohan Verma', 'RV', 'Adobe XD', 'https://xd.adobe.com', 'Update icon style', '2026-10-25', 'Approved', 'Amit Sharma', '2026-10-25', NULL, 'Completed', NULL),
('DES-2026-0182', 'PRJ-003', 'REQ-2026-0180', 'Reports & Analytics', 'UI/UX', 'v1.0', 'Vikram Shah', 'VK', 'Figma', 'https://www.figma.com', 'Add export option', '2026-10-24', 'Pending', NULL, NULL, 'CR-012', 'In Progress', NULL),
('DES-2026-0181', 'PRJ-003', 'REQ-2026-0179', 'Settings', 'UI Design', 'v1.0', 'Sneha Nair', 'SN', 'Figma', 'https://www.figma.com', 'Looks good', '2026-10-24', 'Approved', 'Sneha Nair', '2026-10-24', NULL, 'Completed', NULL),
('DES-2026-0180', 'PRJ-004', 'REQ-2026-0178', 'User Management', 'UI/UX', 'v1.2', 'Amit Sharma', 'AS', 'Adobe XD', 'https://xd.adobe.com', 'Change table style', '2026-10-22', 'Pending', NULL, NULL, 'CR-011', 'In Progress', 'Table refinement'),
('DES-2026-0179', 'PRJ-004', 'REQ-2026-0177', 'Role & Permissions', 'UI Design', 'v1.1', 'Divya Patel', 'DP', 'Figma', 'https://www.figma.com', 'Approved', '2026-10-22', 'Approved', 'Rohan Verma', '2026-10-22', NULL, 'Completed', NULL),
('DES-2026-0178', 'PRJ-005', 'REQ-2026-0176', 'Invoice Creation', 'UI Design', 'v1.0', 'Rohan Verma', 'RV', 'Adobe XD', 'https://xd.adobe.com', 'Add tax field', '2026-10-21', 'Pending', NULL, NULL, 'CR-010', 'In Progress', NULL),
('DES-2026-0177', 'PRJ-005', 'REQ-2026-0175', 'Invoice List', 'UI/UX', 'v1.1', 'Vikram Shah', 'VK', 'Figma', 'https://www.figma.com', 'Looks good', '2026-10-20', 'Approved', 'Amit Sharma', '2026-10-20', NULL, 'Completed', NULL)
ON CONFLICT (id) DO NOTHING;

