-- V32__enhance_expenses_table_and_seed_data.sql
-- Description: Enhance public.expenses table with full expense tracking attributes and seed calibrated 124 records matching design

DO $$
BEGIN
    -- Add columns if not present
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'expense_code') THEN
        ALTER TABLE public.expenses ADD COLUMN expense_code VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'vendor_id') THEN
        ALTER TABLE public.expenses ADD COLUMN vendor_id VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'project_id') THEN
        ALTER TABLE public.expenses ADD COLUMN project_id VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'employee_id') THEN
        ALTER TABLE public.expenses ADD COLUMN employee_id VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'amount_before_tax') THEN
        ALTER TABLE public.expenses ADD COLUMN amount_before_tax NUMERIC(14, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'tax_amount') THEN
        ALTER TABLE public.expenses ADD COLUMN tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'total_amount') THEN
        ALTER TABLE public.expenses ADD COLUMN total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'payment_mode') THEN
        ALTER TABLE public.expenses ADD COLUMN payment_mode VARCHAR(50) NOT NULL DEFAULT 'Card';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'status') THEN
        ALTER TABLE public.expenses ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Approved';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'approved_by') THEN
        ALTER TABLE public.expenses ADD COLUMN approved_by VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'month_label') THEN
        ALTER TABLE public.expenses ADD COLUMN month_label VARCHAR(50) NOT NULL DEFAULT 'Oct 2026';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'expense_bucket') THEN
        ALTER TABLE public.expenses ADD COLUMN expense_bucket VARCHAR(50) NOT NULL DEFAULT 'Operational';
    END IF;
END $$;

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_expenses_expense_code ON public.expenses(expense_code);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON public.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_month_label ON public.expenses(month_label);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor_id ON public.expenses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_expenses_employee_id ON public.expenses(employee_id);

-- Clean old placeholder expenses if any
DELETE FROM public.expenses;

-- Insert the 10 exact rows from Figma screenshots
INSERT INTO public.expenses (
    expense_code, expense_date, category, vendor_id, project_id, employee_id, description,
    amount_before_tax, tax_amount, total_amount, amount, payment_mode, status, approved_by,
    month_label, expense_bucket, is_project_expense, project_label, created_by
) VALUES
('EXP-2026-0483', '2026-10-28', 'Software', 'VEN-001', 'PRJ-001', 'EMP-014', 'Figma annual license renewal', 25000.00, 4500.00, 29500.00, 29500.00, 'Card', 'Approved', 'Rohan Verma', 'Oct 2026', 'Operational', TRUE, 'PRJ-001', 'EMP-014'),
('EXP-2026-0482', '2026-10-27', 'Travel', 'VEN-014', 'PRJ-002', 'EMP-009', 'Client meeting travel (Bangalore)', 12000.00, 2160.00, 14160.00, 14160.00, 'UPI', 'Approved', 'Sneha Nair', 'Oct 2026', 'Project', TRUE, 'PRJ-002', 'EMP-009'),
('EXP-2026-0481', '2026-10-27', 'Utilities', 'VEN-006', NULL, 'EMP-003', 'Office internet bill – Oct', 8500.00, 1530.00, 10030.00, 10030.00, 'Net Banking', 'Pending', NULL, 'Oct 2026', 'Operational', FALSE, NULL, 'EMP-003'),
('EXP-2026-0480', '2026-10-26', 'Office Supplies', 'VEN-011', NULL, 'EMP-012', 'Stationery and printing', 4200.00, 756.00, 4956.00, 4956.00, 'Card', 'Approved', 'Amit Sharma', 'Oct 2026', 'General', FALSE, NULL, 'EMP-012'),
('EXP-2026-0479', '2026-10-25', 'Hardware', 'VEN-004', 'PRJ-003', 'EMP-007', 'External monitor for design team', 18000.00, 3240.00, 21240.00, 21240.00, 'Net Banking', 'Rejected', 'Divya Patel', 'Oct 2026', 'Capital', TRUE, 'PRJ-003', 'EMP-007'),
('EXP-2026-0478', '2026-10-24', 'Marketing', 'VEN-008', 'PRJ-003', 'EMP-015', 'Event booth and branding materials', 32000.00, 5760.00, 37760.00, 37760.00, 'UPI', 'Approved', 'Vikram Shah', 'Oct 2026', 'Marketing', TRUE, 'PRJ-003', 'EMP-015'),
('EXP-2026-0477', '2026-10-24', 'Software', 'VEN-002', NULL, 'EMP-005', 'Cloud storage subscription', 7200.00, 1296.00, 8496.00, 8496.00, 'Card', 'Approved', 'Rohan Verma', 'Oct 2026', 'Operational', FALSE, NULL, 'EMP-005'),
('EXP-2026-0476', '2026-10-23', 'Travel', 'VEN-015', 'PRJ-004', 'EMP-010', 'Onsite support travel (Chennai)', 15000.00, 2700.00, 17700.00, 17700.00, 'Net Banking', 'Pending', NULL, 'Oct 2026', 'Project', TRUE, 'PRJ-004', 'EMP-010'),
('EXP-2026-0475', '2026-10-22', 'Training', 'VEN-010', NULL, 'EMP-013', 'UI/UX workshop registration', 10000.00, 1800.00, 11800.00, 11800.00, 'UPI', 'Approved', 'Sneha Nair', 'Oct 2026', 'People', FALSE, NULL, 'EMP-013'),
('EXP-2026-0474', '2026-10-21', 'Other', 'VEN-018', 'PRJ-005', 'EMP-006', 'Miscellaneous project expenses', 6500.00, 1170.00, 7670.00, 7670.00, 'Cash', 'Approved', 'Amit Sharma', 'Oct 2026', 'Others', TRUE, 'PRJ-005', 'EMP-006');

-- Generate remaining 114 rows to reach 124 records with realistic variation
DO $$
DECLARE
    i INT;
    cur_code VARCHAR(50);
    cur_date DATE;
    cats TEXT[] := ARRAY['Software', 'Travel', 'Utilities', 'Office Supplies', 'Hardware', 'Marketing', 'Training', 'Other'];
    vendors TEXT[] := ARRAY['VEN-001', 'VEN-002', 'VEN-003', 'VEN-004', 'VEN-005', 'VEN-006', 'VEN-007', 'VEN-008', 'VEN-010', 'VEN-011', 'VEN-014', 'VEN-015', 'VEN-018'];
    projects TEXT[] := ARRAY['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005', NULL, NULL];
    employees TEXT[] := ARRAY['EMP-001', 'EMP-003', 'EMP-005', 'EMP-006', 'EMP-007', 'EMP-009', 'EMP-010', 'EMP-012', 'EMP-013', 'EMP-014', 'EMP-015'];
    descs TEXT[] := ARRAY[
        'Monthly API integration fees', 'Client site deployment travel', 'Server electricity and cooling',
        'Office coffee and pantry essentials', 'Developer laptops maintenance', 'Digital marketing ads campaign',
        'Agile certification course', 'Courier and freight logistics', 'Database backup storage', 'Customer demo licenses'
    ];
    modes TEXT[] := ARRAY['Card', 'UPI', 'Net Banking', 'Cash'];
    statuses TEXT[] := ARRAY['Approved', 'Approved', 'Approved', 'Pending', 'Rejected'];
    approvers TEXT[] := ARRAY['Rohan Verma', 'Sneha Nair', 'Amit Sharma', 'Divya Patel', 'Vikram Shah'];
    months TEXT[] := ARRAY['Oct 2026', 'Sep 2026', 'Aug 2026', 'Jul 2026', 'Jun 2026', 'May 2026'];
    buckets TEXT[] := ARRAY['Operational', 'Project', 'General', 'Capital', 'Marketing', 'People', 'Others'];
    v_cat VARCHAR(100);
    v_vendor VARCHAR(50);
    v_project VARCHAR(50);
    v_emp VARCHAR(50);
    v_desc TEXT;
    v_mode VARCHAR(50);
    v_status VARCHAR(50);
    v_approver VARCHAR(100);
    v_month VARCHAR(50);
    v_bucket VARCHAR(50);
    v_before NUMERIC(14,2);
    v_tax NUMERIC(14,2);
    v_total NUMERIC(14,2);
BEGIN
    FOR i IN 1..114 LOOP
        cur_code := 'EXP-2026-' || LPAD((473 - i + 1)::TEXT, 4, '0');
        cur_date := '2026-10-20'::DATE - (i || ' days')::INTERVAL;
        v_cat := cats[1 + ((i * 3) % array_length(cats, 1))];
        v_vendor := vendors[1 + ((i * 5) % array_length(vendors, 1))];
        v_project := projects[1 + ((i * 7) % array_length(projects, 1))];
        v_emp := employees[1 + ((i * 2) % array_length(employees, 1))];
        v_desc := descs[1 + (i % array_length(descs, 1))];
        v_mode := modes[1 + (i % array_length(modes, 1))];
        v_status := statuses[1 + (i % array_length(statuses, 1))];
        IF v_status = 'Approved' THEN
            v_approver := approvers[1 + (i % array_length(approvers, 1))];
        ELSEIF v_status = 'Rejected' THEN
            v_approver := approvers[1 + ((i + 2) % array_length(approvers, 1))];
        ELSE
            v_approver := NULL;
        END IF;
        v_month := months[1 + ((i / 20) % array_length(months, 1))];
        v_bucket := buckets[1 + (i % array_length(buckets, 1))];
        v_before := 3000.00 + ((i * 370) % 35000);
        v_tax := ROUND(v_before * 0.18, 2);
        v_total := v_before + v_tax;

        INSERT INTO public.expenses (
            expense_code, expense_date, category, vendor_id, project_id, employee_id, description,
            amount_before_tax, tax_amount, total_amount, amount, payment_mode, status, approved_by,
            month_label, expense_bucket, is_project_expense, project_label, created_by
        ) VALUES (
            cur_code, cur_date, v_cat, v_vendor, v_project, v_emp, v_desc,
            v_before, v_tax, v_total, v_total, v_mode, v_status, v_approver,
            v_month, v_bucket, (v_project IS NOT NULL), v_project, v_emp
        );
    END LOOP;
END $$;

