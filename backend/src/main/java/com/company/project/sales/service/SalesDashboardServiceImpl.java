package com.company.project.sales.service;

import com.company.project.dashboard.repository.ContractRepository;
import com.company.project.dashboard.repository.FollowUpItemRepository;
import com.company.project.dashboard.repository.OpportunityRepository;
import com.company.project.proposals.repository.ProposalRepository;
import com.company.project.sales.dto.dashboard.*;
import com.company.project.sales.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesDashboardServiceImpl implements SalesDashboardService {

    private final LeadRepository leadRepository;
    private final OpportunityRepository opportunityRepository;
    private final ProposalRepository proposalRepository;
    private final ContractRepository contractRepository;
    private final FollowUpItemRepository followUpItemRepository;

    private static final DateTimeFormatter LAST_UPDATED_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH);

    @Override
    @Transactional(readOnly = true)
    public SalesDashboardResponse getDashboard(String startDate, String endDate, String period) {
        SalesDashboardPeriodParser.DateRange range = SalesDashboardPeriodParser.parse(startDate, endDate, period);
        String lastUpdated = LocalDateTime.now().format(LAST_UPDATED_FORMATTER);

        SalesDashboardKpisDto kpis = calculateKpis(range);
        SalesPerformanceDto performance = calculatePerformance(range);
        SalesConversionFunnelDto funnel = calculateFunnel(range);
        SalesWorkflowDto workflow = buildWorkflow();

        return SalesDashboardResponse.builder()
                .period(range.periodLabel())
                .lastUpdated(lastUpdated)
                .kpis(kpis)
                .performance(performance)
                .funnelStages(funnel.getStages())
                .conversion(funnel.getConversion())
                .funnel(funnel)
                .workflowStages(workflow.getStages())
                .workflow(workflow)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SalesDashboardKpisDto getKpis(String startDate, String endDate, String period) {
        SalesDashboardPeriodParser.DateRange range = SalesDashboardPeriodParser.parse(startDate, endDate, period);
        return calculateKpis(range);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesPerformanceDto getPerformance(String startDate, String endDate, String period) {
        SalesDashboardPeriodParser.DateRange range = SalesDashboardPeriodParser.parse(startDate, endDate, period);
        return calculatePerformance(range);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesConversionFunnelDto getFunnel(String startDate, String endDate, String period) {
        SalesDashboardPeriodParser.DateRange range = SalesDashboardPeriodParser.parse(startDate, endDate, period);
        return calculateFunnel(range);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCsv(String startDate, String endDate, String period) {
        SalesDashboardResponse dashboard = getDashboard(startDate, endDate, period);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (PrintWriter writer = new PrintWriter(baos, true, StandardCharsets.UTF_8)) {
            // Write UTF-8 BOM so Microsoft Excel correctly renders currency symbols (₹) and unicode arrows
            baos.write(0xEF);
            baos.write(0xBB);
            baos.write(0xBF);

            // Report Header
            writer.println("KALPANAAA CMS - Sales Performance & Pipeline Report");
            writer.println("Reporting Period," + SalesDashboardFormatUtil.escapeCsvField(dashboard.getPeriod()));
            writer.println("Generated At," + SalesDashboardFormatUtil.escapeCsvField(dashboard.getLastUpdated()));
            writer.println();

            // 1. KPI Cards Summary
            writer.println("--- 1. DASHBOARD KEY PERFORMANCE INDICATORS ---");
            writer.println("Metric,Raw Value,Formatted Value");
            writer.println("Total Leads," + dashboard.getKpis().getTotalLeads() + "," + SalesDashboardFormatUtil.escapeCsvField(dashboard.getKpis().getTotalLeads()));
            writer.println("Total Opportunities," + dashboard.getKpis().getTotalOpportunities() + "," + SalesDashboardFormatUtil.escapeCsvField(dashboard.getKpis().getTotalOpportunities()));
            writer.println("Total Proposals (Value)," + dashboard.getKpis().getTotalProposalsValue() + "," + SalesDashboardFormatUtil.escapeCsvField(dashboard.getKpis().getFormattedProposalsValue()));
            writer.println("Active Contracts," + dashboard.getKpis().getActiveContracts() + "," + SalesDashboardFormatUtil.escapeCsvField(dashboard.getKpis().getActiveContracts()));
            writer.println();

            // 2. Leads Performance
            LeadsPerformanceDto leads = dashboard.getPerformance().getLeads();
            writer.println("--- 2. LEADS PERFORMANCE ---");
            writer.println("Metric,Raw Value,Formatted Value");
            writer.println("Total Leads," + leads.getTotalLeads() + "," + SalesDashboardFormatUtil.escapeCsvField(leads.getFormattedTotalLeads()));
            writer.println("Open Leads," + leads.getOpenLeads() + "," + SalesDashboardFormatUtil.escapeCsvField(leads.getFormattedOpenLeads()));
            writer.println("Won Leads," + leads.getWonLeads() + "," + SalesDashboardFormatUtil.escapeCsvField(leads.getFormattedWonLeads()));
            writer.println("Lead -> Won %," + leads.getLeadWonPct() + "%," + SalesDashboardFormatUtil.escapeCsvField(leads.getFormattedLeadWonPct()));
            writer.println();

            // 3. Opportunities Performance
            OpportunitiesPerformanceDto opps = dashboard.getPerformance().getOpportunities();
            writer.println("--- 3. OPPORTUNITIES PERFORMANCE ---");
            writer.println("Metric,Raw Value,Formatted Value");
            writer.println("Total Opportunities," + opps.getTotalOpportunities() + "," + SalesDashboardFormatUtil.escapeCsvField(opps.getFormattedTotalOpportunities()));
            writer.println("Open Opportunities," + opps.getOpenOpportunities() + "," + SalesDashboardFormatUtil.escapeCsvField(opps.getFormattedOpenOpportunities()));
            writer.println("Pipeline Value," + opps.getPipelineValue() + "," + SalesDashboardFormatUtil.escapeCsvField(opps.getFormattedPipelineValue()));
            writer.println("Weighted Pipeline," + opps.getWeightedPipeline() + "," + SalesDashboardFormatUtil.escapeCsvField(opps.getFormattedWeightedPipeline()));
            writer.println("Won Opportunity Value," + opps.getWonOpportunityValue() + "," + SalesDashboardFormatUtil.escapeCsvField(opps.getFormattedWonOpportunityValue()));
            writer.println();

            // 4. Proposals Performance
            ProposalsPerformanceDto props = dashboard.getPerformance().getProposals();
            writer.println("--- 4. PROPOSALS PERFORMANCE ---");
            writer.println("Metric,Raw Value,Formatted Value");
            writer.println("Total Proposal Value," + props.getTotalProposalValue() + "," + SalesDashboardFormatUtil.escapeCsvField(props.getFormattedTotalProposalValue()));
            writer.println("Accepted Proposal Value," + props.getAcceptedProposalValue() + "," + SalesDashboardFormatUtil.escapeCsvField(props.getFormattedAcceptedProposalValue()));
            writer.println("Proposal Win Rate," + props.getProposalWinRate() + "%," + SalesDashboardFormatUtil.escapeCsvField(props.getFormattedProposalWinRate()));
            writer.println();

            // 5. Contracts Performance
            ContractsPerformanceDto contracts = dashboard.getPerformance().getContracts();
            writer.println("--- 5. CONTRACTS PERFORMANCE ---");
            writer.println("Metric,Raw Value,Formatted Value");
            writer.println("Active Contracts," + contracts.getActiveContracts() + "," + SalesDashboardFormatUtil.escapeCsvField(contracts.getFormattedActiveContracts()));
            writer.println("Contracted Value," + contracts.getContractedValue() + "," + SalesDashboardFormatUtil.escapeCsvField(contracts.getFormattedContractedValue()));
            writer.println();

            // 6. Relationship-Based Sales Conversion Funnel
            writer.println("--- 6. RELATIONSHIP-BASED SALES CONVERSION FUNNEL ---");
            writer.println("Stage,Linked Distinct Records");
            for (FunnelStageDto stage : dashboard.getFunnelStages()) {
                writer.println(SalesDashboardFormatUtil.escapeCsvField(stage.getLabel()) + "," + stage.getValue());
            }
            writer.println();

            // 7. Conversion Overview
            ConversionOverviewDto conv = dashboard.getConversion();
            writer.println("--- 7. CONVERSION OVERVIEW ---");
            writer.println("Transition,Conversion Rate");
            writer.println("Lead -> Opportunity," + SalesDashboardFormatUtil.escapeCsvField(conv.getLeadToOpportunity()));
            writer.println("Opportunity -> Proposal," + SalesDashboardFormatUtil.escapeCsvField(conv.getOpportunityToProposal()));
            writer.println("Proposal -> Contract," + SalesDashboardFormatUtil.escapeCsvField(conv.getProposalToContract()));
            writer.println("Overall Conversion," + SalesDashboardFormatUtil.escapeCsvField(conv.getOverallConversion()));

            writer.flush();
        }

        return baos.toByteArray();
    }

    private static final LocalDate DEFAULT_ALL_START = LocalDate.of(1970, 1, 1);
    private static final LocalDate DEFAULT_ALL_END = LocalDate.of(2099, 12, 31);

    private LocalDate getEffectiveStartDate(SalesDashboardPeriodParser.DateRange range) {
        return range.startDate() != null ? range.startDate() : DEFAULT_ALL_START;
    }

    private LocalDate getEffectiveEndDate(SalesDashboardPeriodParser.DateRange range) {
        return range.endDate() != null ? range.endDate() : DEFAULT_ALL_END;
    }

    private LocalDateTime getEffectiveStartDateTime(SalesDashboardPeriodParser.DateRange range) {
        return range.getStartDateTime() != null ? range.getStartDateTime() : DEFAULT_ALL_START.atStartOfDay();
    }

    private LocalDateTime getEffectiveEndExclusiveDateTime(SalesDashboardPeriodParser.DateRange range) {
        return range.getEndExclusiveDateTime() != null ? range.getEndExclusiveDateTime() : DEFAULT_ALL_END.plusDays(1).atStartOfDay();
    }

    private SalesDashboardKpisDto calculateKpis(SalesDashboardPeriodParser.DateRange range) {
        LocalDate start = getEffectiveStartDate(range);
        LocalDate end = getEffectiveEndDate(range);

        // Common reporting cohort: based on leads.lead_date and relationship traversal
        long totalLeads = leadRepository.countLeadsInPeriod(start, end);
        long totalOpportunities = opportunityRepository.countDistinctLinkedOpportunitiesByLeadCohort(start, end);
        BigDecimal totalProposalsValue = proposalRepository.sumLinkedProposalsValueByLeadCohort(start, end);
        long activeContracts = contractRepository.countDistinctActiveLinkedContractsByLeadCohort(start, end);

        return SalesDashboardKpisDto.builder()
                .totalLeads(totalLeads)
                .totalOpportunities(totalOpportunities)
                .totalProposalsValue(totalProposalsValue)
                .formattedProposalsValue(SalesDashboardFormatUtil.formatCurrencyINR(totalProposalsValue))
                .activeContracts(activeContracts)
                .build();
    }

    private SalesPerformanceDto calculatePerformance(SalesDashboardPeriodParser.DateRange range) {
        LocalDate start = getEffectiveStartDate(range);
        LocalDate end = getEffectiveEndDate(range);
        LocalDateTime startDt = getEffectiveStartDateTime(range);
        LocalDateTime endDt = getEffectiveEndExclusiveDateTime(range);

        // 1. Leads
        long totalLeads = leadRepository.countLeadsInPeriod(start, end);
        long openLeads = leadRepository.countOpenLeadsInPeriod(start, end);
        long wonLeads = leadRepository.countWonLeadsInPeriod(start, end);
        long lostLeads = leadRepository.countLostLeadsInPeriod(start, end);
        double leadWonPct = totalLeads > 0 ? ((double) wonLeads / (double) totalLeads) * 100.0 : 0.0;

        LeadsPerformanceDto leadsDto = LeadsPerformanceDto.builder()
                .totalLeads(totalLeads)
                .openLeads(openLeads)
                .wonLeads(wonLeads)
                .lostLeads(lostLeads)
                .leadWonPct(roundTwoDecimals(leadWonPct))
                .formattedTotalLeads(SalesDashboardFormatUtil.formatDecimal(totalLeads))
                .formattedOpenLeads(SalesDashboardFormatUtil.formatDecimal(openLeads))
                .formattedWonLeads(SalesDashboardFormatUtil.formatDecimal(wonLeads))
                .formattedLeadWonPct(SalesDashboardFormatUtil.formatPercentage(leadWonPct))
                .build();

        // 2. Opportunities
        long totalOpportunities = opportunityRepository.countOpportunitiesInPeriod(startDt, endDt);
        long openOpportunities = opportunityRepository.countOpenOpportunitiesInPeriod(startDt, endDt);
        BigDecimal pipelineValue = opportunityRepository.sumPipelineValueInPeriod(startDt, endDt);
        BigDecimal weightedPipeline = opportunityRepository.sumWeightedPipelineInPeriod(startDt, endDt);
        BigDecimal wonOpportunityValue = opportunityRepository.sumWonOpportunityValueInPeriod(startDt, endDt);

        OpportunitiesPerformanceDto oppsDto = OpportunitiesPerformanceDto.builder()
                .totalOpportunities(totalOpportunities)
                .openOpportunities(openOpportunities)
                .pipelineValue(pipelineValue)
                .weightedPipeline(weightedPipeline)
                .wonOpportunityValue(wonOpportunityValue)
                .formattedTotalOpportunities(SalesDashboardFormatUtil.formatDecimal(totalOpportunities))
                .formattedOpenOpportunities(SalesDashboardFormatUtil.formatDecimal(openOpportunities))
                .formattedPipelineValue(SalesDashboardFormatUtil.formatCurrencyINR(pipelineValue))
                .formattedWeightedPipeline(SalesDashboardFormatUtil.formatCurrencyINR(weightedPipeline))
                .formattedWonOpportunityValue(SalesDashboardFormatUtil.formatCurrencyINR(wonOpportunityValue))
                .build();

        // 3. Proposals
        long totalProposals = proposalRepository.countProposalsInPeriod(start, end);
        long acceptedProposals = proposalRepository.countAcceptedProposalsInPeriod(start, end);
        BigDecimal totalProposalValue = proposalRepository.sumTotalProposalValueInPeriod(start, end);
        BigDecimal acceptedProposalValue = proposalRepository.sumAcceptedProposalValueInPeriod(start, end);
        double proposalWinRate = totalProposals > 0 ? ((double) acceptedProposals / (double) totalProposals) * 100.0 : 0.0;

        ProposalsPerformanceDto proposalsDto = ProposalsPerformanceDto.builder()
                .totalProposalValue(totalProposalValue)
                .acceptedProposalValue(acceptedProposalValue)
                .proposalWinRate(roundTwoDecimals(proposalWinRate))
                .formattedTotalProposalValue(SalesDashboardFormatUtil.formatCurrencyINR(totalProposalValue))
                .formattedAcceptedProposalValue(SalesDashboardFormatUtil.formatCurrencyINR(acceptedProposalValue))
                .formattedProposalWinRate(SalesDashboardFormatUtil.formatPercentage(proposalWinRate))
                .build();

        // 4. Contracts
        long activeContracts = contractRepository.countActiveContractsInPeriod(startDt, endDt);
        BigDecimal contractedValue = contractRepository.sumActiveContractValueInPeriod(startDt, endDt);

        ContractsPerformanceDto contractsDto = ContractsPerformanceDto.builder()
                .activeContracts(activeContracts)
                .contractedValue(contractedValue)
                .formattedActiveContracts(SalesDashboardFormatUtil.formatDecimal(activeContracts))
                .formattedContractedValue(SalesDashboardFormatUtil.formatCurrencyINR(contractedValue))
                .build();

        return SalesPerformanceDto.builder()
                .leads(leadsDto)
                .opportunities(oppsDto)
                .proposals(proposalsDto)
                .contracts(contractsDto)
                .build();
    }

    private SalesConversionFunnelDto calculateFunnel(SalesDashboardPeriodParser.DateRange range) {
        LocalDate start = getEffectiveStartDate(range);
        LocalDate end = getEffectiveEndDate(range);

        // Funnel Stage 1: Eligible leads in date cohort
        long funnelLeads = leadRepository.countLeadsInPeriod(start, end);

        // Funnel Stage 2: Distinct opportunities linked to eligible leads
        long funnelOpps = opportunityRepository.countDistinctLinkedOpportunitiesByLeadCohort(start, end);

        // Funnel Stage 3: Distinct proposals linked to those opportunities
        long funnelProps = proposalRepository.countDistinctLinkedProposalsByLeadCohort(start, end);

        // Funnel Stage 4: Distinct contracts linked to those proposals
        long funnelContracts = contractRepository.countDistinctLinkedContractsByLeadCohort(start, end);

        // Parent-record conversion counts (strictly prevents > 100% when a parent has multiple children)
        // 1. Distinct eligible leads with at least one linked opportunity
        long leadsWithOpps = leadRepository.countDistinctLeadsWithLinkedOpportunities(start, end);

        // 2. Distinct eligible opportunities with at least one linked proposal
        long oppsWithProps = opportunityRepository.countDistinctOpportunitiesWithLinkedProposals(start, end);

        // 3. Distinct eligible proposals with at least one linked contract
        long propsWithContracts = proposalRepository.countDistinctProposalsWithLinkedContracts(start, end);

        // 4. Distinct eligible leads with at least one linked contract (Overall Conversion)
        long leadsWithContracts = leadRepository.countDistinctLeadsWithLinkedContracts(start, end);

        // Conversions using parent-record conversion formulas with zero-denominator safety guards
        double leadToOpp = funnelLeads > 0 ? ((double) leadsWithOpps / (double) funnelLeads) * 100.0 : 0.0;
        double oppToProp = funnelOpps > 0 ? ((double) oppsWithProps / (double) funnelOpps) * 100.0 : 0.0;
        double propToContract = funnelProps > 0 ? ((double) propsWithContracts / (double) funnelProps) * 100.0 : 0.0;
        double overallConversion = funnelLeads > 0 ? ((double) leadsWithContracts / (double) funnelLeads) * 100.0 : 0.0;

        ConversionOverviewDto conversion = ConversionOverviewDto.builder()
                .leadToOpportunity(SalesDashboardFormatUtil.formatPercentage(leadToOpp))
                .opportunityToProposal(SalesDashboardFormatUtil.formatPercentage(oppToProp))
                .proposalToContract(SalesDashboardFormatUtil.formatPercentage(propToContract))
                .overallConversion(SalesDashboardFormatUtil.formatPercentage(overallConversion))
                .rawLeadToOpportunity(roundTwoDecimals(leadToOpp))
                .rawOpportunityToProposal(roundTwoDecimals(oppToProp))
                .rawProposalToContract(roundTwoDecimals(propToContract))
                .rawOverallConversion(roundTwoDecimals(overallConversion))
                .build();

        List<FunnelStageDto> stages = List.of(
                FunnelStageDto.builder()
                        .id("leads")
                        .label("LEADS")
                        .sublabel("LEADS")
                        .value(funnelLeads)
                        .color("#4F46E5")
                        .textColor("#FFFFFF")
                        .subtextColor("#E0E7FF")
                        .build(),
                FunnelStageDto.builder()
                        .id("opportunities")
                        .label("OPPORTUNITIES")
                        .sublabel("OPPORTUNITIES")
                        .value(funnelOpps)
                        .color("#717DF5")
                        .textColor("#FFFFFF")
                        .subtextColor("#E0E7FF")
                        .build(),
                FunnelStageDto.builder()
                        .id("proposals")
                        .label("PROPOSALS")
                        .sublabel("PROPOSALS")
                        .value(funnelProps)
                        .color("#9CA8F7")
                        .textColor("#0F172A")
                        .subtextColor("#334155")
                        .build(),
                FunnelStageDto.builder()
                        .id("contracts")
                        .label("CONTRACTS")
                        .sublabel("CONTRACTS")
                        .value(funnelContracts)
                        .color("#DCE4FD")
                        .textColor("#0F172A")
                        .subtextColor("#334155")
                        .build()
        );

        return SalesConversionFunnelDto.builder()
                .stages(stages)
                .conversion(conversion)
                .build();
    }

    private SalesWorkflowDto buildWorkflow() {
        List<WorkflowStageDto> stages = new ArrayList<>();
        stages.add(WorkflowStageDto.builder()
                .id("lead")
                .title("Lead")
                .description("Capture and qualify potential customers.")
                .badgeBg("#F1E8FE")
                .badgeText("#8B5CF6")
                .cardBg("#F8F5FF")
                .cardBorder("#EDE4FF")
                .build());

        stages.add(WorkflowStageDto.builder()
                .id("opportunity")
                .title("Opportunity")
                .description("Develop and pursue qualified business opportunities.")
                .badgeBg("#E2F1FE")
                .badgeText("#0284C7")
                .cardBg("#F0F8FF")
                .cardBorder("#E1F0FD")
                .build());

        stages.add(WorkflowStageDto.builder()
                .id("proposal")
                .title("Proposal")
                .description("Create and share commercial proposals with clients.")
                .badgeBg("#FEF3C7")
                .badgeText("#D97706")
                .cardBg("#FFFDF0")
                .cardBorder("#FDF0B5")
                .build());

        stages.add(WorkflowStageDto.builder()
                .id("contract")
                .title("Contract")
                .description("Convert accepted proposals into active contracts.")
                .badgeBg("#D7F7E6")
                .badgeText("#059669")
                .cardBg("#F0FBF5")
                .cardBorder("#D5F5E3")
                .build());

        long activeFollowUpCount = 0;
        try {
            activeFollowUpCount = followUpItemRepository.count();
        } catch (Exception e) {
            log.debug("FollowUpItem count defaulted to 0: {}", e.getMessage());
        }

        return SalesWorkflowDto.builder()
                .stages(stages)
                .followUpQueueTitle("Daily Sales Activities")
                .followUpQueueDescription("Use the Follow-Up Queue for your daily lead and opportunity follow-ups.")
                .followUpQueueActionLabel("View Follow-Up Queue")
                .followUpQueueRoute("/sales/follow-up-queue")
                .followUpQueueCount(activeFollowUpCount)
                .build();
    }

    private double roundTwoDecimals(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}

