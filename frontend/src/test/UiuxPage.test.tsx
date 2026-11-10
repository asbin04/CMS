import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UiuxPage } from '@/features/projects/pages/UiuxPage';
import { uiuxService, INITIAL_UIUX_DESIGNS, INITIAL_UIUX_KPIS } from '@/features/projects/services/uiuxService';

describe('UiuxPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(uiuxService, 'getDesigns').mockResolvedValue(INITIAL_UIUX_DESIGNS);
    vi.spyOn(uiuxService, 'getKpis').mockResolvedValue(INITIAL_UIUX_KPIS);
    vi.spyOn(uiuxService, 'getFilterOptions').mockResolvedValue({
      projects: ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005'],
      designTypes: ['UI Design', 'UI/UX'],
      approvalStatuses: ['Pending', 'Approved'],
      statuses: ['In Progress', 'Completed'],
      designers: ['Amit Sharma', 'Sneha Nair', 'Divya Patel', 'Rohan Verma', 'Vikram Shah'],
    });
  });

  it('renders exact header title and subtitle from Figma specification', async () => {
    render(
      <BrowserRouter>
        <UiuxPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'UI/UX' })).toBeInTheDocument();
    expect(
      screen.getByText('Manage design deliverables, versions, client feedback, approvals and change requests.')
    ).toBeInTheDocument();
  });

  it('renders all 5 KPI cards with exact metrics and trends', async () => {
    render(
      <BrowserRouter>
        <UiuxPage />
      </BrowserRouter>
    );

    // Card 1: Total Designs
    expect(screen.getByText('Total Designs')).toBeInTheDocument();
    expect(screen.getByText('256')).toBeInTheDocument();
    expect(screen.getByText('↑ 18%')).toBeInTheDocument();

    // Card 2: In Progress
    expect(screen.getAllByText('In Progress').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('↑ 22%')).toBeInTheDocument();

    // Card 3: Approved
    expect(screen.getAllByText('Approved').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('118')).toBeInTheDocument();
    expect(screen.getByText('↑ 16%')).toBeInTheDocument();

    // Card 4: Change Requests
    expect(screen.getByText('Change Requests')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('↑ 33%')).toBeInTheDocument();

    // Card 5: Pending Approval
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('↑ 10%')).toBeInTheDocument();
  });

  it('renders action buttons and filter bar elements', async () => {
    render(
      <BrowserRouter>
        <UiuxPage />
      </BrowserRouter>
    );

    // Action buttons
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Add Design')).toBeInTheDocument();

    // Filter controls
    expect(
      screen.getByPlaceholderText('Search by Design ID, Project ID, Screen / Feature...')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Projects')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
    // Both Approval Status and Status dropdowns have "All Status"
    expect(screen.getAllByDisplayValue('All Status').length).toBe(2);
    expect(screen.getByText('More Filters')).toBeInTheDocument();
  });

  it('renders the 17 table columns matching Figma layout', async () => {
    render(
      <BrowserRouter>
        <UiuxPage />
      </BrowserRouter>
    );

    const headers = [
      'Design ID',
      'Project ID',
      'Requirement ID',
      'Screen / Feature',
      'Design Type',
      'Version',
      'Designer',
      'Asset / Prototype Link',
      'Client Feedback',
      'Feedback Date',
      'Approval Status',
      'Approved By',
      'Approval Date',
      'Change Request',
      'Status',
      'Notes',
      'Actions',
    ];

    const table = screen.getByRole('table');
    const thead = table.querySelector('thead')!;
    headers.forEach((header) => {
      expect(within(thead).getByText(header)).toBeInTheDocument();
    });
  });

  it('renders prototype tools including Figma and Adobe XD badges', async () => {
    render(
      <BrowserRouter>
        <UiuxPage />
      </BrowserRouter>
    );

    // Adobe XD badges 'Xd' exist in initial items (Patient Profile, User Management, Invoice Creation)
    const xdBadges = screen.getAllByText('Xd');
    expect(xdBadges.length).toBeGreaterThanOrEqual(1);

    // View Prototype links
    const prototypeLinks = screen.getAllByText('View Prototype');
    expect(prototypeLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('filters table rows dynamically via search input', async () => {
    render(
      <BrowserRouter>
        <UiuxPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search by Design ID, Project ID, Screen / Feature...');
    fireEvent.change(searchInput, { target: { value: 'Patient Profile' } });

    await waitFor(() => {
      expect(screen.getByText('Patient Profile')).toBeInTheDocument();
      expect(screen.queryByText('Login Screen')).not.toBeInTheDocument();
    });
  });

  it('opens and closes Add Design modal', async () => {
    render(
      <BrowserRouter>
        <UiuxPage />
      </BrowserRouter>
    );

    const addBtn = screen.getByText('Add Design');
    fireEvent.click(addBtn);

    expect(screen.getByText('Add New Design Deliverable')).toBeInTheDocument();

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Add New Design Deliverable')).not.toBeInTheDocument();
    });
  });

  it('renders filter controls bar above the table in layout order', () => {
    render(
      <BrowserRouter>
        <UiuxPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search by Design ID, Project ID, Screen / Feature...');
    const table = screen.getByRole('table');

    // Filter bar must appear before table in document position
    expect(searchInput.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('displays error banner and retry button when backend fetch fails', async () => {
    vi.spyOn(uiuxService, 'getDesigns').mockRejectedValueOnce(new Error('Network error from backend'));

    render(
      <BrowserRouter>
        <UiuxPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Network error from backend')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Trigger retry
    vi.spyOn(uiuxService, 'getDesigns').mockResolvedValueOnce(INITIAL_UIUX_DESIGNS);
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('creates a new design and displays success feedback banner', async () => {
    const newDesign = {
      ...INITIAL_UIUX_DESIGNS[0],
      id: 'DES-2026-0999',
      screenFeature: 'Dynamic Checkout Flow',
    };
    vi.spyOn(uiuxService, 'createDesign').mockResolvedValueOnce(newDesign);
    vi.spyOn(uiuxService, 'getDesigns').mockResolvedValueOnce([newDesign, ...INITIAL_UIUX_DESIGNS]);

    render(
      <BrowserRouter>
        <UiuxPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Add Design'));
    expect(screen.getByText('Add New Design Deliverable')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('e.g. REQ-2026-0186'), {
      target: { value: 'REQ-2026-9999' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. Checkout & Payment Screen'), {
      target: { value: 'Dynamic Checkout Flow' },
    });

    fireEvent.click(screen.getByRole('button', { name: '+ Add Design' }));

    await waitFor(() => {
      expect(screen.getByText('Design Created')).toBeInTheDocument();
      expect(screen.getByText('Design deliverable created successfully.')).toBeInTheDocument();
    });
  });
});
