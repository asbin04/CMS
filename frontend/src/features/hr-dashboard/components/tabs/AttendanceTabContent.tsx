import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { AttendanceRecord, AttendanceFilterState, AttendanceSortOption } from '@/features/attendance/types/attendance';
import { attendanceService } from '@/features/attendance/services/attendanceService';
import { AttendanceTable } from '@/features/attendance/components/AttendanceTable';
import { AttendanceDetailModal } from '@/features/attendance/components/AttendanceDetailModal';
import { AddAttendanceModal } from '@/features/attendance/components/AddAttendanceModal';
import { ToastItem } from '@/components/ui/ToastNotification';

export interface AttendanceTabContentProps {
  initialStatusFilter?: string;
  initialLateFilter?: string;
  onDataChange?: () => void;
}

export const AttendanceTabContent: React.FC<AttendanceTabContentProps> = ({
  initialStatusFilter,
  initialLateFilter,
  onDataChange,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Filters State
  const initialFilterState: AttendanceFilterState = {
    searchQuery: '',
    dateRange: 'Oct 01, 2026 - Oct 31, 2026',
    employee: 'All Employees',
    status: initialStatusFilter || 'All',
    dayType: 'All',
    lateOnly: initialLateFilter || 'All',
    overtimeOnly: 'All',
  };

  const [filterState, setFilterState] = useState<AttendanceFilterState>(initialFilterState);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

  // Sync initialStatusFilter or initialLateFilter from parent
  useEffect(() => {
    if (initialStatusFilter || initialLateFilter) {
      setFilterState((prev) => ({
        ...prev,
        status: initialStatusFilter || prev.status,
        lateOnly: initialLateFilter || prev.lateOnly,
      }));
      setCurrentPage(1);
    }
  }, [initialStatusFilter, initialLateFilter]);

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<AttendanceSortOption>('date-desc');

  // Load live attendance from database via existing attendanceService
  const loadAttendance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await attendanceService.getAttendance();
      setRecords(data || []);
    } catch (err: any) {
      setError(err?.message || 'Could not fetch attendance records.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

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
    return Array.from(map.values());
  }, [records]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterState.searchQuery) count++;
    if (filterState.employee !== 'All Employees') count++;
    if (filterState.status !== 'All') count++;
    if (filterState.dayType !== 'All') count++;
    if (filterState.lateOnly !== 'All') count++;
    if (filterState.overtimeOnly !== 'All') count++;
    return count;
  }, [filterState]);

  // Filter & Sort Logic
  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (filterState.searchQuery.trim()) {
      const q = filterState.searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeId.toLowerCase().includes(q) ||
          (r.id && r.id.toLowerCase().includes(q))
      );
    }

    if (filterState.employee !== 'All Employees') {
      result = result.filter((r) => r.employeeId === filterState.employee);
    }

    if (filterState.status !== 'All') {
      result = result.filter((r) => r.status.toLowerCase() === filterState.status.toLowerCase());
    }

    if (filterState.dayType !== 'All') {
      result = result.filter((r) => r.dayType === filterState.dayType);
    }

    if (filterState.lateOnly === 'Yes') {
      result = result.filter((r) => r.isLate);
    }

    if (filterState.overtimeOnly === 'Yes') {
      result = result.filter((r) => r.hasOvertime);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.attendanceDate).getTime() - new Date(b.attendanceDate).getTime();
        case 'employee-asc':
          return a.employeeName.localeCompare(b.employeeName);
        case 'employee-desc':
          return b.employeeName.localeCompare(a.employeeName);
        case 'overtime-desc':
          return (b.overtimeMinutes || 0) - (a.overtimeMinutes || 0);
        case 'workhours-desc':
          return (b.workMinutes || 0) - (a.workMinutes || 0);
        case 'date-desc':
        default:
          return new Date(b.attendanceDate).getTime() - new Date(a.attendanceDate).getTime();
      }
    });

    return result;
  }, [records, filterState, sortBy]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Inline status update
  const handleUpdateStatus = async (recordId: string, newStatus: string) => {
    try {
      await attendanceService.updateAttendance(recordId, { status: newStatus as any });
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, status: newStatus as any } : r))
      );
    } catch {
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, status: newStatus as any } : r))
      );
    } finally {
      onDataChange?.();
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Search & Filter Toolbar Container (Exact Reference Specs) */}
      <div className="p-6 flex flex-col gap-4 w-full">
        {/* Row 1: Search Bar & Primary Action Buttons */}
        <div className="flex flex-row items-center gap-3 h-[38px] w-full">
          {/* Search Input Container */}
          <div className="relative flex-1 h-[38px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => {
                setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Search by Employee ID, Name, or Department..."
              className="w-full h-[38px] pl-10 pr-4 py-2 text-sm text-[#334155] placeholder:text-[#94A3B8] bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Primary Filter Buttons */}
          <div className="flex items-center gap-2 h-[34px] shrink-0">
            {/* Filters Button */}
            <button
              type="button"
              onClick={() => setIsFiltersVisible((prev) => !prev)}
              className={`h-[34px] px-3.5 flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs text-xs font-semibold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer ${
                isFiltersVisible ? 'bg-slate-50 border-slate-300' : ''
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Filters</span>
            </button>

            {/* Clear Filters Button */}
            <button
              type="button"
              onClick={() => {
                setFilterState(initialFilterState);
                setCurrentPage(1);
              }}
              className="h-[34px] px-3.5 flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs text-xs font-semibold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Secondary Dropdown Filters (Show/Hide via Filters button) */}
        {isFiltersVisible && (
          <div className="flex flex-col sm:flex-row items-start pt-1 gap-4 w-full">
            {/* 1. Status Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Status
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={filterState.status}
                  onChange={(e) => {
                    setFilterState((prev) => ({ ...prev, status: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  <option value="Present">Present</option>
                  <option value="Leave">Leave</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                  <option value="Holiday">Holiday</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Day Type Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Day Type
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={filterState.dayType}
                  onChange={(e) => {
                    setFilterState((prev) => ({ ...prev, dayType: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  <option value="Regular">Regular</option>
                  <option value="Weekend">Weekend</option>
                  <option value="Holiday">Holiday</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Late Status Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Late Status
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={filterState.lateOnly}
                  onChange={(e) => {
                    setFilterState((prev) => ({ ...prev, lateOnly: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="px-6 pb-6">
        <AttendanceTable
          records={paginatedRecords}
          totalCount={filteredRecords.length}
          currentPage={currentPage}
          pageSize={pageSize}
          sortBy={sortBy}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          onSortChange={setSortBy}
          onViewRecord={(record) => setSelectedRecord(record)}
          onEditRecord={(record) => setSelectedRecord(record)}
          onDeleteRecord={(id) => {
            setRecords((prev) => prev.filter((r) => r.id !== id));
          }}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <AttendanceDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdate={async (updated) => {
            await attendanceService.updateAttendance(updated.id, updated);
            await loadAttendance();
            onDataChange?.();
          }}
          onDelete={async (id) => {
            setRecords((prev) => prev.filter((r) => r.id !== id));
            onDataChange?.();
          }}
        />
      )}

      {/* Add Attendance Modal */}
      <AddAttendanceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (newRecord) => {
          await attendanceService.createAttendance(newRecord);
          await loadAttendance();
          onDataChange?.();
        }}
        employees={employeesList}
      />
    </div>
  );
};
