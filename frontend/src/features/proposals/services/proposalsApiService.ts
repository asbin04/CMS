import { apiRequest } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { triggerNotificationRefresh } from '@/services/notificationService';
import { triggerSalesDataRefresh } from '@/features/sales/services/salesEventBus';
import {
  Proposal,
  ProposalStatus,
  ProposalQueryParams,
  ProposalKpiSummary,
  PageResponse,
  CreateProposalPayload,
} from '../types';
import { exportProposalsToCsv } from '../utils';

export const proposalsApiService = {
  /**
   * 1. Fetch paginated, filtered, and sorted proposals from Spring Boot backend.
   */
  async getProposals(params: ProposalQueryParams = {}): Promise<PageResponse<Proposal>> {
    const query = new URLSearchParams();
    if (params.search && params.search.trim()) query.set('search', params.search.trim());
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.ownerId && params.ownerId !== 'All') query.set('ownerId', params.ownerId);
    if (params.clientId && params.clientId !== 'All') query.set('clientId', params.clientId);
    if (params.opportunityId && params.opportunityId !== 'All') query.set('opportunityId', params.opportunityId);
    if (params.serviceId && params.serviceId !== 'All') query.set('serviceId', params.serviceId);
    if (params.proposalDateRange && params.proposalDateRange !== 'All Dates') query.set('proposalDateRange', params.proposalDateRange);
    if (params.validUntilRange && params.validUntilRange !== 'All Dates') query.set('validUntilRange', params.validUntilRange);
    if (params.expectedDecisionDateRange && params.expectedDecisionDateRange !== 'All Dates') query.set('expectedDecisionDateRange', params.expectedDecisionDateRange);
    if (params.sortOption) query.set('sort', params.sortOption);
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));

    const url = `${API_ENDPOINTS.PROPOSALS.BASE}?${query.toString()}`;
    return await apiRequest<PageResponse<Proposal>>(url);
  },

  /**
   * 1b. Fetch all filtered proposals without pagination slicing (for full CSV exports).
   */
  async getAllFilteredProposals(params: ProposalQueryParams = {}): Promise<Proposal[]> {
    const res = await this.getProposals({ ...params, page: 1, size: 10000 });
    return res.content;
  },

  /**
   * 2. Fetch single proposal by ID from Spring Boot backend.
   */
  async getProposalById(id: string): Promise<Proposal> {
    return await apiRequest<Proposal>(API_ENDPOINTS.PROPOSALS.BY_ID(id));
  },

  /**
   * 3. Create a new proposal with backend validation and persistence.
   */
  async createProposal(payload: CreateProposalPayload): Promise<Proposal> {
    const res = await apiRequest<Proposal>(API_ENDPOINTS.PROPOSALS.BASE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    triggerNotificationRefresh();
    triggerSalesDataRefresh('proposal');
    return res;
  },

  /**
   * 4. Update status for a proposal (Sent, Pending, Approved, In Review, Rejected).
   */
  async updateStatus(id: string, status: ProposalStatus): Promise<Proposal> {
    const res = await apiRequest<Proposal>(API_ENDPOINTS.PROPOSALS.STATUS(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    triggerNotificationRefresh();
    triggerSalesDataRefresh('proposal');
    return res;
  },

  /**
   * 4b. Update proposal details (Draft or Pending).
   */
  async updateProposal(id: string, payload: Partial<CreateProposalPayload>): Promise<Proposal> {
    const res = await apiRequest<Proposal>(API_ENDPOINTS.PROPOSALS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    triggerNotificationRefresh();
    triggerSalesDataRefresh('proposal');
    return res;
  },

  /**
   * 4c. Delete proposal (Draft only).
   */
  async deleteProposal(id: string): Promise<void> {
    await apiRequest<void>(API_ENDPOINTS.PROPOSALS.BY_ID(id), {
      method: 'DELETE',
    });
    triggerNotificationRefresh();
    triggerSalesDataRefresh('proposal');
  },

  /**
   * 5. Calculate consistent KPI summary from proposals dataset.
   */
  async getKpis(): Promise<ProposalKpiSummary> {
    return await apiRequest<ProposalKpiSummary>(API_ENDPOINTS.PROPOSALS.KPIS);
  },

  /**
   * 6. Generate next suggested Proposal ID from backend sequence.
   */
  async getNextProposalId(): Promise<string> {
    const res = await apiRequest<{ nextId: string }>(API_ENDPOINTS.PROPOSALS.NEXT_ID);
    return res.nextId;
  },

  /**
   * 7. Fetch distinct filter options from database.
   */
  async getFilterOptions(): Promise<{
    owners: string[];
    clients: string[];
    opportunities: string[];
    services: string[];
  }> {
    return await apiRequest<{
      owners: string[];
      clients: string[];
      opportunities: string[];
      services: string[];
    }>(API_ENDPOINTS.PROPOSALS.FILTERS);
  },

  /**
   * 8. Export proposals to CSV.
   */
  exportToCsv(data: Proposal[], filename?: string): void {
    exportProposalsToCsv(data, filename);
  },
};
