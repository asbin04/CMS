import { apiClient } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../services/api/apiEndpoints';
import { triggerNotificationRefresh } from '../../../services/notificationService';
import { AttendanceRecord, AttendanceMetrics } from '../types/attendance';

function mapAttendance(item: any): AttendanceRecord {
  return {
    id: item.id,
    attendanceDate: item.attendanceDate || item.attendance_date || '31 Oct 2026',
    employeeId: item.employeeId || item.employee_id || '',
    employeeName: item.employeeName || item.employee_name || 'Amit Sharma',
    avatarInitials: item.avatarInitials || item.avatar_initials || 'AS',
    avatarColor: item.avatarColor || item.avatar_color || 'blue',
    status: item.status || 'Present',
    checkIn: item.checkIn || item.check_in || '-',
    checkOut: item.checkOut || item.check_out || '-',
    workHours: item.workHours || item.work_hours || '0h 0m',
    overtimeHours: item.overtimeHours || item.overtime_hours || '0h 0m',
    workMinutes: item.workMinutes !== undefined ? item.workMinutes : item.work_minutes,
    overtimeMinutes: item.overtimeMinutes !== undefined ? item.overtimeMinutes : item.overtime_minutes,
    dayType: item.dayType || item.day_type || 'Working Day',
    isLate: Boolean(item.isLate ?? item.is_late),
    hasOvertime: Boolean(item.hasOvertime ?? item.has_overtime),
    notes: item.notes || '',
    paidDayEquivalent: item.paidDayEquivalent || item.paid_day_equivalent || (item.status === 'Half Day' ? '0.5' : (item.status === 'Leave' || item.status === 'Absent' || item.status === 'Holiday' ? '0.0' : '1.0')),
    lateFlag: item.lateFlag || item.late_flag || (Boolean(item.isLate ?? item.is_late) ? 'Yes' : 'No'),
    overtimeValue: item.overtimeValue || item.overtime_value || (item.overtimeMinutes ? `₹ ${Math.round(item.overtimeMinutes * 12.5).toLocaleString('en-IN')}` : '₹ 0'),
    remarks: item.remarks !== undefined ? item.remarks : (item.notes || '-'),
    createdAt: item.createdAt || item.created_at,
    updatedAt: item.updatedAt || item.updated_at,
  };
}

export const attendanceService = {
  async getAttendance(): Promise<AttendanceRecord[]> {
    const res = await apiClient.get<AttendanceRecord[]>(API_ENDPOINTS.ATTENDANCE.BASE);
    const data = res.data || [];
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(mapAttendance);
  },

  async getAttendanceById(id: string): Promise<AttendanceRecord> {
    const res = await apiClient.get<AttendanceRecord>(API_ENDPOINTS.ATTENDANCE.BY_ID(id));
    return mapAttendance(res.data);
  },

  async createAttendance(record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await apiClient.post<AttendanceRecord>(API_ENDPOINTS.ATTENDANCE.BASE, record);
    triggerNotificationRefresh();
    return mapAttendance(res.data);
  },

  async updateAttendance(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await apiClient.put<AttendanceRecord>(API_ENDPOINTS.ATTENDANCE.BY_ID(id), updates);
    triggerNotificationRefresh();
    return mapAttendance(res.data);
  },

  async deleteAttendance(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ATTENDANCE.BY_ID(id));
    triggerNotificationRefresh();
  },

  getMetrics(records: AttendanceRecord[]): AttendanceMetrics {
    const totalRecords = records.length;
    const presentRecords = records.filter(
      (r) => String(r.status).toLowerCase() === 'present'
    ).length;
    const lateRecords = records.filter((r) => r.isLate).length;

    let totalOtMinutes = 0;
    records.forEach((r) => {
      if (r.overtimeMinutes) {
        totalOtMinutes += r.overtimeMinutes;
      } else if (r.overtimeHours && r.overtimeHours !== '-') {
        const match = r.overtimeHours.match(/(\d+)h\s*(\d+)m/);
        if (match) {
          totalOtMinutes += parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
        }
      }
    });

    const totalOvertimeHours = (totalOtMinutes / 60).toFixed(1);

    return {
      totalRecords,
      totalRecordsTrend: '↑ 12% vs last month',
      presentRecords,
      presentRecordsTrend: '↑ 8% vs last month',
      lateRecords,
      lateRecordsTrend: '↓ 18% vs last month',
      totalOvertimeHours,
      totalOvertimeHoursTrend: '↑ 25% vs last month',
    };
  },
};
