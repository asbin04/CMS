package com.company.project.collections.service;

import com.company.project.collections.entity.CollectionInvoiceEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@Service
public class CollectionsCalculationService {

    public static final LocalDate SIMULATION_BASELINE_DATE = LocalDate.of(2025, 3, 21);

    private static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);

    private static final DateTimeFormatter FLEXIBLE_FORMATTER = new DateTimeFormatterBuilder()
            .parseCaseInsensitive()
            .appendOptional(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
            .appendOptional(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
            .appendOptional(DateTimeFormatter.ofPattern("d/M/yyyy"))
            .appendOptional(DateTimeFormatter.ofPattern("dd-MM-yyyy"))
            .appendOptional(DateTimeFormatter.ofPattern("d-M-yyyy"))
            .appendOptional(DateTimeFormatter.ofPattern("yyyy/MM/dd"))
            .appendOptional(DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH))
            .appendOptional(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))
            .toFormatter(Locale.ENGLISH);

    public LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return LocalDate.now();
        }
        String clean = dateStr.trim();
        if (clean.contains("T")) {
            clean = clean.substring(0, clean.indexOf("T"));
        }
        try {
            return LocalDate.parse(clean, FLEXIBLE_FORMATTER);
        } catch (Exception ex) {
            try {
                return LocalDate.parse(clean);
            } catch (Exception e2) {
                return LocalDate.now();
            }
        }
    }

    public String formatDate(LocalDate date) {
        if (date == null) return "";
        return date.format(DISPLAY_FORMATTER);
    }

    public LocalDate getReferenceDate(LocalDate targetDate) {
        if (targetDate != null && targetDate.getYear() <= 2025) {
            return SIMULATION_BASELINE_DATE;
        }
        return LocalDate.now();
    }

    public Integer calculateDaysOverdue(LocalDate dueDate) {
        if (dueDate == null) return null;
        LocalDate refDate = getReferenceDate(dueDate);
        long days = ChronoUnit.DAYS.between(dueDate, refDate);
        return days > 0 ? (int) days : null;
    }

    public String calculateAgeingBucket(Integer daysOverdue) {
        if (daysOverdue == null || daysOverdue <= 0) return "Current";
        if (daysOverdue <= 30) return "1–30 days";
        if (daysOverdue <= 60) return "31–60 days";
        if (daysOverdue <= 90) return "61–90 days";
        return "90+ days";
    }

    public String calculateStatus(LocalDate dueDate, BigDecimal outstanding, Integer daysOverdue) {
        if (outstanding == null || outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            return "Paid";
        }
        if (daysOverdue != null && daysOverdue > 0) {
            return "Overdue";
        }
        if (dueDate != null) {
            LocalDate refDate = getReferenceDate(dueDate);
            long daysUntilDue = ChronoUnit.DAYS.between(refDate, dueDate);
            if (daysUntilDue <= 30) {
                return "Due Soon";
            }
        }
        return "Open";
    }

    public String calculateInvoiceStatus(BigDecimal outstanding, BigDecimal amountPaid) {
        if (outstanding == null || outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            return "Paid";
        }
        if (amountPaid != null && amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            return "Partially Paid";
        }
        return "Unpaid";
    }

    public String calculateCollectionStatus(BigDecimal outstanding, BigDecimal amountPaid, LocalDate dueDate, Integer daysOverdue) {
        if (outstanding == null || outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            return "Completed";
        }
        if (daysOverdue != null && daysOverdue > 0) {
            return "Follow Up";
        }
        if (amountPaid != null && amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            return "In Progress";
        }
        return "Pending";
    }

    /**
     * Applies the agreed unified precedence across both Collections and Finance:
     * 1. Fully Paid: outstanding <= 0 -> daysOverdue = null, ageingBucket = 'Current', invoiceStatus = 'Paid', collectionStatus = 'Completed', status = 'Paid'
     * 2. Overdue: outstanding > 0 && daysOverdue > 0 -> collectionStatus = 'Follow Up', status = 'Overdue'
     * 3. Partially Paid & not overdue: collectionStatus = 'In Progress', invoiceStatus = 'Partially Paid'
     * 4. Unpaid & not overdue: collectionStatus = 'Pending', invoiceStatus = 'Unpaid', status = 'Due Soon' or 'Open'
     */
    public void applyUnifiedStatus(CollectionInvoiceEntity invoice) {
        if (invoice == null) return;

        BigDecimal outstanding = invoice.getOutstanding() != null ? invoice.getOutstanding() : BigDecimal.ZERO;
        BigDecimal amountPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;

        if (outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setOutstanding(BigDecimal.ZERO);
            invoice.setDaysOverdue(null);
            invoice.setAgeingBucket("Current");
            invoice.setInvoiceStatus("Paid");
            invoice.setCollectionStatus("Completed");
            invoice.setStatus("Paid");
            invoice.setRecommendedAction("Receipt Issued");
            return;
        }

        Integer daysOverdue = calculateDaysOverdue(invoice.getDueDate());
        invoice.setDaysOverdue(daysOverdue);
        invoice.setAgeingBucket(calculateAgeingBucket(daysOverdue));

        if (daysOverdue != null && daysOverdue > 0) {
            invoice.setStatus("Overdue");
            invoice.setCollectionStatus("Follow Up");
            invoice.setInvoiceStatus(amountPaid.compareTo(BigDecimal.ZERO) > 0 ? "Partially Paid" : "Unpaid");
            invoice.setRecommendedAction("Call + Email client");
        } else {
            // Not overdue
            if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
                invoice.setInvoiceStatus("Partially Paid");
                invoice.setCollectionStatus("In Progress");
                invoice.setStatus("Partially Paid");
                invoice.setRecommendedAction("Follow up balance");
            } else {
                invoice.setInvoiceStatus("Unpaid");
                invoice.setCollectionStatus("Pending");

                LocalDate dueDate = invoice.getDueDate();
                if (dueDate != null) {
                    LocalDate refDate = getReferenceDate(dueDate);
                    long daysUntilDue = ChronoUnit.DAYS.between(refDate, dueDate);
                    if (daysUntilDue <= 30) {
                        invoice.setStatus("Due Soon");
                        invoice.setRecommendedAction("Send Reminder");
                    } else {
                        invoice.setStatus("Open");
                        invoice.setRecommendedAction("Monitor");
                    }
                } else {
                    invoice.setStatus("Open");
                    invoice.setRecommendedAction("Monitor");
                }
            }
        }
    }

    public String getRecommendedAction(String status) {
        if (status == null) return "Monitor";
        return switch (status) {
            case "Overdue" -> "Call + Email client";
            case "Due Soon" -> "Send Reminder";
            case "Partially Paid" -> "Follow up balance";
            case "Paid" -> "Receipt Issued";
            default -> "Monitor";
        };
    }
}
