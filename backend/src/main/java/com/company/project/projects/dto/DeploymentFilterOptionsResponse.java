package com.company.project.projects.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentFilterOptionsResponse {
    private List<String> environments;
    private List<String> deploymentStatuses;
    private List<String> handoverStatuses;
    private List<String> owners;
    private List<String> projects;
}

