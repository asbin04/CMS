import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SupportTicketsPage } from '../features/support/pages/SupportTicketsPage';
import { ticketService } from '../features/support/services/ticketService';
import { SupportTicketItem, SupportTicketKpis, SupportTicketFilterOptions, SupportTicketTrendsData } from '../features/support/types/tickets';

vi.mock('../features/support/services/ticketService', () => ({
  ticketService: {
    getTickets: vi.fn(),
    getKpis: vi.fn(),
    getTrends: vi.fn(),
    getFilterOptions: vi.fn(),
    createTicket: vi.fn(),
    updateTicket: vi.fn(),
    deleteTicket: vi.fn(),
  },
}));

const mockTickets: SupportTicketItem[] = [
  {
    id: 1,
    ticketCode: 'ST-2026-0186',
    clientId: 'CL-001',
    clientName: 'Acme Corp',
    projectId: 'PRJ-001',
    projectName: 'Cloud ERP Migration',
    amcSlaId: 'AMC-001',
    openedDate: '2026-10-28',
    ticketType: 'Issue',
    priority: 'High',
    issueRequest: 'Application login failure',
    description: 'Users unable to authenticate via SSO portal',
    assignedTo: 'Rohan Verma',
    assignedToEmail: 'rohan.v@company.com',
    status: 'In Progress',
    channel: 'Portal',
    resolutionTime: '-',
    slaDueDate: '2026-10-29',
    slaStatus: 'Within SLA',
  },
  {
    id: 2,
    ticketCode: 'ST-2026-0185',
    clientId: 'CL-003',
    clientName: 'Apex Financial',
    projectId: 'PRJ-002',
    projectName: 'Mobile Banking App',
    amcSlaId: 'SLA-002',
    openedDate: '2026-10-27',
    ticketType: 'Request',
    priority: 'Medium',
    issueRequest: 'Access for new user',
    description: 'Onboarding access provisioning',
    assignedTo: 'Sneha Nair',
    assignedToEmail: 'sneha.n@company.com',
    status: 'Pending',
    channel: 'Email',
    resolutionTime: '-',
    slaDueDate: '2026-10-30',
    slaStatus: 'Within SLA',
  },
];

const mockKpis: SupportTicketKpis = {
  totalTickets: 186,
  openTickets: 34,
  resolvedTickets: 124,
  slaBreaches: 6,
  slaCompliance: 96.8,
  slaComplianceFormatted: '96.8%',
};

const mockFilterOptions: SupportTicketFilterOptions = {
  ticketTypes: ['Issue', 'Request', 'Incident', 'Bug', 'Task'],
  priorities: ['High', 'Medium', 'Low', 'Urgent'],
  statuses: ['In Progress', 'Pending', 'Resolved', 'Closed'],
  slaStatuses: ['Within SLA', 'At Risk', 'Breached'],
};

const mockTrends: SupportTicketTrendsData = {
  totalTickets: 186,
  totalTicketsTrend: '↑ 12.7%',
  resolutionRate: 66.7,
  resolutionRateTrend: '↑ 8.4%',
  avgResponseHours: '1.2 hrs',
  avgResponseHoursTrend: '↓ 34.8%',
  avgResolutionHours: '18.6 hrs',
  avgResolutionHoursTrend: '↓ 28.1%',
  slaCompliance: 96.8,
  slaComplianceTrend: '↑ 2.9%',
  volumeTrends: [
    { month: 'Jun 2026', resolved: 12, inProgress: 5, pending: 3, total: 20 },
    { month: 'Jul 2026', resolved: 15, inProgress: 7, pending: 4, total: 26 },
    { month: 'Aug 2026', resolved: 14, inProgress: 6, pending: 2, total: 22 },
    { month: 'Sep 2026', resolved: 18, inProgress: 8, pending: 4, total: 30 },
    { month: 'Oct 2026', resolved: 20, inProgress: 12, pending: 10, total: 42 },
  ],
  slaPerformance: {
    complianceRate: 96.8,
    withinSlaCount: 180,
    withinSlaPercentage: 96.8,
    slaBreachCount: 6,
    slaBreachPercentage: 3.2,
    improvementNote: 'SLA compliance has improved by 2.9% compared to the previous period.',
  },
  typeBreakdown: [
    { type: 'Issue', count: 72, percentage: 38.7, color: '#4F46E5' },
    { type: 'Request', count: 58, percentage: 31.2, color: '#A78BFA' },
    { type: 'Change', count: 24, percentage: 12.9, color: '#60A5FA' },
    { type: 'Other', count: 32, percentage: 17.2, color: '#E0E7FF' },
  ],
  priorityDistribution: [
    { priority: 'High', count: 48, color: '#F87171' },
    { priority: 'Medium', count: 62, color: '#FCD34D' },
    { priority: 'Low', count: 50, color: '#6EE7B7' },
  ],
  keyInsights: [
    'SLA compliance is at 96.8% (↑ 2.9%).',
    'Average resolution time reduced to 18.6 hrs (↓ 28.1%).',
    '54.8% of tickets are Issues, followed by Requests (31.2%).',
    'SLA breaches are 6 tickets (3.2%), down from the previous period.',
  ],
};

describe('SupportTicketsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ticketService.getTickets).mockResolvedValue(mockTickets);
    vi.mocked(ticketService.getKpis).mockResolvedValue(mockKpis);
    vi.mocked(ticketService.getTrends).mockResolvedValue(mockTrends);
    vi.mocked(ticketService.getFilterOptions).mockResolvedValue(mockFilterOptions);
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <SupportTicketsPage />
      </BrowserRouter>
    );

  it('renders page header title and subtitle correctly', async () => {
    renderComponent();

    expect(screen.getByRole('heading', { level: 1, name: /Support Tickets/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Track, manage, and resolve client support requests with SLA monitoring/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Export/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Ticket/i)).toBeInTheDocument();
  });

  it('renders tabs with Tickets active', async () => {
    renderComponent();

    const ticketsTab = screen.getByRole('button', { name: /^Tickets$/i });
    const trendsTab = screen.getByRole('button', { name: /Trends & SLA/i });

    expect(ticketsTab).toBeInTheDocument();
    expect(trendsTab).toBeInTheDocument();
    expect(ticketsTab).toHaveClass('text-[#4F46E5]');
  });

  it('renders 5 KPI cards with live data from mockKpis', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Total Tickets')).toBeInTheDocument();
      expect(screen.getByText('186')).toBeInTheDocument();
      expect(screen.getByText('Open Tickets')).toBeInTheDocument();
      expect(screen.getByText('34')).toBeInTheDocument();
      expect(screen.getByText('Resolved Tickets')).toBeInTheDocument();
      expect(screen.getByText('124')).toBeInTheDocument();
      expect(screen.getByText('SLA Breaches')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('SLA Compliance')).toBeInTheDocument();
      expect(screen.getByText('96.8%')).toBeInTheDocument();
    });
  });

  it('renders table columns and ticket rows', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('ST-2026-0186')).toBeInTheDocument();
      expect(screen.getByText('ST-2026-0185')).toBeInTheDocument();
      expect(screen.getByText('Application login failure')).toBeInTheDocument();
      expect(screen.getByText('Access for new user')).toBeInTheDocument();
      expect(screen.getByText('Rohan Verma')).toBeInTheDocument();
      expect(screen.getByText('Sneha Nair')).toBeInTheDocument();
    });
  });

  it('clears filters when Clear Filters button is clicked', async () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/Search by Ticket ID/i);
    fireEvent.change(searchInput, { target: { value: 'login' } });
    expect(searchInput).toHaveValue('login');

    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearBtn);

    expect(searchInput).toHaveValue('');
  });

  it('toggles filter dropdowns row when Filters button is clicked', async () => {
    renderComponent();

    // Initially open
    expect(screen.getByTestId('filter-dropdowns-row')).toBeInTheDocument();

    // Click Filters button -> closes all filters
    const filterBtn = screen.getByRole('button', { name: /^Filters$/i });
    fireEvent.click(filterBtn);

    expect(screen.queryByTestId('filter-dropdowns-row')).not.toBeInTheDocument();

    // Click Filters button again -> opens all filters
    fireEvent.click(filterBtn);
    expect(screen.getByTestId('filter-dropdowns-row')).toBeInTheDocument();
  });

  it('opens create ticket modal when Create Ticket button is clicked', async () => {
    renderComponent();

    const createBtn = screen.getByRole('button', { name: /Create Ticket/i });
    fireEvent.click(createBtn);

    expect(screen.getByText('Issue / Request Summary *')).toBeInTheDocument();
  });

  it('switches to Trends & SLA tab and renders charts and insights', async () => {
    renderComponent();

    const trendsTab = screen.getByRole('button', { name: /Trends & SLA/i });
    fireEvent.click(trendsTab);

    await waitFor(() => {
      expect(screen.getByText('Ticket Volume Trend')).toBeInTheDocument();
      expect(screen.getByText('SLA Performance')).toBeInTheDocument();
      expect(screen.getByText('Ticket Type Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Priority Distribution')).toBeInTheDocument();
      expect(screen.getByText('Key Insights')).toBeInTheDocument();
      expect(screen.getByText('Resolution Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg. Response Time')).toBeInTheDocument();
      expect(screen.getByText('Avg. Resolution Time')).toBeInTheDocument();
    });
  });

  it('displays chart tooltips and toggles weekly/monthly view on Trends & SLA tab', async () => {
    renderComponent();

    const trendsTab = screen.getByRole('button', { name: /Trends & SLA/i });
    fireEvent.click(trendsTab);

    await waitFor(() => {
      expect(screen.getByText('Ticket Volume Trend')).toBeInTheDocument();
    });

    // Toggle view from Monthly to Weekly
    const viewBtn = screen.getByRole('button', { name: /Monthly/i });
    fireEvent.click(viewBtn);

    expect(screen.getByText('W1')).toBeInTheDocument();

    // Toggle back to Monthly
    const weeklyBtn = screen.getByRole('button', { name: /Weekly/i });
    fireEvent.click(weeklyBtn);

    expect(screen.getByText('Oct 2026')).toBeInTheDocument();
  });

  it('opens row options menu and triggers edit modal', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('ST-2026-0186')).toBeInTheDocument();
    });

    const rowOptionsButtons = screen.getAllByRole('button', { name: /Row options/i });
    expect(rowOptionsButtons.length).toBeGreaterThan(0);
    fireEvent.click(rowOptionsButtons[0]);

    const editBtn = screen.getByRole('button', { name: /Edit Ticket/i });
    expect(editBtn).toBeInTheDocument();
    fireEvent.click(editBtn);

    expect(screen.getByText('Edit Support Ticket')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });
});

