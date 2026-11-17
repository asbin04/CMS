import { apiClient } from './api/apiClient';
import { API_ENDPOINTS } from './api/apiEndpoints';
import {
  EmployeeData,
  EmployeeSummaryData,
  CreateEmployeePayload,
} from '@/types/employee';

export interface EmployeeFilters {
  department?: string;
  designation?: string;
  employmentType?: string;
  status?: string;
  location?: string;
  reportingManager?: string;
  search?: string;
}

export const employeeService = {
  getEmployees: async (filters?: EmployeeFilters): Promise<EmployeeData[]> => {
    const params: Record<string, string | number | undefined> = {};
    if (filters) {
      if (filters.department && filters.department !== 'All') params.department = filters.department;
      if (filters.designation && filters.designation !== 'All') params.designation = filters.designation;
      if (filters.employmentType && filters.employmentType !== 'All') params.employmentType = filters.employmentType;
      if (filters.status && filters.status !== 'All') params.status = filters.status;
      if (filters.location && filters.location !== 'All') params.location = filters.location;
      if (filters.reportingManager && filters.reportingManager !== 'All') params.reportingManager = filters.reportingManager;
      if (filters.search && filters.search.trim()) params.search = filters.search.trim();
    }
    const res = await apiClient.get<EmployeeData[]>(
      API_ENDPOINTS.EMPLOYEES.BASE,
      params
    );
    return res.data;
  },

  getSummary: async (): Promise<EmployeeSummaryData> => {
    const res = await apiClient.get<EmployeeSummaryData>(
      API_ENDPOINTS.EMPLOYEES.SUMMARY
    );
    return res.data;
  },

  getById: async (id: string | number): Promise<EmployeeData> => {
    const res = await apiClient.get<EmployeeData>(
      API_ENDPOINTS.EMPLOYEES.BY_ID(id)
    );
    return res.data;
  },

  createEmployee: async (
    payload: CreateEmployeePayload
  ): Promise<EmployeeData> => {
    const res = await apiClient.post<EmployeeData>(
      API_ENDPOINTS.EMPLOYEES.BASE,
      payload
    );
    return res.data;
  },

  bulkCreateEmployees: async (
    payloads: CreateEmployeePayload[]
  ): Promise<EmployeeData[]> => {
    const res = await apiClient.post<EmployeeData[]>(
      `${API_ENDPOINTS.EMPLOYEES.BASE}/bulk`,
      payloads
    );
    return res.data;
  },

  updateEmployee: async (
    id: string | number,
    payload: Partial<CreateEmployeePayload>
  ): Promise<EmployeeData> => {
    const res = await apiClient.put<EmployeeData>(
      API_ENDPOINTS.EMPLOYEES.BY_ID(id),
      payload
    );
    return res.data;
  },

  deleteEmployee: async (id: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.EMPLOYEES.BY_ID(id));
  },
};

