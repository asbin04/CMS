import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = 'requests',
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalItems, currentPage * pageSize);

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, currentPage - 2);
    let end = start + 4;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - 4);
    }
    const pages: number[] = [];
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  };

  return (
    <div
      className={`box-border flex flex-row flex-wrap items-center justify-between px-5 py-3 w-full border-t border-[#F1F5F9] min-h-[53px] gap-4 ${className}`}
      style={{
        boxSizing: 'border-box',
        borderTop: '1px solid #F1F5F9',
        padding: '12px 20px',
      }}
    >
      {/* Showing X – Y of Z requests */}
      <div className="flex flex-col items-start p-0">
        <span
          className="text-xs text-[#64748B] font-normal leading-4 flex items-center"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Showing {startIndex} – {endIndex} of {totalItems} {itemLabel}
        </span>
      </div>

      {/* Pagination Navigation & Page Size Selector */}
      <div className="flex flex-row items-center p-0 gap-3 h-7">
        <div className="flex flex-row items-center p-0 gap-1 h-7">
          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="box-border flex items-center justify-center w-6 h-6 border border-[#E2E8F0] rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              border: '1px solid #E2E8F0',
            }}
          >
            <ChevronLeft
              size={14}
              className={currentPage <= 1 ? 'text-[#94A3B8]' : 'text-[#475569]'}
              strokeWidth={1.5}
            />
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center justify-center w-7 h-7 rounded text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#4F46E5] text-white font-semibold'
                    : 'box-border border border-[#E2E8F0] bg-white text-[#475569] font-medium hover:bg-slate-50'
                }`}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="box-border flex items-center justify-center w-6 h-6 border border-[#E2E8F0] rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              border: '1px solid #E2E8F0',
            }}
          >
            <ChevronRight
              size={14}
              className={currentPage >= totalPages ? 'text-[#94A3B8]' : 'text-[#475569]'}
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="relative inline-flex items-center">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="h-[26px] w-[93.42px] pl-2 pr-6 bg-white border border-[#E2E8F0] rounded text-xs text-[#475569] font-medium outline-none appearance-none cursor-pointer"
              style={{
                boxSizing: 'border-box',
                width: '93.42px',
                height: '26px',
                borderRadius: '4px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} per page
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

