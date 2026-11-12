import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CashFlowPage } from '../features/finance/cash-flow/pages/CashFlowPage';
import { cashFlowApiService } from '../features/finance/cash-flow/services/cashFlowApiService';
import {
  INITIAL_CASH_FLOW_RECORDS,
  MOCK_CASH_FLOW_KPIS,
  MOCK_TRENDS_KPIS,
  MOCK_MONTHLY_TRENDS,
  MOCK_OUTFLOW_BREAKDOWN,
  MOCK_PERIOD_POSITIONS,
  KEY_INSIGHTS,
} from '../features/finance/cash-flow/mockData';
import { CashFlowRecord, PageResponse } from '../features/finance/cash-flow/types';

const renderCashFlowPage = () => {
  return render(
    <MemoryRouter>
      <CashFlowPage />
    </MemoryRouter>
  );
};

describe('CashFlowPage', () => {
  let mockDb: CashFlowRecord[] = [];

  beforeEach(() => {
    mockDb = JSON.parse(JSON.stringify(INITIAL_CASH_FLOW_RECORDS));
    vi.restoreAllMocks();

    vi.spyOn(cashFlowApiService, 'getCashFlows').mockImplementation(
      async (params = {}): Promise<PageResponse<CashFlowRecord>> => {
        let filtered = [...mockDb];

        if (params.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.cashFlowId.toLowerCase().includes(q) ||
              r.period.toLowerCase().includes(q) ||
              r.notes?.toLowerCase().includes(q)
          );
        }

        if (params.period && params.period !== 'All Period') {
          filtered = filtered.filter((r) => r.period === params.period);
        }

        if (params.status && params.status !== 'All') {
          filtered = filtered.filter((r) => r.status === params.status);
        }

        const page = params.page || 1;
        const size = params.size || 5;
        const start = (page - 1) * size;
        const content = filtered.slice(start, start + size);

        return {
          content,
          pageNumber: page,
          pageSize: size,
          totalElements: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / size)),
          first: page === 1,
          last: page >= Math.ceil(filtered.length / size),
        };
      }
    );

    vi.spyOn(cashFlowApiService, 'getKpis').mockResolvedValue(MOCK_CASH_FLOW_KPIS);

    vi.spyOn(cashFlowApiService, 'getTrends').mockResolvedValue({
      kpis: MOCK_TRENDS_KPIS,
      monthlyTrends: MOCK_MONTHLY_TRENDS,
      outflowBreakdown: {
        totalOutflows: 5285000,
        categories: MOCK_OUTFLOW_BREAKDOWN,
      },
      periodPositions: MOCK_PERIOD_POSITIONS,
      keyInsights: KEY_INSIGHTS,
    });

    vi.spyOn(cashFlowApiService, 'getNextId').mockResolvedValue({
      nextCashFlowId: 'CF-2026-011',
      periodYear: '2026',
    });

    vi.spyOn(cashFlowApiService, 'getSuggestedOpeningCash').mockResolvedValue({
      periodCode: '2026-11',
      suggestedOpeningCash: 1965000,
      previousPeriod: 'Oct 2026',
      previousPeriodCode: '2026-10',
      isManualEntry: false,
    });

    vi.spyOn(cashFlowApiService, 'createCashFlow').mockImplementation(async (payload) => {
      const cid = payload.cashFlowId || 'CF-2026-011';
      const otherInflows = payload.otherInflows ?? 0;
      const otherOutflows = payload.otherOutflows ?? 0;

      const newRecord: CashFlowRecord = {
        id: cid.toLowerCase(),
        cashFlowId: cid,
        period: payload.period,
        periodCode: '2026-11',
        openingCash: payload.openingCash,
        collections: payload.collections,
        otherInflows,
        totalInflows: payload.collections + otherInflows,
        vendorPayments: payload.vendorPayments,
        payrollPayments: payload.payrollPayments,
        operatingExpenses: payload.operatingExpenses,
        otherOutflows,
        totalOutflows:
          payload.vendorPayments +
          payload.payrollPayments +
          payload.operatingExpenses +
          otherOutflows,
        closingCash:
          payload.openingCash +
          (payload.collections + otherInflows) -
          (payload.vendorPayments +
            payload.payrollPayments +
            payload.operatingExpenses +
            otherOutflows),
        netCashFlow:
          payload.collections +
          otherInflows -
          (payload.vendorPayments +
            payload.payrollPayments +
            payload.operatingExpenses +
            otherOutflows),
        status: 'Pending',
        notes: payload.notes || '',
      };
      mockDb.unshift(newRecord);
      return newRecord;
    });
  });

  it('renders page header with title, description, and action buttons', async () => {
    renderCashFlowPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Cash Flow' })).toBeInTheDocument();
    expect(
      screen.getByText('Track cash inflows, outflows, and the closing cash position for each period.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Last Updated:/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Cash Flow' })).toBeInTheDocument();
  });

  it('renders the 4 KPI cards for the main Cash Flow tab matching designer specs', async () => {
    renderCashFlowPage();

    await waitFor(() => {
      expect(screen.getByText('Opening Cash')).toBeInTheDocument();
    });

    expect(screen.getAllByText('₹ 15,00,000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Total Inflows')).toBeInTheDocument();
    expect(screen.getAllByText('₹ 28,75,000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Total Outflows')).toBeInTheDocument();
    expect(screen.getAllByText('₹ 24,10,000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Closing Cash')).toBeInTheDocument();
    expect(screen.getAllByText('₹ 19,65,000').length).toBeGreaterThanOrEqual(1);
  });

  it('renders table headers and initial rows with 5 per page', async () => {
    renderCashFlowPage();

    await waitFor(() => {
      expect(screen.getByText('CF-2026-010')).toBeInTheDocument();
    });

    expect(screen.getByText('CASH FLOW ID')).toBeInTheDocument();
    expect(screen.getByText('PERIOD')).toBeInTheDocument();
    expect(screen.getByText('OPENING CASH')).toBeInTheDocument();
    expect(screen.getByText('COLLECTIONS')).toBeInTheDocument();
    expect(screen.getByText('OTHER INFLOWS')).toBeInTheDocument();
    expect(screen.getByText('VENDOR PAYMENTS')).toBeInTheDocument();
    expect(screen.getByText('PAYROLL PAYMENTS')).toBeInTheDocument();
    expect(screen.getByText('OPERATING EXPENSES')).toBeInTheDocument();
    expect(screen.getByText('OTHER OUTFLOWS')).toBeInTheDocument();
    expect(screen.getByText('CLOSING CASH')).toBeInTheDocument();
    expect(screen.getByText('NOTES')).toBeInTheDocument();
    expect(screen.getByText('ACTIONS')).toBeInTheDocument();

    // First page contains 5 items (CF-2026-010 down to CF-2026-006)
    expect(screen.getByText('CF-2026-010')).toBeInTheDocument();
    expect(screen.getByText('CF-2026-009')).toBeInTheDocument();
    expect(screen.getByText('CF-2026-008')).toBeInTheDocument();
    expect(screen.getByText('CF-2026-007')).toBeInTheDocument();
    expect(screen.getByText('CF-2026-006')).toBeInTheDocument();

    // CF-2026-005 should be on page 2
    expect(screen.queryByText('CF-2026-005')).not.toBeInTheDocument();
    expect(screen.getByText(/Showing/i)).toHaveTextContent('Showing 1–5 of 10 records');
  });

  it('paginates when page 2 is clicked', async () => {
    renderCashFlowPage();

    await waitFor(() => {
      expect(screen.getByText('CF-2026-010')).toBeInTheDocument();
    });

    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);

    await waitFor(() => {
      expect(screen.getByText('CF-2026-005')).toBeInTheDocument();
    });

    expect(screen.getByText('CF-2026-001')).toBeInTheDocument();
    expect(screen.queryByText('CF-2026-010')).not.toBeInTheDocument();
    expect(screen.getByText(/Showing/i)).toHaveTextContent('Showing 6–10 of 10 records');
  });

  it('filters rows by search term', async () => {
    renderCashFlowPage();

    await waitFor(() => {
      expect(screen.getByText('CF-2026-010')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by Cash Flow ID, Period, or Notes.../i);
    fireEvent.change(searchInput, { target: { value: 'CF-2026-008' } });

    await waitFor(() => {
      expect(screen.getByText('CF-2026-008')).toBeInTheDocument();
    });

    expect(screen.queryByText('CF-2026-010')).not.toBeInTheDocument();
    expect(screen.getByText(/Showing/i)).toHaveTextContent('Showing 1–1 of 1 records');
  });

  it('filters rows by period dropdown and clears filters', async () => {
    renderCashFlowPage();

    await waitFor(() => {
      expect(screen.getByText('CF-2026-010')).toBeInTheDocument();
    });

    // Period filter select
    const periodSelect = screen.getByDisplayValue('All Period');
    fireEvent.change(periodSelect, { target: { value: 'Oct 2026' } });

    await waitFor(() => {
      expect(screen.getByText('CF-2026-010')).toBeInTheDocument();
    });
    expect(screen.queryByText('CF-2026-009')).not.toBeInTheDocument();
    expect(screen.getByText(/Filters \(1\)/i)).toBeInTheDocument();

    // Click Clear Filters
    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByText('CF-2026-009')).toBeInTheDocument();
    });
    expect(screen.getByText('CF-2026-010')).toBeInTheDocument();
    expect(screen.getByText(/^Filters$/i)).toBeInTheDocument();
  });

  it('switches to Trends & Analysis tab and displays trend KPI cards, charts, and position table', async () => {
    renderCashFlowPage();

    const trendsTabBtn = screen.getByRole('button', { name: 'Trends & Analysis' });
    fireEvent.click(trendsTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Avg. Monthly Inflow')).toBeInTheDocument();
    });

    // Trends KPI Cards
    expect(screen.getByText('Avg. Monthly Inflow')).toBeInTheDocument();
    expect(screen.getByText('Avg. Monthly Outflow')).toBeInTheDocument();
    expect(screen.getAllByText('Net Cash Flow').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Closing Cash (Latest)')).toBeInTheDocument();

    // Chart titles
    expect(screen.getByText('Cash Flow Trend')).toBeInTheDocument();
    expect(screen.getByText('Cash Flow Breakdown (Total)')).toBeInTheDocument();
    expect(screen.getAllByText('Total Outflows').length).toBeGreaterThanOrEqual(1);

    // Period-wise Cash Position Table
    expect(screen.getByText('Period-wise Cash Position')).toBeInTheDocument();
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
    expect(screen.getByText(/Total inflows are/i)).toBeInTheDocument();
  });

  it('allows switching between Cash Flow and Trends & Analysis tabs multiple times smoothly', async () => {
    renderCashFlowPage();

    const cashFlowTabBtn = screen.getByRole('button', { name: 'Cash Flow' });
    const trendsTabBtn = screen.getByRole('button', { name: 'Trends & Analysis' });

    // Cycle 1: Click Trends
    fireEvent.click(trendsTabBtn);
    await waitFor(() => {
      expect(screen.getByText('Cash Flow Trend')).toBeInTheDocument();
    });
    expect(screen.getByText('Cash Flow Breakdown (Total)')).toBeInTheDocument();
    expect(screen.queryByText('CASH FLOW ID')).not.toBeInTheDocument();

    // Cycle 1: Return to Cash Flow
    fireEvent.click(cashFlowTabBtn);
    await waitFor(() => {
      expect(screen.getByText('CASH FLOW ID')).toBeInTheDocument();
    });
    expect(screen.queryByText('Cash Flow Trend')).not.toBeInTheDocument();

    // Cycle 2: Click Trends
    fireEvent.click(trendsTabBtn);
    await waitFor(() => {
      expect(screen.getByText('Cash Flow Trend')).toBeInTheDocument();
    });
    expect(screen.getByText('Period-wise Cash Position')).toBeInTheDocument();

    // Cycle 2: Return to Cash Flow
    fireEvent.click(cashFlowTabBtn);
    await waitFor(() => {
      expect(screen.getByText('CASH FLOW ID')).toBeInTheDocument();
    });

    // Cycle 3: Click Trends
    fireEvent.click(trendsTabBtn);
    await waitFor(() => {
      expect(screen.getByText('Cash Flow Trend')).toBeInTheDocument();
    });
    expect(screen.getByText('Key Insights')).toBeInTheDocument();

    // Cycle 3: Return to Cash Flow
    fireEvent.click(cashFlowTabBtn);
    await waitFor(() => {
      expect(screen.getByText('CASH FLOW ID')).toBeInTheDocument();
    });
  });

  it('opens and closes Add Cash Flow modal', async () => {
    renderCashFlowPage();

    const addBtn = screen.getByRole('button', { name: 'Add Cash Flow' });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Add Cash Flow' })).toBeInTheDocument();
    });

    expect(screen.getByText('Period Details')).toBeInTheDocument();
    expect(screen.getByText('Cash Position')).toBeInTheDocument();
    expect(screen.getByText('Outflows')).toBeInTheDocument();
    expect(screen.getByText('Closing & Notes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Cash Flow' })).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close modal');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('heading', { level: 2, name: 'Add Cash Flow' })).not.toBeInTheDocument();
  });

  it('opens Cash Flow Details modal when clicking a Cash Flow ID', async () => {
    renderCashFlowPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'CF-2026-010' })).toBeInTheDocument();
    });

    const idLink = screen.getByRole('button', { name: 'CF-2026-010' });
    fireEvent.click(idLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'CF-2026-010' })).toBeInTheDocument();
    });

    expect(screen.getByText(/Cash Flow Summary for Oct 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Inflows Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Outflows Breakdown/i)).toBeInTheDocument();

    const modalClose = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(modalClose);

    expect(screen.queryByText(/Cash Flow Summary for Oct 2026/i)).not.toBeInTheDocument();
  });

  it('submits Add Cash Flow form and calculates closing cash automatically', async () => {
    renderCashFlowPage();

    const addBtn = screen.getByRole('button', { name: 'Add Cash Flow' });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('e.g., 15,00,000')).toBeInTheDocument();
    });

    // Fill in Opening Cash, Collections, Vendor Payments
    const openingInput = screen.getByPlaceholderText('e.g., 15,00,000');
    const collectionsInput = screen.getByPlaceholderText('e.g., 18,50,000');
    const vendorInput = screen.getByPlaceholderText('e.g., 7,00,000');

    fireEvent.change(openingInput, { target: { value: '1000000' } });
    fireEvent.change(collectionsInput, { target: { value: '500000' } });
    fireEvent.change(vendorInput, { target: { value: '200000' } });

    // Closing Cash should be: 10,00,000 + (5,00,000 - 2,00,000) = 13,00,000
    expect(screen.getByDisplayValue('13,00,000')).toBeInTheDocument();

    // Fill remaining required fields to submit
    const payrollInput = screen.getByPlaceholderText('e.g., 6,40,000');
    const operatingInput = screen.getByPlaceholderText('e.g., 8,10,000');
    fireEvent.change(payrollInput, { target: { value: '100000' } });
    fireEvent.change(operatingInput, { target: { value: '50000' } });

    // New closing cash: 10,00,000 + 5,00,000 - (2,00,000 + 1,00,000 + 50,000) = 11,50,000
    expect(screen.getByDisplayValue('11,50,000')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: 'Save Cash Flow' });
    fireEvent.click(submitBtn);

    // Modal should close and the new record appears on page
    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 2, name: 'Add Cash Flow' })).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('CF-2026-011')).toBeInTheDocument();
    });
  });

  it('filters by status dropdown', async () => {
    renderCashFlowPage();

    await waitFor(() => {
      expect(screen.getByText('CF-2026-010')).toBeInTheDocument();
    });

    // Default status dropdown has All
    const statusSelect = screen.getByDisplayValue('All');
    fireEvent.change(statusSelect, { target: { value: 'Completed' } });

    await waitFor(() => {
      expect(screen.getByText('CF-2026-010')).toBeInTheDocument();
    });
    expect(screen.getByText(/Filters \(1\)/i)).toBeInTheDocument();
  });

  it('renders donut chart with all 4 exact colors and fixed center content on hover', async () => {
    renderCashFlowPage();

    // Switch to Trends & Analysis tab
    const trendsTabBtn = screen.getByRole('button', { name: 'Trends & Analysis' });
    fireEvent.click(trendsTabBtn);

    await waitFor(() => {
      expect(screen.getByText('₹ 52,85,000')).toBeInTheDocument();
    });

    // Center content must always show ₹ 52,85,000 / Total Outflows
    expect(screen.getByText('₹ 52,85,000')).toBeInTheDocument();
    expect(screen.getAllByText('Total Outflows').length).toBeGreaterThanOrEqual(1);

    // Verify all 4 SVG circles exist with the exact designer colors
    const donutSvg = screen.getByTestId('donut-svg');
    const circles = donutSvg.querySelectorAll('circle');
    // 4 category slices + 1 center hole mask = 5 circles
    expect(circles.length).toBe(5);

    const strokeColors = Array.from(circles).map((c) => c.getAttribute('stroke')).filter(Boolean);
    expect(strokeColors).toContain('#3930A8'); // Vendor Payments
    expect(strokeColors).toContain('#8188F8'); // Payroll Payments
    expect(strokeColors).toContain('#2EB8E8'); // Operating Expenses
    expect(strokeColors).toContain('#8BBDF8'); // Other Outflows

    // Hover over the 4th slice (Other Outflows)
    const otherOutflowsCircle = Array.from(circles).find((c) => c.getAttribute('stroke') === '#8BBDF8');
    expect(otherOutflowsCircle).toBeTruthy();

    if (otherOutflowsCircle) {
      fireEvent.mouseEnter(otherOutflowsCircle);
      // Center must STILL display ₹ 52,85,000
      expect(screen.getByText('₹ 52,85,000')).toBeInTheDocument();
      expect(screen.getAllByText('Total Outflows').length).toBeGreaterThanOrEqual(1);

      // Non-hovered slices should be dimmed to opacity: 0.45
      const vendorCircle = Array.from(circles).find((c) => c.getAttribute('stroke') === '#3930A8');
      expect(vendorCircle).toHaveStyle({ opacity: 0.45 });
      expect(otherOutflowsCircle).toHaveStyle({ opacity: 1 });
    }

    // Hover over the center hole mask
    const centerHoleMask = Array.from(circles).find((c) => c.getAttribute('fill') === 'transparent');
    expect(centerHoleMask).toBeTruthy();
    if (centerHoleMask) {
      fireEvent.mouseEnter(centerHoleMask);
      // All slices should be back to opacity: 1
      const vendorCircle = Array.from(circles).find((c) => c.getAttribute('stroke') === '#3930A8');
      expect(vendorCircle).toHaveStyle({ opacity: 1 });
      // Center must STILL display ₹ 52,85,000
      expect(screen.getByText('₹ 52,85,000')).toBeInTheDocument();
      expect(screen.getAllByText('Total Outflows').length).toBeGreaterThanOrEqual(1);
    }
  });
});
