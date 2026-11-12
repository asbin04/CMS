import { WorkflowStageData } from '../types';

export interface PeriodRawDataset {
  period: string;
  totalLeads: number;
  wonLeads: number;
  lostLeads: number;
  totalOpportunities: number;
  openOpportunities: number;
  opportunitiesList: Array<{ value: number; probability: number }>;
  totalProposalsValue: number;
  acceptedProposalValue: number;
  totalProposalsCount: number;
  acceptedProposalsCount: number;
  activeContractsCount: number;
  contractsList: Array<{ value: number; isActive: boolean }>;
}

export const BASE_PERIOD_DATASETS: Record<string, PeriodRawDataset> = {
  // Default period from designer screenshot: Apr 2024 - Mar 2025
  'Apr 2024 - Mar 2025': {
    period: 'Apr 2024 - Mar 2025',
    totalLeads: 997,
    wonLeads: 0,
    lostLeads: 997, // all converted to opportunity or marked in pipeline
    totalOpportunities: 997,
    openOpportunities: 997,
    opportunitiesList: [], // 0 value pipeline
    totalProposalsValue: 0,
    acceptedProposalValue: 0,
    totalProposalsCount: 0,
    acceptedProposalsCount: 0,
    activeContractsCount: 0,
    contractsList: [],
  },

  'Last 30 Days': {
    period: 'Last 30 Days',
    totalLeads: 120,
    wonLeads: 12,
    lostLeads: 28,
    totalOpportunities: 80,
    openOpportunities: 65,
    opportunitiesList: [
      { value: 250000, probability: 0.7 },
      { value: 400000, probability: 0.5 },
      { value: 150000, probability: 0.9 },
    ],
    totalProposalsValue: 600000,
    acceptedProposalValue: 350000,
    totalProposalsCount: 6,
    acceptedProposalsCount: 3,
    activeContractsCount: 2,
    contractsList: [
      { value: 200000, isActive: true },
      { value: 150000, isActive: true },
    ],
  },

  'This Quarter': {
    period: 'This Quarter',
    totalLeads: 350,
    wonLeads: 45,
    lostLeads: 85,
    totalOpportunities: 220,
    openOpportunities: 175,
    opportunitiesList: [
      { value: 800000, probability: 0.6 },
      { value: 1200000, probability: 0.4 },
      { value: 500000, probability: 0.8 },
    ],
    totalProposalsValue: 1800000,
    acceptedProposalValue: 900000,
    totalProposalsCount: 15,
    acceptedProposalsCount: 7,
    activeContractsCount: 5,
    contractsList: [
      { value: 300000, isActive: true },
      { value: 250000, isActive: true },
      { value: 350000, isActive: true },
    ],
  },
};

export const DEFAULT_WORKFLOW_STAGES: WorkflowStageData[] = [
  {
    id: 'lead',
    title: 'Lead',
    description: 'Capture and qualify potential customers.',
    badgeBg: '#F1E8FE',
    badgeText: '#8B5CF6',
    cardBg: '#F8F5FF',
    cardBorder: '#EDE4FF',
  },
  {
    id: 'opportunity',
    title: 'Opportunity',
    description: 'Develop and pursue qualified business opportunities.',
    badgeBg: '#E2F1FE',
    badgeText: '#0284C7',
    cardBg: '#F0F8FF',
    cardBorder: '#E1F0FD',
  },
  {
    id: 'proposal',
    title: 'Proposal',
    description: 'Create and share commercial proposals with clients.',
    badgeBg: '#FEF3C7',
    badgeText: '#D97706',
    cardBg: '#FFFDF0',
    cardBorder: '#FDF0B5',
  },
  {
    id: 'contract',
    title: 'Contract',
    description: 'Convert accepted proposals into active contracts.',
    badgeBg: '#D7F7E6',
    badgeText: '#059669',
    cardBg: '#F0FBF5',
    cardBorder: '#D5F5E3',
  },
];

