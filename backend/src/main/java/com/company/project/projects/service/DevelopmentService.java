package com.company.project.projects.service;

import com.company.project.common.response.PageResponse;
import com.company.project.projects.dto.*;

public interface DevelopmentService {

    PageResponse<DevelopmentResponse> getDevelopments(
            String search,
            String project,
            String environment,
            String status,
            String reviewStatus,
            String sort,
            int page,
            int size
    );

    DevelopmentKpisResponse getKpis();

    String getNextDevelopmentId();

    DevelopmentResponse getDevelopmentById(String id);

    DevelopmentResponse createDevelopment(CreateDevelopmentRequest request, String currentUsername);

    DevelopmentResponse updateDevelopment(String id, UpdateDevelopmentRequest request, String currentUsername);

    DevelopmentResponse updateStatus(String id, UpdateDevelopmentStatusRequest request, String currentUsername);

    DevelopmentResponse updateCodeReviewStatus(String id, UpdateCodeReviewStatusRequest request, String currentUsername);

    void deleteDevelopment(String id, String currentUsername);

    byte[] exportDevelopmentsToCsv(
            String search,
            String project,
            String environment,
            String status,
            String reviewStatus
    );
}

