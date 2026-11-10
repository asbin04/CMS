import { apiClient } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../services/api/apiEndpoints';
import {
  AmcSlaContract,
  AmcSlaKpis,
  AmcSlaFilterOptions,
  CreateAmcSlaContractInput,
  UpdateAmcSlaContractInput,
} from '../types/amcSla';

export const amcSlaService = {
  async getContracts(filters?: {
    search?: string;
    serviceType?: string;
    status?: string;
    renewalAlert?: string;
    owner?: string;
    renewalWindow?: string;
  }): Promise<AmcSlaContract[]> {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.serviceType && filters.serviceType !== 'All') params.serviceType = filters.serviceType;
    if (filters?.status && filters.status !== 'All') params.status = filters.status;
    if (filters?.renewalAlert && filters.renewalAlert !== 'All') params.renewalAlert = filters.renewalAlert;
    if (filters?.owner && filters.owner !== 'All') params.owner = filters.owner;
    if (filters?.renewalWindow && filters.renewalWindow !== 'All') params.renewalWindow = filters.renewalWindow;

    const res = await apiClient.get<AmcSlaContract[]>(API_ENDPOINTS.SUPPORT.AMC_SLA, params);
    if (Array.isArray(res.data)) {
      return res.data;
    }
    if ((res as any)?.data?.data && Array.isArray((res as any).data.data)) {
      return (res as any).data.data;
    }
    return [];
  },

  async getKpis(): Promise<AmcSlaKpis> {
    const res = await apiClient.get<AmcSlaKpis>(API_ENDPOINTS.SUPPORT.AMC_SLA_KPIS);
    const kpiData = (res as any)?.data?.data || res.data;
    return (
      kpiData || {
        totalContracts: 48,
        activeContracts: 38,
        expiringContracts: 6,
        renewalOverdueContracts: 2,
        totalContractValue: 248500,
        formattedContractValue: '₹ 2,48,500',
      }
    );
  },

  async getFilterOptions(): Promise<AmcSlaFilterOptions> {
    const res = await apiClient.get<AmcSlaFilterOptions>(API_ENDPOINTS.SUPPORT.AMC_SLA_FILTERS);
    const options = (res as any)?.data?.data || res.data;
    return (
      options || {
        serviceTypes: [
          'Application Support',
          'Infrastructure Support',
          'Managed Services',
          'Technical Support',
          'AMC (Overall)',
        ],
        statuses: ['Active', 'Expiring', 'Expired', 'Terminated'],
        renewalAlerts: ['Expiring (≤ 30 Days)', 'Renewal Overdue', 'Normal'],
      }
    );
  },

  async getContractById(id: number | string): Promise<AmcSlaContract | null> {
    const res = await apiClient.get<AmcSlaContract>(API_ENDPOINTS.SUPPORT.AMC_SLA_BY_ID(id));
    return (res as any)?.data?.data || res.data || null;
  },

  async createContract(payload: CreateAmcSlaContractInput): Promise<AmcSlaContract> {
    const res = await apiClient.post<AmcSlaContract>(API_ENDPOINTS.SUPPORT.AMC_SLA, payload);
    return (res as any)?.data?.data || res.data;
  },

  async updateContract(id: number | string, payload: UpdateAmcSlaContractInput): Promise<AmcSlaContract> {
    const res = await apiClient.put<AmcSlaContract>(API_ENDPOINTS.SUPPORT.AMC_SLA_BY_ID(id), payload);
    return (res as any)?.data?.data || res.data;
  },

  async deleteContract(id: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SUPPORT.AMC_SLA_BY_ID(id));
  },
};

