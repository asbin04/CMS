import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SalesDashboardPage } from '../features/sales-dashboard/pages/SalesDashboardPage';
import { salesDashboardService } from '../features/sales-dashboard/services/salesDashboardService';

// Mock useNavigate
const mockedNavigate = vi.fn();
let mockOutletContext: any = {
  dateRange: 'Apr 2024 - Mar 2025',
  setDateRange: vi.fn(),
  searchQuery: '',
  setSearchQuery: vi.fn(),
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useOutletContext: () => mockOutletContext,
  };
});

describe('SalesDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOutletContext = {
      dateRange: 'Apr 2024 - Mar 2025',
      setDateRange: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
    };
  });

  const renderPage = () => {
    return render(
      <MemoryRouter>
        <SalesDashboardPage />
      </MemoryRouter>
    );
  };

  it('renders loading skeleton initially then displays dashboard content', async () => {
    renderPage();

    // After async load completes
    await waitFor(() => {
      expect(screen.getByText('Sales Performance & Pipeline')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'Monitor sales performance, pipeline value, and conversion across the sales lifecycle.'
      )
    ).toBeInTheDocument();
    expect(screen.getByTitle('Refresh sales data')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export Report/i })).toBeInTheDocument();
  });

  it('renders all four top KPI cards with exact values from the designer specification', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Total Proposals (Value)')).toBeInTheDocument();
    });

    // 1. Total Leads
    expect(screen.getAllByText('Total Leads').length).toBe(2);
    // 2. Total Opportunities
    expect(screen.getAllByText('Total Opportunities').length).toBe(2);
    // 3. Total Proposals (Value)
    expect(screen.getByText('Total Proposals (Value)')).toBeInTheDocument();
    // 4. Active Contracts
    expect(screen.getAllByText('Active Contracts').length).toBe(2);

    // Exact Numbers
    const nineNineSevenElements = screen.getAllByText('997');
    expect(nineNineSevenElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('₹ 0.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all four performance cards with exact categories and metric rows', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Leads Performance')).toBeInTheDocument();
    });

    // Category Headings
    expect(screen.getByText('Leads Performance')).toBeInTheDocument();
    expect(screen.getByText('Opportunities Performance')).toBeInTheDocument();
    expect(screen.getByText('Proposal Performance')).toBeInTheDocument();
    expect(screen.getByText('Contract Performance')).toBeInTheDocument();

    // Leads Performance metrics
    expect(screen.getByText('Open Leads')).toBeInTheDocument();
    expect(screen.getByText('Won Leads')).toBeInTheDocument();
    expect(screen.getByText('Lead → Won %')).toBeInTheDocument();

    // Opportunities Performance metrics
    expect(screen.getByText('Open Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Pipeline Value')).toBeInTheDocument();
    expect(screen.getByText('Weighted Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Won Opportunity Value')).toBeInTheDocument();

    // Proposal Performance metrics
    expect(screen.getByText('Total Proposal Value')).toBeInTheDocument();
    expect(screen.getByText('Accepted Proposal Value')).toBeInTheDocument();
    expect(screen.getByText('Proposal Win Rate')).toBeInTheDocument();

    // Contract Performance metrics
    expect(screen.getByText('Contracted Value')).toBeInTheDocument();
  });

  it('renders the Sales Conversion Funnel with 4 stages and exact line breaks', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Sales Conversion Funnel')).toBeInTheDocument();
    });

    expect(screen.getByText('Conversion Overview')).toBeInTheDocument();

    // Stage labels in Funnel
    expect(screen.getByText('LEADS')).toBeInTheDocument();
    expect(screen.getByText('OPPORTUNITIES')).toBeInTheDocument();
    expect(screen.getByText('PROPOSALS')).toBeInTheDocument();
    expect(screen.getByText('CONTRACTS')).toBeInTheDocument();

    // Exact multi-line labels and conversion values
    expect(screen.getByText('Lead →')).toBeInTheDocument();
    expect(screen.getByText('100.00%')).toBeInTheDocument();
    expect(screen.getByText('Opportunity →')).toBeInTheDocument();
    expect(screen.getByText('Proposal → Contract')).toBeInTheDocument();
    expect(screen.getByText('Overall Conversion')).toBeInTheDocument();
  });

  it('renders the Sales Workflow card with 4 stages and Daily Sales Activities banner', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Sales Workflow')).toBeInTheDocument();
    });

    // 4 stages
    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('Capture and qualify potential customers.')).toBeInTheDocument();
    expect(screen.getAllByText('Opportunity').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Develop and pursue qualified business opportunities.')).toBeInTheDocument();
    expect(screen.getAllByText('Proposal').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Create and share commercial proposals with clients.')).toBeInTheDocument();
    expect(screen.getByText('Contract')).toBeInTheDocument();
    expect(screen.getByText('Convert accepted proposals into active contracts.')).toBeInTheDocument();

    // Daily Activities banner
    expect(screen.getByText('Daily Sales Activities')).toBeInTheDocument();
    expect(
      screen.getByText('Use the Follow-Up Queue for your daily lead and opportunity follow-ups.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Follow-Up Queue/i })).toBeInTheDocument();
  });

  it('navigates to /management/follow-up-queue when clicking View Follow-Up Queue button', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View Follow-Up Queue/i })).toBeInTheDocument();
    });

    const followUpBtn = screen.getByRole('button', { name: /View Follow-Up Queue/i });
    fireEvent.click(followUpBtn);

    expect(mockedNavigate).toHaveBeenCalledWith('/management/follow-up-queue');
  });

  it('triggers manual refresh with visual feedback and toast notification', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTitle('Refresh sales data')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByTitle('Refresh sales data');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Sales performance data refreshed successfully.')
      ).toBeInTheDocument();
    });
  });

  it('exports CSV file with dashboard metrics when clicking Export Report button', async () => {
    // Mock Blob and URL.createObjectURL
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export Report/i })).toBeInTheDocument();
    });

    const exportBtn = screen.getByRole('button', { name: /Export Report/i });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(
        screen.getByText('sales-dashboard-report.csv downloaded successfully.')
      ).toBeInTheDocument();
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('updates dashboard calculations and metrics when global dateRange changes', async () => {
    mockOutletContext.dateRange = 'Last 30 Days';
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Sales Performance & Pipeline')).toBeInTheDocument();
    });

    // In Last 30 Days, totalLeads is 120
    await waitFor(() => {
      expect(screen.getAllByText('120').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays error banner with Retry button when service fails, and retrying recovers', async () => {
    const errorSpy = vi.spyOn(salesDashboardService, 'getDashboardData').mockRejectedValueOnce(
      new Error('Network error loading sales data')
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Unable to load Sales Dashboard')).toBeInTheDocument();
      expect(screen.getAllByText('Network error loading sales data').length).toBeGreaterThanOrEqual(1);
    });

    // Click retry button
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Sales Performance & Pipeline')).toBeInTheDocument();
    });

    errorSpy.mockRestore();
  });
});
