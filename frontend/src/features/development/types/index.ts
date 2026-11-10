export type DevelopmentEnvironment = 'Dev' | 'QA' | 'Staging' | 'Prod';

export type CodeReviewStatus = 'Approved' | 'In Review' | 'Changes Requested';

export type DevelopmentStatus = 'In Progress' | 'QA' | 'Released';

export interface DevelopmentRecord {
  id?: string;
  developmentId: string;
  projectId: string;
  requirementId: string;
  taskId: string;
  developer: string;
  developerAvatar?: string;
  repositoryUrl: string;
  branch: string;
  environment: DevelopmentEnvironment;
  buildVersion: string;
  codeReviewStatus: CodeReviewStatus;
  qaHandoffDate: string;
  releaseId: string;
  status: DevelopmentStatus;
  technicalNotes: string;
  documentationLink: string;
}

export interface DevelopmentKpis {
  totalDevelopments: number;
  totalTrend: string;
  inDevelopment: number;
  inDevTrend: string;
  inCodeReview: number;
  inReviewTrend: string;
  qaHandover: number;
  qaTrend: string;
  released: number;
  releasedTrend: string;
}

export interface DevelopmentFilterState {
  search: string;
  project: string;
  environment: string;
  status: string;
  reviewStatus: string;
}

export interface DevelopmentFormData {
  developmentId?: string;
  projectId: string;
  requirementId: string;
  taskId: string;
  developer: string;
  developerId?: string;
  repositoryUrl: string;
  branch: string;
  environment: DevelopmentEnvironment;
  buildVersion: string;
  codeReviewStatus: CodeReviewStatus;
  qaHandoffDate: string;
  releaseId?: string;
  status: DevelopmentStatus;
  technicalNotes: string;
  documentationLink?: string;
}

export interface DevelopmentQueryParams {
  search?: string;
  project?: string;
  environment?: string;
  status?: string;
  reviewStatus?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface CreateDevelopmentPayload {
  projectId: string;
  requirementId: string;
  taskId: string;
  developerId?: string;
  developerName: string;
  repositoryUrl: string;
  branch: string;
  environment: DevelopmentEnvironment;
  buildVersion: string;
  codeReviewStatus?: CodeReviewStatus;
  qaHandoffDate?: string;
  releaseId?: string;
  status?: DevelopmentStatus;
  technicalNotes?: string;
  documentationLink?: string;
}

export interface UpdateDevelopmentPayload {
  projectId?: string;
  requirementId?: string;
  taskId?: string;
  developerId?: string;
  developerName?: string;
  repositoryUrl?: string;
  branch?: string;
  environment?: DevelopmentEnvironment;
  buildVersion?: string;
  codeReviewStatus?: CodeReviewStatus;
  qaHandoffDate?: string;
  releaseId?: string;
  status?: DevelopmentStatus;
  technicalNotes?: string;
  documentationLink?: string;
}
