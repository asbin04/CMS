import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/apiEndpoints';
import { triggerNotificationRefresh } from './notificationService';
import { triggerSalesDataRefresh } from '../features/sales/services/salesEventBus';
import {
  ContractData,
  ContractSummaryData,
  CreateContractPayload,
} from '@/types/contract';

export interface ContractFilters {
  clientId?: string;
  proposalId?: string;
  contractType?: string;
  status?: string;
  search?: string;
}

export const contractService = {
  getContracts: async (filters?: ContractFilters): Promise<ContractData[]> => {
    const params: Record<string, string | number | undefined> = {};
    if (filters) {
      if (filters.clientId && filters.clientId !== 'All') params.clientId = filters.clientId;
      if (filters.proposalId && filters.proposalId !== 'All') params.proposalId = filters.proposalId;
      if (filters.contractType && filters.contractType !== 'All') params.contractType = filters.contractType;
      if (filters.status && filters.status !== 'All') params.status = filters.status;
      if (filters.search && filters.search.trim()) params.search = filters.search.trim();
    }
    const res = await apiClient.get<ContractData[]>(
      API_ENDPOINTS.CONTRACTS.BASE,
      params
    );
    return res.data;
  },

  getSummary: async (): Promise<ContractSummaryData> => {
    const res = await apiClient.get<ContractSummaryData>(
      API_ENDPOINTS.CONTRACTS.SUMMARY
    );
    return res.data;
  },

  getById: async (id: string | number): Promise<ContractData> => {
    const res = await apiClient.get<ContractData>(
      API_ENDPOINTS.CONTRACTS.BY_ID(id)
    );
    return res.data;
  },

  createContract: async (
    payload: CreateContractPayload
  ): Promise<ContractData> => {
    const res = await apiClient.post<ContractData>(
      API_ENDPOINTS.CONTRACTS.BASE,
      payload
    );
    triggerNotificationRefresh();
    triggerSalesDataRefresh('contract');
    return res.data;
  },

  updateContract: async (
    id: string | number,
    payload: Partial<CreateContractPayload>
  ): Promise<ContractData> => {
    const res = await apiClient.put<ContractData>(
      API_ENDPOINTS.CONTRACTS.BY_ID(id),
      payload
    );
    triggerNotificationRefresh();
    triggerSalesDataRefresh('contract');
    return res.data;
  },

  deleteContract: async (id: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CONTRACTS.BY_ID(id));
    triggerNotificationRefresh();
    triggerSalesDataRefresh('contract');
  },

  resetSeedData: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.CONTRACTS.RESET);
  },
};

