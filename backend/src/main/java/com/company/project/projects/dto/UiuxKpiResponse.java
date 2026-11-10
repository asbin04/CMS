package com.company.project.projects.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UiuxKpiResponse {
    private long totalDesigns;
    private String totalDesignsTrend;

    private long inProgress;
    private String inProgressTrend;

    private long approved;
    private String approvedTrend;

    private long changeRequests;
    private String changeRequestsTrend;

    private long pendingApproval;
    private String pendingApprovalTrend;
}

