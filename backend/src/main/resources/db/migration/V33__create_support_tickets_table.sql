-- Flyway migration V33: Create support_tickets table and seed initial data
CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    client_id VARCHAR(50) NOT NULL,
    client_name VARCHAR(150),
    project_id VARCHAR(50) NOT NULL,
    project_name VARCHAR(150),
    amc_sla_id VARCHAR(50),
    opened_date DATE NOT NULL,
    ticket_type VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    issue_request VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(100) NOT NULL,
    assigned_to_email VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    channel VARCHAR(50) DEFAULT 'Portal',
    resolution_time VARCHAR(50) DEFAULT '-',
    sla_due_date DATE,
    sla_status VARCHAR(50) NOT NULL DEFAULT 'Within SLA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_code ON support_tickets (ticket_code);
CREATE INDEX IF NOT EXISTS idx_support_tickets_client ON support_tickets (client_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_project ON support_tickets (project_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets (priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_type ON support_tickets (ticket_type);
CREATE INDEX IF NOT EXISTS idx_support_tickets_sla_status ON support_tickets (sla_status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_opened_date ON support_tickets (opened_date);

