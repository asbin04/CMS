import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, RefreshCw, Download, Plus } from 'lucide-react';
import {
  CreateLeavePayload,
  LeaveFilterState,
  LeaveMetrics,
  LeaveRecord,
} from '../types/leave';
import { leaveService } from '../services/leaveService';
import { masterDataService } from '../../../services/masterDataService';
import { LeaveMetricCards } from '../components/LeaveMetricCards';
import { LeaveFilterBar } from '../components/LeaveFilterBar';
import { LeaveTable } from '../components/LeaveTable';
import { AddLeaveModal } from '../components/AddLeaveModal';
import { LeaveDetailModal } from '../components/LeaveDetailModal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { ToastNotification, ToastItem } from '../../../components/ui/ToastNotification';
import { AppLayoutContextType } from '../../../components/layout/AppLayout';

export const LeaveManagementPage: React.FC = () => {
  const outletContext = useOutletContext<AppLayoutContextType | null>();

  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [metrics, setMetrics] = useState<LeaveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('—');
  const [masterEmployees, setMasterEmployees] = useState<{ id: string; name: string }[]>([]);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LeaveRecord | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<LeaveFilterState>({
    search: '',
    dateRange: '',
    employee: 'All',
    leaveType: 'All',
    approvalStatus: 'All',
    leaveStatus: 'All',
    sortBy: 'From Date (Newest)',
  });

  // Sync with top navbar global search if provided
  useEffect(() => {
    if (outletContext?.searchQuery) {
      setFilters((prev) => ({ ...prev, search: outletContext.searchQuery }));
    }
  }, [outletContext?.searchQuery]);

  // Load master employees from backend
  useEffect(() => {
    masterDataService.getEmployees()
      .then((data) => {
        if (data && data.length > 0) {
          setMasterEmployees(data.map((e) => ({ id: e.employeeId, name: e.fullName })));
        }
      })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [leavesData, metricsData] = await Promise.all([
        leaveService.getLeaves(),
        leaveService.getMetrics(),
      ]);

      setLeaves(leavesData);
      setMetrics(metricsData);

      const now = new Date();
      setLastUpdated(
        now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to load leave records. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Dynamic employee options combining master employees & leaves
  const employeeOptions = useMemo(() => {
    const map = new Map<string, string>();
    // First populate from master employees
    masterEmployees.forEach((emp) => map.set(emp.id, emp.name));
    // Then ensure any employee in current leaves exists
    leaves.forEach((l) => {
      if (l.employeeId && l.employeeName && !map.has(l.employeeId)) {
        map.set(l.employeeId, l.employeeName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [masterEmployees, leaves]);

  // Unique leave type options derived dynamically
  const leaveTypeOptions = useMemo(() => {
    const set = new Set<string>([
      'Casual Leave',
      'Sick Leave',
      'Earned Leave',
      'Maternity Leave',
      'Paternity Leave',
      'Comp Off',
    ]);
    leaves.forEach((l) => {
      if (l.leaveType) set.add(l.leaveType);
    });
    return Array.from(set);
  }, [leaves]);

  // Dynamic filter logic
  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      // Search text
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesEmpId = item.employeeId.toLowerCase().includes(query);
        const matchesEmpName = item.employeeName.toLowerCase().includes(query);
        const matchesReason = item.reason.toLowerCase().includes(query);
        if (!matchesId && !matchesEmpId && !matchesEmpName && !matchesReason) {
          return false;
        }
      }

      // Date Range filter
      if (filters.dateRange.trim()) {
        const dateQuery = filters.dateRange.toLowerCase();
        const matchesFrom = item.fromDate.toLowerCase().includes(dateQuery);
        const matchesTo = item.toDate.toLowerCase().includes(dateQuery);
        if (!matchesFrom && !matchesTo) return false;
      }

      // Employee filter
      if (filters.employee !== 'All' && item.employeeId !== filters.employee) {
        return false;
      }

      // Leave Type filter
      if (filters.leaveType !== 'All' && item.leaveType !== filters.leaveType) {
        return false;
      }

      // Approval Status filter
      if (filters.approvalStatus !== 'All' && item.approvalStatus !== filters.approvalStatus) {
        return false;
      }

      // Leave Status filter
      if (filters.leaveStatus !== 'All' && item.leaveStatus !== filters.leaveStatus) {
        return false;
      }

      return true;
    });
  }, [leaves, filters]);

  // Dynamic sort logic
  const sortedLeaves = useMemo(() => {
    const list = [...filteredLeaves];
    switch (filters.sortBy) {
      case 'From Date (Oldest)':
        return list.reverse();
      case 'Days (High-Low)':
        return list.sort((a, b) => b.days - a.days);
      case 'Days (Low-High)':
        return list.sort((a, b) => a.days - b.days);
      case 'From Date (Newest)':
      default:
        return list;
    }
  }, [filteredLeaves, filters.sortBy]);

  // Paginated records
  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLeaves.slice(start, start + pageSize);
  }, [sortedLeaves, currentPage, pageSize]);

  const handleFilterChange = (updates: Partial<LeaveFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      dateRange: '',
      employee: 'All',
      leaveType: 'All',
      approvalStatus: 'All',
      leaveStatus: 'All',
      sortBy: 'From Date (Newest)',
    });
    if (outletContext?.setSearchQuery) {
      outletContext.setSearchQuery('');
    }
    setCurrentPage(1);
  };

  const handleCreateLeave = async (payload: CreateLeavePayload) => {
    try {
      const created = await leaveService.createLeave(payload);
      addToast({
        type: 'success',
        title: 'Leave Request Created',
        message: `Leave request ${created.id} for ${created.employeeName} submitted successfully.`,
        statusBadge: 'Pending',
      });
      await fetchData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: err?.message || 'Could not create leave request.',
      });
      throw err;
    }
  };

  const handleApprove = async (id: string, approverName = 'Rahul Mehta') => {
    try {
      const target = leaves.find((l) => l.id === id);
      const updated = await leaveService.updateLeave(id, {
        approvalStatus: 'Approved',
        approvedBy: approverName,
        leaveStatus: 'Approved',
      });
      addToast({
        type: 'success',
        title: 'Leave Request Approved',
        message: `Leave ${id} for ${target?.employeeName || 'employee'} has been approved by ${approverName}.`,
        statusBadge: 'Approved',
      });
      // Update selected record if open
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(updated);
      }
      await fetchData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Approval Failed',
        message: err?.message || 'Failed to approve leave request.',
      });
    }
  };

  const handleReject = async (id: string, approverName = 'Rahul Mehta') => {
    try {
      const target = leaves.find((l) => l.id === id);
      const updated = await leaveService.updateLeave(id, {
        approvalStatus: 'Rejected',
        approvedBy: approverName,
        leaveStatus: 'Rejected',
      });
      addToast({
        type: 'error',
        title: 'Leave Request Rejected',
        message: `Leave ${id} for ${target?.employeeName || 'employee'} has been rejected.`,
        statusBadge: 'Rejected',
      });
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(updated);
      }
      await fetchData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Rejection Failed',
        message: err?.message || 'Failed to reject leave request.',
      });
    }
  };

  const handleResetPending = async (id: string) => {
    try {
      const updated = await leaveService.updateLeave(id, {
        approvalStatus: 'Pending',
        approvedBy: '',
        leaveStatus: 'Pending',
      });
      addToast({
        type: 'warning',
        title: 'Marked as Pending',
        message: `Leave ${id} status reset to Pending.`,
        statusBadge: 'Pending',
      });
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(updated);
      }
      await fetchData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Failed to reset status.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await leaveService.deleteLeave(id);
      addToast({
        type: 'info',
        title: 'Leave Deleted',
        message: `Leave request ${id} has been permanently deleted.`,
      });
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(null);
      }
      await fetchData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err?.message || 'Failed to delete leave request.',
      });
    }
  };

  const handleExportCSV = () => {
    if (sortedLeaves.length === 0) return;
    const headers = [
      'LEAVE ID',
      'EMPLOYEE ID',
      'EMPLOYEE NAME',
      'LEAVE TYPE',
      'FROM DATE',
      'TO DATE',
      'DAYS',
      'REASON',
      'APPROVAL STATUS',
      'APPROVED BY',
      'CALCULATED DAYS',
      'LEAVE STATUS',
    ];

    const rows = sortedLeaves.map((l) => [
      `"${l.id}"`,
      `"${l.employeeId}"`,
      `"${l.employeeName}"`,
      `"${l.leaveType}"`,
      `"${l.fromDate}"`,
      `"${l.toDate}"`,
      l.days,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      `"${l.approvalStatus}"`,
      `"${l.approvedBy || '-'}"`,
      l.calculatedDays,
      `"${l.leaveStatus}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leave_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Export Complete',
      message: `Exported ${sortedLeaves.length} leave records to CSV.`,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} position="top-right" />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              View and manage employee leave requests, approvals and leave records.
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          <button
            type="button"
            onClick={fetchData}
            title="Refresh from database"
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Leave</span>
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* KPI Cards */}
      <LeaveMetricCards metrics={metrics} loading={loading} />

      {/* Filter Bar */}
      <LeaveFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        employeeOptions={employeeOptions}
        leaveTypeOptions={leaveTypeOptions}
      />

      {/* Table */}
      <LeaveTable
        records={paginatedLeaves}
        totalRecords={sortedLeaves.length}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        sortBy={filters.sortBy}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onSortChange={(sortBy) => handleFilterChange({ sortBy })}
        onViewDetails={setSelectedRecord}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
      />

      {/* Add Leave Modal */}
      <AddLeaveModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateLeave}
        employees={employeeOptions}
      />

      {/* Detail Modal */}
      <LeaveDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onResetPending={handleResetPending}
        onDelete={handleDelete}
      />
    </div>
  );
};
export default LeaveManagementPage;
