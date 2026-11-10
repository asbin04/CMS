import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Briefcase,
  UserCheck,
  Search,
  ChevronDown,
  Download,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TimesheetRecord, TimesheetKpis, TimesheetApprovalStatus } from '../types';
import { mockTimesheetKpis, mockTimesheetRecords } from '../mockData';
import { StatusDropdownMenu, StatusItemConfig } from '../../../components/ui/StatusDropdownMenu';
import { ToastNotification, useToast } from '../../../components/ui/ToastNotification';

interface TimesheetsSectionProps {
  kpis?: TimesheetKpis;
  records?: TimesheetRecord[];
}

const TIMESHEET_APPROVAL_CONFIGS: StatusItemConfig[] = [
  { value: 'Approved', label: 'Approved', dotColor: '#10B981', textColor: '#059669' },
  { value: 'Pending', label: 'Pending', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Rejected', label: 'Rejected', dotColor: '#EF4444', textColor: '#DC2626' },
];

export const TimesheetsSection: React.FC<TimesheetsSectionProps> = ({
  kpis = mockTimesheetKpis,
  records: initialRecords = mockTimesheetRecords,
}) => {
  const [dataList, setDataList] = useState<TimesheetRecord[]>(initialRecords);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    setDataList(initialRecords);
  }, [initialRecords]);

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [employeeFilter, setEmployeeFilter] = useState('All Employees');
  const [approvalFilter, setApprovalFilter] = useState('All Status');
  const [billableFilter, setBillableFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handleApprovalStatusChange = (id: string, newStatus: string) => {
    setDataList((prev) =>
      prev.map((item) =>
        item.timesheetId === id
          ? { ...item, approvalStatus: newStatus as TimesheetApprovalStatus }
          : item
      )
    );
    const toastType =
      newStatus === 'Approved' ? 'success' : newStatus === 'Pending' ? 'warning' : 'error';
    addToast(toastType, 'Approval Status Updated', `Timesheet ${id} status set to "${newStatus}".`);
  };

  // Filter records based on UI controls for interactive feedback
  const filteredRecords = useMemo(() => {
    return dataList.filter((r) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matches =
          r.timesheetId.toLowerCase().includes(query) ||
          r.employeeId.toLowerCase().includes(query) ||
          r.employeeName.toLowerCase().includes(query) ||
          r.projectId.toLowerCase().includes(query) ||
          r.taskId.toLowerCase().includes(query) ||
          r.notes.toLowerCase().includes(query);
        if (!matches) return false;
      }
      if (projectFilter !== 'All Projects' && r.projectId !== projectFilter) {
        return false;
      }
      if (
        employeeFilter !== 'All Employees' &&
        !r.employeeName.includes(employeeFilter) &&
        r.employeeId !== employeeFilter
      ) {
        return false;
      }
      if (approvalFilter !== 'All Status' && r.approvalStatus !== approvalFilter) {
        return false;
      }
      if (billableFilter !== 'All' && r.billable !== billableFilter) {
        return false;
      }
      return true;
    });
  }, [dataList, search, projectFilter, employeeFilter, approvalFilter, billableFilter]);

  const getApprovalStatusBadgeClass = (val: string) => {
    switch (val) {
      case 'Approved':
        return 'bg-[#ECFDF5] text-[#059669]';
      case 'Pending':
        return 'bg-[#FFFBEB] text-[#D97706]';
      case 'Rejected':
      default:
        return 'bg-[#FEF2F2] text-[#DC2626]';
    }
  };

  return (
    <section className="space-y-4">
      {/* Toast Notification Container */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} position="top-right" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Timesheets</h2>
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
          {/* + Log Time Button */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-[10px] shadow-sm transition-colors cursor-pointer h-[36px]"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Hours */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#6366F1] shrink-0">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Total Hours</span>
            <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
              {kpis.totalHours}
            </span>
            <span className="block text-[11px] font-medium text-[#10B981] mt-1">
              {kpis.totalHoursTrend}
            </span>
          </div>
        </div>

        {/* Card 2: Billable Hours */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center text-[#10B981] shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Billable Hours</span>
            <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
              {kpis.billableHours}
            </span>
            <span className="block text-[11px] font-medium text-[#10B981] mt-1">
              {kpis.billableHoursTrend}
            </span>
          </div>
        </div>

        {/* Card 3: Billable Amount */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] shrink-0">
            <Briefcase className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Billable Amount</span>
            <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
              {kpis.billableAmount}
            </span>
            <span className="block text-[11px] font-medium text-[#10B981] mt-1">
              {kpis.billableAmountTrend}
            </span>
          </div>
        </div>

        {/* Card 4: Pending Approvals */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center text-[#F59E0B] shrink-0">
            <UserCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500">Pending Approvals</span>
            <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
              {kpis.pendingApprovals}
            </span>
            <span className="block text-[11px] font-medium text-[#EF4444] mt-1">
              {kpis.pendingApprovalsTrend}
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
            placeholder="Search by Timesheet ID, Employee ID, Project ID, Task ID..."
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

          {/* Employee Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 shrink-0">Employee</span>
            <div className="relative flex-1">
              <div className="flex items-center justify-between px-3 py-1.5 border border-[#E2E8F0] rounded-[10px] bg-white text-xs text-slate-700 h-[36px]">
                <span className="truncate">{employeeFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0 pointer-events-none" />
              </div>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Employee"
              >
                <option value="All Employees">All Employees</option>
                <option value="Amit Sharma">Amit Sharma</option>
                <option value="Sneha Nair">Sneha Nair</option>
                <option value="Divya Patel">Divya Patel</option>
                <option value="Rohan Verma">Rohan Verma</option>
                <option value="Vikram Shah">Vikram Shah</option>
              </select>
            </div>
          </div>

          {/* Approval Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 shrink-0">Approval Status</span>
            <div className="relative flex-1">
              <div className="flex items-center justify-between px-3 py-1.5 border border-[#E2E8F0] rounded-[10px] bg-white text-xs text-slate-700 h-[36px]">
                <span className="truncate">{approvalFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0 pointer-events-none" />
              </div>
              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Approval Status"
              >
                <option value="All Status">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Billable Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 shrink-0">Billable</span>
            <div className="relative flex-1">
              <div className="flex items-center justify-between px-3 py-1.5 border border-[#E2E8F0] rounded-[10px] bg-white text-xs text-slate-700 h-[36px]">
                <span className="truncate">{billableFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0 pointer-events-none" />
              </div>
              <select
                value={billableFilter}
                onChange={(e) => setBillableFilter(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Select Billable"
              >
                <option value="All">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Timesheets Table */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Timesheet ID
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Project ID
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Task ID
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Billable
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Billable Rate
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Billable Amount
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Approval Status
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Approved By
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Estimated Labor Cost
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((row) => (
                <tr key={row.timesheetId} className="hover:bg-slate-50/60 transition-colors">
                  {/* Timesheet ID */}
                  <td className="py-3.5 px-4 text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.timesheetId}
                  </td>
                  {/* Date */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.date}
                  </td>
                  {/* Employee ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.employeeId}
                  </td>
                  {/* Employee Name */}
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                    {row.employeeName}
                  </td>
                  {/* Project ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.projectId}
                  </td>
                  {/* Task ID */}
                  <td className="py-3.5 px-4 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap">
                    {row.taskId}
                  </td>
                  {/* Hours */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.hours.toFixed(2)}
                  </td>
                  {/* Billable */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-[6px] text-[11px] font-semibold ${
                        row.billable === 'Yes'
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : 'bg-[#FEF2F2] text-[#DC2626]'
                      }`}
                    >
                      {row.billable}
                    </span>
                  </td>
                  {/* Billable Rate */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.billableRate}
                  </td>
                  {/* Billable Amount */}
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-900 whitespace-nowrap">
                    {row.billableAmount}
                  </td>
                  {/* Approval Status with Interactive StatusDropdownMenu */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <StatusDropdownMenu
                      currentStatus={row.approvalStatus}
                      options={TIMESHEET_APPROVAL_CONFIGS}
                      headerTitle="CHANGE APPROVAL STATUS"
                      triggerVariant="badge"
                      getBadgeClass={getApprovalStatusBadgeClass}
                      onSelect={(newStatus) =>
                        handleApprovalStatusChange(row.timesheetId, newStatus)
                      }
                    />
                  </td>
                  {/* Approved By */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.approvedBy}
                  </td>
                  {/* Estimated Labor Cost */}
                  <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                    {row.estimatedLaborCost}
                  </td>
                  {/* Notes */}
                  <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[200px] truncate" title={row.notes}>
                    {row.notes}
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
            Showing 1–5 of 1,248 timesheets
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
                onClick={() => setCurrentPage(250)}
                className="w-7 h-7 flex items-center justify-center rounded-[8px] text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                250
              </button>
              <button
                type="button"
                disabled={currentPage === 250}
                onClick={() => setCurrentPage((p) => Math.min(250, p + 1))}
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
