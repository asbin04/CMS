package com.company.project.projects.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentKpisResponse {
    private long totalDeployments;
    private String totalDeploymentsTrend;

    private long successfulDeployments;
    private String successfulDeploymentsTrend;

    private long failedDeployments;
    private String failedDeploymentsTrend;

    private long goLiveCompleted;
    private String goLiveCompletedTrend;

    private long handoverPending;
    private String handoverPendingTrend;

    public String getTotalDeploymentsChange() {
        return totalDeploymentsTrend;
    }

    public String getSuccessfulDeploymentsChange() {
        return successfulDeploymentsTrend;
    }

    public String getFailedDeploymentsChange() {
        return failedDeploymentsTrend;
    }

    public String getGoLiveCompletedChange() {
        return goLiveCompletedTrend;
    }

    public String getHandoverPendingChange() {
        return handoverPendingTrend;
    }
}

