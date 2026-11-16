import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Proposal, ProposalFilters, ProposalSortOption, ProposalStatus, ProposalKpiSummary } from '../types';
import { proposalsApiService } from '../services/proposalsApiService';
import { ProposalsHeader } from '../components/ProposalsHeader';
import { ProposalsKpiCards } from '../components/ProposalsKpiCards';
import { ProposalsFilterCard } from '../components/ProposalsFilterCard';
import { ProposalsTable } from '../components/ProposalsTable';
import { CreateProposalModal } from '../components/CreateProposalModal';
import { ProposalDetailsModal } from '../components/ProposalDetailsModal';
import { ToastNotification, useToast } from '../../../components/ui/ToastNotification';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';

export const ProposalsPage: React.FC = () => {
  // 1. Proposals data states
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [allFilteredProposals, setAllFilteredProposals] = useState<Proposal[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState('—');
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
  const [isKpiLoading, setIsKpiLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Dynamic KPI summary state (starts null to show skeletons / real data)
  const [kpiSummary, setKpiSummary] = useState<ProposalKpiSummary | null>(null);

  // 3. Filter options
  const [ownerOptions, setOwnerOptions] = useState<string[]>(['All']);
  const [clientOptions, setClientOptions] = useState<string[]>(['All']);
  const [opportunityOptions, setOpportunityOptions] = useState<string[]>(['All']);
  const [serviceOptions, setServiceOptions] = useState<string[]>(['All']);

  // 4. Filter states
  const defaultFilters: ProposalFilters = {
    search: '',
    status: 'All',
    ownerId: 'All',
    clientId: 'All',
    opportunityId: 'All',
    serviceId: 'All',
    proposalDateRange: '',
    validUntilRange: '',
    expectedDecisionDateRange: '',
  };

  const [filters, setFilters] = useState<ProposalFilters>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(filters.search);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // AbortController ref to cancel stale requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // 5. Sorting & Pagination states
  const [sortOption, setSortOption] = useState<ProposalSortOption>('date-newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 6. Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [nextProposalId, setNextProposalId] = useState<string>('');

  // 7. Designer Toast Notifications
  const { toasts, addToast, removeToast } = useToast();

  const updateTimestamp = () => {
    const now = new Date();
    setLastUpdated(
      `${now.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    );
  };

  // Load filter options and next ID on mount
  const loadMetadata = useCallback(async () => {
    try {
      const [opts, nextId] = await Promise.all([
        proposalsApiService.getFilterOptions(),
        proposalsApiService.getNextProposalId(),
      ]);
      setOwnerOptions(opts.owners);
      setClientOptions(opts.clients);
      setOpportunityOptions(opts.opportunities);
      setServiceOptions(opts.services);
      setNextProposalId(nextId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load filter metadata.';
      setError(msg);
    }
  }, []);

  // Dedicated KPI loader so filter resets and table filtering do not flash or refresh KPI cards
  const loadKpis = useCallback(async () => {
    setIsKpiLoading(true);
    try {
      const kpis = await proposalsApiService.getKpis();
      setKpiSummary(kpis);
    } catch (err: unknown) {
      console.warn('Failed to load proposal KPIs:', err);
    } finally {
      setIsKpiLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetadata();
    loadKpis();
  }, [loadMetadata, loadKpis]);

  // Primary data query function through dedicated service layer
  const loadProposals = useCallback(async (signal?: AbortSignal) => {
    setIsTableLoading(true);
    setError(null);
    try {
      const [pageRes, kpis] = await Promise.all([
        proposalsApiService.getProposals({
          search: debouncedSearch,
          status: filters.status,
          ownerId: filters.ownerId,
          clientId: filters.clientId,
          opportunityId: filters.opportunityId,
          serviceId: filters.serviceId,
          proposalDateRange: filters.proposalDateRange,
          validUntilRange: filters.validUntilRange,
          expectedDecisionDateRange: filters.expectedDecisionDateRange,
          sortOption,
          page: currentPage,
          size: pageSize,
        }),
        proposalsApiService.getKpis(),
      ]);

      if (signal?.aborted) return;

      setProposals(pageRes.content);
      setTotalCount(pageRes.totalElements);
      setKpiSummary(kpis);
      updateTimestamp();
    } catch (err: unknown) {
      if (signal?.aborted) return;
      const msg = err instanceof Error ? err.message : 'Failed to fetch proposals.';
      setError(msg);
    } finally {
      if (!signal?.aborted) {
        setIsTableLoading(false);
      }
    }
  }, [
    debouncedSearch,
    filters.status,
    filters.ownerId,
    filters.clientId,
    filters.opportunityId,
    filters.serviceId,
    filters.proposalDateRange,
    filters.validUntilRange,
    filters.expectedDecisionDateRange,
    sortOption,
    currentPage,
    pageSize,
  ]);

  // Reactive effect when filters, sorting, or pagination change with AbortController
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    loadProposals(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadProposals]);

  // Handle filter changes
  const handleFilterChange = (key: keyof ProposalFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setSortOption('date-newest');
    setCurrentPage(1);
    addToast('info', 'Filters Cleared', 'Reset to display all proposals.');
  };

  // Handle Export to CSV: Only fetch all filtered data when export is clicked
  const handleExport = async () => {
    try {
      addToast('info', 'Preparing Export', 'Fetching matching proposals for export...');
      const allFiltered = await proposalsApiService.getAllFilteredProposals({
        search: debouncedSearch,
        status: filters.status,
        ownerId: filters.ownerId,
        clientId: filters.clientId,
        opportunityId: filters.opportunityId,
        serviceId: filters.serviceId,
        proposalDateRange: filters.proposalDateRange,
        validUntilRange: filters.validUntilRange,
        expectedDecisionDateRange: filters.expectedDecisionDateRange,
        sortOption,
      });

      const dataToExport = allFiltered && allFiltered.length > 0 ? allFiltered : proposals;
      setAllFilteredProposals(dataToExport);
      proposalsApiService.exportToCsv(dataToExport);
      addToast('success', 'Export Completed', `Exported ${dataToExport.length} proposals to CSV.`);
    } catch {
      // Fallback to currently loaded page
      proposalsApiService.exportToCsv(proposals);
      addToast('success', 'Export Completed', `Exported ${proposals.length} proposals to CSV.`);
    }
  };

  const handleEditProposal = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setIsCreateModalOpen(true);
  };

  // Handle Save (Create or Update) Proposal with validation & persistence
  const handleSaveProposal = async (savedProposal: Proposal) => {
    if (editingProposal) {
      // Edit mode (PUT)
      const previousProposals = [...proposals];
      const previousFiltered = [...allFilteredProposals];

      setProposals((prev) =>
        prev.map((p) => (p.proposalId === savedProposal.proposalId ? savedProposal : p))
      );
      setAllFilteredProposals((prev) =>
        prev.map((p) => (p.proposalId === savedProposal.proposalId ? savedProposal : p))
      );

      try {
        const res = await proposalsApiService.updateProposal(savedProposal.proposalId, {
          opportunityId: savedProposal.opportunityId,
          clientId: savedProposal.clientId,
          clientName: savedProposal.clientName,
          proposalDate: savedProposal.proposalDate,
          validUntil: savedProposal.validUntil,
          version: savedProposal.version,
          title: savedProposal.title,
          serviceId: savedProposal.serviceId,
          serviceName: savedProposal.serviceName,
          serviceBeforeTax: savedProposal.serviceBeforeTax,
          taxAmount: savedProposal.taxAmount,
          totalAmount: savedProposal.totalAmount,
          ownerId: savedProposal.ownerId,
          ownerName: savedProposal.ownerName,
          status: savedProposal.status,
          expectedDecisionDate: savedProposal.expectedDecisionDate,
          description: savedProposal.description,
        });

        addToast('success', 'Proposal Updated', `${res.title} (${res.proposalId})`, res.status);
        setIsCreateModalOpen(false);
        setEditingProposal(null);
        await loadProposals();
        const freshKpis = await proposalsApiService.getKpis();
        setKpiSummary(freshKpis);
      } catch (err: unknown) {
        setProposals(previousProposals);
        setAllFilteredProposals(previousFiltered);
        const msg = err instanceof Error ? err.message : 'Could not update proposal.';
        addToast('error', 'Update Failed', msg);
      }
    } else {
      // Create mode (POST)
      await handleCreateProposal(savedProposal);
    }
  };

  // Handle Create Proposal with validation & persistence
  const handleCreateProposal = async (newProposal: Proposal) => {
    try {
      await proposalsApiService.createProposal({
        proposalId: newProposal.proposalId,
        opportunityId: newProposal.opportunityId,
        clientId: newProposal.clientId,
        clientName: newProposal.clientName,
        proposalDate: newProposal.proposalDate,
        validUntil: newProposal.validUntil,
        version: newProposal.version,
        title: newProposal.title,
        serviceId: newProposal.serviceId,
        serviceName: newProposal.serviceName,
        serviceBeforeTax: newProposal.serviceBeforeTax,
        taxAmount: newProposal.taxAmount,
        totalAmount: newProposal.totalAmount,
        ownerId: newProposal.ownerId,
        ownerName: newProposal.ownerName,
        status: newProposal.status,
        expectedDecisionDate: newProposal.expectedDecisionDate,
        description: newProposal.description,
      });

      addToast(
        'success',
        'Proposal Created',
        `${newProposal.title} (${newProposal.proposalId})`,
        newProposal.status
      );

      setIsCreateModalOpen(false);
      await Promise.all([loadProposals(), loadKpis(), loadMetadata()]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not create proposal.';
      addToast('error', 'Creation Failed', msg);
    }
  };

  // Handle Refresh
  const handleRefresh = async () => {
    await Promise.all([loadProposals(), loadKpis(), loadMetadata()]);
    addToast('success', 'Data Refreshed', 'Proposal records synchronized and updated.');
  };

  // Handle Status Update with optimistic rollback
  const handleUpdateStatus = async (proposalId: string, newStatus: ProposalStatus) => {
    const previousProposals = [...proposals];
    const previousFiltered = [...allFilteredProposals];
    const previousSelected = selectedProposal;
    const previousKpis = kpiSummary;

    // Optimistically update
    setProposals((prev) =>
      prev.map((p) => (p.proposalId === proposalId ? { ...p, status: newStatus } : p))
    );
    setAllFilteredProposals((prev) =>
      prev.map((p) => (p.proposalId === proposalId ? { ...p, status: newStatus } : p))
    );
    setSelectedProposal((prev) =>
      prev && prev.proposalId === proposalId ? { ...prev, status: newStatus } : prev
    );

    try {
      const updated = await proposalsApiService.updateStatus(proposalId, newStatus);
      const freshKpis = await proposalsApiService.getKpis();
      setKpiSummary(freshKpis);

      const isErr = newStatus === 'Rejected';
      const isSuccess = newStatus === 'Approved';
      const isWarning = newStatus === 'Pending';
      const toastType = isErr ? 'error' : isSuccess ? 'success' : isWarning ? 'warning' : 'info';
      const toastTitle = isErr ? 'Request Rejected' : isSuccess ? 'Request Approved' : 'Status Updated';

      addToast(
        toastType,
        toastTitle,
        `${updated.title} (${proposalId})`,
        newStatus
      );
    } catch (err: unknown) {
      // Rollback on failure
      setProposals(previousProposals);
      setAllFilteredProposals(previousFiltered);
      setSelectedProposal(previousSelected);
      setKpiSummary(previousKpis);

      const msg = err instanceof Error ? err.message : 'Failed to update proposal status.';
      addToast('error', 'Status Update Failed', msg);
    }
  };

  // Handle Delete Proposal with optimistic rollback
  const handleDeleteProposal = async (proposalId: string) => {
    const previousProposals = [...proposals];
    const previousFiltered = [...allFilteredProposals];
    const previousTotal = totalCount;

    setProposals((prev) => prev.filter((p) => p.proposalId !== proposalId));
    setAllFilteredProposals((prev) => prev.filter((p) => p.proposalId !== proposalId));
    setTotalCount((prev) => Math.max(0, prev - 1));

    try {
      await proposalsApiService.deleteProposal(proposalId);
      addToast('success', 'Proposal Deleted', `Proposal ${proposalId} removed successfully.`);
      setIsDetailsModalOpen(false);
      setSelectedProposal(null);
      const freshKpis = await proposalsApiService.getKpis();
      setKpiSummary(freshKpis);
      loadMetadata();
    } catch (err: unknown) {
      setProposals(previousProposals);
      setAllFilteredProposals(previousFiltered);
      setTotalCount(previousTotal);

      const msg = err instanceof Error ? err.message : 'Failed to delete proposal.';
      addToast('error', 'Delete Failed', msg);
    }
  };

  const handleViewDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1850px] mx-auto min-h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top-Right Designer Toast Notification Popup */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} position="top-right" />

      {/* 1. Page Header */}
      <ProposalsHeader
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        onCreateProposal={() => {
          setEditingProposal(null);
          setIsCreateModalOpen(true);
        }}
      />

      {/* Error Banner when initial query or load fails */}
      {error && !isTableLoading && (
        <div className="mb-6">
          <ErrorBanner
            title="Failed to Load Proposals"
            message={error}
            onRetry={loadProposals}
          />
        </div>
      )}

      {/* 2. Four KPI Cards */}
      <ProposalsKpiCards summary={kpiSummary} isLoading={isKpiLoading} />

      {/* Main Unified Proposals Container: Filters + Header + Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col w-full">
        {/* Search and Filter Panel */}
        <ProposalsFilterCard
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          ownerOptions={ownerOptions}
          clientOptions={clientOptions}
          opportunityOptions={opportunityOptions}
          serviceOptions={serviceOptions}
        />

        {/* Proposals Table with Horizontal Overflow and Pagination */}
        <ProposalsTable
          proposals={proposals}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          onExport={handleExport}
          onViewDetails={handleViewDetails}
          onEditProposal={handleEditProposal}
          onDeleteProposal={handleDeleteProposal}
          onUpdateStatus={handleUpdateStatus}
          isLoading={isTableLoading}
          error={error}
          onRetry={loadProposals}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* 5. Create / Edit Proposal Modal */}
      <CreateProposalModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProposal(null);
        }}
        onSave={handleSaveProposal}
        nextId={nextProposalId}
        initialProposal={editingProposal}
      />

      {/* 6. Proposal Details Modal */}
      <ProposalDetailsModal
        isOpen={isDetailsModalOpen}
        proposal={selectedProposal}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProposal(null);
        }}
        onEdit={(proposal: Proposal) => {
          setIsDetailsModalOpen(false);
          handleEditProposal(proposal);
        }}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteProposal}
      />
    </div>
  );
};
