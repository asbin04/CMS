import {
  TimesheetRecord,
  RequirementRecord,
  ProjectOption,
  EmployeeOption,
  ClientOption,
  TaskOption,
} from '../types';

export const MASTER_PROJECTS: ProjectOption[] = [];
export const MASTER_EMPLOYEES: EmployeeOption[] = [];
export const MASTER_CLIENTS: ClientOption[] = [];
export const MASTER_TASKS: TaskOption[] = [];

export const getInitialRequirementRecords = (): RequirementRecord[] => [];
export const getInitialTimesheetRecords = (): TimesheetRecord[] => [];
