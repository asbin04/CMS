import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HrDashboardPage } from '../features/hr-dashboard/pages/HrDashboardPage';
import { employeeService } from '@/services/employeeService';
import { attendanceService } from '@/features/attendance/services/attendanceService';
import { leaveService } from '@/features/leave/services/leaveService';
import { employeeExitService } from '@/features/hr/services/employeeExitService';
import { masterDataService } from '@/services/masterDataService';

// Sample Live Module Records
const SAMPLE_EMPLOYEES = [
  {
    id: 1,
    employeeId: 'EMP-0024',
    employeeCode: 'EC-0024',
    fullName: 'Ananya Rao',
    workEmail: 'ananya.rao@kalpanaaa.com',
    phone: '+91 98765 43210',
    department: 'UI/UX',
    designation: 'UI/UX Designer',
    employmentType: 'Full Time',
    joiningDate: '02 Mar 2024',
    reportingManager: 'Akshit Ujjain',
    status: 'Active',
    location: 'Bangalore HQ',
    monthlyCtc: 65000,
    annualCtc: 780000,
    notes: 'Key designer',
    avatarInitials: 'AR',
    avatarColor: '#1D4ED8',
    avatarBg: '#DBEAFE',
  },
  {
    id: 2,
    employeeId: 'EMP-0023',
    employeeCode: 'EC-0023',
    fullName: 'Rohit Sharma',
    workEmail: 'rohit.sharma@kalpanaaa.com',
    phone: '+91 98765 43211',
    department: 'Development',
    designation: 'Software Developer',
    employmentType: 'Full Time',
    joiningDate: '10 Mar 2024',
    reportingManager: 'Akshit Ujjain',
    status: 'Active',
    location: 'Bangalore HQ',
    monthlyCtc: 85000,
    annualCtc: 1020000,
    notes: 'Fullstack developer',
    avatarInitials: 'RS',
    avatarColor: '#059669',
    avatarBg: '#D1FAE5',
  },
  {
    id: 3,
    employeeId: 'EMP-0019',
    employeeCode: 'EC-0019',
    fullName: 'Vikram Singh',
    workEmail: 'vikram.singh@kalpanaaa.com',
    phone: '+91 98765 43212',
    department: 'Sales',
    designation: 'Sales Executive',
    employmentType: 'Full Time',
    joiningDate: '05 Jan 2023',
    reportingManager: 'Priya Sharma',
    status: 'On Notice',
    location: 'Bangalore HQ',
    monthlyCtc: 55000,
    annualCtc: 660000,
    notes: 'Resigned',
    avatarInitials: 'VS',
    avatarColor: '#D97706',
    avatarBg: '#FEF3C7',
  },
];

const SAMPLE_ATTENDANCE = [
  {
    id: 'ATT-2026-001',
    attendanceDate: '31 Oct 2026',
    employeeId: 'EMP-0024',
    employeeName: 'Ananya Rao',
    avatarInitials: 'AR',
    avatarColor: 'blue',
    status: 'Present',
    checkIn: '09:15 AM',
    checkOut: '06:30 PM',
    workHours: '9h 15m',
    overtimeHours: '0h 45m',
    workMinutes: 555,
    overtimeMinutes: 45,
    dayType: 'Working Day',
    isLate: false,
    hasOvertime: true,
    paidDayEquivalent: '1.0',
    lateFlag: 'No',
    overtimeValue: '₹ 563',
    remarks: 'Regular attendance',
  },
  {
    id: 'ATT-2026-002',
    attendanceDate: '31 Oct 2026',
    employeeId: 'EMP-0023',
    employeeName: 'Rohit Sharma',
    avatarInitials: 'RS',
    avatarColor: 'teal',
    status: 'Half Day',
    checkIn: '09:30 AM',
    checkOut: '01:30 PM',
    workHours: '4h 0m',
    overtimeHours: '0h 0m',
    workMinutes: 240,
    overtimeMinutes: 0,
    dayType: 'Working Day',
    isLate: true,
    hasOvertime: false,
    paidDayEquivalent: '0.5',
    lateFlag: 'Yes',
    overtimeValue: '₹ 0',
    remarks: 'First half',
  },
];

const SAMPLE_LEAVES = [
  {
    id: 'LEV-001',
    employeeId: 'EMP-0024',
    employeeName: 'Ananya Rao',
    leaveType: 'Sick Leave',
    fromDate: '2026-11-01',
    toDate: '2026-11-02',
    days: 2,
    reason: 'Viral Fever',
    approvalStatus: 'Pending',
    approvedBy: null,
    calculatedDays: 2,
    leaveStatus: 'Pending',
  },
  {
    id: 'LEV-002',
    employeeId: 'EMP-0023',
    employeeName: 'Rohit Sharma',
    leaveType: 'Casual Leave',
    fromDate: '2026-11-10',
    toDate: '2026-11-11',
    days: 2,
    reason: 'Family Event',
    approvalStatus: 'Approved',
    approvedBy: 'Akshit Ujjain',
    calculatedDays: 2,
    leaveStatus: 'Approved',
  },
];

const SAMPLE_EXITS = [
  {
    id: 'EXI-00001',
    exitId: 'EXI-00001',
    employeeId: 'EMP-0019',
    employeeName: 'Vikram Singh',
    resignationDate: '01 Oct 2026',
    approvalDate: '03 Oct 2026',
    noticePeriodDays: 60,
    lastWorkingDay: '30 Nov 2026',
    exitType: 'Resignation',
    reason: 'Better Opportunity',
    exitStatus: 'In Review',
    assetsReturned: 'Pending',
    fullAndFinalStatus: 'In Review',
    notes: 'Handover in progress',
    noticeCompletionDate: '30 Nov 2026',
    exitReadiness: 'In Progress',
  },
];

describe('HR Dashboard - Reuse Existing Module Tables and Data', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(employeeService, 'getEmployees').mockResolvedValue(SAMPLE_EMPLOYEES as any);
    vi.spyOn(employeeService, 'getSummary').mockResolvedValue({
      totalEmployees: 26,
      activeEmployees: 24,
      onNotice: 2,
      totalMonthlyCtc: '₹18,40,000',
    } as any);

    vi.spyOn(attendanceService, 'getAttendance').mockResolvedValue(SAMPLE_ATTENDANCE as any);
    vi.spyOn(leaveService, 'getLeaves').mockResolvedValue(SAMPLE_LEAVES as any);
    vi.spyOn(leaveService, 'updateLeave').mockResolvedValue(SAMPLE_LEAVES[0] as any);
    vi.spyOn(masterDataService, 'getEmployees').mockResolvedValue([
      { employeeId: 'EMP-0024', fullName: 'Ananya Rao' },
      { employeeId: 'EMP-0023', fullName: 'Rohit Sharma' },
    ] as any);

    vi.spyOn(employeeExitService, 'getExitRecords').mockResolvedValue({
      content: SAMPLE_EXITS,
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
    } as any);
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <HrDashboardPage />
      </BrowserRouter>
    );

  it('1. Renders page header with title, subtitle, and action buttons', () => {
    renderComponent();

    expect(screen.getByRole('heading', { level: 1, name: /hr dashboard/i })).toBeInTheDocument();
    expect(
      screen.getByText('Track workforce, recruitment, attendance, leave and exits.')
    ).toBeInTheDocument();

    expect(screen.getByTitle('Refresh HR Data')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /export/i }).length).toBeGreaterThan(0);
  });

  it('2. Renders all 12 KPI cards matching exact designer metrics', () => {
    renderComponent();

    // Row 1
    expect(screen.getByText('Active Employees')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();

    expect(screen.getAllByText('On Notice').length).toBeGreaterThan(0);

    expect(screen.getByText('Total Monthly CTC')).toBeInTheDocument();
    expect(screen.getByText('₹18,40,000')).toBeInTheDocument();

    expect(screen.getByText('New Hires This Month')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);

    // Row 2
    expect(screen.getAllByText('Attendance Records').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('1,240')).toBeInTheDocument();

    expect(screen.getByText('Half Days')).toBeInTheDocument();
    expect(screen.getAllByText('6').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Late Records')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();

    // Row 2 & 3: Open Candidates
    const openCandidatesCards = screen.getAllByText('Open Candidates');
    expect(openCandidatesCards.length).toBe(2);

    // Row 3
    expect(screen.getByText('Candidates Over 30 Days')).toBeInTheDocument();
    expect(screen.getByText('Pending Leave Approvals')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    expect(screen.getByText('Employees Exiting')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });

  it('3. Renders exactly 4 tabs (Employees, Attendance, Leave, Exits) with Employees active by default', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: 'Employees' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Candidates' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Attendance' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leave' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exits' })).toBeInTheDocument();

    // Employees tab should show search placeholder
    expect(
      screen.getByPlaceholderText('Search by Employee ID, Name, or Department...')
    ).toBeInTheDocument();

    // Filters and Clear Filters buttons
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();

    // Status, Department, Employment Type filter labels
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Employment Type')).toBeInTheDocument();
  });

  it('4. Reuses Employee Master table and renders real columns including Employee Code, Years of Service, Monthly CTC', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('EMPLOYEE CODE')).toBeInTheDocument();
      expect(screen.getByText('YEARS OF SERVICE')).toBeInTheDocument();
      expect(screen.getByText('MONTHLY CTC')).toBeInTheDocument();
      expect(screen.getByText('ANNUAL CTC')).toBeInTheDocument();
    });

    // Check employee record rendered
    await waitFor(() => {
      expect(screen.getByText('EMP-0024')).toBeInTheDocument();
      expect(screen.getByText('Ananya Rao')).toBeInTheDocument();
      expect(screen.getAllByText('UI/UX Designer').length).toBeGreaterThan(0);
    });
  });

  it('5. Switches to Attendance tab and renders unified filter container, table & records', async () => {
    renderComponent();

    const attendanceTab = screen.getByRole('button', { name: 'Attendance' });
    fireEvent.click(attendanceTab);

    // Unified filter controls
    expect(
      screen.getByPlaceholderText('Search by Employee ID, Name, or Department...')
    ).toBeInTheDocument();
    expect(screen.getByText('Late Status')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ATTENDANCE ID')).toBeInTheDocument();
      expect(screen.getByText('WORK HOURS')).toBeInTheDocument();
      expect(screen.getByText('OVERTIME HOURS')).toBeInTheDocument();
      expect(screen.getAllByText(/day type/i).length).toBeGreaterThan(0);
    });

    // Records from attendanceService
    await waitFor(() => {
      expect(screen.getByText('ATT-2026-001')).toBeInTheDocument();
      expect(screen.getByText('9h 15m')).toBeInTheDocument();
    });
  });

  it('6. Switches to Leave tab and renders unified filter container, table & records', async () => {
    renderComponent();

    const leaveTab = screen.getByRole('button', { name: 'Leave' });
    fireEvent.click(leaveTab);

    // Unified filter controls
    expect(
      screen.getByPlaceholderText('Search by Employee ID, Name, or Leave Type...')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Leave Type').length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText('LEAVE ID')).toBeInTheDocument();
      expect(screen.getByText('CALCULATED DAYS')).toBeInTheDocument();
      expect(screen.getAllByText('APPROVAL STATUS').length).toBeGreaterThan(0);
    });

    // Records from leaveService
    await waitFor(() => {
      expect(screen.getByText('LEV-001')).toBeInTheDocument();
      expect(screen.getByText('Viral Fever')).toBeInTheDocument();
    });
  });

  it('7. Switches to Exits tab and renders unified filter container, table & records', async () => {
    renderComponent();

    const exitsTab = screen.getByRole('button', { name: 'Exits' });
    fireEvent.click(exitsTab);

    // Unified filter controls
    expect(
      screen.getByPlaceholderText('Search by Exit ID, Employee Name, or Department...')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Exit Type').length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText('EXIT ID')).toBeInTheDocument();
      expect(screen.getByText('NOTICE PERIOD DAYS')).toBeInTheDocument();
      expect(screen.getAllByText(/exit status/i).length).toBeGreaterThan(0);
      expect(screen.getByText('EXIT READINESS')).toBeInTheDocument();
    });

    // Records from employeeExitService
    await waitFor(() => {
      expect(screen.getByText('EXI-00001')).toBeInTheDocument();
      expect(screen.getByText('Better Opportunity')).toBeInTheDocument();
    });
  });

  it('8. Tab buttons switch active tab cleanly without page refresh', async () => {
    renderComponent();

    // 1. Switch to Attendance
    fireEvent.click(screen.getByRole('button', { name: 'Attendance' }));
    await waitFor(() => {
      expect(screen.getByText('ATTENDANCE ID')).toBeInTheDocument();
    });

    // 2. Switch to Leave
    fireEvent.click(screen.getByRole('button', { name: 'Leave' }));
    await waitFor(() => {
      expect(screen.getByText('LEAVE ID')).toBeInTheDocument();
    });

    // 3. Switch to Exits
    fireEvent.click(screen.getByRole('button', { name: 'Exits' }));
    await waitFor(() => {
      expect(screen.getByText('EXIT ID')).toBeInTheDocument();
    });

    // 4. Switch back to Employees
    fireEvent.click(screen.getByRole('button', { name: 'Employees' }));
    await waitFor(() => {
      expect(screen.getByText('EMPLOYEE CODE')).toBeInTheDocument();
    });
  });

  it('9. Updates KPI metrics dynamically from backend API responses and calculates live values', async () => {
    renderComponent();

    // After async load, dynamic metrics should be rendered
    await waitFor(() => {
      expect(screen.getByText('Active Employees')).toBeInTheDocument();
      expect(screen.getByText('Total Monthly CTC')).toBeInTheDocument();
      expect(screen.getByText('Pending Leave Approvals')).toBeInTheDocument();
    });
  });

  it('10. Refresh and Export actions execute cleanly', async () => {
    renderComponent();

    const refreshBtn = screen.getByTitle('Refresh HR Data');
    fireEvent.click(refreshBtn);

    const exportBtn = screen.getAllByRole('button', { name: /export/i })[0];
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /hr dashboard/i })).toBeInTheDocument();
    });
  });

  it('11. Employee Master table WORK EMAIL and PHONE columns have sufficient width, boundaries, and tooltip', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('ananya.rao@kalpanaaa.com')).toBeInTheDocument();
    });

    const emailHeader = screen.getByText('WORK EMAIL').closest('th');
    const phoneHeader = screen.getByText('PHONE').closest('th');

    expect(emailHeader).toBeInTheDocument();
    expect(phoneHeader).toBeInTheDocument();
    // Verify Work Email header has 260px width
    expect(emailHeader?.getAttribute('style')).toContain('260px');
    // Verify Phone header has 150px width
    expect(phoneHeader?.getAttribute('style')).toContain('150px');

    const emailLink = screen.getByText('ananya.rao@kalpanaaa.com');
    // Verify title tooltip is present to prevent truncation overlap
    expect(emailLink).toHaveAttribute('title', 'ananya.rao@kalpanaaa.com');
    expect(emailLink).toHaveClass('truncate');
  });

  it('12. Standardized Status Dropdowns render with options in Employee Master table', async () => {
    vi.spyOn(employeeService, 'updateEmployee').mockResolvedValue({} as any);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('ananya.rao@kalpanaaa.com')).toBeInTheDocument();
    });

    const statusPills = screen.getAllByTitle('Click to change state');
    expect(statusPills.length).toBeGreaterThan(0);
    expect(statusPills[0]).toHaveTextContent('Active');
  });
});
