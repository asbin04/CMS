import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, FileCheck } from 'lucide-react';
import { ExportButton } from '@/components/ui/ExportButton';
import { ContractData } from '@/types/contract';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

interface ContractsTableProps {
  contracts: ContractData[];
  totalCount: number;
  isLoading: boolean;
  startIndex: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  sortBy: string;
  onSortChange: (val: string) => void;
  onPageChange: (page: number) => void;
  onExport: () => void;
  onViewDetails: (c: ContractData) => void;
  formatCurrency: (val: number | string | undefined | null) => string;
  renderStatusBadge: (status: string) => React.ReactNode;
}

export const ContractsTable: React.FC<ContractsTableProps> = ({
  contracts,
  totalCount,
  isLoading,
  startIndex,
  pageSize,
  currentPage,
  totalPages,
  sortBy,
  onSortChange,
  onPageChange,
  onExport,
  onViewDetails,
  formatCurrency,
  renderStatusBadge,
}) => {
  return (
    <div className="flex flex-col w-full">
      {/* Table Header Bar */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white w-full">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight m-0">
          Contracts ({totalCount})
        </h2>

        {/* Right Action: Sort by & Export */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Sort by
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
              >
                <option value="Start Date (Newest)">Start Date (Newest)</option>
                <option value="Start Date (Oldest)">Start Date (Oldest)</option>
                <option value="Contract Value (High to Low)">Contract Value (High to Low)</option>
                <option value="Contract Value (Low to High)">Contract Value (Low to High)</option>
                <option value="End Date (Nearest)">End Date (Nearest)</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          <ExportButton onClick={onExport} />
        </div>
      </div>

      {/* Horizontal Data Table */}
      <div className="w-full overflow-x-auto horizontal-table-scroll">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-8 w-full flex justify-center">
            <EmptyState
              icon={FileCheck}
              title="No contracts yet"
              description="No client contracts match your active filters or none have been recorded yet."
            />
          </div>
        ) : (
          <table
            style={{
              width: '1400px',
              minWidth: '1400px',
              borderCollapse: 'collapse',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  height: '41px',
                  backgroundColor: '#FFFFFF',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <th style={{ width: '130px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Contract ID</th>
                <th style={{ width: '100px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Client ID</th>
                <th style={{ width: '110px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Proposal ID</th>
                <th style={{ width: '160px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Contract Type</th>
                <th style={{ width: '120px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Start Date</th>
                <th style={{ width: '120px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>End Date</th>
                <th style={{ width: '120px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Renewal Date</th>
                <th style={{ width: '140px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Contract Value</th>
                <th style={{ width: '100px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Notice (Days)</th>
                <th style={{ width: '120px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Payment Terms</th>
                <th style={{ width: '110px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ width: '100px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((row) => (
                <tr
                  key={row.contractId}
                  style={{
                    height: '55px',
                    borderBottom: '1px solid #F1F5F9',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td
                    onClick={() => onViewDetails(row)}
                    style={{
                      width: '130px',
                      padding: '14px 16px 15px',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: '12px',
                      color: '#2563EB',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.contractId}
                  </td>
                  <td style={{ width: '100px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {row.clientId}
                  </td>
                  <td style={{ width: '110px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#2563EB', whiteSpace: 'nowrap' }}>
                    {row.proposalId || '—'}
                  </td>
                  <td style={{ width: '160px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '12px', color: '#1E293B', whiteSpace: 'nowrap' }}>
                    {row.contractType}
                  </td>
                  <td style={{ width: '120px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}>
                    {row.startDate || '—'}
                  </td>
                  <td style={{ width: '120px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}>
                    {row.endDate || '—'}
                  </td>
                  <td style={{ width: '120px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: (!row.renewalDate || row.renewalDate === '-') ? '#94A3B8' : '#334155', whiteSpace: 'nowrap' }}>
                    {row.renewalDate || '—'}
                  </td>
                  <td style={{ width: '140px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}>
                    {row.contractValueFormatted || formatCurrency(row.contractValue)}
                  </td>
                  <td style={{ width: '100px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {row.noticePeriod ?? '—'}
                  </td>
                  <td style={{ width: '120px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {row.paymentTerms || '—'}
                  </td>
                  <td style={{ width: '110px', padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    {renderStatusBadge(row.status)}
                  </td>
                  <td style={{ width: '100px', padding: '14px 16px 15px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <button
                      onClick={() => onViewDetails(row)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #3B82F6',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#4F46E5',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        fontSize: '12px',
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && contracts.length > 0 && (
        <div className="px-4 sm:px-5 py-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 rounded-b-xl w-full">
          <span>
            Showing {totalCount > 0 ? startIndex + 1 : 0} –{' '}
            {Math.min(startIndex + pageSize, totalCount)} of {totalCount} contracts
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="flex items-center justify-center w-7 h-7 bg-white border border-slate-200 rounded text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`flex items-center justify-center w-7 h-7 rounded text-xs transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#4F46E5] text-white font-semibold'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100 font-normal'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className="flex items-center justify-center w-7 h-7 bg-white border border-slate-200 rounded text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
