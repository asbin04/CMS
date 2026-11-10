import React, { useState } from 'react';
import { Search, Filter, ChevronDown, RotateCcw, Calendar, SlidersHorizontal } from 'lucide-react';
import { InvoiceFilters } from '../types';
import { MoreFiltersModal } from './MoreFiltersModal';

interface InvoicesFilterCardProps {
  filters: InvoiceFilters;
  onFilterChange: (filters: Partial<InvoiceFilters>) => void;
  onClearFilters: () => void;
  activeFilterCount?: number;
  availableClients?: string[];
  availableProjects?: string[];
}

export const InvoicesFilterCard: React.FC<InvoicesFilterCardProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount = 0,
  availableClients = ['CL-001', 'CL-002', 'CL-003', 'CL-004', 'CL-005', 'CL-006', 'CL-007', 'CL-008'],
  availableProjects = ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005', 'PRJ-006'],
}) => {
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  // Main Filter button click handler:
  // Activates/displays regular filter controls on page and NEVER opens MoreFiltersModal
  const handleMainFilterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Intentionally does NOT set isMoreFiltersOpen to true
  };

  // More Filters button click handler:
  // ONLY this handler sets isMoreFiltersOpen to true
  const handleMoreFiltersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMoreFiltersOpen(true);
  };

  // Reset only advanced filter selections, preserving regular filters
  const handleAdvancedReset = () => {
    onFilterChange({
      dueDate: '',
      paymentTerms: 'All',
      agingBucket: 'All',
      outstandingOnly: false,
      minAmount: '',
      maxAmount: '',
    });
  };

  return (
    <>
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 sm:p-5 mb-6 shadow-xs">
        {/* Top row: Search input + Filters (0) button + Clear Filters button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Invoice ID, Client ID, Project ID or Contract ID..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-[12px] bg-[#FFFFFF] text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-300 transition-colors h-[38px]"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
            />
          </div>

          {/* Right action buttons: Filters (X) & Clear Filters */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Filters Button */}
            <button
              type="button"
              onClick={handleMainFilterClick}
              aria-label="Filter"
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#E2E8F0] rounded-[12px] bg-[#FFFFFF] text-xs font-semibold text-[#1E293B] hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-300 transition-colors cursor-pointer h-[38px]"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
            >
              <Filter className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Filters ({activeFilterCount})</span>
            </button>

            {/* Clear Filters Button */}
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#E2E8F0] rounded-[12px] bg-[#FFFFFF] text-xs font-semibold text-[#1E293B] hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-300 transition-colors cursor-pointer h-[38px]"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Bottom row: 6 filter fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
          {/* 1. Invoice Date */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Invoice Date</label>
            <div
              className="flex items-center justify-between px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-[#FFFFFF] text-xs text-slate-700 h-[38px]"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
            >
              <div className="flex items-center gap-2 truncate flex-1 pointer-events-none">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">
                  {!filters.invoiceDate || filters.invoiceDate === 'All' || filters.invoiceDate === 'All Dates'
                    ? 'All Dates'
                    : filters.invoiceDate}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 pointer-events-none" />
              <select
                value={filters.invoiceDate || 'All'}
                onChange={(e) => onFilterChange({ invoiceDate: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Invoice Date"
              >
                <option value="All">All Dates</option>
                {filters.invoiceDate &&
                  !['All', 'All Dates', 'Nov 2026', 'Oct 2026', 'Sep 2026', 'Aug 2026', 'Jul 2026'].includes(
                    filters.invoiceDate
                  ) && <option value={filters.invoiceDate}>{filters.invoiceDate}</option>}
                <option value="Nov 2026">Nov 2026</option>
                <option value="Oct 2026">Oct 2026</option>
                <option value="Sep 2026">Sep 2026</option>
                <option value="Aug 2026">Aug 2026</option>
                <option value="Jul 2026">Jul 2026</option>
              </select>
            </div>
          </div>

          {/* 2. Client */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Client</label>
            <div
              className="flex items-center justify-between px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-[#FFFFFF] text-xs text-slate-700 h-[38px]"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
            >
              <span className="truncate pointer-events-none">{filters.client || 'All Clients'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 pointer-events-none" />
              <select
                value={filters.client}
                onChange={(e) => onFilterChange({ client: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Client"
              >
                <option value="All Clients">All Clients</option>
                {availableClients.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Project */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Project</label>
            <div
              className="flex items-center justify-between px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-[#FFFFFF] text-xs text-slate-700 h-[38px]"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
            >
              <span className="truncate pointer-events-none">{filters.project || 'All Projects'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 pointer-events-none" />
              <select
                value={filters.project}
                onChange={(e) => onFilterChange({ project: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Project"
              >
                <option value="All Projects">All Projects</option>
                {availableProjects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Status */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
            <div
              className="flex items-center justify-between px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-[#FFFFFF] text-xs text-slate-700 h-[38px]"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
            >
              <span className="truncate pointer-events-none">{filters.status || 'All'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 pointer-events-none" />
              <select
                value={filters.status}
                onChange={(e) => onFilterChange({ status: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Status"
              >
                <option value="All">All</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          {/* 5. Collection Status */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Collection Status</label>
            <div
              className="flex items-center justify-between px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-[#FFFFFF] text-xs text-slate-700 h-[38px]"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
            >
              <span className="truncate pointer-events-none">{filters.collectionStatus || 'All'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 pointer-events-none" />
              <select
                value={filters.collectionStatus}
                onChange={(e) => onFilterChange({ collectionStatus: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Collection Status"
              >
                <option value="All">All</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Follow Up">Follow Up</option>
              </select>
            </div>
          </div>

          {/* 6. More Filters */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={handleMoreFiltersClick}
              aria-label="More Filters"
              className="flex items-center justify-center gap-2 px-3.5 py-2 border border-[#E2E8F0] rounded-[12px] bg-[#FFFFFF] text-xs text-[#1E293B] font-semibold hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 focus:outline-hidden focus:ring-1 focus:ring-slate-300 cursor-pointer h-[38px] transition-colors"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700 shrink-0" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced More Filters Modal */}
      <MoreFiltersModal
        isOpen={isMoreFiltersOpen}
        onClose={() => setIsMoreFiltersOpen(false)}
        filters={filters}
        onApply={onFilterChange}
        onReset={handleAdvancedReset}
      />
    </>
  );
};
