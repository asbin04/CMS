import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { collectionsApiService } from '@/features/collections/services/collectionsApiService';
import { triggerNotificationRefresh } from '@/services/notificationService';
import {
  InvoiceRecord,
  InvoiceKpiSummary,
  InvoiceAgingBucket,
  InvoiceSortOption,
} from './types';
import { formatDateDisplay, parseInvoiceDate, calculateAgingBucket } from './utils';

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface BackendInvoiceResponse {
  id: string;
  clientId?: string;
  client?: string;
  clientName?: string;
  invoiceDate: string;
  dueDate: string;
  invoiceAmount: number;
  amountPaid: number;
  outstanding: number;
  daysOverdue?: number | null;
  ageingBucket?: string;
  status: string;
  recommendedAction?: string;
  projectId?: string;
  contractId?: string;
  amountBeforeTax?: number;
  taxRate?: number;
  taxAmount?: number;
  paymentTermsDays?: number;
  invoiceStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
  collectionStatus: 'In Progress' | 'Completed' | 'Pending' | 'Follow Up';
  notes?: string;
  createdAt?: string;
}

export interface BackendKpiResponse {
  totalInvoices: number;
  totalInvoicesTrend?: number;
  totalInvoiceValue: number;
  totalInvoiceValueTrend?: number;
  paidAmount: number;
  paidAmountTrend?: number;
  outstandingAmount: number;
  outstandingAmountTrend?: number;
}

export interface BackendPaymentRecord {
  id: string;
  invoiceId: string;
  client?: string;
  date: string;
  amount: number;
  method: string;
  referenceId?: string;
  notes?: string;
}

export interface BackendReversalResponse {
  id: string;
  paymentId: string;
  invoiceId: string;
  reversalDate: string;
  amount: number;
  reason: string;
  referenceId?: string;
  idempotencyKey?: string;
  createdBy?: string;
  createdAt?: string;
  invoiceOutstanding: number;
  invoiceAmountPaid: number;
  invoiceStatus: string;
  collectionStatus: string;
  status: string;
}

export interface InvoicesQueryParams {
  search?: string;
  client?: string;
  status?: string;
  invoiceStatus?: string;
  collectionStatus?: string;
  project?: string;
  ageing?: string;
  invoiceDateFrom?: string;
  invoiceDateTo?: string;
  preset?: string;
  filter?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface CreateInvoicePayload {
  invoiceId?: string;
  clientId?: string;
  client?: string;
  clientName?: string;
  projectId?: string;
  contractId?: string;
  invoiceDate: string;
  dueDate: string;
  amountBeforeTax: number;
  taxRate?: number;
  taxAmount?: number;
  invoiceAmount?: number;
  paymentTermsDays?: number;
  notes?: string;
  statusOverride?: string;
  autoAssignIfTaken?: boolean;
}

export interface UpdateInvoicePayload {
  client?: string;
  clientName?: string;
  clientId?: string;
  projectId?: string;
  contractId?: string;
  invoiceDate?: string;
  dueDate?: string;
  amountBeforeTax?: number;
  taxRate?: number;
  taxAmount?: number;
  paymentTermsDays?: number;
  notes?: string;
}

export interface RecordPaymentPayload {
  amount: number;
  paymentMethod?: string;
  referenceId?: string;
  notes?: string;
  paymentDate?: string;
}

export interface ReversePaymentPayload {
  reversalAmount: number;
  reason: string;
  referenceId?: string;
  idempotencyKey?: string;
}

/**
 * Dedicated Data Mapper: Maps backend InvoiceResponse JSON to frontend InvoiceRecord interface.
 * Preserves strict separation between financial invoiceStatus and workflow collectionStatus.
 */
export function mapBackendInvoiceToRecord(dto: BackendInvoiceResponse): InvoiceRecord {
  const outstandingNum = Number(dto.outstanding) || 0;
  const paidNum = Number(dto.amountPaid) || 0;
  const totalNum = Number(dto.invoiceAmount) || 0;
  const beforeTaxNum =
    dto.amountBeforeTax !== undefined && dto.amountBeforeTax !== null
      ? Number(dto.amountBeforeTax)
      : totalNum;
  const taxAmountNum =
    dto.taxAmount !== undefined && dto.taxAmount !== null
      ? Number(dto.taxAmount)
      : Math.max(0, totalNum - beforeTaxNum);

  // Format dates for display
  const formattedInvoiceDate = dto.invoiceDate
    ? formatDateDisplay(parseInvoiceDate(dto.invoiceDate))
    : '';
  const formattedDueDate = dto.dueDate ? formatDateDisplay(parseInvoiceDate(dto.dueDate)) : '';

  // Determine standard UI aging bucket
  let agingBucket: InvoiceAgingBucket = 'No Due Date';
  if (dto.ageingBucket) {
    const raw = dto.ageingBucket.toLowerCase();
    if (raw.includes('90')) agingBucket = '90+ Days';
    else if (raw.includes('61')) agingBucket = '61 - 90 Days';
    else if (raw.includes('31')) agingBucket = '31 - 60 Days';
    else if (raw.includes('1')) agingBucket = '1 - 30 Days';
    else if (raw.includes('current')) agingBucket = 'No Due Date';
  } else if (dto.daysOverdue && dto.daysOverdue > 0) {
    agingBucket = calculateAgingBucket(dto.daysOverdue, dto.dueDate);
  }

  return {
    invoiceId: dto.id,
    invoiceDate: formattedInvoiceDate,
    clientId: dto.clientId || 'CL-001',
    clientName: dto.clientName || dto.client || dto.clientId || 'Client',
    projectId: dto.projectId || 'PRJ-001',
    contractId: dto.contractId || 'CON-001',
    dueDate: formattedDueDate,
    amountBeforeTax: beforeTaxNum,
    taxRate:
      dto.taxRate !== undefined && dto.taxRate !== null
        ? Number(dto.taxRate)
        : taxAmountNum > 0 && beforeTaxNum > 0
        ? Math.round((taxAmountNum / beforeTaxNum) * 100)
        : 0,
    taxAmount: taxAmountNum,
    totalAmount: totalNum,
    paidAmount: paidNum,
    outstandingAmount: outstandingNum,
    status:
      dto.invoiceStatus ||
      (outstandingNum <= 0 ? 'Paid' : paidNum > 0 ? 'Partially Paid' : 'Unpaid'),
    paymentTermsDays: dto.paymentTermsDays || 30,
    daysOverdue: dto.daysOverdue && dto.daysOverdue > 0 ? dto.daysOverdue : 0,
    agingBucket,
    collectionStatus: dto.collectionStatus || 'Pending',
    outstanding: outstandingNum > 0 ? 'Yes' : 'No',
    notes: dto.notes || '',
    createdAt: dto.createdAt,
  };
}

/**
 * Maps frontend sort option to backend sortField & sortOrder
 */
export function mapSortOptionToBackend(
  sortOption: InvoiceSortOption
): { sortField: string; sortOrder: 'asc' | 'desc' } {
  switch (sortOption) {
    case 'Invoice Date (Newest)':
      return { sortField: 'invoiceDate', sortOrder: 'desc' };
    case 'Invoice Date (Oldest)':
      return { sortField: 'invoiceDate', sortOrder: 'asc' };
    case 'Total Amount (High to Low)':
      return { sortField: 'invoiceAmount', sortOrder: 'desc' };
    case 'Total Amount (Low to High)':
      return { sortField: 'invoiceAmount', sortOrder: 'asc' };
    case 'Due Date (Soonest)':
      return { sortField: 'dueDate', sortOrder: 'asc' };
    case 'Due Date (Latest)':
      return { sortField: 'dueDate', sortOrder: 'desc' };
    case 'Invoice ID (Newest)':
      return { sortField: 'id', sortOrder: 'desc' };
    case 'Invoice ID (Oldest)':
      return { sortField: 'id', sortOrder: 'asc' };
    default:
      return { sortField: 'invoiceDate', sortOrder: 'desc' };
  }
}

export const invoicesApiService = {
  // 1. Fetch paginated, server-side filtered invoices
  async getInvoices(params: InvoicesQueryParams = {}): Promise<PageResponse<InvoiceRecord>> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.search) queryParams.search = params.search;
    if (params.client && params.client !== 'All Clients') queryParams.client = params.client;
    if (params.project && params.project !== 'All Projects') queryParams.project = params.project;
    if (params.status && params.status !== 'All') queryParams.status = params.status;
    if (params.invoiceStatus && params.invoiceStatus !== 'All')
      queryParams.invoiceStatus = params.invoiceStatus;
    if (params.collectionStatus && params.collectionStatus !== 'All')
      queryParams.collectionStatus = params.collectionStatus;
    if (params.ageing && params.ageing !== 'All' && params.ageing !== 'All Buckets')
      queryParams.ageing = params.ageing;
    if (params.invoiceDateFrom) queryParams.invoiceDateFrom = params.invoiceDateFrom;
    if (params.invoiceDateTo) queryParams.invoiceDateTo = params.invoiceDateTo;
    if (params.preset) queryParams.preset = params.preset;
    if (params.filter) queryParams.filter = params.filter;
    if (params.sortField) queryParams.sortField = params.sortField;
    if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;

    const res = await apiClient.get<PageResponse<BackendInvoiceResponse>>(
      API_ENDPOINTS.INVOICES.BASE,
      queryParams
    );

    const rawPage = res.data;
    return {
      content: (rawPage.content || []).map(mapBackendInvoiceToRecord),
      pageNumber: rawPage.pageNumber,
      pageSize: rawPage.pageSize,
      totalElements: rawPage.totalElements,
      totalPages: rawPage.totalPages,
      first: rawPage.first,
      last: rawPage.last,
    };
  },

  // 2. Fetch live Finance invoice KPIs
  async getKpis(): Promise<InvoiceKpiSummary> {
    const res = await apiClient.get<BackendKpiResponse>(API_ENDPOINTS.INVOICES.KPIS);
    const d = res.data;
    return {
      totalInvoices: Number(d.totalInvoices) || 0,
      totalInvoicesTrend: Number(d.totalInvoicesTrend) || 0,
      totalInvoiceValue: Number(d.totalInvoiceValue) || 0,
      totalInvoiceValueTrend: Number(d.totalInvoiceValueTrend) || 0,
      paidAmount: Number(d.paidAmount) || 0,
      paidAmountTrend: Number(d.paidAmountTrend) || 0,
      outstandingAmount: Number(d.outstandingAmount) || 0,
      outstandingAmountTrend: Number(d.outstandingAmountTrend) || 0,
    };
  },

  // 3. Fetch next atomic invoice ID preview
  async getNextInvoiceId(year?: number): Promise<{ nextInvoiceId: string; year: number; sequenceNumber: number; format: string }> {
    const res = await apiClient.get<{ nextInvoiceId: string; year: number; sequenceNumber: number; format: string }>(
      API_ENDPOINTS.INVOICES.NEXT_ID(year)
    );
    return res.data;
  },

  // 4. Fetch invoice by ID
  async getInvoiceById(id: string): Promise<InvoiceRecord> {
    const res = await apiClient.get<BackendInvoiceResponse>(API_ENDPOINTS.INVOICES.BY_ID(id));
    return mapBackendInvoiceToRecord(res.data);
  },

  // 5. Create new Finance invoice
  async createInvoice(payload: CreateInvoicePayload): Promise<InvoiceRecord> {
    const res = await apiClient.post<BackendInvoiceResponse>(API_ENDPOINTS.INVOICES.BASE, payload);
    triggerNotificationRefresh();
    return mapBackendInvoiceToRecord(res.data);
  },

  // 6. Update existing invoice
  async updateInvoice(id: string, payload: UpdateInvoicePayload): Promise<InvoiceRecord> {
    const res = await apiClient.put<BackendInvoiceResponse>(API_ENDPOINTS.INVOICES.BY_ID(id), payload);
    triggerNotificationRefresh();
    return mapBackendInvoiceToRecord(res.data);
  },

  // 7. Delete invoice
  async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.INVOICES.BY_ID(id));
    triggerNotificationRefresh();
  },

  // 8. Fetch payment history for invoice
  async getPaymentHistory(invoiceId: string): Promise<BackendPaymentRecord[]> {
    const res = await apiClient.get<BackendPaymentRecord[]>(API_ENDPOINTS.INVOICES.PAYMENTS(invoiceId));
    return res.data || [];
  },

  // 9. Payment Recording: Reuses the existing Management Collections payment endpoint
  async recordPayment(invoiceId: string, payload: RecordPaymentPayload): Promise<BackendPaymentRecord> {
    const payment = await collectionsApiService.recordPayment(invoiceId, payload);
    triggerNotificationRefresh();
    return payment as unknown as BackendPaymentRecord;
  },

  // 10. Reverse payment with idempotency protection
  async reversePayment(
    invoiceId: string,
    paymentId: string,
    payload: ReversePaymentPayload
  ): Promise<BackendReversalResponse> {
    const res = await apiClient.post<BackendReversalResponse>(
      API_ENDPOINTS.INVOICES.REVERSAL(invoiceId, paymentId),
      payload
    );
    triggerNotificationRefresh();
    return res.data;
  },

  // Helper mapping
  mapBackendInvoiceToRecord,
};

