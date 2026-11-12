package com.company.project.sales.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesWorkflowDto {
    private List<WorkflowStageDto> stages;
    private String followUpQueueTitle;
    private String followUpQueueDescription;
    private String followUpQueueActionLabel;
    private String followUpQueueRoute;
    private long followUpQueueCount;
}

