export type EmploymentType = 'Full Time' | 'Contract' | 'Part Time' | 'Intern';
export type PayrollStatus = 'Paid' | 'Pending' | 'Processing' | 'Failed';

export interface PayrollRecord {
  id: number;
  payrollId: string;
  payrollMonth: string;
  employeeId: string;
  employeeName: string;
  employmentType: EmploymentType;
  monthlyCtc: number;
  workingDays: number;
  paidDays: number;
  lopDays: number;
  basicPay: number;
  hra: number;
  allowances: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  paymentStatus: PayrollStatus;
  paymentDate?: string | null;
  paymentMode?: string;
  bankName?: string;
  bankAccount?: string;
  panNumber?: string;
  notes?: string;
}

export interface PayrollKpiData {
  totalEmployees: number;
  totalEmployeesTrend: string;
  totalEmployeesTrendPositive: boolean;
  totalPayrollCost: number;
  formattedTotalPayrollCost: string;
  totalPayrollCostTrend: string;
  totalPayrollCostTrendPositive: boolean;
  netPayDisbursed: number;
  formattedNetPayDisbursed: string;
  netPayDisbursedTrend: string;
  netPayDisbursedTrendPositive: boolean;
  pendingPayrolls: number;
  pendingPayrollsTrend: string;
  pendingPayrollsTrendPositive: boolean;
  lastUpdated: string;
}

export interface PayrollFilters {
  search: string;
  payrollMonth: string;
  employmentType: string;
  status: string;
  employee: string;
}

export type PayrollSortOption =
  | 'newest'
  | 'oldest'
  | 'salary-desc'
  | 'salary-asc'
  | 'name-asc';

export interface PayrollFilterOptions {
  payrollMonths: string[];
  employmentTypes: string[];
  statuses: string[];
  employees: { employeeId: string; employeeName: string }[];
}

export interface ProcessPayrollPayload {
  payrollMonth: string;
  employeeId: string;
  employeeName: string;
  employmentType: EmploymentType;
  monthlyCtc: number;
  workingDays?: number;
  paidDays?: number;
  lopDays?: number;
  basicPay?: number;
  hra?: number;
  allowances?: number;
  deductions?: number;
  paymentStatus?: PayrollStatus;
  paymentDate?: string;
  paymentMode?: string;
  bankName?: string;
  bankAccount?: string;
  panNumber?: string;
  notes?: string;
}

export interface UpdatePayrollPayload {
  paymentStatus?: PayrollStatus;
  paymentDate?: string;
  workingDays?: number;
  paidDays?: number;
  lopDays?: number;
  monthlyCtc?: number;
  basicPay?: number;
  hra?: number;
  allowances?: number;
  deductions?: number;
  paymentMode?: string;
  bankName?: string;
  bankAccount?: string;
  panNumber?: string;
  notes?: string;
}

