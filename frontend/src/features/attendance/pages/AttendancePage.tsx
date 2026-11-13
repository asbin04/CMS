import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Plus, Upload, Download, Loader2 } from 'lucide-react';
import { ReloadButton } from '../../../components/ui/ReloadButton';
import { AttendanceRecord, AttendanceFilterState, AttendanceSortOption } from '../types/attendance';
import { attendanceService } from '../services/attendanceService';
import { AttendanceMetricCards } from '../components/AttendanceMetricCards';
import { AttendanceFilterBar } from '../components/AttendanceFilterBar';
import { AttendanceTable } from '../components/AttendanceTable';
import { AddAttendanceModal } from '../components/AddAttendanceModal';
import { AttendanceDetailModal } from '../components/AttendanceDetailModal';
import { ToastNotification, ToastItem } from '../../../components/ui/ToastNotification';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';

export const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('15 Oct 2026, 11:30 AM');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Quick Metric Filter (total, present, late, overtime)
  const [metricFilter, setMetricFilter] = useState<string | null>(null);

  // Filters State
  const initialFilterState: AttendanceFilterState = {
    searchQuery: '',
    dateRange: 'Oct 01, 2026 - Oct 31, 2026',
    employee: 'All Employees',
    status: 'All',
    dayType: 'All',
    lateOnly: 'All',
    overtimeOnly: 'All',
  };

  const [filterState, setFilterState] = useState<AttendanceFilterState>(initialFilterState);

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<AttendanceSortOption>('date-desc');

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

  // Fetch live attendance from database
  const loadAttendanceFromDb = async (showToast = false) => {
    try {
      setError(null);
      const data = await attendanceService.getAttendance();
      setRecords(data);
      if (showToast) {
        addToast('info', 'Attendance Refreshed', 'Synchronized live records from Supabase PostgreSQL.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Could not fetch attendance records from the database.';
      setError(msg);
      addToast('error', 'Database Connection Error', msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendanceFromDb();
  }, []);

  // Compute distinct employee list from records
  const employeesList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; initials: string; color: string }>();
    records.forEach((r) => {
      if (!map.has(r.employeeId)) {
        map.set(r.employeeId, {
          id: r.employeeId,
          name: r.employeeName,
          initials: r.avatarInitials,
          color: r.avatarColor,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
  }, [records]);

  // Metrics calculation from database records
  const metrics = useMemo(() => attendanceService.getMetrics(records), [records]);

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
    await loadAttendanceFromDb(true);
  };

  // Metric Card Quick Filter Click
  const handleMetricCardClick = (cardId: string | null) => {
    setMetricFilter(cardId);
    setCurrentPage(1);

    if (cardId === 'present') {
      setFilterState((prev) => ({ ...prev, status: 'Present', lateOnly: 'All', overtimeOnly: 'All' }));
    } else if (cardId === 'late') {
      setFilterState((prev) => ({ ...prev, status: 'All', lateOnly: 'Yes', overtimeOnly: 'All' }));
    } else if (cardId === 'overtime') {
      setFilterState((prev) => ({ ...prev, status: 'All', lateOnly: 'All', overtimeOnly: 'Yes' }));
    } else {
      setFilterState((prev) => ({ ...prev, status: 'All', lateOnly: 'All', overtimeOnly: 'All' }));
    }
  };

  // Clear Filters
  const handleClearFilters = () => {
    setFilterState(initialFilterState);
    setMetricFilter(null);
    setCurrentPage(1);
    addToast('info', 'Filters Cleared', 'Search and filter parameters have been reset.');
  };

  // Filter Updates
  const handleFilterChange = (updates: Partial<AttendanceFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
    setCurrentPage(1);
  };

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Search Query
      if (filterState.searchQuery.trim()) {
        const query = filterState.searchQuery.toLowerCase();
        const matchesQuery =
          (r.id || '').toLowerCase().includes(query) ||
          (r.employeeId || '').toLowerCase().includes(query) ||
          (r.employeeName || '').toLowerCase().includes(query);

        if (!matchesQuery) return false;
      }

      // 2. Employee filter
      if (filterState.employee !== 'All Employees' && r.employeeName !== filterState.employee) {
        return false;
      }

      // 3. Status filter
      if (filterState.status !== 'All' && r.status !== filterState.status) {
        return false;
      }

      // 4. Day Type filter
      if (filterState.dayType !== 'All' && r.dayType !== filterState.dayType) {
        return false;
      }

      // 5. Late Only
      if (filterState.lateOnly === 'Yes' && !r.isLate) return false;
      if (filterState.lateOnly === 'No' && r.isLate) return false;

      // 6. Overtime Only
      if (filterState.overtimeOnly === 'Yes' && !r.hasOvertime) return false;
      if (filterState.overtimeOnly === 'No' && r.hasOvertime) return false;

      return true;
    });
  }, [records, filterState]);

  // Sorting Logic
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];

    switch (sortBy) {
      case 'date-desc':
      case 'id-desc':
        return list.sort((a, b) => b.id.localeCompare(a.id));
      case 'date-asc':
      case 'id-asc':
        return list.sort((a, b) => a.id.localeCompare(b.id));
      case 'employee-asc':
        return list.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
      case 'employee-desc':
        return list.sort((a, b) => b.employeeName.localeCompare(a.employeeName));
      case 'overtime-desc':
        return list.sort((a, b) => (b.overtimeMinutes || 0) - (a.overtimeMinutes || 0));
      case 'workhours-desc':
        return list.sort((a, b) => (b.workMinutes || 0) - (a.workMinutes || 0));
      default:
        return list;
    }
  }, [filteredRecords, sortBy]);

  // Pagination Logic
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  // Add Attendance Handler
  const handleAddAttendance = async (data: Partial<AttendanceRecord>) => {
    try {
      const created = await attendanceService.createAttendance(data);
      setRecords((prev) => [created, ...prev]);
      addToast(
        'success',
        'Attendance Recorded',
        `Added record ${created.id} for ${created.employeeName} to live database.`
      );
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.message || 'Could not save attendance to database.');
    }
  };

  // Update Attendance Handler
  const handleUpdateAttendance = async (updated: AttendanceRecord) => {
    try {
      const saved = await attendanceService.updateAttendance(updated.id, updated);
      setRecords((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
      addToast(
        'success',
        'Record Updated',
        `Changes to attendance ${saved.id} were saved to database.`
      );
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message || 'Could not update record in database.');
    }
  };

  // Delete Attendance Handler
  const handleDeleteAttendance = async (id: string) => {
    try {
      await attendanceService.deleteAttendance(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      addToast('warning', 'Record Deleted', `Attendance ${id} was deleted from database.`);
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message || 'Could not delete record from database.');
    }
  };

  // Export to CSV Handler
  const handleExport = () => {
    if (filteredRecords.length === 0) {
      addToast('warning', 'Nothing to Export', 'There are no attendance records matching current filters.');
      return;
    }

    const headers = [
      'Attendance ID',
      'Date',
      'Employee ID',
      'Employee Name',
      'Status',
      'Check In',
      'Check Out',
      'Work Hours',
      'Overtime Hours',
      'Day Type',
      'Paid Day Equivalent',
      'Late Flag',
      'Overtime Value',
      'Remarks',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.id}"`,
      `"${r.attendanceDate}"`,
      `"${r.employeeId}"`,
      `"${r.employeeName.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.checkIn}"`,
      `"${r.checkOut}"`,
      `"${r.workHours}"`,
      `"${r.overtimeHours}"`,
      `"${r.dayType || 'Working Day'}"`,
      `"${r.paidDayEquivalent || '1.0'}"`,
      `"${r.lateFlag || (r.isLate ? 'Yes' : 'No')}"`,
      `"${r.overtimeValue || '₹ 0'}"`,
      `"${(r.remarks || '-').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Export Complete', `Exported ${filteredRecords.length} records to CSV.`);
  };

  // Import Handler (Mock file selection & toast feedback)
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv, .xlsx';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        addToast('info', 'File Received', `Importing attendance data from ${file.name}...`);
        setTimeout(() => {
          addToast('success', 'Import Successful', `Processed attendance logs from ${file.name}.`);
        }, 1200);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <p className="text-sm font-medium text-slate-500">Loading live attendance records from database...</p>
      </div>
    );
  }

  return (
    <div
      className="p-4 sm:p-6 w-full box-border font-sans bg-[#F8FAFC] flex flex-col items-start gap-5"
    >
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* Page Header Area */}
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
        {/* Left Heading with Emerald Icon Badge */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          {/* Badge 40x40 rounded 12px bg #ECFDF5 border #D1FAE5 */}
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
            <Calendar size={20} color="#059669" strokeWidth={2} />
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
              Attendance
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
              Track employee attendance, working hours, punctuality, and overtime records.
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Refresh Button */}
          <ReloadButton
            onClick={handleRefresh}
            isRefreshing={isRefreshing}
            title="Refresh database records"
          />

          {/* Import Button */}
          <button
            type="button"
            onClick={handleImport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: '#1E293B',
              cursor: 'pointer',
            }}
            title="Import attendance logs"
          >
            <Upload size={14} color="#64748B" />
            <span>Import</span>
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: '#1E293B',
              cursor: 'pointer',
            }}
            title="Export attendance records to CSV"
          >
            <Download size={14} color="#64748B" />
            <span>Export</span>
          </button>

          {/* + Add Attendance Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 14px',
              backgroundColor: '#4F46E5',
              border: 'none',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 1px 2px 0 rgba(79, 70, 229, 0.2)',
            }}
          >
            <Plus size={15} strokeWidth={2.4} />
            <span>Add Attendance</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onRetry={() => loadAttendanceFromDb(true)} />}

      {/* 4 KPI Metric Cards */}
      <AttendanceMetricCards
        metrics={metrics}
        activeFilter={metricFilter}
        onSelectFilter={handleMetricCardClick}
      />

      {/* Search and Filters Bar */}
      <AttendanceFilterBar
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        employees={employeesList}
      />

      {/* Table Section */}
      <AttendanceTable
        records={paginatedRecords}
        totalCount={filteredRecords.length}
        currentPage={currentPage}
        pageSize={pageSize}
        sortBy={sortBy}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onSortChange={setSortBy}
        onViewRecord={setSelectedRecord}
        onEditRecord={setSelectedRecord}
        onDeleteRecord={handleDeleteAttendance}
      />

      {/* Modals */}
      <AddAttendanceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddAttendance}
        employees={employeesList}
      />

      <AttendanceDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onUpdate={handleUpdateAttendance}
        onDelete={handleDeleteAttendance}
      />
    </div>
  );
};
