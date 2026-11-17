import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import {
  UiuxDesignItem,
  UiuxKpis,
  UiuxFilterOptions,
  CreateUiuxPayload,
  UpdateUiuxPayload,
} from '../types/uiux';

export const INITIAL_UIUX_DESIGNS: any[] = [];

export const INITIAL_UIUX_KPIS: UiuxKpis = {
  totalDesigns: 0,
  totalDesignsTrend: '—',
  inProgress: 0,
  inProgressTrend: '—',
  approved: 0,
  approvedTrend: '—',
  changeRequests: 0,
  changeRequestsTrend: '—',
  pendingApproval: 0,
  pendingApprovalTrend: '—',
};

export const uiuxService = {
  getDesigns: async (): Promise<UiuxDesignItem[]> => {
    const res = await apiClient.get<UiuxDesignItem[]>(API_ENDPOINTS.PROJECTS.UI_UX);
    return res.data || [];
  },

  getKpis: async (): Promise<UiuxKpis> => {
    const res = await apiClient.get<UiuxKpis>(API_ENDPOINTS.PROJECTS.UI_UX_KPIS);
    return res.data;
  },

  getFilterOptions: async (): Promise<UiuxFilterOptions> => {
    const res = await apiClient.get<UiuxFilterOptions>(API_ENDPOINTS.PROJECTS.UI_UX_FILTERS);
    return (
      res.data || {
        projects: [],
        designTypes: ['UI Design', 'UI/UX'],
        approvalStatuses: ['Pending', 'Approved'],
        statuses: ['In Progress', 'Completed'],
        designers: [],
      }
    );
  },

  createDesign: async (payload: CreateUiuxPayload): Promise<UiuxDesignItem> => {
    const res = await apiClient.post<UiuxDesignItem>(API_ENDPOINTS.PROJECTS.UI_UX, payload);
    return res.data;
  },

  updateDesign: async (id: string, payload: UpdateUiuxPayload): Promise<UiuxDesignItem> => {
    const res = await apiClient.put<UiuxDesignItem>(API_ENDPOINTS.PROJECTS.UI_UX_BY_ID(id), payload);
    return res.data;
  },

  deleteDesign: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PROJECTS.UI_UX_BY_ID(id));
  },

  exportCsv: (items: UiuxDesignItem[]) => {
    const headers = [
      'Design ID',
      'Project ID',
      'Requirement ID',
      'Screen / Feature',
      'Design Type',
      'Version',
      'Designer',
      'Tool',
      'Prototype URL',
      'Client Feedback',
      'Feedback Date',
      'Approval Status',
      'Approved By',
      'Approval Date',
      'Change Request',
      'Status',
      'Notes',
    ];

    const rows = items.map((i) => [
      i.id,
      i.projectId,
      i.requirementId,
      `"${i.screenFeature.replace(/"/g, '""')}"`,
      i.designType,
      i.version,
      `"${i.designer.replace(/"/g, '""')}"`,
      i.tool,
      i.prototypeUrl || '',
      `"${(i.clientFeedback || '').replace(/"/g, '""')}"`,
      i.feedbackDate || '',
      i.approvalStatus,
      i.approvedBy || '',
      i.approvalDate || '',
      i.changeRequest || '',
      i.status,
      `"${(i.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ui_ux_designs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

