package com.company.project;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.dashboard.controller.ApprovalController;
import com.company.project.dashboard.dto.ApprovalsResponse;
import com.company.project.dashboard.dto.ApprovalsSummaryDto;
import com.company.project.dashboard.dto.UpdateStatusRequest;
import com.company.project.dashboard.entity.ClientApproval;
import com.company.project.dashboard.entity.EmployeeApproval;
import com.company.project.dashboard.service.ApprovalService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ApprovalController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class ApprovalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ApprovalService approvalService;

    @Test
    @DisplayName("GET /api/v1/approvals returns 200 with all approvals")
    void testGetAllApprovals() throws Exception {
        ApprovalsResponse response = ApprovalsResponse.builder()
                .employees(List.of(EmployeeApproval.builder().id(1L).employeeName("Arun").status("Pending").build()))
                .clients(List.of(ClientApproval.builder().id(1L).clientName("Acme").status("Pending").build()))
                .ticketsAssets(List.of())
                .summary(ApprovalsSummaryDto.builder().total(2L).pending(2L).build())
                .build();

        when(approvalService.getAllApprovals()).thenReturn(response);

        mockMvc.perform(get("/api/v1/approvals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.summary.total").value(2))
                .andExpect(jsonPath("$.data.employees[0].employee_name").value("Arun"));
    }

    @Test
    @DisplayName("PUT /api/v1/approvals/employee/{id}/status updates employee approval")
    void testUpdateEmployeeStatus() throws Exception {
        UpdateStatusRequest req = UpdateStatusRequest.builder().status("Approved").build();
        EmployeeApproval updated = EmployeeApproval.builder().id(1L).employeeName("Arun").status("Approved").build();

        when(approvalService.updateEmployeeStatus(eq(1L), eq("Approved"))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/approvals/employee/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("Approved"));
    }

    @Test
    @DisplayName("PUT /api/v1/approvals/employee/{id}/status with blank status returns 400")
    void testUpdateEmployeeStatusBlank() throws Exception {
        UpdateStatusRequest req = UpdateStatusRequest.builder().status("").build();

        mockMvc.perform(put("/api/v1/approvals/employee/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}

