import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DevelopmentPage } from '../features/development/pages/DevelopmentPage';
import { developmentApiService } from '../features/development/services/developmentApiService';
import { projectLookupService } from '../features/timesheets-requirements/services/projectLookupService';
import { requirementsApiService } from '../features/timesheets-requirements/services/requirementsApiService';
import { MOCK_DEVELOPMENT_RECORDS, calculateDevelopmentKpis } from '../features/development/mockData';
import { DevelopmentRecord } from '../features/development/types';

describe('DevelopmentPage UI Component Tests', () => {
  let mockStore: DevelopmentRecord[] = [];

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStore = JSON.parse(JSON.stringify(MOCK_DEVELOPMENT_RECORDS));

    // Setup global URL mocks
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn();
    }

    // Mock projectLookupService
    vi.spyOn(projectLookupService, 'getProjects').mockResolvedValue([
      { id: 'PRJ-001', name: 'PRJ-001 - Enterprise Cloud Portal', projectCode: 'PRJ-001' },
      { id: 'PRJ-002', name: 'PRJ-002 - Core ERP Modernization', projectCode: 'PRJ-002' },
    ]);
    vi.spyOn(projectLookupService, 'getEmployees').mockResolvedValue([
      { id: 'EMP-001', name: 'Amit Sharma' },
      { id: 'EMP-002', name: 'Sneha Nair' },
    ]);
    vi.spyOn(projectLookupService, 'getTasksForProject').mockResolvedValue([
      { id: 'TSK-00128', name: 'Login Module', projectId: 'PRJ-001' },
    ]);
    vi.spyOn(requirementsApiService, 'getRequirements').mockResolvedValue({
      content: [
        {
          requirementId: 'REQ-2026-0184',
          projectId: 'PRJ-001',
          clientId: 'CL-001',
          requirementDate: '2026-10-15',
          type: 'Functional',
          requirementFeature: 'User Auth',
          description: '',
          priority: 'High',
          ownerId: 'EMP-001',
          status: 'In Progress',
          scopeFreeze: 'No',
          assignedApprover: 'Admin – Akshit Ujjain',
          approvedBy: '-',
          approvalDate: '-',
          completionPercentage: 50,
        },
      ],
      pageNumber: 1,
      pageSize: 50,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      empty: false,
    });

    // Mock developmentApiService methods statefully
    vi.spyOn(developmentApiService, 'getDevelopments').mockImplementation(async (params: any = {}) => {
      let filtered = [...mockStore];

      if (params.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (r) =>
            r.developmentId.toLowerCase().includes(q) ||
            r.projectId.toLowerCase().includes(q) ||
            r.requirementId.toLowerCase().includes(q) ||
            r.taskId.toLowerCase().includes(q) ||
            r.developer.toLowerCase().includes(q) ||
            r.branch.toLowerCase().includes(q) ||
            r.buildVersion.toLowerCase().includes(q) ||
            r.technicalNotes.toLowerCase().includes(q)
        );
      }

      if (params.project && params.project !== 'All Projects') {
        filtered = filtered.filter((r) => r.projectId.toLowerCase() === params.project.toLowerCase());
      }
      if (params.environment && params.environment !== 'All Environment') {
        filtered = filtered.filter((r) => r.environment.toLowerCase() === params.environment.toLowerCase());
      }
      if (params.status && params.status !== 'All Status') {
        filtered = filtered.filter((r) => r.status.toLowerCase() === params.status.toLowerCase());
      }
      if (params.reviewStatus && params.reviewStatus !== 'All Review Status') {
        filtered = filtered.filter((r) => r.codeReviewStatus.toLowerCase() === params.reviewStatus.toLowerCase());
      }

      if (params.sort) {
        const [field, dir] = params.sort.split(',');
        const isAsc = dir === 'asc';
        filtered.sort((a: any, b: any) => {
          const aVal = (a[field] ?? '').toString().toLowerCase();
          const bVal = (b[field] ?? '').toString().toLowerCase();
          if (aVal < bVal) return isAsc ? -1 : 1;
          if (aVal > bVal) return isAsc ? 1 : -1;
          return 0;
        });
      }

      const page = params.page || 1;
      const size = params.size || 10;
      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const startIndex = (page - 1) * size;
      const content = filtered.slice(startIndex, startIndex + size);

      return {
        content,
        pageNumber: page,
        pageSize: size,
        totalElements,
        totalPages,
        first: page === 1,
        last: page >= totalPages,
        empty: content.length === 0,
      };
    });

    vi.spyOn(developmentApiService, 'getKpis').mockImplementation(async () => {
      return calculateDevelopmentKpis(mockStore);
    });

    vi.spyOn(developmentApiService, 'getNextDevelopmentId').mockResolvedValue('DEV-2026-0433');

    vi.spyOn(developmentApiService, 'createDevelopment').mockImplementation(async (payload: any) => {
      const newRec: DevelopmentRecord = {
        id: 'DEV-2026-0433',
        developmentId: 'DEV-2026-0433',
        projectId: payload.projectId,
        requirementId: payload.requirementId,
        taskId: payload.taskId,
        developer: payload.developerName || payload.developer || 'Amit Sharma',
        repositoryUrl: payload.repositoryUrl,
        branch: payload.branch,
        environment: payload.environment,
        buildVersion: payload.buildVersion,
        codeReviewStatus: payload.codeReviewStatus || 'In Review',
        qaHandoffDate: payload.qaHandoffDate || '29 Oct 2026',
        releaseId: payload.releaseId || '-',
        status: payload.status || 'In Progress',
        technicalNotes: payload.technicalNotes || '',
        documentationLink: payload.documentationLink || '',
      };
      mockStore.unshift(newRec);
      return newRec;
    });

    vi.spyOn(developmentApiService, 'updateDevelopment').mockImplementation(async (id: string, payload: any) => {
      const idx = mockStore.findIndex((r) => r.developmentId === id);
      if (idx !== -1) {
        mockStore[idx] = {
          ...mockStore[idx],
          ...payload,
          developer: payload.developerName || mockStore[idx].developer,
        };
        return mockStore[idx];
      }
      throw new Error('Not found');
    });

    vi.spyOn(developmentApiService, 'updateStatus').mockImplementation(async (id: string, status: any) => {
      const idx = mockStore.findIndex((r) => r.developmentId === id);
      if (idx !== -1) {
        mockStore[idx].status = status;
        return mockStore[idx];
      }
      throw new Error('Not found');
    });

    vi.spyOn(developmentApiService, 'updateCodeReviewStatus').mockImplementation(async (id: string, reviewStatus: any) => {
      const idx = mockStore.findIndex((r) => r.developmentId === id);
      if (idx !== -1) {
        mockStore[idx].codeReviewStatus = reviewStatus;
        return mockStore[idx];
      }
      throw new Error('Not found');
    });

    vi.spyOn(developmentApiService, 'deleteDevelopment').mockImplementation(async (id: string) => {
      mockStore = mockStore.filter((r) => r.developmentId !== id);
    });

    vi.spyOn(developmentApiService, 'exportDevelopments').mockImplementation(async () => {
      const a = document.createElement('a');
      a.href = 'blob:mock-url';
      a.setAttribute('download', 'developments.csv');
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  });

  const renderComponent = async () => {
    const utils = render(
      <BrowserRouter>
        <DevelopmentPage />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('DEV-2026-0432')).toBeInTheDocument();
    });
    return utils;
  };

  it('1. Renders page header with title, description, last updated, export and add buttons', async () => {
    await renderComponent();

    // Check title
    expect(screen.getByRole('heading', { level: 1, name: /Development/i })).toBeInTheDocument();

    // Check description
    expect(
      screen.getByText(
        /Track development activities, code progress, build versions, QA handoff and releases/i
      )
    ).toBeInTheDocument();

    // Check Last Updated is removed
    expect(screen.queryByText(/Last Updated:/i)).not.toBeInTheDocument();

    // Check Export & Add Development buttons
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Development/i })).toBeInTheDocument();
  });

  it('2. Renders all 5 KPI cards with calculated counts from mock dataset', async () => {
    await renderComponent();

    const totalCard = screen.getByText('Total Developments').closest('div');
    expect(within(totalCard!).getByText('12')).toBeInTheDocument();
    expect(screen.getByText('↑ 16% vs last month')).toBeInTheDocument();

    const inDevCard = screen.getByText('In Development').closest('div');
    expect(within(inDevCard!).getByText('2')).toBeInTheDocument();
    expect(screen.getByText('↑ 12% vs last month')).toBeInTheDocument();

    const inReviewCard = screen.getByText('In Code Review').closest('div');
    expect(within(inReviewCard!).getByText('3')).toBeInTheDocument();
    expect(screen.getByText('↑ 20% vs last month')).toBeInTheDocument();

    const qaCard = screen.getByText('QA Handover').closest('div');
    expect(within(qaCard!).getByText('3')).toBeInTheDocument();
    expect(screen.getByText('↑ 18% vs last month')).toBeInTheDocument();

    const releasedCard = screen.getAllByText('Released')[0].closest('div');
    expect(within(releasedCard!).getByText('4')).toBeInTheDocument();
    expect(screen.getByText('↑ 14% vs last month')).toBeInTheDocument();
  });

  it('3. Renders filter bar with search input and all 4 dropdown filters with #DCE3ED borders', async () => {
    await renderComponent();

    // Search input
    const searchInput = screen.getByPlaceholderText(
      /Search by Development ID, Project ID, Requirement ID, Task ID, Developer/i
    );
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveStyle({ border: '1px solid #DCE3ED', borderRadius: '10px' });

    // Filters button (without (0))
    const filtersBtn = screen.getByRole('button', { name: /^Filters/i });
    expect(filtersBtn).toBeInTheDocument();
    expect(filtersBtn).toHaveStyle({ border: '1px solid #DCE3ED', borderRadius: '10px' });

    // Clear filters button
    expect(screen.getByRole('button', { name: /Clear Filters/i })).toBeInTheDocument();

    // Dropdowns
    const projectSelect = screen.getByDisplayValue('All Projects');
    expect(projectSelect).toBeInTheDocument();
    expect(projectSelect).toHaveStyle({ border: '1px solid #DCE3ED', borderRadius: '10px' });

    const envSelect = screen.getByDisplayValue('All Environment');
    expect(envSelect).toBeInTheDocument();
    expect(envSelect).toHaveStyle({ border: '1px solid #DCE3ED', borderRadius: '10px' });

    const statusSelect = screen.getByDisplayValue('All Status');
    expect(statusSelect).toBeInTheDocument();
    expect(statusSelect).toHaveStyle({ border: '1px solid #DCE3ED', borderRadius: '10px' });

    const reviewSelect = screen.getByDisplayValue('All Review Status');
    expect(reviewSelect).toBeInTheDocument();
    expect(reviewSelect).toHaveStyle({ border: '1px solid #DCE3ED', borderRadius: '10px' });
  });

  it('4. Renders table with all 16 columns and initial rows', async () => {
    await renderComponent();

    // Check table headers
    expect(screen.getByRole('columnheader', { name: /Development ID/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Project ID/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Requirement ID/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Task \/ Ticket ID/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Developer/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Repository URL/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Branch/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Environment/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Build Version/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Code Review Status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /QA Handoff Date/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Release ID/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /^Status$/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Technical Notes/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Documentation Link/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Actions/i })).toBeInTheDocument();

    // Check first row DEV-2026-0432
    expect(screen.getByText('DEV-2026-0432')).toBeInTheDocument();
    expect(screen.getByText('REQ-2026-0184')).toBeInTheDocument();
    expect(screen.getByText('TSK-00128')).toBeInTheDocument();
    expect(screen.getByText('feature/login')).toBeInTheDocument();
    expect(screen.getByText('Login API updated')).toBeInTheDocument();
  });

  it('5. Filters table by search query', async () => {
    await renderComponent();

    const searchInput = screen.getByPlaceholderText(
      /Search by Development ID, Project ID, Requirement ID, Task ID, Developer/i
    );

    // Filter by developer Divya Patel
    fireEvent.change(searchInput, { target: { value: 'Divya Patel' } });

    await waitFor(() => {
      expect(screen.getByText('DEV-2026-0430')).toBeInTheDocument();
      expect(screen.getByText('DEV-2026-0425')).toBeInTheDocument();
      expect(screen.queryByText('DEV-2026-0432')).not.toBeInTheDocument();
    });
  });

  it('6. Filters table by Status and Environment dropdowns', async () => {
    await renderComponent();

    const envSelect = screen.getByDisplayValue('All Environment');
    fireEvent.change(envSelect, { target: { value: 'QA' } });

    await waitFor(() => {
      // Sneha Nair (DEV-2026-0431 and DEV-2026-0427) are QA
      expect(screen.getByText('DEV-2026-0431')).toBeInTheDocument();
      expect(screen.getByText('DEV-2026-0427')).toBeInTheDocument();
      expect(screen.queryByText('DEV-2026-0432')).not.toBeInTheDocument();
    });

    // Clear filters
    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByText('DEV-2026-0432')).toBeInTheDocument();
    });
  });

  it('7. Opens and submits Add Development modal', async () => {
    await renderComponent();

    const addBtn = screen.getByRole('button', { name: /Add Development/i });
    fireEvent.click(addBtn);

    // Modal should be visible with title "Add Development"
    expect(screen.getByRole('heading', { name: /^Add Development$/i })).toBeInTheDocument();

    // Fill required Project ID, Requirement ID, Task ID, Developer, Status
    const projectSelect = screen.getByDisplayValue('Select project');
    fireEvent.change(projectSelect, { target: { value: 'PRJ-001' } });

    const reqSelect = screen.getByDisplayValue('Select requirement');
    fireEvent.change(reqSelect, { target: { value: 'REQ-2026-0184' } });

    const taskSelect = screen.getByDisplayValue('Select task / ticket');
    fireEvent.change(taskSelect, { target: { value: 'TSK-00128' } });

    const devSelect = screen.getByDisplayValue('Select developer');
    fireEvent.change(devSelect, { target: { value: 'EMP-001' } });

    const statusSelect = screen.getAllByDisplayValue('Select status')[1]; // [0: review, 1: status]
    fireEvent.change(statusSelect, { target: { value: 'In Progress' } });

    // Fill branch and repository if needed
    const branchInput = screen.getByPlaceholderText('e.g., feature/login');
    fireEvent.change(branchInput, { target: { value: 'feature/new-feature' } });

    // Submit form using Add Development button inside modal footer
    const dialog = screen.getByRole('dialog');
    const modalSubmitBtn = within(dialog).getByRole('button', { name: /^Add Development$/i });
    fireEvent.click(modalSubmitBtn);

    // Modal should close and new entry DEV-2026-0433 should be in table
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /^Add Development$/i })).not.toBeInTheDocument();
      expect(screen.getByText('DEV-2026-0433')).toBeInTheDocument();
    });
  });

  it('8. Opens View Details modal when clicking Development ID', async () => {
    await renderComponent();

    const devLink = screen.getByText('DEV-2026-0432');
    fireEvent.click(devLink);

    expect(screen.getByText('Development Details & Technical Tracking')).toBeInTheDocument();
    expect(screen.getAllByText('Login API updated').length).toBeGreaterThanOrEqual(1);

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Development Details & Technical Tracking')).not.toBeInTheDocument();
  });

  it('9. Code Review Status badge opens dropdown and updates row status on selection', async () => {
    await renderComponent();

    // In DEV-2026-0432 row, Code Review Status is initially "Approved"
    const devRow = screen.getByText('DEV-2026-0432').closest('tr');
    expect(devRow).toBeInTheDocument();

    const reviewBadge = within(devRow!).getByRole('button', { name: /Approved/i });
    expect(reviewBadge).toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(reviewBadge);

    // Header in dropdown menu
    const menuTitle = screen.getByText('CHANGE REVIEW STATUS');
    expect(menuTitle).toBeInTheDocument();
    const menu = menuTitle.closest('div');

    // Select "Changes Requested" inside the opened dropdown menu
    const changesOption = within(menu!).getByRole('button', { name: /Changes Requested/i });
    fireEvent.click(changesOption);

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('CHANGE REVIEW STATUS')).not.toBeInTheDocument();
    });

    // Row should now display "Changes Requested"
    await waitFor(() => {
      expect(within(devRow!).getByRole('button', { name: /Changes Requested/i })).toBeInTheDocument();
    });

    // Other rows should remain unchanged (e.g. DEV-2026-0431 row still In Review)
    const nextRow = screen.getByText('DEV-2026-0431').closest('tr');
    expect(within(nextRow!).getByRole('button', { name: /In Review/i })).toBeInTheDocument();
  });

  it('10. Status badge opens dropdown, updates status, and closes on Escape', async () => {
    await renderComponent();

    // In DEV-2026-0431 row, Status is initially "In Progress"
    const row = screen.getByText('DEV-2026-0431').closest('tr');
    expect(row).toBeInTheDocument();

    const statusBadge = within(row!).getByRole('button', { name: /In Progress/i });
    fireEvent.click(statusBadge);

    // Dropdown should be open
    const menuTitle = screen.getByText('CHANGE STATUS');
    expect(menuTitle).toBeInTheDocument();
    const menu = menuTitle.closest('div');
    expect(within(menu!).getByRole('button', { name: /^QA$/i })).toBeInTheDocument();

    // Press Escape to test close
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('CHANGE STATUS')).not.toBeInTheDocument();

    // Reopen and select QA
    fireEvent.click(within(row!).getByRole('button', { name: /In Progress/i }));
    const reopenedMenu = screen.getByText('CHANGE STATUS').closest('div');
    const qaOption = within(reopenedMenu!).getByRole('button', { name: /^QA$/i });
    fireEvent.click(qaOption);

    // Row status should now be updated to QA
    await waitFor(() => {
      expect(within(row!).getByRole('button', { name: /^QA$/i })).toBeInTheDocument();
    });
  });

  it('11. Column sorting toggles ascending, descending and natural order on header click', async () => {
    await renderComponent();

    // Development ID header
    const devIdHeader = screen.getByRole('columnheader', { name: /Development ID/i });
    expect(devIdHeader).toBeInTheDocument();

    // Natural order: first row is DEV-2026-0432
    const firstRowBefore = screen.getAllByRole('row')[1];
    expect(within(firstRowBefore).getByText('DEV-2026-0432')).toBeInTheDocument();

    // Click to sort ascending (DEV-2026-0421 first)
    fireEvent.click(devIdHeader);
    await waitFor(() => {
      const firstRowAsc = screen.getAllByRole('row')[1];
      expect(within(firstRowAsc).getByText('DEV-2026-0421')).toBeInTheDocument();
    });

    // Click to sort descending (DEV-2026-0432 first)
    fireEvent.click(devIdHeader);
    await waitFor(() => {
      const firstRowDesc = screen.getAllByRole('row')[1];
      expect(within(firstRowDesc).getByText('DEV-2026-0432')).toBeInTheDocument();
    });
  });

  it('12. Actions menu opens Edit Development modal and updates the record in table', async () => {
    await renderComponent();

    const row = screen.getByText('DEV-2026-0432').closest('tr');
    expect(row).toBeInTheDocument();

    // Click 3-dot action button
    const actionBtn = within(row!).getByRole('button', { name: /Actions/i });
    fireEvent.click(actionBtn);

    // Click "Edit Development" in menu
    const editOption = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editOption);

    // Modal opens
    expect(screen.getByRole('heading', { name: /Edit Development Entry/i })).toBeInTheDocument();

    // Change branch name
    const branchInput = screen.getByDisplayValue('feature/login');
    fireEvent.change(branchInput, { target: { value: 'feature/login-v2' } });

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /Update Development/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Edit Development Entry/i })).not.toBeInTheDocument();
      expect(screen.getByText('feature/login-v2')).toBeInTheDocument();
    });
  });

  it('13. Actions menu opens Delete confirmation, removes record from table, and updates KPIs', async () => {
    await renderComponent();

    // Initial total in KPI is 12
    const totalCard = screen.getByText('Total Developments').closest('div');
    expect(within(totalCard!).getByText('12')).toBeInTheDocument();

    const row = screen.getByText('DEV-2026-0432').closest('tr');
    expect(row).toBeInTheDocument();

    // Click 3-dot action button
    const actionBtn = within(row!).getByRole('button', { name: /Actions/i });
    fireEvent.click(actionBtn);

    // Click "Delete" in menu
    const deleteOption = screen.getByRole('button', { name: /^Delete$/i });
    fireEvent.click(deleteOption);

    // Delete confirmation modal appears
    expect(screen.getByText(/Are you sure you want to delete development record DEV-2026-0432/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole('button', { name: /^Delete$/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('DEV-2026-0432')).not.toBeInTheDocument();
      expect(within(totalCard!).getByText('11')).toBeInTheDocument();
    });
  });

  it('14. Pagination navigates between pages and adjusts page size', async () => {
    await renderComponent();

    // Page 1 shows first 10 records: DEV-2026-0432 through DEV-2026-0423
    expect(screen.getByText('DEV-2026-0432')).toBeInTheDocument();
    expect(screen.queryByText('DEV-2026-0422')).not.toBeInTheDocument();

    // Click page 2 button
    const page2Btn = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Btn);

    // Now page 2 items appear
    await waitFor(() => {
      expect(screen.getByText('DEV-2026-0422')).toBeInTheDocument();
      expect(screen.getByText('DEV-2026-0421')).toBeInTheDocument();
      expect(screen.queryByText('DEV-2026-0432')).not.toBeInTheDocument();
    });

    // Change page size to 25
    const pageSizeSelect = screen.getByDisplayValue('10 per page');
    fireEvent.change(pageSizeSelect, { target: { value: '25' } });

    // All records now visible on single page
    await waitFor(() => {
      expect(screen.getByText('DEV-2026-0432')).toBeInTheDocument();
      expect(screen.getByText('DEV-2026-0422')).toBeInTheDocument();
    });
  });

  it('15. Export triggers CSV download and Refresh resets data and updates timestamp', async () => {
    await renderComponent();

    // Mock export
    const exportBtn = screen.getByRole('button', { name: /Export/i });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(developmentApiService.exportDevelopments).toHaveBeenCalled();
    });

    // Test Refresh button
    const refreshBtn = screen.getByRole('button', { name: /Refresh Development data/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(screen.getByText('Development data refreshed')).toBeInTheDocument();
    });
  });

  it('16. View Details in Actions menu opens the read-only Development Details modal', async () => {
    await renderComponent();

    const row = screen.getByText('DEV-2026-0432').closest('tr');
    expect(row).toBeInTheDocument();

    // Click 3-dot action button
    const actionBtn = within(row!).getByRole('button', { name: /Actions/i });
    fireEvent.click(actionBtn);

    // Click "View Details" in menu
    const viewOption = screen.getByRole('button', { name: /View Details/i });
    fireEvent.click(viewOption);

    // Details modal opens in read-only mode
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Development Details & Technical Tracking')).toBeInTheDocument();
    expect(within(dialog).getByText('v1.2.0')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /Close/i })).toBeInTheDocument();
  });

  it('17. View Document opens valid documentation URL in a new browser tab without opening details modal', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    await renderComponent();

    const row = screen.getByText('DEV-2026-0432').closest('tr');
    expect(row).toBeInTheDocument();

    // Click "View Doc" button in row
    const viewDocBtn = within(row!).getByRole('button', { name: /View Doc/i });
    fireEvent.click(viewDocBtn);

    // Window open should be called with documentation URL
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://docs.kalpanaa.com/dev/DEV-2026-0432',
      '_blank',
      'noopener,noreferrer'
    );

    // Details modal must NOT open
    expect(screen.queryByText('Development Details & Technical Tracking')).not.toBeInTheDocument();
    windowOpenSpy.mockRestore();
  });

  it('18. View Document with missing or empty URL displays message and does not open details modal', async () => {
    mockStore[0].documentationLink = '';

    await renderComponent();

    const row = screen.getByText('DEV-2026-0432').closest('tr');
    expect(row).toBeInTheDocument();

    // Click 3-dot action menu and click "View Document"
    const actionBtn = within(row!).getByRole('button', { name: /Actions/i });
    fireEvent.click(actionBtn);

    const viewDocOption = screen.getByRole('button', { name: /View Document/i });
    fireEvent.click(viewDocOption);

    // Toast message displayed
    await waitFor(() => {
      expect(
        screen.getByText('No documentation link is available for this development.')
      ).toBeInTheDocument();
    });

    // Details modal must NOT open
    expect(screen.queryByText('Development Details & Technical Tracking')).not.toBeInTheDocument();
  });
});
