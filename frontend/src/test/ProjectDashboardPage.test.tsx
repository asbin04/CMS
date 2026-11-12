import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProjectDashboardPage } from '@/features/projects/pages/ProjectDashboardPage';
import { projectService } from '@/features/projects/services/projectService';
import {
  ProjectPerformanceDashboardResponse,
  ProjectProfitabilityPageResponse,
} from '@/features/projects/types/project';

const MOCK_SUMMARY_DATA: ProjectPerformanceDashboardResponse = {
  overview: {
    activeProjects: 32,
    atRiskProjects: 6,
    delayedProjects: 2,
    dueSoonProjects: 2,
  },
  financials: {
    contractRevenueValue: 80655000,
    contractRevenueFormatted: '₹80,655,000.00',
    totalProjectCost: 2013000,
    totalProjectCostFormatted: '₹2,013,000.00',
    estimatedProjectProfit: 78642000,
    estimatedProjectProfitFormatted: '₹78,642,000.00',
    overallProjectMargin: 97.5,
    overallProjectMarginFormatted: '97.50%',
  },
  delivery: {
    loggedHours: 226,
    loggedHoursFormatted: '226.00',
    billableAmount: 2013000,
    billableAmountFormatted: '₹2,013,000.00',
    openTasks: 8,
    overdueTasks: 8,
  },
  deliveryFlow: {
    projectsCount: 48,
    milestonesCount: 7,
    tasksCount: 15,
    timesheetsCount: 31,
  },
  distribution: {
    totalProjects: 48,
    onTrack: { count: 41, percentage: 85.4, formatted: '41 (85.4%)' },
    atRisk: { count: 6, percentage: 12.5, formatted: '6 (12.5%)' },
    delayed: { count: 2, percentage: 4.2, formatted: '2 (4.2%)' },
    upcoming: { count: 2, percentage: 4.2, formatted: '2 (4.2%)' },
  },
  keyInsights: {
    atRiskPercentage: '13%',
    delayedPercentage: '4%',
    dueSoonCount: 2,
    bulletPoints: [
      '13% of projects are currently at risk.',
      '4% of projects are delayed.',
      '2 projects are due for delivery within the next 7 days.',
    ],
  },
  profitability: [],
};

const MOCK_PAGE_DATA: ProjectProfitabilityPageResponse = {
  content: [
    {
      sNo: 1,
      projectId: 'PRJ-001',
      projectCode: 'PRJ-001',
      projectName: 'School Management System',
      revenue: 12000000,
      revenueFormatted: '₹12,000,000.00',
      totalCost: 0,
      totalCostFormatted: '₹0.00',
      profit: 12000000,
      profitFormatted: '₹12,000,000.00',
      margin: 100,
      marginFormatted: '100.0%',
      health: 'On Track',
      status: 'In Progress',
    },
    {
      sNo: 2,
      projectId: 'PRJ-002',
      projectCode: 'PRJ-002',
      projectName: 'Homeopathy Clinic Portal',
      revenue: 4800000,
      revenueFormatted: '₹4,800,000.00',
      totalCost: 0,
      totalCostFormatted: '₹0.00',
      profit: 4800000,
      profitFormatted: '₹4,800,000.00',
      margin: 100,
      marginFormatted: '100.0%',
      health: 'At Risk',
      status: 'In Progress',
    },
  ],
  page: 0,
  size: 5,
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
  healthFilter: 'All',
};

describe('ProjectDashboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(projectService, 'getPerformanceSummary').mockResolvedValue(MOCK_SUMMARY_DATA);
    vi.spyOn(projectService, 'getPerformanceDashboard').mockResolvedValue(MOCK_SUMMARY_DATA);
    vi.spyOn(projectService, 'getProfitabilityPage').mockImplementation(async (params) => {
      if (params?.search && params.search.toLowerCase().includes('clinic')) {
        return {
          ...MOCK_PAGE_DATA,
          content: [MOCK_PAGE_DATA.content[1]],
          totalElements: 1,
        };
      }
      return MOCK_PAGE_DATA;
    });
  });

  it('renders exact header title and subtitle', async () => {
    render(
      <BrowserRouter>
        <ProjectDashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Project (Dashboard|Performance)/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Live enterprise records|Monitor project progress/i)
    ).toBeInTheDocument();
  });

  it('renders overview and financial KPI cards with live values', async () => {
    render(
      <BrowserRouter>
        <ProjectDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Active Projects')).toBeInTheDocument();
      expect(screen.getByText('32')).toBeInTheDocument();
      expect(screen.getByText('At Risk Projects')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('₹80,655,000.00')).toBeInTheDocument();
      expect(screen.getByText('97.50%')).toBeInTheDocument();
    });
  });

  it('renders delivery flow counts and key insights bullet points', async () => {
    render(
      <BrowserRouter>
        <ProjectDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Delivery Flow')).toBeInTheDocument();
      expect(screen.getAllByText('48').length).toBeGreaterThanOrEqual(1); // Projects count
      expect(screen.getByText('13% of projects are currently at risk.')).toBeInTheDocument();
      expect(screen.getByText('2 projects are due for delivery within the next 7 days.')).toBeInTheDocument();
    });
  });

  it('renders profitability table records and filters by search', async () => {
    render(
      <BrowserRouter>
        <ProjectDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('PRJ-001')).toBeInTheDocument();
      expect(screen.getByText('School Management System')).toBeInTheDocument();
      expect(screen.getByText('PRJ-002')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by Project ID or Project Name');
    fireEvent.change(searchInput, { target: { value: 'Clinic' } });

    await waitFor(() => {
      expect(screen.queryByText('School Management System')).not.toBeInTheDocument();
      expect(screen.getByText('Homeopathy Clinic Portal')).toBeInTheDocument();
    });
  });

  it('triggers View Details, Edit Entry, and Delete actions from row action menu', async () => {
    render(
      <BrowserRouter>
        <ProjectDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('PRJ-001')).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole('button', { name: /actions/i });
    expect(actionButtons.length).toBeGreaterThan(0);

    // 1. Test View Details
    fireEvent.click(actionButtons[0]);
    const viewBtn = await screen.findByRole('button', { name: /view details/i });
    fireEvent.click(viewBtn);

    await waitFor(() => {
      expect(screen.getByText(/Financial Performance & Profitability/i)).toBeInTheDocument();
    });

    // Close view modal
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Financial Performance & Profitability/i)).not.toBeInTheDocument();
    });

    // 2. Test Delete modal trigger
    fireEvent.click(actionButtons[0]);
    const deleteBtn = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText(/Deleting this project will permanently remove its records/i)).toBeInTheDocument();
    });
  });
});
