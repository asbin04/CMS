import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonAvatar } from './SkeletonAvatar';

export interface SkeletonCardProps {
  variant?: 'kpi' | 'compact' | 'content';
  height?: number | string;
  className?: string;
  hasIcon?: boolean;
  hasTrend?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'kpi',
  height,
  className = '',
  hasIcon = true,
  hasTrend = true
}) => {
  if (variant === 'compact') {
    return (
      <div
        className={`bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-2xs flex items-center gap-3.5 ${className}`}
        style={{ height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined }}
      >
        {hasIcon && <SkeletonAvatar size="sm" rounded="md" />}
        <div className="flex-1 space-y-1.5">
          <Skeleton variant="text" width="60%" height={12} />
          <Skeleton variant="text" width="40%" height={18} className="rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'content') {
    return (
      <div
        className={`bg-white border border-[#F1F5F9] rounded-[16px] p-6 shadow-2xs flex flex-col gap-4 ${className}`}
        style={{ height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            {hasIcon && <SkeletonAvatar size="sm" rounded="lg" />}
            <div className="space-y-1">
              <Skeleton variant="text" width={140} height={16} />
              <Skeleton variant="text" width={220} height={12} />
            </div>
          </div>
          <Skeleton variant="button" width={100} height={28} />
        </div>
        <div className="flex-1 flex flex-col gap-3 justify-center">
          <Skeleton variant="rectangular" width="100%" height={height ? '100%' : 140} className="rounded-xl" />
        </div>
      </div>
    );
  }

  // Standard KPI Card
  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between ${className}`}
      style={{
        height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
        minHeight: height ? undefined : '96px'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <Skeleton variant="text" width="65%" height={13} />
          <Skeleton variant="text" width="45%" height={26} className="rounded" />
        </div>
        {hasIcon && (
          <Skeleton
            variant="rectangular"
            width={38}
            height={38}
            rounded="lg"
            className="shrink-0"
          />
        )}
      </div>

      {hasTrend && (
        <div className="flex items-center gap-2 pt-2 mt-1">
          <Skeleton variant="badge" width={52} height={18} rounded="full" />
          <Skeleton variant="text" width="40%" height={11} />
        </div>
      )}
    </div>
  );
};
