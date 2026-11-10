import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { UatItem } from '../types/uat';

interface UatTableProps {
  uats: UatItem[];
  onEdit: (uat: UatItem) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalElements: number;
}

// Format date to "28 Oct 2026"
const formatDisplayDate = (val?: string | null): string => {
  if (!val || val === '-' || val === 'null') return '-';
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(val)) return val;
  const date = new Date(val);
  if (isNaN(date.getTime())) return val;
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const getTesterAvatarStyle = (initials: string, customColor?: string) => {
  switch (initials?.toUpperCase()) {
    case 'AS':
      return { bg: '#E0E7FF', color: '#4338CA' };
    case 'SN':
      return { bg: '#F3E8FF', color: '#7E22CE' };
    case 'DP':
      return { bg: '#DBEAFE', color: '#1D4ED8' };
    case 'RV':
      return { bg: '#EDE9FE', color: '#6D28D9' };
    case 'VK':
      return { bg: '#ECFCCB', color: '#4D7C0F' };
    default:
      return { bg: '#F1F5F9', color: customColor || '#475569' };
  }
};

export const UatTable: React.FC<UatTableProps> = ({
  uats,
  onEdit,
  onDelete,
  currentPage,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalElements,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const startIndex = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '0px',
        width: '100%',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Scrollable table container */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          minHeight: '260px',
        }}
      >
        <table
          style={{
            width: '100%',
            minWidth: '1750px',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          {/* Table Header */}
          <thead>
            <tr
              style={{
                height: '42px',
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <th style={{ ...thStyle, width: '130px', paddingLeft: '20px' }}>UAT ID</th>
              <th style={{ ...thStyle, width: '100px' }}>Project ID</th>
              <th style={{ ...thStyle, width: '140px' }}>Requirement ID</th>
              <th style={{ ...thStyle, width: '110px' }}>Test Date</th>
              <th style={{ ...thStyle, width: '90px' }}>Test Case</th>
              <th style={{ ...thStyle, width: '220px' }}>Expected Result</th>
              <th style={{ ...thStyle, width: '220px' }}>Actual Result</th>
              <th style={{ ...thStyle, width: '150px' }}>Tester</th>
              <th style={{ ...thStyle, width: '100px' }}>Status</th>
              <th style={{ ...thStyle, width: '110px' }}>Defect ID</th>
              <th style={{ ...thStyle, width: '130px' }}>Client Approval</th>
              <th style={{ ...thStyle, width: '110px' }}>Approval Date</th>
              <th style={{ ...thStyle, width: '200px' }}>Comments</th>
              <th style={{ ...thStyle, width: '60px', textAlign: 'right', paddingRight: '20px' }}>Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {uats.length === 0 ? (
              <tr>
                <td
                  colSpan={14}
                  style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    fontFamily: 'Inter',
                    fontSize: '13px',
                    color: '#64748B',
                  }}
                >
                  No UAT execution records found matching your filters.
                </td>
              </tr>
            ) : (
              uats.map((uat, idx) => {
                const avatarStyle = getTesterAvatarStyle(uat.testerInitials, uat.testerColor);

                return (
                  <tr
                    key={uat.id || idx}
                    style={{
                      height: '52px',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease',
                    }}
                    className="hover:bg-slate-50/70"
                  >
                    {/* 1. UAT ID */}
                    <td
                      style={{
                        padding: '12px 16px 12px 20px',
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '13px',
                        lineHeight: '18px',
                        color: '#4F46E5',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {uat.id}
                    </td>

                    {/* 2. Project ID */}
                    <td
                      style={{
                        padding: '12px 16px',
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '13px',
                        lineHeight: '18px',
                        color: '#4F46E5',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {uat.projectId}
                    </td>

                    {/* 3. Requirement ID */}
                    <td
                      style={{
                        padding: '12px 16px',
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '13px',
                        lineHeight: '18px',
                        color: '#4F46E5',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {uat.requirementId}
                    </td>

                    {/* 4. Test Date */}
                    <td
                      style={{
                        padding: '12px 16px',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#334155',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDisplayDate(uat.testDate)}
                    </td>

                    {/* 5. Test Case */}
                    <td
                      style={{
                        padding: '12px 16px',
                        fontFamily: 'Inter',
                        fontWeight: 600,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#0F172A',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {uat.testCase}
                    </td>

                    {/* 6. Expected Result */}
                    <td
                      style={{
                        padding: '12px 16px',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#334155',
                      }}
                    >
                      {uat.expectedResult}
                    </td>

                    {/* 7. Actual Result */}
                    <td
                      style={{
                        padding: '12px 16px',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#334155',
                      }}
                    >
                      {uat.actualResult}
                    </td>

                    {/* 8. Tester */}
                    <td
                      style={{
                        padding: '12px 16px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            boxSizing: 'border-box',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '26px',
                            height: '26px',
                            borderRadius: '9999px',
                            background: avatarStyle.bg,
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 700,
                              fontSize: '10px',
                              lineHeight: '12px',
                              color: avatarStyle.color,
                            }}
                          >
                            {uat.testerInitials || 'TS'}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '12px',
                            lineHeight: '16px',
                            color: '#334155',
                          }}
                        >
                          {uat.testerName}
                        </span>
                      </div>
                    </td>

                    {/* 9. Status */}
                    <td
                      style={{
                        padding: '12px 16px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '11px',
                          lineHeight: '15px',
                          ...(uat.status === 'Passed'
                            ? { background: '#ECFDF5', color: '#047857' }
                            : uat.status === 'Failed'
                            ? { background: '#FEF2F2', color: '#DC2626' }
                            : { background: '#EFF6FF', color: '#2563EB' }),
                        }}
                      >
                        {uat.status}
                      </span>
                    </td>

                    {/* 10. Defect ID */}
                    <td
                      style={{
                        padding: '12px 16px',
                        fontFamily: 'Inter',
                        fontWeight: uat.defectId && uat.defectId !== '-' ? 500 : 400,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: uat.defectId && uat.defectId !== '-' ? '#4F46E5' : '#64748B',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {uat.defectId || '-'}
                    </td>

                    {/* 11. Client Approval */}
                    <td
                      style={{
                        padding: '12px 16px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontFamily: 'Inter',
                          fontWeight: 500,
                          fontSize: '11px',
                          lineHeight: '15px',
                          ...(uat.clientApproval === 'Approved'
                            ? { background: '#ECFDF5', color: '#047857' }
                            : { background: '#FFFBEB', color: '#B45309' }),
                        }}
                      >
                        {uat.clientApproval}
                      </span>
                    </td>

                    {/* 12. Approval Date */}
                    <td
                      style={{
                        padding: '12px 16px',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#334155',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDisplayDate(uat.approvalDate)}
                    </td>

                    {/* 13. Comments */}
                    <td
                      style={{
                        padding: '12px 16px',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: '#64748B',
                      }}
                    >
                      {uat.comments || '-'}
                    </td>

                    {/* 14. Actions */}
                    <td
                      style={{
                        padding: '12px 20px 12px 16px',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        position: 'relative',
                      }}
                    >
                      <button
                        type="button"
                        aria-label="Actions"
                        onClick={() => setActiveMenuId(activeMenuId === uat.id ? null : uat.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#64748B',
                        }}
                        className="hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown actions menu */}
                      {activeMenuId === uat.id && (
                        <div
                          ref={menuRef}
                          style={{
                            position: 'absolute',
                            right: '20px',
                            top: '40px',
                            width: '120px',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            zIndex: 50,
                            padding: '4px 0',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEdit(uat);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              fontFamily: 'Inter',
                              fontSize: '12px',
                              color: '#334155',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <Edit2 size={13} color="#64748B" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDelete(uat.id);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              fontFamily: 'Inter',
                              fontSize: '12px',
                              color: '#DC2626',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                            className="hover:bg-red-50 transition-colors"
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

      {/* Pagination Footer matching Figma Requirement */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          width: '100%',
          borderTop: '1px solid #E2E8F0',
          background: '#FFFFFF',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Showing entries */}
        <span
          style={{
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#64748B',
          }}
        >
          Showing <span style={{ fontWeight: 600, color: '#0F172A' }}>{startIndex} – {endIndex}</span> of{' '}
          <span style={{ fontWeight: 600, color: '#0F172A' }}>{totalElements}</span> requirements
        </span>

        {/* Right: Pagination Controls */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {/* Prev button */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '28px',
                height: '28px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.5 : 1,
                fontFamily: 'Inter',
                fontSize: '12px',
                fontWeight: 500,
                color: '#64748B',
              }}
            >
              &lt;
            </button>

            {/* Dynamic page buttons matching Figma spec */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pg) => {
              const isActive = currentPage === pg;
              return (
                <button
                  key={pg}
                  type="button"
                  onClick={() => onPageChange(pg)}
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '28px',
                    height: '28px',
                    background: isActive ? '#4F46E5' : '#FFFFFF',
                    border: isActive ? 'none' : '1px solid #E2E8F0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'Inter',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: isActive ? '#FFFFFF' : '#334155',
                  }}
                >
                  {pg}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#94A3B8',
                    padding: '0 4px',
                  }}
                >
                  ...
                </span>
                <button
                  type="button"
                  onClick={() => onPageChange(totalPages)}
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '28px',
                    height: '28px',
                    background: currentPage === totalPages ? '#4F46E5' : '#FFFFFF',
                    border: currentPage === totalPages ? 'none' : '1px solid #E2E8F0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'Inter',
                    fontWeight: currentPage === totalPages ? 600 : 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: currentPage === totalPages ? '#FFFFFF' : '#334155',
                  }}
                >
                  {totalPages}
                </button>
              </>
            )}

            {/* Next button */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '28px',
                height: '28px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.5 : 1,
                fontFamily: 'Inter',
                fontSize: '12px',
                fontWeight: 500,
                color: '#64748B',
              }}
            >
              &gt;
            </button>
          </div>

          {/* Page size dropdown */}
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              height: '30px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '2px 8px',
              background: '#FFFFFF',
            }}
          >
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                border: 'none',
                background: 'transparent',
                fontFamily: 'Inter',
                fontSize: '12px',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: 600,
  fontSize: '11px',
  lineHeight: '16px',
  letterSpacing: '0.04em',
  color: '#64748B',
  padding: '10px 16px',
  whiteSpace: 'nowrap',
};

