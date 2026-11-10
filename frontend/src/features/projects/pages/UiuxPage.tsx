import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, Plus, Monitor, AlertCircle, RefreshCw } from 'lucide-react';
import {
  UiuxDesignItem,
  UiuxKpis,
  UiuxFilterOptions,
  CreateUiuxPayload,
  UpdateUiuxPayload,
} from '../types/uiux';
import { uiuxService, INITIAL_UIUX_DESIGNS, INITIAL_UIUX_KPIS } from '../services/uiuxService';
import { UiuxKpiCards } from '../components/UiuxKpiCards';
import { UiuxFilterBar } from '../components/UiuxFilterBar';
import { UiuxTable } from '../components/UiuxTable';
import { AddDesignModal } from '../components/AddDesignModal';
import { EditDesignModal } from '../components/EditDesignModal';
import { ToastNotification, useToast } from '@/components/ui/ToastNotification';

export const UiuxPage: React.FC = () => {
  const [designs, setDesigns] = useState<UiuxDesignItem[]>(INITIAL_UIUX_DESIGNS);
  const [kpis, setKpis] = useState<UiuxKpis>(INITIAL_UIUX_KPIS);
  const [filterOptions, setFilterOptions] = useState<UiuxFilterOptions>({
    projects: ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005'],
    designTypes: ['UI Design', 'UI/UX'],
    approvalStatuses: ['Pending', 'Approved'],
    statuses: ['In Progress', 'Completed'],
    designers: ['Amit Sharma', 'Sneha Nair', 'Divya Patel', 'Rohan Verma', 'Vikram Shah'],
  });

  // Toast notifications for bottom-right popups
  const { toasts, addToast, removeToast } = useToast();

  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedDesignType, setSelectedDesignType] = useState('All');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<UiuxDesignItem | null>(null);

  // Load data from live backend on mount
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [designsData, kpisData, filtersData] = await Promise.all([
        uiuxService.getDesigns(),
        uiuxService.getKpis(),
        uiuxService.getFilterOptions(),
      ]);
      if (designsData) {
        setDesigns(designsData);
      }
      if (kpisData) {
        setKpis(kpisData);
      }
      if (filtersData) {
        setFilterOptions(filtersData);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to UI/UX backend service';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side filtering
  const filteredDesigns = useMemo(() => {
    return designs.filter((item) => {
      // Search filter across Design ID, Project ID, Requirement ID, Screen / Feature, Designer
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesProject = item.projectId.toLowerCase().includes(q);
        const matchesReq = item.requirementId.toLowerCase().includes(q);
        const matchesScreen = item.screenFeature.toLowerCase().includes(q);
        const matchesDesigner = item.designer.toLowerCase().includes(q);
        if (!matchesId && !matchesProject && !matchesReq && !matchesScreen && !matchesDesigner) {
          return false;
        }
      }

      // Project filter
      if (selectedProject !== 'All' && item.projectId !== selectedProject) {
        return false;
      }

      // Design Type filter
      if (selectedDesignType !== 'All' && item.designType !== selectedDesignType) {
        return false;
      }

      // Approval Status filter
      if (selectedApprovalStatus !== 'All' && item.approvalStatus !== selectedApprovalStatus) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'All' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [designs, searchQuery, selectedProject, selectedDesignType, selectedApprovalStatus, selectedStatus]);

  // Total requirements count directly from filtered live data
  const totalElements = filteredDesigns.length;

  // Paginated designs for current page
  const paginatedDesigns = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDesigns.slice(startIndex, startIndex + pageSize);
  }, [filteredDesigns, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedProject, selectedDesignType, selectedApprovalStatus, selectedStatus, pageSize]);

  // Handlers
  const handleExport = () => {
    uiuxService.exportCsv(filteredDesigns);
  };

  const handleCreateDesign = async (payload: CreateUiuxPayload) => {
    try {
      await uiuxService.createDesign(payload);
      addToast('success', 'Design Created', 'Design deliverable created successfully.');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create design deliverable.';
      addToast('error', 'Creation Failed', msg);
    }
  };

  const handleUpdateDesign = async (id: string, payload: UpdateUiuxPayload) => {
    try {
      await uiuxService.updateDesign(id, payload);
      addToast('success', 'Design Updated', `Design ${id} updated successfully.`);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to update design ${id}.`;
      addToast('error', 'Update Failed', msg);
    }
  };

  const handleDeleteDesign = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete design ${id}?`)) {
      try {
        await uiuxService.deleteDesign(id);
        addToast('success', 'Design Deleted', `Design ${id} deleted successfully.`);
        await loadData();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : `Failed to delete design ${id}.`;
        addToast('error', 'Delete Failed', msg);
      }
    }
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
        minHeight: '100%',
        boxSizing: 'border-box',
        background: '#F8FAFC',
      }}
    >
      {/* Section - Breadcrumb and Page Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          height: '48px',
          boxSizing: 'border-box',
          gap: '12px',
        }}
      >
        {/* Green Badge Icon (48x48px, #ECFDF5, border #D1FAE5, radius 12px) */}
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '48px',
            height: '48px',
            background: '#ECFDF5',
            border: '1px solid #D1FAE5',
            borderRadius: '12px',
            flexShrink: 0,
          }}
        >
          <Monitor size={24} color="#059669" strokeWidth={1.8} />
        </div>

        {/* Heading and Description */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '2px',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '28px',
              letterSpacing: '-0.5px',
              color: '#0F172A',
            }}
          >
            UI/UX
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '16px',
              color: '#64748B',
            }}
          >
            Manage design deliverables, versions, client feedback, approvals and change requests.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '10px 16px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            fontFamily: 'Inter',
            fontSize: '13px',
            color: '#991B1B',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} color="#DC2626" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadData()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} color="#FFFFFF" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Section - KPI Metric Cards */}
      <UiuxKpiCards kpis={kpis} />

      {/* Section - Tabs and Action Buttons Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: '100%',
          height: '34px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '10px',
            width: '221px',
            height: '34px',
          }}
        >
          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '8px 14px',
              gap: '6px',
              width: '90.11px',
              height: '34px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '16px',
              color: '#334155',
            }}
            className="hover:bg-slate-50 transition-colors"
          >
            <Download size={16} color="#64748B" strokeWidth={1.33} />
            <span>Export</span>
          </button>

          {/* + Add Design Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '8px 16px',
              gap: '6px',
              width: '120.89px',
              height: '32px',
              background: '#4F46E5',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '16px',
              color: '#FFFFFF',
            }}
            className="hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={1.33} />
            <span>Add Design</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <UiuxFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        selectedDesignType={selectedDesignType}
        onDesignTypeChange={setSelectedDesignType}
        selectedApprovalStatus={selectedApprovalStatus}
        onApprovalStatusChange={setSelectedApprovalStatus}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        filterOptions={filterOptions}
        onToggleMoreFilters={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
        isMoreFiltersOpen={isMoreFiltersOpen}
      />

      {/* 17 Columns Data Table & Pagination */}
      <UiuxTable
        designs={paginatedDesigns}
        onEdit={(item) => setEditingDesign(item)}
        onDelete={handleDeleteDesign}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalElements={totalElements}
      />

      {/* Modals */}
      <AddDesignModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateDesign}
        projectOptions={filterOptions.projects}
      />

      <EditDesignModal
        isOpen={!!editingDesign}
        design={editingDesign}
        onClose={() => setEditingDesign(null)}
        onSubmit={handleUpdateDesign}
        projectOptions={filterOptions.projects}
      />

      {/* Small Toast Popup on Bottom Right */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} position="bottom-right" />
    </div>
  );
};
