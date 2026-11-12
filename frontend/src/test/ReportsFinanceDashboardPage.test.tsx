import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ReportsFinanceDashboardPage } from '../features/reports/pages/ReportsFinanceDashboardPage';
import { financeService } from '../features/finance/services/financeService';
import { invoicesApiService } from '../features/invoices/invoicesApiService';
import { paymentsService } from '../features/finance/payments/services/paymentsService';
import { AppRouter } from '../app/router';

const mockDashboardData = {
  lastUpdated: '2026-11-11T12:00:00Z',
  asOfDate: '2026-11-11',
  periodStart: '2026-04-01',
  periodEnd: '2027-03-31',
  kpis: {
    invoiceValue: { rawValue: 4850000, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL' as const, comparisonText: null },
    collectedPayments: { rawValue: 3220000, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL' as const, comparisonText: null },
    outstandingReceivables: { rawValue: 1630000, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL' as const, comparisonText: null },
    currentReceivables: { rawValue: 600000, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL' as const, comparisonText: null },
    totalExpenses: { rawValue: 1175000, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL' as const, comparisonText: null },
    projectExpenses: { rawValue: 470000, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL' as const, comparisonText: null },
    operatingCashResult: { rawValue: 2045000, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL' as const, comparisonText: null },
    collectionRate: { rawValue: 66, priorPeriodValue: null, trendPercentage: null, trendType: 'NEUTRAL' as const, comparisonText: null },
  },
  ageingBuckets: [
    { bucketKey: 'current', label: 'Current', amount: 600000, percentage: 37, count: 9 },
    { bucketKey: '1_30', label: '1 - 30 Days', amount: 450000, percentage: 28, count: 6 },
    { bucketKey: '31_60', label: '31 - 60 Days', amount: 300000, percentage: 18, count: 4 },
    { bucketKey: '61_90', label: '61 - 90 Days', amount: 180000, percentage: 11, count: 2 },
    { bucketKey: '90_plus', label: '90+ Days', amount: 100000, percentage: 6, count: 2 },
  ],
  metricSummary: [],
  hasReceivablesData: true,
  hasExpensesData: true,
};

const mockInvoicesPage = {
  content: [
    {
      invoiceId: 'INV-0042',
      clientId: 'CL-001',
      clientName: 'Acme Corp',
      projectId: 'PRJ-003',
      contractId: 'CON-001',
      invoiceDate: '02 Feb 2026',
      dueDate: '04 Mar 2026',
      amountBeforeTax: 203390,
      taxRate: 18,
      taxAmount: 36610,
      totalAmount: 240000,
      paidAmount: 100000,
      outstandingAmount: 140000,
      daysOverdue: 0,
      status: 'Partially Paid' as const,
      paymentTermsDays: 30,
      agingBucket: '1 - 30 Days' as const,
      collectionStatus: 'In Progress' as const,
      outstanding: 'Yes' as const,
      notes: '',
    },
    {
      invoiceId: 'INV-0041',
      clientId: 'CL-002',
      clientName: 'Global Tech',
      projectId: 'PRJ-005',
      contractId: 'CON-002',
      invoiceDate: '15 Jan 2026',
      dueDate: '14 Feb 2026',
      amountBeforeTax: 305085,
      taxRate: 18,
      taxAmount: 54915,
      totalAmount: 360000,
      paidAmount: 360000,
      outstandingAmount: 0,
      daysOverdue: 0,
      status: 'Paid' as const,
      paymentTermsDays: 30,
      agingBucket: '1 - 30 Days' as const,
      collectionStatus: 'Completed' as const,
      outstanding: 'No' as const,
      notes: '',
    },
  ],
  pageNumber: 0,
  pageSize: 5,
  totalElements: 42,
  totalPages: 9,
  first: true,
  last: false,
};

describe('ReportsFinanceDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(financeService, 'getDashboardData').mockResolvedValue(mockDashboardData);
    vi.spyOn(invoicesApiService, 'getInvoices').mockResolvedValue(mockInvoicesPage);
    vi.spyOn(paymentsService, 'getFilterOptions').mockResolvedValue({
      modes: ['Bank Transfer', 'UPI'],
      statuses: ['Matched', 'Pending'],
      clients: [
        { clientId: 'CL-001', clientName: 'Acme Corp' },
        { clientId: 'CL-002', clientName: 'Global Tech' },
      ],
      months: ['Jan 2026', 'Feb 2026'],
    });
  });

  it('renders title, subtitle, and primary header buttons according to Figma specs', async () => {
    render(
      <MemoryRouter>
        <ReportsFinanceDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Finance Dashboard' })).toBeInTheDocument();
    expect(
      screen.getByText('Track invoices, collections, receivables, expenses and cash position.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Record Payment/i })).toBeInTheDocument();
  });

  it('renders all 7 key metric cards with formatted INR amounts', async () => {
    render(
      <MemoryRouter>
        <ReportsFinanceDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Invoice Value')).toBeInTheDocument();
      expect(screen.getByText('₹48,50,000')).toBeInTheDocument();
      expect(screen.getByText('Collected Payments')).toBeInTheDocument();
      expect(screen.getByText('₹32,20,000')).toBeInTheDocument();
      expect(screen.getByText('Outstanding Receivables')).toBeInTheDocument();
      expect(screen.getByText('₹16,30,000')).toBeInTheDocument();
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('₹11,75,000')).toBeInTheDocument();
      expect(screen.getByText('Project Expenses')).toBeInTheDocument();
      expect(screen.getByText('₹4,70,000')).toBeInTheDocument();
      expect(screen.getByText('Operating Cash Result')).toBeInTheDocument();
      expect(screen.getByText('₹20,45,000')).toBeInTheDocument();
      expect(screen.getByText('Collection Rate')).toBeInTheDocument();
      expect(screen.getByText('66%')).toBeInTheDocument();
    });
  });

  it('renders Receivables Aging card with multi-segment indicators and bucket columns', async () => {
    render(
      <MemoryRouter>
        <ReportsFinanceDashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Receivables Aging')).toBeInTheDocument();
      expect(screen.getByText(/across 23 invoices/i)).toBeInTheDocument();
      expect(screen.getAllByText('Current').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('1-30 Days').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('31-60 Days').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('61-90 Days').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('90+ Days').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('9 invoices')).toBeInTheDocument();
      expect(screen.getByText('6 invoices')).toBeInTheDocument();
    });
  });

  it('renders table tabs, search input, Filters button with strictly NO (0), and live invoices', async () => {
    render(
      <MemoryRouter>
        <ReportsFinanceDashboardPage />
      </MemoryRouter>
    );

    // Tab Bar
    expect(screen.getByRole('button', { name: 'Invoices' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Payments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expenses' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cash Flow' })).toBeInTheDocument();

    // Search and Filter controls
    expect(
      screen.getByPlaceholderText('Search by Invoice ID, Client, or Project...')
    ).toBeInTheDocument();

    // Rule requirement: Filter button text must be 'Filters' without '(0)'
    const filterBtn = screen.getByRole('button', { name: /^filters$/i });
    expect(filterBtn).toBeInTheDocument();
    expect(filterBtn.textContent?.trim()).toBe('Filters');

    // Clear Filters
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();

    // Table data
    await waitFor(() => {
      expect(screen.getByText('INV-0042')).toBeInTheDocument();
      expect(screen.getByText('INV-0041')).toBeInTheDocument();
      expect(screen.getByText('Showing 1 - 5 of 42 invoices')).toBeInTheDocument();
    });
  });

  it('routes to ReportsFinanceDashboardPage from /reports/finance-dashboard without touching /finance/dashboard', async () => {
    localStorage.setItem('auth_token', 'mock-token');

    render(
      <MemoryRouter initialEntries={['/reports/finance-dashboard']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Finance Dashboard' }, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Track invoices, collections, receivables, expenses and cash position.')
    ).toBeInTheDocument();
  });
});
