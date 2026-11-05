import { apiRequest } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../services/api/apiEndpoints';
import { PageResponse } from '../types';
import {
  PayrollRecord,
  PayrollKpiData,
  PayrollFilterOptions,
  ProcessPayrollPayload,
  UpdatePayrollPayload,
} from '../types/payroll';

export interface FetchPayrollParams {
  search?: string;
  payrollMonth?: string;
  employmentType?: string;
  status?: string;
  employee?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export const payrollService = {
  /**
   * Fetches paginated, filtered, and sorted Payroll records.
   */
  async getPayrollRecords(params?: FetchPayrollParams): Promise<PageResponse<PayrollRecord>> {
    const queryParams = new URLSearchParams();
    if (params?.search && params.search.trim() !== '') {
      queryParams.append('search', params.search.trim());
    }
    if (params?.payrollMonth && params.payrollMonth !== 'All') {
      queryParams.append('payrollMonth', params.payrollMonth);
    }
    if (params?.employmentType && params.employmentType !== 'All') {
      queryParams.append('employmentType', params.employmentType);
    }
    if (params?.status && params.status !== 'All') {
      queryParams.append('status', params.status);
    }
    if (params?.employee && params.employee !== 'All' && params.employee !== 'All Employees') {
      queryParams.append('employee', params.employee);
    }
    if (params?.sort) {
      queryParams.append('sort', params.sort);
    }
    queryParams.append('page', String(params?.page || 1));
    queryParams.append('size', String(params?.size || 10));

    const endpoint = `${API_ENDPOINTS.HR.PAYROLL}?${queryParams.toString()}`;
    return apiRequest<PageResponse<PayrollRecord>>(endpoint, { method: 'GET' });
  },

  /**
   * Fetches dynamic KPI summary metrics calculated from the database.
   */
  async getKpis(month?: string): Promise<PayrollKpiData> {
    const query = month && month !== 'All' ? `?month=${encodeURIComponent(month)}` : '';
    return apiRequest<PayrollKpiData>(`${API_ENDPOINTS.HR.PAYROLL_KPIS}${query}`, { method: 'GET' });
  },

  /**
   * Fetches dropdown filter options from the database.
   */
  async getFilterOptions(): Promise<PayrollFilterOptions> {
    return apiRequest<PayrollFilterOptions>(API_ENDPOINTS.HR.PAYROLL_FILTERS, { method: 'GET' });
  },

  /**
   * Fetches a single payroll record by ID.
   */
  async getPayrollById(payrollId: string): Promise<PayrollRecord> {
    return apiRequest<PayrollRecord>(API_ENDPOINTS.HR.PAYROLL_BY_ID(payrollId), { method: 'GET' });
  },

  /**
   * Processes and creates a new payroll record in the database.
   */
  async processPayroll(payload: ProcessPayrollPayload): Promise<PayrollRecord> {
    return apiRequest<PayrollRecord>(API_ENDPOINTS.HR.PAYROLL_PROCESS, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Updates an existing payroll record in the database.
   */
  async updatePayroll(payrollId: string, payload: UpdatePayrollPayload): Promise<PayrollRecord> {
    return apiRequest<PayrollRecord>(API_ENDPOINTS.HR.PAYROLL_BY_ID(payrollId), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Deletes a payroll record from the database.
   */
  async deletePayroll(payrollId: string): Promise<void> {
    return apiRequest<void>(API_ENDPOINTS.HR.PAYROLL_BY_ID(payrollId), {
      method: 'DELETE',
    });
  },

  /**
   * Exports filtered payroll records to CSV and triggers instant client download.
   */
  async exportPayrollCsv(params?: FetchPayrollParams): Promise<void> {
    const queryParams = new URLSearchParams();
    if (params?.search && params.search.trim() !== '') {
      queryParams.append('search', params.search.trim());
    }
    if (params?.payrollMonth && params.payrollMonth !== 'All') {
      queryParams.append('payrollMonth', params.payrollMonth);
    }
    if (params?.employmentType && params.employmentType !== 'All') {
      queryParams.append('employmentType', params.employmentType);
    }
    if (params?.status && params.status !== 'All') {
      queryParams.append('status', params.status);
    }
    if (params?.employee && params.employee !== 'All' && params.employee !== 'All Employees') {
      queryParams.append('employee', params.employee);
    }
    if (params?.sort) {
      queryParams.append('sort', params.sort);
    }

    const endpoint = `${API_ENDPOINTS.HR.PAYROLL_EXPORT}?${queryParams.toString()}`;
    const records = await apiRequest<PayrollRecord[]>(endpoint, { method: 'GET' });

    if (!records || records.length === 0) {
      alert('No payroll records found to export.');
      return;
    }

    const headers = [
      'Payroll ID',
      'Payroll Month',
      'Employee ID',
      'Employee Name',
      'Employment Type',
      'Monthly CTC (₹)',
      'Working Days',
      'Paid Days',
      'LOP Days',
      'Basic Pay (₹)',
      'HRA (₹)',
      'Allowances (₹)',
      'Gross Salary (₹)',
      'Deductions (₹)',
      'Net Salary (₹)',
      'Status',
      'Payment Date',
      'Bank Name',
      'Bank Account',
    ];

    const rows = records.map((r) => [
      r.payrollId,
      r.payrollMonth,
      r.employeeId,
      `"${r.employeeName.replace(/"/g, '""')}"`,
      r.employmentType,
      r.monthlyCtc,
      r.workingDays,
      r.paidDays,
      r.lopDays,
      r.basicPay,
      r.hra,
      r.allowances,
      r.grossSalary,
      r.deductions,
      r.netSalary,
      r.paymentStatus,
      r.paymentDate || '-',
      r.bankName || '-',
      r.bankAccount || '-',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Payroll_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
