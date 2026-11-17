import {
  CashFlowRecord,
  CashFlowKpis,
  TrendsKpis,
  MonthlyTrendData,
  OutflowBreakdownCategory,
  PeriodPositionData,
} from './types';

export const INITIAL_CASH_FLOW_RECORDS: CashFlowRecord[] = [];

export const MOCK_CASH_FLOW_KPIS: CashFlowKpis = {
  openingCash: 0,
  totalInflows: 0,
  totalOutflows: 0,
  closingCash: 0,
};

export const MOCK_TRENDS_KPIS: TrendsKpis = {
  avgMonthlyInflow: 0,
  avgMonthlyOutflow: 0,
  netCashFlow: 0,
  closingCashLatest: 0,
};

export const MOCK_MONTHLY_TRENDS: MonthlyTrendData[] = [];

export const MOCK_OUTFLOW_BREAKDOWN: OutflowBreakdownCategory[] = [];

export const MOCK_PERIOD_POSITIONS: PeriodPositionData[] = [];

export const KEY_INSIGHTS: string[] = [];

export const PERIOD_FILTER_OPTIONS = [
  'All Period',
  'Oct 2026',
  'Sep 2026',
  'Aug 2026',
  'Jul 2026',
  'Jun 2026',
];

export const STATUS_FILTER_OPTIONS = ['All', 'Completed', 'Pending', 'Draft', 'Projected'];

export const formatIndianCurrency = (num: number): string => {
  return (
    '₹ ' +
    num.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    })
  );
};
