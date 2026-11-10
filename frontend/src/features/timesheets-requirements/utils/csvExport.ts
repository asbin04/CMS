import { TimesheetRecord, RequirementRecord } from '../types';

export const exportTimesheetsToCsv = (
  records: TimesheetRecord[],
  filename = `timesheets_export_${new Date().toISOString().split('T')[0]}.csv`
): void => {
  const headers = [
    'Timesheet ID',
    'Date',
    'Employee ID',
    'Employee Name',
    'Project ID',
    'Task ID',
    'Hours',
    'Billable',
    'Billable Rate',
    'Billable Amount',
    'Approval Status',
    'Approved By',
    'Estimated Labor Cost',
    'Notes',
  ];

  const rows = records.map((r) => [
    `"${r.timesheetId}"`,
    `"${r.date}"`,
    `"${r.employeeId}"`,
    `"${r.employeeName.replace(/"/g, '""')}"`,
    `"${r.projectId}"`,
    `"${r.taskId}"`,
    `"${r.hours.toFixed(2)}"`,
    `"${r.billable}"`,
    `"${r.billableRate}"`,
    `"${r.billableAmount}"`,
    `"${r.approvalStatus}"`,
    `"${r.approvedBy}"`,
    `"${r.estimatedLaborCost}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportRequirementsToCsv = (
  records: RequirementRecord[],
  filename = `requirements_export_${new Date().toISOString().split('T')[0]}.csv`
): void => {
  const headers = [
    'Requirement ID',
    'Project ID',
    'Client ID',
    'Requirement Date',
    'Type',
    'Requirement / Feature',
    'Description',
    'Priority',
    'Owner ID',
    'Status',
    'Scope Freeze',
    'Approved By',
    'Approval Date',
    'Completion %',
  ];

  const rows = records.map((r) => [
    `"${r.requirementId}"`,
    `"${r.projectId}"`,
    `"${r.clientId}"`,
    `"${r.requirementDate}"`,
    `"${r.type}"`,
    `"${r.requirementFeature.replace(/"/g, '""')}"`,
    `"${(r.description || '').replace(/"/g, '""')}"`,
    `"${r.priority}"`,
    `"${r.ownerId}"`,
    `"${r.status}"`,
    `"${r.scopeFreeze}"`,
    `"${r.approvedBy}"`,
    `"${r.approvalDate}"`,
    `"${r.completionPercentage}%"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

