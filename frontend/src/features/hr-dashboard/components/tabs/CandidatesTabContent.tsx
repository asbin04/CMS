import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, RotateCcw, ChevronDown, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { CandidateRecord } from '@/features/hr/types';
import { hrApiService } from '@/features/hr/services/hrApiService';
import { StatusDropdownMenu, StatusItemConfig } from '@/components/ui/StatusDropdownMenu';

export const CANDIDATE_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'Open', label: 'Open', dotColor: '#3B82F6', textColor: '#2563EB' },
  { value: 'Interviewing', label: 'Interviewing', dotColor: '#8B5CF6', textColor: '#7C3AED' },
  { value: 'Offered', label: 'Offered', dotColor: '#10B981', textColor: '#059669' },
  { value: 'Hired', label: 'Hired', dotColor: '#059669', textColor: '#059669' },
  { value: 'Rejected', label: 'Rejected', dotColor: '#EF4444', textColor: '#EF4444' },
];

export interface CandidatesTabContentProps {
  onDataChange?: () => void;
}

export const CandidatesTabContent: React.FC<CandidatesTabContentProps> = ({ onDataChange }) => {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await hrApiService.getCandidates();
      setCandidates(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch candidate records');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Derived filter options
  const departments = useMemo(() => {
    const set = new Set(candidates.map((c) => c.department).filter(Boolean));
    return Array.from(set).sort();
  }, [candidates]);

  // Filtering
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = cand.name?.toLowerCase().includes(q);
        const matchesId = cand.id?.toLowerCase().includes(q);
        const matchesRole = cand.role?.toLowerCase().includes(q);
        const matchesDept = cand.department?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesRole && !matchesDept) {
          return false;
        }
      }

      if (selectedStatus !== 'All' && cand.status !== selectedStatus) {
        return false;
      }

      if (selectedDepartment !== 'All' && cand.department !== selectedDepartment) {
        return false;
      }

      return true;
    });
  }, [candidates, searchQuery, selectedStatus, selectedDepartment]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const startRecord = filteredCandidates.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, filteredCandidates.length);
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, currentPage]);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedDepartment('All');
    setCurrentPage(1);
  };

  const handleStatusChange = (candId: string, newStatus: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, status: newStatus } : c))
    );
    onDataChange?.();
  };

  return (
    <div className="flex flex-col w-full">
      {/* Search and Filters Toolbar matching Designer Reference */}
      <div className="p-6 flex flex-col gap-4 w-full">
        <div className="flex flex-row items-center gap-3 h-[38px] w-full">
          {/* Search Input */}
          <div className="relative flex-1 h-[38px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Candidate ID, Name, Role, or Department..."
              className="w-full h-[38px] pl-10 pr-4 py-2 text-sm text-[#334155] placeholder:text-[#94A3B8] bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Primary Buttons */}
          <div className="flex items-center gap-2 h-[34px] shrink-0">
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
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-[34px] px-3.5 flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs text-xs font-semibold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Secondary Dropdown Filters */}
        {isFiltersVisible && (
          <div className="flex flex-col sm:flex-row items-start pt-1 gap-4 w-full">
            {/* 1. Status Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">Status</label>
              <div className="relative w-full h-[34px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  <option value="Open">Open</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Department Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">Department</label>
              <div className="relative w-full h-[34px]">
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Candidates Table */}
      <div className="px-6 pb-6">
        <div className="overflow-x-auto w-full table-horizontal-scroll border border-[#E2E8F0] rounded-xl">
          <table className="w-full text-left border-collapse text-xs min-w-[900px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">Candidate ID</th>
                <th className="py-3 px-3.5">Name</th>
                <th className="py-3 px-3.5">Role</th>
                <th className="py-3 px-3.5">Department</th>
                <th className="py-3 px-3.5">Email</th>
                <th className="py-3 px-3.5">Applied Date</th>
                <th className="py-3 px-3.5 text-center">Days in Pipeline</th>
                <th className="py-3 px-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    Loading candidate records...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-rose-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No candidates found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((cand) => (
                  <tr
                    key={cand.id}
                    className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3 px-3.5 font-medium text-slate-900">{cand.id}</td>
                    <td className="py-3 px-3.5 font-semibold text-indigo-700">{cand.name}</td>
                    <td className="py-3 px-3.5 text-slate-600">{cand.role}</td>
                    <td className="py-3 px-3.5 text-slate-600">{cand.department}</td>
                    <td className="py-3 px-3.5 text-slate-500">{cand.email || '-'}</td>
                    <td className="py-3 px-3.5 text-slate-600">{cand.createdDate}</td>
                    <td className="py-3 px-3.5 text-center font-medium text-slate-700">
                      {cand.daysInPipeline} days
                    </td>
                    <td className="py-3 px-3.5">
                      <StatusDropdownMenu
                        currentStatus={cand.status}
                        options={CANDIDATE_STATUS_CONFIGS}
                        headerTitle="CHANGE CANDIDATE STATE"
                        onSelect={(newStatus) => handleStatusChange(cand.id, newStatus)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer matching Designer Reference */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-white">
          {/* Record count info */}
          <div className="text-xs font-normal text-slate-500 leading-4">
            Showing {startRecord} – {endRecord} of {filteredCandidates.length} candidates
          </div>

          {/* Page navigation controls */}
          <div className="flex items-center gap-1.5">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer ${
                  pageNum === currentPage
                    ? 'bg-[#4F46E5] text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Page Size Selector */}
            <div className="relative ml-2">
              <select
                value={pageSize}
                onChange={() => {}}
                style={{ border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                className="bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs font-medium leading-4 text-slate-700 appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

