import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  DevelopmentRecord,
  DevelopmentFilterState,
  DevelopmentFormData,
  DevelopmentKpis,
  CodeReviewStatus,
  DevelopmentStatus,
} from '../types';
import { developmentApiService } from '../services/developmentApiService';

const DEFAULT_KPIS: DevelopmentKpis = {
  totalDevelopments: 0,
  totalTrend: '0% vs last month',
  inDevelopment: 0,
  inDevTrend: '0% vs last month',
  inCodeReview: 0,
  inReviewTrend: '0% vs last month',
  qaHandover: 0,
  qaTrend: '0% vs last month',
  released: 0,
  releasedTrend: '0% vs last month',
};

const formatTimestamp = (date: Date = new Date()): string => {
  return (
    date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ', ' +
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  );
};

export const useDevelopmentState = () => {
  const [records, setRecords] = useState<DevelopmentRecord[]>([]);
  const [kpis, setKpis] = useState<DevelopmentKpis>(DEFAULT_KPIS);
  const [lastUpdated, setLastUpdated] = useState<string>(() => formatTimestamp());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<DevelopmentFilterState>({
    search: '',
    project: 'All Projects',
    environment: 'All Environment',
    status: 'All Status',
    reviewStatus: 'All Review Status',
  });

  // Sorting State
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DevelopmentRecord | null>(null);

  // Next ID Preview State
  const [nextDevelopmentId, setNextDevelopmentId] = useState<string>('DEV-2026-0001');

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.project !== 'All Projects') count++;
    if (filters.environment !== 'All Environment') count++;
    if (filters.status !== 'All Status') count++;
    if (filters.reviewStatus !== 'All Review Status') count++;
    if (filters.search.trim()) count++;
    return count;
  }, [filters]);

  // Fetch developments from backend
  const fetchDevelopments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sortParam = sortField ? `${sortField},${sortOrder}` : 'createdAt,desc';
      const pageRes = await developmentApiService.getDevelopments({
        search: filters.search,
        project: filters.project,
        environment: filters.environment,
        status: filters.status,
        reviewStatus: filters.reviewStatus,
        sort: sortParam,
        page: currentPage,
        size: pageSize,
      });

      setRecords(pageRes.content);
      setTotalPages(pageRes.totalPages || 1);
      setTotalElements(pageRes.totalElements || 0);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to load development records from server';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortField, sortOrder, currentPage, pageSize]);

  // Fetch KPIs from backend
  const fetchKpis = useCallback(async () => {
    try {
      const kpisRes = await developmentApiService.getKpis();
      setKpis(kpisRes);
    } catch (err: any) {
      logError('Failed to fetch development KPIs', err);
    }
  }, []);

  // Fetch next ID preview
  const fetchNextId = useCallback(async () => {
    try {
      const nextId = await developmentApiService.getNextDevelopmentId();
      setNextDevelopmentId(nextId);
    } catch (err: any) {
      logError('Failed to fetch next development ID', err);
    }
  }, []);

  // Initial and reactive load
  useEffect(() => {
    fetchDevelopments();
  }, [fetchDevelopments]);

  useEffect(() => {
    fetchKpis();
    fetchNextId();
  }, [fetchKpis, fetchNextId]);

  // Handle column sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Filter and pagination handlers
  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setCurrentPage(1);
  };

  const handleProjectFilterChange = (project: string) => {
    setFilters((prev) => ({ ...prev, project }));
    setCurrentPage(1);
  };

  const handleEnvironmentFilterChange = (environment: string) => {
    setFilters((prev) => ({ ...prev, environment }));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    setCurrentPage(1);
  };

  const handleReviewStatusFilterChange = (reviewStatus: string) => {
    setFilters((prev) => ({ ...prev, reviewStatus }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      project: 'All Projects',
      environment: 'All Environment',
      status: 'All Status',
      reviewStatus: 'All Review Status',
    });
    setSortField(null);
    setSortOrder('asc');
    setCurrentPage(1);
    showToast('Filters cleared', 'info');
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Add Record
  const handleAddRecord = async (formData: DevelopmentFormData) => {
    try {
      const created = await developmentApiService.createDevelopment({
        projectId: formData.projectId,
        requirementId: formData.requirementId,
        taskId: formData.taskId,
        developerName: formData.developer,
        developerId: formData.developerId,
        repositoryUrl: formData.repositoryUrl,
        branch: formData.branch,
        environment: formData.environment,
        buildVersion: formData.buildVersion,
        codeReviewStatus: formData.codeReviewStatus,
        qaHandoffDate: formData.qaHandoffDate,
        releaseId: formData.releaseId,
        status: formData.status,
        technicalNotes: formData.technicalNotes,
        documentationLink: formData.documentationLink,
      });

      setIsAddModalOpen(false);
      showToast(`Development entry ${created.developmentId} created successfully`);
      await Promise.all([fetchDevelopments(), fetchKpis(), fetchNextId()]);
    } catch (err: any) {
      const msg = err?.message || 'Failed to create development record';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Edit Record
  const handleEditRecord = async (updatedRecord: DevelopmentRecord) => {
    try {
      const updated = await developmentApiService.updateDevelopment(updatedRecord.developmentId, {
        projectId: updatedRecord.projectId,
        requirementId: updatedRecord.requirementId,
        taskId: updatedRecord.taskId,
        developerName: updatedRecord.developer,
        repositoryUrl: updatedRecord.repositoryUrl,
        branch: updatedRecord.branch,
        environment: updatedRecord.environment,
        buildVersion: updatedRecord.buildVersion,
        codeReviewStatus: updatedRecord.codeReviewStatus,
        qaHandoffDate: updatedRecord.qaHandoffDate,
        releaseId: updatedRecord.releaseId,
        status: updatedRecord.status,
        technicalNotes: updatedRecord.technicalNotes,
        documentationLink: updatedRecord.documentationLink,
      });

      setRecords((prev) =>
        prev.map((r) => (r.developmentId === updated.developmentId ? updated : r))
      );
      setIsEditModalOpen(false);
      setSelectedRecord(null);
      showToast(`Development entry ${updated.developmentId} updated successfully`);
      await fetchKpis();
    } catch (err: any) {
      const msg = err?.message || 'Failed to update development record';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Update Code Review Status inline
  const handleUpdateCodeReviewStatus = async (
    developmentId: string,
    newReviewStatus: CodeReviewStatus
  ) => {
    const previousRecord = records.find((r) => r.developmentId === developmentId);
    // Optimistic update
    setRecords((prev) =>
      prev.map((r) =>
        r.developmentId === developmentId
          ? { ...r, codeReviewStatus: newReviewStatus }
          : r
      )
    );

    try {
      const updated = await developmentApiService.updateCodeReviewStatus(developmentId, newReviewStatus);
      setRecords((prev) =>
        prev.map((r) => (r.developmentId === developmentId ? updated : r))
      );
      showToast(`Code Review Status updated to ${newReviewStatus}`);
      await fetchKpis();
    } catch (err: any) {
      // Rollback on failure
      if (previousRecord) {
        setRecords((prev) =>
          prev.map((r) => (r.developmentId === developmentId ? previousRecord : r))
        );
      }
      const msg = err?.message || 'Failed to update code review status';
      showToast(msg, 'error');
    }
  };

  // Update Status inline
  const handleUpdateStatus = async (
    developmentId: string,
    newStatus: DevelopmentStatus
  ) => {
    const previousRecord = records.find((r) => r.developmentId === developmentId);
    // Optimistic update
    setRecords((prev) =>
      prev.map((r) =>
        r.developmentId === developmentId ? { ...r, status: newStatus } : r
      )
    );

    try {
      const updated = await developmentApiService.updateStatus(developmentId, newStatus);
      setRecords((prev) =>
        prev.map((r) => (r.developmentId === developmentId ? updated : r))
      );
      showToast(`Status updated to ${newStatus}`);
      await fetchKpis();
    } catch (err: any) {
      // Rollback on failure
      if (previousRecord) {
        setRecords((prev) =>
          prev.map((r) => (r.developmentId === developmentId ? previousRecord : r))
        );
      }
      const msg = err?.message || 'Failed to update development status';
      showToast(msg, 'error');
    }
  };

  // Delete Record
  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;
    const devId = selectedRecord.developmentId;
    try {
      await developmentApiService.deleteDevelopment(devId);
      setIsDeleteModalOpen(false);
      setSelectedRecord(null);
      showToast(`Development entry ${devId} deleted`, 'info');
      await Promise.all([fetchDevelopments(), fetchKpis(), fetchNextId()]);
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete development record';
      showToast(msg, 'error');
    }
  };

  // Refresh
  const handleRefresh = async () => {
    setLastUpdated(formatTimestamp());
    await Promise.all([fetchDevelopments(), fetchKpis(), fetchNextId()]);
    showToast('Development data refreshed');
  };

  // Export CSV
  const handleExport = async () => {
    try {
      await developmentApiService.exportDevelopments({
        search: filters.search,
        project: filters.project,
        environment: filters.environment,
        status: filters.status,
        reviewStatus: filters.reviewStatus,
      });
      showToast('Exported development records to CSV');
    } catch (err: any) {
      const msg = err?.message || 'Failed to export CSV';
      showToast(msg, 'error');
    }
  };

  // Open Modals
  const openViewModal = (record: DevelopmentRecord) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const openEditModal = (record: DevelopmentRecord) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (record: DevelopmentRecord) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  return {
    records,
    paginatedRecords: records,
    filteredRecords: records,
    sortedRecords: records,
    kpis,
    lastUpdated,
    isLoading,
    error,
    filters,
    sortField,
    sortOrder,
    activeFilterCount,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    isAddModalOpen,
    isViewModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedRecord,
    toast,
    nextDevelopmentId,
    setIsAddModalOpen,
    setIsViewModalOpen,
    setIsEditModalOpen,
    setIsDeleteModalOpen,
    setSelectedRecord,
    handleSearchChange,
    handleProjectFilterChange,
    handleEnvironmentFilterChange,
    handleStatusFilterChange,
    handleReviewStatusFilterChange,
    handleClearFilters,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleAddRecord,
    handleEditRecord,
    handleDeleteRecord,
    handleUpdateCodeReviewStatus,
    handleUpdateStatus,
    handleRefresh,
    handleExport,
    openViewModal,
    openEditModal,
    openDeleteModal,
    showToast,
    closeToast,
  };
};

function logError(msg: string, err: any) {
  if (typeof console !== 'undefined' && console.error) {
    console.error(msg, err);
  }
}
