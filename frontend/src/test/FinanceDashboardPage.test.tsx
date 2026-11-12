import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppRouter } from '../app/router';
import { FinanceDashboardPage } from '../features/finance/pages/FinanceDashboardPage';
import { financeService } from '../features/finance/services/financeService';
import { FinanceDashboardData } from '../features/finance/types/finance';

const mockZeroData: FinanceDashboardData = {
  lastUpdated: '2026-10-15T11:30:00+05:30',
  asOfDate: '2025-03-31',
  periodStart: '2024-04-01',
  periodEnd: '2025-03-31',
  kpis: {
    invoiceValue: { rawValue: 0, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL', comparisonText: null },
    collectedPayments: { rawValue: 0, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL', comparisonText: null },
    outstandingReceivables: { rawValue: 0, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL', comparisonText: null },
    currentReceivables: { rawValue: 0, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL', comparisonText: null },
    totalExpenses: { rawValue: 0, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL', comparisonText: null },
    projectExpenses: { rawValue: 0, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL', comparisonText: null },
    operatingCashResult: { rawValue: 0, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL', comparisonText: null },
    collectionRate: { rawValue: 0, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL', comparisonText: null },
  },
  ageingBuckets: [
    { bucketKey: 'current', label: 'Current', amount: 0, percentage: 0, count: 0 },
    { bucketKey: '1_30', label: '1 - 30 Days', amount: 0, percentage: 0, count: 0 },
    { bucketKey: '31_60', label: '31 - 60 Days', amount: 0, percentage: 0, count: 0 },
    { bucketKey: '61_90', label: '61 - 90 Days', amount: 0, percentage: 0, count: 0 },
    { bucketKey: '90_plus', label: '90+ Days', amount: 0, percentage: 0, count: 0 },
  ],
  metricSummary: [
    { metricKey: 'invoice_value', metricName: 'Invoice Value', value: 0, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: 'collected_payments', metricName: 'Collected Payments', value: 0, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: 'outstanding_receivables', metricName: 'Outstanding Receivables', value: 0, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: 'current_receivables', metricName: 'Current Receivables', value: 0, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: '1_30_days', metricName: '1 - 30 Days', value: 0, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: '31_60_days', metricName: '31 - 60 Days', value: 0, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: '61_90_days', metricName: '61 - 90 Days', value: 0, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: '90_plus_days', metricName: '90+ Days', value: 0, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: 'total_expenses', metricName: 'Total Expenses', value: 0, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: 'project_expenses', metricName: 'Project Expenses', value: 0, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: 'operating_cash_result', metricName: 'Operating Cash Result', value: 0, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: 'collection_rate', metricName: 'Collection Rate', value: 0, target: null, valueType: 'PERCENT', status: '-' },
  ],
  hasReceivablesData: false,
  hasExpensesData: false,
};

const mockLiveData: FinanceDashboardData = {
  lastUpdated: '2026-10-15T11:30:00+05:30',
  asOfDate: '2025-03-31',
  periodStart: '2024-04-01',
  periodEnd: '2025-03-31',
  kpis: {
    invoiceValue: { rawValue: 12933000, priorPeriodValue: null, trendPercentage: null, trendType: 'POSITIVE', comparisonText: null },
    collectedPayments: { rawValue: 1025000, priorPeriodValue: null, trendPercentage: null, trendType: 'POSITIVE', comparisonText: null },
    outstandingReceivables: { rawValue: 10108000, priorPeriodValue: null, trendPercentage: null, trendType: 'NEGATIVE', comparisonText: null },
    currentReceivables: { rawValue: 4333000, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL', comparisonText: null },
    totalExpenses: { rawValue: 4230000, priorPeriodValue: null, trendPercentage: null, trendType: 'NEGATIVE', comparisonText: null },
    projectExpenses: { rawValue: 1903500, priorPeriodValue: null, trendPercentage: null, trendType: 'NEGATIVE', comparisonText: null },
    operatingCashResult: { rawValue: -3205000, priorPeriodValue: null, trendPercentage: null, trendType: 'NEGATIVE', comparisonText: null },
    collectionRate: { rawValue: 7.93, priorPeriodValue: null, trendPercentage: null, trendType: 'POSITIVE', comparisonText: null },
  },
  ageingBuckets: [
    { bucketKey: 'current', label: 'Current', amount: 4333000, percentage: 43, count: 23 },
    { bucketKey: '1_30', label: '1 - 30 Days', amount: 2570000, percentage: 25, count: 16 },
    { bucketKey: '31_60', label: '31 - 60 Days', amount: 1745000, percentage: 17, count: 9 },
    { bucketKey: '61_90', label: '61 - 90 Days', amount: 480000, percentage: 5, count: 2 },
    { bucketKey: '90_plus', label: '90+ Days', amount: 980000, percentage: 10, count: 3 },
  ],
  metricSummary: [
    { metricKey: 'invoice_value', metricName: 'Invoice Value', value: 12933000, target: 12000000, valueType: 'CURRENCY', status: 'On Track' },
    { metricKey: 'collected_payments', metricName: 'Collected Payments', value: 1025000, target: 1000000, valueType: 'CURRENCY', status: 'On Track' },
    { metricKey: 'outstanding_receivables', metricName: 'Outstanding Receivables', value: 10108000, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: 'current_receivables', metricName: 'Current Receivables', value: 4333000, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: '1_30_days', metricName: '1 - 30 Days', value: 2570000, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: '31_60_days', metricName: '31 - 60 Days', value: 1745000, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: '61_90_days', metricName: '61 - 90 Days', value: 480000, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: '90_plus_days', metricName: '90+ Days', value: 980000, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: 'total_expenses', metricName: 'Total Expenses', value: 4230000, target: 4000000, valueType: 'CURRENCY', status: 'Attention' },
    { metricKey: 'project_expenses', metricName: 'Project Expenses', value: 1903500, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: 'operating_cash_result', metricName: 'Operating Cash Result', value: -3205000, target: null, valueType: 'CURRENCY', status: '-' },
    { metricKey: 'collection_rate', metricName: 'Collection Rate', value: 7.93, target: null, valueType: 'PERCENT', status: '-' },
  ],
  hasReceivablesData: true,
  hasExpensesData: true,
};

describe('FinanceDashboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders exact Figma design elements and labels with empty-state chart', async () => {
    vi.spyOn(financeService, 'getDashboardData').mockResolvedValue(mockZeroData);

    render(
      <BrowserRouter>
        <FinanceDashboardPage />
      </BrowserRouter>
    );

    // Title & Subtitle
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Finance Dashboard/i })).toBeInTheDocument();
    });
    expect(
      screen.getByText('Monitor invoicing, collections, receivables, expenses and operating cash performance.')
    ).toBeInTheDocument();

    // Buttons & No Last Updated
    expect(screen.queryByText(/Last Updated:/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refresh Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();

    // Section 1: Key Performance Indicators (Top 4 Cards)
    expect(screen.getAllByText('Invoice Value').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Collected Payments').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Outstanding Receivables').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Current Receivables').length).toBeGreaterThanOrEqual(1);

    // Section 2: Receivables Overview & Aging
    expect(screen.getByRole('heading', { level: 2, name: 'Receivables Overview' })).toBeInTheDocument();
    expect(screen.getByText('No receivables data available')).toBeInTheDocument();
    expect(screen.getByText('All aging buckets are currently at ₹ 0.00')).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 2, name: 'Receivables Aging' })).toBeInTheDocument();
    expect(screen.getAllByText('1 - 30 Days').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('31 - 60 Days').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('61 - 90 Days').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('90+ Days').length).toBeGreaterThanOrEqual(1);

    // Section 3: Expense & Cash Performance
    expect(screen.getByRole('heading', { level: 2, name: 'Expense & Cash Performance' })).toBeInTheDocument();
    expect(screen.getAllByText('Total Expenses').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Project Expenses').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Operating Cash Result').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Collection Rate').length).toBeGreaterThanOrEqual(1);

    // Section 4: Metric Summary Table
    expect(screen.getByRole('heading', { level: 2, name: 'Metric Summary' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Metric' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Value' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Target' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
  });

  it('renders live data when available and displays chart bars', async () => {
    vi.spyOn(financeService, 'getDashboardData').mockResolvedValue(mockLiveData);

    render(
      <BrowserRouter>
        <FinanceDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('₹ 1,29,33,000.00').length).toBe(2);
    });

    expect(screen.getAllByText('₹ 10,25,000.00').length).toBe(2);
    expect(screen.getAllByText('₹ 1,01,08,000.00').length).toBe(2);
    expect(screen.getAllByText('₹ 43,33,000.00').length).toBe(3);
    expect(screen.getByText('₹ 43.3 L')).toBeInTheDocument();
    expect(screen.getAllByText('7.93%').length).toBe(2);

    // Status badges
    expect(screen.getAllByText('On Track').length).toBe(2);
    expect(screen.getByText('Attention')).toBeInTheDocument();

    // Chart empty state message should NOT be present when data is available
    expect(screen.queryByText('No receivables data available')).not.toBeInTheDocument();
  });

  it('refreshes data when clicking the refresh button', async () => {
    const getDashboardDataSpy = vi.spyOn(financeService, 'getDashboardData').mockResolvedValue(mockZeroData);

    render(
      <BrowserRouter>
        <FinanceDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Finance Dashboard/i })).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /Refresh Dashboard/i });
    fireEvent.click(refreshBtn);

    expect(getDashboardDataSpy).toHaveBeenCalledTimes(2);
  });

  it('triggers CSV export when clicking the Export button', async () => {
    vi.spyOn(financeService, 'getDashboardData').mockResolvedValue(mockLiveData);
    const exportSpy = vi.spyOn(financeService, 'exportToCsv').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <FinanceDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportBtn);

    expect(exportSpy).toHaveBeenCalledWith(mockLiveData);
  });

  it('displays error banner with Retry button when service fails, and clicking retry reloads', async () => {
    const errorSpy = vi
      .spyOn(financeService, 'getDashboardData')
      .mockRejectedValueOnce(new Error('Network error: server unreachable'))
      .mockResolvedValueOnce(mockZeroData);

    render(
      <BrowserRouter>
        <FinanceDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Unable to load Finance Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Network error: server unreachable')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Finance Dashboard/i })).toBeInTheDocument();
    });

    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  it('adapts responsive grid classes based on isSidebarCollapsed and fills full width', async () => {
    vi.spyOn(financeService, 'getDashboardData').mockResolvedValue(mockLiveData);

    const LayoutWithOutlet: React.FC<{ isSidebarCollapsed: boolean }> = ({ isSidebarCollapsed }) => (
      <Outlet context={{ isSidebarCollapsed }} />
    );

    // 1. Sidebar Collapsed (true) -> uses lg:grid-cols-4 and lg:grid-cols-12
    const { container, rerender } = render(
      <MemoryRouter initialEntries={['/finance']}>
        <Routes>
          <Route element={<LayoutWithOutlet isSidebarCollapsed={true} />}>
            <Route path="/finance" element={<FinanceDashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Finance Dashboard/i })).toBeInTheDocument();
    });

    const kpiGridCollapsed = container.querySelector('.grid.gap-4');
    expect(kpiGridCollapsed?.className).toContain('lg:grid-cols-4');
    expect(container.firstElementChild?.className).toContain('w-full');

    // 2. Sidebar Expanded (false) -> uses xl:grid-cols-4 and xl:grid-cols-12
    rerender(
      <MemoryRouter initialEntries={['/finance']}>
        <Routes>
          <Route element={<LayoutWithOutlet isSidebarCollapsed={false} />}>
            <Route path="/finance" element={<FinanceDashboardPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const kpiGridExpanded = container.querySelector('.grid.gap-4');
    expect(kpiGridExpanded?.className).toContain('xl:grid-cols-4');
  });

  it('routes correctly to Finance Dashboard via AppRouter from /finance/dashboard and /finance', async () => {
    localStorage.setItem('auth_token', 'mock-valid-token');
    vi.spyOn(financeService, 'getDashboardData').mockResolvedValue(mockLiveData);

    render(
      <MemoryRouter initialEntries={['/finance/dashboard']}>
        <AppRouter />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Finance Dashboard/i })).toBeInTheDocument();
    });

    expect(screen.getByText('Monitor invoicing, collections, receivables, expenses and operating cash performance.')).toBeInTheDocument();
  });
});
