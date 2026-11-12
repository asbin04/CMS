import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Invoice,
  PaymentRecord,
  CollectionStatus,
  KpiSummary,
  AgeingChartItem,
  StatusDistributionItem,
} from '../types';
import {
  exportInvoicesToCsv,
  computeDynamicKpis,
  computeDynamicAgeingChart,
  computeDynamicStatusDistribution,
  computeDynamicInsights,
} from '../utils';

import { CollectionsHeader } from '../components/CollectionsHeader';
import { CollectionsKpiCards } from '../components/CollectionsKpiCards';
import { LiveManagementChecks } from '../components/LiveManagementChecks';
import { ReceivablesAgeingChart } from '../components/ReceivablesAgeingChart';
import { CollectionStatusChart } from '../components/CollectionStatusChart';
import { InvoicesTableSection } from '../components/InvoicesTableSection';
import { InvoiceDetailsCard } from '../components/InvoiceDetailsCard';

import { LogPaymentModal } from '../components/LogPaymentModal';
import { SendReminderModal } from '../components/SendReminderModal';
import { PaymentHistoryModal } from '../components/PaymentHistoryModal';
import { ViewInvoiceModal } from '../components/ViewInvoiceModal';
import { CallEmailModal } from '../components/CallEmailModal';

import { collectionsApiService } from '../services/collectionsApiService';
import { apiClient } from '../../../services/api/apiClient';
import { ToastNotification, useToast } from '../../../components/ui/ToastNotification';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { EmptyState } from '../../../components/ui/EmptyState';

export const CollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  // Main Data States (starts empty with isLoading = true)
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Backend Data States
  const [backendKpis, setBackendKpis] = useState<KpiSummary | null>(null);
  const [backendAgeing, setBackendAgeing] = useState<AgeingChartItem[] | null>(null);
  const [backendStatusDist, setBackendStatusDist] = useState<StatusDistributionItem[] | null>(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');

  // Modals Visibility
  const [isLogPaymentOpen, setIsLogPaymentOpen] = useState(false);
  const [isSendReminderOpen, setIsSendReminderOpen] = useState(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false);
  const [isCallEmailOpen, setIsCallEmailOpen] = useState(false);

  // Designer Toast Notifications
  const { toasts, addToast, removeToast } = useToast();
  const [lastUpdated, setLastUpdated] = useState('—');

  // Request counter to cancel stale payment fetches
  const paymentFetchIdRef = useRef<number>(0);

  // Fetch live collections data from Spring Boot backend
  const refreshBackendData = async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [invRes, kpiRes, ageingRes, statusRes] = await Promise.all([
        collectionsApiService.getInvoices({ size: 200 }),
        collectionsApiService.getKpis(),
        collectionsApiService.getAgeingChart(),
        collectionsApiService.getStatusDistribution(),
      ]);

      const fetchedInvoices = invRes?.content || [];
      setInvoices(fetchedInvoices);

      // Select first invoice if none selected or previous selection no longer exists
      setSelectedInvoice((prev) => {
        if (!prev) return fetchedInvoices.length > 0 ? fetchedInvoices[0] : null;
        const match = fetchedInvoices.find((i) => i.id === prev.id);
        return match || (fetchedInvoices.length > 0 ? fetchedInvoices[0] : null);
      });

      if (kpiRes) setBackendKpis(kpiRes);
      if (ageingRes) setBackendAgeing(ageingRes);
      if (statusRes) setBackendStatusDist(statusRes);

      const now = new Date();
      setLastUpdated(
        `${now.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      );

      if (isManual) {
        addToast('success', 'Records Refreshed', 'Collections data synchronized with database.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as any)?.message || 'Failed to connect to backend';
      setErrorMessage(msg);
      if (isManual) {
        addToast('error', 'Refresh Failed', msg);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshBackendData();
  }, []);

  // Fetch payments whenever selected invoice changes with race condition protection
  useEffect(() => {
    if (!selectedInvoice?.id) {
      setPayments([]);
      return;
    }

    const currentFetchId = ++paymentFetchIdRef.current;
    // Bug fix: immediately set payments to empty array when invoice changes
    setPayments([]);

    collectionsApiService
      .getPayments(selectedInvoice.id)
      .then((records) => {
        // Only apply if this is still the active request
        if (currentFetchId === paymentFetchIdRef.current) {
          setPayments(records || []);
        }
      })
      .catch(() => {
        if (currentFetchId === paymentFetchIdRef.current) {
          setPayments([]);
        }
      });
  }, [selectedInvoice?.id, isPaymentHistoryOpen]);

  // Derived calculations from live dataset
  const computedKpis = useMemo(() => {
    if (backendKpis) return backendKpis;
    return computeDynamicKpis(invoices);
  }, [backendKpis, invoices]);

  const computedAgeing = useMemo(() => {
    if (backendAgeing && backendAgeing.length > 0) return backendAgeing;
    return computeDynamicAgeingChart(invoices);
  }, [backendAgeing, invoices]);

  const computedStatusDist = useMemo(() => {
    if (backendStatusDist && backendStatusDist.length > 0) return backendStatusDist;
    return computeDynamicStatusDistribution(invoices);
  }, [backendStatusDist, invoices]);

  const computedInsights = useMemo(() => {
    return computeDynamicInsights(invoices);
  }, [invoices]);

  const handleRefreshCollections = () => {
    apiClient.clearCache();
    refreshBackendData(true);
  };

  // Live Management Checks filter click
  const handleSelectLiveCategory = (status: CollectionStatus) => {
    if (status === 'Overdue') {
      navigate('/finance/invoices?filter=overdue');
    } else if (status === 'Due Soon') {
      navigate('/finance/invoices?filter=due-soon');
    }
  };

  // Handler to add a new manual invoice via Log Payment Modal
  const handleSaveInvoice = async (newInvoice: Invoice) => {
    const cleanInvoiceId = newInvoice.id.trim().toUpperCase();
    try {
      const saved = await collectionsApiService.createInvoice({
        invoiceId: cleanInvoiceId,
        clientId: newInvoice.clientId,
        client: newInvoice.client,
        invoiceDate: newInvoice.invoiceDate,
        dueDate: newInvoice.dueDate,
        outstanding: newInvoice.outstanding,
        statusOverride: newInvoice.status,
        autoAssignIfTaken: true,
      });

      addToast(
        'success',
        'Invoice Recorded',
        `Invoice ${saved.id} (${saved.client}) saved to database.`,
        saved.status
      );

      // Refresh data from API
      await refreshBackendData(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as any)?.message || 'Failed to save to database';
      addToast('error', 'Request Failed', msg, 'Rejected');
      throw err;
    }
  };

  // Handler to update an invoice's status from table status dropdown
  const handleUpdateStatus = async (invoiceId: string, newStatus: CollectionStatus) => {
    const previousInvoices = [...invoices];
    const previousSelected = selectedInvoice;

    // Optimistic update
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus } : inv))
    );
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice({ ...selectedInvoice, status: newStatus });
    }

    try {
      const updated = await collectionsApiService.updateStatus(invoiceId, newStatus);
      setInvoices((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      if (selectedInvoice && selectedInvoice.id === updated.id) {
        setSelectedInvoice(updated);
      }

      addToast('success', 'Status Updated', `Invoice ${invoiceId} marked as ${newStatus}.`, newStatus);

      // Refresh KPIs from server
      collectionsApiService.getKpis().then(setBackendKpis).catch(() => {});
      collectionsApiService.getAgeingChart().then(setBackendAgeing).catch(() => {});
      collectionsApiService.getStatusDistribution().then(setBackendStatusDist).catch(() => {});
    } catch (err: unknown) {
      // Rollback optimistic update
      setInvoices(previousInvoices);
      setSelectedInvoice(previousSelected);
      const msg = err instanceof Error ? err.message : (err as any)?.message || 'Status update failed';
      addToast('error', 'Update Failed', msg, 'Rejected');
    }
  };

  const handleExportAll = () => {
    exportInvoicesToCsv('all_collections_invoices', invoices);
    addToast('success', 'Export Completed', 'Exported all collections invoices to CSV.');
  };

  return (
    <div
      style={{
        padding: '24px 32px 60px 32px',
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top-Right Designer Toast Notification Popup */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} position="top-right" />

      {/* 1. Page Header */}
      <CollectionsHeader
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshCollections}
        onLogPayment={() => setIsLogPaymentOpen(true)}
        onExport={handleExportAll}
      />

      {/* Visible Error Banner if backend fails */}
      {errorMessage && (
        <div style={{ marginBottom: '20px' }}>
          <ErrorBanner
            title="Unable to load collections data"
            message={errorMessage}
            onRetry={() => refreshBackendData(false)}
            isRetrying={isLoading}
          />
        </div>
      )}

      {/* Skeletons while initial loading */}
      {isLoading && invoices.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <Skeleton variant="card" height={100} />
            <Skeleton variant="card" height={100} />
            <Skeleton variant="card" height={100} />
            <Skeleton variant="card" height={100} />
          </div>
          <Skeleton variant="card" height={80} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Skeleton variant="card" height={260} />
            <Skeleton variant="card" height={260} />
          </div>
          <Skeleton variant="card" height={320} />
        </div>
      ) : invoices.length === 0 && !isLoading && !errorMessage ? (
        <EmptyState
          title="No Invoices Found"
          description="There are currently no collections invoices in the database. Use 'Log Payment' to record the first invoice."
          actionLabel="Log Payment"
          onAction={() => setIsLogPaymentOpen(true)}
        />
      ) : (
        <>
          {/* 2. KPI Summary Cards (4 Cards) */}
          <CollectionsKpiCards kpis={computedKpis} />

          {/* 3. Live Management Checks (2 Alert Cards) */}
          <LiveManagementChecks
            overdueCount={computedKpis.overdueAmount?.count ?? 0}
            dueSoonCount={computedKpis.dueSoon?.count ?? 0}
            onSelectCategory={handleSelectLiveCategory}
          />

          {/* 4. Charts Section: Receivables Ageing & Collection Status (Side-by-side) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
              alignItems: 'stretch',
            }}
          >
            <ReceivablesAgeingChart data={computedAgeing} />
            <CollectionStatusChart
              distribution={computedStatusDist}
              insights={computedInsights}
              totalCount={invoices.length}
            />
          </div>

          {/* 5. Search & Filters with Invoices & Receivables Table */}
          <div id="invoices-receivables-section">
            <InvoicesTableSection
              invoices={invoices}
              selectedInvoiceId={selectedInvoice?.id}
              onSelectInvoice={(inv) => setSelectedInvoice(inv)}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onUpdateStatus={handleUpdateStatus}
              onCallEmail={(inv) => {
                setSelectedInvoice(inv);
                setIsCallEmailOpen(true);
              }}
              onSendReminder={(inv) => {
                setSelectedInvoice(inv);
                setIsSendReminderOpen(true);
              }}
              onViewInvoice={(inv) => {
                setSelectedInvoice(inv);
                setIsViewInvoiceOpen(true);
              }}
              onPaymentHistory={(inv) => {
                setSelectedInvoice(inv);
                setIsPaymentHistoryOpen(true);
              }}
            />
          </div>

          {/* 6. Invoice Details Section */}
          <InvoiceDetailsCard
            invoice={selectedInvoice}
            onLogPayment={() => setIsLogPaymentOpen(true)}
            onCallEmail={() => setIsCallEmailOpen(true)}
            onSendReminder={() => setIsSendReminderOpen(true)}
            onViewHistory={() => setIsPaymentHistoryOpen(true)}
            onViewInvoice={() => setIsViewInvoiceOpen(true)}
          />
        </>
      )}

      {/* Modals */}
      <LogPaymentModal
        isOpen={isLogPaymentOpen}
        onClose={() => setIsLogPaymentOpen(false)}
        onSaveInvoice={handleSaveInvoice}
      />

      <SendReminderModal
        isOpen={isSendReminderOpen}
        invoice={selectedInvoice}
        onClose={() => setIsSendReminderOpen(false)}
        onConfirm={() =>
          selectedInvoice &&
          addToast(
            'warning',
            'Reminder Delivered',
            `Payment reminder sent to ${selectedInvoice.client} (${selectedInvoice.id}).`,
            'Pending'
          )
        }
      />

      <PaymentHistoryModal
        isOpen={isPaymentHistoryOpen}
        invoice={selectedInvoice}
        payments={payments}
        onClose={() => setIsPaymentHistoryOpen(false)}
        onOpenLogPayment={() => setIsLogPaymentOpen(true)}
      />

      <ViewInvoiceModal
        isOpen={isViewInvoiceOpen}
        invoice={selectedInvoice}
        onClose={() => setIsViewInvoiceOpen(false)}
      />

      <CallEmailModal
        isOpen={isCallEmailOpen}
        invoice={selectedInvoice}
        onClose={() => setIsCallEmailOpen(false)}
      />
    </div>
  );
};
