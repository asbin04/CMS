import React, { useState, useEffect, useCallback } from 'react';
import { Crown } from 'lucide-react';
import { ReloadButton } from '../../../components/ui/ReloadButton';
import { FullDashboardData } from '../../../types/dashboard';
import { dashboardService } from '../../../services/dashboardService';
import { apiClient } from '../../../services/api/apiClient';
import { KpiCardsGrid } from '../../../components/dashboard/KpiCardsGrid';
import { FinanceOverviewSection } from '../../../components/dashboard/FinanceOverviewSection';
import { SalesDeliverySection } from '../../../components/dashboard/SalesDeliverySection';
import { PeopleOverviewSection } from '../../../components/dashboard/PeopleOverviewSection';
import { ManagementAlertsSection } from '../../../components/dashboard/ManagementAlertsSection';
import { EditDataModal } from '../../../components/dashboard/EditDataModal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';

interface CeoDashboardPageProps {
  dateRange: string;
  isEditModalOpen: boolean;
  onCloseEditModal: () => void;
}

export const CeoDashboardPage: React.FC<CeoDashboardPageProps> = ({
  isEditModalOpen,
  onCloseEditModal
}) => {
  const [data, setData] = useState<FullDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('—');

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const fetched = await dashboardService.getDashboardData();
      setData(fetched);
      const now = new Date();
      setLastRefreshed(
        `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend server';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleManualRefresh = () => {
    apiClient.clearCache();
    loadData(true);
  };

  const handleSaveData = async (updated: FullDashboardData) => {
    const previous = data;
    setData(updated);
    try {
      await dashboardService.saveDashboardData(updated);
    } catch (err: unknown) {
      setData(previous);
      throw err;
    }
  };

  const handleUpdateAlertCount = async (alertId: number, delta: number) => {
    try {
      const updated = await dashboardService.updateAlertCount(alertId, delta);
      setData(updated);
    } catch {
      // Re-fetch to sync
      loadData(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-5 max-w-[1400px] mx-auto w-full">
      {/* Page Title Row: Crown icon, "CEO Dashboard", and subtitle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
            <Crown size={20} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {data?.settings?.dashboard_title || 'Admin Dashboard'}
            </h1>
            <p className="text-xs text-slate-500">
              {data?.settings?.dashboard_subtitle ||
                'Executive view of business performance across Finance, Sales, Delivery, People and Risk.'}
            </p>
          </div>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ReloadButton
            onClick={handleManualRefresh}
            isRefreshing={isRefreshing}
            disabled={isLoading || isRefreshing}
            className="p-1.5 rounded-md hover:bg-slate-200/60 text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RotateCw size={14} className={`text-[#64748B] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Visible Error Banner on failure */}
      {errorMessage && (
        <ErrorBanner
          title="Failed to load Admin Dashboard data"
          message={errorMessage}
          onRetry={() => loadData(false)}
          isRetrying={isLoading}
        />
      )}

      {/* Skeletons while loading initial data */}
      {isLoading && !data ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} variant="card" height={96} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton variant="card" height={280} />
            <Skeleton variant="card" height={280} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton variant="card" height={260} />
            <Skeleton variant="card" height={260} />
          </div>
          <Skeleton variant="card" height={320} />
        </div>
      ) : data ? (
        <>
          {/* A. KPI Cards (Two rows of 5 on desktop, responsive to 2 -> 1) */}
          <KpiCardsGrid cards={data.kpis} />

          {/* B. Finance Overview Section (4 panels) */}
          <FinanceOverviewSection
            monthlyData={data.finance_monthly}
            expenseBreakdown={data.expense_breakdown}
          />

          {/* C. Sales & Delivery Overview Section (2 panels) */}
          <SalesDeliverySection
            pipelineStages={data.sales_pipeline}
            projectStatuses={data.project_status}
          />

          {/* D. People Overview Section (3 panels) */}
          <PeopleOverviewSection
            monthlyData={data.people_monthly}
            summary={data.people_summary}
          />

          {/* E. Management Alerts Section (10 rows table) */}
          <ManagementAlertsSection
            alerts={data.alerts}
            onUpdateAlertCount={handleUpdateAlertCount}
          />

          {/* Interactive Edit Modal */}
          <EditDataModal
            isOpen={isEditModalOpen}
            onClose={onCloseEditModal}
            dashboardData={data}
            onSaveData={handleSaveData}
          />
        </>
      ) : null}
    </div>
  );
};
