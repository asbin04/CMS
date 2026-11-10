import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import {
  DeploymentItem,
  DeploymentKpis,
  DeploymentFilterOptions,
  CreateDeploymentPayload,
  UpdateDeploymentPayload,
} from '../types/deployment';

export const INITIAL_DEPLOYMENT_ITEMS: DeploymentItem[] = [
  {
    id: 'DEP-2026-0186',
    projectId: 'PRJ-001',
    releaseVersion: 'v2.4.0',
    deploymentDate: '28 Oct 2026',
    environment: 'Production',
    deploymentOwner: 'Amit Sharma',
    preDeploymentChecklist: 'Completed',
    backupCompleted: 'Yes',
    rollbackPlan: 'Available',
    smokeTest: 'Pass',
    status: 'Successful',
    clientSignOff: 'Confirmed',
    goLiveDate: '28 Oct 2026',
    handoverStatus: 'Completed',
    releaseNotes: 'Go-live successful',
  },
  {
    id: 'DEP-2028-0185',
    projectId: 'PRJ-001',
    releaseVersion: 'v2.3.1',
    deploymentDate: '27 Oct 2026',
    environment: 'Staging',
    deploymentOwner: 'Sneha Nair',
    preDeploymentChecklist: 'Completed',
    backupCompleted: 'Yes',
    rollbackPlan: 'Available',
    smokeTest: 'Pass',
    status: 'Successful',
    clientSignOff: 'Confirmed',
    goLiveDate: '-',
    handoverStatus: 'In Progress',
    releaseNotes: 'Verification with client',
  },
  {
    id: 'DEP-2026-0184',
    projectId: 'PRJ-002',
    releaseVersion: 'v1.9.0',
    deploymentDate: '26 Oct 2026',
    environment: 'Production',
    deploymentOwner: 'Divya Patel',
    preDeploymentChecklist: 'Completed',
    backupCompleted: 'Yes',
    rollbackPlan: 'Available',
    smokeTest: 'Pass',
    status: 'Successful',
    clientSignOff: 'Confirmed',
    goLiveDate: '26 Oct 2026',
    handoverStatus: 'Completed',
    releaseNotes: '-',
  },
  {
    id: 'DEP-2028-0183',
    projectId: 'PRJ-002',
    releaseVersion: 'v1.8.2',
    deploymentDate: '25 Oct 2026',
    environment: 'UAT',
    deploymentOwner: 'Rohan Verma',
    preDeploymentChecklist: 'Completed',
    backupCompleted: 'Yes',
    rollbackPlan: 'Available',
    smokeTest: 'Pass',
    status: 'Successful',
    clientSignOff: 'Pending',
    goLiveDate: '-',
    handoverStatus: 'Pending',
    releaseNotes: 'Client review ongoing',
  },
  {
    id: 'DEP-2026-0182',
    projectId: 'PRJ-003',
    releaseVersion: 'v3.0.0',
    deploymentDate: '24 Oct 2026',
    environment: 'Production',
    deploymentOwner: 'Vikram Shah',
    preDeploymentChecklist: 'Completed',
    backupCompleted: 'Yes',
    rollbackPlan: 'Available',
    smokeTest: 'Fail',
    status: 'Failed',
    clientSignOff: '-',
    goLiveDate: '-',
    handoverStatus: 'In Progress',
    releaseNotes: 'Deployment error - config issue',
  },
  {
    id: 'DEP-2028-0181',
    projectId: 'PRJ-003',
    releaseVersion: 'v2.9.1',
    deploymentDate: '24 Oct 2026',
    environment: 'Staging',
    deploymentOwner: 'Sneha Nair',
    preDeploymentChecklist: 'Completed',
    backupCompleted: 'Yes',
    rollbackPlan: 'Available',
    smokeTest: 'Pass',
    status: 'Successful',
    clientSignOff: 'Confirmed',
    goLiveDate: '24 Oct 2026',
    handoverStatus: 'Completed',
    releaseNotes: '-',
  },
  {
    id: 'DEP-2026-0180',
    projectId: 'PRJ-004',
    releaseVersion: 'v1.5.0',
    deploymentDate: '22 Oct 2026',
    environment: 'Production',
    deploymentOwner: 'Amit Sharma',
    preDeploymentChecklist: 'Completed',
    backupCompleted: 'Yes',
    rollbackPlan: 'Available',
    smokeTest: 'Pass',
    status: 'Successful',
    clientSignOff: 'Confirmed',
    goLiveDate: '22 Oct 2026',
    handoverStatus: 'Completed',
    releaseNotes: 'Production release completed',
  },
  {
    id: 'DEP-2028-0179',
    projectId: 'PRJ-004',
    releaseVersion: 'v1.4.2',
    deploymentDate: '22 Oct 2026',
    environment: 'UAT',
    deploymentOwner: 'Divya Patel',
    preDeploymentChecklist: 'Completed',
    backupCompleted: 'Yes',
    rollbackPlan: 'Available',
    smokeTest: 'Pass',
    status: 'Successful',
    clientSignOff: 'Confirmed',
    goLiveDate: '-',
    handoverStatus: 'Completed',
    releaseNotes: 'UAT signed off',
  },
  {
    id: 'DEP-2026-0178',
    projectId: 'PRJ-005',
    releaseVersion: 'v2.1.0',
    deploymentDate: '21 Oct 2026',
    environment: 'Staging',
    deploymentOwner: 'Rohan Verma',
    preDeploymentChecklist: 'Completed',
    backupCompleted: 'Yes',
    rollbackPlan: 'Available',
    smokeTest: 'Pass',
    status: 'Successful',
    clientSignOff: 'Confirmed',
    goLiveDate: '-',
    handoverStatus: 'In Progress',
    releaseNotes: 'Handover in progress',
  },
  {
    id: 'DEP-2026-0177',
    projectId: 'PRJ-005',
    releaseVersion: 'v2.0.5',
    deploymentDate: '20 Oct 2026',
    environment: 'Production',
    deploymentOwner: 'Vikram Shah',
    preDeploymentChecklist: 'Pending',
    backupCompleted: 'No',
    rollbackPlan: 'Available',
    smokeTest: '-',
    status: 'In Progress',
    clientSignOff: '-',
    goLiveDate: '-',
    handoverStatus: '-',
    releaseNotes: 'Final validation pending',
  },
];

export const INITIAL_DEPLOYMENT_KPIS: DeploymentKpis = {
  totalDeployments: 124,
  totalDeploymentsChange: '↑ 14% vs last month',
  successfulDeployments: 109,
  successfulDeploymentsChange: '↑ 18% vs last month',
  failedDeployments: 6,
  failedDeploymentsChange: '↑ 25% vs last month',
  goLiveCompleted: 98,
  goLiveCompletedChange: '↑ 20% vs last month',
  handoverPending: 12,
  handoverPendingChange: '↑ 33% vs last month',
};

export function formatDeploymentDisplayDate(dateStr?: string | null): string {
  if (!dateStr || dateStr === '-' || dateStr === 'null') return '-';
  const trimmed = dateStr.trim();
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(trimmed)) return trimmed;
  const parts = trimmed.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 0 && month < 12) {
      return `${day} ${months[month]} ${year}`;
    }
  }
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return trimmed;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function normalizeDateToIso(dateStr?: string | null): string {
  if (!dateStr || dateStr.trim() === '' || dateStr.trim() === '-') {
    return new Date().toISOString().split('T')[0];
  }
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/^(\d{1,2})[\s-]+([A-Za-z]{3})[\s-]+(\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthStr = match[2].toLowerCase();
    const months: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const month = months[monthStr];
    const year = match[3];
    if (month) {
      return `${year}-${month}-${day}`;
    }
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

export const deploymentService = {
  getDeployments: async (params?: {
    search?: string;
    environment?: string;
    status?: string;
    handoverStatus?: string;
  }): Promise<DeploymentItem[]> => {
    try {
      const res = await apiClient.get<DeploymentItem[]>(API_ENDPOINTS.PROJECTS.DEPLOYMENTS, params);
      if (Array.isArray(res.data)) {
        return res.data.map((item: any) => ({
          ...item,
          id: item.deploymentId || item.id,
          deploymentDate: formatDeploymentDisplayDate(item.deploymentDate),
          goLiveDate: formatDeploymentDisplayDate(item.goLiveDate),
        }));
      }
      return INITIAL_DEPLOYMENT_ITEMS;
    } catch {
      return INITIAL_DEPLOYMENT_ITEMS;
    }
  },

  getKpis: async (): Promise<DeploymentKpis> => {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.PROJECTS.DEPLOYMENTS_KPIS);
      if (res?.data) {
        const d = res.data;
        return {
          totalDeployments: Number(d.totalDeployments ?? 0),
          totalDeploymentsChange: d.totalDeploymentsChange || d.totalDeploymentsTrend || '↑ 14% vs last month',
          successfulDeployments: Number(d.successfulDeployments ?? 0),
          successfulDeploymentsChange: d.successfulDeploymentsChange || d.successfulDeploymentsTrend || '↑ 18% vs last month',
          failedDeployments: Number(d.failedDeployments ?? 0),
          failedDeploymentsChange: d.failedDeploymentsChange || d.failedDeploymentsTrend || '↑ 25% vs last month',
          goLiveCompleted: Number(d.goLiveCompleted ?? 0),
          goLiveCompletedChange: d.goLiveCompletedChange || d.goLiveCompletedTrend || '↑ 20% vs last month',
          handoverPending: Number(d.handoverPending ?? 0),
          handoverPendingChange: d.handoverPendingChange || d.handoverPendingTrend || '↑ 33% vs last month',
        };
      }
      return INITIAL_DEPLOYMENT_KPIS;
    } catch {
      return INITIAL_DEPLOYMENT_KPIS;
    }
  },

  getFilterOptions: async (): Promise<DeploymentFilterOptions> => {
    try {
      const res = await apiClient.get<DeploymentFilterOptions>(API_ENDPOINTS.PROJECTS.DEPLOYMENTS_FILTERS);
      return (
        res.data || {
          environments: ['Production', 'Staging', 'UAT', 'QA'],
          deploymentStatuses: ['All Status', 'Successful', 'Failed', 'In-Progress'],
          handoverStatuses: ['All Status', 'Handed Over', 'Pending'],
          owners: ['Amit Sharma', 'Sneha Nair', 'Divya Patel', 'Rohan Verma', 'Vikram Shah'],
          projects: ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005'],
        }
      );
    } catch {
      return {
        environments: ['Production', 'Staging', 'UAT', 'QA'],
        deploymentStatuses: ['All Status', 'Successful', 'Failed', 'In-Progress'],
        handoverStatuses: ['All Status', 'Handed Over', 'Pending'],
        owners: ['Amit Sharma', 'Sneha Nair', 'Divya Patel', 'Rohan Verma', 'Vikram Shah'],
        projects: ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005'],
      };
    }
  },

  createDeployment: async (payload: CreateDeploymentPayload): Promise<DeploymentItem> => {
    const formattedPayload = {
      ...payload,
      deploymentDate: normalizeDateToIso(payload.deploymentDate),
      goLiveDate: payload.goLiveDate && payload.goLiveDate !== '-' ? normalizeDateToIso(payload.goLiveDate) : null,
    };
    const res = await apiClient.post<DeploymentItem>(API_ENDPOINTS.PROJECTS.DEPLOYMENTS, formattedPayload);
    return {
      ...res.data,
      id: (res.data as any).deploymentId || res.data.id,
      deploymentDate: formatDeploymentDisplayDate(res.data.deploymentDate),
      goLiveDate: formatDeploymentDisplayDate(res.data.goLiveDate),
    };
  },

  updateDeployment: async (id: string, payload: UpdateDeploymentPayload): Promise<DeploymentItem> => {
    const formattedPayload = {
      ...payload,
      ...(payload.deploymentDate ? { deploymentDate: normalizeDateToIso(payload.deploymentDate) } : {}),
      ...(payload.goLiveDate && payload.goLiveDate !== '-' ? { goLiveDate: normalizeDateToIso(payload.goLiveDate) } : {}),
    };
    const res = await apiClient.put<DeploymentItem>(API_ENDPOINTS.PROJECTS.DEPLOYMENT_BY_ID(id), formattedPayload);
    return {
      ...res.data,
      id: (res.data as any).deploymentId || res.data.id,
      deploymentDate: formatDeploymentDisplayDate(res.data.deploymentDate),
      goLiveDate: formatDeploymentDisplayDate(res.data.goLiveDate),
    };
  },

  deleteDeployment: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PROJECTS.DEPLOYMENT_BY_ID(id));
  },

  exportCsv: (items: DeploymentItem[]) => {
    const headers = [
      'Deployment ID',
      'Project ID',
      'Release Version',
      'Deployment Date',
      'Environment',
      'Deployment Owner',
      'Pre-Deployment Checklist',
      'Backup Completed',
      'Rollback Plan',
      'Smoke Test',
      'Status',
      'Client Sign-Off',
      'Go-Live Date',
      'Handover Status',
      'Release Notes',
    ];

    const rows = items.map((i) => [
      i.id,
      i.projectId,
      i.releaseVersion,
      i.deploymentDate,
      i.environment,
      `"${i.deploymentOwner.replace(/"/g, '""')}"`,
      i.preDeploymentChecklist,
      i.backupCompleted,
      i.rollbackPlan,
      i.smokeTest,
      i.status,
      i.clientSignOff,
      i.goLiveDate || '-',
      i.handoverStatus,
      `"${(i.releaseNotes || '-').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `deployments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

