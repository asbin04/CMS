import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FileCheck, Plus, RotateCcw } from 'lucide-react';
import { ReloadButton } from '@/components/ui/ReloadButton';
import { ContractData, ContractSummaryData, CreateContractPayload } from '@/types/contract';
import { contractService } from '@/services/contractService';
import { masterDataService, MasterClient } from '@/services/masterDataService';
import { ContractsMetricCards } from '../components/ContractsMetricCards';
import { ContractsFilterBar } from '../components/ContractsFilterBar';
import { ContractsTable } from '../components/ContractsTable';
import { AddContractModal } from '../components/AddContractModal';
import { ContractDetailModal } from '../components/ContractDetailModal';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

const formatCurrency = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '₹ 0';
  if (typeof val === 'string' && val.includes('₹')) return val;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return '₹ 0';
  return '₹ ' + num.toLocaleString('en-IN');
};

const renderStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || '';
  let bg = '#F1F5F9';
  let color = '#475569';
  let border = '#CBD5E1';

  if (s === 'active') {
    bg = '#F0FDF4';
    color = '#16A34A';
    border = '#BBF7D0';
  } else if (s === 'expiring') {
    bg = '#FFFBEB';
    color = '#D97706';
    border = '#FDE68A';
  } else if (s === 'pending') {
    bg = '#EFF6FF';
    color = '#2563EB';
    border = '#BFDBFE';
  } else if (s === 'terminated' || s === 'expired') {
    bg = '#FFF1F2';
    color = '#BE123C';
    border = '#FECDD3';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 500,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
};

export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [summary, setSummary] = useState<ContractSummaryData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Master Data
  const [clients, setClients] = useState<MasterClient[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters & Search controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('All');
  const [selectedProposal, setSelectedProposal] = useState('All');
  const [selectedContractType, setSelectedContractType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [renewalDateFilter, setRenewalDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('Start Date (Newest)');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Fetch master data
  useEffect(() => {
    masterDataService.getClients().then(setClients).catch(() => {});
  }, []);

  // Fetch contracts and summary from backend
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [items, summaryData] = await Promise.all([
        contractService.getContracts(),
        contractService.getSummary(),
      ]);
      setContracts(items || []);
      setSummary(summaryData);
      const now = new Date();
      setLastUpdated(
        `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load contracts from database.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedClient('All');
    setSelectedProposal('All');
    setSelectedContractType('All');
    setSelectedStatus('All');
    setStartDateFilter('');
    setEndDateFilter('');
    setRenewalDateFilter('');
    setCurrentPage(1);
  };

  // Distinct options derived from contracts
  const proposalOptions = useMemo(() => {
    const set = new Set(contracts.map((c) => c.proposalId).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [contracts]);

  const contractTypeOptions = useMemo(() => {
    const set = new Set(contracts.map((c) => c.contractType).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [contracts]);

  // Filtered & Sorted contracts
  const filteredContracts = useMemo(() => {
    return contracts
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            (item.contractId && item.contractId.toLowerCase().includes(q)) ||
            (item.clientId && item.clientId.toLowerCase().includes(q)) ||
            (item.proposalId && item.proposalId.toLowerCase().includes(q)) ||
            (item.contractType && item.contractType.toLowerCase().includes(q));
          if (!matches) return false;
        }

        if (selectedClient !== 'All' && item.clientId !== selectedClient) return false;
        if (selectedProposal !== 'All' && item.proposalId !== selectedProposal) return false;
        if (selectedContractType !== 'All' && item.contractType !== selectedContractType) return false;
        if (selectedStatus !== 'All' && item.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;

        if (startDateFilter.trim()) {
          if (!item.startDate.toLowerCase().includes(startDateFilter.toLowerCase())) return false;
        }
        if (endDateFilter.trim()) {
          if (!item.endDate.toLowerCase().includes(endDateFilter.toLowerCase())) return false;
        }
        if (renewalDateFilter.trim()) {
          if (!item.renewalDate.toLowerCase().includes(renewalDateFilter.toLowerCase())) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Start Date (Newest)') {
          return new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime() || b.id - a.id;
        }
        if (sortBy === 'Start Date (Oldest)') {
          return new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime() || a.id - b.id;
        }
        if (sortBy === 'Contract Value (High to Low)') {
          return (b.contractValue || 0) - (a.contractValue || 0);
        }
        if (sortBy === 'Contract Value (Low to High)') {
          return (a.contractValue || 0) - (b.contractValue || 0);
        }
        if (sortBy === 'End Date (Nearest)') {
          return new Date(a.endDate || '').getTime() - new Date(b.endDate || '').getTime();
        }
        return 0;
      });
  }, [
    contracts,
    searchQuery,
    selectedClient,
    selectedProposal,
    selectedContractType,
    selectedStatus,
    startDateFilter,
    endDateFilter,
    renewalDateFilter,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedContracts = useMemo(() => {
    return filteredContracts.slice(startIndex, startIndex + pageSize);
  }, [filteredContracts, startIndex, pageSize]);

  // Export CSV
  const handleExport = () => {
    const headers = [
      'CONTRACT ID',
      'CLIENT ID',
      'PROPOSAL ID',
      'CONTRACT TYPE',
      'START DATE',
      'END DATE',
      'RENEWAL DATE',
      'CONTRACT VALUE',
      'NOTICE PERIOD (DAYS)',
      'PAYMENT TERMS',
      'STATUS',
    ];
    const escapeCsv = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = filteredContracts.map((c) => [
      escapeCsv(c.contractId),
      escapeCsv(c.clientId),
      escapeCsv(c.proposalId),
      escapeCsv(c.contractType),
      escapeCsv(c.startDate),
      escapeCsv(c.endDate),
      escapeCsv(c.renewalDate),
      escapeCsv(c.contractValue),
      escapeCsv(c.noticePeriod ?? 30),
      escapeCsv(c.paymentTerms || 'Monthly'),
      escapeCsv(c.status),
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contracts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Create contract
  const handleCreateContract = async (payload: CreateContractPayload) => {
    try {
      const created = await contractService.createContract(payload);
      setContracts((prev) => [created, ...prev]);
      setToastMessage({ type: 'success', text: 'Contract created successfully' });
      setIsAddModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create contract on server';
      setToastMessage({ type: 'error', text: msg });
    }
  };

  // Update contract with rollback on failure
  const handleUpdateContract = async (id: number, data: Partial<ContractData>) => {
    const previous = [...contracts];
    setContracts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    try {
      const updated = await contractService.updateContract(id, data as any);
      setContracts((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setToastMessage({ type: 'success', text: 'Contract updated successfully' });
    } catch (err: unknown) {
      setContracts(previous);
      const msg = err instanceof Error ? err.message : 'Failed to update contract';
      setToastMessage({ type: 'error', text: msg });
    }
  };

  // Delete contract with rollback on failure
  const handleDeleteContract = async (id: number) => {
    const previous = [...contracts];
    setContracts((prev) => prev.filter((item) => item.id !== id));
    try {
      await contractService.deleteContract(id);
      setToastMessage({ type: 'success', text: 'Contract deleted successfully' });
      if (selectedContract?.id === id) {
        setIsDetailModalOpen(false);
      }
    } catch (err: unknown) {
      setContracts(previous);
      const msg = err instanceof Error ? err.message : 'Failed to delete contract';
      setToastMessage({ type: 'error', text: msg });
    }
  };

  // Reset Data (Dev Profile Only)
  const handleResetData = async () => {
    if (!import.meta.env.DEV) return;
    try {
      await contractService.resetSeedData();
      await fetchData();
      setToastMessage({ type: 'success', text: 'Contracts reset to default seed data' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset contracts';
      setToastMessage({ type: 'error', text: msg });
    }
  };

  const handleViewDetails = (c: ContractData) => {
    setSelectedContract(c);
    setIsDetailModalOpen(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px',
        gap: '24px',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 16px',
            backgroundColor: toastMessage.type === 'error' ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${toastMessage.type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
            borderRadius: '8px',
            color: toastMessage.type === 'error' ? '#991B1B' : '#166534',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        >
          {toastMessage.text}
          <button
            onClick={() => setToastMessage(null)}
            style={{ marginLeft: '12px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #D1FAE5',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: '12px',
              flexShrink: 0,
            }}
          >
            <FileCheck size={24} color="#059669" strokeWidth={2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '33px',
                color: '#0F172A',
                margin: 0,
              }}
            >
              Contracts
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#64748B',
                margin: 0,
              }}
            >
              Manage client contracts, track contract terms and validity, and monitor renewals.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          <ReloadButton
            onClick={handleRefresh}
            isRefreshing={isRefreshing}
            title="Refresh Data"
          />

          {/* Reset button only in DEV */}
          {import.meta.env.DEV && (
            <button
              onClick={handleResetData}
              title="Reset Contracts Seed Data"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                height: '32px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#64748B',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              <RotateCcw style={{ width: '14px', height: '14px' }} />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '8px 16px',
              gap: '8px',
              height: '34px',
              backgroundColor: '#4F46E5',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              color: '#FFFFFF',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '16px',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2} />
            <span>Create Contract</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <ErrorBanner
          title="Failed to load contracts"
          message={error}
          onRetry={fetchData}
          isRetrying={isLoading}
        />
      )}

      {/* Metric Cards */}
      <ContractsMetricCards summary={summary} isLoading={isLoading} />

      {/* Filters Bar */}
      <ContractsFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        selectedProposal={selectedProposal}
        setSelectedProposal={setSelectedProposal}
        selectedContractType={selectedContractType}
        setSelectedContractType={setSelectedContractType}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        startDateFilter={startDateFilter}
        setStartDateFilter={setStartDateFilter}
        endDateFilter={endDateFilter}
        setEndDateFilter={setEndDateFilter}
        renewalDateFilter={renewalDateFilter}
        setRenewalDateFilter={setRenewalDateFilter}
        isFiltersOpen={isFiltersOpen}
        setIsFiltersOpen={setIsFiltersOpen}
        onClearFilters={handleClearFilters}
        clients={clients}
        proposalOptions={proposalOptions}
        contractTypeOptions={contractTypeOptions}
      />

      {/* Contracts Table */}
      <ContractsTable
        contracts={paginatedContracts}
        totalCount={filteredContracts.length}
        isLoading={isLoading}
        startIndex={startIndex}
        pageSize={pageSize}
        currentPage={currentPage}
        totalPages={totalPages}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onPageChange={setCurrentPage}
        onExport={handleExport}
        onViewDetails={handleViewDetails}
        formatCurrency={formatCurrency}
        renderStatusBadge={renderStatusBadge}
      />

      {/* Modals */}
      {isAddModalOpen && (
        <AddContractModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleCreateContract}
        />
      )}

      {isDetailModalOpen && selectedContract && (
        <ContractDetailModal
          isOpen={isDetailModalOpen}
          contract={selectedContract}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdate={handleUpdateContract}
          onDelete={handleDeleteContract}
        />
      )}
    </div>
  );
};
