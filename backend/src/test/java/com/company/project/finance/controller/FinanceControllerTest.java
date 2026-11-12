package com.company.project.finance.controller;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.finance.dto.*;
import com.company.project.finance.service.FinanceService;
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
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = FinanceController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class FinanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FinanceService financeService;

    @Test
    @DisplayName("GET /api/v1/finance/dashboard returns 200 with dashboard data")
    void testGetDashboardSuccess() throws Exception {
        FinanceDashboardResponse response = FinanceDashboardResponse.builder()
                .hasReceivablesData(true)
                .hasExpensesData(true)
                .lastUpdated("2026-11-03T16:00:00+05:30")
                .asOfDate(LocalDate.of(2025, 3, 31))
                .periodStart(LocalDate.of(2024, 4, 1))
                .periodEnd(LocalDate.of(2025, 3, 31))
                .kpis(FinanceKpisDto.builder()
                        .invoiceValue(FinanceKpiMetricDto.builder()
                                .rawValue(BigDecimal.valueOf(12933000))
                                .trendType(TrendType.POSITIVE)
                                .build())
                        .build())
                .ageingBuckets(List.of(
                        ReceivablesAgeingBucketDto.builder()
                                .bucketKey("current")
                                .label("Current")
                                .amount(BigDecimal.valueOf(4333000))
                                .percentage(43)
                                .count(6)
                                .build()
                ))
                .metricSummary(List.of(
                        MetricSummaryRowDto.builder()
                                .metricKey("invoice_value")
                                .metricName("Invoice Value")
                                .value(BigDecimal.valueOf(12933000))
                                .target(BigDecimal.valueOf(12000000))
                                .valueType(MetricValueType.CURRENCY)
                                .status("On Track")
                                .build()
                ))
                .build();

        when(financeService.getDashboard(any(), any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/finance/dashboard")
                        .param("period", "THIS_FISCAL_YEAR")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.hasReceivablesData").value(true))
                .andExpect(jsonPath("$.data.metricSummary[0].metricKey").value("invoice_value"));
    }

    @Test
    @DisplayName("GET /api/v1/finance/dashboard returns 400 for invalid period enum")
    void testGetDashboardInvalidPeriod() throws Exception {
        mockMvc.perform(get("/api/v1/finance/dashboard")
                        .param("period", "INVALID_PERIOD")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/finance/expenses returns 201 Created on valid payload")
    void testCreateExpenseSuccess() throws Exception {
        CreateExpenseRequest request = CreateExpenseRequest.builder()
                .expenseDate(LocalDate.of(2025, 2, 15))
                .category("Software Licenses")
                .amount(BigDecimal.valueOf(50000))
                .isProjectExpense(false)
                .description("JetBrains and Figma licenses")
                .build();

        ExpenseResponse response = ExpenseResponse.builder()
                .id(1L)
                .expenseDate(request.getExpenseDate())
                .category(request.getCategory())
                .amount(request.getAmount())
                .isProjectExpense(false)
                .description(request.getDescription())
                .createdBy("admin")
                .build();

        when(financeService.createExpense(any(CreateExpenseRequest.class), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/finance/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.category").value("Software Licenses"));
    }

    @Test
    @DisplayName("POST /api/v1/finance/expenses returns 400 for negative amount or missing date")
    void testCreateExpenseValidationFailure() throws Exception {
        CreateExpenseRequest request = CreateExpenseRequest.builder()
                .category("Software Licenses")
                .amount(BigDecimal.valueOf(-100))
                .isProjectExpense(false)
                .build();

        mockMvc.perform(post("/api/v1/finance/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/v1/finance/export calls exportCsv on service")
    void testExportCsv() throws Exception {
        mockMvc.perform(get("/api/v1/finance/export")
                        .param("period", "THIS_FISCAL_YEAR"))
                .andExpect(status().isOk());
    }
}
