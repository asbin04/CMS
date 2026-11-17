import React from 'react';
import { SkeletonPageHeader } from './SkeletonPageHeader';
import { SkeletonCard } from './SkeletonCard';
import { SkeletonChart } from './SkeletonChart';
import { SkeletonTable } from './SkeletonTable';

export interface DashboardSkeletonProps {
  kpiCount?: number;
  chartCount?: number;
  hasTable?: boolean;
  className?: string;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  kpiCount = 4,
  chartCount = 2,
  hasTable = true,
  className = ''
}) => {
  return (
    <div
      className={`p-4 sm:p-6 w-full box-border font-sans bg-[#F8FAFC] flex flex-col gap-6 select-none ${className}`}
      role="status"
      aria-label="Loading dashboard..."
      aria-busy="true"
    >
      {/* 1. Header */}
      <SkeletonPageHeader />

      {/* 2. KPI Cards Grid */}
      <div
        className={`grid gap-4 ${
          kpiCount <= 4
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
        }`}
      >
        {Array.from({ length: kpiCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* 3. Charts Section */}
      <div
        className={`grid gap-5 ${
          chartCount === 1
            ? 'grid-cols-1'
            : chartCount === 2
            ? 'grid-cols-1 lg:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {Array.from({ length: chartCount }).map((_, i) => (
          <SkeletonChart
            key={i}
            type={i % 2 === 0 ? 'bar' : 'donut'}
            height={260}
          />
        ))}
      </div>

      {/* 4. Table Section */}
      {hasTable && (
        <SkeletonTable
          rows={5}
          columns={5}
          hasFilters={false}
          className="border-[#F1F5F9]"
        />
      )}
    </div>
  );
};
