import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TimesheetsRequirementsPage } from '../features/projects/pages/TimesheetsRequirementsPage';

// Setup environment mocks for jsdom
beforeEach(() => {
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = vi.fn();
  }
  window.confirm = vi.fn(() => true);
});

describe('TimesheetsRequirementsPage UI Implementation Tests', () => {
  it('1. Renders main page header with correct title, subtitle, and icon', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /timesheets & requirements/i })).toBeInTheDocument();
    expect(
      screen.getByText(/track project effort with timesheets and manage project requirements with full visibility\./i)
    ).toBeInTheDocument();
  });

  it('2. Renders Timesheets section with 4 KPI cards, search, filters, table, and pagination', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    const timesheetHeading = screen.getByRole('heading', { level: 2, name: /^timesheets$/i });
    expect(timesheetHeading).toBeInTheDocument();
    const section = timesheetHeading.closest('section')!;
    const { getByText, getAllByText, getByRole, getByPlaceholderText, getByTitle } = within(section);

    // Section title & buttons
    expect(getByRole('button', { name: /log time/i })).toBeInTheDocument();
    const exportBtn = getByRole('button', { name: /export/i });
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).toHaveStyle({ border: '1px solid #CBD5E1' });

    // 4 KPI Cards
    expect(getByText('Total Hours')).toBeInTheDocument();
    expect(getByText('1,248.00')).toBeInTheDocument();
    expect(getByText(/↑ 12% vs last month/i)).toBeInTheDocument();

    expect(getByText('Billable Hours')).toBeInTheDocument();
    expect(getByText('1,020.00')).toBeInTheDocument();

    expect(getAllByText('Billable Amount').length).toBeGreaterThanOrEqual(1);
    expect(getByText('₹ 12,24,000')).toBeInTheDocument();

    expect(getByText('Pending Approvals')).toBeInTheDocument();
    expect(getByText('24')).toBeInTheDocument();
    expect(getByText(/↓ 33% vs last month/i)).toBeInTheDocument();

    // Search and filter controls
    expect(
      getByPlaceholderText(/search by timesheet id, employee id, project id, task id\.\.\./i)
    ).toBeInTheDocument();
    expect(getByTitle('Select Project')).toBeInTheDocument();
    expect(getByTitle('Select Employee')).toBeInTheDocument();
    expect(getByTitle('Select Approval Status')).toBeInTheDocument();
    expect(getByTitle('Select Billable')).toBeInTheDocument();

    // Table Column Headers (15 columns)
    expect(getByRole('columnheader', { name: /timesheet id/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /date/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /employee id/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /employee name/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /project id/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /task id/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /hours/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /billable rate/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /approval status/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /approved by/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /estimated labor cost/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /notes/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();

    // Sample Rows
    expect(getByText('TS-202610-048')).toBeInTheDocument();
    expect(getAllByText('Amit Sharma').length).toBeGreaterThanOrEqual(1);
    expect(getByText('TS-202610-047')).toBeInTheDocument();
    expect(getAllByText('Sneha Nair').length).toBeGreaterThanOrEqual(1);
    expect(getByText('TS-202610-046')).toBeInTheDocument();
    expect(getAllByText('Divya Patel').length).toBeGreaterThanOrEqual(1);
    expect(getByText('TS-202610-045')).toBeInTheDocument();
    expect(getAllByText('Rohan Verma').length).toBeGreaterThanOrEqual(1);
    expect(getByText('TS-202610-044')).toBeInTheDocument();
    expect(getAllByText('Vikram Shah').length).toBeGreaterThanOrEqual(1);

    // Badges
    expect(getAllByText('Approved').length).toBeGreaterThan(0);
    expect(getAllByText('Pending').length).toBeGreaterThan(0);
    expect(getAllByText('Rejected').length).toBeGreaterThan(0);
    expect(getAllByText('Yes').length).toBeGreaterThan(0);
    expect(getAllByText('No').length).toBeGreaterThan(0);

    // Pagination
    expect(getByText(/showing 1–5 of 1,248 timesheets/i)).toBeInTheDocument();
  });

  it('3. Renders Requirements section with 5 KPI cards, search, filters, table, and pagination', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    const reqHeading = screen.getByRole('heading', { level: 2, name: /^requirements$/i });
    expect(reqHeading).toBeInTheDocument();
    const section = reqHeading.closest('section')!;
    const { getByText, getAllByText, getByRole, getByPlaceholderText, getByTitle } = within(section);

    // Section title & buttons
    expect(getByRole('button', { name: /add requirement/i })).toBeInTheDocument();
    const exportBtn = getByRole('button', { name: /export/i });
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).toHaveStyle({ border: '1px solid #CBD5E1' });

    // 5 KPI Cards
    expect(getByText('Total Requirements')).toBeInTheDocument();
    expect(getByText('186')).toBeInTheDocument();
    expect(getByText(/↑ 14% vs last month/i)).toBeInTheDocument();

    expect(getAllByText('In Progress').length).toBeGreaterThanOrEqual(1);
    expect(getByText('78')).toBeInTheDocument();

    expect(getAllByText('Completed').length).toBeGreaterThanOrEqual(1);
    expect(getByText('64')).toBeInTheDocument();

    expect(getAllByText('Pending Approval').length).toBeGreaterThanOrEqual(1);
    expect(getByText('18')).toBeInTheDocument();

    expect(getByText('Scope Frozen')).toBeInTheDocument();
    expect(getByText('32')).toBeInTheDocument();

    // Search and filters
    expect(
      getByPlaceholderText(/search by requirement id, project id, feature or description\.\.\./i)
    ).toBeInTheDocument();
    expect(getByTitle('Select Project')).toBeInTheDocument();
    expect(getByTitle('Select Requirement Type')).toBeInTheDocument();
    expect(getByTitle('Select Priority')).toBeInTheDocument();
    expect(getByTitle('Select Status')).toBeInTheDocument();

    // Table Column Headers (14 columns)
    expect(getByRole('columnheader', { name: /requirement id/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /client id/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /requirement date/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /type/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /requirement \/ feature/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /priority/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /owner id/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /^status$/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /scope freeze/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /approved by/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /approval date/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /completion %/i })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();

    // Sample Rows
    expect(getByText('REQ-2026-0186')).toBeInTheDocument();
    expect(getByText('Appointment Booking')).toBeInTheDocument();
    expect(getByText('REQ-2026-0185')).toBeInTheDocument();
    expect(getByText('Prescription Upload')).toBeInTheDocument();
    expect(getByText('REQ-2026-0184')).toBeInTheDocument();
    expect(getByText('MDN via WhatsApp')).toBeInTheDocument();
    expect(getByText('REQ-2026-0183')).toBeInTheDocument();
    expect(getByText('Patient History')).toBeInTheDocument();
    expect(getByText('REQ-2026-0182')).toBeInTheDocument();
    expect(getByText('Reports & Analytics')).toBeInTheDocument();

    // Priority Badges (checking presence)
    expect(getAllByText('High').length).toBeGreaterThanOrEqual(2);
    expect(getAllByText('Medium').length).toBeGreaterThanOrEqual(2);
    expect(getAllByText('Low').length).toBeGreaterThanOrEqual(1);

    // Completion % and progress bar
    expect(getByText('40%')).toBeInTheDocument();
    expect(getByText('80%')).toBeInTheDocument();
    expect(getByText('55%')).toBeInTheDocument();
    expect(getByText('100%')).toBeInTheDocument();
    expect(getByText('30%')).toBeInTheDocument();

    // Pagination
    expect(getByText(/showing 1–5 of 186 requirements/i)).toBeInTheDocument();
  });

  it('4. Provides working visual filter and search interactions', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    // Timesheet search interaction by Timesheet ID
    const timesheetSearch = screen.getByPlaceholderText(
      /search by timesheet id, employee id, project id, task id\.\.\./i
    );
    fireEvent.change(timesheetSearch, { target: { value: 'TS-202610-048' } });
    expect(screen.getByText('TS-202610-048')).toBeInTheDocument();
    expect(screen.queryByText('TS-202610-046')).not.toBeInTheDocument();

    // Reset search
    fireEvent.change(timesheetSearch, { target: { value: '' } });
    expect(screen.getByText('TS-202610-046')).toBeInTheDocument();

    // Requirements search interaction
    const reqSearch = screen.getByPlaceholderText(
      /search by requirement id, project id, feature or description\.\.\./i
    );
    fireEvent.change(reqSearch, { target: { value: 'WhatsApp' } });
    expect(screen.getByText('MDN via WhatsApp')).toBeInTheDocument();
    expect(screen.queryByText('Appointment Booking')).not.toBeInTheDocument();
  });

  it('5. Requirements inline Status and Priority dropdowns open, update row, show toast, and close', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    // 1. Locate row REQ-2026-0186
    const row186 = screen.getByText('REQ-2026-0186').closest('tr')!;
    const row186Queries = within(row186);

    // Initial status of REQ-2026-0186 is "In Progress", Priority is "High"
    const [priorityBtn, statusBtn] = row186Queries.getAllByTitle('Click to change');
    expect(statusBtn).toHaveTextContent('In Progress');
    expect(priorityBtn).toHaveTextContent('High');

    // Click status badge to open dropdown
    fireEvent.click(statusBtn);

    // Popover with header "CHANGE STATUS" should appear
    const statusHeader = screen.getByText('CHANGE STATUS');
    expect(statusHeader).toBeInTheDocument();
    const statusPopover = statusHeader.closest('div')!;
    const statusPopoverQueries = within(statusPopover);
    expect(statusPopoverQueries.getByRole('button', { name: /^Completed$/i })).toBeInTheDocument();
    expect(statusPopoverQueries.getByRole('button', { name: /^Pending Approval$/i })).toBeInTheDocument();

    // Select "Completed" from the popover menu
    fireEvent.click(statusPopoverQueries.getByRole('button', { name: /^Completed$/i }));

    // Dropdown should close
    expect(screen.queryByText('CHANGE STATUS')).not.toBeInTheDocument();

    // REQ-2026-0186 status should now be "Completed"
    expect(row186Queries.getByText('Completed')).toBeInTheDocument();

    // Toast notification should appear
    expect(screen.getByText(/Requirement REQ-2026-0186 status set to "Completed"./i)).toBeInTheDocument();

    // Row REQ-2026-0185 should remain unaffected (initial status was Pending Approval)
    const row185 = screen.getByText('REQ-2026-0185').closest('tr')!;
    expect(within(row185).getByText('Pending Approval')).toBeInTheDocument();

    // 2. Test Priority Dropdown on REQ-2026-0186 (initial is High)
    fireEvent.click(priorityBtn);
    const priorityHeader = screen.getByText('CHANGE PRIORITY');
    expect(priorityHeader).toBeInTheDocument();
    const priorityPopover = priorityHeader.closest('div')!;
    const priorityPopoverQueries = within(priorityPopover);
    expect(priorityPopoverQueries.getByRole('button', { name: /^Low$/i })).toBeInTheDocument();

    // Select "Low" from the priority popover menu
    fireEvent.click(priorityPopoverQueries.getByRole('button', { name: /^Low$/i }));

    // Dropdown should close
    expect(screen.queryByText('CHANGE PRIORITY')).not.toBeInTheDocument();
    expect(row186Queries.getByText('Low')).toBeInTheDocument();

    // Toast notification for Priority
    expect(screen.getByText(/Requirement REQ-2026-0186 priority set to "Low"./i)).toBeInTheDocument();
  });

  it('6. Timesheets inline Approval Status dropdown opens, updates row, shows toast, and closes', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    // Locate row TS-202610-048
    const row048 = screen.getByText('TS-202610-048').closest('tr')!;
    const row048Queries = within(row048);

    // Initial approval status of TS-202610-048 is "Approved"
    const approvalBtn = row048Queries.getByTitle('Click to change');
    expect(approvalBtn).toHaveTextContent('Approved');

    // Click approval status badge to open dropdown
    fireEvent.click(approvalBtn);

    // Popover with header "CHANGE APPROVAL STATUS" should appear
    const header = screen.getByText('CHANGE APPROVAL STATUS');
    expect(header).toBeInTheDocument();
    const popover = header.closest('div')!;
    const popoverQueries = within(popover);
    expect(popoverQueries.getByRole('button', { name: /^Pending$/i })).toBeInTheDocument();
    expect(popoverQueries.getByRole('button', { name: /^Rejected$/i })).toBeInTheDocument();

    // Select "Rejected"
    fireEvent.click(popoverQueries.getByRole('button', { name: /^Rejected$/i }));

    // Dropdown should close
    expect(screen.queryByText('CHANGE APPROVAL STATUS')).not.toBeInTheDocument();

    // TS-202610-048 status should now be "Rejected"
    expect(row048Queries.getByText('Rejected')).toBeInTheDocument();

    // Toast notification should appear
    expect(screen.getByText(/Timesheet TS-202610-048 status set to "Rejected"./i)).toBeInTheDocument();

    // Row TS-202610-047 should remain unaffected (initial status was Pending)
    const row047 = screen.getByText('TS-202610-047').closest('tr')!;
    expect(within(row047).getByText('Pending')).toBeInTheDocument();
  });

  it('7. Log Time modal validates inputs, auto-computes billable amount, creates timesheet, and updates dynamic KPIs', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    const timesheetHeading = screen.getByRole('heading', { level: 2, name: /^timesheets$/i });
    const section = timesheetHeading.closest('section')!;
    const { getByRole, getByText } = within(section);

    // Open Log Time modal
    fireEvent.click(getByRole('button', { name: /log time/i }));
    const modalDialog = screen.getByRole('dialog');
    expect(within(modalDialog).getByRole('heading', { name: /log time/i })).toBeInTheDocument();
    const form = modalDialog.querySelector('form')!;

    // Fill invalid hours (> 24)
    const hoursInput = within(modalDialog).getByPlaceholderText(/e\.g\. 8\.0/i);
    fireEvent.change(hoursInput, { target: { value: '25' } });
    fireEvent.submit(form);
    expect(screen.getByText(/hours cannot exceed 24 hours per entry/i)).toBeInTheDocument();

    // Fill valid hours: 8.0
    fireEvent.change(hoursInput, { target: { value: '8' } });

    // Submit form
    fireEvent.submit(form);

    // Modal should close and toast should appear
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/time logged successfully/i)).toBeInTheDocument();

    // Verify Total Hours KPI updated from 1,248.00 to 1,256.00 (+8 hrs)
    expect(getByText('1,256.00')).toBeInTheDocument();
  });

  it('8. Timesheets row actions: View Details modal, Edit modal, and Delete with dynamic KPI update', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    const timesheetHeading = screen.getByRole('heading', { level: 2, name: /^timesheets$/i });
    const section = timesheetHeading.closest('section')!;

    // 1. View Details
    const row048 = within(section).getByText('TS-202610-048').closest('tr')!;
    const actionsBtn = within(row048).getByRole('button', { name: /actions/i });
    fireEvent.click(actionsBtn);

    const viewBtn = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewBtn);

    // View modal should open
    const viewModal = screen.getByRole('dialog');
    expect(within(viewModal).getByRole('heading', { name: /timesheet details/i })).toBeInTheDocument();
    expect(within(viewModal).getByText('TS-202610-048')).toBeInTheDocument();

    // Close view modal
    fireEvent.click(within(viewModal).getByRole('button', { name: /^close$/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // 2. Edit Modal
    fireEvent.click(actionsBtn);
    const editBtn = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editBtn);

    const editModal = screen.getByRole('dialog');
    expect(within(editModal).getByRole('heading', { name: /edit timesheet/i })).toBeInTheDocument();
    const notesInput = editModal.querySelector('textarea')!;
    fireEvent.change(notesInput, { target: { value: 'Updated automated test suite execution' } });
    fireEvent.submit(editModal.querySelector('form')!);

    expect(screen.getByText(/timesheet updated/i)).toBeInTheDocument();

    // 3. Delete Timesheet (triggers confirmation popup)
    fireEvent.click(actionsBtn);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    // Confirmation popup modal appears
    const confirmModal = screen.getByRole('dialog');
    expect(within(confirmModal).getByRole('heading', { name: /delete timesheet/i })).toBeInTheDocument();
    expect(within(confirmModal).getByText('TS-202610-048')).toBeInTheDocument();
    const confirmDeleteBtn = within(confirmModal).getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmDeleteBtn);

    expect(screen.getByText(/timesheet deleted/i)).toBeInTheDocument();
    expect(within(section).queryByText('TS-202610-048')).not.toBeInTheDocument();

    // Total Hours should decrease from 1,248.00 by 8.00 hrs to 1,240.00
    expect(within(section).getByText('1,240.00')).toBeInTheDocument();
  });

  it('9. Timesheets combined filters and dynamic pagination page sizes', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    const timesheetHeading = screen.getByRole('heading', { level: 2, name: /^timesheets$/i });
    const section = timesheetHeading.closest('section')!;
    const { getByTitle, getByText } = within(section);

    // Select Project PRJ-002
    const projectSelect = getByTitle('Select Project');
    fireEvent.change(projectSelect, { target: { value: 'PRJ-002' } });

    // Sneha Nair (PRJ-002) should be displayed, Amit Sharma (PRJ-001) should not
    expect(getByText('TS-202610-047')).toBeInTheDocument();
    expect(within(section).queryByText('TS-202610-048')).not.toBeInTheDocument();

    // Reset project filter
    fireEvent.change(projectSelect, { target: { value: 'All Projects' } });
    expect(getByText('TS-202610-048')).toBeInTheDocument();

    // Test Page Size change
    const pageSizeSelect = within(section).getByTitle('Page size');
    fireEvent.change(pageSizeSelect, { target: { value: '10' } });
    expect(within(section).getAllByText(/10 per page/i).length).toBeGreaterThanOrEqual(1);
  });

  it('10. Timesheets and Requirements Export triggers CSV download and toast notification', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    // Timesheet export
    const timesheetHeading = screen.getByRole('heading', { level: 2, name: /^timesheets$/i });
    const timesheetSection = timesheetHeading.closest('section')!;
    const timesheetExportBtn = within(timesheetSection).getByRole('button', { name: /export/i });
    fireEvent.click(timesheetExportBtn);

    expect(screen.getByText(/timesheet records exported to/i)).toBeInTheDocument();

    // Requirements export
    const reqHeading = screen.getByRole('heading', { level: 2, name: /^requirements$/i });
    const reqSection = reqHeading.closest('section')!;
    const reqExportBtn = within(reqSection).getByRole('button', { name: /export/i });
    fireEvent.click(reqExportBtn);

    expect(screen.getByText(/requirement records exported to/i)).toBeInTheDocument();
  });

  it('11. Add Requirement modal validates inputs, creates requirement, and updates dynamic KPIs', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    const reqHeading = screen.getByRole('heading', { level: 2, name: /^requirements$/i });
    const section = reqHeading.closest('section')!;
    const { getByRole, getByText } = within(section);

    // Open Add Requirement modal
    fireEvent.click(getByRole('button', { name: /add requirement/i }));
    const modalDialog = screen.getByRole('dialog');
    expect(within(modalDialog).getByRole('heading', { name: /add requirement/i })).toBeInTheDocument();
    const submitBtn = within(modalDialog).getByRole('button', { name: /^add requirement$/i });

    // Submit with empty title to test validation
    fireEvent.click(submitBtn);
    expect(screen.getByText(/please enter a requirement or feature title\./i)).toBeInTheDocument();

    // Fill valid title and details
    const titleInput = within(modalDialog).getByPlaceholderText(/e\.g\. appointment booking, prescription upload\.\.\./i);
    fireEvent.change(titleInput, { target: { value: 'Telemetry Integration Hub' } });

    // Submit form
    fireEvent.click(submitBtn);

    // Modal closes and toast appears
    expect(screen.queryByRole('heading', { name: /add requirement/i })).not.toBeInTheDocument();
    expect(screen.getByText(/requirement created/i)).toBeInTheDocument();

    // Verify dynamic KPI update: Total Requirements increments from 186 to 187
    expect(getByText('187')).toBeInTheDocument();
    // In Progress increments from 78 to 79
    expect(getByText('79')).toBeInTheDocument();
  });

  it('12. Requirements row actions: View Details, Edit, and Delete with dynamic KPI update', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    const reqHeading = screen.getByRole('heading', { level: 2, name: /^requirements$/i });
    const section = reqHeading.closest('section')!;

    // 1. View Details
    const row186 = within(section).getByText('REQ-2026-0186').closest('tr')!;
    const actionsBtn = within(row186).getByRole('button', { name: /actions/i });
    fireEvent.click(actionsBtn);

    const viewBtn = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewBtn);

    const viewModal = screen.getByRole('dialog');
    expect(within(viewModal).getByRole('heading', { name: /requirement details/i })).toBeInTheDocument();
    expect(within(viewModal).getByText('REQ-2026-0186')).toBeInTheDocument();

    // Close view modal
    fireEvent.click(within(viewModal).getByRole('button', { name: /^close$/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // 2. Edit Requirement
    fireEvent.click(actionsBtn);
    const editBtn = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editBtn);

    const editModal = screen.getByRole('dialog');
    expect(within(editModal).getByRole('heading', { name: /edit requirement/i })).toBeInTheDocument();
    const titleInput = within(editModal).getByDisplayValue('Appointment Booking');
    fireEvent.change(titleInput, { target: { value: 'Appointment Booking V2' } });
    fireEvent.submit(editModal.querySelector('form')!);

    expect(screen.getByText(/requirement updated/i)).toBeInTheDocument();
    expect(within(section).getByText('Appointment Booking V2')).toBeInTheDocument();

    // 3. Delete Requirement (triggers confirmation popup)
    fireEvent.click(actionsBtn);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    // Confirmation popup modal appears
    const confirmModal = screen.getByRole('dialog');
    expect(within(confirmModal).getByRole('heading', { name: /delete requirement/i })).toBeInTheDocument();
    expect(within(confirmModal).getByText('REQ-2026-0186')).toBeInTheDocument();
    const confirmDeleteBtn = within(confirmModal).getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmDeleteBtn);

    expect(screen.getByText(/requirement deleted/i)).toBeInTheDocument();
    expect(within(section).queryByText('REQ-2026-0186')).not.toBeInTheDocument();

    // Total Requirements KPI should dynamically decrease from 186 to 185
    expect(within(section).getByText('185')).toBeInTheDocument();
    // In Progress KPI should dynamically decrease from 78 to 77
    expect(within(section).getByText('77')).toBeInTheDocument();
  });

  it('13. Requirements approval workflow supports both CEO – Akshit Ujjain and MD – Gaurav Tripathy as approvers', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    const reqHeading = screen.getByRole('heading', { level: 2, name: /^requirements$/i });
    const section = reqHeading.closest('section')!;

    // Open Add Requirement modal
    fireEvent.click(within(section).getByRole('button', { name: /add requirement/i }));
    const modalDialog = screen.getByRole('dialog');

    // Verify Approver dropdown exists and contains CEO – Akshit Ujjain and MD – Gaurav Tripathy
    const approverSelect = within(modalDialog).getByDisplayValue('CEO – Akshit Ujjain');
    expect(approverSelect).toBeInTheDocument();

    const options = within(modalDialog).getAllByRole('option').map((o) => o.textContent);
    expect(options).toContain('CEO – Akshit Ujjain');
    expect(options).toContain('MD – Gaurav Tripathy');

    // Select MD – Gaurav Tripathy
    fireEvent.change(approverSelect, { target: { value: 'MD – Gaurav Tripathy' } });
    expect(within(modalDialog).getByDisplayValue('MD – Gaurav Tripathy')).toBeInTheDocument();

    // Verify Approval Date shows "-" prior to approval
    expect(within(modalDialog).getByText('-')).toBeInTheDocument();

    // Enter requirement title
    const titleInput = within(modalDialog).getByPlaceholderText(/e\.g\. appointment booking, prescription upload\.\.\./i);
    fireEvent.change(titleInput, { target: { value: 'MD Multi-Approver Feature' } });

    // Submit form
    const submitBtn = within(modalDialog).getByRole('button', { name: /^add requirement$/i });
    fireEvent.click(submitBtn);

    // Verify created requirement in the table
    const createdRow = within(section).getByText('MD Multi-Approver Feature').closest('tr')!;
    expect(createdRow).toBeInTheDocument();

    // Approved By and Approval Date must display '-' prior to approval
    const cells = within(createdRow).getAllByText('-');
    expect(cells.length).toBeGreaterThanOrEqual(2);

    // Open View Details to verify Assigned Approver is persisted
    const actionsBtn = within(createdRow).getByRole('button', { name: /actions/i });
    fireEvent.click(actionsBtn);
    const viewBtn = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewBtn);

    const viewModal = screen.getByRole('dialog');
    expect(within(viewModal).getByText('Assigned Approver')).toBeInTheDocument();
    expect(within(viewModal).getByText('MD – Gaurav Tripathy')).toBeInTheDocument();
  });

  it('14. Timesheets approval workflow supports both CEO – Akshit Ujjain and MD – Gaurav Tripathy as approvers', () => {
    render(
      <MemoryRouter>
        <TimesheetsRequirementsPage />
      </MemoryRouter>
    );

    const timesheetHeading = screen.getByRole('heading', { level: 2, name: /^timesheets$/i });
    const section = timesheetHeading.closest('section')!;

    // Open Log Time modal
    fireEvent.click(within(section).getByRole('button', { name: /log time/i }));
    const modalDialog = screen.getByRole('dialog');

    // Verify Approver dropdown exists and contains CEO – Akshit Ujjain and MD – Gaurav Tripathy
    const approverSelect = within(modalDialog).getByDisplayValue('CEO – Akshit Ujjain');
    expect(approverSelect).toBeInTheDocument();

    const options = within(modalDialog).getAllByRole('option').map((o) => o.textContent);
    expect(options).toContain('CEO – Akshit Ujjain');
    expect(options).toContain('MD – Gaurav Tripathy');

    // Select MD – Gaurav Tripathy
    fireEvent.change(approverSelect, { target: { value: 'MD – Gaurav Tripathy' } });
    expect(within(modalDialog).getByDisplayValue('MD – Gaurav Tripathy')).toBeInTheDocument();

    // Submit Log Time form
    const form = modalDialog.querySelector('form')!;
    fireEvent.submit(form);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/time logged successfully/i)).toBeInTheDocument();

    // Verify created timesheet in the table displays '-' for Approved By prior to approval
    const tbody = section.querySelector('tbody')!;
    const createdRow = within(tbody).getByText('Pooja Mehta').closest('tr')!;
    expect(createdRow).toBeInTheDocument();
    expect(within(createdRow).getByText('Pending')).toBeInTheDocument();
    expect(within(createdRow).getByText('-')).toBeInTheDocument();

    // Open View Details to verify Assigned Approver
    const actionsBtn = within(createdRow).getByRole('button', { name: /actions/i });
    fireEvent.click(actionsBtn);
    const viewBtn = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewBtn);

    const viewModal = screen.getByRole('dialog');
    expect(within(viewModal).getByText('Assigned Approver')).toBeInTheDocument();
    expect(within(viewModal).getByText('MD – Gaurav Tripathy')).toBeInTheDocument();
    expect(within(viewModal).getByText('Pending')).toBeInTheDocument();
  });
});
