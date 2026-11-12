import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ExpensesPage } from '../features/finance/pages/ExpensesPage';
import { expenseService } from '../features/finance/services/expenseService';
import { ExpenseItem, ExpenseKpis, ExpenseFilterOptions } from '../features/finance/types/expenses';

vi.mock('../features/finance/services/expenseService', () => ({
  expenseService: {
    getExpenses: vi.fn(),
    getKpis: vi.fn(),
    getFilterOptions: vi.fn(),
    createExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
    exportToCsv: vi.fn(),
  },
}));

const mockExpenses: ExpenseItem[] = [
  {
    id: 1,
    expenseCode: 'EXP-2026-0483',
    expenseDate: '2026-10-28',
    category: 'Software',
    vendorId: 'VEN-001',
    projectId: 'PRJ-001',
    employeeId: 'EMP-014',
    description: 'Figma annual license renewal',
    amountBeforeTax: 25000,
    taxAmount: 4500,
    totalAmount: 29500,
    paymentMode: 'Card',
    status: 'Approved',
    approvedBy: 'Rohan Verma',
    monthLabel: 'Oct 2026',
    expenseBucket: 'Operational',
  },
  {
    id: 2,
    expenseCode: 'EXP-2026-0482',
    expenseDate: '2026-10-27',
    category: 'Travel',
    vendorId: 'VEN-014',
    projectId: 'PRJ-002',
    employeeId: 'EMP-009',
    description: 'Client meeting travel (Bangalore)',
    amountBeforeTax: 12000,
    taxAmount: 2160,
    totalAmount: 14160,
    paymentMode: 'UPI',
    status: 'Approved',
    approvedBy: 'Sneha Nair',
    monthLabel: 'Oct 2026',
    expenseBucket: 'Project',
  },
];

const mockKpis: ExpenseKpis = {
  totalExpenses: 18760,
  approvedExpenses: 15760,
  pendingApproval: 23760,
  rejectedExpenses: 37950,
  thisMonthExpenses: 37950,
  totalExpensesTrend: 14,
  approvedExpensesTrend: 18,
  pendingApprovalTrend: 6,
  rejectedExpensesTrend: 28,
  thisMonthExpensesTrend: 12,
  totalCount: 124,
};

const mockFilters: ExpenseFilterOptions = {
  categories: ['Software', 'Travel', 'Utilities', 'Office Supplies', 'Hardware', 'Marketing', 'Training', 'Other'],
  statuses: ['Approved', 'Pending', 'Rejected'],
  projects: ['PRJ-001', 'PRJ-002', 'PRJ-003'],
  months: ['Oct 2026', 'Sep 2026'],
};

describe('ExpensesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(expenseService.getExpenses).mockResolvedValue(mockExpenses);
    vi.mocked(expenseService.getKpis).mockResolvedValue(mockKpis);
    vi.mocked(expenseService.getFilterOptions).mockResolvedValue(mockFilters);
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <ExpensesPage />
      </BrowserRouter>
    );

  it('renders page header with title, subtitle and action buttons', async () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /Expenses/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Track and manage company expenses, reimbursements and project-related costs/i)).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Add Expense')).toBeInTheDocument();
  });

  it('renders 5 KPI cards with values and trends', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('Approval Expenses')).toBeInTheDocument();
      expect(screen.getByText('Pending Approval')).toBeInTheDocument();
      expect(screen.getByText('Rejected Expenses')).toBeInTheDocument();
      expect(screen.getByText('This Month Expenses')).toBeInTheDocument();
      expect(screen.getByText('₹ 18,760')).toBeInTheDocument();
      expect(screen.getByText('₹ 15,760')).toBeInTheDocument();
      expect(screen.getByText('₹ 23,760')).toBeInTheDocument();
    });
  });

  it('renders table columns and rows from live data', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('EXP-2026-0483')).toBeInTheDocument();
      expect(screen.getByText('Figma annual license renewal')).toBeInTheDocument();
      expect(screen.getByText('29,500.00')).toBeInTheDocument();
      expect(screen.getAllByText('Software').length).toBeGreaterThan(0);
      expect(screen.getByText('Rohan Verma')).toBeInTheDocument();
    });
  });

  it('opens and closes Add Expense modal', async () => {
    renderComponent();
    const addBtn = screen.getByText('Add Expense');
    fireEvent.click(addBtn);

    expect(screen.getByText('Add New Expense')).toBeInTheDocument();
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Add New Expense')).not.toBeInTheDocument();
    });
  });

  it('calls exportToCsv when Export button is clicked', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('EXP-2026-0483')).toBeInTheDocument();
    });

    const exportBtn = screen.getByText('Export');
    fireEvent.click(exportBtn);

    expect(expenseService.exportToCsv).toHaveBeenCalledWith(mockExpenses);
  });

  it('updates search filter when typing into search input', async () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText(/Search by Expense ID, Description, Vendor ID/i);
    fireEvent.change(searchInput, { target: { value: 'Figma' } });

    await waitFor(() => {
      expect(expenseService.getExpenses).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Figma',
        })
      );
    });
  });

  it('toggles filter dropdowns row when Filters button is clicked', async () => {
    renderComponent();

    // Initially open
    expect(screen.getByTestId('expense-filter-dropdowns-row')).toBeInTheDocument();

    // Click Filters button -> closes all filters
    const filterBtn = screen.getByRole('button', { name: /^Filters$/i });
    fireEvent.click(filterBtn);

    expect(screen.queryByTestId('expense-filter-dropdowns-row')).not.toBeInTheDocument();

    // Click Filters button again -> opens all filters
    fireEvent.click(filterBtn);
    expect(screen.getByTestId('expense-filter-dropdowns-row')).toBeInTheDocument();
  });
});
