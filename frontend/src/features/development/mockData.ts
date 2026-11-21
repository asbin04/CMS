import { DevelopmentRecord, DevelopmentKpis } from './types';

export const INITIAL_DEVELOPMENT_KPIS: DevelopmentKpis = {
  totalDevelopments: 0,
  totalTrend: '0% vs last month',
  inDevelopment: 0,
  inDevTrend: '0% vs last month',
  inCodeReview: 0,
  inReviewTrend: '0% vs last month',
  qaHandover: 0,
  qaTrend: '0% vs last month',
  released: 0,
  releasedTrend: '0% vs last month',
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

export const INITIAL_DEVELOPMENT_RECORDS: DevelopmentRecord[] = [];

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
