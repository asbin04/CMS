import React, { useState, useEffect, useCallback } from 'react';
import { Headphones, Download, Plus, RotateCw } from 'lucide-react';
import { ticketService } from '../services/ticketService';
import {
  SupportTicketItem,
  SupportTicketKpis,
  SupportTicketTrendsData,
  SupportTicketFilterOptions,
  CreateSupportTicketPayload,
  UpdateSupportTicketPayload,
} from '../types/tickets';
import { SupportTicketKpiCards } from '../components/SupportTicketKpiCards';
import { SupportTicketFilterBar } from '../components/SupportTicketFilterBar';
import { SupportTicketsTable } from '../components/SupportTicketsTable';
import { SupportTrendsAndSla } from '../components/SupportTrendsAndSla';
import { CreateTicketModal } from '../components/CreateTicketModal';
import { EditTicketModal } from '../components/EditTicketModal';

export const SupportTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [kpis, setKpis] = useState<SupportTicketKpis | null>(null);
  const [trendsData, setTrendsData] = useState<SupportTicketTrendsData | null>(null);
  const [isTrendsLoading, setIsTrendsLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<SupportTicketFilterOptions>({
    ticketTypes: [],
    priorities: [],
    statuses: [],
    slaStatuses: [],
  });

  const [activeTab, setActiveTab] = useState<'tickets' | 'trends'>('tickets');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [ticketType, setTicketType] = useState('All');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [slaStatus, setSlaStatus] = useState('All');
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<SupportTicketItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('15 Oct 2026, 11:30 AM');
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = useCallback(async () => {
    try {
      const data = await ticketService.getKpis();
      setKpis(data);
    } catch (err) {
      console.error('Failed to fetch ticket KPIs:', err);
    }
  }, []);

  const fetchTrends = useCallback(async () => {
    try {
      setIsTrendsLoading(true);
      const data = await ticketService.getTrends();
      setTrendsData(data);
    } catch (err) {
      console.error('Failed to fetch trends data:', err);
    } finally {
      setIsTrendsLoading(false);
    }
  }, []);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const data = await ticketService.getFilterOptions();
      setFilterOptions(data);
    } catch (err) {
      console.error('Failed to fetch ticket filter options:', err);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ticketService.getTickets({
        search,
        ticketType,
        priority,
        status,
        slaStatus,
      });
      setTickets(data);
      const now = new Date();
      setLastUpdated(
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
          ', ' +
          now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    } catch (err: any) {
      console.error('Failed to fetch tickets:', err);
      setError(err?.message || 'Failed to load support tickets from the database. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search, ticketType, priority, status, slaStatus]);

  useEffect(() => {
    fetchKpis();
    fetchTrends();
    fetchFilterOptions();
  }, [fetchKpis, fetchTrends, fetchFilterOptions]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (activeTab === 'trends') {
      fetchTrends();
    }
  }, [activeTab, fetchTrends]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchKpis();
    fetchTrends();
    fetchTickets();
  };

  const handleClearFilters = () => {
    setSearch('');
    setTicketType('All');
    setPriority('All');
    setStatus('All');
    setSlaStatus('All');
  };

  const handleCreateTicket = async (payload: CreateSupportTicketPayload) => {
    await ticketService.createTicket(payload);
    await Promise.all([fetchTickets(), fetchKpis(), fetchTrends(), fetchFilterOptions()]);
  };

  const handleUpdateTicket = async (id: number, payload: UpdateSupportTicketPayload) => {
    await ticketService.updateTicket(id, payload);
    await Promise.all([fetchTickets(), fetchKpis(), fetchTrends(), fetchFilterOptions()]);
  };

  const handleDeleteTicket = async (ticket: SupportTicketItem) => {
    if (window.confirm(`Are you sure you want to delete ticket ${ticket.ticketCode}?`)) {
      await ticketService.deleteTicket(ticket.id);
      await Promise.all([fetchTickets(), fetchKpis(), fetchTrends(), fetchFilterOptions()]);
    }
  };

  const handleExport = () => {
    if (tickets.length === 0) return;
    const headers = [
      'Ticket ID',
      'Client ID',
      'Project ID',
      'AMC / SLA ID',
      'Opened Date',
      'Ticket Type',
      'Priority',
      'Issue / Request',
      'Assigned To',
      'Status',
      'Channel',
      'Resolution Time',
      'SLA Due Date',
      'SLA Status',
    ];
    const csvRows = [headers.join(',')];
    tickets.forEach((t) => {
      const row = [
        `"${t.ticketCode || ''}"`,
        `"${t.clientId || ''}"`,
        `"${t.projectId || ''}"`,
        `"${t.amcSlaId || ''}"`,
        `"${t.openedDate || ''}"`,
        `"${t.ticketType || ''}"`,
        `"${t.priority || ''}"`,
        `"${(t.issueRequest || '').replace(/"/g, '""')}"`,
        `"${t.assignedTo || ''}"`,
        `"${t.status || ''}"`,
        `"${t.channel || ''}"`,
        `"${t.resolutionTime || ''}"`,
        `"${t.slaDueDate || ''}"`,
        `"${t.slaStatus || ''}"`,
      ];
      csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `support_tickets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col p-5 sm:p-6 gap-5">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Icon + Title + Subtitle */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#EEEFFE] border border-[#DBEAFE] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Headphones className="w-6 h-6 text-[#2563EB]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-[#111827] tracking-[-0.6px] leading-8">
              Support Tickets
            </h1>
            <p className="text-xs text-[#6B7280] leading-4">
              Track, manage, and resolve client support requests with SLA monitoring.
            </p>
          </div>
        </div>

        {/* Right Actions: Last Updated + Export + Create Ticket */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span>Last Updated: {lastUpdated}</span>
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh tickets data"
              className="p-1 rounded hover:bg-[#E2E8F0] transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#6B7280] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="h-[34px] px-[15px] bg-white border border-[#E5E7EB] rounded-lg text-[13px] font-medium text-[#334155] flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-[#334155]" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-[34px] px-4 bg-[#4B35E6] rounded-lg text-[13px] font-medium text-white flex items-center gap-2 hover:bg-[#3E2BD1] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="w-full border-b border-[#E2E8F0]" style={{ height: '31px' }}>
        <div className="flex items-center gap-8" style={{ height: '30px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`pb-3 text-[12px] font-semibold transition-colors flex items-center cursor-pointer ${
              activeTab === 'tickets'
                ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
            style={{ height: '30px' }}
          >
            Tickets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`pb-3 text-[12px] font-semibold transition-colors flex items-center cursor-pointer ${
              activeTab === 'trends'
                ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
            style={{ height: '30px' }}
          >
            Trends & SLA
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl flex items-center justify-between text-xs text-[#DC2626]">
          <span>{error}</span>
          <button
            onClick={handleRefresh}
            className="font-medium underline hover:text-[#B91C1C] ml-3"
          >
            Retry
          </button>
        </div>
      )}

      {/* Conditional Content based on activeTab */}
      {activeTab === 'tickets' ? (
        <>
          {/* KPI Cards */}
          <SupportTicketKpiCards kpis={kpis} isLoading={isLoading && !kpis} />

          {/* DataTableSection */}
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {/* FilterSection */}
            <SupportTicketFilterBar
              search={search}
              onSearchChange={setSearch}
              ticketType={ticketType}
              onTicketTypeChange={setTicketType}
              priority={priority}
              onPriorityChange={setPriority}
              status={status}
              onStatusChange={setStatus}
              slaStatus={slaStatus}
              onSlaStatusChange={setSlaStatus}
              onClearFilters={handleClearFilters}
              filterOptions={filterOptions}
              isFiltersOpen={isFiltersOpen}
              onToggleFilters={() => setIsFiltersOpen((prev) => !prev)}
            />

            {/* Table + Pagination Footer */}
            <SupportTicketsTable
              tickets={tickets}
              isLoading={isLoading}
              onEditTicket={(ticket) => {
                setTicketToEdit(ticket);
                setIsEditModalOpen(true);
              }}
              onDeleteTicket={handleDeleteTicket}
            />
          </div>
        </>
      ) : (
        <SupportTrendsAndSla data={trendsData} isLoading={isTrendsLoading} />
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTicket}
      />

      {/* Edit Ticket Modal */}
      <EditTicketModal
        isOpen={isEditModalOpen}
        ticket={ticketToEdit}
        onClose={() => {
          setIsEditModalOpen(false);
          setTicketToEdit(null);
        }}
        onSubmit={handleUpdateTicket}
      />
    </div>
  );
};

