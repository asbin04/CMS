import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { LeaveRecord } from '../types/leave';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatusDropdownMenu, StatusItemConfig } from '@/components/ui/StatusDropdownMenu';
import { TableActionMenu, TableActionMenuItem } from '@/components/ui/TableActionMenu';

export const LEAVE_APPROVAL_CONFIGS: StatusItemConfig[] = [
  { value: 'Approved', label: 'Approved', dotColor: '#059669', textColor: '#059669' },
  { value: 'Pending', label: 'Pending', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Rejected', label: 'Rejected', dotColor: '#EF4444', textColor: '#EF4444' },
];

export const LEAVE_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'Approved', label: 'Approved', dotColor: '#059669', textColor: '#059669' },
  { value: 'Pending', label: 'Pending', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Rejected', label: 'Rejected', dotColor: '#EF4444', textColor: '#EF4444' },
  { value: 'Cancelled', label: 'Cancelled', dotColor: '#64748B', textColor: '#64748B' },
];

interface LeaveTableProps {
  records: LeaveRecord[];
  totalRecords: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  sortBy: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (sortBy: string) => void;
  onViewDetails: (record: LeaveRecord) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateStatus?: (id: string, field: 'approvalStatus' | 'leaveStatus', newStatus: string) => void;
}

export const LeaveTable: React.FC<LeaveTableProps> = ({
  records,
  totalRecords,
  loading,
  currentPage,
  pageSize,
  sortBy,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onViewDetails,
  onApprove,
  onReject,
  onDelete,
  onUpdateStatus,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIdx = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalRecords);

  const getActionItems = (row: LeaveRecord): TableActionMenuItem[] => {
    const items: TableActionMenuItem[] = [
      {
        key: 'view',
        label: 'View Details',
        icon: <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
        onClick: () => onViewDetails(row),
      },
    ];

    if (row.approvalStatus === 'Pending') {
      items.push({
        key: 'approve',
        label: 'Approve',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
        onClick: () => onApprove(row.id),
      });
      items.push({
        key: 'reject',
        label: 'Reject',
        icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
        onClick: () => onReject(row.id),
        variant: 'danger',
      });
    }

    items.push({
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />,
      onClick: () => onDelete(row.id),
      variant: 'danger',
      hasDividerAbove: true,
    });

    return items;
  };

  const renderBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200">
            Rejected
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
    }
  };

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

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
      {/* Top Header of the table card */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-[14px] font-bold text-[#0F172A] leading-5 m-0">
          Leave Requests ({loading ? '...' : totalRecords})
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort Leave Requests"
            className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
          >
            <option value="From Date (Newest)">From Date (Newest)</option>
            <option value="From Date (Oldest)">From Date (Oldest)</option>
            <option value="Days (High-Low)">Days (High-Low)</option>
            <option value="Days (Low-High)">Days (Low-High)</option>
          </select>
        </div>
      </div>

      {/* Horizontal Scroll Table Container */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            <tr className="h-[42px] bg-[#F8FAFC]/80 border-b border-[#E2E8F0] text-[11px] font-bold text-[#475569] uppercase tracking-[0.55px] select-none">
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">LEAVE ID</th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">EMPLOYEE ID</th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">EMPLOYEE NAME</th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">LEAVE TYPE</th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">FROM DATE</th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">TO DATE</th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">DAYS</th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">REASON</th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">APPROVAL STATUS</th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">APPROVED BY</th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">CALCULATED DAYS</th>
              <th className="px-[14px] py-[12px] text-left whitespace-nowrap">LEAVE STATUS</th>
              <th className="px-[14px] py-[12px] text-center whitespace-nowrap">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: pageSize }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-4"><Skeleton width={70} height={14} /></td>
                  <td className="py-3.5 px-4"><Skeleton width={65} height={14} /></td>
                  <td className="py-3.5 px-4"><Skeleton width={100} height={14} /></td>
                  <td className="py-3.5 px-4"><Skeleton width={80} height={14} /></td>
                  <td className="py-3.5 px-4"><Skeleton width={75} height={14} /></td>
                  <td className="py-3.5 px-4"><Skeleton width={75} height={14} /></td>
                  <td className="py-3.5 px-4"><Skeleton width={30} height={14} /></td>
                  <td className="py-3.5 px-4"><Skeleton width={110} height={14} /></td>
                  <td className="py-3.5 px-4"><Skeleton width={70} height={20} className="rounded-full" /></td>
                  <td className="py-3.5 px-4"><Skeleton width={80} height={14} /></td>
                  <td className="py-3.5 px-4"><Skeleton width={30} height={14} /></td>
                  <td className="py-3.5 px-4"><Skeleton width={70} height={20} className="rounded-full" /></td>
                  <td className="py-3.5 px-4 text-center"><Skeleton width={20} height={14} className="mx-auto" /></td>
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-12">
                  <EmptyState
                    title="No leave requests found"
                    description="No leave requests match your search and filter criteria."
                  />
                </td>
              </tr>
            ) : (
              records.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* LEAVE ID */}
                  <td className="py-3.5 px-4 font-medium text-blue-600 hover:underline cursor-pointer">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(row);
                      }}
                      className="text-left font-medium text-blue-600 hover:text-blue-700"
                    >
                      {row.id}
                    </button>
                  </td>

                  {/* EMPLOYEE ID */}
                  <td className="py-3.5 px-4 font-medium text-blue-600">
                    {row.employeeId}
                  </td>

                  {/* EMPLOYEE NAME */}
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(row);
                      }}
                      className="text-left font-medium text-slate-800 hover:text-indigo-600 transition-colors"
                    >
                      {row.employeeName}
                    </button>
                  </td>

                  {/* LEAVE TYPE */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {row.leaveType}
                  </td>

                  {/* FROM DATE */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {row.fromDate}
                  </td>

                  {/* TO DATE */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {row.toDate}
                  </td>

                  {/* DAYS */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {row.days}
                  </td>

                  {/* REASON */}
                  <td className="py-3.5 px-4 text-slate-600 max-w-[160px] truncate" title={row.reason}>
                    {row.reason || '—'}
                  </td>

                  {/* APPROVAL STATUS */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={row.approvalStatus}
                      options={LEAVE_APPROVAL_CONFIGS}
                      headerTitle="CHANGE STATE"
                      onSelect={(newStatus) => {
                        if (onUpdateStatus) {
                          onUpdateStatus(row.id, 'approvalStatus', newStatus);
                        } else if (newStatus === 'Approved') {
                          onApprove(row.id);
                        } else if (newStatus === 'Rejected') {
                          onReject(row.id);
                        }
                      }}
                    />
                  </td>

                  {/* APPROVED BY */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {row.approvedBy || '-'}
                  </td>

                  {/* CALCULATED DAYS */}
                  <td className="py-3.5 px-4 text-slate-600">
                    {row.calculatedDays}
                  </td>

                  {/* LEAVE STATUS */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={row.leaveStatus}
                      options={LEAVE_STATUS_CONFIGS}
                      headerTitle="CHANGE STATE"
                      onSelect={(newStatus) => {
                        if (onUpdateStatus) {
                          onUpdateStatus(row.id, 'leaveStatus', newStatus);
                        }
                      }}
                    />
                  </td>

                  {/* ACTIONS */}
                  <td className="py-3.5 px-4 text-center">
                    <TableActionMenu items={getActionItems(row)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer matching Designer Reference */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-white">
        {/* Record count info */}
        <div className="text-xs font-normal text-slate-500 leading-4">
          Showing {startIdx} – {endIdx} of {totalRecords} leave records
        </div>

        {/* Page navigation controls */}
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            type="button"
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
              type="button"
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
            type="button"
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

