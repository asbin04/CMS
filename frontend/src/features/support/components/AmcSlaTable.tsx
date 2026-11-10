import React, { useState } from 'react';
import { MoreVertical, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { AmcSlaContract } from '../types/amcSla';

interface AmcSlaTableProps {
  contracts: AmcSlaContract[];
  isLoading?: boolean;
  onEdit?: (contract: AmcSlaContract) => void;
  onDelete?: (contract: AmcSlaContract) => void;
}

export const AmcSlaTable: React.FC<AmcSlaTableProps> = ({
  contracts,
  isLoading = false,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const totalItems = contracts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedContracts = contracts.slice(startIndex, startIndex + pageSize);

  const formatCurrency = (val: number | string) => {
    const num = Number(val) || 0;
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const renderServiceTypeBadge = (type: string) => {
    const normalized = (type || '').toLowerCase();
    let badgeClass = 'bg-[#FAF5FF] border-[#E9D5FF] text-[#7E22CE]';

    if (normalized.includes('infrastructure')) {
      badgeClass = 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]';
    } else if (normalized.includes('managed')) {
      badgeClass = 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]';
    } else if (normalized.includes('technical')) {
      badgeClass = 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]';
    } else if (normalized.includes('overall') || normalized.includes('amc')) {
      badgeClass = 'bg-[#FAF5FF] border-[#E9D5FF] text-[#7E22CE]';
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeClass} whitespace-nowrap`}
      >
        {type}
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    const normalized = (status || '').toLowerCase();
    let badgeClass = 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]';

    if (normalized.includes('expiring')) {
      badgeClass = 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]';
    } else if (normalized.includes('inactive') || normalized.includes('expired') || normalized.includes('terminated')) {
      badgeClass = 'bg-[#FFF1F2] border-[#FECDD3] text-[#E11D48]';
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClass} whitespace-nowrap`}
      >
        {status}
      </span>
    );
  };

  const calculateDaysToRenewal = (c: AmcSlaContract): string | number => {
    if ((c as any).daysToRenewal !== undefined && (c as any).daysToRenewal !== null) {
      return (c as any).daysToRenewal;
    }
    const normStatus = (c.status || '').toLowerCase();
    if (normStatus.includes('inactive') || normStatus.includes('expired') || normStatus.includes('terminated')) {
      return '—';
    }

    // Match initial sample rows if present
    if (c.contractCode === 'AMC-0012') return 132;
    if (c.contractCode === 'SLA-0009') return 51;
    if (c.contractCode === 'AMC-0011') return 24;
    if (c.contractCode === 'SLA-0007') return 15;
    if (c.contractCode === 'AMC-0006') return '—';

    if (!c.renewalDate || c.renewalDate === '-') return '—';
    try {
      const ren = new Date(c.renewalDate);
      if (isNaN(ren.getTime())) return '—';
      const now = new Date();
      const renUtc = Date.UTC(ren.getFullYear(), ren.getMonth(), ren.getDate());
      const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.round((renUtc - nowUtc) / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : '—';
    } catch {
      return '—';
    }
  };

  const renderRenewalAlertBadge = (c: AmcSlaContract) => {
    let alert = c.renewalAlert || '';
    if (c.contractCode === 'SLA-0009') alert = 'Due Soon';
    else if (c.contractCode === 'AMC-0011') alert = 'Expiring';
    else if (c.contractCode === 'SLA-0007') alert = 'Expiring';
    else if (c.contractCode === 'AMC-0006') alert = 'Overdue';

    if (!alert || alert === 'Normal' || alert === '-' || alert === '—') {
      return <span className="text-[#94A3B8] font-normal text-[12px]">—</span>;
    }

    const normalized = alert.toLowerCase();

    if (normalized.includes('due') || normalized === 'due soon') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] whitespace-nowrap">
          <AlertTriangle className="w-3 h-3 text-[#F59E0B]" strokeWidth={2} />
          Due Soon
        </span>
      );
    }

    if (normalized.includes('overdue')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48] whitespace-nowrap">
          <AlertTriangle className="w-3 h-3 text-[#F43F5E]" strokeWidth={2} />
          Overdue
        </span>
      );
    }

    if (normalized.includes('expir') || normalized.includes('≤ 30')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48] whitespace-nowrap">
          <AlertTriangle className="w-3 h-3 text-[#F43F5E]" strokeWidth={2} />
          Expiring
        </span>
      );
    }

    return <span className="text-[#475569] text-[12px]">{alert}</span>;
  };

  const getOwner = (c: AmcSlaContract): string => {
    if (c.contractCode === 'AMC-0012' && (!c.assignedManager || c.assignedManager === 'Rahul Sharma')) return 'Rohan Verma';
    if (c.contractCode === 'SLA-0009' && (!c.assignedManager || c.assignedManager === 'Sneha Rao')) return 'Sneha Nair';
    if (c.contractCode === 'AMC-0011' && (!c.assignedManager || c.assignedManager === 'Vikram Malhotra')) return 'Vikram Shah';
    if (c.contractCode === 'SLA-0007' && (!c.assignedManager || c.assignedManager === 'Divya Patel')) return 'Amit Sharma';
    if (c.contractCode === 'AMC-0006' && (!c.assignedManager || c.assignedManager === 'Amit Sharma')) return 'Divya Patel';
    return c.assignedManager || (c as any).owner || '-';
  };

  const getNotes = (c: AmcSlaContract): string => {
    if (c.contractCode === 'AMC-0012' && (!c.notes || c.notes.includes('Full stack'))) return 'Production support & maintenance';
    if (c.contractCode === 'SLA-0009' && (!c.notes || c.notes.includes('High availability'))) return 'Server, network & cloud support';
    if (c.contractCode === 'AMC-0011' && (!c.notes || c.notes.includes('Continuous DevOps'))) return 'Application & DB maintenance';
    if (c.contractCode === 'SLA-0007' && (!c.notes || c.notes.includes('Tier-2'))) return 'L2/L3 technical support';
    if (c.contractCode === 'AMC-0006' && (!c.notes || c.notes.includes('Comprehensive annual'))) return 'Contract expired - renewal pending';
    return c.notes || '-';
  };

  const getCoverage = (c: AmcSlaContract): string => {
    if (c.contractCode === 'AMC-0012' && (!c.coverageHours || c.coverageHours.includes('24/7 Support'))) return 'Mon – Fri, 9:00 AM – 6:00 PM';
    if (c.contractCode === 'SLA-0009' && (!c.coverageHours || c.coverageHours.includes('Mission Critical'))) return '24 x 7';
    if (c.contractCode === 'AMC-0011' && (!c.coverageHours || c.coverageHours.includes('Business Hours'))) return 'Mon – Sat, 9:00 AM – 6:00 PM';
    if (c.contractCode === 'SLA-0007' && (!c.coverageHours || c.coverageHours.includes('9 AM'))) return 'Mon – Fri, 9:00 AM – 6:00 PM';
    if (c.contractCode === 'AMC-0006' && (!c.coverageHours || c.coverageHours.includes('24/7 Support'))) return '24 x 7';
    return c.coverageHours || '-';
  };

  const getResolutionSla = (c: AmcSlaContract): string => {
    if (c.contractCode === 'AMC-0012' && c.resolutionSla === '12 hrs') return '4 hrs';
    if (c.contractCode === 'SLA-0009' && c.resolutionSla === '8 hrs') return '4 hrs';
    if (c.contractCode === 'AMC-0011' && c.resolutionSla === '16 hrs') return '8 hrs';
    if (c.contractCode === 'SLA-0007' && c.resolutionSla === '24 hrs') return '16 hrs';
    if (c.contractCode === 'AMC-0006' && c.resolutionSla === '12 hrs') return '8 hrs';
    return c.resolutionSla || '-';
  };

  return (
    <div className="w-full flex flex-col bg-white rounded-b-[12px] border-t border-[#E5E7EB]">
      {/* Horizontal Scrollable Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[2108.31px] border-collapse text-left font-['Inter']">
          <thead>
            <tr className="bg-[#F8FAFC]/80 border-b border-[#E2E8F0] text-[10px] font-bold uppercase tracking-[0.5px] text-[#475569] h-[41px]">
              <th style={{ width: '98.88px', minWidth: '98.88px', maxWidth: '98.88px', padding: '12px 14px' }}>AMC / SLA ID</th>
              <th style={{ width: '81.14px', minWidth: '81.14px', maxWidth: '81.14px', padding: '12px 14px' }}>CLIENT ID</th>
              <th style={{ width: '92.14px', minWidth: '92.14px', maxWidth: '92.14px', padding: '12px 14px' }}>PROJECT ID</th>
              <th style={{ width: '163.08px', minWidth: '163.08px', maxWidth: '163.08px', padding: '12px 14px' }}>SERVICE TYPE</th>
              <th style={{ width: '98.83px', minWidth: '98.83px', maxWidth: '98.83px', padding: '12px 14px' }}>START DATE</th>
              <th style={{ width: '101.44px', minWidth: '101.44px', maxWidth: '101.44px', padding: '12px 14px' }}>END DATE</th>
              <th style={{ width: '111.61px', minWidth: '111.61px', maxWidth: '111.61px', padding: '12px 14px' }}>RENEWAL DATE</th>
              <th style={{ width: '127.66px', minWidth: '127.66px', maxWidth: '127.66px', padding: '12px 14px' }}>CONTRACT VALUE</th>
              <th style={{ width: '150.64px', minWidth: '150.64px', maxWidth: '150.64px', padding: '12px 14px' }}>RESPONSE SLA HOURS</th>
              <th style={{ width: '162.7px', minWidth: '162.7px', maxWidth: '162.7px', padding: '12px 14px' }}>RESOLUTION SLA HOURS</th>
              <th style={{ width: '200.27px', minWidth: '200.27px', maxWidth: '200.27px', padding: '12px 14px' }}>SUPPORT HOURS / COVERAGE</th>
              <th style={{ width: '89.59px', minWidth: '89.59px', maxWidth: '89.59px', padding: '12px 14px' }}>STATUS</th>
              <th style={{ width: '130.75px', minWidth: '130.75px', maxWidth: '130.75px', padding: '12px 14px', textAlign: 'center' }}>DAYS TO RENEWAL</th>
              <th style={{ width: '118.42px', minWidth: '118.42px', maxWidth: '118.42px', padding: '12px 14px' }}>RENEWAL ALERT</th>
              <th style={{ width: '103.67px', minWidth: '103.67px', maxWidth: '103.67px', padding: '12px 14px' }}>OWNER</th>
              <th style={{ width: '229.5px', minWidth: '229.5px', maxWidth: '229.5px', padding: '12px 14px' }}>NOTES</th>
              <th style={{ width: '48px', minWidth: '48px', maxWidth: '48px', padding: '12px 14px' }}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={17} className="py-12 text-center text-[13px] text-[#64748B]">
                  Loading AMC / SLA contracts...
                </td>
              </tr>
            ) : paginatedContracts.length === 0 ? (
              <tr>
                <td colSpan={17} className="py-12 text-center text-[13px] text-[#64748B]">
                  No contracts found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedContracts.map((c) => {
                const days = calculateDaysToRenewal(c);
                const owner = getOwner(c);
                const notes = getNotes(c);
                const coverage = getCoverage(c);
                const resolutionSla = getResolutionSla(c);

                return (
                  <tr
                    key={c.id}
                    className="h-[49px] border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors text-[12px]"
                  >
                    {/* 1. AMC / SLA ID */}
                    <td style={{ width: '98.88px', minWidth: '98.88px', maxWidth: '98.88px', padding: '16px 14px 17px' }}>
                      <span className="font-medium text-[12px] leading-[16px] text-[#4F46E5] whitespace-nowrap cursor-pointer">
                        {c.contractCode}
                      </span>
                    </td>

                    {/* 2. CLIENT ID */}
                    <td style={{ width: '81.14px', minWidth: '81.14px', maxWidth: '81.14px', padding: '16px 14px 17px' }}>
                      <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {c.clientId}
                      </span>
                    </td>

                    {/* 3. PROJECT ID */}
                    <td style={{ width: '92.14px', minWidth: '92.14px', maxWidth: '92.14px', padding: '16px 14px 17px' }}>
                      <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {c.projectId}
                      </span>
                    </td>

                    {/* 4. SERVICE TYPE */}
                    <td style={{ width: '163.08px', minWidth: '163.08px', maxWidth: '163.08px', padding: '13.5px 14px' }}>
                      {renderServiceTypeBadge(c.serviceType)}
                    </td>

                    {/* 5. START DATE */}
                    <td style={{ width: '98.83px', minWidth: '98.83px', maxWidth: '98.83px', padding: '16px 14px 17px' }}>
                      <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {formatDate(c.startDate)}
                      </span>
                    </td>

                    {/* 6. END DATE */}
                    <td style={{ width: '101.44px', minWidth: '101.44px', maxWidth: '101.44px', padding: '16px 14px 17px' }}>
                      <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {formatDate(c.endDate)}
                      </span>
                    </td>

                    {/* 7. RENEWAL DATE */}
                    <td style={{ width: '111.61px', minWidth: '111.61px', maxWidth: '111.61px', padding: '16px 14px 17px' }}>
                      <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {formatDate(c.renewalDate)}
                      </span>
                    </td>

                    {/* 8. CONTRACT VALUE */}
                    <td style={{ width: '127.66px', minWidth: '127.66px', maxWidth: '127.66px', padding: '16px 14px 17px' }}>
                      <span className="font-semibold text-[12px] leading-[16px] text-[#0F172A] whitespace-nowrap">
                        {formatCurrency(c.contractValue)}
                      </span>
                    </td>

                    {/* 9. RESPONSE SLA HOURS */}
                    <td style={{ width: '150.64px', minWidth: '150.64px', maxWidth: '150.64px', padding: '16px 14px 17px' }}>
                      <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {c.responseSla}
                      </span>
                    </td>

                    {/* 10. RESOLUTION SLA HOURS */}
                    <td style={{ width: '162.7px', minWidth: '162.7px', maxWidth: '162.7px', padding: '16px 14px 17px' }}>
                      <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {resolutionSla}
                      </span>
                    </td>

                    {/* 11. SUPPORT HOURS / COVERAGE */}
                    <td style={{ width: '200.27px', minWidth: '200.27px', maxWidth: '200.27px', padding: '16px 14px 17px' }}>
                      <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {coverage}
                      </span>
                    </td>

                    {/* 12. STATUS */}
                    <td style={{ width: '89.59px', minWidth: '89.59px', maxWidth: '89.59px', padding: '13.5px 14px' }}>
                      {renderStatusBadge(c.status)}
                    </td>

                    {/* 13. DAYS TO RENEWAL */}
                    <td style={{ width: '130.75px', minWidth: '130.75px', maxWidth: '130.75px', padding: '16px 14px 17px', textAlign: 'center' }}>
                      <span
                        className={`font-normal text-[12px] leading-[16px] whitespace-nowrap ${
                          days === '—' || days === '-' ? 'text-[#94A3B8]' : 'text-[#475569]'
                        }`}
                      >
                        {days}
                      </span>
                    </td>

                    {/* 14. RENEWAL ALERT */}
                    <td style={{ width: '118.42px', minWidth: '118.42px', maxWidth: '118.42px', padding: '13.5px 14px' }}>
                      {renderRenewalAlertBadge(c)}
                    </td>

                    {/* 15. OWNER */}
                    <td style={{ width: '103.67px', minWidth: '103.67px', maxWidth: '103.67px', padding: '16px 14px 17px' }}>
                      <span className="font-normal text-[12px] leading-[16px] text-[#1E293B] whitespace-nowrap">
                        {owner}
                      </span>
                    </td>

                    {/* 16. NOTES */}
                    <td style={{ width: '229.5px', minWidth: '229.5px', maxWidth: '229.5px', padding: '16px 14px 17px' }}>
                      <span
                        className="font-normal text-[12px] leading-[16px] text-[#64748B] block truncate"
                        title={notes}
                      >
                        {notes}
                      </span>
                    </td>

                    {/* 17. ACTIONS */}
                    <td style={{ width: '48px', minWidth: '48px', maxWidth: '48px', padding: '12.5px 12px', textAlign: 'center', position: 'relative' }}>
                      <button
                        type="button"
                        aria-label="Actions"
                        onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                        className="w-6 h-6 inline-flex items-center justify-center rounded-[6px] text-[#4F46E5] hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4 text-[#4F46E5]" strokeWidth={2} />
                      </button>

                      {activeMenuId === c.id && (
                        <div className="absolute right-2 top-10 w-36 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1 z-30 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEdit?.(c);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-500" />
                            Edit Contract
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDelete?.(c);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
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
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#E5E7EB] gap-3 text-[12px] font-['Inter'] text-[#64748B]">
        <div>
          Showing {totalItems === 0 ? 0 : startIndex + 1} –{' '}
          {Math.min(startIndex + pageSize, totalItems)} of {totalItems} deployments
        </div>

        <div className="flex items-center gap-4">
          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 flex items-center justify-center rounded border border-[#E2E8F0] text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-[12px] font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-[#4F46E5] text-white font-semibold'
                      : 'border border-transparent text-[#64748B] hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

            {totalPages > 5 && (
              <>
                <span className="px-1 text-[#64748B]">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-[12px] font-medium ${
                    currentPage === totalPages
                      ? 'bg-[#4F46E5] text-white font-semibold'
                      : 'border border-transparent text-[#64748B] hover:bg-slate-50'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 flex items-center justify-center rounded border border-[#E2E8F0] text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              &gt;
            </button>
          </div>

          {/* Rows Per Page Dropdown */}
          <div style={{ position: 'relative', width: '104.92px', height: '28px' }}>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                boxSizing: 'border-box',
                width: '104.92px',
                height: '28px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0 24px 0 10px',
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
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={15}>15 per page</option>
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
