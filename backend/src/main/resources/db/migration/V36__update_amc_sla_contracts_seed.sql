-- Update existing contracts with exact matching seed values from design
UPDATE amc_sla_contracts SET
    assigned_manager = 'Rohan Verma',
    notes = 'Production support & maintenance',
    coverage_hours = 'Mon - Fri, 9:00 AM - 6:00 PM',
    resolution_sla = '4 hrs',
    renewal_alert = 'Normal',
    status = 'Active',
    renewal_date = '2027-03-15',
    end_date = '2027-03-31'
WHERE contract_code = 'AMC-0012';

UPDATE amc_sla_contracts SET
    assigned_manager = 'Sneha Nair',
    notes = 'Server, network & cloud support',
    coverage_hours = '24 x 7',
    resolution_sla = '4 hrs',
    renewal_alert = 'Due Soon',
    status = 'Active',
    renewal_date = '2027-01-25',
    end_date = '2027-02-09'
WHERE contract_code = 'SLA-0009';

UPDATE amc_sla_contracts SET
    assigned_manager = 'Vikram Shah',
    notes = 'Application & DB maintenance',
    coverage_hours = 'Mon - Sat, 9:00 AM - 8:00 PM',
    resolution_sla = '8 hrs',
    renewal_alert = 'Expiring',
    status = 'Expiring',
    renewal_date = '2026-12-02',
    end_date = '2026-12-31'
WHERE contract_code = 'AMC-0011';

UPDATE amc_sla_contracts SET
    assigned_manager = 'Amit Sharma',
    notes = 'L2/L3 technical support',
    coverage_hours = 'Mon - Fri, 9:00 AM - 6:00 PM',
    resolution_sla = '16 hrs',
    renewal_alert = 'Expiring',
    status = 'Expiring',
    renewal_date = '2026-11-23',
    end_date = '2026-11-14'
WHERE contract_code = 'SLA-0007';

UPDATE amc_sla_contracts SET
    assigned_manager = 'Divya Patel',
    notes = 'Contract expired - renewal pending',
    coverage_hours = '24 x 7',
    resolution_sla = '8 hrs',
    renewal_alert = 'Overdue',
    status = 'Inactive',
    renewal_date = '2026-09-15',
    end_date = '2026-09-30'
WHERE contract_code = 'AMC-0006';

-- Additional Expiring contracts (4 more to total 6 in ≤ 30 days)
UPDATE amc_sla_contracts SET renewal_alert = 'Expiring', status = 'Expiring', renewal_date = '2026-11-28' WHERE contract_code = 'SLA-0010';
UPDATE amc_sla_contracts SET renewal_alert = 'Expiring', status = 'Expiring', renewal_date = '2026-12-05' WHERE contract_code = 'AMC-0014';
UPDATE amc_sla_contracts SET renewal_alert = 'Expiring', status = 'Expiring', renewal_date = '2026-12-01' WHERE contract_code = 'SLA-0011';
UPDATE amc_sla_contracts SET renewal_alert = 'Expiring', status = 'Expiring', renewal_date = '2026-11-30' WHERE contract_code = 'AMC-0015';

-- Additional Overdue contract (to total 2 Overdue)
UPDATE amc_sla_contracts SET renewal_alert = 'Overdue', status = 'Inactive', renewal_date = '2026-08-15' WHERE contract_code = 'AMC-0001';

-- Upcoming (31 - 90 days): 10 contracts total
UPDATE amc_sla_contracts SET renewal_alert = 'Due Soon', status = 'Active', renewal_date = '2027-01-15' WHERE contract_code = 'AMC-0013';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-01-20' WHERE contract_code = 'AMC-0016';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-01-30' WHERE contract_code = 'SLA-0012';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-02-05' WHERE contract_code = 'AMC-0017';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-02-04' WHERE contract_code = 'SLA-0013';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-02-02' WHERE contract_code = 'AMC-0018';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-01-18' WHERE contract_code = 'AMC-0021';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-01-22' WHERE contract_code = 'AMC-0027';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-02-06' WHERE contract_code = 'SLA-0015';

-- > 90 days: exactly 12 contracts
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-05-30' WHERE contract_code = 'AMC-0019';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-06-15' WHERE contract_code = 'SLA-0014';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-03-25' WHERE contract_code = 'AMC-0020';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-06-30' WHERE contract_code = 'AMC-0022';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-07-15' WHERE contract_code = 'SLA-0016';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-05-15' WHERE contract_code = 'AMC-0023';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-06-25' WHERE contract_code = 'SLA-0017';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-07-30' WHERE contract_code = 'AMC-0024';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-05-04' WHERE contract_code = 'AMC-0025';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-06-09' WHERE contract_code = 'SLA-0018';
UPDATE amc_sla_contracts SET renewal_alert = 'Normal', status = 'Active', renewal_date = '2027-06-20' WHERE contract_code = 'AMC-0026';

-- Expired historical contracts (to make 18 expired/inactive out of 48 total contracts)
UPDATE amc_sla_contracts SET status = 'Expired', renewal_alert = 'Normal' WHERE contract_code IN ('SLA-0019', 'AMC-0028', 'SLA-0020', 'AMC-0029', 'SLA-0021', 'AMC-0030', 'AMC-0031', 'SLA-0022', 'AMC-0032');
