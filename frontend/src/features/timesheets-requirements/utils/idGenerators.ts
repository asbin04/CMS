import { TimesheetRecord, RequirementRecord } from '../types';

export const generateNextTimesheetId = (records: TimesheetRecord[]): string => {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `TS-${currentYear}${currentMonth}-`;

  let maxNum = 0;
  for (const r of records) {
    if (r.timesheetId && r.timesheetId.startsWith(prefix)) {
      const numPart = parseInt(r.timesheetId.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    } else if (r.timesheetId && r.timesheetId.startsWith('TS-')) {
      const parts = r.timesheetId.split('-');
      if (parts.length >= 3) {
        const numPart = parseInt(parts[2], 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    }
  }

  const nextNum = (maxNum || 48) + 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
};

export const generateNextRequirementId = (records: RequirementRecord[]): string => {
  const currentYear = new Date().getFullYear();
  const prefix = `REQ-${currentYear}-`;

  let maxNum = 0;
  for (const r of records) {
    if (r.requirementId && r.requirementId.startsWith(prefix)) {
      const numPart = parseInt(r.requirementId.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    } else if (r.requirementId && r.requirementId.startsWith('REQ-')) {
      const parts = r.requirementId.split('-');
      if (parts.length >= 3) {
        const numPart = parseInt(parts[2], 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    }
  }

  const nextNum = (maxNum || 186) + 1;
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
};

