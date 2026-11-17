import React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  FileQuestion,
} from 'lucide-react';
import { ExportButton } from '@/components/ui/ExportButton';
import { Proposal, ProposalSortOption, ProposalStatus } from '../types';
import { formatRupee } from '@/features/collections/utils';
import { StatusDropdownMenu, StatusItemConfig } from '../../../components/ui/StatusDropdownMenu';

interface ProposalsTableProps {
  proposals: Proposal[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sortOption: ProposalSortOption;
  onSortChange: (sort: ProposalSortOption) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onExport: () => void;
  onViewDetails: (proposal: Proposal) => void;
  onEditProposal?: (proposal: Proposal) => void;
  onDeleteProposal?: (proposalId: string) => void;
  onUpdateStatus?: (proposalId: string, newStatus: ProposalStatus) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onClearFilters?: () => void;
}

export const ProposalsTable: React.FC<ProposalsTableProps> = ({
  proposals,
  totalCount,
  currentPage,
  pageSize,
  sortOption,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onExport,
  onViewDetails,
  // onEditProposal and onDeleteProposal omitted as unused in table

  onUpdateStatus,
  isLoading = false,
  error = null,
  onRetry,
  onClearFilters,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

const PROPOSAL_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'Pending', label: 'Pending', dotColor: '#F59E0B', textColor: '#F59E0B' },
  { value: 'Approved', label: 'Approved', dotColor: '#059669', textColor: '#059669' },
  { value: 'Rejected', label: 'Rejected', dotColor: '#EF4444', textColor: '#EF4444' },
  { value: 'In Review', label: 'In Review', dotColor: '#8B5CF6', textColor: '#8B5CF6' },
  { value: 'Sent', label: 'Sent', dotColor: '#3B82F6', textColor: '#3B82F6' },
];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-xs">
      {/* Table Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-200">
        <h2 className="text-[15px] font-bold leading-5 text-slate-900 tracking-tight">
          Proposals ({totalCount})
        </h2>

        <div className="flex items-center gap-3">
          {/* Sort By Dropdown */}
          <div className="flex items-center">
            <span className="text-xs font-medium leading-4 text-slate-500 mr-2 whitespace-nowrap">
              Sort by
            </span>
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as ProposalSortOption)}
                style={{ border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                className="bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-lg px-3 py-1.5 text-xs leading-4 text-slate-700 font-medium appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-[#CBD5E1] transition-colors"
              >
                <option value="date-newest">Proposal date (newest)</option>
                <option value="date-oldest">Proposal date (oldest)</option>
                <option value="value-highest">Total value (high to low)</option>
                <option value="value-lowest">Total value (low to high)</option>
                <option value="valid-until-soonest">Valid until (soonest)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Export Button */}
          <ExportButton onClick={onExport} />
        </div>
      </div>

      {/* Horizontal Scrollable Table Wrapper */}
      <div className="overflow-x-auto w-full custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table
          className="w-full text-left border-collapse whitespace-nowrap"
          style={{
            minWidth: '1825px',
            tableLayout: 'auto',
          }}
        >
          <colgroup>
            <col style={{ width: '120px', minWidth: '120px' }} />
            <col style={{ width: '135px', minWidth: '135px' }} />
            <col style={{ width: '95px', minWidth: '95px' }} />
            <col style={{ width: '120px', minWidth: '120px' }} />
            <col style={{ width: '120px', minWidth: '120px' }} />
            <col style={{ width: '85px', minWidth: '85px' }} />
            <col style={{ width: '240px', minWidth: '240px' }} />
            <col style={{ width: '100px', minWidth: '100px' }} />
            <col style={{ width: '155px', minWidth: '155px' }} />
            <col style={{ width: '115px', minWidth: '115px' }} />
            <col style={{ width: '125px', minWidth: '125px' }} />
            <col style={{ width: '100px', minWidth: '100px' }} />
            <col style={{ width: '110px', minWidth: '110px' }} />
            <col style={{ width: '185px', minWidth: '185px' }} />
            <col style={{ width: '120px', minWidth: '120px' }} />
          </colgroup>
          <thead>
            <tr className="select-none bg-[#F8FAFC] border-b border-slate-200 h-[44px] whitespace-nowrap">
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[120px]">
                PROPOSAL ID
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[135px]">
                OPPORTUNITY ID
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[95px]">
                CLIENT ID
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[120px]">
                PROPOSAL DATE
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[120px]">
                VALID UNTIL
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[85px]">
                VERSION
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[240px]">
                TITLE
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[100px]">
                SERVICE ID
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[155px] text-right">
                SERVICE BEFORE TAX
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[115px] text-right">
                TAX AMOUNT
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[125px] text-right">
                TOTAL AMOUNT
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[100px]">
                OWNER ID
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[110px]">
                STATUS
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[185px]">
                EXPECTED DECISION DATE
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px] whitespace-nowrap min-w-[120px] text-center">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs font-normal">
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 8) }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  <td className="py-4 px-4 whitespace-nowrap"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 whitespace-nowrap"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 whitespace-nowrap"><div className="h-4 w-14 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 whitespace-nowrap"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 whitespace-nowrap"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 whitespace-nowrap"><div className="h-4 w-10 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 whitespace-nowrap"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 whitespace-nowrap"><div className="h-4 w-14 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 whitespace-nowrap text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                  <td className="py-4 px-4 whitespace-nowrap text-right"><div className="h-4 w-16 bg-slate-200 rounded ml-auto" /></td>
                  <td className="py-4 px-4 whitespace-nowrap text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                  <td className="py-4 px-4 whitespace-nowrap"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 whitespace-nowrap"><div className="h-5 w-16 bg-slate-200 rounded-md" /></td>
                  <td className="py-4 px-4 whitespace-nowrap"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 whitespace-nowrap text-center"><div className="h-7 w-20 bg-slate-200 rounded-lg mx-auto" /></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={15} className="py-12 px-6 text-center">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                    <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-3">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <p className="text-[14px] font-semibold text-slate-800 mb-1">Failed to load proposals</p>
                    <p className="text-[13px] text-slate-500 mb-4">{error}</p>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Try Again</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : proposals.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-14 px-6 text-center">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                      <FileQuestion className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <p className="text-[15px] font-semibold text-slate-800 mb-1">No proposals found</p>
                    <p className="text-[13px] text-slate-500 max-w-sm mb-4">
                      No proposals match your current filters or search query. Try resetting filters or adjusting search terms.
                    </p>
                    {onClearFilters && (
                      <button
                        onClick={onClearFilters}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 rounded-lg text-[13px] font-medium transition-colors cursor-pointer shadow-xs"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              proposals.map((item) => (
                <tr
                  key={item.proposalId}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Proposal ID */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      onClick={() => onViewDetails(item)}
                      className="text-[#2563EB] hover:text-[#1D4ED8] font-medium hover:underline text-left cursor-pointer whitespace-nowrap"
                    >
                      {item.proposalId}
                    </button>
                  </td>

                  {/* Opportunity ID */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[#2563EB] hover:text-[#1D4ED8] font-medium hover:underline cursor-pointer whitespace-nowrap">
                      {item.opportunityId}
                    </span>
                  </td>

                  {/* Client ID */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-normal">
                    {item.clientId}
                  </td>

                  {/* Proposal Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                    {item.proposalDate}
                  </td>

                  {/* Valid Until */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                    {item.validUntil}
                  </td>

                  {/* Version */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-normal">
                    {item.version}
                  </td>

                  {/* Title */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      onClick={() => onViewDetails(item)}
                      className="text-[#2563EB] hover:text-[#1D4ED8] font-medium hover:underline text-left cursor-pointer truncate block max-w-[240px]"
                      title={item.title}
                    >
                      {item.title}
                    </button>
                  </td>

                  {/* Service ID */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {item.serviceId}
                  </td>

                  {/* Service Before Tax */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-normal text-right">
                    {formatRupee(item.serviceBeforeTax)}
                  </td>

                  {/* Tax Amount */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-right">
                    {formatRupee(item.taxAmount)}
                  </td>

                  {/* Total Amount */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-900 font-semibold text-right">
                    {formatRupee(item.totalAmount)}
                  </td>

                  {/* Owner ID */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-normal">
                    {item.ownerId}
                  </td>

                  {/* Status with Quick Click-to-Change Dropdown */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={item.status}
                      options={PROPOSAL_STATUS_CONFIGS}
                      onSelect={(newStatus) => onUpdateStatus?.(item.proposalId, newStatus as ProposalStatus)}
                    />
                  </td>

                  {/* Expected Decision Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                    {item.expectedDecisionDate}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onViewDetails(item)}
                      className="inline-flex items-center justify-center px-3.5 py-1 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 text-[#2563EB] hover:text-[#1D4ED8] text-xs font-semibold leading-4 rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-white">
        {/* Record count info */}
        <div className="text-xs font-normal text-slate-500 leading-4">
          Showing {startRecord} – {endRecord} of {totalCount} proposals
        </div>

        {/* Page navigation controls */}
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer ${
                pageNum === currentPage
                  ? 'bg-[#4F46E5] text-white font-semibold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Page Size Selector */}
          <div className="relative ml-2">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{ border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
              className="bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs font-medium leading-4 text-slate-700 appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            >
              <option value={8}>8 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
