import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PayrollHeader } from '../components/payroll/PayrollHeader';
import { PayrollKpis } from '../components/payroll/PayrollKpis';
import { PayrollFilterCard } from '../components/payroll/PayrollFilterCard';
import { PayrollTable } from '../components/payroll/PayrollTable';
import { ProcessPayrollModal } from '../components/payroll/ProcessPayrollModal';
import { PayslipModal } from '../components/payroll/PayslipModal';
import { ToastNotification, useToast } from '../../../components/ui/ToastNotification';
import {
  PayrollRecord,
  PayrollKpiData,
  PayrollFilters,
  PayrollSortOption,
  PayrollFilterOptions,
  ProcessPayrollPayload,
} from '../types/payroll';
import { payrollService } from '../services/payrollService';

export const PayrollSalaryPage: React.FC = () => {
  // 1. Records and pagination (strictly dynamic from DB)
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Filters
  const defaultFilters: PayrollFilters = {
    search: '',
    payrollMonth: 'Oct 2026',
    employmentType: 'All',
    status: 'All',
    employee: 'All',
  };
  const [filters, setFilters] = useState<PayrollFilters>(defaultFilters);

  // 3. Filter options loaded strictly from database
  const [filterOptions, setFilterOptions] = useState<PayrollFilterOptions>({
    payrollMonths: [],
    employmentTypes: [],
    statuses: [],
    employees: [],
  });

  // 4. Sorting & Pagination
  const [sortOption, setSortOption] = useState<PayrollSortOption>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 5. KPIs (strictly loaded from database)
  const [kpiData, setKpiData] = useState<PayrollKpiData | null>(null);

  // 6. Modal states
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayslipRecord, setSelectedPayslipRecord] = useState<PayrollRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 7. Toast notifications
  const { toasts, addToast, removeToast } = useToast();

  // Active Filter Count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.payrollMonth !== 'Oct 2026' && filters.payrollMonth !== 'All') count++;
    if (filters.employmentType !== 'All') count++;
    if (filters.status !== 'All') count++;
    if (filters.employee !== 'All' && filters.employee !== 'All Employees') count++;
    return count;
  }, [filters]);

  // Fetch records from backend database with auto-retry
  const fetchRecords = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      const res = await payrollService.getPayrollRecords({
        search: filters.search,
        payrollMonth: filters.payrollMonth,
        employmentType: filters.employmentType,
        status: filters.status,
        employee: filters.employee,
        sort: sortOption,
        page: currentPage,
        size: pageSize,
      });

      setRecords(res.content || []);
      setFilteredCount(res.totalElements ?? 0);
      setTotalRecords((prev) => (res.totalElements && res.totalElements > prev ? res.totalElements : prev || res.totalElements || 0));
    } catch (err: any) {
      console.error('Error fetching payroll records from database:', err);
      if (retryCount < 2) {
        setTimeout(() => fetchRecords(retryCount + 1), 1500);
      } else {
        addToast(
          'error',
          'Database Connection Error',
          err.message || 'Could not fetch payroll records from database.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortOption, currentPage, pageSize, addToast]);

  // Fetch KPIs and filter options from database with auto-retry
  const fetchMetadata = useCallback(async (retryCount = 0) => {
    try {
      const [kpiRes, optionsRes] = await Promise.all([
        payrollService.getKpis(filters.payrollMonth),
        payrollService.getFilterOptions(),
      ]);

      if (kpiRes) {
        setKpiData(kpiRes);
        if (kpiRes.lastUpdated) {
          setLastUpdated(kpiRes.lastUpdated);
        }
      }
      if (optionsRes) {
        setFilterOptions(optionsRes);
      }
    } catch (err: any) {
      console.error('Error fetching payroll metadata from database:', err);
      if (retryCount < 2) {
        setTimeout(() => fetchMetadata(retryCount + 1), 1500);
      }
    }
  }, [filters.payrollMonth]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchRecords(), fetchMetadata()]);
    setIsRefreshing(false);
    addToast('success', 'Payroll Synced', 'Live payroll records refreshed from PostgreSQL database.');
  };

  // Handle Export
  const handleExport = async () => {
    try {
      await payrollService.exportPayrollCsv({
        search: filters.search,
        payrollMonth: filters.payrollMonth,
        employmentType: filters.employmentType,
        status: filters.status,
        employee: filters.employee,
        sort: sortOption,
      });
      addToast('success', 'Export Completed', 'Payroll report generated and downloaded from database.');
    } catch (err: any) {
      addToast('error', 'Export Failed', err.message || 'Failed to export payroll report.');
    }
  };

  // Handle Filter Change
  const handleFilterChange = <K extends keyof PayrollFilters>(key: K, value: PayrollFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle Clear Filters
  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
    addToast('info', 'Filters Reset', 'All payroll filter criteria have been reset.');
  };

  // Handle Process Payroll
  const handleProcessPayrollSubmit = async (payload: ProcessPayrollPayload) => {
    try {
      setIsSubmitting(true);
      const created = await payrollService.processPayroll(payload);
      addToast(
        'success',
        'Payroll Recorded in DB',
        `Disbursement saved for ${created.employeeName} (${created.payrollId}).`
      );
      await Promise.all([fetchRecords(), fetchMetadata()]);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle View Payslip
  const handleViewPayslip = (record: PayrollRecord) => {
    setSelectedPayslipRecord(record);
    setIsPayslipModalOpen(true);
  };

  // Handle Download Payslip
  const handleDownloadPayslip = (record: PayrollRecord) => {
    setSelectedPayslipRecord(record);
    setIsPayslipModalOpen(true);
  };

  // Handle Mark as Paid
  const handleMarkPaid = async (record: PayrollRecord) => {
    try {
      await payrollService.updatePayroll(record.payrollId, {
        paymentStatus: 'Paid',
        paymentDate: new Date().toISOString().slice(0, 10),
      });
      addToast('success', 'Database Updated', `${record.payrollId} marked as Paid in PostgreSQL.`);
      await Promise.all([fetchRecords(), fetchMetadata()]);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message || 'Could not update payment status in DB.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 w-full">
      {/* Toast Notifications Portal */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* 1. Header with Title, Timestamp, Sync, Export, and Process Payroll Button */}
      <PayrollHeader
        lastUpdated={lastUpdated || 'Syncing...'}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onProcessPayroll={() => setIsProcessModalOpen(true)}
        isRefreshing={isRefreshing}
      />

      {/* 2. Four Dynamic KPI Metric Cards */}
      <PayrollKpis kpiData={kpiData} isLoading={!kpiData} />

      {/* 3. Filter Bar Card */}
      <PayrollFilterCard
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* 4. Payroll Records Table */}
      <PayrollTable
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
        onViewPayslip={handleViewPayslip}
        onDownloadPayslip={handleDownloadPayslip}
        onMarkPaid={handleMarkPaid}
      />

      {/* 5. Process Payroll Modal */}
      <ProcessPayrollModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        onSubmit={handleProcessPayrollSubmit}
        filterOptions={filterOptions}
        isSubmitting={isSubmitting}
      />

      {/* 6. Payslip View & Print Modal */}
      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => {
          setIsPayslipModalOpen(false);
          setSelectedPayslipRecord(null);
        }}
        record={selectedPayslipRecord}
      />
    </div>
  );
};
