package com.company.project.projects.controller;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.common.response.PageResponse;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.TimesheetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TimesheetControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private StubTimesheetService timesheetService;

    static class StubTimesheetService extends TimesheetService {
        PageResponse<TimesheetResponse> stubbedPage;
        TimesheetResponse stubbedResponse;
        TimesheetKpisResponse stubbedKpis;

        public StubTimesheetService() {
            super(null, null, null, null, null);
        }

        @Override
        public PageResponse<TimesheetResponse> getTimesheets(String search, String employee, String project, String approvalStatus, String billable, String dateFrom, String dateTo, String sort, int page, int size) {
            return stubbedPage;
        }

        @Override
        public TimesheetResponse getTimesheetById(String id) {
            return stubbedResponse;
        }

        @Override
        public TimesheetResponse createTimesheet(CreateTimesheetRequest request, String currentUsername, List<String> userRoles) {
            return stubbedResponse;
        }

        @Override
        public TimesheetResponse updateTimesheet(String id, UpdateTimesheetRequest request, String currentUsername, List<String> userRoles) {
            return stubbedResponse;
        }

        @Override
        public TimesheetResponse approveTimesheet(String id, ApproveTimesheetRequest request, String currentUsername) {
            return stubbedResponse;
        }

        @Override
        public TimesheetResponse rejectTimesheet(String id, RejectTimesheetRequest request, String currentUsername) {
            return stubbedResponse;
        }

        @Override
        public TimesheetResponse overrideLaborCost(String id, OverrideLaborCostRequest request, String currentUsername) {
            return stubbedResponse;
        }

        @Override
        public TimesheetKpisResponse getKpis() {
            return stubbedKpis;
        }
    }

    @BeforeEach
    void setUp() {
        timesheetService = new StubTimesheetService();
        TimesheetController controller = new TimesheetController(timesheetService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/timesheets returns 200 with paginated content")
    void testGetTimesheets() throws Exception {
        TimesheetResponse item = TimesheetResponse.builder()
                .timesheetId("TS-202610-048")
                .employeeId("EMP-001")
                .employeeName("Amit Sharma")
                .projectId("PRJ-001")
                .taskId("TSK-00126")
                .hours(new BigDecimal("8.00"))
                .billable("Yes")
                .approvalStatus("Approved")
                .build();

        timesheetService.stubbedPage = PageResponse.<TimesheetResponse>builder()
                .content(List.of(item))
                .pageNumber(1)
                .pageSize(10)
                .totalElements(1)
                .totalPages(1)
                .build();

        mockMvc.perform(get("/api/v1/timesheets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].timesheetId").value("TS-202610-048"))
                .andExpect(jsonPath("$.data.content[0].employeeName").value("Amit Sharma"));
    }

    @Test
    @DisplayName("GET /api/v1/timesheets/kpis returns 200 with KPI summary")
    void testGetKpis() throws Exception {
        timesheetService.stubbedKpis = TimesheetKpisResponse.builder()
                .totalHours(new BigDecimal("37.50"))
                .billableHours(new BigDecimal("29.50"))
                .billableAmount(new BigDecimal("44250.00"))
                .pendingApprovals(18L)
                .build();

        mockMvc.perform(get("/api/v1/timesheets/kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalHours").value(37.50))
                .andExpect(jsonPath("$.data.pendingApprovals").value(18));
    }

    @Test
    @DisplayName("POST /api/v1/timesheets returns 201 on valid submission")
    void testCreateTimesheet() throws Exception {
        CreateTimesheetRequest request = CreateTimesheetRequest.builder()
                .employeeId("EMP-001")
                .projectId("PRJ-001")
                .taskId("TSK-00126")
                .hours(new BigDecimal("8.00"))
                .isBillable(true)
                .billableRate(new BigDecimal("1500.00"))
                .timesheetDate(LocalDate.now())
                .build();

        timesheetService.stubbedResponse = TimesheetResponse.builder()
                .timesheetId("TS-202610-049")
                .employeeId("EMP-001")
                .approvalStatus("Pending")
                .build();

        mockMvc.perform(post("/api/v1/timesheets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.timesheetId").value("TS-202610-049"));
    }

    @Test
    @DisplayName("POST /api/v1/timesheets/{id}/approve returns 200 on approval")
    void testApproveTimesheet() throws Exception {
        ApproveTimesheetRequest request = ApproveTimesheetRequest.builder()
                .approvedBy("Rohan Verma")
                .notes("Verified with client")
                .build();

        timesheetService.stubbedResponse = TimesheetResponse.builder()
                .timesheetId("TS-202610-048")
                .approvalStatus("Approved")
                .approvedBy("Rohan Verma")
                .build();

        mockMvc.perform(post("/api/v1/timesheets/TS-202610-048/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.approvalStatus").value("Approved"));
    }

    @Test
    @DisplayName("POST /api/v1/timesheets/{id}/override-labor-cost returns 200 on override")
    void testOverrideLaborCost() throws Exception {
        OverrideLaborCostRequest request = OverrideLaborCostRequest.builder()
                .estimatedLaborCost(new BigDecimal("7500.00"))
                .reason("Senior consultant rate")
                .build();

        timesheetService.stubbedResponse = TimesheetResponse.builder()
                .timesheetId("TS-202610-048")
                .estimatedLaborCost(new BigDecimal("7500.00"))
                .laborCostOverride(true)
                .build();

        mockMvc.perform(post("/api/v1/timesheets/TS-202610-048/override-labor-cost")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.estimatedLaborCost").value(7500.00));
    }

    @Test
    @DisplayName("POST /api/v1/timesheets with assignedApprover MD – Gaurav Tripathy returns assignedApprover")
    void testCreateTimesheetWithMdApprover() throws Exception {
        CreateTimesheetRequest request = CreateTimesheetRequest.builder()
                .projectId("PRJ-001")
                .taskId("TSK-00126")
                .employeeId("EMP-001")
                .hours(new BigDecimal("8.00"))
                .assignedApprover("MD – Gaurav Tripathy")
                .timesheetDate(LocalDate.now())
                .build();

        timesheetService.stubbedResponse = TimesheetResponse.builder()
                .timesheetId("TS-202610-050")
                .projectId("PRJ-001")
                .assignedApprover("MD – Gaurav Tripathy")
                .approvalStatus("Pending")
                .build();

        mockMvc.perform(post("/api/v1/timesheets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.assignedApprover").value("MD – Gaurav Tripathy"))
                .andExpect(jsonPath("$.data.approvalStatus").value("Pending"));
    }
}
