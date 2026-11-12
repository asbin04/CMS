package com.company.project.sales.service;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.common.util.TrendCalculationUtil;
import com.company.project.sales.dto.*;
import com.company.project.sales.entity.LeadEntity;
import com.company.project.sales.repository.LeadRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.company.project.notification.service.NotificationService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadIdGeneratorService leadIdGeneratorService;
    private final NotificationService notificationService;

    public LeadService(
            LeadRepository leadRepository,
            LeadIdGeneratorService leadIdGeneratorService,
            @Nullable NotificationService notificationService) {
        this.leadRepository = leadRepository;
        this.leadIdGeneratorService = leadIdGeneratorService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public PageResponse<LeadResponse> getLeads(
            Pageable pageable,
            String search,
            String stage,
            String status,
            String ownerId,
            String source
    ) {
        Specification<LeadEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String searchLower = "%" + search.trim().toLowerCase() + "%";
                Predicate companyMatch = cb.like(cb.lower(root.get("company")), searchLower);
                Predicate contactMatch = cb.like(cb.lower(root.get("contactName")), searchLower);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), searchLower);
                Predicate idMatch = cb.like(cb.lower(root.get("id")), searchLower);
                predicates.add(cb.or(companyMatch, contactMatch, emailMatch, idMatch));
            }

            if (stage != null && !stage.isBlank() && !"All".equalsIgnoreCase(stage)) {
                predicates.add(cb.equal(cb.lower(root.get("stage")), stage.trim().toLowerCase()));
            }

            if (status != null && !status.isBlank() && !"All".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            }

            if (ownerId != null && !ownerId.isBlank() && !"All".equalsIgnoreCase(ownerId)) {
                predicates.add(cb.equal(root.get("ownerId"), ownerId.trim()));
            }

            if (source != null && !source.isBlank() && !"All".equalsIgnoreCase(source)) {
                predicates.add(cb.equal(cb.lower(root.get("source")), source.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<LeadEntity> pageResult = leadRepository.findAll(spec, pageable);
        List<LeadResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<LeadResponse>builder()
                .content(content)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .first(pageResult.isFirst())
                .last(pageResult.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<LeadResponse> getAllLeadsUnpaged(
            String search,
            String stage,
            String status,
            String ownerId,
            String source
    ) {
        Specification<LeadEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String searchLower = "%" + search.trim().toLowerCase() + "%";
                Predicate companyMatch = cb.like(cb.lower(root.get("company")), searchLower);
                Predicate contactMatch = cb.like(cb.lower(root.get("contactName")), searchLower);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), searchLower);
                Predicate idMatch = cb.like(cb.lower(root.get("id")), searchLower);
                predicates.add(cb.or(companyMatch, contactMatch, emailMatch, idMatch));
            }

            if (stage != null && !stage.isBlank() && !"All".equalsIgnoreCase(stage)) {
                predicates.add(cb.equal(cb.lower(root.get("stage")), stage.trim().toLowerCase()));
            }

            if (status != null && !status.isBlank() && !"All".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            }

            if (ownerId != null && !ownerId.isBlank() && !"All".equalsIgnoreCase(ownerId)) {
                predicates.add(cb.equal(root.get("ownerId"), ownerId.trim()));
            }

            if (source != null && !source.isBlank() && !"All".equalsIgnoreCase(source)) {
                predicates.add(cb.equal(cb.lower(root.get("source")), source.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return leadRepository.findAll(spec).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LeadResponse getLeadById(String id) {
        LeadEntity entity = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public LeadResponse createLead(CreateLeadRequest request) {
        int year = request.getLeadDate() != null ? request.getLeadDate().getYear() : LocalDate.now().getYear();
        String generatedId = leadIdGeneratorService.generateAndAllocateNextLeadId(year);

        LeadEntity entity = LeadEntity.builder()
                .id(generatedId)
                .leadDate(request.getLeadDate() != null ? request.getLeadDate() : LocalDate.now())
                .company(request.getCompany())
                .contactName(request.getContactName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .source(request.getSource())
                .serviceInterest(request.getServiceInterest())
                .country(request.getCountry())
                .city(request.getCity())
                .ownerId(request.getOwnerId())
                .stage(request.getStage() != null ? request.getStage() : "New")
                .status(request.getStatus() != null ? request.getStatus() : "Open")
                .nextFollowUp(request.getNextFollowUp())
                .estimatedValue(request.getEstimatedValue())
                .leadScore(request.getLeadScore())
                .expectedValue(request.getExpectedValue())
                .expectedCloseDate(request.getExpectedCloseDate())
                .lostReason(request.getLostReason())
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        LeadEntity saved = leadRepository.save(entity);
        if (notificationService != null) {
            notificationService.createNotification(
                    "New Lead Created",
                    "Lead " + saved.getId() + " (" + saved.getCompany() + ") registered under stage " + saved.getStage() + ".",
                    "LEAD",
                    "/sales/leads"
            );
        }
        return mapToResponse(saved);
    }

    @Transactional
    public LeadResponse updateLead(String id, UpdateLeadRequest request) {
        LeadEntity existing = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        if (request.getLeadDate() != null) existing.setLeadDate(request.getLeadDate());
        if (request.getCompany() != null) existing.setCompany(request.getCompany());
        if (request.getContactName() != null) existing.setContactName(request.getContactName());
        if (request.getEmail() != null) existing.setEmail(request.getEmail());
        if (request.getPhone() != null) existing.setPhone(request.getPhone());
        if (request.getSource() != null) existing.setSource(request.getSource());
        if (request.getServiceInterest() != null) existing.setServiceInterest(request.getServiceInterest());
        if (request.getCountry() != null) existing.setCountry(request.getCountry());
        if (request.getCity() != null) existing.setCity(request.getCity());
        if (request.getOwnerId() != null) existing.setOwnerId(request.getOwnerId());
        if (request.getStage() != null) existing.setStage(request.getStage());
        if (request.getStatus() != null) existing.setStatus(request.getStatus());
        if (request.getNextFollowUp() != null) existing.setNextFollowUp(request.getNextFollowUp());
        if (request.getEstimatedValue() != null) existing.setEstimatedValue(request.getEstimatedValue());
        if (request.getLeadScore() != null) existing.setLeadScore(request.getLeadScore());
        if (request.getExpectedValue() != null) existing.setExpectedValue(request.getExpectedValue());
        if (request.getExpectedCloseDate() != null) existing.setExpectedCloseDate(request.getExpectedCloseDate());
        if (request.getLostReason() != null) existing.setLostReason(request.getLostReason());
        if (request.getNotes() != null) existing.setNotes(request.getNotes());
        existing.setUpdatedAt(LocalDateTime.now());

        LeadEntity saved = leadRepository.save(existing);
        if (notificationService != null) {
            notificationService.createNotification(
                    "Lead Updated",
                    "Lead " + saved.getId() + " (" + saved.getCompany() + ") moved to " + saved.getStage() + ".",
                    "LEAD",
                    "/sales/leads"
            );
        }
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteLead(String id) {
        if (!leadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lead not found with id: " + id);
        }
        leadRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public LeadSummaryDto getSummary() {
        LocalDate today = LocalDate.now();
        LocalDate startOfThisMonth = today.withDayOfMonth(1);
        LocalDate endOfThisMonth = today.withDayOfMonth(today.lengthOfMonth());

        LocalDate startOfPrevMonth = startOfThisMonth.minusMonths(1);
        LocalDate endOfPrevMonth = startOfPrevMonth.withDayOfMonth(startOfPrevMonth.lengthOfMonth());

        long totalLeads = leadRepository.count();
        long newThisMonth = leadRepository.countLeadsBetween(startOfThisMonth, endOfThisMonth);
        long followUpsDue = leadRepository.countFollowUpsDue(today);
        long convertedLeads = leadRepository.countConvertedLeads();

        // Month-over-month baseline comparisons
        long newLastMonth = leadRepository.countLeadsBetween(startOfPrevMonth, endOfPrevMonth);
        long followUpsDueLastMonth = leadRepository.countFollowUpsDueBetween(startOfPrevMonth, endOfPrevMonth);
        long convertedLastMonth = leadRepository.countConvertedLeadsBetween(startOfPrevMonth, endOfPrevMonth);
        long totalLeadsBeforeThisMonth = leadRepository.countLeadsBefore(startOfThisMonth);

        Double totalLeadsMoM = TrendCalculationUtil.calculateMoMPercentage(totalLeads, totalLeadsBeforeThisMonth);
        Double newLeadsMoM = TrendCalculationUtil.calculateMoMPercentage(newThisMonth, newLastMonth);
        Double followUpsDueMoM = TrendCalculationUtil.calculateMoMPercentage(followUpsDue, followUpsDueLastMonth);
        Double convertedMoM = TrendCalculationUtil.calculateMoMPercentage(convertedLeads, convertedLastMonth);

        String lastUpdated = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

        return LeadSummaryDto.builder()
                .totalLeads(totalLeads)
                .newThisMonth(newThisMonth)
                .followUpsDue(followUpsDue)
                .convertedLeads(convertedLeads)
                .totalLeadsMoM(totalLeadsMoM)
                .newLeadsMoM(newLeadsMoM)
                .followUpsDueMoM(followUpsDueMoM)
                .convertedMoM(convertedMoM)
                .lastUpdated(lastUpdated)
                .build();
    }

    public LeadResponse mapToResponse(LeadEntity entity) {
        if (entity == null) return null;
        return LeadResponse.builder()
                .id(entity.getId())
                .leadDate(entity.getLeadDate())
                .company(entity.getCompany())
                .contactName(entity.getContactName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .source(entity.getSource())
                .serviceInterest(entity.getServiceInterest())
                .country(entity.getCountry())
                .city(entity.getCity())
                .ownerId(entity.getOwnerId())
                .stage(entity.getStage())
                .status(entity.getStatus())
                .nextFollowUp(entity.getNextFollowUp())
                .estimatedValue(entity.getEstimatedValue())
                .leadScore(entity.getLeadScore())
                .expectedValue(entity.getExpectedValue())
                .expectedCloseDate(entity.getExpectedCloseDate())
                .lostReason(entity.getLostReason())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
