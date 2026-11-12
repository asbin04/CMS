import React, { useState } from 'react';
import { Search, Filter, RotateCcw, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { LeaveFilterState } from '../types/leave';

interface LeaveFilterBarProps {
  filters: LeaveFilterState;
  onFilterChange: (updates: Partial<LeaveFilterState>) => void;
  onClearFilters: () => void;
  employeeOptions: { id: string; name: string }[];
  leaveTypeOptions: string[];
}

export const LeaveFilterBar: React.FC<LeaveFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  employeeOptions,
  leaveTypeOptions,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

  // Count active non-default filters
  const activeCount = [
    filters.dateRange,
    filters.employee !== 'All' ? filters.employee : '',
    filters.leaveType !== 'All' ? filters.leaveType : '',
    filters.approvalStatus !== 'All' ? filters.approvalStatus : '',
    filters.leaveStatus !== 'All' ? filters.leaveStatus : '',
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm mb-6 space-y-4">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by Leave ID, Employee ID or Employee Name..."
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors shadow-sm ${
              activeCount > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters{activeCount > 0 ? ` (${activeCount})` : ''}</span>
            {showAdvancedFilters ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50/50 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Second Row: 5 Dropdown Filters (collapsible) */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 animate-in fade-in duration-150">
          {/* Date Range */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-500">Date Range</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={filters.dateRange}
                onChange={(e) => onFilterChange({ dateRange: e.target.value })}
                placeholder="Oct 01, 2026 - Oct 31, 2026"
                className="w-full pl-9 pr-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Employee */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-500">Employee</label>
            <div className="relative">
              <select
                value={filters.employee}
                onChange={(e) => onFilterChange({ employee: e.target.value })}
                aria-label="Filter by Employee"
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="All">All Employees</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Leave Type */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-500">Leave Type</label>
            <div className="relative">
              <select
                value={filters.leaveType}
                onChange={(e) => onFilterChange({ leaveType: e.target.value })}
                aria-label="Filter by Leave Type"
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="All">All</option>
                {leaveTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Approval Status */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-500">Approval Status</label>
            <div className="relative">
              <select
                value={filters.approvalStatus}
                onChange={(e) => onFilterChange({ approvalStatus: e.target.value })}
                aria-label="Filter by Approval Status"
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Leave Status */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-500">Leave Status</label>
            <div className="relative">
              <select
                value={filters.leaveStatus}
                onChange={(e) => onFilterChange({ leaveStatus: e.target.value })}
                aria-label="Filter by Leave Status"
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
