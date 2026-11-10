import { apiClient } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../services/api/apiEndpoints';
import {
  ExpenseItem,
  ExpenseKpis,
  ExpenseFilterOptions,
  CreateExpensePayload,
  UpdateExpensePayload,
} from '../types/expenses';

export const expenseService = {
  async getExpenses(filters?: {
    search?: string;
    category?: string;
    status?: string;
    projectId?: string;
    month?: string;
  }): Promise<ExpenseItem[]> {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.category && filters.category !== 'All Categories') params.category = filters.category;
    if (filters?.status && filters.status !== 'All Status') params.status = filters.status;
    if (filters?.projectId && filters.projectId !== 'All Projects') params.projectId = filters.projectId;
    if (filters?.month && filters.month !== 'All Months') params.month = filters.month;

    const res = await apiClient.get<ExpenseItem[]>(API_ENDPOINTS.FINANCE.EXPENSES, params);
    if (Array.isArray(res.data)) {
      return res.data;
    }
    if ((res as any)?.data?.data && Array.isArray((res as any).data.data)) {
      return (res as any).data.data;
    }
    return [];
  },

  async getKpis(): Promise<ExpenseKpis> {
    const res = await apiClient.get<ExpenseKpis>(API_ENDPOINTS.FINANCE.EXPENSES_KPIS);
    const kpiData = (res as any)?.data?.data || res.data;
    return (
      kpiData || {
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
      }
    );
  },

  async getFilterOptions(): Promise<ExpenseFilterOptions> {
    const res = await apiClient.get<ExpenseFilterOptions>(API_ENDPOINTS.FINANCE.EXPENSES_FILTERS);
    const filterData = (res as any)?.data?.data || res.data;
    return (
      filterData || {
        categories: [],
        statuses: [],
        projects: [],
        months: [],
      }
    );
  },

  async getExpenseById(id: number | string): Promise<ExpenseItem> {
    const res = await apiClient.get<ExpenseItem>(API_ENDPOINTS.FINANCE.EXPENSE_BY_ID(id));
    return (res as any)?.data?.data || res.data;
  },

  async createExpense(payload: CreateExpensePayload): Promise<ExpenseItem> {
    const res = await apiClient.post<ExpenseItem>(API_ENDPOINTS.FINANCE.EXPENSES, payload);
    return (res as any)?.data?.data || res.data;
  },

  async updateExpense(id: number | string, payload: UpdateExpensePayload): Promise<ExpenseItem> {
    const res = await apiClient.put<ExpenseItem>(API_ENDPOINTS.FINANCE.EXPENSE_BY_ID(id), payload);
    return (res as any)?.data?.data || res.data;
  },

  async deleteExpense(id: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.FINANCE.EXPENSE_BY_ID(id));
  },

  exportToCsv(expenses: ExpenseItem[]): void {
    const headers = [
      'Expense ID',
      'Expense Date',
      'Category',
      'Vendor ID',
      'Project ID',
      'Employee ID',
      'Description',
      'Amount Before Tax (₹)',
      'Tax Amount (₹)',
      'Total Amount (₹)',
      'Payment Mode',
      'Status',
      'Approved By',
      'Month',
      'Expense Bucket',
    ];

    const rows = expenses.map((e) => [
      e.expenseCode,
      e.expenseDate,
      e.category,
      e.vendorId || '-',
      e.projectId || '-',
      e.employeeId || '-',
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.amountBeforeTax?.toFixed(2) || '0.00',
      e.taxAmount?.toFixed(2) || '0.00',
      e.totalAmount?.toFixed(2) || '0.00',
      e.paymentMode || '-',
      e.status,
      e.approvedBy || '-',
      e.monthLabel,
      e.expenseBucket,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Expenses_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
