import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UatPage } from '@/features/projects/pages/UatPage';
import { uatService, INITIAL_UAT_ITEMS, INITIAL_UAT_KPIS } from '@/features/projects/services/uatService';

describe('UatPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(uatService, 'getUats').mockResolvedValue(INITIAL_UAT_ITEMS);
    vi.spyOn(uatService, 'getKpis').mockResolvedValue(INITIAL_UAT_KPIS);
    vi.spyOn(uatService, 'getFilterOptions').mockResolvedValue({
      projects: ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005'],
      statuses: ['Passed', 'In Testing', 'Failed'],
      clientApprovals: ['Approved', 'Pending'],
      testers: ['Amit Sharma', 'Sneha Nair', 'Divya Patel', 'Rohan Verma', 'Vikram Shah'],
    });
  });

  it('renders exact header title and subtitle from Figma specification', async () => {
    render(
      <BrowserRouter>
        <UatPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'UAT (User Acceptance Testing)' })).toBeInTheDocument();
    expect(
      screen.getByText('Manage UAT executions, test results, defects and client approvals.')
    ).toBeInTheDocument();
  });

  it('renders all 5 KPI cards with exact metrics and trends', async () => {
    render(
      <BrowserRouter>
        <UatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Card 1: Total UATs
      expect(screen.getByText('Total UATs')).toBeInTheDocument();
      expect(screen.getByText('324')).toBeInTheDocument();
      expect(screen.getByText('↑ 14%')).toBeInTheDocument();

      // Card 2: In Testing
      expect(screen.getAllByText('In Testing').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('96')).toBeInTheDocument();
      expect(screen.getByText('↑ 18%')).toBeInTheDocument();

      // Card 3: Passed
      expect(screen.getAllByText('Passed').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('182')).toBeInTheDocument();
      expect(screen.getByText('↑ 20%')).toBeInTheDocument();

      // Card 4: Defect Logged
      expect(screen.getByText('Defect Logged')).toBeInTheDocument();
      expect(screen.getByText('46')).toBeInTheDocument();
      expect(screen.getByText('↑ 12%')).toBeInTheDocument();

      // Card 5: Client Approved
      expect(screen.getByText('Client Approved')).toBeInTheDocument();
      expect(screen.getByText('168')).toBeInTheDocument();
      expect(screen.getByText('↑ 16%')).toBeInTheDocument();
    });
  });

  it('renders action buttons and filter bar elements', async () => {
    render(
      <BrowserRouter>
        <UatPage />
      </BrowserRouter>
    );

    // Action buttons
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Add UAT')).toBeInTheDocument();

    // Filter controls
    expect(
      screen.getByPlaceholderText('Search by UAT ID, Project ID, Requirement ID, Test Case...')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Projects')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Status')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All incubation/Testers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Filters/i })).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('renders all 14 table columns matching Figma layout', async () => {
    render(
      <BrowserRouter>
        <UatPage />
      </BrowserRouter>
    );

    const headers = [
      'UAT ID',
      'Project ID',
      'Requirement ID',
      'Test Date',
      'Test Case',
      'Expected Result',
      'Actual Result',
      'Tester',
      'Status',
      'Defect ID',
      'Client Approval',
      'Approval Date',
      'Comments',
      'Actions',
    ];

    const table = screen.getByRole('table');
    const thead = table.querySelector('thead')!;
    headers.forEach((header) => {
      expect(within(thead).getByText(header)).toBeInTheDocument();
    });
  });

  it('renders row data with tester avatar initials, defect IDs, and status pills', async () => {
    render(
      <BrowserRouter>
        <UatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // UAT rows from design
      expect(screen.getByText('UAT-2026-0483')).toBeInTheDocument();
      expect(screen.getAllByText('PRJ-001').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('REQ-2026-0184')).toBeInTheDocument();
      expect(screen.getByText('TC-001')).toBeInTheDocument();

      // Tester with initials avatar
      expect(screen.getAllByText('Amit Sharma').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('AS').length).toBeGreaterThanOrEqual(1);

      // Defect IDs
      expect(screen.getByText('DEF-0147')).toBeInTheDocument();
    });
  });

  it('filters table rows dynamically via search input', async () => {
    render(
      <BrowserRouter>
        <UatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('UAT-2026-0483')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by UAT ID, Project ID, Requirement ID, Test Case...');
    fireEvent.change(searchInput, { target: { value: 'TC-004' } });

    await waitFor(() => {
      expect(screen.getByText('TC-004')).toBeInTheDocument();
      expect(screen.queryByText('TC-001')).not.toBeInTheDocument();
    });
  });

  it('opens and closes Add UAT modal', async () => {
    render(
      <BrowserRouter>
        <UatPage />
      </BrowserRouter>
    );

    const addBtn = screen.getByText('Add UAT');
    fireEvent.click(addBtn);

    expect(screen.getByText('Add New UAT Execution')).toBeInTheDocument();

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Add New UAT Execution')).not.toBeInTheDocument();
    });
  });

  it('displays error banner and retry button when backend fetch fails', async () => {
    vi.spyOn(uatService, 'getUats').mockRejectedValueOnce(new Error('Network error from backend'));

    render(
      <BrowserRouter>
        <UatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Network error from backend')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('toggles filter dropdowns row when Filters button is clicked', async () => {
    render(
      <BrowserRouter>
        <UatPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('uat-filter-dropdowns-row')).toBeInTheDocument();
    });

    // Click Filters button -> closes all filters
    const filterBtn = screen.getByRole('button', { name: /^Filters/i });
    fireEvent.click(filterBtn);

    expect(screen.queryByTestId('uat-filter-dropdowns-row')).not.toBeInTheDocument();

    // Click Filters button again -> opens all filters
    fireEvent.click(filterBtn);
    expect(screen.getByTestId('uat-filter-dropdowns-row')).toBeInTheDocument();
  });
});
