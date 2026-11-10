import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { AmcSlaFilterOptions } from '../types/amcSla';

interface AmcSlaFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  serviceType: string;
  onServiceTypeChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  renewalAlert: string;
  onRenewalAlertChange: (val: string) => void;
  onClearFilters: () => void;
  options: AmcSlaFilterOptions;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
}

export const AmcSlaFilterBar: React.FC<AmcSlaFilterBarProps> = ({
  search,
  onSearchChange,
  serviceType,
  onServiceTypeChange,
  status,
  onStatusChange,
  renewalAlert,
  onRenewalAlertChange,
  onClearFilters,
  options,
  isFilterOpen,
  onToggleFilter,
}) => {
  return (
    <div className="box-border flex flex-col items-start p-4 gap-3 w-full bg-white rounded-t-[12px]">
      {/* Top Row Search Bar & Global Filter Buttons */}
      <div className="flex flex-row items-center gap-3 w-full h-[34px]">
        {/* Search Input Container */}
        <div className="relative flex-1 h-[34px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
            <Search className="w-[14px] h-[14px]" strokeWidth={2} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by AMC / SLA ID, Client, Project, or Notes..."
            className="box-border w-full h-[34px] bg-white border border-[#E2E8F0] rounded-[8px] pl-9 pr-3 text-[12px] leading-[15px] font-['Inter'] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors"
          />
        </div>

        {/* Filters Toggle Button */}
        <button
          type="button"
          onClick={onToggleFilter}
          aria-expanded={isFilterOpen}
          className={`box-border flex flex-row justify-center items-center px-[14px] py-[8px] gap-[6px] h-[34px] rounded-[8px] border transition-colors cursor-pointer select-none shrink-0 ${
            isFilterOpen
              ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4F46E5]'
              : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
          }`}
        >
          <Filter className="w-[14px] h-[14px] text-[#4F46E5]" strokeWidth={2} />
          <span className="font-['Inter'] font-semibold text-[12px] leading-[16px]">Filters</span>
        </button>

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={onClearFilters}
          className="box-border flex flex-row justify-center items-center px-[14px] py-[8px] gap-[6px] h-[34px] bg-white border border-[#E2E8F0] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[8px] text-[#334155] hover:bg-[#F8FAFC] transition-colors cursor-pointer select-none shrink-0"
        >
          <RotateCcw className="w-[14px] h-[14px] text-[#4F46E5]" strokeWidth={2} />
          <span className="font-['Inter'] font-semibold text-[12px] leading-[16px]">Clear Filters</span>
        </button>
      </div>

      {/* Bottom Row Filter Dropdowns (Collapsible) */}
      {isFilterOpen && (
        <div
          data-testid="filter-dropdowns-row"
          className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full pt-1"
        >
          {/* Service Type Dropdown */}
          <div className="flex flex-col items-start gap-1">
            <label className="font-['Inter'] font-medium text-[10px] leading-[15px] text-[#94A3B8]">
              Service Type
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                aria-label="Service Type"
                value={serviceType}
                onChange={(e) => onServiceTypeChange(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '34px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0 32px 0 12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#334155',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                <option value="All">All</option>
                {options.serviceTypes.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col items-start gap-1">
            <label className="font-['Inter'] font-medium text-[10px] leading-[15px] text-[#94A3B8]">
              Status
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                aria-label="Status"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '34px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0 32px 0 12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#334155',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                <option value="All">All</option>
                {options.statuses.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Renewal Alert Dropdown */}
          <div className="flex flex-col items-start gap-1">
            <label className="font-['Inter'] font-medium text-[10px] leading-[15px] text-[#94A3B8]">
              Renewal Alert
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                aria-label="Renewal Alert"
                value={renewalAlert}
                onChange={(e) => onRenewalAlertChange(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '34px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0 32px 0 12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#334155',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                <option value="All">All</option>
                {options.renewalAlerts.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

