export interface SalesKpiData {
  totalLeads: number;
  totalOpportunities: number;
  totalProposalsValue: string;
  activeContracts: number;
}

export interface LeadsPerformanceData {
  totalLeads: string;
  openLeads: string;
  wonLeads: string;
  leadWonPct: string;
}

export interface OpportunitiesPerformanceData {
  totalOpportunities: string;
  openOpportunities: string;
  pipelineValue: string;
  weightedPipeline: string;
  wonOpportunityValue: string;
}

export interface ProposalPerformanceData {
  totalProposalValue: string;
  acceptedProposalValue: string;
  proposalWinRate: string;
}

export interface ContractPerformanceData {
  activeContracts: string;
  contractedValue: string;
}

export interface SalesPerformanceData {
  leads: LeadsPerformanceData;
  opportunities: OpportunitiesPerformanceData;
  proposals: ProposalPerformanceData;
  contracts: ContractPerformanceData;
}

export interface FunnelStage {
  id: string;
  label: string;
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
}

export interface WorkflowStage {
  id: string;
  title: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
}

