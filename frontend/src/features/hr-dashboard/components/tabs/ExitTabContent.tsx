import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import {
  EmployeeExitRecord,
  ExitFilters,
  ExitSortOption,
} from '@/features/hr/types';
import { employeeExitService } from '@/features/hr/services/employeeExitService';
import { EmployeeExitTable } from '@/features/hr/components/exit/EmployeeExitTable';
import { ExitDetailsModal } from '@/features/hr/components/exit/ExitDetailsModal';
import { ProcessExitModal } from '@/features/hr/components/exit/ProcessExitModal';

export interface ExitTabContentProps {
  onDataChange?: () => void;
}

export const ExitTabContent: React.FC<ExitTabContentProps> = ({ onDataChange }) => {
  const [records, setRecords] = useState<EmployeeExitRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const defaultFilters: ExitFilters = {
    search: '',
    exitStatus: 'All',
    exitType: 'All',
    noticePeriod: 'All',
    approvalStatus: 'All',
    dateRange: 'All Time',
  };
  const [filters, setFilters] = useState<ExitFilters>(defaultFilters);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

  // Sorting & Pagination states
  const [sortOption, setSortOption] = useState<ExitSortOption>('id-desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal states
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EmployeeExitRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<EmployeeExitRecord | null>(null);

  // Active Filter Count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.exitStatus !== 'All') count++;
    if (filters.exitType !== 'All') count++;
    if (filters.noticePeriod !== 'All') count++;
    if (filters.approvalStatus !== 'All') count++;
    if (filters.dateRange !== 'All Time') count++;
    return count;
  }, [filters]);

  // Fetch paginated records from live backend API
  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await employeeExitService.getExitRecords({
        search: filters.search,
        exitStatus: filters.exitStatus,
        exitType: filters.exitType,
        noticePeriod: filters.noticePeriod,
        approvalStatus: filters.approvalStatus,
        dateRange: filters.dateRange,
        sort: sortOption,
        page: currentPage,
        size: pageSize,
      });

      setRecords(res.content || []);
      setFilteredCount(res.totalElements ?? 0);
      setTotalRecords(res.totalElements ?? 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch exit records');
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortOption, currentPage, pageSize]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Inline status update
  const handleUpdateStatus = async (
    exitId: string,
    field: 'exitStatus' | 'assetsReturned' | 'fullAndFinalStatus' | 'exitReadiness',
    newValue: string
  ) => {
    try {
      await employeeExitService.updateExitRecord(exitId, { [field]: newValue } as any);
      setRecords((prev) =>
        prev.map((r) => (r.id === exitId ? { ...r, [field]: newValue } : r))
      );
    } catch {
      // Local fallback update
      setRecords((prev) =>
        prev.map((r) => (r.id === exitId ? { ...r, [field]: newValue } : r))
      );
    } finally {
      onDataChange?.();
    }
  };

  const handleExportRecord = (record: EmployeeExitRecord) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Exit ID,Employee ID,Employee Name,Resignation Date,Approval Date,Notice Period,Last Working Day,Exit Type,Reason,Exit Status,Assets Returned,Full & Final,Exit Readiness',
        `"${record.id}","${record.employeeId}","${record.employeeName}","${record.resignationDate}","${record.approvalDate || '-'}","${record.noticePeriodDays} Days","${record.lastWorkingDay}","${record.exitType}","${record.reason}","${record.exitStatus}","${record.assetsReturned}","${record.fullAndFinalStatus}","${record.exitReadiness}"`,
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `exit_${record.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Search & Filter Toolbar Container (Exact Reference Specs) */}
      <div className="p-6 flex flex-col gap-4 w-full">
        {/* Row 1: Search Bar & Primary Action Buttons */}
        <div className="flex flex-row items-center gap-3 h-[38px] w-full">
          {/* Search Input Container */}
          <div className="relative flex-1 h-[38px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Search by Exit ID, Employee Name, or Department..."
              className="w-full h-[38px] pl-10 pr-4 py-2 text-sm text-[#334155] placeholder:text-[#94A3B8] bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Primary Filter Buttons */}
          <div className="flex items-center gap-2 h-[34px] shrink-0">
            {/* Filters Button */}
            <button
              type="button"
              onClick={() => setIsFiltersVisible((prev) => !prev)}
              className={`h-[34px] px-3.5 flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs text-xs font-semibold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer ${
                isFiltersVisible ? 'bg-slate-50 border-slate-300' : ''
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Filters</span>
            </button>

            {/* Clear Filters Button */}
            <button
              type="button"
              onClick={() => {
                setFilters(defaultFilters);
                setCurrentPage(1);
              }}
              className="h-[34px] px-3.5 flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs text-xs font-semibold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Secondary Dropdown Filters (Show/Hide via Filters button) */}
        {isFiltersVisible && (
          <div className="flex flex-col sm:flex-row items-start pt-1 gap-4 w-full">
            {/* 1. Exit Status Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Exit Status
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={filters.exitStatus}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, exitStatus: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Exit Type Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Exit Type
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={filters.exitType}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, exitType: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  <option value="Resignation">Resignation</option>
                  <option value="Termination">Termination</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Contract End">Contract End</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Approval Status Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Approval Status
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={filters.approvalStatus}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, approvalStatus: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="px-6 pb-6">
        <EmployeeExitTable
          records={records}
          totalRecords={totalRecords}
          filteredCount={filteredCount}
          sortOption={sortOption}
          onSortChange={setSortOption}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          onViewDetails={(rec) => {
            setSelectedRecord(rec);
            setIsDetailsModalOpen(true);
          }}
          onEditRecord={(rec) => {
            setEditingRecord(rec);
            setIsProcessModalOpen(true);
          }}
          onExportRecord={handleExportRecord}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>

      {/* Exit Details Modal */}
      {selectedRecord && (
        <ExitDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            setEditingRecord(selectedRecord);
            setIsProcessModalOpen(true);
          }}
        />
      )}

      {/* Process/Edit Exit Modal */}
      <ProcessExitModal
        isOpen={isProcessModalOpen}
        onClose={() => {
          setIsProcessModalOpen(false);
          setEditingRecord(null);
        }}
        editRecord={editingRecord}
        onSubmit={async (record) => {
          if (editingRecord) {
            await employeeExitService.updateExitRecord(editingRecord.id, record);
          } else {
            await employeeExitService.createExitRecord(record);
          }
          setIsProcessModalOpen(false);
          setEditingRecord(null);
          await fetchRecords();
          onDataChange?.();
        }}
      />
    </div>
  );
};
