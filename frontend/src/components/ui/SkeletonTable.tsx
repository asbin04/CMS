import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonAvatar } from './SkeletonAvatar';

export interface SkeletonTableColumn {
  width?: string | number;
  type?: 'text' | 'avatar' | 'badge' | 'number' | 'action';
  align?: 'left' | 'center' | 'right';
}

export interface SkeletonTableProps {
  columns?: number | SkeletonTableColumn[];
  rows?: number;
  showHeader?: boolean;
  hasFilters?: boolean;
  className?: string;
  rowHeight?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  columns = 6,
  rows = 5,
  showHeader = true,
  hasFilters = false,
  className = '',
  rowHeight = 48
}) => {
  const columnConfigs: SkeletonTableColumn[] = Array.isArray(columns)
    ? columns
    : Array.from({ length: columns }).map((_, idx) => {
        if (idx === 0) return { width: '120px', type: 'text' };
        if (idx === 1) return { width: '220px', type: 'avatar' };
        if (idx === columns - 1) return { width: '60px', type: 'action', align: 'center' };
        if (idx === columns - 2) return { width: '100px', type: 'badge' };
        return { width: '140px', type: 'text' };
      });

  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-xl shadow-2xs overflow-hidden flex flex-col w-full ${className}`}
      role="status"
      aria-label="Loading table data..."
      aria-busy="true"
    >
      {/* Optional Top Filter Bar */}
      {hasFilters && (
        <div className="p-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2.5 flex-1 max-w-md">
            <Skeleton variant="rectangular" width="100%" height={32} rounded="md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="button" width={90} height={32} rounded="md" />
            <Skeleton variant="button" width={90} height={32} rounded="md" />
            <Skeleton variant="button" width={80} height={32} rounded="md" />
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse">
          {showHeader && (
            <thead>
              <tr className="h-10 bg-slate-50/80 border-b border-[#E2E8F0] text-[11px] font-semibold text-slate-500">
                {columnConfigs.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-4 py-2 text-${col.align || 'left'}`}
                    style={{ width: typeof col.width === 'number' ? `${col.width}px` : col.width }}
                  >
                    <Skeleton
                      variant="text"
                      width={typeof col.width === 'number' ? Math.min(col.width * 0.7, 80) : 70}
                      height={12}
                      className={col.align === 'center' ? 'mx-auto' : col.align === 'right' ? 'ml-auto' : ''}
                    />
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-slate-50/40 transition-colors"
                style={{ height: `${rowHeight}px` }}
              >
                {columnConfigs.map((col, colIdx) => {
                  return (
                    <td
                      key={colIdx}
                      className={`px-4 py-3 text-${col.align || 'left'}`}
                      style={{ width: typeof col.width === 'number' ? `${col.width}px` : col.width }}
                    >
                      {col.type === 'avatar' ? (
                        <div className="flex items-center gap-2.5">
                          <SkeletonAvatar size="sm" rounded="full" />
                          <div className="space-y-1 flex-1">
                            <Skeleton variant="text" width={rowIdx % 2 === 0 ? '75%' : '60%'} height={12} />
                            <Skeleton variant="text" width="45%" height={10} />
                          </div>
                        </div>
                      ) : col.type === 'badge' ? (
                        <Skeleton
                          variant="badge"
                          width={68}
                          height={20}
                          rounded="full"
                          className={col.align === 'center' ? 'mx-auto' : col.align === 'right' ? 'ml-auto' : ''}
                        />
                      ) : col.type === 'action' ? (
                        <Skeleton
                          variant="circular"
                          width={24}
                          height={24}
                          className={col.align === 'center' ? 'mx-auto' : col.align === 'right' ? 'ml-auto' : ''}
                        />
                      ) : col.type === 'number' ? (
                        <Skeleton
                          variant="text"
                          width={60}
                          height={13}
                          className={col.align === 'center' ? 'mx-auto' : col.align === 'right' ? 'ml-auto' : ''}
                        />
                      ) : (
                        <Skeleton
                          variant="text"
                          width={
                            colIdx === 0
                              ? 65
                              : ((rowIdx + colIdx) % 3 === 0 ? '70%' : (rowIdx + colIdx) % 3 === 1 ? '85%' : '50%')
                          }
                          height={12}
                          className={col.align === 'center' ? 'mx-auto' : col.align === 'right' ? 'ml-auto' : ''}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Skeleton */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/30">
        <Skeleton variant="text" width={110} height={12} />
        <div className="flex items-center gap-1.5">
          <Skeleton variant="rectangular" width={26} height={26} rounded="md" />
          <Skeleton variant="rectangular" width={26} height={26} rounded="md" />
          <Skeleton variant="rectangular" width={26} height={26} rounded="md" />
        </div>
      </div>
    </div>
  );
};
