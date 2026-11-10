import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectLookupService } from '../features/timesheets-requirements/services/projectLookupService';
import { apiClient } from '@/services/api/apiClient';
import { MASTER_PROJECTS, MASTER_TASKS } from '../features/timesheets-requirements/mockData';

describe('projectLookupService unit tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. getProjects fetches from /projects and maps option format', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      message: 'OK',
      data: [
        { id: 'PRJ-001', name: 'Enterprise Cloud Portal', projectCode: 'PRJ-001' },
        { id: 'PRJ-002', name: 'Core ERP Modernization', projectCode: 'PRJ-002' },
      ] as any,
    });

    const projects = await projectLookupService.getProjects();
    expect(projects.length).toBe(2);
    expect(projects[0].id).toBe('PRJ-001');
    expect(projects[0].name).toBe('Enterprise Cloud Portal');
  });

  it('2. getProjects falls back gracefully to MASTER_PROJECTS if endpoint fails', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('Network error'));

    const projects = await projectLookupService.getProjects();
    expect(projects).toEqual(MASTER_PROJECTS);
  });

  it('3. getTasksForProject fetches tasks from /projects/{id}/tasks', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      message: 'OK',
      data: [
        { id: 'TSK-00126', name: 'Database Architecture', projectId: 'PRJ-001' },
      ] as any,
    });

    const tasks = await projectLookupService.getTasksForProject('PRJ-001');
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe('TSK-00126');
    expect(tasks[0].name).toBe('Database Architecture');
  });

  it('4. getTasksForProject falls back gracefully to MASTER_TASKS if endpoint fails', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(new Error('500 Server error'));

    const tasks = await projectLookupService.getTasksForProject('PRJ-001');
    expect(tasks).toEqual(MASTER_TASKS);
  });
});

