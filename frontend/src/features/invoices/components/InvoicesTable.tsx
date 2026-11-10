import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, MoreVertical, Eye, Edit3, Trash2, FileX, Loader2 } from 'lucide-react';
import { InvoiceRecord, InvoiceSortOption } from '../types';
import { formatRupee } from '../utils';

interface InvoicesTableProps {
  records: InvoiceRecord[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  sortOption: InvoiceSortOption;
  isLoading?: boolean;
  onSortChange: (option: InvoiceSortOption) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewRecord: (record: InvoiceRecord) => void;
  onEditRecord: (record: InvoiceRecord) => void;
  onDeleteRecord: (record: InvoiceRecord) => void;
  onClearFilters?: () => void;
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({
  records,
  totalRecords,
  currentPage,
  pageSize,
  sortOption,
  isLoading = false,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onClearFilters,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);
  const pageSizeRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const sortOptions: InvoiceSortOption[] = [
    'Invoice Date (Newest)',
    'Invoice Date (Oldest)',
    'Total Amount (High to Low)',
    'Total Amount (Low to High)',
    'Due Date (Soonest)',
    'Due Date (Latest)',
    'Invoice ID (Newest)',
    'Invoice ID (Oldest)',
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
      if (pageSizeRef.current && !pageSizeRef.current.contains(e.target as Node)) {
        setIsPageSizeOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startRecord = totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const handleSortSelect = (opt: InvoiceSortOption) => {
    onSortChange(opt);
    setIsSortOpen(false);
  };

  const renderStatusBadge = (status: InvoiceRecord['status']) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            Partially Paid
          </span>
        );
      case 'Unpaid':
        return (
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
            Unpaid
          </span>
        );
      default:
        return <span className="text-slate-600 text-xs">{status}</span>;
    }
  };

  const renderAgingBadge = (bucket: InvoiceRecord['agingBucket'], invoiceId: string) => {
    if (bucket === 'No Due Date') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[#F1F5F9] text-slate-600 border border-slate-200">
          No Due Date
        </span>
      );
    }
    if (invoiceId === 'INV-2026-128') {
      return (
        <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          {bucket}
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
        {bucket}
      </span>
    );
  };

  const renderCollectionBadge = (status: InvoiceRecord['collectionStatus']) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            Pending
          </span>
        );
      case 'Follow Up':
        return (
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
            Follow Up
          </span>
        );
      default:
        return <span className="text-slate-600 text-xs">{status}</span>;
    }
  };

  // Generate pagination pages with ellipsis
  const getPaginationItems = () => {
    const items: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 4) {
        items.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        items.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        items.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return items;
  };

  return (
    <div className="space-y-3">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <h3 className="text-base font-bold text-slate-900 leading-6">
          Invoice Records ({totalRecords})
        </h3>

        <div className="flex items-center gap-2 relative" ref={sortRef}>
          <span className="text-xs text-slate-500 font-medium">Sort by</span>
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#E2E8F0] rounded-[12px] bg-[#FFFFFF] text-xs font-semibold text-[#1E293B] hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer h-[38px]"
            style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
          >
            <span>{sortOption}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSortOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-56 bg-[#FFFFFF] rounded-[12px] border border-[#E2E8F0] shadow-lg py-1 z-30"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
            >
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSortSelect(opt)}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                    sortOption === opt
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden relative">
        {isLoading && records.length > 0 && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        )}
        {isLoading && records.length === 0 ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800">Loading live invoice records...</h4>
            <p className="text-xs text-slate-400 mt-1">Connecting to live Supabase database</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <FileX className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No matching invoices found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search query, clearing active filters, or creating a new client invoice.
            </p>
            {onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left whitespace-nowrap min-w-[1700px]">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-left">
                    Invoice ID
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-left">
                    Invoice Date
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-left">
                    Client ID
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-left">
                    Project ID
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-left">
                    Contract ID
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-left">
                    Due Date
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">
                    Amount Before Tax
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">
                    Tax Amount
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">
                    Total Amount
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">
                    Paid Amount
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">
                    Outstanding Amount
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
                    Payment Terms Days
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
                    Days Overdue
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
                    Aging Bucket
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
                    Collection Status
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
                    Outstanding
                  </th>
                  <th className="px-4 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((row) => (
                  <tr
                    key={row.invoiceId}
                    onClick={() => onViewRecord(row)}
                    className="hover:bg-slate-50/70 transition-colors h-[50px] cursor-pointer"
                  >
                    {/* 1. Invoice ID */}
                    <td className="px-4 py-2 text-xs font-medium text-[#2563EB] hover:underline">
                      {row.invoiceId}
                    </td>

                    {/* 2. Invoice Date */}
                    <td className="px-4 py-2 text-xs text-slate-600 font-normal">
                      {row.invoiceDate}
                    </td>

                    {/* 3. Client ID */}
                    <td className="px-4 py-2 text-xs font-medium text-[#2563EB] hover:underline" title={row.clientName}>
                      {row.clientId}
                    </td>

                    {/* 4. Project ID */}
                    <td className="px-4 py-2 text-xs font-medium text-[#2563EB] hover:underline">
                      {row.projectId}
                    </td>

                    {/* 5. Contract ID */}
                    <td className="px-4 py-2 text-xs font-medium text-[#2563EB] hover:underline">
                      {row.contractId}
                    </td>

                    {/* 6. Due Date */}
                    <td className="px-4 py-2 text-xs text-slate-600 font-normal">
                      {row.dueDate}
                    </td>

                    {/* 7. Amount Before Tax */}
                    <td className="px-4 py-2 text-xs text-slate-700 text-right font-medium">
                      {formatRupee(row.amountBeforeTax)}
                    </td>

                    {/* 8. Tax Amount */}
                    <td className="px-4 py-2 text-xs text-slate-700 text-right font-medium">
                      {formatRupee(row.taxAmount)}
                    </td>

                    {/* 9. Total Amount */}
                    <td className="px-4 py-2 text-xs text-slate-800 text-right font-semibold">
                      {formatRupee(row.totalAmount)}
                    </td>

                    {/* 10. Paid Amount */}
                    <td className="px-4 py-2 text-xs text-slate-700 text-right font-medium">
                      {formatRupee(row.paidAmount)}
                    </td>

                    {/* 11. Outstanding Amount */}
                    <td className="px-4 py-2 text-xs text-slate-700 text-right font-medium">
                      {formatRupee(row.outstandingAmount)}
                    </td>

                    {/* 12. Status */}
                    <td className="px-4 py-2 text-center">
                      {renderStatusBadge(row.status)}
                    </td>

                    {/* 13. Payment Terms Days */}
                    <td className="px-4 py-2 text-xs text-slate-700 text-center font-normal">
                      {row.paymentTermsDays}
                    </td>

                    {/* 14. Days Overdue */}
                    <td className="px-4 py-2 text-xs text-slate-700 text-center font-normal">
                      {row.daysOverdue}
                    </td>

                    {/* 15. Aging Bucket */}
                    <td className="px-4 py-2 text-center">
                      {renderAgingBadge(row.agingBucket, row.invoiceId)}
                    </td>

                    {/* 16. Collection Status */}
                    <td className="px-4 py-2 text-center">
                      {renderCollectionBadge(row.collectionStatus)}
                    </td>

                    {/* 17. Outstanding */}
                    <td className="px-4 py-2 text-xs text-slate-700 text-center font-normal">
                      {row.outstanding}
                    </td>

                    {/* 18. Actions */}
                    <td className="px-4 py-2 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === row.invoiceId ? null : row.invoiceId)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Three Dot Action Dropdown Menu */}
                      {activeMenuId === row.invoiceId && (
                        <div
                          ref={actionMenuRef}
                          className="absolute right-4 top-8 w-36 bg-white rounded-xl border border-[#E2E8F0] shadow-xl py-1 z-30 text-left"
                          style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onViewRecord(row);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditRecord(row);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit Invoice</span>
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteRecord(row);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="border-t border-[#E2E8F0] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="text-xs text-slate-500 font-medium">
            Showing {startRecord} – {endRecord} of {totalRecords} records
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Previous */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 border border-[#E2E8F0] rounded-[12px] text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Dynamic Page Items */}
            {getPaginationItems().map((item, idx) => {
              if (item === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="text-xs text-slate-400 px-1">
                    ...
                  </span>
                );
              }
              const pageNum = item as number;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    isActive ? 'bg-[#4338CA] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 border border-[#E2E8F0] rounded-[12px] text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Per page selector */}
            <div className="relative" ref={pageSizeRef}>
              <button
                type="button"
                onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] rounded-[12px] text-xs font-medium text-slate-700 ml-2 bg-[#FFFFFF] hover:border-slate-300 transition-colors cursor-pointer"
                style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
              >
                <span>{pageSize} per page</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isPageSizeOpen && (
                <div
                  className="absolute right-0 bottom-full mb-1 w-28 bg-white rounded-xl border border-[#E2E8F0] shadow-lg py-1 z-30"
                  style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
                >
                  {[10, 20, 50].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        onPageSizeChange(size);
                        setIsPageSizeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                        pageSize === size ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {size} per page
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
