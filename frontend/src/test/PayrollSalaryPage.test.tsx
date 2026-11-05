import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { PayrollSalaryPage } from '../features/hr/pages/PayrollSalaryPage';
import { payrollService } from '../features/hr/services/payrollService';

vi.mock('../features/hr/services/payrollService', () => ({
  payrollService: {
    getPayrollRecords: vi.fn(),
    getKpis: vi.fn(),
    getFilterOptions: vi.fn(),
    processPayroll: vi.fn(),
    updatePayroll: vi.fn(),
    exportPayrollCsv: vi.fn(),
  },
}));

const mockRecords = [
  {
    id: 1,
    payrollId: 'PAY-202610-001',
    payrollMonth: 'Oct 2026',
    employeeId: 'EMP-001',
    employeeName: 'Amit Sharma',
    employmentType: 'Full Time',
    monthlyCtc: 600000,
    workingDays: 22,
    paidDays: 22,
    lopDays: 0,
    basicPay: 30000,
    hra: 15000,
    allowances: 5000,
    grossSalary: 50000,
    deductions: 4500,
    netSalary: 45500,
    paymentStatus: 'Paid',
    paymentDate: '2026-10-31',
    paymentMode: 'Bank Transfer',
    bankName: 'HDFC Bank',
    bankAccount: 'XXXXXXXX1001',
    panNumber: 'ABCDE1234F',
    notes: 'Standard monthly salary',
  },
  {
    id: 2,
    payrollId: 'PAY-202610-002',
    payrollMonth: 'Oct 2026',
    employeeId: 'EMP-004',
    employeeName: 'Sneha Nair',
    employmentType: 'Full Time',
    monthlyCtc: 540000,
    workingDays: 22,
    paidDays: 20,
    lopDays: 2,
    basicPay: 27000,
    hra: 13500,
    allowances: 4500,
    grossSalary: 45000,
    deductions: 4050,
    netSalary: 40950,
    paymentStatus: 'Paid',
    paymentDate: '2026-10-31',
    paymentMode: 'ICICI Bank',
    bankAccount: 'XXXXXXXX1004',
    panNumber: 'ABCDE1234F',
  },
];

const mockKpis = {
  totalEmployees: 248,
  totalEmployeesTrend: '8% vs last month',
  totalEmployeesTrendPositive: true,
  totalPayrollCost: 4820000,
  formattedTotalPayrollCost: '₹ 48,20,000',
  totalPayrollCostTrend: '12% vs last month',
  totalPayrollCostTrendPositive: true,
  netPayDisbursed: 3890000,
  formattedNetPayDisbursed: '₹ 38,90,000',
  netPayDisbursedTrend: '10% vs last month',
  netPayDisbursedTrendPositive: true,
  pendingPayrolls: 12,
  pendingPayrollsTrend: '20% vs last month',
  pendingPayrollsTrendPositive: false,
  lastUpdated: '15 Oct 2026, 11:30 AM',
};

const mockFilterOptions = {
  payrollMonths: ['Oct 2026', 'Sep 2026'],
  employmentTypes: ['Full Time', 'Contract', 'Part Time', 'Intern'],
  statuses: ['Paid', 'Pending', 'Processing', 'Failed'],
  employees: [
    { employeeId: 'EMP-001', employeeName: 'Amit Sharma' },
    { employeeId: 'EMP-004', employeeName: 'Sneha Nair' },
  ],
};

describe('PayrollSalaryPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (payrollService.getPayrollRecords as any).mockResolvedValue({
      content: mockRecords,
      totalElements: 248,
      totalPages: 25,
      pageNumber: 1,
      pageSize: 10,
    });
    (payrollService.getKpis as any).mockResolvedValue(mockKpis);
    (payrollService.getFilterOptions as any).mockResolvedValue(mockFilterOptions);
  });

  it('renders page header, title, and last updated timestamp', async () => {
    render(
      <BrowserRouter>
        <PayrollSalaryPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Payroll \/ Salary/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Manage monthly payroll, salaries, deductions, employer cost and payslip records/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Last Updated: 15 Oct 2026, 11:30 AM/i)).toBeInTheDocument();
    });
  });

  it('renders all 4 live KPI cards with correct metrics and percentages', async () => {
    render(
      <BrowserRouter>
        <PayrollSalaryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Employees')).toBeInTheDocument();
      expect(screen.getByText('248')).toBeInTheDocument();
      expect(screen.getByText('8% vs last month')).toBeInTheDocument();

      expect(screen.getByText('Total Payroll Cost (CTC)')).toBeInTheDocument();
      expect(screen.getByText('₹ 48,20,000')).toBeInTheDocument();
      expect(screen.getByText('12% vs last month')).toBeInTheDocument();

      expect(screen.getByText('Net Pay Disbursed')).toBeInTheDocument();
      expect(screen.getByText('₹ 38,90,000')).toBeInTheDocument();
      expect(screen.getByText('10% vs last month')).toBeInTheDocument();

      expect(screen.getByText('Pending Payrolls')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('20% vs last month')).toBeInTheDocument();
    });
  });

  it('renders table headers and seeded payroll records', async () => {
    render(
      <BrowserRouter>
        <PayrollSalaryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Payroll Records (248)')).toBeInTheDocument();
      expect(screen.getByText('PAY-202610-001')).toBeInTheDocument();
      expect(screen.getByText('Amit Sharma')).toBeInTheDocument();
      expect(screen.getByText('PAY-202610-002')).toBeInTheDocument();
      expect(screen.getByText('Sneha Nair')).toBeInTheDocument();
    });
  });

  it('opens and closes Payslip Modal when clicking payroll ID', async () => {
    render(
      <BrowserRouter>
        <PayrollSalaryPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('PAY-202610-001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('PAY-202610-001'));

    await waitFor(() => {
      expect(screen.getByText('KALPANAAA SOFTWARE SOLUTIONS')).toBeInTheDocument();
      expect(screen.getAllByText('Net Pay Disbursed').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('opens Process Payroll modal when clicking + Process Payroll button', async () => {
    render(
      <BrowserRouter>
        <PayrollSalaryPage />
      </BrowserRouter>
    );

    const processBtn = screen.getByRole('button', { name: /Process Payroll/i });
    fireEvent.click(processBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Process Monthly Payroll/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirm & Save Payroll/i })).toBeInTheDocument();
    });
  });
});
