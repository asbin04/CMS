package com.company.project.hr.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.hr.dto.*;
import com.company.project.hr.entity.*;
import com.company.project.hr.repository.*;
import jakarta.annotation.PostConstruct;
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
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HrDashboardServiceImpl implements HrDashboardService {

    private final EmployeeRepository employeeRepository;
    private final CandidateRepository candidateRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final HrEmployeeApprovalRepository HrEmployeeApprovalRepository;
    private final HrSummaryRepository hrSummaryRepository;
    private final HrActivityRepository hrActivityRepository;

    private final Object employeeIdLock = new Object();
    private final ConcurrentHashMap<String, Object> attendanceLocks = new ConcurrentHashMap<>();

    // High-performance caching layers
    private final ConcurrentHashMap<String, CachedDashboard> dashboardCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> employeeDeptCache = new ConcurrentHashMap<>();
    private volatile long deptCacheExpiresAt = 0;
    private volatile String cachedTargetAttendanceDate = null;
    private volatile long targetDateExpiresAt = 0;

    private static class CachedDashboard {
        final HrDashboardResponse response;
        final long expiresAt;
        CachedDashboard(HrDashboardResponse response, long ttlMs) {
            this.response = response;
            this.expiresAt = System.currentTimeMillis() + ttlMs;
        }
        boolean isValid() {
            return System.currentTimeMillis() < expiresAt;
        }
    }

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("d MMM yyyy, hh:mm a", Locale.ENGLISH);

    private static final DateTimeFormatter ATTENDANCE_DATE_IN =
            DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH);

    private static final DateTimeFormatter ISO_DATE_OUT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private static final DateTimeFormatter STRICT_ISO_DATE =
            DateTimeFormatter.ofPattern("uuuu-MM-dd").withResolverStyle(java.time.format.ResolverStyle.STRICT);

    private static final DateTimeFormatter STRICT_DISPLAY_DATE =
            DateTimeFormatter.ofPattern("d MMM uuuu", Locale.ENGLISH).withResolverStyle(java.time.format.ResolverStyle.STRICT);

    @Override
    @Transactional(readOnly = true)
    public HrDashboardResponse getHrDashboard(String department, String period) {
        String key = (department == null ? "ALL" : department.trim().toLowerCase()) + "|" +
                     (period == null ? "ALL" : period.trim().toLowerCase());
        CachedDashboard cached = dashboardCache.get(key);
        if (cached != null && cached.isValid()) {
            return cached.response;
        }
        HrDashboardResponse computed = calculateDashboard(department, period, false);
        dashboardCache.put(key, new CachedDashboard(computed, 30_000));
        return computed;
    }

    @PostConstruct
    public void init() {
        try {
            int cleaned = hrActivityRepository.deleteOldAndInvalidActivities();
            log.info("Initialized HR activities, removed {} old/seed records", cleaned);
        } catch (Exception e) {
            log.warn("Could not delete old activities on startup: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public HrDashboardResponse refreshHrDashboard() {
        clearCache();
        try {
            hrActivityRepository.deleteOldAndInvalidActivities();
        } catch (Exception ignored) {}
        return calculateDashboard(null, null, true);
    }

    public void clearCache() {
        dashboardCache.clear();
        employeeDeptCache.clear();
        deptCacheExpiresAt = 0;
        cachedTargetAttendanceDate = null;
        targetDateExpiresAt = 0;
    }

    private HrDashboardResponse calculateDashboard(String department, String period, boolean persistSummary) {
        boolean isDeptFiltered = department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("All");
        String effectiveDept = isDeptFiltered ? department.trim() : null;

        LocalDate[] periodRange = resolvePeriodRange(period);
        LocalDate monthStart = periodRange != null ? periodRange[0] : YearMonth.now().atDay(1);
        LocalDate monthEnd = periodRange != null ? periodRange[1] : YearMonth.now().atEndOfMonth();

        // 1. Workforce Metrics
        long activeEmployees;
        long onNotice;
        BigDecimal totalMonthlyCtc;
        long newHires;

        if (isDeptFiltered) {
            activeEmployees = employeeRepository.countByDepartmentAndStatus(effectiveDept, "Active");
            onNotice = employeeRepository.countByDepartmentAndStatus(effectiveDept, "On Notice");
            totalMonthlyCtc = employeeRepository.sumMonthlyCtcByDepartmentForActiveAndNotice(effectiveDept);
            newHires = countNewHires(effectiveDept, monthStart, monthEnd);
        } else {
            activeEmployees = employeeRepository.countByStatus("Active");
            onNotice = employeeRepository.countByStatus("On Notice");
            totalMonthlyCtc = employeeRepository.sumMonthlyCtcForActiveAndNotice();
            newHires = countNewHires(null, monthStart, monthEnd);
        }

        HrSummaryEntity cachedSummary = hrSummaryRepository.findById(1L).orElse(null);

        WorkforceOverviewDto workforce = WorkforceOverviewDto.builder()
                .activeEmployees((int) activeEmployees)
                .onNotice((int) onNotice)
                .totalMonthlyCtc(formatCurrency(totalMonthlyCtc))
                .newHiresThisMonth((int) newHires)
                .build();

        // 2. Recruitment Metrics
        LocalDate cutoff30Days = LocalDate.now().minusDays(30);
        long openCandidates;
        long candidatesOver30Days;

        if (isDeptFiltered) {
            openCandidates = candidateRepository.countByDepartmentAndStatus(effectiveDept, "Open");
            candidatesOver30Days = candidateRepository.countActiveCandidatesByDepartmentOlderThan(effectiveDept, cutoff30Days);
        } else {
            openCandidates = candidateRepository.countByStatus("Open");
            candidatesOver30Days = candidateRepository.countActiveCandidatesOlderThan(cutoff30Days);
        }

        RecruitmentOverviewDto recruitment = RecruitmentOverviewDto.builder()
                .openCandidates((int) openCandidates)
                .candidatesOver30Days((int) candidatesOver30Days)
                .build();

        // 3. Leave Approvals
        // Note: employee_approvals table lacks a department column in the schema,
        // so leave pending approvals reflect company-wide requests.
        long pendingApprovals = HrEmployeeApprovalRepository.countByStatusIgnoreCase("Pending");
        LeaveOverviewDto leave = LeaveOverviewDto.builder()
                .pendingApprovals((int) pendingApprovals)
                .build();

        // 4. Attendance Metrics (Scoped explicitly to the target business date)
        // Note: attendance table lacks a department column in the schema,
        // so daily attendance counts reflect company-wide logs for the active date.
        String targetAttendanceDate = resolveTargetAttendanceDate();
        long attendanceRecords = 0;
        long halfDays = 0;
        long lateRecords = 0;
        boolean summaryLoaded = false;
        try {
            List<Object[]> attRows = attendanceRecordRepository.getAttendanceSummaryForDate(targetAttendanceDate);
            if (attRows != null && !attRows.isEmpty() && attRows.get(0) != null) {
                Object[] row = attRows.get(0);
                if (row.length > 0 && row[0] instanceof Number) {
                    attendanceRecords = ((Number) row[0]).longValue();
                    summaryLoaded = true;
                }
                if (row.length > 1 && row[1] instanceof Number) halfDays = ((Number) row[1]).longValue();
                if (row.length > 2 && row[2] instanceof Number) lateRecords = ((Number) row[2]).longValue();
            }
        } catch (Exception ignored) {}

        if (!summaryLoaded) {
            attendanceRecords = attendanceRecordRepository.countByAttendanceDate(targetAttendanceDate);
            halfDays = attendanceRecordRepository.countByAttendanceDateAndStatus(targetAttendanceDate, "Half Day");
            lateRecords = attendanceRecordRepository.countLateRecordsForDate(targetAttendanceDate);
        }

        AttendanceOverviewDto attendance = AttendanceOverviewDto.builder()
                .records((int) attendanceRecords)
                .halfDays((int) halfDays)
                .lateRecords((int) lateRecords)
                .effectiveDate(targetAttendanceDate)
                .build();

        // 5. Lifecycle Overview
        LifecycleOverviewDto lifecycle = LifecycleOverviewDto.builder()
                .employeesExiting((int) onNotice)
                .build();

        // 6. Recent Activities
        List<HrActivityEntity> activities = hrActivityRepository.findAllOrderByNewestFirst();
        List<RecentActivityDto> activityDtos = activities.stream()
                .map(this::mapToRecentActivityDto)
                .filter(a -> !isDeptFiltered || a.getDepartment() == null || a.getDepartment().equalsIgnoreCase(effectiveDept))
                .collect(Collectors.toList());

        // 7. Update Cached Summary if requested
        OffsetDateTime now = OffsetDateTime.now();
        if (persistSummary && cachedSummary != null) {
            cachedSummary.setActiveEmployees((int) activeEmployees);
            cachedSummary.setOnNotice((int) onNotice);
            cachedSummary.setTotalMonthlyCtc(totalMonthlyCtc != null ? totalMonthlyCtc : BigDecimal.ZERO);
            cachedSummary.setNewHiresThisMonth((int) newHires);
            cachedSummary.setOpenCandidates((int) openCandidates);
            cachedSummary.setCandidatesOver30Days((int) candidatesOver30Days);
            cachedSummary.setPendingLeaveApprovals((int) pendingApprovals);
            cachedSummary.setAttendanceRecords((int) attendanceRecords);
            cachedSummary.setHalfDays((int) halfDays);
            cachedSummary.setLateRecords((int) lateRecords);
            cachedSummary.setEmployeesExiting((int) onNotice);
            cachedSummary.setLastUpdated(now);
            cachedSummary.setUpdatedAt(now);
            hrSummaryRepository.save(cachedSummary);
            log.info("Persisted refreshed HR summary to database at {}", now);
        }

        String formattedTimestamp = now.format(DATE_TIME_FORMATTER);

        return HrDashboardResponse.builder()
                .lastUpdated(formattedTimestamp)
                .workforce(workforce)
                .recruitment(recruitment)
                .leave(leave)
                .attendance(attendance)
                .lifecycle(lifecycle)
                .recentActivities(activityDtos)
                .build();
    }

    // =========================================================================
    // Phase 3: Modal Workflows & Tabular Operations
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmployeeDto> getEmployees(String search, String department, String status, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<EmployeeEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("fullName")), pattern);
                Predicate emailMatch = cb.like(cb.lower(root.get("workEmail")), pattern);
                Predicate roleMatch = cb.like(cb.lower(root.get("designation")), pattern);
                Predicate idMatch = cb.like(cb.lower(root.get("employeeId")), pattern);
                predicates.add(cb.or(nameMatch, emailMatch, roleMatch, idMatch));
            }

            if (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("All")) {
                predicates.add(cb.equal(cb.lower(root.get("department")), department.trim().toLowerCase()));
            }

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<EmployeeEntity> empPage = employeeRepository.findAll(spec, pageable);
        List<EmployeeDto> dtoList = empPage.getContent().stream()
                .map(this::mapToEmployeeDto)
                .collect(Collectors.toList());

        return PageResponse.<EmployeeDto>builder()
                .content(dtoList)
                .pageNumber(empPage.getNumber())
                .pageSize(empPage.getSize())
                .totalElements(empPage.getTotalElements())
                .totalPages(empPage.getTotalPages())
                .first(empPage.isFirst())
                .last(empPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public EmployeeDto createEmployee(CreateEmployeeRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        if (employeeRepository.existsByWorkEmail(cleanEmail)) {
            throw new BusinessValidationException("An employee with email '" + cleanEmail + "' already exists.");
        }

        LocalDate joiningDate;
        try {
            joiningDate = LocalDate.parse(request.getJoiningDate().trim(), ISO_DATE_OUT);
        } catch (DateTimeParseException e) {
            try {
                joiningDate = LocalDate.parse(request.getJoiningDate().trim(), ATTENDANCE_DATE_IN);
            } catch (DateTimeParseException ex) {
                throw new BusinessValidationException("Invalid joining date format. Expected YYYY-MM-DD or D MMM YYYY.");
            }
        }

        String status = (request.getStatus() != null && !request.getStatus().trim().isEmpty())
                ? request.getStatus().trim()
                : "Active";

        // Concurrency-safe sequential ID allocation
        String employeeId = allocateNextEmployeeId();

        String fullName = request.getName().trim();
        String initials = "";
        String[] parts = fullName.split("\\s+");
        if (parts.length >= 2) {
            initials = ("" + parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        } else if (parts.length == 1 && !parts[0].isEmpty()) {
            initials = ("" + parts[0].charAt(0)).toUpperCase();
        }

        BigDecimal monthlyCtc = request.getMonthlyCtc() != null ? request.getMonthlyCtc() : BigDecimal.ZERO;
        BigDecimal annualCtc = monthlyCtc.multiply(BigDecimal.valueOf(12));

        EmployeeEntity entity = EmployeeEntity.builder()
                .employeeId(employeeId)
                .employeeCode(employeeId)
                .fullName(fullName)
                .avatarInitials(initials)
                .avatarColor("#1D4ED8")
                .avatarBg("#DBEAFE")
                .workEmail(cleanEmail)
                .phone("+91 99999 99999")
                .department(request.getDepartment().trim())
                .designation(request.getRole().trim())
                .employmentType("Full Time")
                .status(status)
                .location("Bangalore")
                .reportingManager("")
                .joiningDate(joiningDate.format(ATTENDANCE_DATE_IN))
                .tenureStatus("0-1 Years")
                .monthlyCtc(monthlyCtc)
                .annualCtc(annualCtc)
                .gender("Not Specified")
                .orderIndex(1000)
                .build();

        EmployeeEntity saved = employeeRepository.save(entity);
        dashboardCache.clear();
        deptCacheExpiresAt = 0;
        log.info("Created new employee: id={}, name={}, department={}", saved.getEmployeeId(), saved.getFullName(), saved.getDepartment());

        // Record activity log
        logActivity(
                "Employee",
                "#2563EB",
                saved.getFullName() + " added as " + saved.getDesignation() + " in " + saved.getDepartment(),
                "Completed"
        );

        return mapToEmployeeDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveApprovalDto> getLeaves(String status) {
        List<EmployeeApprovalEntity> list;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) {
            list = HrEmployeeApprovalRepository.findByStatusIgnoreCaseOrderBySortOrderAsc(status.trim());
        } else {
            list = HrEmployeeApprovalRepository.findAllByOrderBySortOrderAsc();
        }

        java.util.Map<String, String> deptMap = getEmployeeDepartmentMap();
        return list.stream().map(a -> {
            String dept = deptMap.get(a.getEmployeeCode());
            if (dept == null && a.getEmployeeCode() != null) {
                try {
                    dept = employeeRepository.findByEmployeeId(a.getEmployeeCode()).map(EmployeeEntity::getDepartment).orElse(null);
                } catch (Exception ignored) {}
            }
            return mapToLeaveApprovalDto(a, dept);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LeaveApprovalDto updateLeaveStatus(Long id, UpdateLeaveStatusRequest request) {
        EmployeeApprovalEntity approval = HrEmployeeApprovalRepository.findByIdForUpdate(id)
                .orElseGet(() -> HrEmployeeApprovalRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id)));

        String currentStatus = approval.getStatus();
        if (!"Pending".equalsIgnoreCase(currentStatus)) {
            throw new BusinessValidationException(
                    "Leave request id " + id + " has already been finalized as '" + currentStatus + "' and cannot be modified."
            );
        }

        String newStatus = request.getStatus().trim();
        if (newStatus.equalsIgnoreCase("Approved")) {
            newStatus = "Approved";
        } else if (newStatus.equalsIgnoreCase("Rejected")) {
            newStatus = "Rejected";
        } else {
            throw new BusinessValidationException("Status must be either 'Approved' or 'Rejected'.");
        }

        approval.setStatus(newStatus);
        approval.setUpdatedAt(LocalDateTime.now());
        EmployeeApprovalEntity saved = HrEmployeeApprovalRepository.save(approval);
        dashboardCache.clear();
        log.info("Updated leave request id={} to status={}", saved.getId(), saved.getStatus());

        // Record activity log (atomic with leave status update)
        String color = "Approved".equals(newStatus) ? "#059669" : "#DC2626";
        logActivity(
                "Leave",
                color,
                "Leave request for " + saved.getEmployeeName() + " (" + saved.getRequestType() + ") was " + newStatus.toLowerCase(),
                "Completed"
        );

        return mapToLeaveApprovalDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDto> getAttendanceRecords(String date, String status) {
        List<AttendanceRecordEntity> list;
        boolean hasDate = date != null && !date.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All");

        if (hasDate) {
            String rawDate = date.trim();
            LocalDate parsed = parseAttendanceDate(rawDate);
            String canonicalDate = parsed != null ? parsed.format(ATTENDANCE_DATE_IN) : rawDate;
            String isoDate = parsed != null ? parsed.format(ISO_DATE_OUT) : rawDate;

            if (hasStatus) {
                list = attendanceRecordRepository.findByAttendanceDateAndStatusIgnoreCase(canonicalDate, status.trim());
                if (list.isEmpty() && !canonicalDate.equals(isoDate)) {
                    list = attendanceRecordRepository.findByAttendanceDateAndStatusIgnoreCase(isoDate, status.trim());
                }
            } else {
                list = attendanceRecordRepository.findByAttendanceDate(canonicalDate);
                if (list.isEmpty() && !canonicalDate.equals(isoDate)) {
                    list = attendanceRecordRepository.findByAttendanceDate(isoDate);
                }
            }
        } else if (hasStatus) {
            list = attendanceRecordRepository.findByStatusIgnoreCase(status.trim());
        } else {
            list = attendanceRecordRepository.findAll();
        }

        java.util.Map<String, String> deptMap = getEmployeeDepartmentMap();
        return list.stream().map(a -> {
            String dept = deptMap.get(a.getEmployeeId());
            if (dept == null && a.getEmployeeId() != null) {
                try {
                    dept = employeeRepository.findByEmployeeId(a.getEmployeeId()).map(EmployeeEntity::getDepartment).orElse(null);
                } catch (Exception ignored) {}
            }
            return mapToAttendanceDto(a, dept);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AttendanceDto logAttendance(LogAttendanceRequest request) {
        String empId = request.getEmployeeId().trim();
        LocalDate dateObj = parseAndValidateAttendanceDate(request.getAttendanceDate());
        String canonicalDate = dateObj.format(ATTENDANCE_DATE_IN);
        String isoDate = dateObj.format(ISO_DATE_OUT);

        String lockKey = (empId + ":" + canonicalDate).toLowerCase();
        Object lock = attendanceLocks.computeIfAbsent(lockKey, k -> new Object());
        synchronized (lock) {
            try {
                // Check both canonical format (d MMM yyyy) and legacy ISO format (yyyy-MM-dd)
                boolean alreadyRecorded = attendanceRecordRepository.existsByEmployeeIdAndAttendanceDate(empId, canonicalDate)
                        || attendanceRecordRepository.existsByEmployeeIdAndAttendanceDate(empId, isoDate);
                if (alreadyRecorded) {
                    throw new BusinessValidationException("Attendance already recorded for employee " + empId + " on " + canonicalDate + ".");
                }

                String rawStatus = request.getStatus().trim();
                String normalizedStatus;
                if (rawStatus.equalsIgnoreCase("Present")) normalizedStatus = "Present";
                else if (rawStatus.equalsIgnoreCase("Half Day")) normalizedStatus = "Half Day";
                else if (rawStatus.equalsIgnoreCase("Late")) normalizedStatus = "Late";
                else if (rawStatus.equalsIgnoreCase("Leave")) normalizedStatus = "Leave";
                else if (rawStatus.equalsIgnoreCase("Absent")) normalizedStatus = "Absent";
                else {
                    throw new BusinessValidationException("Invalid attendance status: " + rawStatus);
                }

                boolean isLate = normalizedStatus.equals("Late");
                String checkIn = request.getCheckIn() != null ? request.getCheckIn().trim() : "09:30 AM";
                String id = "ATT-" + empId + "-" + canonicalDate.replace("-", "");

                AttendanceRecordEntity entity = AttendanceRecordEntity.builder()
                        .id(id)
                        .attendanceDate(canonicalDate)
                        .employeeId(empId)
                        .employeeName(request.getEmployeeName().trim())
                        .status(normalizedStatus)
                        .checkIn(checkIn)
                        .checkOut(request.getCheckOut())
                        .workHours(normalizedStatus.equals("Half Day") ? "4h 30m" : "9h 00m")
                        .isLate(isLate)
                        .notes(request.getNotes())
                        .build();

                AttendanceRecordEntity saved = attendanceRecordRepository.save(entity);
                dashboardCache.clear();
                targetDateExpiresAt = 0;
                log.info("Recorded attendance for employee={}, date={}, status={}", saved.getEmployeeName(), canonicalDate, normalizedStatus);

                // Record activity log (atomic with attendance logging)
                logActivity(
                        "Attendance",
                        "#2563EB",
                        "Attendance logged for " + saved.getEmployeeName() + " (" + normalizedStatus + ")",
                        "Completed"
                );

                return mapToAttendanceDto(saved);
            } finally {
                attendanceLocks.remove(lockKey);
            }
        }
    }

    private LocalDate parseAndValidateAttendanceDate(String rawDate) {
        if (rawDate == null || rawDate.trim().isEmpty()) {
            return LocalDate.now();
        }
        String trimmed = rawDate.trim();

        // 1. ISO format (YYYY-MM-DD): exactly 4 digits, hyphen, 2 digits, hyphen, 2 digits
        if (trimmed.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
            try {
                return LocalDate.parse(trimmed, STRICT_ISO_DATE);
            } catch (DateTimeParseException e) {
                throw new BusinessValidationException("Invalid calendar date in ISO format: '" + rawDate + "'.");
            }
        }

        // 2. Standard display format (d MMM yyyy, e.g. "31 Oct 2026", "15 Mar 2025")
        if (trimmed.matches("^\\d{1,2}\\s+[A-Za-z]{3}\\s+\\d{4}$")) {
            try {
                return LocalDate.parse(trimmed, STRICT_DISPLAY_DATE);
            } catch (DateTimeParseException e) {
                throw new BusinessValidationException("Invalid calendar date in display format: '" + rawDate + "'.");
            }
        }

        // 3. Ambiguous formats (e.g. 10/12/2025, 2025.10.12) or malformed strings are rejected
        throw new BusinessValidationException(
                "Invalid attendance date format: '" + rawDate + "'. Supported formats are 'YYYY-MM-DD' (e.g. 2025-03-15) and 'D MMM YYYY' (e.g. 15 Mar 2025)."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateDto> getCandidates(String department, Integer minDaysInPipeline) {
        List<CandidateEntity> list;
        if (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("All")) {
            list = candidateRepository.findByDepartment(department.trim());
        } else {
            list = candidateRepository.findAll();
        }

        LocalDate now = LocalDate.now();
        return list.stream()
                .map(c -> {
                    long days = ChronoUnit.DAYS.between(c.getCreatedDate(), now);
                    return CandidateDto.builder()
                            .id(c.getId())
                            .name(c.getName())
                            .email(c.getEmail())
                            .role(c.getRole())
                            .department(c.getDepartment())
                            .status(c.getStatus())
                            .createdDate(c.getCreatedDate().toString())
                            .daysInPipeline(days)
                            .build();
                })
                .filter(c -> minDaysInPipeline == null || c.getDaysInPipeline() >= minDaysInPipeline)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecentActivityDto> getRecentActivities() {
        return hrActivityRepository.findAllOrderByNewestFirst().stream()
                .map(this::mapToRecentActivityDto)
                .collect(Collectors.toList());
    }

    private void logActivity(String type, String color, String description, String status) {
        HrActivityEntity act = HrActivityEntity.builder()
                .id("act-" + System.currentTimeMillis())
                .activityDate(LocalDate.now().format(ATTENDANCE_DATE_IN))
                .type(type)
                .typeColor(color)
                .description(description)
                .status(status)
                .sortOrder(0)
                .updatedAt(OffsetDateTime.now())
                .build();
        hrActivityRepository.save(act);

        // Keep activities clean & recent: prune older activities beyond top 10
        try {
            List<HrActivityEntity> all = hrActivityRepository.findAllOrderByNewestFirst();
            if (all.size() > 10) {
                List<HrActivityEntity> oldOnes = all.subList(10, all.size());
                hrActivityRepository.deleteAll(oldOnes);
            }
        } catch (Exception e) {
            log.debug("Auto-prune old activities skipped: {}", e.getMessage());
        }
    }

    private String allocateNextEmployeeId() {
        synchronized (employeeIdLock) {
            List<String> existingIds = employeeRepository.findAllEmployeeIdsWithPrefix();
            int maxId = 0;
            if (existingIds != null) {
                for (String id : existingIds) {
                    if (id != null) {
                        String clean = id.trim().toUpperCase();
                        if (clean.startsWith("EMP-")) {
                            try {
                                int num = Integer.parseInt(clean.substring(4));
                                if (num > maxId) {
                                    maxId = num;
                                }
                            } catch (NumberFormatException ignored) {
                            }
                        }
                    }
                }
            }
            int candidate = maxId + 1;
            String candidateId = String.format("EMP-%03d", candidate);
            while (employeeRepository.existsByEmployeeId(candidateId)) {
                candidate++;
                candidateId = String.format("EMP-%03d", candidate);
            }
            return candidateId;
        }
    }

    private EmployeeDto mapToEmployeeDto(EmployeeEntity e) {
        return EmployeeDto.builder()
                .id(e.getEmployeeId())
                .name(e.getFullName())
                .email(e.getWorkEmail())
                .department(e.getDepartment())
                .role(e.getDesignation())
                .monthlyCtc(e.getMonthlyCtc())
                .joiningDate(e.getJoiningDate())
                .status(e.getStatus())
                .noticePeriodEnd(null)
                .build();
    }

    private java.util.Map<String, String> getEmployeeDepartmentMap() {
        if (!employeeDeptCache.isEmpty() && System.currentTimeMillis() < deptCacheExpiresAt) {
            return employeeDeptCache;
        }
        try {
            List<Object[]> rows = employeeRepository.findAllEmployeeIdAndDepartment();
            if (rows != null && !rows.isEmpty()) {
                ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
                for (Object[] r : rows) {
                    if (r != null && r.length >= 2 && r[0] != null && r[1] != null) {
                        map.put((String) r[0], (String) r[1]);
                    }
                }
                employeeDeptCache.clear();
                employeeDeptCache.putAll(map);
                deptCacheExpiresAt = System.currentTimeMillis() + 60_000;
                return employeeDeptCache;
            }
        } catch (Exception ignored) {}

        try {
            java.util.Map<String, String> map = employeeRepository.findAll().stream()
                    .filter(e -> e.getEmployeeId() != null && e.getDepartment() != null)
                    .collect(Collectors.toMap(EmployeeEntity::getEmployeeId, EmployeeEntity::getDepartment, (existing, replacement) -> existing));
            if (!map.isEmpty()) {
                employeeDeptCache.clear();
                employeeDeptCache.putAll(map);
                deptCacheExpiresAt = System.currentTimeMillis() + 60_000;
                return employeeDeptCache;
            }
            return map;
        } catch (Exception e) {
            log.warn("Failed to build employee department map: {}", e.getMessage());
            return java.util.Collections.emptyMap();
        }
    }

    private LeaveApprovalDto mapToLeaveApprovalDto(EmployeeApprovalEntity a) {
        String dept = null;
        if (a.getEmployeeCode() != null) {
            try {
                dept = employeeRepository.findByEmployeeId(a.getEmployeeCode())
                        .map(EmployeeEntity::getDepartment)
                        .orElse(null);
            } catch (Exception ignored) {}
        }
        return mapToLeaveApprovalDto(a, dept);
    }

    private LeaveApprovalDto mapToLeaveApprovalDto(EmployeeApprovalEntity a, String dept) {
        Integer days = parseDaysFromDuration(a.getDuration(), a.getFromDate(), a.getToDate());

        return LeaveApprovalDto.builder()
                .id(a.getId())
                .employeeName(a.getEmployeeName())
                .employeeCode(a.getEmployeeCode())
                .employeeId(a.getEmployeeCode())
                .department(dept)
                .requestType(a.getRequestType())
                .leaveType(a.getRequestType())
                .appliedDate(a.getAppliedDate())
                .fromDate(a.getFromDate())
                .toDate(a.getToDate())
                .startDate(a.getFromDate())
                .endDate(a.getToDate())
                .duration(a.getDuration())
                .days(days)
                .reason(a.getReason())
                .status(a.getStatus())
                .sortOrder(a.getSortOrder())
                .build();
    }

    private Integer parseDaysFromDuration(String duration, String fromDate, String toDate) {
        if (duration != null && !duration.trim().isEmpty()) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)").matcher(duration);
            if (m.find()) {
                try {
                    return Integer.parseInt(m.group(1));
                } catch (NumberFormatException ignored) {}
            }
        }
        if (fromDate != null && toDate != null) {
            try {
                LocalDate start = LocalDate.parse(fromDate.trim());
                LocalDate end = LocalDate.parse(toDate.trim());
                long diff = ChronoUnit.DAYS.between(start, end) + 1;
                if (diff > 0) return (int) diff;
            } catch (Exception ignored) {}
        }
        return 1;
    }

    private AttendanceDto mapToAttendanceDto(AttendanceRecordEntity a) {
        String dept = null;
        if (a.getEmployeeId() != null) {
            try {
                dept = employeeRepository.findByEmployeeId(a.getEmployeeId())
                        .map(EmployeeEntity::getDepartment)
                        .orElse(null);
            } catch (Exception ignored) {}
        }
        return mapToAttendanceDto(a, dept);
    }

    private AttendanceDto mapToAttendanceDto(AttendanceRecordEntity a, String dept) {
        return AttendanceDto.builder()
                .id(a.getId())
                .employeeId(a.getEmployeeId())
                .employeeName(a.getEmployeeName())
                .attendanceDate(a.getAttendanceDate())
                .date(a.getAttendanceDate())
                .department(dept)
                .status(a.getStatus())
                .checkIn(a.getCheckIn())
                .checkOut(a.getCheckOut())
                .workHours(a.getWorkHours())
                .isLate(a.getIsLate())
                .notes(a.getNotes())
                .build();
    }

    private String resolveTargetAttendanceDate() {
        if (cachedTargetAttendanceDate != null && System.currentTimeMillis() < targetDateExpiresAt) {
            return cachedTargetAttendanceDate;
        }

        String todayFormatted = LocalDate.now().format(ATTENDANCE_DATE_IN);
        long todayCount = attendanceRecordRepository.countByAttendanceDate(todayFormatted);
        if (todayCount > 0) {
            cachedTargetAttendanceDate = todayFormatted;
            targetDateExpiresAt = System.currentTimeMillis() + 60_000;
            return todayFormatted;
        }

        List<String> dateStrings = attendanceRecordRepository.findDistinctAttendanceDates();
        if (dateStrings == null || dateStrings.isEmpty()) {
            cachedTargetAttendanceDate = todayFormatted;
            targetDateExpiresAt = System.currentTimeMillis() + 60_000;
            return todayFormatted;
        }

        String latestDateStr = null;
        LocalDate latestDate = null;
        for (String ds : dateStrings) {
            LocalDate parsed = parseAttendanceDate(ds);
            if (parsed != null) {
                if (latestDate == null || parsed.isAfter(latestDate)) {
                    latestDate = parsed;
                    latestDateStr = ds;
                }
            }
        }

        cachedTargetAttendanceDate = latestDateStr != null ? latestDateStr : todayFormatted;
        targetDateExpiresAt = System.currentTimeMillis() + 60_000;
        return cachedTargetAttendanceDate;
    }

    private LocalDate parseAttendanceDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(dateStr.trim(), ATTENDANCE_DATE_IN);
        } catch (DateTimeParseException e) {
            try {
                return LocalDate.parse(dateStr.trim(), ISO_DATE_OUT);
            } catch (DateTimeParseException ex) {
                log.debug("Unable to parse attendance date string '{}'", dateStr);
                return null;
            }
        }
    }

    private RecentActivityDto mapToRecentActivityDto(HrActivityEntity a) {
        String rawDate = parseIsoDate(a.getActivityDate());
        String department = inferDepartmentFromDescription(a.getDescription());

        return RecentActivityDto.builder()
                .id(a.getId())
                .date(a.getActivityDate())
                .rawDate(rawDate)
                .type(a.getType())
                .typeColor(a.getTypeColor())
                .description(a.getDescription())
                .status(a.getStatus())
                .department(department)
                .build();
    }

    private String parseIsoDate(String activityDate) {
        if (activityDate == null || activityDate.trim().isEmpty()) {
            return null;
        }
        try {
            LocalDate parsed = LocalDate.parse(activityDate.trim(), ATTENDANCE_DATE_IN);
            return parsed.format(ISO_DATE_OUT);
        } catch (DateTimeParseException e) {
            return activityDate;
        }
    }

    private String inferDepartmentFromDescription(String desc) {
        if (desc == null) return null;
        String lower = desc.toLowerCase();
        if (lower.contains("engineering") || lower.contains("developer") || lower.contains("frontend") || lower.contains("backend")) {
            return "Engineering";
        }
        if (lower.contains("sales") || lower.contains("crm") || lower.contains("deal")) {
            return "Sales";
        }
        if (lower.contains("product") || lower.contains("roadmap")) {
            return "Product";
        }
        if (lower.contains("design") || lower.contains("ui/ux") || lower.contains("ux")) {
            return "Design";
        }
        if (lower.contains("hr") || lower.contains("recruitment") || lower.contains("candidate") || lower.contains("onboard")) {
            return "HR";
        }
        if (lower.contains("finance") || lower.contains("payroll") || lower.contains("accounts")) {
            return "Finance";
        }
        return null;
    }

    private LocalDate[] resolvePeriodRange(String period) {
        if (period == null || period.trim().isEmpty() || period.equalsIgnoreCase("All")) {
            return null;
        }
        String p = period.trim();
        if ("This Month".equalsIgnoreCase(p)) {
            LocalDate now = LocalDate.now();
            return new LocalDate[]{now.withDayOfMonth(1), now.withDayOfMonth(now.lengthOfMonth())};
        }
        if ("Last Month".equalsIgnoreCase(p)) {
            LocalDate lastMonth = LocalDate.now().minusMonths(1);
            return new LocalDate[]{lastMonth.withDayOfMonth(1), lastMonth.withDayOfMonth(lastMonth.lengthOfMonth())};
        }
        if ("Apr 2024 - Mar 2025".equalsIgnoreCase(p)) {
            return new LocalDate[]{LocalDate.of(2024, 4, 1), LocalDate.of(2025, 3, 31)};
        }
        if ("Q4 FY25".equalsIgnoreCase(p)) {
            return new LocalDate[]{LocalDate.of(2025, 1, 1), LocalDate.of(2025, 3, 31)};
        }

        // Documented fallback: Unrecognized period string defaults to unbounded (all periods)
        log.warn("Unrecognized period filter '{}'; defaulting to unbounded all-period calculation", period);
        return null;
    }

    private long countNewHires(String department, LocalDate start, LocalDate end) {
        List<String> joiningDates = null;
        try {
            joiningDates = (department != null && !department.equalsIgnoreCase("All"))
                    ? employeeRepository.findJoiningDatesByDepartment(department)
                    : employeeRepository.findAllJoiningDates();
        } catch (Exception ignored) {}

        if (joiningDates == null || joiningDates.isEmpty()) {
            try {
                List<EmployeeEntity> list = (department != null && !department.equalsIgnoreCase("All"))
                        ? employeeRepository.findByDepartment(department)
                        : employeeRepository.findAll();
                joiningDates = list.stream().map(EmployeeEntity::getJoiningDate).collect(Collectors.toList());
            } catch (Exception ignored) {}
        }

        if (joiningDates == null) {
            return 0;
        }

        long count = 0;
        for (String rawDate : joiningDates) {
            LocalDate jd = parseJoiningDate(rawDate);
            if (jd != null && !jd.isBefore(start) && !jd.isAfter(end)) {
                count++;
            }
        }
        return count;
    }

    private LocalDate parseJoiningDate(String rawDate) {
        if (rawDate == null || rawDate.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(rawDate.trim(), ATTENDANCE_DATE_IN);
        } catch (DateTimeParseException e1) {
            try {
                return LocalDate.parse(rawDate.trim(), ISO_DATE_OUT);
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return "₹ 0.00";
        }
        BigDecimal scaled = amount.setScale(2, RoundingMode.HALF_UP);
        long wholePart = scaled.longValue();
        int cents = scaled.remainder(BigDecimal.ONE).multiply(BigDecimal.valueOf(100)).abs().intValue();
        String str = String.valueOf(wholePart);
        if (str.length() <= 3) {
            return String.format(Locale.ENGLISH, "₹ %s.%02d", str, cents);
        }
        String lastThree = str.substring(str.length() - 3);
        String remaining = str.substring(0, str.length() - 3);
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (int i = remaining.length() - 1; i >= 0; i--) {
            if (count > 0 && count % 2 == 0) {
                sb.insert(0, ',');
            }
            sb.insert(0, remaining.charAt(i));
            count++;
        }
        return String.format(Locale.ENGLISH, "₹ %s,%s.%02d", sb, lastThree, cents);
    }
}
