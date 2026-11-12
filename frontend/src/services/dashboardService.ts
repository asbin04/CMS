import { FullDashboardData } from '../types/dashboard';
import { apiClient } from './api/apiClient';
import { triggerNotificationRefresh } from './notificationService';

export function normalizeDashboardData(raw: any): FullDashboardData {
  if (!raw || typeof raw !== 'object') {
    return {
      settings: {
        company_name: '—',
        dashboard_title: 'Admin Dashboard',
        dashboard_subtitle: '—',
        active_date_range: '—',
        last_updated: '—',
        user_name: '—',
        user_role: '—',
      },
      kpis: [],
      finance_monthly: [],
      expense_breakdown: [],
      sales_pipeline: [],
      project_status: [],
      people_monthly: [],
      people_summary: {
        id: 0,
        active_employees: 0,
        new_joiners_ytd: 0,
        exits_ytd: 0,
        net_growth: 0,
      },
      alerts: [],
    };
  }

  const payload = (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) ? raw.data : raw;

  const rawSettings = payload.settings || {};
  const rawDashboardTitle = rawSettings.dashboard_title || rawSettings.dashboardTitle;
  const settings = {
    company_name: rawSettings.company_name || rawSettings.companyName || '—',
    dashboard_title:
      !rawDashboardTitle || rawDashboardTitle === 'CEO Dashboard'
        ? 'Admin Dashboard'
        : rawDashboardTitle,
    dashboard_subtitle: rawSettings.dashboard_subtitle || rawSettings.dashboardSubtitle || '—',
    active_date_range: rawSettings.active_date_range || rawSettings.activeDateRange || '—',
    last_updated: rawSettings.last_updated || rawSettings.lastUpdated || payload.lastUpdated || payload.serverTime || '—',
    user_name: rawSettings.user_name || rawSettings.userName || '—',
    user_role: rawSettings.user_role || rawSettings.userRole || '—',
  };

  const rawKpis = Array.isArray(payload.kpis) ? payload.kpis : [];
  const kpis = rawKpis.map((k: any, idx: number) => ({
    id: k.id ?? idx + 1,
    card_key: k.card_key || k.cardKey || `kpi_${idx}`,
    title: k.title || '',
    raw_value: Number(k.raw_value ?? k.rawValue ?? 0),
    formatted_value: k.formatted_value || k.formattedValue || (k.raw_value != null ? String(k.raw_value) : '—'),
    change_percentage: Number(k.change_percentage ?? k.changePercentage ?? 0),
    change_type: (k.change_type || k.changeType || 'neutral') as 'positive' | 'negative' | 'neutral',
    comparison_text: k.comparison_text || k.comparisonText || '',
    icon_type: k.icon_type || k.iconType || 'receipt',
    color_theme: k.color_theme || k.colorTheme || 'emerald',
    sort_order: k.sort_order ?? k.sortOrder ?? idx + 1,
  }));

  const rawFinance = Array.isArray(payload.finance_monthly)
    ? payload.finance_monthly
    : Array.isArray(payload.financeMonthly)
    ? payload.financeMonthly
    : [];

  const finance_monthly = rawFinance.map((f: any, idx: number) => ({
    id: f.id ?? idx + 1,
    month_name: f.month_name || f.monthName || '',
    invoice_value: Number(f.invoice_value ?? f.invoiceValue ?? 0),
    collected_payments: Number(f.collected_payments ?? f.collectedPayments ?? 0),
    outstanding_receivables: Number(f.outstanding_receivables ?? f.outstandingReceivables ?? 0),
    expenses: Number(f.expenses ?? 0),
    sort_order: f.sort_order ?? f.sortOrder ?? idx + 1,
  }));

  const rawExpense = Array.isArray(payload.expense_breakdown)
    ? payload.expense_breakdown
    : Array.isArray(payload.expenseBreakdown)
    ? payload.expenseBreakdown
    : [];

  const expense_breakdown = rawExpense.map((e: any, idx: number) => ({
    id: e.id ?? idx + 1,
    category_name: e.category_name || e.categoryName || '',
    amount: Number(e.amount ?? 0),
    percentage: Number(e.percentage ?? 0),
    color_hex: e.color_hex || e.colorHex || '#6366F1',
    sort_order: e.sort_order ?? e.sortOrder ?? idx + 1,
  }));

  const rawPipeline = Array.isArray(payload.sales_pipeline)
    ? payload.sales_pipeline
    : Array.isArray(payload.salesPipeline)
    ? payload.salesPipeline
    : [];

  const sales_pipeline = rawPipeline.map((s: any, idx: number) => ({
    id: s.id ?? idx + 1,
    stage_name: s.stage_name || s.stageName || '',
    lead_count: Number(s.lead_count ?? s.leadCount ?? s.deals_count ?? s.dealsCount ?? 0),
    conversion_rate: Number(s.conversion_rate ?? s.conversionRate ?? 0),
    color_hex: s.color_hex || s.colorHex || '#1d4ed8',
    sort_order: s.sort_order ?? s.sortOrder ?? idx + 1,
  }));

  const rawStatus = Array.isArray(payload.project_status)
    ? payload.project_status
    : Array.isArray(payload.projectStatus)
    ? payload.projectStatus
    : [];

  const project_status = rawStatus.map((p: any, idx: number) => ({
    id: p.id ?? idx + 1,
    status_name: p.status_name || p.statusName || '',
    project_count: Number(p.project_count ?? p.projectCount ?? p.count ?? 0),
    percentage: Number(p.percentage ?? 0),
    color_hex: p.color_hex || p.colorHex || '#10B981',
    sort_order: p.sort_order ?? p.sortOrder ?? idx + 1,
  }));

  const rawPeople = Array.isArray(payload.people_monthly)
    ? payload.people_monthly
    : Array.isArray(payload.peopleMonthly)
    ? payload.peopleMonthly
    : [];

  const people_monthly = rawPeople.map((pm: any, idx: number) => ({
    id: pm.id ?? idx + 1,
    month_name: pm.month_name || pm.monthName || '',
    employee_count: Number(pm.employee_count ?? pm.employeeCount ?? pm.headcount ?? 0),
    net_payroll: Number(pm.net_payroll ?? pm.netPayroll ?? 0),
    employer_payroll_cost: Number(pm.employer_payroll_cost ?? pm.employerPayrollCost ?? 0),
    sort_order: pm.sort_order ?? pm.sortOrder ?? idx + 1,
  }));

  const rawPeopleSummary = payload.people_summary || payload.peopleSummary || {};
  const people_summary = {
    id: Number(rawPeopleSummary.id ?? 0),
    active_employees: Number(rawPeopleSummary.active_employees ?? rawPeopleSummary.activeEmployees ?? 0),
    new_joiners_ytd: Number(rawPeopleSummary.new_joiners_ytd ?? rawPeopleSummary.newJoinersYtd ?? 0),
    exits_ytd: Number(rawPeopleSummary.exits_ytd ?? rawPeopleSummary.exitsYtd ?? 0),
    net_growth: Number(rawPeopleSummary.net_growth ?? rawPeopleSummary.netGrowth ?? 0),
  };

  const rawAlerts = Array.isArray(payload.alerts) ? payload.alerts : [];
  const alerts = rawAlerts.map((a: any, idx: number) => ({
    id: a.id ?? idx + 1,
    alert_key: a.alert_key || a.alertKey || `alert_${idx}`,
    title: a.title || '',
    alert_count: Number(a.alert_count ?? a.alertCount ?? 0),
    icon_type: a.icon_type || a.iconType || 'info',
    icon_color: a.icon_color || a.iconColor || '#3B82F6',
    sort_order: a.sort_order ?? a.sortOrder ?? idx + 1,
  }));

  return {
    settings,
    kpis,
    finance_monthly,
    expense_breakdown,
    sales_pipeline,
    project_status,
    people_monthly,
    people_summary,
    alerts,
  };
}

export const dashboardService = {
  // Fetch dashboard data directly from the API; no fallbacks, errors propagate
  async getDashboardData(): Promise<FullDashboardData> {
    const response = await apiClient.get<any>('/dashboard/ceo');
    return normalizeDashboardData(response.data || response);
  },

  // Save/Update full dashboard data directly via API
  async saveDashboardData(data: FullDashboardData): Promise<void> {
    await apiClient.put('/dashboard/ceo', data);
    triggerNotificationRefresh();
  },

  async updateDashboardData(data: FullDashboardData): Promise<void> {
    await this.saveDashboardData(data);
  },

  // Update specific alert count via API
  async updateAlertCount(alertId: number, delta: number): Promise<FullDashboardData> {
    const response = await apiClient.put<any>(`/dashboard/ceo/alerts/${alertId}?delta=${delta}`);
    triggerNotificationRefresh();
    return normalizeDashboardData(response.data || response);
  },

  // Fetch sidebar live counts
  async getSidebarCounts(): Promise<{ pendingApprovals: number; overdueFollowUps: number }> {
    const response = await apiClient.get<any>('/dashboard/sidebar/counts');
    const data = response.data || response;
    return {
      pendingApprovals: Number(data.pendingApprovals ?? 0),
      overdueFollowUps: Number(data.overdueFollowUps ?? 0),
    };
  }
};
