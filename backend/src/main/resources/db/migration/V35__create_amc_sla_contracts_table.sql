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

-- Seed contracts: 48 contracts total (38 Active, 6 Expiring <= 30 Days, 2 Renewal Overdue, 2 Expired/Terminated)
INSERT INTO amc_sla_contracts (
    contract_code, client_id, client_name, project_id, project_name,
    service_type, start_date, end_date, renewal_date, contract_value,
    response_sla, resolution_sla, coverage_hours, status, penalty_clause,
    renewal_alert, assigned_manager, notes
) VALUES
-- Row 1: Matching Image
('AMC-0012', 'CL-001', 'Acme Corp', 'PRJ-001', 'Cloud ERP Migration', 'Application Support', '2026-04-01', '2027-03-31', '2027-03-15', 2400000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Applicable (5%)', 'Normal', 'Rahul Sharma', 'Full stack enterprise ERP support and maintenance.'),
-- Row 2: Matching Image
('SLA-0009', 'CL-003', 'Apex Financial', 'PRJ-002', 'Mobile Banking App', 'Infrastructure Support', '2026-02-10', '2027-02-09', '2027-01-25', 3600000.00, '1 hr', '8 hrs', '24x7 Mission Critical', 'Active', 'Standard SLA Penalty', 'Expiring (≤ 30 Days)', 'Sneha Rao', 'High availability cloud infrastructure monitoring.'),
-- Row 3: Matching Image
('AMC-0011', 'CL-002', 'Global Logistics', 'PRJ-003', 'Payment Gateway Integration', 'Managed Services', '2026-01-01', '2026-12-31', '2026-12-15', 4800000.00, '2 hrs', '16 hrs', '12x6 Business Hours', 'Active', '2% per day', 'Renewal Overdue', 'Vikram Malhotra', 'Continuous DevOps and container platform management.'),
-- Row 4: Matching Image
('SLA-0007', 'CL-005', 'Zenith Healthcare', 'PRJ-004', 'Customer Portal V2', 'Technical Support', '2025-11-15', '2026-11-14', '2026-10-30', 1800000.00, '4 hrs', '24 hrs', '9 AM - 6 PM (Mon-Fri)', 'Active', 'None', 'Expiring (≤ 30 Days)', 'Divya Patel', 'Tier-2 and Tier-3 technical defect remediation.'),
-- Row 5: Matching Image
('AMC-0006', 'CL-004', 'Starlight Retail', 'PRJ-005', 'Data Pipeline Modernization', 'AMC (Overall)', '2025-10-01', '2026-09-30', '2026-09-15', 2250000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Applicable (5%)', 'Renewal Overdue', 'Amit Sharma', 'Comprehensive annual AMC covering hardware and middleware.'),

-- Additional contracts making up 48 contracts
('AMC-0013', 'CL-006', 'Nexus Telecom', 'PRJ-006', '5G Core Gateway', 'Application Support', '2026-03-01', '2027-02-28', '2027-02-14', 1500000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Applicable (5%)', 'Normal', 'Rahul Sharma', 'Core application support agreement.'),
('SLA-0010', 'CL-001', 'Acme Corp', 'PRJ-001', 'Cloud ERP Migration', 'Infrastructure Support', '2026-01-15', '2027-01-14', '2026-12-30', 2100000.00, '1 hr', '6 hrs', '24x7 Mission Critical', 'Active', 'Standard SLA Penalty', 'Expiring (≤ 30 Days)', 'Sneha Rao', 'Primary cloud infrastructure SLA.'),
('AMC-0014', 'CL-007', 'Vanguard Media', 'PRJ-007', 'Video Streaming CDN', 'Managed Services', '2026-02-01', '2027-01-31', '2027-01-15', 2800000.00, '2 hrs', '16 hrs', '12x6 Business Hours', 'Active', '2% per day', 'Expiring (≤ 30 Days)', 'Vikram Malhotra', 'Media platform managed ops.'),
('SLA-0011', 'CL-008', 'Crestline Auto', 'PRJ-008', 'Dealer Portal V3', 'Technical Support', '2025-12-01', '2026-11-30', '2026-11-15', 1200000.00, '4 hrs', '24 hrs', '9 AM - 6 PM (Mon-Fri)', 'Active', 'None', 'Expiring (≤ 30 Days)', 'Divya Patel', 'Automotive portal support.'),
('AMC-0015', 'CL-009', 'Aura BioTech', 'PRJ-009', 'LIMS Platform', 'AMC (Overall)', '2026-01-10', '2027-01-09', '2026-12-24', 3100000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Applicable (5%)', 'Expiring (≤ 30 Days)', 'Amit Sharma', 'Annual overall maintenance.'),

-- Active normal contracts (Rows 11 - 46)
('AMC-0016', 'CL-001', 'Acme Corp', 'PRJ-001', 'Cloud ERP Migration', 'Application Support', '2026-05-01', '2027-04-30', '2027-04-15', 1900000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Standard SLA Penalty', 'Normal', 'Rahul Sharma', 'ERP supplementary modules.'),
('SLA-0012', 'CL-002', 'Global Logistics', 'PRJ-003', 'Payment Gateway Integration', 'Infrastructure Support', '2026-04-15', '2027-04-14', '2027-03-30', 2500000.00, '1 hr', '8 hrs', '24x7 Mission Critical', 'Active', 'Standard SLA Penalty', 'Normal', 'Sneha Rao', 'Gateway cluster infrastructure.'),
('AMC-0017', 'CL-003', 'Apex Financial', 'PRJ-002', 'Mobile Banking App', 'Managed Services', '2026-05-10', '2027-05-09', '2027-04-24', 3200000.00, '2 hrs', '16 hrs', '12x6 Business Hours', 'Active', '2% per day', 'Normal', 'Vikram Malhotra', 'Mobile banking managed services.'),
('SLA-0013', 'CL-004', 'Starlight Retail', 'PRJ-005', 'Data Pipeline Modernization', 'Technical Support', '2026-03-15', '2027-03-14', '2027-02-28', 1400000.00, '4 hrs', '24 hrs', '9 AM - 6 PM (Mon-Fri)', 'Active', 'None', 'Normal', 'Divya Patel', 'Pipeline bug fixing and maintenance.'),
('AMC-0018', 'CL-005', 'Zenith Healthcare', 'PRJ-004', 'Customer Portal V2', 'AMC (Overall)', '2026-06-01', '2027-05-31', '2027-05-15', 2900000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Applicable (5%)', 'Normal', 'Amit Sharma', 'Healthcare portal maintenance contract.'),
('AMC-0019', 'CL-006', 'Nexus Telecom', 'PRJ-006', '5G Core Gateway', 'Application Support', '2026-06-15', '2027-06-14', '2027-05-30', 1750000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Standard SLA Penalty', 'Normal', 'Rahul Sharma', 'OSS/BSS integration support.'),
('SLA-0014', 'CL-007', 'Vanguard Media', 'PRJ-007', 'Video Streaming CDN', 'Infrastructure Support', '2026-07-01', '2027-06-30', '2027-06-15', 2200000.00, '1 hr', '8 hrs', '24x7 Mission Critical', 'Active', 'Standard SLA Penalty', 'Normal', 'Sneha Rao', 'Edge CDN server uptime SLA.'),
('AMC-0020', 'CL-008', 'Crestline Auto', 'PRJ-008', 'Dealer Portal V3', 'Managed Services', '2026-04-01', '2027-03-31', '2027-03-15', 2600000.00, '2 hrs', '16 hrs', '12x6 Business Hours', 'Active', '2% per day', 'Normal', 'Vikram Malhotra', 'Cloud environment operations.'),
('SLA-0015', 'CL-009', 'Aura BioTech', 'PRJ-009', 'LIMS Platform', 'Technical Support', '2026-05-01', '2027-04-30', '2027-04-15', 1350000.00, '4 hrs', '24 hrs', '9 AM - 6 PM (Mon-Fri)', 'Active', 'None', 'Normal', 'Divya Patel', 'Lab workflow bug fixing.'),
('AMC-0021', 'CL-010', 'Beacon Logistics', 'PRJ-010', 'Freight Tracking System', 'AMC (Overall)', '2026-03-01', '2027-02-28', '2027-02-14', 2150000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Applicable (5%)', 'Normal', 'Amit Sharma', 'Freight tracker overall maintenance.'),
('AMC-0022', 'CL-001', 'Acme Corp', 'PRJ-001', 'Cloud ERP Migration', 'Application Support', '2026-07-15', '2027-07-14', '2027-06-30', 1600000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Standard SLA Penalty', 'Normal', 'Rahul Sharma', 'Warehouse module support.'),
('SLA-0016', 'CL-002', 'Global Logistics', 'PRJ-003', 'Payment Gateway Integration', 'Infrastructure Support', '2026-08-01', '2027-07-31', '2027-07-15', 2300000.00, '1 hr', '8 hrs', '24x7 Mission Critical', 'Active', 'Standard SLA Penalty', 'Normal', 'Sneha Rao', 'Failover cluster SLA.'),
('AMC-0023', 'CL-003', 'Apex Financial', 'PRJ-002', 'Mobile Banking App', 'Managed Services', '2026-06-01', '2027-05-31', '2027-05-15', 3400000.00, '2 hrs', '16 hrs', '12x6 Business Hours', 'Active', '2% per day', 'Normal', 'Vikram Malhotra', 'Database and security ops.'),
('SLA-0017', 'CL-004', 'Starlight Retail', 'PRJ-005', 'Data Pipeline Modernization', 'Technical Support', '2026-07-10', '2027-07-09', '2027-06-25', 1250000.00, '4 hrs', '24 hrs', '9 AM - 6 PM (Mon-Fri)', 'Active', 'None', 'Normal', 'Divya Patel', 'Analytics connector fixes.'),
('AMC-0024', 'CL-005', 'Zenith Healthcare', 'PRJ-004', 'Customer Portal V2', 'AMC (Overall)', '2026-08-15', '2027-08-14', '2027-07-30', 2700000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Applicable (5%)', 'Normal', 'Amit Sharma', 'Full portal warranty & AMC.'),
('AMC-0025', 'CL-006', 'Nexus Telecom', 'PRJ-006', '5G Core Gateway', 'Application Support', '2026-05-20', '2027-05-19', '2027-05-04', 1850000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Standard SLA Penalty', 'Normal', 'Rahul Sharma', 'Customer self-service portal.'),
('SLA-0018', 'CL-007', 'Vanguard Media', 'PRJ-007', 'Video Streaming CDN', 'Infrastructure Support', '2026-06-25', '2027-06-24', '2027-06-09', 2450000.00, '1 hr', '8 hrs', '24x7 Mission Critical', 'Active', 'Standard SLA Penalty', 'Normal', 'Sneha Rao', 'Live transcode nodes SLA.'),
('AMC-0026', 'CL-008', 'Crestline Auto', 'PRJ-008', 'Dealer Portal V3', 'Managed Services', '2026-07-05', '2027-07-04', '2027-06-20', 2750000.00, '2 hrs', '16 hrs', '12x6 Business Hours', 'Active', '2% per day', 'Normal', 'Vikram Malhotra', 'Automated backup & patch management.'),
('SLA-0019', 'CL-009', 'Aura BioTech', 'PRJ-009', 'LIMS Platform', 'Technical Support', '2026-08-01', '2027-07-31', '2027-07-15', 1450000.00, '4 hrs', '24 hrs', '9 AM - 6 PM (Mon-Fri)', 'Active', 'None', 'Normal', 'Divya Patel', 'Instrument integration support.'),
('AMC-0027', 'CL-010', 'Beacon Logistics', 'PRJ-010', 'Freight Tracking System', 'AMC (Overall)', '2026-04-10', '2027-04-09', '2027-03-25', 2350000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Applicable (5%)', 'Normal', 'Amit Sharma', 'Core dispatch service AMC.'),
('AMC-0028', 'CL-001', 'Acme Corp', 'PRJ-001', 'Cloud ERP Migration', 'Application Support', '2026-08-10', '2027-08-09', '2027-07-25', 1550000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Standard SLA Penalty', 'Normal', 'Rahul Sharma', 'Finance reporting module support.'),
('SLA-0020', 'CL-002', 'Global Logistics', 'PRJ-003', 'Payment Gateway Integration', 'Infrastructure Support', '2026-09-01', '2027-08-31', '2027-08-15', 2150000.00, '1 hr', '8 hrs', '24x7 Mission Critical', 'Active', 'Standard SLA Penalty', 'Normal', 'Sneha Rao', 'Database replica monitoring.'),
('AMC-0029', 'CL-003', 'Apex Financial', 'PRJ-002', 'Mobile Banking App', 'Managed Services', '2026-07-20', '2027-07-19', '2027-07-04', 3150000.00, '2 hrs', '16 hrs', '12x6 Business Hours', 'Active', '2% per day', 'Normal', 'Vikram Malhotra', 'Penetration testing & compliance ops.'),
('SLA-0021', 'CL-004', 'Starlight Retail', 'PRJ-005', 'Data Pipeline Modernization', 'Technical Support', '2026-08-05', '2027-08-04', '2027-07-20', 1300000.00, '4 hrs', '24 hrs', '9 AM - 6 PM (Mon-Fri)', 'Active', 'None', 'Normal', 'Divya Patel', 'Nightly ETL defect resolution.'),
('AMC-0030', 'CL-005', 'Zenith Healthcare', 'PRJ-004', 'Customer Portal V2', 'AMC (Overall)', '2026-09-10', '2027-09-09', '2027-08-25', 2850000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Applicable (5%)', 'Normal', 'Amit Sharma', 'HIPAA compliant portal maintenance.'),
('AMC-0031', 'CL-006', 'Nexus Telecom', 'PRJ-006', '5G Core Gateway', 'Application Support', '2026-08-25', '2027-08-24', '2027-08-09', 1950000.00, '2 hrs', '12 hrs', '24/7 Support', 'Active', 'Standard SLA Penalty', 'Normal', 'Rahul Sharma', 'VoLTE billing mediator support.'),
('SLA-0022', 'CL-007', 'Vanguard Media', 'PRJ-007', 'Video Streaming CDN', 'Infrastructure Support', '2026-09-15', '2027-09-14', '2027-08-30', 2550000.00, '1 hr', '8 hrs', '24x7 Mission Critical', 'Active', 'Standard SLA Penalty', 'Normal', 'Sneha Rao', 'Storage volume IOPS guarantee.'),
('AMC-0032', 'CL-008', 'Crestline Auto', 'PRJ-008', 'Dealer Portal V3', 'Managed Services', '2026-08-20', '2027-08-19', '2027-08-04', 2650000.00, '2 hrs', '16 hrs', '12x6 Business Hours', 'Active', '2% per day', 'Normal', 'Vikram Malhotra', 'Kubernetes cluster administration.'),

-- Expired/Terminated records to reach 48 total contracts (38 Active, 8 Expired, 2 Terminated)
('AMC-0001', 'CL-001', 'Acme Corp', 'PRJ-001', 'Cloud ERP Migration', 'Application Support', '2024-04-01', '2025-03-31', '2025-03-15', 1800000.00, '2 hrs', '12 hrs', '24/7 Support', 'Expired', 'Standard SLA Penalty', 'Normal', 'Rahul Sharma', 'Initial contract ended.'),
('SLA-0002', 'CL-002', 'Global Logistics', 'PRJ-003', 'Payment Gateway Integration', 'Infrastructure Support', '2024-06-01', '2025-05-31', '2025-05-15', 2000000.00, '1 hr', '8 hrs', '24x7 Mission Critical', 'Terminated', 'None', 'Normal', 'Sneha Rao', 'Superseded by SLA-0009.'),
('AMC-0002', 'CL-003', 'Apex Financial', 'PRJ-002', 'Mobile Banking App', 'Managed Services', '2024-05-01', '2025-04-30', '2025-04-15', 2500000.00, '2 hrs', '16 hrs', '12x6 Business Hours', 'Expired', '2% per day', 'Normal', 'Vikram Malhotra', 'Prior year managed services.'),
('SLA-0003', 'CL-004', 'Starlight Retail', 'PRJ-005', 'Data Pipeline Modernization', 'Technical Support', '2024-07-01', '2025-06-30', '2025-06-15', 1100000.00, '4 hrs', '24 hrs', '9 AM - 6 PM (Mon-Fri)', 'Expired', 'None', 'Normal', 'Divya Patel', 'Prior year tech support.'),
('AMC-0003', 'CL-005', 'Zenith Healthcare', 'PRJ-004', 'Customer Portal V2', 'AMC (Overall)', '2024-08-01', '2025-07-31', '2025-07-15', 2100000.00, '2 hrs', '12 hrs', '24/7 Support', 'Expired', 'Applicable (5%)', 'Normal', 'Amit Sharma', 'Prior year maintenance.'),
('AMC-0004', 'CL-006', 'Nexus Telecom', 'PRJ-006', '5G Core Gateway', 'Application Support', '2024-09-01', '2025-08-31', '2025-08-15', 1600000.00, '2 hrs', '12 hrs', '24/7 Support', 'Expired', 'Standard SLA Penalty', 'Normal', 'Rahul Sharma', 'Prior year app support.'),
('SLA-0004', 'CL-007', 'Vanguard Media', 'PRJ-007', 'Video Streaming CDN', 'Infrastructure Support', '2024-10-01', '2025-09-30', '2025-09-15', 2300000.00, '1 hr', '8 hrs', '24x7 Mission Critical', 'Expired', 'Standard SLA Penalty', 'Normal', 'Sneha Rao', 'Prior year infrastructure.'),
('AMC-0005', 'CL-008', 'Crestline Auto', 'PRJ-008', 'Dealer Portal V3', 'Managed Services', '2024-11-01', '2025-10-31', '2025-10-15', 2400000.00, '2 hrs', '16 hrs', '12x6 Business Hours', 'Expired', '2% per day', 'Normal', 'Vikram Malhotra', 'Prior year ops.'),
('SLA-0005', 'CL-009', 'Aura BioTech', 'PRJ-009', 'LIMS Platform', 'Technical Support', '2024-12-01', '2025-11-30', '2025-11-15', 1300000.00, '4 hrs', '24 hrs', '9 AM - 6 PM (Mon-Fri)', 'Expired', 'None', 'Normal', 'Divya Patel', 'Prior year instrument support.'),
('SLA-0006', 'CL-010', 'Beacon Logistics', 'PRJ-010', 'Freight Tracking System', 'Infrastructure Support', '2024-05-15', '2025-05-14', '2025-04-30', 1900000.00, '1 hr', '8 hrs', '24x7 Mission Critical', 'Terminated', 'None', 'Normal', 'Sneha Rao', 'Replaced by internal team.');
