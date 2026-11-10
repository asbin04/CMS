package com.company.project.projects.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.dashboard.entity.EmployeeMaster;
import com.company.project.dashboard.repository.EmployeeMasterRepository;
import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectEntity;
import com.company.project.projects.entity.ProjectTaskEntity;
import com.company.project.projects.entity.ProjectTimesheetEntity;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectTaskRepository;
import com.company.project.projects.repository.ProjectTimesheetRepository;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimesheetService {

    private final ProjectTimesheetRepository timesheetRepository;
    private final ProjectRepository projectRepository;
    private final ProjectTaskRepository projectTaskRepository;
    private final EmployeeMasterRepository employeeMasterRepository;
    private final ProjectModuleIdGenerator idGeneratorService;

    @Transactional(readOnly = true)
    public PageResponse<TimesheetResponse> getTimesheets(
            String search,
            String employee,
            String project,
            String approvalStatus,
            String billable,
            String dateFrom,
            String dateTo,
            String sort,
            int page,
            int size
    ) {
        int pageIdx = Math.max(0, page > 0 ? page - 1 : page);
        int pageSize = size > 0 ? size : 10;

        Sort sortObj = parseSort(sort);
        Pageable pageable = PageRequest.of(pageIdx, pageSize, sortObj);

        Specification<ProjectTimesheetEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("timesheetId")), term),
                        cb.like(cb.lower(root.get("projectId")), term),
                        cb.like(cb.lower(root.get("taskId")), term),
                        cb.like(cb.lower(root.get("employeeId")), term),
                        cb.like(cb.lower(root.get("employeeName")), term),
                        cb.like(cb.lower(root.get("notes")), term)
                ));
            }

            if (employee != null && !employee.isBlank() && !employee.trim().toLowerCase().startsWith("all")) {
                String empTerm = employee.trim();
                List<String> matchedIds = new ArrayList<>();
                matchedIds.add(empTerm);
                for (EmployeeMaster em : employeeMasterRepository.findAll()) {
                    if (em.getFullName() != null && (em.getFullName().toLowerCase().contains(empTerm.toLowerCase()) || empTerm.toLowerCase().contains(em.getFullName().toLowerCase()))) {
                        matchedIds.add(em.getEmployeeId());
                    }
                    if (em.getEmployeeId() != null && em.getEmployeeId().equalsIgnoreCase(empTerm)) {
                        matchedIds.add(em.getEmployeeId());
                    }
                }
                predicates.add(root.get("employeeId").in(matchedIds));
            }

            if (project != null && !project.isBlank() && !project.trim().toLowerCase().startsWith("all")) {
                predicates.add(cb.equal(root.get("projectId"), project.trim()));
            }

            if (approvalStatus != null && !approvalStatus.isBlank() && !approvalStatus.trim().toLowerCase().startsWith("all")) {
                predicates.add(cb.equal(cb.lower(root.get("approvalStatus")), approvalStatus.trim().toLowerCase()));
            }

            if (billable != null && !billable.isBlank() && !billable.trim().toLowerCase().startsWith("all")) {
                boolean billableVal = "yes".equalsIgnoreCase(billable) || "true".equalsIgnoreCase(billable);
                predicates.add(cb.equal(root.get("isBillable"), billableVal));
            }

            if (dateFrom != null && !dateFrom.isBlank()) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("timesheetDate"), LocalDate.parse(dateFrom.trim())));
            }

            if (dateTo != null && !dateTo.isBlank()) {
                predicates.add(cb.lessThanOrEqualTo(root.get("timesheetDate"), LocalDate.parse(dateTo.trim())));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ProjectTimesheetEntity> pageResult = timesheetRepository.findAll(spec, pageable);
        List<TimesheetResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<TimesheetResponse>builder()
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
    public TimesheetResponse getTimesheetById(String timesheetId) {
        ProjectTimesheetEntity entity = findOrThrow(timesheetId);
        return mapToResponse(entity);
    }

    @Transactional
    public TimesheetResponse createTimesheet(CreateTimesheetRequest request, String currentUsername, List<String> userRoles) {
        ProjectEntity project = projectRepository.findByProjectId(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + request.getProjectId()));

        ProjectTaskEntity task = projectTaskRepository.findByTaskId(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + request.getTaskId()));

        if (!task.getProjectId().equals(project.getProjectId())) {
            throw new BusinessValidationException(String.format(
                    "Relational integrity error: Task '%s' belongs to project '%s', not '%s'.",
                    task.getTaskId(), task.getProjectId(), project.getProjectId()
            ));
        }

        EmployeeMaster employee = employeeMasterRepository.findByEmployeeId(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + request.getEmployeeId()));

        LocalDate date = resolveDate(request.getTimesheetDate(), request.getDate());
        BigDecimal hours = resolveHours(request.getHours(), request.getHoursSpent());

        if (hours.compareTo(BigDecimal.ZERO) <= 0 || hours.compareTo(new BigDecimal("24.00")) > 0) {
            throw new BusinessValidationException("Hours spent must be greater than 0 and at most 24 per timesheet entry.");
        }

        boolean billable = resolveBillable(request.getIsBillable(), request.getBillable());

        BigDecimal hourlyRate = request.getHourlyRate() != null ? request.getHourlyRate() : BigDecimal.ZERO;
        BigDecimal billableAmount = billable ? hourlyRate.multiply(hours).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        BigDecimal calculatedLaborCost = calculateLaborCost(employee, hours);

        BigDecimal laborCost = calculatedLaborCost;
        boolean overrideApplied = false;
        String overrideReason = null;

        if (request.getLaborCostOverride() != null && request.getLaborCostOverride().compareTo(BigDecimal.ZERO) >= 0) {
            laborCost = request.getLaborCostOverride().setScale(2, RoundingMode.HALF_UP);
            overrideApplied = true;
            overrideReason = request.getOverrideReason();
        }

        String timesheetId = idGeneratorService.generateTimesheetId(date);

        String empName = (request.getEmployeeName() != null && !request.getEmployeeName().isBlank())
                ? request.getEmployeeName()
                : employee.getFullName();

        boolean isElevated = isManagerOrAdmin(userRoles);
        String initialStatus = request.getApprovalStatus() != null && !request.getApprovalStatus().isBlank() ? request.getApprovalStatus() : "Pending";
        String rawAssigned = request.getAssignedApprover() != null && !request.getAssignedApprover().isBlank()
                ? request.getAssignedApprover().trim()
                : (request.getApprovedBy() != null && !request.getApprovedBy().isBlank() ? request.getApprovedBy().trim() : "Akshit Ujjain");
        String assignedApprover = normalizeAssignedApprover(rawAssigned);

        String approvedBy = null;
        OffsetDateTime approvedAt = null;
        if ("Approved".equalsIgnoreCase(initialStatus)) {
            initialStatus = "Approved";
            approvedBy = resolveApproverDisplayName(assignedApprover, currentUsername);
            approvedAt = OffsetDateTime.now();
        } else {
            initialStatus = "Pending";
            approvedBy = null;
            approvedAt = null;
        }

        ProjectTimesheetEntity entity = ProjectTimesheetEntity.builder()
                .timesheetId(timesheetId)
                .employeeId(employee.getEmployeeId())
                .employeeName(empName)
                .projectId(project.getProjectId())
                .taskId(task.getTaskId())
                .timesheetDate(date)
                .hours(hours)
                .notes(request.getTaskDescription() != null ? request.getTaskDescription() : request.getNotes())
                .isBillable(billable)
                .billableRate(hourlyRate)
                .billableAmount(billableAmount)
                .estimatedLaborCost(laborCost)
                .laborCostCalculated(calculatedLaborCost)
                .laborCostOverride(overrideApplied)
                .laborCostOverrideReason(overrideReason)
                .approvalStatus(initialStatus)
                .assignedApprover(assignedApprover)
                .approvedBy(approvedBy)
                .approvedAt(approvedAt)
                .clientApprovalStatus("Pending")
                .build();

        ProjectTimesheetEntity saved = timesheetRepository.save(entity);
        log.info("Created timesheet {} for employee {} on project {}", saved.getTimesheetId(), saved.getEmployeeId(), saved.getProjectId());
        return mapToResponse(saved);
    }

    @Transactional
    public TimesheetResponse updateTimesheet(String timesheetId, UpdateTimesheetRequest request, String currentUsername, List<String> userRoles) {
        ProjectTimesheetEntity entity = findOrThrow(timesheetId);

        if ("Approved".equalsIgnoreCase(entity.getApprovalStatus())) {
            boolean isElevated = isManagerOrAdmin(userRoles);
            if (!isElevated) {
                throw new BusinessValidationException("Cannot modify an already Approved timesheet without manager/admin authorization.");
            }
        }

        if (request.getProjectId() != null || request.getTaskId() != null) {
            String newProjId = request.getProjectId() != null ? request.getProjectId() : entity.getProjectId();
            String newTaskId = request.getTaskId() != null ? request.getTaskId() : entity.getTaskId();

            ProjectEntity project = projectRepository.findByProjectId(newProjId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + newProjId));

            ProjectTaskEntity task = projectTaskRepository.findByTaskId(newTaskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + newTaskId));

            if (!task.getProjectId().equals(project.getProjectId())) {
                throw new BusinessValidationException(String.format(
                        "Relational integrity error: Task '%s' belongs to project '%s', not '%s'.",
                        task.getTaskId(), task.getProjectId(), project.getProjectId()
                ));
            }
            entity.setProjectId(project.getProjectId());
            entity.setTaskId(task.getTaskId());
        }

        if (request.getEmployeeId() != null) {
            EmployeeMaster employee = employeeMasterRepository.findByEmployeeId(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + request.getEmployeeId()));
            entity.setEmployeeId(employee.getEmployeeId());
        }

        if (request.getTimesheetDate() != null || request.getDate() != null) {
            entity.setTimesheetDate(resolveDate(request.getTimesheetDate(), request.getDate()));
        }

        if (request.getHours() != null || request.getHoursSpent() != null) {
            BigDecimal hours = resolveHours(request.getHours(), request.getHoursSpent());
            if (hours.compareTo(BigDecimal.ZERO) <= 0 || hours.compareTo(new BigDecimal("24.00")) > 0) {
                throw new BusinessValidationException("Hours spent must be greater than 0 and at most 24 per timesheet entry.");
            }
            entity.setHours(hours);
            entity.setHoursSpent(hours);
        }

        if (request.getNotes() != null || request.getTaskDescription() != null) {
            String noteVal = request.getNotes() != null ? request.getNotes() : request.getTaskDescription();
            entity.setNotes(noteVal);
            entity.setTaskDescription(noteVal);
        }

        if (request.getAssignedApprover() != null && !request.getAssignedApprover().isBlank()) {
            entity.setAssignedApprover(normalizeAssignedApprover(request.getAssignedApprover()));
        } else if (request.getApprovedBy() != null && !request.getApprovedBy().isBlank() && !" - ".equals(request.getApprovedBy().trim()) && !"-".equals(request.getApprovedBy().trim())) {
            entity.setAssignedApprover(normalizeAssignedApprover(request.getApprovedBy()));
        }

        if (request.getApprovalStatus() != null && !request.getApprovalStatus().isBlank()) {
            String newStatus = request.getApprovalStatus().trim();
            String oldStatus = entity.getApprovalStatus();
            if ("Approved".equalsIgnoreCase(newStatus)) {
                if (!isManagerOrAdmin(userRoles)) {
                    throw new BusinessValidationException("Only managers, CEOs, and administrators can approve timesheets.");
                }
                entity.setApprovalStatus("Approved");
                entity.setApprovedBy(resolveApproverDisplayName(entity.getAssignedApprover(), currentUsername));
                if (entity.getApprovedAt() == null) {
                    entity.setApprovedAt(OffsetDateTime.now());
                }
                entity.setRejectionReason(null);
            } else if ("Pending".equalsIgnoreCase(newStatus)) {
                entity.setApprovalStatus("Pending");
                entity.setApprovedBy(null);
                entity.setApprovedAt(null);
            } else if ("Rejected".equalsIgnoreCase(newStatus)) {
                entity.setApprovalStatus("Rejected");
                entity.setApprovedBy(null);
                entity.setApprovedAt(null);
            } else {
                entity.setApprovalStatus(newStatus);
            }
        }

        if (request.getIsBillable() != null || request.getBillable() != null) {
            entity.setIsBillable(resolveBillable(request.getIsBillable(), request.getBillable()));
        }

        if (request.getHourlyRate() != null) {
            entity.setHourlyRate(request.getHourlyRate());
        }

        if (Boolean.TRUE.equals(entity.getIsBillable())) {
            BigDecimal rate = entity.getHourlyRate() != null ? entity.getHourlyRate() : BigDecimal.ZERO;
            entity.setBillableAmount(rate.multiply(entity.getHoursSpent()).setScale(2, RoundingMode.HALF_UP));
        } else {
            entity.setBillableAmount(BigDecimal.ZERO);
        }

        EmployeeMaster employee = employeeMasterRepository.findByEmployeeId(entity.getEmployeeId()).orElse(null);
        BigDecimal calculatedLaborCost = calculateLaborCost(employee, entity.getHoursSpent());
        entity.setLaborCostCalculated(calculatedLaborCost);

        if (entity.getLaborCostOverride() == null) {
            entity.setLaborCost(calculatedLaborCost);
        }

        ProjectTimesheetEntity saved = timesheetRepository.save(entity);
        log.info("Updated timesheet {}", saved.getTimesheetId());
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTimesheet(String timesheetId, String currentUsername, List<String> userRoles) {
        ProjectTimesheetEntity entity = findOrThrow(timesheetId);

        if ("Approved".equalsIgnoreCase(entity.getApprovalStatus())) {
            boolean isElevated = isManagerOrAdmin(userRoles);
            if (!isElevated) {
                throw new BusinessValidationException("Cannot delete an already Approved timesheet without manager/admin authorization.");
            }
        }

        timesheetRepository.delete(entity);
        log.info("Deleted timesheet {} by user {}", timesheetId, currentUsername);
    }

    @Transactional
    public TimesheetResponse submitTimesheet(String timesheetId, String currentUsername) {
        ProjectTimesheetEntity entity = findOrThrow(timesheetId);

        entity.setApprovalStatus("Pending");
        entity.setApprovedBy(null);
        entity.setApprovedAt(null);
        entity.setRejectionReason(null);
        ProjectTimesheetEntity saved = timesheetRepository.save(entity);
        log.info("Timesheet {} set to Pending by {}", timesheetId, currentUsername);
        return mapToResponse(saved);
    }

    @Transactional
    public TimesheetResponse approveTimesheet(String timesheetId, ApproveTimesheetRequest request, String currentUsername) {
        ProjectTimesheetEntity entity = findOrThrow(timesheetId);

        if (request != null && request.getAssignedApprover() != null && !request.getAssignedApprover().isBlank()) {
            entity.setAssignedApprover(normalizeAssignedApprover(request.getAssignedApprover()));
        } else if (request != null && request.getApprovedBy() != null && !request.getApprovedBy().isBlank() && !"-".equals(request.getApprovedBy().trim())) {
            entity.setAssignedApprover(normalizeAssignedApprover(request.getApprovedBy()));
        }

        String approver = resolveApproverDisplayName(entity.getAssignedApprover(), currentUsername);

        entity.setApprovalStatus("Approved");
        entity.setApprovedBy(approver);
        entity.setApprovedAt(OffsetDateTime.now());
        entity.setRejectionReason(null);

        ProjectTimesheetEntity saved = timesheetRepository.save(entity);
        log.info("Timesheet {} APPROVED by {}", timesheetId, approver);
        return mapToResponse(saved);
    }

    @Transactional
    public TimesheetResponse rejectTimesheet(String timesheetId, RejectTimesheetRequest request, String currentUsername) {
        ProjectTimesheetEntity entity = findOrThrow(timesheetId);

        String reason = (request != null && request.getRejectionReason() != null && !request.getRejectionReason().isBlank())
                ? request.getRejectionReason()
                : "Rejected by reviewer";

        entity.setApprovalStatus("Rejected");
        entity.setApprovedBy(resolveApproverDisplayName(currentUsername, entity));
        entity.setApprovedAt(OffsetDateTime.now());
        entity.setRejectionReason(reason);

        ProjectTimesheetEntity saved = timesheetRepository.save(entity);
        log.info("Timesheet {} REJECTED by {}. Reason: {}", timesheetId, currentUsername, reason);
        return mapToResponse(saved);
    }

    @Transactional
    public TimesheetResponse overrideLaborCost(String timesheetId, OverrideLaborCostRequest request, String currentUsername) {
        ProjectTimesheetEntity entity = findOrThrow(timesheetId);

        BigDecimal overrideCost = request.getLaborCostOverride().setScale(2, RoundingMode.HALF_UP);
        entity.setLaborCostOverride(overrideCost);
        entity.setLaborCost(overrideCost);
        entity.setEstimatedLaborCost(overrideCost);
        entity.setLaborCostOverrideBy(currentUsername);
        entity.setLaborCostOverrideAt(OffsetDateTime.now());
        entity.setLaborCostOverrideReason(request.getReason());

        ProjectTimesheetEntity saved = timesheetRepository.save(entity);
        log.info("Timesheet {} labor cost OVERRIDDEN to {} by {}. Reason: {}",
                timesheetId, overrideCost, currentUsername, request.getReason());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public TimesheetKpisResponse getKpis() {
        BigDecimal totalHours = timesheetRepository.sumTotalHours();
        if (totalHours == null) totalHours = BigDecimal.ZERO;

        BigDecimal billableHours = timesheetRepository.sumBillableHours();
        if (billableHours == null) billableHours = BigDecimal.ZERO;

        BigDecimal billableAmount = timesheetRepository.sumBillableAmount();
        if (billableAmount == null) billableAmount = BigDecimal.ZERO;

        long pendingApprovals = timesheetRepository.countPendingApprovals();
        long approved = timesheetRepository.countByApprovalStatusIgnoreCase("Approved");

        double utilizationRate = 0.0;
        if (totalHours.compareTo(BigDecimal.ZERO) > 0) {
            utilizationRate = billableHours.divide(totalHours, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return TimesheetKpisResponse.builder()
                .totalHoursLogged(totalHours)
                .billableHours(billableHours)
                .billableAmount(billableAmount)
                .pendingApprovals(pendingApprovals)
                .approvedTimesheets(approved)
                .utilizationRate(utilizationRate)
                .build();
    }

    public BigDecimal calculateLaborCost(EmployeeMaster employee, BigDecimal hours) {
        if (employee == null || hours == null || hours.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal monthlyCost = employee.getMonthlyCost();
        if (monthlyCost == null || monthlyCost.compareTo(BigDecimal.ZERO) <= 0) {
            monthlyCost = employee.getMonthlyCtc();
        }

        if (monthlyCost == null || monthlyCost.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal standardMonthlyHours = new BigDecimal("160");
        return monthlyCost.divide(standardMonthlyHours, 4, RoundingMode.HALF_UP)
                .multiply(hours)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private ProjectTimesheetEntity findOrThrow(String timesheetId) {
        return timesheetRepository.findByTimesheetId(timesheetId)
                .orElseThrow(() -> new ResourceNotFoundException("Timesheet not found with ID: " + timesheetId));
    }

    private TimesheetResponse mapToResponse(ProjectTimesheetEntity entity) {
        EmployeeMaster employee = employeeMasterRepository.findByEmployeeId(entity.getEmployeeId()).orElse(null);
        String employeeName = employee != null ? employee.getFullName() : entity.getEmployeeId();

        ProjectTaskEntity task = projectTaskRepository.findByTaskId(entity.getTaskId()).orElse(null);
        String taskName = task != null ? task.getTaskName() : entity.getTaskId();

        return TimesheetResponse.builder()
                .timesheetId(entity.getTimesheetId())
                .employeeId(entity.getEmployeeId())
                .employeeName(employeeName)
                .projectId(entity.getProjectId())
                .taskId(entity.getTaskId())
                .taskName(taskName)
                .timesheetDate(entity.getTimesheetDate())
                .date(entity.getTimesheetDate() != null ? entity.getTimesheetDate().toString() : null)
                .hoursSpent(entity.getHoursSpent())
                .hours(entity.getHoursSpent())
                .taskDescription(entity.getTaskDescription())
                .notes(entity.getNotes())
                .isBillable(entity.getIsBillable())
                .billable(Boolean.TRUE.equals(entity.getIsBillable()) ? "Yes" : "No")
                .hourlyRate(entity.getHourlyRate())
                .billableRate(entity.getBillableRate())
                .billableAmount(entity.getBillableAmount())
                .estimatedLaborCost(entity.getEstimatedLaborCost())
                .laborCost(entity.getLaborCost())
                .laborCostCalculated(entity.getLaborCostCalculated())
                .laborCostOverride(entity.getLaborCostOverride())
                .laborCostOverrideBy(entity.getLaborCostOverrideBy())
                .laborCostOverrideAt(entity.getLaborCostOverrideAt())
                .laborCostOverrideReason(entity.getLaborCostOverrideReason())
                .assignedApprover(entity.getAssignedApprover() != null ? entity.getAssignedApprover() : "CEO – Akshit Ujjain")
                .approvalStatus(entity.getApprovalStatus())
                .clientApprovalStatus(entity.getClientApprovalStatus())
                .approvedBy(entity.getApprovedBy())
                .approvedAt(entity.getApprovedAt())
                .rejectionReason(entity.getRejectionReason())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private boolean resolveBillable(Boolean isBillable, String billable) {
        if (isBillable != null) {
            return isBillable;
        }
        if (billable != null && !billable.isBlank()) {
            return "yes".equalsIgnoreCase(billable) || "true".equalsIgnoreCase(billable);
        }
        return true;
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

    private BigDecimal resolveHours(BigDecimal hours, BigDecimal hoursSpent) {
        if (hours != null) {
            return hours;
        }
        if (hoursSpent != null) {
            return hoursSpent;
        }
        return BigDecimal.ZERO;
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
            return "CEO – Akshit Ujjain";
        }
        String trimmed = input.trim();
        String lower = trimmed.toLowerCase();
        if (lower.contains("gaurav")) {
            return trimmed.contains("–") || trimmed.contains("-") ? trimmed : "MD – Gaurav Tripathy";
        }
        if (lower.contains("akshit")) {
            return trimmed.contains("–") || trimmed.contains("-") ? trimmed : "CEO – Akshit Ujjain";
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

    public String resolveApproverDisplayName(String username, ProjectTimesheetEntity entity) {
        String assigned = entity != null ? entity.getAssignedApprover() : null;
        return resolveApproverDisplayName(assigned, username);
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
            return Sort.by(Sort.Direction.DESC, "timesheetDate").and(Sort.by(Sort.Direction.DESC, "timesheetId"));
        }
        String[] parts = sort.split(",");
        String property = parts[0].trim();
        Sort.Direction direction = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Sort primary = Sort.by(direction, property);
        return "timesheetId".equalsIgnoreCase(property)
                ? primary
                : primary.and(Sort.by(Sort.Direction.DESC, "timesheetId"));
    }
}
