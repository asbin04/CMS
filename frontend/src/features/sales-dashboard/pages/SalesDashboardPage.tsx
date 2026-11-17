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
import { salesDashboardService, clearSalesDashboardMemoryCache } from '../services/salesDashboardService';
import { exportSalesDashboardCsv } from '../utils/exportCsv';
import { SalesDashboardData } from '../types';
import { apiClient } from '../../../services/api/apiClient';
import { NOTIFICATION_REFRESH_EVENT } from '../../../services/notificationService';

export const SalesDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const outletContext = useOutletContext<AppLayoutContextType | undefined>();

  // Determine active period; compute current dynamic fiscal year if no explicit range is selected
  const currentYear = new Date().getFullYear();
  const defaultFiscalYear = `Apr ${currentYear} - Mar ${currentYear + 1}`;
  const activeDateRange = outletContext?.dateRange && outletContext.dateRange !== '—'
    ? outletContext.dateRange
    : defaultFiscalYear;

  const { toasts, addToast, removeToast } = useToast();

  const [data, setData] = useState<SalesDashboardData | null>(() => {
    return salesDashboardService.getCachedDashboard(activeDateRange);
  });
  const dataRef = useRef<SalesDashboardData | null>(null);
  dataRef.current = data;

  const [isLoading, setIsLoading] = useState<boolean>(() => !data);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Monotonic request sequence tracker to prevent stale responses overwriting newer data
  const requestIdRef = useRef<number>(0);

  // Load sales dashboard data based on active period
  const loadData = useCallback(async (period: string, isManualRefresh = false, skipCache = false) => {
    const currentReqId = ++requestIdRef.current;
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else if (!dataRef.current) {
      const cached = salesDashboardService.getCachedDashboard(period);
      if (cached && !skipCache) {
        setData(cached);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    }
    setErrorMessage(null);

    try {
      const result = await salesDashboardService.getDashboardData(period, { skipCache });
      // Ignore response if a newer request has already been initiated
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
    loadData(activeDateRange, false, false);
  }, [activeDateRange, loadData]);

  // Reactively listen to sales mutation events across the app to reload fresh data
  useEffect(() => {
    const handleSalesUpdate = () => {
      apiClient.clearCache();
      clearSalesDashboardMemoryCache();
      loadData(activeDateRange, false, true);
    };

    window.addEventListener(NOTIFICATION_REFRESH_EVENT, handleSalesUpdate);
    window.addEventListener('cms_sales_data_changed', handleSalesUpdate);

    return () => {
      window.removeEventListener(NOTIFICATION_REFRESH_EVENT, handleSalesUpdate);
      window.removeEventListener('cms_sales_data_changed', handleSalesUpdate);
    };
  }, [activeDateRange, loadData]);

  // Manual refresh with cache clearance and visual spinning indicator
  const handleRefresh = () => {
    if (isRefreshing || isLoading) return;
    apiClient.clearCache();
    clearSalesDashboardMemoryCache();
    loadData(activeDateRange, true, true);
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
