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
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.proposals.repository.ProposalRepository;
import com.company.project.sales.repository.LeadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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

    @Autowired(required = false)
    private LeadRepository leadRepository;
    @Autowired(required = false)
    private ProposalRepository proposalRepository;
    @Autowired(required = false)
    private ContractRepository contractRepository;
    @Autowired(required = false)
    private ProjectRepository projectRepository;

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
        if (settings == null) {
            settings = new DashboardSettings(1L, "Kalpanaaa Software Solutions", "Admin Dashboard", "Overview & Live Business Analytics", "All Time", "Just now", null, null);
        }
        List<DashboardKpiCard> kpis = kpiCardRepository.findAllByOrderBySortOrderAsc();
        if (kpis.isEmpty()) {
            kpis = new ArrayList<>(List.of(
                    new DashboardKpiCard(1L, "revenue_invoice_value", "Total Invoice Value", BigDecimal.ZERO, "₹ 0.00", BigDecimal.ZERO, "neutral", "vs last month", "chart", "emerald", 1, null),
                    new DashboardKpiCard(2L, "outstanding_receivables", "Outstanding Receivables", BigDecimal.ZERO, "₹ 0.00", BigDecimal.ZERO, "neutral", "vs last month", "trending-up", "rose", 2, null),
                    new DashboardKpiCard(3L, "collected_payments", "Collected Payments", BigDecimal.ZERO, "₹ 0.00", BigDecimal.ZERO, "neutral", "vs last month", "check-circle", "emerald", 3, null),
                    new DashboardKpiCard(4L, "weighted_sales_pipeline", "Weighted Pipeline", BigDecimal.ZERO, "₹ 0.00", BigDecimal.ZERO, "neutral", "vs last month", "briefcase", "indigo", 4, null),
                    new DashboardKpiCard(5L, "active_projects", "Active Projects", BigDecimal.ZERO, "0", BigDecimal.ZERO, "neutral", "vs last month", "folder", "blue", 5, null),
                    new DashboardKpiCard(6L, "active_employees", "Active Employees", BigDecimal.ZERO, "0", BigDecimal.ZERO, "neutral", "vs last month", "users", "violet", 6, null),
                    new DashboardKpiCard(7L, "total_expenses", "Total Expenses", BigDecimal.ZERO, "₹ 0.00", BigDecimal.ZERO, "neutral", "vs last month", "receipt", "amber", 7, null),
                    new DashboardKpiCard(8L, "net_payroll", "Net Payroll", BigDecimal.ZERO, "₹ 0.00", BigDecimal.ZERO, "neutral", "vs last month", "credit-card", "purple", 8, null)
            ));
        }
        List<FinanceMonthly> financeMonthly = financeMonthlyRepository.findAllByOrderBySortOrderAsc();
        if (financeMonthly.isEmpty()) {
            financeMonthly = new ArrayList<>(List.of(
                    new FinanceMonthly(1L, "Oct", BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 1),
                    new FinanceMonthly(2L, "Nov", BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 2),
                    new FinanceMonthly(3L, "Dec", BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 3),
                    new FinanceMonthly(4L, "Jan", BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 4),
                    new FinanceMonthly(5L, "Feb", BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 5),
                    new FinanceMonthly(6L, "Mar", BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 6)
            ));
        } else {
            financeMonthly = new ArrayList<>(financeMonthly);
        }

        List<ExpenseBreakdown> expenseBreakdown = expenseBreakdownRepository.findAllByOrderBySortOrderAsc();
        if (expenseBreakdown.isEmpty()) {
            expenseBreakdown = new ArrayList<>(List.of(
                    new ExpenseBreakdown(1L, "Salaries", BigDecimal.ZERO, BigDecimal.ZERO, "#2563EB", 1),
                    new ExpenseBreakdown(2L, "Operations", BigDecimal.ZERO, BigDecimal.ZERO, "#10B981", 2),
                    new ExpenseBreakdown(3L, "Software & Tools", BigDecimal.ZERO, BigDecimal.ZERO, "#A855F7", 3),
                    new ExpenseBreakdown(4L, "Travel & Admin", BigDecimal.ZERO, BigDecimal.ZERO, "#F97316", 4),
                    new ExpenseBreakdown(5L, "Others", BigDecimal.ZERO, BigDecimal.ZERO, "#F43F5E", 5)
            ));
        } else {
            expenseBreakdown = new ArrayList<>(expenseBreakdown);
        }
        List<SalesPipelineStage> salesPipeline = salesPipelineStageRepository.findAllByOrderBySortOrderAsc();
        if (salesPipeline.isEmpty()) {
            salesPipeline = new ArrayList<>(List.of(
                    new SalesPipelineStage(1L, "Leads", 0, 0, "#3B82F6", 1),
                    new SalesPipelineStage(2L, "Opportunities", 0, 0, "#10B981", 2),
                    new SalesPipelineStage(3L, "Proposals", 0, 0, "#F59E0B", 3),
                    new SalesPipelineStage(4L, "Contracts", 0, 0, "#F97316", 4)
            ));
        } else {
            salesPipeline = new ArrayList<>(salesPipeline);
        }
        List<ProjectStatusDistribution> projectStatus = projectStatusDistributionRepository.findAllByOrderBySortOrderAsc();
        if (projectStatus.isEmpty()) {
            projectStatus = new ArrayList<>(List.of(
                    new ProjectStatusDistribution(1L, "Planning", 0, 0, "#38BDF8", 1),
                    new ProjectStatusDistribution(2L, "In Progress", 0, 0, "#10B981", 2),
                    new ProjectStatusDistribution(3L, "UAT", 0, 0, "#F59E0B", 3),
                    new ProjectStatusDistribution(4L, "Deployment", 0, 0, "#6366F1", 4),
                    new ProjectStatusDistribution(5L, "On Hold", 0, 0, "#F43F5E", 5)
            ));
        } else {
            projectStatus = new ArrayList<>(projectStatus);
        }
        List<PeopleMonthly> peopleMonthly = peopleMonthlyRepository.findAllByOrderBySortOrderAsc();
        if (peopleMonthly.isEmpty()) {
            peopleMonthly = new ArrayList<>(List.of(
                    new PeopleMonthly(1L, "Oct", 0, BigDecimal.ZERO, BigDecimal.ZERO, 1),
                    new PeopleMonthly(2L, "Nov", 0, BigDecimal.ZERO, BigDecimal.ZERO, 2),
                    new PeopleMonthly(3L, "Dec", 0, BigDecimal.ZERO, BigDecimal.ZERO, 3),
                    new PeopleMonthly(4L, "Jan", 0, BigDecimal.ZERO, BigDecimal.ZERO, 4),
                    new PeopleMonthly(5L, "Feb", 0, BigDecimal.ZERO, BigDecimal.ZERO, 5),
                    new PeopleMonthly(6L, "Mar", 0, BigDecimal.ZERO, BigDecimal.ZERO, 6)
            ));
        } else {
            peopleMonthly = new ArrayList<>(peopleMonthly);
        }
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

        if (!financeMonthly.isEmpty()) {
            FinanceMonthly latestMonth = financeMonthly.get(financeMonthly.size() - 1);
            latestMonth.setInvoiceValue(totalInvoiced);
            latestMonth.setCollectedPayments(totalCollected);
            latestMonth.setOutstandingReceivables(totalOutstanding);
        }

        // 4. Sales Pipeline: Derive weighted pipeline and stage counts from live tables
        BigDecimal sumWeightedPipeline = opportunityRepository.sumWeightedPipeline();
        if (sumWeightedPipeline == null) sumWeightedPipeline = BigDecimal.ZERO;

        long liveLeads = leadRepository != null ? leadRepository.count() : 0;
        long liveOpps = opportunityRepository != null ? opportunityRepository.count() : 0;
        long liveProposals = proposalRepository != null ? proposalRepository.count() : 0;
        long liveContracts = contractRepository != null ? contractRepository.count() : 0;

        if (liveLeads > 0 || liveOpps > 0 || liveProposals > 0 || liveContracts > 0) {
            long baseLeads = Math.max(liveLeads, 1);
            for (SalesPipelineStage stage : salesPipeline) {
                if ("Leads".equalsIgnoreCase(stage.getStageName())) {
                    stage.setLeadCount((int) liveLeads);
                    stage.setConversionRate(100);
                } else if ("Opportunities".equalsIgnoreCase(stage.getStageName())) {
                    stage.setLeadCount((int) liveOpps);
                    stage.setConversionRate((int) Math.round(((double) liveOpps / baseLeads) * 100));
                } else if ("Proposals".equalsIgnoreCase(stage.getStageName())) {
                    stage.setLeadCount((int) liveProposals);
                    stage.setConversionRate((int) Math.round(((double) liveProposals / baseLeads) * 100));
                } else if ("Contracts".equalsIgnoreCase(stage.getStageName())) {
                    stage.setLeadCount((int) liveContracts);
                    stage.setConversionRate((int) Math.round(((double) liveContracts / baseLeads) * 100));
                }
            }
        }

        // Active Projects by Status: Derive dynamically from projects table
        if (projectRepository != null) {
            long planningCount = projectRepository.countByStatusIgnoreCase("Planning");
            long inProgressCount = projectRepository.countByStatusIgnoreCase("In Progress");
            long uatCount = projectRepository.countByStatusIgnoreCase("UAT");
            long deploymentCount = projectRepository.countByStatusIgnoreCase("Deployment");
            long onHoldCount = projectRepository.countByStatusIgnoreCase("On Hold");
            long totalProj = planningCount + inProgressCount + uatCount + deploymentCount + onHoldCount;

            if (totalProj > 0) {
                for (ProjectStatusDistribution ps : projectStatus) {
                    if ("Planning".equalsIgnoreCase(ps.getStatusName())) {
                        ps.setProjectCount((int) planningCount);
                        ps.setPercentage((int) Math.round(((double) planningCount / totalProj) * 100));
                    } else if ("In Progress".equalsIgnoreCase(ps.getStatusName())) {
                        ps.setProjectCount((int) inProgressCount);
                        ps.setPercentage((int) Math.round(((double) inProgressCount / totalProj) * 100));
                    } else if ("UAT".equalsIgnoreCase(ps.getStatusName())) {
                        ps.setProjectCount((int) uatCount);
                        ps.setPercentage((int) Math.round(((double) uatCount / totalProj) * 100));
                    } else if ("Deployment".equalsIgnoreCase(ps.getStatusName())) {
                        ps.setProjectCount((int) deploymentCount);
                        ps.setPercentage((int) Math.round(((double) deploymentCount / totalProj) * 100));
                    } else if ("On Hold".equalsIgnoreCase(ps.getStatusName())) {
                        ps.setProjectCount((int) onHoldCount);
                        ps.setPercentage((int) Math.round(((double) onHoldCount / totalProj) * 100));
                    }
                }
            }
        }

        // 5. Active Employees: Derive from employee_master table
        long activeEmployees = employeeMasterRepository.countByStatusIgnoreCase("Active");
        long exitedEmployees = employeeMasterRepository.countByStatusIgnoreCase("Exited");
        long resignedEmployees = employeeMasterRepository.countByStatusIgnoreCase("Resigned");
        long terminatedEmployees = employeeMasterRepository.countByStatusIgnoreCase("Terminated");
        int totalExits = (int) (exitedEmployees + resignedEmployees + terminatedEmployees);
        int totalActive = (int) activeEmployees;

        BigDecimal totalMonthlyCtc = employeeMasterRepository.sumTotalMonthlyCtc();
        if (totalMonthlyCtc == null) totalMonthlyCtc = BigDecimal.ZERO;

        int totalActiveProjects = projectStatus.stream()
                .mapToInt(p -> p.getProjectCount() != null ? p.getProjectCount() : 0)
                .sum();

        BigDecimal sumExpenses = expenseBreakdown.stream()
                .map(e -> e.getAmount() != null ? e.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PeopleMonthly latestPeople = peopleMonthly.isEmpty() ? null : peopleMonthly.get(peopleMonthly.size() - 1);
        if (latestPeople != null) {
            if (totalActive > 0) {
                latestPeople.setEmployeeCount(totalActive);
            }
            if (totalMonthlyCtc.compareTo(BigDecimal.ZERO) > 0) {
                latestPeople.setEmployerPayrollCost(totalMonthlyCtc);
                if (latestPeople.getNetPayroll() == null || latestPeople.getNetPayroll().compareTo(BigDecimal.ZERO) == 0) {
                    latestPeople.setNetPayroll(totalMonthlyCtc.multiply(new BigDecimal("0.80")).setScale(2, java.math.RoundingMode.HALF_UP));
                }
            }
        }

        if (peopleSummary == null) {
            peopleSummary = new PeopleSummary(1L, totalActive, 0, totalExits, -totalExits, java.time.OffsetDateTime.now());
        } else {
            peopleSummary.setActiveEmployees(totalActive);
            if (peopleSummary.getExitsYtd() == null || peopleSummary.getExitsYtd() == 0) {
                peopleSummary.setExitsYtd(totalExits);
            }
            int joiners = peopleSummary.getNewJoinersYtd() != null ? peopleSummary.getNewJoinersYtd() : 0;
            int exits = peopleSummary.getExitsYtd() != null ? peopleSummary.getExitsYtd() : 0;
            peopleSummary.setNetGrowth(joiners - exits);
        }

        for (DashboardKpiCard card : kpis) {
            if ("revenue_invoice_value".equalsIgnoreCase(card.getCardKey())) {
                card.setRawValue(totalInvoiced);
                card.setFormattedValue(formatIndianCurrency(totalInvoiced));
            } else if ("outstanding_receivables".equalsIgnoreCase(card.getCardKey())) {
                card.setRawValue(totalOutstanding);
                card.setFormattedValue(formatIndianCurrency(totalOutstanding));
            } else if ("collected_payments".equalsIgnoreCase(card.getCardKey())) {
                card.setRawValue(totalCollected);
                card.setFormattedValue(formatIndianCurrency(totalCollected));
            } else if ("weighted_sales_pipeline".equalsIgnoreCase(card.getCardKey())) {
                card.setRawValue(sumWeightedPipeline);
                card.setFormattedValue(formatIndianCurrency(sumWeightedPipeline));
            } else if ("active_projects".equalsIgnoreCase(card.getCardKey())) {
                card.setRawValue(BigDecimal.valueOf(totalActiveProjects));
                card.setFormattedValue(String.valueOf(totalActiveProjects));
            } else if ("active_employees".equalsIgnoreCase(card.getCardKey())) {
                card.setRawValue(BigDecimal.valueOf(activeEmployees));
                card.setFormattedValue(String.valueOf(activeEmployees));
            } else if ("total_expenses".equalsIgnoreCase(card.getCardKey())) {
                card.setRawValue(sumExpenses);
                card.setFormattedValue(formatIndianCurrency(sumExpenses));
            } else if ("estimated_project_profit".equalsIgnoreCase(card.getCardKey())) {
                BigDecimal contractVal = projectRepository != null ? projectRepository.sumTotalContractValue() : BigDecimal.ZERO;
                if (contractVal == null) contractVal = BigDecimal.ZERO;
                card.setRawValue(contractVal);
                card.setFormattedValue(formatIndianCurrency(contractVal));
            } else if ("net_payroll".equalsIgnoreCase(card.getCardKey())) {
                BigDecimal net = (latestPeople != null && latestPeople.getNetPayroll() != null) ? latestPeople.getNetPayroll() : BigDecimal.ZERO;
                card.setRawValue(net);
                card.setFormattedValue(formatIndianCurrency(net));
            } else if ("employer_payroll_cost".equalsIgnoreCase(card.getCardKey())) {
                BigDecimal cost = (latestPeople != null && latestPeople.getEmployerPayrollCost() != null) ? latestPeople.getEmployerPayrollCost() : BigDecimal.ZERO;
                card.setRawValue(cost);
                card.setFormattedValue(formatIndianCurrency(cost));
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
