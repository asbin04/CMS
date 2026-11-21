import { describe, it, expect, vi, beforeEach } from 'vitest';
import { employeeService } from '@/services/employeeService';
import { apiClient } from '@/services/api/apiClient';

describe('employeeService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getEmployees calls apiClient.get with proper query filters', async () => {
    const mockData = [{ id: 1, employeeId: 'EMP-001', fullName: 'Amit Sharma', department: 'Engineering' }];
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockData as any,
      timestamp: '2026-10-29T10:00:00Z',
    });

    const result = await employeeService.getEmployees({
      department: 'Engineering',
      status: 'Active',
      search: 'Amit',
    });

    expect(getSpy).toHaveBeenCalledWith(
      '/employees',
      expect.objectContaining({
        department: 'Engineering',
        status: 'Active',
        search: 'Amit',
      })
    );
    expect(result).toEqual(mockData);
  });

  it('getSummary returns employee metrics', async () => {
    const mockSummary = {
      totalEmployees: 248,
      totalEmployeesTrend: '↑ 12%',
      activeEmployees: 212,
      activeEmployeesTrend: '↑ 8%',
      onNoticeEmployees: 5,
      onNoticeEmployeesTrend: '↓ 25%',
      totalMonthlyCtc: 1845000,
      totalMonthlyCtcFormatted: '₹ 18,45,000',
      totalMonthlyCtcTrend: '↑ 8%',
    };

    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockSummary as any,
      timestamp: '2026-10-29T10:00:00Z',
    });

    const result = await employeeService.getSummary();
    expect(result).toEqual(mockSummary);
  });

  it('createEmployee calls apiClient.post with payload', async () => {
    const payload = {
      fullName: 'Ramesh Kumar',
      workEmail: 'ramesh.k@company.com',
      phone: '+91 98765 43210',
      department: 'Engineering',
      designation: 'Software Engineer',
      joiningDate: '15 Mar 2025',
      monthlyCtc: 50000,
    };

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      message: 'Created',
      data: { id: 249, employeeId: 'EMP-249', ...payload } as any,
      timestamp: '2026-10-29T10:00:00Z',
    });

    const result = await employeeService.createEmployee(payload as any);
    expect(postSpy).toHaveBeenCalledWith('/employees', payload);
    expect(result.id).toBe(249);
  });

  it('bulkCreateEmployees calls apiClient.post to /employees/bulk with array', async () => {
    const payloads = [
      {
        fullName: 'Employee One',
        workEmail: 'emp1@company.com',
        phone: '+91 91111 22222',
        department: 'Engineering',
        designation: 'Developer',
        joiningDate: '01 Jan 2026',
        monthlyCtc: 40000,
      },
      {
        fullName: 'Employee Two',
        workEmail: 'emp2@company.com',
        phone: '+91 93333 44444',
        department: 'Design',
        designation: 'Designer',
        joiningDate: '01 Feb 2026',
        monthlyCtc: 45000,
      },
    ];

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      message: 'Imported',
      data: [{ id: 1 }, { id: 2 }] as any,
      timestamp: '2026-11-16T10:00:00Z',
    });

    const result = await employeeService.bulkCreateEmployees(payloads as any);
    expect(postSpy).toHaveBeenCalledWith('/employees/bulk', payloads);
    expect(result).toHaveLength(2);
  });

  it('deleteEmployee calls apiClient.delete with id', async () => {
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue({
      success: true,
      message: 'Deleted',
      data: null,
      timestamp: '2026-10-29T10:00:00Z',
    });

    await employeeService.deleteEmployee(1);
    expect(deleteSpy).toHaveBeenCalledWith('/employees/1');
  });
});

