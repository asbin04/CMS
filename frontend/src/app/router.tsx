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
import { LeadsPage } from '../features/sales/pages/LeadsPage';
import { ClientsPage } from '../features/clients/pages/ClientsPage';
import { AttendancePage } from '../features/attendance/pages/AttendancePage';
import { LeaveManagementPage } from '../features/leave/pages/LeaveManagementPage';
import { HrDashboardPage } from '../features/hr/pages/HrDashboardPage';
import { EmployeeExitPage } from '../features/hr/pages/EmployeeExitPage';
import { InvoicesPage } from '../features/invoices/pages/InvoicesPage';
import { TimesheetsRequirementsPage } from '../features/projects/pages/TimesheetsRequirementsPage';
import { DevelopmentPage } from '../features/development/pages/DevelopmentPage';
import { CashFlowPage } from '../features/finance/cash-flow/pages/CashFlowPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';

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
        <Route path="/hr/employee-exit" element={<EmployeeExitPage />} />
        <Route path="/projects/timesheets" element={<TimesheetsRequirementsPage />} />
        <Route path="/projects/timesheets-requirements" element={<Navigate to="/projects/timesheets" replace />} />
        <Route path="/projects/development" element={<DevelopmentPage />} />
        <Route path="/finance/cash-flow" element={<CashFlowPage />} />

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
                item.path !== '/hr/employee-exit' &&
                item.path !== '/finance/invoices' &&
                item.path !== '/invoices' &&
                item.path !== '/projects/timesheets' &&
                item.path !== '/projects/development' &&
                item.path !== '/finance/cash-flow'
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
