import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';
import { HrDashboardFilterState } from '../types';

interface HrEmployeeFiltersProps {
  filters: HrDashboardFilterState;
  onFilterChange: (filters: Partial<HrDashboardFilterState>) => void;
  onClearFilters: () => void;
  onToggleFilters?: () => void;
  departments: string[];
  statuses: string[];
  employmentTypes: string[];
}

export const HrEmployeeFilters: React.FC<HrEmployeeFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  departments,
  statuses,
  employmentTypes,
}) => {
  return (
    <div className="p-5 sm:p-6 space-y-4">
      {/* Search Bar Row with Filters & Clear Filters buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input with left magnifying glass */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by Employee ID, Name, or Department..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-[#FAFAFA] border border-slate-200 rounded-xl focus:outline-none focus:border-[#4F46E5] focus:bg-white text-slate-900 placeholder:text-slate-400 transition-colors shadow-2xs"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 stroke-[2.2]" />
            <span>Filters</span>
          </button>

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

      {/* Filter Select Controls Row (Status, Department, Employment Type) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Status Dropdown */}
        <div>
          <label htmlFor="hr-filter-status" className="block text-xs font-medium text-slate-700 mb-1.5">
            Status
          </label>
          <div className="relative">
            <select
              id="hr-filter-status"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="w-full h-10 px-3.5 pr-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer shadow-2xs transition-colors"
            >
              <option value="All">All</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Department Dropdown */}
        <div>
          <label htmlFor="hr-filter-department" className="block text-xs font-medium text-slate-700 mb-1.5">
            Department
          </label>
          <div className="relative">
            <select
              id="hr-filter-department"
              value={filters.department}
              onChange={(e) => onFilterChange({ department: e.target.value })}
              className="w-full h-10 px-3.5 pr-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer shadow-2xs transition-colors"
            >
              <option value="All">All</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Employment Type Dropdown */}
        <div>
          <label htmlFor="hr-filter-employment-type" className="block text-xs font-medium text-slate-700 mb-1.5">
            Employment Type
          </label>
          <div className="relative">
            <select
              id="hr-filter-employment-type"
              value={filters.employmentType}
              onChange={(e) => onFilterChange({ employmentType: e.target.value })}
              className="w-full h-10 px-3.5 pr-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer shadow-2xs transition-colors"
            >
              <option value="All">All</option>
              {employmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
