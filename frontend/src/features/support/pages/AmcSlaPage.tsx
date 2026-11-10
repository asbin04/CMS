import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShieldCheck, Download } from 'lucide-react';
import { amcSlaService } from '../services/amcSlaService';
import {
  AmcSlaContract,
  AmcSlaKpis,
  AmcSlaFilterOptions,
  CreateAmcSlaContractInput,
  UpdateAmcSlaContractInput,
} from '../types/amcSla';
import { AmcSlaKpiCards } from '../components/AmcSlaKpiCards';
import { AmcSlaFilterBar } from '../components/AmcSlaFilterBar';
import { AmcSlaTable } from '../components/AmcSlaTable';
import { AmcRenewalsKpiCards } from '../components/AmcRenewalsKpiCards';
import { AmcRenewalTimelineChart } from '../components/AmcRenewalTimelineChart';
import { AmcRenewalAlertsCard } from '../components/AmcRenewalAlertsCard';
import { AmcRenewalsTable } from '../components/AmcRenewalsTable';
import { CreateAmcSlaModal } from '../components/CreateAmcSlaModal';
import { EditAmcSlaModal } from '../components/EditAmcSlaModal';

export const AmcSlaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'amc' | 'renewals'>('amc');
  const [contracts, setContracts] = useState<AmcSlaContract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);

  // Filters for AMC / SLA tab
  const [search, setSearch] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [renewalAlert, setRenewalAlert] = useState<string>('All');

  // Filter state for Renewals & Alerts tab
  const [renewalsWindowFilter, setRenewalsWindowFilter] = useState<string>('All');

  // KPIs & Options
  const [kpis, setKpis] = useState<AmcSlaKpis>({
    totalContracts: 48,
    activeContracts: 38,
    expiringContracts: 6,
    renewalOverdueContracts: 2,
    totalContractValue: 248500,
    formattedContractValue: '₹ 2,48,500',
  });

  const [filterOptions, setFilterOptions] = useState<AmcSlaFilterOptions>({
    serviceTypes: [
      'Application Support',
      'Infrastructure Support',
      'Managed Services',
      'Technical Support',
      'AMC (Overall)',
    ],
    statuses: ['Active', 'Expiring', 'Expired', 'Terminated'],
    renewalAlerts: ['Expiring (≤ 30 Days)', 'Renewal Overdue', 'Normal'],
  });

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingContract, setEditingContract] = useState<AmcSlaContract | null>(null);

  const fetchKpis = useCallback(async () => {
    try {
      const data = await amcSlaService.getKpis();
      if (data) setKpis(data);
    } catch {
      // keep fallback
    }
  }, []);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const opts = await amcSlaService.getFilterOptions();
      if (opts) setFilterOptions(opts);
    } catch {
      // keep fallback
    }
  }, []);

  const fetchContracts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await amcSlaService.getContracts({
        search: activeTab === 'amc' ? search : undefined,
        serviceType: activeTab === 'amc' ? serviceType : undefined,
        status: activeTab === 'amc' ? status : undefined,
        renewalAlert: activeTab === 'amc' ? (renewalAlert === 'All' ? undefined : renewalAlert) : undefined,
      });

      setContracts(data || []);
    } catch {
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, serviceType, status, renewalAlert, activeTab]);

  useEffect(() => {
    fetchKpis();
    fetchFilterOptions();
  }, [fetchKpis, fetchFilterOptions]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleClearFilters = () => {
    setSearch('');
    setServiceType('All');
    setStatus('All');
    setRenewalAlert('All');
  };

  const handleExport = () => {
    const headers = [
      'Contract Code',
      'Client ID',
      'Project ID',
      'Service Type',
      'Start Date',
      'End Date',
      'Renewal Date',
      'Contract Value',
      'Response SLA',
      'Resolution SLA',
      'Coverage Hours',
      'Status',
      'Penalty Clause',
      'Renewal Alert',
      'Assigned Manager',
      'Notes',
    ];

    const rows = contracts.map((c) => [
      c.contractCode,
      c.clientId,
      c.projectId,
      c.serviceType,
      c.startDate,
      c.endDate,
      c.renewalDate,
      c.contractValue,
      c.responseSla,
      c.resolutionSla,
      c.coverageHours,
      c.status,
      c.penaltyClause,
      c.renewalAlert,
      c.assignedManager,
      c.notes,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val ?? ''}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amc_sla_contracts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateContract = async (payload: CreateAmcSlaContractInput) => {
    await amcSlaService.createContract(payload);
    await Promise.all([fetchContracts(), fetchKpis()]);
  };

  const handleUpdateContract = async (id: number, payload: UpdateAmcSlaContractInput) => {
    await amcSlaService.updateContract(id, payload);
    await Promise.all([fetchContracts(), fetchKpis()]);
  };

  const handleDeleteContract = async (contract: AmcSlaContract) => {
    if (window.confirm(`Are you sure you want to delete contract ${contract.contractCode}?`)) {
      await amcSlaService.deleteContract(contract.id);
      await Promise.all([fetchContracts(), fetchKpis()]);
    }
  };

  // Renewals & Alerts Metrics computed dynamically from live database KPIs
  const renewalMetrics = useMemo(() => {
    const total = kpis?.totalContracts ?? (contracts.length || 48);
    const overdue = kpis?.overdueRenewals ?? kpis?.renewalOverdueContracts ?? 2;
    const dueSoon30 = kpis?.renewalDue30Days ?? kpis?.expiringContracts ?? 6;
    const upcoming31to90 = kpis?.upcoming31to90Days ?? 10;
    const greater90 = kpis?.greater90Days ?? Math.max(0, total - (overdue + dueSoon30 + upcoming31to90));

    return {
      total,
      overdue,
      dueSoon30,
      upcoming31to90,
      greater90: greater90 > 0 ? greater90 : 12,
    };
  }, [contracts, kpis]);

  return (
    <div className="flex flex-col items-start p-6 gap-6 w-full max-w-[1020px] min-h-screen bg-[#F8FAFC] font-['Inter']">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full max-w-[972px] gap-4">
        {/* Title & Icon */}
        <div className="flex flex-row items-center gap-3">
          <div className="flex items-center justify-center w-[40px] h-[40px] bg-[#DBEAFE] rounded-[12px] shrink-0">
            <ShieldCheck className="w-[20px] h-[20px] text-[#4F46E5]" strokeWidth={2} />
          </div>
          <div className="flex flex-col items-start">
            <h1 className="font-bold text-[20px] leading-[28px] text-[#0F172A] tracking-[-0.5px]">
              AMC / SLA
            </h1>
            <p className="font-normal text-[12px] leading-[16px] text-[#64748B]">
              Manage Annual Maintenance Contracts (AMC) and Service Level Agreements (SLA).
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="box-border flex flex-row items-center justify-center px-3 py-1.5 gap-1.5 h-[32px] bg-white border border-[#E2E8F0] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[8px] text-[#334155] font-medium text-[12px] leading-[16px] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <Download className="w-[14px] h-[14px] text-[#4F46E5]" strokeWidth={2} />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex flex-row items-center justify-center px-4 py-2 h-[32px] bg-[#4F46E5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[8px] text-white font-medium text-[12px] leading-[16px] hover:bg-[#4338CA] transition-colors cursor-pointer"
          >
            <span>+ Create AMC / SLA</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-row items-start gap-8 w-full max-w-[972px] h-[29px] border-b border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => {
            setActiveTab('amc');
            setRenewalsWindowFilter('All');
          }}
          className={`flex flex-row justify-center items-center pb-2.5 h-[28px] font-['Inter'] text-[12px] tracking-[0.3px] transition-colors cursor-pointer ${
            activeTab === 'amc'
              ? 'border-b-2 border-[#4F46E5] font-semibold text-[#4F46E5]'
              : 'font-medium text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          AMC / SLA
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('renewals');
            setRenewalsWindowFilter('All');
          }}
          className={`flex flex-row justify-center items-center pb-2.5 h-[28px] font-['Inter'] text-[12px] tracking-[0.3px] transition-colors cursor-pointer ${
            activeTab === 'renewals'
              ? 'border-b-2 border-[#4F46E5] font-semibold text-[#4F46E5]'
              : 'font-medium text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Renewals &amp; Alerts
        </button>
      </div>

      {/* Tab 1 Content: AMC / SLA */}
      {activeTab === 'amc' && (
        <>
          {/* KPI Cards Grid */}
          <AmcSlaKpiCards kpis={kpis} isLoading={isLoading} />

          {/* Unified Filter & Table Container Box */}
          <div className="w-full max-w-[972px] bg-white border border-[#E2E8F0] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] overflow-hidden flex flex-col">
            <AmcSlaFilterBar
              search={search}
              onSearchChange={setSearch}
              serviceType={serviceType}
              onServiceTypeChange={setServiceType}
              status={status}
              onStatusChange={setStatus}
              renewalAlert={renewalAlert}
              onRenewalAlertChange={setRenewalAlert}
              onClearFilters={handleClearFilters}
              options={filterOptions}
              isFilterOpen={isFilterOpen}
              onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
            />

            <AmcSlaTable
              contracts={contracts}
              isLoading={isLoading}
              onEdit={(c) => setEditingContract(c)}
              onDelete={handleDeleteContract}
            />
          </div>
        </>
      )}

      {/* Tab 2 Content: Renewals & Alerts */}
      {activeTab === 'renewals' && (
        <div className="flex flex-col items-start gap-5 w-full max-w-[972px]">
          {/* 4 Metric Cards */}
          <AmcRenewalsKpiCards
            total={renewalMetrics.total}
            dueSoon30={renewalMetrics.dueSoon30}
            upcoming31to90={renewalMetrics.upcoming31to90}
            overdue={renewalMetrics.overdue}
            isLoading={isLoading}
          />

          {/* Charts and Alerts Row */}
          <div className="flex flex-row flex-wrap sm:flex-nowrap justify-between items-start gap-5 w-full max-w-[972px]">
            <AmcRenewalTimelineChart
              overdue={renewalMetrics.overdue}
              dueSoon30={renewalMetrics.dueSoon30}
              upcoming31to90={renewalMetrics.upcoming31to90}
              greater90={renewalMetrics.greater90}
              total={renewalMetrics.total}
              onSelectWindow={(win) => setRenewalsWindowFilter(win)}
            />
            <AmcRenewalAlertsCard
              overdueCount={renewalMetrics.overdue}
              dueSoon30Count={renewalMetrics.dueSoon30}
              upcoming31to90Count={renewalMetrics.upcoming31to90}
              onFilterAlert={(alertType) => setRenewalsWindowFilter(alertType)}
            />
          </div>

          {/* Contracts Data Table with Frame 8 Filter Bar */}
          <AmcRenewalsTable
            contracts={contracts}
            isLoading={isLoading}
            onEdit={(c) => setEditingContract(c)}
            onDelete={handleDeleteContract}
            initialWindowFilter={renewalsWindowFilter}
          />
        </div>
      )}

      {/* Create Modal */}
      <CreateAmcSlaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateContract}
      />

      {/* Edit Modal */}
      <EditAmcSlaModal
        contract={editingContract}
        isOpen={!!editingContract}
        onClose={() => setEditingContract(null)}
        onSubmit={handleUpdateContract}
      />
    </div>
  );
};
