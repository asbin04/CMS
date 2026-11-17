import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/apiEndpoints';
import { triggerNotificationRefresh } from './notificationService';
import { triggerSalesDataRefresh } from '../features/sales/services/salesEventBus';
import {
  OpportunityData,
  OpportunitySummaryData,
  CreateOpportunityPayload,
  OpportunityFilters,
} from '@/types/opportunity';

export const opportunityService = {
  getOpportunities: async (filters?: OpportunityFilters): Promise<OpportunityData[]> => {
    const params: Record<string, string | number | undefined> = {};
    if (filters) {
      if (filters.stage && filters.stage !== 'All') params.stage = filters.stage;
      if (filters.status && filters.status !== 'All') params.status = filters.status;
      if (filters.ownerId && filters.ownerId !== 'All') params.ownerId = filters.ownerId;
      if (filters.clientId && filters.clientId !== 'All') params.clientId = filters.clientId;
      if (filters.serviceId && filters.serviceId !== 'All') params.serviceId = filters.serviceId;
      if (filters.search && filters.search.trim()) params.search = filters.search.trim();
    }
    const res = await apiClient.get<OpportunityData[]>(
      API_ENDPOINTS.OPPORTUNITIES.BASE,
      params
    );
    return res.data;
  },

  getSummary: async (): Promise<OpportunitySummaryData> => {
    const res = await apiClient.get<OpportunitySummaryData>(
      API_ENDPOINTS.OPPORTUNITIES.SUMMARY
    );
    return res.data;
  },

  getById: async (id: string | number): Promise<OpportunityData> => {
    const res = await apiClient.get<OpportunityData>(
      API_ENDPOINTS.OPPORTUNITIES.BY_ID(id)
    );
    return res.data;
  },

  createOpportunity: async (
    payload: CreateOpportunityPayload
  ): Promise<OpportunityData> => {
    const res = await apiClient.post<OpportunityData>(
      API_ENDPOINTS.OPPORTUNITIES.BASE,
      payload
    );
    triggerNotificationRefresh();
    triggerSalesDataRefresh('opportunity');
    return res.data;
  },

  updateOpportunity: async (
    id: string | number,
    payload: Partial<CreateOpportunityPayload>
  ): Promise<OpportunityData> => {
    const res = await apiClient.put<OpportunityData>(
      API_ENDPOINTS.OPPORTUNITIES.BY_ID(id),
      payload
    );
    triggerNotificationRefresh();
    triggerSalesDataRefresh('opportunity');
    return res.data;
  },

  deleteOpportunity: async (id: string | number): Promise<void> => {
    await apiClient.delete<void>(API_ENDPOINTS.OPPORTUNITIES.BY_ID(id));
    triggerNotificationRefresh();
    triggerSalesDataRefresh('opportunity');
  },

  resetData: async (): Promise<string> => {
    const res = await apiClient.post<string>(API_ENDPOINTS.OPPORTUNITIES.RESET);
    return res.data;
  },
};

