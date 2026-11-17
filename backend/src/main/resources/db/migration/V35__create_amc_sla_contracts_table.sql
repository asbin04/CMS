-- Create amc_sla_contracts table for Annual Maintenance Contracts and Service Level Agreements
CREATE TABLE IF NOT EXISTS amc_sla_contracts (
    id BIGSERIAL PRIMARY KEY,
    contract_code VARCHAR(50) NOT NULL UNIQUE,
    client_id VARCHAR(50) NOT NULL,
    client_name VARCHAR(150),
    project_id VARCHAR(50) NOT NULL,
    project_name VARCHAR(150),
    service_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    renewal_date DATE NOT NULL,
    contract_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    response_sla VARCHAR(50) NOT NULL DEFAULT '2 hrs',
    resolution_sla VARCHAR(50) NOT NULL DEFAULT '24 hrs',
    coverage_hours VARCHAR(100) NOT NULL DEFAULT '24/7 Support',
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    penalty_clause VARCHAR(100) DEFAULT 'Standard SLA Penalty',
    renewal_alert VARCHAR(50) DEFAULT 'Normal',
    assigned_manager VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_amc_contracts_code ON amc_sla_contracts (contract_code);
CREATE INDEX IF NOT EXISTS idx_amc_contracts_client ON amc_sla_contracts (client_id);
CREATE INDEX IF NOT EXISTS idx_amc_contracts_project ON amc_sla_contracts (project_id);
CREATE INDEX IF NOT EXISTS idx_amc_contracts_service_type ON amc_sla_contracts (service_type);
CREATE INDEX IF NOT EXISTS idx_amc_contracts_status ON amc_sla_contracts (status);
CREATE INDEX IF NOT EXISTS idx_amc_contracts_renewal_alert ON amc_sla_contracts (renewal_alert);

