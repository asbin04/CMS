import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, Calendar, X } from 'lucide-react';
import { MasterClient } from '@/services/masterDataService';
import { SingleDatePicker } from '@/components/ui/SingleDatePicker';

interface ContractsFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedClient: string;
  setSelectedClient: (val: string) => void;
  selectedProposal: string;
  setSelectedProposal: (val: string) => void;
  selectedContractType: string;
  setSelectedContractType: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  startDateFilter: string;
  setStartDateFilter: (val: string) => void;
  endDateFilter: string;
  setEndDateFilter: (val: string) => void;
  renewalDateFilter: string;
  setRenewalDateFilter: (val: string) => void;
  isFiltersOpen: boolean;
  setIsFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClearFilters: () => void;
  clients: MasterClient[];
  proposalOptions: string[];
  contractTypeOptions: string[];
}

export const ContractsFilterBar: React.FC<ContractsFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedClient,
  setSelectedClient,
  selectedProposal,
  setSelectedProposal,
  selectedContractType,
  setSelectedContractType,
  selectedStatus,
  setSelectedStatus,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  renewalDateFilter,
  setRenewalDateFilter,
  isFiltersOpen,
  setIsFiltersOpen,
  onClearFilters,
  clients,
  proposalOptions,
  contractTypeOptions,
}) => {
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [isRenewalDatePickerOpen, setIsRenewalDatePickerOpen] = useState(false);

  return (
    <div className="p-4 sm:p-5 pb-0 flex flex-col gap-4 w-full box-border">
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
            placeholder="Search by Contract ID, Client ID, Proposal ID or Contract Type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Buttons: Filters + Clear Filters */}
        <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsFiltersOpen((prev) => !prev)}
            className="flex items-center gap-[8px] h-[34px] px-[14px] py-[8px] bg-white border border-[#4F46E5] hover:bg-indigo-50/40 text-[#4F46E5] rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer select-none"
          >
            <Filter size={15} className="text-[#4F46E5]" />
            <span>Filters</span>
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

      {isFiltersOpen && (
        <div className="flex flex-col gap-3.5 w-full">
          {/* Row 1: Client ID, Proposal ID, Contract Type, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
            {/* Client ID */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">
                Client ID
              </label>
              <div className="relative">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full appearance-none h-[34px] px-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All</option>
                  {clients.map((c) => {
                    const cName = c.companyName || c.clientName || c.name || c.id;
                    return (
                      <option key={c.id} value={c.id}>
                        {cName} ({c.id})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Proposal ID */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">
                Proposal ID
              </label>
              <div className="relative">
                <select
                  value={selectedProposal}
                  onChange={(e) => setSelectedProposal(e.target.value)}
                  className="w-full appearance-none h-[34px] px-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {proposalOptions.map((opt) => (
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

            {/* Contract Type */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">
                Contract Type
              </label>
              <div className="relative">
                <select
                  value={selectedContractType}
                  onChange={(e) => setSelectedContractType(e.target.value)}
                  className="w-full appearance-none h-[34px] px-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {contractTypeOptions.map((opt) => (
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
              <label className="text-xs font-medium text-slate-600 mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none h-[34px] px-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Expiring">Expiring</option>
                  <option value="Pending">Pending</option>
                  <option value="Terminated">Terminated</option>
                  <option value="Expired">Expired</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Start Date, End Date, Renewal Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
            {/* Start Date */}
            <div className="relative flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">
                Start Date
              </label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  aria-label="Filter by Start Date"
                  onClick={() => {
                    setIsStartDatePickerOpen((prev) => !prev);
                    setIsEndDatePickerOpen(false);
                    setIsRenewalDatePickerOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left cursor-pointer h-[34px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span
                      className={
                        startDateFilter ? 'text-slate-900 font-medium' : 'text-slate-400'
                      }
                    >
                      {startDateFilter || 'Select date'}
                    </span>
                  </div>
                </button>
                {startDateFilter && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStartDateFilter('');
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear date"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <SingleDatePicker
                value={startDateFilter}
                onChange={(date) => {
                  setStartDateFilter(date);
                  setIsStartDatePickerOpen(false);
                }}
                isOpen={isStartDatePickerOpen}
                onClose={() => setIsStartDatePickerOpen(false)}
                align="left"
              />
            </div>

            {/* End Date */}
            <div className="relative flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">
                End Date
              </label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  aria-label="Filter by End Date"
                  onClick={() => {
                    setIsEndDatePickerOpen((prev) => !prev);
                    setIsStartDatePickerOpen(false);
                    setIsRenewalDatePickerOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left cursor-pointer h-[34px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span
                      className={
                        endDateFilter ? 'text-slate-900 font-medium' : 'text-slate-400'
                      }
                    >
                      {endDateFilter || 'Select date'}
                    </span>
                  </div>
                </button>
                {endDateFilter && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEndDateFilter('');
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear date"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <SingleDatePicker
                value={endDateFilter}
                onChange={(date) => {
                  setEndDateFilter(date);
                  setIsEndDatePickerOpen(false);
                }}
                isOpen={isEndDatePickerOpen}
                onClose={() => setIsEndDatePickerOpen(false)}
                align="auto"
              />
            </div>

            {/* Renewal Date */}
            <div className="relative flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">
                Renewal Date
              </label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  aria-label="Filter by Renewal Date"
                  onClick={() => {
                    setIsRenewalDatePickerOpen((prev) => !prev);
                    setIsStartDatePickerOpen(false);
                    setIsEndDatePickerOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left cursor-pointer h-[34px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span
                      className={
                        renewalDateFilter ? 'text-slate-900 font-medium' : 'text-slate-400'
                      }
                    >
                      {renewalDateFilter || 'Select date'}
                    </span>
                  </div>
                </button>
                {renewalDateFilter && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenewalDateFilter('');
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear date"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <SingleDatePicker
                value={renewalDateFilter}
                onChange={(date) => {
                  setRenewalDateFilter(date);
                  setIsRenewalDatePickerOpen(false);
                }}
                isOpen={isRenewalDatePickerOpen}
                onClose={() => setIsRenewalDatePickerOpen(false)}
                align="right"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
