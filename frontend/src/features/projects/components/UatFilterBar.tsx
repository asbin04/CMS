import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';
import { UatFilterOptions } from '../types/uat';

interface UatFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedProject: string;
  onProjectChange: (project: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedApproval: string;
  onApprovalChange: (approval: string) => void;
  selectedTester: string;
  onTesterChange: (tester: string) => void;
  filterOptions: UatFilterOptions;
  onClearFilters: () => void;
  activeFilterCount: number;
  isFiltersOpen?: boolean;
  onToggleFilters?: () => void;
}

export const UatFilterBar: React.FC<UatFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedProject,
  onProjectChange,
  selectedStatus,
  onStatusChange,
  selectedApproval,
  onApprovalChange,
  selectedTester,
  onTesterChange,
  filterOptions,
  onClearFilters,
  activeFilterCount,
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

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '16px',
        gap: isFiltersOpen ? '16px' : '0px',
        width: '100%',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
      }}
    >
      {/* Top Row: Search Input + Filters Count + Clear Filters */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        {/* Search input */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flex: '1 1 500px',
            minWidth: '260px',
            height: '36px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={16} color="#94A3B8" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by UAT ID, Project ID, Requirement ID, Test Case..."
            style={{
              width: '100%',
              height: '36px',
              paddingLeft: '36px',
              paddingRight: '12px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '12px',
              color: '#1E293B',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            className="focus:border-indigo-500 transition-colors placeholder:text-slate-400"
          />
        </div>

        {/* Buttons: Filters (0) & Clear Filters */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={handleToggleFilters}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '8px 16px',
              gap: '8px',
              height: '36px',
              background: isFiltersOpen ? '#FFFFFF' : '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '12px',
              color: '#334155',
              cursor: 'pointer',
            }}
            className="hover:bg-slate-50 transition-colors"
            title={isFiltersOpen ? 'Close all filters' : 'Open all filters'}
            aria-expanded={isFiltersOpen}
          >
            <SlidersHorizontal size={14} color="#64748B" />
            <span>Filters ({activeFilterCount})</span>
          </button>

          <button
            type="button"
            onClick={onClearFilters}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '8px 14px',
              gap: '6px',
              height: '36px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '12px',
              color: '#64748B',
              cursor: 'pointer',
            }}
            className="hover:text-slate-900 transition-colors"
          >
            <RotateCcw size={14} color="#64748B" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: 4 Filter Dropdowns with Floating-style Labels */}
      {isFiltersOpen && (
        <div
          data-testid="uat-filter-dropdowns-row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            width: '100%',
          }}
        >
        {/* 1. Project Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: 'Inter',
              fontSize: '11px',
              fontWeight: 500,
              color: '#94A3B8',
            }}
          >
            Project
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedProject}
              onChange={(e) => onProjectChange(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '6px 32px 6px 12px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '12px',
                color: '#334155',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              className="focus:border-indigo-500"
            >
              <option value="All">All Projects</option>
              {filterOptions.projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="#94A3B8"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* 2. Status Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: 'Inter',
              fontSize: '11px',
              fontWeight: 500,
              color: '#94A3B8',
            }}
          >
            Status
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '6px 32px 6px 12px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '12px',
                color: '#334155',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              className="focus:border-indigo-500"
            >
              <option value="All">All Status</option>
              {filterOptions.statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="#94A3B8"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* 3. Client Approval Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: 'Inter',
              fontSize: '11px',
              fontWeight: 500,
              color: '#94A3B8',
            }}
          >
            Client Approval
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedApproval}
              onChange={(e) => onApprovalChange(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '6px 32px 6px 12px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '12px',
                color: '#334155',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              className="focus:border-indigo-500"
            >
              <option value="All">All</option>
              {filterOptions.clientApprovals.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="#94A3B8"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* 4. Tester Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: 'Inter',
              fontSize: '11px',
              fontWeight: 500,
              color: '#94A3B8',
            }}
          >
            Tester
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedTester}
              onChange={(e) => onTesterChange(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '6px 32px 6px 12px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '12px',
                color: '#334155',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              className="focus:border-indigo-500"
            >
              <option value="All">All incubation/Testers</option>
              {filterOptions.testers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="#94A3B8"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

