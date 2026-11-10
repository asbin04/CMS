package com.company.project.projects.controller;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.common.response.PageResponse;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.DevelopmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DevelopmentControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private StubDevelopmentService developmentService;

    static class StubDevelopmentService implements DevelopmentService {
        PageResponse<DevelopmentResponse> stubbedPage;
        DevelopmentResponse stubbedResponse;
        DevelopmentKpisResponse stubbedKpis;
        String stubbedNextId = "DEV-2026-0001";
        byte[] stubbedCsv = "Development ID,Project ID\n".getBytes(StandardCharsets.UTF_8);

        @Override
        public PageResponse<DevelopmentResponse> getDevelopments(String search, String project, String environment, String status, String reviewStatus, String sort, int page, int size) {
            return stubbedPage;
        }

        @Override
        public DevelopmentKpisResponse getKpis() {
            return stubbedKpis;
        }

        @Override
        public String getNextDevelopmentId() {
            return stubbedNextId;
        }

        @Override
        public DevelopmentResponse getDevelopmentById(String id) {
            return stubbedResponse;
        }

        @Override
        public DevelopmentResponse createDevelopment(CreateDevelopmentRequest request, String currentUsername) {
            return stubbedResponse;
        }

        @Override
        public DevelopmentResponse updateDevelopment(String id, UpdateDevelopmentRequest request, String currentUsername) {
            return stubbedResponse;
        }

        @Override
        public DevelopmentResponse updateStatus(String id, UpdateDevelopmentStatusRequest request, String currentUsername) {
            return stubbedResponse;
        }

        @Override
        public DevelopmentResponse updateCodeReviewStatus(String id, UpdateCodeReviewStatusRequest request, String currentUsername) {
            return stubbedResponse;
        }

        @Override
        public void deleteDevelopment(String id, String currentUsername) {
        }

        @Override
        public byte[] exportDevelopmentsToCsv(String search, String project, String environment, String status, String reviewStatus) {
            return stubbedCsv;
        }
    }

    @BeforeEach
    void setUp() {
        developmentService = new StubDevelopmentService();
        DevelopmentController controller = new DevelopmentController(developmentService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/developments - List developments")
    void testGetDevelopments() throws Exception {
        DevelopmentResponse sample = DevelopmentResponse.builder()
                .developmentId("DEV-2026-0001")
                .projectId("PRJ-001")
                .requirementId("REQ-2026-0184")
                .taskId("TSK-00128")
                .developerName("Amit Sharma")
                .status("In Progress")
                .build();

        developmentService.stubbedPage = PageResponse.<DevelopmentResponse>builder()
                .content(List.of(sample))
                .pageNumber(1)
                .pageSize(10)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        mockMvc.perform(get("/api/v1/developments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].developmentId").value("DEV-2026-0001"));
    }

    @Test
    @DisplayName("GET /api/v1/developments/kpis - Get KPIs")
    void testGetKpis() throws Exception {
        developmentService.stubbedKpis = DevelopmentKpisResponse.builder()
                .totalDevelopments(432L)
                .inDevelopment(128L)
                .inCodeReview(76L)
                .qaHandover(54L)
                .released(148L)
                .build();

        mockMvc.perform(get("/api/v1/developments/kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalDevelopments").value(432))
                .andExpect(jsonPath("$.data.inDevelopment").value(128));
    }

    @Test
    @DisplayName("GET /api/v1/developments/next-id - Preview next ID")
    void testGetNextId() throws Exception {
        mockMvc.perform(get("/api/v1/developments/next-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nextId").value("DEV-2026-0001"));
    }

    @Test
    @DisplayName("POST /api/v1/developments - Create development")
    void testCreateDevelopment() throws Exception {
        CreateDevelopmentRequest req = CreateDevelopmentRequest.builder()
                .projectId("PRJ-001")
                .requirementId("REQ-2026-0184")
                .taskId("TSK-00128")
                .developerName("Amit Sharma")
                .repositoryUrl("https://github.com/company/repo")
                .branch("feature/login")
                .environment("Dev")
                .buildVersion("v1.0.0")
                .qaHandoffDate(LocalDate.of(2026, 10, 28))
                .build();

        developmentService.stubbedResponse = DevelopmentResponse.builder()
                .developmentId("DEV-2026-0001")
                .projectId("PRJ-001")
                .requirementId("REQ-2026-0184")
                .taskId("TSK-00128")
                .developerName("Amit Sharma")
                .build();

        mockMvc.perform(post("/api/v1/developments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.developmentId").value("DEV-2026-0001"));
    }

    @Test
    @DisplayName("PATCH /api/v1/developments/{id}/status - Update status")
    void testUpdateStatus() throws Exception {
        UpdateDevelopmentStatusRequest req = UpdateDevelopmentStatusRequest.builder()
                .status("Released")
                .build();

        developmentService.stubbedResponse = DevelopmentResponse.builder()
                .developmentId("DEV-2026-0001")
                .status("Released")
                .build();

        mockMvc.perform(patch("/api/v1/developments/DEV-2026-0001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("Released"));
    }

    @Test
    @DisplayName("GET /api/v1/developments/export - CSV Export")
    void testExport() throws Exception {
        mockMvc.perform(get("/api/v1/developments/export"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv"))
                .andExpect(header().exists("Content-Disposition"));
    }
}

