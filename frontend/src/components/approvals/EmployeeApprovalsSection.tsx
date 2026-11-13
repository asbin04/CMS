import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  Calendar,
  RotateCcw,
  Plus,
  Upload,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { EmployeeApproval, ApprovalStatus } from '../../types/approvals';
import { DetailItemType } from './ApprovalDetailModal';
import { CalendarDateRangePicker } from '../ui/CalendarDateRangePicker';

interface EmployeeApprovalsSectionProps {
  approvals: EmployeeApproval[];
  onOpenAddModal: () => void;
  onViewDetails: (item: DetailItemType) => void;
  onUpdateStatus?: (id: number, status: ApprovalStatus) => void;
}

export const EmployeeApprovalsSection: React.FC<EmployeeApprovalsSectionProps> = ({
  approvals,
  onOpenAddModal,
  onViewDetails,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [applicationDate, setApplicationDate] = useState('');
  const [requestedDateRange, setRequestedDateRange] = useState('');
  const [showAppDatePicker, setShowAppDatePicker] = useState(false);
  const [showReqDatePicker, setShowReqDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [openStatusMenuId, setOpenStatusMenuId] = useState<number | null>(null);

  const statusMenuRef = useRef<HTMLDivElement>(null);
  const appDateRef = useRef<HTMLDivElement>(null);
  const reqDateRef = useRef<HTMLDivElement>(null);

  // Auto-close menu and date pickers on outside click or scroll
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (statusMenuRef.current && statusMenuRef.current.contains(e.target as Node)) {
        return;
      }
      setOpenStatusMenuId(null);

      if (showAppDatePicker && appDateRef.current && !appDateRef.current.contains(e.target as Node)) {
        setShowAppDatePicker(false);
      }
      if (showReqDatePicker && reqDateRef.current && !reqDateRef.current.contains(e.target as Node)) {
        setShowReqDatePicker(false);
      }
    };

    const handleScroll = () => {
      setOpenStatusMenuId(null);
      setShowAppDatePicker(false);
      setShowReqDatePicker(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [showAppDatePicker, showReqDatePicker, openStatusMenuId]);

  // Filter logic
  const filteredData = useMemo(() => {
    return approvals.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedType === 'All' || item.request_type.toLowerCase() === selectedType.toLowerCase();

      const matchesStatus =
        selectedStatus === 'All' || item.status.toLowerCase() === selectedStatus.toLowerCase();

      const matchesAppDate =
        !applicationDate || item.applied_date.toLowerCase().includes(applicationDate.toLowerCase());

      const matchesReqDateRange =
        !requestedDateRange ||
        `${item.from_date} – ${item.to_date}`.toLowerCase().includes(requestedDateRange.toLowerCase());

      return matchesSearch && matchesType && matchesStatus && matchesAppDate && matchesReqDateRange;
    });
  }, [approvals, searchQuery, selectedType, selectedStatus, applicationDate, requestedDateRange]);

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const displayItems = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedStatus('All');
    setApplicationDate('');
    setRequestedDateRange('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Employee Name,Code,Request Type,Applied Date,Date Range,Duration,Reason,Status']
        .concat(
          approvals.map(
            (a) =>
              `"${a.employee_name}","${a.employee_code}","${a.request_type}","${a.applied_date}","${a.from_date} - ${a.to_date}","${a.duration}","${a.reason.replace(/"/g, '""')}","${a.status}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employee_approvals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Sick Leave':
        return 'bg-[#FEF2F2] border-[#FEE2E2] text-[#DC2626]';
      case 'Work From Home':
        return 'bg-[#F0F9FF] border-[#E0F2FE] text-[#0284C7]';
      case 'Earned Leave':
        return 'bg-[#ECFDF5] border-[#D1FAE5] text-[#059669]';
      case 'Casual Leave':
      default:
        return 'bg-[#FDF4FF] border-[#F5D0FE] text-[#A21CAF]';
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
    <div className="box-border flex flex-col items-start p-0 bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs w-full">
      {/* Section Header & Filter Toolbar */}
      <div className="box-border flex flex-col items-start p-6 pb-5 gap-4 w-full border-b border-[#F1F5F9]">
        {/* Top row: Title */}
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[16px] font-bold text-[#0F172A] leading-5">Employee Approvals</h2>
              <p className="text-xs text-[#64748B] leading-4 mt-0.5">
                Review and approve employee leave and work-from-home requests.
              </p>
            </div>
          </div>
        </div>

        {/* Controls block */}
        <div className="flex flex-col gap-3.5 w-full">
          {/* Search Input & Action Buttons Row */}
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
                placeholder="Search by employee name or request ID..."
                className="w-full h-[40px] pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-[13px] text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={onOpenAddModal}
                className="box-border flex flex-row items-center justify-center px-4 h-[40px] gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs sm:text-[13px] font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Data</span>
              </button>

              <button
                onClick={handleExport}
                className="box-border flex flex-row items-center justify-center px-4 h-[40px] gap-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#334155] rounded-xl text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <Upload size={15} className="text-[#64748B]" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filter options row: Exactly matching user screenshot */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs pt-0.5">
            {/* Request Type */}
            <div className="flex items-center gap-2">
              <span className="text-[#475569] font-medium text-xs whitespace-nowrap">Request Type</span>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[34px] pl-3.5 pr-8 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-medium outline-none appearance-none cursor-pointer hover:border-slate-300 shadow-2xs transition-colors"
                >
                  <option value="All">All</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Work From Home">Work From Home</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-[#475569] font-medium text-xs whitespace-nowrap">Status</span>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[34px] pl-3.5 pr-8 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-medium outline-none appearance-none cursor-pointer hover:border-slate-300 shadow-2xs transition-colors"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
                />
              </div>
            </div>

            {/* Application Date */}
            <div className="flex items-center gap-2 relative" ref={appDateRef}>
              <span className="text-[#475569] font-medium text-xs whitespace-nowrap">Application Date</span>
              <button
                type="button"
                onClick={() => setShowAppDatePicker(!showAppDatePicker)}
                className="h-[34px] px-3.5 flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#64748B] hover:border-slate-300 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
              >
                <Calendar size={14} className="text-[#94A3B8]" />
                <span>{applicationDate || 'Select date'}</span>
              </button>

              <CalendarDateRangePicker
                value={applicationDate}
                onChange={(dateStr) => {
                  setApplicationDate(dateStr);
                  setShowAppDatePicker(false);
                }}
                isOpen={showAppDatePicker}
                onClose={() => setShowAppDatePicker(false)}
              />
            </div>

            {/* Requested Date Range */}
            <div className="flex items-center gap-2 relative" ref={reqDateRef}>
              <span className="text-[#475569] font-medium text-xs whitespace-nowrap">Requested Date Range</span>
              <button
                type="button"
                onClick={() => setShowReqDatePicker(!showReqDatePicker)}
                className="h-[34px] px-3.5 flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#64748B] hover:border-slate-300 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
              >
                <Calendar size={14} className="text-[#94A3B8]" />
                <span>{requestedDateRange || 'Select date range'}</span>
              </button>

              <CalendarDateRangePicker
                value={requestedDateRange}
                onChange={(rangeStr) => {
                  setRequestedDateRange(rangeStr);
                  setShowReqDatePicker(false);
                }}
                isOpen={showReqDatePicker}
                onClose={() => setShowReqDatePicker(false)}
              />
            </div>

            {/* Clear Filters */}
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer whitespace-nowrap ml-1"
            >
              <RotateCcw size={13} className="text-[#4F46E5]" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-white border-b border-[#E2E8F0] text-[11px] font-bold text-[#475569] uppercase tracking-[0.5px]">
              <th className="py-3.5 px-4 font-bold">EMPLOYEE NAME</th>
              <th className="py-3.5 px-4 font-bold">REQUEST TYPE</th>
              <th
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="py-3.5 px-4 font-bold cursor-pointer select-none group"
              >
                <div className="flex items-center gap-1 text-[#475569] group-hover:text-blue-600">
                  <span>APPLIED DATE</span>
                  <ChevronDown
                    size={12}
                    className={`text-[#2563EB] transition-transform ${
                      sortOrder === 'asc' ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </th>
              <th className="py-3.5 px-4 font-bold">FROM DATE – TO DATE</th>
              <th className="py-3.5 px-4 font-bold">DURATION</th>
              <th className="py-3.5 px-4 font-bold">REASON</th>
              <th className="py-3.5 px-4 font-bold">STATUS</th>
              <th className="py-3.5 px-4 font-bold text-center whitespace-nowrap">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-xs">
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No employee requests match your filters.
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
                    {/* Employee Name */}
                    <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                      <div className="flex flex-col">
                        <span>{row.employee_name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({row.employee_code})
                        </span>
                      </div>
                    </td>

                    {/* Request Type Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getTypeBadge(
                          row.request_type
                        )}`}
                      >
                        {row.request_type}
                      </span>
                    </td>

                    {/* Applied Date */}
                    <td className="py-3.5 px-4 text-[#475569] whitespace-nowrap">
                      {row.applied_date}
                    </td>

                    {/* Date Range */}
                    <td className="py-3.5 px-4 text-[#475569] whitespace-nowrap">
                      {row.from_date} – {row.to_date}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 font-medium text-[#334155] whitespace-nowrap">
                      {row.duration}
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 text-[#475569] max-w-xs truncate" title={row.reason}>
                      {row.reason}
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
                            type: 'employee',
                            id: row.id,
                            title: row.employee_name,
                            code: row.employee_code,
                            requestType: row.request_type,
                            appliedDate: row.applied_date,
                            dateRange: `${row.from_date} – ${row.to_date}`,
                            duration: row.duration,
                            reason: row.reason,
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
