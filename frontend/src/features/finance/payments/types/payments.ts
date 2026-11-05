export interface FinancePaymentRecord {
  id: string;
  paymentDate: string; // YYYY-MM-DD
  invoiceId: string;
  clientId: string;
  clientName: string;
  amount: number;
  invoiceAmount: number;
  mode: string;
  referenceNo: string;
  status: 'Matched' | 'Pending' | 'Partially Matched' | string;
  varianceAmount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancePaymentKpiData {
  totalPayments: number;
  totalPaymentsGrowth: number;
  totalPaymentsTrend: 'up' | 'down';

  pendingPayments: number;
  pendingPaymentsGrowth: number;
  pendingPaymentsTrend: 'up' | 'down';

  matchedPayments: number;
  matchedPaymentsGrowth: number;
  matchedPaymentsTrend: 'up' | 'down';

  paymentVariance: number;
  paymentVarianceGrowth: number;
  paymentVarianceTrend: 'up' | 'down';

  lastUpdatedFormatted?: string;
  totalRecordCount?: number;
}

export interface ClientFilterOption {
  clientId: string;
  clientName: string;
}

export interface FinancePaymentFilterOptions {
  modes: string[];
  statuses: string[];
  clients: ClientFilterOption[];
  months: string[];
}

export interface RecordPaymentPayload {
  paymentDate?: string;
  invoiceId: string;
  clientId: string;
  clientName?: string;
  amount: number;
  invoiceAmount?: number;
  mode: string;
  referenceNo: string;
  status: string;
  varianceAmount?: number;
  notes?: string;
}

export interface UpdatePaymentPayload {
  paymentDate?: string;
  mode?: string;
  referenceNo?: string;
  status?: string;
  amount?: number;
  varianceAmount?: number;
  notes?: string;
}

