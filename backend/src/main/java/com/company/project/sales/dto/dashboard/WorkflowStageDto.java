package com.company.project.sales.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStageDto {
    private String id;
    private String title;
    private String description;
    private String badgeBg;
    private String badgeText;
    private String cardBg;
    private String cardBorder;
}

