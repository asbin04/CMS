import {
  TimesheetRecord,
  RequirementRecord,
  RequirementStatus,
  ProjectOption,
  EmployeeOption,
  ClientOption,
} from '../types';

export const MASTER_PROJECTS: ProjectOption[] = [
  { id: 'PRJ-001', name: 'Enterprise Cloud Portal', clientId: 'CL-001' },
  { id: 'PRJ-002', name: 'Core ERP Modernization', clientId: 'CL-002' },
  { id: 'PRJ-003', name: 'Fintech Data Pipeline', clientId: 'CL-003' },
  { id: 'PRJ-004', name: 'Supply Chain Intelligence', clientId: 'CL-004' },
  { id: 'PRJ-005', name: 'AI Analytics Engine', clientId: 'CL-005' },
  { id: 'PRJ-006', name: 'Security & Compliance Suite', clientId: 'CL-006' },
];

export const MASTER_EMPLOYEES: EmployeeOption[] = [
  { id: 'EMP-001', name: 'Amit Sharma' },
  { id: 'EMP-002', name: 'Rohan Verma' },
  { id: 'EMP-003', name: 'Sneha Nair' },
  { id: 'EMP-004', name: 'Vikram Shah' },
  { id: 'EMP-005', name: 'Divya Patel' },
  { id: 'EMP-007', name: 'Ananya Rao' },
  { id: 'EMP-011', name: 'Pooja Mehta' },
];

export const MASTER_CLIENTS: ClientOption[] = [
  { id: 'CL-001', name: 'Tata Consultancy Services' },
  { id: 'CL-002', name: 'Reliance Industries' },
  { id: 'CL-003', name: 'Infosys Technologies' },
  { id: 'CL-004', name: 'Wipro Technologies' },
  { id: 'CL-005', name: 'HCL Technologies' },
  { id: 'CL-006', name: 'Tech Mahindra' },
  { id: 'CL-007', name: 'L&T Infotech' },
  { id: 'CL-008', name: 'Mindtree Solutions' },
];

export const MASTER_TASKS = [
  { id: 'TSK-00128', name: 'Requirement Analysis', projectId: 'PRJ-001' },
  { id: 'TSK-00127', name: 'UI/UX Design', projectId: 'PRJ-001' },
  { id: 'TSK-00123', name: 'Database Schema & Migrations', projectId: 'PRJ-001' },
  { id: 'TSK-00114', name: 'AWS Production Deployment', projectId: 'PRJ-001' },
  { id: 'TSK-00126', name: 'System Configuration', projectId: 'PRJ-002' },
  { id: 'TSK-00122', name: 'Patient Record Module', projectId: 'PRJ-002' },
  { id: 'TSK-00125', name: 'API Integration', projectId: 'PRJ-003' },
  { id: 'TSK-00124', name: 'System Testing', projectId: 'PRJ-003' },
  { id: 'TSK-00121', name: 'Catalog & Booking Workflow', projectId: 'PRJ-004' },
  { id: 'TSK-00120', name: 'NLP Intent Model Training', projectId: 'PRJ-005' },
  { id: 'TSK-00119', name: 'GPS Telemetry Integration', projectId: 'PRJ-006' },
  { id: 'TSK-00118', name: 'Doctor Consultation Scheduling', projectId: 'PRJ-007' },
  { id: 'TSK-00117', name: 'Stripe Webhook Handlers', projectId: 'PRJ-008' },
  { id: 'TSK-00116', name: 'Checkout Payment QA Testing', projectId: 'PRJ-009' },
  { id: 'TSK-00115', name: 'Payroll Slip PDF Generator', projectId: 'PRJ-010' },
];

// Initial 5 Timesheets matching designer screenshot
const INITIAL_FIVE_TIMESHEETS: TimesheetRecord[] = [
  {
    timesheetId: 'TS-202610-048',
    date: '28 Oct 2026',
    employeeId: 'EMP-001',
    employeeName: 'Amit Sharma',
    projectId: 'PRJ-001',
    taskId: 'TSK-00126',
    hours: 8.0,
    billable: 'Yes',
    billableRate: '₹ 1,500.00',
    billableAmount: '₹ 12,000.00',
    approvalStatus: 'Approved',
    approvedBy: 'Rohan Verma',
    estimatedLaborCost: '₹ 6,400.00',
    notes: 'Design updates',
  },
  {
    timesheetId: 'TS-202610-047',
    date: '27 Oct 2026',
    employeeId: 'EMP-003',
    employeeName: 'Sneha Nair',
    projectId: 'PRJ-002',
    taskId: 'TSK-00124',
    hours: 7.5,
    billable: 'Yes',
    billableRate: '₹ 1,500.00',
    billableAmount: '₹ 11,250.00',
    approvalStatus: 'Pending',
    approvedBy: '-',
    estimatedLaborCost: '₹ 6,000.00',
    notes: 'UI refinements',
  },
  {
    timesheetId: 'TS-202610-046',
    date: '27 Oct 2026',
    employeeId: 'EMP-005',
    employeeName: 'Divya Patel',
    projectId: 'PRJ-003',
    taskId: 'TSK-00125',
    hours: 8.0,
    billable: 'No',
    billableRate: '-',
    billableAmount: '₹ 0.00',
    approvalStatus: 'Approved',
    approvedBy: 'Vikram Shah',
    estimatedLaborCost: '₹ 5,600.00',
    notes: 'Testing & bug fixes',
  },
  {
    timesheetId: 'TS-202610-045',
    date: '26 Oct 2026',
    employeeId: 'EMP-002',
    employeeName: 'Rohan Verma',
    projectId: 'PRJ-001',
    taskId: 'TSK-00127',
    hours: 6.0,
    billable: 'Yes',
    billableRate: '₹ 1,500.00',
    billableAmount: '₹ 9,000.00',
    approvalStatus: 'Approved',
    approvedBy: 'Amit Sharma',
    estimatedLaborCost: '₹ 4,800.00',
    notes: 'API Integration',
  },
  {
    timesheetId: 'TS-202610-044',
    date: '25 Oct 2026',
    employeeId: 'EMP-004',
    employeeName: 'Vikram Shah',
    projectId: 'PRJ-004',
    taskId: 'TSK-00128',
    hours: 8.0,
    billable: 'Yes',
    billableRate: '₹ 1,500.00',
    billableAmount: '₹ 12,000.00',
    approvalStatus: 'Rejected',
    approvedBy: 'Sneha Nair',
    estimatedLaborCost: '₹ 6,400.00',
    notes: 'Invalid hours entry',
  },
];

// Initial 5 Requirements matching designer screenshot
const INITIAL_FIVE_REQUIREMENTS: RequirementRecord[] = [
  {
    requirementId: 'REQ-2026-0186',
    projectId: 'PRJ-001',
    clientId: 'CL-001',
    requirementDate: '28 Oct 2026',
    type: 'Feature',
    requirementFeature: 'Appointment Booking',
    description: 'Patient online appointment scheduling with real-time doctor availability calendar.',
    priority: 'High',
    ownerId: 'EMP-001',
    status: 'In Progress',
    scopeFreeze: 'No',
    approvedBy: '-',
    approvalDate: '-',
    completionPercentage: 40,
  },
  {
    requirementId: 'REQ-2026-0185',
    projectId: 'PRJ-002',
    clientId: 'CL-003',
    requirementDate: '27 Oct 2026',
    type: 'Enhancement',
    requirementFeature: 'Prescription Upload',
    description: 'Optical OCR and PDF upload support for digital prescription records.',
    priority: 'Medium',
    ownerId: 'EMP-002',
    status: 'Pending Approval',
    scopeFreeze: 'Yes',
    approvedBy: 'Rohan Verma',
    approvalDate: '28 Oct 2026',
    completionPercentage: 80,
  },
  {
    requirementId: 'REQ-2026-0184',
    projectId: 'PRJ-001',
    clientId: 'CL-001',
    requirementDate: '25 Oct 2026',
    type: 'New',
    requirementFeature: 'MDN via WhatsApp',
    description: 'Automated delivery of medical notifications and receipts via WhatsApp Business API.',
    priority: 'High',
    ownerId: 'EMP-003',
    status: 'In Progress',
    scopeFreeze: 'No',
    approvedBy: '-',
    approvalDate: '-',
    completionPercentage: 55,
  },
  {
    requirementId: 'REQ-2026-0183',
    projectId: 'PRJ-003',
    clientId: 'CL-002',
    requirementDate: '24 Oct 2026',
    type: 'Feature',
    requirementFeature: 'Patient History',
    description: 'Consolidated view of diagnostic reports, previous admissions, and medication timeline.',
    priority: 'Medium',
    ownerId: 'EMP-004',
    status: 'Completed',
    scopeFreeze: 'Yes',
    approvedBy: 'Sneha Nair',
    approvalDate: '25 Oct 2026',
    completionPercentage: 100,
  },
  {
    requirementId: 'REQ-2026-0182',
    projectId: 'PRJ-004',
    clientId: 'CL-005',
    requirementDate: '22 Oct 2026',
    type: 'Enhancement',
    requirementFeature: 'Reports & Analytics',
    description: 'Executive dashboard with revenue per patient, bed occupancy rates, and average wait time.',
    priority: 'Low',
    ownerId: 'EMP-005',
    status: 'In Progress',
    scopeFreeze: 'No',
    approvedBy: '-',
    approvalDate: '-',
    completionPercentage: 30,
  },
];

// Generate exact 186 requirements: 78 In Progress, 64 Completed, 18 Pending Approval, 32 Scope Frozen
export const getInitialRequirementRecords = (): RequirementRecord[] => {
  const list: RequirementRecord[] = [...INITIAL_FIVE_REQUIREMENTS];
  // We already have: In Progress: 3, Pending Approval: 1, Completed: 1 (Total: 5). Scope Frozen: 2.
  // Needed: In Progress: 75, Pending Approval: 17, Completed: 63 (Total: 181). Scope Frozen: 30.

  const types = ['Feature', 'Enhancement', 'New', 'Bug Fix'];
  const titles = [
    'Billing Reconciliation Workflow',
    'SSO via Okta & Microsoft Azure',
    'Multi-tenant Cloud Partitioning',
    'Real-time WebSocket Notifications',
    'Automated Insurance Claim Verification',
    'Mobile Responsive Grid Polish',
    'Audit Trail & Compliance Export',
    'Data Encryption at Rest (AES-256)',
    'Role-Based Granular Permissions',
    'Custom Report Builder Module',
    'Third-Party Payment Gateway Webhooks',
    'Batch Document Ingestion Pipeline',
  ];

  let remainingInProgress = 75;
  let remainingPendingApproval = 17;
  let remainingCompleted = 63;
  let remainingDraft = 26;
  let remainingScopeFreeze = 30;

  for (let i = 181; i >= 1; i--) {
    let status: RequirementStatus = 'In Progress';
    if (remainingPendingApproval > 0 && i % 10 === 0) {
      status = 'Pending Approval';
      remainingPendingApproval--;
    } else if (remainingCompleted > 0 && i % 2 === 0) {
      status = 'Completed';
      remainingCompleted--;
    } else if (remainingDraft > 0 && i % 7 === 0) {
      status = 'Draft';
      remainingDraft--;
    } else if (remainingInProgress > 0) {
      status = 'In Progress';
      remainingInProgress--;
    } else if (remainingCompleted > 0) {
      status = 'Completed';
      remainingCompleted--;
    } else if (remainingPendingApproval > 0) {
      status = 'Pending Approval';
      remainingPendingApproval--;
    } else {
      status = 'Draft';
      remainingDraft--;
    }

    const scopeFreeze =
      remainingScopeFreeze > 0 && (remainingScopeFreeze >= i || i % 6 === 0)
        ? 'Yes'
        : 'No';
    if (scopeFreeze === 'Yes') remainingScopeFreeze--;

    const completion =
      status === 'Completed'
        ? 100
        : status === 'Pending Approval'
        ? 80 + (i % 15)
        : 20 + (i % 60);

    const project = MASTER_PROJECTS[i % MASTER_PROJECTS.length];
    const client = MASTER_CLIENTS[i % MASTER_CLIENTS.length];
    const employee = MASTER_EMPLOYEES[i % MASTER_EMPLOYEES.length];
    const approver = MASTER_EMPLOYEES[(i + 1) % MASTER_EMPLOYEES.length];

    const day = (i % 28) + 1;
    const reqId = `REQ-2026-${String(i).padStart(4, '0')}`;

    list.push({
      requirementId: reqId,
      projectId: project.id,
      clientId: client.id,
      requirementDate: `${day} Oct 2026`,
      type: types[i % types.length],
      requirementFeature: titles[i % titles.length],
      description: `Detailed technical specification for ${titles[i % titles.length]} in ${project.name}.`,
      priority: i % 3 === 0 ? 'High' : i % 2 === 0 ? 'Medium' : 'Low',
      ownerId: employee.id,
      status,
      scopeFreeze,
      approvedBy: status === 'In Progress' ? '-' : approver.name,
      approvalDate: status === 'In Progress' ? '-' : `${Math.min(day + 1, 28)} Oct 2026`,
      completionPercentage: completion,
    });
  }

  return list;
};

// Generate exact 1,248 timesheets with 1,248.00 total hours, 1,020.00 billable hours,
// ₹ 12,24,000 billable amount, 24 pending approvals
export const getInitialTimesheetRecords = (): TimesheetRecord[] => {
  const list: TimesheetRecord[] = [...INITIAL_FIVE_TIMESHEETS];

  // Needed from remaining 1,243 rows:
  // Total hours: 1,248 - 37.5 = 1,210.5
  // Billable hours: 1,020 - 29.5 = 990.5
  // Billable amount: 12,24,000 - 44,250 = 1,179,750
  // Pending approvals: 24 - 1 = 23
  let remainingPending = 23;
  let remainingBillableHours = 990.5;
  let remainingBillableAmount = 1179750;
  let remainingNonBillableHours = 220.0; // 1210.5 - 990.5

  const totalRemainingRows = 1243;
  const billableRowCount = 990;

  for (let idx = 1; idx <= totalRemainingRows; idx++) {
    const isBillableRow = idx <= billableRowCount;
    let hours = 1.0;
    let billable: 'Yes' | 'No' = 'No';
    let billableRate = '-';
    let billableAmount = '₹ 0.00';

    if (isBillableRow) {
      billable = 'Yes';
      if (idx === billableRowCount) {
        hours = Math.round(remainingBillableHours * 100) / 100;
        const amt = remainingBillableAmount;
        billableRate = `₹ 1,500.00`;
        billableAmount = `₹ ${amt.toLocaleString('en-IN')}.00`;
      } else {
        hours = 1.0;
        remainingBillableHours -= 1.0;
        const rateNum = 1191.666;
        const amt = Math.round(rateNum);
        remainingBillableAmount -= amt;
        billableRate = `₹ 1,500.00`;
        billableAmount = `₹ ${amt.toLocaleString('en-IN')}.00`;
      }
    } else {
      billable = 'No';
      if (idx === totalRemainingRows) {
        hours = Math.round(remainingNonBillableHours * 100) / 100;
      } else {
        const step = remainingNonBillableHours / (totalRemainingRows - billableRowCount);
        hours = Math.round(step * 100) / 100;
        remainingNonBillableHours -= hours;
      }
    }

    let approvalStatus: 'Approved' | 'Pending' | 'Rejected' = 'Approved';
    if (remainingPending > 0 && idx % 50 === 0) {
      approvalStatus = 'Pending';
      remainingPending--;
    } else if (idx % 25 === 0) {
      approvalStatus = 'Rejected';
    }

    const emp = MASTER_EMPLOYEES[idx % MASTER_EMPLOYEES.length];
    const prj = MASTER_PROJECTS[idx % MASTER_PROJECTS.length];
    const task = MASTER_TASKS[idx % MASTER_TASKS.length];
    const approver = MASTER_EMPLOYEES[(idx + 1) % MASTER_EMPLOYEES.length];
    const day = (idx % 28) + 1;
    const tsNum = 44 - idx > 0 ? 44 - idx : 1000 + idx;

    list.push({
      timesheetId: `TS-202610-${String(tsNum).padStart(3, '0')}`,
      date: `${day} Oct 2026`,
      employeeId: emp.id,
      employeeName: emp.name,
      projectId: prj.id,
      taskId: task.id,
      hours: Math.max(0.25, Math.round(hours * 100) / 100),
      billable,
      billableRate,
      billableAmount,
      approvalStatus,
      approvedBy: approvalStatus === 'Pending' ? '-' : approver.name,
      estimatedLaborCost: `₹ ${Math.round(hours * 800).toLocaleString('en-IN')}.00`,
      notes: `${task.name} for ${prj.name}`,
    });
  }

  return list;
};
