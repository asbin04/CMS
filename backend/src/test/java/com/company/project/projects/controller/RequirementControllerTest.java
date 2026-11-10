package com.company.project.projects.controller;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.common.response.PageResponse;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.RequirementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RequirementControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private StubRequirementService requirementService;

    static class StubRequirementService extends RequirementService {
        PageResponse<RequirementResponse> stubbedPage;
        RequirementResponse stubbedResponse;
        RequirementKpisResponse stubbedKpis;

        public StubRequirementService() {
            super(null, null, null, null, null);
        }

        @Override
        public PageResponse<RequirementResponse> getRequirements(String search, String project, String type, String priority, String status, String scopeFreeze, String sort, int page, int size) {
            return stubbedPage;
        }

        @Override
        public RequirementResponse getRequirementById(String id) {
            return stubbedResponse;
        }

        @Override
        public RequirementResponse createRequirement(CreateRequirementRequest request, String currentUsername, List<String> userRoles) {
            return stubbedResponse;
        }

        @Override
        public RequirementResponse updateRequirement(String id, UpdateRequirementRequest request, String currentUsername, List<String> userRoles) {
            return stubbedResponse;
        }

        @Override
        public RequirementResponse toggleScopeFreeze(String id, ScopeFreezeRequest request, String currentUsername, List<String> userRoles) {
            return stubbedResponse;
        }

        @Override
        public RequirementResponse approveRequirement(String id, String currentUsername, List<String> userRoles) {
            return stubbedResponse;
        }

        @Override
        public RequirementResponse revokeApproval(String id, String currentUsername, List<String> userRoles) {
            return stubbedResponse;
        }

        @Override
        public RequirementKpisResponse getKpis() {
            return stubbedKpis;
        }
    }

    @BeforeEach
    void setUp() {
        requirementService = new StubRequirementService();
        RequirementController controller = new RequirementController(requirementService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/requirements returns 200 with paginated content")
    void testGetRequirements() throws Exception {
        RequirementResponse item = RequirementResponse.builder()
                .requirementId("REQ-2026-0186")
                .projectId("PRJ-001")
                .clientId("CL-001")
                .featureName("Appointment Booking")
                .priority("High")
                .status("In Progress")
                .scopeFreeze(false)
                .completionPercentage(45)
                .build();

        requirementService.stubbedPage = PageResponse.<RequirementResponse>builder()
                .content(List.of(item))
                .pageNumber(1)
                .pageSize(10)
                .totalElements(1)
                .totalPages(1)
                .build();

        mockMvc.perform(get("/api/v1/requirements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].requirementId").value("REQ-2026-0186"))
                .andExpect(jsonPath("$.data.content[0].featureName").value("Appointment Booking"));
    }

    @Test
    @DisplayName("GET /api/v1/requirements/kpis returns 200 with KPI summary")
    void testGetKpis() throws Exception {
        requirementService.stubbedKpis = RequirementKpisResponse.builder()
                .totalRequirements(186L)
                .inProgress(78L)
                .completed(64L)
                .pendingApproval(18L)
                .scopeFrozen(26L)
                .build();

        mockMvc.perform(get("/api/v1/requirements/kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRequirements").value(186))
                .andExpect(jsonPath("$.data.scopeFrozen").value(26));
    }

    @Test
    @DisplayName("GET /api/v1/requirements/{id} returns 200 with single requirement")
    void testGetRequirementById() throws Exception {
        requirementService.stubbedResponse = RequirementResponse.builder()
                .requirementId("REQ-2026-0186")
                .featureName("Appointment Booking")
                .build();

        mockMvc.perform(get("/api/v1/requirements/REQ-2026-0186"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.requirementId").value("REQ-2026-0186"));
    }

    @Test
    @DisplayName("POST /api/v1/requirements returns 201 on valid creation")
    void testCreateRequirement() throws Exception {
        CreateRequirementRequest request = CreateRequirementRequest.builder()
                .projectId("PRJ-001")
                .clientId("CL-001")
                .featureName("Billing Integration")
                .ownerId("EMP-001")
                .requirementDate(LocalDate.now())
                .build();

        requirementService.stubbedResponse = RequirementResponse.builder()
                .requirementId("REQ-2026-0187")
                .projectId("PRJ-001")
                .featureName("Billing Integration")
                .build();

        mockMvc.perform(post("/api/v1/requirements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.requirementId").value("REQ-2026-0187"));
    }

    @Test
    @DisplayName("POST /api/v1/requirements/{id}/scope-freeze returns 200 on toggle")
    void testToggleScopeFreeze() throws Exception {
        ScopeFreezeRequest request = ScopeFreezeRequest.builder()
                .scopeFreeze(true)
                .reason("Milestone 1 freeze")
                .build();

        requirementService.stubbedResponse = RequirementResponse.builder()
                .requirementId("REQ-2026-0186")
                .scopeFreeze(true)
                .scopeFreezeText("Yes")
                .build();

        mockMvc.perform(post("/api/v1/requirements/REQ-2026-0186/scope-freeze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.scopeFreeze").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/requirements/{id}/approve returns 200 with approved requirement")
    void testApproveRequirement() throws Exception {
        requirementService.stubbedResponse = RequirementResponse.builder()
                .requirementId("REQ-2026-0186")
                .status("Completed")
                .approvedBy("Akshit Ujjain")
                .approvalDate(LocalDate.now())
                .build();

        mockMvc.perform(post("/api/v1/requirements/REQ-2026-0186/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("Completed"))
                .andExpect(jsonPath("$.data.approvedBy").value("Akshit Ujjain"));
    }

    @Test
    @DisplayName("POST /api/v1/requirements/{id}/revoke returns 200 with reopened requirement")
    void testRevokeApproval() throws Exception {
        requirementService.stubbedResponse = RequirementResponse.builder()
                .requirementId("REQ-2026-0186")
                .status("In Progress")
                .build();

        mockMvc.perform(post("/api/v1/requirements/REQ-2026-0186/revoke"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("In Progress"));
    }

    @Test
    @DisplayName("POST /api/v1/requirements with assignedApprover MD – Gaurav Tripathy returns assignedApprover")
    void testCreateRequirementWithMdApprover() throws Exception {
        CreateRequirementRequest request = CreateRequirementRequest.builder()
                .projectId("PRJ-001")
                .clientId("CL-001")
                .featureName("MD Approval Integration")
                .ownerId("EMP-001")
                .assignedApprover("MD – Gaurav Tripathy")
                .requirementDate(LocalDate.now())
                .build();

        requirementService.stubbedResponse = RequirementResponse.builder()
                .requirementId("REQ-2026-0188")
                .projectId("PRJ-001")
                .featureName("MD Approval Integration")
                .assignedApprover("MD – Gaurav Tripathy")
                .build();

        mockMvc.perform(post("/api/v1/requirements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.assignedApprover").value("MD – Gaurav Tripathy"));
    }
}
