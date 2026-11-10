import React from 'react';
import { Search, Filter, RotateCcw, Download, ChevronDown } from 'lucide-react';
import { PERIOD_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../mockData';

interface CashFlowFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  periodFilter: string;
  onPeriodFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  onExport?: () => void;
}

export const CashFlowFilterBar: React.FC<CashFlowFilterBarProps> = ({
  search,
  onSearchChange,
  periodFilter,
  onPeriodFilterChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  activeFilterCount,
  onExport,
}) => {
  return (
    <div className="p-5 border-b border-slate-100 flex flex-col gap-3.5 bg-white">
      {/* Row 1: Search + Filters Count + Clear Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-700 stroke-[2.2] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Cash Flow ID, Period, or Notes..."
            className="w-full h-10 pl-10 pr-3.5 bg-white border border-[#DCE3ED] rounded-[10px] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-colors"
          />
        </div>

        <button
          type="button"
          className="h-10 px-3.5 bg-white border border-[#DCE3ED] hover:bg-slate-50 text-slate-700 rounded-[10px] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shrink-0 shadow-2xs"
        >
          <Filter className="w-3.5 h-3.5 text-[#6366F1] stroke-[2]" />
          <span>Filters ({activeFilterCount})</span>
        </button>

        <button
          type="button"
          onClick={onClearFilters}
          className="h-10 px-3.5 bg-white border border-[#DCE3ED] hover:bg-slate-50 text-slate-700 rounded-[10px] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shrink-0 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#6366F1] stroke-[2]" />
          <span>Clear Filters</span>
        </button>
      </div>

      {/* Row 2: Period (flex-1) + Status (flex-1) + Export Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5">
          {/* Period Dropdown */}
          <div className="flex-1 flex flex-col">
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 leading-none">
              Period
            </label>
            <div className="relative">
              <select
                value={periodFilter}
                onChange={(e) => onPeriodFilterChange(e.target.value)}
                className="w-full h-10 pl-3.5 pr-8 bg-white border border-[#DCE3ED] rounded-[10px] text-xs font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-colors"
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

          {/* Status Dropdown */}
          <div className="flex-1 flex flex-col">
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 leading-none">
              Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full h-10 pl-3.5 pr-8 bg-white border border-[#DCE3ED] rounded-[10px] text-xs font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-colors"
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-600 stroke-[2] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Section Export Button */}
        <button
          type="button"
          onClick={onExport}
          className="h-10 px-3.5 bg-white border border-[#DCE3ED] hover:bg-slate-50 text-slate-700 rounded-[10px] text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-600 stroke-[2]" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};
