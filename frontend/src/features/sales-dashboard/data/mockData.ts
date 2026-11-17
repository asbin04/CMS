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

export const createEmptyPeriodDataset = (period: string): PeriodRawDataset => ({
  period,
  totalLeads: 0,
  wonLeads: 0,
  lostLeads: 0,
  totalOpportunities: 0,
  openOpportunities: 0,
  opportunitiesList: [],
  totalProposalsValue: 0,
  acceptedProposalValue: 0,
  totalProposalsCount: 0,
  acceptedProposalsCount: 0,
  activeContractsCount: 0,
  contractsList: [],
});

export const BASE_PERIOD_DATASETS: Record<string, PeriodRawDataset> = {
  'Apr 2024 - Mar 2025': createEmptyPeriodDataset('Apr 2024 - Mar 2025'),
  'Last 30 Days': createEmptyPeriodDataset('Last 30 Days'),
  'This Quarter': createEmptyPeriodDataset('This Quarter'),
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
