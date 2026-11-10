import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CashFlowTab, CashFlowRecord, CashFlowKpis, CashFlowTrendsData } from '../types';
import { CashFlowHeader } from '../components/CashFlowHeader';
import { CashFlowTabs } from '../components/CashFlowTabs';
import { CashFlowKpiCards } from '../components/CashFlowKpiCards';
import { CashFlowFilterBar } from '../components/CashFlowFilterBar';
import { CashFlowTable } from '../components/CashFlowTable';
import { CashFlowPagination } from '../components/CashFlowPagination';
import { AddCashFlowModal } from '../components/AddCashFlowModal';
import { EditCashFlowModal } from '../components/EditCashFlowModal';
import { CashFlowDetailsModal } from '../components/CashFlowDetailsModal';
import { cashFlowApiService } from '../services/cashFlowApiService';

// Trends & Analysis Components
import { TrendsKpiCards } from '../components/trends/TrendsKpiCards';
import { CashFlowTrendChart } from '../components/trends/CashFlowTrendChart';
import { CashFlowBreakdownDonut } from '../components/trends/CashFlowBreakdownDonut';
import { PeriodCashPositionTable } from '../components/trends/PeriodCashPositionTable';
import { KeyInsightsCard } from '../components/trends/KeyInsightsCard';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { ToastNotification, useToast } from '@/components/ui/ToastNotification';

export const CashFlowPage: React.FC = () => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<CashFlowTab>('cash-flow');

  // Master records state from Backend API
  const [records, setRecords] = useState<CashFlowRecord[]>([]);
  const [kpis, setKpis] = useState<CashFlowKpis | null>(null);
  const [trendsData, setTrendsData] = useState<CashFlowTrendsData | null>(null);

  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  // Filters state
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('All Period');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination state (1-based from backend)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CashFlowRecord | null>(null);

  // Refresh feedback state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  // Format current timestamp
  const updateTimestamp = (dateStr?: string) => {
    if (dateStr) {
      try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          setLastUpdated(`${date}, ${time}`);
          return;
        }
      } catch {
        // fallback
      }
    }
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setLastUpdated(`${date}, ${time}`);
  };

  // Fetch paginated Cash Flows and KPIs from backend
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setError(null);

    try {
      const [tableRes, kpisRes] = await Promise.all([
        cashFlowApiService.getCashFlows({
          search: search.trim() || undefined,
          period: periodFilter !== 'All Period' ? periodFilter : undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          page: currentPage,
          size: pageSize,
        }),
        cashFlowApiService.getKpis(),
      ]);

      setRecords(tableRes.content || []);
      setTotalPages(Math.max(1, tableRes.totalPages || 1));
      setTotalRecords(tableRes.totalElements || 0);
      setKpis(kpisRes);
      updateTimestamp(kpisRes.lastUpdated);
    } catch (err: any) {
      const msg = err?.message || 'Failed to load cash flow records from server.';
      setError(msg);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [search, periodFilter, statusFilter, currentPage, pageSize]);

  // Fetch Trends & Analysis data
  const loadTrendsData = useCallback(async () => {
    setIsLoadingTrends(true);
    try {
      const data = await cashFlowApiService.getTrends();
      setTrendsData(data);
    } catch (err: any) {
      const msg = err?.message || 'Failed to load trends data.';
      addToast('error', 'Action Failed', msg);
    } finally {
      setIsLoadingTrends(false);
    }
  }, [addToast]);

  // Initial and reactive data fetching
  useEffect(() => {
    if (activeTab === 'cash-flow') {
      loadDashboardData();
    } else if (activeTab === 'trends-analysis') {
      loadTrendsData();
    }
  }, [activeTab, loadDashboardData, loadTrendsData]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (periodFilter !== 'All Period') count++;
    if (statusFilter !== 'All') count++;
    return count;
  }, [search, periodFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearch('');
    setPeriodFilter('All Period');
    setStatusFilter('All');
    setCurrentPage(1);
    addToast('info', 'Information', 'Search and filters cleared.');
  };

  // Export records to backend CSV
  const handleExport = async () => {
    try {
      await cashFlowApiService.exportCashFlows({
        search: search.trim() || undefined,
        period: periodFilter !== 'All Period' ? periodFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      addToast('success', 'Success', 'Cash flow CSV exported successfully.');
    } catch (err: any) {
      addToast('error', 'Action Failed', err?.message || 'Failed to export cash flow CSV.');
    }
  };

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === 'cash-flow') {
        await loadDashboardData(true);
      } else {
        await loadTrendsData();
      }
      addToast('success', 'Success', 'Cash flow data refreshed.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add new cash flow entry
  const handleAddCashFlow = (newRecord: CashFlowRecord) => {
    addToast('success', 'Success', `Cash flow record ${newRecord.cashFlowId} created successfully.`);
    setCurrentPage(1);
    loadDashboardData(true);
  };

  // Edit cash flow entry
  const handleEditRecord = (record: CashFlowRecord) => {
    if (record.status?.toLowerCase() === 'completed') {
      addToast(
        'info',
        'Information',
        `Cash flow record ${record.cashFlowId} is Completed and locked against modifications.`
      );
      return;
    }
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  // Updated record callback
  const handleUpdateSuccess = (updated: CashFlowRecord) => {
    addToast('success', 'Success', `Cash flow record ${updated.cashFlowId} updated successfully.`);
    loadDashboardData(true);
  };

  // Delete cash flow entry (Admin only, locked if Completed)
  const handleDeleteRecord = async (record: CashFlowRecord) => {
    if (record.status?.toLowerCase() === 'completed') {
      addToast(
        'info',
        'Information',
        `Cannot delete cash flow ${record.cashFlowId}: Completed periods are locked.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete Cash Flow record '${record.cashFlowId}' for period ${record.period}?`
    );
    if (!confirmed) return;

    try {
      await cashFlowApiService.deleteCashFlow(record.id);
      addToast('success', 'Success', `Cash flow record ${record.cashFlowId} deleted successfully.`);
      loadDashboardData(true);
    } catch (err: any) {
      let msg = err?.message || 'Failed to delete record.';
      if (err?.status === 403) {
        msg = 'Permission denied: Only administrators (ROLE_ADMIN) can delete cash flow records.';
      }
      addToast('error', 'Action Failed', msg);
    }
  };

  // View Details
  const handleViewDetails = (record: CashFlowRecord) => {
    setSelectedRecord(record);
    setIsDetailsModalOpen(true);
  };

  // Default KPI fallback when loading
  const safeKpis: CashFlowKpis = kpis || {
    openingCash: 0,
    totalInflows: 0,
    totalOutflows: 0,
    closingCash: 0,
  };

  return (
    <div className="min-h-full bg-[#F8FAFC] p-4 sm:p-6 lg:p-7">
      <div className="max-w-[1280px] mx-auto">
        {/* Page Header */}
        <CashFlowHeader
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onAddCashFlow={() => setIsAddModalOpen(true)}
        />

        {/* Tab Navigation */}
        <CashFlowTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab 1: Cash Flow (Main Dashboard) */}
        {activeTab === 'cash-flow' && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            {/* KPI Cards: Dynamic Latest Period Values */}
            <CashFlowKpiCards kpis={safeKpis} />

            {/* Error Banner with Retry */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => loadDashboardData()}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Table Container Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              {/* Search & Filters */}
              <CashFlowFilterBar
                search={search}
                onSearchChange={(v) => {
                  setSearch(v);
                  setCurrentPage(1);
                }}
                periodFilter={periodFilter}
                onPeriodFilterChange={(v) => {
                  setPeriodFilter(v);
                  setCurrentPage(1);
                }}
                statusFilter={statusFilter}
                onStatusFilterChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
                onClearFilters={handleClearFilters}
                activeFilterCount={activeFilterCount}
                onExport={handleExport}
              />

              {/* Data Table */}
              {isLoading && records.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mb-2" />
                  <p className="text-xs font-medium text-slate-500">Loading cash flow records...</p>
                </div>
              ) : (
                <CashFlowTable
                  records={records}
                  onIdClick={handleViewDetails}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEditRecord}
                  onDelete={handleDeleteRecord}
                />
              )}

              {/* Pagination (Backend 1-based) */}
              <CashFlowPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Trends & Analysis */}
        {activeTab === 'trends-analysis' && (
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            {isLoadingTrends && !trendsData ? (
              <div className="py-24 bg-white rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mb-2" />
                <p className="text-xs font-medium text-slate-500">Loading historical trends and analytics...</p>
              </div>
            ) : (
              <>
                {/* Trends KPI Cards: Average Monthly Inflow, Outflow, Net, Closing Cash */}
                <TrendsKpiCards
                  kpis={
                    trendsData?.kpis || {
                      avgMonthlyInflow: 0,
                      avgMonthlyOutflow: 0,
                      netCashFlow: 0,
                      closingCashLatest: 0,
                    }
                  }
                />

                {/* Charts Row: Trend Line/Bar + Outflows Donut */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <CashFlowTrendChart data={trendsData?.monthlyTrends || []} />
                  <CashFlowBreakdownDonut
                    categories={trendsData?.outflowBreakdown?.categories || []}
                    totalAmount={trendsData?.outflowBreakdown?.totalOutflows ?? 5285000}
                  />
                </div>

                {/* Bottom Row: Period-wise Cash Position + Key Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <PeriodCashPositionTable
                    data={trendsData?.periodPositions || []}
                    positions={trendsData?.periodPositions || []}
                  />
                  <KeyInsightsCard
                    insights={
                      trendsData?.keyInsights && trendsData.keyInsights.length > 0
                        ? trendsData.keyInsights
                        : ['No historical cash flow data available yet.']
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Add Modal */}
        <AddCashFlowModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddCashFlow}
          existingCount={totalRecords}
        />

        {/* Edit Modal */}
        <EditCashFlowModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRecord(null);
          }}
          onSubmit={handleUpdateSuccess}
          record={selectedRecord}
        />

        {/* View Details Modal */}
        <CashFlowDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
        />

        {/* Toast Notification Popup (Matching CMS Standard) */}
        <ToastNotification toasts={toasts} onDismiss={removeToast} position="top-right" />
      </div>
    </div>
  );
};

export default CashFlowPage;
