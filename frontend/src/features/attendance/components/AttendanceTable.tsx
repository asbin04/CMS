import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { AttendanceRecord, AttendanceSortOption } from '../types/attendance';

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
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
            fontSize: '16px',
            fontWeight: 700,
            lineHeight: '24px',
            color: '#0F172A',
            margin: 0,
          }}
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
            <tr
              style={{
                height: '44px',
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Attendance ID
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Date
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Employee ID
              </th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Employee Name
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Status
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Check In
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Check Out
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Work Hours
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Overtime Hours
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Day Type
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Paid Day Equivalent
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Late Flag
              </th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Overtime Value
              </th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
                Remarks
              </th>
              <th style={{ width: '56px', padding: '12px 14px', fontSize: '12px', fontWeight: 600, color: '#64748B', textAlign: 'center', whiteSpace: 'nowrap' }}>
                Actions
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
                const isMenuOpen = activeMenuId === rec.id;

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
                          ...statusBadge,
                        }}
                      >
                        {rec.status}
                      </div>
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
                    <td style={{ padding: '14px 14px', textAlign: 'center', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : rec.id);
                        }}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#94A3B8',
                        }}
                        className="hover:bg-slate-100"
                        title="Actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {isMenuOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            right: '18px',
                            top: '40px',
                            width: '134px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                            zIndex: 50,
                            padding: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onViewRecord(rec);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 10px',
                              fontSize: '12px',
                              color: '#334155',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left',
                            }}
                            className="hover:bg-slate-50"
                          >
                            <Eye size={13} color="#64748B" />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditRecord(rec);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 10px',
                              fontSize: '12px',
                              color: '#334155',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left',
                            }}
                            className="hover:bg-slate-50"
                          >
                            <Edit size={13} color="#2563EB" />
                            <span>Edit Record</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (window.confirm(`Delete attendance record ${rec.id}?`)) {
                                onDeleteRecord(rec.id);
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 10px',
                              fontSize: '12px',
                              color: '#DC2626',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left',
                            }}
                            className="hover:bg-red-50"
                          >
                            <Trash2 size={13} color="#DC2626" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
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

        {/* Center / Right: Page Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Page Buttons: < 1 2 3 4 5 ... 125 > */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: currentPage <= 1 ? '#CBD5E1' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={15} />
            </button>

            {renderPaginationButtons().map((p, idx) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    style={{
                      width: '26px',
                      textAlign: 'center',
                      fontSize: '13px',
                      color: '#94A3B8',
                    }}
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
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    border: isActive ? 'none' : '1px solid #E2E8F0',
                    backgroundColor: isActive ? '#2563EB' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#334155',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: currentPage >= totalPages ? '#CBD5E1' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Page Size Selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                appearance: 'none',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '6px 28px 6px 12px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
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
    </div>
  );
};
