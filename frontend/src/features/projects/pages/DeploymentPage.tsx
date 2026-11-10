import React, { useState, useEffect, useCallback } from 'react';
import { Rocket, Download, Plus } from 'lucide-react';
import {
  DeploymentItem,
  DeploymentKpis,
  DeploymentFilterOptions,
  CreateDeploymentPayload,
  UpdateDeploymentPayload,
} from '../types/deployment';
import { deploymentService, INITIAL_DEPLOYMENT_ITEMS, INITIAL_DEPLOYMENT_KPIS } from '../services/deploymentService';
import { DeploymentKpiCards } from '../components/DeploymentKpiCards';
import { DeploymentFilterBar } from '../components/DeploymentFilterBar';
import { DeploymentTable } from '../components/DeploymentTable';
import { AddDeploymentModal } from '../components/AddDeploymentModal';
import { EditDeploymentModal } from '../components/EditDeploymentModal';
import { ViewDeploymentModal } from '../components/ViewDeploymentModal';

export const DeploymentPage: React.FC = () => {
  const [deployments, setDeployments] = useState<DeploymentItem[]>(INITIAL_DEPLOYMENT_ITEMS);
  const [kpis, setKpis] = useState<DeploymentKpis>(INITIAL_DEPLOYMENT_KPIS);
  const [filterOptions, setFilterOptions] = useState<DeploymentFilterOptions>({
    environments: ['Production', 'Staging', 'UAT', 'QA'],
    deploymentStatuses: ['Successful', 'Failed', 'In-Progress'],
    handoverStatuses: ['Handed Over', 'Pending'],
    projects: ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005'],
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [environment, setEnvironment] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [handoverStatus, setHandoverStatus] = useState<string>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingDeployment, setEditingDeployment] = useState<DeploymentItem | null>(null);
  const [viewingDeployment, setViewingDeployment] = useState<DeploymentItem | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [deploymentsData, kpisData, filtersData] = await Promise.all([
        deploymentService.getDeployments({
          search: search.trim() || undefined,
          environment: environment !== 'All' ? environment : undefined,
          status: status !== 'All' ? status : undefined,
          handoverStatus: handoverStatus !== 'All' ? handoverStatus : undefined,
        }),
        deploymentService.getKpis(),
        deploymentService.getFilterOptions(),
      ]);

      setDeployments(deploymentsData || INITIAL_DEPLOYMENT_ITEMS);
      if (kpisData) setKpis(kpisData);
      if (filtersData) setFilterOptions(filtersData);
    } catch {
      setDeployments(INITIAL_DEPLOYMENT_ITEMS);
    } finally {
      setIsLoading(false);
    }
  }, [search, environment, status, handoverStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClearFilters = () => {
    setSearch('');
    setEnvironment('All');
    setStatus('All');
    setHandoverStatus('All');
  };

  const handleCreateDeployment = async (payload: CreateDeploymentPayload) => {
    try {
      await deploymentService.createDeployment(payload);
      await fetchData();
    } catch {
      // Local optimistic fallback
      const newItem: DeploymentItem = {
        id: `DEP-2026-${String(deployments.length + 187).padStart(4, '0')}`,
        projectId: payload.projectId,
        releaseVersion: payload.releaseVersion,
        deploymentDate: payload.deploymentDate,
        environment: payload.environment,
        deploymentOwner: payload.deploymentOwner,
        preDeploymentChecklist: payload.preDeploymentChecklist || 'Completed',
        backupCompleted: payload.backupCompleted || 'Yes',
        rollbackPlan: payload.rollbackPlan || 'Available',
        smokeTest: payload.smokeTest || 'Successful',
        status: payload.status || 'Live',
        clientSignOff: payload.clientSignOff || 'Completed',
        goLiveDate: payload.goLiveDate || '-',
        handoverStatus: payload.handoverStatus || 'Handed Over',
        releaseNotes: payload.releaseNotes || '',
      };
      setDeployments([newItem, ...deployments]);
    }
  };

  const handleUpdateDeployment = async (id: string, payload: UpdateDeploymentPayload) => {
    try {
      await deploymentService.updateDeployment(id, payload);
      await fetchData();
    } catch {
      setDeployments(
        deployments.map((d) => (d.id === id ? { ...d, ...payload } : d))
      );
    }
  };

  const handleDeleteDeployment = async (deployment: DeploymentItem) => {
    if (window.confirm(`Are you sure you want to delete deployment ${deployment.id}?`)) {
      try {
        await deploymentService.deleteDeployment(deployment.id);
        await fetchData();
      } catch {
        setDeployments(deployments.filter((d) => d.id !== deployment.id));
      }
    }
  };

  const handleExport = () => {
    deploymentService.exportCsv(deployments);
  };

  const projectOptions = filterOptions.projects || ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005'];

  return (
    <div className="flex flex-col p-6 gap-6 w-full min-h-screen bg-[#F8FAFC] font-['Inter']">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        {/* Title and Icon */}
        <div className="flex flex-row items-center gap-3">
          <div className="flex items-center justify-center w-[40px] h-[40px] bg-[#ECFDF5] rounded-[12px] shrink-0 border border-[#A7F3D0]">
            <Rocket className="w-[20px] h-[20px] text-[#059669]" strokeWidth={2} />
          </div>
          <div className="flex flex-col items-start">
            <h1 className="font-bold text-[20px] leading-[28px] text-[#0F172A] tracking-[-0.5px]">
              Deployment / Go-Live
            </h1>
            <p className="font-normal text-[12px] leading-[16px] text-[#64748B]">
              Track and manage releases, deployments, go-live activities and handover status.
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
            onClick={() => setIsAddModalOpen(true)}
            className="flex flex-row items-center justify-center px-4 py-2 gap-1.5 h-[32px] bg-[#4F46E5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[8px] text-white font-medium text-[12px] leading-[16px] hover:bg-[#4338CA] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deployment</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="w-full">
        <DeploymentKpiCards kpis={kpis} isLoading={isLoading} />
      </div>

      {/* Main Table Container Box */}
      <div className="w-full bg-white border border-[#E2E8F0] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] overflow-hidden flex flex-col">
        <DeploymentFilterBar
          search={search}
          onSearchChange={setSearch}
          environment={environment}
          onEnvironmentChange={setEnvironment}
          status={status}
          onStatusChange={setStatus}
          handoverStatus={handoverStatus}
          onHandoverStatusChange={setHandoverStatus}
          onClearFilters={handleClearFilters}
          options={filterOptions}
          isFilterOpen={isFilterOpen}
          onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
        />

        <DeploymentTable
          deployments={deployments}
          isLoading={isLoading}
          onView={(d) => setViewingDeployment(d)}
          onEdit={(d) => setEditingDeployment(d)}
          onDelete={handleDeleteDeployment}
        />
      </div>

      {/* Modals */}
      <AddDeploymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateDeployment}
        projectOptions={projectOptions}
      />

      <EditDeploymentModal
        isOpen={!!editingDeployment}
        deployment={editingDeployment}
        onClose={() => setEditingDeployment(null)}
        onSubmit={handleUpdateDeployment}
        projectOptions={projectOptions}
      />

      <ViewDeploymentModal
        isOpen={!!viewingDeployment}
        deployment={viewingDeployment}
        onClose={() => setViewingDeployment(null)}
      />
    </div>
  );
};

