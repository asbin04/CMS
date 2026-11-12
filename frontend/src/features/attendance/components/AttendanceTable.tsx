import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceRecord, AttendanceSortOption } from '../types/attendance';
import { StatusDropdownMenu, StatusItemConfig } from '@/components/ui/StatusDropdownMenu';
import { TableActionMenu } from '@/components/ui/TableActionMenu';

export const ATTENDANCE_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'Present', label: 'Present', dotColor: '#059669', textColor: '#059669' },
  { value: 'Half Day', label: 'Half Day', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Late', label: 'Late', dotColor: '#EF4444', textColor: '#EF4444' },
  { value: 'Absent', label: 'Absent', dotColor: '#EF4444', textColor: '#EF4444' },
  { value: 'Leave', label: 'Leave', dotColor: '#2563EB', textColor: '#2563EB' },
];

interface AttendanceTableProps {
  records: AttendanceRecord[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sortBy: AttendanceSortOption;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (sort: AttendanceSortOption) => void;
  onViewRecord: (record: AttendanceRecord) => void;
  onEditRecord: (record: AttendanceRecord) => void;
  onDeleteRecord: (id: string) => void;
  onUpdateStatus?: (recordId: string, newStatus: string) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  totalCount,
  currentPage,
  pageSize,
  sortBy,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onUpdateStatus,
}) => {
  // Status Badge Pill Styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Present':
        return {
          backgroundColor: '#DCFCE7',
          border: '1px solid #86EFAC',
          color: '#15803D',
        };
      case 'Leave':
        return {
          backgroundColor: '#F3E8FF',
          border: '1px solid #D8B4FE',
          color: '#7E22CE',
        };
      case 'Half Day':
        return {
          backgroundColor: '#FEF3C7',
          border: '1px solid #FDE68A',
          color: '#B45309',
        };
      case 'Absent':
        return {
          backgroundColor: '#FEE2E2',
          border: '1px solid #FECACA',
          color: '#DC2626',
        };
      case 'Holiday':
        return {
          backgroundColor: '#E0E7FF',
          border: '1px solid #C7D2FE',
          color: '#4338CA',
        };
      default:
        return {
          backgroundColor: '#F1F5F9',
          border: '1px solid #E2E8F0',
          color: '#64748B',
        };
    }
  };

  // Day Type Badge Pill Styling
  const getDayTypeBadgeStyle = (dayType?: string) => {
    switch (dayType) {
      case 'Leave':
        return {
          backgroundColor: '#FEF3C7',
          border: '1px solid #FDE68A',
          color: '#D97706',
        };
      case 'Holiday':
        return {
          backgroundColor: '#F3E8FF',
          border: '1px solid #E9D5FF',
          color: '#9333EA',
        };
      case 'Working Day':
      default:
        return {
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          color: '#2563EB',
        };
    }
  };

  // Late Flag Badge Pill Styling
  const getLateFlagBadgeStyle = (flag?: string) => {
    if (flag === 'Yes') {
      return {
        backgroundColor: '#FEE2E2',
        border: '1px solid #FECACA',
        color: '#DC2626',
      };
    }
    return {
      backgroundColor: '#DCFCE7',
      border: '1px solid #86EFAC',
      color: '#16A34A',
    };
  };

  // Avatar Initials Circle Styling
  const getAvatarStyle = (color?: string) => {
    switch (color) {
      case 'purple':
        return { backgroundColor: '#F3E8FF', color: '#9333EA' };
      case 'amber':
        return { backgroundColor: '#FEF3C7', color: '#D97706' };
      case 'pink':
        return { backgroundColor: '#FCE7F3', color: '#DB2777' };
      case 'rose':
        return { backgroundColor: '#FFE4E6', color: '#E11D48' };
      case 'orange':
        return { backgroundColor: '#FFEDD5', color: '#EA580C' };
      case 'teal':
        return { backgroundColor: '#CCFBF1', color: '#0D9488' };
      case 'emerald':
        return { backgroundColor: '#D1FAE5', color: '#059669' };
      case 'blue':
      default:
        return { backgroundColor: '#DBEAFE', color: '#1D4ED8' };
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startRange = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalCount);

  // Pagination page numbers generator: 1, 2, 3, 4, 5, ..., 125
  const renderPaginationButtons = () => {
    const buttons: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage <= 4) {
        buttons.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        buttons.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        buttons.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return buttons;
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Table Top Header: Title and Sort By */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px 16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            lineHeight: '20px',
            color: '#0F172A',
            margin: 0,
          }}
          className="text-[14px] font-bold text-[#0F172A] leading-5 m-0"
        >
          Attendance Records ({totalCount.toLocaleString()})
        </h2>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: '#64748B',
            }}
          >
            Sort by
          </span>
          <div style={{ position: 'relative' }}>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as AttendanceSortOption)}
              style={{
                appearance: 'none',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '6px 30px 6px 12px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#1E293B',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="employee-asc">Employee (A to Z)</option>
              <option value="employee-desc">Employee (Z to A)</option>
              <option value="overtime-desc">Most Overtime</option>
              <option value="workhours-desc">Most Work Hours</option>
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

      {/* Table Container with Horizontal Scroll */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
          position: 'relative',
        }}
      >
        <table
          style={{
            width: '100%',
            minWidth: '1540px',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Header Row - Matching Exact Image Headers */}
          <thead>
            <tr className="h-[42px] bg-[#F8FAFC]/80 border-b border-[#E2E8F0] text-[11px] font-bold text-[#475569] uppercase tracking-[0.55px] select-none">
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                ATTENDANCE ID
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                DATE
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                EMPLOYEE ID
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                EMPLOYEE NAME
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                STATUS
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                CHECK IN
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                CHECK OUT
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                WORK HOURS
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                OVERTIME HOURS
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                DAY TYPE
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                PAID DAY EQUIVALENT
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                LATE FLAG
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                OVERTIME VALUE
              </th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">
                REMARKS
              </th>
              <th className="px-[14px] py-[12px] text-center whitespace-nowrap" style={{ width: '56px' }}>
                ACTIONS
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={15} style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                  No attendance records found matching current criteria.
                </td>
              </tr>
            ) : (
              records.map((rec) => {
                const statusBadge = getStatusBadgeStyle(rec.status);
                const dayTypeBadge = getDayTypeBadgeStyle(rec.dayType);
                const lateFlagBadge = getLateFlagBadgeStyle(rec.lateFlag);
                const avatarStyle = getAvatarStyle(rec.avatarColor);

                return (
                  <tr
                    key={rec.id}
                    style={{
                      height: '54px',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease',
                      backgroundColor: '#FFFFFF',
                    }}
                    className="hover:bg-slate-50/70"
                  >
                    {/* 1. ATTENDANCE ID */}
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <span
                        onClick={() => onViewRecord(rec)}
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#2563EB',
                          cursor: 'pointer',
                        }}
                        className="hover:underline"
                      >
                        {rec.id}
                      </span>
                    </td>

                    {/* 2. DATE */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: '13px', color: '#64748B' }}>
                      {rec.attendanceDate}
                    </td>

                    {/* 3. EMPLOYEE ID */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#2563EB' }}>
                        {rec.employeeId}
                      </span>
                    </td>

                    {/* 4. EMPLOYEE NAME with Circle Avatar */}
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '9999px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            flexShrink: 0,
                            ...avatarStyle,
                          }}
                        >
                          {rec.avatarInitials}
                        </div>
                        <span
                          onClick={() => onViewRecord(rec)}
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#0F172A',
                            cursor: 'pointer',
                          }}
                          className="hover:underline"
                        >
                          {rec.employeeName}
                        </span>
                      </div>
                    </td>

                    {/* 5. STATUS */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <StatusDropdownMenu
                        currentStatus={rec.status}
                        options={ATTENDANCE_STATUS_CONFIGS}
                        headerTitle="CHANGE STATE"
                        onSelect={(newStatus) => onUpdateStatus?.(rec.id, newStatus)}
                        disabled={!onUpdateStatus}
                      />
                    </td>

                    {/* 6. CHECK IN */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: '13px', color: rec.checkIn === '-' ? '#94A3B8' : '#64748B' }}>
                      {rec.checkIn}
                    </td>

                    {/* 7. CHECK OUT */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: '13px', color: rec.checkOut === '-' ? '#94A3B8' : '#64748B' }}>
                      {rec.checkOut}
                    </td>

                    {/* 8. WORK HOURS */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: '13px', color: '#64748B' }}>
                      {rec.workHours}
                    </td>

                    {/* 9. OVERTIME HOURS */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: '13px', color: '#64748B' }}>
                      {rec.overtimeHours}
                    </td>

                    {/* 10. DAY TYPE */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          lineHeight: '16px',
                          ...dayTypeBadge,
                        }}
                      >
                        {rec.dayType || 'Working Day'}
                      </div>
                    </td>

                    {/* 11. PAID DAY EQUIVALENT */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: '13px', color: '#64748B' }}>
                      {rec.paidDayEquivalent || '1.0'}
                    </td>

                    {/* 12. LATE FLAG */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          lineHeight: '16px',
                          ...lateFlagBadge,
                        }}
                      >
                        {rec.lateFlag || (rec.isLate ? 'Yes' : 'No')}
                      </div>
                    </td>

                    {/* 13. OVERTIME VALUE */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: '13px', color: '#64748B' }}>
                      {rec.overtimeValue || '₹ 0'}
                    </td>

                    {/* 14. REMARKS */}
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap', fontSize: '13px', color: rec.remarks === '-' ? '#94A3B8' : '#64748B' }}>
                      {rec.remarks || '-'}
                    </td>

                    {/* 15. ACTIONS (⋮ Menu) */}
                    <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                      <TableActionMenu
                        onViewDetails={() => onViewRecord(rec)}
                        onEdit={() => onEditRecord(rec)}
                        onDelete={() => {
                          if (window.confirm(`Delete attendance record ${rec.id}?`)) {
                            onDeleteRecord(rec.id);
                          }
                        }}
                        viewLabel="View Details"
                        editLabel="Edit Record"
                        deleteLabel="Delete"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: "'Inter', sans-serif",
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Showing Range */}
        <div style={{ fontSize: '13px', color: '#64748B' }}>
          Showing <span style={{ fontWeight: 600, color: '#1E293B' }}>{startRange} – {endRange}</span> of{' '}
          <span style={{ fontWeight: 600, color: '#1E293B' }}>{totalCount.toLocaleString()}</span> records
        </div>

        {/* Page navigation controls */}
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page Numbers */}
          {renderPaginationButtons().map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#4F46E5] text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
          >
            <ChevronRight size={16} />
          </button>

          {/* Page Size Selector */}
          <div className="relative ml-2">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{ border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
              className="bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs font-medium leading-4 text-slate-700 appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
