package com.company.project.sales.dto.dashboard;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

public final class SalesDashboardFormatUtil {

    private static final Locale IN_LOCALE = new Locale("en", "IN");

    private SalesDashboardFormatUtil() {}

    public static String formatCurrencyINR(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return "₹ 0.00";
        }
        boolean isNegative = amount.compareTo(BigDecimal.ZERO) < 0;
        BigDecimal abs = amount.abs();
        String plain = abs.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();
        int dotIdx = plain.indexOf('.');
        String intPart = dotIdx >= 0 ? plain.substring(0, dotIdx) : plain;
        String decPart = dotIdx >= 0 ? plain.substring(dotIdx) : ".00";

        if (intPart.length() <= 3) {
            return (isNegative ? "-₹ " : "₹ ") + intPart + decPart;
        }

        String last3 = intPart.substring(intPart.length() - 3);
        String remaining = intPart.substring(0, intPart.length() - 3);

        StringBuilder sb = new StringBuilder();
        while (remaining.length() > 2) {
            sb.insert(0, "," + remaining.substring(remaining.length() - 2));
            remaining = remaining.substring(0, remaining.length() - 2);
        }
        sb.insert(0, remaining);
        sb.append(",").append(last3).append(decPart);

        return (isNegative ? "-₹ " : "₹ ") + sb.toString();
    }

    public static String formatDecimal(double value) {
        return String.format(Locale.US, "%,.2f", value);
    }

    public static String formatDecimal(long value) {
        return String.format(Locale.US, "%,.2f", (double) value);
    }

    public static String formatPercentage(double value) {
        return String.format(Locale.US, "%.2f%%", value);
    }

    /**
     * Sanitizes and escapes fields for CSV export, preventing CSV formula injection (CSV Injection / CWE-1236).
     */
    public static String escapeCsvField(Object field) {
        if (field == null) {
            return "";
        }
        String str = field.toString();

        // Formula injection mitigation: prepend single quote if starting with formula triggers
        if (!str.isEmpty()) {
            char firstChar = str.charAt(0);
            if (firstChar == '=' || firstChar == '+' || firstChar == '-' || firstChar == '@' || firstChar == '\t' || firstChar == '\r') {
                str = "'" + str;
            }
        }

        // If field contains comma, quote, or newline, escape quotes and wrap in quotes
        if (str.contains(",") || str.contains("\"") || str.contains("\n") || str.contains("\r")) {
            str = "\"" + str.replace("\"", "\"\"") + "\"";
        }

        return str;
    }
}
