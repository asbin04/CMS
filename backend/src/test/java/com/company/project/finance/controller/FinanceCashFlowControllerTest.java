package com.company.project.finance.controller;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ConflictException;
import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.common.response.PageResponse;
import com.company.project.finance.dto.*;
import com.company.project.finance.service.FinanceCashFlowService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class FinanceCashFlowControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private StubFinanceCashFlowService cashFlowService;

    static class StubFinanceCashFlowService implements FinanceCashFlowService {
        PageResponse<CashFlowResponse> stubbedPage;
        CashFlowResponse stubbedResponse;
        CashFlowKpisResponse stubbedKpis;
        CashFlowTrendsResponse stubbedTrends;
        SuggestedOpeningCashResponse stubbedSuggestion;
        NextCashFlowIdResponse stubbedNextId;
        byte[] stubbedCsv = "Cash Flow ID,Period\n".getBytes(StandardCharsets.UTF_8);

        boolean throwLockedOnUpdate = false;
        boolean throwConflictOnCreate = false;

        @Override
        public PageResponse<CashFlowResponse> getCashFlows(String search, String period, String status, String sort, int page, int size) {
            return stubbedPage;
        }

        @Override
        public CashFlowResponse getCashFlowById(String idOrCashFlowId) {
            return stubbedResponse;
        }

        @Override
        public CashFlowKpisResponse getKpis() {
            return stubbedKpis;
        }

        @Override
        public CashFlowTrendsResponse getTrends() {
            return stubbedTrends;
        }

        @Override
        public SuggestedOpeningCashResponse getSuggestedOpeningCash(String periodOrPeriodCode) {
            return stubbedSuggestion;
        }

        @Override
        public NextCashFlowIdResponse getNextId(String year) {
            return stubbedNextId;
        }

        @Override
        public CashFlowResponse createCashFlow(CreateCashFlowRequest request, String username) {
            if (throwConflictOnCreate) {
                throw new ConflictException("A cash flow record already exists for period: " + request.getPeriod());
            }
            return stubbedResponse;
        }

        @Override
        public CashFlowResponse updateCashFlow(String idOrCashFlowId, UpdateCashFlowRequest request, String username) {
            if (throwLockedOnUpdate) {
                throw new BusinessValidationException("Cannot update cash flow record '" + idOrCashFlowId + "' because its status is Completed. Completed periods are locked.");
            }
            return stubbedResponse;
        }

        @Override
        public void deleteCashFlow(String idOrCashFlowId, String username) {
        }

        @Override
        public byte[] exportCashFlowsToCsv(String search, String period, String status) {
            return stubbedCsv;
        }
    }

    @BeforeEach
    void setUp() {
        cashFlowService = new StubFinanceCashFlowService();
        FinanceCashFlowController controller = new FinanceCashFlowController(cashFlowService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/finance/cash-flows: Returns 200 with paginated cash flow list")
    void getCashFlows_success() throws Exception {
        CashFlowResponse item = CashFlowResponse.builder()
                .id(1L)
                .cashFlowId("CF-2026-001")
                .period("Nov 2026")
                .periodCode("2026-11")
                .openingCash(new BigDecimal("1500000.00"))
                .closingCash(new BigDecimal("1800000.00"))
                .status("Pending")
                .build();

        cashFlowService.stubbedPage = PageResponse.<CashFlowResponse>builder()
                .content(List.of(item))
                .pageNumber(1)
                .pageSize(10)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        mockMvc.perform(get("/api/v1/finance/cash-flows"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].cashFlowId").value("CF-2026-001"))
                .andExpect(jsonPath("$.data.content[0].period").value("Nov 2026"));
    }

    @Test
    @DisplayName("GET /api/v1/finance/cash-flows/kpis: Returns 200 with latest period metrics")
    void getKpis_success() throws Exception {
        cashFlowService.stubbedKpis = CashFlowKpisResponse.builder()
                .period("Nov 2026")
                .periodCode("2026-11")
                .openingCash(new BigDecimal("1500000.00"))
                .totalInflows(new BigDecimal("2000000.00"))
                .totalOutflows(new BigDecimal("1700000.00"))
                .closingCash(new BigDecimal("1800000.00"))
                .hasData(true)
                .build();

        mockMvc.perform(get("/api/v1/finance/cash-flows/kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.period").value("Nov 2026"))
                .andExpect(jsonPath("$.data.closingCash").value(1800000.00));
    }

    @Test
    @DisplayName("GET /api/v1/finance/cash-flows/trends: Returns 200 with breakdown donut & insights")
    void getTrends_success() throws Exception {
        cashFlowService.stubbedTrends = CashFlowTrendsResponse.builder()
                .kpis(CashFlowTrendsResponse.TrendsKpisDto.builder()
                        .avgMonthlyInflow(new BigDecimal("2000000.00"))
                        .avgMonthlyOutflow(new BigDecimal("1700000.00"))
                        .closingCashLatest(new BigDecimal("1800000.00"))
                        .build())
                .monthlyTrends(Collections.emptyList())
                .outflowBreakdown(CashFlowTrendsResponse.OutflowBreakdownDto.builder()
                        .totalOutflows(new BigDecimal("1700000.00"))
                        .categories(List.of(
                                CashFlowTrendsResponse.OutflowCategoryDto.builder()
                                        .name("Vendor Payments")
                                        .amount(new BigDecimal("800000.00"))
                                        .percentage(new BigDecimal("47.1"))
                                        .color("#3930A8")
                                        .build()
                        ))
                        .build())
                .keyInsights(List.of("Positive cash flow trajectory"))
                .build();

        mockMvc.perform(get("/api/v1/finance/cash-flows/trends"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.outflowBreakdown.categories[0].color").value("#3930A8"))
                .andExpect(jsonPath("$.data.keyInsights[0]").value("Positive cash flow trajectory"));
    }

    @Test
    @DisplayName("POST /api/v1/finance/cash-flows: Returns 201 Created on valid submission")
    void createCashFlow_success() throws Exception {
        CreateCashFlowRequest request = CreateCashFlowRequest.builder()
                .period("Nov 2026")
                .openingCash(new BigDecimal("1500000.00"))
                .collections(new BigDecimal("2000000.00"))
                .vendorPayments(new BigDecimal("700000.00"))
                .payrollPayments(new BigDecimal("600000.00"))
                .operatingExpenses(new BigDecimal("400000.00"))
                .build();

        cashFlowService.stubbedResponse = CashFlowResponse.builder()
                .id(1L)
                .cashFlowId("CF-2026-001")
                .period("Nov 2026")
                .status("Pending")
                .build();

        Principal mockPrincipal = () -> "alice";

        mockMvc.perform(post("/api/v1/finance/cash-flows")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(mockPrincipal))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.cashFlowId").value("CF-2026-001"));
    }

    @Test
    @DisplayName("POST /api/v1/finance/cash-flows: Duplicate month returns 409 Conflict")
    void createCashFlow_duplicateConflict_returns409() throws Exception {
        CreateCashFlowRequest request = CreateCashFlowRequest.builder()
                .period("Nov 2026")
                .openingCash(new BigDecimal("1500000.00"))
                .collections(new BigDecimal("2000000.00"))
                .vendorPayments(new BigDecimal("700000.00"))
                .payrollPayments(new BigDecimal("600000.00"))
                .operatingExpenses(new BigDecimal("400000.00"))
                .build();

        cashFlowService.throwConflictOnCreate = true;

        mockMvc.perform(post("/api/v1/finance/cash-flows")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("PUT /api/v1/finance/cash-flows/{id}: Locked completed record returns 400 Bad Request")
    void updateCashFlow_locked_returns400() throws Exception {
        UpdateCashFlowRequest request = UpdateCashFlowRequest.builder()
                .openingCash(new BigDecimal("1500000.00"))
                .collections(new BigDecimal("2000000.00"))
                .vendorPayments(new BigDecimal("700000.00"))
                .payrollPayments(new BigDecimal("600000.00"))
                .operatingExpenses(new BigDecimal("400000.00"))
                .build();

        cashFlowService.throwLockedOnUpdate = true;

        mockMvc.perform(put("/api/v1/finance/cash-flows/CF-2026-001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Completed periods are locked")));
    }

    @Test
    @DisplayName("GET /api/v1/finance/cash-flows/export: Returns text/csv with attachment header")
    void exportCashFlows_returnsCsvFile() throws Exception {
        mockMvc.perform(get("/api/v1/finance/cash-flows/export"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"cash-flows-export.csv\""))
                .andExpect(content().contentType("text/csv;charset=UTF-8"));
    }
}

