import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Ticket,
  Search,
  Calendar,
  RotateCcw,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TicketAssetApproval, ApprovalStatus } from '../../types/approvals';
import { DetailItemType } from './ApprovalDetailModal';

interface TicketsAssetsApprovalsSectionProps {
  approvals: TicketAssetApproval[];
  onViewDetails: (item: DetailItemType) => void;
  onUpdateStatus?: (id: number, status: ApprovalStatus) => void;
}

export const TicketsAssetsApprovalsSection: React.FC<TicketsAssetsApprovalsSectionProps> = ({
  approvals,
  onViewDetails,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordType, setSelectedRecordType] = useState('All');
  const [selectedApprovalType, setSelectedApprovalType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedApprover, setSelectedApprover] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<number | null>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Auto-close menu on outside click or scroll
  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      if (statusMenuRef.current && statusMenuRef.current.contains(e.target as Node)) {
        return;
      }
      setOpenStatusMenuId(null);
    };

    const handleScroll = () => {
      setOpenStatusMenuId(null);
    };

    if (openStatusMenuId !== null) {
      document.addEventListener('mousedown', handleClose);
      window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClose);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [openStatusMenuId]);

  const filteredData = useMemo(() => {
    return approvals.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.approval_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.record_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.client_requester.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRecordType =
        selectedRecordType === 'All' ||
        item.record_type.toLowerCase() === selectedRecordType.toLowerCase();

      const matchesApprovalType =
        selectedApprovalType === 'All' ||
        item.approval_type.toLowerCase() === selectedApprovalType.toLowerCase();

      const matchesStatus =
        selectedStatus === 'All' || item.status.toLowerCase() === selectedStatus.toLowerCase();

      const matchesPriority =
        selectedPriority === 'All' || item.priority.toLowerCase() === selectedPriority.toLowerCase();

      const matchesApprover =
        selectedApprover === 'All' ||
        item.assigned_approver.toLowerCase() === selectedApprover.toLowerCase();

      return (
        matchesSearch &&
        matchesRecordType &&
        matchesApprovalType &&
        matchesStatus &&
        matchesPriority &&
        matchesApprover
      );
    });
  }, [
    approvals,
    searchQuery,
    selectedRecordType,
    selectedApprovalType,
    selectedStatus,
    selectedPriority,
    selectedApprover
  ]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const displayItems = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRecordType('All');
    setSelectedApprovalType('All');
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSelectedApprover('All');
    setCurrentPage(1);
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Approval ID,Record Type,Record Code,Title,Client/Requester,Approval Type,Priority,Date,Assigned Approver,Status']
        .concat(
          approvals.map(
            (t) =>
              `"${t.approval_id}","${t.record_type}","${t.record_code}","${t.title.replace(/"/g, '""')}","${t.client_requester}","${t.approval_type}","${t.priority}","${t.request_date}","${t.assigned_approver}","${t.status}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ticket_asset_approvals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-[#FEF2F2] border-[#FEE2E2] text-[#DC2626]';
      case 'Medium':
        return 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]';
      case 'Low':
        return 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]';
      default:
        return 'text-[#94A3B8]';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Approved':
        return { dot: 'bg-[#059669]', text: 'text-[#059669]' };
      case 'Rejected':
        return { dot: 'bg-[#EF4444]', text: 'text-[#EF4444]' };
      case 'Pending':
      default:
        return { dot: 'bg-[#F59E0B]', text: 'text-[#F59E0B]' };
    }
  };

  return (
    <div className="box-border flex flex-col items-start p-0 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs w-full">
      {/* Header & Filter Toolbar */}
      <div className="box-border flex flex-col items-start p-6 pb-5 gap-4 w-full border-b border-[#F1F5F9]">
        {/* Top Row: Title */}
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Ticket size={18} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[16px] font-bold text-[#0F172A] leading-5">Tickets & Assets Approvals</h2>
              <p className="text-xs text-[#64748B] leading-4 mt-0.5">
                Review and approve ticket and asset related requests.
              </p>
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-col gap-3.5 w-full">
          {/* Search Input & Action Row */}
          <div className="flex flex-row items-center justify-between w-full gap-3 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by approval ID, ticket/asset ID or title..."
                className="w-full h-[40px] pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-[13px] text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
              />
            </div>

            <button
              onClick={handleExport}
              className="box-border flex flex-row items-center justify-center px-4 h-[40px] gap-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#334155] rounded-xl text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Download size={15} className="text-[#64748B]" />
              <span>Export</span>
            </button>
          </div>

          {/* Filters Row 1 */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs">
            {/* Record Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium text-xs whitespace-nowrap">Record Type</span>
              <div className="relative">
                <select
                  value={selectedRecordType}
                  onChange={(e) => {
                    setSelectedRecordType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[30px] px-2 pr-7 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#334155] font-medium outline-none appearance-none cursor-pointer hover:border-slate-300"
                >
                  <option value="All">All</option>
                  <option value="Ticket">Ticket</option>
                  <option value="Asset">Asset</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                />
              </div>
            </div>

            {/* Approval Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium text-xs whitespace-nowrap">Approval Type</span>
              <div className="relative">
                <select
                  value={selectedApprovalType}
                  onChange={(e) => {
                    setSelectedApprovalType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[30px] px-2.5 pr-7 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#334155] font-medium outline-none appearance-none cursor-pointer hover:border-slate-300"
                >
                  <option value="All">All</option>
                  <option value="Escalation">Escalation</option>
                  <option value="Paid Support / Additional Work">Paid Support / Additional Work</option>
                  <option value="Asset Purchase Approval">Asset Purchase Approval</option>
                  <option value="Reopening / Closure Exception">Reopening / Closure Exception</option>
                  <option value="Asset Renewal Approval">Asset Renewal Approval</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium text-xs whitespace-nowrap">Status</span>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[30px] px-2.5 pr-7 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#334155] font-medium outline-none appearance-none cursor-pointer hover:border-slate-300"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                />
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium text-xs whitespace-nowrap">Priority</span>
              <div className="relative">
                <select
                  value={selectedPriority}
                  onChange={(e) => {
                    setSelectedPriority(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[30px] px-2 pr-7 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#334155] font-medium outline-none appearance-none cursor-pointer hover:border-slate-300"
                >
                  <option value="All">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium text-xs whitespace-nowrap">Date Range</span>
              <button
                type="button"
                className="h-[30px] px-2.5 flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#64748B] hover:border-slate-300 transition-colors whitespace-nowrap"
              >
                <Calendar size={13} className="text-[#94A3B8]" />
                <span>Select date range</span>
              </button>
            </div>
          </div>

          {/* Filters Row 2: Assigned Approver & Clear Filters */}
          <div className="flex items-center gap-3 text-xs">
            {/* Assigned Approver */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium text-xs whitespace-nowrap">Assigned Approver</span>
              <div className="relative">
                <select
                  value={selectedApprover}
                  onChange={(e) => {
                    setSelectedApprover(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[30px] px-2.5 pr-7 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#334155] font-medium outline-none appearance-none cursor-pointer hover:border-slate-300"
                >
                  <option value="All">All</option>
                  <option value="Akshit Ujjain">Akshit Ujjain</option>
                  <option value="Vikram T">Vikram T</option>
                  <option value="Priya D">Priya D</option>
                  <option value="Sneha K">Sneha K</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-[#2563EB] hover:text-blue-800 transition-colors"
            >
              <RotateCcw size={13} className="text-[#2563EB]" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1150px]">
          <thead>
            <tr className="bg-[#F8FAFC]/75 border-b border-[#E2E8F0] text-[11px] font-bold text-[#475569] uppercase tracking-[0.55px]">
              <th className="py-3 px-4">APPROVAL ID</th>
              <th className="py-3 px-4">RECORD TYPE</th>
              <th className="py-3 px-4">TICKET/ASSET ID</th>
              <th className="py-3 px-4">TITLE/ ASSET NAME</th>
              <th className="py-3 px-4">CLIENT / REQUESTER</th>
              <th className="py-3 px-4">APPROVAL TYPE</th>
              <th className="py-3 px-4">PRIORITY</th>
              <th className="py-3 px-4">DATE</th>
              <th className="py-3 px-4">ASSIGNED APPROVER</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-xs">
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400">
                  No ticket / asset requests match your filters.
                </td>
              </tr>
            ) : (
              displayItems.map((row) => {
                const statusStyle = getStatusDot(row.status);
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Approval ID */}
                    <td className="py-3.5 px-4 font-semibold text-[#0F172A] whitespace-nowrap">
                      {row.approval_id}
                    </td>

                    {/* Record Type Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          row.record_type === 'Ticket'
                            ? 'bg-[#ECFEFF] border-[#A5F3FC] text-[#0E7490]'
                            : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]'
                        }`}
                      >
                        {row.record_type}
                      </span>
                    </td>

                    {/* Ticket/Asset ID (Mono font) */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#475569] whitespace-nowrap">
                      {row.record_code}
                    </td>

                    {/* Title / Asset Name */}
                    <td className="py-3.5 px-4 font-medium text-[#1E293B] max-w-xs truncate" title={row.title}>
                      {row.title}
                    </td>

                    {/* Client / Requester */}
                    <td className="py-3.5 px-4 text-[#334155] whitespace-nowrap">
                      {row.client_requester}
                    </td>

                    {/* Approval Type */}
                    <td className="py-3.5 px-4 text-[#475569] whitespace-nowrap">
                      {row.approval_type}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {row.priority === '-' ? (
                        <span className="text-[#94A3B8]">-</span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getPriorityBadge(
                            row.priority
                          )}`}
                        >
                          {row.priority}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[#475569] whitespace-nowrap">
                      {row.request_date}
                    </td>

                    {/* Assigned Approver */}
                    <td className="py-3.5 px-4 font-medium text-[#334155] whitespace-nowrap">
                      {row.assigned_approver}
                    </td>

                    {/* Status with Quick Click-to-Change Dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div
                        className="relative inline-block"
                        ref={openStatusMenuId === row.id ? statusMenuRef : undefined}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenStatusMenuId(openStatusMenuId === row.id ? null : row.id)}
                          className="flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-md hover:bg-slate-100 transition-colors group cursor-pointer"
                          title="Click to change state"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          <span className={`font-medium ${statusStyle.text}`}>{row.status}</span>
                          <ChevronDown size={11} className="text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {openStatusMenuId === row.id && (
                          <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 w-32 flex flex-col gap-0.5 animate-fade-in">
                            <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Change State</span>
                            {(['Pending', 'Approved', 'Rejected'] as const).map((st) => {
                              const dotColor = getStatusDot(st);
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateStatus?.(row.id, st);
                                    setOpenStatusMenuId(null);
                                  }}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors ${
                                    row.status === st
                                      ? 'bg-indigo-50 font-bold text-indigo-700'
                                      : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor.dot}`} />
                                  <span>{st}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() =>
                          onViewDetails({
                            type: 'ticketAsset',
                            id: row.id,
                            title: row.title,
                            code: row.approval_id,
                            recordType: row.record_type,
                            recordCode: row.record_code,
                            clientRequester: row.client_requester,
                            approvalType: row.approval_type,
                            priority: row.priority,
                            requestDate: row.request_date,
                            assignedApprover: row.assigned_approver,
                            status: row.status
                          })
                        }
                        className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 bg-[rgba(239,246,255,0.6)] border border-[#BFDBFE] hover:bg-blue-100/70 hover:border-blue-400 text-[#2563EB] rounded-md text-xs font-semibold transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Pagination */}
      <div className="box-border flex flex-row flex-wrap items-center justify-between p-3 px-5 w-full border-t border-[#F1F5F9] gap-3 text-xs text-[#64748B]">
        <span>Showing 1 – {Math.min(pageSize, displayItems.length)} of {totalItems} requests</span>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-6 h-6 flex items-center justify-center border border-[#E2E8F0] rounded hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={13} className="text-[#94A3B8]" />
            </button>

            {[1, 2, 3, 4, 5].map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors ${
                  currentPage === pageNum
                    ? 'bg-[#4F46E5] text-white font-semibold'
                    : 'border border-[#E2E8F0] text-[#475569] hover:bg-slate-100 font-medium'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="w-6 h-6 flex items-center justify-center border border-[#E2E8F0] rounded hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={13} className="text-[#475569]" />
            </button>
          </div>

          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-[26px] px-2 pr-6 bg-white border border-[#E2E8F0] rounded text-xs text-[#475569] font-medium outline-none appearance-none cursor-pointer"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
            <ChevronDown
              size={12}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
