package com.company.project.projects.service;

import com.company.project.projects.dto.*;

import java.util.List;

public interface UiuxDesignService {

    List<UiuxDesignDto> getAllDesigns();

    UiuxDesignDto getDesignById(String id);

    List<UiuxDesignDto> getDesignsByProjectId(String projectId);

    UiuxKpiResponse getKpis();

    UiuxFilterOptionsResponse getFilterOptions();

    UiuxDesignDto createDesign(CreateUiuxDesignRequest request);

    UiuxDesignDto updateDesign(String id, UpdateUiuxDesignRequest request);

    void deleteDesign(String id);
}

