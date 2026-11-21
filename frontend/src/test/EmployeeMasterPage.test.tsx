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

  it('clicking Import triggers CSV file selection and imports records via bulkCreateEmployees', async () => {
    const bulkSpy = vi.spyOn(employeeService, 'bulkCreateEmployees').mockResolvedValue([
      { id: 10, employeeId: 'EMP-010', fullName: 'Imported User' } as any,
    ]);

    await act(async () => {
      render(
        <BrowserRouter>
          <EmployeeMasterPage />
        </BrowserRouter>
      );
    });

    const fileInput = screen.getByTestId('employee-csv-input');
    const csvContent =
      'Employee ID,Full Name,Email,Phone,Department,Designation,Monthly CTC,Joining Date\n' +
      'EMP-010,Imported User,imported@company.com,+91 99999 11111,Engineering,Lead,85000,2026-01-15';
    const file = new File([csvContent], 'employees.csv', { type: 'text/csv' });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(bulkSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          employeeId: 'EMP-010',
          fullName: 'Imported User',
          workEmail: 'imported@company.com',
          department: 'Engineering',
          monthlyCtc: 85000,
        }),
      ])
    );
    expect(screen.getByText('Import Successful')).toBeDefined();
  });

  it('shows error toast when importing an empty CSV file', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <EmployeeMasterPage />
        </BrowserRouter>
      );
    });

    const fileInput = screen.getByTestId('employee-csv-input');
    const emptyFile = new File([''], 'empty.csv', { type: 'text/csv' });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [emptyFile] } });
    });

    expect(screen.getByText('Import Failed')).toBeDefined();
  });
});

