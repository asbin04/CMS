package com.company.project.projects.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.dashboard.entity.EmployeeMaster;
import com.company.project.dashboard.repository.EmployeeMasterRepository;
import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectDevelopmentEntity;
import com.company.project.projects.repository.ProjectDevelopmentRepository;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectRequirementRepository;
import com.company.project.projects.repository.ProjectTaskRepository;
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

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DevelopmentServiceImpl implements DevelopmentService {

    private static final Set<String> ALLOWED_ENVIRONMENTS = Set.of("Dev", "QA", "Staging", "Prod");
    private static final Set<String> ALLOWED_REVIEW_STATUSES = Set.of("Approved", "In Review", "Changes Requested");
    private static final Set<String> ALLOWED_STATUSES = Set.of("In Progress", "QA", "Released");

    private final ProjectDevelopmentRepository developmentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectRequirementRepository requirementRepository;
    private final ProjectTaskRepository taskRepository;
    private final EmployeeMasterRepository employeeMasterRepository;
    private final ProjectModuleIdGenerator idGeneratorService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DevelopmentResponse> getDevelopments(
            String search,
            String project,
            String environment,
            String status,
            String reviewStatus,
            String sort,
            int page,
            int size
    ) {
        int pageIndex = Math.max(0, page - 1);
        int pageSize = Math.max(1, size);

        Sort sortObj = parseSort(sort);
        Pageable pageable = PageRequest.of(pageIndex, pageSize, sortObj);

        Specification<ProjectDevelopmentEntity> spec = buildSpecification(search, project, environment, status, reviewStatus);
        Page<ProjectDevelopmentEntity> entityPage = developmentRepository.findAll(spec, pageable);

        List<DevelopmentResponse> content = entityPage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<DevelopmentResponse>builder()
                .content(content)
                .pageNumber(entityPage.getNumber() + 1)
                .pageSize(entityPage.getSize())
                .totalElements(entityPage.getTotalElements())
                .totalPages(entityPage.getTotalPages())
                .first(entityPage.isFirst())
                .last(entityPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DevelopmentKpisResponse getKpis() {
        long total = developmentRepository.count();
        long inDev = developmentRepository.countByStatusIgnoreCase("In Progress");
        long inReview = developmentRepository.countByCodeReviewStatusIgnoreCase("In Review");
        long qa = developmentRepository.countByStatusIgnoreCase("QA");
        long released = developmentRepository.countByStatusIgnoreCase("Released");

        OffsetDateTime startOfCurrentMonth = OffsetDateTime.now()
                .withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        long prevTotal = developmentRepository.countByCreatedAtBefore(startOfCurrentMonth);
        long prevInDev = developmentRepository.countByStatusIgnoreCaseAndCreatedAtBefore("In Progress", startOfCurrentMonth);
        long prevInReview = developmentRepository.countByCodeReviewStatusIgnoreCaseAndCreatedAtBefore("In Review", startOfCurrentMonth);
        long prevQa = developmentRepository.countByStatusIgnoreCaseAndCreatedAtBefore("QA", startOfCurrentMonth);
        long prevReleased = developmentRepository.countByStatusIgnoreCaseAndCreatedAtBefore("Released", startOfCurrentMonth);

        return DevelopmentKpisResponse.builder()
                .totalDevelopments(total)
                .inDevelopment(inDev)
                .inCodeReview(inReview)
                .qaHandover(qa)
                .released(released)
                .totalDevelopmentsTrend(calculateTrend(total, prevTotal))
                .inDevelopmentTrend(calculateTrend(inDev, prevInDev))
                .inCodeReviewTrend(calculateTrend(inReview, prevInReview))
                .qaHandoverTrend(calculateTrend(qa, prevQa))
                .releasedTrend(calculateTrend(released, prevReleased))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public String getNextDevelopmentId() {
        return idGeneratorService.previewNextDevelopmentId();
    }

    @Override
    @Transactional(readOnly = true)
    public DevelopmentResponse getDevelopmentById(String id) {
        ProjectDevelopmentEntity entity = developmentRepository.findByDevelopmentId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Development record not found with ID: " + id));
        return mapToResponse(entity);
    }

    @Override
    @Transactional
    public DevelopmentResponse createDevelopment(CreateDevelopmentRequest request, String currentUsername) {
        validateProject(request.getProjectId());
        validateRequirement(request.getProjectId(), request.getRequirementId());
        validateTask(request.getProjectId(), request.getTaskId());

        ResolvedDeveloper dev = resolveDeveloper(request.getDeveloperId(), request.getDeveloperName());

        String env = normalizeEnvironment(request.getEnvironment());
        String codeReview = normalizeCodeReviewStatus(request.getCodeReviewStatus());
        String devStatus = normalizeDevelopmentStatus(request.getStatus());

        validateUrl(request.getRepositoryUrl(), "Repository URL", true);
        validateUrl(request.getDocumentationLink(), "Documentation Link", false);

        String developmentId = idGeneratorService.generateDevelopmentId(request.getQaHandoffDate());

        ProjectDevelopmentEntity entity = ProjectDevelopmentEntity.builder()
                .developmentId(developmentId)
                .projectId(request.getProjectId().trim())
                .requirementId(request.getRequirementId().trim())
                .taskId(request.getTaskId().trim())
                .developerId(dev.employeeId())
                .developerName(dev.fullName())
                .repositoryUrl(request.getRepositoryUrl().trim())
                .branch(request.getBranch().trim())
                .environment(env)
                .buildVersion(request.getBuildVersion().trim())
                .codeReviewStatus(codeReview)
                .qaHandoffDate(request.getQaHandoffDate())
                .releaseId((request.getReleaseId() != null && !request.getReleaseId().isBlank()) ? request.getReleaseId().trim() : "-")
                .status(devStatus)
                .technicalNotes(request.getTechnicalNotes())
                .documentationLink(request.getDocumentationLink() != null ? request.getDocumentationLink().trim() : null)
                .createdBy(currentUsername != null ? currentUsername : "SYSTEM")
                .updatedBy(currentUsername != null ? currentUsername : "SYSTEM")
                .build();

        ProjectDevelopmentEntity saved = developmentRepository.save(entity);
        log.info("Created development record ID: {} by user: {}", saved.getDevelopmentId(), currentUsername);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public DevelopmentResponse updateDevelopment(String id, UpdateDevelopmentRequest request, String currentUsername) {
        ProjectDevelopmentEntity entity = developmentRepository.findByDevelopmentId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Development record not found with ID: " + id));

        String targetProjectId = (request.getProjectId() != null && !request.getProjectId().isBlank())
                ? request.getProjectId().trim() : entity.getProjectId();
        String targetReqId = (request.getRequirementId() != null && !request.getRequirementId().isBlank())
                ? request.getRequirementId().trim() : entity.getRequirementId();
        String targetTaskId = (request.getTaskId() != null && !request.getTaskId().isBlank())
                ? request.getTaskId().trim() : entity.getTaskId();

        validateProject(targetProjectId);
        validateRequirement(targetProjectId, targetReqId);
        validateTask(targetProjectId, targetTaskId);

        entity.setProjectId(targetProjectId);
        entity.setRequirementId(targetReqId);
        entity.setTaskId(targetTaskId);

        if (request.getDeveloperId() != null || request.getDeveloperName() != null) {
            ResolvedDeveloper dev = resolveDeveloper(request.getDeveloperId(), request.getDeveloperName());
            entity.setDeveloperId(dev.employeeId());
            entity.setDeveloperName(dev.fullName());
        }

        if (request.getRepositoryUrl() != null && !request.getRepositoryUrl().isBlank()) {
            validateUrl(request.getRepositoryUrl(), "Repository URL", true);
            entity.setRepositoryUrl(request.getRepositoryUrl().trim());
        }

        if (request.getBranch() != null && !request.getBranch().isBlank()) {
            entity.setBranch(request.getBranch().trim());
        }

        if (request.getEnvironment() != null && !request.getEnvironment().isBlank()) {
            entity.setEnvironment(normalizeEnvironment(request.getEnvironment()));
        }

        if (request.getBuildVersion() != null && !request.getBuildVersion().isBlank()) {
            entity.setBuildVersion(request.getBuildVersion().trim());
        }

        if (request.getCodeReviewStatus() != null && !request.getCodeReviewStatus().isBlank()) {
            entity.setCodeReviewStatus(normalizeCodeReviewStatus(request.getCodeReviewStatus()));
        }

        if (request.getQaHandoffDate() != null) {
            entity.setQaHandoffDate(request.getQaHandoffDate());
        }

        if (request.getReleaseId() != null && !request.getReleaseId().isBlank()) {
            entity.setReleaseId(request.getReleaseId().trim());
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            entity.setStatus(normalizeDevelopmentStatus(request.getStatus()));
        }

        if (request.getTechnicalNotes() != null) {
            entity.setTechnicalNotes(request.getTechnicalNotes());
        }

        if (request.getDocumentationLink() != null) {
            validateUrl(request.getDocumentationLink(), "Documentation Link", false);
            entity.setDocumentationLink(request.getDocumentationLink().trim());
        }

        entity.setUpdatedBy(currentUsername != null ? currentUsername : "SYSTEM");

        ProjectDevelopmentEntity updated = developmentRepository.save(entity);
        log.info("Updated development record ID: {} by user: {}", updated.getDevelopmentId(), currentUsername);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public DevelopmentResponse updateStatus(String id, UpdateDevelopmentStatusRequest request, String currentUsername) {
        ProjectDevelopmentEntity entity = developmentRepository.findByDevelopmentId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Development record not found with ID: " + id));

        String newStatus = normalizeDevelopmentStatus(request.getStatus());
        entity.setStatus(newStatus);
        entity.setUpdatedBy(currentUsername != null ? currentUsername : "SYSTEM");

        ProjectDevelopmentEntity updated = developmentRepository.save(entity);
        log.info("Updated status for development ID: {} to '{}' by user: {}", id, newStatus, currentUsername);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public DevelopmentResponse updateCodeReviewStatus(String id, UpdateCodeReviewStatusRequest request, String currentUsername) {
        ProjectDevelopmentEntity entity = developmentRepository.findByDevelopmentId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Development record not found with ID: " + id));

        String newReviewStatus = normalizeCodeReviewStatus(request.getCodeReviewStatus());
        entity.setCodeReviewStatus(newReviewStatus);
        entity.setUpdatedBy(currentUsername != null ? currentUsername : "SYSTEM");

        ProjectDevelopmentEntity updated = developmentRepository.save(entity);
        log.info("Updated code review status for development ID: {} to '{}' by user: {}", id, newReviewStatus, currentUsername);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteDevelopment(String id, String currentUsername) {
        ProjectDevelopmentEntity entity = developmentRepository.findByDevelopmentId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Development record not found with ID: " + id));

        developmentRepository.delete(entity);
        log.info("Deleted development record ID: {} by user: {}", id, currentUsername);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportDevelopmentsToCsv(
            String search,
            String project,
            String environment,
            String status,
            String reviewStatus
    ) {
        Specification<ProjectDevelopmentEntity> spec = buildSpecification(search, project, environment, status, reviewStatus);
        List<ProjectDevelopmentEntity> list = developmentRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));

        StringBuilder sb = new StringBuilder();
        sb.append("Development ID,Project ID,Requirement ID,Task / Ticket ID,Developer ID,Developer Name,Repository URL,Branch,Environment,Build Version,Code Review Status,QA Handoff Date,Release ID,Status,Technical Notes,Documentation Link,Created By,Created At\n");

        for (ProjectDevelopmentEntity item : list) {
            sb.append(escapeCsv(item.getDevelopmentId())).append(",")
                    .append(escapeCsv(item.getProjectId())).append(",")
                    .append(escapeCsv(item.getRequirementId())).append(",")
                    .append(escapeCsv(item.getTaskId())).append(",")
                    .append(escapeCsv(item.getDeveloperId())).append(",")
                    .append(escapeCsv(item.getDeveloperName())).append(",")
                    .append(escapeCsv(item.getRepositoryUrl())).append(",")
                    .append(escapeCsv(item.getBranch())).append(",")
                    .append(escapeCsv(item.getEnvironment())).append(",")
                    .append(escapeCsv(item.getBuildVersion())).append(",")
                    .append(escapeCsv(item.getCodeReviewStatus())).append(",")
                    .append(escapeCsv(item.getQaHandoffDate() != null ? item.getQaHandoffDate().toString() : "-")).append(",")
                    .append(escapeCsv(item.getReleaseId())).append(",")
                    .append(escapeCsv(item.getStatus())).append(",")
                    .append(escapeCsv(item.getTechnicalNotes())).append(",")
                    .append(escapeCsv(item.getDocumentationLink())).append(",")
                    .append(escapeCsv(item.getCreatedBy())).append(",")
                    .append(escapeCsv(item.getCreatedAt() != null ? item.getCreatedAt().toString() : "-"))
                    .append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    // -------------------------------------------------------------------------
    // Helper Methods & Validations
    // -------------------------------------------------------------------------

    private void validateProject(String projectId) {
        if (projectId == null || projectId.isBlank()) {
            throw new BusinessValidationException("Project ID is required");
        }
        if (!projectRepository.existsByProjectId(projectId.trim())) {
            throw new BusinessValidationException("Project '" + projectId.trim() + "' does not exist");
        }
    }

    private void validateRequirement(String projectId, String requirementId) {
        if (requirementId == null || requirementId.isBlank()) {
            throw new BusinessValidationException("Requirement ID is required");
        }
        if (!requirementRepository.existsByProjectIdAndRequirementId(projectId.trim(), requirementId.trim())) {
            throw new BusinessValidationException("Requirement '" + requirementId.trim() + "' does not belong to project '" + projectId.trim() + "'");
        }
    }

    private void validateTask(String projectId, String taskId) {
        if (taskId == null || taskId.isBlank()) {
            throw new BusinessValidationException("Task ID is required");
        }
        if (!taskRepository.existsByProjectIdAndTaskId(projectId.trim(), taskId.trim())) {
            throw new BusinessValidationException("Task '" + taskId.trim() + "' does not belong to project '" + projectId.trim() + "'");
        }
    }

    private record ResolvedDeveloper(String employeeId, String fullName) {}

    private ResolvedDeveloper resolveDeveloper(String developerId, String developerName) {
        if (developerId != null && !developerId.isBlank()) {
            String trimmedId = developerId.trim();
            Optional<EmployeeMaster> empOpt = employeeMasterRepository.findByEmployeeId(trimmedId);
            if (empOpt.isPresent()) {
                EmployeeMaster emp = empOpt.get();
                return new ResolvedDeveloper(emp.getEmployeeId(), emp.getFullName());
            }
        }

        if (developerName != null && !developerName.isBlank()) {
            String trimmedName = developerName.trim();
            Optional<EmployeeMaster> empOpt = employeeMasterRepository.findByEmployeeId(trimmedName);
            if (empOpt.isPresent()) {
                EmployeeMaster emp = empOpt.get();
                return new ResolvedDeveloper(emp.getEmployeeId(), emp.getFullName());
            }

            for (EmployeeMaster emp : employeeMasterRepository.findAll()) {
                if (emp.getFullName() != null && emp.getFullName().equalsIgnoreCase(trimmedName)) {
                    return new ResolvedDeveloper(emp.getEmployeeId(), emp.getFullName());
                }
            }
        }

        throw new BusinessValidationException(
                "Developer could not be resolved against registered employees: " +
                        (developerName != null ? developerName : developerId)
        );
    }

    private String normalizeEnvironment(String env) {
        if (env == null || env.isBlank()) {
            throw new BusinessValidationException("Environment is required");
        }
        for (String allowed : ALLOWED_ENVIRONMENTS) {
            if (allowed.equalsIgnoreCase(env.trim())) {
                return allowed;
            }
        }
        throw new BusinessValidationException("Invalid environment: '" + env + "'. Allowed values: " + ALLOWED_ENVIRONMENTS);
    }

    private String normalizeCodeReviewStatus(String status) {
        if (status == null || status.isBlank()) {
            return "In Review";
        }
        for (String allowed : ALLOWED_REVIEW_STATUSES) {
            if (allowed.equalsIgnoreCase(status.trim())) {
                return allowed;
            }
        }
        throw new BusinessValidationException("Invalid code review status: '" + status + "'. Allowed values: " + ALLOWED_REVIEW_STATUSES);
    }

    private String normalizeDevelopmentStatus(String status) {
        if (status == null || status.isBlank()) {
            return "In Progress";
        }
        for (String allowed : ALLOWED_STATUSES) {
            if (allowed.equalsIgnoreCase(status.trim())) {
                return allowed;
            }
        }
        throw new BusinessValidationException("Invalid development status: '" + status + "'. Allowed values: " + ALLOWED_STATUSES);
    }

    private void validateUrl(String url, String fieldName, boolean required) {
        if (url == null || url.isBlank()) {
            if (required) {
                throw new BusinessValidationException(fieldName + " is required");
            }
            return;
        }
        String trimmed = url.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")
                && !trimmed.startsWith("git@") && !trimmed.startsWith("github.com")) {
            throw new BusinessValidationException(fieldName + " must be a valid URL (got: '" + url + "')");
        }
    }

    private String calculateTrend(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? ("+" + current + " this month") : "0% vs last month";
        }
        long diff = current - previous;
        long pct = (diff * 100) / previous;
        if (pct >= 0) {
            return "+" + pct + "% vs last month";
        } else {
            return pct + "% vs last month";
        }
    }

    private Specification<ProjectDevelopmentEntity> buildSpecification(
            String search,
            String project,
            String environment,
            String status,
            String reviewStatus
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate devIdLike = cb.like(cb.lower(root.get("developmentId")), pattern);
                Predicate projIdLike = cb.like(cb.lower(root.get("projectId")), pattern);
                Predicate reqIdLike = cb.like(cb.lower(root.get("requirementId")), pattern);
                Predicate taskIdLike = cb.like(cb.lower(root.get("taskId")), pattern);
                Predicate devNameLike = cb.like(cb.lower(root.get("developerName")), pattern);
                predicates.add(cb.or(devIdLike, projIdLike, reqIdLike, taskIdLike, devNameLike));
            }

            if (project != null && !project.isBlank() && !"all".equalsIgnoreCase(project.trim()) && !"all projects".equalsIgnoreCase(project.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("projectId")), project.trim().toLowerCase()));
            }

            if (environment != null && !environment.isBlank() && !"all".equalsIgnoreCase(environment.trim()) && !"all environment".equalsIgnoreCase(environment.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("environment")), environment.trim().toLowerCase()));
            }

            if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status.trim()) && !"all status".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            }

            if (reviewStatus != null && !reviewStatus.isBlank() && !"all".equalsIgnoreCase(reviewStatus.trim()) && !"all review status".equalsIgnoreCase(reviewStatus.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("codeReviewStatus")), reviewStatus.trim().toLowerCase()));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        String[] parts = sort.split(",");
        String prop = parts[0].trim();
        Sort.Direction dir = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()))
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        // Map property names if needed
        String mappedProp = switch (prop) {
            case "developmentId", "id" -> "developmentId";
            case "projectId", "project" -> "projectId";
            case "requirementId", "requirement" -> "requirementId";
            case "taskId", "task" -> "taskId";
            case "developerName", "developer" -> "developerName";
            case "environment" -> "environment";
            case "status" -> "status";
            case "codeReviewStatus", "reviewStatus" -> "codeReviewStatus";
            case "qaHandoffDate" -> "qaHandoffDate";
            case "releaseId" -> "releaseId";
            case "updatedAt" -> "updatedAt";
            default -> "createdAt";
        };

        return Sort.by(dir, mappedProp);
    }

    private DevelopmentResponse mapToResponse(ProjectDevelopmentEntity entity) {
        return DevelopmentResponse.builder()
                .developmentId(entity.getDevelopmentId())
                .projectId(entity.getProjectId())
                .requirementId(entity.getRequirementId())
                .taskId(entity.getTaskId())
                .developerId(entity.getDeveloperId())
                .developerName(entity.getDeveloperName())
                .repositoryUrl(entity.getRepositoryUrl())
                .branch(entity.getBranch())
                .environment(entity.getEnvironment())
                .buildVersion(entity.getBuildVersion())
                .codeReviewStatus(entity.getCodeReviewStatus())
                .qaHandoffDate(entity.getQaHandoffDate())
                .releaseId(entity.getReleaseId())
                .status(entity.getStatus())
                .technicalNotes(entity.getTechnicalNotes())
                .documentationLink(entity.getDocumentationLink())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "\"\"";
        }
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
