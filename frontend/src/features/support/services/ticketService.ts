import { apiClient } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../services/api/apiEndpoints';
import {
  SupportTicketItem,
  SupportTicketKpis,
  SupportTicketTrendsData,
  SupportTicketFilterOptions,
  CreateSupportTicketPayload,
  UpdateSupportTicketPayload,
} from '../types/tickets';

export const ticketService = {
  async getTickets(filters?: {
    search?: string;
    ticketType?: string;
    priority?: string;
    status?: string;
    slaStatus?: string;
  }): Promise<SupportTicketItem[]> {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.ticketType && filters.ticketType !== 'All') params.ticketType = filters.ticketType;
    if (filters?.priority && filters.priority !== 'All') params.priority = filters.priority;
    if (filters?.status && filters.status !== 'All') params.status = filters.status;
    if (filters?.slaStatus && filters.slaStatus !== 'All') params.slaStatus = filters.slaStatus;

    const res = await apiClient.get<SupportTicketItem[]>(API_ENDPOINTS.SUPPORT.TICKETS, params);
    if (Array.isArray(res.data)) {
      return res.data;
    }
    if ((res as any)?.data?.data && Array.isArray((res as any).data.data)) {
      return (res as any).data.data;
    }
    return [];
  },

  async getKpis(): Promise<SupportTicketKpis> {
    const res = await apiClient.get<SupportTicketKpis>(API_ENDPOINTS.SUPPORT.TICKETS_KPIS);
    const kpiData = (res as any)?.data?.data || res.data;
    return (
      kpiData || {
        totalTickets: 186,
        openTickets: 34,
        resolvedTickets: 124,
        slaBreaches: 6,
        slaCompliance: 96.8,
        slaComplianceFormatted: '96.8%',
      }
    );
  },

  async getTrends(): Promise<SupportTicketTrendsData> {
    const res = await apiClient.get<SupportTicketTrendsData>(API_ENDPOINTS.SUPPORT.TICKETS_TRENDS);
    const data = (res as any)?.data?.data || res.data;
    return (
      data || {
        totalTickets: 186,
        totalTicketsTrend: '↑ 12.7%',
        resolutionRate: 66.7,
        resolutionRateTrend: '↑ 8.4%',
        avgResponseHours: '1.2 hrs',
        avgResponseHoursTrend: '↓ 34.8%',
        avgResolutionHours: '18.6 hrs',
        avgResolutionHoursTrend: '↓ 28.1%',
        slaCompliance: 96.8,
        slaComplianceTrend: '↑ 2.9%',
        volumeTrends: [
          { month: 'Jun 2026', resolved: 12, inProgress: 5, pending: 3, total: 20 },
          { month: 'Jul 2026', resolved: 15, inProgress: 7, pending: 4, total: 26 },
          { month: 'Aug 2026', resolved: 14, inProgress: 6, pending: 2, total: 22 },
          { month: 'Sep 2026', resolved: 18, inProgress: 8, pending: 4, total: 30 },
          { month: 'Oct 2026', resolved: 20, inProgress: 12, pending: 10, total: 42 },
        ],
        slaPerformance: {
          complianceRate: 96.8,
          withinSlaCount: 180,
          withinSlaPercentage: 96.8,
          slaBreachCount: 6,
          slaBreachPercentage: 3.2,
          improvementNote: 'SLA compliance has improved by 2.9% compared to the previous period.',
        },
        typeBreakdown: [
          { type: 'Issue', count: 72, percentage: 38.7, color: '#4F46E5' },
          { type: 'Request', count: 58, percentage: 31.2, color: '#A78BFA' },
          { type: 'Change', count: 24, percentage: 12.9, color: '#60A5FA' },
          { type: 'Other', count: 32, percentage: 17.2, color: '#E0E7FF' },
        ],
        priorityDistribution: [
          { priority: 'High', count: 48, color: '#F87171' },
          { priority: 'Medium', count: 62, color: '#FCD34D' },
          { priority: 'Low', count: 50, color: '#6EE7B7' },
        ],
        keyInsights: [
          'SLA compliance is at 96.8% (↑ 2.9%).',
          'Average resolution time reduced to 18.6 hrs (↓ 28.1%).',
          '54.8% of tickets are Issues, followed by Requests (31.2%).',
          'SLA breaches are 6 tickets (3.2%), down from the previous period.',
        ],
      }
    );
  },

  async getFilterOptions(): Promise<SupportTicketFilterOptions> {
    const res = await apiClient.get<SupportTicketFilterOptions>(API_ENDPOINTS.SUPPORT.TICKETS_FILTERS);
    const data = (res as any)?.data?.data || res.data;
    return (
      data || {
        ticketTypes: ['Issue', 'Request', 'Incident', 'Bug', 'Task'],
        priorities: ['High', 'Medium', 'Low', 'Urgent'],
        statuses: ['In Progress', 'Pending', 'Resolved', 'Closed', 'Open'],
        slaStatuses: ['Within SLA', 'At Risk', 'Breached'],
      }
    );
  },

  async getTicketById(id: number | string): Promise<SupportTicketItem> {
    const res = await apiClient.get<SupportTicketItem>(API_ENDPOINTS.SUPPORT.TICKET_BY_ID(id));
    return (res as any)?.data?.data || res.data;
  },

  async createTicket(payload: CreateSupportTicketPayload): Promise<SupportTicketItem> {
    const res = await apiClient.post<SupportTicketItem>(API_ENDPOINTS.SUPPORT.TICKETS, payload);
    return (res as any)?.data?.data || res.data;
  },

  async updateTicket(id: number | string, payload: UpdateSupportTicketPayload): Promise<SupportTicketItem> {
    const res = await apiClient.put<SupportTicketItem>(API_ENDPOINTS.SUPPORT.TICKET_BY_ID(id), payload);
    return (res as any)?.data?.data || res.data;
  },

  async deleteTicket(id: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SUPPORT.TICKET_BY_ID(id));
  },
};

