export interface DeploymentItem {
  id: string; // e.g. DEP-2026-0186
  projectId: string; // e.g. PRJ-001
  releaseVersion: string; // e.g. v2.4.0
  deploymentDate: string; // e.g. 2026-10-28
  environment: string; // Production | Staging | UAT | QA
  deploymentOwner: string; // e.g. Amit Sharma
  preDeploymentChecklist: string; // Completed | Pending
  backupCompleted: string; // Yes | No
  rollbackPlan: string; // Available | Not Available
  smokeTest: string; // Passed | Failed
  status: string; // Successful | Failed | In-Progress | Live
  clientSignOff: string; // Signed-Off | Pending
  goLiveDate: string; // e.g. 2026-10-28
  handoverStatus: string; // Handover Completed | Pending Handover
  releaseNotes: string;
}

export interface DeploymentKpis {
  totalDeployments: number;
  totalDeploymentsChange: string;
  successfulDeployments: number;
  successfulDeploymentsChange: string;
  failedDeployments: number;
  failedDeploymentsChange: string;
  goLiveCompleted: number;
  goLiveCompletedChange: string;
  handoverPending: number;
  handoverPendingChange: string;
}

export interface DeploymentFilterOptions {
  environments: string[];
  deploymentStatuses: string[];
  handoverStatuses: string[];
  owners?: string[];
  projects?: string[];
}

export interface CreateDeploymentPayload {
  deploymentId?: string;
  projectId: string;
  releaseVersion: string;
  deploymentDate: string;
  environment: string;
  deploymentOwner: string;
  preDeploymentChecklist?: string;
  backupCompleted?: string;
  rollbackPlan?: string;
  smokeTest?: string;
  status?: string;
  clientSignOff?: string;
  goLiveDate?: string;
  handoverStatus?: string;
  releaseNotes?: string;
}

export interface UpdateDeploymentPayload {
  projectId?: string;
  releaseVersion?: string;
  deploymentDate?: string;
  environment?: string;
  deploymentOwner?: string;
  preDeploymentChecklist?: string;
  backupCompleted?: string;
  rollbackPlan?: string;
  smokeTest?: string;
  status?: string;
  clientSignOff?: string;
  goLiveDate?: string;
  handoverStatus?: string;
  releaseNotes?: string;
}

