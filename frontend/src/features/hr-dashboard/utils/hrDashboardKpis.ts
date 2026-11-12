import { HrKpiMetric } from '../types';
import { HrDashboardData, CandidateRecord, EmployeeExitRecord } from '@/features/hr/types';
import { EmployeeSummaryData, EmployeeData } from '@/types/employee';
import { AttendanceRecord } from '@/features/attendance/types/attendance';
import { LeaveRecord } from '@/features/leave/types/leave';

const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function parseAnyDate(dateStr?: string): Date | null {
  if (!dateStr || dateStr === '-') return null;
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const mStr = parts[1].toLowerCase().slice(0, 3);
    const yr = parseInt(parts[2], 10);
    const mIdx = MONTH_NAMES.indexOf(mStr);
    if (!isNaN(day) && mIdx !== -1 && !isNaN(yr)) {
      return new Date(yr, mIdx, day);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export interface DynamicKpiSourceData {
  dashboard?: HrDashboardData | null;
  summary?: EmployeeSummaryData | null;
  employees?: EmployeeData[];
  attendance?: AttendanceRecord[];
  leaves?: LeaveRecord[];
  candidates?: CandidateRecord[];
  exits?: EmployeeExitRecord[];
}

export function buildDynamicHrKpis(data: DynamicKpiSourceData): HrKpiMetric[] {
  const {
    dashboard,
    summary,
    employees = [],
    attendance = [],
    leaves = [],
    candidates = [],
    exits = [],
  } = data;

  // 1. Active Employees
  const activeCount =
    summary?.activeEmployees ??
    dashboard?.workforce?.activeEmployees ??
    employees.filter((e) => (e.status || '').toLowerCase() === 'active').length;

  // 2. On Notice
  const onNoticeCount =
    summary?.onNoticeEmployees ??
    dashboard?.workforce?.onNotice ??
    employees.filter((e) => (e.status || '').toLowerCase() === 'on notice').length;

  // 3. Total Monthly CTC
  let formattedCtc = summary?.totalMonthlyCtcFormatted || dashboard?.workforce?.totalMonthlyCtc;
  if (!formattedCtc) {
    const rawCtc =
      summary?.totalMonthlyCtc ??
      employees.reduce((sum, e) => {
        const s = (e.status || '').toLowerCase();
        if (s === 'active' || s === 'on notice') {
          const val =
            typeof e.monthlyCtc === 'number'
              ? e.monthlyCtc
              : parseFloat(String(e.monthlyCtc || 0).replace(/[^0-9.]/g, '')) || 0;
          return sum + val;
        }
        return sum;
      }, 0);
    formattedCtc = rawCtc > 0 ? '₹ ' + Math.round(rawCtc).toLocaleString('en-IN') : '₹ 0';
  }

  // 4. New Hires This Month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const newHiresFromDates = employees.filter((e) => {
    if (!e.joiningDate) return false;
    const d = parseAnyDate(e.joiningDate);
    return d && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;
  const newHiresCount =
    dashboard?.workforce?.newHiresThisMonth !== undefined
      ? dashboard.workforce.newHiresThisMonth
      : newHiresFromDates;

  // 5. Attendance Records
  const attendanceRecordsCount =
    attendance.length > 0 ? attendance.length : (dashboard?.attendance?.records ?? 0);

  // 6. Half Days
  const halfDaysCount =
    attendance.length > 0
      ? attendance.filter((r) => (r.status || '').toLowerCase() === 'half day').length
      : (dashboard?.attendance?.halfDays ?? 0);

  // 7. Late Records
  const lateRecordsCount =
    attendance.length > 0
      ? attendance.filter(
          (r) =>
            r.isLate ||
            (r.status || '').toLowerCase() === 'late' ||
            (r.lateFlag || '').toLowerCase() === 'yes'
        ).length
      : (dashboard?.attendance?.lateRecords ?? 0);

  // 8. Open Candidates
  const openCandidatesCount =
    candidates.length > 0
      ? candidates.filter((c) => (c.status || '').toLowerCase() === 'open').length
      : (dashboard?.recruitment?.openCandidates ?? 0);

  // 9. Open Candidates (Duplicate designer-approved card: active recruitment pipeline candidates)
  const activePipelineCandidates =
    candidates.length > 0
      ? candidates.filter((c) => !['hired', 'rejected'].includes((c.status || '').toLowerCase())).length
      : openCandidatesCount;

  // 10. Candidates Over 30 Days
  const candidatesOver30DaysCount =
    candidates.length > 0
      ? candidates.filter((c) => (c.daysInPipeline || 0) > 30).length
      : (dashboard?.recruitment?.candidatesOver30Days ?? 0);

  // 11. Pending Leave Approvals
  const pendingLeavesCount =
    leaves.length > 0
      ? leaves.filter((l) => (l.approvalStatus || l.leaveStatus || '').toLowerCase() === 'pending').length
      : (dashboard?.leave?.pendingApprovals ?? 0);

  // 12. Employees Exiting
  const exitRecordsActive = exits.filter(
    (x) => (x.exitStatus || '').toLowerCase() !== 'completed'
  ).length;
  const employeesExitingCount =
    exitRecordsActive > 0
      ? exitRecordsActive
      : (dashboard?.lifecycle?.employeesExiting ?? onNoticeCount);

  return [
    // Row 1
    {
      id: 'active-employees',
      label: 'Active Employees',
      value: activeCount.toLocaleString('en-IN'),
      iconName: 'users',
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
    },
    {
      id: 'on-notice',
      label: 'On Notice',
      value: onNoticeCount.toLocaleString('en-IN'),
      iconName: 'clock',
      iconBg: '#FFFBEB',
      iconColor: '#F59E0B',
    },
    {
      id: 'total-monthly-ctc',
      label: 'Total Monthly CTC',
      value: formattedCtc,
      iconName: 'credit-card',
      iconBg: '#EEF2FF',
      iconColor: '#6366F1',
    },
    {
      id: 'new-hires-this-month',
      label: 'New Hires This Month',
      value: newHiresCount.toLocaleString('en-IN'),
      iconName: 'user-plus',
      iconBg: '#EFF6FF',
      iconColor: '#3B82F6',
    },
    // Row 2
    {
      id: 'attendance-records',
      label: 'Attendance Records',
      value: attendanceRecordsCount.toLocaleString('en-IN'),
      iconName: 'trending-up',
      iconBg: '#F0F9FF',
      iconColor: '#0284C7',
    },
    {
      id: 'half-days',
      label: 'Half Days',
      value: halfDaysCount.toLocaleString('en-IN'),
      iconName: 'clock',
      iconBg: '#EEF2FF',
      iconColor: '#6366F1',
    },
    {
      id: 'late-records',
      label: 'Late Records',
      value: lateRecordsCount.toLocaleString('en-IN'),
      iconName: 'clock',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
    },
    {
      id: 'open-candidates-1',
      label: 'Open Candidates',
      value: openCandidatesCount.toLocaleString('en-IN'),
      iconName: 'search',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
    },
    // Row 3
    {
      id: 'open-candidates-2',
      label: 'Open Candidates',
      value: (activePipelineCandidates > 0 ? activePipelineCandidates : openCandidatesCount).toLocaleString('en-IN'),
      iconName: 'search',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
    },
    {
      id: 'candidates-over-30-days',
      label: 'Candidates Over 30 Days',
      value: candidatesOver30DaysCount.toLocaleString('en-IN'),
      iconName: 'alert-triangle',
      iconBg: '#FEF2F2',
      iconColor: '#EF4444',
    },
    {
      id: 'pending-leave-approvals',
      label: 'Pending Leave Approvals',
      value: pendingLeavesCount.toLocaleString('en-IN'),
      iconName: 'calendar',
      iconBg: '#FFFBEB',
      iconColor: '#F59E0B',
    },
    {
      id: 'employees-exiting',
      label: 'Employees Exiting',
      value: employeesExitingCount.toLocaleString('en-IN'),
      iconName: 'user-minus',
      iconBg: '#FEF2F2',
      iconColor: '#EF4444',
    },
  ];
}

