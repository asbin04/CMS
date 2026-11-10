package com.company.project.projects.service;

import com.company.project.projects.dto.*;

import java.util.List;

public interface ProjectDeploymentService {
    List<ProjectDeploymentDto> getAllDeployments(String search, String environment, String status, String handoverStatus);
    ProjectDeploymentDto getDeploymentById(String id);
    ProjectDeploymentDto createDeployment(CreateProjectDeploymentRequest request);
    ProjectDeploymentDto updateDeployment(String id, UpdateProjectDeploymentRequest request);
    void deleteDeployment(String id);
    DeploymentKpisResponse getKpis();
    DeploymentFilterOptionsResponse getFilterOptions();
    void resetSeedData();
}

