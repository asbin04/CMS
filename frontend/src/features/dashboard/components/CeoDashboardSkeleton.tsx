import React from 'react';
import { Skeleton } from '../../../components/ui/Skeleton';

export const CeoDashboardSkeleton: React.FC = () => {
  return (
    <div
      className="flex flex-col gap-6 w-full select-none"
      role="status"
      aria-label="Loading dashboard..."
      aria-busy="true"
    >
      {/* 1. 10 KPI Cards Grid (Matching KpiCardsGrid exactly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#F1F5F9] rounded-[12px] p-4 flex flex-col justify-between h-[165px] shadow-xs"
          >
            {/* Top: Icon Box */}
            <div className="flex items-center justify-between w-full">
              <div className="w-8 h-8 rounded-lg animate-shimmer" />
            </div>

            {/* Middle: Title & Big Value */}
            <div className="flex flex-col gap-1.5 my-auto">
              <div className="h-3 w-3/4 rounded animate-shimmer" />
              <div className="h-7 w-1/2 rounded animate-shimmer" />
            </div>

            {/* Bottom: Change Pill & Comparison Text */}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="h-4 w-12 rounded animate-shimmer" />
              <div className="h-3 w-20 rounded animate-shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Finance Overview Section Skeleton (Matching FinanceOverviewSection) */}
      <div className="bg-white border border-[#F1F5F9] rounded-[16px] p-6 flex flex-col shadow-xs">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between pb-5 border-b border-[#F1F5F9] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5]/70 flex items-center justify-center shrink-0">
              <div className="w-4 h-4 rounded animate-shimmer" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-4 w-36 rounded animate-shimmer" />
              <div className="h-3 w-72 sm:w-96 rounded animate-shimmer" />
            </div>
          </div>
          <div className="h-[26px] w-28 rounded-lg border border-[#E2E8F0] animate-shimmer shrink-0" />
        </div>

        {/* 4 Chart Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-5 items-start">
          {/* Col 1: Invoice Value vs Collections */}
          <div className="flex flex-col w-full h-[230px] justify-between">
            <div>
              <div className="h-3.5 w-40 rounded animate-shimmer mb-2" />
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-200 animate-shimmer" />
                  <div className="h-2.5 w-16 rounded animate-shimmer" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 animate-shimmer" />
                  <div className="h-2.5 w-20 rounded animate-shimmer" />
                </div>
              </div>
            </div>
            {/* Bar chart silhouette */}
            <div className="flex items-end justify-between h-[150px] gap-2 pt-2 border-b border-slate-100 px-2">
              {[45, 60, 75, 55, 80, 70].map((h, i) => (
                <div key={i} className="flex-1 flex items-end justify-center gap-1 h-full">
                  <div className="w-2 rounded-t animate-shimmer" style={{ height: `${h}%` }} />
                  <div className="w-2 rounded-t animate-shimmer opacity-80" style={{ height: `${Math.round(h * 0.75)}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-300 pt-1 px-1">
              {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => (
                <span key={m} className="h-2.5 w-4 rounded animate-shimmer" />
              ))}
            </div>
          </div>

          {/* Col 2: Outstanding Receivables */}
          <div className="flex flex-col w-full h-[230px] justify-between">
            <div>
              <div className="h-3.5 w-36 rounded animate-shimmer mb-2" />
              <div className="h-2.5 w-24 rounded animate-shimmer mb-4 opacity-50" />
            </div>
            {/* Area chart silhouette */}
            <div className="relative flex items-center justify-center h-[150px] w-full px-2 border-b border-slate-100">
              <div className="w-full h-24 rounded-xl animate-shimmer opacity-60" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-300 pt-1 px-1">
              {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => (
                <span key={m} className="h-2.5 w-4 rounded animate-shimmer" />
              ))}
            </div>
          </div>

          {/* Col 3: Expenses */}
          <div className="flex flex-col w-full h-[230px] justify-between">
            <div>
              <div className="h-3.5 w-24 rounded animate-shimmer mb-2" />
              <div className="h-2.5 w-20 rounded animate-shimmer mb-4 opacity-50" />
            </div>
            {/* Single bar chart silhouette */}
            <div className="flex items-end justify-between h-[150px] gap-2 pt-2 border-b border-slate-100 px-2">
              {[35, 50, 42, 65, 80, 90].map((h, i) => (
                <div key={i} className="flex-1 flex items-end justify-center h-full">
                  <div className="w-3 rounded-t animate-shimmer" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-300 pt-1 px-1">
              {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => (
                <span key={m} className="h-2.5 w-4 rounded animate-shimmer" />
              ))}
            </div>
          </div>

          {/* Col 4: Expense Breakdown */}
          <div className="flex flex-col w-full h-[230px] justify-between">
            <div>
              <div className="h-3.5 w-32 rounded animate-shimmer mb-4" />
            </div>
            <div className="flex items-center gap-4 my-auto">
              {/* Donut ring */}
              <div className="relative flex items-center justify-center shrink-0">
                <div className="w-24 h-24 rounded-full animate-shimmer" />
                <div className="absolute w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <div className="h-3 w-8 rounded animate-shimmer" />
                </div>
              </div>
              {/* Categories */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full animate-shimmer shrink-0" />
                      <div className="h-2.5 w-16 rounded animate-shimmer" />
                    </div>
                    <div className="h-2.5 w-6 rounded animate-shimmer shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sales & Delivery Overview Section Skeleton */}
      <div className="bg-white border border-[#F1F5F9] rounded-[16px] p-6 flex flex-col shadow-xs">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between pb-5 border-b border-[#F1F5F9] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50/70 flex items-center justify-center shrink-0">
              <div className="w-4 h-4 rounded animate-shimmer" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-4 w-44 rounded animate-shimmer" />
              <div className="h-3 w-64 sm:w-80 rounded animate-shimmer" />
            </div>
          </div>
          <div className="h-[26px] w-28 rounded-lg border border-[#E2E8F0] animate-shimmer shrink-0" />
        </div>

        {/* 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-5 items-start">
          {/* Funnel */}
          <div className="flex flex-col gap-3">
            <div className="h-3.5 w-36 rounded animate-shimmer mb-1" />
            {[100, 78, 55, 38].map((width, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="h-7 rounded-lg animate-shimmer" style={{ width: `${width}%` }} />
                <div className="h-3 w-12 rounded animate-shimmer shrink-0" />
              </div>
            ))}
          </div>

          {/* Donut & Statuses */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-3.5 w-36 rounded animate-shimmer self-start" />
            <div className="relative flex items-center justify-center">
              <div className="w-32 h-32 rounded-full animate-shimmer" />
              <div className="absolute w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center shadow-xs gap-1">
                <div className="h-4 w-8 rounded animate-shimmer" />
                <div className="h-2.5 w-12 rounded animate-shimmer" />
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2 w-full">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 w-20 rounded-full animate-shimmer" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. People Overview Section Skeleton */}
      <div className="bg-white border border-[#F1F5F9] rounded-[16px] p-6 flex flex-col shadow-xs">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between pb-5 border-b border-[#F1F5F9] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50/70 flex items-center justify-center shrink-0">
              <div className="w-4 h-4 rounded animate-shimmer" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-4 w-36 rounded animate-shimmer" />
              <div className="h-3 w-60 sm:w-72 rounded animate-shimmer" />
            </div>
          </div>
          <div className="h-[26px] w-28 rounded-lg border border-[#E2E8F0] animate-shimmer shrink-0" />
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5 items-start">
          {/* Employee Count Trend */}
          <div className="flex flex-col h-[210px] justify-between">
            <div className="h-3.5 w-36 rounded animate-shimmer mb-2" />
            <div className="flex items-end justify-between h-[140px] gap-2 pt-2 border-b border-slate-100 px-2">
              {[30, 45, 50, 60, 65, 80].map((h, i) => (
                <div key={i} className="flex-1 flex items-end justify-center h-full">
                  <div className="w-4 rounded-t animate-shimmer" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-300 pt-1 px-1">
              {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => (
                <span key={m} className="h-2.5 w-4 rounded animate-shimmer" />
              ))}
            </div>
          </div>

          {/* Payroll Trend */}
          <div className="flex flex-col h-[210px] justify-between">
            <div className="h-3.5 w-32 rounded animate-shimmer mb-2" />
            <div className="relative flex items-center justify-center h-[140px] w-full px-2 border-b border-slate-100">
              <div className="w-full h-20 rounded-xl animate-shimmer opacity-60" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-300 pt-1 px-1">
              {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => (
                <span key={m} className="h-2.5 w-4 rounded animate-shimmer" />
              ))}
            </div>
          </div>

          {/* Employee Summary Card */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-4 flex flex-col justify-between h-[210px]">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
              <div className="w-4 h-4 rounded animate-shimmer" />
              <div className="h-3.5 w-32 rounded animate-shimmer" />
            </div>
            <div className="flex flex-col gap-3 py-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded animate-shimmer" />
                    <div className="h-3 w-24 rounded animate-shimmer" />
                  </div>
                  <div className="h-4 w-8 rounded animate-shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Management Alerts Section Skeleton */}
      <div className="bg-white border border-[#F1F5F9] rounded-[16px] p-6 flex flex-col shadow-xs gap-4">
        {/* Section Header */}
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] flex items-center justify-center shrink-0">
            <div className="w-4 h-4 rounded animate-shimmer" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="h-4 w-36 rounded animate-shimmer" />
            <div className="h-3 w-64 sm:w-80 rounded animate-shimmer" />
          </div>
        </div>

        {/* Table Container */}
        <div className="border border-[#F1F5F9] rounded-lg overflow-hidden w-full">
          {/* Table Head */}
          <div className="grid grid-cols-12 bg-[#F8FAFC]/70 border-b border-[#F1F5F9] h-[44px] px-6 items-center">
            <div className="col-span-6"><div className="h-3 w-16 rounded animate-shimmer" /></div>
            <div className="col-span-6"><div className="h-3 w-14 rounded animate-shimmer" /></div>
          </div>
          {/* Table Rows */}
          <div className="divide-y divide-[#F1F5F9] bg-white">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-12 items-center h-[48px] px-6">
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-4 h-4 rounded animate-shimmer shrink-0" />
                  <div className="h-3 w-40 rounded animate-shimmer" />
                </div>
                <div className="col-span-6 flex items-center justify-between">
                  <div className="h-4 w-8 rounded-full animate-shimmer" />
                  <div className="w-3.5 h-3.5 rounded animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
