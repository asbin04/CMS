package com.company.project.projects.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentKpisResponse {

    private Long totalDevelopments;
    private Long inDevelopment;
    private Long inCodeReview;
    private Long qaHandover;
    private Long released;

    private String totalDevelopmentsTrend;
    private String inDevelopmentTrend;
    private String inCodeReviewTrend;
    private String qaHandoverTrend;
    private String releasedTrend;
}

