import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, MoreVertical, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { AmcSlaContract } from '../types/amcSla';

interface AmcRenewalsTableProps {
  contracts: AmcSlaContract[];
  isLoading?: boolean;
  onEdit?: (contract: AmcSlaContract) => void;
  onDelete?: (contract: AmcSlaContract) => void;
  initialWindowFilter?: string;
}

export const AmcRenewalsTable: React.FC<AmcRenewalsTableProps> = ({
  contracts,
  isLoading = false,
  onEdit,
  onDelete,
  initialWindowFilter = 'All',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [windowFilter, setWindowFilter] = useState(initialWindowFilter);
  const [ownerFilter, setOwnerFilter] = useState('All');

  // Sync if initial window filter changes externally
  React.useEffect(() => {
    if (initialWindowFilter) {
      setWindowFilter(initialWindowFilter);
    }
  }, [initialWindowFilter]);

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

  const calculateDaysToRenewal = (c: AmcSlaContract): { value: number | string; badgeType: 'amber' | 'blue' | 'green' | 'red' } => {
    if (c.daysToRenewal !== undefined && c.daysToRenewal !== null) {
      if (c.daysToRenewal <= 30) return { value: c.daysToRenewal, badgeType: 'amber' };
      if (c.daysToRenewal <= 90) return { value: c.daysToRenewal, badgeType: 'blue' };
      return { value: c.daysToRenewal, badgeType: 'green' };
    }

    const normStatus = (c.status || '').toLowerCase();
    const normAlert = (c.renewalAlert || '').toLowerCase();
    if (normStatus.includes('inactive') || normStatus.includes('expired') || normStatus.includes('terminated') || normAlert.includes('overdue')) {
      return { value: '-', badgeType: 'red' };
    }

    if (!c.renewalDate || c.renewalDate === '-') return { value: '-', badgeType: 'red' };
    try {
      const ren = new Date(c.renewalDate);
      if (isNaN(ren.getTime())) return { value: '-', badgeType: 'red' };
      const now = new Date();
      const renUtc = Date.UTC(ren.getFullYear(), ren.getMonth(), ren.getDate());
      const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.round((renUtc - nowUtc) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return { value: '-', badgeType: 'red' };
      if (diffDays <= 30) return { value: diffDays, badgeType: 'amber' };
      if (diffDays <= 90) return { value: diffDays, badgeType: 'blue' };
      return { value: diffDays, badgeType: 'green' };
    } catch {
      return { value: '-', badgeType: 'red' };
    }
  };

  const getOwner = (c: AmcSlaContract): string => {
    return c.owner || c.assignedManager || '-';
  };

  const getNotes = (c: AmcSlaContract): string => {
    return c.notes || '-';
  };

  const getRenewalAlertBadge = (c: AmcSlaContract) => {
    const alert = c.renewalAlert || '';

    if (!alert || alert === 'Normal' || alert === '-' || alert === '—') {
      return <span className="text-[#94A3B8] font-normal text-[12px]">—</span>;
    }

    const normalized = alert.toLowerCase();

    if (normalized.includes('due') || normalized === 'due soon') {
      return (
        <span
          style={{
            boxSizing: 'border-box',
            height: '22px',
            background: '#FFFBEB',
            border: '1px solid #FEF3C7',
            borderRadius: '9999px',
            padding: '2px 8px',
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B45309] whitespace-nowrap"
        >
          <AlertTriangle className="w-3 h-3 text-[#F59E0B]" strokeWidth={1.5} />
          Due Soon
        </span>
      );
    }

    if (normalized.includes('overdue')) {
      return (
        <span
          style={{
            boxSizing: 'border-box',
            height: '22px',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '9999px',
            padding: '2px 8px',
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#DC2626] whitespace-nowrap"
        >
          <AlertTriangle className="w-3 h-3 text-[#EF4444]" strokeWidth={1.5} />
          Overdue
        </span>
      );
    }

    if (normalized.includes('expir') || normalized.includes('≤ 30')) {
      return (
        <span
          style={{
            boxSizing: 'border-box',
            height: '22px',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '9999px',
            padding: '2px 8px',
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#DC2626] whitespace-nowrap"
        >
          <AlertTriangle className="w-3 h-3 text-[#EF4444]" strokeWidth={1.5} />
          Expiring
        </span>
      );
    }

    return <span className="text-[#475569] text-[12px]">{alert}</span>;
  };

  const renderServiceTypeBadge = (type: string) => {
    const normalized = (type || '').toLowerCase();
    let bg = '#EEF2FF';
    let border = '#E0E7FF';
    let text = '#4338CA';

    if (normalized.includes('managed')) {
      bg = '#ECFDF5';
      border = '#D1FAE5';
      text = '#047857';
    } else if (normalized.includes('technical') || normalized.includes('infrastructure')) {
      bg = '#F0F9FF';
      border = '#E0F2FE';
      text = '#0369A1';
    }

    return (
      <span
        style={{
          boxSizing: 'border-box',
          height: '22px',
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '4px',
          padding: '2px 8px',
        }}
        className="inline-flex items-center text-[11px] font-medium whitespace-nowrap"
        style-color={text}
      >
        <span style={{ color: text }}>{type}</span>
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    const normalized = (status || '').toLowerCase();
    let bg = '#ECFDF5';
    let text = '#047857';

    if (normalized.includes('expiring')) {
      bg = '#FFFBEB';
      text = '#B45309';
    } else if (normalized.includes('inactive') || normalized.includes('expired') || normalized.includes('terminated')) {
      bg = '#FFF1F2';
      text = '#E11D48';
    }

    return (
      <span
        style={{
          height: '20px',
          background: bg,
          borderRadius: '4px',
          padding: '2px 10px',
          color: text,
        }}
        className="inline-flex items-center text-[11px] font-medium whitespace-nowrap"
      >
        {status}
      </span>
    );
  };

  // Distinct owners for dropdown
  const distinctOwners = useMemo(() => {
    const set = new Set<string>();
    contracts.forEach((c) => {
      const o = getOwner(c);
      if (o && o !== '-') set.add(o);
    });
    return Array.from(set).sort();
  }, [contracts]);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          (c.contractCode || '').toLowerCase().includes(q) ||
          (c.clientId || '').toLowerCase().includes(q) ||
          (c.clientName || '').toLowerCase().includes(q) ||
          (c.projectId || '').toLowerCase().includes(q) ||
          (c.projectName || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'All') {
        const norm = (c.status || '').toLowerCase();
        if (statusFilter === 'Active' && !norm.includes('active')) return false;
        if (statusFilter === 'Expiring' && !norm.includes('expiring')) return false;
        if (statusFilter === 'Inactive' && !norm.includes('inactive') && !norm.includes('expired')) return false;
      }

      // Owner
      if (ownerFilter !== 'All') {
        if (getOwner(c) !== ownerFilter) return false;
      }

      // Renewal Window
      if (windowFilter !== 'All') {
        const { badgeType } = calculateDaysToRenewal(c);
        if (windowFilter === 'Overdue' && badgeType !== 'red') return false;
        if (windowFilter === '≤ 30 Days' && badgeType !== 'amber') return false;
        if (windowFilter === '31 – 90 Days' && badgeType !== 'blue') return false;
        if (windowFilter === '> 90 Days' && badgeType !== 'green') return false;
      }

      return true;
    });
  }, [contracts, search, statusFilter, windowFilter, ownerFilter]);

  const totalItems = filteredContracts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedContracts = filteredContracts.slice(startIndex, startIndex + pageSize);

  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        borderRadius: '12px',
      }}
      className="flex flex-col items-start w-full font-['Inter'] overflow-hidden"
    >
      {/* Frame 8: Single-line Filter Bar */}
      <div
        style={{
          height: '58px',
          padding: '14px',
          gap: '10px',
        }}
        className="flex flex-row items-center w-full"
      >
        {/* Table Search Input (width 533px) */}
        <div style={{ position: 'relative', width: '533px', height: '30px' }} className="flex-1 max-w-[533px]">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by AMC / SLA ID, Client, or Project..."
            style={{
              boxSizing: 'border-box',
              width: '100%',
              height: '30px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px 12px 7px 36px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 400,
              color: '#0F172A',
              outline: 'none',
            }}
            className="placeholder:text-[#94A3B8]"
          />
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search className="w-4 h-4 text-[#0F172A]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Status Dropdown (width 105.88px) */}
        <div style={{ position: 'relative', width: '105.88px', height: '30px' }}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              boxSizing: 'border-box',
              width: '105.88px',
              height: '30px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px 24px 6px 12px',
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
            <option value="All">Status: All</option>
            <option value="Active">Status: Active</option>
            <option value="Expiring">Status: Expiring</option>
            <option value="Inactive">Status: Inactive</option>
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
            <ChevronDown className="w-3.5 h-3.5 text-[#0F172A]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Renewal Window Dropdown (width 167.81px) */}
        <div style={{ position: 'relative', width: '167.81px', height: '30px' }}>
          <select
            value={windowFilter}
            onChange={(e) => {
              setWindowFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              boxSizing: 'border-box',
              width: '167.81px',
              height: '30px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px 24px 6px 12px',
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
            <option value="All">Renewal Window: All</option>
            <option value="Overdue">Renewal Window: Overdue</option>
            <option value="≤ 30 Days">Renewal Window: ≤ 30 Days</option>
            <option value="31 – 90 Days">Renewal Window: 31 – 90 Days</option>
            <option value="> 90 Days">Renewal Window: &gt; 90 Days</option>
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
            <ChevronDown className="w-3.5 h-3.5 text-[#0F172A]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Owner Dropdown (width 107.47px) */}
        <div style={{ position: 'relative', width: '107.47px', height: '30px' }}>
          <select
            value={ownerFilter}
            onChange={(e) => {
              setOwnerFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              boxSizing: 'border-box',
              width: '107.47px',
              height: '30px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px 24px 6px 12px',
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
            <option value="All">Owner: All</option>
            {distinctOwners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
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
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-[#0F172A]" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left font-['Inter']">
          <thead>
            <tr className="bg-[rgba(248,250,252,0.75)] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-[0.55px] text-[#475569] h-[41px]">
              <th style={{ width: '120px', padding: '12px 16px' }}>AMC / SLA ID</th>
              <th style={{ width: '100px', padding: '12px 16px' }}>CLIENT ID</th>
              <th style={{ width: '105px', padding: '12px 16px' }}>PROJECT ID</th>
              <th style={{ width: '175px', padding: '12px 16px' }}>SERVICE TYPE</th>
              <th style={{ width: '125px', padding: '12px 16px' }}>END DATE</th>
              <th style={{ width: '125px', padding: '12px 16px' }}>RENEWAL DATE</th>
              <th style={{ width: '110px', padding: '12px 16px', textAlign: 'center' }}>DAYS TO RENEWAL</th>
              <th style={{ width: '112px', padding: '12px 16px', textAlign: 'center' }}>RENEWAL ALERT</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[13px] text-[#64748B]">
                  Loading renewals &amp; alerts...
                </td>
              </tr>
            ) : paginatedContracts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[13px] text-[#64748B]">
                  No contracts found matching your filters.
                </td>
              </tr>
            ) : (
              paginatedContracts.map((c) => {
                const { value: daysValue, badgeType } = calculateDaysToRenewal(c);

                // Days badge styling
                let daysBg = '#ECFDF5';
                let daysBorder = '#A7F3D0';
                let daysText = '#047857';
                if (badgeType === 'amber') {
                  daysBg = '#FFFBEB';
                  daysBorder = '#FDE68A';
                  daysText = '#B45309';
                } else if (badgeType === 'blue') {
                  daysBg = '#EFF6FF';
                  daysBorder = '#BFDBFE';
                  daysText = '#1D4ED8';
                } else if (badgeType === 'red') {
                  daysBg = '#FFF1F2';
                  daysBorder = '#FFE4E6';
                  daysText = '#E11D48';
                }

                return (
                  <tr
                    key={c.id}
                    className="h-[53px] border-t border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors text-[12px]"
                  >
                    {/* 1. AMC / SLA ID */}
                    <td style={{ width: '120px', padding: '18px 16px 19px' }}>
                      <span className="font-semibold text-[12px] leading-[16px] text-[#4F46E5] whitespace-nowrap cursor-pointer">
                        {c.contractCode}
                      </span>
                    </td>

                    {/* 2. CLIENT ID */}
                    <td style={{ width: '100px', padding: '18px 16px 19px' }}>
                      <span className="font-medium text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {c.clientId}
                      </span>
                    </td>

                    {/* 3. PROJECT ID */}
                    <td style={{ width: '105px', padding: '18px 16px 19px' }}>
                      <span className="font-medium text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {c.projectId}
                      </span>
                    </td>

                    {/* 4. SERVICE TYPE */}
                    <td style={{ width: '175px', padding: '15.5px 16px' }}>
                      {renderServiceTypeBadge(c.serviceType)}
                    </td>

                    {/* 5. END DATE */}
                    <td style={{ width: '125px', padding: '18px 16px 19px' }}>
                      <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {formatDate(c.endDate)}
                      </span>
                    </td>

                    {/* 6. RENEWAL DATE */}
                    <td style={{ width: '125px', padding: '18px 16px 19px' }}>
                      <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                        {formatDate(c.renewalDate)}
                      </span>
                    </td>

                    {/* 7. DAYS TO RENEWAL */}
                    <td style={{ width: '110px', padding: '15.5px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          boxSizing: 'border-box',
                          height: '22px',
                          background: daysBg,
                          border: `1px solid ${daysBorder}`,
                          borderRadius: '4px',
                          padding: '2px 8px',
                          color: daysText,
                        }}
                        className="inline-flex items-center justify-center text-[11px] font-medium whitespace-nowrap"
                      >
                        {daysValue}
                      </span>
                    </td>

                    {/* 8. RENEWAL ALERT */}
                    <td style={{ width: '112px', padding: '15.5px 16px', textAlign: 'center' }}>
                      {getRenewalAlertBadge(c)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Footer Bar */}
      <div
        style={{
          boxSizing: 'border-box',
          height: '61px',
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          padding: '16px',
        }}
        className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 text-[12px] font-['Inter'] text-[#64748B]"
      >
        <div className="font-medium text-[12px] leading-[16px] text-[#64748B]">
          Showing {totalItems === 0 ? 0 : startIndex + 1} –{' '}
          {Math.min(startIndex + pageSize, totalItems)} of {totalItems} deployments
        </div>

        <div className="flex items-center gap-3">
          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-[4px] border border-[#E2E8F0] text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
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
                  className={`w-7 h-7 flex items-center justify-center rounded-[4px] text-[12px] transition-colors ${
                    page === currentPage
                      ? 'bg-[#4F46E5] text-white font-semibold shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                      : 'border border-transparent text-[#475569] font-medium hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

            {totalPages > 5 && (
              <>
                <span className="px-1 text-[#94A3B8]">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-7 h-7 flex items-center justify-center rounded-[4px] text-[12px] font-medium ${
                    currentPage === totalPages
                      ? 'bg-[#4F46E5] text-white font-semibold'
                      : 'border border-transparent text-[#475569] hover:bg-slate-50'
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
              className="w-7 h-7 flex items-center justify-center rounded-[4px] border border-[#E2E8F0] text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              &gt;
            </button>
          </div>

          {/* Rows Per Page Dropdown */}
          <div style={{ position: 'relative', width: '104.92px', height: '26px' }}>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                boxSizing: 'border-box',
                width: '104.92px',
                height: '26px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '4px 26px 4px 10px',
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
              <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

