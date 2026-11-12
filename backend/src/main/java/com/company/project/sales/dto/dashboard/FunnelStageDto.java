package com.company.project.sales.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FunnelStageDto {
    private String id;
    private String label;
    private String sublabel;
    private long value;
    private String color;
    private String textColor;
    private String subtextColor;
}

