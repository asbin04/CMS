import React from 'react';
import { ExpenseFilterOptions } from '../types/expenses';

interface ExpenseFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  project: string;
  onProjectChange: (val: string) => void;
  month: string;
  onMonthChange: (val: string) => void;
  filterOptions: ExpenseFilterOptions;
  onClearFilters: () => void;
  isFiltersOpen?: boolean;
  onToggleFilters?: () => void;
}

export const ExpenseFilterBar: React.FC<ExpenseFilterBarProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  project,
  onProjectChange,
  month,
  onMonthChange,
  filterOptions,
  onClearFilters,
  isFiltersOpen: externalIsFiltersOpen,
  onToggleFilters,
}) => {
  const [internalIsFiltersOpen, setInternalIsFiltersOpen] = React.useState(true);
  const isFiltersOpen = externalIsFiltersOpen !== undefined ? externalIsFiltersOpen : internalIsFiltersOpen;

  const handleToggleFilters = () => {
    if (onToggleFilters) {
      onToggleFilters();
    } else {
      setInternalIsFiltersOpen((prev) => !prev);
    }
  };

  // Count active filters
  let activeFilterCount = 0;
  if (category && category !== 'All Categories') activeFilterCount++;
  if (status && status !== 'All Status') activeFilterCount++;
  if (project && project !== 'All Projects') activeFilterCount++;
  if (month && month !== 'All Months') activeFilterCount++;

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '16px',
        gap: isFiltersOpen ? '12px' : '0px',
        width: '100%',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      {/* Top Row: Search Input + Filter count + Clear button */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
        }}
      >
        {/* Search input container */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 auto',
            height: '34px',
            minWidth: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Expense ID, Description, Vendor ID..."
            className="placeholder:text-[#94A3B8] placeholder:font-normal"
            style={{
              boxSizing: 'border-box',
              width: '100%',
              height: '34px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '8px 16px 8px 36px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              lineHeight: '16px',
              color: '#334155',
              outline: 'none',
            }}
          />
        </div>

        {/* Filters (N) Button */}
        <button
          type="button"
          onClick={handleToggleFilters}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 14px',
            gap: '8px',
            height: '34px',
            background: isFiltersOpen ? '#FFFFFF' : '#F8FAFC',
            border: '1px solid #E2E8F0',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          className="hover:bg-slate-50 transition-colors"
          title={isFiltersOpen ? 'Close all filters' : 'Open all filters'}
          aria-expanded={isFiltersOpen}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '16px',
              color: '#334155',
            }}
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </span>
        </button>

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={onClearFilters}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 14px',
            gap: '8px',
            height: '34px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          className="hover:bg-slate-50 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '16px',
              color: '#334155',
            }}
          >
            Clear Filters
          </span>
        </button>
      </div>

      {/* Bottom Row: 4 Filter Dropdowns */}
      {isFiltersOpen && (
        <div
          data-testid="expense-filter-dropdowns-row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '12px',
            width: '100%',
          }}
        >
          {/* Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '11px',
              lineHeight: '14px',
              color: '#64748B',
            }}
          >
            Category
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              style={{
                boxSizing: 'border-box',
                width: '100%',
                height: '34px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0 28px 0 10px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              <option value="All Categories">All Categories</option>
              {filterOptions.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '11px',
              lineHeight: '14px',
              color: '#64748B',
            }}
          >
            Status
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              style={{
                boxSizing: 'border-box',
                width: '100%',
                height: '34px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0 28px 0 10px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              <option value="All Status">All Status</option>
              {filterOptions.statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Project */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '11px',
              lineHeight: '14px',
              color: '#64748B',
            }}
          >
            Project
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              value={project}
              onChange={(e) => onProjectChange(e.target.value)}
              style={{
                boxSizing: 'border-box',
                width: '100%',
                height: '34px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0 28px 0 10px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              <option value="All Projects">All Projects</option>
              {filterOptions.projects.map((p) => (
                <option key={p} value={p}>
                  {p}
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Month */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '11px',
              lineHeight: '14px',
              color: '#64748B',
            }}
          >
            Month
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              style={{
                boxSizing: 'border-box',
                width: '100%',
                height: '34px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0 28px 0 10px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              <option value="All Months">All Months</option>
              {filterOptions.months.map((m) => (
                <option key={m} value={m}>
                  {m}
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

