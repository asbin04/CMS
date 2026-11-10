import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import {
  UatItem,
  UatKpis,
  UatFilterOptions,
  CreateUatPayload,
  UpdateUatPayload,
} from '../types/uat';

export const INITIAL_UAT_ITEMS: UatItem[] = [
  {
    id: 'UAT-2026-0483',
    projectId: 'PRJ-001',
    requirementId: 'REQ-2026-0184',
    testDate: '28 Oct 2026',
    testCase: 'TC-001',
    expectedResult: 'User can login with valid credentials',
    actualResult: 'Login successful',
    testerName: 'Amit Sharma',
    testerInitials: 'AS',
    testerColor: '#4338CA',
    status: 'Passed',
    defectId: '-',
    clientApproval: 'Approved',
    approvalDate: '28 Oct 2026',
    comments: 'Working as expected',
  },
  {
    id: 'UAT-2026-0482',
    projectId: 'PRJ-001',
    requirementId: 'REQ-2026-0185',
    testDate: '28 Oct 2026',
    testCase: 'TC-002',
    expectedResult: 'Dashboard loads with key metrics',
    actualResult: 'Dashboard displayed correctly',
    testerName: 'Sneha Nair',
    testerInitials: 'SN',
    testerColor: '#7E22CE',
    status: 'Passed',
    defectId: '-',
    clientApproval: 'Approved',
    approvalDate: '28 Oct 2026',
    comments: '-',
  },
  {
    id: 'UAT-2026-0481',
    projectId: 'PRJ-002',
    requirementId: 'REQ-2026-0182',
    testDate: '27 Oct 2026',
    testCase: 'TC-003',
    expectedResult: 'User can create an appointment',
    actualResult: 'Appointment created successfully',
    testerName: 'Divya Patel',
    testerInitials: 'DP',
    testerColor: '#1D4ED8',
    status: 'Passed',
    defectId: '-',
    clientApproval: 'Approved',
    approvalDate: '27 Oct 2026',
    comments: 'Validation successful',
  },
  {
    id: 'UAT-2026-0480',
    projectId: 'PRJ-002',
    requirementId: 'REQ-2026-0181',
    testDate: '27 Oct 2026',
    testCase: 'TC-004',
    expectedResult: 'System sends email notification',
    actualResult: 'Email not received',
    testerName: 'Rohan Verma',
    testerInitials: 'RV',
    testerColor: '#6D28D9',
    status: 'Failed',
    defectId: 'DEF-0147',
    clientApproval: 'Pending',
    approvalDate: '-',
    comments: 'Email service issue',
  },
  {
    id: 'UAT-2026-0479',
    projectId: 'PRJ-003',
    requirementId: 'REQ-2026-0180',
    testDate: '26 Oct 2026',
    testCase: 'TC-005',
    expectedResult: 'Report export in PDF format',
    actualResult: 'PDF exported successfully',
    testerName: 'Vikram Shah',
    testerInitials: 'VK',
    testerColor: '#4D7C0F',
    status: 'Passed',
    defectId: '-',
    clientApproval: 'Approved',
    approvalDate: '26 Oct 2026',
    comments: '-',
  },
  {
    id: 'UAT-2026-0478',
    projectId: 'PRJ-003',
    requirementId: 'REQ-2026-0179',
    testDate: '25 Oct 2026',
    testCase: 'TC-006',
    expectedResult: 'Apply filters in reports',
    actualResult: 'Filters working correctly',
    testerName: 'Sneha Nair',
    testerInitials: 'SN',
    testerColor: '#7E22CE',
    status: 'Passed',
    defectId: '-',
    clientApproval: 'Approved',
    approvalDate: '25 Oct 2026',
    comments: '-',
  },
  {
    id: 'UAT-2026-0477',
    projectId: 'PRJ-004',
    requirementId: 'REQ-2026-0178',
    testDate: '24 Oct 2026',
    testCase: 'TC-007',
    expectedResult: 'User can update profile details',
    actualResult: 'Profile not updated',
    testerName: 'Amit Sharma',
    testerInitials: 'AS',
    testerColor: '#4338CA',
    status: 'Failed',
    defectId: 'DEF-0146',
    clientApproval: 'Pending',
    approvalDate: '-',
    comments: 'Validation error on save',
  },
  {
    id: 'UAT-2026-0476',
    projectId: 'PRJ-004',
    requirementId: 'REQ-2026-0177',
    testDate: '24 Oct 2026',
    testCase: 'TC-008',
    expectedResult: 'System logs user activity',
    actualResult: 'User activity logged correctly',
    testerName: 'Divya Patel',
    testerInitials: 'DP',
    testerColor: '#1D4ED8',
    status: 'Passed',
    defectId: '-',
    clientApproval: 'Approved',
    approvalDate: '24 Oct 2026',
    comments: '-',
  },
  {
    id: 'UAT-2026-0475',
    projectId: 'PRJ-005',
    requirementId: 'REQ-2026-0176',
    testDate: '22 Oct 2026',
    testCase: 'TC-009',
    expectedResult: 'Generate invoice for booking',
    actualResult: 'Invoice generated successfully',
    testerName: 'Rohan Verma',
    testerInitials: 'RV',
    testerColor: '#6D28D9',
    status: 'Passed',
    defectId: '-',
    clientApproval: 'Approved',
    approvalDate: '22 Oct 2026',
    comments: '-',
  },
  {
    id: 'UAT-2026-0474',
    projectId: 'PRJ-005',
    requirementId: 'REQ-2026-0175',
    testDate: '21 Oct 2026',
    testCase: 'TC-010',
    expectedResult: 'Cancel booking and refund',
    actualResult: 'Refund not initiated',
    testerName: 'Vikram Shah',
    testerInitials: 'VK',
    testerColor: '#4D7C0F',
    status: 'Failed',
    defectId: 'DEF-0145',
    clientApproval: 'Pending',
    approvalDate: '-',
    comments: 'Refund service integration issue',
  },
];

export const INITIAL_UAT_KPIS: UatKpis = {
  totalUats: 324,
  totalTrend: '↑ 14% vs last month',
  inTesting: 96,
  inTestingTrend: '↑ 18% vs last month',
  passed: 182,
  passedTrend: '↑ 20% vs last month',
  defectsLogged: 46,
  defectsLoggedTrend: '↑ 12% vs last month',
  clientApproved: 168,
  clientApprovedTrend: '↑ 16% vs last month',
};

export const uatService = {
  getUats: async (params?: {
    search?: string;
    projectId?: string;
    status?: string;
    clientApproval?: string;
    tester?: string;
  }): Promise<UatItem[]> => {
    const res = await apiClient.get<UatItem[]>(API_ENDPOINTS.PROJECTS.UAT, params);
    return res.data || [];
  },

  getKpis: async (): Promise<UatKpis> => {
    const res = await apiClient.get<UatKpis>(API_ENDPOINTS.PROJECTS.UAT_KPIS);
    return res.data;
  },

  getFilterOptions: async (): Promise<UatFilterOptions> => {
    const res = await apiClient.get<UatFilterOptions>(API_ENDPOINTS.PROJECTS.UAT_FILTERS);
    return (
      res.data || {
        projects: ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005'],
        statuses: ['Passed', 'In Testing', 'Failed'],
        clientApprovals: ['Approved', 'Pending'],
        testers: ['Amit Sharma', 'Sneha Nair', 'Divya Patel', 'Rohan Verma', 'Vikram Shah'],
      }
    );
  },

  createUat: async (payload: CreateUatPayload): Promise<UatItem> => {
    const res = await apiClient.post<UatItem>(API_ENDPOINTS.PROJECTS.UAT, payload);
    return res.data;
  },

  updateUat: async (id: string, payload: UpdateUatPayload): Promise<UatItem> => {
    const res = await apiClient.put<UatItem>(API_ENDPOINTS.PROJECTS.UAT_BY_ID(id), payload);
    return res.data;
  },

  deleteUat: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PROJECTS.UAT_BY_ID(id));
  },

  exportCsv: (items: UatItem[]) => {
    const headers = [
      'UAT ID',
      'Project ID',
      'Requirement ID',
      'Test Date',
      'Test Case',
      'Expected Result',
      'Actual Result',
      'Tester',
      'Status',
      'Defect ID',
      'Client Approval',
      'Approval Date',
      'Comments',
    ];

    const rows = items.map((i) => [
      i.id,
      i.projectId,
      i.requirementId,
      i.testDate,
      i.testCase,
      `"${i.expectedResult.replace(/"/g, '""')}"`,
      `"${i.actualResult.replace(/"/g, '""')}"`,
      `"${i.testerName.replace(/"/g, '""')}"`,
      i.status,
      i.defectId || '-',
      i.clientApproval,
      i.approvalDate || '-',
      `"${(i.comments || '-').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `uat_executions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

