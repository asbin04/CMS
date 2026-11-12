package com.company.project.finance.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ConflictException;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.finance.dto.*;
import com.company.project.finance.entity.FinanceCashFlowEntity;
import com.company.project.finance.repository.FinanceCashFlowRepository;
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

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinanceCashFlowServiceImpl implements FinanceCashFlowService {

    private final FinanceCashFlowRepository cashFlowRepository;
    private final FinanceCashFlowIdGeneratorService idGeneratorService;

    private static final DateTimeFormatter PERIOD_PARSER = new DateTimeFormatterBuilder()
            .parseCaseInsensitive()
            .appendPattern("[uuuu-MM][yyyy-MM][MMM uuuu][MMM yyyy][MMMM uuuu][MMMM yyyy]")
            .toFormatter(Locale.ENGLISH);

    private static final DateTimeFormatter CANONICAL_PERIOD_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CashFlowResponse> getCashFlows(
            String search,
            String period,
            String status,
            String sort,
            int page,
            int size
    ) {
        Specification<FinanceCashFlowEntity> spec = createSpecification(search, period, status);
        Sort sortObj = parseSort(sort);
        int pageIdx = Math.max(0, page - 1);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageIdx, pageSize, sortObj);

        Page<FinanceCashFlowEntity> entityPage = cashFlowRepository.findAll(spec, pageable);

        List<CashFlowResponse> content = entityPage.getContent().stream()
                .map(CashFlowResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.<CashFlowResponse>builder()
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
    public CashFlowResponse getCashFlowById(String idOrCashFlowId) {
        FinanceCashFlowEntity entity = findByIdOrCashFlowId(idOrCashFlowId);
        return CashFlowResponse.fromEntity(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public CashFlowKpisResponse getKpis() {
        // Business Rule 4: Main dashboard KPIs represent the latest available calendar period, NOT the sum across all periods
        return cashFlowRepository.findFirstByOrderByPeriodCodeDesc()
                .map(latest -> CashFlowKpisResponse.builder()
                        .period(latest.getPeriod())
                        .periodCode(latest.getPeriodCode())
                        .openingCash(latest.getOpeningCash())
                        .totalInflows(latest.getTotalInflows())
                        .totalOutflows(latest.getTotalOutflows())
                        .closingCash(latest.getClosingCash())
                        .netCashFlow(latest.getNetCashFlow())
                        .hasData(true)
                        .lastUpdated(latest.getUpdatedAt() != null ? latest.getUpdatedAt() : latest.getCreatedAt())
                        .build())
                .orElseGet(CashFlowKpisResponse::empty);
    }

    @Override
    @Transactional(readOnly = true)
    public CashFlowTrendsResponse getTrends() {
        // Fetch latest 6 periods ordered chronologically (oldest to newest)
        List<FinanceCashFlowEntity> latest6Desc = cashFlowRepository.findTop6ByOrderByPeriodCodeDesc();
        List<FinanceCashFlowEntity> chronological = new ArrayList<>(latest6Desc);
        Collections.reverse(chronological);

        if (chronological.isEmpty()) {
            return buildEmptyTrendsResponse();
        }

        FinanceCashFlowEntity latestRecord = latest6Desc.get(0);

        // Calculate averages across available periods
        int count = chronological.size();
        BigDecimal sumInflows = BigDecimal.ZERO;
        BigDecimal sumOutflows = BigDecimal.ZERO;
        BigDecimal sumVendor = BigDecimal.ZERO;
        BigDecimal sumPayroll = BigDecimal.ZERO;
        BigDecimal sumOperating = BigDecimal.ZERO;
        BigDecimal sumOtherOutflows = BigDecimal.ZERO;

        List<CashFlowTrendsResponse.MonthlyTrendDto> monthlyTrends = new ArrayList<>();
        List<CashFlowTrendsResponse.PeriodPositionDto> periodPositions = new ArrayList<>();

        for (FinanceCashFlowEntity e : chronological) {
            sumInflows = sumInflows.add(e.getTotalInflows() != null ? e.getTotalInflows() : BigDecimal.ZERO);
            sumOutflows = sumOutflows.add(e.getTotalOutflows() != null ? e.getTotalOutflows() : BigDecimal.ZERO);
            sumVendor = sumVendor.add(e.getVendorPayments() != null ? e.getVendorPayments() : BigDecimal.ZERO);
            sumPayroll = sumPayroll.add(e.getPayrollPayments() != null ? e.getPayrollPayments() : BigDecimal.ZERO);
            sumOperating = sumOperating.add(e.getOperatingExpenses() != null ? e.getOperatingExpenses() : BigDecimal.ZERO);
            sumOtherOutflows = sumOtherOutflows.add(e.getOtherOutflows() != null ? e.getOtherOutflows() : BigDecimal.ZERO);

            String shortPeriod = formatShortPeriod(e.getPeriod(), e.getPeriodCode());

            monthlyTrends.add(CashFlowTrendsResponse.MonthlyTrendDto.builder()
                    .period(shortPeriod)
                    .periodCode(e.getPeriodCode())
                    .totalInflows(e.getTotalInflows())
                    .totalOutflows(e.getTotalOutflows())
                    .closingCash(e.getClosingCash())
                    .build());

            periodPositions.add(CashFlowTrendsResponse.PeriodPositionDto.builder()
                    .period(e.getPeriod())
                    .periodCode(e.getPeriodCode())
                    .inflows(e.getTotalInflows())
                    .outflows(e.getTotalOutflows())
                    .netCashFlow(e.getNetCashFlow())
                    .closingCash(e.getClosingCash())
                    .build());
        }

        BigDecimal countBd = BigDecimal.valueOf(count);
        BigDecimal avgMonthlyInflow = sumInflows.divide(countBd, 2, RoundingMode.HALF_UP);
        BigDecimal avgMonthlyOutflow = sumOutflows.divide(countBd, 2, RoundingMode.HALF_UP);

        CashFlowTrendsResponse.TrendsKpisDto kpisDto = CashFlowTrendsResponse.TrendsKpisDto.builder()
                .avgMonthlyInflow(avgMonthlyInflow)
                .avgMonthlyOutflow(avgMonthlyOutflow)
                .netCashFlow(latestRecord.getNetCashFlow())
                .closingCashLatest(latestRecord.getClosingCash())
                .build();

        // Donut Breakdown with exact designer colors and exact dynamic database percentages
        BigDecimal totalOutflowsSum = sumVendor.add(sumPayroll).add(sumOperating).add(sumOtherOutflows);

        List<CashFlowTrendsResponse.OutflowCategoryDto> categories = new ArrayList<>();
        categories.add(buildCategory("Vendor Payments", sumVendor, totalOutflowsSum, "#3930A8"));
        categories.add(buildCategory("Payroll Payments", sumPayroll, totalOutflowsSum, "#8188F8"));
        categories.add(buildCategory("Operating Expenses", sumOperating, totalOutflowsSum, "#2EB8E8"));
        categories.add(buildCategory("Other Outflows", sumOtherOutflows, totalOutflowsSum, "#8BBDF8"));

        CashFlowTrendsResponse.OutflowBreakdownDto breakdownDto = CashFlowTrendsResponse.OutflowBreakdownDto.builder()
                .totalOutflows(totalOutflowsSum)
                .categories(categories)
                .build();

        // Dynamic Key Insights based on database records
        List<String> insights = generateKeyInsights(latestRecord, avgMonthlyInflow, avgMonthlyOutflow, breakdownDto);

        return CashFlowTrendsResponse.builder()
                .kpis(kpisDto)
                .monthlyTrends(monthlyTrends)
                .outflowBreakdown(breakdownDto)
                .periodPositions(periodPositions)
                .keyInsights(insights)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SuggestedOpeningCashResponse getSuggestedOpeningCash(String periodOrPeriodCode) {
        // Business Rule 1: Automatically prefill Opening Cash using previous month's Closing Cash
        String targetPeriodCode = derivePeriodCode(periodOrPeriodCode, null);

        Optional<FinanceCashFlowEntity> prevOpt = cashFlowRepository.findFirstByPeriodCodeLessThanOrderByPeriodCodeDesc(targetPeriodCode);

        if (prevOpt.isPresent()) {
            FinanceCashFlowEntity prev = prevOpt.get();
            return SuggestedOpeningCashResponse.builder()
                    .periodCode(targetPeriodCode)
                    .suggestedOpeningCash(prev.getClosingCash())
                    .previousPeriod(prev.getPeriod())
                    .previousPeriodCode(prev.getPeriodCode())
                    .isManualEntry(false)
                    .build();
        }

        return SuggestedOpeningCashResponse.builder()
                .periodCode(targetPeriodCode)
                .suggestedOpeningCash(BigDecimal.ZERO)
                .previousPeriod(null)
                .previousPeriodCode(null)
                .isManualEntry(true)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public NextCashFlowIdResponse getNextId(String year) {
        String effectiveYear = (year != null && !year.isBlank()) ? year.trim() : String.valueOf(LocalDate.now().getYear());
        String nextId = idGeneratorService.peekNextCashFlowId(effectiveYear);
        return NextCashFlowIdResponse.builder()
                .nextCashFlowId(nextId)
                .periodYear(effectiveYear)
                .build();
    }

    @Override
    @Transactional
    public CashFlowResponse createCashFlow(CreateCashFlowRequest request, String username) {
        String periodCode = derivePeriodCode(request.getPeriod(), request.getPeriodCode());
        String canonicalPeriod = formatPeriodFromCode(periodCode, request.getPeriod());

        // Business Rule 3: Only one record per calendar month
        if (cashFlowRepository.existsByPeriodCode(periodCode)) {
            throw new ConflictException("A cash flow record already exists for period: " + periodCode + " (" + canonicalPeriod + "). Only one record per calendar month is allowed.");
        }

        // Authoritative ID generation
        String year = periodCode.substring(0, 4);
        String cashFlowId = idGeneratorService.generateNextCashFlowId(year);

        // Build entity with authoritative calculations
        String auditUser = (username != null && !username.isBlank()) ? username : "System";
        String status = (request.getStatus() != null && !request.getStatus().isBlank()) ? request.getStatus().trim() : "Pending";

        FinanceCashFlowEntity entity = FinanceCashFlowEntity.builder()
                .cashFlowId(cashFlowId)
                .period(canonicalPeriod)
                .periodCode(periodCode)
                .openingCash(request.getOpeningCash() != null ? request.getOpeningCash() : BigDecimal.ZERO)
                .collections(request.getCollections() != null ? request.getCollections() : BigDecimal.ZERO)
                .otherInflows(request.getOtherInflows() != null ? request.getOtherInflows() : BigDecimal.ZERO)
                .vendorPayments(request.getVendorPayments() != null ? request.getVendorPayments() : BigDecimal.ZERO)
                .payrollPayments(request.getPayrollPayments() != null ? request.getPayrollPayments() : BigDecimal.ZERO)
                .operatingExpenses(request.getOperatingExpenses() != null ? request.getOperatingExpenses() : BigDecimal.ZERO)
                .otherOutflows(request.getOtherOutflows() != null ? request.getOtherOutflows() : BigDecimal.ZERO)
                .status(status)
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .createdBy(auditUser)
                .updatedBy(auditUser)
                .build();

        // Calculate authoritative totals
        entity.calculateFinancials();

        FinanceCashFlowEntity saved = cashFlowRepository.save(entity);
        log.info("Created Cash Flow record: id={}, cashFlowId={}, period={}", saved.getId(), saved.getCashFlowId(), saved.getPeriod());
        return CashFlowResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public CashFlowResponse updateCashFlow(String idOrCashFlowId, UpdateCashFlowRequest request, String username) {
        FinanceCashFlowEntity entity = findByIdOrCashFlowId(idOrCashFlowId);

        // Business Rule 2: Completed periods are locked. Prevent normal update and delete operations on completed records.
        if ("Completed".equalsIgnoreCase(entity.getStatus())) {
            throw new BusinessValidationException("Cannot update cash flow record '" + entity.getCashFlowId() + "' because its status is Completed. Completed periods are locked.");
        }

        // Check if period is being changed to another already existing period
        if (request.getPeriod() != null || request.getPeriodCode() != null) {
            String newPeriodCode = derivePeriodCode(
                    request.getPeriod() != null ? request.getPeriod() : entity.getPeriod(),
                    request.getPeriodCode() != null ? request.getPeriodCode() : entity.getPeriodCode()
            );

            if (!newPeriodCode.equals(entity.getPeriodCode())) {
                if (cashFlowRepository.existsByPeriodCode(newPeriodCode)) {
                    throw new ConflictException("Cannot change period to " + newPeriodCode + "; a cash flow record for that period already exists.");
                }
                entity.setPeriodCode(newPeriodCode);
                entity.setPeriod(formatPeriodFromCode(newPeriodCode, request.getPeriod()));
            }
        }

        // Update financial amounts
        entity.setOpeningCash(request.getOpeningCash() != null ? request.getOpeningCash() : BigDecimal.ZERO);
        entity.setCollections(request.getCollections() != null ? request.getCollections() : BigDecimal.ZERO);
        entity.setOtherInflows(request.getOtherInflows() != null ? request.getOtherInflows() : BigDecimal.ZERO);
        entity.setVendorPayments(request.getVendorPayments() != null ? request.getVendorPayments() : BigDecimal.ZERO);
        entity.setPayrollPayments(request.getPayrollPayments() != null ? request.getPayrollPayments() : BigDecimal.ZERO);
        entity.setOperatingExpenses(request.getOperatingExpenses() != null ? request.getOperatingExpenses() : BigDecimal.ZERO);
        entity.setOtherOutflows(request.getOtherOutflows() != null ? request.getOtherOutflows() : BigDecimal.ZERO);

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            entity.setStatus(request.getStatus().trim());
        }

        if (request.getNotes() != null) {
            entity.setNotes(request.getNotes().trim());
        }

        String auditUser = (username != null && !username.isBlank()) ? username : "System";
        entity.setUpdatedBy(auditUser);

        // Recalculate authoritative totals
        entity.calculateFinancials();

        FinanceCashFlowEntity updated = cashFlowRepository.save(entity);
        log.info("Updated Cash Flow record: cashFlowId={}, status={}, closingCash={}", updated.getCashFlowId(), updated.getStatus(), updated.getClosingCash());
        return CashFlowResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteCashFlow(String idOrCashFlowId, String username) {
        FinanceCashFlowEntity entity = findByIdOrCashFlowId(idOrCashFlowId);

        // Business Rule 2: Completed periods are locked. Prevent delete on completed records.
        if ("Completed".equalsIgnoreCase(entity.getStatus())) {
            throw new BusinessValidationException("Cannot delete cash flow record '" + entity.getCashFlowId() + "' because its status is Completed. Completed periods are locked.");
        }

        cashFlowRepository.delete(entity);
        log.info("Deleted Cash Flow record: cashFlowId={} by user={}", entity.getCashFlowId(), username);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCashFlowsToCsv(String search, String period, String status) {
        Specification<FinanceCashFlowEntity> spec = createSpecification(search, period, status);
        List<FinanceCashFlowEntity> records = cashFlowRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "periodCode"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(baos, true, StandardCharsets.UTF_8)) {
            // Write UTF-8 BOM for Microsoft Excel compatibility
            writer.write('\uFEFF');

            // CSV Header
            writer.println(String.join(",",
                    "\"Cash Flow ID\"",
                    "\"Period\"",
                    "\"Opening Cash (₹)\"",
                    "\"Collections (₹)\"",
                    "\"Other Inflows (₹)\"",
                    "\"Total Inflows (₹)\"",
                    "\"Vendor Payments (₹)\"",
                    "\"Payroll Payments (₹)\"",
                    "\"Operating Expenses (₹)\"",
                    "\"Other Outflows (₹)\"",
                    "\"Total Outflows (₹)\"",
                    "\"Net Cash Flow (₹)\"",
                    "\"Closing Cash (₹)\"",
                    "\"Status\"",
                    "\"Notes\""
            ));

            for (FinanceCashFlowEntity r : records) {
                writer.println(String.join(",",
                        escapeCsv(r.getCashFlowId()),
                        escapeCsv(r.getPeriod()),
                        formatDecimal(r.getOpeningCash()),
                        formatDecimal(r.getCollections()),
                        formatDecimal(r.getOtherInflows()),
                        formatDecimal(r.getTotalInflows()),
                        formatDecimal(r.getVendorPayments()),
                        formatDecimal(r.getPayrollPayments()),
                        formatDecimal(r.getOperatingExpenses()),
                        formatDecimal(r.getOtherOutflows()),
                        formatDecimal(r.getTotalOutflows()),
                        formatDecimal(r.getNetCashFlow()),
                        formatDecimal(r.getClosingCash()),
                        escapeCsv(r.getStatus()),
                        escapeCsv(r.getNotes())
                ));
            }
        }

        return baos.toByteArray();
    }

    private FinanceCashFlowEntity findByIdOrCashFlowId(String idOrCashFlowId) {
        if (idOrCashFlowId == null || idOrCashFlowId.isBlank()) {
            throw new ResourceNotFoundException("Cash flow identifier must not be empty");
        }

        String trimmed = idOrCashFlowId.trim();

        // 1. Try numeric database ID
        try {
            Long numericId = Long.parseLong(trimmed);
            Optional<FinanceCashFlowEntity> byId = cashFlowRepository.findById(numericId);
            if (byId.isPresent()) {
                return byId.get();
            }
        } catch (NumberFormatException ignored) {
        }

        // 2. Try unique cashFlowId (e.g. 'CF-2026-001')
        Optional<FinanceCashFlowEntity> byCashFlowId = cashFlowRepository.findByCashFlowId(trimmed);
        if (byCashFlowId.isPresent()) {
            return byCashFlowId.get();
        }

        // 3. Try unique periodCode (e.g. '2026-11')
        Optional<FinanceCashFlowEntity> byPeriodCode = cashFlowRepository.findByPeriodCode(trimmed);
        if (byPeriodCode.isPresent()) {
            return byPeriodCode.get();
        }

        throw new ResourceNotFoundException("Cash flow record not found with identifier: " + trimmed);
    }

    private Specification<FinanceCashFlowEntity> createSpecification(String search, String period, String status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String searchLower = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("cashFlowId")), searchLower),
                        cb.like(cb.lower(root.get("period")), searchLower),
                        cb.like(cb.lower(root.get("notes")), searchLower)
                ));
            }

            if (period != null && !period.equalsIgnoreCase("All") && !period.trim().isEmpty()) {
                String trimmedPeriod = period.trim();
                predicates.add(cb.or(
                        cb.equal(root.get("period"), trimmedPeriod),
                        cb.equal(root.get("periodCode"), trimmedPeriod)
                ));
            }

            if (status != null && !status.equalsIgnoreCase("All") && !status.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.trim().isEmpty() || sort.equalsIgnoreCase("Period (Newest)") || sort.equalsIgnoreCase("period_desc")) {
            return Sort.by(Sort.Direction.DESC, "periodCode");
        } else if (sort.equalsIgnoreCase("Period (Oldest)") || sort.equalsIgnoreCase("period_asc")) {
            return Sort.by(Sort.Direction.ASC, "periodCode");
        } else if (sort.equalsIgnoreCase("Closing Cash (High to Low)") || sort.equalsIgnoreCase("closing_cash_desc")) {
            return Sort.by(Sort.Direction.DESC, "closingCash");
        } else if (sort.equalsIgnoreCase("Closing Cash (Low to High)") || sort.equalsIgnoreCase("closing_cash_asc")) {
            return Sort.by(Sort.Direction.ASC, "closingCash");
        } else if (sort.equalsIgnoreCase("Inflows (High to Low)") || sort.equalsIgnoreCase("inflows_desc")) {
            return Sort.by(Sort.Direction.DESC, "totalInflows");
        } else if (sort.equalsIgnoreCase("Outflows (High to Low)") || sort.equalsIgnoreCase("outflows_desc")) {
            return Sort.by(Sort.Direction.DESC, "totalOutflows");
        }
        return Sort.by(Sort.Direction.DESC, "periodCode");
    }

    private String derivePeriodCode(String period, String periodCode) {
        if (periodCode != null && periodCode.trim().matches("^\\d{4}-(0[1-9]|1[0-2])$")) {
            return periodCode.trim();
        }

        if (period != null && !period.isBlank()) {
            String trimmed = period.trim();
            if (trimmed.matches("^\\d{4}-(0[1-9]|1[0-2])$")) {
                return trimmed;
            }

            try {
                YearMonth ym = YearMonth.parse(trimmed, PERIOD_PARSER);
                return ym.toString(); // format 'YYYY-MM'
            } catch (Exception e) {
                // If parsing fails, try extracting 4 digit year and 2 digit month
                log.warn("Could not parse period '{}' using standard parser: {}", trimmed, e.getMessage());
            }
        }

        // Default to current year-month if unparseable
        return YearMonth.now().toString();
    }

    private String formatPeriodFromCode(String periodCode, String originalPeriod) {
        if (originalPeriod != null && !originalPeriod.isBlank() && !originalPeriod.matches("^\\d{4}-\\d{2}$")) {
            return originalPeriod.trim();
        }

        try {
            YearMonth ym = YearMonth.parse(periodCode);
            return ym.format(CANONICAL_PERIOD_FORMATTER); // e.g. 'Nov 2026'
        } catch (Exception e) {
            return periodCode;
        }
    }

    private String formatShortPeriod(String period, String periodCode) {
        try {
            YearMonth ym = YearMonth.parse(periodCode);
            return ym.format(DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH)); // e.g. 'Nov'
        } catch (Exception e) {
            if (period != null && period.length() >= 3) {
                return period.substring(0, 3);
            }
            return period;
        }
    }

    private CashFlowTrendsResponse.OutflowCategoryDto buildCategory(
            String name,
            BigDecimal amount,
            BigDecimal totalSum,
            String color
    ) {
        BigDecimal percentage = BigDecimal.ZERO;
        if (totalSum != null && totalSum.compareTo(BigDecimal.ZERO) > 0 && amount != null) {
            percentage = amount.multiply(BigDecimal.valueOf(100))
                    .divide(totalSum, 1, RoundingMode.HALF_UP);
        }

        return CashFlowTrendsResponse.OutflowCategoryDto.builder()
                .name(name)
                .amount(amount != null ? amount : BigDecimal.ZERO)
                .percentage(percentage)
                .color(color)
                .build();
    }

    private List<String> generateKeyInsights(
            FinanceCashFlowEntity latest,
            BigDecimal avgInflow,
            BigDecimal avgOutflow,
            CashFlowTrendsResponse.OutflowBreakdownDto breakdown
    ) {
        List<String> insights = new ArrayList<>();

        if (latest.getNetCashFlow() != null && latest.getNetCashFlow().compareTo(BigDecimal.ZERO) >= 0) {
            insights.add("Positive Cash Position: Latest net cash flow is positive at ₹ " + formatNumber(latest.getNetCashFlow()) + " with closing cash of ₹ " + formatNumber(latest.getClosingCash()) + ".");
        } else {
            insights.add("Net Cash Deficit: Latest period experienced net outflow of ₹ " + formatNumber(latest.getNetCashFlow() != null ? latest.getNetCashFlow().abs() : BigDecimal.ZERO) + ".");
        }

        if (avgInflow.compareTo(avgOutflow) >= 0) {
            insights.add("Healthy Inflow Coverage: Average monthly collections (₹ " + formatNumber(avgInflow) + ") comfortably cover average monthly operating outflows (₹ " + formatNumber(avgOutflow) + ").");
        } else {
            insights.add("Outflow Alert: Average monthly outflows (₹ " + formatNumber(avgOutflow) + ") exceed average inflows (₹ " + formatNumber(avgInflow) + ").");
        }

        // Find dominant outflow category
        breakdown.getCategories().stream()
                .max(Comparator.comparing(CashFlowTrendsResponse.OutflowCategoryDto::getAmount))
                .ifPresent(topCat -> insights.add("Primary Outflow Driver: " + topCat.getName() + " represent the largest cost component at ₹ " + formatNumber(topCat.getAmount()) + " (" + topCat.getPercentage() + "%)."));

        return insights;
    }

    private CashFlowTrendsResponse buildEmptyTrendsResponse() {
        return CashFlowTrendsResponse.builder()
                .kpis(CashFlowTrendsResponse.TrendsKpisDto.builder()
                        .avgMonthlyInflow(BigDecimal.ZERO)
                        .avgMonthlyOutflow(BigDecimal.ZERO)
                        .netCashFlow(BigDecimal.ZERO)
                        .closingCashLatest(BigDecimal.ZERO)
                        .build())
                .monthlyTrends(new ArrayList<>())
                .outflowBreakdown(CashFlowTrendsResponse.OutflowBreakdownDto.builder()
                        .totalOutflows(BigDecimal.ZERO)
                        .categories(List.of(
                                CashFlowTrendsResponse.OutflowCategoryDto.builder().name("Vendor Payments").amount(BigDecimal.ZERO).percentage(BigDecimal.ZERO).color("#3930A8").build(),
                                CashFlowTrendsResponse.OutflowCategoryDto.builder().name("Payroll Payments").amount(BigDecimal.ZERO).percentage(BigDecimal.ZERO).color("#8188F8").build(),
                                CashFlowTrendsResponse.OutflowCategoryDto.builder().name("Operating Expenses").amount(BigDecimal.ZERO).percentage(BigDecimal.ZERO).color("#2EB8E8").build(),
                                CashFlowTrendsResponse.OutflowCategoryDto.builder().name("Other Outflows").amount(BigDecimal.ZERO).percentage(BigDecimal.ZERO).color("#8BBDF8").build()
                        ))
                        .build())
                .periodPositions(new ArrayList<>())
                .keyInsights(List.of("No historical cash flow data available yet."))
                .build();
    }

    private String escapeCsv(String value) {
        if (value == null) return "\"\"";
        String val = value.trim();

        // Formula injection protection: if string begins with =, +, -, @, prepend apostrophe
        if (val.startsWith("=") || val.startsWith("+") || val.startsWith("-") || val.startsWith("@")) {
            val = "'" + val;
        }

        return "\"" + val.replace("\"", "\"\"") + "\"";
    }

    private String formatDecimal(BigDecimal value) {
        if (value == null) return "\"0.00\"";
        return "\"" + value.setScale(2, RoundingMode.HALF_UP).toPlainString() + "\"";
    }

    private String formatNumber(BigDecimal value) {
        if (value == null) return "0";
        return value.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }
}

