import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  requirementsApiService,
  mapBackendRequirementToRecord,
  mapBackendRequirementKpis,
} from '../features/timesheets-requirements/services/requirementsApiService';
import { apiClient } from '@/services/api/apiClient';

describe('requirementsApiService unit tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. mapBackendRequirementToRecord maps and formats requirement fields', () => {
    const raw = {
      id: 'REQ-2026-0186',
      projectId: 'PRJ-001',
      clientId: 'CL-001',
      requirementDate: '2026-10-28',
      requirementType: 'Feature',
      title: 'Appointment Booking',
      description: 'Allows patients to book appointments online',
      priority: 'High',
      ownerId: 'EMP-001',
      status: 'In Progress',
      scopeFreeze: false,
      approvedBy: '-',
      completionPercentage: 40,
    };

    const record = mapBackendRequirementToRecord(raw);
    expect(record.requirementId).toBe('REQ-2026-0186');
    expect(record.requirementFeature).toBe('Appointment Booking');
    expect(record.type).toBe('Feature');
    expect(record.priority).toBe('High');
    expect(record.status).toBe('In Progress');
    expect(record.scopeFreeze).toBe('No');
    expect(record.completionPercentage).toBe(40);
    expect((record as any).date).toBeUndefined(); // date is mapped to requirementDate
    expect(record.requirementDate).toBe('28 Oct 2026');
  });

  it('2. mapBackendRequirementKpis aggregates KPI counters', () => {
    const raw = {
      totalRequirements: 186,
      totalRequirementsTrend: '↑ 14% vs last month',
      inProgress: 78,
      completed: 64,
      pendingApproval: 18,
      scopeFrozen: 32,
    };

    const kpis = mapBackendRequirementKpis(raw);
    expect(kpis.totalRequirements).toBe(186);
    expect(kpis.inProgress).toBe(78);
    expect(kpis.completed).toBe(64);
    expect(kpis.pendingApproval).toBe(18);
    expect(kpis.scopeFrozen).toBe(32);
  });

  it('3. getRequirements calls /requirements with query parameters', async () => {
    const mockPage = {
      content: [
        {
          id: 'REQ-2026-0186',
          title: 'Appointment Booking',
          priority: 'High',
        },
      ],
      pageNumber: 1,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockPage as any,
    });

    const res = await requirementsApiService.getRequirements({
      search: 'Appointment',
      project: 'PRJ-001',
      priority: 'High',
      page: 1,
      size: 10,
    });

    expect(getSpy).toHaveBeenCalledWith('/requirements', {
      search: 'Appointment',
      project: 'PRJ-001',
      priority: 'High',
      page: 1,
      size: 10,
    });
    expect(res.content.length).toBe(1);
    expect(res.content[0].requirementId).toBe('REQ-2026-0186');
  });

  it('4. updateStatus calls PATCH /requirements/{id}/status', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      success: true,
      message: 'Status updated',
      data: { id: 'REQ-2026-0186', status: 'Completed', completionPercentage: 100 } as any,
    });

    const res = await requirementsApiService.updateStatus('REQ-2026-0186', 'Completed');
    expect(patchSpy).toHaveBeenCalledWith('/requirements/REQ-2026-0186/status', { status: 'Completed' });
    expect(res.status).toBe('Completed');
  });

  it('5. updateCompletion calls PATCH /requirements/{id}/completion', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      success: true,
      message: 'Completion updated',
      data: { id: 'REQ-2026-0186', completionPercentage: 75 } as any,
    });

    const res = await requirementsApiService.updateCompletion('REQ-2026-0186', 75);
    expect(patchSpy).toHaveBeenCalledWith('/requirements/REQ-2026-0186/completion', { completionPercentage: 75 });
    expect(res.completionPercentage).toBe(75);
  });

  it('6. toggleScopeFreeze calls POST /requirements/{id}/scope-freeze', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      message: 'Scope frozen',
      data: { id: 'REQ-2026-0186', scopeFreeze: true } as any,
    });

    const res = await requirementsApiService.toggleScopeFreeze('REQ-2026-0186', true, 'Client milestone lock');
    expect(postSpy).toHaveBeenCalledWith('/requirements/REQ-2026-0186/scope-freeze', {
      scopeFreeze: true,
      reason: 'Client milestone lock',
    });
    expect(res.scopeFreeze).toBe('Yes');
  });

  it('7. createRequirement sends approvedBy and approvalDate in POST body', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      message: 'Created',
      data: {
        id: 'REQ-2026-0025',
        projectId: 'PRJ-005',
        approvedBy: 'EMP-007',
        approvalDate: '2026-10-28',
      } as any,
    });

    const res = await requirementsApiService.createRequirement({
      projectId: 'PRJ-005',
      clientId: 'CL-004',
      requirementFeature: 'Appointment Rescheduling',
      requirementDate: '2026-10-29',
      approvedBy: 'EMP-007',
      approvalDate: '2026-10-28',
    });

    expect(postSpy).toHaveBeenCalledWith(
      '/requirements',
      expect.objectContaining({
        projectId: 'PRJ-005',
        approvedBy: 'EMP-007',
        approvalDate: '2026-10-28',
      })
    );
    expect(res.approvedBy).toBe('EMP-007');
    expect(res.approvalDate).toBe('28 Oct 2026');
  });

  it('8. mapBackendRequirementToRecord maps empty approvedBy and approvalDate to "-"', () => {
    const raw = {
      id: 'REQ-2026-0026',
      projectId: 'PRJ-005',
      approvedBy: null,
      approvalDate: null,
    };

    const record = mapBackendRequirementToRecord(raw);
    expect(record.approvedBy).toBe('-');
    expect(record.approvalDate).toBe('-');
  });

  it('9. updateRequirement sends approvedBy and approvalDate in PUT body', async () => {
    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({
      success: true,
      message: 'Updated',
      data: {
        id: 'REQ-2026-0025',
        approvedBy: 'EMP-009',
        approvalDate: '2026-11-01',
      } as any,
    });

    const res = await requirementsApiService.updateRequirement('REQ-2026-0025', {
      approvedBy: 'EMP-009',
      approvalDate: '2026-11-01',
    });

    expect(putSpy).toHaveBeenCalledWith(
      '/requirements/REQ-2026-0025',
      expect.objectContaining({
        approvedBy: 'EMP-009',
        approvalDate: '2026-11-01',
      })
    );
    expect(res.approvedBy).toBe('EMP-009');
    expect(res.approvalDate).toBe('1 Nov 2026');
  });

  it('10. approveRequirement calls POST /requirements/{id}/approve and maps to Completed', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      message: 'Approved',
      data: {
        id: 'REQ-2026-0025',
        status: 'Completed',
        completionPercentage: 100,
        approvedBy: 'Akshit Ujjain',
        approvalDate: '2026-11-05',
      } as any,
    });

    const res = await requirementsApiService.approveRequirement('REQ-2026-0025');
    expect(postSpy).toHaveBeenCalledWith('/requirements/REQ-2026-0025/approve');
    expect(res.status).toBe('Completed');
    expect(res.completionPercentage).toBe(100);
    expect(res.approvedBy).toBe('Akshit Ujjain');
    expect(res.approvalDate).toBe('5 Nov 2026');
  });

  it('11. revokeApproval calls POST /requirements/{id}/revoke and resets metadata', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      message: 'Revoked',
      data: {
        id: 'REQ-2026-0025',
        status: 'In Progress',
        approvedBy: null,
        approvalDate: null,
      } as any,
    });

    const res = await requirementsApiService.revokeApproval('REQ-2026-0025');
    expect(postSpy).toHaveBeenCalledWith('/requirements/REQ-2026-0025/revoke');
    expect(res.status).toBe('In Progress');
    expect(res.approvedBy).toBe('-');
    expect(res.approvalDate).toBe('-');
  });
});
