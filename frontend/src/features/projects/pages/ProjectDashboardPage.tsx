import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutDashboard,
  Package,
  RotateCw,
  Calendar,
  Download,
  AlertTriangle,
  Clock,
  TrendingUp,
  Percent,
  FolderKanban,
  Database,
  CheckSquare,
  Flag,
  PieChart as PieChartIcon,
  Table as TableIcon,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  AlertCircle,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { projectService } from '../services/projectService';
import {
  Project,
  UpdateProjectPayload,
  ProjectPerformanceDashboardResponse,
  ProjectProfitabilityRow,
} from '../types/project';
import { TableActionMenu } from '@/components/ui/TableActionMenu';
import { UniversalDonutChart, DonutDataItem } from '@/components/charts/UniversalDonutChart';
import { ViewProjectModal } from '../components/ViewProjectModal';
import { EditProjectModal } from '../components/EditProjectModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

const periodToKey: Record<string, string> = {
  'This Month': 'THIS_MONTH',
  'Last Month': 'LAST_MONTH',
  'This Quarter': 'THIS_QUARTER',
  'This Year': 'THIS_YEAR',
  'All Time': 'ALL_TIME',
};

export const ProjectDashboardPage: React.FC = () => {
  // Summary Data State (Cards, Flow, Donut, Insights)
  const [summaryData, setSummaryData] = useState<ProjectPerformanceDashboardResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('This Month');
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isAnimated, setIsAnimated] = useState<boolean>(false);

  // Profitability Snapshot Table State (Server-Side Paginated, Searched, Filtered)
  const [tableRows, setTableRows] = useState<ProjectProfitabilityRow[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [healthFilter, setHealthFilter] = useState<string>('All');
  const [healthDropdownOpen, setHealthDropdownOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [pageSizeDropdownOpen, setPageSizeDropdownOpen] = useState<boolean>(false);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>('projectCode');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('ASC');

  // Modals & Action States
  const [viewingProject, setViewingProject] = useState<ProjectProfitabilityRow | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [clientOptions, setClientOptions] = useState<string[]>(['CL-001', 'CL-002', 'CL-003']);
  const [managerOptions, setManagerOptions] = useState<string[]>(['Amit Sharma', 'Sneha Nair', 'Rohan Verma']);

  // Mount animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Fetch filter options for edit modal on mount
  useEffect(() => {
    projectService
      .getProjectFilters()
      .then((f) => {
        if (f.clients && f.clients.length > 0) setClientOptions(f.clients);
        if (f.managers && f.managers.length > 0) setManagerOptions(f.managers);
      })
      .catch(() => {});
  }, []);

  // Debounce search query by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 1. Fetch Summary Data (Cards, Flow, Donut, Insights)
  const fetchSummaryData = useCallback(
    async (isManual = false, period = selectedPeriod) => {
      if (isManual) setIsRefreshing(true);
      else setSummaryLoading(true);
      setSummaryError(null);

      try {
        const pKey = periodToKey[period] || 'THIS_MONTH';
        const response =
          pKey === 'THIS_MONTH'
            ? await projectService.getPerformanceSummary()
            : await projectService.getPerformanceDashboard(pKey);
        setSummaryData(response);
        const now = new Date();
        setLastUpdated(
          `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
        );
      } catch (err: any) {
        console.error('Failed to load performance summary', err);
        setSummaryError(err?.message || 'Failed to connect to database for project summary.');
      } finally {
        setSummaryLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedPeriod]
  );

  // 2. Fetch Server-Side Paginated Table Data
  const fetchTableData = useCallback(async () => {
    setTableLoading(true);
    setTableError(null);

    try {
      const response = await projectService.getProfitabilityPage({
        page: currentPage - 1,
        size: pageSize,
        search: debouncedSearch.trim() || undefined,
        health: healthFilter,
        sortBy,
        sortDir,
      });

      setTableRows(response.content || []);
      setTotalElements(response.totalElements);
      setTotalPages(Math.max(1, response.totalPages));
    } catch (err: any) {
      console.error('Failed to load project profitability table', err);
      setTableError(err?.message || 'Failed to load project profitability data.');
    } finally {
      setTableLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, healthFilter, sortBy, sortDir]);

  // Initial load & refresh
  useEffect(() => {
    fetchSummaryData(false, selectedPeriod);
  }, [fetchSummaryData, selectedPeriod]);

  // Table load on query parameter changes
  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleManualRefresh = () => {
    fetchSummaryData(true, selectedPeriod);
    fetchTableData();
  };

  const handleHealthSelect = (h: string) => {
    setHealthFilter(h);
    setHealthDropdownOpen(false);
    setCurrentPage(1);
  };

  const handlePageSizeSelect = (size: number) => {
    setPageSize(size);
    setPageSizeDropdownOpen(false);
    setCurrentPage(1);
  };

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await projectService.exportProfitabilityCsv(debouncedSearch.trim() || undefined, healthFilter);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'project_performance_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Row Action Handlers
  const handleViewDetails = (row: ProjectProfitabilityRow) => {
    setViewingProject(row);
  };

  const handleEditEntry = async (row: ProjectProfitabilityRow) => {
    try {
      const fullProject = await projectService.getProjectById(row.projectId);
      if (fullProject) {
        setEditProject(fullProject);
        return;
      }
    } catch {
      // fallback
    }

    setEditProject({
      id: row.projectId,
      projectCode: row.projectCode,
      projectName: row.projectName,
      clientId: clientOptions[0] || 'CL-001',
      projectManager: managerOptions[0] || 'Amit Sharma',
      startDate: new Date().toISOString().substring(0, 10),
      plannedEndDate: new Date().toISOString().substring(0, 10),
      status: row.status || 'In Progress',
      priority: 'High',
      health: row.health || 'On Track',
      contractValue: row.revenue,
      tasksCompleted: 0,
      tasksTotal: 0,
      progress: 0,
    });
  };

  const handleDeleteEntry = (row: ProjectProfitabilityRow) => {
    setDeleteTarget({
      id: row.projectId,
      name: row.projectName || row.projectCode || row.projectId,
    });
  };

  const handleUpdateProjectSubmit = async (id: string, payload: UpdateProjectPayload) => {
    try {
      await projectService.updateProject(id, payload);
      setEditProject(null);
      setSuccessToast(`Project "${payload.projectName}" updated successfully.`);
      setTimeout(() => setSuccessToast(null), 4000);
      await Promise.all([fetchSummaryData(false, selectedPeriod), fetchTableData()]);
    } catch (err: any) {
      console.error('Failed to update project', err);
      setTableError(err?.message || 'Failed to update project.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await projectService.deleteProject(deleteTarget.id);
      const deletedName = deleteTarget.name;
      setDeleteTarget(null);
      setSuccessToast(`Project "${deletedName}" deleted successfully.`);
      setTimeout(() => setSuccessToast(null), 4000);
      await Promise.all([fetchSummaryData(false, selectedPeriod), fetchTableData()]);
    } catch (err: any) {
      console.error('Failed to delete project', err);
      setTableError(err?.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Safe fallback metrics
  const overview = summaryData?.overview || {
    activeProjects: 0,
    atRiskProjects: 0,
    delayedProjects: 0,
    dueSoonProjects: 0,
  };

  const financials = summaryData?.financials || {
    contractRevenueFormatted: '₹ 0.00',
    totalProjectCostFormatted: '₹ 0.00',
    estimatedProjectProfitFormatted: '₹ 0.00',
    overallProjectMarginFormatted: '0.00%',
  };

  const delivery = summaryData?.delivery || {
    loggedHoursFormatted: '0.00',
    billableAmountFormatted: '₹ 0.00',
    openTasks: 0,
    overdueTasks: 0,
  };

  const deliveryFlow = summaryData?.deliveryFlow || {
    projectsCount: 0,
    milestonesCount: 0,
    tasksCount: 0,
    timesheetsCount: 0,
  };

  const distribution = summaryData?.distribution || {
    totalProjects: 0,
    onTrack: { count: 0, percentage: 0, formatted: '0 (0.0%)' },
    atRisk: { count: 0, percentage: 0, formatted: '0 (0.0%)' },
    delayed: { count: 0, percentage: 0, formatted: '0 (0.0%)' },
    upcoming: { count: 0, percentage: 0, formatted: '0 (0.0%)' },
  };

  const keyInsights = summaryData?.keyInsights || {
    bulletPoints: [
      '0% of projects are currently at risk.',
      '0% of projects are delayed.',
      '0 projects are due for delivery within the next 7 days.',
    ],
  };

  // Universal Donut Chart Data
  const donutChartData: DonutDataItem[] = useMemo(() => [
    {
      id: 'onTrack',
      label: 'On Track',
      value: distribution.onTrack.count,
      percentage: Math.round(distribution.onTrack.percentage),
      color: '#10B981',
      formatted: distribution.onTrack.formatted,
    },
    {
      id: 'atRisk',
      label: 'At Risk',
      value: distribution.atRisk.count,
      percentage: Math.round(distribution.atRisk.percentage),
      color: '#F59E0B',
      formatted: distribution.atRisk.formatted,
    },
    {
      id: 'delayed',
      label: 'Delayed',
      value: distribution.delayed.count,
      percentage: Math.round(distribution.delayed.percentage),
      color: '#EF4444',
      formatted: distribution.delayed.formatted,
    },
    {
      id: 'upcoming',
      label: 'Upcoming (≤ 7d)',
      value: distribution.upcoming.count,
      percentage: Math.round(distribution.upcoming.percentage),
      color: '#6366F1',
      formatted: distribution.upcoming.formatted,
    },
  ], [distribution]);

  const startIndex = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  const renderHealthCell = (health: string) => {
    if (!health || health === '—') {
      return <span className="text-slate-400 font-medium">—</span>;
    }
    const lower = health.toLowerCase();
    if (lower.includes('track') || lower.includes('health')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {health}
        </span>
      );
    }
    if (lower.includes('risk')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {health}
        </span>
      );
    }
    if (lower.includes('delay') || lower.includes('crit')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {health}
        </span>
      );
    }
    if (lower.includes('upcom')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          {health}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        {health}
      </span>
    );
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-[#F8FAFC] p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Icon, Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] shadow-sm shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight m-0">
              Project Performance & Delivery
            </h1>
            <p className="text-xs text-[#64748B] m-0 mt-0.5">
              Monitor project progress, delivery risks, task execution, and overall project profitability.
            </p>
          </div>
        </div>

        {/* Right: Refresh & Export Report Buttons */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || summaryLoading || tableLoading}
            title="Refresh Data"
            className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Export Report Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="box-border flex items-center h-[34px] px-[14px] bg-white border border-[#CBD5E1] rounded-[8px] hover:bg-slate-50 transition-colors shadow-sm gap-[6px] disabled:opacity-50 cursor-pointer"
          >
            <Download className={`w-[14px] h-[14px] text-[#4F46E5] stroke-[2] ${isExporting ? 'animate-bounce' : ''}`} />
            <span className="font-['Inter'] font-semibold text-[12px] leading-[16px] text-[#334155]">
              {isExporting ? 'Exporting...' : 'Export Report'}
            </span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-900 ml-3 font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary Error Alert */}
      {summaryError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{summaryError}</span>
          </div>
          <button
            onClick={() => fetchSummaryData()}
            className="font-semibold underline hover:text-red-900 ml-3 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Section 1: Project Performance Overview */}
      <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-[0px_1px_3px_rgba(0,0,0,0.03)] p-4 flex flex-col gap-3.5">
        {/* Section Header */}
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-[13px] font-bold text-[#0F172A] tracking-[-0.325px] leading-5">
            Project Performance Overview
          </h2>
        </div>

        {/* 4 Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
          {/* Card 1: Active Projects */}
          <div className="group h-[75.5px] bg-[#F8FAFD] border border-[#F1F5F9] rounded-xl px-3 py-2 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF]/80 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <FolderKanban className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-medium text-[#64748B] leading-[14px]">
                Active Projects
              </span>
              <span className="text-[18px] font-bold text-[#0F172A] leading-[18px] mt-1">
                {overview.activeProjects}
              </span>
            </div>
          </div>

          {/* Card 2: At Risk Projects */}
          <div className="group h-[75.5px] bg-[#F8FAFD] border border-[#F1F5F9] rounded-xl px-3 py-2 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-medium text-[#64748B] leading-[14px]">
                At Risk Projects
              </span>
              <span className="text-[18px] font-bold text-[#0F172A] leading-[18px] mt-1">
                {overview.atRiskProjects}
              </span>
            </div>
          </div>

          {/* Card 3: Delayed Projects */}
          <div className="group h-[75.5px] bg-[#F8FAFD] border border-[#F1F5F9] rounded-xl px-3 py-2 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-5 h-5 text-[#EF4444]" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-medium text-[#64748B] leading-[14px]">
                Delayed Projects
              </span>
              <span className="text-[18px] font-bold text-[#0F172A] leading-[18px] mt-1">
                {overview.delayedProjects}
              </span>
            </div>
          </div>

          {/* Card 4: Projects Due <= 7 Days */}
          <div className="group h-[75.5px] bg-[#F8FAFD] border border-[#F1F5F9] rounded-xl px-3 py-2 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-medium text-[#64748B] leading-[14px]">
                Projects Due ≤ 7 Days
              </span>
              <span className="text-[18px] font-bold text-[#0F172A] leading-[18px] mt-1">
                {overview.dueSoonProjects}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Financial Overview */}
      <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-[0px_1px_3px_rgba(0,0,0,0.03)] p-4 flex flex-col gap-3.5">
        {/* Section Header */}
        <div className="flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-[13px] font-bold text-[#0F172A] tracking-[-0.325px] leading-5">
            Financial Overview
          </h2>
          <span className="text-[10px] text-slate-400 font-normal ml-2">
            (Scope: {selectedPeriod})
          </span>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
          {/* Card 1: Contract / Revenue Value */}
          <div className="group h-[75.5px] bg-[#F8FAFD] border border-[#F1F5F9] rounded-xl px-3 py-2 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <IndianRupee className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-medium text-[#64748B] leading-[14px]">
                Contract / Revenue Value
              </span>
              <span className="text-[18px] font-bold text-[#0F172A] leading-[18px] mt-1">
                {financials.contractRevenueFormatted}
              </span>
            </div>
          </div>

          {/* Card 2: Total Project Cost (Billable Cost) */}
          <div className="group h-[75.5px] bg-[#F8FAFD] border border-[#F1F5F9] rounded-xl px-3 py-2 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Database className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-medium text-[#64748B] leading-[14px]" title="Billable Cost: Logged Hours × Billable Rate">
                Total Project Cost
              </span>
              <span className="text-[18px] font-bold text-[#0F172A] leading-[18px] mt-1">
                {financials.totalProjectCostFormatted}
              </span>
            </div>
          </div>

          {/* Card 3: Estimated Project Profit */}
          <div className="group h-[75.5px] bg-[#F8FAFD] border border-[#F1F5F9] rounded-xl px-3 py-2 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-medium text-[#64748B] leading-[14px]">
                Estimated Project Profit
              </span>
              <span className="text-[18px] font-bold text-[#0F172A] leading-[18px] mt-1">
                {financials.estimatedProjectProfitFormatted}
              </span>
            </div>
          </div>

          {/* Card 4: Overall Project Margin */}
          <div className="group h-[75.5px] bg-[#F8FAFD] border border-[#F1F5F9] rounded-xl px-3 py-2 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Percent className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-medium text-[#64748B] leading-[14px]">
                Overall Project Margin
              </span>
              <span className="text-[18px] font-bold text-[#0F172A] leading-[18px] mt-1">
                {financials.overallProjectMarginFormatted}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Delivery & Task Performance & Delivery Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Delivery & Task Performance */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-semibold text-slate-900">Delivery & Task Performance</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Logged Hours */}
            <div className="group bg-[#F8FAFD] border border-[#F1F5F9] rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer">
              <Clock className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[11px] text-slate-500 font-medium">Logged Hours</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">{delivery.loggedHoursFormatted}</span>
            </div>

            {/* Billable Amount */}
            <div className="group bg-[#F8FAFD] border border-[#F1F5F9] rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer">
              <IndianRupee className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[11px] text-slate-500 font-medium">Billable Amount</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">{delivery.billableAmountFormatted}</span>
            </div>

            {/* Open Tasks */}
            <div className="group bg-[#F8FAFD] border border-[#F1F5F9] rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer">
              <CheckSquare className="w-4 h-4 text-indigo-600 mb-1 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[11px] text-slate-500 font-medium">Open Tasks</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">{delivery.openTasks}</span>
            </div>

            {/* Overdue Tasks */}
            <div className="group bg-[#F8FAFD] border border-[#F1F5F9] rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer">
              <AlertTriangle className="w-4 h-4 text-red-500 mb-1 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[11px] text-slate-500 font-medium">Overdue Tasks</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">{delivery.overdueTasks}</span>
            </div>
          </div>
        </div>

        {/* Delivery Flow */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-semibold text-slate-900">Delivery Flow</h2>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Projects */}
            <div className="group bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg p-3 flex-1 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer">
              <FolderKanban className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[11px] text-slate-700 font-medium">Projects</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">{deliveryFlow.projectsCount}</span>
            </div>

            <span className="text-indigo-400 font-bold text-sm">→</span>

            {/* Milestones */}
            <div className="group bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg p-3 flex-1 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer">
              <Flag className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[11px] text-slate-700 font-medium">Milestones</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">{deliveryFlow.milestonesCount}</span>
            </div>

            <span className="text-indigo-400 font-bold text-sm">→</span>

            {/* Tasks */}
            <div className="group bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg p-3 flex-1 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer">
              <CheckSquare className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[11px] text-slate-700 font-medium">Tasks</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">{deliveryFlow.tasksCount}</span>
            </div>

            <span className="text-indigo-400 font-bold text-sm">→</span>

            {/* Timesheets */}
            <div className="group bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg p-3 flex-1 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer">
              <Clock className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[11px] text-slate-700 font-medium">Timesheets</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">{deliveryFlow.timesheetsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Project at a Glance & Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project at a Glance */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="text-xs font-semibold text-slate-900">Project at a Glance</span>
              <span className="text-[11px] text-slate-400 font-normal ml-2">Overall project distribution and health.</span>
            </div>
          </div>

          <div className="flex items-center justify-center py-2 w-full">
            <UniversalDonutChart
              data={donutChartData}
              centerPrimaryText={distribution.totalProjects}
              centerSecondaryText="Total Projects"
              size={145}
              showLegend={true}
              interactiveCenterHover={true}
            />
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#FFFFFF] rounded-xl border border-[#C7D2FE] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#E0E7FF] flex items-center justify-center text-[#6366F1]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900">Key Insights</span>
            </div>

            <ul className="space-y-3">
              {keyInsights.bulletPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-1.5 shrink-0"></span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Section 5: Project Profitability Snapshot (Server-Side Paginated Table) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <TableIcon className="w-4 h-4 text-indigo-600" />
            <span>Project Profitability Snapshot</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Project ID or Project Name"
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 placeholder:text-slate-400"
              />
            </div>

            {/* Health Filter Dropdown (Strictly NO "(0)") */}
            <div className="relative">
              <button
                onClick={() => setHealthDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 bg-white cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filters: {healthFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {healthDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                  {['All', 'On Track', 'At Risk', 'Delayed', 'Upcoming'].map((h) => (
                    <button
                      key={h}
                      onClick={() => handleHealthSelect(h)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer ${
                        healthFilter === h ? 'font-semibold text-indigo-600 bg-indigo-50' : 'text-slate-700'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Error Alert */}
        {tableError && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-xs text-red-700 flex items-center justify-between">
            <span>{tableError}</span>
            <button
              onClick={() => fetchTableData()}
              className="font-semibold underline hover:text-red-900 ml-2 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-600 font-semibold">
                <th className="py-3 px-4 w-12 text-center">S.No</th>
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Revenue</th>
                <th className="py-3 px-4" title="Billable Cost: Hours × Billable Rate">Total Cost</th>
                <th className="py-3 px-4">Profit</th>
                <th className="py-3 px-4">Margin</th>
                <th className="py-3 px-4 text-center">Health</th>
                <th className="py-3 px-4 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading project profitability data from database...
                  </td>
                </tr>
              ) : tableRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No matching project records found in database.
                  </td>
                </tr>
              ) : (
                tableRows.map((row, idx) => (
                  <tr
                    key={row.projectId || row.projectCode || idx}
                    className="hover:bg-slate-50/80 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 text-center font-medium text-slate-500">
                      {row.sNo ?? (row as any).sno ?? ((currentPage - 1) * pageSize + idx + 1)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.projectCode || row.projectId}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{row.projectName || '—'}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{row.revenueFormatted}</td>
                    <td className="py-3 px-4 font-medium text-slate-600">{row.totalCostFormatted}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{row.profitFormatted}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{row.marginFormatted}</td>
                    <td className="py-3 px-4 text-center">{renderHealthCell(row.health)}</td>
                    <td className="py-3 px-4 text-center">
                      <TableActionMenu
                        onViewDetails={() => handleViewDetails(row)}
                        onEdit={() => handleEditEntry(row)}
                        onDelete={() => handleDeleteEntry(row)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            Showing {startIndex} – {endIndex} of {totalElements} records
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || tableLoading}
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      disabled={tableLoading}
                      className={`min-w-[28px] h-7 px-2 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                        currentPage === p
                          ? 'bg-[#4338CA] text-white'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === currentPage - 2 || p === currentPage + 2) {
                  return (
                    <span key={p} className="text-slate-400 px-1">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || tableLoading}
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Page Size Selector */}
            <div className="relative">
              <button
                onClick={() => setPageSizeDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                <span>{pageSize} per page</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {pageSizeDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-1 w-28 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 text-xs">
                  {[5, 10, 20, 50].map((size) => (
                    <button
                      key={size}
                      onClick={() => handlePageSizeSelect(size)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer ${
                        pageSize === size ? 'font-semibold text-indigo-600 bg-indigo-50' : 'text-slate-700'
                      }`}
                    >
                      {size} per page
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Project Details Modal */}
      <ViewProjectModal
        isOpen={Boolean(viewingProject)}
        project={viewingProject}
        onClose={() => setViewingProject(null)}
        onEdit={(row) => {
          setViewingProject(null);
          handleEditEntry(row);
        }}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={Boolean(editProject)}
        project={editProject}
        onClose={() => setEditProject(null)}
        onSubmit={handleUpdateProjectSubmit}
        clientOptions={clientOptions}
        managerOptions={managerOptions}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Project"
        itemName={deleteTarget?.name || ''}
        warningText="Deleting this project will permanently remove its records and delivery metrics from the system."
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
