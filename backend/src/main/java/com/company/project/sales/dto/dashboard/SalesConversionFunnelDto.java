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
public class SalesConversionFunnelDto {
    private List<FunnelStageDto> stages;
    private ConversionOverviewDto conversion;
}

