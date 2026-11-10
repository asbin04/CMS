import React from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
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
  isMoreFiltersOpen,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        alignContent: 'center',
        padding: '0px',
        gap: '12px',
        width: '100%',
        height: '30px',
        boxSizing: 'border-box',
        alignSelf: 'stretch',
        flex: 'none',
        flexGrow: 0,
      }}
    >
      {/* 1. Search Bar */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '0px',
          isolation: 'isolate',
          width: '372.16px',
          minWidth: '280px',
          height: '30px',
          boxSizing: 'border-box',
          flex: '1 1 372.16px',
          order: 0,
          flexGrow: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '0px',
            top: '0px',
            bottom: '0px',
            width: '28px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '0px 0px 0px 12px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <Search size={16} color="#94A3B8" strokeWidth={1.33333} />
        </div>
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
            padding: '6px 12px 7px 36px',
            width: '100%',
            height: '30px',
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

      {/* 2. Project dropdown with floating label */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '0px',
          isolation: 'isolate',
          width: '110.56px',
          height: '30px',
          boxSizing: 'border-box',
          flex: 'none',
          order: 1,
          flexGrow: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: '33.7px',
            height: '15px',
            left: '0px',
            top: '-16px',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: '10px',
            lineHeight: '15px',
            display: 'flex',
            alignItems: 'center',
            color: '#64748B',
            whiteSpace: 'nowrap',
            zIndex: 1,
          }}
        >
          Project
        </span>
        <select
          value={selectedProject}
          onChange={(e) => onProjectChange(e.target.value)}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '6px 32px 6px 12px',
            width: '110.56px',
            height: '30px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#334155',
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer',
            zIndex: 0,
          }}
          className="focus:border-[#4F46E5] transition-all"
        >
          <option value="All">All Projects</option>
          {filterOptions.projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          color="#6B7280"
          strokeWidth={1.35}
          style={{
            position: 'absolute',
            right: '9px',
            top: '7px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </div>

      {/* 3. Design Type dropdown with floating label */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '0px',
          isolation: 'isolate',
          width: '102px',
          height: '30px',
          boxSizing: 'border-box',
          flex: 'none',
          order: 2,
          flexGrow: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: '59.59px',
            height: '15px',
            left: '0px',
            top: '-16px',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: '10px',
            lineHeight: '15px',
            display: 'flex',
            alignItems: 'center',
            color: '#64748B',
            whiteSpace: 'nowrap',
            zIndex: 1,
          }}
        >
          Design Type
        </span>
        <select
          value={selectedDesignType}
          onChange={(e) => onDesignTypeChange(e.target.value)}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '6px 32px 6px 12px',
            width: '102px',
            height: '30px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#334155',
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer',
            zIndex: 0,
          }}
          className="focus:border-[#4F46E5] transition-all"
        >
          <option value="All">All Types</option>
          {filterOptions.designTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          color="#6B7280"
          strokeWidth={1.35}
          style={{
            position: 'absolute',
            right: '9px',
            top: '7px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </div>

      {/* 4. Approval Status dropdown with floating label */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '0px',
          isolation: 'isolate',
          width: '102px',
          height: '30px',
          boxSizing: 'border-box',
          flex: 'none',
          order: 3,
          flexGrow: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: '75.92px',
            height: '15px',
            left: '0px',
            top: '-16px',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: '10px',
            lineHeight: '15px',
            display: 'flex',
            alignItems: 'center',
            color: '#64748B',
            whiteSpace: 'nowrap',
            zIndex: 1,
          }}
        >
          Approval Status
        </span>
        <select
          value={selectedApprovalStatus}
          onChange={(e) => onApprovalStatusChange(e.target.value)}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '6px 32px 6px 12px',
            width: '102px',
            height: '30px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#334155',
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer',
            zIndex: 0,
          }}
          className="focus:border-[#4F46E5] transition-all"
        >
          <option value="All">All Status</option>
          {filterOptions.approvalStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          color="#6B7280"
          strokeWidth={1.35}
          style={{
            position: 'absolute',
            right: '9px',
            top: '7px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </div>

      {/* 5. Status dropdown with floating label */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '0px',
          isolation: 'isolate',
          width: '111px',
          height: '30px',
          boxSizing: 'border-box',
          flex: 'none',
          order: 4,
          flexGrow: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: '30.41px',
            height: '15px',
            left: '0px',
            top: '-16px',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: '10px',
            lineHeight: '15px',
            display: 'flex',
            alignItems: 'center',
            color: '#64748B',
            whiteSpace: 'nowrap',
            zIndex: 1,
          }}
        >
          Status
        </span>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '6px 32px 6px 12px',
            width: '111px',
            height: '30px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#334155',
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer',
            zIndex: 0,
          }}
          className="focus:border-[#4F46E5] transition-all"
        >
          <option value="All">All Status</option>
          {filterOptions.statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          color="#6B7280"
          strokeWidth={1.35}
          style={{
            position: 'absolute',
            right: '9px',
            top: '7px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </div>

      {/* 6. More Filters button */}
      <button
        type="button"
        onClick={onToggleMoreFilters}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '6px 12px',
          gap: '6px',
          width: '114.28px',
          height: '30px',
          background: isMoreFiltersOpen ? '#EFF6FF' : '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          cursor: 'pointer',
          flex: 'none',
          order: 5,
          flexGrow: 0,
        }}
        className="hover:bg-slate-50 transition-colors"
      >
        <SlidersHorizontal size={14} color="#4F46E5" strokeWidth={1.16667} />
        <span
          style={{
            width: '68.28px',
            height: '16px',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '16px',
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            color: '#4F46E5',
            whiteSpace: 'nowrap',
          }}
        >
          More Filters
        </span>
      </button>
    </div>
  );
};
