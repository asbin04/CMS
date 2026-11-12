import React, { useState } from 'react';
import { Search, Filter, RotateCcw, Calendar, ChevronDown } from 'lucide-react';
import { FinancePaymentFilterOptions } from '../types/payments';

interface PaymentsFilterCardProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  mode: string;
  onModeChange: (value: string) => void;
  client: string;
  onClientChange: (value: string) => void;
  month: string;
  onMonthChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  filterOptions: FinancePaymentFilterOptions;
  activeFilterCount: number;
  onClearFilters: () => void;
}

export const PaymentsFilterCard: React.FC<PaymentsFilterCardProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  mode,
  onModeChange,
  client,
  onClientChange,
  month,
  onMonthChange,
  dateRange,
  onDateRangeChange,
  filterOptions,
  activeFilterCount,
  onClearFilters,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      {/* Search and Filter Buttons Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Payment ID, Invoice ID, Client ID, Reference No..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
          </button>

          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 border-t border-slate-100">
        {/* Payment Date Picker Dropdown */}
        <div className="relative">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Payment Date
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 hover:border-slate-300 transition-colors text-left"
            >
              <div className="flex items-center gap-2 truncate">
                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{dateRange || 'Oct 01, 2026 - Oct 31, 2026'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 flex-shrink-0" />
            </button>
            {showDatePicker && (
              <div className="absolute z-20 mt-1 w-64 p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-xs space-y-2">
                <div className="font-semibold text-slate-700 mb-1">Preset Ranges</div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onDateRangeChange('Oct 01, 2026 - Oct 31, 2026');
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700"
                  >
                    October 2026 (Active)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDateRangeChange('Sep 01, 2026 - Sep 30, 2026');
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700"
                  >
                    September 2026
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDateRangeChange('All');
                      setShowDatePicker(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700"
                  >
                    All Dates
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Status
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All</option>
              {filterOptions.statuses?.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Payment Mode Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Payment Mode
          </label>
          <div className="relative">
            <select
              value={mode}
              onChange={(e) => onModeChange(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All</option>
              {filterOptions.modes?.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Client Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Client
          </label>
          <div className="relative">
            <select
              value={client}
              onChange={(e) => onClientChange(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Clients</option>
              {filterOptions.clients?.map((cl) => (
                <option key={cl.clientId} value={cl.clientId}>
                  {cl.clientId} - {cl.clientName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Month Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Month
          </label>
          <div className="relative">
            <select
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All</option>
              {filterOptions.months?.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

