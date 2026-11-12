export type HrTabType = 'employees' | 'attendance' | 'leave' | 'exits';

export type EmploymentType = 'Full Time' | 'Contract' | 'Intern' | 'Part Time';

export type EmployeeStatus = 'Active' | 'On Notice' | 'Inactive' | 'Exited';

export interface Employee {
  id: string; // e.g. "EMP-0024"
  name: string; // e.g. "Ananya Rao"
  department: string; // e.g. "UI/UX"
  designation: string; // e.g. "UI/UX Designer"
  employmentType: EmploymentType;
  joiningDate: string; // e.g. "02 Mar 2026"
  status: EmployeeStatus;
  monthlyCtc: string; // e.g. "₹65,000"
  email?: string;
  phone?: string;
  location?: string;
  reportingManager?: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave';

export interface AttendanceRecord {
  id: string; // e.g. "ATT-1001"
  employeeId: string; // e.g. "EMP-0024"
  employeeName: string;
  department: string;
  date: string; // e.g. "2026-11-12"
  checkIn: string; // e.g. "09:15 AM"
  checkOut: string; // e.g. "06:30 PM"
  workingHours: string; // e.g. "9h 15m"
  status: AttendanceStatus;
  notes?: string;
}

export type LeaveType = 'Sick Leave' | 'Casual Leave' | 'Earned Leave' | 'Maternity / Paternity';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRecord {
  id: string; // e.g. "LV-2041"
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  appliedDate: string;
  status: LeaveStatus;
  reason: string;
}

export type ExitType = 'Resignation' | 'Termination' | 'Retirement' | 'Contract End';
export type ExitStatus = 'In Progress' | 'Notice Period' | 'Completed' | 'Pending Clearance';

export interface ExitRecord {
  id: string; // e.g. "EXT-052"
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  exitType: ExitType;
  resignationDate: string;
  lastWorkingDay: string;
  reason: string;
  status: ExitStatus;
  handoverStatus?: string;
  clearanceStatus?: string;
}

export interface HrKpiMetric {
  id: string;
  label: string;
  value: string | number;
  iconName: 'users' | 'clock' | 'credit-card' | 'user-plus' | 'trending-up' | 'search' | 'alert-triangle' | 'calendar' | 'user-minus';
  iconBg: string;
  iconColor: string;
}

export interface HrDashboardFilterState {
  search: string;
  status: string;
  department: string;
  employmentType: string;
}

export interface AttendanceFilterState {
  search: string;
  date: string;
  department: string;
  status: string;
}

export interface LeaveFilterState {
  search: string;
  leaveType: string;
  status: string;
  date: string;
}

export interface ExitFilterState {
  search: string;
  department: string;
  exitType: string;
  status: string;
  date: string;
}
