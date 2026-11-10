import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, RotateCcw } from 'lucide-react';
import { MASTER_PROJECTS } from '../../mockData';
import { projectLookupService } from '../../services/projectLookupService';
import { ProjectOption } from '../../types';

interface RequirementsFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  projectFilter: string;
  onProjectFilterChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  onResetFilters?: () => void;
}

/* Shared dropdown styling adhering strictly to the Employee Exit design reference:
   Typography: text-xs (12px), font-normal (400), line-height: 16px, color: #1E293B
   Dimensions: Height 36px, Border: 1px solid #E2E8F0, Radius: 10px, Background: #FFFFFF */
const dropdownCls =
  'w-full h-[36px] pl-3 pr-8 text-xs font-normal text-[#1E293B] bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[10px] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-[#CBD5E1] transition-colors truncate';

const dropdownStyle: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: 'inherit',
  fontWeight: 400,
  lineHeight: '16px',
  color: '#1E293B',
  border: '1px solid #E2E8F0',
  borderRadius: '10px',
  backgroundColor: '#FFFFFF',
  height: '36px',
  padding: '6px 32px 6px 12px',
  boxSizing: 'border-box',
};

const optionCls = 'text-xs font-normal text-[#1E293B] bg-white py-1';

const optionStyle: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: 'inherit',
  fontWeight: 400,
  lineHeight: '16px',
  color: '#1E293B',
  backgroundColor: '#FFFFFF',
  padding: '4px 8px',
};

export const RequirementsFilterBar: React.FC<RequirementsFilterBarProps> = ({
  search,
  onSearchChange,
  projectFilter,
  onProjectFilterChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
}) => {
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>(MASTER_PROJECTS);

  useEffect(() => {
    projectLookupService.getProjects().then(setProjectOptions).catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 shadow-xs space-y-3">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by Requirement ID, Project ID, Feature or Description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-[10px] bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-300 transition-colors h-[38px]"
        />
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 items-center">
        {/* Project Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 shrink-0">Project</span>
          <div className="relative flex-1">
            <select
              value={projectFilter}
              onChange={(e) => onProjectFilterChange(e.target.value)}
              style={dropdownStyle}
              className={dropdownCls}
              title="Select Project"
            >
              <option value="All Projects" className={optionCls} style={optionStyle}>
                All Projects
              </option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id} className={optionCls} style={optionStyle}>
                  {p.id}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Requirement Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 shrink-0">Requirement Type</span>
          <div className="relative flex-1">
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              style={dropdownStyle}
              className={dropdownCls}
              title="Select Requirement Type"
            >
              <option value="All Types" className={optionCls} style={optionStyle}>
                All Types
              </option>
              <option value="Feature" className={optionCls} style={optionStyle}>
                Feature
              </option>
              <option value="Enhancement" className={optionCls} style={optionStyle}>
                Enhancement
              </option>
              <option value="New" className={optionCls} style={optionStyle}>
                New
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 shrink-0">Priority</span>
          <div className="relative flex-1">
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              style={dropdownStyle}
              className={dropdownCls}
              title="Select Priority"
            >
              <option value="All Priorities" className={optionCls} style={optionStyle}>
                All Priorities
              </option>
              <option value="High" className={optionCls} style={optionStyle}>
                High
              </option>
              <option value="Medium" className={optionCls} style={optionStyle}>
                Medium
              </option>
              <option value="Low" className={optionCls} style={optionStyle}>
                Low
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 shrink-0">Status</span>
          <div className="relative flex-1">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              style={dropdownStyle}
              className={dropdownCls}
              title="Select Status"
            >
              <option value="All Status" className={optionCls} style={optionStyle}>
                All Status
              </option>
              <option value="In Progress" className={optionCls} style={optionStyle}>
                In Progress
              </option>
              <option value="Pending Approval" className={optionCls} style={optionStyle}>
                Pending Approval
              </option>
              <option value="Completed" className={optionCls} style={optionStyle}>
                Completed
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Reset Filters Button */}
        {onResetFilters && (
          <div className="flex items-center justify-end sm:justify-start lg:justify-end">
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-[10px] h-[36px] transition-colors shrink-0 cursor-pointer shadow-2xs w-full sm:w-auto"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
