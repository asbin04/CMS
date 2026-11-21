import React from 'react';
import { Search, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { DeploymentFilterOptions } from '../types/deployment';

interface DeploymentFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  environment: string;
  onEnvironmentChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  handoverStatus: string;
  onHandoverStatusChange: (value: string) => void;
  onClearFilters: () => void;
  options: DeploymentFilterOptions;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
}

export const DeploymentFilterBar: React.FC<DeploymentFilterBarProps> = ({
  search,
  onSearchChange,
  environment,
  onEnvironmentChange,
  status,
  onStatusChange,
  handoverStatus,
  onHandoverStatusChange,
  onClearFilters,
  options,
  isFilterOpen,
  onToggleFilter,
}) => {
  return (
    <div className="p-4 sm:p-5 pb-3.5 flex flex-col gap-3.5 w-full bg-white font-['Inter']">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by Deployment ID, Project ID, Release Version..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all h-[38px]"
          />
        </div>

        {/* Action Buttons: Filters + Clear Filters */}
        <div className="flex items-center gap-3.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={onToggleFilter}
            className="flex items-center gap-2 h-[38px] px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none shadow-2xs"
            title={isFilterOpen ? 'Close filters' : 'Open filters'}
            aria-expanded={isFilterOpen}
          >
            <Filter size={15} className="text-slate-600" />
            <span>Filters</span>
          </button>

          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
          >
            <RotateCcw size={15} className="text-[#4F46E5]" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-0.5 w-full">
          {/* Environment */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-400 mb-1.5">Environment</label>
            <div className="relative">
              <select
                value={environment}
                onChange={(e) => onEnvironmentChange(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs h-[36px]"
              >
                <option value="All">All Environments</option>
                {options.environments?.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Deployment Status */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-400 mb-1.5">Deployment Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs h-[36px]"
              >
                <option value="All">All Status</option>
                {options.deploymentStatuses?.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Handover Status */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-400 mb-1.5">Handover Status</label>
            <div className="relative">
              <select
                value={handoverStatus}
                onChange={(e) => onHandoverStatusChange(e.target.value)}
                className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs h-[36px]"
              >
                <option value="All">All Status</option>
                {options.handoverStatuses?.map((hs) => (
                  <option key={hs} value={hs}>
                    {hs}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

