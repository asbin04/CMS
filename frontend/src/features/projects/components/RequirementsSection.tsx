import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  User,
  Lock,
  Search,
  ChevronDown,
  Download,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { RequirementRecord, RequirementKpis, RequirementPriority, RequirementStatus } from '../types';
import { mockRequirementKpis, mockRequirementRecords } from '../mockData';
import { StatusDropdownMenu, StatusItemConfig } from '../../../components/ui/StatusDropdownMenu';
import { ToastNotification, useToast } from '../../../components/ui/ToastNotification';

interface RequirementsSectionProps {
  kpis?: RequirementKpis;
  records?: RequirementRecord[];
}

const REQUIREMENT_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'In Progress', label: 'In Progress', dotColor: '#6366F1', textColor: '#4F46E5' },
  { value: 'Pending Approval', label: 'Pending Approval', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Completed', label: 'Completed', dotColor: '#10B981', textColor: '#059669' },
];

const REQUIREMENT_PRIORITY_CONFIGS: StatusItemConfig[] = [
  { value: 'High', label: 'High', dotColor: '#EF4444', textColor: '#DC2626' },
  { value: 'Medium', label: 'Medium', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Low', label: 'Low', dotColor: '#10B981', textColor: '#059669' },
];

export const RequirementsSection: React.FC<RequirementsSectionProps> = ({
  kpis = mockRequirementKpis,
  records: initialRecords = mockRequirementRecords,
}) => {
  const [dataList, setDataList] = useState<RequirementRecord[]>(initialRecords);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    setDataList(initialRecords);
  }, [initialRecords]);

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handleStatusChange = (id: string, newStatus: string) => {
    setDataList((prev) =>
      prev.map((item) =>
        item.requirementId === id ? { ...item, status: newStatus as RequirementStatus } : item
      )
    );
    const toastType =
      newStatus === 'Completed' ? 'success' : newStatus === 'Pending Approval' ? 'warning' : 'info';
    addToast(toastType, 'Status Updated', `Requirement ${id} status set to "${newStatus}".`);
  };

  const handlePriorityChange = (id: string, newPriority: string) => {
    setDataList((prev) =>
      prev.map((item) =>
        item.requirementId === id ? { ...item, priority: newPriority as RequirementPriority } : item
      )
    );
    const toastType =
      newPriority === 'High' ? 'error' : newPriority === 'Medium' ? 'warning' : 'info';
    addToast(toastType, 'Priority Updated', `Requirement ${id} priority set to "${newPriority}".`);
  };

  // Filter records based on UI controls
  const filteredRecords = useMemo(() => {
    return dataList.filter((r) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matches =
          r.requirementId.toLowerCase().includes(query) ||
          r.projectId.toLowerCase().includes(query) ||
          r.clientId.toLowerCase().includes(query) ||
          r.requirementFeature.toLowerCase().includes(query) ||
          r.ownerId.toLowerCase().includes(query);
        if (!matches) return false;
      }
      if (projectFilter !== 'All Projects' && r.projectId !== projectFilter) {
        return false;
      }
      if (typeFilter !== 'All Types' && r.type !== typeFilter) {
        return false;
      }
      if (priorityFilter !== 'All Priorities' && r.priority !== priorityFilter) {
        return false;
      }
      if (statusFilter !== 'All Status' && r.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [dataList, search, projectFilter, typeFilter, priorityFilter, statusFilter]);

  const getPriorityBadgeClass = (val: string) => {
    switch (val) {
      case 'High':
        return 'bg-[#FEF2F2] text-[#DC2626]';
      case 'Medium':
        return 'bg-[#FFFBEB] text-[#D97706]';
      case 'Low':
      default:
        return 'bg-[#ECFDF5] text-[#059669]';
    }
  };

  const getStatusBadgeClass = (val: string) => {
    switch (val) {
      case 'Completed':
        return 'bg-[#ECFDF5] text-[#059669]';
      case 'Pending Approval':
        return 'bg-[#FFFBEB] text-[#D97706]';
      case 'In Progress':
      default:
        return 'bg-[#EEF2FF] text-[#4F46E5]';
    }
  };

  return (
    <section className="space-y-4 pt-2">
      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} position="top-right" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Requirements</h2>
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Export Button with Visible Light-Grey Border */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer h-[36px]"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '12px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              color: '#334155',
            }}
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export</span>
          </button>
          {/* + Add Requirement Button */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-[10px] shadow-sm transition-colors cursor-pointer h-[36px]"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add Requirement</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (5 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Requirements */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#6366F1] shrink-0">
            <ClipboardList className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Total Requirements</span>
            <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
              {kpis.totalRequirements}
            </span>
            <span className="block text-[11px] font-medium text-[#10B981] mt-1">
              {kpis.totalRequirementsTrend}
            </span>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center text-[#10B981] shrink-0">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">In Progress</span>
            <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
              {kpis.inProgress}
            </span>
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center text-[#10B981] shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Completed</span>
            <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
              {kpis.completed}
            </span>
          </div>
        </div>

        {/* Card 4: Pending Approval */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center text-[#F59E0B] shrink-0">
            <User className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Pending Approval</span>
            <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
              {kpis.pendingApproval}
            </span>
          </div>
        </div>

        {/* Card 5: Scope Frozen */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] shrink-0">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Scope Frozen</span>
            <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
              {kpis.scopeFrozen}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Requirement ID, Project ID, Feature or Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-[10px] bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-300 transition-colors h-[38px]"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 shrink-0">Project</span>
            <div className="relative flex-1">
              <div className="flex items-center justify-between px-3 py-1.5 border border-[#E2E8F0] rounded-[10px] bg-white text-xs text-slate-700 h-[36px]">
                <span className="truncate">{projectFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0 pointer-events-none" />
              </div>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Project"
              >
                <option value="All Projects">All Projects</option>
                <option value="PRJ-001">PRJ-001</option>
                <option value="PRJ-002">PRJ-002</option>
                <option value="PRJ-003">PRJ-003</option>
                <option value="PRJ-004">PRJ-004</option>
              </select>
            </div>
          </div>

          {/* Requirement Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 shrink-0">Requirement Type</span>
            <div className="relative flex-1">
              <div className="flex items-center justify-between px-3 py-1.5 border border-[#E2E8F0] rounded-[10px] bg-white text-xs text-slate-700 h-[36px]">
                <span className="truncate">{typeFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0 pointer-events-none" />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Requirement Type"
              >
                <option value="All Types">All Types</option>
                <option value="Feature">Feature</option>
                <option value="Enhancement">Enhancement</option>
                <option value="New">New</option>
              </select>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 shrink-0">Priority</span>
            <div className="relative flex-1">
              <div className="flex items-center justify-between px-3 py-1.5 border border-[#E2E8F0] rounded-[10px] bg-white text-xs text-slate-700 h-[36px]">
                <span className="truncate">{priorityFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0 pointer-events-none" />
              </div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Priority"
              >
                <option value="All Priorities">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 shrink-0">Status</span>
            <div className="relative flex-1">
              <div className="flex items-center justify-between px-3 py-1.5 border border-[#E2E8F0] rounded-[10px] bg-white text-xs text-slate-700 h-[36px]">
                <span className="truncate">{statusFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0 pointer-events-none" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Status"
              >
                <option value="All Status">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Requirement ID
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Project ID
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Client ID
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Requirement Date
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Requirement / Feature
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Owner ID
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Scope Freeze
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Approved By
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Approval Date
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Completion %
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((row) => (
                <tr key={row.requirementId} className="hover:bg-slate-50/60 transition-colors">
                  {/* Requirement ID */}
                  <td className="py-3.5 px-4 text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.requirementId}
                  </td>
                  {/* Project ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.projectId}
                  </td>
                  {/* Client ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.clientId}
                  </td>
                  {/* Requirement Date */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.requirementDate}
                  </td>
                  {/* Type */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.type}
                  </td>
                  {/* Requirement / Feature */}
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                    {row.requirementFeature}
                  </td>
                  {/* Priority with Interactive StatusDropdownMenu */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={row.priority}
                      options={REQUIREMENT_PRIORITY_CONFIGS}
                      headerTitle="CHANGE PRIORITY"
                      triggerVariant="badge"
                      getBadgeClass={getPriorityBadgeClass}
                      onSelect={(newPriority) =>
                        handlePriorityChange(row.requirementId, newPriority)
                      }
                    />
                  </td>
                  {/* Owner ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.ownerId}
                  </td>
                  {/* Status with Interactive StatusDropdownMenu */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={row.status}
                      options={REQUIREMENT_STATUS_CONFIGS}
                      headerTitle="CHANGE STATUS"
                      triggerVariant="badge"
                      getBadgeClass={getStatusBadgeClass}
                      onSelect={(newStatus) =>
                        handleStatusChange(row.requirementId, newStatus)
                      }
                    />
                  </td>
                  {/* Scope Freeze */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-[6px] text-[11px] font-semibold ${
                        row.scopeFreeze === 'Yes'
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : 'bg-[#FEF2F2] text-[#DC2626]'
                      }`}
                    >
                      {row.scopeFreeze}
                    </span>
                  </td>
                  {/* Approved By */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.approvedBy}
                  </td>
                  {/* Approval Date */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.approvalDate}
                  </td>
                  {/* Completion % with progress bar */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 text-slate-800 font-medium">
                        {row.completionPercentage}%
                      </span>
                      <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            row.completionPercentage === 100 ? 'bg-[#10B981]' : 'bg-[#4F46E5]'
                          }`}
                          style={{ width: `${row.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  {/* Actions */}
                  <td className="py-3.5 px-4 text-xs text-center whitespace-nowrap">
                    <button
                      type="button"
                      aria-label="Actions"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-slate-100 px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <span className="text-xs text-slate-500">
            Showing 1–5 of 186 requirements
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous Page"
                className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="w-7 h-7 flex items-center justify-center rounded-[8px] bg-[#4F46E5] text-white text-xs font-semibold shadow-xs"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className="w-7 h-7 flex items-center justify-center rounded-[8px] text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(3)}
                className="w-7 h-7 flex items-center justify-center rounded-[8px] text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(4)}
                className="w-7 h-7 flex items-center justify-center rounded-[8px] text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                4
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(5)}
                className="w-7 h-7 flex items-center justify-center rounded-[8px] text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                5
              </button>
              <span className="px-1 text-xs text-slate-400">...</span>
              <button
                type="button"
                onClick={() => setCurrentPage(38)}
                className="w-7 h-7 flex items-center justify-center rounded-[8px] text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                38
              </button>
              <button
                type="button"
                disabled={currentPage === 38}
                onClick={() => setCurrentPage((p) => Math.min(38, p + 1))}
                aria-label="Next Page"
                className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Page Size Selector */}
            <div className="relative">
              <div className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-200 rounded-[8px] bg-white text-xs text-slate-700 h-[28px] cursor-pointer">
                <span>{pageSize} per page</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Page size"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
