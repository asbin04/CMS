import React from 'react';
import { Skeleton } from './Skeleton';

export interface SkeletonChartProps {
  type?: 'bar' | 'line' | 'area' | 'donut' | 'funnel';
  height?: number | string;
  title?: string;
  hasHeader?: boolean;
  hasLegend?: boolean;
  className?: string;
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({
  type = 'bar',
  height = 240,
  title,
  hasHeader = true,
  hasLegend = true,
  className = ''
}) => {
  const chartHeight = typeof height === 'number' ? height : 240;

  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-5 shadow-2xs flex flex-col justify-between ${className}`}
      style={{ minHeight: `${chartHeight + 40}px` }}
      role="status"
      aria-label="Loading chart..."
      aria-busy="true"
    >
      {/* Header */}
      {hasHeader && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-1">
            {title ? (
              <h4 className="text-[13px] font-bold text-slate-700">{title}</h4>
            ) : (
              <Skeleton variant="text" width={140} height={14} />
            )}
            <Skeleton variant="text" width={180} height={10} />
          </div>

          {hasLegend && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Skeleton variant="circular" width={8} height={8} />
                <Skeleton variant="text" width={40} height={10} />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton variant="circular" width={8} height={8} />
                <Skeleton variant="text" width={50} height={10} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart Canvas Skeleton */}
      <div
        className="relative w-full flex items-center justify-center my-auto pt-4"
        style={{ height: `${chartHeight - 40}px` }}
      >
        {type === 'bar' && (
          <div className="w-full h-full flex items-end justify-between gap-3 px-4 pb-2 border-b border-slate-100">
            {[45, 75, 30, 90, 60, 85, 40, 70, 95, 50, 65, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <Skeleton
                  variant="rectangular"
                  width="70%"
                  height={`${h}%`}
                  className="rounded-t-md"
                />
                <Skeleton variant="text" width="60%" height={8} />
              </div>
            ))}
          </div>
        )}

        {(type === 'line' || type === 'area') && (
          <div className="w-full h-full flex flex-col justify-between px-2 py-1">
            <div className="w-full flex-1 relative flex items-center">
              {/* Subtle grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between opacity-40 pointer-events-none">
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
              </div>
              {/* Shimmer wave shape */}
              <Skeleton
                variant="rectangular"
                width="100%"
                height="65%"
                rounded="xl"
                className="opacity-75"
              />
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between pt-2 border-t border-slate-100">
              {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => (
                <Skeleton key={m} variant="text" width={24} height={10} />
              ))}
            </div>
          </div>
        )}

        {type === 'donut' && (
          <div className="flex items-center justify-center gap-8 w-full">
            {/* Donut ring */}
            <div className="relative flex items-center justify-center">
              <Skeleton
                variant="circular"
                width={130}
                height={130}
                className="rounded-full shadow-inner"
              />
              <div className="absolute w-[70px] h-[70px] rounded-full bg-white flex flex-col items-center justify-center shadow-xs">
                <Skeleton variant="text" width={30} height={12} />
              </div>
            </div>

            {/* Legend items */}
            <div className="flex flex-col gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton variant="circular" width={8} height={8} />
                  <Skeleton variant="text" width={75} height={11} />
                  <Skeleton variant="text" width={28} height={11} className="ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'funnel' && (
          <div className="flex flex-col items-center justify-center gap-2.5 w-full max-w-sm mx-auto">
            <Skeleton variant="rectangular" width="100%" height={28} rounded="lg" />
            <Skeleton variant="rectangular" width="82%" height={28} rounded="lg" />
            <Skeleton variant="rectangular" width="64%" height={28} rounded="lg" />
            <Skeleton variant="rectangular" width="46%" height={28} rounded="lg" />
          </div>
        )}
      </div>
    </div>
  );
};
