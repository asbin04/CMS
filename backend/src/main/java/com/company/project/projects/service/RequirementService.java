package com.company.project.projects.service;

import com.company.project.clients.entity.ClientEntity;
import com.company.project.clients.repository.ClientRepository;
import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.dashboard.entity.EmployeeMaster;
import com.company.project.dashboard.repository.EmployeeMasterRepository;
import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectEntity;
import com.company.project.projects.entity.ProjectRequirementEntity;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectRequirementRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequirementService {

    private final ProjectRequirementRepository requirementRepository;
    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final EmployeeMasterRepository employeeMasterRepository;
    private final ProjectModuleIdGenerator idGeneratorService;

    @Transactional(readOnly = true)
    public PageResponse<RequirementResponse> getRequirements(
            String search,
            String project,
            String type,
            String priority,
            String status,
            String scopeFreeze,
            String sort,
            int page,
            int size
    ) {
        int pageIdx = Math.max(0, page > 0 ? page - 1 : page);
        int pageSize = size > 0 ? size : 10;

        Sort sortObj = parseSort(sort);
        Pageable pageable = PageRequest.of(pageIdx, pageSize, sortObj);

        Specification<ProjectRequirementEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("requirementId")), term),
                        cb.like(cb.lower(root.get("featureName")), term),
                        cb.like(cb.lower(root.get("description")), term),
                        cb.like(cb.lower(root.get("projectId")), term),
                        cb.like(cb.lower(root.get("clientId")), term),
                        cb.like(cb.lower(root.get("ownerId")), term)
                ));
            }

            if (project != null && !project.isBlank() && !project.trim().toLowerCase().startsWith("all")) {
                predicates.add(cb.equal(root.get("projectId"), project.trim()));
            }

            if (type != null && !type.isBlank() && !type.trim().toLowerCase().startsWith("all")) {
                predicates.add(cb.equal(cb.lower(root.get("requirementType")), type.trim().toLowerCase()));
            }

            if (priority != null && !priority.isBlank() && !priority.trim().toLowerCase().startsWith("all")) {
                predicates.add(cb.equal(cb.lower(root.get("priority")), priority.trim().toLowerCase()));
            }

            if (status != null && !status.isBlank() && !status.trim().toLowerCase().startsWith("all")) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            }

            if (scopeFreeze != null && !scopeFreeze.isBlank() && !scopeFreeze.trim().toLowerCase().startsWith("all")) {
                boolean freezeVal = "yes".equalsIgnoreCase(scopeFreeze) || "true".equalsIgnoreCase(scopeFreeze);
                predicates.add(cb.equal(root.get("scopeFreeze"), freezeVal));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ProjectRequirementEntity> pageResult = requirementRepository.findAll(spec, pageable);
        List<RequirementResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<RequirementResponse>builder()
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
    public RequirementResponse getRequirementById(String requirementId) {
        ProjectRequirementEntity entity = findOrThrow(requirementId);
        return mapToResponse(entity);
    }

    @Transactional
    public RequirementResponse createRequirement(CreateRequirementRequest request, String currentUsername, List<String> userRoles) {
        ProjectEntity project = projectRepository.findByProjectId(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + request.getProjectId()));

        String reqClientId = (request.getClientId() != null && !request.getClientId().isBlank())
                ? request.getClientId()
                : project.getClientId();

        ClientEntity client = clientRepository.findByClientCode(reqClientId)
                .or(() -> clientRepository.findById(reqClientId))
                .orElse(null);

        boolean clientMatches = false;
        if (reqClientId.equalsIgnoreCase(project.getClientId())) {
            clientMatches = true;
        } else if (client != null) {
            clientMatches = (client.getClientCode() != null && client.getClientCode().equalsIgnoreCase(project.getClientId()))
                    || (client.getId() != null && client.getId().equalsIgnoreCase(project.getClientId()));
        }

        if (!clientMatches) {
            throw new BusinessValidationException(String.format(
                    "Relational integrity error: Project '%s' belongs to client '%s', not '%s'.",
                    project.getProjectId(), project.getClientId(), reqClientId
            ));
        }

        EmployeeMaster owner = employeeMasterRepository.findByEmployeeId(request.getOwnerId()).orElse(null);
        if (owner == null) {
            log.warn("Owner employee ID '{}' not found in employees table; proceeding with ID reference", request.getOwnerId());
        }

        LocalDate reqDate = resolveDate(request.getRequirementDate(), request.getDate());
        String reqType = (request.getRequirementType() != null && !request.getRequirementType().isBlank())
                ? request.getRequirementType()
                : (request.getType() != null ? request.getType() : "Feature");

        String feature = (request.getFeatureName() != null && !request.getFeatureName().isBlank())
                ? request.getFeatureName()
                : (request.getRequirementFeature() != null ? request.getRequirementFeature() : "New Feature");

        String rawPriority = request.getPriority();
        String priority = "Medium";
        if (rawPriority != null && !rawPriority.isBlank()) {
            String p = rawPriority.trim();
            if ("Critical".equalsIgnoreCase(p)) {
                priority = "Critical";
            } else if ("High".equalsIgnoreCase(p)) {
                priority = "High";
            } else if ("Low".equalsIgnoreCase(p)) {
                priority = "Low";
            } else {
                priority = "Medium";
            }
        }

        String rawStatus = request.getStatus();
        String status = "In Progress";
        if (rawStatus != null && !rawStatus.isBlank()) {
            if ("Completed".equalsIgnoreCase(rawStatus)) {
                status = "Completed";
            } else if ("Pending Approval".equalsIgnoreCase(rawStatus)) {
                status = "Pending Approval";
            } else if ("Under Review".equalsIgnoreCase(rawStatus)) {
                status = "Under Review";
            } else {
                status = "In Progress";
            }
        }

        int completion = request.getCompletionPercentage() != null ? request.getCompletionPercentage() : 0;
        if (completion < 0 || completion > 100) {
            throw new BusinessValidationException("Completion percentage must be between 0 and 100.");
        }

        boolean freeze = resolveScopeFreeze(request.getScopeFreeze(), request.getScopeFreezeText());

        String requirementId = idGeneratorService.generateRequirementId(reqDate);

        String rawAssigned = (request.getAssignedApprover() != null && !request.getAssignedApprover().isBlank())
                ? request.getAssignedApprover().trim()
                : (request.getApprovedBy() != null && !request.getApprovedBy().isBlank() ? request.getApprovedBy().trim() : "Akshit Ujjain");
        String assignedApproverVal = normalizeAssignedApprover(rawAssigned);

        String approvedByVal = null;
        LocalDate appDate = null;

        if ("Completed".equalsIgnoreCase(status) || "Approved".equalsIgnoreCase(status)) {
            status = "Completed";
            approvedByVal = resolveApproverDisplayName(assignedApproverVal, currentUsername);
            appDate = request.getApprovalDate() != null ? request.getApprovalDate() : LocalDate.now();
            completion = 100;
        } else {
            status = "In Progress";
            approvedByVal = null;
            appDate = null;
        }

        ProjectRequirementEntity entity = ProjectRequirementEntity.builder()
                .requirementId(requirementId)
                .projectId(project.getProjectId())
                .clientId(project.getClientId())
                .requirementDate(reqDate)
                .requirementType(reqType)
                .featureName(feature)
                .description(request.getDescription())
                .priority(priority)
                .ownerId(request.getOwnerId())
                .status(status)
                .scopeFreeze(freeze)
                .assignedApprover(assignedApproverVal)
                .completionPercentage(completion)
                .approvedBy(approvedByVal)
                .approvalDate(appDate)
                .build();

        if (freeze) {
            entity.setScopeFrozenAt(OffsetDateTime.now());
            entity.setScopeFrozenBy(currentUsername);
        }

        ProjectRequirementEntity saved = requirementRepository.save(entity);
        log.info("Created requirement {} for project {}", saved.getRequirementId(), saved.getProjectId());
        return mapToResponse(saved);
    }

    @Transactional
    public RequirementResponse updateRequirement(String requirementId, UpdateRequirementRequest request, String currentUsername, List<String> userRoles) {
        ProjectRequirementEntity entity = findOrThrow(requirementId);

        boolean isElevated = isManagerOrAdmin(userRoles);
        if (Boolean.TRUE.equals(entity.getScopeFreeze()) && !isElevated) {
            throw new BusinessValidationException(String.format(
                    "Requirement '%s' is scope frozen. Only managers, CEOs, and administrators can modify a frozen requirement.",
                    requirementId
            ));
        }

        if (request.getProjectId() != null || request.getClientId() != null) {
            String newProjId = request.getProjectId() != null ? request.getProjectId() : entity.getProjectId();
            String newClientId = request.getClientId() != null ? request.getClientId() : entity.getClientId();

            ProjectEntity project = projectRepository.findByProjectId(newProjId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + newProjId));
            ClientEntity client = clientRepository.findByClientCode(newClientId)
                    .or(() -> clientRepository.findById(newClientId))
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found with ID or code: " + newClientId));

            boolean clientMatches = project.getClientId().equalsIgnoreCase(client.getClientCode())
                    || project.getClientId().equalsIgnoreCase(client.getId())
                    || newClientId.equalsIgnoreCase(project.getClientId());

            if (!clientMatches) {
                throw new BusinessValidationException(String.format(
                        "Relational integrity error: Project '%s' belongs to client '%s', not '%s'.",
                        project.getProjectId(), project.getClientId(), newClientId
                ));
            }
            entity.setProjectId(project.getProjectId());
            entity.setClientId(project.getClientId());
        }

        if (request.getRequirementDate() != null || request.getDate() != null) {
            entity.setRequirementDate(resolveDate(request.getRequirementDate(), request.getDate()));
        }

        if (request.getRequirementType() != null || request.getType() != null) {
            entity.setRequirementType(request.getRequirementType() != null ? request.getRequirementType() : request.getType());
        }

        if (request.getFeatureName() != null || request.getRequirementFeature() != null) {
            entity.setFeatureName(request.getFeatureName() != null ? request.getFeatureName() : request.getRequirementFeature());
        }

        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }

        if (request.getPriority() != null) {
            String p = request.getPriority().trim();
            if ("Critical".equalsIgnoreCase(p)) {
                entity.setPriority("Critical");
            } else if ("High".equalsIgnoreCase(p)) {
                entity.setPriority("High");
            } else if ("Low".equalsIgnoreCase(p)) {
                entity.setPriority("Low");
            } else {
                entity.setPriority("Medium");
            }
        }

        if (request.getStatus() != null) {
            String s = request.getStatus().trim();
            if ("Completed".equalsIgnoreCase(s)) {
                entity.setStatus("Completed");
            } else if ("Pending Approval".equalsIgnoreCase(s)) {
                entity.setStatus("Pending Approval");
            } else if ("Under Review".equalsIgnoreCase(s)) {
                entity.setStatus("Under Review");
            } else {
                entity.setStatus("In Progress");
            }
        }

        if (request.getOwnerId() != null) {
            entity.setOwnerId(request.getOwnerId());
        }

        if (request.getAssignedApprover() != null && !request.getAssignedApprover().isBlank()) {
            entity.setAssignedApprover(normalizeAssignedApprover(request.getAssignedApprover()));
        } else if (request.getApprovedBy() != null && !request.getApprovedBy().isBlank() && !" - ".equals(request.getApprovedBy().trim()) && !"-".equals(request.getApprovedBy().trim())) {
            entity.setAssignedApprover(normalizeAssignedApprover(request.getApprovedBy()));
        }

        if (request.getCompletionPercentage() != null) {
            int comp = request.getCompletionPercentage();
            if (comp < 0 || comp > 100) {
                throw new BusinessValidationException("Completion percentage must be between 0 and 100.");
            }
            entity.setCompletionPercentage(comp);
            if (comp == 100 && !"Completed".equalsIgnoreCase(entity.getStatus())) {
                if (isElevated) {
                    entity.setStatus("Completed");
                    entity.setApprovedBy(resolveApproverDisplayName(entity.getAssignedApprover(), currentUsername));
                    entity.setApprovalDate(LocalDate.now());
                } else {
                    entity.setStatus("Pending Approval");
                }
            } else if (comp < 100 && "Completed".equalsIgnoreCase(entity.getStatus())) {
                entity.setStatus("In Progress");
                entity.setApprovedBy(null);
                entity.setApprovalDate(null);
            }
        }

        if (request.getStatus() != null) {
            String newStatus = request.getStatus().trim();
            String oldStatus = entity.getStatus();
            if ("Completed".equalsIgnoreCase(newStatus) || "Approved".equalsIgnoreCase(newStatus)) {
                if (!isElevated) {
                    throw new BusinessValidationException("Only managers, CEOs, and administrators can complete or approve requirements.");
                }
                entity.setStatus("Completed");
                entity.setCompletionPercentage(100);
                entity.setApprovedBy(resolveApproverDisplayName(entity.getAssignedApprover(), currentUsername));
                entity.setApprovalDate(LocalDate.now());
            } else {
                entity.setStatus(newStatus);
                if ("Completed".equalsIgnoreCase(oldStatus) || "Approved".equalsIgnoreCase(oldStatus)) {
                    entity.setApprovedBy(null);
                    entity.setApprovalDate(null);
                }
            }
        }

        if (request.getScopeFreeze() != null || request.getScopeFreezeText() != null) {
            entity.setScopeFreeze(resolveScopeFreeze(request.getScopeFreeze(), request.getScopeFreezeText()));
        }

        ProjectRequirementEntity saved = requirementRepository.save(entity);
        log.info("Updated requirement {}", saved.getRequirementId());
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteRequirement(String requirementId, String currentUsername, List<String> userRoles) {
        ProjectRequirementEntity entity = findOrThrow(requirementId);

        boolean isElevated = isManagerOrAdmin(userRoles);
        if (Boolean.TRUE.equals(entity.getScopeFreeze()) && !isElevated) {
            throw new BusinessValidationException(String.format(
                    "Requirement '%s' is scope frozen. Only managers, CEOs, and administrators can delete a frozen requirement.",
                    requirementId
            ));
        }

        requirementRepository.delete(entity);
        log.info("Deleted requirement {} by user {}", requirementId, currentUsername);
    }

    @Transactional
    public RequirementResponse updateStatus(String requirementId, UpdateRequirementStatusRequest request, String currentUsername, List<String> userRoles) {
        ProjectRequirementEntity entity = findOrThrow(requirementId);

        boolean isElevated = isManagerOrAdmin(userRoles);
        if (Boolean.TRUE.equals(entity.getScopeFreeze()) && !isElevated) {
            throw new BusinessValidationException("Requirement is scope frozen. Cannot update status without manager/admin authorization.");
        }

        String targetStatus = request.getStatus();
        if ("Approved".equalsIgnoreCase(targetStatus) || "Completed".equalsIgnoreCase(targetStatus)) {
            if (!isElevated) {
                throw new BusinessValidationException("Only managers, CEOs, and administrators can approve or complete requirements.");
            }
            entity.setStatus("Completed");
            entity.setCompletionPercentage(100);
            entity.setApprovedBy(resolveApproverDisplayName(entity.getAssignedApprover(), currentUsername));
            entity.setApprovalDate(LocalDate.now());
        } else {
            entity.setStatus(targetStatus != null && !targetStatus.isBlank() ? targetStatus : "In Progress");
            entity.setApprovedBy(null);
            entity.setApprovalDate(null);
        }

        ProjectRequirementEntity saved = requirementRepository.save(entity);
        log.info("Updated status of requirement {} to {}", requirementId, entity.getStatus());
        return mapToResponse(saved);
    }

    @Transactional
    public RequirementResponse approveRequirement(String requirementId, String currentUsername, List<String> userRoles) {
        ProjectRequirementEntity entity = findOrThrow(requirementId);

        boolean isElevated = isManagerOrAdmin(userRoles);
        if (!isElevated) {
            throw new BusinessValidationException("Only managers, CEOs, and administrators can approve requirements.");
        }

        entity.setStatus("Completed");
        entity.setCompletionPercentage(100);
        entity.setApprovedBy(resolveApproverDisplayName(entity.getAssignedApprover(), currentUsername));
        entity.setApprovalDate(LocalDate.now());

        ProjectRequirementEntity saved = requirementRepository.save(entity);
        log.info("Requirement {} APPROVED by {}", requirementId, entity.getApprovedBy());
        return mapToResponse(saved);
    }

    @Transactional
    public RequirementResponse revokeApproval(String requirementId, String currentUsername, List<String> userRoles) {
        ProjectRequirementEntity entity = findOrThrow(requirementId);

        boolean isElevated = isManagerOrAdmin(userRoles);
        if (!isElevated) {
            throw new BusinessValidationException("Only managers, CEOs, and administrators can revoke requirement approval.");
        }

        entity.setStatus("In Progress");
        entity.setApprovedBy(null);
        entity.setApprovalDate(null);

        ProjectRequirementEntity saved = requirementRepository.save(entity);
        log.info("Requirement {} approval REVOKED by {}", requirementId, currentUsername);
        return mapToResponse(saved);
    }

    @Transactional
    public RequirementResponse updateCompletionPercentage(String requirementId, UpdateCompletionPercentageRequest request, String currentUsername, List<String> userRoles) {
        ProjectRequirementEntity entity = findOrThrow(requirementId);

        boolean isElevated = isManagerOrAdmin(userRoles);
        if (Boolean.TRUE.equals(entity.getScopeFreeze()) && !isElevated) {
            throw new BusinessValidationException("Requirement is scope frozen. Cannot update progress without manager/admin authorization.");
        }

        int percentage = request.getCompletionPercentage();
        entity.setCompletionPercentage(percentage);
        if (percentage == 100) {
            entity.setStatus("Completed");
            if (isElevated) {
                entity.setApprovedBy(resolveApproverDisplayName(currentUsername));
                entity.setApprovalDate(LocalDate.now());
            }
        } else if ("Completed".equalsIgnoreCase(entity.getStatus())) {
            entity.setStatus("In Progress");
            entity.setApprovedBy(null);
            entity.setApprovalDate(null);
        }

        ProjectRequirementEntity saved = requirementRepository.save(entity);
        log.info("Updated completion percentage of requirement {} to {}%", requirementId, percentage);
        return mapToResponse(saved);
    }

    @Transactional
    public RequirementResponse toggleScopeFreeze(String requirementId, ScopeFreezeRequest request, String currentUsername, List<String> userRoles) {
        ProjectRequirementEntity entity = findOrThrow(requirementId);

        boolean isElevated = isManagerOrAdmin(userRoles);
        if (!isElevated) {
            throw new BusinessValidationException("Access Denied: Only managers, CEOs, and administrators can freeze or unfreeze requirements.");
        }

        boolean shouldFreeze = Boolean.TRUE.equals(request.getScopeFreeze());
        entity.setScopeFreeze(shouldFreeze);

        if (shouldFreeze) {
            entity.setScopeFrozenAt(OffsetDateTime.now());
            entity.setScopeFrozenBy(currentUsername);
            log.info("Requirement {} scope FROZEN by {}. Reason: {}", requirementId, currentUsername, request.getReason());
        } else {
            entity.setScopeFrozenAt(null);
            entity.setScopeFrozenBy(null);
            log.info("Requirement {} scope UNFROZEN by {}. Reason: {}", requirementId, currentUsername, request.getReason());
        }

        ProjectRequirementEntity saved = requirementRepository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public RequirementKpisResponse getKpis() {
        long total = requirementRepository.count();
        long inProgress = requirementRepository.countByStatusIgnoreCase("In Progress");
        long completed = requirementRepository.countByStatusIgnoreCase("Completed");
        long pending = requirementRepository.countByStatusIgnoreCase("Pending Approval");
        long frozen = requirementRepository.countByScopeFreezeTrue();

        return RequirementKpisResponse.builder()
                .totalRequirements(total)
                .inProgress(inProgress)
                .completed(completed)
                .pendingApproval(pending)
                .scopeFrozen(frozen)
                .build();
    }

    private ProjectRequirementEntity findOrThrow(String requirementId) {
        return requirementRepository.findByRequirementId(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement not found with ID: " + requirementId));
    }

    private RequirementResponse mapToResponse(ProjectRequirementEntity entity) {
        EmployeeMaster owner = employeeMasterRepository.findByEmployeeId(entity.getOwnerId()).orElse(null);
        String ownerName = owner != null ? owner.getFullName() : entity.getOwnerId();

        return RequirementResponse.builder()
                .requirementId(entity.getRequirementId())
                .projectId(entity.getProjectId())
                .clientId(entity.getClientId())
                .requirementDate(entity.getRequirementDate())
                .date(entity.getRequirementDate() != null ? entity.getRequirementDate().toString() : null)
                .requirementType(entity.getRequirementType())
                .type(entity.getRequirementType())
                .featureName(entity.getFeatureName())
                .requirementFeature(entity.getFeatureName())
                .description(entity.getDescription())
                .priority(entity.getPriority())
                .ownerId(entity.getOwnerId())
                .ownerName(ownerName)
                .status(entity.getStatus())
                .scopeFreeze(entity.getScopeFreeze())
                .scopeFreezeText(Boolean.TRUE.equals(entity.getScopeFreeze()) ? "Yes" : "No")
                .scopeFrozenAt(entity.getScopeFrozenAt())
                .scopeFrozenBy(entity.getScopeFrozenBy())
                .assignedApprover(entity.getAssignedApprover() != null ? entity.getAssignedApprover() : "Admin – Akshit Ujjain")
                .approvedBy(entity.getApprovedBy())
                .approvalDate(entity.getApprovalDate())
                .completionPercentage(entity.getCompletionPercentage())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private boolean resolveScopeFreeze(Boolean freeze, String freezeText) {
        if (freeze != null) {
            return freeze;
        }
        if (freezeText != null && !freezeText.isBlank()) {
            return "yes".equalsIgnoreCase(freezeText) || "true".equalsIgnoreCase(freezeText);
        }
        return false;
    }

    private LocalDate resolveDate(LocalDate date, String dateStr) {
        if (date != null) {
            return date;
        }
        if (dateStr != null && !dateStr.isBlank()) {
            return LocalDate.parse(dateStr.trim());
        }
        return LocalDate.now();
    }

    private boolean isManagerOrAdmin(List<String> userRoles) {
        if (userRoles == null) return false;
        return userRoles.stream().anyMatch(r ->
                "ROLE_ADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r) ||
                "ROLE_CEO".equalsIgnoreCase(r) || "CEO".equalsIgnoreCase(r) ||
                "ROLE_MD".equalsIgnoreCase(r) || "MD".equalsIgnoreCase(r) ||
                "ROLE_MANAGER".equalsIgnoreCase(r) || "MANAGER".equalsIgnoreCase(r) ||
                "ROLE_PROJECT_MANAGER".equalsIgnoreCase(r) || "PROJECT_MANAGER".equalsIgnoreCase(r)
        );
    }

    public String normalizeAssignedApprover(String input) {
        if (input == null || input.isBlank()) {
            return "Admin – Akshit Ujjain";
        }
        String trimmed = input.trim();
        String lower = trimmed.toLowerCase();
        if (lower.contains("gaurav")) {
            return trimmed.contains("–") || trimmed.contains("-") ? trimmed : "MD – Gaurav Tripathy";
        }
        if (lower.contains("akshit")) {
            return trimmed.contains("–") || trimmed.contains("-") ? trimmed : "Admin – Akshit Ujjain";
        }
        return trimmed;
    }

    public String resolveApproverDisplayName(String assignedApprover, String username) {
        if (assignedApprover != null && !assignedApprover.isBlank()) {
            String lower = assignedApprover.toLowerCase();
            if (lower.contains("gaurav")) {
                return "Gaurav Tripathy";
            }
            if (lower.contains("akshit")) {
                return "Akshit Ujjain";
            }
            return assignedApprover.trim();
        }
        if (username != null && !username.isBlank() && !"system".equalsIgnoreCase(username) && !"anonymousUser".equalsIgnoreCase(username)) {
            String lower = username.toLowerCase();
            if (lower.contains("gaurav")) {
                return "Gaurav Tripathy";
            }
            if (lower.contains("akshit")) {
                return "Akshit Ujjain";
            }
            return resolveApproverDisplayName(username);
        }
        return "Akshit Ujjain";
    }

    public String resolveApproverDisplayName(String username) {
        if (username == null || username.isBlank() || "system".equalsIgnoreCase(username) || "anonymousUser".equalsIgnoreCase(username)) {
            return "Akshit Ujjain";
        }
        if ("akshit.ujjain".equalsIgnoreCase(username) || "akshit".equalsIgnoreCase(username)) {
            return "Akshit Ujjain";
        }
        if ("gaurav.tripathy".equalsIgnoreCase(username) || "gaurav".equalsIgnoreCase(username)) {
            return "Gaurav Tripathy";
        }
        java.util.Optional<EmployeeMaster> empOpt = employeeMasterRepository.findByEmployeeId(username);
        if (empOpt.isPresent() && empOpt.get().getFullName() != null && !empOpt.get().getFullName().isBlank()) {
            return empOpt.get().getFullName();
        }
        for (EmployeeMaster emp : employeeMasterRepository.findAll()) {
            if (emp.getWorkEmail() != null && emp.getWorkEmail().toLowerCase().startsWith(username.toLowerCase())) {
                return emp.getFullName();
            }
            if (emp.getFullName() != null && emp.getFullName().equalsIgnoreCase(username)) {
                return emp.getFullName();
            }
        }
        if (username.contains(".")) {
            String[] parts = username.split("\\.");
            StringBuilder sb = new StringBuilder();
            for (String part : parts) {
                if (!part.isEmpty()) {
                    if (sb.length() > 0) sb.append(" ");
                    sb.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1));
                }
            }
            return sb.toString();
        }
        return username;
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "requirementId"));
        }
        String[] parts = sort.split(",");
        String property = parts[0].trim();
        Sort.Direction direction = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Sort primary = Sort.by(direction, property);
        return "requirementId".equalsIgnoreCase(property)
                ? primary
                : primary.and(Sort.by(Sort.Direction.DESC, "requirementId"));
    }
}