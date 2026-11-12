import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastNotification, useToast } from '../../../../components/ui/ToastNotification';
import { SalesDashboardHeader } from '../components/SalesDashboardHeader';
import { SalesKpiCards } from '../components/SalesKpiCards';
import { SalesPerformanceCards } from '../components/SalesPerformanceCards';
import { SalesConversionFunnelCard } from '../components/SalesConversionFunnelCard';
import { SalesWorkflowCard } from '../components/SalesWorkflowCard';
import {
  MOCK_SALES_KPIS,
  MOCK_PERFORMANCE_DATA,
  MOCK_FUNNEL_STAGES,
  MOCK_CONVERSION_OVERVIEW,
  MOCK_WORKFLOW_STAGES,
} from '../mockData';

export const SalesDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual refresh interaction with visual feedback
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('success', 'Refreshed', 'Sales performance data refreshed successfully.');
    }, 600);
  };

  // Export report interaction placeholder
  const handleExport = () => {
    addToast(
      'info',
      'Information',
      'Sales dashboard report export will be available in the next phase.'
    );
  };

  // Navigate to existing Follow-Up Queue
  const handleNavigateFollowUpQueue = () => {
    navigate('/management/follow-up-queue');
  };

  return (
    <div className="min-h-full bg-[#F8FAFC] p-4 sm:p-6 lg:p-7 w-full flex flex-col gap-5">
      {/* 1. Dashboard Header */}
      <SalesDashboardHeader
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* 2. Top Row: 4 KPI Cards */}
      <SalesKpiCards data={MOCK_SALES_KPIS} />

      {/* 3. Middle Row: 4 Performance Cards */}
      <SalesPerformanceCards data={MOCK_PERFORMANCE_DATA} />

      {/* 4. Lower Row: Sales Conversion Funnel (5 cols) + Sales Workflow (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Lower-left: Sales Conversion Funnel */}
        <div className="lg:col-span-5 min-w-0">
          <SalesConversionFunnelCard
            stages={MOCK_FUNNEL_STAGES}
            conversion={MOCK_CONVERSION_OVERVIEW}
          />
        </div>

        {/* Lower-right: Sales Workflow */}
        <div className="lg:col-span-7 min-w-0">
          <SalesWorkflowCard
            stages={MOCK_WORKFLOW_STAGES}
            onNavigateFollowUpQueue={handleNavigateFollowUpQueue}
          />
        </div>
      </div>

      {/* Floating Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} position="top-right" />
    </div>
  );
};

