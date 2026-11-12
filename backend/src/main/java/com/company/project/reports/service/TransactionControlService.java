package com.company.project.reports.service;

import com.company.project.clients.entity.ClientEntity;
import com.company.project.clients.repository.ClientRepository;
import com.company.project.collections.entity.CollectionInvoiceEntity;
import com.company.project.collections.repository.CollectionInvoiceRepository;
import com.company.project.finance.entity.FinancePaymentEntity;
import com.company.project.finance.repository.FinancePaymentRepository;
import com.company.project.projects.entity.ProjectEntity;
import com.company.project.projects.entity.ProjectTaskEntity;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectTaskRepository;
import com.company.project.reports.dto.TransactionControlCheckDto;
import com.company.project.reports.dto.TransactionControlRecordDto;
import com.company.project.reports.dto.TransactionControlResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TransactionControlService {

    private static final BigDecimal TOLERANCE = new BigDecimal("0.01");

    private final FinancePaymentRepository financePaymentRepository;
    private final CollectionInvoiceRepository collectionInvoiceRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final ProjectTaskRepository projectTaskRepository;

    @Transactional(readOnly = true)
    public TransactionControlResponse evaluateControls() {
        List<ClientEntity> clients = clientRepository.findAll();
        List<ProjectEntity> projects = projectRepository.findAll();
        List<ProjectTaskEntity> tasks = projectTaskRepository.findAll();
        List<CollectionInvoiceEntity> invoices = collectionInvoiceRepository.findAll();
        List<FinancePaymentEntity> payments = financePaymentRepository.findAll();

        Set<String> validClientKeys = new HashSet<>();
        for (ClientEntity client : clients) {
            addNormalizedKey(validClientKeys, client.getId());
            addNormalizedKey(validClientKeys, client.getClientCode());
        }

        Set<String> validProjectKeys = new HashSet<>();
        for (ProjectEntity project : projects) {
            addNormalizedKey(validProjectKeys, project.getId());
            addNormalizedKey(validProjectKeys, project.getProjectCode());
        }

        Set<String> validInvoiceIds = new HashSet<>();
        for (CollectionInvoiceEntity invoice : invoices) {
            addNormalizedKey(validInvoiceIds, invoice.getId());
        }

        LocalDate today = LocalDate.now();

        List<TransactionControlRecordDto> invalidPaymentInvoiceRecords =
                evaluateInvalidPaymentInvoices(payments, validInvoiceIds);
        List<TransactionControlRecordDto> invalidRelationshipRecords =
                evaluateInvalidRelationships(payments, invoices, projects, tasks, validClientKeys, validProjectKeys, validInvoiceIds);
        List<TransactionControlRecordDto> invoiceReviewFlagRecords =
                evaluateInvoiceReviewFlags(invoices, payments);
        List<TransactionControlRecordDto> overdueCollectionRecords =
                evaluateOverdueCollections(invoices, today);
        List<TransactionControlRecordDto> overdueTaskRecords =
                evaluateOverdueTasks(tasks, today);
        List<TransactionControlRecordDto> dataQualityRecords =
                evaluateDataQualityIssues(clients, invoices, payments);

        List<TransactionControlCheckDto> checks = List.of(
                buildCheck(
                        "invalid-relationships",
                        "Invalid relationships",
                        "Records whose client, project, or invoice references do not match master registers.",
                        "CRITICAL",
                        "Fix linked records",
                        "/sales/contracts",
                        false,
                        "Status",
                        invalidRelationshipRecords
                ),
                buildCheck(
                        "invalid-payment-invoices",
                        "Invalid payment invoices",
                        "Nonblank Invoice ID does not match the invoice register.",
                        "CRITICAL",
                        "Link payment to valid invoice",
                        "/finance/payments",
                        true,
                        "Payment status",
                        invalidPaymentInvoiceRecords
                ),
                buildCheck(
                        "invoice-review-flags",
                        "Invoice review flags",
                        "Invoices or payments with balance variances, negative values, or mismatched statuses.",
                        "REVIEW",
                        "Check invoice receipts",
                        "/finance/invoices",
                        false,
                        "Status",
                        invoiceReviewFlagRecords
                ),
                buildCheck(
                        "overdue-collections",
                        "Overdue collections",
                        "Invoices with remaining balance past their due date.",
                        "ACTION",
                        "Open Collections",
                        "/management/collections",
                        false,
                        "Status",
                        overdueCollectionRecords
                ),
                buildCheck(
                        "overdue-tasks",
                        "Overdue tasks",
                        "Open project tasks whose planned due date has elapsed without completion.",
                        "ACTION",
                        "Open Project Control",
                        "/projects/tasks",
                        false,
                        "Status",
                        overdueTaskRecords
                ),
                buildCheck(
                        "data-quality-issues",
                        "Data quality issues",
                        "Client, invoice, or payment records missing required identifiers or non-positive amounts.",
                        "REVIEW",
                        "Open Data Quality",
                        "/reports/data-quality",
                        false,
                        "Status",
                        dataQualityRecords
                )
        );

        return TransactionControlResponse.builder()
                .verificationAvailable(true)
                .checkedAt(Instant.now().toString())
                .defaultSelectedCheckId("invalid-payment-invoices")
                .checks(checks)
                .build();
    }

    private List<TransactionControlRecordDto> evaluateInvalidPaymentInvoices(
            List<FinancePaymentEntity> payments,
            Set<String> validInvoiceIds
    ) {
        List<TransactionControlRecordDto> results = new ArrayList<>();
        for (FinancePaymentEntity payment : payments) {
            String invoiceId = normalizeKey(payment.getInvoiceId());
            if (!invoiceId.isEmpty() && !validInvoiceIds.contains(invoiceId)) {
                results.add(TransactionControlRecordDto.builder()
                        .id("pay-inv-" + payment.getId())
                        .primaryLabel(payment.getId())
                        .secondaryLabel("finance_payments")
                        .date(payment.getPaymentDate())
                        .invoiceId(payment.getInvoiceId())
                        .clientId(safeString(payment.getClientId()))
                        .clientName(safeString(payment.getClientName()))
                        .amount(payment.getAmount())
                        .modeOrReference(safeString(payment.getMode()))
                        .referenceSub(safeString(payment.getReferenceNo()))
                        .status(safeOrDefault(payment.getStatus(), "Recorded"))
                        .checkDetail("Invoice ID not found in register")
                        .actionLabel("Fix in Payments")
                        .actionPath("/finance/payments")
                        .build());
            }
        }
        return results;
    }

    private List<TransactionControlRecordDto> evaluateInvalidRelationships(
            List<FinancePaymentEntity> payments,
            List<CollectionInvoiceEntity> invoices,
            List<ProjectEntity> projects,
            List<ProjectTaskEntity> tasks,
            Set<String> validClientKeys,
            Set<String> validProjectKeys,
            Set<String> validInvoiceIds
    ) {
        List<TransactionControlRecordDto> results = new ArrayList<>();

        for (FinancePaymentEntity payment : payments) {
            String invKey = normalizeKey(payment.getInvoiceId());
            String clientKey = normalizeKey(payment.getClientId());
            List<String> reasons = new ArrayList<>();
            if (!invKey.isEmpty() && !validInvoiceIds.contains(invKey)) {
                reasons.add("Unmatched invoice ID");
            }
            if (!clientKey.isEmpty() && !validClientKeys.contains(clientKey)) {
                reasons.add("Unmatched client ID");
            }
            if (!reasons.isEmpty()) {
                results.add(TransactionControlRecordDto.builder()
                        .id("rel-pay-" + payment.getId())
                        .primaryLabel(payment.getId())
                        .secondaryLabel("Payment")
                        .date(payment.getPaymentDate())
                        .invoiceId(safeString(payment.getInvoiceId()))
                        .clientId(safeString(payment.getClientId()))
                        .clientName(safeString(payment.getClientName()))
                        .amount(payment.getAmount())
                        .modeOrReference(safeString(payment.getMode()))
                        .referenceSub(safeString(payment.getReferenceNo()))
                        .status(safeOrDefault(payment.getStatus(), "Flagged"))
                        .checkDetail(String.join("; ", reasons))
                        .actionLabel("Open Payments")
                        .actionPath("/finance/payments")
                        .build());
            }
        }

        for (CollectionInvoiceEntity invoice : invoices) {
            String clientKey = normalizeKey(invoice.getClientId());
            String projectKey = normalizeKey(invoice.getProjectId());
            List<String> reasons = new ArrayList<>();
            if (!clientKey.isEmpty() && !validClientKeys.contains(clientKey)) {
                reasons.add("Client ID missing from client master");
            }
            if (!projectKey.isEmpty() && !validProjectKeys.contains(projectKey)) {
                reasons.add("Project ID missing from projects");
            }
            if (!reasons.isEmpty()) {
                results.add(TransactionControlRecordDto.builder()
                        .id("rel-inv-" + invoice.getId())
                        .primaryLabel(invoice.getId())
                        .secondaryLabel("Invoice")
                        .date(invoice.getInvoiceDate())
                        .invoiceId(invoice.getId())
                        .clientId(safeOrDefault(invoice.getClientId(), "—"))
                        .clientName(safeString(invoice.getClientName()))
                        .amount(invoice.getInvoiceAmount())
                        .modeOrReference(safeOrDefault(invoice.getProjectId(), "Invoice"))
                        .referenceSub(invoice.getContractId())
                        .status(safeOrDefault(invoice.getStatus(), "Open"))
                        .checkDetail(String.join("; ", reasons))
                        .actionLabel("Open Invoices")
                        .actionPath("/finance/invoices")
                        .build());
            }
        }

        for (ProjectEntity project : projects) {
            String clientKey = normalizeKey(project.getClientId());
            if (!clientKey.isEmpty() && !validClientKeys.contains(clientKey)) {
                results.add(TransactionControlRecordDto.builder()
                        .id("rel-prj-" + project.getId())
                        .primaryLabel(safeOrDefault(project.getProjectCode(), project.getId()))
                        .secondaryLabel("Project")
                        .date(project.getStartDate())
                        .invoiceId(project.getId())
                        .clientId(project.getClientId())
                        .clientName(project.getProjectName())
                        .amount(project.getContractValue())
                        .modeOrReference(project.getProjectManager())
                        .referenceSub(project.getStatus())
                        .status(safeOrDefault(project.getStatus(), "Active"))
                        .checkDetail("Project Client ID missing from client master")
                        .actionLabel("Open Projects")
                        .actionPath("/projects/tasks")
                        .build());
            }
        }

        for (ProjectTaskEntity task : tasks) {
            String projectKey = normalizeKey(task.getProjectId());
            if (projectKey.isEmpty() || !validProjectKeys.contains(projectKey)) {
                results.add(TransactionControlRecordDto.builder()
                        .id("rel-task-" + task.getId())
                        .primaryLabel(task.getId())
                        .secondaryLabel("Task")
                        .date(task.getDueDate())
                        .invoiceId(safeOrDefault(task.getProjectId(), "—"))
                        .clientId(task.getAssignedTo())
                        .clientName(task.getTaskName())
                        .metricDisplay(safeBigDecimal(task.getEstimatedHours()) + " hrs")
                        .modeOrReference(task.getMilestone())
                        .referenceSub(task.getPriority())
                        .status(safeOrDefault(task.getStatus(), "Open"))
                        .checkDetail("Task references missing project")
                        .actionLabel("Open Tasks")
                        .actionPath("/projects/tasks")
                        .build());
            }
        }

        return results;
    }

    private List<TransactionControlRecordDto> evaluateInvoiceReviewFlags(
            List<CollectionInvoiceEntity> invoices,
            List<FinancePaymentEntity> payments
    ) {
        List<TransactionControlRecordDto> results = new ArrayList<>();

        for (CollectionInvoiceEntity invoice : invoices) {
            BigDecimal total = safeBigDecimal(invoice.getInvoiceAmount());
            BigDecimal paid = safeBigDecimal(invoice.getAmountPaid());
            BigDecimal outstanding = safeBigDecimal(invoice.getOutstanding());
            String status = safeString(invoice.getStatus());

            List<String> flags = new ArrayList<>();
            if (paid.subtract(total).compareTo(TOLERANCE) > 0) {
                flags.add("Amount paid exceeds invoice total");
            }
            if (outstanding.compareTo(BigDecimal.ZERO) < 0) {
                flags.add("Negative outstanding balance");
            }
            if (paid.add(outstanding).subtract(total).abs().compareTo(TOLERANCE) > 0) {
                flags.add("Paid + outstanding != invoice total");
            }
            if ("Paid".equalsIgnoreCase(status) && outstanding.compareTo(TOLERANCE) > 0) {
                flags.add("Marked Paid with positive outstanding");
            } else if (!"Paid".equalsIgnoreCase(status)
                    && total.compareTo(BigDecimal.ZERO) > 0
                    && outstanding.compareTo(TOLERANCE) <= 0) {
                flags.add("Zero outstanding but status is " + status);
            }

            if (!flags.isEmpty()) {
                results.add(TransactionControlRecordDto.builder()
                        .id("rev-inv-" + invoice.getId())
                        .primaryLabel(invoice.getId())
                        .secondaryLabel("Invoice")
                        .date(invoice.getInvoiceDate())
                        .invoiceId(invoice.getId())
                        .clientId(safeOrDefault(invoice.getClientId(), "—"))
                        .clientName(safeString(invoice.getClientName()))
                        .amount(total)
                        .modeOrReference("Paid: " + formatInr(paid))
                        .referenceSub("Due: " + (invoice.getDueDate() != null ? invoice.getDueDate() : "—"))
                        .status(safeOrDefault(status, "Review"))
                        .checkDetail(String.join("; ", flags))
                        .actionLabel("Check invoice")
                        .actionPath("/finance/invoices")
                        .build());
            }
        }

        for (FinancePaymentEntity payment : payments) {
            BigDecimal variance = safeBigDecimal(payment.getVarianceAmount());
            String status = safeString(payment.getStatus());
            if (variance.abs().compareTo(TOLERANCE) > 0
                    || "Partially Matched".equalsIgnoreCase(status)
                    || "Disputed".equalsIgnoreCase(status)) {
                results.add(TransactionControlRecordDto.builder()
                        .id("rev-pay-" + payment.getId())
                        .primaryLabel(payment.getId())
                        .secondaryLabel("Payment")
                        .date(payment.getPaymentDate())
                        .invoiceId(payment.getInvoiceId())
                        .clientId(safeOrDefault(payment.getClientId(), "—"))
                        .clientName(safeString(payment.getClientName()))
                        .amount(payment.getAmount())
                        .modeOrReference(safeString(payment.getMode()))
                        .referenceSub(safeString(payment.getReferenceNo()))
                        .status(safeOrDefault(status, "Review"))
                        .checkDetail(variance.abs().compareTo(TOLERANCE) > 0
                                ? "Payment variance of " + formatInr(variance.abs())
                                : "Payment status: " + status)
                        .actionLabel("Review payment")
                        .actionPath("/finance/payments")
                        .build());
            }
        }

        return results;
    }

    private List<TransactionControlRecordDto> evaluateOverdueCollections(
            List<CollectionInvoiceEntity> invoices,
            LocalDate today
    ) {
        List<TransactionControlRecordDto> results = new ArrayList<>();
        for (CollectionInvoiceEntity invoice : invoices) {
            BigDecimal outstanding = safeBigDecimal(invoice.getOutstanding());
            if (outstanding.compareTo(TOLERANCE) <= 0) {
                continue;
            }
            boolean pastDue = invoice.getDueDate() != null && invoice.getDueDate().isBefore(today);
            boolean flaggedOverdue = "Overdue".equalsIgnoreCase(invoice.getStatus())
                    || (invoice.getDaysOverdue() != null && invoice.getDaysOverdue() > 0);
            if (pastDue || flaggedOverdue) {
                long days = invoice.getDaysOverdue() != null && invoice.getDaysOverdue() > 0
                        ? invoice.getDaysOverdue()
                        : (invoice.getDueDate() != null ? java.time.temporal.ChronoUnit.DAYS.between(invoice.getDueDate(), today) : 0);
                results.add(TransactionControlRecordDto.builder()
                        .id("col-inv-" + invoice.getId())
                        .primaryLabel(invoice.getId())
                        .secondaryLabel(invoice.getAgeingBucket())
                        .date(invoice.getDueDate())
                        .invoiceId(invoice.getId())
                        .clientId(safeOrDefault(invoice.getClientId(), "—"))
                        .clientName(safeString(invoice.getClientName()))
                        .amount(outstanding)
                        .modeOrReference(days > 0 ? days + " days overdue" : safeString(invoice.getAgeingBucket()))
                        .referenceSub(safeOrDefault(invoice.getCollectionStatus(), invoice.getRecommendedAction()))
                        .status(safeOrDefault(invoice.getStatus(), "Overdue"))
                        .checkDetail("Outstanding balance past due")
                        .actionLabel("Open Collections")
                        .actionPath("/management/collections")
                        .build());
            }
        }
        return results;
    }

    private List<TransactionControlRecordDto> evaluateOverdueTasks(
            List<ProjectTaskEntity> tasks,
            LocalDate today
    ) {
        List<TransactionControlRecordDto> results = new ArrayList<>();
        for (ProjectTaskEntity task : tasks) {
            String status = safeString(task.getStatus());
            boolean closed = "Completed".equalsIgnoreCase(status)
                    || "Done".equalsIgnoreCase(status)
                    || "Cancelled".equalsIgnoreCase(status);
            if (!closed && task.getDueDate() != null && task.getDueDate().isBefore(today)) {
                long daysLate = java.time.temporal.ChronoUnit.DAYS.between(task.getDueDate(), today);
                results.add(TransactionControlRecordDto.builder()
                        .id("task-ovd-" + task.getId())
                        .primaryLabel(task.getId())
                        .secondaryLabel(task.getTaskName())
                        .date(task.getDueDate())
                        .invoiceId(task.getProjectId())
                        .clientId(safeOrDefault(task.getAssignedTo(), "Unassigned"))
                        .clientName(task.getTaskName())
                        .metricDisplay(safeBigDecimal(task.getActualHours()) + " / " + safeBigDecimal(task.getEstimatedHours()) + "h")
                        .modeOrReference(safeOrDefault(task.getPriority(), "Medium"))
                        .referenceSub(daysLate + "d overdue")
                        .status(safeOrDefault(status, "In Progress"))
                        .checkDetail("Task past due date (" + task.getDueDate() + ")")
                        .actionLabel("Open Tasks")
                        .actionPath("/projects/tasks")
                        .build());
            }
        }
        return results;
    }

    private List<TransactionControlRecordDto> evaluateDataQualityIssues(
            List<ClientEntity> clients,
            List<CollectionInvoiceEntity> invoices,
            List<FinancePaymentEntity> payments
    ) {
        List<TransactionControlRecordDto> results = new ArrayList<>();

        for (ClientEntity client : clients) {
            List<String> missing = new ArrayList<>();
            if (isBlank(client.getClientCode())) missing.add("client code");
            if (isBlank(client.getEmail())) missing.add("email");
            if (isBlank(client.getPhone())) missing.add("phone");
            if (isBlank(client.getContactPerson())) missing.add("contact person");
            if (!missing.isEmpty()) {
                results.add(TransactionControlRecordDto.builder()
                        .id("dq-client-" + client.getId())
                        .primaryLabel(safeOrDefault(client.getClientCode(), client.getId()))
                        .secondaryLabel("Client")
                        .date(client.getUpdatedAt() != null ? client.getUpdatedAt().toLocalDate() : null)
                        .invoiceId(client.getId())
                        .clientId(client.getId())
                        .clientName(client.getClientName())
                        .metricDisplay("Clients")
                        .modeOrReference(String.join(", ", missing))
                        .referenceSub(client.getClientName())
                        .status(safeOrDefault(client.getStatus(), "Incomplete"))
                        .checkDetail("Missing required client fields: " + String.join(", ", missing))
                        .actionLabel("Open Clients")
                        .actionPath("/clients/list")
                        .build());
            }
        }

        for (CollectionInvoiceEntity invoice : invoices) {
            List<String> issues = new ArrayList<>();
            if (isBlank(invoice.getClientId())) issues.add("missing client ID");
            if (invoice.getInvoiceDate() == null) issues.add("missing invoice date");
            if (invoice.getDueDate() == null) issues.add("missing due date");
            if (safeBigDecimal(invoice.getInvoiceAmount()).compareTo(BigDecimal.ZERO) <= 0) {
                issues.add("non-positive invoice amount");
            }
            if (!issues.isEmpty()) {
                results.add(TransactionControlRecordDto.builder()
                        .id("dq-inv-" + invoice.getId())
                        .primaryLabel(invoice.getId())
                        .secondaryLabel("Invoice")
                        .date(invoice.getInvoiceDate())
                        .invoiceId(invoice.getId())
                        .clientId(safeOrDefault(invoice.getClientId(), "—"))
                        .clientName(safeString(invoice.getClientName()))
                        .amount(invoice.getInvoiceAmount())
                        .modeOrReference(String.join(", ", issues))
                        .referenceSub(invoice.getClientName())
                        .status(safeOrDefault(invoice.getStatus(), "Incomplete"))
                        .checkDetail("Invoice quality issue: " + String.join(", ", issues))
                        .actionLabel("Open Invoices")
                        .actionPath("/finance/invoices")
                        .build());
            }
        }

        for (FinancePaymentEntity payment : payments) {
            List<String> issues = new ArrayList<>();
            if (isBlank(payment.getReferenceNo())) issues.add("missing reference no");
            if (isBlank(payment.getMode())) issues.add("missing mode");
            if (safeBigDecimal(payment.getAmount()).compareTo(BigDecimal.ZERO) <= 0) {
                issues.add("non-positive amount");
            }
            if (!issues.isEmpty()) {
                results.add(TransactionControlRecordDto.builder()
                        .id("dq-pay-" + payment.getId())
                        .primaryLabel(payment.getId())
                        .secondaryLabel("Payment")
                        .date(payment.getPaymentDate())
                        .invoiceId(payment.getInvoiceId())
                        .clientId(safeOrDefault(payment.getClientId(), "—"))
                        .clientName(safeString(payment.getClientName()))
                        .amount(payment.getAmount())
                        .modeOrReference(safeString(payment.getMode()))
                        .referenceSub(String.join(", ", issues))
                        .status(safeOrDefault(payment.getStatus(), "Incomplete"))
                        .checkDetail("Payment quality issue: " + String.join(", ", issues))
                        .actionLabel("Open Payments")
                        .actionPath("/finance/payments")
                        .build());
            }
        }

        return results;
    }

    private TransactionControlCheckDto buildCheck(
            String id,
            String control,
            String description,
            String classification,
            String actionLabel,
            String actionPath,
            boolean nested,
            String statusFilterLabel,
            List<TransactionControlRecordDto> records
    ) {
        Set<String> statusSet = new LinkedHashSet<>();
        for (TransactionControlRecordDto record : records) {
            if (!isBlank(record.getStatus())) {
                statusSet.add(record.getStatus());
            }
        }

        return TransactionControlCheckDto.builder()
                .id(id)
                .control(control)
                .description(description)
                .classification(classification)
                .count(records.size())
                .actionLabel(actionLabel)
                .actionPath(actionPath)
                .nested(nested)
                .statusFilterLabel(statusFilterLabel)
                .statusOptions(new ArrayList<>(statusSet))
                .records(records)
                .build();
    }

    private void addNormalizedKey(Set<String> target, String value) {
        String key = normalizeKey(value);
        if (!key.isEmpty()) {
            target.add(key);
        }
    }

    private String normalizeKey(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    private String safeOrDefault(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private BigDecimal safeBigDecimal(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String formatInr(BigDecimal value) {
        NumberFormat format = NumberFormat.getNumberInstance(Locale.forLanguageTag("en-IN"));
        format.setMaximumFractionDigits(0);
        return "₹ " + format.format(safeBigDecimal(value).setScale(0, RoundingMode.HALF_UP));
    }
}

