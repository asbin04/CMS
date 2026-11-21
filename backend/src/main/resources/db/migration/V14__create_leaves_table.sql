-- V14__create_leaves_table.sql
CREATE TABLE IF NOT EXISTS leaves (
    id VARCHAR(30) PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    from_date VARCHAR(50) NOT NULL,
    to_date VARCHAR(50) NOT NULL,
    days INTEGER NOT NULL,
    reason TEXT,
    approval_status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    approved_by VARCHAR(100),
    calculated_days INTEGER NOT NULL,
    leave_status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    applied_date VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

