import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, RotateCw, Plus } from 'lucide-react';
import { Lead, LeadsFilterState, LeadSortOption, LeadsMetrics } from '../types/leads';
import { leadsService } from '../services/leadsService';
import { LeadsMetricCards } from '../components/LeadsMetricCards';
import { LeadsFilterBar } from '../components/LeadsFilterBar';
import { LeadsTable } from '../components/LeadsTable';
import { AddLeadModal } from '../components/AddLeadModal';
import { LeadDetailModal } from '../components/LeadDetailModal';
import { ToastNotification, ToastItem } from '../../../components/ui/ToastNotification';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<LeadsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('—');
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Quick Metric Filter (total, new, followups, converted)
  const [metricFilter, setMetricFilter] = useState<string | null>(null);

  // Filters State
  const initialFilterState: LeadsFilterState = {
    searchQuery: '',
    leadDateRange: '',
    source: 'All',
    serviceInterest: 'All',
    country: 'All',
    city: 'All',
    ownerId: 'All',
    stage: 'All',
    status: 'All',
    nextFollowUpDateRange: '',
  };

  const [filterState, setFilterState] = useState<LeadsFilterState>(initialFilterState);

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [sortBy, setSortBy] = useState<LeadSortOption>('date-desc');

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

  // Fetch leads and summary metrics from live database
  const loadData = useCallback(async (showToast = false) => {
    setError(null);
    try {
      const [leadsData, summaryMetrics] = await Promise.all([
        leadsService.getLeads(),
        leadsService.getSummary(),
      ]);
      setLeads(leadsData);
      setMetrics(summaryMetrics);
      if (summaryMetrics.lastUpdated) {
        setLastRefreshed(summaryMetrics.lastUpdated);
      } else {
        const now = new Date();
        setLastRefreshed(
          now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ', ' +
            now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        );
      }
      if (showToast) {
        addToast('info', 'Leads Refreshed', 'Synchronized live records from Supabase database.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Could not fetch records from the database.';
      setError(errMsg);
      addToast('error', 'Database Connection Error', errMsg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Manual Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(true);
  };

  // Filter Updates
  const handleFilterChange = (updates: Partial<LeadsFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterState(initialFilterState);
    setMetricFilter(null);
    setCurrentPage(1);
    addToast('info', 'Filters Reset', 'All filter options restored to default.');
  };

  // Filter & Sort Logic
  const filteredAndSortedLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Metric card quick filter
        if (metricFilter === 'new' && lead.stage !== 'New') return false;
        if (
          metricFilter === 'followups' &&
          lead.status !== 'Follow-up Required' &&
          lead.stage !== 'Contacted'
        ) {
          return false;
        }
        if (
          metricFilter === 'converted' &&
          lead.stage !== 'Won' &&
          lead.status !== 'Converted'
        ) {
          return false;
        }

        // Search Query filter
        if (filterState.searchQuery.trim()) {
          const q = filterState.searchQuery.toLowerCase();
          const match =
            lead.id.toLowerCase().includes(q) ||
            lead.company.toLowerCase().includes(q) ||
            lead.contactName.toLowerCase().includes(q) ||
            lead.email.toLowerCase().includes(q) ||
            lead.phone.toLowerCase().includes(q) ||
            lead.serviceInterest.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Dropdown filters
        if (filterState.source !== 'All' && lead.source !== filterState.source) return false;
        if (
          filterState.serviceInterest !== 'All' &&
          lead.serviceInterest !== filterState.serviceInterest
        ) {
          return false;
        }
        if (filterState.country !== 'All' && lead.country !== filterState.country) return false;
        if (filterState.city !== 'All' && lead.city !== filterState.city) return false;
        if (filterState.ownerId !== 'All' && lead.ownerId !== filterState.ownerId) return false;
        if (filterState.stage !== 'All' && lead.stage !== filterState.stage) return false;
        if (filterState.status !== 'All' && lead.status !== filterState.status) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date-desc':
            return b.leadDate.localeCompare(a.leadDate) || b.id.localeCompare(a.id);
          case 'date-asc':
            return a.leadDate.localeCompare(b.leadDate) || a.id.localeCompare(b.id);
          case 'company-asc':
            return a.company.localeCompare(b.company);
          case 'company-desc':
            return b.company.localeCompare(a.company);
          case 'contact-asc':
            return a.contactName.localeCompare(b.contactName);
          case 'id-desc':
            return b.id.localeCompare(a.id);
          default:
            return b.id.localeCompare(a.id);
        }
      });
  }, [leads, filterState, metricFilter, sortBy]);

  // Paginated Slice
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedLeads.slice(start, start + pageSize);
  }, [filteredAndSortedLeads, currentPage, pageSize]);

  // Handlers for Add, Update, Delete with Rollback on Failure
  const handleAddLead = async (newLeadData: Omit<Lead, 'id' | 'leadDate'>) => {
    try {
      const todayIso = new Date().toISOString().split('T')[0];
      const created = await leadsService.addLead({ ...newLeadData, leadDate: todayIso });
      setLeads((prev) => [created, ...prev]);
      addToast(
        'success',
        'Lead Created',
        `${created.company} (${created.id}) saved to Supabase PostgreSQL.`
      );
      // Reload summary metrics to reflect updated counts
      leadsService.getSummary().then(setMetrics).catch(() => {});
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Could not insert new lead into database.';
      addToast('error', 'Creation Failed', errMsg);
    }
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    const previousLeads = [...leads];
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    try {
      const saved = await leadsService.updateLead(updatedLead);
      setLeads((prev) => prev.map((l) => (l.id === saved.id ? saved : l)));
      addToast(
        'success',
        'Lead Updated',
        `Lead ${saved.id} (${saved.company}) updated successfully.`
      );
      leadsService.getSummary().then(setMetrics).catch(() => {});
    } catch (err: unknown) {
      setLeads(previousLeads);
      const errMsg = err instanceof Error ? err.message : 'Could not update lead in database.';
      addToast('error', 'Update Failed', errMsg);
    }
  };

  const handleDeleteLead = async (id: string) => {
    const previousLeads = [...leads];
    const leadToDelete = leads.find((l) => l.id === id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    try {
      await leadsService.deleteLead(id);
      addToast(
        'success',
        'Lead Deleted',
        leadToDelete
          ? `Lead ${leadToDelete.company} (${id}) deleted from database.`
          : `Lead ${id} deleted from database.`
      );
      leadsService.getSummary().then(setMetrics).catch(() => {});
    } catch (err: unknown) {
      setLeads(previousLeads);
      const errMsg = err instanceof Error ? err.message : 'Could not remove lead from database.';
      addToast('error', 'Delete Failed', errMsg);
    }
  };

  const handleExport = () => {
    leadsService.exportToCSV(filteredAndSortedLeads);
    addToast(
      'success',
      'Export Started',
      `Downloading ${filteredAndSortedLeads.length} database leads as CSV.`
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
      {/* Page Title & Breadcrumb Row */}
      <div className="flex flex-row items-center justify-between flex-wrap gap-4 w-full">
        <div className="flex flex-row items-center gap-3">
          <div className="w-[39px] h-[39px] bg-[#ECFDF5] border border-[#D1FAE5] rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
            <Users size={20} className="text-[#059669]" />
          </div>

          <div className="flex flex-col items-start">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] leading-7">
              Leads
            </h1>
            <p className="text-xs text-[#64748B] leading-4 mt-0.5">
              Manage prospective customers, track sales progress, and monitor follow-ups.
            </p>
          </div>
        </div>

        {/* Right Actions: Refresh + Add Lead Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-row items-center gap-2 text-xs text-[#64748B]">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 rounded hover:bg-slate-200/60 text-[#2563EB] transition-colors cursor-pointer disabled:opacity-50"
              title="Sync with database"
            >
              <RotateCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-98"
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <ErrorBanner
          title="Error Loading Leads"
          message={error}
          onRetry={() => {
            setIsLoading(true);
            loadData();
          }}
        />
      )}

      {/* 4 Metric Summary Cards */}
      <LeadsMetricCards
        metrics={metrics}
        isLoading={isLoading}
        activeFilter={metricFilter}
        onSelectFilter={setMetricFilter}
      />

      {/* Search & Filter Bar */}
      <LeadsFilterBar
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Leads Table or Loading or Empty State */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <Skeleton variant="text" className="w-48 h-5" />
            <Skeleton variant="text" className="w-32 h-8 rounded-lg" />
          </div>
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
              <Skeleton variant="text" className="w-24 h-4" />
              <Skeleton variant="text" className="w-36 h-4" />
              <Skeleton variant="text" className="w-28 h-4" />
              <Skeleton variant="text" className="w-32 h-4" />
              <Skeleton variant="text" className="w-20 h-5 rounded-full" />
              <Skeleton variant="text" className="w-24 h-4" />
              <Skeleton variant="text" className="w-16 h-5 rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedLeads.length === 0 ? (
        <EmptyState
          title="No Leads Found"
          description={
            filterState.searchQuery || filterState.stage !== 'All' || filterState.status !== 'All'
              ? 'No leads matched your filter criteria. Try adjusting or clearing your filters.'
              : 'No leads available in the database yet. Click below to add your first lead.'
          }
          actionLabel={
            filterState.searchQuery || filterState.stage !== 'All' || filterState.status !== 'All'
              ? 'Clear Filters'
              : 'Add Lead'
          }
          onAction={
            filterState.searchQuery || filterState.stage !== 'All' || filterState.status !== 'All'
              ? handleClearFilters
              : () => setIsAddModalOpen(true)
          }
        />
      ) : (
        <LeadsTable
          leads={paginatedLeads}
          totalCount={filteredAndSortedLeads.length}
          currentPage={currentPage}
          pageSize={pageSize}
          sortBy={sortBy}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          onSortChange={setSortBy}
          onViewLead={(lead) => setSelectedLead(lead)}
          onDeleteLead={handleDeleteLead}
          onExport={handleExport}
        />
      )}

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddLead}
      />

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
        onDeleteLead={handleDeleteLead}
      />

      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
