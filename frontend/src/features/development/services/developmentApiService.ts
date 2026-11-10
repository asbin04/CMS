import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import {
  DevelopmentRecord,
  DevelopmentKpis,
  DevelopmentEnvironment,
  CodeReviewStatus,
  DevelopmentStatus,
  DevelopmentQueryParams,
  CreateDevelopmentPayload,
  UpdateDevelopmentPayload,
  PageResponse,
} from '../types';
import { formatDateForDisplay, formatDateForInput } from '../../timesheets-requirements/utils/formatters';

const BASE_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '/api/v1';

export function mapBackendDevelopmentToRecord(raw: any): DevelopmentRecord {
  if (!raw) return {} as DevelopmentRecord;
  return {
    id: raw.developmentId || raw.id || '',
    developmentId: raw.developmentId || raw.id || '',
    projectId: raw.projectId || '',
    requirementId: raw.requirementId || '',
    taskId: raw.taskId || '',
    developer: raw.developerName || raw.developer || '',
    developerAvatar: raw.developerAvatar,
    repositoryUrl: raw.repositoryUrl || '',
    branch: raw.branch || '',
    environment: (raw.environment || 'Dev') as DevelopmentEnvironment,
    buildVersion: raw.buildVersion || '',
    codeReviewStatus: (raw.codeReviewStatus || 'In Review') as CodeReviewStatus,
    qaHandoffDate: raw.qaHandoffDate ? formatDateForDisplay(raw.qaHandoffDate) : '-',
    releaseId: raw.releaseId || '-',
    status: (raw.status || 'In Progress') as DevelopmentStatus,
    technicalNotes: raw.technicalNotes || '',
    documentationLink: raw.documentationLink || '',
  };
}

export function mapBackendDevelopmentKpis(raw: any): DevelopmentKpis {
  return {
    totalDevelopments: Number(raw?.totalDevelopments ?? 0),
    totalTrend: raw?.totalDevelopmentsTrend || '0% vs last month',
    inDevelopment: Number(raw?.inDevelopment ?? 0),
    inDevTrend: raw?.inDevelopmentTrend || '0% vs last month',
    inCodeReview: Number(raw?.inCodeReview ?? 0),
    inReviewTrend: raw?.inCodeReviewTrend || '0% vs last month',
    qaHandover: Number(raw?.qaHandover ?? 0),
    qaTrend: raw?.qaHandoverTrend || '0% vs last month',
    released: Number(raw?.released ?? 0),
    releasedTrend: raw?.releasedTrend || '0% vs last month',
  };
}

export const developmentApiService = {
  /**
   * Fetch paginated and filtered developments from backend
   */
  async getDevelopments(params: DevelopmentQueryParams = {}): Promise<PageResponse<DevelopmentRecord>> {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params.project && params.project !== 'All Projects') queryParams.project = params.project;
    if (params.environment && params.environment !== 'All Environment') queryParams.environment = params.environment;
    if (params.status && params.status !== 'All Status') queryParams.status = params.status;
    if (params.reviewStatus && params.reviewStatus !== 'All Review Status') queryParams.reviewStatus = params.reviewStatus;
    if (params.sort) queryParams.sort = params.sort;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;

    const res = await apiClient.get<PageResponse<any>>(API_ENDPOINTS.DEVELOPMENTS.BASE, queryParams);
    const data = res.data;

    return {
      content: (data?.content || []).map(mapBackendDevelopmentToRecord),
      pageNumber: data?.pageNumber ?? 1,
      pageSize: data?.pageSize ?? (params.size || 10),
      totalElements: data?.totalElements ?? 0,
      totalPages: data?.totalPages ?? 1,
      first: data?.first,
      last: data?.last,
      empty: data?.empty,
    };
  },

  /**
   * Get single development record by ID
   */
  async getDevelopmentById(id: string): Promise<DevelopmentRecord> {
    const res = await apiClient.get<any>(API_ENDPOINTS.DEVELOPMENTS.BY_ID(id));
    return mapBackendDevelopmentToRecord(res.data);
  },

  /**
   * Get dynamic KPIs from backend
   */
  async getKpis(): Promise<DevelopmentKpis> {
    const res = await apiClient.get<any>(API_ENDPOINTS.DEVELOPMENTS.KPIS);
    return mapBackendDevelopmentKpis(res.data);
  },

  /**
   * Preview next development ID without incrementing sequence
   */
  async getNextDevelopmentId(): Promise<string> {
    const res = await apiClient.get<{ nextId: string }>(API_ENDPOINTS.DEVELOPMENTS.NEXT_ID);
    return res.data?.nextId || 'DEV-2026-0001';
  },

  /**
   * Create new development record
   */
  async createDevelopment(payload: CreateDevelopmentPayload): Promise<DevelopmentRecord> {
    const body: Record<string, any> = {
      projectId: payload.projectId,
      requirementId: payload.requirementId,
      taskId: payload.taskId,
      developerName: payload.developerName,
      developerId: payload.developerId,
      repositoryUrl: payload.repositoryUrl,
      branch: payload.branch,
      environment: payload.environment,
      buildVersion: payload.buildVersion,
      codeReviewStatus: payload.codeReviewStatus || 'In Review',
      qaHandoffDate: payload.qaHandoffDate && payload.qaHandoffDate !== '-' ? formatDateForInput(payload.qaHandoffDate) : null,
      releaseId: payload.releaseId || '-',
      status: payload.status || 'In Progress',
      technicalNotes: payload.technicalNotes || '',
      documentationLink: payload.documentationLink || null,
    };

    const res = await apiClient.post<any>(API_ENDPOINTS.DEVELOPMENTS.BASE, body);
    return mapBackendDevelopmentToRecord(res.data);
  },

  /**
   * Update existing development record
   */
  async updateDevelopment(id: string, payload: UpdateDevelopmentPayload): Promise<DevelopmentRecord> {
    const body: Record<string, any> = {};
    if (payload.projectId) body.projectId = payload.projectId;
    if (payload.requirementId) body.requirementId = payload.requirementId;
    if (payload.taskId) body.taskId = payload.taskId;
    if (payload.developerName) body.developerName = payload.developerName;
    if (payload.developerId) body.developerId = payload.developerId;
    if (payload.repositoryUrl) body.repositoryUrl = payload.repositoryUrl;
    if (payload.branch) body.branch = payload.branch;
    if (payload.environment) body.environment = payload.environment;
    if (payload.buildVersion) body.buildVersion = payload.buildVersion;
    if (payload.codeReviewStatus) body.codeReviewStatus = payload.codeReviewStatus;
    if (payload.qaHandoffDate !== undefined) {
      body.qaHandoffDate = payload.qaHandoffDate && payload.qaHandoffDate !== '-' ? formatDateForInput(payload.qaHandoffDate) : null;
    }
    if (payload.releaseId !== undefined) body.releaseId = payload.releaseId || '-';
    if (payload.status) body.status = payload.status;
    if (payload.technicalNotes !== undefined) body.technicalNotes = payload.technicalNotes;
    if (payload.documentationLink !== undefined) body.documentationLink = payload.documentationLink;

    const res = await apiClient.put<any>(API_ENDPOINTS.DEVELOPMENTS.BY_ID(id), body);
    return mapBackendDevelopmentToRecord(res.data);
  },

  /**
   * Update status inline
   */
  async updateStatus(id: string, status: DevelopmentStatus): Promise<DevelopmentRecord> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.DEVELOPMENTS.STATUS(id), { status });
    return mapBackendDevelopmentToRecord(res.data);
  },

  /**
   * Update code review status inline
   */
  async updateCodeReviewStatus(id: string, codeReviewStatus: CodeReviewStatus): Promise<DevelopmentRecord> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.DEVELOPMENTS.CODE_REVIEW_STATUS(id), { codeReviewStatus });
    return mapBackendDevelopmentToRecord(res.data);
  },

  /**
   * Delete development record
   */
  async deleteDevelopment(id: string): Promise<void> {
    await apiClient.delete<void>(API_ENDPOINTS.DEVELOPMENTS.BY_ID(id));
  },

  /**
   * Export filtered developments to CSV
   */
  async exportDevelopments(params: DevelopmentQueryParams = {}): Promise<void> {
    const queryParams: Record<string, string | undefined> = {};
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params.project && params.project !== 'All Projects') queryParams.project = params.project;
    if (params.environment && params.environment !== 'All Environment') queryParams.environment = params.environment;
    if (params.status && params.status !== 'All Status') queryParams.status = params.status;
    if (params.reviewStatus && params.reviewStatus !== 'All Review Status') queryParams.reviewStatus = params.reviewStatus;

    const searchStr = new URLSearchParams(queryParams as Record<string, string>).toString();
    const endpoint = `${BASE_URL}${API_ENDPOINTS.DEVELOPMENTS.EXPORT}${searchStr ? `?${searchStr}` : ''}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(endpoint, { headers });
    if (!res.ok) {
      throw new Error(`Failed to export CSV: ${res.statusText}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `development_records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

