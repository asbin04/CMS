import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { InvoicesHeader } from '../components/InvoicesHeader';
import { InvoicesKpiCards } from '../components/InvoicesKpiCards';
import { InvoicesFilterCard } from '../components/InvoicesFilterCard';
import { InvoicesTable } from '../components/InvoicesTable';
import { CreateInvoiceModal } from '../components/CreateInvoiceModal';
import { ViewInvoiceModal } from '../components/ViewInvoiceModal';
import { EditInvoiceModal } from '../components/EditInvoiceModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { InvoiceFilters, InvoiceSortOption, InvoiceRecord, InvoiceKpiSummary } from '../types';
import { exportInvoicesToCsv, parseInvoiceDateFilter } from '../utils';
import {
  invoicesApiService,
  mapSortOptionToBackend,
  InvoicesQueryParams,
} from '../invoicesApiService';

export const InvoicesPage: React.FC = () => {
  // Read URL query parameters for Collections -> Invoices navigation
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFilter = searchParams.get('filter'); // 'overdue' | 'due-soon' | null

  // Live Invoice Records & Server Pagination State
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Live KPI Summary State
  const [kpis, setKpis] = useState<InvoiceKpiSummary>({
    totalInvoices: 0,
    totalInvoicesTrend: 12.5,
    totalInvoiceValue: 0,
    totalInvoiceValueTrend: 8.2,
    paidAmount: 0,
    paidAmountTrend: 14.1,
    outstandingAmount: 0,
    outstandingAmountTrend: -5.4,
  });

  // Filters State
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    invoiceDate: 'All',
    client: 'All Clients',
    project: 'All Projects',
    status: 'All',
    collectionStatus: 'All',
    preset: (urlFilter === 'overdue' || urlFilter === 'due-soon') ? urlFilter : null,
    dueDate: '',
    paymentTerms: 'All',
    agingBucket: 'All',
    outstandingOnly: false,
    minAmount: '',
    maxAmount: '',
  });

  // Debounced search term (300ms) to avoid request flooding
  const [debouncedSearch, setDebouncedSearch] = useState<string>(filters.search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // Synchronize URL search parameters with filter preset
  useEffect(() => {
    if (urlFilter === 'overdue') {
      setFilters((prev) => ({
        ...prev,
        preset: 'overdue',
      }));
      setCurrentPage(1);
    } else if (urlFilter === 'due-soon') {
      setFilters((prev) => ({
        ...prev,
        preset: 'due-soon',
      }));
      setCurrentPage(1);
    } else if (!urlFilter) {
      setFilters((prev) => {
        if (prev.preset) {
          return { ...prev, preset: null };
        }
        return prev;
      });
    }

    if (searchParams.get('create') === 'true' || searchParams.get('modal') === 'create') {
      setIsCreateOpen(true);
    }
  }, [urlFilter, searchParams]);

  // Sorting and Pagination State
  const [sortOption, setSortOption] = useState<InvoiceSortOption>('Invoice Date (Newest)');
  const [currentPage, setCurrentPage] = useState<number>(1); // 1-based in UI
  const [pageSize, setPageSize] = useState<number>(10);
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    const now = new Date();
    return (
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    );
  });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceRecord | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceRecord | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<InvoiceRecord | null>(null);
  const [nextSuggestedId, setNextSuggestedId] = useState<string>('INV-2026-001');

  // Available unique clients & projects for dropdown options
  const [availableClients, setAvailableClients] = useState<string[]>([
    'CL-001', 'CL-002', 'CL-003', 'CL-004', 'CL-005', 'CL-006', 'CL-007', 'CL-008'
  ]);
  const [availableProjects, setAvailableProjects] = useState<string[]>([
    'PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005', 'PRJ-006'
  ]);

  // Fetch Live KPI Data
  const fetchKpis = useCallback(async () => {
    try {
      const liveKpis = await invoicesApiService.getKpis();
      setKpis(liveKpis);
    } catch {
      // Retain existing values if error occurs
    }
  }, []);

  // Fetch Next Suggested Atomic Invoice ID
  const fetchNextId = useCallback(async () => {
    try {
      const res = await invoicesApiService.getNextInvoiceId();
      if (res?.nextInvoiceId) {
        setNextSuggestedId(res.nextInvoiceId);
      }
    } catch {
      // Fallback
    }
  }, []);

  // Fetch Live Paginated & Filtered Invoices from Backend
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { sortField, sortOrder } = mapSortOptionToBackend(sortOption);

      const params: InvoicesQueryParams = {
        page: currentPage - 1, // Frontend 1-based maps to backend 0-based
        size: pageSize,
        sortField,
        sortOrder,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (filters.client && filters.client !== 'All Clients') {
        params.client = filters.client;
      }

      if (filters.project && filters.project !== 'All Projects') {
        params.project = filters.project;
      }

      if (filters.status && filters.status !== 'All') {
        params.invoiceStatus = filters.status;
      }

      if (filters.collectionStatus && filters.collectionStatus !== 'All') {
        params.collectionStatus = filters.collectionStatus;
      }

      if (filters.agingBucket && filters.agingBucket !== 'All') {
        params.ageing = filters.agingBucket;
      }

      // Handle Invoice Date Filter
      const dateRange = parseInvoiceDateFilter(filters.invoiceDate);
      if (dateRange) {
        params.invoiceDateFrom = dateRange.invoiceDateFrom;
        params.invoiceDateTo = dateRange.invoiceDateTo;
      }

      // Handle Preset from Collections Navigation
      if (filters.preset === 'overdue' || filters.preset === 'due-soon') {
        params.preset = filters.preset;
        params.filter = filters.preset;
      }

      const pageRes = await invoicesApiService.getInvoices(params);

      setInvoices(pageRes.content);
      setTotalRecords(pageRes.totalElements);
      setTotalPages(pageRes.totalPages || 1);

      // Extract unique clients/projects if available
      const clientSet = new Set(availableClients);
      const projectSet = new Set(availableProjects);
      pageRes.content.forEach((inv) => {
        if (inv.clientId) clientSet.add(inv.clientId);
        if (inv.projectId) projectSet.add(inv.projectId);
      });
      setAvailableClients(Array.from(clientSet).sort());
      setAvailableProjects(Array.from(projectSet).sort());
    } catch (err: any) {
      setError(err.message || 'Failed to connect to invoice backend server. Please verify network or API.');
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    sortOption,
    debouncedSearch,
    filters.client,
    filters.project,
    filters.invoiceDate,
    filters.status,
    filters.collectionStatus,
    filters.agingBucket,
    filters.preset,
  ]);

  // Initial load and dependency-driven fetch
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    fetchKpis();
    fetchNextId();
  }, [fetchKpis, fetchNextId]);

  // Active Filters Count (Preset adds 1 to active count)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.preset) count++;
    if (filters.search.trim()) count++;
    if (filters.invoiceDate && filters.invoiceDate !== 'All' && filters.invoiceDate !== 'All Dates') count++;
    if (filters.client && filters.client !== 'All Clients') count++;
    if (filters.project && filters.project !== 'All Projects') count++;
    if (filters.status && filters.status !== 'All') count++;
    if (filters.collectionStatus && filters.collectionStatus !== 'All') count++;
    if (filters.dueDate) count++;
    if (filters.paymentTerms && filters.paymentTerms !== 'All') count++;
    if (filters.agingBucket && filters.agingBucket !== 'All') count++;
    if (filters.outstandingOnly) count++;
    if (filters.minAmount || filters.maxAmount) count++;
    return count;
  }, [filters]);

  // Handlers
  const handleFilterChange = (updated: Partial<InvoiceFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleClearFilters = () => {
    // Clear URL search parameters if any were set
    if (searchParams.get('filter')) {
      setSearchParams({});
    }
    setFilters({
      search: '',
      invoiceDate: 'All',
      client: 'All Clients',
      project: 'All Projects',
      status: 'All',
      collectionStatus: 'All',
      preset: null,
      dueDate: '',
      paymentTerms: 'All',
      agingBucket: 'All',
      outstandingOnly: false,
      minAmount: '',
      maxAmount: '',
    });
    setCurrentPage(1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchInvoices(), fetchKpis(), fetchNextId()]);
      const now = new Date();
      const timeStr =
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setLastUpdated(timeStr);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    exportInvoicesToCsv(invoices, 'invoices_records');
  };

  // CRUD & Modal Post-Action Handlers
  const handleSaveNewInvoice = async () => {
    await Promise.all([fetchInvoices(), fetchKpis(), fetchNextId()]);
    setCurrentPage(1);
  };

  const handleSaveEditedInvoice = async (updatedRecord: InvoiceRecord) => {
    await Promise.all([fetchInvoices(), fetchKpis()]);
    if (viewingInvoice && viewingInvoice.invoiceId === updatedRecord.invoiceId) {
      setViewingInvoice(updatedRecord);
    }
  };

  const handleDeleteInvoice = async () => {
    await Promise.all([fetchInvoices(), fetchKpis()]);
    setDeletingInvoice(null);
    if (viewingInvoice) {
      setViewingInvoice(null);
    }
  };

  const handleInvoiceUpdated = async (updatedInvoice: InvoiceRecord) => {
    await Promise.all([fetchInvoices(), fetchKpis()]);
    setViewingInvoice(updatedInvoice);
  };

  return (
    <div
      className="w-full min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Error notification banner if API connection fails */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Phase 3: Page Header */}
        <InvoicesHeader
          onRefresh={handleRefresh}
          onExport={handleExport}
          onCreateInvoice={() => setIsCreateOpen(true)}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
        />

        {/* Phase 4: Dynamic Live KPI Cards */}
        <InvoicesKpiCards kpis={kpis} />

        {/* Phase 5: Search and Filter Section */}
        <InvoicesFilterCard
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          activeFilterCount={activeFilterCount}
          availableClients={availableClients}
          availableProjects={availableProjects}
        />

        {/* Phase 6: Invoice Records Table */}
        <InvoicesTable
          records={invoices}
          totalRecords={totalRecords}
          currentPage={currentPage}
          pageSize={pageSize}
          sortOption={sortOption}
          isLoading={isLoading}
          onSortChange={(opt) => {
            setSortOption(opt);
            setCurrentPage(1);
          }}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          onViewRecord={(record) => setViewingInvoice(record)}
          onEditRecord={(record) => setEditingInvoice(record)}
          onDeleteRecord={(record) => setDeletingInvoice(record)}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Phase 7: Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveNewInvoice}
        suggestedId={nextSuggestedId}
      />

      {/* Phase 8: View Invoice Modal */}
      <ViewInvoiceModal
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
        onEdit={(inv) => setEditingInvoice(inv)}
        onInvoiceUpdated={handleInvoiceUpdated}
      />

      {/* Phase 8: Edit Invoice Modal */}
      <EditInvoiceModal
        isOpen={Boolean(editingInvoice)}
        onClose={() => setEditingInvoice(null)}
        invoice={editingInvoice}
        onSave={handleSaveEditedInvoice}
      />

      {/* Phase 10: Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingInvoice)}
        onClose={() => setDeletingInvoice(null)}
        invoice={deletingInvoice}
        onConfirm={handleDeleteInvoice}
      />
    </div>
  );
};
