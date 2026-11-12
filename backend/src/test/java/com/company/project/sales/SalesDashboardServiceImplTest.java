package com.company.project.sales;

import com.company.project.dashboard.repository.ContractRepository;
import com.company.project.dashboard.repository.FollowUpItemRepository;
import com.company.project.dashboard.repository.OpportunityRepository;
import com.company.project.proposals.repository.ProposalRepository;
import com.company.project.sales.dto.dashboard.*;
import com.company.project.sales.repository.LeadRepository;
import com.company.project.sales.service.SalesDashboardServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SalesDashboardServiceImpl Unit Tests")
class SalesDashboardServiceImplTest {

    @SuppressWarnings("unchecked")
    private <T> T createMock(Class<T> iface, Map<String, Object> methodReturns) {
        InvocationHandler handler = (proxy, method, args) -> {
            String methodName = method.getName();
            if (methodReturns.containsKey(methodName)) {
                return methodReturns.get(methodName);
            }
            if ("toString".equals(methodName)) {
                return "MockProxy(" + iface.getSimpleName() + ")";
            }
            if ("hashCode".equals(methodName)) {
                return System.identityHashCode(proxy);
            }
            if ("equals".equals(methodName)) {
                return proxy == (args != null && args.length > 0 ? args[0] : null);
            }
            Class<?> returnType = method.getReturnType();
            if (returnType == long.class || returnType == Long.class) return 0L;
            if (returnType == int.class || returnType == Integer.class) return 0;
            if (returnType == double.class || returnType == Double.class) return 0.0;
            if (returnType == boolean.class || returnType == Boolean.class) return false;
            if (returnType == BigDecimal.class) return BigDecimal.ZERO;
            return null;
        };

        return (T) Proxy.newProxyInstance(iface.getClassLoader(), new Class<?>[]{iface}, handler);
    }

    @Test
    @DisplayName("Should return complete sales dashboard matching designer screenshot baseline")
    void testGetDashboardDesignerBaseline() {
        Map<String, Object> leadReturns = new HashMap<>();
        leadReturns.put("countLeadsInPeriod", 997L);
        leadReturns.put("countOpenLeadsInPeriod", 0L);
        leadReturns.put("countWonLeadsInPeriod", 0L);
        leadReturns.put("countLostLeadsInPeriod", 0L);
        leadReturns.put("countDistinctLeadsWithLinkedOpportunities", 997L);
        leadReturns.put("countDistinctLeadsWithLinkedContracts", 0L);
        LeadRepository leadRepo = createMock(LeadRepository.class, leadReturns);

        Map<String, Object> oppReturns = new HashMap<>();
        oppReturns.put("countOpportunitiesInPeriod", 997L);
        oppReturns.put("countOpenOpportunitiesInPeriod", 997L);
        oppReturns.put("sumPipelineValueInPeriod", BigDecimal.ZERO);
        oppReturns.put("sumWeightedPipelineInPeriod", BigDecimal.ZERO);
        oppReturns.put("sumWonOpportunityValueInPeriod", BigDecimal.ZERO);
        oppReturns.put("countDistinctLinkedOpportunitiesByLeadCohort", 997L);
        oppReturns.put("countDistinctOpportunitiesWithLinkedProposals", 0L);
        OpportunityRepository oppRepo = createMock(OpportunityRepository.class, oppReturns);

        Map<String, Object> propReturns = new HashMap<>();
        propReturns.put("countProposalsInPeriod", 0L);
        propReturns.put("countAcceptedProposalsInPeriod", 0L);
        propReturns.put("sumTotalProposalValueInPeriod", BigDecimal.ZERO);
        propReturns.put("sumLinkedProposalsValueByLeadCohort", BigDecimal.ZERO);
        propReturns.put("sumAcceptedProposalValueInPeriod", BigDecimal.ZERO);
        propReturns.put("countDistinctLinkedProposalsByLeadCohort", 0L);
        propReturns.put("countDistinctProposalsWithLinkedContracts", 0L);
        ProposalRepository propRepo = createMock(ProposalRepository.class, propReturns);

        Map<String, Object> contractReturns = new HashMap<>();
        contractReturns.put("countActiveContractsInPeriod", 0L);
        contractReturns.put("countDistinctActiveLinkedContractsByLeadCohort", 0L);
        contractReturns.put("sumActiveContractValueInPeriod", BigDecimal.ZERO);
        contractReturns.put("countDistinctLinkedContractsByLeadCohort", 0L);
        ContractRepository contractRepo = createMock(ContractRepository.class, contractReturns);

        Map<String, Object> followUpReturns = new HashMap<>();
        followUpReturns.put("count", 5L);
        FollowUpItemRepository followUpRepo = createMock(FollowUpItemRepository.class, followUpReturns);

        SalesDashboardServiceImpl service = new SalesDashboardServiceImpl(
                leadRepo, oppRepo, propRepo, contractRepo, followUpRepo
        );

        SalesDashboardResponse response = service.getDashboard(null, null, "Apr 2024 - Mar 2025");

        assertNotNull(response);
        assertEquals("Apr 2024 - Mar 2025", response.getPeriod());
        assertNotNull(response.getLastUpdated());

        // 1. Top KPIs
        SalesDashboardKpisDto kpis = response.getKpis();
        assertEquals(997L, kpis.getTotalLeads());
        assertEquals(997L, kpis.getTotalOpportunities());
        assertEquals(BigDecimal.ZERO, kpis.getTotalProposalsValue());
        assertEquals("₹ 0.00", kpis.getFormattedProposalsValue());
        assertEquals(0L, kpis.getActiveContracts());

        // 2. Leads Performance
        LeadsPerformanceDto leads = response.getPerformance().getLeads();
        assertEquals(997L, leads.getTotalLeads());
        assertEquals(0L, leads.getOpenLeads());
        assertEquals(0L, leads.getWonLeads());
        assertEquals(0.0, leads.getLeadWonPct());
        assertEquals("997.00", leads.getFormattedTotalLeads());
        assertEquals("0.00%", leads.getFormattedLeadWonPct());

        // 3. Opportunities Performance
        OpportunitiesPerformanceDto opps = response.getPerformance().getOpportunities();
        assertEquals(997L, opps.getTotalOpportunities());
        assertEquals(997L, opps.getOpenOpportunities());
        assertEquals("₹ 0.00", opps.getFormattedPipelineValue());

        // 4. Proposals Performance
        ProposalsPerformanceDto props = response.getPerformance().getProposals();
        assertEquals("₹ 0.00", props.getFormattedTotalProposalValue());
        assertEquals("0.00%", props.getFormattedProposalWinRate());

        // 5. Contracts Performance
        ContractsPerformanceDto contracts = response.getPerformance().getContracts();
        assertEquals(0L, contracts.getActiveContracts());
        assertEquals("₹ 0.00", contracts.getFormattedContractedValue());

        // 6. Funnel Stages
        assertEquals(4, response.getFunnelStages().size());
        assertEquals(997L, response.getFunnelStages().get(0).getValue());
        assertEquals(997L, response.getFunnelStages().get(1).getValue());
        assertEquals(0L, response.getFunnelStages().get(2).getValue());
        assertEquals(0L, response.getFunnelStages().get(3).getValue());

        // 7. Conversions
        ConversionOverviewDto conv = response.getConversion();
        assertEquals("100.00%", conv.getLeadToOpportunity());
        assertEquals("0.00%", conv.getOpportunityToProposal());
        assertEquals("0.00%", conv.getProposalToContract());
        assertEquals("0.00%", conv.getOverallConversion());

        // 8. Workflow
        assertEquals(4, response.getWorkflowStages().size());
        assertEquals("Daily Sales Activities", response.getWorkflow().getFollowUpQueueTitle());
        assertEquals(5L, response.getWorkflow().getFollowUpQueueCount());
    }

    @Test
    @DisplayName("Multi-Child Case 1: One lead linked to multiple opportunities (cannot exceed 100%)")
    void testOneLeadLinkedToMultipleOpportunities_DoesNotExceed100Percent() {
        // 1 lead in cohort, but lead has 5 distinct opportunities
        // Parent-record conversion: 1 lead with opportunities / 1 eligible lead = 100.00%
        LeadRepository leadRepo = createMock(LeadRepository.class, Map.of(
                "countLeadsInPeriod", 1L,
                "countDistinctLeadsWithLinkedOpportunities", 1L,
                "countDistinctLeadsWithLinkedContracts", 0L
        ));
        OpportunityRepository oppRepo = createMock(OpportunityRepository.class, Map.of(
                "countDistinctLinkedOpportunitiesByLeadCohort", 5L,
                "countDistinctOpportunitiesWithLinkedProposals", 0L
        ));
        ProposalRepository propRepo = createMock(ProposalRepository.class, Map.of(
                "countDistinctLinkedProposalsByLeadCohort", 0L,
                "countDistinctProposalsWithLinkedContracts", 0L
        ));
        ContractRepository contractRepo = createMock(ContractRepository.class, Map.of(
                "countDistinctLinkedContractsByLeadCohort", 0L
        ));
        FollowUpItemRepository followUpRepo = createMock(FollowUpItemRepository.class, Map.of());

        SalesDashboardServiceImpl service = new SalesDashboardServiceImpl(
                leadRepo, oppRepo, propRepo, contractRepo, followUpRepo
        );

        SalesConversionFunnelDto funnel = service.getFunnel(null, null, "All Period");
        assertEquals(1L, funnel.getStages().get(0).getValue()); // 1 Lead
        assertEquals(5L, funnel.getStages().get(1).getValue()); // 5 Opps
        assertEquals("100.00%", funnel.getConversion().getLeadToOpportunity());
        assertTrue(funnel.getConversion().getRawLeadToOpportunity() <= 100.0);
    }

    @Test
    @DisplayName("Multi-Child Case 2: One opportunity linked to multiple proposals (cannot exceed 100%)")
    void testOneOpportunityLinkedToMultipleProposals_DoesNotExceed100Percent() {
        // 1 lead -> 1 opp -> 4 proposals
        // Parent-record conversion: 1 opp with proposals / 1 eligible opp = 100.00%
        LeadRepository leadRepo = createMock(LeadRepository.class, Map.of(
                "countLeadsInPeriod", 1L,
                "countDistinctLeadsWithLinkedOpportunities", 1L,
                "countDistinctLeadsWithLinkedContracts", 0L
        ));
        OpportunityRepository oppRepo = createMock(OpportunityRepository.class, Map.of(
                "countDistinctLinkedOpportunitiesByLeadCohort", 1L,
                "countDistinctOpportunitiesWithLinkedProposals", 1L
        ));
        ProposalRepository propRepo = createMock(ProposalRepository.class, Map.of(
                "countDistinctLinkedProposalsByLeadCohort", 4L,
                "countDistinctProposalsWithLinkedContracts", 0L
        ));
        ContractRepository contractRepo = createMock(ContractRepository.class, Map.of(
                "countDistinctLinkedContractsByLeadCohort", 0L
        ));
        FollowUpItemRepository followUpRepo = createMock(FollowUpItemRepository.class, Map.of());

        SalesDashboardServiceImpl service = new SalesDashboardServiceImpl(
                leadRepo, oppRepo, propRepo, contractRepo, followUpRepo
        );

        SalesConversionFunnelDto funnel = service.getFunnel(null, null, "All Period");
        assertEquals("100.00%", funnel.getConversion().getOpportunityToProposal());
        assertTrue(funnel.getConversion().getRawOpportunityToProposal() <= 100.0);
    }

    @Test
    @DisplayName("Multi-Child Case 3: One proposal linked to multiple contracts (cannot exceed 100%)")
    void testOneProposalLinkedToMultipleContracts_DoesNotExceed100Percent() {
        // 1 lead -> 1 opp -> 1 prop -> 3 contracts
        // Parent-record conversion: 1 prop with contracts / 1 eligible prop = 100.00%
        LeadRepository leadRepo = createMock(LeadRepository.class, Map.of(
                "countLeadsInPeriod", 1L,
                "countDistinctLeadsWithLinkedOpportunities", 1L,
                "countDistinctLeadsWithLinkedContracts", 1L
        ));
        OpportunityRepository oppRepo = createMock(OpportunityRepository.class, Map.of(
                "countDistinctLinkedOpportunitiesByLeadCohort", 1L,
                "countDistinctOpportunitiesWithLinkedProposals", 1L
        ));
        ProposalRepository propRepo = createMock(ProposalRepository.class, Map.of(
                "countDistinctLinkedProposalsByLeadCohort", 1L,
                "countDistinctProposalsWithLinkedContracts", 1L
        ));
        ContractRepository contractRepo = createMock(ContractRepository.class, Map.of(
                "countDistinctLinkedContractsByLeadCohort", 3L
        ));
        FollowUpItemRepository followUpRepo = createMock(FollowUpItemRepository.class, Map.of());

        SalesDashboardServiceImpl service = new SalesDashboardServiceImpl(
                leadRepo, oppRepo, propRepo, contractRepo, followUpRepo
        );

        SalesConversionFunnelDto funnel = service.getFunnel(null, null, "All Period");
        assertEquals("100.00%", funnel.getConversion().getProposalToContract());
        assertTrue(funnel.getConversion().getRawProposalToContract() <= 100.0);
        assertEquals("100.00%", funnel.getConversion().getOverallConversion());
        assertTrue(funnel.getConversion().getRawOverallConversion() <= 100.0);
    }

    @Test
    @DisplayName("Multi-Branch Traversal: Complex cohort with branches, dropouts, and multi-children")
    void testMultipleBranchesInSameLeadCohort() {
        // Cohort: 10 leads.
        // 6 leads have opportunities (some have 2 opps, total opps = 9)
        // 4 of those 9 opps have proposals (total props = 5)
        // 2 of those 5 props have contracts (total contracts = 3)
        // 2 leads successfully reached a contract
        LeadRepository leadRepo = createMock(LeadRepository.class, Map.of(
                "countLeadsInPeriod", 10L,
                "countDistinctLeadsWithLinkedOpportunities", 6L,
                "countDistinctLeadsWithLinkedContracts", 2L
        ));
        OpportunityRepository oppRepo = createMock(OpportunityRepository.class, Map.of(
                "countDistinctLinkedOpportunitiesByLeadCohort", 9L,
                "countDistinctOpportunitiesWithLinkedProposals", 4L
        ));
        ProposalRepository propRepo = createMock(ProposalRepository.class, Map.of(
                "countDistinctLinkedProposalsByLeadCohort", 5L,
                "countDistinctProposalsWithLinkedContracts", 2L
        ));
        ContractRepository contractRepo = createMock(ContractRepository.class, Map.of(
                "countDistinctLinkedContractsByLeadCohort", 3L
        ));
        FollowUpItemRepository followUpRepo = createMock(FollowUpItemRepository.class, Map.of());

        SalesDashboardServiceImpl service = new SalesDashboardServiceImpl(
                leadRepo, oppRepo, propRepo, contractRepo, followUpRepo
        );

        SalesConversionFunnelDto funnel = service.getFunnel(null, null, "Apr 2024 - Mar 2025");

        assertNotNull(funnel);
        // Stage entity counts
        assertEquals(10L, funnel.getStages().get(0).getValue());
        assertEquals(9L, funnel.getStages().get(1).getValue());
        assertEquals(5L, funnel.getStages().get(2).getValue());
        assertEquals(3L, funnel.getStages().get(3).getValue());

        // Parent-record conversion rates
        ConversionOverviewDto conv = funnel.getConversion();
        assertEquals("60.00%", conv.getLeadToOpportunity());      // 6 leads with opps / 10 leads = 60.00%
        assertEquals("44.44%", conv.getOpportunityToProposal());  // 4 opps with props / 9 opps = 44.44%
        assertEquals("40.00%", conv.getProposalToContract());     // 2 props with contracts / 5 props = 40.00%
        assertEquals("20.00%", conv.getOverallConversion());      // 2 leads with contracts / 10 leads = 20.00%

        assertTrue(conv.getRawLeadToOpportunity() <= 100.0);
        assertTrue(conv.getRawOpportunityToProposal() <= 100.0);
        assertTrue(conv.getRawProposalToContract() <= 100.0);
        assertTrue(conv.getRawOverallConversion() <= 100.0);
    }

    @Test
    @DisplayName("Dropout Scenario 1: Leads without any opportunities")
    void testLeadsWithoutOpportunities() {
        LeadRepository leadRepo = createMock(LeadRepository.class, Map.of(
                "countLeadsInPeriod", 50L,
                "countDistinctLeadsWithLinkedOpportunities", 0L,
                "countDistinctLeadsWithLinkedContracts", 0L
        ));
        OpportunityRepository oppRepo = createMock(OpportunityRepository.class, Map.of(
                "countDistinctLinkedOpportunitiesByLeadCohort", 0L,
                "countDistinctOpportunitiesWithLinkedProposals", 0L
        ));
        ProposalRepository propRepo = createMock(ProposalRepository.class, Map.of(
                "countDistinctLinkedProposalsByLeadCohort", 0L,
                "countDistinctProposalsWithLinkedContracts", 0L
        ));
        ContractRepository contractRepo = createMock(ContractRepository.class, Map.of(
                "countDistinctLinkedContractsByLeadCohort", 0L
        ));
        FollowUpItemRepository followUpRepo = createMock(FollowUpItemRepository.class, Map.of());

        SalesDashboardServiceImpl service = new SalesDashboardServiceImpl(
                leadRepo, oppRepo, propRepo, contractRepo, followUpRepo
        );

        SalesConversionFunnelDto funnel = service.getFunnel(null, null, "Last 30 Days");
        assertEquals("0.00%", funnel.getConversion().getLeadToOpportunity());
        assertEquals("0.00%", funnel.getConversion().getOpportunityToProposal());
        assertEquals("0.00%", funnel.getConversion().getProposalToContract());
        assertEquals("0.00%", funnel.getConversion().getOverallConversion());
    }

    @Test
    @DisplayName("Dropout Scenario 2: Opportunities without proposals")
    void testOpportunitiesWithoutProposals() {
        LeadRepository leadRepo = createMock(LeadRepository.class, Map.of(
                "countLeadsInPeriod", 20L,
                "countDistinctLeadsWithLinkedOpportunities", 10L,
                "countDistinctLeadsWithLinkedContracts", 0L
        ));
        OpportunityRepository oppRepo = createMock(OpportunityRepository.class, Map.of(
                "countDistinctLinkedOpportunitiesByLeadCohort", 10L,
                "countDistinctOpportunitiesWithLinkedProposals", 0L
        ));
        ProposalRepository propRepo = createMock(ProposalRepository.class, Map.of(
                "countDistinctLinkedProposalsByLeadCohort", 0L,
                "countDistinctProposalsWithLinkedContracts", 0L
        ));
        ContractRepository contractRepo = createMock(ContractRepository.class, Map.of(
                "countDistinctLinkedContractsByLeadCohort", 0L
        ));
        FollowUpItemRepository followUpRepo = createMock(FollowUpItemRepository.class, Map.of());

        SalesDashboardServiceImpl service = new SalesDashboardServiceImpl(
                leadRepo, oppRepo, propRepo, contractRepo, followUpRepo
        );

        SalesConversionFunnelDto funnel = service.getFunnel(null, null, "This Quarter");
        assertEquals("50.00%", funnel.getConversion().getLeadToOpportunity());
        assertEquals("0.00%", funnel.getConversion().getOpportunityToProposal());
        assertEquals("0.00%", funnel.getConversion().getProposalToContract());
        assertEquals("0.00%", funnel.getConversion().getOverallConversion());
    }

    @Test
    @DisplayName("Dropout Scenario 3: Proposals without contracts")
    void testProposalsWithoutContracts() {
        LeadRepository leadRepo = createMock(LeadRepository.class, Map.of(
                "countLeadsInPeriod", 20L,
                "countDistinctLeadsWithLinkedOpportunities", 10L,
                "countDistinctLeadsWithLinkedContracts", 0L
        ));
        OpportunityRepository oppRepo = createMock(OpportunityRepository.class, Map.of(
                "countDistinctLinkedOpportunitiesByLeadCohort", 10L,
                "countDistinctOpportunitiesWithLinkedProposals", 5L
        ));
        ProposalRepository propRepo = createMock(ProposalRepository.class, Map.of(
                "countDistinctLinkedProposalsByLeadCohort", 5L,
                "countDistinctProposalsWithLinkedContracts", 0L
        ));
        ContractRepository contractRepo = createMock(ContractRepository.class, Map.of(
                "countDistinctLinkedContractsByLeadCohort", 0L
        ));
        FollowUpItemRepository followUpRepo = createMock(FollowUpItemRepository.class, Map.of());

        SalesDashboardServiceImpl service = new SalesDashboardServiceImpl(
                leadRepo, oppRepo, propRepo, contractRepo, followUpRepo
        );

        SalesConversionFunnelDto funnel = service.getFunnel(null, null, "All Period");
        assertEquals("50.00%", funnel.getConversion().getLeadToOpportunity());
        assertEquals("50.00%", funnel.getConversion().getOpportunityToProposal());
        assertEquals("0.00%", funnel.getConversion().getProposalToContract());
        assertEquals("0.00%", funnel.getConversion().getOverallConversion());
    }

    @Test
    @DisplayName("Empty Reporting Periods: Division by zero is completely guarded")
    void testEmptyReportingPeriods() {
        LeadRepository leadRepo = createMock(LeadRepository.class, Map.of("countLeadsInPeriod", 0L));
        OpportunityRepository oppRepo = createMock(OpportunityRepository.class, Map.of("countDistinctLinkedOpportunitiesByLeadCohort", 0L));
        ProposalRepository propRepo = createMock(ProposalRepository.class, Map.of("countDistinctLinkedProposalsByLeadCohort", 0L));
        ContractRepository contractRepo = createMock(ContractRepository.class, Map.of("countDistinctLinkedContractsByLeadCohort", 0L));
        FollowUpItemRepository followUpRepo = createMock(FollowUpItemRepository.class, Map.of());

        SalesDashboardServiceImpl service = new SalesDashboardServiceImpl(
                leadRepo, oppRepo, propRepo, contractRepo, followUpRepo
        );

        SalesConversionFunnelDto funnel = service.getFunnel(null, null, "All Period");

        assertNotNull(funnel);
        assertEquals("0.00%", funnel.getConversion().getLeadToOpportunity());
        assertEquals("0.00%", funnel.getConversion().getOpportunityToProposal());
        assertEquals("0.00%", funnel.getConversion().getProposalToContract());
        assertEquals("0.00%", funnel.getConversion().getOverallConversion());
    }

    @Test
    @DisplayName("Should export valid UTF-8 BOM CSV containing all report sections")
    void testExportCsv() {
        Map<String, Object> leadReturns = new HashMap<>();
        leadReturns.put("countLeadsInPeriod", 50L);
        leadReturns.put("countOpenLeadsInPeriod", 20L);
        leadReturns.put("countWonLeadsInPeriod", 10L);
        leadReturns.put("countLostLeadsInPeriod", 20L);
        leadReturns.put("countDistinctLeadsWithLinkedOpportunities", 30L);
        leadReturns.put("countDistinctLeadsWithLinkedContracts", 4L);
        LeadRepository leadRepo = createMock(LeadRepository.class, leadReturns);

        Map<String, Object> oppReturns = new HashMap<>();
        oppReturns.put("countOpportunitiesInPeriod", 30L);
        oppReturns.put("countOpenOpportunitiesInPeriod", 15L);
        oppReturns.put("sumPipelineValueInPeriod", new BigDecimal("500000.00"));
        oppReturns.put("sumWeightedPipelineInPeriod", new BigDecimal("250000.00"));
        oppReturns.put("sumWonOpportunityValueInPeriod", new BigDecimal("100000.00"));
        oppReturns.put("countDistinctLinkedOpportunitiesByLeadCohort", 30L);
        oppReturns.put("countDistinctOpportunitiesWithLinkedProposals", 10L);
        OpportunityRepository oppRepo = createMock(OpportunityRepository.class, oppReturns);

        Map<String, Object> propReturns = new HashMap<>();
        propReturns.put("countProposalsInPeriod", 10L);
        propReturns.put("countAcceptedProposalsInPeriod", 5L);
        propReturns.put("sumTotalProposalValueInPeriod", new BigDecimal("300000.00"));
        propReturns.put("sumLinkedProposalsValueByLeadCohort", new BigDecimal("300000.00"));
        propReturns.put("sumAcceptedProposalValueInPeriod", new BigDecimal("150000.00"));
        propReturns.put("countDistinctLinkedProposalsByLeadCohort", 10L);
        propReturns.put("countDistinctProposalsWithLinkedContracts", 4L);
        ProposalRepository propRepo = createMock(ProposalRepository.class, propReturns);

        Map<String, Object> contractReturns = new HashMap<>();
        contractReturns.put("countActiveContractsInPeriod", 4L);
        contractReturns.put("countDistinctActiveLinkedContractsByLeadCohort", 4L);
        contractReturns.put("sumActiveContractValueInPeriod", new BigDecimal("120000.00"));
        contractReturns.put("countDistinctLinkedContractsByLeadCohort", 4L);
        ContractRepository contractRepo = createMock(ContractRepository.class, contractReturns);

        FollowUpItemRepository followUpRepo = createMock(FollowUpItemRepository.class, Map.of());

        SalesDashboardServiceImpl service = new SalesDashboardServiceImpl(
                leadRepo, oppRepo, propRepo, contractRepo, followUpRepo
        );

        byte[] csvBytes = service.exportCsv(null, null, "Apr 2024 - Mar 2025");

        assertNotNull(csvBytes);
        assertTrue(csvBytes.length > 0);

        // Check UTF-8 BOM bytes (EF BB BF)
        assertEquals((byte) 0xEF, csvBytes[0]);
        assertEquals((byte) 0xBB, csvBytes[1]);
        assertEquals((byte) 0xBF, csvBytes[2]);

        String csvContent = new String(csvBytes, 3, csvBytes.length - 3, StandardCharsets.UTF_8);
        assertTrue(csvContent.contains("KALPANAAA CMS - Sales Performance & Pipeline Report"));
        assertTrue(csvContent.contains("DASHBOARD KEY PERFORMANCE INDICATORS"));
        assertTrue(csvContent.contains("LEADS PERFORMANCE"));
        assertTrue(csvContent.contains("OPPORTUNITIES PERFORMANCE"));
        assertTrue(csvContent.contains("PROPOSALS PERFORMANCE"));
        assertTrue(csvContent.contains("CONTRACTS PERFORMANCE"));
        assertTrue(csvContent.contains("RELATIONSHIP-BASED SALES CONVERSION FUNNEL"));
        assertTrue(csvContent.contains("CONVERSION OVERVIEW"));
    }

    @Test
    @DisplayName("Should return standalone KPIs DTO correctly")
    void testGetKpisEndpoint() {
        LeadRepository leadRepo = createMock(LeadRepository.class, Map.of("countLeadsInPeriod", 150L));
        OpportunityRepository oppRepo = createMock(OpportunityRepository.class, Map.of("countDistinctLinkedOpportunitiesByLeadCohort", 120L));
        ProposalRepository propRepo = createMock(ProposalRepository.class, Map.of("sumLinkedProposalsValueByLeadCohort", new BigDecimal("450000.00")));
        ContractRepository contractRepo = createMock(ContractRepository.class, Map.of("countDistinctActiveLinkedContractsByLeadCohort", 25L));
        FollowUpItemRepository followUpRepo = createMock(FollowUpItemRepository.class, Map.of());

        SalesDashboardServiceImpl service = new SalesDashboardServiceImpl(
                leadRepo, oppRepo, propRepo, contractRepo, followUpRepo
        );

        SalesDashboardKpisDto kpis = service.getKpis(null, null, "Last 30 Days");
        assertEquals(150L, kpis.getTotalLeads());
        assertEquals(120L, kpis.getTotalOpportunities());
        assertEquals(new BigDecimal("450000.00"), kpis.getTotalProposalsValue());
        assertEquals("₹ 4,50,000.00", kpis.getFormattedProposalsValue());
        assertEquals(25L, kpis.getActiveContracts());
    }
}
