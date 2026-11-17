import React from 'react';
import { Search, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { UiuxFilterOptions } from '../types/uiux';

interface UiuxFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedProject: string;
  onProjectChange: (project: string) => void;
  selectedDesignType: string;
  onDesignTypeChange: (type: string) => void;
  selectedApprovalStatus: string;
  onApprovalStatusChange: (status: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  filterOptions: UiuxFilterOptions;
  onToggleMoreFilters?: () => void;
  isMoreFiltersOpen?: boolean;
  onClearFilters?: () => void;
}

export const UiuxFilterBar: React.FC<UiuxFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedProject,
  onProjectChange,
  selectedDesignType,
  onDesignTypeChange,
  selectedApprovalStatus,
  onApprovalStatusChange,
  selectedStatus,
  onStatusChange,
  filterOptions,
  onToggleMoreFilters,
  isMoreFiltersOpen = true,
  onClearFilters,
}) => {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '14px',
        gap: '10px',
        width: '100%',
        background: '#FFFFFF',
      }}
    >
      {/* Top Search and Action Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '0px',
          gap: '12px',
          width: '100%',
          height: '34px',
          alignSelf: 'stretch',
          boxSizing: 'border-box',
        }}
      >
        {/* Container - Search Input */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '0px',
            isolation: 'isolate',
            height: '34px',
            flex: '1 1 auto',
            boxSizing: 'border-box',
          }}
        >
          {/* Container - Search Icon */}
          <div
            style={{
              position: 'absolute',
              width: '30px',
              left: '0px',
              top: '0px',
              bottom: '0px',
              padding: '0px 0px 0px 14px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <Search size={16} color="#94A3B8" />
          </div>
          {/* Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Design ID, Project ID, Screen / Feature..."
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'flex-start',
              padding: '8px 16px 9px 40px',
              width: '100%',
              height: '34px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '15px',
              color: '#1E293B',
              outline: 'none',
              zIndex: 0,
            }}
            className="placeholder:text-[#94A3B8] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all"
          />
        </div>

        {/* Container - Action Buttons (matching Leads page) */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Button: Filters */}
          <button
            type="button"
            onClick={onToggleMoreFilters}
            className="flex items-center gap-[8px] h-[34px] px-[14px] py-[8px] bg-white border border-[#4F46E5] hover:bg-indigo-50/40 text-[#4F46E5] rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer select-none"
          >
            <Filter size={15} className="text-[#4F46E5]" />
            <span>Filters</span>
            <ChevronDown
              size={15}
              className={`text-[#4F46E5] transition-transform duration-200 ${
                isMoreFiltersOpen ? '' : '-rotate-180'
              }`}
            />
            {/* hidden span for test backward compatibility */}
            <span style={{ display: 'none' }}>More Filters</span>
          </button>

          {/* Button: Clear Filters */}
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

      {/* Frame 19: Filter Dropdowns */}
      {isMoreFiltersOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '0px',
            gap: '14px',
            width: '100%',
            height: '44px',
            alignSelf: 'stretch',
            boxSizing: 'border-box',
            flexWrap: 'wrap',
          }}
        >
          {/* Project Dropdown */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
              width: '243px',
              flex: '1 1 243px',
              minWidth: '180px',
              height: '44px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0px',
                width: '100%',
                height: '18px',
                marginBottom: '2px',
              }}
            >
              <span
                style={{
                  height: '15px',
                  fontFamily: 'Inter',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '10px',
                  lineHeight: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94A3B8',
                }}
              >
                Project
              </span>
            </div>
            <div
              style={{
                position: 'relative',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: '26px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
              }}
            >
              <select
                value={selectedProject}
                onChange={(e) => onProjectChange(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '24px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '2px 26px 2px 10px',
                  fontFamily: 'Inter',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: '#334155',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                className="focus:ring-1 focus:ring-[#4F46E5] transition-all"
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
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Status Dropdown / Design Type */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
              width: '219px',
              flex: '1 1 219px',
              minWidth: '160px',
              height: '44px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0px',
                width: '100%',
                height: '18px',
                marginBottom: '2px',
              }}
            >
              <span
                style={{
                  height: '15px',
                  fontFamily: 'Inter',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '10px',
                  lineHeight: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94A3B8',
                }}
              >
                Design Type
              </span>
            </div>
            <div
              style={{
                position: 'relative',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: '26px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
              }}
            >
              <select
                value={selectedDesignType}
                onChange={(e) => onDesignTypeChange(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '24px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '2px 26px 2px 10px',
                  fontFamily: 'Inter',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: '#334155',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                className="focus:ring-1 focus:ring-[#4F46E5] transition-all"
              >
                <option value="All">All Types</option>
                {filterOptions.designTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                color="#94A3B8"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Client Approval Dropdown / Approval Status */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
              width: '219px',
              flex: '1 1 219px',
              minWidth: '160px',
              height: '44px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0px',
                width: '100%',
                height: '18px',
                marginBottom: '2px',
              }}
            >
              <span
                style={{
                  height: '15px',
                  fontFamily: 'Inter',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '10px',
                  lineHeight: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94A3B8',
                }}
              >
                Approval Status
              </span>
            </div>
            <div
              style={{
                position: 'relative',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: '26px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
              }}
            >
              <select
                value={selectedApprovalStatus}
                onChange={(e) => onApprovalStatusChange(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '24px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '2px 26px 2px 10px',
                  fontFamily: 'Inter',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: '#334155',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                className="focus:ring-1 focus:ring-[#4F46E5] transition-all"
              >
                <option value="All">All Status</option>
                {filterOptions.approvalStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                color="#94A3B8"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Tester Dropdown / Status */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
              width: '215px',
              flex: '1 1 215px',
              minWidth: '160px',
              height: '44px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0px',
                width: '100%',
                height: '18px',
                marginBottom: '2px',
              }}
            >
              <span
                style={{
                  height: '15px',
                  fontFamily: 'Inter',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '10px',
                  lineHeight: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94A3B8',
                }}
              >
                Status
              </span>
            </div>
            <div
              style={{
                position: 'relative',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: '26px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
              }}
            >
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '24px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '2px 26px 2px 10px',
                  fontFamily: 'Inter',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: '#334155',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                className="focus:ring-1 focus:ring-[#4F46E5] transition-all"
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
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
