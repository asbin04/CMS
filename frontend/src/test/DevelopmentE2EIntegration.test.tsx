import { describe, it, expect, vi, beforeEach } from 'vitest';
import { developmentApiService } from '../features/development/services/developmentApiService';
import { apiClient } from '@/services/api/apiClient';

describe('Development Module End-to-End API Integration & Contract Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. GET /developments calls backend with params and maps PageResponse correctly', async () => {
    const mockBackendResponse = {
      content: [
        {
          developmentId: 'DEV-2026-0001',
          projectId: 'PRJ-001',
          requirementId: 'REQ-2026-0184',
          taskId: 'TSK-00128',
          developerId: 'EMP-001',
          developerName: 'Amit Sharma',
          repositoryUrl: 'https://github.com/company/repo',
          branch: 'feature/auth',
          environment: 'Dev',
          buildVersion: 'v1.0.0',
          codeReviewStatus: 'In Review',
          qaHandoffDate: '2026-10-28',
          releaseId: 'REL-014',
          status: 'In Progress',
          technicalNotes: 'API integrated',
          documentationLink: 'https://docs.company.com',
          createdBy: 'admin',
          createdAt: '2026-11-06T10:00:00Z',
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

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockBackendResponse as any,
    });

    const res = await developmentApiService.getDevelopments({
      search: 'Amit',
      project: 'PRJ-001',
      environment: 'Dev',
      status: 'In Progress',
      reviewStatus: 'In Review',
      sort: 'createdAt,desc',
      page: 1,
      size: 10,
    });

    expect(getSpy).toHaveBeenCalledWith(
      '/developments',
      expect.objectContaining({
        search: 'Amit',
        project: 'PRJ-001',
        environment: 'Dev',
        status: 'In Progress',
        reviewStatus: 'In Review',
        sort: 'createdAt,desc',
        page: 1,
        size: 10,
      })
    );

    expect(res.totalElements).toBe(1);
    expect(res.content.length).toBe(1);
    expect(res.content[0].developmentId).toBe('DEV-2026-0001');
    expect(res.content[0].developer).toBe('Amit Sharma');
    expect(res.content[0].qaHandoffDate).toBe('28 Oct 2026');
  });

  it('2. GET /developments/kpis maps dynamic metrics and comparison trends', async () => {
    const mockKpis = {
      totalDevelopments: 432,
      inDevelopment: 128,
      inCodeReview: 76,
      qaHandover: 54,
      released: 148,
      totalDevelopmentsTrend: '+16% vs last month',
      inDevelopmentTrend: '+12% vs last month',
      inCodeReviewTrend: '+20% vs last month',
      qaHandoverTrend: '+18% vs last month',
      releasedTrend: '+14% vs last month',
    };

    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockKpis as any,
    });

    const kpis = await developmentApiService.getKpis();
    expect(kpis.totalDevelopments).toBe(432);
    expect(kpis.inDevelopment).toBe(128);
    expect(kpis.inCodeReview).toBe(76);
    expect(kpis.qaHandover).toBe(54);
    expect(kpis.released).toBe(148);
    expect(kpis.totalTrend).toBe('+16% vs last month');
  });

  it('3. GET /developments/next-id returns atomic sequence preview', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      message: 'OK',
      data: { nextId: 'DEV-2026-0007' } as any,
    });

    const nextId = await developmentApiService.getNextDevelopmentId();
    expect(nextId).toBe('DEV-2026-0007');
  });

  it('4. POST /developments creates new record with formatted payload', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      success: true,
      message: 'Development created successfully',
      data: {
        developmentId: 'DEV-2026-0008',
        projectId: 'PRJ-001',
        requirementId: 'REQ-2026-0184',
        taskId: 'TSK-00128',
        developerName: 'Sneha Nair',
        repositoryUrl: 'https://github.com/company/repo',
        branch: 'feature/dashboard',
        environment: 'QA',
        buildVersion: 'v1.1.0',
        codeReviewStatus: 'In Review',
        qaHandoffDate: '2026-10-29',
        releaseId: '-',
        status: 'In Progress',
        technicalNotes: 'Notes',
        documentationLink: 'https://docs.company.com',
      } as any,
    });

    const created = await developmentApiService.createDevelopment({
      projectId: 'PRJ-001',
      requirementId: 'REQ-2026-0184',
      taskId: 'TSK-00128',
      developerName: 'Sneha Nair',
      repositoryUrl: 'https://github.com/company/repo',
      branch: 'feature/dashboard',
      environment: 'QA',
      buildVersion: 'v1.1.0',
      qaHandoffDate: '29 Oct 2026',
    });

    expect(postSpy).toHaveBeenCalledWith(
      '/developments',
      expect.objectContaining({
        projectId: 'PRJ-001',
        requirementId: 'REQ-2026-0184',
        taskId: 'TSK-00128',
        developerName: 'Sneha Nair',
        qaHandoffDate: '2026-10-29',
      })
    );
    expect(created.developmentId).toBe('DEV-2026-0008');
  });

  it('5. PATCH /developments/{id}/status and PATCH /developments/{id}/code-review-status update statuses', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      success: true,
      message: 'Status updated',
      data: {
        developmentId: 'DEV-2026-0001',
        status: 'Released',
        codeReviewStatus: 'Approved',
      } as any,
    });

    const statusRes = await developmentApiService.updateStatus('DEV-2026-0001', 'Released');
    expect(patchSpy).toHaveBeenCalledWith('/developments/DEV-2026-0001/status', { status: 'Released' });
    expect(statusRes.status).toBe('Released');

    const reviewRes = await developmentApiService.updateCodeReviewStatus('DEV-2026-0001', 'Approved');
    expect(patchSpy).toHaveBeenCalledWith('/developments/DEV-2026-0001/code-review-status', { codeReviewStatus: 'Approved' });
    expect(reviewRes.codeReviewStatus).toBe('Approved');
  });

  it('6. DELETE /developments/{id} removes record', async () => {
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue({
      success: true,
      message: 'Deleted',
      data: null as any,
    });

    await developmentApiService.deleteDevelopment('DEV-2026-0001');
    expect(deleteSpy).toHaveBeenCalledWith('/developments/DEV-2026-0001');
  });
});

