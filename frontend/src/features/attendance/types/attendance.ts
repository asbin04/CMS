export interface AttendanceRecord {
  id: string; // e.g. ATT-001248
  attendanceDate: string; // e.g. 31 Oct 2026
  employeeId: string; // e.g. EMP-101
  employeeName: string; // e.g. Amit Sharma
  avatarInitials: string; // e.g. AS
  avatarColor: string; // e.g. blue, purple, amber, pink, rose, orange, teal, emerald
  status: 'Present' | 'Leave' | 'Half Day' | 'Absent' | 'Holiday' | string;
  checkIn: string; // e.g. 09:05 AM or -
  checkOut: string; // e.g. 06:30 PM or -
  workHours: string; // e.g. 8h 25m or 0h 0m
  overtimeHours: string; // e.g. 1h 00m or 0h 0m
  workMinutes?: number;
  overtimeMinutes?: number;
  dayType?: 'Regular' | 'Working Day' | 'Leave' | 'Holiday' | string;
  isLate?: boolean;
  hasOvertime?: boolean;
  notes?: string;
  paidDayEquivalent?: string;
  lateFlag?: 'Yes' | 'No' | string;
  overtimeValue?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceMetrics {
  totalRecords: number;
  totalRecordsTrend: string;
  presentRecords: number;
  presentRecordsTrend: string;
  lateRecords: number;
  lateRecordsTrend: string;
  totalOvertimeHours: string;
  totalOvertimeHoursTrend: string;
}

export interface AttendanceFilterState {
  searchQuery: string;
  dateRange: string;
  employee: string;
  status: string;
  dayType: string;
  lateOnly: string;
  overtimeOnly: string;
}

export type AttendanceSortOption =
  | 'date-desc'
  | 'date-asc'
  | 'employee-asc'
  | 'employee-desc'
  | 'id-desc'
  | 'id-asc'
  | 'overtime-desc'
  | 'workhours-desc';
