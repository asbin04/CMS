import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { FinancePaymentRecord } from '../types/payments';

interface PaymentsTableProps {
  records: FinancePaymentRecord[];
  isLoading: boolean;
  totalRecords: number;
  filteredCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  onSelectRecord: (record: FinancePaymentRecord) => void;
}

const formatIndianCurrency = (num: number): string => {
  return (
    '₹ ' +
    num.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    })
  );
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  try {
    const [year, month, day] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(month, 10) - 1;
    return `${day} ${months[mIdx] || month} ${year}`;
  } catch {
    return dateStr;
  }
};

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  records,
  isLoading,
  totalRecords,
  filteredCount,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  sort,
  onSortChange,
  onSelectRecord,
}) => {
  const startItem = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalRecords);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Matched':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            Matched
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            Pending
          </span>
        );
      case 'Partially Matched':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]">
            Partially Matched
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Generate page numbers with ellipsis
  const renderPageButtons = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= maxVisible; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span key={`ellipsis-${index}`} className="px-2 py-1 text-xs text-slate-400">
            ...
          </span>
        );
      }

      const isCurrent = page === currentPage;
      return (
        <button
          key={`page-${page}`}
          type="button"
          onClick={() => onPageChange(page as number)}
          className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors ${
            isCurrent
              ? 'bg-[#4F46E5] text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {/* Table Top Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Payment Records ({filteredCount || totalRecords})
        </h2>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort by</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="Payment Date (Newest)">Payment Date (Newest)</option>
              <option value="Payment Date (Oldest)">Payment Date (Oldest)</option>
              <option value="Amount (High to Low)">Amount (High to Low)</option>
              <option value="Amount (Low to High)">Amount (Low to High)</option>
              <option value="Payment ID">Payment ID</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 font-semibold">Payment ID</th>
              <th className="py-3.5 px-4 font-semibold">Payment Date</th>
              <th className="py-3.5 px-4 font-semibold">Invoice ID</th>
              <th className="py-3.5 px-4 font-semibold">Client ID</th>
              <th className="py-3.5 px-4 font-semibold">Amount</th>
              <th className="py-3.5 px-4 font-semibold">Mode</th>
              <th className="py-3.5 px-4 font-semibold">Reference No</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No payment records found matching the filter criteria.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => onSelectRecord(record)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-semibold text-indigo-600 group-hover:underline">
                    {record.id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {formatDate(record.paymentDate)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-indigo-500">
                    {record.invoiceId}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-blue-600">
                    {record.clientId}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatIndianCurrency(record.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {record.mode}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    {record.referenceNo}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate" title={record.notes}>
                    {record.notes || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/30">
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-slate-800 font-semibold">{startItem} - {endItem}</span> of{' '}
          <span className="text-slate-800 font-semibold">{totalRecords}</span> records
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Pagination Navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {renderPageButtons()}

            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Page Size Selector */}
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
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

