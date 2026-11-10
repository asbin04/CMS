import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';
import { ProjectOption, TaskOption, EmployeeOption, ClientOption } from '../types';
import { MASTER_PROJECTS, MASTER_TASKS, MASTER_EMPLOYEES, MASTER_CLIENTS } from '../mockData';

export const projectLookupService = {
  /**
   * Fetch all projects from backend, with master fallback
   */
  async getProjects(): Promise<ProjectOption[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.PROJECTS.BASE);
      const rawList = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res) ? res : (Array.isArray((res as any)?.data?.data) ? (res as any).data.data : null));
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((p: any) => ({
          id: p.id || p.projectId || p.projectCode || '',
          name: p.name || p.projectName || p.id || '',
          projectCode: p.projectCode || p.projectId || p.id,
          projectName: p.projectName || p.name,
          description: p.description,
          clientId: p.clientId || p.client_id,
        }));
      }
    } catch {
      // Fallback to master data if backend lookup unavailable
    }
    return MASTER_PROJECTS;
  },

  /**
   * Fetch tasks for a given project from backend, with master fallback
   */
  async getTasksForProject(projectId: string): Promise<TaskOption[]> {
    try {
      const endpoint = typeof (API_ENDPOINTS.PROJECTS as any).TASKS_BY_PROJECT === 'function'
        ? (API_ENDPOINTS.PROJECTS as any).TASKS_BY_PROJECT(projectId)
        : `/projects/${encodeURIComponent(projectId)}/tasks`;
      const res = await apiClient.get<any>(endpoint);
      const rawList = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res) ? res : (Array.isArray((res as any)?.data?.data) ? (res as any).data.data : null));
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((t: any) => ({
          id: t.id || t.taskId || t.taskCode || '',
          name: t.name || t.taskName || t.id || '',
          taskCode: t.taskCode || t.id,
          taskName: t.taskName || t.name,
          projectId: t.projectId || projectId,
        }));
      }
    } catch {
      // Fallback
    }
    return MASTER_TASKS;
  },

  /**
   * Fetch all employees, with master fallback
   */
  async getEmployees(): Promise<EmployeeOption[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.EMPLOYEES.BASE);
      const rawList = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res) ? res : (Array.isArray((res as any)?.data?.data) ? (res as any).data.data : null));
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((e: any) => ({
          id: e.employeeId || e.id || '',
          name: e.name || e.fullName || `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.id || '',
        }));
      }
    } catch {
      // Fallback
    }
    return MASTER_EMPLOYEES;
  },

  /**
   * Fetch all clients, with master fallback
   */
  async getClients(): Promise<ClientOption[]> {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.CLIENTS_RESOURCE.BASE);
      const rawList = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res) ? res : (Array.isArray((res as any)?.data?.data) ? (res as any).data.data : null));
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((c: any) => ({
          id: c.id || c.clientId || c.clientCode || '',
          name: c.name || c.clientName || c.companyName || c.id || '',
        }));
      }
    } catch {
      // Fallback
    }
    return MASTER_CLIENTS;
  },
};

