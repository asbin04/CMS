export interface RawSalesRecord {
  id: string;
  type: 'lead' | 'opportunity' | 'proposal' | 'contract';
  title: string;
  value: number;
  probability?: number; // 0 to 1
  status: string; // e.g., 'open', 'won', 'lost', 'accepted', 'active'
  date: string;
}

export interface SalesKpiData {
  totalLeads: number;
  totalOpportunities: number;
  totalProposalsValue: number;
  formattedProposalsValue: string;
  activeContracts: number;
}

export interface LeadsPerformanceData {
  totalLeads: number;
  openLeads: number;
  wonLeads: number;
  lostLeads: number;
  leadWonPct: number;
  formattedTotalLeads: string;
  formattedOpenLeads: string;
  formattedWonLeads: string;
  formattedLeadWonPct: string;
}

export interface OpportunitiesPerformanceData {
  totalOpportunities: number;
  openOpportunities: number;
  pipelineValue: number;
  weightedPipeline: number;
  wonOpportunityValue: number;
  formattedTotalOpportunities: string;
  formattedOpenOpportunities: string;
  formattedPipelineValue: string;
  formattedWeightedPipeline: string;
  formattedWonOpportunityValue: string;
}

export interface ProposalPerformanceData {
  totalProposalValue: number;
  acceptedProposalValue: number;
  proposalWinRate: number;
  formattedTotalProposalValue: string;
  formattedAcceptedProposalValue: string;
  formattedProposalWinRate: string;
}

export interface ContractPerformanceData {
  activeContracts: number;
  contractedValue: number;
  formattedActiveContracts: string;
  formattedContractedValue: string;
}

export interface SalesPerformanceData {
  leads: LeadsPerformanceData;
  opportunities: OpportunitiesPerformanceData;
  proposals: ProposalPerformanceData;
  contracts: ContractPerformanceData;
}

export interface FunnelStageData {
  id: string;
  label: string;
  sublabel: string;
  value: number;
  color: string;
  textColor: string;
  subtextColor: string;
}

export interface ConversionOverviewData {
  leadToOpportunity: string;
  opportunityToProposal: string;
  proposalToContract: string;
  overallConversion: string;
  rawLeadToOpportunity: number;
  rawOpportunityToProposal: number;
  rawProposalToContract: number;
  rawOverallConversion: number;
}

export interface WorkflowStageData {
  id: string;
  title: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
}

export interface SalesDashboardData {
  period: string;
  lastUpdated: string;
  kpis: SalesKpiData;
  performance: SalesPerformanceData;
  funnelStages: FunnelStageData[];
  conversion: ConversionOverviewData;
  workflowStages: WorkflowStageData[];
}

export interface SalesDashboardQueryParams {
  period?: string;
  startDate?: string;
  endDate?: string;
}


