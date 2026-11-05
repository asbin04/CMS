import React from 'react';
import { Search, Filter, RotateCcw, ChevronDown, Calendar } from 'lucide-react';
import { PayrollFilters, PayrollFilterOptions } from '../../types/payroll';

interface PayrollFilterCardProps {
  filters: PayrollFilters;
  filterOptions: PayrollFilterOptions;
  onFilterChange: <K extends keyof PayrollFilters>(key: K, value: PayrollFilters[K]) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export const PayrollFilterCard: React.FC<PayrollFilterCardProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}) => {
  const dropdownBaseCls =
    'w-full h-[36px] py-[6px] text-xs font-normal text-[#1E293B] bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[8px] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-[#CBD5E1] transition-colors';

  const dropdownInlineStyle: React.CSSProperties = {
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    height: '36px',
    boxSizing: 'border-box',
  };

  // Helper to dynamically format month range string (e.g. "Oct 2026" -> "Oct 01, 2026 - Oct 31, 2026")
  const formatMonthDateRange = (monthStr: string) => {
    if (!monthStr || monthStr === 'All') return 'All Months';
    const parts = monthStr.trim().split(/\s+/);
    if (parts.length === 2) {
      const month = parts[0];
      const year = parseInt(parts[1], 10);
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      if (!isNaN(monthIndex)) {
        const lastDay = new Date(year, monthIndex + 1, 0).getDate();
        return `${month} 01, ${year} - ${month} ${lastDay}, ${year}`;
      }
    }
    return monthStr;
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs flex flex-col gap-3.5 w-full">
      {/* Row 1: Search Input & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        {/* Search Field */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by Payroll ID, Employee ID, Employee Name..."
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box',
            }}
            className="w-full h-[38px] pl-10 pr-4 text-xs font-normal text-slate-800 placeholder-slate-400 bg-white border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-[#CBD5E1] transition-all shadow-2xs"
          />
        </div>

        {/* Filters Count Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box',
            }}
            className="inline-flex items-center gap-1.5 px-3.5 h-[38px] rounded-[8px] border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters ({activeFilterCount})</span>
          </button>

          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-3 h-[38px] rounded-[8px] text-[#4338CA] hover:text-[#3730A3] hover:bg-indigo-50/50 text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Row 2: 4 Dynamic Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-0.5">
        {/* 1. Payroll Month */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[12px] font-medium text-[#475569]">Payroll Month</label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filters.payrollMonth}
              onChange={(e) => onFilterChange('payrollMonth', e.target.value)}
              style={{
                ...dropdownInlineStyle,
                paddingLeft: '32px',
                paddingRight: '32px',
              }}
              className={`${dropdownBaseCls} pl-[32px] pr-[32px]`}
            >
              <option value="All">All Months</option>
              {filters.payrollMonth && filters.payrollMonth !== 'All' && !filterOptions.payrollMonths?.includes(filters.payrollMonth) && (
                <option value={filters.payrollMonth}>
                  {formatMonthDateRange(filters.payrollMonth)}
                </option>
              )}
              {filterOptions.payrollMonths?.map((m) => (
                <option key={m} value={m}>
                  {formatMonthDateRange(m)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 2. Employment Type */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[12px] font-medium text-[#475569]">Employment Type</label>
          <div className="relative">
            <select
              value={filters.employmentType}
              onChange={(e) => onFilterChange('employmentType', e.target.value)}
              style={{
                ...dropdownInlineStyle,
                paddingLeft: '12px',
                paddingRight: '32px',
              }}
              className={`${dropdownBaseCls} pl-[12px] pr-[32px]`}
            >
              <option value="All">All</option>
              {filters.employmentType && filters.employmentType !== 'All' && !filterOptions.employmentTypes?.includes(filters.employmentType) && (
                <option value={filters.employmentType}>
                  {filters.employmentType}
                </option>
              )}
              {filterOptions.employmentTypes?.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 3. Payroll Status */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[12px] font-medium text-[#475569]">Payroll Status</label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              style={{
                ...dropdownInlineStyle,
                paddingLeft: '12px',
                paddingRight: '32px',
              }}
              className={`${dropdownBaseCls} pl-[12px] pr-[32px]`}
            >
              <option value="All">All</option>
              {filters.status && filters.status !== 'All' && !filterOptions.statuses?.includes(filters.status) && (
                <option value={filters.status}>
                  {filters.status}
                </option>
              )}
              {filterOptions.statuses?.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 4. Employee */}
        <div className="flex flex-col gap-1 min-w-0">
          <label className="text-[12px] font-medium text-[#475569]">Employee</label>
          <div className="relative">
            <select
              value={filters.employee}
              onChange={(e) => onFilterChange('employee', e.target.value)}
              style={{
                ...dropdownInlineStyle,
                paddingLeft: '12px',
                paddingRight: '32px',
              }}
              className={`${dropdownBaseCls} pl-[12px] pr-[32px]`}
            >
              <option value="All">All Employees</option>
              {filters.employee && filters.employee !== 'All' && filters.employee !== 'All Employees' && !filterOptions.employees?.some((e) => e.employeeId === filters.employee) && (
                <option value={filters.employee}>
                  {filters.employee}
                </option>
              )}
              {filterOptions.employees?.map((emp, idx) => (
                <option key={`${emp.employeeId}-${idx}`} value={emp.employeeId}>
                  {emp.employeeName} ({emp.employeeId})
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
