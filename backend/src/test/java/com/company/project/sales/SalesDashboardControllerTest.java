package com.company.project.sales;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.sales.controller.SalesDashboardController;
import com.company.project.sales.dto.dashboard.*;
import com.company.project.sales.service.SalesDashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("SalesDashboardController Unit Tests")
class SalesDashboardControllerTest {

    private MockMvc mockMvc;
    private final Map<String, Object> serviceReturns = new HashMap<>();

    @BeforeEach
    void setUp() {
        serviceReturns.clear();

        InvocationHandler handler = (proxy, method, args) -> {
            String name = method.getName();
            if (serviceReturns.containsKey(name)) {
                return serviceReturns.get(name);
            }
            return null;
        };

        SalesDashboardService mockService = (SalesDashboardService) Proxy.newProxyInstance(
                SalesDashboardService.class.getClassLoader(),
                new Class<?>[]{SalesDashboardService.class},
                handler
        );

        SalesDashboardController controller = new SalesDashboardController(mockService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/reports/sales-dashboard returns 200 with complete dashboard payload")
    void testGetDashboard() throws Exception {
        SalesDashboardResponse mockResponse = SalesDashboardResponse.builder()
                .period("Apr 2024 - Mar 2025")
                .lastUpdated("11 Nov 2026, 03:00 PM")
                .kpis(SalesDashboardKpisDto.builder()
                        .totalLeads(997L)
                        .totalOpportunities(997L)
                        .totalProposalsValue(BigDecimal.ZERO)
                        .formattedProposalsValue("₹ 0.00")
                        .activeContracts(0L)
                        .build())
                .performance(SalesPerformanceDto.builder()
                        .leads(LeadsPerformanceDto.builder()
                                .totalLeads(997L)
                                .openLeads(0L)
                                .wonLeads(0L)
                                .lostLeads(0L)
                                .leadWonPct(0.0)
                                .formattedTotalLeads("997.00")
                                .formattedOpenLeads("0.00")
                                .formattedWonLeads("0.00")
                                .formattedLeadWonPct("0.00%")
                                .build())
                        .build())
                .funnelStages(List.of(
                        FunnelStageDto.builder().id("leads").label("LEADS").value(997L).build(),
                        FunnelStageDto.builder().id("opportunities").label("OPPORTUNITIES").value(997L).build()
                ))
                .conversion(ConversionOverviewDto.builder()
                        .leadToOpportunity("100.00%")
                        .opportunityToProposal("0.00%")
                        .proposalToContract("0.00%")
                        .overallConversion("0.00%")
                        .build())
                .build();

        serviceReturns.put("getDashboard", mockResponse);

        mockMvc.perform(get("/api/v1/reports/sales-dashboard")
                        .param("period", "Apr 2024 - Mar 2025")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.period").value("Apr 2024 - Mar 2025"))
                .andExpect(jsonPath("$.data.kpis.totalLeads").value(997))
                .andExpect(jsonPath("$.data.kpis.totalOpportunities").value(997))
                .andExpect(jsonPath("$.data.kpis.formattedProposalsValue").value("₹ 0.00"))
                .andExpect(jsonPath("$.data.conversion.leadToOpportunity").value("100.00%"));
    }

    @Test
    @DisplayName("GET /api/v1/reports/sales-dashboard/kpis returns 200 with top 4 KPIs")
    void testGetKpis() throws Exception {
        SalesDashboardKpisDto mockKpis = SalesDashboardKpisDto.builder()
                .totalLeads(997L)
                .totalOpportunities(997L)
                .totalProposalsValue(BigDecimal.ZERO)
                .formattedProposalsValue("₹ 0.00")
                .activeContracts(0L)
                .build();

        serviceReturns.put("getKpis", mockKpis);

        mockMvc.perform(get("/api/v1/reports/sales-dashboard/kpis")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalLeads").value(997))
                .andExpect(jsonPath("$.data.totalOpportunities").value(997))
                .andExpect(jsonPath("$.data.activeContracts").value(0));
    }

    @Test
    @DisplayName("GET /api/v1/reports/sales-dashboard/performance returns 200 with 4 performance cards")
    void testGetPerformance() throws Exception {
        SalesPerformanceDto mockPerformance = SalesPerformanceDto.builder()
                .leads(LeadsPerformanceDto.builder()
                        .totalLeads(997L)
                        .formattedLeadWonPct("0.00%")
                        .build())
                .opportunities(OpportunitiesPerformanceDto.builder()
                        .totalOpportunities(997L)
                        .formattedPipelineValue("₹ 0.00")
                        .build())
                .proposals(ProposalsPerformanceDto.builder()
                        .totalProposalValue(BigDecimal.ZERO)
                        .formattedProposalWinRate("0.00%")
                        .build())
                .contracts(ContractsPerformanceDto.builder()
                        .activeContracts(0L)
                        .formattedContractedValue("₹ 0.00")
                        .build())
                .build();

        serviceReturns.put("getPerformance", mockPerformance);

        mockMvc.perform(get("/api/v1/reports/sales-dashboard/performance")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.leads.totalLeads").value(997))
                .andExpect(jsonPath("$.data.opportunities.totalOpportunities").value(997))
                .andExpect(jsonPath("$.data.contracts.activeContracts").value(0));
    }

    @Test
    @DisplayName("GET /api/v1/reports/sales-dashboard/funnel returns 200 with conversion funnel")
    void testGetFunnel() throws Exception {
        SalesConversionFunnelDto mockFunnel = SalesConversionFunnelDto.builder()
                .stages(List.of(
                        FunnelStageDto.builder().id("leads").label("LEADS").value(997L).build(),
                        FunnelStageDto.builder().id("opportunities").label("OPPORTUNITIES").value(997L).build(),
                        FunnelStageDto.builder().id("proposals").label("PROPOSALS").value(0L).build(),
                        FunnelStageDto.builder().id("contracts").label("CONTRACTS").value(0L).build()
                ))
                .conversion(ConversionOverviewDto.builder()
                        .leadToOpportunity("100.00%")
                        .opportunityToProposal("0.00%")
                        .proposalToContract("0.00%")
                        .overallConversion("0.00%")
                        .build())
                .build();

        serviceReturns.put("getFunnel", mockFunnel);

        mockMvc.perform(get("/api/v1/reports/sales-dashboard/funnel")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.stages[0].value").value(997))
                .andExpect(jsonPath("$.data.stages[1].value").value(997))
                .andExpect(jsonPath("$.data.conversion.leadToOpportunity").value("100.00%"));
    }

    @Test
    @DisplayName("GET /api/v1/reports/sales-dashboard/export returns 200 with text/csv attachment")
    void testExportCsv() throws Exception {
        byte[] csvBytes = "KALPANAAA CMS - Sales Performance\n".getBytes(StandardCharsets.UTF_8);
        serviceReturns.put("exportCsv", csvBytes);

        mockMvc.perform(get("/api/v1/reports/sales-dashboard/export")
                        .param("period", "Apr 2024 - Mar 2025"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, org.hamcrest.Matchers.containsString("attachment; filename=\"sales_performance_report_")))
                .andExpect(content().contentType("text/csv;charset=UTF-8"))
                .andExpect(content().bytes(csvBytes));
    }
}
