package com.company.project.finance;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ConflictException;
import com.company.project.common.response.PageResponse;
import com.company.project.finance.dto.*;
import com.company.project.finance.entity.FinanceCashFlowEntity;
import com.company.project.finance.repository.FinanceCashFlowRepository;
import com.company.project.finance.service.FinanceCashFlowService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class FinanceCashFlowLiveDatabaseIntegrationTest {

    static {
        File[] envFiles = new File[]{
                new File(".env"),
                new File("backend/.env"),
                new File("../.env"),
                new File("../backend/.env")
        };
        for (File envFile : envFiles) {
            if (envFile.exists() && envFile.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                    (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                } catch (Exception ignored) {
                }
            }
        }
    }

    @Autowired
    private FinanceCashFlowService cashFlowService;

    @Autowired
    private FinanceCashFlowRepository cashFlowRepository;

    private final List<Long> createdRecordIds = new ArrayList<>();

    @AfterEach
    void tearDown() {
        for (Long id : createdRecordIds) {
            try {
                // If locked as Completed, reset to Pending to allow cleanup
                Optional<FinanceCashFlowEntity> entityOpt = cashFlowRepository.findById(id);
                if (entityOpt.isPresent()) {
                    FinanceCashFlowEntity entity = entityOpt.get();
                    if ("Completed".equalsIgnoreCase(entity.getStatus())) {
                        entity.setStatus("Draft");
                        cashFlowRepository.saveAndFlush(entity);
                    }
                    cashFlowRepository.deleteById(id);
                }
            } catch (Exception ignored) {
            }
        }
        createdRecordIds.clear();
    }

    @Test
    @DisplayName("End-to-End Live Integration: Create, Persist, Retrieve, Update, Calculate, and Lock Cash Flow")
    void testCashFlowCompleteLifecycleAgainstLivePostgres() {
        // Step 1: Create a Cash Flow Record with test period
        String testPeriod = "Jan 2029";
        String testPeriodCode = "2029-01";

        CreateCashFlowRequest createReq = CreateCashFlowRequest.builder()
                .period(testPeriod)
                .periodCode(testPeriodCode)
                .openingCash(new BigDecimal("1000000.00"))
                .collections(new BigDecimal("800000.00"))
                .otherInflows(new BigDecimal("100000.00"))
                .vendorPayments(new BigDecimal("300000.00"))
                .payrollPayments(new BigDecimal("250000.00"))
                .operatingExpenses(new BigDecimal("150000.00"))
                .otherOutflows(new BigDecimal("50000.00"))
                .status("Pending")
                .notes("Initial live test record")
                .build();

        CashFlowResponse created = cashFlowService.createCashFlow(createReq, "IntegrationTester");
        assertNotNull(created);
        assertNotNull(created.getId());
        createdRecordIds.add(created.getId());

        // Step 2: Confirm it is persisted in PostgreSQL
        Optional<FinanceCashFlowEntity> inDbOpt = cashFlowRepository.findById(created.getId());
        assertTrue(inDbOpt.isPresent(), "Entity must be persisted in Supabase PostgreSQL");
        FinanceCashFlowEntity inDb = inDbOpt.get();
        assertEquals(testPeriodCode, inDb.getPeriodCode());
        assertEquals("CF-", inDb.getCashFlowId().substring(0, 3));
        assertEquals(0, new BigDecimal("900000.00").compareTo(inDb.getTotalInflows())); // 800k + 100k
        assertEquals(0, new BigDecimal("750000.00").compareTo(inDb.getTotalOutflows())); // 300k + 250k + 150k + 50k
        assertEquals(0, new BigDecimal("150000.00").compareTo(inDb.getNetCashFlow())); // 900k - 750k
        assertEquals(0, new BigDecimal("1150000.00").compareTo(inDb.getClosingCash())); // 1000k + 150k

        // Step 3: Retrieve through GET
        CashFlowResponse retrieved = cashFlowService.getCashFlowById(created.getId().toString());
        assertEquals(created.getCashFlowId(), retrieved.getCashFlowId());
        assertEquals("Pending", retrieved.getStatus());

        PageResponse<CashFlowResponse> page = cashFlowService.getCashFlows("Initial live test", null, null, null, 1, 10);
        assertTrue(page.getTotalElements() >= 1);
        assertTrue(page.getContent().stream().anyMatch(c -> c.getCashFlowId().equals(created.getCashFlowId())));

        // Step 4: Update non-completed record & verify recalculations
        UpdateCashFlowRequest updateReq = UpdateCashFlowRequest.builder()
                .openingCash(new BigDecimal("1000000.00"))
                .collections(new BigDecimal("1200000.00")) // increased collections
                .otherInflows(new BigDecimal("100000.00"))
                .vendorPayments(new BigDecimal("300000.00"))
                .payrollPayments(new BigDecimal("250000.00"))
                .operatingExpenses(new BigDecimal("150000.00"))
                .otherOutflows(new BigDecimal("50000.00"))
                .status("Pending")
                .notes("Updated live test notes")
                .build();

        CashFlowResponse updated = cashFlowService.updateCashFlow(created.getCashFlowId(), updateReq, "IntegrationTester");
        assertEquals(0, new BigDecimal("1300000.00").compareTo(updated.getTotalInflows())); // 1200k + 100k
        assertEquals(0, new BigDecimal("550000.00").compareTo(updated.getNetCashFlow())); // 1300k - 750k
        assertEquals(0, new BigDecimal("1550000.00").compareTo(updated.getClosingCash())); // 1000k + 550k

        // Step 5: Verify Duplicate-Period Rejection (Business Rule 3)
        CreateCashFlowRequest duplicateReq = CreateCashFlowRequest.builder()
                .period("Jan 2029")
                .periodCode("2029-01")
                .openingCash(new BigDecimal("500000.00"))
                .collections(new BigDecimal("500000.00"))
                .vendorPayments(new BigDecimal("200000.00"))
                .payrollPayments(new BigDecimal("100000.00"))
                .operatingExpenses(new BigDecimal("50000.00"))
                .build();

        assertThrows(ConflictException.class, () -> cashFlowService.createCashFlow(duplicateReq, "Tester"),
                "Must reject creation of duplicate period");

        // Step 6: Verify Negative Net Cash Flow is fully supported by PostgreSQL schema
        CreateCashFlowRequest deficitReq = CreateCashFlowRequest.builder()
                .period("Feb 2029")
                .periodCode("2029-02")
                .openingCash(new BigDecimal("200000.00"))
                .collections(new BigDecimal("100000.00")) // Inflows = 100k
                .otherInflows(BigDecimal.ZERO)
                .vendorPayments(new BigDecimal("150000.00")) // Outflows = 150k + 100k = 250k
                .payrollPayments(new BigDecimal("100000.00"))
                .operatingExpenses(BigDecimal.ZERO)
                .otherOutflows(BigDecimal.ZERO)
                .status("Draft")
                .notes("Negative net cash flow test")
                .build();

        CashFlowResponse deficitRecord = cashFlowService.createCashFlow(deficitReq, "DeficitTester");
        createdRecordIds.add(deficitRecord.getId());

        // Net cash flow = 100k - 250k = -150k (negative!)
        assertEquals(0, new BigDecimal("-150000.00").compareTo(deficitRecord.getNetCashFlow()), "Net cash flow must be negative");
        assertEquals(0, new BigDecimal("50000.00").compareTo(deficitRecord.getClosingCash()), "Closing cash = 200k - 150k = 50k");

        // Step 7: Verify Suggested Opening Cash endpoint (Business Rule 1)
        SuggestedOpeningCashResponse suggested = cashFlowService.getSuggestedOpeningCash("2029-02");
        assertNotNull(suggested);
        // Prior to Feb 2029 is Jan 2029 whose closing cash was 1550000.00
        assertEquals(0, new BigDecimal("1550000.00").compareTo(suggested.getSuggestedOpeningCash()),
                "Suggested opening cash for Feb 2029 must equal Jan 2029 closing cash");

        // Step 8: Verify Completed-period locking (Business Rule 2)
        UpdateCashFlowRequest completeReq = UpdateCashFlowRequest.builder()
                .openingCash(updated.getOpeningCash())
                .collections(updated.getCollections())
                .otherInflows(updated.getOtherInflows())
                .vendorPayments(updated.getVendorPayments())
                .payrollPayments(updated.getPayrollPayments())
                .operatingExpenses(updated.getOperatingExpenses())
                .otherOutflows(updated.getOtherOutflows())
                .status("Completed") // Set to Completed
                .notes("Marking as completed to lock")
                .build();

        CashFlowResponse completedRecord = cashFlowService.updateCashFlow(created.getCashFlowId(), completeReq, "LockerTester");
        assertEquals("Completed", completedRecord.getStatus());

        // Attempting to update a Completed record must be rejected
        UpdateCashFlowRequest modifyLockedReq = UpdateCashFlowRequest.builder()
                .collections(new BigDecimal("9999999.00"))
                .build();
        assertThrows(BusinessValidationException.class, () ->
                cashFlowService.updateCashFlow(created.getCashFlowId(), modifyLockedReq, "Hacker"));

        // Attempting to delete a Completed record must be rejected
        assertThrows(BusinessValidationException.class, () ->
                cashFlowService.deleteCashFlow(created.getCashFlowId(), "ROLE_ADMIN"));

        // Step 9: Verify CSV export
        byte[] csvBytes = cashFlowService.exportCashFlowsToCsv(null, null, null);
        assertNotNull(csvBytes);
        assertTrue(csvBytes.length > 3);
        // Verify UTF-8 BOM
        assertEquals((byte) 0xEF, csvBytes[0]);
        assertEquals((byte) 0xBB, csvBytes[1]);
        assertEquals((byte) 0xBF, csvBytes[2]);
        String csvContent = new String(csvBytes, StandardCharsets.UTF_8);
        assertTrue(csvContent.contains("\"Cash Flow ID\""));
        assertTrue(csvContent.contains("\"Opening Cash (₹)\""));
        assertTrue(csvContent.contains(created.getCashFlowId()));
    }
}
