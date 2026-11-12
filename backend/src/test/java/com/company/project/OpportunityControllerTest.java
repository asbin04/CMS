package com.company.project;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.dashboard.controller.OpportunityController;
import com.company.project.dashboard.dto.CreateOpportunityRequest;
import com.company.project.dashboard.dto.OpportunityDto;
import com.company.project.dashboard.dto.OpportunitySummaryDto;
import com.company.project.dashboard.service.OpportunityService;
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

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = OpportunityController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class OpportunityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OpportunityService service;

    @Test
    @DisplayName("GET /api/v1/opportunities returns 200 with list")
    void testGetAllOpportunities() throws Exception {
        OpportunityDto dto = OpportunityDto.builder()
                .id(1L)
                .opportunityId("O-2025-001")
                .opportunityName("ERP Solution")
                .build();

        when(service.getAllOpportunities(null, null, null, null, null, null)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/opportunities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].opportunityId").value("O-2025-001"));
    }

    @Test
    @DisplayName("GET /api/v1/opportunities/summary returns 200 with summary")
    void testGetSummary() throws Exception {
        OpportunitySummaryDto summary = OpportunitySummaryDto.builder()
                .totalOpportunities(156L)
                .openOpportunities(98L)
                .weightedPipeline(new BigDecimal("1280000"))
                .build();

        when(service.getSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/opportunities/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalOpportunities").value(156));
    }

    @Test
    @DisplayName("POST /api/v1/opportunities with valid request returns 201 Created")
    void testCreateOpportunitySuccess() throws Exception {
        CreateOpportunityRequest req = CreateOpportunityRequest.builder()
                .opportunityName("Cloud Modernization")
                .clientId("C-001")
                .ownerId("EMP-001")
                .serviceId("S-001")
                .stage("New")
                .probability(30)
                .estimatedValue(new BigDecimal("800000"))
                .status("Open")
                .build();

        OpportunityDto created = OpportunityDto.builder()
                .id(9L)
                .opportunityId("O-2025-009")
                .opportunityName("Cloud Modernization")
                .build();

        when(service.createOpportunity(any(CreateOpportunityRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/opportunities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.opportunityId").value("O-2025-009"));
    }

    @Test
    @DisplayName("POST /api/v1/opportunities with invalid probability (>100 or <0) returns 400")
    void testCreateOpportunityInvalidProbability() throws Exception {
        CreateOpportunityRequest invalidReq = CreateOpportunityRequest.builder()
                .opportunityName("Cloud Modernization")
                .clientId("C-001")
                .ownerId("EMP-001")
                .serviceId("S-001")
                .stage("New")
                .probability(150) // invalid
                .estimatedValue(new BigDecimal("800000"))
                .status("Open")
                .build();

        mockMvc.perform(post("/api/v1/opportunities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("DELETE /api/v1/opportunities/{id} returns 200")
    void testDeleteOpportunity() throws Exception {
        doNothing().when(service).deleteOpportunity(1L);

        mockMvc.perform(delete("/api/v1/opportunities/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}

