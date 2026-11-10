import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  RequirementRecord,
  RequirementKpis,
  RequirementStatus,
  RequirementPriority,
  AddRequirementFormData,
} from '../types';
import { getInitialRequirementRecords } from '../mockData';
import { calculateRequirementKpis } from '../utils/calculations';
import { generateNextRequirementId } from '../utils/idGenerators';
import { exportRequirementsToCsv } from '../utils/csvExport';
import { formatDateForDisplay } from '../utils/formatters';
import { requirementsApiService } from '../services/requirementsApiService';

export const useRequirementsState = (initialList?: RequirementRecord[]) => {
  const [records, setRecords] = useState<RequirementRecord[]>(() => initialList || getInitialRequirementRecords());
  const [backendKpis, setBackendKpis] = useState<RequirementKpis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting state (default null preserves natural creation / stable ID order)
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Toggle manual column sorting
  const handleSort = useCallback((field: string) => {
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
  }, [sortField, sortOrder]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matches =
          r.requirementId.toLowerCase().includes(query) ||
          r.projectId.toLowerCase().includes(query) ||
          r.clientId.toLowerCase().includes(query) ||
          r.requirementFeature.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query)) ||
          r.ownerId.toLowerCase().includes(query);
        if (!matches) return false;
      }
      if (projectFilter !== 'All Projects' && r.projectId !== projectFilter) {
        return false;
      }
      if (typeFilter !== 'All Types' && r.type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      if (priorityFilter !== 'All Priorities' && r.priority.toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }
      if (statusFilter !== 'All Status' && r.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [records, search, projectFilter, typeFilter, priorityFilter, statusFilter]);

  // Sorted records (preserves stable default order unless manual sort is active)
  const sortedRecords = useMemo(() => {
    if (!sortField) {
      return filteredRecords;
    }
    return [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'requirementId':
          comparison = (a.requirementId || '').localeCompare(b.requirementId || '');
          break;
        case 'projectId':
          comparison = (a.projectId || '').localeCompare(b.projectId || '');
          break;
        case 'clientId':
          comparison = (a.clientId || '').localeCompare(b.clientId || '');
          break;
        case 'requirementDate': {
          const da = new Date(a.requirementDate).getTime() || 0;
          const db = new Date(b.requirementDate).getTime() || 0;
          comparison = da - db;
          break;
        }
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'requirementFeature':
          comparison = (a.requirementFeature || '').localeCompare(b.requirementFeature || '');
          break;
        case 'priority':
          comparison = (a.priority || '').localeCompare(b.priority || '');
          break;
        case 'ownerId':
          comparison = (a.ownerId || '').localeCompare(b.ownerId || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'scopeFreeze':
          comparison = (a.scopeFreeze || '').localeCompare(b.scopeFreeze || '');
          break;
        case 'approvedBy':
          comparison = (a.approvedBy || '').localeCompare(b.approvedBy || '');
          break;
        case 'approvalDate': {
          const da = new Date(a.approvalDate || '').getTime() || 0;
          const db = new Date(b.approvalDate || '').getTime() || 0;
          comparison = da - db;
          break;
        }
        case 'completionPercentage':
          comparison = (a.completionPercentage || 0) - (b.completionPercentage || 0);
          break;
        default:
          comparison = 0;
      }
      if (comparison === 0) {
        comparison = (b.requirementId || '').localeCompare(a.requirementId || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredRecords, sortField, sortOrder]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedRecords.slice(startIndex, startIndex + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  // Dynamic KPIs calculated from the entire dataset or backend
  const kpis: RequirementKpis = useMemo(() => {
    if (backendKpis) return backendKpis;
    return calculateRequirementKpis(records);
  }, [records, backendKpis]);

  // Fetch from Spring Boot backend
  const fetchFromBackend = useCallback(async () => {
    const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    if (isTestEnv) return;

    setIsLoading(true);
    setError(null);
    try {
      const [pagedRes, kpiRes] = await Promise.allSettled([
        requirementsApiService.getRequirements({
          search,
          project: projectFilter,
          type: typeFilter,
          priority: priorityFilter,
          status: statusFilter,
          page: 1,
          size: 500,
        }),
        requirementsApiService.getKpis(),
      ]);

      if (pagedRes.status === 'fulfilled' && pagedRes.value?.content) {
        setRecords(pagedRes.value.content);
      }
      if (kpiRes.status === 'fulfilled' && kpiRes.value) {
        setBackendKpis(kpiRes.value);
      }
      if (pagedRes.status === 'rejected') {
        const errorMsg = pagedRes.reason?.message || 'Failed to load requirements from server';
        setError(errorMsg);
      }
    } catch (err: any) {
      console.warn('Backend requirement fetch:', err?.message || err);
      setError(err?.message || 'Failed to load requirements from server');
    } finally {
      setIsLoading(false);
    }
  }, [search, projectFilter, typeFilter, priorityFilter, statusFilter]);

  useEffect(() => {
    fetchFromBackend();
  }, [fetchFromBackend]);

  // Add Requirement
  const addRequirement = useCallback(
    async (formData: AddRequirementFormData): Promise<RequirementRecord> => {
      const nextId = generateNextRequirementId(records);
      const fallbackEntry: RequirementRecord = {
        requirementId: nextId,
        projectId: formData.projectId,
        clientId: formData.clientId,
        requirementDate: formatDateForDisplay(formData.requirementDate),
        type: formData.type,
        requirementFeature: formData.requirementFeature.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        ownerId: formData.ownerId,
        status: formData.status,
        scopeFreeze: formData.scopeFreeze,
        assignedApprover: formData.assignedApprover || 'Akshit Ujjain',
        approvedBy:
          formData.status === 'Completed'
            ? (formData.assignedApprover?.includes('Gaurav') ? 'Gaurav Tripathy' : 'Akshit Ujjain')
            : '-',
        approvalDate:
          formData.status === 'Completed'
            ? (formData.approvalDate ? formatDateForDisplay(formData.approvalDate) : formatDateForDisplay(new Date()))
            : '-',
        completionPercentage:
          formData.status === 'Completed'
            ? 100
            : Math.min(100, Math.max(0, formData.completionPercentage)),
      };

      const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
      if (isTestEnv) {
        setRecords((prev) => [fallbackEntry, ...prev]);
        return fallbackEntry;
      }

      setIsLoading(true);
      setError(null);
      try {
        const persisted = await requirementsApiService.createRequirement({
          projectId: formData.projectId,
          clientId: formData.clientId,
          requirementFeature: formData.requirementFeature,
          featureName: formData.requirementFeature,
          title: formData.requirementFeature,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          ownerId: formData.ownerId,
          status: formData.status,
          scopeFreeze: formData.scopeFreeze === 'Yes',
          completionPercentage: formData.completionPercentage,
          requirementDate: formData.requirementDate,
          assignedApprover: formData.assignedApprover || 'CEO – Akshit Ujjain',
          approvedBy: formData.approvedBy,
          approvalDate: formData.approvalDate,
        });

        const finalRecord = persisted && persisted.requirementId ? persisted : fallbackEntry;
        setRecords((prev) => [finalRecord, ...prev]);
        requirementsApiService.getKpis().then(setBackendKpis).catch(() => {});
        return finalRecord;
      } catch (err: any) {
        console.error('Backend create requirement error:', err?.message || err);
        setError(err?.message || 'Failed to save requirement to database');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [records]
  );

  // Update existing record
  const updateRequirement = useCallback((id: string, updates: Partial<RequirementRecord>) => {
    const isCompleted = updates.status === 'Completed';
    const todayDisplay = formatDateForDisplay(new Date());

    setRecords((prev) =>
      prev.map((r) => {
        if (r.requirementId === id) {
          const updated = { ...r, ...updates };
          const assigned = updated.assignedApprover || r.assignedApprover || 'Akshit Ujjain';
          const designatedName = assigned.toLowerCase().includes('gaurav') ? 'Gaurav Tripathy' : 'Akshit Ujjain';
          if (isCompleted) {
            updated.completionPercentage = 100;
            updated.approvedBy = designatedName;
            updated.approvalDate = todayDisplay;
          } else if (updates.status && updates.status !== 'Completed') {
            updated.approvedBy = '-';
            updated.approvalDate = '-';
          }
          return updated;
        }
        return r;
      })
    );

    // Persist to backend
    requirementsApiService
      .updateRequirement(id, {
        requirementFeature: updates.requirementFeature,
        description: updates.description,
        type: updates.type,
        priority: updates.priority,
        ownerId: updates.ownerId,
        status: updates.status,
        completionPercentage: updates.completionPercentage,
        assignedApprover: updates.assignedApprover,
      })
      .then((persisted) => {
        if (persisted) {
          setRecords((prev) =>
            prev.map((r) => (r.requirementId === id ? { ...r, ...persisted } : r))
          );
        }
        requirementsApiService.getKpis().then(setBackendKpis).catch(() => {});
      })
      .catch((err) => {
        console.warn('Backend update requirement notice:', err?.message || err);
      });
  }, []);

  // Delete
  const deleteRequirement = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.requirementId !== id));

    // Persist to backend
    requirementsApiService.deleteRequirement(id).catch((err) => {
      console.warn('Backend delete requirement notice:', err?.message || err);
    });
  }, []);

  // Inline Status update
  const updateStatus = useCallback((id: string, newStatus: RequirementStatus) => {
    const isCompleted = newStatus === 'Completed';
    const todayDisplay = formatDateForDisplay(new Date());

    setRecords((prev) =>
      prev.map((r) => {
        if (r.requirementId === id) {
          const assigned = r.assignedApprover || 'Akshit Ujjain';
          const designatedName = assigned.toLowerCase().includes('gaurav') ? 'Gaurav Tripathy' : 'Akshit Ujjain';
          return {
            ...r,
            status: newStatus,
            completionPercentage: isCompleted ? 100 : r.completionPercentage,
            approvedBy: isCompleted ? designatedName : '-',
            approvalDate: isCompleted ? todayDisplay : '-',
          };
        }
        return r;
      })
    );

    // Persist to backend
    const apiCall = isCompleted
      ? requirementsApiService.approveRequirement(id)
      : requirementsApiService.updateStatus(id, newStatus);

    apiCall
      .then((persisted) => {
        if (persisted) {
          setRecords((prev) =>
            prev.map((r) => (r.requirementId === id ? { ...r, ...persisted } : r))
          );
        }
        requirementsApiService.getKpis().then(setBackendKpis).catch(() => {});
      })
      .catch((err) => {
        console.warn('Backend update requirement status notice:', err?.message || err);
      });
  }, []);

  // Inline Priority update
  const updatePriority = useCallback((id: string, newPriority: RequirementPriority) => {
    setRecords((prev) =>
      prev.map((r) => (r.requirementId === id ? { ...r, priority: newPriority } : r))
    );

    // Persist to backend
    requirementsApiService.updateRequirement(id, { priority: newPriority }).catch((err) => {
      console.warn('Backend update requirement priority notice:', err?.message || err);
    });
  }, []);

  // Toggle Scope Freeze
  const toggleScopeFreeze = useCallback((id: string, frozen: boolean, reason?: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.requirementId === id ? { ...r, scopeFreeze: frozen ? 'Yes' : 'No' } : r))
    );

    // Persist to backend
    requirementsApiService.toggleScopeFreeze(id, frozen, reason).catch((err) => {
      console.warn('Backend toggle scope freeze notice:', err?.message || err);
    });
  }, []);

  // Export CSV of currently filtered dataset
  const exportCsv = useCallback(() => {
    return exportRequirementsToCsv(filteredRecords);
  }, [filteredRecords]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearch('');
    setProjectFilter('All Projects');
    setTypeFilter('All Types');
    setPriorityFilter('All Priorities');
    setStatusFilter('All Status');
    setSortField(null);
    setSortOrder('desc');
    setCurrentPage(1);
  }, []);

  return {
    records,
    filteredRecords,
    paginatedRecords,
    totalRecordsCount: filteredRecords.length,
    kpis,
    isLoading,
    error,
    sortField,
    sortOrder,
    handleSort,
    search,
    setSearch: (s: string) => {
      setSearch(s);
      setCurrentPage(1);
    },
    projectFilter,
    setProjectFilter: (p: string) => {
      setProjectFilter(p);
      setCurrentPage(1);
    },
    typeFilter,
    setTypeFilter: (t: string) => {
      setTypeFilter(t);
      setCurrentPage(1);
    },
    priorityFilter,
    setPriorityFilter: (pr: string) => {
      setPriorityFilter(pr);
      setCurrentPage(1);
    },
    statusFilter,
    setStatusFilter: (st: string) => {
      setStatusFilter(st);
      setCurrentPage(1);
    },
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize: (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
    },
    addRequirement,
    updateRequirement,
    deleteRequirement,
    updateStatus,
    updatePriority,
    toggleScopeFreeze,
    exportCsv,
    resetFilters,
    nextRequirementId: generateNextRequirementId(records),
    reload: fetchFromBackend,
  };
};

export const useRequirementState = useRequirementsState;
export default useRequirementsState;

