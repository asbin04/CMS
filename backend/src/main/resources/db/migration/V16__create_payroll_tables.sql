-- V16__create_payroll_tables.sql
-- Description: Create hr_payroll_records table, hr_payroll_counters sequence table, triggers, indexes, and seed records matching UI requirements.

-- 1. Create table for Payroll Records
CREATE TABLE IF NOT EXISTS public.hr_payroll_records (
    id BIGSERIAL PRIMARY KEY,
    payroll_id VARCHAR(50) NOT NULL UNIQUE,
    payroll_month VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('Full Time', 'Contract', 'Part Time', 'Intern')),
    monthly_ctc NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    working_days INTEGER NOT NULL DEFAULT 22,
    paid_days INTEGER NOT NULL DEFAULT 22,
    lop_days INTEGER NOT NULL DEFAULT 0,
    basic_pay NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    hra NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    allowances NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    gross_salary NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    deductions NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Paid' CHECK (payment_status IN ('Paid', 'Pending', 'Processing', 'Failed')),
    payment_date DATE,
    payment_mode VARCHAR(50) DEFAULT 'Bank Transfer',
    bank_name VARCHAR(100) DEFAULT 'HDFC Bank',
    bank_account VARCHAR(50) DEFAULT 'XXXXXXXX4589',
    pan_number VARCHAR(20) DEFAULT 'ABCDE1234F',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for fast search, filter, and sorting queries
CREATE INDEX IF NOT EXISTS idx_payroll_payroll_id ON public.hr_payroll_records(payroll_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month ON public.hr_payroll_records(payroll_month);
CREATE INDEX IF NOT EXISTS idx_payroll_emp_id ON public.hr_payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_emp_name ON public.hr_payroll_records(employee_name);
CREATE INDEX IF NOT EXISTS idx_payroll_type ON public.hr_payroll_records(employment_type);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON public.hr_payroll_records(payment_status);
CREATE INDEX IF NOT EXISTS idx_payroll_created_at ON public.hr_payroll_records(created_at);

-- 3. Automatic updated_at trigger maintenance
DROP TRIGGER IF EXISTS trigger_hr_payroll_records_updated_at ON public.hr_payroll_records;
CREATE TRIGGER trigger_hr_payroll_records_updated_at
BEFORE UPDATE ON public.hr_payroll_records
FOR EACH ROW
EXECUTE FUNCTION update_collections_updated_at_column();

-- 4. Atomic sequence counter table for Payroll IDs
CREATE TABLE IF NOT EXISTS public.hr_payroll_counters (
    prefix VARCHAR(50) PRIMARY KEY,
    current_val BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Seed initial 10 records matching the exact screenshot
INSERT INTO public.hr_payroll_records (
    payroll_id, payroll_month, employee_id, employee_name, employment_type,
    monthly_ctc, working_days, paid_days, lop_days,
    basic_pay, hra, allowances, gross_salary, deductions, net_salary,
    payment_status, payment_date, bank_name, bank_account
)
VALUES
    ('PAY-202610-001', 'Oct 2026', 'EMP-001', 'Amit Sharma', 'Full Time', 600000.00, 22, 22, 0, 30000.00, 15000.00, 5000.00, 50000.00, 4500.00, 45500.00, 'Paid', '2026-10-31', 'HDFC Bank', 'XXXXXXXX1001'),
    ('PAY-202610-002', 'Oct 2026', 'EMP-004', 'Sneha Nair', 'Full Time', 540000.00, 22, 20, 2, 27000.00, 13500.00, 4500.00, 45000.00, 4050.00, 40950.00, 'Paid', '2026-10-31', 'ICICI Bank', 'XXXXXXXX1004'),
    ('PAY-202610-003', 'Oct 2026', 'EMP-006', 'Ananya Rao', 'Full Time', 720000.00, 22, 22, 0, 36000.00, 18000.00, 6000.00, 60000.00, 5400.00, 54600.00, 'Paid', '2026-10-31', 'Axis Bank', 'XXXXXXXX1006'),
    ('PAY-202610-004', 'Oct 2026', 'EMP-002', 'Priya Kapoor', 'Contract', 480000.00, 22, 21, 1, 24000.00, 12000.00, 4000.00, 40000.00, 3600.00, 36400.00, 'Paid', '2026-10-31', 'State Bank of India', 'XXXXXXXX1002'),
    ('PAY-202610-005', 'Oct 2026', 'EMP-003', 'Rohan Kumar', 'Full Time', 650000.00, 22, 22, 0, 32500.00, 16250.00, 5416.00, 54166.00, 4875.00, 49291.00, 'Paid', '2026-10-31', 'HDFC Bank', 'XXXXXXXX1003'),
    ('PAY-202610-006', 'Oct 2026', 'EMP-007', 'Karthik R', 'Full Time', 570000.00, 22, 19, 3, 28500.00, 14250.00, 4750.00, 47500.00, 4275.00, 43225.00, 'Paid', '2026-10-31', 'Kotak Mahindra Bank', 'XXXXXXXX1007'),
    ('PAY-202610-007', 'Oct 2026', 'EMP-008', 'Divya Patel', 'Part Time', 360000.00, 22, 18, 4, 18000.00, 9000.00, 3000.00, 30000.00, 2700.00, 27300.00, 'Paid', '2026-10-31', 'HDFC Bank', 'XXXXXXXX1008'),
    ('PAY-202610-008', 'Oct 2026', 'EMP-005', 'Vikram Shah', 'Full Time', 620000.00, 22, 22, 0, 31000.00, 15500.00, 5166.00, 51666.00, 4650.00, 47016.00, 'Paid', '2026-10-31', 'ICICI Bank', 'XXXXXXXX1005'),
    ('PAY-202610-009', 'Oct 2026', 'EMP-009', 'Meera Joshi', 'Intern', 240000.00, 22, 22, 0, 12000.00, 6000.00, 2000.00, 20000.00, 1800.00, 18200.00, 'Paid', '2026-10-31', 'Axis Bank', 'XXXXXXXX1009'),
    ('PAY-202610-010', 'Oct 2026', 'EMP-010', 'Arjun Verma', 'Full Time', 800000.00, 22, 22, 0, 40000.00, 20000.00, 6666.00, 66666.00, 6000.00, 60666.00, 'Paid', '2026-10-31', 'HDFC Bank', 'XXXXXXXX1010')
ON CONFLICT (payroll_id) DO NOTHING;

-- 6. Generate the remaining 238 records (to complete 248 total records in the database)
DO $$
DECLARE
    i INTEGER;
    v_emp_num INTEGER;
    v_emp_id VARCHAR(50);
    v_emp_name VARCHAR(255);
    v_type VARCHAR(50);
    v_ctc NUMERIC(15,2);
    v_wd INTEGER := 22;
    v_pd INTEGER;
    v_lop INTEGER;
    v_basic NUMERIC(15,2);
    v_hra NUMERIC(15,2);
    v_allow NUMERIC(15,2);
    v_gross NUMERIC(15,2);
    v_deduct NUMERIC(15,2);
    v_net NUMERIC(15,2);
    v_status VARCHAR(50);
    v_names TEXT[] := ARRAY[
        'Sunita Deshmukh', 'Rajesh Nair', 'Pooja Sharma', 'Aditya Singhal', 'Neha Gupta',
        'Manoj Tiwari', 'Deepak Joshi', 'Swati Mishra', 'Nikhil Reddy', 'Tanvi Mehta',
        'Siddharth Jain', 'Kavita Iyer', 'Manish Pandey', 'Shreya Banerjee', 'Abhishek Sengupta',
        'Radhika Menon', 'Gaurav Kulkarni', 'Preeti Chauhan', 'Varun Malhotra', 'Ankita Saxena',
        'Tarun Bhatia', 'Ritu Agarwal', 'Suresh Pillai', 'Bhavna Dave', 'Harish Chander',
        'Lavanya Krishnamurthy', 'Alok Nath', 'Richa Roy', 'Kunal Kapoor', 'Simran Kaur'
    ];
    v_types TEXT[] := ARRAY['Full Time', 'Full Time', 'Full Time', 'Contract', 'Part Time', 'Intern'];
BEGIN
    FOR i IN 11..248 LOOP
        v_emp_num := 10 + i;
        v_emp_id := 'EMP-' || LPAD(v_emp_num::TEXT, 3, '0');
        v_emp_name := v_names[((i - 11) % array_length(v_names, 1)) + 1] || ' ' || (i / 30 + 1)::TEXT;
        v_type := v_types[((i - 11) % array_length(v_types, 1)) + 1];
        
        -- Vary CTC realistically between 2.4L and 12L
        v_ctc := 240000 + ((i * 37000) % 960000);
        
        -- LOP variations
        IF (i % 7 = 0) THEN
            v_lop := 1;
        ELSIF (i % 13 = 0) THEN
            v_lop := 2;
        ELSIF (i % 23 = 0) THEN
            v_lop := 3;
        ELSE
            v_lop := 0;
        END IF;
        
        v_pd := v_wd - v_lop;
        v_basic := ROUND((v_ctc / 12.0) * 0.50 * (v_pd::NUMERIC / v_wd::NUMERIC), 2);
        v_hra := ROUND((v_ctc / 12.0) * 0.25 * (v_pd::NUMERIC / v_wd::NUMERIC), 2);
        v_allow := ROUND((v_ctc / 12.0) * 0.10 * (v_pd::NUMERIC / v_wd::NUMERIC), 2);
        v_gross := v_basic + v_hra + v_allow;
        v_deduct := ROUND(v_gross * 0.08, 2);
        v_net := v_gross - v_deduct;

        -- Exactly 12 pending records to match KPI "Pending Payrolls: 12"
        IF i >= 237 THEN
            v_status := 'Pending';
        ELSIF (i % 19 = 0) THEN
            v_status := 'Processing';
        ELSE
            v_status := 'Paid';
        END IF;

        INSERT INTO public.hr_payroll_records (
            payroll_id, payroll_month, employee_id, employee_name, employment_type,
            monthly_ctc, working_days, paid_days, lop_days,
            basic_pay, hra, allowances, gross_salary, deductions, net_salary,
            payment_status, payment_date, bank_name, bank_account
        )
        VALUES (
            'PAY-202610-' || LPAD(i::TEXT, 3, '0'),
            'Oct 2026',
            v_emp_id,
            v_emp_name,
            v_type,
            v_ctc,
            v_wd,
            v_pd,
            v_lop,
            v_basic,
            v_hra,
            v_allow,
            v_gross,
            v_deduct,
            v_net,
            v_status,
            CASE WHEN v_status = 'Paid' THEN '2026-10-31'::DATE ELSE NULL END,
            'HDFC Bank',
            'XXXXXXXX' || LPAD((1000 + i)::TEXT, 4, '0')
        )
        ON CONFLICT (payroll_id) DO NOTHING;
    END LOOP;
END $$;

-- 7. Initialize atomic sequence counter to 248
INSERT INTO public.hr_payroll_counters (prefix, current_val)
VALUES ('PAY-202610', 248)
ON CONFLICT (prefix) DO UPDATE
SET current_val = GREATEST(public.hr_payroll_counters.current_val, 248),
    updated_at = NOW();

