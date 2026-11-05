package com.company.project.finance.service;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.finance.dto.*;
import com.company.project.finance.entity.FinancePaymentEntity;
import com.company.project.finance.repository.FinancePaymentRepository;
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
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinancePaymentServiceImpl implements FinancePaymentService {

    private final FinancePaymentRepository paymentRepository;
    private final FinancePaymentIdGeneratorService idGeneratorService;

    private static final DateTimeFormatter LAST_UPDATED_FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH);

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FinancePaymentDto> getPayments(
            String search,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            String mode,
            String client,
            String month,
            String sort,
            int page,
            int size
    ) {
        Specification<FinancePaymentEntity> spec = createSpecification(search, startDate, endDate, status, mode, client, month);
        Sort sortObj = parseSort(sort);
        int pageIdx = Math.max(0, page - 1);
        int pageSize = size > 0 ? size : 10;
        Pageable pageable = PageRequest.of(pageIdx, pageSize, sortObj);

        Page<FinancePaymentEntity> entityPage = paymentRepository.findAll(spec, pageable);

        List<FinancePaymentDto> content = entityPage.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return PageResponse.<FinancePaymentDto>builder()
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
    public FinancePaymentKpiResponse getKpiSummary(String monthStr) {
        YearMonth currentYm;
        if (monthStr != null && !monthStr.equalsIgnoreCase("All") && !monthStr.trim().isEmpty()) {
            try {
                currentYm = YearMonth.parse(monthStr.trim());
            } catch (Exception e) {
                currentYm = YearMonth.of(2026, 10);
            }
        } else {
            currentYm = YearMonth.of(2026, 10);
        }

        YearMonth prevYm = currentYm.minusMonths(1);

        LocalDate currStart = currentYm.atDay(1);
        LocalDate currEnd = currentYm.atEndOfMonth();

        LocalDate prevStart = prevYm.atDay(1);
        LocalDate prevEnd = prevYm.atEndOfMonth();

        BigDecimal currTotal = paymentRepository.sumTotalPaymentsReceivedBetween(currStart, currEnd);
        BigDecimal prevTotal = paymentRepository.sumTotalPaymentsReceivedBetween(prevStart, prevEnd);

        BigDecimal currPending = paymentRepository.sumPendingPaymentsBetween(currStart, currEnd);
        BigDecimal prevPending = paymentRepository.sumPendingPaymentsBetween(prevStart, prevEnd);

        BigDecimal currMatched = paymentRepository.sumMatchedPaymentsBetween(currStart, currEnd);
        BigDecimal prevMatched = paymentRepository.sumMatchedPaymentsBetween(prevStart, prevEnd);

        BigDecimal currVariance = paymentRepository.sumVarianceAmountBetween(currStart, currEnd);
        BigDecimal prevVariance = paymentRepository.sumVarianceAmountBetween(prevStart, prevEnd);

        GrowthResult totalGrowth = calculateGrowth(currTotal, prevTotal);
        GrowthResult pendingGrowth = calculateGrowth(currPending, prevPending);
        GrowthResult matchedGrowth = calculateGrowth(currMatched, prevMatched);
        GrowthResult varianceGrowth = calculateGrowth(currVariance, prevVariance);

        Instant latestInstant = paymentRepository.findLatestUpdatedAt();
        String lastUpdatedFormatted;
        if (latestInstant != null) {
            lastUpdatedFormatted = LAST_UPDATED_FORMATTER.format(latestInstant.atZone(ZoneId.of("Asia/Kolkata")));
        } else {
            lastUpdatedFormatted = "15 Oct 2026, 11:30 AM";
        }

        long totalCount = paymentRepository.count();

        return FinancePaymentKpiResponse.builder()
                .totalPayments(currTotal)
                .totalPaymentsGrowth(totalGrowth.rate)
                .totalPaymentsTrend(totalGrowth.trend)
                .pendingPayments(currPending)
                .pendingPaymentsGrowth(pendingGrowth.rate)
                .pendingPaymentsTrend(pendingGrowth.trend)
                .matchedPayments(currMatched)
                .matchedPaymentsGrowth(matchedGrowth.rate)
                .matchedPaymentsTrend(matchedGrowth.trend)
                .paymentVariance(currVariance)
                .paymentVarianceGrowth(varianceGrowth.rate)
                .paymentVarianceTrend(varianceGrowth.trend)
                .lastUpdatedFormatted(lastUpdatedFormatted)
                .totalRecordCount(totalCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public FinancePaymentFilterOptionsResponse getFilterOptions() {
        List<String> modes = paymentRepository.findDistinctModes();
        List<String> statuses = paymentRepository.findDistinctStatuses();
        List<Object[]> clientRows = paymentRepository.findDistinctClients();
        List<String> months = paymentRepository.findDistinctMonths();

        List<ClientFilterOptionDto> clients = clientRows.stream()
                .map(row -> ClientFilterOptionDto.builder()
                        .clientId(row[0] != null ? row[0].toString() : "")
                        .clientName(row[1] != null ? row[1].toString() : "")
                        .build())
                .collect(Collectors.toList());

        return FinancePaymentFilterOptionsResponse.builder()
                .modes(modes)
                .statuses(statuses)
                .clients(clients)
                .months(months)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public FinancePaymentDto getPaymentById(String id) {
        FinancePaymentEntity entity = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with ID: " + id));
        return toDto(entity);
    }

    @Override
    @Transactional
    public FinancePaymentDto recordPayment(RecordPaymentRequest request) {
        LocalDate paymentDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now();
        String id = idGeneratorService.generateNextPaymentId(paymentDate);

        String clientName = request.getClientName();
        if ((clientName == null || clientName.trim().isEmpty()) && request.getClientId() != null) {
            clientName = lookupClientName(request.getClientId());
        }

        BigDecimal invoiceAmount = request.getInvoiceAmount() != null
                ? request.getInvoiceAmount()
                : request.getAmount();

        BigDecimal variance = request.getVarianceAmount() != null
                ? request.getVarianceAmount()
                : BigDecimal.ZERO;

        FinancePaymentEntity entity = FinancePaymentEntity.builder()
                .id(id)
                .paymentDate(paymentDate)
                .invoiceId(request.getInvoiceId().trim())
                .clientId(request.getClientId().trim())
                .clientName(clientName != null ? clientName.trim() : "Unknown Client")
                .amount(request.getAmount())
                .invoiceAmount(invoiceAmount)
                .mode(request.getMode().trim())
                .referenceNo(request.getReferenceNo().trim())
                .status(request.getStatus().trim())
                .varianceAmount(variance)
                .notes(request.getNotes() != null && !request.getNotes().trim().isEmpty() ? request.getNotes().trim() : "-")
                .build();

        FinancePaymentEntity saved = paymentRepository.save(entity);
        return toDto(saved);
    }

    @Override
    @Transactional
    public FinancePaymentDto updatePayment(String id, UpdatePaymentRequest request) {
        FinancePaymentEntity entity = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with ID: " + id));

        if (request.getPaymentDate() != null) {
            entity.setPaymentDate(request.getPaymentDate());
        }
        if (request.getMode() != null && !request.getMode().trim().isEmpty()) {
            entity.setMode(request.getMode().trim());
        }
        if (request.getReferenceNo() != null && !request.getReferenceNo().trim().isEmpty()) {
            entity.setReferenceNo(request.getReferenceNo().trim());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            entity.setStatus(request.getStatus().trim());
        }
        if (request.getAmount() != null) {
            entity.setAmount(request.getAmount());
        }
        if (request.getVarianceAmount() != null) {
            entity.setVarianceAmount(request.getVarianceAmount());
        }
        if (request.getNotes() != null) {
            entity.setNotes(request.getNotes().trim().isEmpty() ? "-" : request.getNotes().trim());
        }

        FinancePaymentEntity updated = paymentRepository.save(entity);
        return toDto(updated);
    }

    @Override
    @Transactional
    public void deletePayment(String id) {
        if (!paymentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Payment record not found with ID: " + id);
        }
        paymentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FinancePaymentDto> getAllPaymentsForExport(
            String search,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            String mode,
            String client,
            String month
    ) {
        Specification<FinancePaymentEntity> spec = createSpecification(search, startDate, endDate, status, mode, client, month);
        Sort sort = Sort.by(Sort.Direction.DESC, "paymentDate").and(Sort.by(Sort.Direction.DESC, "id"));
        return paymentRepository.findAll(spec, sort).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private Specification<FinancePaymentEntity> createSpecification(
            String search,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            String mode,
            String client,
            String month
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate idLike = cb.like(cb.lower(root.get("id")), pattern);
                Predicate invLike = cb.like(cb.lower(root.get("invoiceId")), pattern);
                Predicate clIdLike = cb.like(cb.lower(root.get("clientId")), pattern);
                Predicate clNameLike = cb.like(cb.lower(root.get("clientName")), pattern);
                Predicate refLike = cb.like(cb.lower(root.get("referenceNo")), pattern);
                predicates.add(cb.or(idLike, invLike, clIdLike, clNameLike, refLike));
            }

            if (startDate != null && endDate != null) {
                predicates.add(cb.between(root.get("paymentDate"), startDate, endDate));
            } else if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("paymentDate"), startDate));
            } else if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("paymentDate"), endDate));
            }

            if (status != null && !status.equalsIgnoreCase("All") && !status.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            }

            if (mode != null && !mode.equalsIgnoreCase("All") && !mode.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("mode")), mode.trim().toLowerCase()));
            }

            if (client != null && !client.equalsIgnoreCase("All") && !client.equalsIgnoreCase("All Clients") && !client.trim().isEmpty()) {
                Predicate clIdMatch = cb.equal(cb.lower(root.get("clientId")), client.trim().toLowerCase());
                Predicate clNameMatch = cb.equal(cb.lower(root.get("clientName")), client.trim().toLowerCase());
                predicates.add(cb.or(clIdMatch, clNameMatch));
            }

            if (month != null && !month.equalsIgnoreCase("All") && !month.trim().isEmpty()) {
                try {
                    YearMonth ym = YearMonth.parse(month.trim());
                    LocalDate start = ym.atDay(1);
                    LocalDate end = ym.atEndOfMonth();
                    predicates.add(cb.between(root.get("paymentDate"), start, end));
                } catch (Exception ignored) {
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.trim().isEmpty() || sort.equalsIgnoreCase("Payment Date (Newest)")) {
            return Sort.by(Sort.Direction.DESC, "paymentDate").and(Sort.by(Sort.Direction.DESC, "id"));
        } else if (sort.equalsIgnoreCase("Payment Date (Oldest)")) {
            return Sort.by(Sort.Direction.ASC, "paymentDate").and(Sort.by(Sort.Direction.ASC, "id"));
        } else if (sort.equalsIgnoreCase("Amount (High to Low)")) {
            return Sort.by(Sort.Direction.DESC, "amount");
        } else if (sort.equalsIgnoreCase("Amount (Low to High)")) {
            return Sort.by(Sort.Direction.ASC, "amount");
        } else if (sort.equalsIgnoreCase("Payment ID")) {
            return Sort.by(Sort.Direction.DESC, "id");
        }
        return Sort.by(Sort.Direction.DESC, "paymentDate");
    }

    private String lookupClientName(String clientId) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getClientId().equalsIgnoreCase(clientId))
                .map(FinancePaymentEntity::getClientName)
                .findFirst()
                .orElse("Client " + clientId);
    }

    private GrowthResult calculateGrowth(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return new GrowthResult(0.0, "up");
        }
        if (current == null) {
            current = BigDecimal.ZERO;
        }

        BigDecimal diff = current.subtract(previous);
        BigDecimal growth = diff.divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        double rate = Math.abs(growth.setScale(1, RoundingMode.HALF_UP).doubleValue());
        String trend = diff.compareTo(BigDecimal.ZERO) >= 0 ? "up" : "down";
        return new GrowthResult(rate, trend);
    }

    private FinancePaymentDto toDto(FinancePaymentEntity e) {
        return FinancePaymentDto.builder()
                .id(e.getId())
                .paymentDate(e.getPaymentDate())
                .invoiceId(e.getInvoiceId())
                .clientId(e.getClientId())
                .clientName(e.getClientName())
                .amount(e.getAmount())
                .invoiceAmount(e.getInvoiceAmount())
                .mode(e.getMode())
                .referenceNo(e.getReferenceNo())
                .status(e.getStatus())
                .varianceAmount(e.getVarianceAmount())
                .notes(e.getNotes())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private static class GrowthResult {
        final double rate;
        final String trend;

        GrowthResult(double rate, String trend) {
            this.rate = rate;
            this.trend = trend;
        }
    }
}

