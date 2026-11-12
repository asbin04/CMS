package com.company.project.dashboard.service;

import com.company.project.collections.repository.CollectionInvoiceRepository;
import com.company.project.collections.repository.CollectionPaymentRepository;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.dashboard.dto.CeoDashboardResponse;
import com.company.project.dashboard.dto.CeoDashboardUpdateRequest;
import com.company.project.dashboard.dto.SidebarCountsDto;
import com.company.project.dashboard.entity.*;
import com.company.project.dashboard.repository.*;
import com.company.project.notification.service.NotificationService;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class DashboardService {

    private final DashboardKpiCardRepository kpiCardRepository;
    private final FinanceMonthlyRepository financeMonthlyRepository;
    private final ExpenseBreakdownRepository expenseBreakdownRepository;
    private final SalesPipelineStageRepository salesPipelineStageRepository;
    private final ProjectStatusDistributionRepository projectStatusDistributionRepository;
    private final PeopleMonthlyRepository peopleMonthlyRepository;
    private final PeopleSummaryRepository peopleSummaryRepository;
    private final ManagementAlertRepository managementAlertRepository;
    private final DashboardSettingsRepository dashboardSettingsRepository;
    private final OpportunityRepository opportunityRepository;
    private final FollowUpItemRepository followUpItemRepository;
    private final EmployeeApprovalRepository employeeApprovalRepository;
    private final ClientApprovalRepository clientApprovalRepository;
    private final TicketAssetApprovalRepository ticketAssetApprovalRepository;
    private final EmployeeMasterRepository employeeMasterRepository;
    private final CollectionInvoiceRepository collectionInvoiceRepository;
    private final CollectionPaymentRepository collectionPaymentRepository;
    private final NotificationService notificationService;

    public DashboardService(
            DashboardKpiCardRepository kpiCardRepository,
            FinanceMonthlyRepository financeMonthlyRepository,
            ExpenseBreakdownRepository expenseBreakdownRepository,
            SalesPipelineStageRepository salesPipelineStageRepository,
            ProjectStatusDistributionRepository projectStatusDistributionRepository,
            PeopleMonthlyRepository peopleMonthlyRepository,
            PeopleSummaryRepository peopleSummaryRepository,
            ManagementAlertRepository managementAlertRepository,
            DashboardSettingsRepository dashboardSettingsRepository,
            OpportunityRepository opportunityRepository,
            FollowUpItemRepository followUpItemRepository,
            EmployeeApprovalRepository employeeApprovalRepository,
            ClientApprovalRepository clientApprovalRepository,
            TicketAssetApprovalRepository ticketAssetApprovalRepository,
            EmployeeMasterRepository employeeMasterRepository,
            CollectionInvoiceRepository collectionInvoiceRepository,
            CollectionPaymentRepository collectionPaymentRepository,
            @Nullable NotificationService notificationService) {
        this.kpiCardRepository = kpiCardRepository;
        this.financeMonthlyRepository = financeMonthlyRepository;
        this.expenseBreakdownRepository = expenseBreakdownRepository;
        this.salesPipelineStageRepository = salesPipelineStageRepository;
        this.projectStatusDistributionRepository = projectStatusDistributionRepository;
        this.peopleMonthlyRepository = peopleMonthlyRepository;
        this.peopleSummaryRepository = peopleSummaryRepository;
        this.managementAlertRepository = managementAlertRepository;
        this.dashboardSettingsRepository = dashboardSettingsRepository;
        this.opportunityRepository = opportunityRepository;
        this.followUpItemRepository = followUpItemRepository;
        this.employeeApprovalRepository = employeeApprovalRepository;
        this.clientApprovalRepository = clientApprovalRepository;
        this.ticketAssetApprovalRepository = ticketAssetApprovalRepository;
        this.employeeMasterRepository = employeeMasterRepository;
        this.collectionInvoiceRepository = collectionInvoiceRepository;
        this.collectionPaymentRepository = collectionPaymentRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public CeoDashboardResponse getCeoDashboard() {
        DashboardSettings settings = dashboardSettingsRepository.findAll().stream().findFirst().orElse(null);
        List<DashboardKpiCard> kpis = kpiCardRepository.findAllByOrderBySortOrderAsc();
        List<FinanceMonthly> financeMonthly = financeMonthlyRepository.findAllByOrderBySortOrderAsc();
        List<ExpenseBreakdown> expenseBreakdown = expenseBreakdownRepository.findAllByOrderBySortOrderAsc();
        List<SalesPipelineStage> salesPipeline = salesPipelineStageRepository.findAllByOrderBySortOrderAsc();
        List<ProjectStatusDistribution> projectStatus = projectStatusDistributionRepository.findAllByOrderBySortOrderAsc();
        List<PeopleMonthly> peopleMonthly = peopleMonthlyRepository.findAllByOrderBySortOrderAsc();
        PeopleSummary peopleSummary = peopleSummaryRepository.findAll().stream().findFirst().orElse(null);
        List<ManagementAlert> alerts = managementAlertRepository.findAllByOrderBySortOrderAsc();

        // 1. Pending Approvals: Derive from employee + client + ticket/asset approval tables
        long pendingEmp = employeeApprovalRepository.countByStatusIgnoreCase("Pending");
        long pendingClient = clientApprovalRepository.countByStatusIgnoreCase("Pending");
        long pendingTicket = ticketAssetApprovalRepository.countByStatusIgnoreCase("Pending");
        int totalPendingApprovals = (int) (pendingEmp + pendingClient + pendingTicket);

        // 2. Overdue Follow-ups / Invoices
        long overdueFollowUps = followUpItemRepository.countByHealthIgnoreCaseAndIsDoneFalse("Overdue");
        long overdueInvoices = collectionInvoiceRepository.countByStatusIgnoreCase("Overdue");

        for (ManagementAlert alert : alerts) {
            if ("pending_approvals".equalsIgnoreCase(alert.getAlertKey())) {
                alert.setAlertCount(totalPendingApprovals);
            } else if ("overdue_invoices".equalsIgnoreCase(alert.getAlertKey())) {
                alert.setAlertCount((int) overdueInvoices);
            } else if ("overdue_followups".equalsIgnoreCase(alert.getAlertKey()) || "candidate_followups".equalsIgnoreCase(alert.getAlertKey())) {
                if (overdueFollowUps > 0) {
                    alert.setAlertCount((int) overdueFollowUps);
                }
            }
        }

        // 3. Collections & Revenue: Derive directly from collection_invoices & collection_payments
        BigDecimal totalInvoiced = collectionInvoiceRepository.sumTotalInvoiceAmount();
        if (totalInvoiced == null) totalInvoiced = BigDecimal.ZERO;
        BigDecimal totalOutstanding = collectionInvoiceRepository.sumTotalOutstanding();
        if (totalOutstanding == null) totalOutstanding = BigDecimal.ZERO;
        BigDecimal totalCollected = collectionPaymentRepository.sumTotalPayments();
        if (totalCollected == null) totalCollected = BigDecimal.ZERO;

        // 4. Sales Pipeline: Derive weighted pipeline from opportunities table
        BigDecimal sumWeightedPipeline = opportunityRepository.sumWeightedPipeline();
        if (sumWeightedPipeline == null) sumWeightedPipeline = BigDecimal.ZERO;

        // 5. Active Employees: Derive from employee_master table
        long activeEmployees = employeeMasterRepository.countByStatusIgnoreCase("Active");

        int totalActiveProjects = projectStatus.stream()
                .mapToInt(p -> p.getProjectCount() != null ? p.getProjectCount() : 0)
                .sum();

        BigDecimal sumExpenses = expenseBreakdown.stream()
                .map(e -> e.getAmount() != null ? e.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PeopleMonthly latestPeople = peopleMonthly.isEmpty() ? null : peopleMonthly.get(peopleMonthly.size() - 1);

        for (DashboardKpiCard card : kpis) {
            if ("revenue_invoice_value".equalsIgnoreCase(card.getCardKey()) && totalInvoiced.compareTo(BigDecimal.ZERO) > 0) {
                card.setRawValue(totalInvoiced);
                card.setFormattedValue(formatIndianCurrency(totalInvoiced));
            } else if ("outstanding_receivables".equalsIgnoreCase(card.getCardKey()) && totalOutstanding.compareTo(BigDecimal.ZERO) > 0) {
                card.setRawValue(totalOutstanding);
                card.setFormattedValue(formatIndianCurrency(totalOutstanding));
            } else if ("collected_payments".equalsIgnoreCase(card.getCardKey()) && totalCollected.compareTo(BigDecimal.ZERO) > 0) {
                card.setRawValue(totalCollected);
                card.setFormattedValue(formatIndianCurrency(totalCollected));
            } else if ("weighted_sales_pipeline".equalsIgnoreCase(card.getCardKey())) {
                card.setRawValue(sumWeightedPipeline);
                card.setFormattedValue(formatIndianCurrency(sumWeightedPipeline));
            } else if ("active_projects".equalsIgnoreCase(card.getCardKey()) && totalActiveProjects > 0) {
                card.setRawValue(BigDecimal.valueOf(totalActiveProjects));
                card.setFormattedValue(String.valueOf(totalActiveProjects));
            } else if ("active_employees".equalsIgnoreCase(card.getCardKey())) {
                long empCount = activeEmployees > 0 ? activeEmployees : (peopleSummary != null ? peopleSummary.getActiveEmployees() : 0);
                card.setRawValue(BigDecimal.valueOf(empCount));
                card.setFormattedValue(String.valueOf(empCount));
            } else if ("total_expenses".equalsIgnoreCase(card.getCardKey()) && sumExpenses.compareTo(BigDecimal.ZERO) > 0) {
                card.setRawValue(sumExpenses);
                card.setFormattedValue(formatIndianCurrency(sumExpenses));
            } else if ("net_payroll".equalsIgnoreCase(card.getCardKey()) && latestPeople != null && latestPeople.getNetPayroll() != null) {
                card.setRawValue(latestPeople.getNetPayroll());
                card.setFormattedValue(formatIndianCurrency(latestPeople.getNetPayroll()));
            } else if ("employer_payroll_cost".equalsIgnoreCase(card.getCardKey()) && latestPeople != null && latestPeople.getEmployerPayrollCost() != null) {
                card.setRawValue(latestPeople.getEmployerPayrollCost());
                card.setFormattedValue(formatIndianCurrency(latestPeople.getEmployerPayrollCost()));
            }
        }

        return CeoDashboardResponse.builder()
                .settings(settings)
                .kpis(kpis)
                .financeMonthly(financeMonthly)
                .expenseBreakdown(expenseBreakdown)
                .salesPipeline(salesPipeline)
                .projectStatus(projectStatus)
                .peopleMonthly(peopleMonthly)
                .peopleSummary(peopleSummary)
                .alerts(alerts)
                .build();
    }

    @Transactional
    public CeoDashboardResponse updateDashboardData(CeoDashboardUpdateRequest request) {
        if (request == null) {
            return getCeoDashboard();
        }

        // 1. Update settings if provided
        if (request.getSettings() != null) {
            DashboardSettings existingSettings = dashboardSettingsRepository.findAll().stream().findFirst().orElse(null);
            if (existingSettings != null) {
                DashboardSettings reqSettings = request.getSettings();
                if (reqSettings.getDashboardTitle() != null) existingSettings.setDashboardTitle(reqSettings.getDashboardTitle());
                if (reqSettings.getDashboardSubtitle() != null) existingSettings.setDashboardSubtitle(reqSettings.getDashboardSubtitle());
                if (reqSettings.getCompanyName() != null) existingSettings.setCompanyName(reqSettings.getCompanyName());
                if (reqSettings.getActiveDateRange() != null) existingSettings.setActiveDateRange(reqSettings.getActiveDateRange());
                String nowFormatted = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH));
                existingSettings.setLastUpdated(nowFormatted);
                dashboardSettingsRepository.save(existingSettings);
            }
        }

        // 2. Update KPI cards (change percentages and formatting)
        if (request.getKpis() != null) {
            for (DashboardKpiCard reqCard : request.getKpis()) {
                if (reqCard.getId() != null) {
                    kpiCardRepository.findById(reqCard.getId()).ifPresent(card -> {
                        if (reqCard.getChangePercentage() != null) card.setChangePercentage(reqCard.getChangePercentage());
                        if (reqCard.getChangeType() != null) card.setChangeType(reqCard.getChangeType());
                        if (reqCard.getComparisonText() != null) card.setComparisonText(reqCard.getComparisonText());
                        kpiCardRepository.save(card);
                    });
                }
            }
        }

        // 3. Update alerts if provided (only for stored, non-computed alerts)
        if (request.getAlerts() != null) {
            for (ManagementAlert reqAlert : request.getAlerts()) {
                if (reqAlert.getId() != null) {
                    managementAlertRepository.findById(reqAlert.getId()).ifPresent(alert -> {
                        boolean isComputedAlert = "pending_approvals".equalsIgnoreCase(alert.getAlertKey())
                                || "overdue_invoices".equalsIgnoreCase(alert.getAlertKey())
                                || "overdue_followups".equalsIgnoreCase(alert.getAlertKey())
                                || "candidate_followups".equalsIgnoreCase(alert.getAlertKey());
                        if (!isComputedAlert && reqAlert.getAlertCount() != null) {
                            alert.setAlertCount(reqAlert.getAlertCount());
                        }
                        managementAlertRepository.save(alert);
                    });
                }
            }
        }

        if (notificationService != null) {
            notificationService.createNotification(
                    "Admin Dashboard Updated",
                    "Dashboard settings and KPI configuration updated.",
                    "DASHBOARD",
                    "/ceo-dashboard"
            );
        }

        return getCeoDashboard();
    }

    @Transactional(readOnly = true)
    public SidebarCountsDto getSidebarCounts() {
        long pending = employeeApprovalRepository.countByStatusIgnoreCase("Pending")
                + clientApprovalRepository.countByStatusIgnoreCase("Pending")
                + ticketAssetApprovalRepository.countByStatusIgnoreCase("Pending");
        long overdue = followUpItemRepository.countByHealthIgnoreCaseAndIsDoneFalse("Overdue");
        return new SidebarCountsDto(pending, overdue);
    }

    @Transactional
    public DashboardKpiCard updateKpi(Long id, DashboardKpiCard updateRequest) {
        DashboardKpiCard card = kpiCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KPI Card not found with id: " + id));

        if (updateRequest.getFormattedValue() != null) card.setFormattedValue(updateRequest.getFormattedValue());
        if (updateRequest.getRawValue() != null) card.setRawValue(updateRequest.getRawValue());
        if (updateRequest.getChangePercentage() != null) card.setChangePercentage(updateRequest.getChangePercentage());
        if (updateRequest.getChangeType() != null) card.setChangeType(updateRequest.getChangeType());

        return kpiCardRepository.save(card);
    }

    @Transactional
    public DashboardKpiCard updateKpi(Long id, com.company.project.dashboard.dto.UpdateDashboardKpiCardRequest updateRequest) {
        DashboardKpiCard card = kpiCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KPI Card not found with id: " + id));

        if (updateRequest.getFormattedValue() != null) card.setFormattedValue(updateRequest.getFormattedValue());
        if (updateRequest.getRawValue() != null) card.setRawValue(updateRequest.getRawValue());
        if (updateRequest.getChangePercentage() != null) card.setChangePercentage(updateRequest.getChangePercentage());
        if (updateRequest.getChangeType() != null) card.setChangeType(updateRequest.getChangeType());
        if (updateRequest.getTitle() != null) card.setTitle(updateRequest.getTitle());
        if (updateRequest.getComparisonText() != null) card.setComparisonText(updateRequest.getComparisonText());
        if (updateRequest.getIconType() != null) card.setIconType(updateRequest.getIconType());
        if (updateRequest.getColorTheme() != null) card.setColorTheme(updateRequest.getColorTheme());
        if (updateRequest.getSortOrder() != null) card.setSortOrder(updateRequest.getSortOrder());

        return kpiCardRepository.save(card);
    }

    @Transactional
    public ManagementAlert updateAlert(Long id, Integer delta) {
        ManagementAlert alert = managementAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));

        int newCount = Math.max(0, alert.getAlertCount() + delta);
        alert.setAlertCount(newCount);
        return managementAlertRepository.save(alert);
    }

    private String formatIndianCurrency(BigDecimal amount) {
        if (amount == null) return "₹ 0";
        try {
            NumberFormat nf = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
            String formatted = nf.format(amount);
            if (formatted.endsWith(".00")) {
                formatted = formatted.substring(0, formatted.length() - 3);
            }
            return formatted.replace("₹", "₹ ");
        } catch (Exception e) {
            return "₹ " + amount.toPlainString();
        }
    }
}
