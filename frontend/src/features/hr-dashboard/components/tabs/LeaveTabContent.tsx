import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { LeaveRecord, LeaveFilterState, CreateLeavePayload } from '@/features/leave/types/leave';
import { leaveService } from '@/features/leave/services/leaveService';
import { masterDataService } from '@/services/masterDataService';
import { LeaveTable } from '@/features/leave/components/LeaveTable';
import { LeaveDetailModal } from '@/features/leave/components/LeaveDetailModal';
import { AddLeaveModal } from '@/features/leave/components/AddLeaveModal';

export interface LeaveTabContentProps {
  initialApprovalFilter?: string;
  onDataChange?: () => void;
}

export const LeaveTabContent: React.FC<LeaveTabContentProps> = ({
  initialApprovalFilter,
  onDataChange,
}) => {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [masterEmployees, setMasterEmployees] = useState<{ id: string; name: string }[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LeaveRecord | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const defaultFilters: LeaveFilterState = {
    search: '',
    dateRange: '',
    employee: 'All',
    leaveType: 'All',
    approvalStatus: initialApprovalFilter || 'All',
    leaveStatus: 'All',
    sortBy: 'From Date (Newest)',
  };
  const [filters, setFilters] = useState<LeaveFilterState>(defaultFilters);
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

  // Sync initialApprovalFilter from parent
  useEffect(() => {
    if (initialApprovalFilter) {
      setFilters((prev) => ({ ...prev, approvalStatus: initialApprovalFilter }));
      setCurrentPage(1);
    }
  }, [initialApprovalFilter]);

  // Load master employees from backend
  useEffect(() => {
    masterDataService
      .getEmployees()
      .then((data) => {
        if (data && data.length > 0) {
          setMasterEmployees(data.map((e) => ({ id: e.employeeId, name: e.fullName })));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch real leaves from backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leaveService.getLeaves();
      setLeaves(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch leave records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Unique employee options derived dynamically
  const employeeOptions = useMemo(() => {
    if (masterEmployees.length > 0) return masterEmployees;
    const map = new Map<string, { id: string; name: string }>();
    leaves.forEach((l) => {
      if (l.employeeId && !map.has(l.employeeId)) {
        map.set(l.employeeId, { id: l.employeeId, name: l.employeeName });
      }
    });
    return Array.from(map.values());
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

  // Filter & Sort Logic
  const filteredLeaves = useMemo(() => {
    let result = [...leaves];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.employeeName.toLowerCase().includes(q) ||
          l.employeeId.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          (l.reason && l.reason.toLowerCase().includes(q))
      );
    }

    if (filters.employee !== 'All') {
      result = result.filter((l) => l.employeeName === filters.employee);
    }

    if (filters.leaveType !== 'All') {
      result = result.filter((l) => l.leaveType === filters.leaveType);
    }

    if (filters.approvalStatus !== 'All') {
      result = result.filter((l) => l.approvalStatus === filters.approvalStatus);
    }

    if (filters.leaveStatus !== 'All') {
      result = result.filter((l) => l.leaveStatus === filters.leaveStatus);
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'From Date (Oldest)':
          return new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime();
        case 'Days (High-Low)':
          return b.days - a.days;
        case 'Days (Low-High)':
          return a.days - b.days;
        case 'From Date (Newest)':
        default:
          return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
      }
    });

    return result;
  }, [leaves, filters]);

  // Paginated records
  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeaves.slice(start, start + pageSize);
  }, [filteredLeaves, currentPage, pageSize]);

  // Approval handlers
  const handleApprove = async (id: string) => {
    try {
      await leaveService.updateLeave(id, { approvalStatus: 'Approved', leaveStatus: 'Approved' });
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, approvalStatus: 'Approved', leaveStatus: 'Approved' } : l
        )
      );
    } catch {
      // Local fallback update
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, approvalStatus: 'Approved', leaveStatus: 'Approved' } : l
        )
      );
    } finally {
      onDataChange?.();
    }
  };

  const handleReject = async (id: string) => {
    try {
      await leaveService.updateLeave(id, { approvalStatus: 'Rejected', leaveStatus: 'Rejected' });
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, approvalStatus: 'Rejected', leaveStatus: 'Rejected' } : l
        )
      );
    } catch {
      // Local fallback update
      setLeaves((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, approvalStatus: 'Rejected', leaveStatus: 'Rejected' } : l
        )
      );
    } finally {
      onDataChange?.();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await leaveService.deleteLeave(id);
      setLeaves((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setLeaves((prev) => prev.filter((l) => l.id !== id));
    } finally {
      onDataChange?.();
    }
  };

  const handleUpdateStatus = async (
    id: string,
    field: 'approvalStatus' | 'leaveStatus',
    newStatus: string
  ) => {
    try {
      const payload: any = { [field]: newStatus };
      if (field === 'approvalStatus') {
        payload.leaveStatus = newStatus;
      }
      await leaveService.updateLeave(id, payload);
      setLeaves((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...payload } : l))
      );
    } catch {
      const payload: any = { [field]: newStatus };
      if (field === 'approvalStatus') {
        payload.leaveStatus = newStatus;
      }
      setLeaves((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...payload } : l))
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
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Search by Employee ID, Name, or Leave Type..."
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
                setFilters(defaultFilters);
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
            {/* 1. Approval Status Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Approval Status
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={filters.approvalStatus}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, approvalStatus: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Leave Type Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Leave Type
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={filters.leaveType}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, leaveType: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  {leaveTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Employee Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Employee
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={filters.employee}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, employee: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  {employeeOptions.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="px-6 pb-6">

      {/* Leave Table from Leave Module */}
      <LeaveTable
        records={paginatedLeaves}
        totalRecords={filteredLeaves.length}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        sortBy={filters.sortBy}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        onSortChange={(newSort) => setFilters((prev) => ({ ...prev, sortBy: newSort }))}
        onViewDetails={(rec) => setSelectedRecord(rec)}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        onUpdateStatus={handleUpdateStatus}
      />
      </div>

      {/* Leave Detail Modal */}
      <LeaveDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Add Leave Modal */}
      <AddLeaveModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (payload) => {
          await leaveService.createLeave(payload);
          await fetchData();
        }}
        employees={masterEmployees}
      />
    </div>
  );
};
