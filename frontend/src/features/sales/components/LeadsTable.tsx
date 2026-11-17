import React from 'react';
import {
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Lead, LeadSortOption, ServiceInterest, LeadStage, LeadStatus } from '../types/leads';
import { formatRupee } from '../../collections/utils';
import { TableActionMenu } from '@/components/ui/TableActionMenu';

export const formatDisplayDate = (val?: string | null): string => {
  if (!val || val === '-' || val === '—' || val === 'null' || !val.trim()) return '—';
  const trimmed = val.trim();
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(trimmed)) return trimmed;
  const [datePart] = trimmed.split('T');
  const parts = datePart.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      const dayStr = String(day).padStart(2, '0');
      const monthStr = date.toLocaleString('en-US', { month: 'short' });
      return `${dayStr} ${monthStr} ${year}`;
    }
  }
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    const dayStr = String(date.getDate()).padStart(2, '0');
    const monthStr = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${dayStr} ${monthStr} ${year}`;
  }
  return trimmed;
};

interface LeadsTableProps {
  leads: Lead[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sortBy: LeadSortOption;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (sort: LeadSortOption) => void;
  onViewLead: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
  onExport: () => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  totalCount,
  currentPage,
  pageSize,
  sortBy,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onExport,
}) => {
  // Service interest badge styling dictionary matching Figma screenshot
  const getServiceBadgeStyle = (service: ServiceInterest | string) => {
    switch (service) {
      case 'Web Development':
        return 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]';
      case 'Mobile App':
        return 'bg-[#FCE7F3] text-[#BE185D] border-[#FBCFE8]';
      case 'AI Solutions':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      case 'ERP Solution':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      case 'E-commerce':
        return 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]';
      case 'Digital Marketing':
        return 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]';
      case 'Cloud & DevOps':
        return 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]';
      case 'Custom Software':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      case 'UI/UX Design':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      case 'Cybersecurity':
        return 'bg-[#E0E7FF] text-[#4338CA] border-[#C7D2FE]';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Stage badge styling exactly matching screenshot
  const getStageBadgeStyle = (stage: LeadStage | string) => {
    switch (stage) {
      case 'New':
        return 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]';
      case 'Contacted':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
      case 'Qualified':
        return 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]';
      case 'Proposal':
      case 'Proposal Sent':
        return 'bg-[#F3E8FF] text-[#9333EA] border-[#E9D5FF]';
      case 'Negotiation':
        return 'bg-[#FEF9C3] text-[#CA8A04] border-[#FEF08A]';
      case 'Won':
        return 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]';
      case 'Lost':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Status badge styling exactly matching screenshot
  const getStatusBadgeStyle = (status: LeadStatus | string) => {
    switch (status) {
      case 'Open':
      case 'Active':
        return 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]';
      case 'In Progress':
      case 'Follow-up Required':
        return 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]';
      case 'Converted':
        return 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]';
      case 'Lost':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      case 'On Hold':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Next follow-up highlighting helper based on live date calculation
  const getFollowUpColor = (dateStr?: string | null) => {
    if (!dateStr || dateStr === '-' || dateStr === '—') return 'text-slate-400';
    const followUp = new Date(dateStr);
    if (isNaN(followUp.getTime())) return 'text-slate-600 font-normal';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (followUp < today) {
      return 'text-[#DC2626] font-semibold'; // Overdue in red
    }
    const diffDays = Math.ceil((followUp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) {
      return 'text-[#D97706] font-semibold'; // Due soon in amber
    }
    return 'text-slate-600 font-normal';
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startRange = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalCount);

  // Pagination buttons array
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Header Row of Table Card */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-900">
            Leads ({totalCount})
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort by</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as LeadSortOption)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
              >
                <option value="date-desc">Lead Date (Newest)</option>
                <option value="date-asc">Lead Date (Oldest)</option>
                <option value="company-asc">Company (A-Z)</option>
                <option value="contact-asc">Contact Name (A-Z)</option>
                <option value="id-desc">Lead ID (Newest)</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer active:scale-98"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Table Container */}
      <div className="w-full overflow-x-auto horizontal-table-scroll">
        <table className="w-full text-left border-collapse min-w-[2450px]">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-[11px] font-bold text-slate-600 tracking-wider uppercase select-none">
              {/* 1. LEAD ID (Sticky Left) */}
              <th className="py-3.5 pl-6 pr-4 sticky left-0 z-20 bg-white shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] min-w-[120px]">
                LEAD ID
              </th>
              {/* 2. LEAD DATE */}
              <th className="py-3.5 px-4 min-w-[120px]">LEAD DATE</th>
              {/* 3. COMPANY / PERSON */}
              <th className="py-3.5 px-4 min-w-[180px]">COMPANY / PERSON</th>
              {/* 4. CONTACT NAME */}
              <th className="py-3.5 px-4 min-w-[140px]">CONTACT NAME</th>
              {/* 5. EMAIL */}
              <th className="py-3.5 px-4 min-w-[190px]">EMAIL</th>
              {/* 6. PHONE */}
              <th className="py-3.5 px-4 min-w-[145px]">PHONE</th>
              {/* 7. SOURCE */}
              <th className="py-3.5 px-4 min-w-[110px]">SOURCE</th>
              {/* 8. SERVICE INTEREST */}
              <th className="py-3.5 px-4 min-w-[160px]">SERVICE INTEREST</th>
              {/* 9. COUNTRY */}
              <th className="py-3.5 px-4 min-w-[100px]">COUNTRY</th>
              {/* 10. CITY */}
              <th className="py-3.5 px-4 min-w-[115px]">CITY</th>
              {/* 11. OWNER ID */}
              <th className="py-3.5 px-4 min-w-[110px]">OWNER ID</th>
              {/* 12. STAGE */}
              <th className="py-3.5 px-4 min-w-[125px]">STAGE</th>
              {/* 13. LEAD SCORE */}
              <th className="py-3.5 px-4 min-w-[105px]">LEAD SCORE</th>
              {/* 14. EXPECTED VALUE */}
              <th className="py-3.5 px-4 min-w-[140px]">EXPECTED VALUE</th>
              {/* 15. EXPECTED CLOSE DATE */}
              <th className="py-3.5 px-4 min-w-[160px]">EXPECTED CLOSE DATE</th>
              {/* 16. NEXT FOLLOW-UP */}
              <th className="py-3.5 px-4 min-w-[140px]">NEXT FOLLOW-UP</th>
              {/* 17. STATUS */}
              <th className="py-3.5 px-4 min-w-[125px]">STATUS</th>
              {/* 18. LOST REASON */}
              <th className="py-3.5 px-4 min-w-[120px]">LOST REASON</th>
              {/* 19. NOTES */}
              <th className="py-3.5 px-4 min-w-[160px]">NOTES</th>
              {/* 20. ACTION (Sticky Right) */}
              <th className="py-3.5 pr-6 pl-4 text-center sticky right-0 z-20 bg-white shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)] min-w-[125px]">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={20} className="py-14 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-sm font-semibold text-slate-600">No leads found</span>
                    <span className="text-xs text-slate-400">
                      Try adjusting your search criteria or clear your filters.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const serviceBadge = getServiceBadgeStyle(lead.serviceInterest);
                const stageBadge = getStageBadgeStyle(lead.stage);
                const statusBadge = getStatusBadgeStyle(lead.status);
                const followUpColor = getFollowUpColor(lead.nextFollowUp);

                const getNotesSnippet = (l: Lead) => {
                  if (!l.notes || l.notes === '-') return '—';
                  return l.notes.length > 22 ? `${l.notes.slice(0, 20)}...` : l.notes;
                };

                const notesSnippet = getNotesSnippet(lead);

                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onViewLead(lead)}
                  >
                    {/* 1. LEAD ID (Sticky Left) */}
                    <td className="py-3.5 pl-6 pr-4 whitespace-nowrap sticky left-0 z-10 bg-white group-hover:bg-[#F8FAFC] shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)] transition-colors">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewLead(lead);
                        }}
                        className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold hover:underline cursor-pointer"
                      >
                        {lead.id}
                      </button>
                    </td>

                    {/* 2. LEAD DATE */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-normal">
                      {formatDisplayDate(lead.leadDate)}
                    </td>

                    {/* 3. COMPANY / PERSON */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-900">
                      {lead.company || '—'}
                    </td>

                    {/* 4. CONTACT NAME */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      {lead.contactName || '—'}
                    </td>

                    {/* 5. EMAIL */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
                        >
                          {lead.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* 6. PHONE */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-mono text-[11.5px]">
                      {lead.phone || '—'}
                    </td>

                    {/* 7. SOURCE */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      {lead.source || '—'}
                    </td>

                    {/* 8. SERVICE INTEREST */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {lead.serviceInterest ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${serviceBadge}`}
                        >
                          {lead.serviceInterest}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* 9. COUNTRY */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      {lead.country || '—'}
                    </td>

                    {/* 10. CITY */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      {lead.city || '—'}
                    </td>

                    {/* 11. OWNER ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-mono text-xs">
                      {lead.ownerId || '—'}
                    </td>

                    {/* 12. STAGE */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stageBadge}`}
                      >
                        {lead.stage || 'New'}
                      </span>
                    </td>

                    {/* 13. LEAD SCORE */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-800 font-medium">
                      {lead.leadScore != null ? lead.leadScore : '—'}
                    </td>

                    {/* 14. EXPECTED VALUE */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold font-mono text-slate-900 text-[12px]">
                      {(() => {
                        const rawVal = lead.expectedValue ?? lead.estimatedValue;
                        if (rawVal == null || rawVal === '') return '—';
                        const numVal = typeof rawVal === 'number' ? rawVal : Number(String(rawVal).replace(/[^\d.-]/g, ''));
                        return !isNaN(numVal) && isFinite(numVal) ? formatRupee(numVal) : String(rawVal);
                      })()}
                    </td>

                    {/* 15. EXPECTED CLOSE DATE */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {formatDisplayDate(lead.expectedCloseDate)}
                    </td>

                    {/* 16. NEXT FOLLOW-UP */}
                    <td className={`py-3.5 px-4 whitespace-nowrap ${followUpColor}`}>
                      {lead.nextFollowUp ? formatDisplayDate(lead.nextFollowUp) : '—'}
                    </td>

                    {/* 17. STATUS */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge}`}
                      >
                        {lead.status || 'Active'}
                      </span>
                    </td>

                    {/* 18. LOST REASON */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {lead.lostReason || '—'}
                    </td>

                    {/* 19. NOTES */}
                    <td
                      className="py-3.5 px-4 whitespace-nowrap text-slate-600 max-w-[180px] truncate"
                      title={lead.notes ?? undefined}
                    >
                      {notesSnippet || '—'}
                    </td>

                    {/* 20. ACTION (Sticky Right with Three-Dot Action Menu) */}
                    <td className="py-3.5 pr-6 pl-4 whitespace-nowrap text-center sticky right-0 z-10 bg-white group-hover:bg-[#F8FAFC] shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)] transition-colors">
                      <div className="flex items-center justify-center">
                        <TableActionMenu
                          onViewDetails={() => onViewLead(lead)}
                          onEdit={onEditLead ? () => onEditLead(lead) : undefined}
                          onDelete={onDeleteLead ? () => onDeleteLead(lead) : undefined}
                          viewLabel="View Details"
                          editLabel="Edit"
                          deleteLabel="Delete"
                          ariaLabel={`Actions for ${lead.company}`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching Figma */}
      <div className="px-4 sm:px-5 py-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 rounded-b-xl">
        <div>
          Showing <span className="font-semibold text-slate-800">{startRange} – {endRange}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalCount}</span> leads
        </div>

        <div className="flex items-center gap-4">
          {/* Page numbers navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>

            {getPageNumbers().map((page, idx) => {
              const isCurrent = page === currentPage;
              return (
                <button
                  key={`page-${idx}`}
                  type="button"
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Page size selector */}
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value={8}>8 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
