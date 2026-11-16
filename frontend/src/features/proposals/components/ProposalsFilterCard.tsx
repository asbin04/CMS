import React, { useState } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  ChevronDown,
  Calendar,
  X,
} from 'lucide-react';
import { ProposalFilters } from '../types';
import { SingleDatePicker } from '../../../components/ui/SingleDatePicker';

interface ProposalsFilterCardProps {
  filters: ProposalFilters;
  onFilterChange: (key: keyof ProposalFilters, value: string) => void;
  onClearFilters: () => void;
  ownerOptions: string[];
  clientOptions: string[];
  opportunityOptions: string[];
  serviceOptions: string[];
}

export const ProposalsFilterCard: React.FC<ProposalsFilterCardProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  ownerOptions,
  clientOptions,
  opportunityOptions,
  serviceOptions,
}) => {
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);
  const [isProposalDatePickerOpen, setIsProposalDatePickerOpen] = useState(false);
  const [isValidUntilPickerOpen, setIsValidUntilPickerOpen] = useState(false);
  const [isDecisionDatePickerOpen, setIsDecisionDatePickerOpen] = useState(false);

  const statusOptions = ['All', 'Sent', 'Pending', 'Approved', 'In Review', 'Rejected'];

  const selectCls =
    'w-full appearance-none h-[34px] px-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer';

  return (
    <div className="p-4 sm:p-5 pb-0 flex flex-col gap-4 w-full">
      {/* ── Top Row: Search bar + action buttons ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by Proposal ID, title, Client ID or Opportunity ID..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Buttons: Filters + Clear Filters */}
        <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
          {/* Filters Toggle Button matching Leads page */}
          <button
            type="button"
            onClick={() => setShowFiltersPanel((prev) => !prev)}
            className="flex items-center gap-[8px] h-[34px] px-[14px] py-[8px] bg-white border border-[#4F46E5] hover:bg-indigo-50/40 text-[#4F46E5] rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer select-none"
          >
            <Filter size={15} className="text-[#4F46E5]" />
            <span>Filters</span>
            <ChevronDown
              size={15}
              className={`text-[#4F46E5] transition-transform duration-200 ${
                showFiltersPanel ? '' : '-rotate-180'
              }`}
            />
          </button>

          {/* Clear Filters Button matching Leads page */}
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

      {/* ── Filter Dropdowns & Date Pickers ── */}
      {showFiltersPanel && (
        <div className="flex flex-col gap-3.5 w-full">
          {/* Row 1: 5 Dropdown filters (Status, Owner ID, Client ID, Opportunity ID, Service ID) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
            {/* Status */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Status</label>
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className={selectCls}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Owner ID */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Owner ID</label>
              <div className="relative">
                <select
                  value={filters.ownerId}
                  onChange={(e) => onFilterChange('ownerId', e.target.value)}
                  className={selectCls}
                >
                  {ownerOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Client ID */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Client ID</label>
              <div className="relative">
                <select
                  value={filters.clientId}
                  onChange={(e) => onFilterChange('clientId', e.target.value)}
                  className={selectCls}
                >
                  {clientOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Opportunity ID */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Opportunity ID</label>
              <div className="relative">
                <select
                  value={filters.opportunityId}
                  onChange={(e) => onFilterChange('opportunityId', e.target.value)}
                  className={selectCls}
                >
                  {opportunityOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Service ID */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Service ID</label>
              <div className="relative">
                <select
                  value={filters.serviceId}
                  onChange={(e) => onFilterChange('serviceId', e.target.value)}
                  className={selectCls}
                >
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: 3 Single Date Pickers (Proposal Date, Valid Until, Expected Decision Date) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
            {/* Proposal Date */}
            <div className="relative flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Proposal Date</label>
              <button
                type="button"
                aria-label="Filter by Proposal Date"
                onClick={() => {
                  setIsProposalDatePickerOpen((prev) => !prev);
                  setIsValidUntilPickerOpen(false);
                  setIsDecisionDatePickerOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 h-[34px] bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span className={filters.proposalDateRange ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    {filters.proposalDateRange || 'Select date'}
                  </span>
                </div>
                {filters.proposalDateRange && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterChange('proposalDateRange', '');
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear date"
                  >
                    <X size={14} />
                  </span>
                )}
              </button>

              <SingleDatePicker
                value={filters.proposalDateRange}
                onChange={(date) => {
                  onFilterChange('proposalDateRange', date);
                  setIsProposalDatePickerOpen(false);
                }}
                isOpen={isProposalDatePickerOpen}
                onClose={() => setIsProposalDatePickerOpen(false)}
                align="left"
              />
            </div>

            {/* Valid Until */}
            <div className="relative flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Valid Until</label>
              <button
                type="button"
                aria-label="Filter by Valid Until"
                onClick={() => {
                  setIsValidUntilPickerOpen((prev) => !prev);
                  setIsProposalDatePickerOpen(false);
                  setIsDecisionDatePickerOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 h-[34px] bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span className={filters.validUntilRange ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    {filters.validUntilRange || 'Select date'}
                  </span>
                </div>
                {filters.validUntilRange && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterChange('validUntilRange', '');
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear date"
                  >
                    <X size={14} />
                  </span>
                )}
              </button>

              <SingleDatePicker
                value={filters.validUntilRange}
                onChange={(date) => {
                  onFilterChange('validUntilRange', date);
                  setIsValidUntilPickerOpen(false);
                }}
                isOpen={isValidUntilPickerOpen}
                onClose={() => setIsValidUntilPickerOpen(false)}
                align="auto"
              />
            </div>

            {/* Expected Decision Date */}
            <div className="relative flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Expected Decision Date</label>
              <button
                type="button"
                aria-label="Filter by Expected Decision Date"
                onClick={() => {
                  setIsDecisionDatePickerOpen((prev) => !prev);
                  setIsProposalDatePickerOpen(false);
                  setIsValidUntilPickerOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 h-[34px] bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span className={filters.expectedDecisionDateRange ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    {filters.expectedDecisionDateRange || 'Select date'}
                  </span>
                </div>
                {filters.expectedDecisionDateRange && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterChange('expectedDecisionDateRange', '');
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear date"
                  >
                    <X size={14} />
                  </span>
                )}
              </button>

              <SingleDatePicker
                value={filters.expectedDecisionDateRange}
                onChange={(date) => {
                  onFilterChange('expectedDecisionDateRange', date);
                  setIsDecisionDatePickerOpen(false);
                }}
                isOpen={isDecisionDatePickerOpen}
                onClose={() => setIsDecisionDatePickerOpen(false)}
                align="right"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
