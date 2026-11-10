export type RequirementPriority = 'High' | 'Medium' | 'Low';
export type RequirementStatus = 'In Progress' | 'Pending Approval' | 'Completed' | 'Draft';
export type TimesheetApprovalStatus = 'Approved' | 'Pending' | 'Rejected';
export type BillableOption = 'Yes' | 'No';

export interface TimesheetRecord {
  timesheetId: string;
  date: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  taskId: string;
  hours: number;
  billable: BillableOption;
  billableRate: string;
  billableAmount: string;
  approvalStatus: TimesheetApprovalStatus;
  assignedApprover?: string;
  approvedBy: string;
  approvalDate?: string;
  approvedAt?: string;
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
  description?: string;
  priority: RequirementPriority;
  ownerId: string;
  status: RequirementStatus;
  scopeFreeze: BillableOption;
  assignedApprover?: string;
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

export interface TimesheetFilters {
  search: string;
  project: string;
  employee: string;
  approvalStatus: string;
  billable: string;
}

export interface RequirementFilters {
  search: string;
  project: string;
  type: string;
  priority: string;
  status: string;
}

export interface LogTimeFormData {
  employeeId: string;
  employeeName: string;
  projectId: string;
  taskId: string;
  date: string;
  hours: number;
  billable: BillableOption;
  billableRate: number;
  approvalStatus?: TimesheetApprovalStatus;
  assignedApprover?: string;
  approvedBy?: string;
  notes: string;
}

export interface AddRequirementFormData {
  projectId: string;
  clientId: string;
  requirementDate: string;
  type: string;
  requirementFeature: string;
  description: string;
  priority: RequirementPriority;
  ownerId: string;
  status: RequirementStatus;
  scopeFreeze: BillableOption;
  completionPercentage: number;
  assignedApprover?: string;
  approvedBy?: string;
  approvalDate?: string;
}

export interface ProjectOption {
  id: string;
  name: string;
  projectCode?: string;
  projectName?: string;
  description?: string;
  clientId?: string;
}

export interface TaskOption {
  id: string;
  name: string;
  taskCode?: string;
  taskName?: string;
  projectId?: string;
}

export interface EmployeeOption {
  id: string;
  name: string;
}

export interface ClientOption {
  id: string;
  name: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface TimesheetQueryParams {
  search?: string;
  employee?: string;
  project?: string;
  approvalStatus?: string;
  billable?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface RequirementQueryParams {
  search?: string;
  project?: string;
  type?: string;
  priority?: string;
  status?: string;
  scopeFreeze?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface CreateTimesheetPayload {
  projectId: string;
  taskId: string;
  employeeId?: string;
  timesheetDate?: string;
  date?: string;
  hoursWorked?: number;
  hoursSpent?: number;
  hours?: number;
  billable?: string;
  hourlyRate?: number;
  billableRate?: number;
  description?: string;
  taskDescription?: string;
  notes?: string;
  assignedApprover?: string;
  approvalStatus?: string;
  approvedBy?: string;
}

export interface UpdateTimesheetPayload {
  taskId?: string;
  timesheetDate?: string;
  date?: string;
  hoursWorked?: number;
  hoursSpent?: number;
  billable?: string;
  hourlyRate?: number;
  description?: string;
  notes?: string;
  assignedApprover?: string;
  approvalStatus?: string;
  approvedBy?: string;
}

export interface CreateRequirementPayload {
  projectId: string;
  clientId?: string;
  title?: string;
  featureName?: string;
  requirementFeature?: string;
  description?: string;
  requirementType?: string;
  type?: string;
  priority?: string;
  ownerId?: string;
  status?: string;
  scopeFreeze?: boolean;
  completionPercentage?: number;
  requirementDate?: string;
  assignedApprover?: string;
  approvedBy?: string;
  approvalDate?: string;
}

export interface UpdateRequirementPayload {
  title?: string;
  featureName?: string;
  requirementFeature?: string;
  description?: string;
  requirementType?: string;
  type?: string;
  priority?: string;
  ownerId?: string;
  status?: string;
  completionPercentage?: number;
  assignedApprover?: string;
  approvedBy?: string;
  approvalDate?: string;
}
