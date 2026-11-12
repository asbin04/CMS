import React, { useState, useEffect, useCallback } from 'react';
import { HrDashboardHeader } from '../components/HrDashboardHeader';
import { HrKpiCards } from '../components/HrKpiCards';
import { HrEmployeeTabs } from '../components/HrEmployeeTabs';
import { INITIAL_HR_KPIS } from '../data/mockData';
import { HrTabType, HrKpiMetric } from '../types';
import { EmployeeMasterTabContent } from '../components/tabs/EmployeeMasterTabContent';
import { AttendanceTabContent } from '../components/tabs/AttendanceTabContent';
import { LeaveTabContent } from '../components/tabs/LeaveTabContent';
import { ExitTabContent } from '../components/tabs/ExitTabContent';
import { AddEmployeeModal } from '@/features/hr/components/AddEmployeeModal';
import { employeeService } from '@/services/employeeService';
import { attendanceService } from '@/features/attendance/services/attendanceService';
import { leaveService } from '@/features/leave/services/leaveService';
import { employeeExitService } from '@/features/hr/services/employeeExitService';
import { hrApiService } from '@/features/hr/services/hrApiService';
import { buildDynamicHrKpis } from '../utils/hrDashboardKpis';
import { ToastNotification, useToast } from '../../../components/ui/ToastNotification';

export const HrDashboardPage: React.FC = () => {
  // Navigation / Tabs state (Employees, Attendance, Leave, Exits)
  const [activeTab, setActiveTab] = useState<HrTabType>('employees');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Dynamic KPI Metrics State (initialized with baseline metrics for instant layout)
  const [kpiMetrics, setKpiMetrics] = useState<HrKpiMetric[]>(INITIAL_HR_KPIS);

  // Dynamic filter states passed down on KPI card navigation
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState<string | undefined>(undefined);
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string | undefined>(undefined);
  const [attendanceLateFilter, setAttendanceLateFilter] = useState<string | undefined>(undefined);
  const [leaveApprovalFilter, setLeaveApprovalFilter] = useState<string | undefined>(undefined);

  const { toasts, addToast, removeToast } = useToast();

  // Load and calculate 100% dynamic KPIs from live backend APIs
  const loadDynamicKpis = useCallback(async () => {
    try {
      const [dashRes, summaryRes, empRes, attRes, leaveRes, candRes, exitRes] =
        await Promise.allSettled([
          hrApiService.getHrDashboardData(),
          employeeService.getSummary(),
          employeeService.getEmployees(),
          attendanceService.getAttendance(),
          leaveService.getLeaves(),
          hrApiService.getCandidates(),
          employeeExitService.getExitRecords(),
        ]);

      const dashboardData = dashRes.status === 'fulfilled' ? dashRes.value : null;
      const summaryData = summaryRes.status === 'fulfilled' ? summaryRes.value : null;
      const employees = empRes.status === 'fulfilled' ? empRes.value || [] : [];
      const attendance = attRes.status === 'fulfilled' ? attRes.value || [] : [];
      const leaves = leaveRes.status === 'fulfilled' ? leaveRes.value || [] : [];
      const candidates = candRes.status === 'fulfilled' ? candRes.value || [] : [];
      const exits =
        exitRes.status === 'fulfilled' && exitRes.value?.content
          ? exitRes.value.content
          : [];

      if (dashboardData?.lastUpdated) {
        setLastUpdated(dashboardData.lastUpdated);
      }

      const dynamicMetrics = buildDynamicHrKpis({
        dashboard: dashboardData,
        summary: summaryData,
        employees,
        attendance,
        leaves,
        candidates,
        exits,
      });

      setKpiMetrics(dynamicMetrics);
    } catch (err) {
      console.error('Failed to load dynamic HR KPIs:', err);
    }
  }, []);

  // Initial mount: fetch live KPIs
  useEffect(() => {
    loadDynamicKpis();
  }, [loadDynamicKpis]);

  // Synchronize live data across all tabs and recalculate metrics
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    try {
      const refreshed = await hrApiService.refreshHrDashboard();
      if (refreshed?.lastUpdated) {
        setLastUpdated(refreshed.lastUpdated);
      }
    } catch (err) {
      console.warn('Dashboard timestamp refresh warning:', err);
    }
    await loadDynamicKpis();
    setIsRefreshing(false);
    addToast('info', 'HR Dashboard Refreshed', 'Synchronized live records from CMS modules.');
  };

  // Export current live KPI and workforce summary report as CSV
  const handleExport = () => {
    const rows = [
      'HR Dashboard - Live KPI Metrics Report',
      `Generated At: ${new Date().toLocaleString()}`,
      '',
      'Metric ID,Metric Label,Value',
      ...kpiMetrics.map((m) => `"${m.id}","${m.label}","${m.value}"`),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `hr_dashboard_kpis_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Export Complete', 'Exported HR Dashboard metrics as CSV.');
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-7 w-full min-h-full flex flex-col gap-6"
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      {/* 1. Page Header */}
      <HrDashboardHeader
        onRefresh={handleRefresh}
        onExport={handleExport}
        isRefreshing={isRefreshing}
      />

      {/* 2. Top 12 Fully Dynamic Static KPI Cards */}
      <HrKpiCards metrics={kpiMetrics} />

      {/* 3. Main Content Container: 5 Tabs from Existing Modules */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-soft overflow-hidden flex flex-col">
        {/* Tab Navigation: Exactly 5 Tabs */}
        <HrEmployeeTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Dynamic Tab Content reusing existing CMS modules */}
        <div key={refreshKey} className="w-full">
          {activeTab === 'employees' && (
            <EmployeeMasterTabContent
              initialStatusFilter={employeeStatusFilter}
              onDataChange={loadDynamicKpis}
            />
          )}
          {activeTab === 'attendance' && (
            <AttendanceTabContent
              initialStatusFilter={attendanceStatusFilter}
              initialLateFilter={attendanceLateFilter}
              onDataChange={loadDynamicKpis}
            />
          )}
          {activeTab === 'leave' && (
            <LeaveTabContent
              initialApprovalFilter={leaveApprovalFilter}
              onDataChange={loadDynamicKpis}
            />
          )}
          {activeTab === 'exits' && (
            <ExitTabContent onDataChange={loadDynamicKpis} />
          )}
        </div>
      </div>

      {/* Global Add Employee Modal from Employee Master */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        onSubmit={async (payload) => {
          try {
            await employeeService.createEmployee(payload);
            addToast('success', 'Employee Added', `${payload.fullName} was created successfully.`);
            setRefreshKey((k) => k + 1);
            loadDynamicKpis();
          } catch (err: any) {
            addToast('error', 'Failed to Add', err?.message || 'Could not save employee profile.');
          }
        }}
      />

      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
