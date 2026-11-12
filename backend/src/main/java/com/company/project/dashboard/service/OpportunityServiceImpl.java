package com.company.project.dashboard.service;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.dashboard.dto.CreateOpportunityRequest;
import com.company.project.dashboard.dto.OpportunityDto;
import com.company.project.dashboard.dto.OpportunitySummaryDto;
import com.company.project.dashboard.entity.Opportunity;
import com.company.project.dashboard.repository.OpportunityRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import com.company.project.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OpportunityServiceImpl implements OpportunityService {

    private final OpportunityRepository repository;
    private final NotificationService notificationService;

    public OpportunityServiceImpl(
            OpportunityRepository repository,
            @Nullable NotificationService notificationService) {
        this.repository = repository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OpportunityDto> getAllOpportunities(
            String stage,
            String status,
            String ownerId,
            String clientId,
            String serviceId,
            String search
    ) {
        String cleanStage = (stage != null && !stage.equalsIgnoreCase("all") && !stage.isBlank()) ? stage.trim() : null;
        String cleanStatus = (status != null && !status.equalsIgnoreCase("all") && !status.isBlank()) ? status.trim() : null;
        String cleanOwnerId = (ownerId != null && !ownerId.equalsIgnoreCase("all") && !ownerId.isBlank()) ? ownerId.trim() : null;
        String cleanClientId = (clientId != null && !clientId.equalsIgnoreCase("all") && !clientId.isBlank()) ? clientId.trim() : null;
        String cleanServiceId = (serviceId != null && !serviceId.equalsIgnoreCase("all") && !serviceId.isBlank()) ? serviceId.trim() : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        List<Opportunity> items;
        if (cleanStage == null && cleanStatus == null && cleanOwnerId == null && 
            cleanClientId == null && cleanServiceId == null && cleanSearch == null) {
            items = repository.findAllByOrderByOrderIndexAscCreatedAtAsc();
        } else {
            items = repository.searchOpportunities(
                    cleanStage, cleanStatus, cleanOwnerId, cleanClientId, cleanServiceId, cleanSearch
            );
        }

        return items.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OpportunitySummaryDto getSummary() {
        List<Opportunity> all = repository.findAll();

        long total = all.size();
        long open = all.stream().filter(o -> "Open".equalsIgnoreCase(o.getStatus()) || "In Progress".equalsIgnoreCase(o.getStatus())).count();
        long won = all.stream().filter(o -> "Won".equalsIgnoreCase(o.getStage())).count();

        BigDecimal weightedSum = all.stream()
                .map(o -> o.getWeightedPipeline() != null ? o.getWeightedPipeline() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String formattedWeighted = formatIndianCurrency(weightedSum);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfThisMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();

        long totalBefore = all.stream().filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isBefore(startOfThisMonth)).count();
        long openBefore = all.stream().filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isBefore(startOfThisMonth) &&
                ("Open".equalsIgnoreCase(o.getStatus()) || "In Progress".equalsIgnoreCase(o.getStatus()))).count();
        long wonBefore = all.stream().filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isBefore(startOfThisMonth) &&
                "Won".equalsIgnoreCase(o.getStage())).count();
        BigDecimal weightedBefore = all.stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isBefore(startOfThisMonth))
                .map(o -> o.getWeightedPipeline() != null ? o.getWeightedPipeline() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Double totalPct = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(total, totalBefore);
        Double openPct = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(open, openBefore);
        Double wonPct = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(won, wonBefore);
        Double weightedPct = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(weightedSum, weightedBefore);

        return OpportunitySummaryDto.builder()
                .totalOpportunities(total)
                .openOpportunities(open)
                .weightedPipeline(weightedSum)
                .weightedPipelineFormatted(formattedWeighted)
                .wonOpportunities(won)
                .totalTrend(com.company.project.common.util.TrendCalculationUtil.formatTrendString(totalPct))
                .openTrend(com.company.project.common.util.TrendCalculationUtil.formatTrendString(openPct))
                .weightedTrend(com.company.project.common.util.TrendCalculationUtil.formatTrendString(weightedPct))
                .wonTrend(com.company.project.common.util.TrendCalculationUtil.formatTrendString(wonPct))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OpportunityDto getById(Long id) {
        Opportunity entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + id));
        return toDto(entity);
    }

    @Override
    @Transactional
    public OpportunityDto createOpportunity(CreateOpportunityRequest request) {
        long nextNum = repository.count() + 1;
        String oppId = request.getOpportunityId();
        if (oppId == null || oppId.isBlank()) {
            int year = java.time.LocalDate.now().getYear();
            String candidate = String.format("O-%04d-%03d", year, nextNum);
            while (repository.findByOpportunityId(candidate).isPresent()) {
                nextNum++;
                candidate = String.format("O-%04d-%03d", year, nextNum);
            }
            oppId = candidate;
        }

        String leadId = (request.getLeadId() != null && !request.getLeadId().isBlank())
                ? request.getLeadId()
                : "-";

        BigDecimal weighted = request.getEstimatedValue()
                .multiply(BigDecimal.valueOf(request.getProbability()))
                .divide(BigDecimal.valueOf(100));

        Opportunity entity = Opportunity.builder()
                .opportunityId(oppId)
                .leadId(leadId)
                .clientId(request.getClientId())
                .opportunityName(request.getOpportunityName())
                .ownerId(request.getOwnerId())
                .serviceId(request.getServiceId())
                .stage(request.getStage())
                .probability(request.getProbability())
                .estimatedValue(request.getEstimatedValue())
                .expectedCloseDate(request.getExpectedCloseDate() != null ? request.getExpectedCloseDate() : "-")
                .lastContact(request.getLastContact() != null ? request.getLastContact() : "-")
                .nextFollowUp(request.getNextFollowUp() != null ? request.getNextFollowUp() : "-")
                .status(request.getStatus())
                .lostReason(request.getLostReason() != null ? request.getLostReason() : "-")
                .weightedPipeline(weighted)
                .orderIndex((int) nextNum)
                .build();

        Opportunity saved = repository.save(entity);
        if (notificationService != null) {
            notificationService.createNotification(
                    "New Opportunity Created",
                    saved.getOpportunityName() + " (" + saved.getOpportunityId() + ") was created.",
                    "OPPORTUNITY",
                    "/sales/opportunities"
            );
        }
        return toDto(saved);
    }

    @Override
    @Transactional
    public OpportunityDto updateOpportunity(Long id, CreateOpportunityRequest request) {
        Opportunity entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + id));

        if (request.getLeadId() != null) entity.setLeadId(request.getLeadId());
        if (request.getClientId() != null) entity.setClientId(request.getClientId());
        if (request.getOpportunityName() != null) entity.setOpportunityName(request.getOpportunityName());
        if (request.getOwnerId() != null) entity.setOwnerId(request.getOwnerId());
        if (request.getServiceId() != null) entity.setServiceId(request.getServiceId());
        if (request.getStage() != null) entity.setStage(request.getStage());
        if (request.getProbability() != null) entity.setProbability(request.getProbability());
        if (request.getEstimatedValue() != null) entity.setEstimatedValue(request.getEstimatedValue());
        if (request.getExpectedCloseDate() != null) entity.setExpectedCloseDate(request.getExpectedCloseDate());
        if (request.getLastContact() != null) entity.setLastContact(request.getLastContact());
        if (request.getNextFollowUp() != null) entity.setNextFollowUp(request.getNextFollowUp());
        if (request.getStatus() != null) entity.setStatus(request.getStatus());
        if (request.getLostReason() != null) entity.setLostReason(request.getLostReason());

        if (entity.getEstimatedValue() != null && entity.getProbability() != null) {
            BigDecimal weighted = entity.getEstimatedValue()
                    .multiply(BigDecimal.valueOf(entity.getProbability()))
                    .divide(BigDecimal.valueOf(100));
            entity.setWeightedPipeline(weighted);
        }

        Opportunity updated = repository.save(entity);
        if (notificationService != null) {
            notificationService.createNotification(
                    "Opportunity Updated",
                    updated.getOpportunityName() + " (" + updated.getOpportunityId() + ") was updated to " + updated.getStage() + ".",
                    "OPPORTUNITY",
                    "/sales/opportunities"
            );
        }
        return toDto(updated);
    }

    @Override
    @Transactional
    public void deleteOpportunity(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Opportunity not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public void resetSeedData() {
        repository.deleteAllInBatch();

        List<Opportunity> seedList = new ArrayList<>();

        seedList.add(Opportunity.builder()
                .opportunityId("O-2025-001")
                .leadId("L-2025-001")
                .clientId("C-001")
                .opportunityName("Website Redesign Project")
                .ownerId("EMP-001")
                .serviceId("S-001")
                .stage("New")
                .probability(20)
                .estimatedValue(new BigDecimal("500000"))
                .expectedCloseDate("20 Apr 2025")
                .lastContact("15 Mar 2025")
                .nextFollowUp("18 Mar 2025")
                .status("Open")
                .lostReason("-")
                .weightedPipeline(new BigDecimal("100000"))
                .orderIndex(1)
                .build());

        seedList.add(Opportunity.builder()
                .opportunityId("O-2025-002")
                .leadId("L-2025-002")
                .clientId("C-003")
                .opportunityName("Mobile App Development")
                .ownerId("EMP-003")
                .serviceId("S-002")
                .stage("Qualified")
                .probability(60)
                .estimatedValue(new BigDecimal("1200000"))
                .expectedCloseDate("10 May 2025")
                .lastContact("08 Mar 2025")
                .nextFollowUp("16 Mar 2025")
                .status("In Progress")
                .lostReason("-")
                .weightedPipeline(new BigDecimal("720000"))
                .orderIndex(2)
                .build());

        seedList.add(Opportunity.builder()
                .opportunityId("O-2025-003")
                .leadId("L-2025-003")
                .clientId("C-002")
                .opportunityName("ERP Implementation")
                .ownerId("EMP-002")
                .serviceId("S-004")
                .stage("Proposal")
                .probability(70)
                .estimatedValue(new BigDecimal("2500000"))
                .expectedCloseDate("25 Apr 2025")
                .lastContact("12 Mar 2025")
                .nextFollowUp("14 Mar 2025")
                .status("Open")
                .lostReason("-")
                .weightedPipeline(new BigDecimal("1750000"))
                .orderIndex(3)
                .build());

        seedList.add(Opportunity.builder()
                .opportunityId("O-2025-004")
                .leadId("L-2025-004")
                .clientId("C-005")
                .opportunityName("Digital Marketing Package")
                .ownerId("EMP-004")
                .serviceId("S-003")
                .stage("Negotiation")
                .probability(80)
                .estimatedValue(new BigDecimal("850000"))
                .expectedCloseDate("30 Apr 2025")
                .lastContact("11 Mar 2025")
                .nextFollowUp("20 Mar 2025")
                .status("In Progress")
                .lostReason("-")
                .weightedPipeline(new BigDecimal("680000"))
                .orderIndex(4)
                .build());

        seedList.add(Opportunity.builder()
                .opportunityId("O-2025-005")
                .leadId("L-2025-005")
                .clientId("C-004")
                .opportunityName("Cloud Infrastructure Setup")
                .ownerId("EMP-001")
                .serviceId("S-005")
                .stage("Qualified")
                .probability(50)
                .estimatedValue(new BigDecimal("1800000"))
                .expectedCloseDate("18 Apr 2025")
                .lastContact("10 Mar 2025")
                .nextFollowUp("15 Mar 2025")
                .status("Open")
                .lostReason("-")
                .weightedPipeline(new BigDecimal("900000"))
                .orderIndex(5)
                .build());

        seedList.add(Opportunity.builder()
                .opportunityId("O-2025-006")
                .leadId("L-2025-006")
                .clientId("C-007")
                .opportunityName("IT Support & Maintenance")
                .ownerId("EMP-003")
                .serviceId("S-006")
                .stage("New")
                .probability(30)
                .estimatedValue(new BigDecimal("600000"))
                .expectedCloseDate("28 Apr 2025")
                .lastContact("09 Mar 2025")
                .nextFollowUp("17 Mar 2025")
                .status("Open")
                .lostReason("-")
                .weightedPipeline(new BigDecimal("180000"))
                .orderIndex(6)
                .build());

        seedList.add(Opportunity.builder()
                .opportunityId("O-2025-007")
                .leadId("L-2025-007")
                .clientId("C-006")
                .opportunityName("Custom Software Solution")
                .ownerId("EMP-002")
                .serviceId("S-001")
                .stage("Proposal")
                .probability(75)
                .estimatedValue(new BigDecimal("2000000"))
                .expectedCloseDate("12 May 2025")
                .lastContact("12 Mar 2025")
                .nextFollowUp("19 Mar 2025")
                .status("In Progress")
                .lostReason("-")
                .weightedPipeline(new BigDecimal("1500000"))
                .orderIndex(7)
                .build());

        seedList.add(Opportunity.builder()
                .opportunityId("O-2025-008")
                .leadId("L-2025-008")
                .clientId("C-008")
                .opportunityName("Cybersecurity Audit")
                .ownerId("EMP-005")
                .serviceId("S-007")
                .stage("Lost")
                .probability(0)
                .estimatedValue(new BigDecimal("400000"))
                .expectedCloseDate("-")
                .lastContact("10 Mar 2025")
                .nextFollowUp("-")
                .status("Lost")
                .lostReason("Budget issue")
                .weightedPipeline(BigDecimal.ZERO)
                .orderIndex(8)
                .build());

        repository.saveAll(seedList);
        log.info("Reset and seeded 8 opportunities.");
    }

    private OpportunityDto toDto(Opportunity entity) {
        return OpportunityDto.builder()
                .id(entity.getId())
                .opportunityId(entity.getOpportunityId())
                .leadId(entity.getLeadId())
                .clientId(entity.getClientId())
                .opportunityName(entity.getOpportunityName())
                .ownerId(entity.getOwnerId())
                .serviceId(entity.getServiceId())
                .stage(entity.getStage())
                .probability(entity.getProbability())
                .estimatedValue(entity.getEstimatedValue())
                .estimatedValueFormatted(formatIndianCurrency(entity.getEstimatedValue()))
                .expectedCloseDate(entity.getExpectedCloseDate())
                .lastContact(entity.getLastContact())
                .nextFollowUp(entity.getNextFollowUp())
                .status(entity.getStatus())
                .lostReason(entity.getLostReason())
                .weightedPipeline(entity.getWeightedPipeline())
                .weightedPipelineFormatted(formatIndianCurrency(entity.getWeightedPipeline()))
                .orderIndex(entity.getOrderIndex())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private String formatIndianCurrency(BigDecimal amount) {
        if (amount == null) return "₹ 0";
        try {
            NumberFormat nf = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
            String formatted = nf.format(amount);
            // Replace standard currency symbol with space: ₹ 5,00,000.00 -> ₹ 5,00,000
            if (formatted.endsWith(".00")) {
                formatted = formatted.substring(0, formatted.length() - 3);
            }
            return formatted.replace("₹", "₹ ");
        } catch (Exception e) {
            return "₹ " + amount.toPlainString();
        }
    }
}
