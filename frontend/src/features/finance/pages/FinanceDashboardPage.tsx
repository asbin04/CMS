import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReloadButton } from '../../../components/ui/ReloadButton';
import {
  FileText,
  CreditCard,
  Wallet,
  Users,
  Layers,
  Receipt,
  TrendingUp,
  Percent,
  RotateCcw,
  RotateCw,
  Download,
  BarChart2,
  AlertTriangle,
} from 'lucide-react';
import {
  financeService,
  formatRupeeAmount,
  formatCompactRupees,
  formatPercentage,
  formatLastUpdatedTimestamp,
} from '../services/financeService';
import {
  FinanceDashboardData,
  FinanceQueryParams,
  MetricValueType,
} from '../types/finance';
import { AppLayoutContextType } from '@/components/layout/AppLayout';

const BUCKET_COLORS: Record<string, string> = {
  current: '#10B981',
  '1_30': '#4F46E5',
  '31_60': '#F59E0B',
  '61_90': '#F43F5E',
  '90_plus': '#312E81',
};

function parseDateRangeToParams(range?: string): FinanceQueryParams {
  if (!range || range === '—' || range.trim() === '') {
    return { period: 'THIS_FISCAL_YEAR' };
  }

  // e.g. "Apr 2024 - Mar 2025"
  const fyMatch = range.match(/Apr\s+(\d{4})\s*-\s*Mar\s+(\d{4})/i);
  if (fyMatch) {
    const startYear = parseInt(fyMatch[1], 10);
    const endYear = parseInt(fyMatch[2], 10);
    return {
      period: 'CUSTOM',
      from: `${startYear}-04-01`,
      to: `${endYear}-03-31`,
    };
  }

  // e.g. "Jan 2025 - Dec 2025"
  const calMatch = range.match(/Jan\s+(\d{4})\s*-\s*Dec\s+(\d{4})/i);
  if (calMatch) {
    const year = calMatch[1];
    return {
      period: 'CUSTOM',
      from: `${year}-01-01`,
      to: `${year}-12-31`,
    };
  }

  if (range.toLowerCase().includes('last 30 days')) {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 30);
    return {
      period: 'CUSTOM',
      from: past.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0],
    };
  }

  if (range.toLowerCase().includes('quarter')) {
    return { period: 'LAST_6_MONTHS' };
  }

  return { period: 'THIS_FISCAL_YEAR' };
}

function formatRowValue(val: number | null | undefined, type: MetricValueType): string {
  if (val === null || val === undefined) return '-';
  if (type === 'CURRENCY') {
    return formatRupeeAmount(val);
  }
  if (type === 'PERCENT') {
    return formatPercentage(val);
  }
  return String(val);
}

function renderStatusBadge(status?: string | null) {
  if (!status || status === '-') {
    return <span className="text-[#94A3B8] font-medium">-</span>;
  }
  const s = status.trim().toLowerCase();
  if (s === 'on track') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shadow-2xs hover:scale-105 transition-transform">
        On Track
      </span>
    );
  }
  if (s === 'attention') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] shadow-2xs hover:scale-105 transition-transform">
        Attention
      </span>
    );
  }
  if (s === 'at risk') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] shadow-2xs hover:scale-105 transition-transform">
        At Risk
      </span>
    );
  }
  return <span className="text-[#475569]">{status}</span>;
}

export const FinanceDashboardPage: React.FC = () => {
  const outletContext = useOutletContext<AppLayoutContextType | null>();
  const isSidebarCollapsed = outletContext?.isSidebarCollapsed ?? true;
  const dateRange = outletContext?.dateRange;

  const [data, setData] = useState<FinanceDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hoveredBucketKey, setHoveredBucketKey] = useState<string | null>(null);

  const queryParams = useMemo(() => parseDateRangeToParams(dateRange), [dateRange]);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await financeService.getDashboardData(queryParams);
      setData(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load finance dashboard metrics.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    if (!data) return;
    financeService.exportToCsv(data);
  };

  // Skeleton Loader State
  if (isLoading && !data) {
    return (
      <div className="flex flex-col p-6 gap-6 w-full min-h-screen bg-[#F8FAFC] font-['Inter'] animate-pulse">
        {/* Header Skeleton */}
        <div className="w-full flex justify-between items-center h-[66px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-slate-200" />
            <div className="flex flex-col gap-2">
              <div className="w-48 h-6 bg-slate-200 rounded" />
              <div className="w-80 h-3 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="w-40 h-8 bg-slate-200 rounded" />
        </div>

        {/* Top 4 KPI Cards Skeleton */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[96px] bg-white rounded-[12px] border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-[12px] bg-slate-200" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="w-24 h-3 bg-slate-200 rounded" />
                <div className="w-20 h-6 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Middle Section Skeleton */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 h-[318px] bg-white rounded-[12px] border border-slate-200 p-5" />
          <div className="lg:col-span-5 h-[318px] bg-white rounded-[12px] border border-slate-200 p-5" />
        </div>

        {/* Expense Section Skeleton */}
        <div className="w-full h-[142px] bg-white rounded-[12px] border border-slate-200 p-4" />

        {/* Table Skeleton */}
        <div className="w-full h-80 bg-white rounded-[12px] border border-slate-200 p-4" />
      </div>
    );
  }

  // Error State Banner
  if (error && !data) {
    return (
      <div className="flex flex-col p-6 gap-6 w-full min-h-screen bg-[#F8FAFC] font-['Inter']">
        <div className="w-full bg-rose-50 border border-rose-200 rounded-[12px] p-6 flex flex-col items-center justify-center gap-3 text-center">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
          <h2 className="text-base font-semibold text-rose-800">Unable to load Finance Dashboard</h2>
          <p className="text-xs text-rose-600 max-w-md">{error}</p>
          <button
            onClick={() => loadData()}
            className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;
  const rawAgeingBuckets = data?.ageingBuckets || [];

  const ageingBuckets = rawAgeingBuckets.map((b) => ({
    ...b,
    color: BUCKET_COLORS[b.bucketKey] || '#10B981',
  }));

  const metricSummary = data?.metricSummary || [];
  const maxAgeingAmount = Math.max(...ageingBuckets.map((b) => Number(b.amount) || 0), 0);
  const hasReceivablesData = data?.hasReceivablesData || false;

  return (
    <div className="flex flex-col p-6 gap-6 w-full min-h-screen bg-[#F8FAFC] font-['Inter']">
      {/* PageHeader */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 w-full">
        {/* Title & Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Green Document Icon Badge */}
          <div
            className="box-border w-10 h-10 rounded-[12px] bg-[#ECFDF5] border border-[#D1FAE5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center shrink-0"
          >
            <Receipt className="w-5 h-5 text-[#059669]" strokeWidth={2} />
          </div>

          <div className="flex flex-col gap-0.5">
            <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.6px] text-[#0F1E4A] m-0">
              Finance Dashboard
            </h1>
            <p className="text-[12px] font-normal leading-[16px] text-[#64748B] m-0">
              Monitor invoicing, collections, receivables, expenses and operating cash performance.
            </p>
          </div>
        </div>

        {/* Frame 7: Refresh, Export */}
        <div className="flex items-center gap-[11px] self-end sm:self-auto">
          {/* Refresh Button */}
          <ReloadButton
            onClick={() => loadData(true)}
            isRefreshing={isRefreshing}
            ariaLabel="Refresh Dashboard"
          />

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="box-border w-[90.11px] h-[30px] px-[14px] py-[6px] gap-[8px] bg-white border border-[#E2E8F0] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[8px] hover:bg-[#F8FAFC] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
          >
            <Download className="w-[14px] h-[14px] text-[#4F46E5]" strokeWidth={2} />
            <span className="font-semibold text-[12px] leading-[16px] text-[#4F46E5]">
              Export
            </span>
          </button>
        </div>
      </div>

      {/* Section - Key Performance Indicators (Top 4 Cards) */}
      <div className={`w-full grid gap-4 ${
        isSidebarCollapsed ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
      }`}>
        {/* Card 1: Invoice Value */}
        <div className="box-border h-[96px] bg-white border border-[#E2E8F0]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-[23px_16px] flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-[#4F46E5]" strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[12px] font-medium leading-[16px] text-[#64748B] truncate">
              Invoice Value
            </span>
            <span className="text-[20px] font-bold leading-[28px] tracking-[-0.5px] text-[#0F172A] truncate">
              {formatRupeeAmount(kpis?.invoiceValue?.rawValue)}
            </span>
          </div>
        </div>

        {/* Card 2: Collected Payments */}
        <div className="box-border h-[96px] bg-white border border-[#E2E8F0]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-[23px_16px] flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[#ECFDF5] flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-[#059669]" strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[12px] font-medium leading-[16px] text-[#64748B] truncate">
              Collected Payments
            </span>
            <span className="text-[20px] font-bold leading-[28px] tracking-[-0.5px] text-[#0F172A] truncate">
              {formatRupeeAmount(kpis?.collectedPayments?.rawValue)}
            </span>
          </div>
        </div>

        {/* Card 3: Outstanding Receivables */}
        <div className="box-border h-[96px] bg-white border border-[#E2E8F0]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-[16px] flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[#FFFBEB] flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-[#D97706]" strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[12px] font-medium leading-[16px] text-[#64748B] truncate">
              Outstanding Receivables
            </span>
            <span className="text-[20px] font-bold leading-[28px] tracking-[-0.5px] text-[#0F172A] truncate">
              {formatRupeeAmount(kpis?.outstandingReceivables?.rawValue)}
            </span>
          </div>
        </div>

        {/* Card 4: Current Receivables */}
        <div className="box-border h-[96px] bg-white border border-[#E2E8F0]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-[23px_16px] flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[#FAF5FF] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#9333EA]" strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[12px] font-medium leading-[16px] text-[#64748B] truncate">
              Current Receivables
            </span>
            <span className="text-[20px] font-bold leading-[28px] tracking-[-0.5px] text-[#0F172A] truncate">
              {formatRupeeAmount(kpis?.currentReceivables?.rawValue)}
            </span>
          </div>
        </div>
      </div>

      {/* MiddleSection (Receivables Overview & Aging) */}
      <div className={`w-full grid gap-4 ${
        isSidebarCollapsed ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 xl:grid-cols-12'
      }`}>
        {/* Left: Receivables Overview Chart Card */}
        <div
          className={`box-border w-full h-[318px] bg-white rounded-[12px] border border-[#E2E8F0]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-5 flex flex-col justify-between ${
            isSidebarCollapsed ? 'lg:col-span-7' : 'xl:col-span-7'
          }`}
        >
          {/* Card Title */}
          <h2 className="text-[14px] font-bold leading-[20px] tracking-[-0.35px] text-[#0F172A] m-0">
            Receivables Overview
          </h2>

          {/* Chart Display Area: Total height 240px */}
          <div className="w-full h-[240px] flex flex-col justify-between pt-1">
            {/* Plot Area: Height 204px */}
            <div className="relative w-full h-[204px]">
              {/* Y-Axis Labels Column (32px wide, right-aligned) */}
              <div className="absolute left-0 top-0 bottom-[26px] w-[32px] flex flex-col justify-between text-right text-[11px] leading-[16px] text-[#94A3B8] pr-2 pointer-events-none z-10">
                <span className="leading-none pt-0.5">{hasReceivablesData ? formatCompactRupees(maxAgeingAmount) : '₹ 1.0'}</span>
                <span className="leading-none">{hasReceivablesData ? formatCompactRupees(maxAgeingAmount / 2) : '₹ 0.5'}</span>
                <span className="leading-none pb-0.5">₹ 0</span>
              </div>

              {/* Horizontal Grid Lines */}
              <div className="absolute left-[32px] right-0 top-0 bottom-[26px] flex flex-col justify-between pointer-events-none z-0">
                <div className="w-full border-b border-[#F1F5F9]" />
                <div className="w-full border-b border-[#F1F5F9]" />
                <div className="w-full border-b border-[#E2E8F0]" />
              </div>

              {/* If NO Receivables Data (Exact design empty state) */}
              {!hasReceivablesData ? (
                <div className="absolute left-[32px] right-0 top-0 bottom-[26px] flex flex-col items-center justify-center z-20">
                  <div className="mb-2 w-8 h-8 flex items-center justify-center">
                    <BarChart2 className="w-8 h-8 text-[#60A5FA]" strokeWidth={2.5} />
                  </div>
                  <span className="font-semibold text-[12px] leading-[16px] text-[#334155] text-center">
                    No receivables data available
                  </span>
                  <span className="font-normal text-[11px] leading-[16px] text-[#94A3B8] text-center mt-0.5">
                    All aging buckets are currently at ₹ 0.00
                  </span>
                </div>
              ) : (
                /* Active Bar Chart when data is present */
                <div className="absolute left-[32px] right-0 top-0 bottom-[26px] flex items-end justify-around px-2 z-10">
                  {ageingBuckets.map((bucket) => {
                    const isHovered = hoveredBucketKey === bucket.bucketKey;
                    const barHeightPct = maxAgeingAmount > 0 ? Math.max((Number(bucket.amount) / maxAgeingAmount) * 100, 3) : 3;
                    return (
                      <div
                        key={bucket.bucketKey}
                        onMouseEnter={() => setHoveredBucketKey(bucket.bucketKey)}
                        onMouseLeave={() => setHoveredBucketKey(null)}
                        className="relative flex flex-col items-center justify-end h-full w-20 flex-shrink-0 cursor-pointer"
                      >
                        {/* Tooltip positioned smoothly above the bar */}
                        <div
                          className={`absolute pointer-events-none z-30 transition-all duration-200 ${
                            isHovered ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-1 pointer-events-none'
                          }`}
                          style={{
                            bottom: `${Math.min(barHeightPct + 4, 82)}%`,
                          }}
                        >
                          <div className="bg-white text-slate-900 text-[11px] font-semibold rounded-lg px-3 py-1.5 whitespace-nowrap shadow-[0_4px_14px_rgba(0,0,0,0.12)] border border-slate-200 relative">
                            {bucket.label}: {formatRupeeAmount(bucket.amount)} ({bucket.count} items)
                            {/* Downward triangle pointer with border */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -z-10 border-solid border-t-slate-200 border-t-[6px] border-x-transparent border-x-[6px] border-b-0" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-solid border-t-white border-t-[5px] border-x-transparent border-x-[5px] border-b-0" />
                          </div>
                        </div>

                        {/* Interactive Bar */}
                        <div
                          className={`w-9 sm:w-10 rounded-t-[5px] transition-all duration-200 ${
                            isHovered
                              ? 'brightness-110 shadow-md scale-x-105'
                              : hoveredBucketKey
                              ? 'opacity-50'
                              : 'hover:brightness-105 shadow-xs'
                          }`}
                          style={{
                            height: `${barHeightPct}%`,
                            backgroundColor: bucket.color,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* X-Axis Labels Row: Strictly below plot area, height 26px */}
            <div className="box-border w-full h-[26px] border-t border-[#E2E8F0] flex items-center pl-[32px] z-10">
              <div className="w-full flex items-center justify-around px-2">
                {ageingBuckets.map((bucket) => {
                  const isHovered = hoveredBucketKey === bucket.bucketKey;
                  return (
                    <div
                      key={bucket.bucketKey}
                      onMouseEnter={() => setHoveredBucketKey(bucket.bucketKey)}
                      onMouseLeave={() => setHoveredBucketKey(null)}
                      className="w-20 text-center shrink-0 cursor-pointer"
                    >
                      <span
                        className={`text-[11px] leading-[16px] block whitespace-nowrap transition-colors duration-150 ${
                          isHovered ? 'font-bold text-[#0F172A]' : 'font-normal text-[#64748B]'
                        }`}
                      >
                        {bucket.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Receivables Aging Breakdown Card */}
        <div
          className={`box-border w-full h-[318px] bg-white rounded-[12px] border border-[#E2E8F0]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] p-5 flex flex-col justify-between ${
            isSidebarCollapsed ? 'lg:col-span-5' : 'xl:col-span-5'
          }`}
        >
          {/* Header */}
          <h2 className="text-[14px] font-bold leading-[20px] tracking-[-0.35px] text-[#0F172A] m-0">
            Receivables Aging
          </h2>

          {/* 5 Buckets List */}
          <div className="flex flex-col justify-center gap-4 my-auto h-[144px]">
            {ageingBuckets.map((bucket) => {
              const isHovered = hoveredBucketKey === bucket.bucketKey;
              return (
                <div
                  key={bucket.bucketKey}
                  onMouseEnter={() => setHoveredBucketKey(bucket.bucketKey)}
                  onMouseLeave={() => setHoveredBucketKey(null)}
                  className={`w-full flex flex-row items-center gap-3 h-4 px-1 rounded-lg transition-colors cursor-pointer ${
                    isHovered ? 'bg-slate-50' : ''
                  }`}
                >
                  {/* Dot & Label */}
                  <div className="flex items-center gap-2 w-[112px] shrink-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: bucket.color }}
                    />
                    <span className="text-[12px] font-normal leading-[16px] text-[#475569] truncate">
                      {bucket.label}
                    </span>
                  </div>

                  {/* Amount */}
                  <span className="text-[12px] font-medium leading-[16px] text-[#334155] text-right min-w-[72px] shrink-0 truncate">
                    {formatRupeeAmount(bucket.amount)}
                  </span>

                  {/* Progress Bar Track */}
                  <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden mx-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${bucket.percentage}%`,
                        backgroundColor: bucket.color,
                      }}
                    />
                  </div>

                  {/* Percentage */}
                  <span className="text-[11px] font-normal leading-[16px] text-[#94A3B8] text-right w-8 shrink-0">
                    {bucket.percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section - Expense and Cash Performance */}
      <div className="box-border w-full bg-white border border-[#E2E8F0] rounded-[12px] p-[14px] flex flex-col gap-3">
        <h2 className="text-[14px] font-bold leading-[20px] tracking-[-0.35px] text-[#0F172A] m-0">
          Expense & Cash Performance
        </h2>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Expenses */}
          <div className="box-border h-[82px] bg-white border border-[#E2E8F0]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-4 flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-[#4F46E5]" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[12px] font-medium leading-[16px] text-[#64748B] truncate">
                Total Expenses
              </span>
              <span className="text-[20px] font-bold leading-[28px] tracking-[-0.5px] text-[#0F172A] truncate">
                {formatRupeeAmount(kpis?.totalExpenses?.rawValue)}
              </span>
            </div>
          </div>

          {/* Card 2: Project Expenses */}
          <div className="box-border h-[82px] bg-white border border-[#E2E8F0]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-4 flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-[12px] bg-[#ECFDF5] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-[#059669]" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[12px] font-medium leading-[16px] text-[#64748B] truncate">
                Project Expenses
              </span>
              <span className="text-[20px] font-bold leading-[28px] tracking-[-0.5px] text-[#0F172A] truncate">
                {formatRupeeAmount(kpis?.projectExpenses?.rawValue)}
              </span>
            </div>
          </div>

          {/* Card 3: Operating Cash Result */}
          <div className="box-border h-[82px] bg-white border border-[#E2E8F0]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-4 flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-[12px] bg-[#FAF5FF] flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-[#9333EA]" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[12px] font-medium leading-[16px] text-[#64748B] truncate">
                Operating Cash Result
              </span>
              <span className="text-[20px] font-bold leading-[28px] tracking-[-0.5px] text-[#0F172A] truncate">
                {formatRupeeAmount(kpis?.operatingCashResult?.rawValue)}
              </span>
            </div>
          </div>

          {/* Card 4: Collection Rate */}
          <div className="box-border h-[82px] bg-white border border-[#E2E8F0]/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-4 flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-[12px] bg-[#FFF1F2] flex items-center justify-center shrink-0">
              <Percent className="w-6 h-6 text-[#F43F5E]" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[12px] font-medium leading-[16px] text-[#64748B] truncate">
                Collection Rate
              </span>
              <span className="text-[20px] font-bold leading-[28px] tracking-[-0.5px] text-[#0F172A] truncate">
                {formatPercentage(kpis?.collectionRate?.rawValue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Summary Section */}
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-[14px] font-bold leading-[20px] tracking-[-0.35px] text-[#0F172A] m-0">
          Metric Summary
        </h2>

        {/* Table Container */}
        <div
          className="box-border w-full bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] border border-[#E2E8F0] overflow-hidden"
        >
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#EEF4FF] h-[41px]">
                  <th className="box-border w-1/4 text-left px-4 py-[11px] font-bold text-[12px] leading-[16px] text-[#334155] border border-[#E2E8F0]">
                    Metric
                  </th>
                  <th className="box-border w-1/4 text-center px-4 py-[11px] font-bold text-[12px] leading-[16px] text-[#334155] border border-[#E2E8F0]">
                    Value
                  </th>
                  <th className="box-border w-1/4 text-center px-4 py-[11px] font-bold text-[12px] leading-[16px] text-[#334155] border border-[#E2E8F0]">
                    Target
                  </th>
                  <th className="box-border w-1/4 text-center px-4 py-[11px] font-bold text-[12px] leading-[16px] text-[#334155] border border-[#E2E8F0]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {metricSummary.map((row) => (
                  <tr
                    key={row.metricKey}
                    className="box-border h-[37px] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="box-border w-1/4 px-4 py-[9px] text-[12px] leading-[16px] font-normal text-[#475569] border border-[#E2E8F0] text-left">
                      {row.metricName}
                    </td>
                    <td className="box-border w-1/4 px-4 py-[9px] text-[12px] leading-[16px] font-normal text-[#475569] border border-[#E2E8F0] text-center">
                      {formatRowValue(row.value, row.valueType)}
                    </td>
                    <td className="box-border w-1/4 px-4 py-[9px] text-[12px] leading-[16px] font-normal text-[#475569] border border-[#E2E8F0] text-center">
                      {formatRowValue(row.target, row.valueType)}
                    </td>
                    <td className="box-border w-1/4 px-4 py-[9px] text-[12px] leading-[16px] font-normal text-[#475569] border border-[#E2E8F0] text-center">
                      {renderStatusBadge(row.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
