import React from 'react';
import { Skeleton } from './Skeleton';

export interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number | string;
  gap?: number | string;
  lastLineWidth?: string;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lineHeight = 14,
  gap = 8,
  lastLineWidth = '60%',
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col ${className}`}
      style={{ gap: typeof gap === 'number' ? `${gap}px` : gap }}
    >
      {Array.from({ length: lines }).map((_, idx) => {
        const isLast = idx === lines - 1;
        const width = isLast && lines > 1 ? lastLineWidth : idx % 2 === 1 ? '92%' : '100%';
        return (
          <Skeleton
            key={idx}
            variant="text"
            height={lineHeight}
            width={width}
            className="rounded"
          />
        );
      })}
    </div>
  );
};
