import { apiClient } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../services/api/apiEndpoints';
import { TransactionControlResponse } from '../types/transactionControl';

export const transactionControlService = {
  getChecks: async (options?: { skipCache?: boolean }): Promise<TransactionControlResponse> => {
    const response = await apiClient.get<TransactionControlResponse>(
      API_ENDPOINTS.REPORTS.TRANSACTION_CONTROL,
      undefined,
      options
    );
    return response.data;
  },

  recheck: async (): Promise<TransactionControlResponse> => {
    const response = await apiClient.post<TransactionControlResponse>(
      API_ENDPOINTS.REPORTS.TRANSACTION_CONTROL_RECHECK
    );
    return response.data;
  },
};
