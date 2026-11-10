import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, Plus, ClipboardCheck, AlertCircle, RefreshCw } from 'lucide-react';
import {
  UatItem,
  UatKpis,
  UatFilterOptions,
  CreateUatPayload,
  UpdateUatPayload,
} from '../types/uat';
import { uatService, INITIAL_UAT_ITEMS, INITIAL_UAT_KPIS } from '../services/uatService';
import { UatKpiCards } from '../components/UatKpiCards';
import { UatFilterBar } from '../components/UatFilterBar';
import { UatTable } from '../components/UatTable';
import { AddUatModal } from '../components/AddUatModal';
import { EditUatModal } from '../components/EditUatModal';

export const UatPage: React.FC = () => {
  const [uats, setUats] = useState<UatItem[]>([]);
  const [kpis, setKpis] = useState<UatKpis>({
    totalUats: 0,
    totalTrend: '—',
    inTesting: 0,
    inTestingTrend: '—',
    passed: 0,
    passedTrend: '—',
    defectsLogged: 0,
    defectsLoggedTrend: '—',
    clientApproved: 0,
    clientApprovedTrend: '—',
  });
  const [filterOptions, setFilterOptions] = useState<UatFilterOptions>({
    projects: ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005'],
    statuses: ['Passed', 'In Testing', 'Failed'],
    clientApprovals: ['Approved', 'Pending'],
    testers: ['Amit Sharma', 'Sneha Nair', 'Divya Patel', 'Rohan Verma', 'Vikram Shah'],
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedApproval, setSelectedApproval] = useState('All');
  const [selectedTester, setSelectedTester] = useState('All');
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUat, setEditingUat] = useState<UatItem | null>(null);

  // Load data from live backend on mount and whenever filters change
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [uatsData, kpisData, filtersData] = await Promise.all([
        uatService.getUats({
          search: searchQuery.trim() || undefined,
          projectId: selectedProject !== 'All' ? selectedProject : undefined,
          status: selectedStatus !== 'All' ? selectedStatus : undefined,
          clientApproval: selectedApproval !== 'All' ? selectedApproval : undefined,
          tester: selectedTester !== 'All' ? selectedTester : undefined,
        }),
        uatService.getKpis(),
        uatService.getFilterOptions(),
      ]);
      setUats(uatsData || []);
      if (kpisData) {
        setKpis(kpisData);
      }
      if (filtersData) {
        setFilterOptions(filtersData);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to UAT backend service';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedProject, selectedStatus, selectedApproval, selectedTester]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedProject !== 'All') count++;
    if (selectedStatus !== 'All') count++;
    if (selectedApproval !== 'All') count++;
    if (selectedTester !== 'All') count++;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [selectedProject, selectedStatus, selectedApproval, selectedTester, searchQuery]);

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedProject('All');
    setSelectedStatus('All');
    setSelectedApproval('All');
    setSelectedTester('All');
    setCurrentPage(1);
  };

  // Client-side filtering
  const filteredUats = useMemo(() => {
    return uats.filter((item) => {
      // Search filter across UAT ID, Project ID, Requirement ID, Test Case, Tester Name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesProject = item.projectId.toLowerCase().includes(q);
        const matchesReq = item.requirementId.toLowerCase().includes(q);
        const matchesTestCase = item.testCase.toLowerCase().includes(q);
        const matchesExpected = item.expectedResult.toLowerCase().includes(q);
        const matchesActual = item.actualResult.toLowerCase().includes(q);
        const matchesTester = item.testerName.toLowerCase().includes(q);
        if (
          !matchesId &&
          !matchesProject &&
          !matchesReq &&
          !matchesTestCase &&
          !matchesExpected &&
          !matchesActual &&
          !matchesTester
        ) {
          return false;
        }
      }

      // Project filter
      if (selectedProject !== 'All' && item.projectId !== selectedProject) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'All' && item.status !== selectedStatus) {
        return false;
      }

      // Client Approval filter
      if (selectedApproval !== 'All' && item.clientApproval !== selectedApproval) {
        return false;
      }

      // Tester filter
      if (selectedTester !== 'All' && item.testerName !== selectedTester) {
        return false;
      }

      return true;
    });
  }, [uats, searchQuery, selectedProject, selectedStatus, selectedApproval, selectedTester]);

  // Total count from filtered live data
  const totalElements = filteredUats.length;

  // Paginated items for current page
  const paginatedUats = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUats.slice(startIndex, startIndex + pageSize);
  }, [filteredUats, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedProject, selectedStatus, selectedApproval, selectedTester, pageSize]);

  // Export CSV
  const handleExport = () => {
    uatService.exportCsv(filteredUats);
  };

  // Create UAT
  const handleCreateUat = async (payload: CreateUatPayload) => {
    await uatService.createUat(payload);
    await loadData();
  };

  // Update UAT
  const handleUpdateUat = async (id: string, payload: UpdateUatPayload) => {
    await uatService.updateUat(id, payload);
    await loadData();
  };

  // Delete UAT
  const handleDeleteUat = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete UAT record ${id}?`)) {
      try {
        await uatService.deleteUat(id);
        await loadData();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : `Failed to delete UAT record ${id}.`;
        alert(msg);
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
      {/* Section - Page Header with Icon, Title, Subtitle, and Action Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Left: Badge Icon + Heading & Subtitle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Emerald Badge Icon (48x48px, #ECFDF5, border #D1FAE5, radius 12px) */}
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
            <ClipboardCheck size={24} color="#059669" strokeWidth={1.8} />
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
              UAT (User Acceptance Testing)
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
              Manage UAT executions, test results, defects and client approvals.
            </p>
          </div>
        </div>

        {/* Right: Export Button and + Add UAT Button */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
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
              justifyContent: 'center',
              padding: '8px 16px',
              gap: '8px',
              height: '34px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '16px',
              color: '#334155',
            }}
            className="hover:bg-slate-50 transition-colors"
          >
            <Download size={16} color="#64748B" strokeWidth={1.5} />
            <span>Export</span>
          </button>

          {/* + Add UAT Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 16px',
              gap: '8px',
              height: '34px',
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
            className="hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2} />
            <span>Add UAT</span>
          </button>
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

      {/* Section - 5 KPI Metric Cards */}
      <UatKpiCards kpis={kpis} isLoading={isLoading} />

      {/* Section - Filter Controls Bar */}
      <UatFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedApproval={selectedApproval}
        onApprovalChange={setSelectedApproval}
        selectedTester={selectedTester}
        onTesterChange={setSelectedTester}
        filterOptions={filterOptions}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
        isFiltersOpen={isFiltersOpen}
        onToggleFilters={() => setIsFiltersOpen((prev) => !prev)}
      />

      {/* Section - 14-Column Table with Pagination */}
      <UatTable
        uats={paginatedUats}
        onEdit={(item) => setEditingUat(item)}
        onDelete={handleDeleteUat}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalElements={totalElements}
      />

      {/* Modals */}
      <AddUatModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateUat}
        projectOptions={filterOptions.projects}
      />

      <EditUatModal
        isOpen={editingUat !== null}
        onClose={() => setEditingUat(null)}
        onSubmit={handleUpdateUat}
        uat={editingUat}
        projectOptions={filterOptions.projects}
      />
    </div>
  );
};

