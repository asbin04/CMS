import React from 'react';
import { Search, Filter, RotateCcw, ChevronDown, Calendar } from 'lucide-react';
import { ExitFilters } from '../../types';

interface EmployeeExitFilterCardProps {
  filters: ExitFilters;
  onFilterChange: <K extends keyof ExitFilters>(key: K, value: ExitFilters[K]) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export const EmployeeExitFilterCard: React.FC<EmployeeExitFilterCardProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}) => {
  /* Shared dropdown styling adhering strictly to Figma Inspector specifications:
     Height: 30px, Radius: 8px, Border: 1px solid #E2E8F0 on all sides, Background: #FFFFFF */
  const dropdownBaseCls =
    'w-full h-[30px] py-[6px] text-xs font-normal text-[#1E293B] bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[8px] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-[#CBD5E1] transition-colors';

  const dropdownInlineStyle: React.CSSProperties = {
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    height: '30px',
    boxSizing: 'border-box',
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-soft flex flex-col gap-3.5 w-full">
      {/* Row 1: Search Input & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        {/* Search Field */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by Exit ID, Employee ID, or Employee Name..."
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box',
            }}
            className="w-full h-[38px] pl-10 pr-4 text-xs font-normal text-slate-800 placeholder-slate-400 bg-white border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-[#CBD5E1] transition-all shadow-2xs"
          />
        </div>

        {/* Filters Count Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box',
            }}
            className="inline-flex items-center gap-1.5 px-3.5 h-[38px] rounded-[8px] border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
          </button>

          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-3 h-[38px] rounded-[8px] text-[#4338CA] hover:text-[#3730A3] hover:bg-indigo-50/50 text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Row 2: 5 Dropdowns strictly matching Figma Inspector specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-0.5">
        {/* 1. Exit Status */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[12px] font-medium text-[#475569]">Exit Status</label>
          <div className="relative">
            <select
              value={filters.exitStatus}
              onChange={(e) => onFilterChange('exitStatus', e.target.value)}
              style={{
                ...dropdownInlineStyle,
                padding: '6px 32px 6px 10px',
              }}
              className={`${dropdownBaseCls} pl-[10px] pr-[32px]`}
            >
              <option value="All">All</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="In Review">In Review</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 2. Exit Type */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[12px] font-medium text-[#475569]">Exit Type</label>
          <div className="relative">
            <select
              value={filters.exitType}
              onChange={(e) => onFilterChange('exitType', e.target.value)}
              style={{
                ...dropdownInlineStyle,
                padding: '6px 32px 6px 10px',
              }}
              className={`${dropdownBaseCls} pl-[10px] pr-[32px]`}
            >
              <option value="All">All</option>
              <option value="Resignation">Resignation</option>
              <option value="Termination">Termination</option>
              <option value="Retirement">Retirement</option>
              <option value="Absconding">Absconding</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 3. Notice Period (Matches Figma Inspector: 177.6px Fill x 30px Hug, radius 8px, border 1px #E2E8F0, padding 6px 32px 6px 10px, fill #FFFFFF) */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[12px] font-medium text-[#475569]">Notice Period</label>
          <div className="relative">
            <select
              id="notice-period-dropdown"
              value={filters.noticePeriod}
              onChange={(e) => onFilterChange('noticePeriod', e.target.value)}
              style={{
                ...dropdownInlineStyle,
                padding: '6px 32px 6px 10px',
              }}
              className={`${dropdownBaseCls} pl-[10px] pr-[32px]`}
            >
              <option value="All">All</option>
              <option value="10">10 Days</option>
              <option value="15">15 Days</option>
              <option value="20">20 Days</option>
              <option value="30">30 Days</option>
              <option value="45">45 Days</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 4. Approval Status */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[12px] font-medium text-[#475569]">Approval Status</label>
          <div className="relative">
            <select
              value={filters.approvalStatus}
              onChange={(e) => onFilterChange('approvalStatus', e.target.value)}
              style={{
                ...dropdownInlineStyle,
                padding: '6px 32px 6px 10px',
              }}
              className={`${dropdownBaseCls} pl-[10px] pr-[32px]`}
            >
              <option value="All">All</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="In Review">In Review</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 5. Date Range */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[12px] font-medium text-[#475569]">Date Range</label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
              style={{
                ...dropdownInlineStyle,
                padding: '6px 32px 6px 28px',
              }}
              className={`${dropdownBaseCls} pl-[28px] pr-[32px]`}
            >
              <option value="All Time">All Time</option>
              <option value="This Month">This Month (Oct 2026)</option>
              <option value="Last Month">Last Month (Sep 2026)</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
