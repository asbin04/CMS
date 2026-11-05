package com.company.project.hr.service;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.hr.dto.*;
import com.company.project.hr.entity.PayrollRecordEntity;
import com.company.project.hr.repository.PayrollRecordRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollServiceImpl implements PayrollService {

    private final PayrollRecordRepository payrollRepository;
    private final PayrollIdGeneratorService idGeneratorService;

    private static final DateTimeFormatter DISPLAY_TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PayrollRecordDto> getPayrollRecords(
            String search,
            String payrollMonth,
            String employmentType,
            String status,
            String employee,
            String sort,
            int page,
            int size
    ) {
        int pageIndex = Math.max(0, page - 1);
        int pageSize = size > 0 ? size : 10;
        Sort sortObj = parseSort(sort);

        Specification<PayrollRecordEntity> spec = buildSpecification(
                search, payrollMonth, employmentType, status, employee
        );

        Page<PayrollRecordEntity> entityPage = payrollRepository.findAll(spec, PageRequest.of(pageIndex, pageSize, sortObj));

        List<PayrollRecordDto> content = entityPage.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PageResponse.<PayrollRecordDto>builder()
                .content(content)
                .pageNumber(page)
                .pageSize(pageSize)
                .totalElements(entityPage.getTotalElements())
                .totalPages(entityPage.getTotalPages())
                .first(entityPage.isFirst())
                .last(entityPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollRecordDto> getAllFilteredPayrollRecords(
            String search,
            String payrollMonth,
            String employmentType,
            String status,
            String employee,
            String sort
    ) {
        Sort sortObj = parseSort(sort);
        Specification<PayrollRecordEntity> spec = buildSpecification(
                search, payrollMonth, employmentType, status, employee
        );

        return payrollRepository.findAll(spec, sortObj).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PayrollRecordDto getPayrollRecordById(String payrollId) {
        return payrollRepository.findByPayrollId(payrollId)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found with ID: " + payrollId));
    }

    @Override
    @Transactional
    public PayrollRecordDto processPayroll(ProcessPayrollRequest request) {
        String month = request.getPayrollMonth() != null ? request.getPayrollMonth().trim() : "Oct 2026";
        String payrollId = idGeneratorService.generateNextPayrollId(month);

        int workingDays = request.getWorkingDays() != null ? request.getWorkingDays() : 22;
        int lopDays = request.getLopDays() != null ? request.getLopDays() : 0;
        int paidDays = request.getPaidDays() != null ? request.getPaidDays() : Math.max(0, workingDays - lopDays);

        BigDecimal ctc = request.getMonthlyCtc() != null ? request.getMonthlyCtc() : BigDecimal.ZERO;
        BigDecimal monthlyRate = ctc.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        BigDecimal daysRatio = workingDays > 0 ? BigDecimal.valueOf(paidDays).divide(BigDecimal.valueOf(workingDays), 4, RoundingMode.HALF_UP) : BigDecimal.ONE;

        BigDecimal basic = request.getBasicPay() != null ? request.getBasicPay() : monthlyRate.multiply(BigDecimal.valueOf(0.50)).multiply(daysRatio).setScale(2, RoundingMode.HALF_UP);
        BigDecimal hra = request.getHra() != null ? request.getHra() : basic.multiply(BigDecimal.valueOf(0.50)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal allow = request.getAllowances() != null ? request.getAllowances() : monthlyRate.multiply(BigDecimal.valueOf(0.10)).multiply(daysRatio).setScale(2, RoundingMode.HALF_UP);
        BigDecimal gross = basic.add(hra).add(allow);
        BigDecimal deductions = request.getDeductions() != null ? request.getDeductions() : gross.multiply(BigDecimal.valueOf(0.08)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(deductions);

        String paymentStatus = request.getPaymentStatus() != null ? request.getPaymentStatus() : "Paid";
        LocalDate paymentDate = request.getPaymentDate() != null ? request.getPaymentDate() : ("Paid".equalsIgnoreCase(paymentStatus) ? LocalDate.now() : null);

        PayrollRecordEntity entity = PayrollRecordEntity.builder()
                .payrollId(payrollId)
                .payrollMonth(month)
                .employeeId(request.getEmployeeId().trim())
                .employeeName(request.getEmployeeName().trim())
                .employmentType(request.getEmploymentType().trim())
                .monthlyCtc(ctc)
                .workingDays(workingDays)
                .paidDays(paidDays)
                .lopDays(lopDays)
                .basicPay(basic)
                .hra(hra)
                .allowances(allow)
                .grossSalary(gross)
                .deductions(deductions)
                .netSalary(net)
                .paymentStatus(paymentStatus)
                .paymentDate(paymentDate)
                .paymentMode(request.getPaymentMode() != null ? request.getPaymentMode() : "Bank Transfer")
                .bankName(request.getBankName() != null ? request.getBankName() : "HDFC Bank")
                .bankAccount(request.getBankAccount() != null ? request.getBankAccount() : "XXXXXXXX" + (1000 + (int)(Math.random() * 9000)))
                .panNumber(request.getPanNumber() != null ? request.getPanNumber() : "ABCDE1234F")
                .notes(request.getNotes())
                .build();

        PayrollRecordEntity saved = payrollRepository.save(entity);
        log.info("Processed and saved payroll record: {} for employee: {}", saved.getPayrollId(), saved.getEmployeeName());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public PayrollRecordDto updatePayrollRecord(String payrollId, UpdatePayrollRequest request) {
        PayrollRecordEntity entity = payrollRepository.findByPayrollId(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found with ID: " + payrollId));

        if (request.getPaymentStatus() != null) {
            entity.setPaymentStatus(request.getPaymentStatus());
            if ("Paid".equalsIgnoreCase(request.getPaymentStatus()) && entity.getPaymentDate() == null) {
                entity.setPaymentDate(LocalDate.now());
            }
        }
        if (request.getPaymentDate() != null) {
            entity.setPaymentDate(request.getPaymentDate());
        }
        if (request.getWorkingDays() != null) {
            entity.setWorkingDays(request.getWorkingDays());
        }
        if (request.getPaidDays() != null) {
            entity.setPaidDays(request.getPaidDays());
        }
        if (request.getLopDays() != null) {
            entity.setLopDays(request.getLopDays());
        }
        if (request.getMonthlyCtc() != null) {
            entity.setMonthlyCtc(request.getMonthlyCtc());
        }
        if (request.getBasicPay() != null) {
            entity.setBasicPay(request.getBasicPay());
        }
        if (request.getHra() != null) {
            entity.setHra(request.getHra());
        }
        if (request.getAllowances() != null) {
            entity.setAllowances(request.getAllowances());
        }
        if (request.getDeductions() != null) {
            entity.setDeductions(request.getDeductions());
        }

        BigDecimal gross = entity.getBasicPay().add(entity.getHra()).add(entity.getAllowances());
        entity.setGrossSalary(gross);
        entity.setNetSalary(gross.subtract(entity.getDeductions()));

        if (request.getPaymentMode() != null) {
            entity.setPaymentMode(request.getPaymentMode());
        }
        if (request.getBankName() != null) {
            entity.setBankName(request.getBankName());
        }
        if (request.getBankAccount() != null) {
            entity.setBankAccount(request.getBankAccount());
        }
        if (request.getPanNumber() != null) {
            entity.setPanNumber(request.getPanNumber());
        }
        if (request.getNotes() != null) {
            entity.setNotes(request.getNotes());
        }

        PayrollRecordEntity updated = payrollRepository.save(entity);
        log.info("Updated payroll record: {}", updated.getPayrollId());
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deletePayrollRecord(String payrollId) {
        if (!payrollRepository.existsByPayrollId(payrollId)) {
            throw new ResourceNotFoundException("Payroll record not found with ID: " + payrollId);
        }
        payrollRepository.deleteByPayrollId(payrollId);
        log.info("Deleted payroll record: {}", payrollId);
    }

    @Override
    @Transactional(readOnly = true)
    public PayrollKpiResponse getKpis(String month) {
        String queryMonth = (month != null && !month.trim().isEmpty() && !"all".equalsIgnoreCase(month.trim()))
                ? month.trim()
                : null;

        if (queryMonth == null) {
            List<String> availableMonths = getSortedPayrollMonths();
            if (!availableMonths.isEmpty()) {
                queryMonth = availableMonths.get(0);
            }
        }

        // 1. Current metrics queried directly from database
        long totalEmployees = queryMonth != null
                ? payrollRepository.countDistinctEmployeesByMonth(queryMonth)
                : payrollRepository.countDistinctEmployees();

        BigDecimal totalCost = queryMonth != null
                ? payrollRepository.sumGrossSalaryByMonth(queryMonth)
                : payrollRepository.sumTotalGrossSalary();

        BigDecimal netDisbursed = queryMonth != null
                ? payrollRepository.sumNetSalaryDisbursedByMonth(queryMonth)
                : payrollRepository.sumTotalNetSalaryDisbursed();

        long pending = queryMonth != null
                ? payrollRepository.countPendingPayrollsByMonth(queryMonth)
                : payrollRepository.countTotalPendingPayrolls();

        // 2. Previous month metrics queried dynamically from database for month-over-month comparison
        String prevMonth = getPreviousMonthString(queryMonth != null ? queryMonth : "Oct 2026");
        long prevEmployees = payrollRepository.countDistinctEmployeesByMonth(prevMonth);
        BigDecimal prevCost = payrollRepository.sumGrossSalaryByMonth(prevMonth);
        BigDecimal prevDisbursed = payrollRepository.sumNetSalaryDisbursedByMonth(prevMonth);
        long prevPending = payrollRepository.countPendingPayrollsByMonth(prevMonth);

        // 3. Dynamic trend calculations based entirely on actual DB figures
        TrendResult empTrend = calculateTrend(totalEmployees, prevEmployees);
        TrendResult costTrend = calculateTrend(totalCost, prevCost);
        TrendResult netTrend = calculateTrend(netDisbursed, prevDisbursed);
        TrendResult pendingTrend = calculateTrend(pending, prevPending);

        // 4. Dynamic Last Updated timestamp from database audit column
        OffsetDateTime maxUpdated = queryMonth != null
                ? payrollRepository.findMaxUpdatedAtByMonth(queryMonth)
                : payrollRepository.findMaxUpdatedAt();

        if (maxUpdated == null) {
            maxUpdated = OffsetDateTime.now();
        }
        String lastUpdated = maxUpdated.format(DISPLAY_TIMESTAMP_FORMATTER);

        return PayrollKpiResponse.builder()
                .totalEmployees(totalEmployees)
                .totalEmployeesTrend(empTrend.trendText)
                .totalEmployeesTrendPositive(empTrend.isPositive)
                .totalPayrollCost(totalCost)
                .formattedTotalPayrollCost(formatIndianCurrency(totalCost))
                .totalPayrollCostTrend(costTrend.trendText)
                .totalPayrollCostTrendPositive(costTrend.isPositive)
                .netPayDisbursed(netDisbursed)
                .formattedNetPayDisbursed(formatIndianCurrency(netDisbursed))
                .netPayDisbursedTrend(netTrend.trendText)
                .netPayDisbursedTrendPositive(netTrend.isPositive)
                .pendingPayrolls(pending)
                .pendingPayrollsTrend(pendingTrend.trendText)
                .pendingPayrollsTrendPositive(pendingTrend.isPositive)
                .lastUpdated(lastUpdated)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PayrollFilterOptionsResponse getFilterOptions() {
        List<String> months = getSortedPayrollMonths();
        List<String> types = payrollRepository.findDistinctEmploymentTypes();
        List<String> statuses = payrollRepository.findDistinctPaymentStatuses();

        List<Object[]> pairs = payrollRepository.findDistinctEmployeePairs();
        List<PayrollFilterOptionsResponse.EmployeeOptionDto> employees = new ArrayList<>();
        for (Object[] pair : pairs) {
            if (pair != null && pair.length >= 2) {
                employees.add(PayrollFilterOptionsResponse.EmployeeOptionDto.builder()
                        .employeeId(Objects.toString(pair[0], ""))
                        .employeeName(Objects.toString(pair[1], ""))
                        .build());
            }
        }

        return PayrollFilterOptionsResponse.builder()
                .payrollMonths(months)
                .employmentTypes(types)
                .statuses(statuses)
                .employees(employees)
                .build();
    }

    private List<String> getSortedPayrollMonths() {
        List<String> months = new ArrayList<>(payrollRepository.findDistinctPayrollMonths());
        DateTimeFormatter parseFmt = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);
        months.sort((a, b) -> {
            try {
                YearMonth ymA = YearMonth.parse(a.trim(), parseFmt);
                YearMonth ymB = YearMonth.parse(b.trim(), parseFmt);
                return ymB.compareTo(ymA);
            } catch (Exception e) {
                return b.compareTo(a);
            }
        });
        return months;
    }

    private Specification<PayrollRecordEntity> buildSpecification(
            String search,
            String payrollMonth,
            String employmentType,
            String status,
            String employee
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String searchLike = "%" + search.trim().toLowerCase() + "%";
                Predicate idLike = cb.like(cb.lower(root.get("payrollId")), searchLike);
                Predicate empIdLike = cb.like(cb.lower(root.get("employeeId")), searchLike);
                Predicate nameLike = cb.like(cb.lower(root.get("employeeName")), searchLike);
                predicates.add(cb.or(idLike, empIdLike, nameLike));
            }

            if (payrollMonth != null && !payrollMonth.trim().isEmpty() && !"all".equalsIgnoreCase(payrollMonth.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("payrollMonth")), payrollMonth.trim().toLowerCase()));
            }

            if (employmentType != null && !employmentType.trim().isEmpty() && !"all".equalsIgnoreCase(employmentType.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("employmentType")), employmentType.trim().toLowerCase()));
            }

            if (status != null && !status.trim().isEmpty() && !"all".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("paymentStatus")), status.trim().toLowerCase()));
            }

            if (employee != null && !employee.trim().isEmpty() && !"all".equalsIgnoreCase(employee.trim()) && !"all employees".equalsIgnoreCase(employee.trim())) {
                String empTrim = employee.trim().toLowerCase();
                Predicate empIdEqual = cb.equal(cb.lower(root.get("employeeId")), empTrim);
                Predicate empNameEqual = cb.equal(cb.lower(root.get("employeeName")), empTrim);
                predicates.add(cb.or(empIdEqual, empNameEqual));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.trim().isEmpty() || "newest".equalsIgnoreCase(sort) || sort.toLowerCase().contains("newest")) {
            return Sort.by(Sort.Direction.DESC, "payrollMonth").and(Sort.by(Sort.Direction.ASC, "id"));
        }
        if ("oldest".equalsIgnoreCase(sort) || sort.toLowerCase().contains("oldest")) {
            return Sort.by(Sort.Direction.ASC, "payrollMonth").and(Sort.by(Sort.Direction.ASC, "id"));
        }
        if (sort.toLowerCase().contains("salary") && sort.toLowerCase().contains("desc")) {
            return Sort.by(Sort.Direction.DESC, "netSalary");
        }
        if (sort.toLowerCase().contains("salary") && sort.toLowerCase().contains("asc")) {
            return Sort.by(Sort.Direction.ASC, "netSalary");
        }
        if (sort.toLowerCase().contains("name")) {
            return Sort.by(Sort.Direction.ASC, "employeeName");
        }
        return Sort.by(Sort.Direction.ASC, "id");
    }

    private String getPreviousMonthString(String monthStr) {
        if (monthStr == null) return "Sep 2026";
        try {
            String[] parts = monthStr.trim().split("\\s+");
            if (parts.length == 2) {
                DateTimeFormatter parseFmt = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);
                YearMonth ym = YearMonth.parse(monthStr.trim(), parseFmt);
                return ym.minusMonths(1).format(parseFmt);
            }
        } catch (Exception ignored) {
        }
        return "Sep 2026";
    }

    private record TrendResult(String trendText, boolean isPositive) {}

    private TrendResult calculateTrend(long current, long previous) {
        if (previous <= 0) {
            return new TrendResult("0% vs last month", true);
        }
        long diff = current - previous;
        long percent = Math.round(((double) Math.abs(diff) / previous) * 100.0);
        boolean isPositive = diff >= 0;
        return new TrendResult(percent + "% vs last month", isPositive);
    }

    private TrendResult calculateTrend(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) <= 0) {
            return new TrendResult("0% vs last month", true);
        }
        BigDecimal diff = current.subtract(previous);
        double percent = Math.abs(diff.doubleValue() / previous.doubleValue()) * 100.0;
        long rounded = Math.round(percent);
        boolean isPositive = diff.compareTo(BigDecimal.ZERO) >= 0;
        return new TrendResult(rounded + "% vs last month", isPositive);
    }

    private String formatIndianCurrency(BigDecimal amount) {
        if (amount == null) return "₹ 0";
        long val = amount.longValue();
        String s = String.valueOf(Math.abs(val));
        if (s.length() <= 3) {
            return "₹ " + (val < 0 ? "-" : "") + s;
        }
        String last3 = s.substring(s.length() - 3);
        String remaining = s.substring(0, s.length() - 3);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < remaining.length(); i++) {
            if ((remaining.length() - i) % 2 == 0 && i != 0) {
                sb.append(",");
            }
            sb.append(remaining.charAt(i));
        }
        sb.append(",").append(last3);
        return "₹ " + (val < 0 ? "-" : "") + sb.toString();
    }

    private PayrollRecordDto mapToDto(PayrollRecordEntity entity) {
        return PayrollRecordDto.builder()
                .id(entity.getId())
                .payrollId(entity.getPayrollId())
                .payrollMonth(entity.getPayrollMonth())
                .employeeId(entity.getEmployeeId())
                .employeeName(entity.getEmployeeName())
                .employmentType(entity.getEmploymentType())
                .monthlyCtc(entity.getMonthlyCtc())
                .workingDays(entity.getWorkingDays())
                .paidDays(entity.getPaidDays())
                .lopDays(entity.getLopDays())
                .basicPay(entity.getBasicPay())
                .hra(entity.getHra())
                .allowances(entity.getAllowances())
                .grossSalary(entity.getGrossSalary())
                .deductions(entity.getDeductions())
                .netSalary(entity.getNetSalary())
                .paymentStatus(entity.getPaymentStatus())
                .paymentDate(entity.getPaymentDate())
                .paymentMode(entity.getPaymentMode())
                .bankName(entity.getBankName())
                .bankAccount(entity.getBankAccount())
                .panNumber(entity.getPanNumber())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
