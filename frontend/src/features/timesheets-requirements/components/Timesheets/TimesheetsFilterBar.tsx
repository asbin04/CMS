import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Download, Plus } from 'lucide-react';
import { MASTER_PROJECTS, MASTER_EMPLOYEES } from '../../mockData';
import { projectLookupService } from '../../services/projectLookupService';
import { ProjectOption, EmployeeOption } from '../../types';

interface TimesheetsFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  projectFilter: string;
  onProjectFilterChange: (val: string) => void;
  employeeFilter: string;
  onEmployeeFilterChange: (val: string) => void;
  approvalFilter: string;
  onApprovalFilterChange: (val: string) => void;
  billableFilter: string;
  onBillableFilterChange: (val: string) => void;
  onResetFilters?: () => void;
  onExport?: () => void;
  onLogTime?: () => void;
}

export const TimesheetsFilterBar: React.FC<TimesheetsFilterBarProps> = ({
  search,
  onSearchChange,
  projectFilter,
  onProjectFilterChange,
  employeeFilter,
  onEmployeeFilterChange,
  approvalFilter,
  onApprovalFilterChange,
  billableFilter,
  onBillableFilterChange,
  onExport,
  onLogTime,
}) => {
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>(MASTER_PROJECTS);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>(MASTER_EMPLOYEES);

  useEffect(() => {
    projectLookupService.getProjects().then(setProjectOptions).catch(() => {});
    projectLookupService.getEmployees().then(setEmployeeOptions).catch(() => {});
  }, []);

  const normalizedEmployeeValue =
    employeeFilter === 'All Employees' || !employeeFilter
      ? 'All Employees'
      : employeeOptions.find(
          (e) => e.id.toLowerCase() === employeeFilter.toLowerCase() || e.name.toLowerCase() === employeeFilter.toLowerCase()
        )?.id || employeeFilter;

  return (
    <div className="p-4 sm:p-5 pb-4 flex flex-col gap-3.5 w-full bg-white">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Timesheet ID, Employee ID, Project ID, Task ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-[38px] transition-colors"
          />
        </div>

        {/* Action Buttons: Export + Log Time */}
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

          {onLogTime && (
            <button
              type="button"
              onClick={onLogTime}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer h-[38px]"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Log Time</span>
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

        {/* Employee Filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-500 shrink-0">Employee</span>
          <div className="relative min-w-[170px]">
            <select
              value={normalizedEmployeeValue}
              onChange={(e) => onEmployeeFilterChange(e.target.value)}
              className="w-full h-[34px] pl-3 pr-8 text-xs font-normal text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              title="Select Employee"
            >
              <option value="All Employees">All Employees</option>
              {employeeOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
              {!employeeOptions.some((e) => e.id === normalizedEmployeeValue) && normalizedEmployeeValue !== 'All Employees' && (
                <option value={normalizedEmployeeValue}>
                  {employeeFilter}
                </option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Approval Status Filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-500 shrink-0">Approval Status</span>
          <div className="relative min-w-[140px]">
            <select
              value={approvalFilter}
              onChange={(e) => onApprovalFilterChange(e.target.value)}
              className="w-full h-[34px] pl-3 pr-8 text-xs font-normal text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              title="Select Approval Status"
            >
              <option value="All Status">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Billable Filter */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-500 shrink-0">Billable</span>
          <div className="relative min-w-[100px]">
            <select
              value={billableFilter}
              onChange={(e) => onBillableFilterChange(e.target.value)}
              className="w-full h-[34px] pl-3 pr-8 text-xs font-normal text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              title="Select Billable"
            >
              <option value="All">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
