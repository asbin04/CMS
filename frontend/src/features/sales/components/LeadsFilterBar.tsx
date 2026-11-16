import React, { useState } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  Calendar,
  ChevronDown,
  X,
} from 'lucide-react';
import { LeadsFilterState } from '../types/leads';
import { CalendarDateRangePicker } from '../../../components/ui/CalendarDateRangePicker';
import { SingleDatePicker } from '../../../components/ui/SingleDatePicker';

interface LeadsFilterBarProps {
  filterState: LeadsFilterState;
  onFilterChange: (updates: Partial<LeadsFilterState>) => void;
  onClearFilters: () => void;
}

export const LeadsFilterBar: React.FC<LeadsFilterBarProps> = ({
  filterState,
  onFilterChange,
  onClearFilters,
}) => {
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);
  const [isLeadDatePickerOpen, setIsLeadDatePickerOpen] = useState(false);
  const [isFollowUpDatePickerOpen, setIsFollowUpDatePickerOpen] = useState(false);

  const sourceOptions = [
    'All',
    'Website',
    'Referral',
    'LinkedIn',
    'Event',
    'Cold Call',
    'Partner',
    'Social Media',
    'Other',
  ];

  const serviceInterestOptions = [
    'All',
    'Web Development',
    'Mobile App',
    'AI Solutions',
    'ERP Solution',
    'E-commerce',
    'Digital Marketing',
    'Cloud & DevOps',
    'Custom Software',
    'UI/UX Design',
    'Cybersecurity',
  ];

  const countryOptions = [
    'All',
    'India',
    'United States',
    'United Arab Emirates',
    'Singapore',
    'United Kingdom',
  ];

  const cityOptions = [
    'All',
    'Mumbai',
    'Bengaluru',
    'Delhi NCR',
    'Pune',
    'Hyderabad',
    'Chennai',
    'New York',
    'Dubai',
    'Singapore',
  ];

  const ownerOptions = [
    'All',
    'Akshit Ujjain (CEO)',
    'Rajesh Sharma (Sales VP)',
    'Ananya Roy (Account Exec)',
    'Amit Patel (BDM)',
    'Neha Verma (Sales Mgr)',
  ];

  const stageOptions = [
    'All',
    'New',
    'Contacted',
    'Qualified',
    'Proposal Sent',
    'Negotiation',
    'Won',
    'Lost',
  ];

  const statusOptions = [
    'All',
    'Active',
    'Follow-up Required',
    'Converted',
    'Archived',
    'On Hold',
  ];

  return (
    <div className="p-4 sm:p-5 pb-0 flex flex-col gap-4 w-full">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by Lead ID, company, contact name, email or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Buttons: Filters + Clear Filters */}
        <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
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
      {showFiltersPanel && (
        <div className="flex flex-col gap-3.5">
          {/* Row 1: Lead Date, Source, Service Interest, Country, City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Lead Date */}
            <div className="relative flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Lead Date</label>
              <button
                type="button"
                onClick={() => setIsLeadDatePickerOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left"
              >
                <div className="flex items-center gap-2 truncate">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span className={filterState.leadDateRange ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    {filterState.leadDateRange || 'Select date range'}
                  </span>
                </div>
              </button>

              <CalendarDateRangePicker
                value={filterState.leadDateRange}
                onChange={(range) => onFilterChange({ leadDateRange: range })}
                isOpen={isLeadDatePickerOpen}
                onClose={() => setIsLeadDatePickerOpen(false)}
              />
            </div>

            {/* Source */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Source</label>
              <div className="relative">
                <select
                  value={filterState.source}
                  onChange={(e) => onFilterChange({ source: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {sourceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Service Interest */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Service Interest</label>
              <div className="relative">
                <select
                  value={filterState.serviceInterest}
                  onChange={(e) => onFilterChange({ serviceInterest: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {serviceInterestOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Country */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Country</label>
              <div className="relative">
                <select
                  value={filterState.country}
                  onChange={(e) => onFilterChange({ country: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {countryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* City */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">City</label>
              <div className="relative">
                <select
                  value={filterState.city}
                  onChange={(e) => onFilterChange({ city: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {cityOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
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

          {/* Row 2: Owner ID, Stage, Status, Next Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Owner ID */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Owner ID</label>
              <div className="relative">
                <select
                  value={filterState.ownerId}
                  onChange={(e) => onFilterChange({ ownerId: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {ownerOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Stage */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Stage</label>
              <div className="relative">
                <select
                  value={filterState.stage}
                  onChange={(e) => onFilterChange({ stage: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {stageOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Status</label>
              <div className="relative">
                <select
                  value={filterState.status}
                  onChange={(e) => onFilterChange({ status: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Next Follow-up */}
            <div className="relative flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Next Follow-up</label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  aria-label="Filter by Next Follow-up"
                  onClick={() => setIsFollowUpDatePickerOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span className={filterState.nextFollowUpDateRange ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                      {filterState.nextFollowUpDateRange || 'Select date'}
                    </span>
                  </div>
                </button>
                {filterState.nextFollowUpDateRange && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterChange({ nextFollowUpDateRange: '' });
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear date"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <SingleDatePicker
                value={filterState.nextFollowUpDateRange}
                onChange={(date) => onFilterChange({ nextFollowUpDateRange: date })}
                isOpen={isFollowUpDatePickerOpen}
                onClose={() => setIsFollowUpDatePickerOpen(false)}
                align="right"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
