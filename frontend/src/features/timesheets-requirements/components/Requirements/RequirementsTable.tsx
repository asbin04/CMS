import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { RequirementRecord, RequirementPriority, RequirementStatus } from '../../types';
import { StatusDropdownMenu, StatusItemConfig } from '../../../../components/ui/StatusDropdownMenu';
import { TableActionMenu } from '../../../../components/ui/TableActionMenu';

interface RequirementsTableProps {
  records: RequirementRecord[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onUpdateStatus: (id: string, newStatus: RequirementStatus) => void;
  onUpdatePriority: (id: string, newPriority: RequirementPriority) => void;
  onViewDetails: (record: RequirementRecord) => void;
  onEdit: (record: RequirementRecord) => void;
  onDelete: (id: string) => void;
  sortField?: string | null;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

const REQUIREMENT_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'In Progress', label: 'In Progress', dotColor: '#6366F1', textColor: '#4F46E5' },
  { value: 'Pending Approval', label: 'Pending Approval', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Completed', label: 'Completed', dotColor: '#10B981', textColor: '#059669' },
];

const REQUIREMENT_PRIORITY_CONFIGS: StatusItemConfig[] = [
  { value: 'High', label: 'High', dotColor: '#EF4444', textColor: '#DC2626' },
  { value: 'Medium', label: 'Medium', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Low', label: 'Low', dotColor: '#10B981', textColor: '#059669' },
];

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  records = [],
  totalCount = 0,
  currentPage = 1,
  pageSize = 5,
  onPageChange,
  onPageSizeChange,
  onUpdateStatus,
  onUpdatePriority,
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

  const getPriorityBadgeClass = (val: string) => {
    switch (val) {
      case 'High':
        return 'bg-[#FEF2F2] text-[#DC2626]';
      case 'Medium':
        return 'bg-[#FFFBEB] text-[#D97706]';
      case 'Low':
      default:
        return 'bg-[#ECFDF5] text-[#059669]';
    }
  };

  const getStatusBadgeClass = (val: string) => {
    switch (val) {
      case 'Completed':
        return 'bg-[#ECFDF5] text-[#059669]';
      case 'Pending Approval':
        return 'bg-[#FFFBEB] text-[#D97706]';
      case 'In Progress':
      default:
        return 'bg-[#EEF2FF] text-[#4F46E5]';
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
              {renderSortableHeader('requirementId', 'Requirement ID')}
              {renderSortableHeader('projectId', 'Project ID')}
              {renderSortableHeader('clientId', 'Client ID')}
              {renderSortableHeader('requirementDate', 'Requirement Date')}
              {renderSortableHeader('type', 'Type')}
              {renderSortableHeader('requirementFeature', 'Requirement / Feature')}
              {renderSortableHeader('priority', 'Priority')}
              {renderSortableHeader('ownerId', 'Owner ID')}
              {renderSortableHeader('status', 'Status')}
              {renderSortableHeader('scopeFreeze', 'Scope Freeze')}
              {renderSortableHeader('approvedBy', 'Approved By')}
              {renderSortableHeader('approvalDate', 'Approval Date')}
              {renderSortableHeader('completionPercentage', 'Completion %')}
              <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-xs text-slate-500">
                  No requirement records match your search or filter criteria.
                </td>
              </tr>
            ) : (
              records.map((row) => (
                <tr key={row.requirementId} className="hover:bg-slate-50/60 transition-colors">
                  {/* Requirement ID */}
                  <td
                    onClick={() => onViewDetails(row)}
                    className="py-3.5 px-4 text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    {row.requirementId}
                  </td>
                  {/* Project ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.projectId}
                  </td>
                  {/* Client ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.clientId}
                  </td>
                  {/* Requirement Date */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.requirementDate}
                  </td>
                  {/* Type */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.type}
                  </td>
                  {/* Requirement / Feature */}
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                    {row.requirementFeature}
                  </td>
                  {/* Priority with Interactive StatusDropdownMenu */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={row.priority}
                      options={REQUIREMENT_PRIORITY_CONFIGS}
                      headerTitle="CHANGE PRIORITY"
                      triggerVariant="badge"
                      getBadgeClass={getPriorityBadgeClass}
                      onSelect={(newPriority) =>
                        onUpdatePriority(row.requirementId, newPriority as RequirementPriority)
                      }
                    />
                  </td>
                  {/* Owner ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.ownerId}
                  </td>
                  {/* Status with Interactive StatusDropdownMenu */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={row.status}
                      options={REQUIREMENT_STATUS_CONFIGS}
                      headerTitle="CHANGE STATUS"
                      triggerVariant="badge"
                      getBadgeClass={getStatusBadgeClass}
                      onSelect={(newStatus) =>
                        onUpdateStatus(row.requirementId, newStatus as RequirementStatus)
                      }
                    />
                  </td>
                  {/* Scope Freeze */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-[6px] text-[11px] font-semibold ${
                        row.scopeFreeze === 'Yes'
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : 'bg-[#FEF2F2] text-[#DC2626]'
                      }`}
                    >
                      {row.scopeFreeze}
                    </span>
                  </td>
                  {/* Approved By */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.approvedBy || '-'}
                  </td>
                  {/* Approval Date */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.approvalDate || '-'}
                  </td>
                  {/* Completion % with progress bar */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 text-slate-800 font-medium">
                        {row.completionPercentage}%
                      </span>
                      <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            row.completionPercentage === 100 ? 'bg-[#10B981]' : 'bg-[#4F46E5]'
                          }`}
                          style={{ width: `${row.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  {/* Row Actions Menu */}
                  <td className="py-3.5 px-4 text-xs text-center whitespace-nowrap">
                    <TableActionMenu
                      isOpen={activeMenuId === row.requirementId}
                      onToggle={() =>
                        setActiveMenuId(activeMenuId === row.requirementId ? null : row.requirementId)
                      }
                      onClose={() => setActiveMenuId(null)}
                      onViewDetails={() => onViewDetails(row)}
                      onEdit={() => onEdit(row)}
                      onDelete={() => onDelete(row.requirementId)}
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
          Showing {startRecord}–{endRecord} of {totalCount.toLocaleString('en-IN')} requirements
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              aria-label="Previous Page"
              className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Smart Page Buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 flex items-center justify-center rounded-[8px] text-xs font-semibold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-[#4F46E5] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pageNum}
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
                      ? 'bg-[#4F46E5] text-white font-semibold shadow-xs'
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
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
