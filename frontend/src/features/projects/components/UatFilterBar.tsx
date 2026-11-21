import React from 'react';
import { Search, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { UatFilterOptions } from '../types/uat';

interface UatFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedProject: string;
  onProjectChange: (project: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedApproval: string;
  onApprovalChange: (approval: string) => void;
  selectedTester: string;
  onTesterChange: (tester: string) => void;
  filterOptions: UatFilterOptions;
  onClearFilters: () => void;
  activeFilterCount: number;
  isFiltersOpen?: boolean;
  onToggleFilters?: () => void;
}

export const UatFilterBar: React.FC<UatFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedProject,
  onProjectChange,
  selectedStatus,
  onStatusChange,
  selectedApproval,
  onApprovalChange,
  selectedTester,
  onTesterChange,
  filterOptions,
  onClearFilters,
  activeFilterCount,
  isFiltersOpen: externalIsFiltersOpen,
  onToggleFilters,
}) => {
  const [internalIsFiltersOpen, setInternalIsFiltersOpen] = React.useState(true);
  const isFiltersOpen = externalIsFiltersOpen !== undefined ? externalIsFiltersOpen : internalIsFiltersOpen;

  const handleToggleFilters = () => {
    if (onToggleFilters) {
      onToggleFilters();
    } else {
      setInternalIsFiltersOpen((prev) => !prev);
    }
  };

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-4 border-b border-slate-200 w-full bg-white">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by UAT ID, Project ID, Requirement ID, Test Case..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Action Buttons: Filters + Clear Filters */}
        <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleToggleFilters}
            className="flex items-center gap-[8px] h-[34px] px-[14px] py-[8px] bg-white border border-[#4F46E5] hover:bg-indigo-50/40 text-[#4F46E5] rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer select-none"
            title={isFiltersOpen ? 'Close all filters' : 'Open all filters'}
            aria-expanded={isFiltersOpen}
          >
            <Filter size={15} className="text-[#4F46E5]" />
            <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
            <ChevronDown
              size={15}
              className={`text-[#4F46E5] transition-transform duration-200 ${
                isFiltersOpen ? '' : '-rotate-180'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-1 py-2 text-[13px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer"
          >
            <RotateCcw size={15} className="text-[#4F46E5]" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      {isFiltersOpen && (
        <div
          data-testid="uat-filter-dropdowns-row"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1"
        >
          {/* 1. Project Dropdown */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 mb-1.5">Project</label>
            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => onProjectChange(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All Projects</option>
                {filterOptions.projects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* 2. Status Dropdown */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 mb-1.5">Status</label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All Status</option>
                {filterOptions.statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* 3. Client Approval Dropdown */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 mb-1.5">Client Approval</label>
            <div className="relative">
              <select
                value={selectedApproval}
                onChange={(e) => onApprovalChange(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All</option>
                {filterOptions.clientApprovals.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* 4. Tester Dropdown */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 mb-1.5">Tester</label>
            <div className="relative">
              <select
                value={selectedTester}
                onChange={(e) => onTesterChange(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All incubation/Testers</option>
                {filterOptions.testers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

