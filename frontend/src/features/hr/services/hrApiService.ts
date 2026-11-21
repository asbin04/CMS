import { UserPlus, CalendarCheck, Clock } from 'lucide-react';
import { apiRequest } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../services/api/apiEndpoints';
import {
  HrDashboardData,
  PageResponse,
  EmployeeRecord,
  LeaveRecord,
  AttendanceRecord,
  CandidateRecord,
  RecentActivityItem,
  QuickActionItem,
  CreateEmployeePayload,
  LogAttendancePayload,
} from '../types';

export const INITIAL_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'qa-1',
    title: 'Add Employee',
    description: 'Create a new employee record',
    icon: UserPlus,
    iconBg: 'bg-[#EFF6FF]',
    iconBorder: 'border-[#BFDBFE]',
    iconColor: 'text-[#2563EB]',
    targetPath: '/hr/employee-master',
    actionKey: 'add-employee',
  },
  {
    id: 'qa-2',
    title: 'Manage Leaves',
    description: 'Review leave requests',
    icon: CalendarCheck,
    iconBg: 'bg-[#ECFDF5]',
    iconBorder: 'border-[#A7F3D0]',
    iconColor: 'text-[#059669]',
    targetPath: '/hr/leave',
    actionKey: 'manage-leaves',
  },
  {
    id: 'qa-3',
    title: 'View Attendance',
    description: 'Check attendance records',
    icon: Clock,
    iconBg: 'bg-[#FFFBEB]',
    iconBorder: 'border-[#FDE68A]',
    iconColor: 'text-[#D97706]',
    targetPath: '/hr/attendance',
    actionKey: 'view-attendance',
  },
];

export const hrApiService = {
  /**
   * Fetch HR dashboard data from Spring Boot backend with optional department and period filters.
   */
  async getHrDashboardData(department?: string, period?: string): Promise<HrDashboardData> {
    const query = new URLSearchParams();
    if (department && department !== 'All') query.set('department', department);
    if (period && period !== 'All') query.set('period', period);

    const qs = query.toString();
    const url = `${API_ENDPOINTS.HR.DASHBOARD}${qs ? '?' + qs : ''}`;

    const backendData = await apiRequest<any>(url);
    return {
      lastUpdated: backendData.lastUpdated || '',
      workforce: backendData.workforce,
      recruitment: backendData.recruitment,
      leave: backendData.leave,
      attendance: backendData.attendance,
      lifecycle: backendData.lifecycle,
      recentActivities: backendData.recentActivities || [],
      quickActions: INITIAL_QUICK_ACTIONS,
    };
  },

  /**
   * Trigger dashboard timestamp refresh and recalculation in Spring Boot backend.
   */
  async refreshHrDashboard(): Promise<HrDashboardData> {
    const backendData = await apiRequest<any>(API_ENDPOINTS.HR.REFRESH, {
      method: 'POST',
    });
    return {
      lastUpdated: backendData.lastUpdated || '',
      workforce: backendData.workforce,
      recruitment: backendData.recruitment,
      leave: backendData.leave,
      attendance: backendData.attendance,
      lifecycle: backendData.lifecycle,
      recentActivities: backendData.recentActivities || [],
      quickActions: INITIAL_QUICK_ACTIONS,
    };
  },

  /**
   * Fetch paginated employees from backend. Handles PageResponse and array responses seamlessly.
   */
  async getEmployees(params?: {
    search?: string;
    department?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<EmployeeRecord>> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.department && params.department !== 'All') query.set('department', params.department);
    if (params?.status && params.status !== 'All') query.set('status', params.status);
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());

    const qs = query.toString();
    const url = `${API_ENDPOINTS.HR.EMPLOYEES}${qs ? '?' + qs : ''}`;
    const data = await apiRequest<any>(url);

    if (Array.isArray(data)) {
      return {
        content: data,
        pageNumber: 0,
        pageSize: data.length,
        totalElements: data.length,
        totalPages: 1,
        isFirst: true,
        isLast: true,
      };
    }
    return {
      content: data.content || [],
      pageNumber: data.pageNumber ?? 0,
      pageSize: data.pageSize ?? (data.content?.length || 0),
      totalElements: data.totalElements ?? (data.content?.length || 0),
      totalPages: data.totalPages ?? 1,
      isFirst: data.isFirst ?? true,
      isLast: data.isLast ?? true,
      hasNext: data.hasNext,
      hasPrevious: data.hasPrevious,
    };
  },

  /**
   * Create a new employee record with backend validation and sequence-based ID generation.
   */
  async createEmployee(data: CreateEmployeePayload): Promise<EmployeeRecord> {
    return apiRequest<EmployeeRecord>(API_ENDPOINTS.HR.EMPLOYEES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Fetch leave requests from backend with optional status filter.
   */
  async getLeaves(status?: string): Promise<LeaveRecord[]> {
    const query = new URLSearchParams();
    if (status && status !== 'All') query.set('status', status);

    const qs = query.toString();
    const url = `${API_ENDPOINTS.HR.LEAVES}${qs ? '?' + qs : ''}`;
    return apiRequest<LeaveRecord[]>(url);
  },

  /**
   * Update leave request status (Approved or Rejected).
   */
  async updateLeaveStatus(id: string | number, status: 'Approved' | 'Rejected'): Promise<LeaveRecord> {
    return apiRequest<LeaveRecord>(API_ENDPOINTS.HR.LEAVE_STATUS(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Fetch attendance records from backend with optional date and status filters.
   */
  async getAttendance(params?: { date?: string; status?: string }): Promise<AttendanceRecord[]> {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.status && params.status !== 'All') query.set('status', params.status);

    const qs = query.toString();
    const url = `${API_ENDPOINTS.HR.ATTENDANCE}${qs ? '?' + qs : ''}`;
    return apiRequest<AttendanceRecord[]>(url);
  },

  /**
   * Log employee daily attendance with backend duplicate check.
   */
  async logAttendance(data: LogAttendancePayload): Promise<AttendanceRecord> {
    const payload = {
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      status: data.status,
      attendanceDate: data.attendanceDate || data.date,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      notes: data.notes,
    };
    return apiRequest<AttendanceRecord>(API_ENDPOINTS.HR.ATTENDANCE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch candidate recruitment pipeline with optional department and daysInPipeline filters.
   */
  async getCandidates(params?: { department?: string; minDaysInPipeline?: number }): Promise<CandidateRecord[]> {
    const query = new URLSearchParams();
    if (params?.department && params.department !== 'All') query.set('department', params.department);
    if (params?.minDaysInPipeline !== undefined) query.set('minDaysInPipeline', params.minDaysInPipeline.toString());

    const qs = query.toString();
    const url = `${API_ENDPOINTS.HR.CANDIDATES}${qs ? '?' + qs : ''}`;
    return apiRequest<CandidateRecord[]>(url);
  },

  /**
   * Fetch recent HR audit activity logs.
   */
  async getActivities(): Promise<RecentActivityItem[]> {
    return apiRequest<RecentActivityItem[]>(API_ENDPOINTS.HR.ACTIVITIES);
  },
};
