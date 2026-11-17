import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EmployeeMasterPage } from '@/features/hr/pages/EmployeeMasterPage';
import { employeeService } from '@/services/employeeService';

describe('EmployeeMasterPage Component', () => {
  const sampleEmployees = [
    {
      id: 1,
      employeeId: 'EMP-001',
      employeeCode: 'E-001',
      fullName: 'Amit Sharma',
      avatarInitials: 'AS',
      avatarColor: '#1D4ED8',
      avatarBg: '#DBEAFE',
      workEmail: 'amit.sharma@company.com',
      phone: '+91 98765 43210',
      department: 'Engineering',
      designation: 'Software Engineer',
      employmentType: 'Full Time',
      status: 'Active',
      location: 'Bangalore',
      reportingManager: 'Akshit Ujjain',
      joiningDate: '15 Jan 2023',
      tenureStatus: '1-3 Years',
      monthlyCtc: 45000,
      monthlyCtcFormatted: '₹ 45,000',
      annualCtc: 540000,
      annualCtcFormatted: '₹ 5,40,000',
      gender: 'Male',
      orderIndex: 1,
    },
    {
      id: 2,
      employeeId: 'EMP-002',
      employeeCode: 'E-002',
      fullName: 'Priya Kapoor',
      avatarInitials: 'PK',
      avatarColor: '#0E7490',
      avatarBg: '#CFFAFE',
      workEmail: 'priya.k@company.com',
      phone: '+91 87654 32109',
      department: 'Design',
      designation: 'UI/UX Designer',
      employmentType: 'Full Time',
      status: 'Active',
      location: 'Mumbai',
      reportingManager: 'Akshit Ujjain',
      joiningDate: '10 Feb 2023',
      tenureStatus: '1-3 Years',
      monthlyCtc: 38000,
      monthlyCtcFormatted: '₹ 38,000',
      annualCtc: 456000,
      annualCtcFormatted: '₹ 4,56,000',
      gender: 'Female',
      orderIndex: 2,
    },
    {
      id: 3,
      employeeId: 'EMP-003',
      employeeCode: 'E-003',
      fullName: 'Rohan Kumar',
      avatarInitials: 'RK',
      avatarColor: '#BE123C',
      avatarBg: '#FFE4E6',
      workEmail: 'rohan.k@company.com',
      phone: '+91 99887 66554',
      department: 'Sales',
      designation: 'Sales Executive',
      employmentType: 'Full Time',
      status: 'On Notice',
      location: 'Delhi',
      reportingManager: 'Akshit Ujjain',
      joiningDate: '01 Mar 2023',
      tenureStatus: '1-3 Years',
      monthlyCtc: 32000,
      monthlyCtcFormatted: '₹ 32,000',
      annualCtc: 384000,
      annualCtcFormatted: '₹ 3,84,000',
      gender: 'Male',
      orderIndex: 3,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(employeeService, 'getEmployees').mockResolvedValue(sampleEmployees as any);
    vi.spyOn(employeeService, 'getSummary').mockResolvedValue({
      totalEmployees: 248,
      totalEmployeesTrend: '↑ 12% vs last month',
      activeEmployees: 212,
      activeEmployeesTrend: '↑ 8% vs last month',
      onNoticeEmployees: 5,
      onNoticeEmployeesTrend: '↓ 25% vs last month',
      totalMonthlyCtc: 1845000,
      totalMonthlyCtcFormatted: '₹ 18,45,000',
      totalMonthlyCtcTrend: '↑ 8% vs last month',
    });
  });

  it('renders page title, subtitle, and KPI cards with live metrics', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <EmployeeMasterPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByRole('heading', { name: /Employee Master/i })).toBeDefined();
    expect(
      screen.getByText(/Manage employee profiles, employment details, organisational information/i)
    ).toBeDefined();

    expect(screen.getByText('Total Employees')).toBeDefined();
    expect(screen.getByText('248')).toBeDefined();
    expect(screen.getByText('Active Employees')).toBeDefined();
    expect(screen.getByText('212')).toBeDefined();
    expect(screen.getAllByText('On Notice').length).toBeGreaterThan(0);
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('Total Monthly CTC')).toBeDefined();
    expect(screen.getByText('₹ 18,45,000')).toBeDefined();
  });

  it('renders employee records and column headers in the table', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <EmployeeMasterPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('EMP-001')).toBeDefined();
    expect(screen.getByText('Amit Sharma')).toBeDefined();
    expect(screen.getByText('amit.sharma@company.com')).toBeDefined();
    expect(screen.getByText('EMP-002')).toBeDefined();
    expect(screen.getByText('Priya Kapoor')).toBeDefined();
    expect(screen.getByText('EMP-003')).toBeDefined();
    expect(screen.getByText('Rohan Kumar')).toBeDefined();
  });

  it('filters employees by search query', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <EmployeeMasterPage />
        </BrowserRouter>
      );
    });

    const searchInput = screen.getByPlaceholderText(/Search by Employee ID, name/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Priya' } });
    });

    expect(screen.getByText('Priya Kapoor')).toBeDefined();
    expect(screen.queryByText('Amit Sharma')).toBeNull();
  });

  it('opens and closes Add Employee modal', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <EmployeeMasterPage />
        </BrowserRouter>
      );
    });

    const addBtn = screen.getByRole('button', { name: /Add Employee/i });
    await act(async () => {
      fireEvent.click(addBtn);
    });

    expect(
      screen.getByText('Enter complete employee details to create a new record.')
    ).toBeDefined();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });

    expect(
      screen.queryByText('Enter complete employee details to create a new record.')
    ).toBeNull();
  });

  it('renders consistent action menu button for each row and handles View Details and Edit', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <EmployeeMasterPage />
        </BrowserRouter>
      );
    });

    // Should have action buttons for all 3 rows
    const actionBtns = screen.getAllByLabelText(/Actions for /i);
    expect(actionBtns.length).toBe(3);

    // Open action menu for first employee in table (Rohan Kumar, newest joining date)
    await act(async () => {
      fireEvent.click(actionBtns[0]);
    });

    // Menu options should be present in document body via portal
    const viewOption = screen.getByRole('button', { name: /View Details/i });
    const editOption = screen.getByRole('button', { name: /Edit/i });
    const deleteOption = screen.getByRole('button', { name: /Delete/i });

    expect(viewOption).toBeDefined();
    expect(editOption).toBeDefined();
    expect(deleteOption).toBeDefined();

    // Click View Details
    await act(async () => {
      fireEvent.click(viewOption);
    });

    // Detail modal opens showing employee name and ID
    expect(screen.getByRole('heading', { name: /Rohan Kumar/i })).toBeDefined();
    expect(screen.getByText(/EMP-003 • E-003/i)).toBeDefined();

    // Close detail modal
    const closeBtn = screen.getByRole('button', { name: /Close modal/i });
    await act(async () => {
      fireEvent.click(closeBtn);
    });

    // Open action menu for second employee (Priya Kapoor)
    await act(async () => {
      fireEvent.click(actionBtns[1]);
    });

    const editOption2 = screen.getByRole('button', { name: /Edit/i });
    await act(async () => {
      fireEvent.click(editOption2);
    });

    // Should open detail modal in edit mode with Save button
    expect(screen.getByRole('button', { name: /Save/i })).toBeDefined();
  });

  it('maintains visible sticky actions column across pagination and sorting', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <EmployeeMasterPage />
        </BrowserRouter>
      );
    });

    // Verify ACTIONS header has sticky right alignment
    const actionsHeader = screen.getByRole('columnheader', { name: /ACTIONS/i });
    expect(actionsHeader).toBeDefined();
    expect(actionsHeader.className).toContain('sticky');
    expect(actionsHeader.className).toContain('right-0');

    // Change sort order
    const sortSelect = screen.getByDisplayValue('Joining Date (Newest)');
    await act(async () => {
      fireEvent.change(sortSelect, { target: { value: 'Name (A-Z)' } });
    });

    // Action buttons still render consistently for all rows
    const actionBtns = screen.getAllByLabelText(/Actions for /i);
    expect(actionBtns.length).toBe(3);
  });

  it('renders unified filter and table layout matching Leads page specification', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <EmployeeMasterPage />
        </BrowserRouter>
      );
    });

    // Top Row: Search bar, Filters button, Clear Filters button
    expect(screen.getByPlaceholderText(/Search by Employee ID, name, employee code, email or phone.../i)).toBeDefined();
    const filtersBtn = screen.getByRole('button', { name: /^Filters$/i });
    const clearFiltersBtn = screen.getByRole('button', { name: /Clear Filters/i });
    expect(filtersBtn).toBeDefined();
    expect(clearFiltersBtn).toBeDefined();

    // Filter section: 8 fields (Department, Designation, Employment Type, Status, Location, Reporting Manager, Joining Date, Current Tenure Status)
    expect(screen.getByText('Department')).toBeDefined();
    expect(screen.getByText('Designation')).toBeDefined();
    expect(screen.getByText('Employment Type')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('Location')).toBeDefined();
    expect(screen.getByText('Reporting Manager')).toBeDefined();
    expect(screen.getByText('Joining Date')).toBeDefined();
    expect(screen.getByText('Current Tenure Status')).toBeDefined();
    expect(screen.getByText('Select date range')).toBeDefined();

    // Table header section within the unified card: dynamic Employees count, info icon, Sort by
    expect(screen.getByRole('heading', { name: /Employees \(3\)/i })).toBeDefined();
    expect(screen.getByText('Sort by')).toBeDefined();
    expect(screen.getByDisplayValue('Joining Date (Newest)')).toBeDefined();

    // Filter by department (e.g. Design)
    const allSelects = screen.getAllByDisplayValue('All');
    const deptSelect = allSelects[0];
    await act(async () => {
      fireEvent.change(deptSelect, { target: { value: 'Design' } });
    });

    // Count updates dynamically to 1
    expect(screen.getByRole('heading', { name: /Employees \(1\)/i })).toBeDefined();
    expect(screen.getByText('Priya Kapoor')).toBeDefined();
    expect(screen.queryByText('Amit Sharma')).toBeNull();

    // Click Clear Filters resets everything back
    await act(async () => {
      fireEvent.click(clearFiltersBtn);
    });

    expect(screen.getByRole('heading', { name: /Employees \(3\)/i })).toBeDefined();
    expect(screen.getByText('Amit Sharma')).toBeDefined();
    expect(screen.getByText('Priya Kapoor')).toBeDefined();

    // Toggle Filters button hides the filter grid
    await act(async () => {
      fireEvent.click(filtersBtn);
    });
    expect(screen.queryByText('Select date range')).toBeNull();

    // Toggle Filters button again restores the filter grid
    await act(async () => {
      fireEvent.click(filtersBtn);
    });
    expect(screen.getByText('Select date range')).toBeDefined();
  });
});

