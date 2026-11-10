import { TimesheetRecord, RequirementRecord, TimesheetKpis, RequirementKpis } from '../types';
import { formatRupee, formatHours, parseRupee } from './formatters';

export const calculateBillableAmount = (hours: number, rate: number, isBillable: boolean): number => {
  if (!isBillable || hours <= 0 || rate <= 0) {
    return 0;
  }
  return Math.round(hours * rate * 100) / 100;
};

export const calculateTimesheetKpis = (records: TimesheetRecord[]): TimesheetKpis => {
  let totalHoursNum = 0;
  let billableHoursNum = 0;
  let billableAmountNum = 0;
  let pendingApprovalsCount = 0;

  for (const r of records) {
    totalHoursNum += r.hours;
    if (r.billable === 'Yes') {
      billableHoursNum += r.hours;
      billableAmountNum += parseRupee(r.billableAmount);
    }
    const status = (r.approvalStatus || '').trim().toLowerCase();
    if (status === 'pending' || status === 'pending approval') {
      pendingApprovalsCount += 1;
    }
  }

  return {
    totalHours: formatHours(totalHoursNum),
    totalHoursTrend: '↑ 12% vs last month',
    billableHours: formatHours(billableHoursNum),
    billableHoursTrend: '↑ 15% vs last month',
    billableAmount: formatRupee(billableAmountNum),
    billableAmountTrend: '↑ 18% vs last month',
    pendingApprovals: pendingApprovalsCount,
    pendingApprovalsTrend: '↓ 33% vs last month',
  };
};

export const calculateRequirementKpis = (records: RequirementRecord[]): RequirementKpis => {
  let inProgressCount = 0;
  let completedCount = 0;
  let pendingApprovalCount = 0;
  let scopeFrozenCount = 0;

  for (const r of records) {
    if (r.status === 'In Progress') inProgressCount++;
    else if (r.status === 'Completed') completedCount++;
    else if (r.status === 'Pending Approval') pendingApprovalCount++;

    if (r.scopeFreeze === 'Yes') scopeFrozenCount++;
  }

  return {
    totalRequirements: records.length,
    totalRequirementsTrend: '↑ 14% vs last month',
    inProgress: inProgressCount,
    completed: completedCount,
    pendingApproval: pendingApprovalCount,
    scopeFrozen: scopeFrozenCount,
  };
};

