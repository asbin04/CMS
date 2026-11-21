import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import {
  UatItem,
  UatKpis,
  UatFilterOptions,
  CreateUatPayload,
  UpdateUatPayload,
} from '../types/uat';

export const INITIAL_UAT_ITEMS: any[] = [];

export const INITIAL_UAT_KPIS: UatKpis = {
  totalUats: 0,
  totalTrend: '—',
  inTesting: 0,
  inTestingTrend: '—',
  passed: 0,
  passedTrend: '—',
  defectsLogged: 0,
  defectsLoggedTrend: '—',
  clientApproved: 0,
  clientApprovedTrend: '—',
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
        projects: [],
        statuses: ['Passed', 'In Testing', 'Failed'],
        clientApprovals: ['Approved', 'Pending'],
        testers: [],
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

