import React, { useState } from 'react';
import { Search, Filter, RotateCcw, Calendar, ChevronDown } from 'lucide-react';
import { ClientsFilterState } from '../types/clients';
import { CalendarDateRangePicker } from '../../../components/ui/CalendarDateRangePicker';

interface ClientsFilterBarProps {
  filterState: ClientsFilterState;
  onFilterChange: (updates: Partial<ClientsFilterState>) => void;
  onClearFilters: () => void;
}

export const ClientsFilterBar: React.FC<ClientsFilterBarProps> = ({
  filterState,
  onFilterChange,
  onClearFilters,
}) => {
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const statusOptions = ['All', 'Active', 'Pending', 'Prospect', 'Suspended', 'Inactive'];
  const clientTypeOptions = ['All', 'Enterprise', 'SMB', 'Startup', 'Government'];
  const industryOptions = [
    'All',
    'IT Services',
    'Manufacturing',
    'Education',
    'Healthcare',
    'Real Estate',
    'Renewable Energy',
    'Finance',
    'Logistics',
    'E-commerce',
  ];
  const countryOptions = ['All', 'India', 'United States', 'United Kingdom', 'UAE', 'Singapore'];
  const cityOptions = [
    'All',
    'Bangalore',
    'Mumbai',
    'Delhi',
    'Hyderabad',
    'Pune',
    'Chennai',
    'Kolkata',
    'Ahmedabad',
  ];
  const accountOwnerOptions = [
    'All',
    'Akshit Ujjain',
    'Rohan Sharma',
    'Priya Patel',
    'Sneha Reddy',
    'Amit Patel',
    'Neha Verma',
  ];

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-4 border-b border-slate-100 w-full">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search Input on the Left */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3B82F6] pointer-events-none"
          />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by client ID, client name, company, email or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Buttons on the Right: Filters + Clear Filters */}
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

      {/* Filter Section: Clean, Organized Grid matching Leads layout */}
      {showFiltersPanel && (
        <div className="flex flex-col gap-3.5 pb-1">
          {/* Row 1: 6 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Status */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Status</label>
              <div className="relative">
                <select
                  value={filterState.status}
                  onChange={(e) => onFilterChange({ status: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
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

            {/* Client Type */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Client Type</label>
              <div className="relative">
                <select
                  value={filterState.clientType}
                  onChange={(e) => onFilterChange({ clientType: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
                >
                  {clientTypeOptions.map((opt) => (
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

            {/* Industry */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Industry</label>
              <div className="relative">
                <select
                  value={filterState.industry}
                  onChange={(e) => onFilterChange({ industry: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
                >
                  {industryOptions.map((opt) => (
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
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
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
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
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

            {/* Account Owner */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Account Owner</label>
              <div className="relative">
                <select
                  value={filterState.accountOwner}
                  onChange={(e) => onFilterChange({ accountOwner: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-2xs"
                >
                  {accountOwnerOptions.map((opt) => (
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

          {/* Row 2: Onboarding Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="relative flex flex-col sm:col-span-2 lg:col-span-2">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Onboarding Date</label>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span className={filterState.onboardingDateRange ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                    {filterState.onboardingDateRange || 'Select date range'}
                  </span>
                </div>
              </button>

              <CalendarDateRangePicker
                value={filterState.onboardingDateRange}
                onChange={(range) => onFilterChange({ onboardingDateRange: range })}
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
