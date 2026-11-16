import React, { useState, useEffect, useMemo } from 'react';
import { Handshake, Users, Plus, Loader2 } from 'lucide-react';
import { ReloadButton } from '../../../components/ui/ReloadButton';
import { Client, ClientsFilterState, ClientSortOption } from '../types/clients';
import { clientsService } from '../services/clientsService';
import { ClientsMetricCards } from '../components/ClientsMetricCards';
import { ClientsFilterBar } from '../components/ClientsFilterBar';
import { ClientsTable } from '../components/ClientsTable';
import { AddClientModal } from '../components/AddClientModal';
import { ClientDetailModal } from '../components/ClientDetailModal';
import { ToastNotification, ToastItem } from '../../../components/ui/ToastNotification';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const getFormattedTimestamp = () => { const now = new Date(); return `${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`; };
  const [lastRefreshed, setLastRefreshed] = useState<string>(getFormattedTimestamp);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Quick Metric Filter (total, active, new, credit)
  const [metricFilter, setMetricFilter] = useState<string | null>(null);

  // Filters State
  const initialFilterState: ClientsFilterState = {
    searchQuery: '',
    status: 'All',
    clientType: 'All',
    industry: 'All',
    country: 'All',
    city: 'All',
    accountOwner: 'All',
    onboardingDateRange: '',
  };

  const [filterState, setFilterState] = useState<ClientsFilterState>(initialFilterState);

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [sortBy, setSortBy] = useState<ClientSortOption>('onboarding-desc');

  // Toasts State
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    const newToast: ToastItem = {
      id,
      type,
      title,
      message,
      timestamp: 'Just now',
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch clients from live database
  const loadClientsFromDb = async (showToast = false) => {
    try {
      setError(null);
      const data = await clientsService.getClients();
      setClients(data);
      if (showToast) {
        addToast('info', 'Clients Refreshed', 'Synchronized live records from Supabase database.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Could not fetch records from the database.';
      setError(msg);
      addToast('error', 'Database Connection Error', msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadClientsFromDb();
  }, []);

  // Metrics calculation directly from live database clients
  const metrics = useMemo(() => clientsService.getMetrics(clients), [clients]);

  // Handle Manual Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    setLastRefreshed(timeStr);
    await loadClientsFromDb(true);
  };

  // Metric Card Quick Filter Click
  const handleMetricCardClick = (cardId: string | null) => {
    if (metricFilter === cardId || cardId === null) {
      setMetricFilter(null);
      setFilterState((prev) => ({ ...prev, status: 'All' }));
      setCurrentPage(1);
      return;
    }

    setMetricFilter(cardId);
    setCurrentPage(1);

    if (cardId === 'active') {
      setFilterState((prev) => ({ ...prev, status: 'Active' }));
    } else if (cardId === 'new') {
      setFilterState((prev) => ({ ...prev, status: 'Pending' }));
    } else {
      setFilterState((prev) => ({ ...prev, status: 'All' }));
    }
  };

  // Clear Filters
  const handleClearFilters = () => {
    setFilterState(initialFilterState);
    setMetricFilter(null);
    setCurrentPage(1);
    addToast('info', 'Filters Cleared', 'Search parameters have been reset.');
  };

  // Filter Updates
  const handleFilterChange = (updates: Partial<ClientsFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
    setCurrentPage(1);
  };

  // Filter & Search Logic
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // 1. Search Query
      if (filterState.searchQuery.trim()) {
        const query = filterState.searchQuery.toLowerCase();
        const matchesQuery =
          (client.id || '').toLowerCase().includes(query) ||
          (client.clientCode || '').toLowerCase().includes(query) ||
          (client.clientName || '').toLowerCase().includes(query) ||
          (client.companyName || '').toLowerCase().includes(query) ||
          (client.email || '').toLowerCase().includes(query) ||
          (client.phone || '').toLowerCase().includes(query) ||
          (client.contactPerson || '').toLowerCase().includes(query);

        if (!matchesQuery) return false;
      }

      // 2. Status
      if (filterState.status !== 'All' && client.status !== filterState.status) {
        return false;
      }

      // 3. Client Type
      if (filterState.clientType !== 'All' && client.clientType !== filterState.clientType) {
        return false;
      }

      // 4. Industry
      if (filterState.industry !== 'All' && client.industry !== filterState.industry) {
        return false;
      }

      // 5. Country
      if (filterState.country !== 'All' && client.country !== filterState.country) {
        return false;
      }

      // 6. City
      if (filterState.city !== 'All' && client.city !== filterState.city) {
        return false;
      }

      // 7. Account Owner
      if (filterState.accountOwner !== 'All') {
        const ownerName = (client.accountOwner || '').toLowerCase();
        const filterOwner = filterState.accountOwner.toLowerCase();
        if (!ownerName.includes(filterOwner) && !filterOwner.includes(ownerName)) {
          return false;
        }
      }

      // 8. Onboarding Date
      if (
        filterState.onboardingDateRange.trim() &&
        client.onboardingDate &&
        !client.onboardingDate.toLowerCase().includes(filterState.onboardingDateRange.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [clients, filterState]);

  // Sorting Logic
  const sortedClients = useMemo(() => {
    const list = [...filteredClients];

    switch (sortBy) {
      case 'onboarding-desc':
        return list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
      case 'onboarding-asc':
        return list.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      case 'client-asc':
        return list.sort((a, b) => (a.clientName || '').localeCompare(b.clientName || ''));
      case 'client-desc':
        return list.sort((a, b) => (b.clientName || '').localeCompare(a.clientName || ''));
      case 'company-asc':
        return list.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
      case 'id-asc':
        return list.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      case 'id-desc':
        return list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
      default:
        return list;
    }
  }, [filteredClients, sortBy]);

  // Pagination Logic
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedClients.slice(start, start + pageSize);
  }, [sortedClients, currentPage, pageSize]);

  // Add Client Handler
  const handleAddClient = async (clientData: Partial<Client>) => {
    try {
      const created = await clientsService.createClient(clientData);
      setClients((prev) => [created, ...prev]);
      addToast(
        'success',
        'Client Created',
        `Successfully added ${created.clientName} (${created.id}) to the live database.`
      );
    } catch (err: any) {
      addToast('error', 'Creation Failed', err?.message || 'Could not save client to database.');
    }
  };

  // Update Client Handler
  const handleUpdateClient = async (updated: Client) => {
    try {
      const saved = await clientsService.updateClient(updated.id, updated);
      setClients((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      addToast(
        'success',
        'Client Updated',
        `Changes to ${saved.clientName} were saved to the database.`
      );
    } catch (err: any) {
      addToast('error', 'Update Failed', err?.message || 'Could not update client in database.');
    }
  };

  // Delete Client Handler
  const handleDeleteClient = async (id: string) => {
    try {
      await clientsService.deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      addToast('warning', 'Client Deleted', `Client ${id} was deleted from database.`);
    } catch (err: any) {
      addToast('error', 'Delete Failed', err?.message || 'Could not delete client from database.');
    }
  };

  // CSV Export Handler
  const handleExport = () => {
    if (filteredClients.length === 0) {
      addToast('warning', 'Nothing to Export', 'There are no client records matching current filters.');
      return;
    }

    const headers = [
      'Client ID',
      'Client Code',
      'Client Name',
      'Company Name',
      'Industry',
      'Contact Person',
      'Email',
      'Phone',
      'Country',
      'City',
      'Client Type',
      'Account Owner',
      'Status',
      'Credit Limit',
      'Onboarding Date',
    ];

    const rows = filteredClients.map((c) => [
      `"${c.id}"`,
      `"${c.clientCode}"`,
      `"${c.clientName.replace(/"/g, '""')}"`,
      `"${c.companyName.replace(/"/g, '""')}"`,
      `"${c.industry}"`,
      `"${c.contactPerson}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.country}"`,
      `"${c.city}"`,
      `"${c.clientType}"`,
      `"${c.accountOwner}"`,
      `"${c.status}"`,
      `"${c.creditLimit}"`,
      `"${c.onboardingDate}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Export Complete', `Exported ${filteredClients.length} clients to CSV.`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <p className="text-sm font-medium text-slate-500">Loading live clients from database...</p>
      </div>
    );
  }

  return (
    <div
      className="p-4 sm:p-6 w-full box-border font-sans bg-[#F8FAFC] flex flex-col items-start gap-5"
    >
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* Error Banner */}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => loadClientsFromDb(true)}
        />
      )}

      {/* Section - Breadcrumb and Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Left Title with Green Badge */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          {/* Green Icon Badge: 40x40 rounded 12px bg #ECFDF5 border #D1FAE5 */}
          <div
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #D1FAE5',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Handshake size={20} color="#059669" strokeWidth={2} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '24px',
                fontWeight: 700,
                lineHeight: '30px',
                color: '#0F172A',
                letterSpacing: '-0.6px',
                margin: 0,
              }}
            >
              Clients
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '16px',
                color: '#64748B',
                margin: 0,
              }}
            >
              Manage client profiles, company information, account ownership, and payment details.
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          {/* Timestamp text */}
          {/* Refresh Button */}
          <ReloadButton
            onClick={handleRefresh}
            isRefreshing={isRefreshing}
            title="Refresh database records"
          />

          {/* + Add Client Button */}
          <button
            type="button"
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
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Section - Metric KPI Cards */}
      <ClientsMetricCards
        metrics={metrics}
        activeFilter={metricFilter}
        onSelectFilter={handleMetricCardClick}
      />

      {/* Section - Search & Filters Bar */}
      <ClientsFilterBar
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Section - Table & Pagination */}
      <ClientsTable
        clients={paginatedClients}
        totalCount={filteredClients.length}
        currentPage={currentPage}
        pageSize={pageSize}
        sortBy={sortBy}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onSortChange={setSortBy}
        onViewClient={setSelectedClient}
        onEditClient={setSelectedClient}
        onDeleteClient={handleDeleteClient}
        onExport={handleExport}
      />

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddClient}
      />

      {/* Client Detail / Edit Modal */}
      <ClientDetailModal
        client={selectedClient}
        isOpen={Boolean(selectedClient)}
        onClose={() => setSelectedClient(null)}
        onUpdateClient={handleUpdateClient}
        onDeleteClient={handleDeleteClient}
      />
    </div>
  );
};
