import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { UiuxDesignItem } from '../types/uiux';

interface UiuxTableProps {
  designs: UiuxDesignItem[];
  onEdit: (design: UiuxDesignItem) => void;
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
  // If already in "28 Oct 2026" or similar format
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(val)) return val;
  // If ISO YYYY-MM-DD
  const date = new Date(val);
  if (isNaN(date.getTime())) return val;
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// Designer Avatar color map matching Figma spec
const getDesignerBadgeStyle = (initials: string) => {
  switch (initials?.toUpperCase()) {
    case 'AS':
      return { bg: '#DBEAFE', color: '#1D4ED8' }; // Amit Sharma
    case 'SN':
      return { bg: '#E0E7FF', color: '#4338CA' }; // Sneha Nair
    case 'DP':
      return { bg: '#DBEAFE', color: '#1D4ED8' }; // Divya Patel
    case 'RV':
      return { bg: '#F3E8FF', color: '#7E22CE' }; // Rohan Verma
    case 'VK':
      return { bg: '#D1FAE5', color: '#047857' }; // Vikram Shah
    default:
      return { bg: '#E2E8F0', color: '#475569' };
  }
};

// Figma multi-slice 5-color SVG icon matching Figma vector paths
const FigmaIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" />
    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" />
    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" />
    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" />
    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" />
  </svg>
);

// Adobe XD badge matching Figma spec (width: 20.08px, height: 13px, background: #470137, text: #FF61F6)
const AdobeXdBadge: React.FC = () => (
  <div
    style={{
      boxSizing: 'border-box',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2px 4px',
      width: '20.08px',
      height: '13px',
      background: '#470137',
      borderRadius: '4px',
      flexShrink: 0,
    }}
  >
    <span
      style={{
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: 700,
        fontSize: '9px',
        lineHeight: '9px',
        color: '#FF61F6',
      }}
    >
      Xd
    </span>
  </div>
);

export const UiuxTable: React.FC<UiuxTableProps> = ({
  designs,
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const startIndex = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalElements, currentPage * pageSize);

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
        border: '1px solid rgba(226, 232, 240, 0.9)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Horizontally scrollable table container (width: 1925.97px) */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          minHeight: '400px',
        }}
      >
        <table
          style={{
            width: '1925.97px',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                height: '42px',
                background: 'rgba(248, 250, 252, 0.8)',
                borderBottom: '1px solid #E2E8F0',
                boxSizing: 'border-box',
              }}
            >
              <th style={{ width: '124.64px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Design ID
              </th>
              <th style={{ width: '75.3px', padding: '12px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Project ID
              </th>
              <th style={{ width: '117.23px', padding: '12px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Requirement ID
              </th>
              <th style={{ width: '155.89px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Screen / Feature
              </th>
              <th style={{ width: '87.78px', padding: '12px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Design Type
              </th>
              <th style={{ width: '63.39px', padding: '12px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Version
              </th>
              <th style={{ width: '139.67px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Designer
              </th>
              <th style={{ width: '165.89px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Asset / Prototype Link
              </th>
              <th style={{ width: '192.86px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Client Feedback
              </th>
              <th style={{ width: '100.3px', padding: '12px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Feedback Date
              </th>
              <th style={{ width: '105.89px', padding: '12px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Approval Status
              </th>
              <th style={{ width: '99.67px', padding: '12px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Approved By
              </th>
              <th style={{ width: '96.53px', padding: '12px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Approval Date
              </th>
              <th style={{ width: '108.66px', padding: '12px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Change Request
              </th>
              <th style={{ width: '101.47px', padding: '12px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Status
              </th>
              <th style={{ width: '127.52px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Notes
              </th>
              <th style={{ width: '63.28px', padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '-0.275px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {designs.length === 0 ? (
              <tr>
                <td colSpan={17} style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', fontSize: '14px' }}>
                  No design deliverables found matching your criteria.
                </td>
              </tr>
            ) : (
              designs.map((row) => {
                const badgeStyle = getDesignerBadgeStyle(row.designerInitials);
                const isPending = row.approvalStatus === 'Pending';
                const isApproved = row.approvalStatus === 'Approved';
                const isCompleted = row.status === 'Completed';

                return (
                  <tr
                    key={row.id}
                    style={{
                      height: '46px',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease',
                    }}
                    className="hover:bg-slate-50/80"
                  >
                    {/* 1. Design ID */}
                    <td style={{ width: '124.64px', padding: '13.5px 16px 14.5px' }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '12px', lineHeight: '18px', color: '#4F46E5', cursor: 'pointer' }}>
                        {row.id}
                      </span>
                    </td>

                    {/* 2. Project ID */}
                    <td style={{ width: '75.3px', padding: '13.5px 12px 14.5px' }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '12px', lineHeight: '18px', color: '#4F46E5', cursor: 'pointer' }}>
                        {row.projectId}
                      </span>
                    </td>

                    {/* 3. Requirement ID */}
                    <td style={{ width: '117.23px', padding: '13.5px 12px 14.5px' }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '12px', lineHeight: '18px', color: '#4F46E5', cursor: 'pointer' }}>
                        {row.requirementId}
                      </span>
                    </td>

                    {/* 4. Screen / Feature */}
                    <td style={{ width: '155.89px', padding: '13.5px 16px 14.5px' }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '12px', lineHeight: '18px', color: '#1E293B' }}>
                        {row.screenFeature}
                      </span>
                    </td>

                    {/* 5. Design Type */}
                    <td style={{ width: '87.78px', padding: '13.5px 12px 14.5px' }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: '#475569' }}>
                        {row.designType}
                      </span>
                    </td>

                    {/* 6. Version */}
                    <td style={{ width: '63.39px', padding: '13.5px 12px 14.5px' }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: '#475569' }}>
                        {row.version}
                      </span>
                    </td>

                    {/* 7. Designer */}
                    <td style={{ width: '139.67px', padding: '13.5px 16px 14.5px' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '9999px',
                            background: badgeStyle.bg,
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '10px', lineHeight: '15px', color: badgeStyle.color }}>
                            {row.designerInitials}
                          </span>
                        </div>
                        <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: '#1E293B' }}>
                          {row.designer}
                        </span>
                      </div>
                    </td>

                    {/* 8. Asset / Prototype Link */}
                    <td style={{ width: '165.89px', padding: '13.5px 16px 14.5px' }}>
                      <a
                        href={row.prototypeUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          textDecoration: 'none',
                          color: '#4F46E5',
                        }}
                        className="hover:underline"
                      >
                        {row.tool?.toLowerCase().includes('xd') ? <AdobeXdBadge /> : <FigmaIcon />}
                        <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#4F46E5' }}>
                          View Prototype
                        </span>
                        <ExternalLink size={12} color="#4F46E5" />
                      </a>
                    </td>

                    {/* 9. Client Feedback */}
                    <td style={{ width: '192.86px', padding: '13.5px 16px 14.5px' }}>
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '12px',
                          lineHeight: '18px',
                          color: '#475569',
                          display: 'inline-block',
                          maxWidth: '165px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={row.clientFeedback}
                      >
                        {row.clientFeedback || '-'}
                      </span>
                    </td>

                    {/* 10. Feedback Date */}
                    <td style={{ width: '100.3px', padding: '13.5px 12px 14.5px' }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: '#475569' }}>
                        {formatDisplayDate(row.feedbackDate)}
                      </span>
                    </td>

                    {/* 11. Approval Status */}
                    <td style={{ width: '105.89px', padding: '13px 12px' }}>
                      <div
                        style={{
                          boxSizing: 'border-box',
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.5px 8px',
                          height: '20px',
                          borderRadius: '9999px',
                          background: isPending ? '#FFFBEB' : isApproved ? '#ECFDF5' : '#F1F5F9',
                          border: isPending
                            ? '1px solid rgba(253, 230, 138, 0.6)'
                            : isApproved
                            ? '1px solid rgba(167, 243, 208, 0.6)'
                            : '1px solid #E2E8F0',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            fontSize: '11px',
                            lineHeight: '16px',
                            color: isPending ? '#D97706' : isApproved ? '#059669' : '#64748B',
                          }}
                        >
                          {row.approvalStatus}
                        </span>
                      </div>
                    </td>

                    {/* 12. Approved By */}
                    <td style={{ width: '99.67px', padding: '13.5px 12px 14.5px' }}>
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '12px',
                          lineHeight: '18px',
                          color: row.approvedBy && row.approvedBy !== '-' ? '#334155' : '#94A3B8',
                        }}
                      >
                        {row.approvedBy || '-'}
                      </span>
                    </td>

                    {/* 13. Approval Date */}
                    <td style={{ width: '96.53px', padding: '13.5px 12px 14.5px' }}>
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '12px',
                          lineHeight: '18px',
                          color: row.approvalDate && row.approvalDate !== '-' ? '#475569' : '#94A3B8',
                        }}
                      >
                        {formatDisplayDate(row.approvalDate)}
                      </span>
                    </td>

                    {/* 14. Change Request */}
                    <td style={{ width: '108.66px', padding: '13.5px 12px 14.5px' }}>
                      {row.changeRequest && row.changeRequest !== '-' ? (
                        <span
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            fontSize: '12px',
                            lineHeight: '18px',
                            color: '#4F46E5',
                            cursor: 'pointer',
                          }}
                        >
                          {row.changeRequest}
                        </span>
                      ) : (
                        <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: '#94A3B8' }}>
                          -
                        </span>
                      )}
                    </td>

                    {/* 15. Status */}
                    <td style={{ width: '101.47px', padding: '13px 12px' }}>
                      <div
                        style={{
                          boxSizing: 'border-box',
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.5px 8px',
                          height: '20px',
                          borderRadius: '9999px',
                          background: isCompleted ? '#ECFDF5' : '#EFF6FF',
                          border: isCompleted
                            ? '1px solid rgba(167, 243, 208, 0.6)'
                            : '1px solid rgba(191, 219, 254, 0.6)',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 500,
                            fontSize: '11px',
                            lineHeight: '16px',
                            color: isCompleted ? '#059669' : '#4F46E5',
                          }}
                        >
                          {row.status}
                        </span>
                      </div>
                    </td>

                    {/* 16. Notes */}
                    <td style={{ width: '127.52px', padding: '13.5px 16px 14.5px' }}>
                      <span
                        style={{
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '12px',
                          lineHeight: '18px',
                          color: row.notes && row.notes !== '-' ? '#475569' : '#94A3B8',
                        }}
                      >
                        {row.notes || '-'}
                      </span>
                    </td>

                    {/* 17. Actions */}
                    <td style={{ width: '63.28px', padding: '10.5px 12px 11.5px', textAlign: 'center', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === row.id ? null : row.id);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        className="hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical size={16} color="#94A3B8" />
                      </button>

                      {/* Dropdown Action Menu */}
                      {activeMenuId === row.id && (
                        <div
                          ref={menuRef}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '36px',
                            width: '130px',
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
                              onEdit(row);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: '100%',
                              padding: '8px 12px',
                              background: 'transparent',
                              border: 'none',
                              fontSize: '12px',
                              color: '#334155',
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                            className="hover:bg-slate-50"
                          >
                            <Edit2 size={13} color="#64748B" />
                            Edit Design
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDelete(row.id);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: '100%',
                              padding: '8px 12px',
                              background: 'transparent',
                              border: 'none',
                              fontSize: '12px',
                              color: '#E11D48',
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                            className="hover:bg-rose-50"
                          >
                            <Trash2 size={13} color="#E11D48" />
                            Delete
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

      {/* Pagination Bar */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          width: '100%',
          height: '53px',
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
        }}
      >
        {/* Left: Showing count */}
        <span
          style={{
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#64748B',
          }}
        >
          Showing {startIndex}–{endIndex} of {totalElements} requirements
        </span>

        {/* Right: Pagination numbers & page size selector */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Page numbers */}
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
                borderRadius: '4px',
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
                    borderRadius: '4px',
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
                {/* Ellipsis */}
                <span
                  style={{
                    fontFamily: 'Inter',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#94A3B8',
                    padding: '0 4px',
                  }}
                >
                  ...
                </span>

                {/* Final page */}
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
                    borderRadius: '4px',
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
                borderRadius: '4px',
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
              width: '96.7px',
              height: '26px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '4px 10px',
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
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
                width: '100%',
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
