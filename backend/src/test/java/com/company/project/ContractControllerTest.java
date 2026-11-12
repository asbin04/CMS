package com.company.project;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.dashboard.controller.ContractController;
import com.company.project.dashboard.dto.ContractDto;
import com.company.project.dashboard.dto.ContractSummaryDto;
import com.company.project.dashboard.dto.CreateContractRequest;
import com.company.project.dashboard.service.ContractService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ContractController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class ContractControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ContractService service;

    @Test
    @DisplayName("GET /api/v1/contracts returns 200 with list")
    void testGetAllContracts() throws Exception {
        ContractDto dto = ContractDto.builder()
                .id(1L)
                .contractId("C-2025-001")
                .clientId("C-001")
                .contractType("Service Agreement")
                .status("Active")
                .build();

        when(service.getAllContracts(null, null, null, null, null)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/contracts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].contractId").value("C-2025-001"));
    }

    @Test
    @DisplayName("GET /api/v1/contracts/summary returns 200 with KPI stats")
    void testGetSummary() throws Exception {
        ContractSummaryDto summary = ContractSummaryDto.builder()
                .totalContracts(72)
                .totalContractsTrend("↑ 14% vs last month")
                .activeContracts(56)
                .activeContractsTrend("↑ 8% vs last month")
                .expiringContracts(8)
                .expiringContractsTrend("↓ 20% vs last month")
                .totalContractValue(new BigDecimal("123456"))
                .totalContractValueFormatted("₹ 1,23,456")
                .totalContractValueTrend("↑ 22% vs last month")
                .build();

        when(service.getSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/contracts/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalContracts").value(72))
                .andExpect(jsonPath("$.data.activeContracts").value(56))
                .andExpect(jsonPath("$.data.expiringContracts").value(8));
    }

    @Test
    @DisplayName("GET /api/v1/contracts/{id} returns 200 when found")
    void testGetById() throws Exception {
        ContractDto dto = ContractDto.builder()
                .id(1L)
                .contractId("C-2025-001")
                .clientId("C-001")
                .build();

        when(service.getById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/contracts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.contractId").value("C-2025-001"));
    }

    @Test
    @DisplayName("GET /api/v1/contracts/{id} returns 404 when not found")
    void testGetByIdNotFound() throws Exception {
        when(service.getById(999L)).thenThrow(new ResourceNotFoundException("Contract not found with id: 999"));

        mockMvc.perform(get("/api/v1/contracts/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/v1/contracts returns 201 on success")
    void testCreateContract() throws Exception {
        CreateContractRequest request = CreateContractRequest.builder()
                .clientId("C-001")
                .contractType("Service Agreement")
                .startDate("15 Mar 2025")
                .endDate("14 Mar 2026")
                .contractValue(new BigDecimal("1200000.00"))
                .build();

        ContractDto created = ContractDto.builder()
                .id(1L)
                .contractId("C-2025-001")
                .clientId("C-001")
                .contractType("Service Agreement")
                .build();

        when(service.createContract(any())).thenReturn(created);

        mockMvc.perform(post("/api/v1/contracts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.contractId").value("C-2025-001"));
    }

    @Test
    @DisplayName("PUT /api/v1/contracts/{id} returns 200 on update")
    void testUpdateContract() throws Exception {
        CreateContractRequest request = CreateContractRequest.builder()
                .clientId("C-001")
                .contractType("Service Agreement")
                .startDate("15 Mar 2025")
                .endDate("14 Mar 2026")
                .contractValue(new BigDecimal("1200000.00"))
                .status("Active")
                .build();

        ContractDto updated = ContractDto.builder()
                .id(1L)
                .contractId("C-2025-001")
                .status("Active")
                .build();

        when(service.updateContract(eq(1L), any())).thenReturn(updated);

        mockMvc.perform(put("/api/v1/contracts/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("Active"));
    }

    @Test
    @DisplayName("DELETE /api/v1/contracts/{id} returns 200")
    void testDeleteContract() throws Exception {
        doNothing().when(service).deleteContract(1L);

        mockMvc.perform(delete("/api/v1/contracts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(service, times(1)).deleteContract(1L);
    }
}

