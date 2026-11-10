import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TimesheetRecord, TimesheetApprovalStatus } from '../../types';
import { StatusDropdownMenu, StatusItemConfig } from '../../../../components/ui/StatusDropdownMenu';
import { TableActionMenu } from '../../../../components/ui/TableActionMenu';

interface TimesheetsTableProps {
  records: TimesheetRecord[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onUpdateApprovalStatus: (id: string, newStatus: TimesheetApprovalStatus) => void;
  onViewDetails: (record: TimesheetRecord) => void;
  onEdit: (record: TimesheetRecord) => void;
  onDelete: (id: string) => void;
  sortField?: string | null;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

const TIMESHEET_APPROVAL_CONFIGS: StatusItemConfig[] = [
  { value: 'Approved', label: 'Approved', dotColor: '#10B981', textColor: '#059669' },
  { value: 'Pending', label: 'Pending', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Rejected', label: 'Rejected', dotColor: '#EF4444', textColor: '#DC2626' },
];

export const TimesheetsTable: React.FC<TimesheetsTableProps> = ({
  records = [],
  totalCount = 0,
  currentPage = 1,
  pageSize = 5,
  onPageChange,
  onPageSizeChange,
  onUpdateApprovalStatus,
  onViewDetails,
  onEdit,
  onDelete,
  sortField,
  sortOrder = 'asc',
  onSort,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const getApprovalStatusBadgeClass = (val: string) => {
    switch (val) {
      case 'Approved':
        return 'bg-[#ECFDF5] text-[#059669]';
      case 'Pending':
        return 'bg-[#FFFBEB] text-[#D97706]';
      case 'Rejected':
      default:
        return 'bg-[#FEF2F2] text-[#DC2626]';
    }
  };

  const renderSortableHeader = (field: string, label: string) => {
    const isSorted = sortField === field;
    return (
      <th
        key={field}
        onClick={() => onSort?.(field)}
        className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-800 transition-colors"
      >
        <div className="inline-flex items-center gap-1.5">
          <span>{label}</span>
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="w-3 h-3 text-indigo-600 shrink-0" />
            ) : (
              <ArrowDown className="w-3 h-3 text-indigo-600 shrink-0" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-60 hover:opacity-100 shrink-0" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {renderSortableHeader('timesheetId', 'Timesheet ID')}
              {renderSortableHeader('date', 'Date')}
              {renderSortableHeader('employeeId', 'Employee ID')}
              {renderSortableHeader('employeeName', 'Employee Name')}
              {renderSortableHeader('projectId', 'Project ID')}
              {renderSortableHeader('taskId', 'Task ID')}
              {renderSortableHeader('hours', 'Hours')}
              {renderSortableHeader('billable', 'Billable')}
              {renderSortableHeader('billableRate', 'Billable Rate')}
              {renderSortableHeader('billableAmount', 'Billable Amount')}
              {renderSortableHeader('approvalStatus', 'Approval Status')}
              {renderSortableHeader('approvedBy', 'Approved By')}
              {renderSortableHeader('estimatedLaborCost', 'Estimated Labor Cost')}
              {renderSortableHeader('notes', 'Notes')}
              <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-12 text-center text-xs text-slate-500">
                  No timesheet records match your search or filter criteria.
                </td>
              </tr>
            ) : (
              records.map((row) => (
                <tr key={row.timesheetId} className="hover:bg-slate-50/60 transition-colors">
                  {/* Timesheet ID */}
                  <td
                    onClick={() => onViewDetails(row)}
                    className="py-3.5 px-4 text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    {row.timesheetId}
                  </td>
                  {/* Date */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.date}
                  </td>
                  {/* Employee ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.employeeId}
                  </td>
                  {/* Employee Name */}
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                    {row.employeeName}
                  </td>
                  {/* Project ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.projectId}
                  </td>
                  {/* Task ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.taskId}
                  </td>
                  {/* Hours */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap font-medium">
                    {row.hours.toFixed(2)}
                  </td>
                  {/* Billable */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-[6px] text-[11px] font-semibold ${
                        row.billable === 'Yes'
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : 'bg-[#FEF2F2] text-[#DC2626]'
                      }`}
                    >
                      {row.billable}
                    </span>
                  </td>
                  {/* Billable Rate */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.billableRate}
                  </td>
                  {/* Billable Amount */}
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-900 whitespace-nowrap">
                    {row.billableAmount}
                  </td>
                  {/* Approval Status with Interactive StatusDropdownMenu */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={row.approvalStatus}
                      options={TIMESHEET_APPROVAL_CONFIGS}
                      headerTitle="CHANGE APPROVAL STATUS"
                      triggerVariant="badge"
                      getBadgeClass={getApprovalStatusBadgeClass}
                      onSelect={(newStatus) =>
                        onUpdateApprovalStatus(row.timesheetId, newStatus as TimesheetApprovalStatus)
                      }
                    />
                  </td>
                  {/* Approved By */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.approvedBy}
                  </td>
                  {/* Estimated Labor Cost */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.estimatedLaborCost}
                  </td>
                  {/* Notes */}
                  <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[200px] truncate" title={row.notes}>
                    {row.notes}
                  </td>
                  {/* Actions Dropdown */}
                  <td className="py-3.5 px-4 text-xs text-center whitespace-nowrap">
                    <TableActionMenu
                      isOpen={activeMenuId === row.timesheetId}
                      onToggle={() =>
                        setActiveMenuId(activeMenuId === row.timesheetId ? null : row.timesheetId)
                      }
                      onClose={() => setActiveMenuId(null)}
                      onViewDetails={() => onViewDetails(row)}
                      onEdit={() => onEdit(row)}
                      onDelete={() => onDelete(row.timesheetId)}
                      editLabel="Edit Entry"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="border-t border-slate-100 px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        <span className="text-xs text-slate-500">
          Showing {startRecord}–{endRecord} of {totalCount.toLocaleString('en-IN')} timesheets
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous Page"
              className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Dynamic Page Buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => onPageChange(pg)}
                className={`w-7 h-7 flex items-center justify-center rounded-[8px] text-xs font-semibold transition-colors ${
                  currentPage === pg
                    ? 'bg-[#4F46E5] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                {pg}
              </button>
            ))}

            {totalPages > 5 && (
              <>
                <span className="px-1 text-xs text-slate-400">...</span>
                <button
                  type="button"
                  onClick={() => onPageChange(totalPages)}
                  className={`w-7 h-7 flex items-center justify-center rounded-[8px] text-xs font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next Page"
              className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Size Selector */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-200 rounded-[8px] bg-white text-xs text-slate-700 h-[28px] cursor-pointer">
              <span>{pageSize} per page</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Page size"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
