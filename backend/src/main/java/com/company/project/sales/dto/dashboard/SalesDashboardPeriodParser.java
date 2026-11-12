package com.company.project.sales.dto.dashboard;

import com.company.project.common.exception.BusinessValidationException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class SalesDashboardPeriodParser {

    private static final Pattern FISCAL_OR_MONTH_RANGE_PATTERN = Pattern.compile(
            "^([A-Za-z]{3})\\s+(\\d{4})\\s*-\\s*([A-Za-z]{3})\\s+(\\d{4})$"
    );

    private static final DateTimeFormatter MONTH_YEAR_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);

    private SalesDashboardPeriodParser() {}

    public static DateRange parse(String startDateStr, String endDateStr, String periodStr) {
        // 1. Explicit startDate and endDate take precedence
        if (startDateStr != null && !startDateStr.isBlank() && endDateStr != null && !endDateStr.isBlank()) {
            LocalDate start;
            LocalDate end;
            try {
                start = LocalDate.parse(startDateStr.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (DateTimeParseException e) {
                throw new BusinessValidationException("Invalid startDate format. Expected YYYY-MM-DD");
            }
            try {
                end = LocalDate.parse(endDateStr.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (DateTimeParseException e) {
                throw new BusinessValidationException("Invalid endDate format. Expected YYYY-MM-DD");
            }

            if (start.isAfter(end)) {
                throw new BusinessValidationException("Start date cannot be after end date");
            }

            String label = (periodStr != null && !periodStr.isBlank()) 
                    ? periodStr.trim() 
                    : String.format("%s - %s", start.format(DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH)),
                                                end.format(DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH)));
            return new DateRange(start, end, label);
        }

        // 2. Fallback to period string, defaulting to "Apr 2024 - Mar 2025"
        String rawPeriod = (periodStr != null && !periodStr.isBlank()) ? periodStr.trim() : "Apr 2024 - Mar 2025";

        if ("All Period".equalsIgnoreCase(rawPeriod) || "All".equalsIgnoreCase(rawPeriod)) {
            return new DateRange(null, null, "All Period");
        }

        if ("Last 30 Days".equalsIgnoreCase(rawPeriod)) {
            LocalDate today = LocalDate.now();
            return new DateRange(today.minusDays(30), today, "Last 30 Days");
        }

        if ("This Quarter".equalsIgnoreCase(rawPeriod)) {
            LocalDate today = LocalDate.now();
            int currentMonth = today.getMonthValue();
            int year = today.getYear();

            LocalDate start;
            LocalDate end;
            if (currentMonth <= 3) {
                start = LocalDate.of(year, Month.JANUARY, 1);
                end = LocalDate.of(year, Month.MARCH, 31);
            } else if (currentMonth <= 6) {
                start = LocalDate.of(year, Month.APRIL, 1);
                end = LocalDate.of(year, Month.JUNE, 30);
            } else if (currentMonth <= 9) {
                start = LocalDate.of(year, Month.JULY, 1);
                end = LocalDate.of(year, Month.SEPTEMBER, 30);
            } else {
                start = LocalDate.of(year, Month.OCTOBER, 1);
                end = LocalDate.of(year, Month.DECEMBER, 31);
            }
            return new DateRange(start, end, "This Quarter");
        }

        Matcher matcher = FISCAL_OR_MONTH_RANGE_PATTERN.matcher(rawPeriod);
        if (matcher.matches()) {
            try {
                String startPart = matcher.group(1) + " " + matcher.group(2);
                String endPart = matcher.group(3) + " " + matcher.group(4);

                YearMonth startYm = YearMonth.parse(startPart, MONTH_YEAR_FORMATTER);
                YearMonth endYm = YearMonth.parse(endPart, MONTH_YEAR_FORMATTER);

                LocalDate start = startYm.atDay(1);
                LocalDate end = endYm.atEndOfMonth();

                if (start.isAfter(end)) {
                    throw new BusinessValidationException("Period start cannot be after period end");
                }

                return new DateRange(start, end, rawPeriod);
            } catch (DateTimeParseException e) {
                throw new BusinessValidationException("Invalid period month-year format: " + rawPeriod);
            }
        }

        throw new BusinessValidationException("Unsupported period format: " + rawPeriod);
    }

    public record DateRange(LocalDate startDate, LocalDate endDate, String periodLabel) {
        public boolean isAllPeriod() {
            return startDate == null && endDate == null;
        }

        public LocalDateTime getStartDateTime() {
            return startDate != null ? startDate.atStartOfDay() : null;
        }

        public LocalDateTime getEndExclusiveDateTime() {
            return endDate != null ? endDate.plusDays(1).atStartOfDay() : null;
        }
    }
}

