import React from 'react';
import { SupportTicketFilterOptions } from '../types/tickets';

interface SupportTicketFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  ticketType: string;
  onTicketTypeChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  slaStatus: string;
  onSlaStatusChange: (val: string) => void;
  onClearFilters: () => void;
  filterOptions: SupportTicketFilterOptions;
  isFiltersOpen?: boolean;
  onToggleFilters?: () => void;
}

export const SupportTicketFilterBar: React.FC<SupportTicketFilterBarProps> = ({
  search,
  onSearchChange,
  ticketType,
  onTicketTypeChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  slaStatus,
  onSlaStatusChange,
  onClearFilters,
  filterOptions,
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
        gap: isFiltersOpen ? '12px' : '0px',
        width: '100%',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      {/* Top Row: Search Input + Filters + Clear Filters */}
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Ticket ID, Client ID, Project ID, or Issue / Request..."
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

        {/* Filters Button */}
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
            gap: '6px',
            height: '34px',
            minWidth: '87px',
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4F46E5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
            Filters
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
            gap: '6px',
            height: '34px',
            minWidth: '119.97px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          className="hover:bg-slate-50 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4F46E5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          data-testid="filter-dropdowns-row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '12px',
            width: '100%',
          }}
        >
          {/* Ticket Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '15px',
              color: '#94A3B8',
            }}
          >
            Ticket Type
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              value={ticketType}
              onChange={(e) => onTicketTypeChange(e.target.value)}
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
              {filterOptions.ticketTypes.map((opt) => (
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

        {/* Priority */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '15px',
              color: '#94A3B8',
            }}
          >
            Priority
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              value={priority}
              onChange={(e) => onPriorityChange(e.target.value)}
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
              {filterOptions.priorities.map((opt) => (
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

        {/* Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '15px',
              color: '#94A3B8',
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
              {filterOptions.statuses.map((opt) => (
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

        {/* SLA Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '15px',
              color: '#94A3B8',
            }}
          >
            SLA Status
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <select
              value={slaStatus}
              onChange={(e) => onSlaStatusChange(e.target.value)}
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
              {filterOptions.slaStatuses.map((opt) => (
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
