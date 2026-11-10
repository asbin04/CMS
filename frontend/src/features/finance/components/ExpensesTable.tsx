import React, { useState } from 'react';
import { ExpenseItem } from '../types/expenses';

interface ExpensesTableProps {
  expenses: ExpenseItem[];
  isLoading: boolean;
  onEdit: (expense: ExpenseItem) => void;
  onDelete: (id: number) => void;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const totalCount = expenses.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentExpenses = expenses.slice(startIndex, startIndex + pageSize);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Software':
        return { bg: '#EEF2FF', text: '#4338CA' };
      case 'Travel':
        return { bg: '#F0F9FF', text: '#0369A1' };
      case 'Utilities':
        return { bg: '#ECFDF5', text: '#047857' };
      case 'Office Supplies':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'Hardware':
        return { bg: '#EDE9FE', text: '#6D28D9' };
      case 'Marketing':
        return { bg: '#FFF1F2', text: '#BE123C' };
      case 'Training':
        return { bg: '#ECFDF5', text: '#047857' };
      default:
        return { bg: '#F1F5F9', text: '#334155' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return { bg: '#ECFDF5', text: '#047857' };
      case 'Pending':
        return { bg: '#FFFBEB', text: '#B45309' };
      case 'Rejected':
        return { bg: '#FFF1F2', text: '#BE123C' };
      default:
        return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const getBucketBadge = (bucket: string) => {
    switch (bucket) {
      case 'Operational':
        return { bg: '#EFF6FF', text: '#1D4ED8' };
      case 'Project':
        return { bg: '#FAF5FF', text: '#7E22CE' };
      case 'General':
        return { bg: '#F1F5F9', text: '#334155' };
      case 'Capital':
        return { bg: '#F3E8FF', text: '#7E22CE' };
      case 'Marketing':
        return { bg: '#FDF2F8', text: '#BE185D' };
      case 'People':
        return { bg: '#F3E8FF', text: '#7E22CE' };
      default:
        return { bg: '#F1F5F9', text: '#334155' };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderPaginationButtons = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span
            key={`ellipsis-${idx}`}
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
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
          key={pageNum}
          type="button"
          onClick={() => setCurrentPage(pageNum)}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: isActive ? '#4F46E5' : 'transparent',
            color: isActive ? '#FFFFFF' : '#64748B',
            fontSize: '12px',
            fontWeight: isActive ? 600 : 500,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div
      style={{
        width: '100%',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Scrollable table container */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            width: '100%',
            minWidth: '1965px',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <thead>
            <tr
              style={{
                height: '42px',
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '134px' }}>Expense ID</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '110px' }}>Expense Date</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '120px' }}>Category</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '100px' }}>Vendor ID</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '100px' }}>Project ID</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '110px' }}>Employee ID</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '250px' }}>Description</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '160px' }}>Amount Before Tax (₹)</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '130px' }}>Tax Amount (₹)</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '140px' }}>Total Amount (₹)</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '120px' }}>Payment Mode</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '110px' }}>Status</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '130px' }}>Approved By</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '100px' }}>Month</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '130px' }}>Expense Bucket</th>
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#334155', letterSpacing: '0.2px', width: '60px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={16} style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                  Loading expenses...
                </td>
              </tr>
            ) : currentExpenses.length === 0 ? (
              <tr>
                <td colSpan={16} style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                  No expense records found.
                </td>
              </tr>
            ) : (
              currentExpenses.map((exp) => {
                const catBadge = getCategoryBadge(exp.category);
                const statBadge = getStatusBadge(exp.status);
                const bktBadge = getBucketBadge(exp.expenseBucket);

                return (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/70 transition-colors"
                    style={{
                      height: '52px',
                      borderBottom: '1px solid #F1F5F9',
                    }}
                  >
                    {/* Expense ID */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontWeight: 500,
                          fontSize: '12px',
                          color: '#4F46E5',
                          cursor: 'pointer',
                        }}
                      >
                        {exp.expenseCode}
                      </span>
                    </td>

                    {/* Expense Date */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                      {formatDate(exp.expenseDate)}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: catBadge.bg,
                          color: catBadge.text,
                          fontSize: '11px',
                          fontWeight: 500,
                          lineHeight: '14px',
                        }}
                      >
                        {exp.category}
                      </span>
                    </td>

                    {/* Vendor ID */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                      {exp.vendorId || '-'}
                    </td>

                    {/* Project ID */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: exp.projectId ? '#4F46E5' : '#64748B', fontWeight: exp.projectId ? 500 : 400 }}>
                      {exp.projectId || '-'}
                    </td>

                    {/* Employee ID */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                      {exp.employeeId || '-'}
                    </td>

                    {/* Description */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#0F172A', fontWeight: 500, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={exp.description}>
                      {exp.description}
                    </td>

                    {/* Amount Before Tax */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                      {formatNumber(exp.amountBeforeTax)}
                    </td>

                    {/* Tax Amount */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                      {formatNumber(exp.taxAmount)}
                    </td>

                    {/* Total Amount */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#0F172A', fontWeight: 700 }}>
                      {formatNumber(exp.totalAmount)}
                    </td>

                    {/* Payment Mode */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                      {exp.paymentMode || '-'}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: statBadge.bg,
                          color: statBadge.text,
                          fontSize: '11px',
                          fontWeight: 500,
                          lineHeight: '14px',
                        }}
                      >
                        {exp.status}
                      </span>
                    </td>

                    {/* Approved By */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                      {exp.approvedBy || '-'}
                    </td>

                    {/* Month */}
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                      {exp.monthLabel || '-'}
                    </td>

                    {/* Expense Bucket */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: bktBadge.bg,
                          color: bktBadge.text,
                          fontSize: '11px',
                          fontWeight: 500,
                          lineHeight: '14px',
                        }}
                      >
                        {exp.expenseBucket}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === exp.id ? null : exp.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#4F46E5',
                          fontSize: '16px',
                          padding: '4px',
                        }}
                      >
                        ⋮
                      </button>

                      {activeMenuId === exp.id && (
                        <div
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '36px',
                            width: '120px',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            zIndex: 40,
                            padding: '4px 0',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEdit(exp);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '6px 12px',
                              fontSize: '12px',
                              color: '#334155',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                            className="hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              if (window.confirm(`Are you sure you want to delete ${exp.expenseCode}?`)) {
                                onDelete(exp.id);
                              }
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '6px 12px',
                              fontSize: '12px',
                              color: '#EF4444',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                            className="hover:bg-red-50"
                          >
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

      {/* Pagination Footer */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderTop: '1px solid #E2E8F0',
          background: '#FFFFFF',
        }}
      >
        {/* Left: Showing 1 – 10 of 124 deployments */}
        <div style={{ fontSize: '12px', color: '#64748B' }}>
          Showing{' '}
          <span style={{ fontWeight: 600, color: '#0F172A' }}>
            {totalCount === 0 ? 0 : startIndex + 1} – {Math.min(startIndex + pageSize, totalCount)}
          </span>{' '}
          of <span style={{ fontWeight: 600, color: '#0F172A' }}>{totalCount}</span> deployments
        </div>

        {/* Right: Pagination controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Prev */}
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: currentPage === 1 ? '#CBD5E1' : '#64748B',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
              }}
            >
              &lt;
            </button>

            {renderPaginationButtons()}

            {/* Next */}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: currentPage === totalPages ? '#CBD5E1' : '#64748B',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
              }}
            >
              &gt;
            </button>
          </div>

          {/* Page size select */}
          <div style={{ position: 'relative' }}>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                height: '32px',
                padding: '0 28px 0 10px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                fontSize: '12px',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <div
              style={{
                position: 'absolute',
                right: '8px',
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
    </div>
  );
};

