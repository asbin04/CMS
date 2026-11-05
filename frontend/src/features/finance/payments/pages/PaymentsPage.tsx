import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PaymentsHeader } from '../components/PaymentsHeader';
import { PaymentsKpiCards } from '../components/PaymentsKpiCards';
import { PaymentsFilterCard } from '../components/PaymentsFilterCard';
import { PaymentsTable } from '../components/PaymentsTable';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { PaymentDetailModal } from '../components/PaymentDetailModal';
import { paymentsService } from '../services/paymentsService';
import {
  FinancePaymentRecord,
  FinancePaymentKpiData,
  FinancePaymentFilterOptions,
  RecordPaymentPayload,
  UpdatePaymentPayload,
} from '../types/payments';

export const PaymentsPage: React.FC = () => {
  // State for data
  const [records, setRecords] = useState<FinancePaymentRecord[]>([]);
  const [kpis, setKpis] = useState<FinancePaymentKpiData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FinancePaymentFilterOptions>({
    modes: ['Bank Transfer', 'NEFT', 'UPI', 'Cheque', 'RTGS'],
    statuses: ['Matched', 'Pending', 'Partially Matched'],
    clients: [],
    months: [],
  });

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isKpiLoading, setIsKpiLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(128);
  const [filteredCount, setFilteredCount] = useState<number>(122);
  const [totalPages, setTotalPages] = useState<number>(13);

  // Filter states
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('All');
  const [mode, setMode] = useState<string>('All');
  const [client, setClient] = useState<string>('All');
  const [month, setMonth] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('Oct 01, 2026 - Oct 31, 2026');
  const [sort, setSort] = useState<string>('Payment Date (Newest)');

  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<FinancePaymentRecord | null>(null);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim() !== '') count++;
    if (status !== 'All') count++;
    if (mode !== 'All') count++;
    if (client !== 'All' && client !== 'All Clients') count++;
    if (month !== 'All') count++;
    if (dateRange && dateRange !== 'All' && dateRange !== 'Oct 01, 2026 - Oct 31, 2026') count++;
    return count;
  }, [search, status, mode, client, month, dateRange]);

  // Parse start/end dates from date range preset
  const { startDate, endDate } = useMemo(() => {
    if (dateRange === 'Oct 01, 2026 - Oct 31, 2026') {
      return { startDate: '2026-10-01', endDate: '2026-10-31' };
    } else if (dateRange === 'Sep 01, 2026 - Sep 30, 2026') {
      return { startDate: '2026-09-01', endDate: '2026-09-30' };
    }
    return { startDate: undefined, endDate: undefined };
  }, [dateRange]);

  // Fetch KPI data with auto-retry
  const loadKpis = useCallback(async (retryCount = 0) => {
    try {
      setIsKpiLoading(true);
      const targetMonth = month !== 'All' ? month : '2026-10';
      const data = await paymentsService.getKpis(targetMonth);
      setKpis(data);
    } catch (err) {
      console.error('Failed to load payment KPIs:', err);
      if (retryCount < 2) {
        setTimeout(() => loadKpis(retryCount + 1), 1500);
      }
    } finally {
      setIsKpiLoading(false);
    }
  }, [month]);

  // Fetch filter options with auto-retry
  const loadFilterOptions = useCallback(async (retryCount = 0) => {
    try {
      const data = await paymentsService.getFilterOptions();
      setFilterOptions((prev) => ({
        ...prev,
        ...data,
      }));
    } catch (err) {
      console.error('Failed to load filter options:', err);
      if (retryCount < 2) {
        setTimeout(() => loadFilterOptions(retryCount + 1), 1500);
      }
    }
  }, []);

  // Fetch Payment records with auto-retry
  const loadPayments = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      const res = await paymentsService.getPayments({
        search,
        startDate,
        endDate,
        status,
        mode,
        client,
        month,
        sort,
        page: currentPage,
        size: pageSize,
      });

      setRecords(res.content);
      setFilteredCount(res.totalElements);
      setTotalPages(res.totalPages || Math.ceil(res.totalElements / pageSize) || 1);
      if (kpis?.totalRecordCount) {
        setTotalRecords(kpis.totalRecordCount);
      } else {
        setTotalRecords(res.totalElements);
      }
    } catch (err) {
      console.error('Failed to load payment records:', err);
      if (retryCount < 2) {
        setTimeout(() => loadPayments(retryCount + 1), 1500);
      }
    } finally {
      setIsLoading(false);
    }
  }, [search, startDate, endDate, status, mode, client, month, sort, currentPage, pageSize, kpis?.totalRecordCount]);

  // Initial load
  useEffect(() => {
    loadKpis();
    loadFilterOptions();
  }, [loadKpis, loadFilterOptions]);

  // Load records when filter or pagination changes
  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Handle Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadKpis(), loadFilterOptions(), loadPayments()]);
    setIsRefreshing(false);
  };

  // Handle Clear Filters
  const handleClearFilters = () => {
    setSearch('');
    setStatus('All');
    setMode('All');
    setClient('All');
    setMonth('All');
    setDateRange('Oct 01, 2026 - Oct 31, 2026');
    setCurrentPage(1);
  };

  // Handle Export CSV
  const handleExport = async () => {
    try {
      const data = await paymentsService.exportPayments({
        search,
        startDate,
        endDate,
        status,
        mode,
        client,
        month,
      });

      if (!data || data.length === 0) {
        alert('No records available to export.');
        return;
      }

      // Convert to CSV
      const headers = ['Payment ID', 'Payment Date', 'Invoice ID', 'Client ID', 'Client Name', 'Amount (INR)', 'Invoice Amount (INR)', 'Payment Mode', 'Reference No', 'Status', 'Variance (INR)', 'Notes'];
      const rows = data.map((r) => [
        r.id,
        r.paymentDate,
        r.invoiceId,
        r.clientId,
        `"${r.clientName.replace(/"/g, '""')}"`,
        r.amount,
        r.invoiceAmount,
        r.mode,
        r.referenceNo,
        r.status,
        r.varianceAmount,
        `"${(r.notes || '-').replace(/"/g, '""')}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export payment records:', err);
    }
  };

  // Handle Record Payment
  const handleRecordPayment = async (payload: RecordPaymentPayload) => {
    await paymentsService.recordPayment(payload);
    await Promise.all([loadKpis(), loadPayments()]);
  };

  // Handle Update Payment
  const handleUpdatePayment = async (id: string, payload: UpdatePaymentPayload) => {
    await paymentsService.updatePayment(id, payload);
    await Promise.all([loadKpis(), loadPayments()]);
  };

  // Handle Select Record for Detail View
  const handleSelectRecord = (record: FinancePaymentRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header */}
      <PaymentsHeader
        lastUpdated={kpis?.lastUpdatedFormatted || '15 Oct 2026, 11:30 AM'}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onRecordPayment={() => setIsRecordModalOpen(true)}
      />

      {/* 2. Dynamic KPI Metric Cards */}
      <PaymentsKpiCards kpis={kpis} isLoading={isKpiLoading} />

      {/* 3. Filter Card */}
      <PaymentsFilterCard
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setCurrentPage(1);
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setCurrentPage(1);
        }}
        mode={mode}
        onModeChange={(v) => {
          setMode(v);
          setCurrentPage(1);
        }}
        client={client}
        onClientChange={(v) => {
          setClient(v);
          setCurrentPage(1);
        }}
        month={month}
        onMonthChange={(v) => {
          setMonth(v);
          setCurrentPage(1);
        }}
        dateRange={dateRange}
        onDateRangeChange={(v) => {
          setDateRange(v);
          setCurrentPage(1);
        }}
        filterOptions={filterOptions}
        activeFilterCount={activeFilterCount}
        onClearFilters={handleClearFilters}
      />

      {/* 4. Payments Table */}
      <PaymentsTable
        records={records}
        isLoading={isLoading}
        totalRecords={totalRecords}
        filteredCount={filteredCount}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
        sort={sort}
        onSortChange={(s) => setSort(s)}
        onSelectRecord={handleSelectRecord}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSubmit={handleRecordPayment}
        clients={filterOptions.clients || []}
      />

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        payment={selectedRecord}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRecord(null);
        }}
        onUpdate={handleUpdatePayment}
      />
    </div>
  );
};

export default PaymentsPage;

