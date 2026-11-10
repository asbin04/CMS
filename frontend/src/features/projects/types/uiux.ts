export type UiuxTool = 'Figma' | 'Adobe XD';
export type UiuxApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type UiuxStatus = 'In Progress' | 'Completed' | 'On Hold';
export type UiuxDesignType = 'UI Design' | 'UI/UX';

export interface UiuxDesignItem {
  id: string; // e.g. DES-2026-0186
  projectId: string; // e.g. PRJ-001
  requirementId: string; // e.g. REQ-2026-0184
  screenFeature: string; // e.g. Login Screen
  designType: UiuxDesignType | string;
  version: string; // e.g. v1.2
  designer: string; // e.g. Amit Sharma
  designerInitials: string; // e.g. AS
  tool: UiuxTool | string; // e.g. Figma | Adobe XD
  prototypeUrl?: string;
  clientFeedback?: string; // e.g. Looks good, update spacing
  feedbackDate?: string; // e.g. 2026-10-28 or 28 Oct 2026
  approvalStatus: UiuxApprovalStatus | string;
  approvedBy?: string; // e.g. Rohan Verma or -
  approvalDate?: string; // e.g. 2026-10-27 or 27 Oct 2026
  changeRequest?: string; // e.g. CR-014 or -
  status: UiuxStatus | string; // e.g. In Progress, Completed
  notes?: string;
}

export interface UiuxKpis {
  totalDesigns: number;
  totalDesignsTrend: string;
  inProgress: number;
  inProgressTrend: string;
  approved: number;
  approvedTrend: string;
  changeRequests: number;
  changeRequestsTrend: string;
  pendingApproval: number;
  pendingApprovalTrend: string;
}

export interface UiuxFilterOptions {
  projects: string[];
  designTypes: string[];
  approvalStatuses: string[];
  statuses: string[];
  designers: string[];
}

export interface CreateUiuxPayload {
  id?: string;
  projectId: string;
  requirementId: string;
  screenFeature: string;
  designType: string;
  version?: string;
  designer: string;
  designerInitials?: string;
  tool?: string;
  prototypeUrl?: string;
  clientFeedback?: string;
  feedbackDate?: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvalDate?: string;
  changeRequest?: string;
  status?: string;
  notes?: string;
}

export interface UpdateUiuxPayload {
  projectId?: string;
  requirementId?: string;
  screenFeature?: string;
  designType?: string;
  version?: string;
  designer?: string;
  designerInitials?: string;
  tool?: string;
  prototypeUrl?: string;
  clientFeedback?: string;
  feedbackDate?: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvalDate?: string;
  changeRequest?: string;
  status?: string;
  notes?: string;
}

