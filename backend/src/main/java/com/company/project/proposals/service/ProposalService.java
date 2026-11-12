package com.company.project.proposals.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.proposals.dto.*;
import com.company.project.proposals.entity.ProposalEntity;
import com.company.project.proposals.repository.ProposalRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.company.project.notification.service.NotificationService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class ProposalService {

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "Draft", "Sent", "Pending", "Approved", "In Review", "Rejected"
    );

    private final ProposalRepository proposalRepository;
    private final ProposalCalculationService calculationService;
    private final ProposalIdGeneratorService idGeneratorService;
    private final NotificationService notificationService;

    public ProposalService(
            ProposalRepository proposalRepository,
            ProposalCalculationService calculationService,
            ProposalIdGeneratorService idGeneratorService,
            @Nullable NotificationService notificationService) {
        this.proposalRepository = proposalRepository;
        this.calculationService = calculationService;
        this.idGeneratorService = idGeneratorService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProposalResponse> getProposals(
            String search,
            String status,
            String ownerId,
            String clientId,
            String opportunityId,
            String serviceId,
            String proposalDateRange,
            String validUntilRange,
            String expectedDecisionDateRange,
            String sortOption,
            int page,
            int size
    ) {
        Specification<ProposalEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Text Search across identifiers, title, and related names
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPred = cb.or(
                        cb.like(cb.lower(root.get("id")), pattern),
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("clientId")), pattern),
                        cb.like(cb.lower(root.get("opportunityId")), pattern),
                        cb.like(cb.lower(root.get("clientName")), pattern),
                        cb.like(cb.lower(root.get("ownerId")), pattern),
                        cb.like(cb.lower(root.get("serviceId")), pattern)
                );
                predicates.add(searchPred);
            }

            // 2. Dropdown Filters
            if (status != null && !status.trim().isEmpty() && !"All".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }

            if (ownerId != null && !ownerId.trim().isEmpty() && !"All".equalsIgnoreCase(ownerId.trim())) {
                predicates.add(cb.equal(root.get("ownerId"), ownerId.trim()));
            }

            if (clientId != null && !clientId.trim().isEmpty() && !"All".equalsIgnoreCase(clientId.trim())) {
                predicates.add(cb.equal(root.get("clientId"), clientId.trim()));
            }

            if (opportunityId != null && !opportunityId.trim().isEmpty() && !"All".equalsIgnoreCase(opportunityId.trim())) {
                predicates.add(cb.equal(root.get("opportunityId"), opportunityId.trim()));
            }

            if (serviceId != null && !serviceId.trim().isEmpty() && !"All".equalsIgnoreCase(serviceId.trim())) {
                predicates.add(cb.equal(root.get("serviceId"), serviceId.trim()));
            }

            // 3. Date Range Filters
            if (proposalDateRange != null && !proposalDateRange.trim().isEmpty() && !"All Dates".equalsIgnoreCase(proposalDateRange.trim())) {
                addDateFilter(predicates, cb, root.get("proposalDate"), proposalDateRange.trim());
            }

            if (validUntilRange != null && !validUntilRange.trim().isEmpty() && !"All Dates".equalsIgnoreCase(validUntilRange.trim())) {
                addDateFilter(predicates, cb, root.get("validUntil"), validUntilRange.trim());
            }

            if (expectedDecisionDateRange != null && !expectedDecisionDateRange.trim().isEmpty() && !"All Dates".equalsIgnoreCase(expectedDecisionDateRange.trim())) {
                addDateFilter(predicates, cb, root.get("expectedDecisionDate"), expectedDecisionDateRange.trim());
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // Sorting mapping
        Sort sort = resolveSort(sortOption);

        int safePage = Math.max(0, page > 0 ? page - 1 : 0);
        int safeSize = Math.max(1, size);
        Pageable pageable = PageRequest.of(safePage, safeSize, sort);

        Page<ProposalEntity> pageResult = proposalRepository.findAll(spec, pageable);

        List<ProposalResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<ProposalResponse>builder()
                .content(content)
                .pageNumber(pageResult.getNumber() + 1)
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .first(pageResult.isFirst())
                .last(pageResult.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ProposalResponse getProposalById(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new BusinessValidationException("Proposal ID cannot be empty.");
        }
        ProposalEntity entity = proposalRepository.findById(id.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Proposal with ID " + id + " not found."));
        return mapToResponse(entity);
    }

    @Transactional
    public ProposalResponse createProposal(CreateProposalRequest request) {
        String cleanId = request.getProposalId().trim().toUpperCase();

        if (proposalRepository.existsById(cleanId)) {
            throw new BusinessValidationException("Proposal with ID " + cleanId + " already exists.");
        }

        if (request.getTitle() == null || request.getTitle().trim().length() < 3) {
            throw new BusinessValidationException("Proposal title must be at least 3 characters long.");
        }

        String status = request.getStatus().trim();
        if (!ALLOWED_STATUSES.contains(status)) {
            throw new BusinessValidationException("Invalid status: " + status + ". Allowed statuses: " + ALLOWED_STATUSES);
        }

        LocalDate pDate = calculationService.parseDate(request.getProposalDate());
        LocalDate vDate = calculationService.parseDate(request.getValidUntil());
        LocalDate decDate = calculationService.parseDate(request.getExpectedDecisionDate());

        calculationService.validateDates(pDate, vDate, decDate);
        calculationService.validateFinancialAmounts(request.getServiceBeforeTax(), request.getTaxAmount(), request.getTotalAmount());

        // Synchronize sequence counter
        idGeneratorService.syncCounterIfHigher(cleanId);

        String version = request.getVersion() != null && !request.getVersion().trim().isEmpty()
                ? (request.getVersion().trim().startsWith("V") ? request.getVersion().trim() : "V" + request.getVersion().trim())
                : "V1.0";

        ProposalEntity entity = ProposalEntity.builder()
                .id(cleanId)
                .opportunityId(request.getOpportunityId().trim())
                .clientId(request.getClientId().trim())
                .clientName(request.getClientName() != null ? request.getClientName().trim() : "Corporate Client")
                .proposalDate(pDate)
                .validUntil(vDate)
                .version(version)
                .title(request.getTitle().trim())
                .serviceId(request.getServiceId().trim())
                .serviceName(request.getServiceName() != null ? request.getServiceName().trim() : "Consulting Service")
                .serviceBeforeTax(request.getServiceBeforeTax())
                .taxAmount(request.getTaxAmount())
                .totalAmount(request.getTotalAmount())
                .ownerId(request.getOwnerId().trim())
                .ownerName(request.getOwnerName() != null ? request.getOwnerName().trim() : "Account Manager")
                .status(status)
                .expectedDecisionDate(decDate)
                .description(request.getDescription() != null ? request.getDescription().trim() : "Proposal for " + request.getTitle().trim())
                .build();

        ProposalEntity saved = proposalRepository.save(entity);
        log.info("Successfully created proposal: {} - {}", saved.getId(), saved.getTitle());
        return mapToResponse(saved);
    }

    @Transactional
    public ProposalResponse updateProposalStatus(String id, String newStatus) {
        if (id == null || id.trim().isEmpty()) {
            throw new BusinessValidationException("Proposal ID cannot be empty.");
        }
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new BusinessValidationException("Status cannot be empty.");
        }

        String cleanStatus = newStatus.trim();
        if (!ALLOWED_STATUSES.contains(cleanStatus)) {
            throw new BusinessValidationException("Invalid status: " + cleanStatus + ". Allowed statuses: " + ALLOWED_STATUSES);
        }

        ProposalEntity entity = proposalRepository.findById(id.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Proposal with ID " + id + " not found."));

        entity.setStatus(cleanStatus);
        ProposalEntity updated = proposalRepository.save(entity);
        log.info("Updated status for proposal {} to {}", id, cleanStatus);
        if (notificationService != null) {
            notificationService.createNotification(
                    "Proposal " + cleanStatus,
                    "Proposal " + updated.getId() + " (" + updated.getTitle() + ") marked as " + cleanStatus + ".",
                    "PROPOSAL",
                    "/sales/proposals"
            );
        }
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public ProposalKpiSummaryResponse getKpiSummary() {
        long totalProposals = proposalRepository.count();
        long pendingDecisions = proposalRepository.countByStatus("Pending");
        long approvedProposals = proposalRepository.countByStatus("Approved");
        BigDecimal totalValue = proposalRepository.sumTotalAmount();

        java.time.OffsetDateTime now = java.time.OffsetDateTime.now();
        java.time.OffsetDateTime startOfThisMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay().atOffset(now.getOffset());

        long totalBefore = proposalRepository.countBefore(startOfThisMonth);
        long pendingBefore = proposalRepository.countByStatusBefore("Pending", startOfThisMonth);
        long approvedBefore = proposalRepository.countByStatusBefore("Approved", startOfThisMonth);
        BigDecimal totalValBefore = proposalRepository.sumTotalAmountBefore(startOfThisMonth);

        Double totalTrend = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(totalProposals, totalBefore);
        Double pendingTrend = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(pendingDecisions, pendingBefore);
        Double approvedTrend = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(approvedProposals, approvedBefore);
        Double totalValTrend = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(totalValue, totalValBefore);

        return ProposalKpiSummaryResponse.builder()
                .totalProposals(totalProposals)
                .totalProposalsTrend(totalTrend)
                .pendingDecisions(pendingDecisions)
                .pendingDecisionsTrend(pendingTrend)
                .approvedProposals(approvedProposals)
                .approvedProposalsTrend(approvedTrend)
                .totalProposalValue(totalValue != null ? totalValue : BigDecimal.ZERO)
                .totalProposalValueTrend(totalValTrend)
                .build();
    }

    @Transactional
    public ProposalResponse updateProposal(String id, UpdateProposalRequest request) {
        ProposalEntity existing = proposalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found with id: " + id));

        if (!"Draft".equalsIgnoreCase(existing.getStatus()) && !"Pending".equalsIgnoreCase(existing.getStatus())) {
            throw new BusinessValidationException("Only Draft or Pending proposals can be edited");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            existing.setTitle(request.getTitle().trim());
        }
        if (request.getValidUntil() != null && !request.getValidUntil().isBlank()) {
            existing.setValidUntil(calculationService.parseDate(request.getValidUntil()));
        }
        if (request.getExpectedDecisionDate() != null && !request.getExpectedDecisionDate().isBlank()) {
            existing.setExpectedDecisionDate(calculationService.parseDate(request.getExpectedDecisionDate()));
        }
        if (request.getServiceId() != null) {
            existing.setServiceId(request.getServiceId());
        }
        if (request.getServiceName() != null) {
            existing.setServiceName(request.getServiceName());
        }
        if (request.getServiceBeforeTax() != null) {
            existing.setServiceBeforeTax(request.getServiceBeforeTax());
            BigDecimal tax = request.getTaxAmount() != null
                    ? request.getTaxAmount()
                    : request.getServiceBeforeTax().multiply(BigDecimal.valueOf(0.18));
            existing.setTaxAmount(tax);
            BigDecimal total = request.getTotalAmount() != null
                    ? request.getTotalAmount()
                    : request.getServiceBeforeTax().add(tax);
            existing.setTotalAmount(total);
        }
        if (request.getOwnerId() != null) {
            existing.setOwnerId(request.getOwnerId());
        }
        if (request.getOwnerName() != null) {
            existing.setOwnerName(request.getOwnerName());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }

        existing.setUpdatedAt(java.time.OffsetDateTime.now());
        ProposalEntity saved = proposalRepository.save(existing);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteProposal(String id) {
        ProposalEntity existing = proposalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found with id: " + id));

        if (!"Draft".equalsIgnoreCase(existing.getStatus())) {
            throw new BusinessValidationException("Only Draft proposals can be deleted");
        }

        proposalRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public NextProposalIdResponse getNextProposalId(Integer year) {
        int targetYear = year != null ? year : 2025;
        String nextId = idGeneratorService.suggestNextProposalId(targetYear);
        return NextProposalIdResponse.builder().nextId(nextId).build();
    }

    @Transactional(readOnly = true)
    public ProposalFilterOptionsResponse getFilterOptions() {
        List<String> owners = new ArrayList<>(proposalRepository.findDistinctOwnerIds());
        List<String> clients = new ArrayList<>(proposalRepository.findDistinctClientIds());
        List<String> opportunities = new ArrayList<>(proposalRepository.findDistinctOpportunityIds());
        List<String> services = new ArrayList<>(proposalRepository.findDistinctServiceIds());

        owners.add(0, "All");
        clients.add(0, "All");
        opportunities.add(0, "All");
        services.add(0, "All");

        return ProposalFilterOptionsResponse.builder()
                .owners(owners)
                .clients(clients)
                .opportunities(opportunities)
                .services(services)
                .build();
    }

    private Sort resolveSort(String sortOption) {
        if (sortOption == null || sortOption.trim().isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "proposalDate").and(Sort.by(Sort.Direction.DESC, "id"));
        }
        return switch (sortOption.trim()) {
            case "date-oldest" -> Sort.by(Sort.Direction.ASC, "proposalDate").and(Sort.by(Sort.Direction.ASC, "id"));
            case "value-highest" -> Sort.by(Sort.Direction.DESC, "totalAmount").and(Sort.by(Sort.Direction.DESC, "id"));
            case "value-lowest" -> Sort.by(Sort.Direction.ASC, "totalAmount").and(Sort.by(Sort.Direction.ASC, "id"));
            case "valid-until-soonest" -> Sort.by(Sort.Direction.ASC, "validUntil").and(Sort.by(Sort.Direction.ASC, "id"));
            case "date-newest" -> Sort.by(Sort.Direction.DESC, "proposalDate").and(Sort.by(Sort.Direction.DESC, "id"));
            default -> Sort.by(Sort.Direction.DESC, "proposalDate").and(Sort.by(Sort.Direction.DESC, "id"));
        };
    }

    private void addDateFilter(List<Predicate> predicates, jakarta.persistence.criteria.CriteriaBuilder cb,
                               jakarta.persistence.criteria.Path<LocalDate> datePath, String filter) {
        String f = filter.toLowerCase().trim();

        // 1. Month-Year string (e.g. "Mar 2025", "Feb 2025", "Apr 2025")
        if (f.matches("^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\\s+\\d{4}$")) {
            try {
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);
                YearMonth ym = YearMonth.parse(filter.trim(), fmt);
                LocalDate start = ym.atDay(1);
                LocalDate end = ym.atEndOfMonth();
                predicates.add(cb.between(datePath, start, end));
                return;
            } catch (Exception ignored) {}
        }

        // 2. Hyphen range (e.g. "11 Mar - 15 Mar 2025" or "25 Mar - 30 Apr 2025")
        if (filter.contains("-")) {
            String[] parts = filter.split("-");
            if (parts.length == 2) {
                try {
                    String part1 = parts[0].trim();
                    String part2 = parts[1].trim();
                    String year = part2.replaceAll(".*?(\\d{4}).*", "$1");
                    if (!part1.contains(year)) part1 = part1 + " " + year;
                    LocalDate start = calculationService.parseDate(part1);
                    LocalDate end = calculationService.parseDate(part2);
                    predicates.add(cb.between(datePath, start, end));
                    return;
                } catch (Exception ignored) {}
            }
        }

        // 3. Relative Presets against reference date 2025-03-15
        LocalDate refDate = LocalDate.of(2025, 3, 15);
        if (f.contains("last 30 days")) {
            predicates.add(cb.between(datePath, refDate.minusDays(30), refDate));
        } else if (f.contains("next 30 days")) {
            predicates.add(cb.between(datePath, refDate, refDate.plusDays(30)));
        } else if (f.contains("next 60 days")) {
            predicates.add(cb.between(datePath, refDate, refDate.plusDays(60)));
        } else if (f.contains("this month")) {
            YearMonth ym = YearMonth.of(2025, 3);
            predicates.add(cb.between(datePath, ym.atDay(1), ym.atEndOfMonth()));
        } else if (f.contains("next month")) {
            YearMonth ym = YearMonth.of(2025, 4);
            predicates.add(cb.between(datePath, ym.atDay(1), ym.atEndOfMonth()));
        }
    }

    private ProposalResponse mapToResponse(ProposalEntity entity) {
        return ProposalResponse.builder()
                .proposalId(entity.getId())
                .opportunityId(entity.getOpportunityId())
                .clientId(entity.getClientId())
                .clientName(entity.getClientName())
                .proposalDate(calculationService.formatDate(entity.getProposalDate()))
                .validUntil(calculationService.formatDate(entity.getValidUntil()))
                .version(entity.getVersion())
                .title(entity.getTitle())
                .serviceId(entity.getServiceId())
                .serviceName(entity.getServiceName())
                .serviceBeforeTax(entity.getServiceBeforeTax())
                .taxAmount(entity.getTaxAmount())
                .totalAmount(entity.getTotalAmount())
                .ownerId(entity.getOwnerId())
                .ownerName(entity.getOwnerName())
                .status(entity.getStatus())
                .expectedDecisionDate(calculationService.formatDate(entity.getExpectedDecisionDate()))
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null)
                .build();
    }
}
