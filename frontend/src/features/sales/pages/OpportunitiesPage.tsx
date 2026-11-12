import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Target, RefreshCw, Plus, RotateCcw } from 'lucide-react';
import { OpportunityData, OpportunitySummaryData, CreateOpportunityPayload } from '@/types/opportunity';
import { opportunityService } from '@/services/opportunityService';
import { masterDataService, MasterEmployee, MasterClient } from '@/services/masterDataService';
import { OpportunitiesMetricCards } from '../components/OpportunitiesMetricCards';
import { OpportunitiesFilterBar } from '../components/OpportunitiesFilterBar';
import { OpportunitiesTable } from '../components/OpportunitiesTable';
import { AddOpportunityModal } from '../components/AddOpportunityModal';
import { OpportunityDetailModal } from '../components/OpportunityDetailModal';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

const formatCurrency = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '₹ 0';
  if (typeof val === 'string' && val.includes('₹')) return val;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return '₹ 0';
  return '₹ ' + num.toLocaleString('en-IN');
};

const renderStageBadge = (stage: string) => {
  const s = stage?.toLowerCase() || '';
  let bg = '#F1F5F9';
  let color = '#475569';
  let border = '#CBD5E1';

  if (s === 'new') {
    bg = '#EFF6FF';
    color = '#2563EB';
    border = '#BFDBFE';
  } else if (s === 'qualified') {
    bg = '#F0FDFA';
    color = '#0D9488';
    border = '#99F6E4';
  } else if (s === 'proposal') {
    bg = '#FAF5FF';
    color = '#9333EA';
    border = '#E9D5FF';
  } else if (s === 'negotiation') {
    bg = '#FFFBEB';
    color = '#D97706';
    border = '#FDE68A';
  } else if (s === 'won') {
    bg = '#F0FDF4';
    color = '#16A34A';
    border = '#BBF7D0';
  } else if (s === 'lost') {
    bg = '#FFF1F2';
    color = '#E11D48';
    border = '#FECDD3';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 8px',
        height: '20px',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: '6px',
        color: color,
        fontSize: '11px',
        fontWeight: 500,
        lineHeight: '16px',
      }}
    >
      {stage}
    </span>
  );
};

const renderStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || '';
  let bg = '#F1F5F9';
  let color = '#475569';
  let border = '#CBD5E1';

  if (s === 'open') {
    bg = '#EFF6FF';
    color = '#2563EB';
    border = '#BFDBFE';
  } else if (s === 'in progress') {
    bg = '#ECFEFF';
    color = '#0E7490';
    border = '#A5F3FC';
  } else if (s === 'won') {
    bg = '#F0FDF4';
    color = '#16A34A';
    border = '#BBF7D0';
  } else if (s === 'lost') {
    bg = '#FFF1F2';
    color = '#BE123C';
    border = '#FECDD3';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 8px',
        height: '20px',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: '6px',
        color: color,
        fontSize: '11px',
        fontWeight: 500,
        lineHeight: '16px',
      }}
    >
      {status}
    </span>
  );
};

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [summary, setSummary] = useState<OpportunitySummaryData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Master Data
  const [employees, setEmployees] = useState<MasterEmployee[]>([]);
  const [clients, setClients] = useState<MasterClient[]>([]);
  const [services, setServices] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOwner, setSelectedOwner] = useState('All');
  const [selectedClient, setSelectedClient] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [expectedCloseDateFilter, setExpectedCloseDateFilter] = useState('');
  const [nextFollowUpFilter, setNextFollowUpFilter] = useState('');
  const [lastContactFilter, setLastContactFilter] = useState('');
  const [sortBy, setSortBy] = useState('Expected Close Date (Nearest)');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Load master data
  useEffect(() => {
    masterDataService.getAllMasterData().then((data) => {
      setEmployees(data.employees);
      setClients(data.clients);
      setServices(data.services);
    }).catch(() => {});
  }, []);

  // Fetch opportunities and summary
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [items, summaryData] = await Promise.all([
        opportunityService.getOpportunities(),
        opportunityService.getSummary(),
      ]);
      setOpportunities(items || []);
      setSummary(summaryData);
      const now = new Date();
      setLastUpdated(
        `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load opportunities from database.';
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
    setSelectedStage('All');
    setSelectedStatus('All');
    setSelectedOwner('All');
    setSelectedClient('All');
    setSelectedService('All');
    setExpectedCloseDateFilter('');
    setNextFollowUpFilter('');
    setLastContactFilter('');
    setSortBy('Expected Close Date (Nearest)');
    setCurrentPage(1);
  };

  // Filter and sort items
  const filteredOpportunities = useMemo(() => {
    let result = opportunities.filter((item) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          (item.opportunityId && item.opportunityId.toLowerCase().includes(query)) ||
          (item.opportunityName && item.opportunityName.toLowerCase().includes(query)) ||
          (item.leadId && item.leadId.toLowerCase().includes(query)) ||
          (item.clientId && item.clientId.toLowerCase().includes(query)) ||
          (item.ownerId && item.ownerId.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }
      if (selectedStage !== 'All' && item.stage?.toLowerCase() !== selectedStage.toLowerCase()) return false;
      if (selectedStatus !== 'All' && item.status?.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      if (selectedOwner !== 'All' && item.ownerId?.toLowerCase() !== selectedOwner.toLowerCase()) return false;
      if (selectedClient !== 'All' && item.clientId?.toLowerCase() !== selectedClient.toLowerCase()) return false;
      if (selectedService !== 'All' && item.serviceId?.toLowerCase() !== selectedService.toLowerCase()) return false;

      if (expectedCloseDateFilter.trim()) {
        const q = expectedCloseDateFilter.toLowerCase().trim();
        if (!item.expectedCloseDate || !item.expectedCloseDate.toLowerCase().includes(q)) return false;
      }
      if (lastContactFilter.trim()) {
        const q = lastContactFilter.toLowerCase().trim();
        if (!item.lastContact || !item.lastContact.toLowerCase().includes(q)) return false;
      }
      if (nextFollowUpFilter.trim()) {
        const q = nextFollowUpFilter.toLowerCase().trim();
        if (!item.nextFollowUp || !item.nextFollowUp.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'Probability (High to Low)') {
        return (b.probability || 0) - (a.probability || 0);
      }
      if (sortBy === 'Estimated Value (High to Low)') {
        return (Number(b.estimatedValue) || 0) - (Number(a.estimatedValue) || 0);
      }
      if (sortBy === 'Recently Updated') {
        return (b.id || 0) - (a.id || 0);
      }
      if (!a.expectedCloseDate || a.expectedCloseDate === '-') return 1;
      if (!b.expectedCloseDate || b.expectedCloseDate === '-') return -1;
      const dateA = new Date(a.expectedCloseDate).getTime();
      const dateB = new Date(b.expectedCloseDate).getTime();
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateA - dateB;
      }
      return (a.orderIndex || 0) - (b.orderIndex || 0);
    });

    return result;
  }, [
    opportunities,
    searchQuery,
    selectedStage,
    selectedStatus,
    selectedOwner,
    selectedClient,
    selectedService,
    expectedCloseDateFilter,
    lastContactFilter,
    nextFollowUpFilter,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredOpportunities.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOpportunities = useMemo(() => {
    return filteredOpportunities.slice(startIndex, startIndex + pageSize);
  }, [filteredOpportunities, startIndex, pageSize]);

  // Export CSV
  const handleExport = () => {
    const headers = [
      'Opportunity ID',
      'Lead ID',
      'Client ID',
      'Opportunity Name',
      'Owner ID',
      'Service ID',
      'Stage',
      'Probability %',
      'Estimated Value',
      'Expected Close Date',
      'Last Contact',
      'Next Follow-up',
      'Status',
      'Lost Reason',
      'Weighted Pipeline',
    ];
    const escapeCsv = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = filteredOpportunities.map((r) => [
      escapeCsv(r.opportunityId),
      escapeCsv(r.leadId),
      escapeCsv(r.clientId),
      escapeCsv(r.opportunityName),
      escapeCsv(r.ownerId),
      escapeCsv(r.serviceId),
      escapeCsv(r.stage),
      escapeCsv(r.probability),
      escapeCsv(r.estimatedValue),
      escapeCsv(r.expectedCloseDate),
      escapeCsv(r.lastContact),
      escapeCsv(r.nextFollowUp),
      escapeCsv(r.status),
      escapeCsv(r.lostReason),
      escapeCsv(r.weightedPipeline),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `opportunities_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add Opportunity
  const handleAddOpportunity = async (payload: CreateOpportunityPayload) => {
    try {
      const created = await opportunityService.createOpportunity(payload);
      setOpportunities((prev) => [created, ...prev]);
      setToastMessage({ type: 'success', text: 'Opportunity created successfully' });
      setIsAddModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create opportunity on server';
      setToastMessage({ type: 'error', text: msg });
    }
  };

  // Update Status / Opportunity with rollback on failure
  const handleUpdateStatus = async (
    id: number,
    stage: string,
    status: string,
    lostReason?: string
  ) => {
    const previous = [...opportunities];
    // Optimistic update
    setOpportunities((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stage, status, lostReason: lostReason || '—' } : item
      )
    );
    try {
      const updated = await opportunityService.updateOpportunity(id, {
        stage,
        status,
        lostReason: lostReason || '—',
      });
      setOpportunities((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setToastMessage({ type: 'success', text: 'Opportunity updated successfully' });
    } catch (err: unknown) {
      // Rollback optimistic update
      setOpportunities(previous);
      const msg = err instanceof Error ? err.message : 'Failed to update opportunity';
      setToastMessage({ type: 'error', text: msg });
    }
  };

  // Delete Opportunity with rollback on failure
  const handleDeleteOpportunity = async (id: number) => {
    const previous = [...opportunities];
    // Optimistic delete
    setOpportunities((prev) => prev.filter((item) => item.id !== id));
    try {
      await opportunityService.deleteOpportunity(id);
      setToastMessage({ type: 'success', text: 'Opportunity deleted successfully' });
      if (selectedOpportunity?.id === id) {
        setIsDetailModalOpen(false);
      }
    } catch (err: unknown) {
      // Rollback optimistic delete
      setOpportunities(previous);
      const msg = err instanceof Error ? err.message : 'Failed to delete opportunity';
      setToastMessage({ type: 'error', text: msg });
    }
  };

  // Reset Data (Dev Profile Only)
  const handleResetData = async () => {
    if (!import.meta.env.DEV) return;
    try {
      await opportunityService.resetData();
      await fetchData();
      setToastMessage({ type: 'success', text: 'Opportunities reset to default seed data' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset opportunities';
      setToastMessage({ type: 'error', text: msg });
    }
  };

  const handleViewDetails = (item: OpportunityData) => {
    setSelectedOpportunity(item);
    setIsDetailModalOpen(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px',
        gap: '20px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#F8FAFC',
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
          width: '100%',
          minHeight: '41px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #D1FAE5',
              borderRadius: '8px',
              flexShrink: 0,
            }}
          >
            <Target style={{ width: '24px', height: '24px', color: '#059669', strokeWidth: 2 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '20px',
                lineHeight: '25px',
                color: '#0F172A',
                margin: 0,
              }}
            >
              Opportunities
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
              Track sales opportunities, monitor pipeline value, and manage deal progress.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleRefresh}
            title="Refresh"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <RefreshCw
              style={{
                width: '16px',
                height: '16px',
                color: '#64748B',
                strokeWidth: 1.33,
                transform: isRefreshing ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.5s ease',
              }}
            />
          </button>

          {/* Reset button only in DEV */}
          {import.meta.env.DEV && (
            <button
              onClick={handleResetData}
              title="Reset Opportunities Seed Data"
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
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '8px 14px',
              gap: '6px',
              height: '32px',
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
            <Plus style={{ width: '16px', height: '16px', color: '#FFFFFF', strokeWidth: 1.5 }} />
            <span>Add Opportunity</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <ErrorBanner
          title="Failed to load opportunities"
          message={error}
          onRetry={fetchData}
          isRetrying={isLoading}
        />
      )}

      {/* KPI Cards */}
      <OpportunitiesMetricCards summary={summary} isLoading={isLoading} />

      {/* Filters Bar */}
      <OpportunitiesFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedOwner={selectedOwner}
        setSelectedOwner={setSelectedOwner}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        expectedCloseDateFilter={expectedCloseDateFilter}
        setExpectedCloseDateFilter={setExpectedCloseDateFilter}
        lastContactFilter={lastContactFilter}
        setLastContactFilter={setLastContactFilter}
        nextFollowUpFilter={nextFollowUpFilter}
        setNextFollowUpFilter={setNextFollowUpFilter}
        isFiltersOpen={isFiltersOpen}
        setIsFiltersOpen={setIsFiltersOpen}
        onClearFilters={handleClearFilters}
        employees={employees}
        clients={clients}
        services={services}
      />

      {/* Opportunities Data Table */}
      <OpportunitiesTable
        opportunities={paginatedOpportunities}
        totalCount={filteredOpportunities.length}
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
        renderStageBadge={renderStageBadge}
        renderStatusBadge={renderStatusBadge}
      />

      {/* Modals */}
      {isAddModalOpen && (
        <AddOpportunityModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddOpportunity}
        />
      )}

      {isDetailModalOpen && selectedOpportunity && (
        <OpportunityDetailModal
          isOpen={isDetailModalOpen}
          item={selectedOpportunity}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteOpportunity}
        />
      )}
    </div>
  );
};
