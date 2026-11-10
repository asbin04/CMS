import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TimesheetsRequirementsPage } from '../features/projects/pages/TimesheetsRequirementsPage';
import { timesheetsApiService } from '../features/timesheets-requirements/services/timesheetsApiService';
import { requirementsApiService } from '../features/timesheets-requirements/services/requirementsApiService';
import { projectLookupService } from '../features/timesheets-requirements/services/projectLookupService';
import { apiClient } from '@/services/api/apiClient';

describe('Timesheets & Requirements End-to-End API Integration & Contract Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. End-to-end Timesheets API Contract: GET, POST, PUT, DELETE, APPROVE, REJECT, OVERRIDE', async () => {
    // Mock backend responses matching Spring Boot TimesheetController
    const mockPagedTimesheets = {
      content: [
        {
          id: 'TS-202610-048',
          timesheetDate: '2026-10-28',
          employeeId: 'EMP-001',
          employeeName: 'Amit Sharma',
          projectId: 'PRJ-001',
          taskId: 'TSK-00126',
          hoursWorked: 8.0,
          billable: 'Yes',
          billableRate: 1500.0,
          billableAmount: 12000.0,
          approvalStatus: 'Approved',
          approvedBy: 'Rohan Verma',
          estimatedLaborCost: 6400.0,
          notes: 'Architecture design',
        },
      ],
      pageNumber: 1,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
      empty: false,
    };

    const mockKpis = {
      totalHours: 1248.0,
      totalHoursTrend: '+12.5% this month',
      billableHours: 1020.0,
      billableHoursTrend: '+8.3% this month',
      billableAmount: 1224000.0,
      billableAmountTrend: '+15.2% this month',
      pendingApprovals: 24,
      pendingApprovalsTrend: 'Needs review',
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockImplementation(async (endpoint: string) => {
      if (endpoint.startsWith('/timesheets/kpis')) {
        return { success: true, message: 'OK', data: mockKpis as any };
      }
      if (endpoint.startsWith('/timesheets')) {
        return { success: true, message: 'OK', data: mockPagedTimesheets as any };
      }
      if (endpoint === '/projects') {
        return { success: true, message: 'OK', data: [{ id: 'PRJ-001', name: 'Enterprise Cloud' }] as any };
      }
      return { success: true, message: 'OK', data: [] as any };
    });

    const postSpy = vi.spyOn(apiClient, 'post').mockImplementation(async (endpoint: string, body: any) => {
      return {
        success: true,
        message: 'Success',
        data: {
          id: 'TS-202610-049',
          timesheetDate: '2026-10-29',
          employeeId: 'EMP-001',
          employeeName: 'Amit Sharma',
          projectId: 'PRJ-001',
          taskId: 'TSK-00126',
          hoursWorked: 8.0,
          billable: 'Yes',
          approvalStatus: endpoint.includes('approve') ? 'Approved' : endpoint.includes('reject') ? 'Rejected' : 'Pending',
          estimatedLaborCost: body?.laborCost ? body.laborCost : 6400.0,
        } as any,
      };
    });

    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({
      success: true,
      message: 'Updated',
      data: { id: 'TS-202610-048', hoursWorked: 9.0 } as any,
    });

    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue({
      success: true,
      message: 'Deleted',
      data: null as any,
    });

    // 1. Test getTimesheets
    const listRes = await timesheetsApiService.getTimesheets({ search: 'Amit', project: 'PRJ-001', page: 1, size: 10 });
    expect(listRes.content.length).toBe(1);
    expect(listRes.content[0].timesheetId).toBe('TS-202610-048');
    expect(listRes.content[0].billableAmount).toBe('₹ 12,000.00');

    // 2. Test getKpis
    const kpiRes = await timesheetsApiService.getKpis();
    expect(kpiRes.totalHours).toBe('1,248.00');
    expect(kpiRes.pendingApprovals).toBe(24);

    // 3. Test createTimesheet
    const created = await timesheetsApiService.createTimesheet({
      projectId: 'PRJ-001',
      taskId: 'TSK-00126',
      employeeId: 'EMP-001',
      timesheetDate: '2026-10-29',
      hoursWorked: 8.0,
      billable: 'Yes',
    });
    expect(postSpy).toHaveBeenCalledWith('/timesheets', expect.objectContaining({ projectId: 'PRJ-001' }));
    expect(created.timesheetId).toBe('TS-202610-049');

    // 4. Test updateTimesheet
    await timesheetsApiService.updateTimesheet('TS-202610-048', { hoursWorked: 9.0 });
    expect(putSpy).toHaveBeenCalledWith('/timesheets/TS-202610-048', expect.objectContaining({ hoursWorked: 9.0 }));

    // 5. Test approveTimesheet
    const approved = await timesheetsApiService.approveTimesheet('TS-202610-048', 'Approved by manager');
    expect(postSpy).toHaveBeenCalledWith('/timesheets/TS-202610-048/approve', { comments: 'Approved by manager' });
    expect(approved.approvalStatus).toBe('Approved');

    // 6. Test rejectTimesheet
    const rejected = await timesheetsApiService.rejectTimesheet('TS-202610-048', 'Incorrect task ID');
    expect(postSpy).toHaveBeenCalledWith('/timesheets/TS-202610-048/reject', { reason: 'Incorrect task ID' });
    expect(rejected.approvalStatus).toBe('Rejected');

    // 7. Test overrideLaborCost
    const overridden = await timesheetsApiService.overrideLaborCost('TS-202610-048', 7500.0, 'Senior adjustment');
    expect(postSpy).toHaveBeenCalledWith('/timesheets/TS-202610-048/override-labor-cost', {
      laborCost: 7500.0,
      overrideReason: 'Senior adjustment',
    });
    expect(overridden.estimatedLaborCost).toBe('₹ 7,500.00');

    // 8. Test deleteTimesheet
    await timesheetsApiService.deleteTimesheet('TS-202610-048');
    expect(deleteSpy).toHaveBeenCalledWith('/timesheets/TS-202610-048');
  });

  it('2. End-to-end Requirements API Contract: GET, POST, PUT, DELETE, STATUS, COMPLETION, SCOPE FREEZE', async () => {
    const mockPagedReqs = {
      content: [
        {
          id: 'REQ-2026-0186',
          projectId: 'PRJ-001',
          clientId: 'CL-001',
          requirementDate: '2026-10-28',
          requirementType: 'Feature',
          title: 'Appointment Booking',
          description: 'Online booking flow',
          priority: 'High',
          ownerId: 'EMP-001',
          status: 'In Progress',
          scopeFreeze: false,
          completionPercentage: 40,
        },
      ],
      pageNumber: 1,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
    };

    const mockKpis = {
      totalRequirements: 186,
      totalRequirementsTrend: '+4 this month',
      inProgress: 78,
      completed: 64,
      pendingApproval: 18,
      scopeFrozen: 32,
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockImplementation(async (endpoint: string) => {
      if (endpoint.startsWith('/requirements/kpis')) {
        return { success: true, message: 'OK', data: mockKpis as any };
      }
      if (endpoint.startsWith('/requirements')) {
        return { success: true, message: 'OK', data: mockPagedReqs as any };
      }
      return { success: true, message: 'OK', data: [] as any };
    });

    const postSpy = vi.spyOn(apiClient, 'post').mockImplementation(async (endpoint: string, body: any) => {
      return {
        success: true,
        message: 'Success',
        data: {
          id: 'REQ-2026-0187',
          projectId: 'PRJ-001',
          title: 'Prescription Upload',
          scopeFreeze: body?.scopeFreeze !== undefined ? body.scopeFreeze : false,
          status: 'Draft',
        } as any,
      };
    });

    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({
      success: true,
      message: 'Updated',
      data: { id: 'REQ-2026-0186', title: 'Updated Feature' } as any,
    });

    const patchSpy = vi.spyOn(apiClient, 'patch').mockImplementation(async (endpoint: string, body: any) => {
      return {
        success: true,
        message: 'Patched',
        data: {
          id: 'REQ-2026-0186',
          status: body?.status || 'In Progress',
          completionPercentage: body?.completionPercentage !== undefined ? body.completionPercentage : 40,
        } as any,
      };
    });

    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue({
      success: true,
      message: 'Deleted',
      data: null as any,
    });

    // 1. Test getRequirements
    const reqList = await requirementsApiService.getRequirements({ project: 'PRJ-001', priority: 'High' });
    expect(reqList.content.length).toBe(1);
    expect(reqList.content[0].requirementId).toBe('REQ-2026-0186');
    expect(reqList.content[0].requirementFeature).toBe('Appointment Booking');

    // 2. Test getKpis
    const kpiRes = await requirementsApiService.getKpis();
    expect(kpiRes.totalRequirements).toBe(186);
    expect(kpiRes.scopeFrozen).toBe(32);

    // 3. Test createRequirement
    const created = await requirementsApiService.createRequirement({
      projectId: 'PRJ-001',
      title: 'Prescription Upload',
      type: 'Feature',
      priority: 'High',
    });
    expect(postSpy).toHaveBeenCalledWith('/requirements', expect.objectContaining({ projectId: 'PRJ-001' }));
    expect(created.requirementId).toBe('REQ-2026-0187');

    // 4. Test updateRequirement
    await requirementsApiService.updateRequirement('REQ-2026-0186', { title: 'Updated Feature' });
    expect(putSpy).toHaveBeenCalledWith('/requirements/REQ-2026-0186', expect.objectContaining({ title: 'Updated Feature' }));

    // 5. Test updateStatus
    const statusUpdated = await requirementsApiService.updateStatus('REQ-2026-0186', 'Completed');
    expect(patchSpy).toHaveBeenCalledWith('/requirements/REQ-2026-0186/status', { status: 'Completed' });
    expect(statusUpdated.status).toBe('Completed');

    // 6. Test updateCompletion
    const compUpdated = await requirementsApiService.updateCompletion('REQ-2026-0186', 85);
    expect(patchSpy).toHaveBeenCalledWith('/requirements/REQ-2026-0186/completion', { completionPercentage: 85 });
    expect(compUpdated.completionPercentage).toBe(85);

    // 7. Test toggleScopeFreeze
    const frozenRes = await requirementsApiService.toggleScopeFreeze('REQ-2026-0186', true, 'Milestone baseline lock');
    expect(postSpy).toHaveBeenCalledWith('/requirements/REQ-2026-0186/scope-freeze', {
      scopeFreeze: true,
      reason: 'Milestone baseline lock',
    });
    expect(frozenRes.scopeFreeze).toBe('Yes');

    // 8. Test deleteRequirement
    await requirementsApiService.deleteRequirement('REQ-2026-0186');
    expect(deleteSpy).toHaveBeenCalledWith('/requirements/REQ-2026-0186');
  });

  it('3. Project & Task Master Lookups: /projects and /projects/{id}/tasks', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation(async (endpoint: string) => {
      if (endpoint === '/projects') {
        return {
          success: true,
          message: 'OK',
          data: [
            { id: 'PRJ-001', name: 'Enterprise Cloud Portal', projectCode: 'PRJ-001' },
            { id: 'PRJ-002', name: 'Core ERP Modernization', projectCode: 'PRJ-002' },
          ] as any,
        };
      }
      if (endpoint === '/projects/PRJ-001/tasks') {
        return {
          success: true,
          message: 'OK',
          data: [
            { id: 'TSK-00126', name: 'Database Migration', projectId: 'PRJ-001' },
          ] as any,
        };
      }
      return { success: true, message: 'OK', data: [] as any };
    });

    const projects = await projectLookupService.getProjects();
    expect(projects.length).toBe(2);
    expect(projects[0].id).toBe('PRJ-001');

    const tasks = await projectLookupService.getTasksForProject('PRJ-001');
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe('TSK-00126');
  });
});

