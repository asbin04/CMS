-- V37: Create project_deployments table and seed 124 deployment records
CREATE TABLE IF NOT EXISTS project_deployments (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    release_version VARCHAR(50) NOT NULL,
    deployment_date DATE NOT NULL,
    environment VARCHAR(50) NOT NULL,
    deployment_owner VARCHAR(100) NOT NULL,
    pre_deployment_checklist VARCHAR(50) NOT NULL DEFAULT 'Completed',
    backup_completed VARCHAR(10) NOT NULL DEFAULT 'Yes',
    rollback_plan VARCHAR(50) NOT NULL DEFAULT 'Available',
    smoke_test VARCHAR(50) NOT NULL DEFAULT 'Successful',
    status VARCHAR(50) NOT NULL DEFAULT 'Live',
    client_sign_off VARCHAR(50) NOT NULL DEFAULT 'Completed',
    go_live_date DATE,
    handover_status VARCHAR(50) NOT NULL DEFAULT 'Handed Over',
    release_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON project_deployments (project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_env ON project_deployments (environment);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON project_deployments (status);
CREATE INDEX IF NOT EXISTS idx_deployments_handover ON project_deployments (handover_status);
CREATE INDEX IF NOT EXISTS idx_deployments_date ON project_deployments (deployment_date DESC);

