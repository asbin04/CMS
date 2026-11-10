import React from 'react';
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { AppLayout, AppLayoutContextType } from '../components/layout/AppLayout';
import { ModulePlaceholder } from '../components/common/ModulePlaceholder';
import { navigationSections, footerNavigationItems } from '../config/navigation';
import { CeoDashboardPage } from '../features/dashboard/pages/CeoDashboardPage';
import { ApprovalInboxPage } from '../features/dashboard/pages/ApprovalInboxPage';
import { FollowUpQueuePage } from '../features/dashboard/pages/FollowUpQueuePage';
import { OpportunitiesPage } from '../features/sales/pages/OpportunitiesPage';
import { ContractsPage } from '../features/sales/pages/ContractsPage';
import { ProposalsPage } from '../features/proposals/pages/ProposalsPage';
import { CollectionsPage } from '../features/collections/pages/CollectionsPage';
import { FinanceCollectionsPage } from '../features/collections/pages/FinanceCollectionsPage';
import { EmployeeMasterPage } from '../features/hr/pages/EmployeeMasterPage';
import { HrDashboardPage } from '../features/hr/pages/HrDashboardPage';
import { LeadsPage } from '../features/sales/pages/LeadsPage';
import { ClientsPage } from '../features/clients/pages/ClientsPage';
import { AttendancePage } from '../features/attendance/pages/AttendancePage';
import { LeaveManagementPage } from '../features/leave/pages/LeaveManagementPage';
import { ProjectsTasksPage } from '../features/projects/pages/ProjectsTasksPage';
import { UiuxPage } from '../features/projects/pages/UiuxPage';
import { UatPage } from '../features/projects/pages/UatPage';
import { EmployeeExitPage } from '../features/hr/pages/EmployeeExitPage';
import { PayrollSalaryPage } from '../features/hr/pages/PayrollSalaryPage';
import { PaymentsPage } from '../features/finance/payments/pages/PaymentsPage';
import { ExpensesPage } from '../features/finance/pages/ExpensesPage';
import { SupportTicketsPage } from '../features/support/pages/SupportTicketsPage';
import { AmcSlaPage } from '../features/support/pages/AmcSlaPage';

const FinanceDashboardPage = React.lazy(() =>
  import('../features/finance/pages/FinanceDashboardPage').then((m) => ({ default: m.FinanceDashboardPage }))
);

import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';

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
        <Route path="/finance/collections" element={<FinanceCollectionsPage />} />
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

        {/* Generate dynamic module engine routes for all other navigation items */}
        {navigationSections.map((section) =>
          section.items
            .filter(
              (item) =>
                item.path !== '/management/ceo-dashboard' &&
                item.path !== '/management/approval-inbox' &&
                item.path !== '/management/follow-up-queue' &&
                item.path !== '/management/collections' &&
                item.path !== '/finance/collections' &&
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
                item.path !== '/amc-sla'
            )
            .map((item) => (
              <Route
                key={item.path}
                path={item.path}
                element={<ModulePlaceholder title={item.label} category={section.title} />}
              />
            ))
        )}

        {/* Footer navigation routes */}
        {footerNavigationItems.map((item) => (
          <Route
            key={item.path}
            path={item.path}
            element={<ModulePlaceholder title={item.label} category="General" />}
          />
        ))}

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/management/ceo-dashboard" replace />} />
      </Route>
    </Routes>
  );
};
