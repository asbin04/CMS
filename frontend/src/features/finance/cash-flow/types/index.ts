export type CashFlowStatus = 'Completed' | 'Pending' | 'Draft' | 'Projected';

export type CashFlowTab = 'cash-flow' | 'trends-analysis';

export interface CashFlowRecord {
  id: string | number;
  cashFlowId: string;
  period: string; // e.g. "Oct 2026"
  periodCode?: string; // e.g. "2026-10"
  openingCash: number;
  collections: number;
  otherInflows: number;
  totalInflows: number;
  vendorPayments: number;
  payrollPayments: number;
  operatingExpenses: number;
  otherOutflows: number;
  totalOutflows: number;
  closingCash: number;
  netCashFlow: number;
  status: CashFlowStatus;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CashFlowKpis {
  openingCash: number;
  totalInflows: number;
  totalOutflows: number;
  closingCash: number;
  netCashFlow?: number;
  period?: string;
  periodCode?: string;
  hasData?: boolean;
  lastUpdated?: string;
}

export interface TrendsKpis {
  avgMonthlyInflow: number;
  avgMonthlyOutflow: number;
  netCashFlow: number;
  closingCashLatest: number;
}

export interface MonthlyTrendData {
  period: string; // e.g. "Jun 2026"
  periodCode?: string;
  totalInflows: number;
  totalOutflows: number;
  closingCash: number;
}

export interface OutflowBreakdownCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface PeriodPositionData {
  period: string;
  periodCode?: string;
  inflows: number;
  outflows: number;
  netCashFlow: number;
  closingCash: number;
}

export interface CashFlowTrendsData {
  kpis: TrendsKpis;
  monthlyTrends: MonthlyTrendData[];
  outflowBreakdown: {
    totalOutflows: number;
    categories: OutflowBreakdownCategory[];
  };
  periodPositions: PeriodPositionData[];
  keyInsights: string[];
}

export interface CashFlowFilterState {
  search: string;
  period: string;
  status: string;
}

export interface CashFlowQueryParams {
  search?: string;
  period?: string;
  status?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface CreateCashFlowPayload {
  cashFlowId?: string;
  period: string;
  periodCode?: string;
  openingCash: number;
  collections: number;
  otherInflows?: number;
  vendorPayments: number;
  payrollPayments: number;
  operatingExpenses: number;
  otherOutflows?: number;
  status?: string;
  notes?: string;
}

export interface UpdateCashFlowPayload {
  period?: string;
  periodCode?: string;
  openingCash: number;
  collections: number;
  otherInflows?: number;
  vendorPayments: number;
  payrollPayments: number;
  operatingExpenses: number;
  otherOutflows?: number;
  status?: string;
  notes?: string;
}

export interface SuggestedOpeningCashResponse {
  periodCode: string;
  suggestedOpeningCash: number;
  previousPeriod: string | null;
  previousPeriodCode: string | null;
  isManualEntry: boolean;
}

export interface NextCashFlowIdResponse {
  nextCashFlowId: string;
  periodYear: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
