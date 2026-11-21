-- ==============================================================================
-- File: backend/scripts/clear_all_data.sql
-- Description: Standalone, idempotent database cleanup script for Company Management System.
--              Truncates all business, transaction, demo, and seed tables while preserving
--              application schemas, valid accounts in app_users, user_settings,
--              dashboard_settings, and flyway_schema_history.
-- Execution: psql -h <host> -U <user> -d <db> -f backend/scripts/clear_all_data.sql
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. TRUNCATE ALL BUSINESS, TRANSACTION, AND DEMO DATA TABLES
--    Using RESTART IDENTITY to automatically reset all attached serial/identity
--    sequences to 1, and CASCADE to handle foreign key dependencies cleanly.
-- ------------------------------------------------------------------------------

TRUNCATE TABLE
    -- Support & AMC
    public.support_tickets,
    public.amc_sla_contracts,

    -- Projects & Delivery Submodules
    public.project_deployments,
    public.project_uats,
    public.project_developments,
    public.uiux_designs,
    public.project_timesheets,
    public.project_requirements,
    public.project_tasks,
    public.projects,

    -- Sales & CRM
    public.contracts,
    public.proposals,
    public.opportunities,
    public.leads,

    -- Clients
    public.clients,

    -- Finance & Expenses
    public.finance_payments,
    public.finance_cash_flows,
    public.expenses,
    public.finance_targets,

    -- Collections & Invoices
    public.collections_payment_reversals,
    public.collection_communications,
    public.collections_payments,
    public.collections_invoices,

    -- HR & People
    public.employee_exit_records,
    public.hr_payroll_records,
    public.leaves,
    public.attendance,
    public.hr_candidates,
    public.hr_activities,
    public.employees,

    -- Approvals, Follow-Up Queue & Notifications
    public.client_approvals,
    public.employee_approvals,
    public.ticket_asset_approvals,
    public.follow_up_queue,
    public.portal_notifications,

    -- Pre-calculated Dashboard Demo & Summary Tables
    public.dashboard_kpi_cards,
    public.finance_monthly,
    public.expense_breakdown,
    public.sales_pipeline_stages,
    public.project_status_distribution,
    public.people_monthly,
    public.people_summary,
    public.management_alerts,
    public.hr_summary,

    -- Transient Security Sessions & History (Excludes app_users)
    public.password_reset_otps,
    public.user_login_history,
    public.user_sessions
RESTART IDENTITY CASCADE;

-- ------------------------------------------------------------------------------
-- 2. RESET BUSINESS SEQUENCE / ID COUNTER TABLES
--    Resets all 10 dedicated counter tables so new user-entered entities start
--    cleanly from sequence 1 (or initial prefix state) without collisions.
-- ------------------------------------------------------------------------------

-- Collections Counters
TRUNCATE TABLE public.collections_invoice_counters;
TRUNCATE TABLE public.collections_payment_counters;
TRUNCATE TABLE public.collections_reversal_counters;

-- CRM & Sales Counters
TRUNCATE TABLE public.lead_counters;
TRUNCATE TABLE public.proposals_counters;

-- HR & Exit Counters
TRUNCATE TABLE public.employee_exit_counters;
TRUNCATE TABLE public.hr_payroll_counters;

-- Finance Counters
TRUNCATE TABLE public.finance_payment_counter;
TRUNCATE TABLE public.finance_cash_flow_counters;

-- Project Module Counters
TRUNCATE TABLE public.project_module_counters;

-- ------------------------------------------------------------------------------
-- 3. RESET DASHBOARD SETTINGS ROW TO CLEAN DEFAULT
--    Preserves the dashboard_settings record structure, but cleans out demo
--    names/roles so user identity is derived exclusively from the live session.
-- ------------------------------------------------------------------------------

UPDATE public.dashboard_settings
SET
    company_name = 'Kalpanaaa Software Solutions',
    dashboard_title = 'Admin Dashboard',
    dashboard_subtitle = 'Overview & Live Business Analytics',
    active_date_range = 'All Time',
    last_updated = 'Just now',
    user_name = NULL,
    user_role = NULL
WHERE id = 1;

-- If no settings row exists yet, initialize a single clean default record
INSERT INTO public.dashboard_settings (
    id, company_name, dashboard_title, dashboard_subtitle, active_date_range, last_updated, user_name, user_role
)
VALUES (
    1, 'Kalpanaaa Software Solutions', 'Admin Dashboard', 'Overview & Live Business Analytics', 'All Time', 'Just now', NULL, NULL
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. VERIFY EXCLUSIONS
--    - public.app_users is UNTOUCHED (Admin users preserved).
--    - public.user_settings is UNTOUCHED.
--    - public.flyway_schema_history is UNTOUCHED.
-- ------------------------------------------------------------------------------

COMMIT;

