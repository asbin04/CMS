package com.company.project.finance.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ConflictException;
import com.company.project.finance.dto.*;
import com.company.project.finance.entity.FinanceCashFlowCounterEntity;
import com.company.project.finance.entity.FinanceCashFlowEntity;
import com.company.project.finance.repository.FinanceCashFlowCounterRepository;
import com.company.project.finance.repository.FinanceCashFlowRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FinanceCashFlowServiceTest {

    private FinanceCashFlowRepository cashFlowRepository;
    private FinanceCashFlowIdGeneratorService idGeneratorService;
    private FinanceCashFlowServiceImpl cashFlowService;

    // In-memory test state
    private final Map<String, FinanceCashFlowEntity> entityByPeriodCode = new HashMap<>();
    private final Map<String, FinanceCashFlowEntity> entityByCashFlowId = new HashMap<>();
    private final Map<Long, FinanceCashFlowEntity> entityById = new HashMap<>();
    private final List<FinanceCashFlowEntity> savedEntities = new ArrayList<>();

    private FinanceCashFlowEntity completedRecord;
    private FinanceCashFlowEntity pendingRecord;

    @SuppressWarnings("unchecked")
    private static <T> T createProxy(Class<T> type, InvocationHandler handler) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type}, handler);
    }

    private static Object defaultValue(Class<?> returnType) {
        if (returnType.equals(boolean.class)) return false;
        if (returnType.equals(int.class)) return 0;
        if (returnType.equals(long.class)) return 0L;
        if (returnType.equals(Optional.class)) return Optional.empty();
        if (returnType.equals(List.class)) return Collections.emptyList();
        return null;
    }

    @BeforeEach
    void setUp() {
        entityByPeriodCode.clear();
        entityByCashFlowId.clear();
        entityById.clear();
        savedEntities.clear();

        completedRecord = FinanceCashFlowEntity.builder()
                .id(1L)
                .cashFlowId("CF-2026-001")
                .period("Oct 2026")
                .periodCode("2026-10")
                .openingCash(new BigDecimal("1500000.00"))
                .collections(new BigDecimal("1850000.00"))
                .otherInflows(new BigDecimal("225000.00"))
                .totalInflows(new BigDecimal("2075000.00"))
                .vendorPayments(new BigDecimal("700000.00"))
                .payrollPayments(new BigDecimal("640000.00"))
                .operatingExpenses(new BigDecimal("810000.00"))
                .otherOutflows(new BigDecimal("120000.00"))
                .totalOutflows(new BigDecimal("2270000.00"))
                .netCashFlow(new BigDecimal("-195000.00"))
                .closingCash(new BigDecimal("1305000.00"))
                .status("Completed")
                .notes("October closing completed")
                .createdBy("admin")
                .updatedBy("admin")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        pendingRecord = FinanceCashFlowEntity.builder()
                .id(2L)
                .cashFlowId("CF-2026-002")
                .period("Nov 2026")
                .periodCode("2026-11")
                .openingCash(new BigDecimal("1305000.00"))
                .collections(new BigDecimal("2000000.00"))
                .otherInflows(new BigDecimal("100000.00"))
                .totalInflows(new BigDecimal("2100000.00"))
                .vendorPayments(new BigDecimal("800000.00"))
                .payrollPayments(new BigDecimal("650000.00"))
                .operatingExpenses(new BigDecimal("500000.00"))
                .otherOutflows(new BigDecimal("50000.00"))
                .totalOutflows(new BigDecimal("2000000.00"))
                .netCashFlow(new BigDecimal("100000.00"))
                .closingCash(new BigDecimal("1405000.00"))
                .status("Pending")
                .notes("November initial estimate")
                .createdBy("finance_user")
                .updatedBy("finance_user")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        // Register default records
        putEntity(completedRecord);
        putEntity(pendingRecord);

        cashFlowRepository = createProxy(FinanceCashFlowRepository.class, (proxy, method, args) -> {
            String name = method.getName();
            if ("findByCashFlowId".equals(name)) {
                return Optional.ofNullable(entityByCashFlowId.get(args[0]));
            } else if ("findByPeriodCode".equals(name)) {
                return Optional.ofNullable(entityByPeriodCode.get(args[0]));
            } else if ("findById".equals(name)) {
                return Optional.ofNullable(entityById.get(args[0]));
            } else if ("existsByPeriodCode".equals(name)) {
                return entityByPeriodCode.containsKey(args[0]);
            } else if ("existsByCashFlowId".equals(name)) {
                return entityByCashFlowId.containsKey(args[0]);
            } else if ("findFirstByOrderByPeriodCodeDesc".equals(name)) {
                return entityByPeriodCode.values().stream()
                        .max(Comparator.comparing(FinanceCashFlowEntity::getPeriodCode));
            } else if ("findFirstByPeriodCodeLessThanOrderByPeriodCodeDesc".equals(name)) {
                String targetPeriod = (String) args[0];
                return entityByPeriodCode.values().stream()
                        .filter(e -> e.getPeriodCode().compareTo(targetPeriod) < 0)
                        .max(Comparator.comparing(FinanceCashFlowEntity::getPeriodCode));
            } else if ("findTop6ByOrderByPeriodCodeDesc".equals(name)) {
                List<FinanceCashFlowEntity> list = new ArrayList<>(entityByPeriodCode.values());
                list.sort(Comparator.comparing(FinanceCashFlowEntity::getPeriodCode).reversed());
                return list.subList(0, Math.min(6, list.size()));
            } else if ("save".equals(name)) {
                FinanceCashFlowEntity entity = (FinanceCashFlowEntity) args[0];
                if (entity.getId() == null) {
                    entity.setId((long) (entityById.size() + 1));
                }
                putEntity(entity);
                savedEntities.add(entity);
                return entity;
            } else if ("delete".equals(name)) {
                FinanceCashFlowEntity entity = (FinanceCashFlowEntity) args[0];
                entityByPeriodCode.remove(entity.getPeriodCode());
                entityByCashFlowId.remove(entity.getCashFlowId());
                entityById.remove(entity.getId());
                return null;
            } else if ("findAll".equals(name)) {
                return new ArrayList<>(entityByPeriodCode.values());
            }
            return defaultValue(method.getReturnType());
        });

        FinanceCashFlowCounterRepository counterRepo = createProxy(FinanceCashFlowCounterRepository.class, (proxy, method, args) -> {
            return defaultValue(method.getReturnType());
        });

        idGeneratorService = new FinanceCashFlowIdGeneratorService(counterRepo) {
            private int counter = 10;
            @Override
            public synchronized String generateNextCashFlowId(String year) {
                return String.format("CF-%s-%03d", (year != null ? year : "2026"), ++counter);
            }
            @Override
            public String peekNextCashFlowId(String year) {
                return String.format("CF-%s-%03d", (year != null ? year : "2026"), counter + 1);
            }
        };

        cashFlowService = new FinanceCashFlowServiceImpl(cashFlowRepository, idGeneratorService);
    }

    private void putEntity(FinanceCashFlowEntity e) {
        if (e.getPeriodCode() != null) entityByPeriodCode.put(e.getPeriodCode(), e);
        if (e.getCashFlowId() != null) entityByCashFlowId.put(e.getCashFlowId(), e);
        if (e.getId() != null) entityById.put(e.getId(), e);
    }

    @Test
    @DisplayName("Create Cash Flow: Authoritative calculation of totals and auto ID generation")
    void createCashFlow_success() {
        CreateCashFlowRequest request = CreateCashFlowRequest.builder()
                .period("Dec 2026")
                .periodCode("2026-12")
                .openingCash(new BigDecimal("1500000.00"))
                .collections(new BigDecimal("1850000.00"))
                .otherInflows(new BigDecimal("225000.00"))
                .vendorPayments(new BigDecimal("700000.00"))
                .payrollPayments(new BigDecimal("640000.00"))
                .operatingExpenses(new BigDecimal("810000.00"))
                .otherOutflows(new BigDecimal("120000.00"))
                .status("Pending")
                .notes("Test creation")
                .build();

        CashFlowResponse response = cashFlowService.createCashFlow(request, "alice");

        assertThat(response).isNotNull();
        assertThat(response.getCashFlowId()).startsWith("CF-2026-");
        assertThat(response.getPeriodCode()).isEqualTo("2026-12");
        assertThat(response.getTotalInflows()).isEqualByComparingTo("2075000.00");
        assertThat(response.getTotalOutflows()).isEqualByComparingTo("2270000.00");
        assertThat(response.getNetCashFlow()).isEqualByComparingTo("-195000.00");
        assertThat(response.getClosingCash()).isEqualByComparingTo("1305000.00");
        assertThat(response.getCreatedBy()).isEqualTo("alice");
    }

    @Test
    @DisplayName("Business Rule 3: Reject duplicate calendar month with ConflictException")
    void createCashFlow_duplicatePeriod_throwsConflictException() {
        CreateCashFlowRequest request = CreateCashFlowRequest.builder()
                .period("Nov 2026")
                .periodCode("2026-11")
                .openingCash(BigDecimal.ZERO)
                .collections(BigDecimal.ZERO)
                .vendorPayments(BigDecimal.ZERO)
                .payrollPayments(BigDecimal.ZERO)
                .operatingExpenses(BigDecimal.ZERO)
                .build();

        assertThatThrownBy(() -> cashFlowService.createCashFlow(request, "alice"))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Only one record per calendar month is allowed");
    }

    @Test
    @DisplayName("Business Rule 1: Auto-prefill Opening Cash from previous month's Closing Cash")
    void getSuggestedOpeningCash_previousMonthExists() {
        SuggestedOpeningCashResponse response = cashFlowService.getSuggestedOpeningCash("Nov 2026");

        assertThat(response).isNotNull();
        assertThat(response.getPeriodCode()).isEqualTo("2026-11");
        assertThat(response.getSuggestedOpeningCash()).isEqualByComparingTo("1305000.00");
        assertThat(response.getPreviousPeriod()).isEqualTo("Oct 2026");
        assertThat(response.isManualEntry()).isFalse();
    }

    @Test
    @DisplayName("Business Rule 1: First month allows manual Opening Cash entry")
    void getSuggestedOpeningCash_firstMonth_isManualEntry() {
        SuggestedOpeningCashResponse response = cashFlowService.getSuggestedOpeningCash("Jan 2026");

        assertThat(response).isNotNull();
        assertThat(response.getPeriodCode()).isEqualTo("2026-01");
        assertThat(response.getSuggestedOpeningCash()).isEqualByComparingTo("0.00");
        assertThat(response.isManualEntry()).isTrue();
    }

    @Test
    @DisplayName("Business Rule 2: Updating a Completed cash flow throws BusinessValidationException (locked)")
    void updateCashFlow_whenCompleted_throwsBusinessValidationException() {
        UpdateCashFlowRequest updateRequest = UpdateCashFlowRequest.builder()
                .openingCash(new BigDecimal("1000000.00"))
                .collections(new BigDecimal("2000000.00"))
                .vendorPayments(new BigDecimal("500000.00"))
                .payrollPayments(new BigDecimal("500000.00"))
                .operatingExpenses(new BigDecimal("500000.00"))
                .build();

        assertThatThrownBy(() -> cashFlowService.updateCashFlow("CF-2026-001", updateRequest, "bob"))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("Completed periods are locked");
    }

    @Test
    @DisplayName("Business Rule 2: Deleting a Completed cash flow throws BusinessValidationException (locked)")
    void deleteCashFlow_whenCompleted_throwsBusinessValidationException() {
        assertThatThrownBy(() -> cashFlowService.deleteCashFlow("CF-2026-001", "admin"))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("Completed periods are locked");
    }

    @Test
    @DisplayName("Update Pending Cash Flow: allows updating amounts and recalculates closing cash")
    void updateCashFlow_whenPending_updatesSuccessfully() {
        UpdateCashFlowRequest updateRequest = UpdateCashFlowRequest.builder()
                .openingCash(new BigDecimal("1305000.00"))
                .collections(new BigDecimal("2500000.00"))
                .otherInflows(BigDecimal.ZERO)
                .vendorPayments(new BigDecimal("700000.00"))
                .payrollPayments(new BigDecimal("600000.00"))
                .operatingExpenses(new BigDecimal("400000.00"))
                .otherOutflows(BigDecimal.ZERO)
                .status("Completed")
                .notes("Finalized figures")
                .build();

        CashFlowResponse response = cashFlowService.updateCashFlow("CF-2026-002", updateRequest, "bob");

        assertThat(response).isNotNull();
        assertThat(response.getTotalInflows()).isEqualByComparingTo("2500000.00");
        assertThat(response.getTotalOutflows()).isEqualByComparingTo("1700000.00");
        assertThat(response.getNetCashFlow()).isEqualByComparingTo("800000.00");
        assertThat(response.getClosingCash()).isEqualByComparingTo("2105000.00");
        assertThat(response.getStatus()).isEqualTo("Completed");
        assertThat(response.getUpdatedBy()).isEqualTo("bob");
    }

    @Test
    @DisplayName("Business Rule 4: Main dashboard KPIs represent the latest period only")
    void getKpis_returnsLatestPeriodOnly() {
        CashFlowKpisResponse kpis = cashFlowService.getKpis();

        assertThat(kpis).isNotNull();
        assertThat(kpis.isHasData()).isTrue();
        assertThat(kpis.getPeriod()).isEqualTo("Nov 2026");
        assertThat(kpis.getPeriodCode()).isEqualTo("2026-11");
        assertThat(kpis.getOpeningCash()).isEqualByComparingTo("1305000.00");
        assertThat(kpis.getTotalInflows()).isEqualByComparingTo("2100000.00");
        assertThat(kpis.getTotalOutflows()).isEqualByComparingTo("2000000.00");
        assertThat(kpis.getClosingCash()).isEqualByComparingTo("1405000.00");
        assertThat(kpis.getNetCashFlow()).isEqualByComparingTo("100000.00");
    }

    @Test
    @DisplayName("Main dashboard KPIs: Returns empty zeroes when database table is empty")
    void getKpis_whenEmpty_returnsEmptyResponse() {
        entityByPeriodCode.clear();
        entityByCashFlowId.clear();
        entityById.clear();

        CashFlowKpisResponse kpis = cashFlowService.getKpis();

        assertThat(kpis).isNotNull();
        assertThat(kpis.isHasData()).isFalse();
        assertThat(kpis.getClosingCash()).isEqualByComparingTo("0.00");
        assertThat(kpis.getTotalInflows()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("Trends & Analysis: Chronological order, dynamic exact percentages, and 4 designer colors")
    void getTrends_returnsChronologicalAndOutflowBreakdown() {
        CashFlowTrendsResponse trends = cashFlowService.getTrends();

        assertThat(trends).isNotNull();
        // Chronological order: Oct 2026 first, Nov 2026 second
        assertThat(trends.getMonthlyTrends()).hasSize(2);
        assertThat(trends.getMonthlyTrends().get(0).getPeriodCode()).isEqualTo("2026-10");
        assertThat(trends.getMonthlyTrends().get(1).getPeriodCode()).isEqualTo("2026-11");

        // Outflow Breakdown Donut
        CashFlowTrendsResponse.OutflowBreakdownDto breakdown = trends.getOutflowBreakdown();
        assertThat(breakdown).isNotNull();
        assertThat(breakdown.getCategories()).hasSize(4);

        // Verify exact designer colors
        assertThat(breakdown.getCategories().get(0).getColor()).isEqualTo("#3930A8"); // Vendor Payments
        assertThat(breakdown.getCategories().get(1).getColor()).isEqualTo("#8188F8"); // Payroll Payments
        assertThat(breakdown.getCategories().get(2).getColor()).isEqualTo("#2EB8E8"); // Operating Expenses
        assertThat(breakdown.getCategories().get(3).getColor()).isEqualTo("#8BBDF8"); // Other Outflows

        // Total outflows = 2270000 (Oct) + 2000000 (Nov) = 4270000
        assertThat(breakdown.getTotalOutflows()).isEqualByComparingTo("4270000.00");

        // Key insights generated
        assertThat(trends.getKeyInsights()).isNotEmpty();
    }

    @Test
    @DisplayName("CSV Export: UTF-8 BOM, safe formula injection escaping, and accurate records")
    void exportCashFlowsToCsv_safeFormulasAndBom() {
        FinanceCashFlowEntity injectedRecord = FinanceCashFlowEntity.builder()
                .id(3L)
                .cashFlowId("=cmd|'/C calc'!A0") // Malicious formula injection attempt
                .period("Dec 2026")
                .periodCode("2026-12")
                .openingCash(new BigDecimal("1000.00"))
                .collections(new BigDecimal("2000.00"))
                .otherInflows(BigDecimal.ZERO)
                .totalInflows(new BigDecimal("2000.00"))
                .vendorPayments(new BigDecimal("500.00"))
                .payrollPayments(new BigDecimal("500.00"))
                .operatingExpenses(new BigDecimal("500.00"))
                .otherOutflows(BigDecimal.ZERO)
                .totalOutflows(new BigDecimal("1500.00"))
                .netCashFlow(new BigDecimal("500.00"))
                .closingCash(new BigDecimal("1500.00"))
                .status("Pending")
                .notes("+2+5-cmd") // Another injection attempt
                .build();

        putEntity(injectedRecord);

        byte[] csvBytes = cashFlowService.exportCashFlowsToCsv(null, null, null);

        assertThat(csvBytes).isNotNull();
        // Starts with UTF-8 BOM (\uFEFF -> EF BB BF)
        assertThat(csvBytes[0]).isEqualTo((byte) 0xEF);
        assertThat(csvBytes[1]).isEqualTo((byte) 0xBB);
        assertThat(csvBytes[2]).isEqualTo((byte) 0xBF);

        String csvContent = new String(csvBytes, StandardCharsets.UTF_8);
        assertThat(csvContent).contains("\"Cash Flow ID\"");
        // Formula injection neutralized with leading apostrophe
        assertThat(csvContent).contains("\"'=cmd|'/C calc'!A0\"");
        assertThat(csvContent).contains("\"'+2+5-cmd\"");
    }
}
