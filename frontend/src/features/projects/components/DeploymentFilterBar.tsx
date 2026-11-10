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
    <div className="flex flex-col p-4 gap-3.5 w-full bg-white border-b border-[#E2E8F0] font-['Inter']">
      {/* Search and Action Buttons Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by Deployment ID, Project ID, Release Version..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-[36px] pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] text-[12px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={onToggleFilter}
            className={`flex items-center gap-1.5 px-3 h-[36px] border rounded-[8px] text-[12px] font-medium transition-colors cursor-pointer ${
              isFilterOpen
                ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4F46E5]'
                : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Filters</span>
          </button>

          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 h-[36px] bg-white border border-[#E2E8F0] rounded-[8px] text-[12px] font-medium text-[#4F46E5] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Expandable Dropdowns Row */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 w-full">
          {/* Environment */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#64748B]">Environment</label>
            <div className="relative">
              <select
                value={environment}
                onChange={(e) => onEnvironmentChange(e.target.value)}
                className="w-full h-[34px] px-3 pr-8 bg-white border border-[#E2E8F0] rounded-[8px] text-[12px] text-[#334155] font-medium focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer"
              >
                <option value="All">All Environments</option>
                {options.environments?.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          {/* Deployment Status */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#64748B]">Deployment Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full h-[34px] px-3 pr-8 bg-white border border-[#E2E8F0] rounded-[8px] text-[12px] text-[#334155] font-medium focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer"
              >
                <option value="All">All Status</option>
                {options.deploymentStatuses?.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          {/* Handover Status */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#64748B]">Handover Status</label>
            <div className="relative">
              <select
                value={handoverStatus}
                onChange={(e) => onHandoverStatusChange(e.target.value)}
                className="w-full h-[34px] px-3 pr-8 bg-white border border-[#E2E8F0] rounded-[8px] text-[12px] text-[#334155] font-medium focus:outline-none focus:border-[#4F46E5] appearance-none cursor-pointer"
              >
                <option value="All">All Status</option>
                {options.handoverStatuses?.map((hs) => (
                  <option key={hs} value={hs}>
                    {hs}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

