import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { EmployeeExitHeader } from '../components/exit/EmployeeExitHeader';
import { EmployeeExitKpis } from '../components/exit/EmployeeExitKpis';
import { EmployeeExitFilterCard } from '../components/exit/EmployeeExitFilterCard';
import { EmployeeExitTable } from '../components/exit/EmployeeExitTable';
import { ProcessExitModal } from '../components/exit/ProcessExitModal';
import { ExitDetailsModal } from '../components/exit/ExitDetailsModal';
import { ToastNotification, useToast } from '../../../components/ui/ToastNotification';
import {
  EmployeeExitRecord,
  ExitFilters,
  ExitSortOption,
  ExitKpiSummary,
} from '../types';
import { employeeExitService } from '../services/employeeExitService';

export const EmployeeExitPage: React.FC = () => {
  // 1. Exit records & pagination states
  const [records, setRecords] = useState<EmployeeExitRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(18);
  const [filteredCount, setFilteredCount] = useState<number>(18);
  const [lastUpdated, setLastUpdated] = useState('15 Oct 2026, 11:30 AM');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setIsLoading] = useState(false);

  // 2. Filter states
  const defaultFilters: ExitFilters = {
    search: '',
    exitStatus: 'All',
    exitType: 'All',
    noticePeriod: 'All',
    approvalStatus: 'All',
    dateRange: 'All Time',
  };
  const [filters, setFilters] = useState<ExitFilters>(defaultFilters);

  // 3. Sorting & Pagination states
  const [sortOption, setSortOption] = useState<ExitSortOption>('id-desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 4. Modal states
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EmployeeExitRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<EmployeeExitRecord | null>(null);

  // 5. KPIs and Next ID states
  const [kpiSummary, setKpiSummary] = useState<ExitKpiSummary>({
    totalExitRequests: 18,
    totalExitRequestsTrend: 12,
    approvedExits: 12,
    approvedExitsTrend: 33,
    pendingApprovals: 4,
    pendingApprovalsTrend: -9,
    completedExits: 10,
    completedExitsTrend: 67,
  });
  const [nextExitId, setNextExitId] = useState<string>('EXI-00019');

  // 6. Toast Notifications
  const { toasts, addToast, removeToast } = useToast();

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

  // Fetch paginated records from backend API
  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
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
    } catch (err: any) {
      console.error('Error fetching employee exits:', err);
      addToast(
        'error',
        'Connection Error',
        err.message || 'Failed to load employee exit records from server.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortOption, currentPage, pageSize, addToast]);

  // Fetch KPIs from backend API
  const fetchKpis = useCallback(async () => {
    try {
      const kpis = await employeeExitService.getKpis();
      setKpiSummary(kpis);
      setTotalRecords(kpis.totalExitRequests);
    } catch (err: any) {
      console.warn('Error fetching exit KPIs:', err);
    }
  }, []);

  // Fetch next suggested Exit ID from backend API
  const fetchNextId = useCallback(async () => {
    try {
      const res = await employeeExitService.getNextExitId();
      if (res.nextExitId) setNextExitId(res.nextExitId);
    } catch (err: any) {
      console.warn('Error fetching next exit ID:', err);
    }
  }, []);

  // Initial and reactive load
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    fetchKpis();
    fetchNextId();
  }, [fetchKpis, fetchNextId]);

  const handleFilterChange = <K extends keyof ExitFilters>(key: K, value: ExitFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setSortOption('id-desc');
    setCurrentPage(1);
    addToast('info', 'Filters Cleared', 'All search and filter criteria have been reset.');
  };

  // Actions
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchRecords(), fetchKpis(), fetchNextId()]);

      const now = new Date();
      const formatted = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setLastUpdated(`${formatted}, ${time}`);
      addToast('success', 'Data Synchronized', 'Employee Exit records have been refreshed.');
    } catch (err: any) {
      addToast('error', 'Refresh Failed', err.message || 'Could not synchronize data.');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchRecords, fetchKpis, fetchNextId, addToast]);

  const handleExportCSV = useCallback(async () => {
    try {
      const allFiltered = await employeeExitService.getAllFilteredExitRecords(filters, sortOption);
      if (allFiltered.length === 0) {
        addToast('warning', 'Export Unavailable', 'No records match the current filters to export.');
        return;
      }
      employeeExitService.exportToCsv(allFiltered);
      addToast(
        'success',
        'Export Successful',
        `Exported ${allFiltered.length} exit record(s) to CSV.`
      );
    } catch (err: any) {
      addToast('error', 'Export Failed', err.message || 'Could not export exit records.');
    }
  }, [filters, sortOption, addToast]);

  const handleExportSingleRecord = useCallback(
    (record: EmployeeExitRecord) => {
      employeeExitService.exportSingleRecord(record);
      addToast('success', 'Record Exported', `Saved summary for ${record.id}.`);
    },
    [addToast]
  );

  const handleUpdateRecordStatus = async (
    exitId: string,
    field: 'exitStatus' | 'assetsReturned' | 'fullAndFinalStatus' | 'exitReadiness',
    newValue: string
  ) => {
    // Optimistic update
    setRecords((prev) =>
      prev.map((r) => (r.id === exitId ? { ...r, [field]: newValue } : r))
    );

    try {
      await employeeExitService.updateExitRecord(exitId, { [field]: newValue });
      fetchKpis();
      addToast('success', 'Status Updated', `Exit record ${exitId} updated.`);
    } catch (err: any) {
      console.error('Failed to update exit record status:', err);
      addToast('error', 'Update Failed', err.message || 'Failed to update exit record status.');
      fetchRecords();
    }
  };

  const handleSaveExitRecord = async (record: EmployeeExitRecord) => {
    try {
      if (editingRecord) {
        await employeeExitService.updateExitRecord(editingRecord.id, record);
        addToast('success', 'Record Updated', `Successfully updated exit case ${record.id}.`);
        setEditingRecord(null);
      } else {
        await employeeExitService.createExitRecord(record);
        addToast(
          'success',
          'Exit Processed',
          `Successfully initiated exit case ${record.id} for ${record.employeeName}.`
        );
      }
      setIsProcessModalOpen(false);
      await Promise.all([fetchRecords(), fetchKpis(), fetchNextId()]);
    } catch (err: any) {
      console.error('Error saving exit record:', err);
      addToast(
        'error',
        'Save Failed',
        err.message || 'Failed to save exit record to server.'
      );
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-7 max-w-[1400px] mx-auto w-full min-h-full flex flex-col gap-5 bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Toast Notification Hub */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} position="top-right" />

      {/* 1. Page Header */}
      <EmployeeExitHeader
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        onExport={handleExportCSV}
        onProcessExit={() => {
          setEditingRecord(null);
          setIsProcessModalOpen(true);
        }}
        isRefreshing={isRefreshing}
      />

      {/* 2. 4 KPI Cards */}
      <EmployeeExitKpis summary={kpiSummary} />

      {/* 3. Search and Filters Card */}
      <EmployeeExitFilterCard
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* 4. Employee Exit Records Table */}
      <EmployeeExitTable
        records={records}
        totalRecords={totalRecords}
        filteredCount={filteredCount}
        sortOption={sortOption}
        onSortChange={setSortOption}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
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
        onExportRecord={handleExportSingleRecord}
        onUpdateStatus={handleUpdateRecordStatus}
      />

      {/* 5. Process / Edit Exit Modal */}
      <ProcessExitModal
        isOpen={isProcessModalOpen}
        onClose={() => {
          setIsProcessModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSaveExitRecord}
        editRecord={editingRecord}
        existingCount={totalRecords}
        nextExitId={nextExitId}
      />

      {/* 6. View Exit Case Details Modal */}
      <ExitDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onEdit={(rec) => {
          setSelectedRecord(null);
          setIsDetailsModalOpen(false);
          setEditingRecord(rec);
          setIsProcessModalOpen(true);
        }}
      />
    </div>
  );
};
