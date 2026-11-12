import React, { lazy } from 'react';
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { AppLayout, AppLayoutContextType } from '../components/layout/AppLayout';
import { ModulePlaceholder } from '../components/common/ModulePlaceholder';
import { navigationSections } from '../config/navigation';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';

const CeoDashboardPage = lazy(() =>
  import('../features/dashboard/pages/CeoDashboardPage').then((m) => ({ default: m.CeoDashboardPage }))
);
const ApprovalInboxPage = lazy(() =>
  import('../features/dashboard/pages/ApprovalInboxPage').then((m) => ({ default: m.ApprovalInboxPage }))
);
const FollowUpQueuePage = lazy(() =>
  import('../features/dashboard/pages/FollowUpQueuePage').then((m) => ({ default: m.FollowUpQueuePage }))
);
const OpportunitiesPage = lazy(() =>
  import('../features/sales/pages/OpportunitiesPage').then((m) => ({ default: m.OpportunitiesPage }))
);
const ContractsPage = lazy(() =>
  import('../features/sales/pages/ContractsPage').then((m) => ({ default: m.ContractsPage }))
);
const ProposalsPage = lazy(() =>
  import('../features/proposals/pages/ProposalsPage').then((m) => ({ default: m.ProposalsPage }))
);
const CollectionsPage = lazy(() =>
  import('../features/collections/pages/CollectionsPage').then((m) => ({ default: m.CollectionsPage }))
);
const EmployeeMasterPage = lazy(() =>
  import('../features/hr/pages/EmployeeMasterPage').then((m) => ({ default: m.EmployeeMasterPage }))
);
const HrDashboardPage = lazy(() =>
  import('../features/hr/pages/HrDashboardPage').then((m) => ({ default: m.HrDashboardPage }))
);
const LeadsPage = lazy(() =>
  import('../features/sales/pages/LeadsPage').then((m) => ({ default: m.LeadsPage }))
);
const ClientsPage = lazy(() =>
  import('../features/clients/pages/ClientsPage').then((m) => ({ default: m.ClientsPage }))
);
const AttendancePage = lazy(() =>
  import('../features/attendance/pages/AttendancePage').then((m) => ({ default: m.AttendancePage }))
);
const LeaveManagementPage = lazy(() =>
  import('../features/leave/pages/LeaveManagementPage').then((m) => ({ default: m.LeaveManagementPage }))
);
const ProjectsTasksPage = lazy(() =>
  import('../features/projects/pages/ProjectsTasksPage').then((m) => ({ default: m.ProjectsTasksPage }))
);
const UiuxPage = lazy(() =>
  import('../features/projects/pages/UiuxPage').then((m) => ({ default: m.UiuxPage }))
);
const UatPage = lazy(() =>
  import('../features/projects/pages/UatPage').then((m) => ({ default: m.UatPage }))
);
const EmployeeExitPage = lazy(() =>
  import('../features/hr/pages/EmployeeExitPage').then((m) => ({ default: m.EmployeeExitPage }))
);
const PayrollSalaryPage = lazy(() =>
  import('../features/hr/pages/PayrollSalaryPage').then((m) => ({ default: m.PayrollSalaryPage }))
);
const PaymentsPage = lazy(() =>
  import('../features/finance/payments/pages/PaymentsPage').then((m) => ({ default: m.PaymentsPage }))
);
const ExpensesPage = lazy(() =>
  import('../features/finance/pages/ExpensesPage').then((m) => ({ default: m.ExpensesPage }))
);
const SupportTicketsPage = lazy(() =>
  import('../features/support/pages/SupportTicketsPage').then((m) => ({ default: m.SupportTicketsPage }))
);
const AmcSlaPage = lazy(() =>
  import('../features/support/pages/AmcSlaPage').then((m) => ({ default: m.AmcSlaPage }))
);
const InvoicesPage = lazy(() =>
  import('../features/invoices/pages/InvoicesPage').then((m) => ({ default: m.InvoicesPage }))
);
const TimesheetsRequirementsPage = lazy(() =>
  import('../features/projects/pages/TimesheetsRequirementsPage').then((m) => ({
    default: m.TimesheetsRequirementsPage,
  }))
);
const DevelopmentPage = lazy(() =>
  import('../features/development/pages/DevelopmentPage').then((m) => ({ default: m.DevelopmentPage }))
);
const DeploymentPage = lazy(() =>
  import('../features/projects/pages/DeploymentPage').then((m) => ({ default: m.DeploymentPage }))
);
const ProjectDashboardPage = lazy(() =>
  import('../features/projects/pages/ProjectDashboardPage').then((m) => ({ default: m.ProjectDashboardPage }))
);
const FinanceDashboardPage = lazy(() =>
  import('../features/finance/pages/FinanceDashboardPage').then((m) => ({ default: m.FinanceDashboardPage }))
);
const ReportsFinanceDashboardPage = lazy(() =>
  import('../features/reports/pages/ReportsFinanceDashboardPage').then((m) => ({
    default: m.ReportsFinanceDashboardPage,
  }))
);
const TransactionControlPage = lazy(() =>
  import('../features/reports/pages/TransactionControlPage').then((m) => ({
    default: m.TransactionControlPage,
  }))
);
const SettingsPage = lazy(() =>
  import('../features/settings/pages/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  }))
);

const CeoDashboardRoute: React.FC = () => {
  const context = useOutletContext<AppLayoutContextType>();
  return (
    <CeoDashboardPage
      dateRange={context?.dateRange || '—'}
      isEditModalOpen={context?.isEditModalOpen || false}
      onCloseEditModal={() => context?.setIsEditModalOpen?.(false)}
    />
  );
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Routes Guarded by ProtectedRoute */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* CEO Dashboard: Default First Screen and Dedicated Routes */}
        <Route index element={<CeoDashboardRoute />} />
        <Route path="/management/ceo-dashboard" element={<CeoDashboardRoute />} />
        <Route path="/dashboard" element={<Navigate to="/management/ceo-dashboard" replace />} />
        <Route path="/ceo-dashboard" element={<Navigate to="/management/ceo-dashboard" replace />} />
        <Route path="/management" element={<Navigate to="/management/ceo-dashboard" replace />} />
        <Route path="/management/dashboard" element={<Navigate to="/management/ceo-dashboard" replace />} />
        <Route path="/management/approval-inbox" element={<ApprovalInboxPage />} />
        <Route path="/management/follow-up-queue" element={<FollowUpQueuePage />} />
        <Route path="/management/collections" element={<CollectionsPage />} />
        <Route path="/finance/dashboard" element={<FinanceDashboardPage />} />
        <Route path="/finance" element={<Navigate to="/finance/dashboard" replace />} />
        <Route path="/reports/finance-dashboard" element={<ReportsFinanceDashboardPage />} />
        <Route path="/reports/transaction-control" element={<TransactionControlPage />} />
        <Route path="/transaction-control" element={<Navigate to="/reports/transaction-control" replace />} />
        <Route path="/collections" element={<Navigate to="/management/collections" replace />} />
        <Route path="/finance/invoices" element={<InvoicesPage />} />
        <Route path="/invoices" element={<Navigate to="/finance/invoices" replace />} />
        <Route path="/sales/leads" element={<LeadsPage />} />
        <Route path="/sales/opportunities" element={<OpportunitiesPage />} />
        <Route path="/sales/proposals" element={<ProposalsPage />} />
        <Route path="/sales/contracts" element={<ContractsPage />} />
        <Route path="/clients/list" element={<ClientsPage />} />
        <Route path="/clients" element={<Navigate to="/clients/list" replace />} />
        <Route path="/hr/dashboard" element={<HrDashboardPage />} />
        <Route path="/hr" element={<Navigate to="/hr/dashboard" replace />} />
        <Route path="/hr/employee-master" element={<EmployeeMasterPage />} />
        <Route path="/hr/attendance" element={<AttendancePage />} />
        <Route path="/attendance" element={<Navigate to="/hr/attendance" replace />} />
        <Route path="/hr/leave" element={<LeaveManagementPage />} />
        <Route path="/leave" element={<Navigate to="/hr/leave" replace />} />
        <Route path="/projects/tasks" element={<ProjectsTasksPage />} />
        <Route path="/projects" element={<Navigate to="/projects/tasks" replace />} />
        <Route path="/projects/ui-ux" element={<UiuxPage />} />
        <Route path="/ui-ux" element={<Navigate to="/projects/ui-ux" replace />} />
        <Route path="/projects/uat" element={<UatPage />} />
        <Route path="/uat" element={<Navigate to="/projects/uat" replace />} />
        <Route path="/hr/employee-exit" element={<EmployeeExitPage />} />
        <Route path="/hr/payroll-salary" element={<PayrollSalaryPage />} />
        <Route path="/hr/payroll" element={<Navigate to="/hr/payroll-salary" replace />} />
        <Route path="/payroll" element={<Navigate to="/hr/payroll-salary" replace />} />
        <Route path="/finance/payments" element={<PaymentsPage />} />
        <Route path="/payments" element={<Navigate to="/finance/payments" replace />} />
        <Route path="/finance/expenses" element={<ExpensesPage />} />
        <Route path="/expenses" element={<Navigate to="/finance/expenses" replace />} />
        <Route path="/support/tickets" element={<SupportTicketsPage />} />
        <Route path="/tickets" element={<Navigate to="/support/tickets" replace />} />
        <Route path="/support/amc-sla" element={<AmcSlaPage />} />
        <Route path="/amc-sla" element={<Navigate to="/support/amc-sla" replace />} />
        <Route path="/projects/timesheets" element={<TimesheetsRequirementsPage />} />
        <Route path="/projects/timesheets-requirements" element={<Navigate to="/projects/timesheets" replace />} />
        <Route path="/projects/development" element={<DevelopmentPage />} />
        <Route path="/projects/deployment-go-live" element={<DeploymentPage />} />
        <Route path="/deployment-go-live" element={<Navigate to="/projects/deployment-go-live" replace />} />
        <Route path="/reports/project-dashboard" element={<ProjectDashboardPage />} />
        <Route path="/project-dashboard" element={<Navigate to="/reports/project-dashboard" replace />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Generate dynamic module engine routes for all other navigation items */}
        {navigationSections.map((section) =>
          section.items
            .filter(
              (item) =>
                item.path !== '/reports/project-dashboard' &&
                item.path !== '/project-dashboard' &&
                item.path !== '/management/ceo-dashboard' &&
                item.path !== '/management/approval-inbox' &&
                item.path !== '/management/follow-up-queue' &&
                item.path !== '/management/collections' &&
                item.path !== '/collections' &&
                item.path !== '/sales/leads' &&
                item.path !== '/sales/opportunities' &&
                item.path !== '/sales/proposals' &&
                item.path !== '/sales/contracts' &&
                item.path !== '/clients/list' &&
                item.path !== '/clients' &&
                item.path !== '/hr/dashboard' &&
                item.path !== '/hr' &&
                item.path !== '/hr/employee-master' &&
                item.path !== '/hr/attendance' &&
                item.path !== '/attendance' &&
                item.path !== '/hr/leave' &&
                item.path !== '/leave' &&
                item.path !== '/finance/dashboard' &&
                item.path !== '/finance' &&
                item.path !== '/reports/finance-dashboard' &&
                item.path !== '/reports/transaction-control' &&
                item.path !== '/transaction-control' &&
                item.path !== '/finance/invoices' &&
                item.path !== '/invoices' &&
                item.path !== '/projects/timesheets' &&
                item.path !== '/projects/development' &&
                item.path !== '/projects/tasks' &&
                item.path !== '/projects' &&
                item.path !== '/projects/ui-ux' &&
                item.path !== '/ui-ux' &&
                item.path !== '/projects/uat' &&
                item.path !== '/uat' &&
                item.path !== '/hr/employee-exit' &&
                item.path !== '/hr/payroll' &&
                item.path !== '/hr/payroll-salary' &&
                item.path !== '/finance/payments' &&
                item.path !== '/payments' &&
                item.path !== '/finance/expenses' &&
                item.path !== '/expenses' &&
                item.path !== '/support/tickets' &&
                item.path !== '/tickets' &&
                item.path !== '/support/amc-sla' &&
                item.path !== '/amc-sla' &&
                item.path !== '/projects/deployment-go-live' &&
                item.path !== '/deployment-go-live'
            )
            .map((item) => (
              <Route
                key={item.path}
                path={item.path}
                element={<ModulePlaceholder title={item.label} category={section.title} />}
              />
            ))
        )}

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/management/ceo-dashboard" replace />} />
      </Route>
    </Routes>
  );
};
