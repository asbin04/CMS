import { DevelopmentRecord, DevelopmentKpis } from './types';

export const INITIAL_DEVELOPMENT_KPIS: DevelopmentKpis = {
  totalDevelopments: 432,
  totalTrend: '↑ 16% vs last month',
  inDevelopment: 128,
  inDevTrend: '↑ 12% vs last month',
  inCodeReview: 76,
  inReviewTrend: '↑ 20% vs last month',
  qaHandover: 54,
  qaTrend: '↑ 18% vs last month',
  released: 148,
  releasedTrend: '↑ 14% vs last month',
};

export const INITIAL_KPIS = INITIAL_DEVELOPMENT_KPIS;

export const calculateDevelopmentKpis = (records: DevelopmentRecord[]): DevelopmentKpis => {
  let inDevCount = 0;
  let inReviewCount = 0;
  let qaCount = 0;
  let releasedCount = 0;

  for (const r of records) {
    if (r.status === 'Released') {
      releasedCount++;
    } else if (r.status === 'QA') {
      qaCount++;
    } else if (r.codeReviewStatus === 'In Review') {
      inReviewCount++;
    } else {
      inDevCount++;
    }
  }

  return {
    totalDevelopments: records.length,
    totalTrend: '↑ 16% vs last month',
    inDevelopment: inDevCount,
    inDevTrend: '↑ 12% vs last month',
    inCodeReview: inReviewCount,
    inReviewTrend: '↑ 20% vs last month',
    qaHandover: qaCount,
    qaTrend: '↑ 18% vs last month',
    released: releasedCount,
    releasedTrend: '↑ 14% vs last month',
  };
};

export const INITIAL_DEVELOPMENT_RECORDS: DevelopmentRecord[] = [
  {
    developmentId: 'DEV-2026-0432',
    projectId: 'PRJ-001',
    requirementId: 'REQ-2026-0184',
    taskId: 'TSK-00128',
    developer: 'Amit Sharma',
    repositoryUrl: 'https://github.com/kalpanaa/prj-001',
    branch: 'feature/login',
    environment: 'Dev',
    buildVersion: 'v1.2.0',
    codeReviewStatus: 'Approved',
    qaHandoffDate: '28 Oct 2026',
    releaseId: 'REL-014',
    status: 'Released',
    technicalNotes: 'Login API updated',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0432',
  },
  {
    developmentId: 'DEV-2026-0431',
    projectId: 'PRJ-001',
    requirementId: 'REQ-2026-0185',
    taskId: 'TSK-00127',
    developer: 'Sneha Nair',
    repositoryUrl: 'https://github.com/kalpanaa/prj-001',
    branch: 'feature/dashboard',
    environment: 'QA',
    buildVersion: 'v1.2.0',
    codeReviewStatus: 'In Review',
    qaHandoffDate: '27 Oct 2026',
    releaseId: '-',
    status: 'In Progress',
    technicalNotes: 'UI integration pending',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0431',
  },
  {
    developmentId: 'DEV-2026-0430',
    projectId: 'PRJ-002',
    requirementId: 'REQ-2026-0182',
    taskId: 'TSK-00126',
    developer: 'Divya Patel',
    repositoryUrl: 'https://github.com/kalpanaa/prj-002',
    branch: 'feature/booking',
    environment: 'Dev',
    buildVersion: 'v1.1.0',
    codeReviewStatus: 'Approved',
    qaHandoffDate: '26 Oct 2026',
    releaseId: 'REL-013',
    status: 'QA',
    technicalNotes: 'Booking flow completed',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0430',
  },
  {
    developmentId: 'DEV-2026-0429',
    projectId: 'PRJ-002',
    requirementId: 'REQ-2026-0181',
    taskId: 'TSK-00125',
    developer: 'Rohan Verma',
    repositoryUrl: 'https://github.com/kalpanaa/prj-002',
    branch: 'bugfix/patient-profile',
    environment: 'Staging',
    buildVersion: 'v1.1.1',
    codeReviewStatus: 'Changes Requested',
    qaHandoffDate: '25 Oct 2026',
    releaseId: '-',
    status: 'In Progress',
    technicalNotes: 'Fix profile data sync',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0429',
  },
  {
    developmentId: 'DEV-2026-0428',
    projectId: 'PRJ-003',
    requirementId: 'REQ-2026-0180',
    taskId: 'TSK-00124',
    developer: 'Vikram Shah',
    repositoryUrl: 'https://github.com/kalpanaa/prj-003',
    branch: 'feature/reports',
    environment: 'Dev',
    buildVersion: 'v1.0.3',
    codeReviewStatus: 'Approved',
    qaHandoffDate: '24 Oct 2026',
    releaseId: 'REL-012',
    status: 'Released',
    technicalNotes: 'Report export added',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0428',
  },
  {
    developmentId: 'DEV-2026-0427',
    projectId: 'PRJ-003',
    requirementId: 'REQ-2026-0179',
    taskId: 'TSK-00123',
    developer: 'Sneha Nair',
    repositoryUrl: 'https://github.com/kalpanaa/prj-003',
    branch: 'feature/analytics',
    environment: 'QA',
    buildVersion: 'v1.0.3',
    codeReviewStatus: 'In Review',
    qaHandoffDate: '24 Oct 2026',
    releaseId: '-',
    status: 'In Progress',
    technicalNotes: 'Analytics chart update',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0427',
  },
  {
    developmentId: 'DEV-2026-0426',
    projectId: 'PRJ-004',
    requirementId: 'REQ-2026-0178',
    taskId: 'TSK-00122',
    developer: 'Amit Sharma',
    repositoryUrl: 'https://github.com/kalpanaa/prj-004',
    branch: 'feature/notifications',
    environment: 'Dev',
    buildVersion: 'v1.0.2',
    codeReviewStatus: 'Approved',
    qaHandoffDate: '22 Oct 2026',
    releaseId: 'REL-011',
    status: 'QA',
    technicalNotes: 'Email & in-app alerts',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0426',
  },
  {
    developmentId: 'DEV-2026-0425',
    projectId: 'PRJ-004',
    requirementId: 'REQ-2026-0177',
    taskId: 'TSK-00121',
    developer: 'Divya Patel',
    repositoryUrl: 'https://github.com/kalpanaa/prj-004',
    branch: 'bugfix/notification',
    environment: 'Staging',
    buildVersion: 'v1.0.2',
    codeReviewStatus: 'Approved',
    qaHandoffDate: '21 Oct 2026',
    releaseId: '-',
    status: 'In Progress',
    technicalNotes: 'Notification delay fix',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0425',
  },
  {
    developmentId: 'DEV-2026-0424',
    projectId: 'PRJ-005',
    requirementId: 'REQ-2026-0176',
    taskId: 'TSK-00120',
    developer: 'Rohan Verma',
    repositoryUrl: 'https://github.com/kalpanaa/prj-005',
    branch: 'feature/invoice',
    environment: 'Dev',
    buildVersion: 'v1.0.1',
    codeReviewStatus: 'In Review',
    qaHandoffDate: '21 Oct 2026',
    releaseId: '-',
    status: 'In Progress',
    technicalNotes: 'Invoice generation logic',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0424',
  },
  {
    developmentId: 'DEV-2026-0423',
    projectId: 'PRJ-005',
    requirementId: 'REQ-2026-0175',
    taskId: 'TSK-00119',
    developer: 'Vikram Shah',
    repositoryUrl: 'https://github.com/kalpanaa/prj-005',
    branch: 'release/v1.0',
    environment: 'Prod',
    buildVersion: 'v1.0.0',
    codeReviewStatus: 'Approved',
    qaHandoffDate: '20 Oct 2026',
    releaseId: 'REL-010',
    status: 'Released',
    technicalNotes: 'Initial production release',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0423',
  },
  {
    developmentId: 'DEV-2026-0422',
    projectId: 'PRJ-001',
    requirementId: 'REQ-2026-0174',
    taskId: 'TSK-00118',
    developer: 'Pooja Mehta',
    repositoryUrl: 'https://github.com/kalpanaa/prj-001',
    branch: 'feature/auth-mfa',
    environment: 'Staging',
    buildVersion: 'v1.0.0',
    codeReviewStatus: 'Approved',
    qaHandoffDate: '19 Oct 2026',
    releaseId: 'REL-009',
    status: 'Released',
    technicalNotes: 'Two-factor auth flow implemented',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0422',
  },
  {
    developmentId: 'DEV-2026-0421',
    projectId: 'PRJ-002',
    requirementId: 'REQ-2026-0173',
    taskId: 'TSK-00117',
    developer: 'Karan Joshi',
    repositoryUrl: 'https://github.com/kalpanaa/prj-002',
    branch: 'bugfix/payment-gateway',
    environment: 'QA',
    buildVersion: 'v0.9.8',
    codeReviewStatus: 'Approved',
    qaHandoffDate: '18 Oct 2026',
    releaseId: '-',
    status: 'QA',
    technicalNotes: 'Payment callback webhook retry',
    documentationLink: 'https://docs.kalpanaa.com/dev/DEV-2026-0421',
  },
];

export const PROJECT_OPTIONS = [
  'All Projects',
  'PRJ-001',
  'PRJ-002',
  'PRJ-003',
  'PRJ-004',
  'PRJ-005',
];

export const ENVIRONMENT_OPTIONS = [
  'All Environment',
  'Dev',
  'QA',
  'Staging',
  'Prod',
];

export const STATUS_OPTIONS = [
  'All Status',
  'In Progress',
  'QA',
  'Released',
];

export const REVIEW_STATUS_OPTIONS = [
  'All Review Status',
  'Approved',
  'In Review',
  'Changes Requested',
];

export const MOCK_DEVELOPMENT_RECORDS = INITIAL_DEVELOPMENT_RECORDS;
