package com.company.project.projects.service;

import com.company.project.projects.dto.*;
import com.company.project.projects.entity.UiuxDesignEntity;
import com.company.project.projects.repository.UiuxDesignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UiuxDesignServiceImpl implements UiuxDesignService {

    private final UiuxDesignRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<UiuxDesignDto> getAllDesigns() {
        return repository.findAllByOrderByIdDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UiuxDesignDto getDesignById(String id) {
        return repository.findById(id).map(this::toDto).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UiuxDesignDto> getDesignsByProjectId(String projectId) {
        return repository.findByProjectIdOrderByIdDesc(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UiuxKpiResponse getKpis() {
        long total = repository.count();
        long inProgress = repository.countByStatusIgnoreCase("In Progress");
        long approved = repository.countByApprovalStatusIgnoreCase("Approved");
        long changeRequests = repository.countChangeRequests();
        long pending = repository.countByApprovalStatusIgnoreCase("Pending");

        return UiuxKpiResponse.builder()
                .totalDesigns(total)
                .totalDesignsTrend("↑ 18% vs last month")
                .inProgress(inProgress)
                .inProgressTrend("↑ 22% vs last month")
                .approved(approved)
                .approvedTrend("↑ 16% vs last month")
                .changeRequests(changeRequests)
                .changeRequestsTrend("↑ 33% vs last month")
                .pendingApproval(pending)
                .pendingApprovalTrend("↑ 10% vs last month")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UiuxFilterOptionsResponse getFilterOptions() {
        List<String> projects = repository.findDistinctProjectIds();
        List<String> designTypes = repository.findDistinctDesignTypes();
        List<String> approvalStatuses = repository.findDistinctApprovalStatuses();
        List<String> statuses = repository.findDistinctStatuses();
        List<String> designers = repository.findDistinctDesigners();

        return UiuxFilterOptionsResponse.builder()
                .projects(projects.isEmpty() ? Arrays.asList("PRJ-001", "PRJ-002", "PRJ-003", "PRJ-004", "PRJ-005") : projects)
                .designTypes(designTypes.isEmpty() ? Arrays.asList("UI Design", "UI/UX") : designTypes)
                .approvalStatuses(approvalStatuses.isEmpty() ? Arrays.asList("Pending", "Approved") : approvalStatuses)
                .statuses(statuses.isEmpty() ? Arrays.asList("In Progress", "Completed") : statuses)
                .designers(designers.isEmpty() ? Arrays.asList("Amit Sharma", "Sneha Nair", "Divya Patel", "Rohan Verma", "Vikram Shah") : designers)
                .build();
    }

    @Override
    @Transactional
    public UiuxDesignDto createDesign(CreateUiuxDesignRequest request) {
        String id = request.getId();
        if (id == null || id.trim().isEmpty()) {
            id = generateNextId();
        }

        String initials = request.getDesignerInitials();
        if (initials == null || initials.trim().isEmpty()) {
            initials = computeInitials(request.getDesigner());
        }

        UiuxDesignEntity entity = UiuxDesignEntity.builder()
                .id(id.trim())
                .projectId(request.getProjectId().trim())
                .requirementId(request.getRequirementId().trim())
                .screenFeature(request.getScreenFeature().trim())
                .designType(request.getDesignType() != null ? request.getDesignType().trim() : "UI Design")
                .version(request.getVersion() != null ? request.getVersion().trim() : "v1.0")
                .designer(request.getDesigner().trim())
                .designerInitials(initials)
                .tool(request.getTool() != null && !request.getTool().trim().isEmpty() ? request.getTool().trim() : "Figma")
                .prototypeUrl(request.getPrototypeUrl() != null ? request.getPrototypeUrl().trim() : "https://www.figma.com")
                .clientFeedback(request.getClientFeedback())
                .feedbackDate(request.getFeedbackDate() != null ? request.getFeedbackDate() : LocalDate.now())
                .approvalStatus(request.getApprovalStatus() != null ? request.getApprovalStatus().trim() : "Pending")
                .approvedBy(request.getApprovedBy())
                .approvalDate(request.getApprovalDate())
                .changeRequest(request.getChangeRequest())
                .status(request.getStatus() != null ? request.getStatus().trim() : "In Progress")
                .notes(request.getNotes())
                .build();

        UiuxDesignEntity saved = repository.save(entity);
        return toDto(saved);
    }

    @Override
    @Transactional
    public UiuxDesignDto updateDesign(String id, UpdateUiuxDesignRequest request) {
        UiuxDesignEntity entity = repository.findById(id).orElse(null);
        if (entity == null) {
            return null;
        }

        if (request.getProjectId() != null) entity.setProjectId(request.getProjectId().trim());
        if (request.getRequirementId() != null) entity.setRequirementId(request.getRequirementId().trim());
        if (request.getScreenFeature() != null) entity.setScreenFeature(request.getScreenFeature().trim());
        if (request.getDesignType() != null) entity.setDesignType(request.getDesignType().trim());
        if (request.getVersion() != null) entity.setVersion(request.getVersion().trim());
        if (request.getDesigner() != null) {
            entity.setDesigner(request.getDesigner().trim());
            entity.setDesignerInitials(computeInitials(request.getDesigner().trim()));
        }
        if (request.getDesignerInitials() != null) entity.setDesignerInitials(request.getDesignerInitials().trim());
        if (request.getTool() != null) entity.setTool(request.getTool().trim());
        if (request.getPrototypeUrl() != null) entity.setPrototypeUrl(request.getPrototypeUrl().trim());
        if (request.getClientFeedback() != null) entity.setClientFeedback(request.getClientFeedback().trim());
        if (request.getFeedbackDate() != null) entity.setFeedbackDate(request.getFeedbackDate());
        if (request.getApprovalStatus() != null) entity.setApprovalStatus(request.getApprovalStatus().trim());
        if (request.getApprovedBy() != null) entity.setApprovedBy(request.getApprovedBy().trim());
        if (request.getApprovalDate() != null) entity.setApprovalDate(request.getApprovalDate());
        if (request.getChangeRequest() != null) entity.setChangeRequest(request.getChangeRequest().trim());
        if (request.getStatus() != null) entity.setStatus(request.getStatus().trim());
        if (request.getNotes() != null) entity.setNotes(request.getNotes().trim());

        UiuxDesignEntity updated = repository.save(entity);
        return toDto(updated);
    }

    @Override
    @Transactional
    public void deleteDesign(String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        }
    }

    private UiuxDesignDto toDto(UiuxDesignEntity e) {
        return UiuxDesignDto.builder()
                .id(e.getId())
                .projectId(e.getProjectId())
                .requirementId(e.getRequirementId())
                .screenFeature(e.getScreenFeature())
                .designType(e.getDesignType())
                .version(e.getVersion())
                .designer(e.getDesigner())
                .designerInitials(e.getDesignerInitials())
                .tool(e.getTool())
                .prototypeUrl(e.getPrototypeUrl())
                .clientFeedback(e.getClientFeedback())
                .feedbackDate(e.getFeedbackDate())
                .approvalStatus(e.getApprovalStatus())
                .approvedBy(e.getApprovedBy())
                .approvalDate(e.getApprovalDate())
                .changeRequest(e.getChangeRequest())
                .status(e.getStatus())
                .notes(e.getNotes())
                .build();
    }

    private String generateNextId() {
        int maxSeq = repository.findAll().stream()
                .map(UiuxDesignEntity::getId)
                .filter(id -> id != null && id.startsWith("DES-2026-"))
                .map(id -> {
                    try {
                        return Integer.parseInt(id.replace("DES-2026-", ""));
                    } catch (NumberFormatException ex) {
                        return 0;
                    }
                })
                .max(Integer::compareTo)
                .orElse(186);

        return String.format("DES-2026-%04d", maxSeq + 1);
    }

    private String computeInitials(String name) {
        if (name == null || name.trim().isEmpty()) return "DS";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
        return ("" + parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
}

