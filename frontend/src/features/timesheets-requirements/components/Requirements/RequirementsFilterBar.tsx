import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, RotateCcw } from 'lucide-react';
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
  onExport?: () => void;
  onAddRequirement?: () => void;
}

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
  onExport,
  onAddRequirement,
}) => {
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);

  useEffect(() => {
    projectLookupService.getProjects().then(setProjectOptions).catch(() => { });
  }, []);

  return (
    <div className="p-4 sm:p-5 pb-4 flex flex-col gap-3.5 w-full bg-white">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Requirement ID, Project ID, Feature or Description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-[38px] transition-colors"
          />
        </div>

        {/* Action Buttons: Export + Add Requirement */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer h-[38px]"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                color: '#334155',
              }}
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export</span>
            </button>
          )}

          {onAddRequirement && (
            <button
              type="button"
              onClick={onAddRequirement}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer h-[38px]"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add Requirement</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
        {/* Project Filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-500 shrink-0">Project</span>
          <div className="relative min-w-[160px]">
            <select
              value={projectFilter}
              onChange={(e) => onProjectFilterChange(e.target.value)}
              className="w-full h-[34px] pl-3 pr-8 text-xs font-normal text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              title="Select Project"
            >
              <option value="All Projects">All Projects</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Requirement Type Filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-500 shrink-0">Requirement Type</span>
          <div className="relative min-w-[160px]">
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="w-full h-[34px] pl-3 pr-8 text-xs font-normal text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              title="Select Requirement Type"
            >
              <option value="All Types">All Types</option>
              <option value="Feature">Feature</option>
              <option value="Enhancement">Enhancement</option>
              <option value="Bug Fix">Bug Fix</option>
              <option value="Integration">Integration</option>
              <option value="Performance">Performance</option>
              <option value="Security">Security</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-500 shrink-0">Priority</span>
          <div className="relative min-w-[140px]">
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="w-full h-[34px] pl-3 pr-8 text-xs font-normal text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              title="Select Priority"
            >
              <option value="All Priorities">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Critical">Critical</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-500 shrink-0">Status</span>
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full h-[34px] pl-3 pr-8 text-xs font-normal text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              title="Select Status"
            >
              <option value="All Status">All Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending Approval">Pending Approval</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
