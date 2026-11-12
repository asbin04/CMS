import React, { useState } from 'react';
import { Search, Filter, RotateCcw, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { AttendanceFilterState } from '../types/attendance';

interface AttendanceFilterBarProps {
  filterState: AttendanceFilterState;
  onFilterChange: (updates: Partial<AttendanceFilterState>) => void;
  onClearFilters: () => void;
  employees: { id: string; name: string }[];
}

export const AttendanceFilterBar: React.FC<AttendanceFilterBarProps> = ({
  filterState,
  onFilterChange,
  onClearFilters,
  employees,
}) => {
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);

  const statusOptions = ['All', 'Present', 'Leave', 'Half Day', 'Absent', 'Holiday'];
  const dayTypeOptions = ['All', 'Regular', 'Weekend', 'Holiday'];
  const booleanOptions = ['All', 'Yes', 'No'];

  // Count active non-default filters
  const activeFiltersCount = [
    filterState.dateRange !== 'Oct 01, 2026 - Oct 31, 2026' && filterState.dateRange !== '',
    filterState.employee !== 'All Employees',
    filterState.status !== 'All',
    filterState.dayType !== 'All',
    filterState.lateOnly !== 'All',
    filterState.overtimeOnly !== 'All',
  ].filter(Boolean).length;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Search Bar Row with Filters Toggle and Clear Button */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
        }}
      >
        {/* Search Input Box */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Search size={16} color="#94A3B8" />
          </div>
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by Attendance ID, Employee ID, or Employee Name..."
            style={{
              width: '100%',
              height: '34px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '8px 16px 8px 36px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              lineHeight: '15px',
              color: '#1E293B',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filters Toggle Button */}
        <button
          type="button"
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '8px 12px',
            gap: '6px',
            height: '34px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Filter size={14} color="#4F46E5" />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: '#4F46E5',
            }}
          >
            Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
          </span>
          {showFiltersPanel ? (
            <ChevronUp size={14} color="#4F46E5" />
          ) : (
            <ChevronDown size={14} color="#4F46E5" />
          )}
        </button>

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={onClearFilters}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '8px 12px',
            gap: '6px',
            height: '34px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <RotateCcw size={14} color="#4F46E5" />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: '#4F46E5',
            }}
          >
            Clear Filters
          </span>
        </button>
      </div>

      {/* Expanded Filters Dropdowns Grid */}
      {showFiltersPanel && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 w-full"
        >
          {/* 1. Date Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                color: '#64748B',
                lineHeight: '16px',
              }}
            >
              Date Range
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <Calendar size={13} color="#94A3B8" />
              </div>
              <input
                type="text"
                value={filterState.dateRange}
                onChange={(e) => onFilterChange({ dateRange: e.target.value })}
                placeholder="Oct 01, 2026 - Oct 31, 2026"
                style={{
                  width: '100%',
                  height: '30px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '4px 8px 4px 28px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#1E293B',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* 2. Employee */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                color: '#64748B',
                lineHeight: '16px',
              }}
            >
              Employee
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={filterState.employee}
                onChange={(e) => onFilterChange({ employee: e.target.value })}
                style={{
                  width: '100%',
                  height: '30px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '4px 26px 4px 10px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#1E293B',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <option value="All Employees">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.id})
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <ChevronDown size={14} color="#94A3B8" />
              </div>
            </div>
          </div>

          {/* 3. Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                color: '#64748B',
                lineHeight: '16px',
              }}
            >
              Status
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={filterState.status}
                onChange={(e) => onFilterChange({ status: e.target.value })}
                style={{
                  width: '100%',
                  height: '30px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '4px 26px 4px 10px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#1E293B',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <ChevronDown size={14} color="#94A3B8" />
              </div>
            </div>
          </div>

          {/* 4. Day Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                color: '#64748B',
                lineHeight: '16px',
              }}
            >
              Day Type
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={filterState.dayType}
                onChange={(e) => onFilterChange({ dayType: e.target.value })}
                style={{
                  width: '100%',
                  height: '30px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '4px 26px 4px 10px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#1E293B',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                {dayTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <ChevronDown size={14} color="#94A3B8" />
              </div>
            </div>
          </div>

          {/* 5. Late Only */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                color: '#64748B',
                lineHeight: '16px',
              }}
            >
              Late Only
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={filterState.lateOnly}
                onChange={(e) => onFilterChange({ lateOnly: e.target.value })}
                style={{
                  width: '100%',
                  height: '30px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '4px 26px 4px 10px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#1E293B',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                {booleanOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <ChevronDown size={14} color="#94A3B8" />
              </div>
            </div>
          </div>

          {/* 6. Overtime Only */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                color: '#64748B',
                lineHeight: '16px',
              }}
            >
              Overtime Only
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={filterState.overtimeOnly}
                onChange={(e) => onFilterChange({ overtimeOnly: e.target.value })}
                style={{
                  width: '100%',
                  height: '30px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '4px 26px 4px 10px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#1E293B',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                {booleanOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <ChevronDown size={14} color="#94A3B8" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
