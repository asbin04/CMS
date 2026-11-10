-- Migration V34: Add extended columns to support_tickets matching Figma spec
ALTER TABLE support_tickets
    ADD COLUMN IF NOT EXISTS first_response_date VARCHAR(50),
    ADD COLUMN IF NOT EXISTS resolved_date VARCHAR(50),
    ADD COLUMN IF NOT EXISTS response_hours VARCHAR(20) DEFAULT '-',
    ADD COLUMN IF NOT EXISTS resolution_hours VARCHAR(20) DEFAULT '-',
    ADD COLUMN IF NOT EXISTS response_sla_target VARCHAR(20) DEFAULT '4.0',
    ADD COLUMN IF NOT EXISTS resolution_sla_target VARCHAR(20) DEFAULT '24.0',
    ADD COLUMN IF NOT EXISTS customer_confirmation VARCHAR(20) DEFAULT '-',
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update Row 1: ST-2026-0186
UPDATE support_tickets SET
    first_response_date = '28 Oct 2026 11:30 AM',
    resolved_date = '-',
    response_hours = '0.3',
    resolution_hours = '-',
    response_sla_target = '2.0',
    resolution_sla_target = '8.0',
    customer_confirmation = '-',
    notes = 'User unable to log in to application'
WHERE ticket_code = 'ST-2026-0186';

-- Update Row 2: ST-2026-0185
UPDATE support_tickets SET
    first_response_date = '27 Oct 2026 02:10 PM',
    resolved_date = '-',
    response_hours = '1.0',
    resolution_hours = '-',
    response_sla_target = '4.0',
    resolution_sla_target = '16.0',
    customer_confirmation = '-',
    notes = 'Create access for project team.'
WHERE ticket_code = 'ST-2026-0185';

-- Update Row 3: ST-2026-0184
UPDATE support_tickets SET
    first_response_date = '26 Oct 2026 10:15 AM',
    resolved_date = '27 Oct 2026 04:40 PM',
    response_hours = '0.7',
    resolution_hours = '20.4',
    response_sla_target = '2.0',
    resolution_sla_target = '32.0',
    customer_confirmation = 'Yes',
    notes = 'Issue fixed and validated by user.'
WHERE ticket_code = 'ST-2026-0184';

-- Update Row 4: ST-2026-0183
UPDATE support_tickets SET
    first_response_date = '25 Oct 2026 03:20 PM',
    resolved_date = '25 Oct 2026 06:10 PM',
    response_hours = '1.3',
    resolution_hours = '2.8',
    response_sla_target = '4.0',
    resolution_sla_target = '24.0',
    customer_confirmation = 'Yes',
    notes = 'Invoice data updated as per request.'
WHERE ticket_code = 'ST-2026-0183';

-- Update Row 5: ST-2026-0182
UPDATE support_tickets SET
    first_response_date = '24 Oct 2026 11:00 AM',
    resolved_date = '25 Oct 2026 12:48 PM',
    response_hours = '0.8',
    resolution_hours = '20.8',
    response_sla_target = '4.0',
    resolution_sla_target = '32.0',
    sla_status = 'At Risk',
    customer_confirmation = 'Yes',
    notes = 'Performance optimized and monitored.'
WHERE ticket_code = 'ST-2026-0182';

-- Default fallback values for remaining records
UPDATE support_tickets SET
    first_response_date = TO_CHAR(opened_date, 'DD Mon YYYY') || ' 10:30 AM',
    resolved_date = CASE WHEN status IN ('Resolved', 'Closed') THEN TO_CHAR(opened_date + INTERVAL '1 day', 'DD Mon YYYY') || ' 04:00 PM' ELSE '-' END,
    response_hours = CASE WHEN priority = 'High' THEN '0.9' WHEN priority = 'Medium' THEN '1.4' ELSE '2.1' END,
    resolution_hours = CASE WHEN status IN ('Resolved', 'Closed') THEN '18.5' ELSE '-' END,
    response_sla_target = CASE WHEN priority = 'High' THEN '2.0' ELSE '4.0' END,
    resolution_sla_target = CASE WHEN priority = 'High' THEN '8.0' WHEN priority = 'Medium' THEN '16.0' ELSE '24.0' END,
    customer_confirmation = CASE WHEN status IN ('Resolved', 'Closed') THEN 'Yes' ELSE '-' END,
    notes = COALESCE(description, 'Support ticket processed and verified.')
WHERE ticket_code NOT IN ('ST-2026-0186', 'ST-2026-0185', 'ST-2026-0184', 'ST-2026-0183', 'ST-2026-0182')
  AND first_response_date IS NULL;

