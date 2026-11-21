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

