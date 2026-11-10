import { describe, it, expect, vi, beforeEach } from 'vitest';
import { timesheetsApiService, mapBackendTimesheetToRecord, mapBackendTimesheetKpis } from '../features/timesheets-requirements/services/timesheetsApiService';
import { apiClient } from '@/services/api/apiClient';

describe('timesheetsApiService unit tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. mapBackendTimesheetToRecord correctly maps and formats fields', () => {
    const raw = {
      id: 'TS-202610-048',
      timesheetDate: '2026-10-28',
      employeeId: 'EMP-001',
      employeeName: 'Amit Sharma',
      projectId: 'PRJ-001',
      taskId: 'TSK-00126',
      hoursWorked: 8.0,
      billableStatus: 'BILLABLE',
      billableRate: 1500,
      billableAmount: 12000,
      approvalStatus: 'Approved',
      approvedBy: 'Rohan Verma',
      estimatedLaborCost: 6400,
      notes: 'Design updates',
    };

    const record = mapBackendTimesheetToRecord(raw);
    expect(record.timesheetId).toBe('TS-202610-048');
    expect(record.date).toBe('28 Oct 2026');
    expect(record.employeeName).toBe('Amit Sharma');
    expect(record.hours).toBe(8.0);
    expect(record.billable).toBe('Yes');
    expect(record.billableRate).toBe('₹ 1,500.00');
    expect(record.billableAmount).toBe('₹ 12,000.00');
    expect(record.approvalStatus).toBe('Approved');
    expect(record.estimatedLaborCost).toBe('₹ 6,400.00');
  });

  it('2. mapBackendTimesheetKpis formats summary numbers and trends', () => {
    const raw = {
      totalHours: 1248.0,
      totalHoursTrend: '↑ 12% vs last month',
      billableHours: 1020.0,
      billableHoursTrend: '↑ 15% vs last month',
      billableAmount: 1224000.0,
      billableAmountTrend: '↑ 18% vs last month',
      pendingApprovals: 24,
      pendingApprovalsTrend: '↓ 33% vs last month',
    };

    const kpis = mapBackendTimesheetKpis(raw);
    expect(kpis.totalHours).toBe('1,248.00');
    expect(kpis.billableHours).toBe('1,020.00');
    expect(kpis.billableAmount).toBe('₹ 12,24,000');
    expect(kpis.pendingApprovals).toBe(24);
  });

  it('3. getTimesheets sends correct query parameters to /timesheets', async () => {
    const mockPage = {
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
          approvalStatus: 'Approved',
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

    const res = await timesheetsApiService.getTimesheets({
      search: 'Amit',
      project: 'PRJ-001',
      page: 1,
      size: 10,
    });

    expect(getSpy).toHaveBeenCalledWith('/timesheets', {
      search: 'Amit',
      project: 'PRJ-001',
      page: 1,
      size: 10,
    });
    expect(res.content.length).toBe(1);
    expect(res.content[0].timesheetId).toBe('TS-202610-048');
  });

  it('4. createTimesheet posts payload to /timesheets', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      message: 'Created',
      data: {
        id: 'TS-202610-049',
        projectId: 'PRJ-001',
        taskId: 'TSK-00126',
        hoursWorked: 4.5,
        billable: 'Yes',
      } as any,
    });

    const res = await timesheetsApiService.createTimesheet({
      projectId: 'PRJ-001',
      taskId: 'TSK-00126',
      employeeId: 'EMP-001',
      timesheetDate: '2026-10-29',
      hoursWorked: 4.5,
      billable: 'Yes',
      hourlyRate: 1500,
      taskDescription: 'Testing endpoint',
    });

    expect(postSpy).toHaveBeenCalledWith('/timesheets', expect.objectContaining({
      projectId: 'PRJ-001',
      taskId: 'TSK-00126',
      hoursWorked: 4.5,
      billable: 'Yes',
    }));
    expect(res.timesheetId).toBe('TS-202610-049');
  });

  it('5. approveTimesheet, rejectTimesheet, and submitTimesheet call expected lifecycle endpoints', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      message: 'OK',
      data: { id: 'TS-202610-048', approvalStatus: 'Approved' } as any,
    });

    await timesheetsApiService.approveTimesheet('TS-202610-048', 'Looks good');
    expect(postSpy).toHaveBeenCalledWith('/timesheets/TS-202610-048/approve', { comments: 'Looks good' });

    await timesheetsApiService.rejectTimesheet('TS-202610-048', 'Missing details');
    expect(postSpy).toHaveBeenCalledWith('/timesheets/TS-202610-048/reject', { reason: 'Missing details' });

    await timesheetsApiService.submitTimesheet('TS-202610-048');
    expect(postSpy).toHaveBeenCalledWith('/timesheets/TS-202610-048/submit');
  });

  it('6. overrideLaborCost calls /timesheets/{id}/override-labor-cost', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      message: 'Overridden',
      data: { id: 'TS-202610-048', estimatedLaborCost: 7500 } as any,
    });

    const res = await timesheetsApiService.overrideLaborCost('TS-202610-048', 7500, 'Senior developer rate adjustment');
    expect(postSpy).toHaveBeenCalledWith('/timesheets/TS-202610-048/override-labor-cost', {
      laborCost: 7500,
      overrideReason: 'Senior developer rate adjustment',
    });
    expect(res.estimatedLaborCost).toBe('₹ 7,500.00');
  });
});

