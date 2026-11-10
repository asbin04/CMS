import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import {
  TimesheetRecord,
  TimesheetKpis,
  TimesheetApprovalStatus,
  TimesheetQueryParams,
  CreateTimesheetPayload,
  UpdateTimesheetPayload,
  PageResponse,
} from '../types';
import { formatRupee, formatHours, formatDateForDisplay, formatDateForInput } from '../utils/formatters';

export function mapBackendTimesheetToRecord(raw: any): TimesheetRecord {
  const isBillable =
    raw.billable === 'Yes' ||
    raw.billableStatus === 'Yes' ||
    raw.billable === true ||
    raw.billableStatus === 'BILLABLE';

  const rawHours = Number(raw.hoursWorked ?? raw.hoursSpent ?? raw.hours ?? 0);
  const rawRate = Number(raw.hourlyRate ?? raw.billableRate ?? 0);
  const rawAmt = Number(raw.billableAmount ?? (isBillable ? rawHours * rawRate : 0));
  const rawLabor = Number(raw.estimatedLaborCost ?? raw.laborCost ?? rawHours * 800);

  return {
    timesheetId: raw.timesheetId || raw.id || '',
    date: formatDateForDisplay(raw.timesheetDate || raw.date),
    employeeId: raw.employeeId || '',
    employeeName: raw.employeeName || (raw.employeeId ? `Employee ${raw.employeeId}` : 'Unassigned'),
    projectId: raw.projectId || '',
    taskId: raw.taskId || '',
    hours: rawHours,
    billable: isBillable ? 'Yes' : 'No',
    billableRate: isBillable
      ? typeof raw.billableRate === 'string' && raw.billableRate.includes('₹')
        ? raw.billableRate
        : formatRupee(rawRate, true)
      : '-',
    billableAmount:
      typeof raw.billableAmount === 'string' && raw.billableAmount.includes('₹')
        ? raw.billableAmount
        : formatRupee(rawAmt, true),
    approvalStatus: (raw.approvalStatus || 'Pending') as TimesheetApprovalStatus,
    assignedApprover: raw.assignedApprover || raw.assigned_approver || 'CEO – Akshit Ujjain',
    approvedBy:
      raw.approvalStatus === 'Approved'
        ? (raw.approvedBy && raw.approvedBy !== '-'
            ? (raw.approvedBy.toLowerCase().includes('gaurav') ? 'Gaurav Tripathy' : 'Akshit Ujjain')
            : ((raw.assignedApprover || raw.assigned_approver || '').toLowerCase().includes('gaurav') ? 'Gaurav Tripathy' : 'Akshit Ujjain'))
        : '-',
    approvalDate:
      raw.approvalStatus === 'Approved'
        ? (raw.approvedAt || raw.approvalDate ? formatDateForDisplay(raw.approvedAt || raw.approvalDate) : formatDateForDisplay(new Date()))
        : '-',
    approvedAt: raw.approvedAt || undefined,
    estimatedLaborCost:
      typeof raw.estimatedLaborCost === 'string' && raw.estimatedLaborCost.includes('₹')
        ? raw.estimatedLaborCost
        : formatRupee(rawLabor, true),
    notes: raw.notes || raw.taskDescription || raw.description || '',
  };
}

export function mapBackendTimesheetKpis(raw: any): TimesheetKpis {
  return {
    totalHours: typeof raw.totalHours === 'string' ? raw.totalHours : formatHours(raw.totalHours),
    totalHoursTrend: raw.totalHoursTrend || '↑ 12% vs last month',
    billableHours: typeof raw.billableHours === 'string' ? raw.billableHours : formatHours(raw.billableHours),
    billableHoursTrend: raw.billableHoursTrend || '↑ 15% vs last month',
    billableAmount: typeof raw.billableAmount === 'string' ? raw.billableAmount : formatRupee(raw.billableAmount),
    billableAmountTrend: raw.billableAmountTrend || '↑ 18% vs last month',
    pendingApprovals: Number(raw.pendingApprovals ?? 0),
    pendingApprovalsTrend: raw.pendingApprovalsTrend || '↓ 33% vs last month',
  };
}

export const timesheetsApiService = {
  /**
   * Fetch paginated and filtered timesheet records from the Spring Boot backend
   */
  async getTimesheets(params: TimesheetQueryParams = {}): Promise<PageResponse<TimesheetRecord>> {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params.project && params.project !== 'All Projects') queryParams.project = params.project;
    if (params.employee && params.employee !== 'All Employees') queryParams.employee = params.employee;
    if (params.approvalStatus && params.approvalStatus !== 'All Status') queryParams.approvalStatus = params.approvalStatus;
    if (params.billable && params.billable !== 'All') queryParams.billable = params.billable;
    if (params.dateFrom) queryParams.dateFrom = params.dateFrom;
    if (params.dateTo) queryParams.dateTo = params.dateTo;
    if (params.sort) queryParams.sort = params.sort;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;

    const res = await apiClient.get<PageResponse<any>>(API_ENDPOINTS.TIMESHEETS.BASE, queryParams);
    const data = res.data;

    return {
      content: (data?.content || []).map(mapBackendTimesheetToRecord),
      pageNumber: data?.pageNumber ?? 1,
      pageSize: data?.pageSize ?? (params.size || 10),
      totalElements: data?.totalElements ?? 0,
      totalPages: data?.totalPages ?? 1,
      first: data?.first,
      last: data?.last,
      empty: data?.empty,
    };
  },

  /**
   * Fetch all filtered records without pagination (e.g. for full CSV export)
   */
  async getAllFilteredTimesheets(params: TimesheetQueryParams = {}): Promise<TimesheetRecord[]> {
    const res = await this.getTimesheets({ ...params, page: 1, size: 10000 });
    return res.content;
  },

  /**
   * Get timesheet KPI statistics summary
   */
  async getKpis(): Promise<TimesheetKpis> {
    const res = await apiClient.get<any>(API_ENDPOINTS.TIMESHEETS.KPIS);
    return mapBackendTimesheetKpis(res.data);
  },

  /**
   * Get a single timesheet record by ID
   */
  async getTimesheetById(id: string): Promise<TimesheetRecord> {
    const res = await apiClient.get<any>(API_ENDPOINTS.TIMESHEETS.BY_ID(id));
    return mapBackendTimesheetToRecord(res.data);
  },

  /**
   * Log time (create new timesheet)
   */
  async createTimesheet(payload: CreateTimesheetPayload): Promise<TimesheetRecord> {
    const hours = Number(payload.hoursWorked ?? payload.hoursSpent ?? payload.hours ?? 0);
    const hourlyRate = Number(payload.hourlyRate ?? payload.billableRate ?? 1500);
    const body: Record<string, any> = {
      projectId: payload.projectId,
      taskId: payload.taskId,
      employeeId: payload.employeeId,
      timesheetDate: formatDateForInput(payload.timesheetDate || payload.date),
      hours: hours,
      hoursWorked: hours,
      hoursSpent: hours,
      billable: payload.billable ?? 'Yes',
      isBillable: payload.billable !== 'No',
      hourlyRate: hourlyRate,
      billableRate: hourlyRate,
      notes: payload.taskDescription ?? payload.description ?? payload.notes ?? '',
      taskDescription: payload.taskDescription ?? payload.description ?? payload.notes ?? '',
      approvalStatus: payload.approvalStatus || 'Pending',
      assignedApprover: payload.assignedApprover || 'CEO – Akshit Ujjain',
    };
    if (payload.approvedBy) {
      body.approvedBy = payload.approvedBy;
    }
    const res = await apiClient.post<any>(API_ENDPOINTS.TIMESHEETS.BASE, body);
    return mapBackendTimesheetToRecord(res.data);
  },

  /**
   * Update timesheet
   */
  async updateTimesheet(id: string, payload: UpdateTimesheetPayload): Promise<TimesheetRecord> {
    const body: Record<string, any> = {};
    if (payload.taskId) body.taskId = payload.taskId;
    if (payload.timesheetDate || payload.date) {
      body.timesheetDate = formatDateForInput(payload.timesheetDate || payload.date);
    }
    if (payload.hoursWorked !== undefined || payload.hoursSpent !== undefined) {
      body.hoursWorked = payload.hoursWorked ?? payload.hoursSpent;
    }
    if (payload.billable) body.billable = payload.billable;
    if (payload.hourlyRate !== undefined) body.hourlyRate = payload.hourlyRate;
    if (payload.description !== undefined || payload.notes !== undefined) {
      body.taskDescription = payload.description ?? payload.notes;
    }

    const res = await apiClient.put<any>(API_ENDPOINTS.TIMESHEETS.BY_ID(id), body);
    return mapBackendTimesheetToRecord(res.data);
  },

  /**
   * Delete timesheet
   */
  async deleteTimesheet(id: string): Promise<void> {
    await apiClient.delete<void>(API_ENDPOINTS.TIMESHEETS.BY_ID(id));
  },

  /**
   * Submit timesheet for approval
   */
  async submitTimesheet(id: string): Promise<TimesheetRecord> {
    const res = await apiClient.post<any>(API_ENDPOINTS.TIMESHEETS.SUBMIT(id));
    return mapBackendTimesheetToRecord(res.data);
  },

  /**
   * Approve timesheet (Manager/Admin/CEO)
   */
  async approveTimesheet(id: string, comments?: string): Promise<TimesheetRecord> {
    const res = await apiClient.post<any>(API_ENDPOINTS.TIMESHEETS.APPROVE(id), { comments });
    return mapBackendTimesheetToRecord(res.data);
  },

  /**
   * Reject timesheet with mandatory reason (Manager/Admin/CEO)
   */
  async rejectTimesheet(id: string, reason: string): Promise<TimesheetRecord> {
    const res = await apiClient.post<any>(API_ENDPOINTS.TIMESHEETS.REJECT(id), { reason });
    return mapBackendTimesheetToRecord(res.data);
  },

  /**
   * Update approval status via dedicated status endpoint (Supports Approved, Rejected, Pending)
   */
  async updateApprovalStatus(id: string, status: string, reason?: string): Promise<TimesheetRecord> {
    if (status === 'Approved') {
      return this.approveTimesheet(id);
    } else if (status === 'Rejected') {
      return this.rejectTimesheet(id, reason || 'Rejected by reviewer');
    } else if (status === 'Pending') {
      return this.submitTimesheet(id);
    }
    const res = await apiClient.patch<any>(API_ENDPOINTS.TIMESHEETS.STATUS(id), {
      status,
      reason: reason || (status === 'Rejected' ? 'Rejected by reviewer' : undefined),
      rejectionReason: reason || (status === 'Rejected' ? 'Rejected by reviewer' : undefined),
    });
    return mapBackendTimesheetToRecord(res.data);
  },

  /**
   * Override estimated labor cost (Manager/Admin/CEO)
   */
  async overrideLaborCost(id: string, laborCost: number, reason: string): Promise<TimesheetRecord> {
    const res = await apiClient.post<any>(API_ENDPOINTS.TIMESHEETS.OVERRIDE_LABOR_COST(id), {
      laborCost,
      overrideReason: reason,
    });
    return mapBackendTimesheetToRecord(res.data);
  },
};

