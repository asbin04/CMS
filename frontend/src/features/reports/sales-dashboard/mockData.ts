import {
  SalesKpiData,
  SalesPerformanceData,
  FunnelStage,
  ConversionOverviewData,
  WorkflowStage,
} from './types';

export const MOCK_SALES_KPIS: SalesKpiData = {
  totalLeads: 997,
  totalOpportunities: 997,
  totalProposalsValue: '₹ 0.00',
  activeContracts: 0,
};

export const MOCK_PERFORMANCE_DATA: SalesPerformanceData = {
  leads: {
    totalLeads: '997.00',
    openLeads: '0.00',
    wonLeads: '0.00',
    leadWonPct: '0.00%',
  },
  opportunities: {
    totalOpportunities: '997.00',
    openOpportunities: '997.00',
    pipelineValue: '₹ 0.00',
    weightedPipeline: '₹ 0.00',
    wonOpportunityValue: '₹ 0.00',
  },
  proposals: {
    totalProposalValue: '₹ 0.00',
    acceptedProposalValue: '₹ 0.00',
    proposalWinRate: '0.00%',
  },
  contracts: {
    activeContracts: '0.00',
    contractedValue: '₹ 0.00',
  },
};

export const MOCK_FUNNEL_STAGES: FunnelStage[] = [
  {
    id: 'leads',
    label: 'LEADS',
    value: 997,
    color: '#4F46E5', // Vivid Indigo
    textColor: '#FFFFFF',
    subtextColor: '#E0E7FF',
  },
  {
    id: 'opportunities',
    label: 'OPPORTUNITIES',
    value: 997,
    color: '#717DF5', // Medium Periwinkle
    textColor: '#FFFFFF',
    subtextColor: '#E0E7FF',
  },
  {
    id: 'proposals',
    label: 'PROPOSALS',
    value: 0,
    color: '#9CA8F7', // Soft Light Periwinkle
    textColor: '#1E293B',
    subtextColor: '#475569',
  },
  {
    id: 'contracts',
    label: 'CONTRACTS',
    value: 0,
    color: '#DCE4FD', // Very Light Lavender
    textColor: '#1E293B',
    subtextColor: '#475569',
  },
];

export const MOCK_CONVERSION_OVERVIEW: ConversionOverviewData = {
  leadToOpportunity: '100.00%',
  opportunityToProposal: '0.00%',
  proposalToContract: '0.00%',
  overallConversion: '0.00%',
};

export const MOCK_WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'lead',
    title: 'Lead',
    description: 'Capture and qualify potential customers.',
    badgeBg: '#FFFFFF',
    badgeText: '#7C3AED',
    cardBg: '#F5F3FF',
    cardBorder: '#DDD6FE',
  },
  {
    id: 'opportunity',
    title: 'Opportunity',
    description: 'Develop and pursue qualified business opportunities.',
    badgeBg: '#FFFFFF',
    badgeText: '#0284C7',
    cardBg: '#F0F9FF',
    cardBorder: '#BAE6FD',
  },
  {
    id: 'proposal',
    title: 'Proposal',
    description: 'Create and share commercial proposals with clients.',
    badgeBg: '#FFFFFF',
    badgeText: '#D97706',
    cardBg: '#FEFCE8',
    cardBorder: '#FEF08A',
  },
  {
    id: 'contract',
    title: 'Contract',
    description: 'Convert accepted proposals into active contracts.',
    badgeBg: '#FFFFFF',
    badgeText: '#16A34A',
    cardBg: '#F0FDF4',
    cardBorder: '#BBF7D0',
  },
];

