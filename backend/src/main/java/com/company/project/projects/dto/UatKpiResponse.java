package com.company.project.projects.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UatKpiResponse {
    private long totalUats;
    private String totalUatsTrend;

    private long inTesting;
    private String inTestingTrend;

    private long passed;
    private String passedTrend;

    private long defectsLogged;
    private String defectsLoggedTrend;

    private long clientApproved;
    private String clientApprovedTrend;
}

