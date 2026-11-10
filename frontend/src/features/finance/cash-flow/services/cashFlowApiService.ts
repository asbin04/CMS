import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import {
  CashFlowRecord,
  CashFlowKpis,
  CashFlowTrendsData,
  CashFlowQueryParams,
  CreateCashFlowPayload,
  UpdateCashFlowPayload,
  SuggestedOpeningCashResponse,
  NextCashFlowIdResponse,
  PageResponse,
  CashFlowStatus,
} from '../types';

const BASE_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '/api/v1';

export function mapBackendToCashFlowRecord(raw: any): CashFlowRecord {
  if (!raw) {
    throw new Error('Invalid backend cash flow record: empty payload');
  }

  return {
    id: raw.id ?? raw.cashFlowId,
    cashFlowId: raw.cashFlowId || '',
    period: raw.period || '',
    periodCode: raw.periodCode || '',
    openingCash: Number(raw.openingCash ?? 0),
    collections: Number(raw.collections ?? 0),
    otherInflows: Number(raw.otherInflows ?? 0),
    totalInflows: Number(raw.totalInflows ?? 0),
    vendorPayments: Number(raw.vendorPayments ?? 0),
    payrollPayments: Number(raw.payrollPayments ?? 0),
    operatingExpenses: Number(raw.operatingExpenses ?? 0),
    otherOutflows: Number(raw.otherOutflows ?? 0),
    totalOutflows: Number(raw.totalOutflows ?? 0),
    closingCash: Number(raw.closingCash ?? 0),
    netCashFlow: Number(raw.netCashFlow ?? 0),
    status: (raw.status || 'Pending') as CashFlowStatus,
    notes: raw.notes || '',
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function mapBackendKpis(raw: any): CashFlowKpis {
  return {
    period: raw?.period || '-',
    periodCode: raw?.periodCode || '-',
    openingCash: Number(raw?.openingCash ?? 0),
    totalInflows: Number(raw?.totalInflows ?? 0),
    totalOutflows: Number(raw?.totalOutflows ?? 0),
    closingCash: Number(raw?.closingCash ?? 0),
    netCashFlow: Number(raw?.netCashFlow ?? 0),
    hasData: Boolean(raw?.hasData),
    lastUpdated: raw?.lastUpdated,
  };
}

export function mapBackendTrends(raw: any): CashFlowTrendsData {
  return {
    kpis: {
      avgMonthlyInflow: Number(raw?.kpis?.avgMonthlyInflow ?? 0),
      avgMonthlyOutflow: Number(raw?.kpis?.avgMonthlyOutflow ?? 0),
      netCashFlow: Number(raw?.kpis?.netCashFlow ?? 0),
      closingCashLatest: Number(raw?.kpis?.closingCashLatest ?? 0),
    },
    monthlyTrends: (raw?.monthlyTrends || []).map((m: any) => ({
      period: m.period || '',
      periodCode: m.periodCode,
      totalInflows: Number(m.totalInflows ?? 0),
      totalOutflows: Number(m.totalOutflows ?? 0),
      closingCash: Number(m.closingCash ?? 0),
    })),
    outflowBreakdown: {
      totalOutflows: Number(raw?.outflowBreakdown?.totalOutflows ?? 0),
      categories: (raw?.outflowBreakdown?.categories || []).map((c: any) => ({
        name: c.name || '',
        amount: Number(c.amount ?? 0),
        percentage: Number(c.percentage ?? 0),
        color: c.color || '#3930A8',
      })),
    },
    periodPositions: (raw?.periodPositions || []).map((p: any) => ({
      period: p.period || '',
      periodCode: p.periodCode,
      inflows: Number(p.inflows ?? 0),
      outflows: Number(p.outflows ?? 0),
      netCashFlow: Number(p.netCashFlow ?? 0),
      closingCash: Number(p.closingCash ?? 0),
    })),
    keyInsights: raw?.keyInsights || [],
  };
}

export const cashFlowApiService = {
  /**
   * Fetch paginated and filtered cash flow records from backend
   */
  async getCashFlows(params: CashFlowQueryParams = {}): Promise<PageResponse<CashFlowRecord>> {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params.period && params.period !== 'All Period') queryParams.period = params.period;
    if (params.status && params.status !== 'All') queryParams.status = params.status;
    if (params.sort) queryParams.sort = params.sort;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;

    const res = await apiClient.get<any>(API_ENDPOINTS.CASH_FLOW.BASE, queryParams);
    const pageData = res.data || {};

    return {
      content: (pageData.content || []).map(mapBackendToCashFlowRecord),
      pageNumber: pageData.pageNumber ?? 1,
      pageSize: pageData.pageSize ?? 10,
      totalElements: pageData.totalElements ?? 0,
      totalPages: pageData.totalPages ?? 1,
      first: Boolean(pageData.first),
      last: Boolean(pageData.last),
    };
  },

  /**
   * Fetch cash flow record by ID or Cash Flow ID
   */
  async getCashFlowById(id: string | number): Promise<CashFlowRecord> {
    const res = await apiClient.get<any>(API_ENDPOINTS.CASH_FLOW.BY_ID(id));
    return mapBackendToCashFlowRecord(res.data);
  },

  /**
   * Fetch latest period dashboard KPIs
   */
  async getKpis(): Promise<CashFlowKpis> {
    const res = await apiClient.get<any>(API_ENDPOINTS.CASH_FLOW.KPIS);
    return mapBackendKpis(res.data);
  },

  /**
   * Fetch historical trends, breakdown donut, and key insights
   */
  async getTrends(): Promise<CashFlowTrendsData> {
    const res = await apiClient.get<any>(API_ENDPOINTS.CASH_FLOW.TRENDS);
    return mapBackendTrends(res.data);
  },

  /**
   * Fetch suggested opening cash from previous month
   */
  async getSuggestedOpeningCash(period?: string): Promise<SuggestedOpeningCashResponse> {
    const params: Record<string, string | undefined> = {};
    if (period && period.trim()) params.period = period.trim();

    const res = await apiClient.get<SuggestedOpeningCashResponse>(
      API_ENDPOINTS.CASH_FLOW.SUGGESTED_OPENING_CASH,
      params
    );
    return res.data;
  },

  /**
   * Preview next cash flow ID
   */
  async getNextId(year?: string | number): Promise<NextCashFlowIdResponse> {
    const params: Record<string, string | undefined> = {};
    if (year) params.year = String(year);

    const res = await apiClient.get<NextCashFlowIdResponse>(API_ENDPOINTS.CASH_FLOW.NEXT_ID, params);
    return res.data;
  },

  /**
   * Create new monthly cash flow record
   */
  async createCashFlow(payload: CreateCashFlowPayload): Promise<CashFlowRecord> {
    const res = await apiClient.post<any>(API_ENDPOINTS.CASH_FLOW.BASE, payload);
    return mapBackendToCashFlowRecord(res.data);
  },

  /**
   * Update existing cash flow record (locked if Completed)
   */
  async updateCashFlow(id: string | number, payload: UpdateCashFlowPayload): Promise<CashFlowRecord> {
    const res = await apiClient.put<any>(API_ENDPOINTS.CASH_FLOW.BY_ID(id), payload);
    return mapBackendToCashFlowRecord(res.data);
  },

  /**
   * Delete cash flow record (ADMIN only; locked if Completed)
   */
  async deleteCashFlow(id: string | number): Promise<void> {
    await apiClient.delete<void>(API_ENDPOINTS.CASH_FLOW.BY_ID(id));
  },

  /**
   * Export filtered cash flows as CSV
   */
  async exportCashFlows(params: { search?: string; period?: string; status?: string } = {}): Promise<void> {
    const queryParams: Record<string, string> = {};
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params.period && params.period !== 'All Period') queryParams.period = params.period;
    if (params.status && params.status !== 'All') queryParams.status = params.status;

    const searchStr = new URLSearchParams(queryParams).toString();
    const endpoint = `${BASE_URL}${API_ENDPOINTS.CASH_FLOW.EXPORT}${searchStr ? `?${searchStr}` : ''}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(endpoint, { headers });
    if (!res.ok) {
      let errorMsg = `Export failed: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.message) errorMsg = errorJson.message;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cash-flow-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

