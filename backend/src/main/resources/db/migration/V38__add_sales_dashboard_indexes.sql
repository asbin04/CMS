-- V38__add_sales_dashboard_indexes.sql
-- Description: Composite performance indexes for Sales Dashboard aggregation queries and funnel joins

-- 1. Leads date, status, and stage composite index for date-range cohort filtering
CREATE INDEX IF NOT EXISTS idx_leads_date_status_stage 
    ON public.leads(lead_date, status, stage);

-- 2. Opportunities lead_id foreign reference index for funnel traversal
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id 
    ON public.opportunities(lead_id);

-- 3. Opportunities status, stage, estimated_value index for pipeline performance aggregation
CREATE INDEX IF NOT EXISTS idx_opportunities_status_stage 
    ON public.opportunities(status, stage);

-- 4. Proposals opportunity_id and status index for funnel and win-rate aggregation
CREATE INDEX IF NOT EXISTS idx_proposals_opportunity_status 
    ON public.proposals(opportunity_id, status);

-- 5. Contracts proposal_id index for funnel traversal
CREATE INDEX IF NOT EXISTS idx_contracts_proposal_id 
    ON public.contracts(proposal_id);

-- 6. Contracts status and contract_value index for active contracts aggregation
CREATE INDEX IF NOT EXISTS idx_contracts_status_value 
    ON public.contracts(status, contract_value);

