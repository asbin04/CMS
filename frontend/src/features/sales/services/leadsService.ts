import { apiClient } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../services/api/apiEndpoints';
import { triggerNotificationRefresh } from '../../../services/notificationService';
import { triggerSalesDataRefresh } from './salesEventBus';
import { Lead, LeadsMetrics, LeadSummaryDto } from '../types/leads';

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

function formatMoMTrend(val: number | null | undefined): string | null {
  if (val == null) return null;
  const arrow = val >= 0 ? '↑' : '↓';
  const abs = Math.abs(val);
  return `${arrow} ${abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(1)}% vs last month`;
}

export const leadsService = {
  // Fetch leads directly from backend Spring Boot API
  async getLeads(params?: {
    search?: string;
    stage?: string;
    status?: string;
    ownerId?: string;
    source?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<Lead[]> {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 0,
      size: params?.size ?? 100,
    };
    if (params?.search) queryParams.search = params.search;
    if (params?.stage && params.stage !== 'All') queryParams.stage = params.stage;
    if (params?.status && params.status !== 'All') queryParams.status = params.status;
    if (params?.ownerId && params.ownerId !== 'All') queryParams.ownerId = params.ownerId;
    if (params?.source && params.source !== 'All') queryParams.source = params.source;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortDir) queryParams.sortDir = params.sortDir;

    const res = await apiClient.get<PageResponse<Lead>>(API_ENDPOINTS.LEADS.BASE, queryParams);
    return res.data?.content || [];
  },

  // Fetch paginated leads from backend
  async getLeadsPaginated(params?: Record<string, string | number | boolean | undefined | null>): Promise<PageResponse<Lead>> {
    const res = await apiClient.get<PageResponse<Lead>>(API_ENDPOINTS.LEADS.BASE, params);
    return res.data;
  },

  // Fetch real summary KPI metrics from backend API
  async getSummary(): Promise<LeadsMetrics> {
    const res = await apiClient.get<LeadSummaryDto>(API_ENDPOINTS.LEADS.SUMMARY);
    const data = res.data;

    return {
      totalLeads: data.totalLeads,
      totalLeadsTrend: formatMoMTrend(data.totalLeadsMoM),
      newLeads: data.newThisMonth,
      newLeadsTrend: formatMoMTrend(data.newLeadsMoM),
      followUpsDue: data.followUpsDue,
      followUpsDueTrend: formatMoMTrend(data.followUpsDueMoM),
      convertedLeads: data.convertedLeads,
      convertedLeadsTrend: formatMoMTrend(data.convertedMoM),
      lastUpdated: data.lastUpdated ?? null,
    };
  },

  // Create a new lead directly via Spring Boot backend API
  async addLead(newLeadData: Omit<Lead, 'id'>): Promise<Lead> {
    const res = await apiClient.post<Lead>(API_ENDPOINTS.LEADS.BASE, newLeadData);
    triggerNotificationRefresh();
    triggerSalesDataRefresh('lead');
    return res.data;
  },

  // Update lead via Spring Boot backend API
  async updateLead(updatedLead: Lead): Promise<Lead> {
    const res = await apiClient.put<Lead>(
      API_ENDPOINTS.LEADS.BY_ID(updatedLead.id),
      updatedLead
    );
    triggerNotificationRefresh();
    triggerSalesDataRefresh('lead');
    return res.data;
  },

  // Delete lead via Spring Boot backend API
  async deleteLead(id: string): Promise<void> {
    await apiClient.delete<void>(API_ENDPOINTS.LEADS.BY_ID(id));
    triggerNotificationRefresh();
    triggerSalesDataRefresh('lead');
  },

  // Export current list to CSV
  exportToCSV(leads: Lead[], filename = 'Kalpanaaa_CRM_Leads.csv'): void {
    const headers = [
      'Lead ID',
      'Lead Date',
      'Company',
      'Contact Name',
      'Email',
      'Phone',
      'Source',
      'Service Interest',
      'Country',
      'City',
      'Owner ID',
      'Stage',
      'Status',
      'Next Follow-up',
      'Estimated Value',
      'Notes',
    ];

    const escapeCsv = (val?: unknown) => {
      if (val == null) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = leads.map((l) => [
      escapeCsv(l.id),
      escapeCsv(l.leadDate),
      escapeCsv(l.company),
      escapeCsv(l.contactName),
      escapeCsv(l.email),
      escapeCsv(l.phone),
      escapeCsv(l.source),
      escapeCsv(l.serviceInterest),
      escapeCsv(l.country),
      escapeCsv(l.city),
      escapeCsv(l.ownerId),
      escapeCsv(l.stage),
      escapeCsv(l.status),
      escapeCsv(l.nextFollowUp),
      escapeCsv(l.estimatedValue),
      escapeCsv(l.notes),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
