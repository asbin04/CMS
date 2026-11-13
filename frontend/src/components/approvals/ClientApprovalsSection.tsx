import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Building2,
  Search,
  Calendar,
  RotateCcw,
  Plus,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ClientApproval, ApprovalStatus } from '../../types/approvals';
import { DetailItemType } from './ApprovalDetailModal';

function getDynamicPastMonths(count = 3): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
  }
  return months;
}

function getDynamicCurrentMonth(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

interface ClientApprovalsSectionProps {
  approvals: ClientApproval[];
  onOpenAddModal: () => void;
  onViewDetails: (item: DetailItemType) => void;
  onUpdateStatus?: (id: number, status: ApprovalStatus) => void;
}

export const ClientApprovalsSection: React.FC<ClientApprovalsSectionProps> = ({
  approvals,
  onOpenAddModal,
  onViewDetails,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedApprover, setSelectedApprover] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [requestDateRange, setRequestDateRange] = useState('');
  const [dueDateRange, setDueDateRange] = useState('');
  const [showRequestDatePicker, setShowRequestDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<number | null>(null);

  const requestDateRef = useRef<HTMLDivElement>(null);
  const dueDateRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Auto-close popovers if user clicks outside or scrolls anywhere
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        showRequestDatePicker &&
        requestDateRef.current &&
        !requestDateRef.current.contains(e.target as Node)
      ) {
        setShowRequestDatePicker(false);
      }
      if (
        showDueDatePicker &&
        dueDateRef.current &&
        !dueDateRef.current.contains(e.target as Node)
      ) {
        setShowDueDatePicker(false);
      }
      if (
        openStatusMenuId !== null &&
        statusMenuRef.current &&
        !statusMenuRef.current.contains(e.target as Node)
      ) {
        setOpenStatusMenuId(null);
      }
    };

    const handleScroll = () => {
      setShowRequestDatePicker(false);
      setShowDueDatePicker(false);
      setOpenStatusMenuId(null);
    };

    if (showRequestDatePicker || showDueDatePicker || openStatusMenuId !== null) {
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [showRequestDatePicker, showDueDatePicker, openStatusMenuId]);

  const filteredData = useMemo(() => {
    return approvals.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.approval_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reference_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requester.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedType === 'All' || item.request_type.toLowerCase() === selectedType.toLowerCase();

      const matchesStatus =
        selectedStatus === 'All' || item.status.toLowerCase() === selectedStatus.toLowerCase();

      const matchesApprover =
        selectedApprover === 'All' || item.requester.toLowerCase() === selectedApprover.toLowerCase();

      const matchesDate =
        requestDateRange === '' || item.request_date.toLowerCase().includes(requestDateRange.toLowerCase());

      return matchesSearch && matchesType && matchesStatus && matchesApprover && matchesDate;
    });
  }, [approvals, searchQuery, selectedType, selectedStatus, selectedApprover, requestDateRange]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const displayItems = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedStatus('All');
    setSelectedApprover('All');
    setRequestDateRange('');
    setDueDateRange('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Approval ID,Client Name,Request Type,Reference ID,Requester,Request Date,Due Date,Amount,Status']
        .concat(
          approvals.map(
            (c) =>
              `"${c.approval_id}","${c.client_name}","${c.request_type}","${c.reference_id}","${c.requester}","${c.request_date}","${c.due_date}","${c.amount}","${c.status}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `client_approvals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRequestTypeBadge = (type: string) => {
    switch (type) {
      case 'Client Onboarding':
        return 'bg-[#EFF6FF] border-[#DBEAFE] text-[#2563EB]';
      case 'Proposal Approval':
        return 'bg-[#EEF2FF] border-[#E0E7FF] text-[#4F46E5]';
      case 'Contract Approval':
        return 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]';
      case 'Special Pricing / Payment Terms':
        return 'bg-[#FFF1F2] border-[#FFE4E6] text-[#E11D48]';
      case 'Client Change Request':
        return 'bg-[#F0FDFA] border-[#99F6E4] text-[#0F766E]';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-700';
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
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
              <Building2 size={18} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[16px] font-bold text-[#0F172A] leading-5">Client Approvals</h2>
              <p className="text-xs text-[#64748B] leading-4 mt-0.5">
                Review and approve client related requests.
              </p>
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-col gap-3.5 w-full">
          {/* Search Input & Action buttons Row */}
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
                placeholder="Search by approval ID, client name or reference ID..."
                className="w-full h-[40px] pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-[13px] text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={onOpenAddModal}
                className="box-border flex flex-row items-center justify-center px-4 h-[40px] gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs sm:text-[13px] font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Client</span>
              </button>

              <button
                onClick={handleExport}
                className="box-border flex flex-row items-center justify-center px-4 h-[40px] gap-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#334155] rounded-xl text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <Download size={15} className="text-[#64748B]" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filters Row 1: Request Type, Status, Request Date Range, Due Date Range */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs">
            {/* Request Type */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium text-xs whitespace-nowrap">Request Type</span>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[30px] px-2.5 pr-7 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#334155] font-medium outline-none appearance-none cursor-pointer hover:border-slate-300"
                >
                  <option value="All">All</option>
                  <option value="Client Onboarding">Client Onboarding</option>
                  <option value="Proposal Approval">Proposal Approval</option>
                  <option value="Contract Approval">Contract Approval</option>
                  <option value="Special Pricing / Payment Terms">Special Pricing / Payment Terms</option>
                  <option value="Client Change Request">Client Change Request</option>
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

            {/* Request Date Range */}
            <div ref={requestDateRef} className="flex items-center gap-1.5 relative">
              <span className="text-[#64748B] font-medium text-xs whitespace-nowrap">Request Date Range</span>
              <button
                type="button"
                onClick={() => {
                  setShowRequestDatePicker(!showRequestDatePicker);
                  setShowDueDatePicker(false);
                }}
                className={`h-[30px] px-2.5 flex items-center gap-2 bg-white border rounded-lg text-xs transition-colors whitespace-nowrap ${
                  requestDateRange ? 'border-indigo-400 text-indigo-700 font-semibold' : 'border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
                }`}
              >
                <Calendar size={13} className={requestDateRange ? 'text-indigo-600' : 'text-[#94A3B8]'} />
                <span>{requestDateRange || 'Select date range'}</span>
              </button>

              {showRequestDatePicker && (
                <div className="absolute left-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 w-52 flex flex-col gap-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Quick Select</span>
                  {[...getDynamicPastMonths(3), 'Last 30 Days', 'All Dates'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setRequestDateRange(opt === 'All Dates' ? '' : opt);
                        setShowRequestDatePicker(false);
                      }}
                      className="text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Due Date Range */}
            <div ref={dueDateRef} className="flex items-center gap-1.5 relative">
              <span className="text-[#64748B] font-medium text-xs whitespace-nowrap">Due Date Range</span>
              <button
                type="button"
                onClick={() => {
                  setShowDueDatePicker(!showDueDatePicker);
                  setShowRequestDatePicker(false);
                }}
                className={`h-[30px] px-2.5 flex items-center gap-2 bg-white border rounded-lg text-xs transition-colors whitespace-nowrap ${
                  dueDateRange ? 'border-indigo-400 text-indigo-700 font-semibold' : 'border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
                }`}
              >
                <Calendar size={13} className={dueDateRange ? 'text-indigo-600' : 'text-[#94A3B8]'} />
                <span>{dueDateRange || 'Select date range'}</span>
              </button>

              {showDueDatePicker && (
                <div className="absolute left-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2 w-52 flex flex-col gap-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Quick Select</span>
                  {[getDynamicCurrentMonth(), 'Next 7 Days', 'Next 14 Days', 'All Dates'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setDueDateRange(opt === 'All Dates' ? '' : opt);
                        setShowDueDatePicker(false);
                      }}
                      className="text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filters Row 2: Approver & Clear Filters */}
          <div className="flex items-center gap-3 text-xs">
            {/* Approver */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] font-medium text-xs whitespace-nowrap">Approver</span>
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
                  <option value="Rahul K">Rahul K</option>
                  <option value="Sneha K">Sneha K</option>
                  <option value="Vikram T">Vikram T</option>
                  <option value="Priya D">Priya D</option>
                  <option value="Manoj J">Manoj J</option>
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
        <table className="w-full text-left border-collapse min-w-[1050px]">
          <thead>
            <tr className="bg-[#F8FAFC]/75 border-b border-[#E2E8F0] text-[11px] font-bold text-[#475569] uppercase tracking-[0.55px]">
              <th className="py-3 px-4">APPROVAL ID</th>
              <th className="py-3 px-4">CLIENT NAME</th>
              <th className="py-3 px-4">REQUEST TYPE</th>
              <th className="py-3 px-4">REFERENCE ID</th>
              <th className="py-3 px-4">REQUESTER</th>
              <th className="py-3 px-4">REQUEST DATE</th>
              <th className="py-3 px-4">DUE DATE</th>
              <th className="py-3 px-4">AMOUNT</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-xs">
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No client requests match your filters.
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

                    {/* Client Name */}
                    <td className="py-3.5 px-4 font-semibold text-[#1E293B] whitespace-nowrap">
                      {row.client_name}
                    </td>

                    {/* Request Type Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getRequestTypeBadge(
                          row.request_type
                        )}`}
                      >
                        {row.request_type}
                      </span>
                    </td>

                    {/* Reference ID (Mono font) */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#475569] whitespace-nowrap">
                      {row.reference_id}
                    </td>

                    {/* Requester */}
                    <td className="py-3.5 px-4 text-[#334155] whitespace-nowrap">
                      {row.requester}
                    </td>

                    {/* Request Date */}
                    <td className="py-3.5 px-4 text-[#475569] whitespace-nowrap">
                      {row.request_date}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 text-[#475569] whitespace-nowrap">
                      {row.due_date}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-semibold text-[#1E293B] whitespace-nowrap">
                      {row.amount === '-' ? (
                        <span className="text-[#94A3B8] font-normal">-</span>
                      ) : (
                        row.amount
                      )}
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
                            type: 'client',
                            id: row.id,
                            title: row.client_name,
                            code: row.approval_id,
                            requestType: row.request_type,
                            referenceId: row.reference_id,
                            requester: row.requester,
                            requestDate: row.request_date,
                            dueDate: row.due_date,
                            amount: row.amount,
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
