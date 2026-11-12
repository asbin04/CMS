import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import {
  RequirementRecord,
  RequirementKpis,
  RequirementPriority,
  RequirementStatus,
  RequirementQueryParams,
  CreateRequirementPayload,
  UpdateRequirementPayload,
  PageResponse,
} from '../types';
import { formatDateForDisplay, formatDateForInput } from '../utils/formatters';

export function mapBackendRequirementToRecord(raw: any): RequirementRecord {
  const isFrozen =
    raw.scopeFreeze === true ||
    raw.scopeFreeze === 'Yes' ||
    raw.scopeFreezeText === 'Frozen';

  const rawApprovedBy = raw.approvedBy || raw.approved_by;
  const rawApprovalDate = raw.approvalDate || raw.approval_date;
  const rawAssignedApprover = raw.assignedApprover || raw.assigned_approver;

  return {
    requirementId: raw.requirementId || raw.id || '',
    projectId: raw.projectId || '',
    clientId: raw.clientId || 'CL-001',
    requirementDate: formatDateForDisplay(raw.requirementDate || raw.date),
    type: raw.type || raw.requirementType || 'Functional',
    requirementFeature: raw.requirementFeature || raw.title || '',
    description: raw.description || '',
    priority: (raw.priority || 'Medium') as RequirementPriority,
    ownerId: raw.ownerId || '',
    status: (raw.status || 'Draft') as RequirementStatus,
    scopeFreeze: isFrozen ? 'Yes' : 'No',
    assignedApprover: rawAssignedApprover || 'Admin – Akshit Ujjain',
    approvedBy:
      raw.status === 'Completed' || (!raw.status && rawApprovedBy)
        ? (rawApprovedBy && rawApprovedBy !== '-'
            ? (rawApprovedBy.toLowerCase().includes('gaurav')
              ? 'Gaurav Tripathy'
              : rawApprovedBy.toLowerCase().includes('akshit')
              ? 'Akshit Ujjain'
              : rawApprovedBy)
            : ((rawAssignedApprover || '').toLowerCase().includes('gaurav') ? 'Gaurav Tripathy' : 'Akshit Ujjain'))
        : '-',
    approvalDate:
      raw.status === 'Completed' || (!raw.status && rawApprovalDate)
        ? (rawApprovalDate && rawApprovalDate !== '-' ? formatDateForDisplay(rawApprovalDate) : formatDateForDisplay(new Date()))
        : '-',
    completionPercentage: Number(raw.completionPercentage ?? 0),
  };
}

export function mapBackendRequirementKpis(raw: any): RequirementKpis {
  return {
    totalRequirements: Number(raw.totalRequirements ?? 0),
    totalRequirementsTrend: raw.totalRequirementsTrend || '↑ 14% vs last month',
    inProgress: Number(raw.inProgress ?? 0),
    completed: Number(raw.completed ?? 0),
    pendingApproval: Number(raw.pendingApproval ?? raw.inReviewRequirements ?? 0),
    scopeFrozen: Number(raw.scopeFrozen ?? raw.scopeFrozenCount ?? 0),
  };
}

export const requirementsApiService = {
  /**
   * Fetch paginated and filtered requirements from the Spring Boot backend
   */
  async getRequirements(params: RequirementQueryParams = {}): Promise<PageResponse<RequirementRecord>> {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params.project && params.project !== 'All Projects') queryParams.project = params.project;
    if (params.type && params.type !== 'All Types') queryParams.type = params.type;
    if (params.priority && params.priority !== 'All Priorities') queryParams.priority = params.priority;
    if (params.status && params.status !== 'All Status') queryParams.status = params.status;
    if (params.scopeFreeze && params.scopeFreeze !== 'All') queryParams.scopeFreeze = params.scopeFreeze;
    if (params.sort) queryParams.sort = params.sort;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;

    const res = await apiClient.get<PageResponse<any>>(API_ENDPOINTS.REQUIREMENTS.BASE, queryParams);
    const data = res.data;

    return {
      content: (data?.content || []).map(mapBackendRequirementToRecord),
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
   * Fetch all filtered requirements without pagination (for CSV export)
   */
  async getAllFilteredRequirements(params: RequirementQueryParams = {}): Promise<RequirementRecord[]> {
    const res = await this.getRequirements({ ...params, page: 1, size: 10000 });
    return res.content;
  },

  /**
   * Get requirement KPI summary statistics
   */
  async getKpis(): Promise<RequirementKpis> {
    const res = await apiClient.get<any>(API_ENDPOINTS.REQUIREMENTS.KPIS);
    return mapBackendRequirementKpis(res.data);
  },

  /**
   * Get single requirement by ID
   */
  async getRequirementById(id: string): Promise<RequirementRecord> {
    const res = await apiClient.get<any>(API_ENDPOINTS.REQUIREMENTS.BY_ID(id));
    return mapBackendRequirementToRecord(res.data);
  },

  /**
   * Create requirement
   */
  async createRequirement(payload: CreateRequirementPayload): Promise<RequirementRecord> {
    const rawStatus = payload.status || 'In Progress';
    const status = rawStatus === 'Draft' ? 'In Progress' : rawStatus;
    const feature = payload.requirementFeature || payload.title || 'New Feature';
    const body: Record<string, any> = {
      projectId: payload.projectId,
      clientId: payload.clientId,
      featureName: feature,
      requirementFeature: feature,
      title: feature,
      description: payload.description || '',
      requirementType: payload.requirementType || payload.type || 'Feature',
      type: payload.requirementType || payload.type || 'Feature',
      priority: payload.priority || 'Medium',
      ownerId: payload.ownerId || 'EMP-001',
      status: status,
      scopeFreeze: Boolean(payload.scopeFreeze),
      completionPercentage: status === 'Completed' ? 100 : (payload.completionPercentage ?? 0),
      requirementDate: formatDateForInput(payload.requirementDate),
      assignedApprover: payload.assignedApprover || 'Admin – Akshit Ujjain',
    };

    if (payload.approvedBy && payload.approvedBy !== '-') {
      body.approvedBy = payload.approvedBy.trim();
    }
    if (payload.approvalDate && payload.approvalDate !== '-') {
      body.approvalDate = formatDateForInput(payload.approvalDate);
    }

    const res = await apiClient.post<any>(API_ENDPOINTS.REQUIREMENTS.BASE, body);
    return mapBackendRequirementToRecord(res.data);
  },

  /**
   * Update requirement details
   */
  async updateRequirement(id: string, payload: UpdateRequirementPayload): Promise<RequirementRecord> {
    const body: Record<string, any> = {};
    if (payload.title || payload.requirementFeature) {
      body.title = payload.requirementFeature || payload.title;
    }
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.type || payload.requirementType) {
      body.requirementType = payload.requirementType || payload.type;
    }
    if (payload.priority) body.priority = payload.priority;
    if (payload.ownerId) body.ownerId = payload.ownerId;
    if (payload.status) body.status = payload.status;
    if (payload.completionPercentage !== undefined) {
      body.completionPercentage = payload.completionPercentage;
    }
    if (payload.approvedBy !== undefined) {
      body.approvedBy = payload.approvedBy && payload.approvedBy !== '-' ? payload.approvedBy.trim() : null;
    }
    if (payload.approvalDate !== undefined) {
      body.approvalDate = payload.approvalDate && payload.approvalDate !== '-' ? formatDateForInput(payload.approvalDate) : null;
    }

    const res = await apiClient.put<any>(API_ENDPOINTS.REQUIREMENTS.BY_ID(id), body);
    return mapBackendRequirementToRecord(res.data);
  },

  /**
   * Delete requirement
   */
  async deleteRequirement(id: string): Promise<void> {
    await apiClient.delete<void>(API_ENDPOINTS.REQUIREMENTS.BY_ID(id));
  },

  /**
   * Update status (e.g. In Progress, Completed, Pending Approval)
   */
  async updateStatus(id: string, status: string): Promise<RequirementRecord> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.REQUIREMENTS.STATUS(id), { status });
    return mapBackendRequirementToRecord(res.data);
  },

  /**
   * Update completion percentage (0 - 100)
   */
  async updateCompletion(id: string, completionPercentage: number): Promise<RequirementRecord> {
    const res = await apiClient.patch<any>(API_ENDPOINTS.REQUIREMENTS.COMPLETION(id), {
      completionPercentage,
    });
    return mapBackendRequirementToRecord(res.data);
  },

  /**
   * Toggle scope freeze (Manager/Admin/CEO)
   */
  async toggleScopeFreeze(id: string, frozen: boolean, reason: string = 'Scope adjustment'): Promise<RequirementRecord> {
    const res = await apiClient.post<any>(API_ENDPOINTS.REQUIREMENTS.SCOPE_FREEZE(id), {
      scopeFreeze: frozen,
      reason,
    });
    return mapBackendRequirementToRecord(res.data);
  },

  /**
   * Approve requirement (sets Completed, assigns authenticated approver & date)
   */
  async approveRequirement(id: string): Promise<RequirementRecord> {
    const res = await apiClient.post<any>(API_ENDPOINTS.REQUIREMENTS.APPROVE(id));
    return mapBackendRequirementToRecord(res.data);
  },

  /**
   * Revoke requirement approval / reopen to In Progress
   */
  async revokeApproval(id: string): Promise<RequirementRecord> {
    const res = await apiClient.post<any>(API_ENDPOINTS.REQUIREMENTS.REVOKE(id));
    return mapBackendRequirementToRecord(res.data);
  },
};

