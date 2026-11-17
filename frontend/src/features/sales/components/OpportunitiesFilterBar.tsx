import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, Calendar, X } from 'lucide-react';
import { MasterEmployee, MasterClient } from '@/services/masterDataService';
import { SingleDatePicker } from '../../../components/ui/SingleDatePicker';

interface OpportunitiesFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedStage: string;
  setSelectedStage: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedOwner: string;
  setSelectedOwner: (val: string) => void;
  selectedClient: string;
  setSelectedClient: (val: string) => void;
  selectedService: string;
  setSelectedService: (val: string) => void;
  expectedCloseDateFilter: string;
  setExpectedCloseDateFilter: (val: string) => void;
  lastContactFilter: string;
  setLastContactFilter: (val: string) => void;
  nextFollowUpFilter: string;
  setNextFollowUpFilter: (val: string) => void;
  isFiltersOpen: boolean;
  setIsFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClearFilters: () => void;
  employees: MasterEmployee[];
  clients: MasterClient[];
  services: string[];
}

export const OpportunitiesFilterBar: React.FC<OpportunitiesFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedStage,
  setSelectedStage,
  selectedStatus,
  setSelectedStatus,
  selectedOwner,
  setSelectedOwner,
  selectedClient,
  setSelectedClient,
  selectedService,
  setSelectedService,
  expectedCloseDateFilter,
  setExpectedCloseDateFilter,
  lastContactFilter,
  setLastContactFilter,
  nextFollowUpFilter,
  setNextFollowUpFilter,
  isFiltersOpen,
  setIsFiltersOpen,
  onClearFilters,
  employees,
  clients,
  services,
}) => {
  const [isExpectedCloseOpen, setIsExpectedCloseOpen] = useState(false);
  const [isNextFollowUpOpen, setIsNextFollowUpOpen] = useState(false);
  const [isLastContactOpen, setIsLastContactOpen] = useState(false);

  const handleClearAll = () => {
    setIsExpectedCloseOpen(false);
    setIsNextFollowUpOpen(false);
    setIsLastContactOpen(false);
    onClearFilters();
  };

  return (
    <div className="p-4 sm:p-5 pb-0 flex flex-col gap-3.5 w-full box-border">
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
            placeholder="Search by Opportunity ID, name, Lead ID or Client ID..."
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
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-1 py-2 text-[13px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer"
          >
            <RotateCcw size={15} className="text-[#4F46E5]" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="flex flex-col gap-3.5 w-full">
          {/* Row 1: Stage, Status, Owner ID, Client ID, Service ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
            {/* Stage */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Stage</label>
              <div className="relative">
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full appearance-none h-[34px] px-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="New">New</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Status</label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none h-[34px] px-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Owner ID */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Owner ID</label>
              <div className="relative">
                <select
                  value={selectedOwner}
                  onChange={(e) => setSelectedOwner(e.target.value)}
                  className="w-full appearance-none h-[34px] px-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All</option>
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.fullName} ({emp.employeeId})
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
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full appearance-none h-[34px] px-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All</option>
                  {clients.map((c) => {
                    const cName = c.companyName || c.clientName || c.name || c.id;
                    return (
                      <option key={c.id} value={c.id}>
                        {cName}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Service ID */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Service ID</label>
              <div className="relative">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full appearance-none h-[34px] px-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All</option>
                  {services.map((svc) => (
                    <option key={svc} value={svc}>
                      {svc}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Expected Close Date, Next Follow-up, Last Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full">
            {/* Expected Close Date */}
            <div className="relative flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Expected Close Date</label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  aria-label="Filter by Expected Close Date"
                  onClick={() => {
                    setIsExpectedCloseOpen((prev) => !prev);
                    setIsNextFollowUpOpen(false);
                    setIsLastContactOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left cursor-pointer h-[34px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span className={expectedCloseDateFilter ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                      {expectedCloseDateFilter || 'Select date'}
                    </span>
                  </div>
                </button>
                {expectedCloseDateFilter && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpectedCloseDateFilter('');
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear date"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <SingleDatePicker
                value={expectedCloseDateFilter}
                onChange={(date) => {
                  setExpectedCloseDateFilter(date);
                  setIsExpectedCloseOpen(false);
                }}
                isOpen={isExpectedCloseOpen}
                onClose={() => setIsExpectedCloseOpen(false)}
                align="left"
              />
            </div>

            {/* Next Follow-up */}
            <div className="relative flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Next Follow-up</label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  aria-label="Filter by Next Follow-up"
                  onClick={() => {
                    setIsNextFollowUpOpen((prev) => !prev);
                    setIsExpectedCloseOpen(false);
                    setIsLastContactOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left cursor-pointer h-[34px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span className={nextFollowUpFilter ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                      {nextFollowUpFilter || 'Select date'}
                    </span>
                  </div>
                </button>
                {nextFollowUpFilter && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNextFollowUpFilter('');
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear date"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <SingleDatePicker
                value={nextFollowUpFilter}
                onChange={(date) => {
                  setNextFollowUpFilter(date);
                  setIsNextFollowUpOpen(false);
                }}
                isOpen={isNextFollowUpOpen}
                onClose={() => setIsNextFollowUpOpen(false)}
                align="auto"
              />
            </div>

            {/* Last Contact */}
            <div className="relative flex flex-col">
              <label className="text-xs font-medium text-slate-600 mb-1.5">Last Contact</label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  aria-label="Filter by Last Contact"
                  onClick={() => {
                    setIsLastContactOpen((prev) => !prev);
                    setIsExpectedCloseOpen(false);
                    setIsNextFollowUpOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:border-slate-300 transition-colors text-left cursor-pointer h-[34px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span className={lastContactFilter ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                      {lastContactFilter || 'Select date'}
                    </span>
                  </div>
                </button>
                {lastContactFilter && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLastContactFilter('');
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear date"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <SingleDatePicker
                value={lastContactFilter}
                onChange={(date) => {
                  setLastContactFilter(date);
                  setIsLastContactOpen(false);
                }}
                isOpen={isLastContactOpen}
                onClose={() => setIsLastContactOpen(false)}
                align="right"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
