export type UatStatus = 'Passed' | 'Failed' | 'In Testing';
export type UatClientApproval = 'Approved' | 'Pending';

export interface UatItem {
  id: string; // e.g. UAT-2026-0483
  projectId: string; // e.g. PRJ-001
  requirementId: string; // e.g. REQ-2026-0184
  testDate: string; // e.g. 28 Oct 2026
  testCase: string; // e.g. TC-001
  expectedResult: string; // e.g. User can login with valid credentials
  actualResult: string; // e.g. Login successful
  testerName: string; // e.g. Amit Sharma
  testerInitials: string; // e.g. AS
  testerColor?: string; // e.g. #4338CA
  status: UatStatus | string; // e.g. Passed, Failed, In Testing
  defectId?: string; // e.g. - or DEF-0147
  clientApproval: UatClientApproval | string; // e.g. Approved, Pending
  approvalDate?: string; // e.g. 28 Oct 2026 or -
  comments?: string; // e.g. Working as expected or -
}

export interface UatKpis {
  totalUats: number;
  totalTrend?: string;
  totalUatsTrend?: string;
  inTesting: number;
  inTestingTrend: string;
  passed: number;
  passedTrend: string;
  defectsLogged: number;
  defectsLoggedTrend: string;
  clientApproved: number;
  clientApprovedTrend: string;
}

export interface UatFilterOptions {
  projects: string[];
  statuses: string[];
  clientApprovals: string[];
  testers: string[];
}

export interface CreateUatPayload {
  id?: string;
  projectId: string;
  requirementId: string;
  testDate: string;
  testCase: string;
  expectedResult: string;
  actualResult: string;
  testerName: string;
  testerInitials?: string;
  testerColor?: string;
  status: string;
  defectId?: string;
  clientApproval: string;
  approvalDate?: string;
  comments?: string;
}

export interface UpdateUatPayload {
  projectId?: string;
  requirementId?: string;
  testDate?: string;
  testCase?: string;
  expectedResult?: string;
  actualResult?: string;
  testerName?: string;
  testerInitials?: string;
  testerColor?: string;
  status?: string;
  defectId?: string;
  clientApproval?: string;
  approvalDate?: string;
  comments?: string;
}
