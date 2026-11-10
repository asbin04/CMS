export interface ExpenseItem {
  id: number;
  expenseCode: string;
  expenseDate: string; // YYYY-MM-DD
  category: string;
  vendorId?: string;
  projectId?: string;
  employeeId?: string;
  description: string;
  amountBeforeTax: number;
  taxAmount: number;
  totalAmount: number;
  paymentMode: string;
  status: 'Approved' | 'Pending' | 'Rejected' | string;
  approvedBy?: string;
  monthLabel: string;
  expenseBucket: string;
  isProjectExpense?: boolean;
  projectLabel?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseKpis {
  totalExpenses: number;
  approvedExpenses: number;
  pendingApproval: number;
  rejectedExpenses: number;
  thisMonthExpenses: number;
  totalExpensesTrend: number;
  approvedExpensesTrend: number;
  pendingApprovalTrend: number;
  rejectedExpensesTrend: number;
  thisMonthExpensesTrend: number;
  totalCount: number;
}

export interface ExpenseFilterOptions {
  categories: string[];
  statuses: string[];
  projects: string[];
  months: string[];
}

export interface CreateExpensePayload {
  expenseCode?: string;
  expenseDate: string;
  category: string;
  vendorId?: string;
  projectId?: string;
  employeeId?: string;
  description: string;
  amountBeforeTax: number;
  taxAmount?: number;
  totalAmount?: number;
  paymentMode?: string;
  status?: string;
  approvedBy?: string;
  monthLabel?: string;
  expenseBucket?: string;
}

export interface UpdateExpensePayload {
  expenseDate?: string;
  category?: string;
  vendorId?: string;
  projectId?: string;
  employeeId?: string;
  description?: string;
  amountBeforeTax?: number;
  taxAmount?: number;
  totalAmount?: number;
  paymentMode?: string;
  status?: string;
  approvedBy?: string;
  monthLabel?: string;
  expenseBucket?: string;
}

