package com.company.project.projects.service;

import com.company.project.projects.dto.*;

import java.util.List;

public interface ProjectUatService {

    List<ProjectUatDto> getAllUats();

    List<ProjectUatDto> getAllUats(String search, String projectId, String status, String clientApproval, String tester);

    ProjectUatDto getUatById(String id);

    List<ProjectUatDto> getUatsByProjectId(String projectId);

    UatKpiResponse getKpis();

    UatFilterOptionsResponse getFilterOptions();

    ProjectUatDto createUat(CreateProjectUatRequest request);

    ProjectUatDto updateUat(String id, UpdateProjectUatRequest request);

    void deleteUat(String id);
}

