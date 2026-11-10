package com.company.project.support.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmcSlaFilterOptionsResponse {
    private List<String> serviceTypes;
    private List<String> statuses;
    private List<String> renewalAlerts;
    private List<String> owners;
    private List<String> renewalWindows;
}

