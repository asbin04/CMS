export type AmcServiceType =
  | 'Application Support'
  | 'Infrastructure Support'
  | 'Managed Services'
  | 'Technical Support'
  | 'AMC (Overall)';

export type AmcContractStatus =
  | 'Active'
  | 'Expiring'
  | 'Expired'
  | 'Terminated';

export type AmcRenewalAlert =
  | 'Normal'
  | 'Expiring (≤ 30 Days)'
  | 'Renewal Overdue'
  | '-';

export interface AmcSlaContract {
  id: number;
  contractCode: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  serviceType: AmcServiceType | string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  contractValue: number;
  responseSla: string;
  resolutionSla: string;
  coverageHours: string;
  status: AmcContractStatus | string;
  penaltyClause: string;
  renewalAlert: AmcRenewalAlert | string;
  assignedManager: string;
  notes: string;
  daysToRenewal?: number | null;
  renewalWindow?: string;
  owner?: string;
}

export interface AmcSlaKpis {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  renewalOverdueContracts: number;
  totalContractValue: number;
  formattedContractValue?: string;
  renewalDue30Days?: number;
  upcoming31to90Days?: number;
  overdueRenewals?: number;
  greater90Days?: number;
}

export interface AmcSlaFilterOptions {
  serviceTypes: string[];
  statuses: string[];
  renewalAlerts: string[];
  owners?: string[];
  renewalWindows?: string[];
}

export interface CreateAmcSlaContractInput {
  contractCode?: string;
  clientId: string;
  clientName?: string;
  projectId: string;
  projectName?: string;
  serviceType: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  contractValue: number;
  responseSla?: string;
  resolutionSla?: string;
  coverageHours?: string;
  status?: string;
  penaltyClause?: string;
  renewalAlert?: string;
  assignedManager?: string;
  notes?: string;
}

export interface UpdateAmcSlaContractInput extends Partial<CreateAmcSlaContractInput> {}

