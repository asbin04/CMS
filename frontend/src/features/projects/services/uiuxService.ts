import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import {
  UiuxDesignItem,
  UiuxKpis,
  UiuxFilterOptions,
  CreateUiuxPayload,
  UpdateUiuxPayload,
} from '../types/uiux';

export const INITIAL_UIUX_DESIGNS: UiuxDesignItem[] = [
  {
    id: 'DES-2026-0186',
    projectId: 'PRJ-001',
    requirementId: 'REQ-2026-0184',
    screenFeature: 'Login Screen',
    designType: 'UI Design',
    version: 'v1.2',
    designer: 'Amit Sharma',
    designerInitials: 'AS',
    tool: 'Figma',
    prototypeUrl: 'https://www.figma.com',
    clientFeedback: 'Looks good, update spacing',
    feedbackDate: '28 Oct 2026',
    approvalStatus: 'Pending',
    approvedBy: '-',
    approvalDate: '-',
    changeRequest: 'CR-014',
    status: 'In Progress',
    notes: 'Spacing updates',
  },
  {
    id: 'DES-2026-0185',
    projectId: 'PRJ-001',
    requirementId: 'REQ-2026-0185',
    screenFeature: 'Dashboard',
    designType: 'UI/UX',
    version: 'v2.0',
    designer: 'Sneha Nair',
    designerInitials: 'SN',
    tool: 'Figma',
    prototypeUrl: 'https://www.figma.com',
    clientFeedback: 'Approved',
    feedbackDate: '27 Oct 2026',
    approvalStatus: 'Approved',
    approvedBy: 'Rohan Verma',
    approvalDate: '27 Oct 2026',
    changeRequest: '-',
    status: 'Completed',
    notes: '-',
  },
  {
    id: 'DES-2026-0184',
    projectId: 'PRJ-002',
    requirementId: 'REQ-2026-0182',
    screenFeature: 'Appointment Booking',
    designType: 'UI Design',
    version: 'v1.1',
    designer: 'Divya Patel',
    designerInitials: 'DP',
    tool: 'Figma',
    prototypeUrl: 'https://www.figma.com',
    clientFeedback: 'Add calendar filter',
    feedbackDate: '25 Oct 2026',
    approvalStatus: 'Pending',
    approvedBy: '-',
    approvalDate: '-',
    changeRequest: 'CR-013',
    status: 'In Progress',
    notes: 'Add filter',
  },
  {
    id: 'DES-2026-0183',
    projectId: 'PRJ-002',
    requirementId: 'REQ-2026-0181',
    screenFeature: 'Patient Profile',
    designType: 'UI Design',
    version: 'v1.3',
    designer: 'Rohan Verma',
    designerInitials: 'RV',
    tool: 'Adobe XD',
    prototypeUrl: 'https://xd.adobe.com',
    clientFeedback: 'Update icon style',
    feedbackDate: '25 Oct 2026',
    approvalStatus: 'Approved',
    approvedBy: 'Amit Sharma',
    approvalDate: '25 Oct 2026',
    changeRequest: '-',
    status: 'Completed',
    notes: '-',
  },
  {
    id: 'DES-2026-0182',
    projectId: 'PRJ-003',
    requirementId: 'REQ-2026-0180',
    screenFeature: 'Reports & Analytics',
    designType: 'UI/UX',
    version: 'v1.0',
    designer: 'Vikram Shah',
    designerInitials: 'VK',
    tool: 'Figma',
    prototypeUrl: 'https://www.figma.com',
    clientFeedback: 'Add export option',
    feedbackDate: '24 Oct 2026',
    approvalStatus: 'Pending',
    approvedBy: '-',
    approvalDate: '-',
    changeRequest: 'CR-012',
    status: 'In Progress',
    notes: '-',
  },
  {
    id: 'DES-2026-0181',
    projectId: 'PRJ-003',
    requirementId: 'REQ-2026-0179',
    screenFeature: 'Settings',
    designType: 'UI Design',
    version: 'v1.0',
    designer: 'Sneha Nair',
    designerInitials: 'SN',
    tool: 'Figma',
    prototypeUrl: 'https://www.figma.com',
    clientFeedback: 'Looks good',
    feedbackDate: '24 Oct 2026',
    approvalStatus: 'Approved',
    approvedBy: 'Sneha Nair',
    approvalDate: '24 Oct 2026',
    changeRequest: '-',
    status: 'Completed',
    notes: '-',
  },
  {
    id: 'DES-2026-0180',
    projectId: 'PRJ-004',
    requirementId: 'REQ-2026-0178',
    screenFeature: 'User Management',
    designType: 'UI/UX',
    version: 'v1.2',
    designer: 'Amit Sharma',
    designerInitials: 'AS',
    tool: 'Adobe XD',
    prototypeUrl: 'https://xd.adobe.com',
    clientFeedback: 'Change table style',
    feedbackDate: '22 Oct 2026',
    approvalStatus: 'Pending',
    approvedBy: '-',
    approvalDate: '-',
    changeRequest: 'CR-011',
    status: 'In Progress',
    notes: 'Table refinement',
  },
  {
    id: 'DES-2026-0179',
    projectId: 'PRJ-004',
    requirementId: 'REQ-2026-0177',
    screenFeature: 'Role & Permissions',
    designType: 'UI Design',
    version: 'v1.1',
    designer: 'Divya Patel',
    designerInitials: 'DP',
    tool: 'Figma',
    prototypeUrl: 'https://www.figma.com',
    clientFeedback: 'Approved',
    feedbackDate: '22 Oct 2026',
    approvalStatus: 'Approved',
    approvedBy: 'Rohan Verma',
    approvalDate: '22 Oct 2026',
    changeRequest: '-',
    status: 'Completed',
    notes: '-',
  },
  {
    id: 'DES-2026-0178',
    projectId: 'PRJ-005',
    requirementId: 'REQ-2026-0176',
    screenFeature: 'Invoice Creation',
    designType: 'UI Design',
    version: 'v1.0',
    designer: 'Rohan Verma',
    designerInitials: 'RV',
    tool: 'Adobe XD',
    prototypeUrl: 'https://xd.adobe.com',
    clientFeedback: 'Add tax field',
    feedbackDate: '21 Oct 2026',
    approvalStatus: 'Pending',
    approvedBy: '-',
    approvalDate: '-',
    changeRequest: 'CR-010',
    status: 'In Progress',
    notes: '-',
  },
  {
    id: 'DES-2026-0177',
    projectId: 'PRJ-005',
    requirementId: 'REQ-2026-0175',
    screenFeature: 'Invoice List',
    designType: 'UI/UX',
    version: 'v1.1',
    designer: 'Vikram Shah',
    designerInitials: 'VK',
    tool: 'Figma',
    prototypeUrl: 'https://www.figma.com',
    clientFeedback: 'Looks good',
    feedbackDate: '20 Oct 2026',
    approvalStatus: 'Approved',
    approvedBy: 'Amit Sharma',
    approvalDate: '20 Oct 2026',
    changeRequest: '-',
    status: 'Completed',
    notes: '-',
  },
];

export const INITIAL_UIUX_KPIS: UiuxKpis = {
  totalDesigns: 256,
  totalDesignsTrend: '↑ 18% vs last month',
  inProgress: 92,
  inProgressTrend: '↑ 22% vs last month',
  approved: 118,
  approvedTrend: '↑ 16% vs last month',
  changeRequests: 24,
  changeRequestsTrend: '↑ 33% vs last month',
  pendingApproval: 22,
  pendingApprovalTrend: '↑ 10% vs last month',
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
        projects: ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005'],
        designTypes: ['UI Design', 'UI/UX'],
        approvalStatuses: ['Pending', 'Approved'],
        statuses: ['In Progress', 'Completed'],
        designers: ['Amit Sharma', 'Sneha Nair', 'Divya Patel', 'Rohan Verma', 'Vikram Shah'],
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

