import { apiRequest } from '../../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../../services/api/apiEndpoints';
import {
  FinancePaymentRecord,
  FinancePaymentKpiData,
  FinancePaymentFilterOptions,
  RecordPaymentPayload,
  UpdatePaymentPayload,
} from '../types/payments';

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface FetchPaymentsParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  mode?: string;
  client?: string;
  month?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export const paymentsService = {
  /**
   * Fetches paginated, filtered, and sorted Payment records.
   */
  async getPayments(params?: FetchPaymentsParams): Promise<PageResponse<FinancePaymentRecord>> {
    const queryParams = new URLSearchParams();
    if (params?.search && params.search.trim() !== '') {
      queryParams.append('search', params.search.trim());
    }
    if (params?.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    if (params?.status && params.status !== 'All') {
      queryParams.append('status', params.status);
    }
    if (params?.mode && params.mode !== 'All') {
      queryParams.append('mode', params.mode);
    }
    if (params?.client && params.client !== 'All' && params.client !== 'All Clients') {
      queryParams.append('client', params.client);
    }
    if (params?.month && params.month !== 'All') {
      queryParams.append('month', params.month);
    }
    if (params?.sort) {
      queryParams.append('sort', params.sort);
    }
    queryParams.append('page', String(params?.page || 1));
    queryParams.append('size', String(params?.size || 10));

    const endpoint = `${API_ENDPOINTS.FINANCE.PAYMENTS}?${queryParams.toString()}`;
    return apiRequest<PageResponse<FinancePaymentRecord>>(endpoint, { method: 'GET' });
  },

  /**
   * Fetches dynamic KPI summary metrics calculated from the database.
   */
  async getKpis(month?: string): Promise<FinancePaymentKpiData> {
    const query = month && month !== 'All' ? `?month=${encodeURIComponent(month)}` : '';
    return apiRequest<FinancePaymentKpiData>(`${API_ENDPOINTS.FINANCE.PAYMENTS_KPIS}${query}`, { method: 'GET' });
  },

  /**
   * Fetches distinct dropdown filter values directly from the database.
   */
  async getFilterOptions(): Promise<FinancePaymentFilterOptions> {
    return apiRequest<FinancePaymentFilterOptions>(API_ENDPOINTS.FINANCE.PAYMENTS_FILTERS, { method: 'GET' });
  },

  /**
   * Fetches a single payment record by ID.
   */
  async getPaymentById(id: string): Promise<FinancePaymentRecord> {
    return apiRequest<FinancePaymentRecord>(API_ENDPOINTS.FINANCE.PAYMENT_BY_ID(id), { method: 'GET' });
  },

  /**
   * Records a new payment in the database.
   */
  async recordPayment(payload: RecordPaymentPayload): Promise<FinancePaymentRecord> {
    return apiRequest<FinancePaymentRecord>(API_ENDPOINTS.FINANCE.PAYMENTS, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Updates an existing payment record.
   */
  async updatePayment(id: string, payload: UpdatePaymentPayload): Promise<FinancePaymentRecord> {
    return apiRequest<FinancePaymentRecord>(API_ENDPOINTS.FINANCE.PAYMENT_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Deletes a payment record.
   */
  async deletePayment(id: string): Promise<void> {
    return apiRequest<void>(API_ENDPOINTS.FINANCE.PAYMENT_BY_ID(id), { method: 'DELETE' });
  },

  /**
   * Fetches all filtered payments for CSV/Excel export.
   */
  async exportPayments(params?: Omit<FetchPaymentsParams, 'page' | 'size' | 'sort'>): Promise<FinancePaymentRecord[]> {
    const queryParams = new URLSearchParams();
    if (params?.search && params.search.trim() !== '') {
      queryParams.append('search', params.search.trim());
    }
    if (params?.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    if (params?.status && params.status !== 'All') {
      queryParams.append('status', params.status);
    }
    if (params?.mode && params.mode !== 'All') {
      queryParams.append('mode', params.mode);
    }
    if (params?.client && params.client !== 'All' && params.client !== 'All Clients') {
      queryParams.append('client', params.client);
    }
    if (params?.month && params.month !== 'All') {
      queryParams.append('month', params.month);
    }

    const endpoint = `${API_ENDPOINTS.FINANCE.PAYMENTS_EXPORT}?${queryParams.toString()}`;
    return apiRequest<FinancePaymentRecord[]>(endpoint, { method: 'GET' });
  },
};

