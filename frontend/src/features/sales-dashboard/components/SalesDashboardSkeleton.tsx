import React from 'react';

export const SalesDashboardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-5 animate-pulse select-none" data-testid="sales-dashboard-skeleton">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="w-56 h-6 bg-slate-200 rounded-md" />
            <div className="w-80 h-3.5 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-200" />
          <div className="w-28 h-9 rounded-xl bg-slate-200" />
        </div>
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="w-24 h-3 bg-slate-200 rounded" />
              <div className="w-16 h-6 bg-slate-300 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 4 Performance Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4"
          >
            <div className="w-36 h-4 bg-slate-200 rounded" />
            <div className="space-y-3 pt-2">
              <div className="flex justify-between">
                <div className="w-20 h-3 bg-slate-100 rounded" />
                <div className="w-14 h-3 bg-slate-200 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="w-20 h-3 bg-slate-100 rounded" />
                <div className="w-14 h-3 bg-slate-200 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="w-20 h-3 bg-slate-100 rounded" />
                <div className="w-14 h-3 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel & Workflow Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs h-64" />
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs h-64" />
      </div>
    </div>
  );
};

