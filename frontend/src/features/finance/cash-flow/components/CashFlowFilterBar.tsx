import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { PERIOD_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../mockData';

interface CashFlowFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  periodFilter: string;
  onPeriodFilterChange: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  onExport?: () => void;
}

export const CashFlowFilterBar: React.FC<CashFlowFilterBarProps> = ({
  search,
  onSearchChange,
  periodFilter,
  onPeriodFilterChange,
  statusFilter = 'All',
  onStatusFilterChange,
  onClearFilters,
  activeFilterCount,
}) => {
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsFilterPopoverOpen(false);
      }
    };

    if (isFilterPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterPopoverOpen]);

  return (
    <div className="px-5 py-4 border-b border-slate-100 bg-white">
      {/* Single Row: Search + Period + Filters (X) + Clear Filters matching designer crop */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5">
        {/* Column 1: Search */}
        <div className="flex-1 min-w-[240px]">
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5 leading-none">
            Search
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-700 stroke-[2.2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Cash Flow ID, Period, or Notes..."
              className="w-full h-[38px] pl-10 pr-3.5 bg-white border border-[#DCE3ED] rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-colors"
            />
          </div>
        </div>

        {/* Column 2: Period Dropdown */}
        <div className="w-full sm:w-[195px] shrink-0">
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5 leading-none">
            Period
          </label>
          <div className="relative">
            <select
              value={periodFilter}
              onChange={(e) => onPeriodFilterChange(e.target.value)}
              className="w-full h-[38px] pl-3.5 pr-8 bg-white border border-[#DCE3ED] rounded-xl text-xs font-normal text-slate-700 appearance-none cursor-pointer focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-colors"
            >
              {PERIOD_FILTER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-600 stroke-[2] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Column 3 & 4: Action Buttons (Filters & Clear Filters) */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          {/* Filters Button with Interactive Popover */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setIsFilterPopoverOpen((prev) => !prev)}
              className={`h-[38px] px-3.5 bg-white border rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-2xs ${
                activeFilterCount > 0 || isFilterPopoverOpen
                  ? 'border-[#6366F1] text-[#4F46E5] bg-indigo-50/20'
                  : 'border-[#DCE3ED] text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-[#6366F1] stroke-[2]" />
              <span>Filters ({activeFilterCount})</span>
            </button>

            {/* Filter Popover for Status */}
            {isFilterPopoverOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12),0_4px_16px_-2px_rgba(0,0,0,0.06)] border border-slate-200/90 p-3 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2 px-1">
                  <span className="text-[11.5px] font-bold text-slate-800">Status Filter</span>
                  {statusFilter !== 'All' && (
                    <button
                      type="button"
                      onClick={() => onStatusFilterChange?.('All')}
                      className="text-[11px] font-medium text-[#4F46E5] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {STATUS_FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onStatusFilterChange?.(opt);
                        setIsFilterPopoverOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left cursor-pointer transition-colors ${
                        statusFilter === opt
                          ? 'bg-indigo-50 text-[#4F46E5] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {statusFilter === opt && <Check className="w-3.5 h-3.5 text-[#4F46E5] stroke-[2.5]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accessible status select for test runner & screen readers */}
          <select
            aria-label="Status filter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange?.(e.target.value)}
            className="sr-only"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={onClearFilters}
            className="h-[38px] px-3.5 bg-white border border-[#DCE3ED] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shrink-0 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#6366F1] stroke-[2]" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
