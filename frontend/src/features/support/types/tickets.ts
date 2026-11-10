export interface SupportTicketItem {
  id: number;
  ticketCode: string;
  clientId: string;
  clientName?: string;
  projectId: string;
  projectName?: string;
  amcSlaId?: string;
  openedDate: string;
  ticketType: string;
  priority: 'High' | 'Medium' | 'Low' | 'Urgent' | string;
  issueRequest: string;
  description?: string;
  assignedTo: string;
  assignedToEmail?: string;
  status: 'In Progress' | 'Pending' | 'Resolved' | 'Closed' | 'Open' | string;
  channel: string;
  resolutionTime?: string;
  slaDueDate?: string;
  slaStatus: 'Within SLA' | 'At Risk' | 'Breached' | string;
  firstResponseDate?: string;
  resolvedDate?: string;
  responseHours?: string;
  resolutionHours?: string;
  responseSlaTarget?: string;
  resolutionSlaTarget?: string;
  customerConfirmation?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportTicketKpis {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  slaBreaches: number;
  slaCompliance: number;
  slaComplianceFormatted: string;
}

export interface SupportTicketFilterOptions {
  ticketTypes: string[];
  priorities: string[];
  statuses: string[];
  slaStatuses: string[];
}

export interface CreateSupportTicketPayload {
  clientId: string;
  clientName?: string;
  projectId: string;
  projectName?: string;
  amcSlaId?: string;
  openedDate: string;
  ticketType: string;
  priority: string;
  issueRequest: string;
  description?: string;
  assignedTo: string;
  assignedToEmail?: string;
  status?: string;
  channel?: string;
  resolutionTime?: string;
  slaDueDate?: string;
  slaStatus?: string;
  notes?: string;
  customerConfirmation?: string;
}

export interface UpdateSupportTicketPayload extends Partial<CreateSupportTicketPayload> {}

export interface VolumeTrendItem {
  month: string;
  resolved: number;
  inProgress: number;
  pending: number;
  total: number;
}

export interface SlaPerformanceData {
  complianceRate: number;
  withinSlaCount: number;
  withinSlaPercentage: number;
  slaBreachCount: number;
  slaBreachPercentage: number;
  improvementNote: string;
}

export interface TypeBreakdownItem {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

export interface PriorityDistributionItem {
  priority: string;
  count: number;
  color: string;
}

export interface SupportTicketTrendsData {
  totalTickets: number;
  totalTicketsTrend: string;
  resolutionRate: number;
  resolutionRateTrend: string;
  avgResponseHours: string;
  avgResponseHoursTrend: string;
  avgResolutionHours: string;
  avgResolutionHoursTrend: string;
  slaCompliance: number;
  slaComplianceTrend: string;

  volumeTrends: VolumeTrendItem[];
  slaPerformance: SlaPerformanceData;
  typeBreakdown: TypeBreakdownItem[];
  priorityDistribution: PriorityDistributionItem[];
  keyInsights: string[];
}

