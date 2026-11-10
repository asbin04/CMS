import React, { useState, useEffect } from 'react';
import {
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Download,
} from 'lucide-react';
import { EmployeeExitRecord, ExitSortOption } from '../../types';
import { StatusDropdownMenu, StatusItemConfig } from '../../../../components/ui/StatusDropdownMenu';

export const EXIT_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'Approved', label: 'Approved', dotColor: '#059669', textColor: '#059669' },
  { value: 'Pending', label: 'Pending', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'In Review', label: 'In Review', dotColor: '#2563EB', textColor: '#2563EB' },
  { value: 'Rejected', label: 'Rejected', dotColor: '#EF4444', textColor: '#EF4444' },
];

export const ASSETS_RETURNED_CONFIGS: StatusItemConfig[] = [
  { value: 'Returned', label: 'Returned', dotColor: '#059669', textColor: '#059669' },
  { value: 'Pending', label: 'Pending', dotColor: '#F59E0B', textColor: '#D97706' },
];

export const FULL_AND_FINAL_CONFIGS: StatusItemConfig[] = [
  { value: 'Approved', label: 'Approved', dotColor: '#059669', textColor: '#059669' },
  { value: 'In Review', label: 'In Review', dotColor: '#2563EB', textColor: '#2563EB' },
  { value: 'Pending', label: 'Pending', dotColor: '#F59E0B', textColor: '#D97706' },
];

export const EXIT_READINESS_CONFIGS: StatusItemConfig[] = [
  { value: 'Completed', label: 'Completed', dotColor: '#2563EB', textColor: '#2563EB' },
  { value: 'In Progress', label: 'In Progress', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Not Started', label: 'Not Started', dotColor: '#E11D48', textColor: '#E11D48' },
];

interface EmployeeExitTableProps {
  records: EmployeeExitRecord[];
  totalRecords: number;
  filteredCount: number;
  sortOption: ExitSortOption;
  onSortChange: (sort: ExitSortOption) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetails: (record: EmployeeExitRecord) => void;
  onEditRecord: (record: EmployeeExitRecord) => void;
  onExportRecord: (record: EmployeeExitRecord) => void;
  onUpdateStatus?: (
    exitId: string,
    field: 'exitStatus' | 'assetsReturned' | 'fullAndFinalStatus' | 'exitReadiness',
    newValue: string
  ) => void;
}

export const EmployeeExitTable: React.FC<EmployeeExitTableProps> = ({
  records,
  totalRecords,
  filteredCount,
  sortOption,
  onSortChange,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  onEditRecord,
  onExportRecord,
  onUpdateStatus,
}) => {
  const [menuRecord, setMenuRecord] = useState<EmployeeExitRecord | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  // Close 3-dot action menu on click outside or window resize/scroll
  useEffect(() => {
    if (!menuRecord) return;

    const handleClose = () => {
      setMenuRecord(null);
      setMenuPosition(null);
    };

    document.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);

    return () => {
      document.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [menuRecord]);

  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const startIndex = filteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredCount);

  // Toggle actions menu with fixed positioning calculation to avoid overflow/sticky clipping
  const handleToggleMenu = (record: EmployeeExitRecord, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (menuRecord?.id === record.id) {
      setMenuRecord(null);
      setMenuPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 135;
    const openUpward = rect.bottom + dropdownHeight > window.innerHeight;

    setMenuRecord(record);
    setMenuPosition({
      top: openUpward ? rect.top - dropdownHeight : rect.bottom + 4,
      right: Math.max(16, window.innerWidth - rect.right),
    });
  };

  // Status Badge Renderers
  const renderExitStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            Pending
          </span>
        );
      case 'In Review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            In Review
          </span>
        );
      default:
        return <span className="text-slate-500 text-xs">{status}</span>;
    }
  };

  const renderAssetsReturnedBadge = (status: string) => {
    if (status === 'Returned') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          Returned
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
          Pending
        </span>
      );
    }
    return <span className="text-slate-400 font-normal text-xs">-</span>;
  };

  const renderFullAndFinalBadge = (status: string) => {
    if (status === 'Approved') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          Approved
        </span>
      );
    }
    if (status === 'In Review') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          In Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
        Pending
      </span>
    );
  };

  const renderReadinessBadge = (status: string) => {
    if (status === 'Completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          Completed
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
        Not Started
      </span>
    );
  };

  return (
    <div
      onClick={() => {
        setMenuRecord(null);
        setMenuPosition(null);
      }}
      className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-soft flex flex-col gap-4 w-full"
    >
      {/* Table Header Row: Title & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <h2 className="text-base font-bold text-slate-900 m-0">
          Employee Exit Records ({filteredCount})
        </h2>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#475569] font-medium">Sort by</span>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as ExitSortOption)}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                height: '30px',
                paddingTop: '6px',
                paddingBottom: '6px',
                paddingLeft: '10px',
                paddingRight: '32px',
                boxSizing: 'border-box',
              }}
              className="h-[30px] pl-[10px] pr-[32px] py-[6px] text-xs font-normal text-[#1E293B] bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[8px] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-[#CBD5E1] transition-colors shadow-2xs"
            >
              <option value="id-desc">Exit ID (Newest)</option>
              <option value="id-asc">Exit ID (Oldest)</option>
              <option value="date-desc">Resignation Date (Newest)</option>
              <option value="name-asc">Employee Name (A-Z)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Table Wrapper */}
      <div className="overflow-x-auto w-full table-horizontal-scroll border border-[#E2E8F0] rounded-xl">
        <table className="w-full text-left border-collapse text-xs min-w-[1550px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Exit ID
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Employee ID
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Employee Name
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Resignation Date
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Approval Date
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap text-center">
                Notice Period Days
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Last Working Day
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Exit Type
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Reason
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Exit Status
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Assets Returned
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Full & Final Status
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Notes
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Notice Completion Date
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap">
                Exit Readiness
              </th>
              <th className="py-3 px-3.5 font-semibold text-[11px] text-slate-500 whitespace-nowrap text-center sticky right-0 bg-[#F8FAFC]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-12 text-center text-xs text-slate-400">
                  No employee exit records match the current filter criteria.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Exit ID */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(r);
                      }}
                      className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-xs hover:underline cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      {r.id}
                    </button>
                  </td>

                  {/* Employee ID */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(r);
                      }}
                      className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold text-xs hover:underline cursor-pointer bg-transparent border-none p-0 text-left"
                    >
                      {r.employeeId}
                    </button>
                  </td>

                  {/* Employee Name */}
                  <td className="py-3 px-3.5 whitespace-nowrap font-bold text-slate-900 text-xs">
                    {r.employeeName}
                  </td>

                  {/* Resignation Date */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 font-normal text-xs">
                    {r.resignationDate}
                  </td>

                  {/* Approval Date */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 font-normal text-xs">
                    {r.approvalDate}
                  </td>

                  {/* Notice Period Days */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-700 font-medium text-xs text-center">
                    {r.noticePeriodDays}
                  </td>

                  {/* Last Working Day */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 font-normal text-xs">
                    {r.lastWorkingDay}
                  </td>

                  {/* Exit Type */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-700 font-medium text-xs">
                    {r.exitType}
                  </td>

                  {/* Reason */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 font-normal text-xs">
                    {r.reason}
                  </td>

                  {/* Exit Status Dropdown */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={r.exitStatus}
                      options={EXIT_STATUS_CONFIGS}
                      headerTitle="CHANGE EXIT STATUS"
                      onSelect={(newStatus) => onUpdateStatus?.(r.id, 'exitStatus', newStatus)}
                    />
                  </td>

                  {/* Assets Returned Dropdown */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={r.assetsReturned}
                      options={ASSETS_RETURNED_CONFIGS}
                      headerTitle="CHANGE ASSETS STATUS"
                      onSelect={(newStatus) => onUpdateStatus?.(r.id, 'assetsReturned', newStatus)}
                    />
                  </td>

                  {/* Full & Final Status Dropdown */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={r.fullAndFinalStatus}
                      options={FULL_AND_FINAL_CONFIGS}
                      headerTitle="CHANGE F&F STATUS"
                      onSelect={(newStatus) => onUpdateStatus?.(r.id, 'fullAndFinalStatus', newStatus)}
                    />
                  </td>

                  {/* Notes */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 font-normal text-xs">
                    {r.notes}
                  </td>

                  {/* Notice Completion Date */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 font-normal text-xs">
                    {r.noticeCompletionDate}
                  </td>

                  {/* Exit Readiness Dropdown */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={r.exitReadiness}
                      options={EXIT_READINESS_CONFIGS}
                      headerTitle="CHANGE READINESS"
                      onSelect={(newStatus) => onUpdateStatus?.(r.id, 'exitReadiness', newStatus)}
                    />
                  </td>

                  {/* Actions Column */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-center sticky right-0 bg-white">
                    <button
                      type="button"
                      onClick={(e) => handleToggleMenu(r, e)}
                      title="Row actions"
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        menuRecord?.id === r.id
                          ? 'text-slate-800 bg-slate-100'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching Designer Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
        <div>
          Showing {startIndex} - {endIndex} of {filteredCount} records
        </div>

        {/* Right side group: page numbers + page size selector */}
        <div className="flex items-center gap-3 self-center sm:self-auto">
          {/* Pages controls */}
          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (
                totalPages > 6 &&
                p !== 1 &&
                p !== totalPages &&
                Math.abs(p - currentPage) > 2
              ) {
                if (p === 2 || p === totalPages - 1) {
                  return (
                    <span key={p} className="px-1 text-slate-400">
                      ...
                    </span>
                  );
                }
                return null;
              }

              const isActive = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4338CA] text-white shadow-2xs'
                      : 'bg-white border border-[#E2E8F0] text-slate-700 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Page size dropdown */}
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                height: '30px',
                paddingTop: '6px',
                paddingBottom: '6px',
                paddingLeft: '10px',
                paddingRight: '28px',
                boxSizing: 'border-box',
              }}
              className="h-[30px] pl-[10px] pr-[28px] py-[6px] text-xs font-normal text-[#1E293B] bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[8px] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-[#CBD5E1] shadow-2xs"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3-Dot Popover Action Menu — Fixed positioning escapes table overflow/sticky clipping */}
      {menuRecord && menuPosition && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            width: '164px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            padding: '4px',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              const r = menuRecord;
              setMenuRecord(null);
              setMenuPosition(null);
              onViewDetails(r);
            }}
            className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2.5 cursor-pointer border-none bg-transparent whitespace-nowrap transition-colors text-left"
          >
            <Eye className="w-4 h-4 text-slate-400 shrink-0" />
            <span>View Details</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const r = menuRecord;
              setMenuRecord(null);
              setMenuPosition(null);
              onEditRecord(r);
            }}
            className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2.5 cursor-pointer border-none bg-transparent whitespace-nowrap transition-colors text-left"
          >
            <Edit2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Edit Record</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const r = menuRecord;
              setMenuRecord(null);
              setMenuPosition(null);
              onExportRecord(r);
            }}
            className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center gap-2.5 cursor-pointer border-none bg-transparent border-t border-slate-100 whitespace-nowrap transition-colors text-left"
          >
            <Download className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Export Record</span>
          </button>
        </div>
      )}
    </div>
  );
};

