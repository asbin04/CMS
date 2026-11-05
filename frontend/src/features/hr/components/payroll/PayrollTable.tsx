import React, { useState, useEffect } from 'react';
import {
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { PayrollRecord, PayrollSortOption } from '../../types/payroll';

interface PayrollTableProps {
  records: PayrollRecord[];
  totalRecords: number;
  filteredCount: number;
  sortOption: PayrollSortOption;
  onSortChange: (sort: PayrollSortOption) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewPayslip: (record: PayrollRecord) => void;
  onDownloadPayslip: (record: PayrollRecord) => void;
  onMarkPaid?: (record: PayrollRecord) => void;
}

export const formatIndianCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return '₹ 0';
  return '₹ ' + Math.round(amount).toLocaleString('en-IN');
};

export const PayrollTable: React.FC<PayrollTableProps> = ({
  records,
  totalRecords,
  filteredCount,
  sortOption,
  onSortChange,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewPayslip,
  onDownloadPayslip,
  onMarkPaid,
}) => {
  const [activeMenuRecord, setActiveMenuRecord] = useState<PayrollRecord | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  // Close 3-dot action menu on outside click or scroll
  useEffect(() => {
    if (!activeMenuRecord) return;
    const handleClose = () => {
      setActiveMenuRecord(null);
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
  }, [activeMenuRecord]);

  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const startIndex = filteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredCount);

  const handleToggleMenu = (record: PayrollRecord, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenuRecord?.id === record.id) {
      setActiveMenuRecord(null);
      setMenuPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 120;
    const openUpward = rect.bottom + dropdownHeight > window.innerHeight;

    setActiveMenuRecord(record);
    setMenuPosition({
      top: openUpward ? rect.top - dropdownHeight : rect.bottom + 4,
      right: Math.max(16, window.innerWidth - rect.right),
    });
  };

  const renderEmploymentTypeBadge = (type: string) => {
    switch (type) {
      case 'Full Time':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            Full Time
          </span>
        );
      case 'Contract':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            Contract
          </span>
        );
      case 'Part Time':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FAF5FF] text-[#9333EA] border border-[#F3E8FF]">
            Part Time
          </span>
        );
      case 'Intern':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]">
            Intern
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {type}
          </span>
        );
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]">
            Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            Processing
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span key={`dots-${index}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">
            ...
          </span>
        );
      }
      const pageNum = Number(page);
      const isActive = pageNum === currentPage;
      return (
        <button
          key={`page-${pageNum}`}
          type="button"
          onClick={() => onPageChange(pageNum)}
          className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
            isActive
              ? 'bg-[#4338CA] text-white shadow-2xs'
              : 'bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
          }`}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs overflow-hidden flex flex-col w-full">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-[#F1F5F9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight m-0">
            Payroll Records ({filteredCount})
          </h2>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-normal">Sort by</span>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as PayrollSortOption)}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                height: '32px',
                boxSizing: 'border-box',
              }}
              className="h-8 pl-3 pr-8 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-[8px] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            >
              <option value="newest">Payroll Month (Newest)</option>
              <option value="oldest">Payroll Month (Oldest)</option>
              <option value="salary-desc">Net Salary (High to Low)</option>
              <option value="salary-asc">Net Salary (Low to High)</option>
              <option value="name-asc">Employee Name (A-Z)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1300px]">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Payroll ID</th>
              <th className="py-3 px-3">Payroll Month</th>
              <th className="py-3 px-3">Employee ID</th>
              <th className="py-3 px-4">Employee Name</th>
              <th className="py-3 px-3">Employment Type</th>
              <th className="py-3 px-3">Monthly CTC</th>
              <th className="py-3 px-2 text-center">Working Days</th>
              <th className="py-3 px-2 text-center">Paid Days</th>
              <th className="py-3 px-2 text-center">LOP Days</th>
              <th className="py-3 px-3">Basic Pay</th>
              <th className="py-3 px-3">HRA</th>
              <th className="py-3 px-3">Allowances</th>
              <th className="py-3 px-3">Gross Salary</th>
              <th className="py-3 px-3">Deductions</th>
              <th className="py-3 px-3">Net Salary</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] text-xs font-normal text-slate-700">
            {records.length === 0 ? (
              <tr>
                <td colSpan={17} className="py-12 text-center text-slate-400">
                  No payroll records found matching your filters.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Payroll ID */}
                  <td className="py-3.5 px-4 font-semibold text-[#4338CA] whitespace-nowrap cursor-pointer hover:underline"
                      onClick={() => onViewPayslip(r)}
                  >
                    {r.payrollId}
                  </td>

                  {/* Payroll Month */}
                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                    {r.payrollMonth}
                  </td>

                  {/* Employee ID */}
                  <td className="py-3.5 px-3 font-medium text-[#4338CA] whitespace-nowrap">
                    {r.employeeId}
                  </td>

                  {/* Employee Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {r.employeeName}
                  </td>

                  {/* Employment Type */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {renderEmploymentTypeBadge(r.employmentType)}
                  </td>

                  {/* Monthly CTC */}
                  <td className="py-3.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                    {formatIndianCurrency(r.monthlyCtc)}
                  </td>

                  {/* Working Days */}
                  <td className="py-3.5 px-2 text-center text-slate-700 whitespace-nowrap font-medium">
                    {r.workingDays}
                  </td>

                  {/* Paid Days */}
                  <td className="py-3.5 px-2 text-center text-slate-700 whitespace-nowrap font-medium">
                    {r.paidDays}
                  </td>

                  {/* LOP Days */}
                  <td className="py-3.5 px-2 text-center text-slate-600 whitespace-nowrap">
                    {r.lopDays}
                  </td>

                  {/* Basic Pay */}
                  <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                    {formatIndianCurrency(r.basicPay)}
                  </td>

                  {/* HRA */}
                  <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                    {formatIndianCurrency(r.hra)}
                  </td>

                  {/* Allowances */}
                  <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                    {formatIndianCurrency(r.allowances)}
                  </td>

                  {/* Gross Salary */}
                  <td className="py-3.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                    {formatIndianCurrency(r.grossSalary)}
                  </td>

                  {/* Deductions */}
                  <td className="py-3.5 px-3 text-rose-600 whitespace-nowrap">
                    {formatIndianCurrency(r.deductions)}
                  </td>

                  {/* Net Salary */}
                  <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {formatIndianCurrency(r.netSalary)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {renderStatusBadge(r.paymentStatus)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap relative">
                    <button
                      type="button"
                      onClick={(e) => handleToggleMenu(r, e)}
                      title="Actions"
                      className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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

      {/* Floating 3-Dot Action Context Menu */}
      {activeMenuRecord && menuPosition && (
        <div
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            zIndex: 9999,
          }}
          className="w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onViewPayslip(activeMenuRecord);
              setActiveMenuRecord(null);
            }}
            className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            <span>View Payslip</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onDownloadPayslip(activeMenuRecord);
              setActiveMenuRecord(null);
            }}
            className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Download Payslip</span>
          </button>

          {activeMenuRecord.paymentStatus !== 'Paid' && onMarkPaid && (
            <button
              type="button"
              onClick={() => {
                onMarkPaid(activeMenuRecord);
                setActiveMenuRecord(null);
              }}
              className="w-full px-3.5 py-2 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Mark as Paid</span>
            </button>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="px-5 py-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
        {/* Left: Showing Range */}
        <span className="text-xs text-slate-500 font-normal">
          Showing {startIndex}–{endIndex} of {filteredCount} records
        </span>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Page Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {renderPageNumbers()}

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Page Size Dropdown */}
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                height: '32px',
                boxSizing: 'border-box',
              }}
              className="h-8 pl-3 pr-7 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-[8px] appearance-none cursor-pointer focus:outline-none"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

