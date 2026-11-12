package com.company.project.sales;

import com.company.project.sales.dto.dashboard.SalesDashboardFormatUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SalesDashboardFormatUtil Unit Tests")
class SalesDashboardFormatUtilTest {

    @Test
    @DisplayName("Should format currency with INR symbol and Indian comma notation")
    void testFormatCurrencyINR() {
        assertEquals("₹ 0.00", SalesDashboardFormatUtil.formatCurrencyINR(null));
        assertEquals("₹ 0.00", SalesDashboardFormatUtil.formatCurrencyINR(BigDecimal.ZERO));
        assertEquals("₹ 997.00", SalesDashboardFormatUtil.formatCurrencyINR(new BigDecimal("997")));
        assertEquals("₹ 12,00,000.00", SalesDashboardFormatUtil.formatCurrencyINR(new BigDecimal("1200000")));
        assertEquals("₹ 1,50,00,000.00", SalesDashboardFormatUtil.formatCurrencyINR(new BigDecimal("15000000")));
    }

    @Test
    @DisplayName("Should format decimal to two decimal places")
    void testFormatDecimal() {
        assertEquals("997.00", SalesDashboardFormatUtil.formatDecimal(997L));
        assertEquals("0.00", SalesDashboardFormatUtil.formatDecimal(0L));
        assertEquals("1,234.56", SalesDashboardFormatUtil.formatDecimal(1234.56));
    }

    @Test
    @DisplayName("Should format percentage with two decimals and percent sign")
    void testFormatPercentage() {
        assertEquals("100.00%", SalesDashboardFormatUtil.formatPercentage(100.0));
        assertEquals("0.00%", SalesDashboardFormatUtil.formatPercentage(0.0));
        assertEquals("33.33%", SalesDashboardFormatUtil.formatPercentage(33.3333));
    }

    @Test
    @DisplayName("Should prevent CSV formula injection and escape comma/quotes")
    void testEscapeCsvField() {
        assertEquals("", SalesDashboardFormatUtil.escapeCsvField(null));
        assertEquals("Normal Text", SalesDashboardFormatUtil.escapeCsvField("Normal Text"));

        // Formula injection protection
        assertEquals("'+12345", SalesDashboardFormatUtil.escapeCsvField("+12345"));
        assertEquals("'=CMD()", SalesDashboardFormatUtil.escapeCsvField("=CMD()"));
        assertEquals("'-200", SalesDashboardFormatUtil.escapeCsvField("-200"));
        assertEquals("'@SUM(A1:A10)", SalesDashboardFormatUtil.escapeCsvField("@SUM(A1:A10)"));

        // Comma escaping
        assertEquals("\"Acme, Inc.\"", SalesDashboardFormatUtil.escapeCsvField("Acme, Inc."));

        // Quotes escaping
        assertEquals("\"Acme \"\"Best\"\"\"", SalesDashboardFormatUtil.escapeCsvField("Acme \"Best\""));
    }
}

