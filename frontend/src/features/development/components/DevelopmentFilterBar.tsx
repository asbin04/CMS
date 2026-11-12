import React from 'react';
import { Search, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import {
  PROJECT_OPTIONS,
  ENVIRONMENT_OPTIONS,
  STATUS_OPTIONS,
  REVIEW_STATUS_OPTIONS,
} from '../mockData';

interface DevelopmentFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  projectFilter: string;
  onProjectFilterChange: (value: string) => void;
  environmentFilter: string;
  onEnvironmentFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  reviewStatusFilter: string;
  onReviewStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #DCE3ED',
  backgroundColor: '#FFFFFF',
  borderRadius: '10px',
  boxSizing: 'border-box',
};

const filterButtonStyle: React.CSSProperties = {
  border: '1px solid #DCE3ED',
  backgroundColor: '#FFFFFF',
  borderRadius: '10px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  border: '1px solid #DCE3ED',
  backgroundColor: '#FFFFFF',
  borderRadius: '10px',
  boxSizing: 'border-box',
};

export const DevelopmentFilterBar: React.FC<DevelopmentFilterBarProps> = ({
  search,
  onSearchChange,
  projectFilter,
  onProjectFilterChange,
  environmentFilter,
  onEnvironmentFilterChange,
  statusFilter,
  onStatusFilterChange,
  reviewStatusFilter,
  onReviewStatusFilterChange,
  onClearFilters,
  activeFilterCount,
}) => {
  return (
    <div className="p-4 sm:p-5 space-y-4 border-b border-[#DCE3ED] bg-white">
      {/* Top Search & Filter Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input: visible light-grey 1px border (#DCE3ED) with rounded corners (10px) */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Development ID, Project ID, Requirement ID, Task ID, Developer..."
            className="development-search-input w-full h-[40px] pl-10 pr-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
            style={inputStyle}
          />
        </div>

        {/* Right Filter Status & Reset Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          {/* Filters Button: visible light-grey border (#DCE3ED), rounded corners (10px) and subtle shadow */}
          <button
            type="button"
            className="development-filter-button h-[40px] px-4 text-slate-700 text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0 transition-all hover:bg-slate-50"
            style={filterButtonStyle}
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
          </button>

          {/* Clear Filters Button: preserved reference design and indigo icon styling */}
          <button
            type="button"
            onClick={onClearFilters}
            className="h-[40px] px-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-[10px] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Bottom Dropdowns Row with Labels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Project Dropdown: visible light-grey 1px border (#DCE3ED), rounded-[10px] */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
            Project
          </label>
          <div className="relative">
            <select
              value={projectFilter}
              onChange={(e) => onProjectFilterChange(e.target.value)}
              className="development-filter-select w-full h-[38px] pl-3.5 pr-8 text-xs font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none transition-colors"
              style={selectStyle}
            >
              {PROJECT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Environment Dropdown: visible light-grey 1px border (#DCE3ED), rounded-[10px] */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
            Environment
          </label>
          <div className="relative">
            <select
              value={environmentFilter}
              onChange={(e) => onEnvironmentFilterChange(e.target.value)}
              className="development-filter-select w-full h-[38px] pl-3.5 pr-8 text-xs font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none transition-colors"
              style={selectStyle}
            >
              {ENVIRONMENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Status Dropdown: visible light-grey 1px border (#DCE3ED), rounded-[10px] */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
            Status
          </label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="development-filter-select w-full h-[38px] pl-3.5 pr-8 text-xs font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none transition-colors"
              style={selectStyle}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Review Status Dropdown: visible light-grey 1px border (#DCE3ED), rounded-[10px] */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
            Review Status
          </label>
          <div className="relative">
            <select
              value={reviewStatusFilter}
              onChange={(e) => onReviewStatusFilterChange(e.target.value)}
              className="development-filter-select w-full h-[38px] pl-3.5 pr-8 text-xs font-medium text-slate-700 appearance-none cursor-pointer focus:outline-none transition-colors"
              style={selectStyle}
            >
              {REVIEW_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
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
