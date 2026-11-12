package com.company.project.sales;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.sales.dto.dashboard.SalesDashboardPeriodParser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SalesDashboardPeriodParser Unit Tests")
class SalesDashboardPeriodParserTest {

    @Test
    @DisplayName("Should parse default fiscal year 'Apr 2024 - Mar 2025' when no parameters provided")
    void testDefaultFiscalYear() {
        SalesDashboardPeriodParser.DateRange range = SalesDashboardPeriodParser.parse(null, null, null);
        assertNotNull(range);
        assertEquals(LocalDate.of(2024, 4, 1), range.startDate());
        assertEquals(LocalDate.of(2025, 3, 31), range.endDate());
        assertEquals("Apr 2024 - Mar 2025", range.periodLabel());
        assertFalse(range.isAllPeriod());
        assertNotNull(range.getStartDateTime());
        assertNotNull(range.getEndExclusiveDateTime());
    }

    @Test
    @DisplayName("Should parse 'All Period' as null start and end dates with isAllPeriod=true")
    void testAllPeriod() {
        SalesDashboardPeriodParser.DateRange range = SalesDashboardPeriodParser.parse(null, null, "All Period");
        assertNotNull(range);
        assertNull(range.startDate());
        assertNull(range.endDate());
        assertTrue(range.isAllPeriod());
        assertNull(range.getStartDateTime());
        assertNull(range.getEndExclusiveDateTime());
        assertEquals("All Period", range.periodLabel());
    }

    @Test
    @DisplayName("Should parse 'Last 30 Days' with correct 30-day lookback")
    void testLast30Days() {
        SalesDashboardPeriodParser.DateRange range = SalesDashboardPeriodParser.parse(null, null, "Last 30 Days");
        assertNotNull(range);
        LocalDate today = LocalDate.now();
        assertEquals(today.minusDays(30), range.startDate());
        assertEquals(today, range.endDate());
        assertEquals("Last 30 Days", range.periodLabel());
    }

    @Test
    @DisplayName("Should parse 'This Quarter' correctly")
    void testThisQuarter() {
        SalesDashboardPeriodParser.DateRange range = SalesDashboardPeriodParser.parse(null, null, "This Quarter");
        assertNotNull(range);
        assertNotNull(range.startDate());
        assertNotNull(range.endDate());
        assertTrue(range.startDate().isBefore(range.endDate()));
        assertEquals("This Quarter", range.periodLabel());
    }

    @Test
    @DisplayName("Should parse generic 'Jan 2025 - Dec 2025' fiscal/calendar range")
    void testGenericMonthYearRange() {
        SalesDashboardPeriodParser.DateRange range = SalesDashboardPeriodParser.parse(null, null, "Jan 2025 - Dec 2025");
        assertNotNull(range);
        assertEquals(LocalDate.of(2025, 1, 1), range.startDate());
        assertEquals(LocalDate.of(2025, 12, 31), range.endDate());
    }

    @Test
    @DisplayName("Should parse explicit startDate and endDate correctly")
    void testExplicitDates() {
        SalesDashboardPeriodParser.DateRange range = SalesDashboardPeriodParser.parse("2024-06-01", "2024-06-30", null);
        assertNotNull(range);
        assertEquals(LocalDate.of(2024, 6, 1), range.startDate());
        assertEquals(LocalDate.of(2024, 6, 30), range.endDate());
    }

    @Test
    @DisplayName("Should throw BusinessValidationException when startDate is after endDate")
    void testStartDateAfterEndDate() {
        BusinessValidationException ex = assertThrows(BusinessValidationException.class, () ->
                SalesDashboardPeriodParser.parse("2025-12-31", "2025-01-01", null));
        assertTrue(ex.getMessage().contains("Start date cannot be after end date"));
    }

    @Test
    @DisplayName("Should throw BusinessValidationException when date format is invalid")
    void testInvalidDateFormat() {
        BusinessValidationException ex = assertThrows(BusinessValidationException.class, () ->
                SalesDashboardPeriodParser.parse("01-01-2025", "2025-01-31", null));
        assertTrue(ex.getMessage().contains("Invalid startDate format"));
    }

    @Test
    @DisplayName("Should throw BusinessValidationException when period label is unsupported")
    void testUnsupportedPeriodLabel() {
        BusinessValidationException ex = assertThrows(BusinessValidationException.class, () ->
                SalesDashboardPeriodParser.parse(null, null, "Next Year"));
        assertTrue(ex.getMessage().contains("Unsupported period format"));
    }
}

