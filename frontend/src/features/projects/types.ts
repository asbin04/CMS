export type RequirementPriority = 'High' | 'Medium' | 'Low';
export type RequirementStatus = 'In Progress' | 'Pending Approval' | 'Completed';
export type TimesheetApprovalStatus = 'Approved' | 'Pending' | 'Rejected';

export interface TimesheetRecord {
  timesheetId: string;
  date: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  taskId: string;
  hours: number;
  billable: 'Yes' | 'No';
  billableRate: string;
  billableAmount: string;
  approvalStatus: TimesheetApprovalStatus;
  approvedBy: string;
  estimatedLaborCost: string;
  notes: string;
}

export interface RequirementRecord {
  requirementId: string;
  projectId: string;
  clientId: string;
  requirementDate: string;
  type: string;
  requirementFeature: string;
  priority: RequirementPriority;
  ownerId: string;
  status: RequirementStatus;
  scopeFreeze: 'Yes' | 'No';
  approvedBy: string;
  approvalDate: string;
  completionPercentage: number;
}

export interface TimesheetKpis {
  totalHours: string;
  totalHoursTrend: string;
  billableHours: string;
  billableHoursTrend: string;
  billableAmount: string;
  billableAmountTrend: string;
  pendingApprovals: number;
  pendingApprovalsTrend: string;
}

export interface RequirementKpis {
  totalRequirements: number;
  totalRequirementsTrend: string;
  inProgress: number;
  completed: number;
  pendingApproval: number;
  scopeFrozen: number;
}
