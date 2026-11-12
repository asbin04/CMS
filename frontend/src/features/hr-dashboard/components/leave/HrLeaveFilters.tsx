import React from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';
import { LeaveFilterState } from '../../types';

interface HrLeaveFiltersProps {
  filters: LeaveFilterState;
  onFilterChange: (filters: Partial<LeaveFilterState>) => void;
  onClearFilters: () => void;
}

export const HrLeaveFilters: React.FC<HrLeaveFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  return (
    <div className="p-5 sm:p-6 space-y-4">
      {/* Search Bar Row with Clear Filters button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input with left magnifying glass */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by Request ID, Employee Name, or Department..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-[#FAFAFA] border border-slate-200 rounded-xl focus:outline-none focus:border-[#4F46E5] focus:bg-white text-slate-900 placeholder:text-slate-400 transition-colors shadow-2xs"
          />
        </div>

        {/* Clear Filters */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={onClearFilters}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 stroke-[2.2]" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Select Controls Row (Leave Type, Status, Date) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Leave Type Dropdown */}
        <div>
          <label htmlFor="leave-filter-type" className="block text-xs font-medium text-slate-700 mb-1.5">
            Leave Type
          </label>
          <div className="relative">
            <select
              id="leave-filter-type"
              value={filters.leaveType}
              onChange={(e) => onFilterChange({ leaveType: e.target.value })}
              className="w-full h-10 px-3.5 pr-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer shadow-2xs transition-colors"
            >
              <option value="All">All Leave Types</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Earned Leave">Earned Leave</option>
              <option value="Maternity / Paternity">Maternity / Paternity</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Status Dropdown */}
        <div>
          <label htmlFor="leave-filter-status" className="block text-xs font-medium text-slate-700 mb-1.5">
            Approval Status
          </label>
          <div className="relative">
            <select
              id="leave-filter-status"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="w-full h-10 px-3.5 pr-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer shadow-2xs transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Date Filter */}
        <div>
          <label htmlFor="leave-filter-date" className="block text-xs font-medium text-slate-700 mb-1.5">
            Applied Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="leave-filter-date"
              value={filters.date}
              onChange={(e) => onFilterChange({ date: e.target.value })}
              className="w-full h-10 px-3.5 pr-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#4F46E5] cursor-pointer shadow-2xs transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

