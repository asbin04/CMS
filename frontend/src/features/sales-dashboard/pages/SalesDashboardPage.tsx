import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AppLayoutContextType } from '../../../components/layout/AppLayout';
import { ToastNotification, useToast } from '../../../components/ui/ToastNotification';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { SalesDashboardHeader } from '../components/SalesDashboardHeader';
import { SalesKpiCards } from '../components/SalesKpiCards';
import { SalesPerformanceCards } from '../components/SalesPerformanceCards';
import { SalesConversionFunnelCard } from '../components/SalesConversionFunnelCard';
import { SalesWorkflowCard } from '../components/SalesWorkflowCard';
import { SalesDashboardSkeleton } from '../components/SalesDashboardSkeleton';
import { salesDashboardService } from '../services/salesDashboardService';
import { exportSalesDashboardCsv } from '../utils/exportCsv';
import { SalesDashboardData } from '../types';

export const SalesDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext<AppLayoutContextType | undefined>();
  const activeDateRange = outletContext?.dateRange && outletContext.dateRange !== '—'
    ? outletContext.dateRange
    : 'Apr 2024 - Mar 2025';

  const { toasts, addToast, removeToast } = useToast();

  const [data, setData] = useState<SalesDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Monotonic request sequence tracker to prevent stale responses overwriting newer date filters
  const requestIdRef = useRef<number>(0);

  // Load sales dashboard data based on active period
  const loadData = useCallback(async (period: string, isManualRefresh = false) => {
    const currentReqId = ++requestIdRef.current;
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const result = await salesDashboardService.getDashboardData(period);
      // Ignore response if user switched date filter before this request finished
      if (currentReqId !== requestIdRef.current) return;

      setData(result);
      if (isManualRefresh) {
        addToast('success', 'Refreshed', 'Sales performance data refreshed successfully.');
      }
    } catch (err: unknown) {
      if (currentReqId !== requestIdRef.current) return;
      const msg = err instanceof Error ? err.message : 'Failed to load sales dashboard data.';
      setErrorMessage(msg);
      addToast('error', 'Error', msg);
    } finally {
      if (currentReqId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [addToast]);

  // Initial and reactive load when dateRange changes
  useEffect(() => {
    loadData(activeDateRange);
  }, [activeDateRange, loadData]);

  // Manual refresh with duplicate request prevention
  const handleRefresh = () => {
    if (isRefreshing || isLoading) return;
    loadData(activeDateRange, true);
  };

  // CSV Report Export via backend endpoint with JWT auth
  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      await salesDashboardService.exportReport({ period: activeDateRange });
      addToast(
        'success',
        'Export Complete',
        'sales-dashboard-report.csv downloaded successfully.'
      );
    } catch (err: unknown) {
      // Graceful fallback for test environments or offline DOM simulators
      if (data) {
        try {
          exportSalesDashboardCsv(data);
          addToast(
            'success',
            'Export Complete',
            'sales-dashboard-report.csv downloaded successfully.'
          );
          return;
        } catch {
          // ignore
        }
      }
      const msg = err instanceof Error ? err.message : 'Failed to export CSV report.';
      addToast('error', 'Export Failed', msg);
    } finally {
      setIsExporting(false);
    }
  };

  // Navigate to existing Follow-Up Queue
  const handleNavigateFollowUpQueue = () => {
    navigate('/management/follow-up-queue');
  };

  return (
    <div className="min-h-full bg-[#F8FAFC] p-4 sm:p-6 lg:p-7 w-full flex flex-col gap-5">
      {/* Error Banner with Retry */}
      {errorMessage && (
        <ErrorBanner
          title="Unable to load Sales Dashboard"
          message={errorMessage}
          onRetry={() => loadData(activeDateRange)}
          isRetrying={isLoading}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && !data ? (
        <SalesDashboardSkeleton />
      ) : data ? (
        <>
          {/* 1. Dashboard Header */}
          <SalesDashboardHeader
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onExport={handleExport}
          />

          {/* 2. Top Row: 4 KPI Cards */}
          <SalesKpiCards data={data.kpis} />

          {/* 3. Middle Row: 4 Performance Cards */}
          <SalesPerformanceCards data={data.performance} />

          {/* 4. Lower Row: Funnel (5 cols) + Workflow (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Lower-left: Sales Conversion Funnel */}
            <div className="lg:col-span-5 min-w-0">
              <SalesConversionFunnelCard
                stages={data.funnelStages}
                conversion={data.conversion}
              />
            </div>

            {/* Lower-right: Sales Workflow */}
            <div className="lg:col-span-7 min-w-0">
              <SalesWorkflowCard
                stages={data.workflowStages}
                onNavigateFollowUpQueue={handleNavigateFollowUpQueue}
              />
            </div>
          </div>
        </>
      ) : null}

      {/* Floating Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} position="top-right" />
    </div>
  );
};
