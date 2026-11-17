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
import { CeoDashboardSkeleton } from '../components/CeoDashboardSkeleton';

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
    <div className="p-6 flex flex-col gap-6 max-w-[1600px] mx-auto w-full select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page Title Row: Crown icon, "CEO Dashboard", and subtitle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#F59E0B] border border-[#FDE68A]/60 flex items-center justify-center shrink-0">
            <Crown size={20} />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[20px] font-bold text-[#0F172A] tracking-[-0.5px] leading-7">
              {data?.settings?.dashboard_title || 'CEO Dashboard'}
            </h1>
            <p className="text-[12px] font-normal text-[#64748B] leading-4">
              {data?.settings?.dashboard_subtitle ||
                'Executive view of business performance across Finance, Sales, Delivery, People and Risk.'}
            </p>
          </div>
        </div>

        {/* Right Action: Refresh */}
        <div className="flex items-center gap-2">
          <ReloadButton
            onClick={handleManualRefresh}
            isRefreshing={isRefreshing}
            disabled={isLoading || isRefreshing}
            title="Refresh dashboard data"
          />
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
        <CeoDashboardSkeleton />
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
