import React, { useState, useEffect, useCallback } from 'react';
import { FileCheck } from 'lucide-react';
import { ReloadButton } from '../../../components/ui/ReloadButton';
import { approvalsService, AllApprovalsData } from '../../../services/approvalsService';
import { ApprovalMetricCards } from '../../../components/approvals/ApprovalMetricCards';
import { EmployeeApprovalsSection } from '../../../components/approvals/EmployeeApprovalsSection';
import { ClientApprovalsSection } from '../../../components/approvals/ClientApprovalsSection';
import { TicketsAssetsApprovalsSection } from '../../../components/approvals/TicketsAssetsApprovalsSection';
import { ApprovalDetailModal, DetailItemType } from '../../../components/approvals/ApprovalDetailModal';
import { AddEmployeeApprovalModal } from '../../../components/approvals/AddEmployeeApprovalModal';
import { AddClientApprovalModal } from '../../../components/approvals/AddClientApprovalModal';
import { ToastNotification, ToastItem } from '../../../components/ui/ToastNotification';
import { ApprovalStatus } from '../../../types/approvals';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';

export const ApprovalInboxPage: React.FC = () => {
  const [data, setData] = useState<AllApprovalsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('—');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    statusBadge?: string
  ) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    const newToast: ToastItem = {
      id,
      type,
      title,
      message,
      statusBadge,
      timestamp: 'Just now'
    };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals state
  const [detailItem, setDetailItem] = useState<DetailItemType | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const fresh = await approvalsService.fetchApprovalsData();
      setData(fresh);
      if (fresh.lastUpdated) {
        setLastRefreshed(fresh.lastUpdated);
      }
      if (isManual) {
        addToast('info', 'Data Refreshed', 'Approval records are up-to-date from database.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not load approvals data';
      setErrorMessage(msg);
      if (isManual) {
        addToast('error', 'Refresh Failed', msg);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleManualRefresh = () => {
    loadData(true);
  };

  const handleUpdateStatus = async (
    type: 'employee' | 'client' | 'ticketAsset',
    id: number,
    status: ApprovalStatus
  ) => {
    if (!data) return;
    let nameOrCode = '';

    try {
      if (type === 'employee') {
        const item = data.employees.find((e) => e.id === id);
        nameOrCode = item ? `${item.employee_name} (${item.employee_code})` : 'Employee request';
        const updated = await approvalsService.updateEmployeeStatus(id, status);
        setData(updated);
      } else if (type === 'client') {
        const item = data.clients.find((c) => c.id === id);
        nameOrCode = item ? `${item.client_name} (${item.approval_id})` : 'Client request';
        const updated = await approvalsService.updateClientStatus(id, status);
        setData(updated);
      } else if (type === 'ticketAsset') {
        const item = data.ticketsAssets.find((t) => t.id === id);
        nameOrCode = item ? `${item.title} (${item.approval_id})` : 'Ticket / Asset request';
        const updated = await approvalsService.updateTicketAssetStatus(id, status);
        setData(updated);
      }

      const toastType = status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'warning';
      const title = status === 'Approved' ? 'Request Approved' : status === 'Rejected' ? 'Request Rejected' : 'Marked as Pending';
      addToast(toastType, title, nameOrCode, status);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      addToast('error', 'Update Failed', msg);
    }
  };

  const handleAddEmployeeRequest = async (
    req: Parameters<typeof approvalsService.addEmployeeRequest>[0]
  ) => {
    try {
      const updated = await approvalsService.addEmployeeRequest(req);
      setData(updated);
      addToast('success', 'Leave Request Created', `${req.employee_name} request submitted as Pending.`);
      setIsAddEmployeeOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit request';
      addToast('error', 'Submission Failed', msg);
    }
  };

  const handleAddClientRequest = async (
    req: Parameters<typeof approvalsService.addClientRequest>[0]
  ) => {
    try {
      const updated = await approvalsService.addClientRequest(req);
      setData(updated);
      addToast('success', 'Client Approval Created', `${req.client_name} request submitted as Pending.`);
      setIsAddClientOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit request';
      addToast('error', 'Submission Failed', msg);
    }
  };

  // Optional top-level filter by status (All, Pending, Approved, Rejected)
  const filteredEmployees = data
    ? selectedStatusFilter && selectedStatusFilter !== 'all'
      ? data.employees.filter((e) => e.status === selectedStatusFilter)
      : data.employees
    : [];

  const filteredClients = data
    ? selectedStatusFilter && selectedStatusFilter !== 'all'
      ? data.clients.filter((c) => c.status === selectedStatusFilter)
      : data.clients
    : [];

  const filteredTicketsAssets = data
    ? selectedStatusFilter && selectedStatusFilter !== 'all'
      ? data.ticketsAssets.filter((t) => t.status === selectedStatusFilter)
      : data.ticketsAssets
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-7 flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
      {/* Page Title & Breadcrumb Row */}
      <div className="flex flex-row items-center justify-between flex-wrap gap-4 w-full">
        <div className="flex flex-row items-center gap-3">
          {/* Amber Icon Badge */}
          <div className="box-border flex flex-row items-center justify-center w-9 h-9 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg shrink-0">
            <FileCheck size={20} className="text-[#F59E0B]" />
          </div>

          <div className="flex flex-col items-start">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A] leading-7">
              Approval Inbox
            </h1>
            <p className="text-xs text-[#64748B] leading-4">
              Review and manage employee, client and ticket / asset approval requests.
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <div className="flex flex-row items-center gap-2 text-xs text-[#64748B]">
          <ReloadButton
            onClick={handleManualRefresh}
            isRefreshing={isRefreshing}
            disabled={isLoading || isRefreshing}
            title="Refresh inbox data"
          />
        </div>
      </div>

      {/* Visible Error Banner on failure */}
      {errorMessage && (
        <ErrorBanner
          title="Failed to load approvals"
          message={errorMessage}
          onRetry={() => loadData(false)}
          isRetrying={isLoading}
        />
      )}

      {/* Skeletons while loading initial data */}
      {isLoading && !data ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton variant="card" height={90} />
            <Skeleton variant="card" height={90} />
            <Skeleton variant="card" height={90} />
            <Skeleton variant="card" height={90} />
          </div>
          <Skeleton variant="card" height={260} />
          <Skeleton variant="card" height={260} />
          <Skeleton variant="card" height={260} />
        </div>
      ) : data ? (
        <>
          {/* 4 Metric Summary Cards */}
          <ApprovalMetricCards
            summary={data.summary}
            selectedFilter={selectedStatusFilter}
            onSelectFilter={setSelectedStatusFilter}
          />

          {/* Section 1: Employee Approvals */}
          <EmployeeApprovalsSection
            approvals={filteredEmployees}
            onOpenAddModal={() => setIsAddEmployeeOpen(true)}
            onViewDetails={(item) => setDetailItem(item)}
            onUpdateStatus={(id, status) => handleUpdateStatus('employee', id, status)}
          />

          {/* Section 2: Client Approvals */}
          <ClientApprovalsSection
            approvals={filteredClients}
            onOpenAddModal={() => setIsAddClientOpen(true)}
            onViewDetails={(item) => setDetailItem(item)}
            onUpdateStatus={(id, status) => handleUpdateStatus('client', id, status)}
          />

          {/* Section 3: Tickets & Assets Approvals */}
          <TicketsAssetsApprovalsSection
            approvals={filteredTicketsAssets}
            onViewDetails={(item) => setDetailItem(item)}
            onUpdateStatus={(id, status) => handleUpdateStatus('ticketAsset', id, status)}
          />
        </>
      ) : null}

      {/* Detail / Action Modal */}
      <ApprovalDetailModal
        item={detailItem}
        isOpen={detailItem !== null}
        onClose={() => setDetailItem(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Add Employee Leave / WFH Modal */}
      <AddEmployeeApprovalModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        onSubmit={handleAddEmployeeRequest}
      />

      {/* Add Client Approval Modal */}
      <AddClientApprovalModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onSubmit={handleAddClientRequest}
      />

      {/* Top-Right Notification Toast */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
