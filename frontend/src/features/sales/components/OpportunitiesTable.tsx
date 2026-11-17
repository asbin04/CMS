import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { ExportButton } from '@/components/ui/ExportButton';
import { OpportunityData } from '@/types/opportunity';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

interface OpportunitiesTableProps {
  opportunities: OpportunityData[];
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
  onViewDetails: (opp: OpportunityData) => void;
  formatCurrency: (val: number | string | undefined | null) => string;
  renderStageBadge: (stage: string) => React.ReactNode;
  renderStatusBadge: (status: string) => React.ReactNode;
}

export const OpportunitiesTable: React.FC<OpportunitiesTableProps> = ({
  opportunities,
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
  renderStageBadge,
  renderStatusBadge,
}) => {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
        width: '100%',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Table Header Bar */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          width: '100%',
          height: '63px',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: '16px',
            lineHeight: '24px',
            color: '#0F172A',
            margin: 0,
          }}
        >
          Opportunities ({totalCount})
        </h2>

        {/* Right Action: Sort by & Export */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#64748B',
              }}
            >
              Sort by
            </span>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                boxSizing: 'border-box',
                height: '30px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '6px 28px 6px 12px',
                cursor: 'pointer',
              }}
            >
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: '#334155',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="Expected Close Date (Nearest)">Expected Close Date (Nearest)</option>
                <option value="Probability (High to Low)">Probability (High to Low)</option>
                <option value="Estimated Value (High to Low)">Estimated Value (High to Low)</option>
                <option value="Recently Updated">Recently Updated</option>
              </select>
              <ChevronDown
                style={{
                  position: 'absolute',
                  right: '8px',
                  width: '12px',
                  height: '12px',
                  color: '#94A3B8',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          <ExportButton onClick={onExport} />
        </div>
      </div>

      {/* Horizontal Data Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-8 w-full flex justify-center">
            <EmptyState
              icon={Target}
              title="No opportunities yet"
              description="No sales opportunities match your active filters or none have been recorded yet."
            />
          </div>
        ) : (
          <table
            style={{
              width: '2000.42px',
              minWidth: '2000.42px',
              borderCollapse: 'collapse',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  height: '41px',
                  backgroundColor: 'rgba(248, 250, 252, 0.75)',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <th style={{ width: '134px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Opportunity ID</th>
                <th style={{ width: '100px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Lead ID</th>
                <th style={{ width: '90px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Client ID</th>
                <th style={{ width: '184px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Opportunity Name</th>
                <th style={{ width: '92px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Owner ID</th>
                <th style={{ width: '98px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Service ID</th>
                <th style={{ width: '112px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Stage</th>
                <th style={{ width: '126px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Probability %</th>
                <th style={{ width: '143px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Estimated Value</th>
                <th style={{ width: '171px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Expected Close Date</th>
                <th style={{ width: '124px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Last Contact</th>
                <th style={{ width: '138px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Next Follow-up</th>
                <th style={{ width: '113px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ width: '115px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Lost Reason</th>
                <th style={{ width: '152px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap' }}>Weighted Pipeline</th>
                <th style={{ width: '102px', padding: '12px 16px', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#64748B', whiteSpace: 'nowrap', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((row) => (
                <tr
                  key={row.opportunityId}
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
                      width: '134px',
                      padding: '14px 16px 15px',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: '#2563EB',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.opportunityId}
                  </td>
                  <td style={{ width: '100px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#2563EB', whiteSpace: 'nowrap' }}>
                    {row.leadId || '—'}
                  </td>
                  <td style={{ width: '90px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {row.clientId}
                  </td>
                  <td style={{ width: '184px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '12px', color: '#1E293B', whiteSpace: 'nowrap' }}>
                    {row.opportunityName}
                  </td>
                  <td style={{ width: '92px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {row.ownerId}
                  </td>
                  <td style={{ width: '98px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {row.serviceId}
                  </td>
                  <td style={{ width: '112px', padding: '13.5px 16px', whiteSpace: 'nowrap' }}>
                    {renderStageBadge(row.stage)}
                  </td>
                  <td style={{ width: '126px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}>
                    {row.probability}%
                  </td>
                  <td style={{ width: '143px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}>
                    {row.estimatedValueFormatted || formatCurrency(row.estimatedValue)}
                  </td>
                  <td style={{ width: '171px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: (!row.expectedCloseDate || row.expectedCloseDate === '-') ? '#94A3B8' : '#334155', whiteSpace: 'nowrap' }}>
                    {row.expectedCloseDate || '—'}
                  </td>
                  <td style={{ width: '124px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: (!row.lastContact || row.lastContact === '-') ? '#94A3B8' : '#64748B', whiteSpace: 'nowrap' }}>
                    {row.lastContact || '—'}
                  </td>
                  <td style={{ width: '138px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '12px', color: (!row.nextFollowUp || row.nextFollowUp === '-') ? '#94A3B8' : '#EF4444', whiteSpace: 'nowrap' }}>
                    {row.nextFollowUp || '—'}
                  </td>
                  <td style={{ width: '113px', padding: '12.5px 16px', whiteSpace: 'nowrap' }}>
                    {renderStatusBadge(row.status)}
                  </td>
                  <td style={{ width: '115px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: (!row.lostReason || row.lostReason === '-') ? '#94A3B8' : '#475569', whiteSpace: 'nowrap' }}>
                    {row.lostReason || '—'}
                  </td>
                  <td style={{ width: '152px', padding: '14px 16px 15px', fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}>
                    {row.weightedPipelineFormatted || formatCurrency(row.weightedPipeline || (Number(row.estimatedValue) * row.probability) / 100)}
                  </td>
                  <td style={{ width: '102px', padding: '14px 16px 15px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                      <button
                        onClick={() => onViewDetails(row)}
                        style={{
                          boxSizing: 'border-box',
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '4px 12px',
                          width: '83px',
                          height: '26px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #3B82F6',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#4F46E5',
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500,
                          fontSize: '12px',
                          lineHeight: '16px',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Table Pagination Footer */}
      {!isLoading && opportunities.length > 0 && (
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 16px',
            width: '100%',
            height: '61px',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '16px',
              color: '#64748B',
            }}
          >
            Showing {totalCount > 0 ? startIndex + 1 : 0} –{' '}
            {Math.min(startIndex + pageSize, totalCount)} of {totalCount} opportunities
          </span>

          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.6 : 1,
                }}
              >
                <ChevronLeft style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    backgroundColor: currentPage === page ? '#4F46E5' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: currentPage === page ? 600 : 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: currentPage === page ? '#FFFFFF' : '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.6 : 1,
                }}
              >
                <ChevronRight style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

