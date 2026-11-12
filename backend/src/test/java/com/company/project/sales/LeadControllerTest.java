package com.company.project.sales;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.sales.controller.LeadController;
import com.company.project.sales.dto.*;
import com.company.project.sales.service.LeadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = LeadController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class LeadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private LeadService service;

    @Test
    @DisplayName("GET /api/v1/leads returns 200 with PageResponse")
    void testGetLeads() throws Exception {
        LeadResponse lead = LeadResponse.builder()
                .id("L-2025-001")
                .company("Acme Corp")
                .contactName("John Doe")
                .email("john@acme.com")
                .phone("+91 98765 43210")
                .stage("New")
                .status("Open")
                .build();

        PageResponse<LeadResponse> pageResponse = PageResponse.<LeadResponse>builder()
                .content(List.of(lead))
                .pageNumber(0)
                .pageSize(10)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(service.getLeads(any(Pageable.class), any(), any(), any(), any(), any())).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/leads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value("L-2025-001"))
                .andExpect(jsonPath("$.data.content[0].company").value("Acme Corp"));
    }

    @Test
    @DisplayName("GET /api/v1/leads/summary returns 200 with metrics and trends")
    void testGetSummary() throws Exception {
        LeadSummaryDto summary = LeadSummaryDto.builder()
                .totalLeads(120)
                .newThisMonth(25)
                .followUpsDue(15)
                .convertedLeads(18)
                .totalLeadsMoM(12.5)
                .newLeadsMoM(5.0)
                .followUpsDueMoM(-2.0)
                .convertedMoM(10.0)
                .lastUpdated("15 Mar 2025, 10:30 AM")
                .build();

        when(service.getSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/leads/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalLeads").value(120))
                .andExpect(jsonPath("$.data.newThisMonth").value(25))
                .andExpect(jsonPath("$.data.totalLeadsMoM").value(12.5));
    }

    @Test
    @DisplayName("GET /api/v1/leads/{id} returns 200 when found")
    void testGetLeadById() throws Exception {
        LeadResponse lead = LeadResponse.builder()
                .id("L-2025-001")
                .company("Acme Corp")
                .build();

        when(service.getLeadById("L-2025-001")).thenReturn(lead);

        mockMvc.perform(get("/api/v1/leads/L-2025-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("L-2025-001"));
    }

    @Test
    @DisplayName("GET /api/v1/leads/{id} returns 404 when not found")
    void testGetLeadByIdNotFound() throws Exception {
        when(service.getLeadById("L-9999-999")).thenThrow(new ResourceNotFoundException("Lead not found with id: L-9999-999"));

        mockMvc.perform(get("/api/v1/leads/L-9999-999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/v1/leads returns 201 on valid body")
    void testCreateLeadValid() throws Exception {
        CreateLeadRequest req = CreateLeadRequest.builder()
                .company("Global Corp")
                .contactName("Alice Smith")
                .email("alice@global.com")
                .phone("+91 91234 56789")
                .source("Website")
                .serviceInterest("Cloud & DevOps")
                .country("India")
                .city("Mumbai")
                .ownerId("EMP-001")
                .stage("New")
                .status("Open")
                .estimatedValue(BigDecimal.valueOf(1000000))
                .build();

        LeadResponse created = LeadResponse.builder()
                .id("L-2025-005")
                .company("Global Corp")
                .contactName("Alice Smith")
                .build();

        when(service.createLead(any(CreateLeadRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("L-2025-005"));
    }

    @Test
    @DisplayName("POST /api/v1/leads returns 400 on validation failure (blank company / invalid email)")
    void testCreateLeadInvalid() throws Exception {
        CreateLeadRequest req = CreateLeadRequest.builder()
                .company("")
                .contactName("Alice Smith")
                .email("invalid-email")
                .phone("123")
                .source("Website")
                .serviceInterest("Cloud & DevOps")
                .country("India")
                .city("Mumbai")
                .ownerId("EMP-001")
                .stage("New")
                .status("Open")
                .build();

        mockMvc.perform(post("/api/v1/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("DELETE /api/v1/leads/{id} returns 200")
    void testDeleteLead() throws Exception {
        doNothing().when(service).deleteLead("L-2025-001");

        mockMvc.perform(delete("/api/v1/leads/L-2025-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
