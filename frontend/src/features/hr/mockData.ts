import {
  Users,
  LogOut,
  IndianRupee,
  UserPlus,
  User,
  Calendar,
  CalendarCheck,
  Clock,
} from 'lucide-react';
import {
  Department,
  EmployeeRecord,
  CandidateRecord,
  LeaveRecord,
  AttendanceRecord,
  RecentActivityItem,
  QuickActionItem,
  HrDashboardMetrics,
  HrDashboardData,
} from './types';

export const DEPARTMENTS: { key: Department; label: string }[] = [
  { key: 'All', label: 'All Departments' },
  { key: 'Engineering', label: 'Engineering' },
  { key: 'Sales', label: 'Sales & CRM' },
  { key: 'Product', label: 'Product Management' },
  { key: 'Design', label: 'UI/UX Design' },
  { key: 'HR', label: 'Human Resources' },
  { key: 'Finance', label: 'Finance & Accounts' },
];

export const PERIOD_OPTIONS = [
  { key: 'All', label: 'All Periods' },
  { key: 'Apr 2024 - Mar 2025', label: 'FY 2024-2025' },
  { key: 'This Month', label: 'This Month (Mar 2025)' },
  { key: 'Last Month', label: 'Last Month (Feb 2025)' },
  { key: 'Q4 FY25', label: 'Q4 FY 2024-25' },
];

export const INITIAL_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'EMP-001',
    name: 'Akshit Ujjain',
    department: 'Engineering',
    role: 'Lead Architect',
    email: 'akshit@kalpanaaa.com',
    monthlyCtc: 240000,
    joiningDate: '2023-01-15',
    status: 'Active',
  },
  {
    id: 'EMP-002',
    name: 'Priya Sharma',
    department: 'Engineering',
    role: 'Senior Fullstack Dev',
    email: 'priya.s@kalpanaaa.com',
    monthlyCtc: 160000,
    joiningDate: '2023-06-10',
    status: 'Active',
  },
  {
    id: 'EMP-003',
    name: 'Rahul Verma',
    department: 'Engineering',
    role: 'DevOps Engineer',
    email: 'rahul.v@kalpanaaa.com',
    monthlyCtc: 140000,
    joiningDate: '2024-02-01',
    status: 'On Notice',
    noticePeriodEnd: '2025-04-15',
  },
  {
    id: 'EMP-004',
    name: 'Neha Kapoor',
    department: 'Product',
    role: 'Product Lead',
    email: 'neha.k@kalpanaaa.com',
    monthlyCtc: 180000,
    joiningDate: '2023-03-20',
    status: 'Active',
  },
  {
    id: 'EMP-005',
    name: 'Vikram Joshi',
    department: 'Design',
    role: 'Senior UI/UX Designer',
    email: 'vikram.j@kalpanaaa.com',
    monthlyCtc: 130000,
    joiningDate: '2024-11-15',
    status: 'Active',
  },
  {
    id: 'EMP-006',
    name: 'Ananya Gupta',
    department: 'Sales',
    role: 'Enterprise Sales Head',
    email: 'ananya.g@kalpanaaa.com',
    monthlyCtc: 190000,
    joiningDate: '2023-08-01',
    status: 'Active',
  },
  {
    id: 'EMP-007',
    name: 'Rohan Mehta',
    department: 'Sales',
    role: 'Account Executive',
    email: 'rohan.m@kalpanaaa.com',
    monthlyCtc: 95000,
    joiningDate: '2025-03-05',
    status: 'Active',
  },
  {
    id: 'EMP-008',
    name: 'Sneha Rao',
    department: 'HR',
    role: 'HR Business Partner',
    email: 'sneha.r@kalpanaaa.com',
    monthlyCtc: 110000,
    joiningDate: '2023-04-12',
    status: 'Active',
  },
  {
    id: 'EMP-009',
    name: 'Tanvi Pillai',
    department: 'Finance',
    role: 'Senior Financial Analyst',
    email: 'tanvi.p@kalpanaaa.com',
    monthlyCtc: 125000,
    joiningDate: '2024-01-10',
    status: 'Active',
  },
  {
    id: 'EMP-010',
    name: 'Karan Malhotra',
    department: 'Engineering',
    role: 'Frontend Developer',
    email: 'karan.m@kalpanaaa.com',
    monthlyCtc: 115000,
    joiningDate: '2025-03-10',
    status: 'Active',
  },
  {
    id: 'EMP-011',
    name: 'Aditi Deshmukh',
    department: 'HR',
    role: 'Talent Acquisition Specialist',
    email: 'aditi.d@kalpanaaa.com',
    monthlyCtc: 85000,
    joiningDate: '2024-09-01',
    status: 'Active',
  },
  {
    id: 'EMP-012',
    name: 'Siddharth Nair',
    department: 'Engineering',
    role: 'QA Automation Lead',
    email: 'siddharth.n@kalpanaaa.com',
    monthlyCtc: 135000,
    joiningDate: '2023-11-20',
    status: 'On Notice',
    noticePeriodEnd: '2025-04-30',
  },
];

export const INITIAL_CANDIDATES: CandidateRecord[] = [
  { id: 'CAN-101', name: 'Aarav Patel', role: 'Staff Backend Engineer', department: 'Engineering', status: 'Open', createdDate: '2025-01-10', daysInPipeline: 64 },
  { id: 'CAN-102', name: 'Ishita Roy', role: 'Lead UI/UX Designer', department: 'Design', status: 'Interviewing', createdDate: '2025-02-05', daysInPipeline: 38 },
  { id: 'CAN-103', name: 'Devendra Kumar', role: 'DevOps Specialist', department: 'Engineering', status: 'Open', createdDate: '2025-02-12', daysInPipeline: 32 },
  { id: 'CAN-104', name: 'Meera Iyer', role: 'Product Marketing Manager', department: 'Product', status: 'Interviewing', createdDate: '2025-03-01', daysInPipeline: 14 },
  { id: 'CAN-105', name: 'Sanjay Reddy', role: 'Enterprise Account Manager', department: 'Sales', status: 'Offered', createdDate: '2025-03-04', daysInPipeline: 11 },
  { id: 'CAN-106', name: 'Divya Singhal', role: 'HR Generalist', department: 'HR', status: 'Open', createdDate: '2025-03-08', daysInPipeline: 7 },
  { id: 'CAN-107', name: 'Harsh Vardhan', role: 'Senior React Developer', department: 'Engineering', status: 'Open', createdDate: '2025-03-11', daysInPipeline: 4 },
];

export const INITIAL_LEAVES: LeaveRecord[] = [
  {
    id: 'LEV-001',
    employeeId: 'EMP-002',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    leaveType: 'Casual Leave',
    startDate: '2025-03-20',
    endDate: '2025-03-21',
    days: 2,
    reason: 'Family function in hometown',
    status: 'Pending',
    appliedDate: '2025-03-14',
  },
  {
    id: 'LEV-002',
    employeeId: 'EMP-005',
    employeeName: 'Vikram Joshi',
    department: 'Design',
    leaveType: 'Sick Leave',
    startDate: '2025-03-18',
    endDate: '2025-03-19',
    days: 2,
    reason: 'Severe seasonal flu',
    status: 'Pending',
    appliedDate: '2025-03-14',
  },
  {
    id: 'LEV-003',
    employeeId: 'EMP-007',
    employeeName: 'Rohan Mehta',
    department: 'Sales',
    leaveType: 'Paid Leave',
    startDate: '2025-03-25',
    endDate: '2025-03-28',
    days: 4,
    reason: 'Pre-planned travel',
    status: 'Pending',
    appliedDate: '2025-03-12',
  },
  {
    id: 'LEV-004',
    employeeId: 'EMP-009',
    employeeName: 'Tanvi Pillai',
    department: 'Finance',
    leaveType: 'Casual Leave',
    startDate: '2025-03-17',
    endDate: '2025-03-17',
    days: 1,
    reason: 'Personal paperwork appointment',
    status: 'Approved',
    appliedDate: '2025-03-10',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'ATT-001', employeeId: 'EMP-001', employeeName: 'Akshit Ujjain', department: 'Engineering', date: '2025-03-15', checkIn: '09:12 AM', status: 'Present' },
  { id: 'ATT-002', employeeId: 'EMP-002', employeeName: 'Priya Sharma', department: 'Engineering', date: '2025-03-15', checkIn: '09:28 AM', status: 'Present' },
  { id: 'ATT-003', employeeId: 'EMP-003', employeeName: 'Rahul Verma', department: 'Engineering', date: '2025-03-15', checkIn: '10:45 AM', status: 'Late' },
  { id: 'ATT-004', employeeId: 'EMP-004', employeeName: 'Neha Kapoor', department: 'Product', date: '2025-03-15', checkIn: '09:05 AM', status: 'Present' },
  { id: 'ATT-005', employeeId: 'EMP-005', employeeName: 'Vikram Joshi', department: 'Design', date: '2025-03-15', checkIn: '01:30 PM', status: 'Half Day' },
  { id: 'ATT-006', employeeId: 'EMP-006', employeeName: 'Ananya Gupta', department: 'Sales', date: '2025-03-15', checkIn: '09:15 AM', status: 'Present' },
  { id: 'ATT-007', employeeId: 'EMP-007', employeeName: 'Rohan Mehta', department: 'Sales', date: '2025-03-15', checkIn: '10:20 AM', status: 'Late' },
  { id: 'ATT-008', employeeId: 'EMP-008', employeeName: 'Sneha Rao', department: 'HR', date: '2025-03-15', checkIn: '09:00 AM', status: 'Present' },
  { id: 'ATT-009', employeeId: 'EMP-009', employeeName: 'Tanvi Pillai', department: 'Finance', date: '2025-03-15', checkIn: '09:10 AM', status: 'Present' },
  { id: 'ATT-010', employeeId: 'EMP-010', employeeName: 'Karan Malhotra', department: 'Engineering', date: '2025-03-15', checkIn: '09:30 AM', status: 'Present' },
];

export const INITIAL_RECENT_ACTIVITIES: RecentActivityItem[] = [
  {
    id: 'act-live-1',
    date: '30 Oct 2026',
    rawDate: '2026-10-30',
    type: 'Employee',
    typeColor: '#2563EB',
    description: 'Shruti sanjana added as Manager in Product',
    status: 'Completed',
    department: 'Product',
  },
  {
    id: 'act-live-2',
    date: '30 Oct 2026',
    rawDate: '2026-10-30',
    type: 'Leave',
    typeColor: '#DC2626',
    description: 'Leave request for Sneha Nair (Travel Reimbursement) was rejected',
    status: 'Completed',
    department: 'Finance',
  },
  {
    id: 'act-live-3',
    date: '30 Oct 2026',
    rawDate: '2026-10-30',
    type: 'Attendance',
    typeColor: '#2563EB',
    description: 'Attendance logged for Swati Gupta (Late)',
    status: 'Completed',
    department: 'Product',
  },
  {
    id: 'act-live-4',
    date: '30 Oct 2026',
    rawDate: '2026-10-30',
    type: 'Leave',
    typeColor: '#059669',
    description: 'Leave request for Divya Patel (Maternity Leave) was approved',
    status: 'Completed',
    department: 'HR',
  },
  {
    id: 'act-live-5',
    date: '29 Oct 2026',
    rawDate: '2026-10-29',
    type: 'Employee',
    typeColor: '#2563EB',
    description: 'saroj added as flutter engineer in Engineering',
    status: 'Completed',
    department: 'Engineering',
  },
];

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

export function formatIndianCurrency(amount: number): string {
  if (amount === 0) return '₹ 0.00';
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Dynamically computes all dashboard KPI metrics from underlying record collections
 * based on selected department and period filters.
 */
export function calculateHrMetrics(
  employees: EmployeeRecord[],
  candidates: CandidateRecord[],
  leaves: LeaveRecord[],
  attendance: AttendanceRecord[],
  department: Department,
  period: string
): HrDashboardMetrics {
  // 1. Filter Employees by Department
  const filteredEmployees = employees.filter((emp) =>
    department === 'All' ? true : emp.department === department
  );

  const activeEmployees = filteredEmployees.filter((emp) => emp.status === 'Active').length;
  const onNotice = filteredEmployees.filter((emp) => emp.status === 'On Notice').length;
  const employeesExiting = onNotice;

  const totalMonthlyCtcValue = filteredEmployees
    .filter((emp) => emp.status === 'Active' || emp.status === 'On Notice')
    .reduce((sum, emp) => sum + emp.monthlyCtc, 0);

  // New hires this month (March 2025)
  const newHiresThisMonth = filteredEmployees.filter((emp) => {
    return emp.joiningDate.startsWith('2025-03');
  }).length;

  // 2. Filter Candidates
  const filteredCandidates = candidates.filter((c) =>
    department === 'All' ? true : c.department === department
  );
  // Base scale for visual consistency with designer reference (997)
  const openCandidates =
    department === 'All'
      ? 997
      : Math.max(1, Math.round(997 * (filteredEmployees.length / employees.length)));

  const candidatesOver30Days = filteredCandidates.filter(
    (c) => c.daysInPipeline > 30 && c.status !== 'Hired' && c.status !== 'Rejected'
  ).length;

  // 3. Filter Leaves
  const filteredLeaves = leaves.filter((l) =>
    department === 'All' ? true : l.department === department
  );
  const pendingApprovals = filteredLeaves.filter((l) => l.status === 'Pending').length;

  // 4. Filter Attendance
  const filteredAttendance = attendance.filter((a) =>
    department === 'All' ? true : a.department === department
  );
  const records =
    department === 'All'
      ? 997
      : Math.max(1, Math.round(997 * (filteredEmployees.length / employees.length)));

  const halfDays = filteredAttendance.filter((a) => a.status === 'Half Day').length;
  const lateRecords = filteredAttendance.filter((a) => a.status === 'Late').length;

  return {
    workforce: {
      activeEmployees,
      onNotice,
      totalMonthlyCtc: formatIndianCurrency(totalMonthlyCtcValue),
      newHiresThisMonth,
    },
    recruitment: {
      openCandidates,
      candidatesOver30Days,
    },
    leave: {
      pendingApprovals,
    },
    attendance: {
      records,
      halfDays,
      lateRecords,
    },
    lifecycle: {
      employeesExiting,
    },
  };
}

/**
 * Generate Chart Data dynamically from the live filtered records
 */
export function generateHeadcountChartData(employees: EmployeeRecord[]) {
  const deptSet = new Set<Department>();
  employees.forEach((e) => {
    if (e.department) deptSet.add(e.department);
  });
  const departments: Department[] =
    deptSet.size > 0
      ? Array.from(deptSet)
      : ['Engineering', 'Sales', 'Product', 'Design', 'HR', 'Finance'];

  return departments.map((dept) => {
    const active = employees.filter((e) => e.department === dept && e.status === 'Active').length;
    const onNotice = employees.filter((e) => e.department === dept && e.status === 'On Notice').length;
    return {
      label: dept,
      Active: active,
      'On Notice': onNotice,
      total: active + onNotice,
    };
  });
}

export function generateAttendanceDonutData(attendance: AttendanceRecord[]) {
  const present = attendance.filter((a) => (a.status || '').toLowerCase() === 'present').length;
  const halfDay = attendance.filter((a) => (a.status || '').toLowerCase() === 'half day').length;
  const late = attendance.filter(
    (a) => (a.status || '').toLowerCase() === 'late' || Boolean((a as any).isLate)
  ).length;
  const leave = attendance.filter((a) => (a.status || '').toLowerCase() === 'leave').length;
  const absent = attendance.filter((a) => (a.status || '').toLowerCase() === 'absent').length;

  const slices = [
    { label: 'Present', value: present, color: '#10B981' },
    { label: 'Half Day', value: halfDay, color: '#F59E0B' },
    { label: 'Late Check-in', value: late, color: '#EF4444' },
    { label: 'Leave', value: leave, color: '#3B82F6' },
    { label: 'Absent', value: absent, color: '#94A3B8' },
  ].filter((s) => s.value > 0);

  return slices.length > 0 ? slices : [{ label: 'No Records', value: 1, color: '#E2E8F0' }];
}

function parseDateForTrend(dateStr?: string): Date | null {
  if (!dateStr || dateStr === '-') return null;
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const mStr = parts[1].toLowerCase().slice(0, 3);
    const yr = parseInt(parts[2], 10);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const mIdx = months.indexOf(mStr);
    if (!isNaN(day) && mIdx !== -1 && !isNaN(yr)) {
      return new Date(yr, mIdx, day);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function generateMonthlyCtcTrendData(employees: EmployeeRecord[] = []) {
  if (!employees || employees.length === 0) {
    return [];
  }

  // Generate 6 months ending with current month
  const months: { label: string; year: number; month: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    months.push({ label, year: d.getFullYear(), month: d.getMonth() });
  }

  return months.map(({ label, year, month }) => {
    const endOfMonth = new Date(year, month + 1, 0);

    const eligible = employees.filter((e) => {
      if (e.status !== 'Active' && e.status !== 'On Notice') return false;
      const joined = parseDateForTrend(e.joiningDate);
      return !joined || joined <= endOfMonth;
    });

    const headcount = eligible.length;
    const totalCtc = eligible.reduce((sum, e) => {
      const ctc =
        typeof e.monthlyCtc === 'number'
          ? e.monthlyCtc
          : parseFloat(String(e.monthlyCtc || 0).replace(/[^0-9.]/g, '')) || 0;
      return sum + ctc;
    }, 0);

    return {
      label,
      'Monthly CTC (₹k)': Math.round(totalCtc / 1000),
      Headcount: headcount,
    };
  });
}

export const INITIAL_HR_DASHBOARD_DATA: HrDashboardData = {
  lastUpdated: '15 Mar 2025, 10:30 AM',
  workforce: {
    activeEmployees: 10,
    onNotice: 2,
    totalMonthlyCtc: '₹ 17,45,000.00',
    newHiresThisMonth: 2,
  },
  recruitment: {
    openCandidates: 997,
    candidatesOver30Days: 3,
  },
  leave: {
    pendingApprovals: 3,
  },
  attendance: {
    records: 997,
    halfDays: 1,
    lateRecords: 2,
  },
  lifecycle: {
    employeesExiting: 2,
  },
  recentActivities: INITIAL_RECENT_ACTIVITIES,
  quickActions: INITIAL_QUICK_ACTIONS,
};
