import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonAvatar } from './SkeletonAvatar';

export interface SkeletonPageHeaderProps {
  hasIcon?: boolean;
  hasActions?: boolean;
  className?: string;
}

export const SkeletonPageHeader: React.FC<SkeletonPageHeaderProps> = ({
  hasIcon = true,
  hasActions = true,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 w-full ${className}`}
      role="status"
      aria-label="Loading page header..."
      aria-busy="true"
    >
      <div className="flex items-center gap-3.5">
        {hasIcon && <SkeletonAvatar size="md" rounded="xl" />}
        <div className="space-y-1.5">
          <Skeleton variant="text" width={180} height={22} className="rounded-md" />
          <Skeleton variant="text" width={280} height={13} className="rounded" />
        </div>
      </div>

      {hasActions && (
        <div className="flex items-center gap-2.5">
          <Skeleton variant="rectangular" width={36} height={36} rounded="lg" />
          <Skeleton variant="button" width={110} height={36} rounded="lg" />
          <Skeleton variant="button" width={120} height={36} rounded="lg" />
        </div>
      )}
    </div>
  );
};
