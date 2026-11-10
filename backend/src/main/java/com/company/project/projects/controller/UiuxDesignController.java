package com.company.project.projects.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.UiuxDesignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/ui-ux")
@RequiredArgsConstructor
@Tag(name = "UI/UX Design Deliverables", description = "Management APIs for UI/UX Design Deliverables and Prototypes")
public class UiuxDesignController {

    private final UiuxDesignService service;

    @GetMapping
    @Operation(summary = "Get all UI/UX design deliverables")
    public ResponseEntity<ApiResponse<List<UiuxDesignDto>>> getAllDesigns() {
        return ResponseEntity.ok(ApiResponse.success(service.getAllDesigns()));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get UI/UX design KPIs and metrics")
    public ResponseEntity<ApiResponse<UiuxKpiResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.success(service.getKpis()));
    }

    @GetMapping("/filters")
    @Operation(summary = "Get distinct filter options for UI/UX designs")
    public ResponseEntity<ApiResponse<UiuxFilterOptionsResponse>> getFilterOptions() {
        return ResponseEntity.ok(ApiResponse.success(service.getFilterOptions()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get UI/UX design deliverable by ID")
    public ResponseEntity<ApiResponse<UiuxDesignDto>> getDesignById(@PathVariable String id) {
        UiuxDesignDto dto = service.getDesignById(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get UI/UX designs for a specific project")
    public ResponseEntity<ApiResponse<List<UiuxDesignDto>>> getDesignsByProject(@PathVariable String projectId) {
        return ResponseEntity.ok(ApiResponse.success(service.getDesignsByProjectId(projectId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Create a new UI/UX design deliverable")
    public ResponseEntity<ApiResponse<UiuxDesignDto>> createDesign(@Valid @RequestBody CreateUiuxDesignRequest request) {
        UiuxDesignDto created = service.createDesign(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Design deliverable created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Update an existing UI/UX design deliverable")
    public ResponseEntity<ApiResponse<UiuxDesignDto>> updateDesign(@PathVariable String id, @RequestBody UpdateUiuxDesignRequest request) {
        UiuxDesignDto updated = service.updateDesign(id, request);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("Design deliverable updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Delete a UI/UX design deliverable")
    public ResponseEntity<ApiResponse<Void>> deleteDesign(@PathVariable String id) {
        service.deleteDesign(id);
        return ResponseEntity.ok(ApiResponse.success("Design deliverable deleted successfully", null));
    }
}

