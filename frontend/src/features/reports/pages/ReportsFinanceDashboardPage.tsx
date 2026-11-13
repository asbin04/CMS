import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ReloadButton } from '../../../components/ui/ReloadButton';
import {
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  Percent,
  RotateCw,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { financeService } from '@/features/finance/services/financeService';
import { FinanceDashboardData } from '@/features/finance/types/finance';
import {
  invoicesApiService,
  InvoicesQueryParams,
} from '@/features/invoices/invoicesApiService';
import { InvoiceRecord } from '@/features/invoices/types';
import { paymentsService } from '@/features/finance/payments/services/paymentsService';
import {
  FinancePaymentRecord,
  ClientFilterOption,
  RecordPaymentPayload,
} from '@/features/finance/payments/types/payments';
import { RecordPaymentModal } from '@/features/finance/payments/components/RecordPaymentModal';
import { expenseService } from '@/features/finance/services/expenseService';
import { ExpenseItem } from '@/features/finance/types/expenses';
import { cashFlowApiService } from '@/features/finance/cash-flow/services/cashFlowApiService';
import { CashFlowRecord } from '@/features/finance/cash-flow/types';

function formatINR(
  val: number | string | undefined | null,
  showDecimals = false
): string {
  if (val === undefined || val === null || val === '') return '₹0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '₹0';
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const formatted = absNum.toLocaleString('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
}

type TabType = 'Invoices' | 'Payments' | 'Expenses' | 'Cash Flow';

export const ReportsFinanceDashboardPage: React.FC = () => {
  // Financial Dashboard Overview State
  const [dashboardData, setDashboardData] = useState<FinanceDashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAnimated, setIsAnimated] = useState<boolean>(false);
  const [hoveredBucketKey, setHoveredBucketKey] = useState<string | null>(null);
  const [hoveredCardKey, setHoveredCardKey] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('Invoices');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [agingFilter, setAgingFilter] = useState<string>('All');
  const [clientFilter, setClientFilter] = useState<string>('All');

  // Client dropdown list
  const [clientOptions, setClientOptions] = useState<string[]>([]);
  const [paymentClientOptions, setPaymentClientOptions] = useState<ClientFilterOption[]>([]);

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Tab Data states
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [payments, setPayments] = useState<FinancePaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlowRecord[]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(true);

  // Record Payment Modal
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState<boolean>(false);

  // 1. Fetch Dashboard Overview KPIs & Aging
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoadingDashboard(true);
      setIsAnimated(false);
      const res = await financeService.getDashboardData();
      setDashboardData(res);
      // Trigger smooth entry animation after data mount
      setTimeout(() => setIsAnimated(true), 100);
    } catch (err) {
      console.error('Failed to load finance dashboard KPIs:', err);
    } finally {
      setIsLoadingDashboard(false);
      setIsRefreshing(false);
    }
  }, []);

  // 2. Fetch Client Filter Options
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const paymentFilters = await paymentsService.getFilterOptions();
        if (paymentFilters?.clients) {
          setPaymentClientOptions(paymentFilters.clients);
          const names = Array.from(
            new Set(paymentFilters.clients.map((c) => c.clientName).filter(Boolean))
          );
          setClientOptions(names);
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    loadFilterOptions();
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 3. Fetch Tab Table Data
  const fetchTableData = useCallback(async () => {
    setIsLoadingTable(true);
    try {
      if (activeTab === 'Invoices') {
        const params: InvoicesQueryParams = {
          page,
          size: pageSize,
          search: searchTerm || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          ageing: agingFilter !== 'All' ? agingFilter : undefined,
          client: clientFilter !== 'All' ? clientFilter : undefined,
          sortField: 'invoiceDate',
          sortOrder: 'desc',
        };
        const res = await invoicesApiService.getInvoices(params);
        setInvoices(res.content || []);
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || 0);
      } else if (activeTab === 'Payments') {
        const res = await paymentsService.getPayments({
          page,
          size: pageSize,
          search: searchTerm || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          client: clientFilter !== 'All' ? clientFilter : undefined,
        });
        setPayments(res.content || []);
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || 0);
      } else if (activeTab === 'Expenses') {
        const allExpenses = await expenseService.getExpenses({
          search: searchTerm || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
        });
        const total = allExpenses.length;
        setTotalElements(total);
        setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
        const startIndex = page * pageSize;
        setExpenses(allExpenses.slice(startIndex, startIndex + pageSize));
      } else if (activeTab === 'Cash Flow') {
        const res = await cashFlowApiService.getCashFlows({
          page,
          size: pageSize,
          search: searchTerm || undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
        });
        setCashFlows(res.content || []);
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || 0);
      }
    } catch (err) {
      console.error(`Failed to load ${activeTab} data:`, err);
    } finally {
      setIsLoadingTable(false);
    }
  }, [activeTab, page, pageSize, searchTerm, statusFilter, agingFilter, clientFilter]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  // Handle Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchTableData()]);
  };

  // Handle Clear Filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setAgingFilter('All');
    setClientFilter('All');
    setPage(0);
  };

  // Handle CSV Export
  const handleExport = () => {
    if (invoices.length === 0) return;
    const sanitize = (val: unknown): string => {
      let str = String(val ?? '');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      'INVOICE ID',
      'CLIENT ID',
      'PROJECT ID',
      'INVOICE DATE',
      'DUE DATE',
      'TOTAL AMOUNT',
      'PAID',
      'OUTSTANDING',
      'DAYS OVERDUE',
      'STATUS',
    ];

    const rows = invoices.map((inv) => [
      sanitize(inv.invoiceId),
      sanitize(inv.clientId),
      sanitize(inv.projectId),
      sanitize(inv.invoiceDate),
      sanitize(inv.dueDate),
      sanitize(inv.totalAmount),
      sanitize(inv.paidAmount),
      sanitize(inv.outstandingAmount),
      sanitize(inv.daysOverdue ?? '-'),
      sanitize(inv.status),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Finance_Invoices_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Record Payment Submit
  const handleRecordPaymentSubmit = async (payload: RecordPaymentPayload) => {
    await paymentsService.recordPayment(payload);
    setIsRecordPaymentOpen(false);
    handleRefresh();
  };

  // Derived KPI values
  const kpis = dashboardData?.kpis;
  const invoiceValue = kpis?.invoiceValue?.rawValue ?? 0;
  const collectedPayments = kpis?.collectedPayments?.rawValue ?? 0;
  const outstandingReceivables = kpis?.outstandingReceivables?.rawValue ?? 0;
  const totalExpenses = kpis?.totalExpenses?.rawValue ?? 0;
  const projectExpenses = kpis?.projectExpenses?.rawValue ?? 0;
  const operatingCashResult = kpis?.operatingCashResult?.rawValue ?? 0;
  const collectionRate = kpis?.collectionRate?.rawValue ?? 0;

  // Aging Buckets Data
  const agingBuckets = useMemo(() => {
    const raw = dashboardData?.ageingBuckets || [];
    const map = new Map<string, { label: string; amount: number; count: number }>();
    raw.forEach((b) => {
      map.set(b.bucketKey, { label: b.label, amount: b.amount, count: b.count });
    });

    return [
      {
        key: 'current',
        label: 'Current',
        color: '#10B981',
        amount: map.get('current')?.amount ?? 0,
        count: map.get('current')?.count ?? 0,
      },
      {
        key: '1_30',
        label: '1-30 Days',
        color: '#F59E0B',
        amount: map.get('1_30')?.amount ?? 0,
        count: map.get('1_30')?.count ?? 0,
      },
      {
        key: '31_60',
        label: '31-60 Days',
        color: '#F97316',
        amount: map.get('31_60')?.amount ?? 0,
        count: map.get('31_60')?.count ?? 0,
      },
      {
        key: '61_90',
        label: '61-90 Days',
        color: '#EF4444',
        amount: map.get('61_90')?.amount ?? 0,
        count: map.get('61_90')?.count ?? 0,
      },
      {
        key: '90_plus',
        label: '90+ Days',
        color: '#B91C1C',
        amount: map.get('90_plus')?.amount ?? 0,
        count: map.get('90_plus')?.count ?? 0,
      },
    ];
  }, [dashboardData]);

  const totalAgingOutstanding = useMemo(() => {
    return agingBuckets.reduce((acc, b) => acc + b.amount, 0);
  }, [agingBuckets]);

  const totalAgingInvoices = useMemo(() => {
    return agingBuckets.reduce((acc, b) => acc + b.count, 0);
  }, [agingBuckets]);

  // Computed segment geometry for smooth bar animations & boundary-safe tooltips
  const { segmentsWithGeometry, activeHoverSegment } = useMemo(() => {
    let accum = 0;
    const segments = agingBuckets.map((bucket) => {
      const targetPct = totalAgingOutstanding > 0 ? (bucket.amount / totalAgingOutstanding) * 100 : 0;
      const startPct = accum;
      accum += targetPct;
      const centerPct = startPct + targetPct / 2;
      return {
        ...bucket,
        targetPct,
        startPct,
        centerPct,
      };
    });
    const active = segments.find((s) => s.key === hoveredBucketKey && s.amount > 0) || null;
    return { segmentsWithGeometry: segments, activeHoverSegment: active };
  }, [agingBuckets, totalAgingOutstanding, hoveredBucketKey]);

  // Pagination calculation
  const startRecord = totalElements === 0 ? 0 : page * pageSize + 1;
  const endRecord = Math.min((page + 1) * pageSize, totalElements);

  const barContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [tooltipWidth, setTooltipWidth] = useState(200);

  useEffect(() => {
    const updateWidth = () => {
      if (barContainerRef.current) {
        setContainerWidth(barContainerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipWidth(tooltipRef.current.offsetWidth);
    }
  }, [activeHoverSegment]);

  const { tooltipStyle, pointerStyle } = useMemo(() => {
    if (!activeHoverSegment) {
      return { tooltipStyle: {}, pointerStyle: {} };
    }
    const w = containerWidth || (barContainerRef.current?.offsetWidth ?? 800);
    const tw = tooltipWidth || 200;
    const centerPx = (activeHoverSegment.centerPct / 100) * w;

    if (centerPx - tw / 2 < 8) {
      // Near left boundary: anchor box to left: 0, align pointer directly to segment center
      return {
        tooltipStyle: {
          left: '0px',
          transform: 'none',
        },
        pointerStyle: {
          left: `${Math.max(14, Math.min(tw - 14, centerPx))}px`,
          transform: 'translateX(-50%)',
        },
      };
    } else if (centerPx + tw / 2 > w - 8) {
      // Near right boundary: anchor box to right: 0, align pointer directly to segment center
      return {
        tooltipStyle: {
          right: '0px',
          left: 'auto',
          transform: 'none',
        },
        pointerStyle: {
          right: `${Math.max(14, Math.min(tw - 14, w - centerPx))}px`,
          left: 'auto',
          transform: 'translateX(50%)',
        },
      };
    } else {
      // Centered on segment
      return {
        tooltipStyle: {
          left: `${activeHoverSegment.centerPct}%`,
          transform: 'translateX(-50%)',
        },
        pointerStyle: {
          left: '50%',
          transform: 'translateX(-50%)',
        },
      };
    }
  }, [activeHoverSegment, containerWidth, tooltipWidth]);

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px',
        gap: '24px',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      {/* ========================================================= */}
      {/* Section - Title & Quick Actions Header                    */}
      {/* ========================================================= */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 0,
          width: '100%',
          height: '44px',
          boxSizing: 'border-box',
        }}
      >
        {/* Left: Icon & Title */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              background: '#EEF2FF',
              border: '1px solid #E0E7FF',
              borderRadius: '8px',
              flexShrink: 0,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <CreditCard style={{ width: '20px', height: '20px', color: '#4F46E5' }} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              paddingLeft: '12px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '18px',
                lineHeight: '28px',
                letterSpacing: '-0.45px',
                color: '#0F172A',
              }}
            >
              Finance Dashboard
            </h2>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '13px',
                lineHeight: '16px',
                color: '#64748B',
              }}
            >
              Track invoices, collections, receivables, expenses and cash position.
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          {/* Refresh Button */}
          <ReloadButton
            onClick={handleRefresh}
            isRefreshing={isRefreshing}
            title="Refresh"
          />

          {/* Export Button */}
          <button
            onClick={handleExport}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '0px 14px',
              height: '34px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
              e.currentTarget.style.borderColor = '#94A3B8';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Download style={{ width: '14px', height: '14px', color: '#4F46E5' }} />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#334155',
              }}
            >
              Export
            </span>
          </button>

          {/* + Record Payment Button */}
          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '0px 16px',
              height: '34px',
              background: '#4F46E5',
              borderRadius: '8px',
              border: 'none',
              gap: '6px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              lineHeight: '16px',
              color: '#FFFFFF',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4338CA';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(79, 70, 229, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4F46E5';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(79, 70, 229, 0.2)';
            }}
          >
            + Record Payment
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Section - KeyMetricsGrid (2 Rows)                         */}
      {/* ========================================================= */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '16px',
          width: '100%',
        }}
      >
        {/* Row 1: Primary Financial Totals (4 Cards) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '16px',
            width: '100%',
            height: '75px',
          }}
        >
          {/* Card 1: Invoice Value */}
          <div
            onMouseEnter={() => setHoveredCardKey('card-1')}
            onMouseLeave={() => setHoveredCardKey(null)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '16px',
              height: '75px',
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow:
                hoveredCardKey === 'card-1'
                  ? '0px 8px 20px rgba(0, 0, 0, 0.08)'
                  : '0px 1px 2px rgba(0, 0, 0, 0.05)',
              transform: hoveredCardKey === 'card-1' ? 'translateY(-2px)' : 'none',
              borderRadius: '12px',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: '#EEF2FF',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transform: hoveredCardKey === 'card-1' ? 'scale(1.1)' : 'none',
                transition: 'transform 0.25s ease',
              }}
            >
              <FileText style={{ width: '20px', height: '20px', color: '#4F46E5' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#64748B',
                }}
              >
                Invoice Value
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: '#0F172A',
                }}
              >
                {isLoadingDashboard ? '—' : formatINR(invoiceValue)}
              </span>
            </div>
          </div>

          {/* Card 2: Collected Payments */}
          <div
            onMouseEnter={() => setHoveredCardKey('card-2')}
            onMouseLeave={() => setHoveredCardKey(null)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '16px',
              height: '75px',
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow:
                hoveredCardKey === 'card-2'
                  ? '0px 8px 20px rgba(0, 0, 0, 0.08)'
                  : '0px 1px 2px rgba(0, 0, 0, 0.05)',
              transform: hoveredCardKey === 'card-2' ? 'translateY(-2px)' : 'none',
              borderRadius: '12px',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: '#ECFDF5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transform: hoveredCardKey === 'card-2' ? 'scale(1.1)' : 'none',
                transition: 'transform 0.25s ease',
              }}
            >
              <CheckCircle2 style={{ width: '20px', height: '20px', color: '#10B981' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#64748B',
                }}
              >
                Collected Payments
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: '#0F172A',
                }}
              >
                {isLoadingDashboard ? '—' : formatINR(collectedPayments)}
              </span>
            </div>
          </div>

          {/* Card 3: Outstanding Receivables */}
          <div
            onMouseEnter={() => setHoveredCardKey('card-3')}
            onMouseLeave={() => setHoveredCardKey(null)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '16px',
              height: '75px',
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow:
                hoveredCardKey === 'card-3'
                  ? '0px 8px 20px rgba(0, 0, 0, 0.08)'
                  : '0px 1px 2px rgba(0, 0, 0, 0.05)',
              transform: hoveredCardKey === 'card-3' ? 'translateY(-2px)' : 'none',
              borderRadius: '12px',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: '#FFFBEB',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transform: hoveredCardKey === 'card-3' ? 'scale(1.1)' : 'none',
                transition: 'transform 0.25s ease',
              }}
            >
              <Clock style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#64748B',
                }}
              >
                Outstanding Receivables
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: '#0F172A',
                }}
              >
                {isLoadingDashboard ? '—' : formatINR(outstandingReceivables)}
              </span>
            </div>
          </div>

          {/* Card 4: Total Expenses */}
          <div
            onMouseEnter={() => setHoveredCardKey('card-4')}
            onMouseLeave={() => setHoveredCardKey(null)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '16px',
              height: '75px',
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow:
                hoveredCardKey === 'card-4'
                  ? '0px 8px 20px rgba(0, 0, 0, 0.08)'
                  : '0px 1px 2px rgba(0, 0, 0, 0.05)',
              transform: hoveredCardKey === 'card-4' ? 'translateY(-2px)' : 'none',
              borderRadius: '12px',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: '#FFF1F2',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transform: hoveredCardKey === 'card-4' ? 'scale(1.1)' : 'none',
                transition: 'transform 0.25s ease',
              }}
            >
              <CreditCard style={{ width: '20px', height: '20px', color: '#EF4444' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#64748B',
                }}
              >
                Total Expenses
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: '#0F172A',
                }}
              >
                {isLoadingDashboard ? '—' : formatINR(totalExpenses)}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Secondary Indicators (3 Cards) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '16px',
            width: '100%',
            height: '75px',
          }}
        >
          {/* Card 5: Project Expenses */}
          <div
            onMouseEnter={() => setHoveredCardKey('card-5')}
            onMouseLeave={() => setHoveredCardKey(null)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '16px',
              height: '75px',
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow:
                hoveredCardKey === 'card-5'
                  ? '0px 8px 20px rgba(0, 0, 0, 0.08)'
                  : '0px 1px 2px rgba(0, 0, 0, 0.05)',
              transform: hoveredCardKey === 'card-5' ? 'translateY(-2px)' : 'none',
              borderRadius: '12px',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: '#F0F9FF',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transform: hoveredCardKey === 'card-5' ? 'scale(1.1)' : 'none',
                transition: 'transform 0.25s ease',
              }}
            >
              <Briefcase style={{ width: '20px', height: '20px', color: '#0284C7' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#64748B',
                }}
              >
                Project Expenses
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: '#0F172A',
                }}
              >
                {isLoadingDashboard ? '—' : formatINR(projectExpenses)}
              </span>
            </div>
          </div>

          {/* Card 6: Operating Cash Result */}
          <div
            onMouseEnter={() => setHoveredCardKey('card-6')}
            onMouseLeave={() => setHoveredCardKey(null)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '16px',
              height: '75px',
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow:
                hoveredCardKey === 'card-6'
                  ? '0px 8px 20px rgba(0, 0, 0, 0.08)'
                  : '0px 1px 2px rgba(0, 0, 0, 0.05)',
              transform: hoveredCardKey === 'card-6' ? 'translateY(-2px)' : 'none',
              borderRadius: '12px',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: '#F0FDFA',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transform: hoveredCardKey === 'card-6' ? 'scale(1.1)' : 'none',
                transition: 'transform 0.25s ease',
              }}
            >
              <TrendingUp style={{ width: '20px', height: '20px', color: '#0D9488' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#64748B',
                }}
              >
                Operating Cash Result
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: '#0F172A',
                }}
              >
                {isLoadingDashboard ? '—' : formatINR(operatingCashResult)}
              </span>
            </div>
          </div>

          {/* Card 7: Collection Rate */}
          <div
            onMouseEnter={() => setHoveredCardKey('card-7')}
            onMouseLeave={() => setHoveredCardKey(null)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '16px',
              height: '75px',
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow:
                hoveredCardKey === 'card-7'
                  ? '0px 8px 20px rgba(0, 0, 0, 0.08)'
                  : '0px 1px 2px rgba(0, 0, 0, 0.05)',
              transform: hoveredCardKey === 'card-7' ? 'translateY(-2px)' : 'none',
              borderRadius: '12px',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: '#F5F3FF',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transform: hoveredCardKey === 'card-7' ? 'scale(1.1)' : 'none',
                transition: 'transform 0.25s ease',
              }}
            >
              <Percent style={{ width: '20px', height: '20px', color: '#7C3AED' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#64748B',
                }}
              >
                Collection Rate
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: '#0F172A',
                }}
              >
                {isLoadingDashboard ? '—' : `${Math.round(collectionRate)}%`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Section - ReceivablesAgingCard                             */}
      {/* ========================================================= */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '20px',
          gap: '16px',
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
        }}
      >
        {/* Title & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '20px',
              color: '#0F172A',
            }}
          >
            Receivables Aging
          </span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '16px',
              color: '#64748B',
              marginTop: '2px',
            }}
          >
            Outstanding {formatINR(totalAgingOutstanding || outstandingReceivables)} across{' '}
            {totalAgingInvoices} invoices
          </span>
        </div>

        {/* Multi-segment Colored Horizontal Bar with Smooth Animation & Non-Clipping Tooltips */}
        <div
          ref={barContainerRef}
          style={{
            position: 'relative',
            width: '100%',
            marginTop: '34px',
            marginBottom: '4px',
          }}
        >
          {/* Floating Tooltip Clamped Within Container with Exact Segment Pointer (CEO Dashboard style) */}
          {activeHoverSegment && (
            <div
              ref={tooltipRef}
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 9px)',
                ...tooltipStyle,
                background: '#FFFFFF',
                color: '#0F172A',
                padding: '7px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: '0 10px 25px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
                border: '1px solid #E2E8F0',
                pointerEvents: 'none',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'fadeIn 0.15s ease-out',
                transition: 'left 0.15s ease-out, right 0.15s ease-out',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  background: activeHoverSegment.color,
                  flexShrink: 0,
                }}
              />
                  <span style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{activeHoverSegment.label}:</span>{' '}
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatINR(activeHoverSegment.amount)}</span>{' '}
                    <span style={{ color: '#64748B', fontWeight: 400, fontSize: '11px' }}>
                      ({activeHoverSegment.count} inv • {Math.round(activeHoverSegment.targetPct)}%)
                    </span>
                  </span>
                  {/* Triangle Pointer */}

                  {/* Downward pointing triangle pointer (Outer border triangle) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      ...pointerStyle,
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid #CBD5E1',
                      zIndex: 51,
                    }}
                  />
                  {/* Inner White Triangle */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% - 1px)',
                      ...pointerStyle,
                      width: 0,
                      height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: '5px solid #FFFFFF',
                      zIndex: 52,
                    }}
                  />
                </div>
          )}

                {/* Bar Track with Full Pill Clip */}
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    height: '14px',
                    background: '#F1F5F9',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
                  }}
                >
                  {totalAgingOutstanding > 0 ? (
                    segmentsWithGeometry.map((bucket) => {
                      const widthPct = isAnimated ? bucket.targetPct : 0;
                      if (bucket.targetPct <= 0) return null;
                      const isHovered = hoveredBucketKey === bucket.key;

                      return (
                        <div
                          key={bucket.key}
                          onMouseEnter={() => {
                            if (barContainerRef.current) {
                              setContainerWidth(barContainerRef.current.offsetWidth);
                            }
                            setHoveredBucketKey(bucket.key);
                          }}
                          onMouseLeave={() => setHoveredBucketKey(null)}
                          style={{
                            position: 'relative',
                            width: `${widthPct}%`,
                            height: '100%',
                            background: bucket.color,
                            transition:
                              'width 1s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease, opacity 0.2s ease',
                            filter: isHovered
                              ? 'brightness(1.15) saturate(1.1)'
                              : 'none',
                            opacity: hoveredBucketKey !== null ? (isHovered ? 1 : 0.88) : 1,
                            cursor: 'pointer',
                          }}
                        />
                      );
                    })
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#E2E8F0', borderRadius: '9999px' }} />
                  )}
                </div>
            </div>

        {/* 5 Aging Metric Columns with Linked Interactive Highlights */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              width: '100%',
              paddingTop: '4px',
            }}
          >
            {agingBuckets.map((bucket) => {
              const isHovered = hoveredBucketKey === bucket.key;
              return (
                <div
                  key={bucket.key}
                  onMouseEnter={() => {
                    if (barContainerRef.current) {
                      setContainerWidth(barContainerRef.current.offsetWidth);
                    }
                    setHoveredBucketKey(bucket.key);
                  }}
                  onMouseLeave={() => setHoveredBucketKey(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: isHovered ? '#F8FAFC' : 'transparent',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                    boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                >
                  {/* Color Bullet + Label */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '9999px',
                        background: bucket.color,
                        flexShrink: 0,
                        transform: isHovered ? 'scale(1.3)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: isHovered ? 700 : 500,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: isHovered ? '#0F172A' : '#334155',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {bucket.label}
                    </span>
                  </div>

                  {/* Amount */}
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: isHovered ? '#4F46E5' : '#0F172A',
                      marginTop: '4px',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {isLoadingDashboard ? '—' : formatINR(bucket.amount)}
                  </span>

                  {/* Invoices Count */}
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      fontSize: '12px',
                      lineHeight: '16px',
                      color: '#64748B',
                    }}
                  >
                    {isLoadingDashboard ? '—' : `${bucket.count} invoices`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* Section - InvoicesTableSection                             */}
        {/* ========================================================= */}
        <div
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: 0,
            width: '100%',
            background: '#FFFFFF',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Tab Navigation Bar */}
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '12px 20px 0px',
              width: '100%',
              height: '43px',
              borderBottom: '1px solid #E2E8F0',
              gap: '24px',
            }}
          >
            {(['Invoices', 'Payments', 'Expenses', 'Cash Flow'] as TabType[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(0);
                  }}
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0px 0px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #4F46E5' : '2px solid transparent',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: isActive ? '#4F46E5' : '#64748B',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#334155';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#64748B';
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Filter & Search Controls */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '20px',
              gap: '16px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Search Row with Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                height: '30px',
              }}
            >
              {/* Search Input */}
              <div
                style={{
                  position: 'relative',
                  flex: 1,
                  height: '30px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '7px',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Search style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
                </div>
                <input
                  type="text"
                  placeholder={
                    activeTab === 'Invoices'
                      ? 'Search by Invoice ID, Client, or Project...'
                      : activeTab === 'Payments'
                        ? 'Search payments by ID, Client, or Reference...'
                        : activeTab === 'Expenses'
                          ? 'Search expenses by ID, Category, or Vendor...'
                          : 'Search cash flow records...'
                  }
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '30px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '6px 12px 6px 36px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    lineHeight: '15px',
                    color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#4F46E5';
                    e.currentTarget.style.boxShadow = '0 0 0 1px #4F46E5';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Filters Button (Strictly NO (0)) */}
              <button
                onClick={() => { }}
                style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '6px 12px',
                  height: '30px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <Filter style={{ width: '14px', height: '14px', color: '#64748B' }} />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#475569',
                  }}
                >
                  Filters
                </span>
              </button>

              {/* Clear Filters Button */}
              <button
                onClick={handleClearFilters}
                style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '6px 12px',
                  height: '30px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <RotateCw style={{ width: '14px', height: '14px', color: '#64748B' }} />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#475569',
                  }}
                >
                  Clear Filters
                </span>
              </button>
            </div>

            {/* Filter Dropdown Selectors */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: 0,
                gap: '16px',
                width: '100%',
              }}
            >
              {/* Status Dropdown */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: '11px',
                    lineHeight: '16px',
                    color: '#64748B',
                  }}
                >
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '30px',
                    padding: '0px 12px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#334155',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <option value="All">All</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Due Soon">Due Soon</option>
                </select>
              </div>

              {/* Aging Bucket Dropdown */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: '11px',
                    lineHeight: '16px',
                    color: '#64748B',
                  }}
                >
                  Aging Bucket
                </label>
                <select
                  value={agingFilter}
                  onChange={(e) => {
                    setAgingFilter(e.target.value);
                    setPage(0);
                  }}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '30px',
                    padding: '0px 12px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#334155',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <option value="All">All</option>
                  <option value="Current">Current</option>
                  <option value="1–30 days">1-30 Days</option>
                  <option value="31–60 days">31-60 Days</option>
                  <option value="61–90 days">61-90 Days</option>
                  <option value="90+ days">90+ Days</option>
                </select>
              </div>

              {/* Client Dropdown */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: '11px',
                    lineHeight: '16px',
                    color: '#64748B',
                  }}
                >
                  Client
                </label>
                <select
                  value={clientFilter}
                  onChange={(e) => {
                    setClientFilter(e.target.value);
                    setPage(0);
                  }}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '30px',
                    padding: '0px 12px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: '#334155',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <option value="All">All</option>
                  {clientOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div
            style={{
              boxSizing: 'border-box',
              width: '100%',
              overflowX: 'auto',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            {activeTab === 'Invoices' && (
              <table
                style={{
                  width: '100%',
                  minWidth: '1020px',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: 'rgba(248, 250, 252, 0.75)',
                      borderBottom: '1px solid #E2E8F0',
                      height: '40px',
                    }}
                  >
                    <th
                      style={{
                        padding: '12px 20px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        lineHeight: '16px',
                        letterSpacing: '0.55px',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        width: '110px',
                      }}
                    >
                      INVOICE ID
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        lineHeight: '16px',
                        letterSpacing: '0.55px',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        width: '95px',
                      }}
                    >
                      CLIENT ID
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        lineHeight: '16px',
                        letterSpacing: '0.55px',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        width: '105px',
                      }}
                    >
                      PROJECT ID
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        lineHeight: '16px',
                        letterSpacing: '0.55px',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        width: '120px',
                      }}
                    >
                      INVOICE DATE
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        lineHeight: '16px',
                        letterSpacing: '0.55px',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        width: '110px',
                      }}
                    >
                      DUE DATE
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        lineHeight: '16px',
                        letterSpacing: '0.55px',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        width: '120px',
                      }}
                    >
                      TOTAL AMOUNT
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        lineHeight: '16px',
                        letterSpacing: '0.55px',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        width: '95px',
                      }}
                    >
                      PAID
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        lineHeight: '16px',
                        letterSpacing: '0.55px',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        width: '120px',
                      }}
                    >
                      OUTSTANDING
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        lineHeight: '16px',
                        letterSpacing: '0.55px',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        width: '115px',
                      }}
                    >
                      DAYS OVERDUE
                    </th>
                    <th
                      style={{
                        padding: '12px 20px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        fontSize: '11px',
                        lineHeight: '16px',
                        letterSpacing: '0.55px',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        textAlign: 'center',
                        width: '110px',
                      }}
                    >
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTable ? (
                    <tr>
                      <td colSpan={10} style={{ padding: '36px', textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#64748B',
                            fontSize: '13px',
                          }}
                        >
                          <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5]" />
                          Loading invoices...
                        </div>
                      </td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        style={{
                          padding: '40px',
                          textAlign: 'center',
                          color: '#64748B',
                          fontSize: '13px',
                        }}
                      >
                        No invoices found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => {
                      const isOverdue = (inv.daysOverdue ?? 0) > 0;
                      return (
                        <tr
                          key={inv.invoiceId}
                          style={{
                            height: '51px',
                            borderBottom: '1px solid #F1F5F9',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td
                            style={{
                              padding: '17px 20px 18px',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#4F46E5',
                            }}
                          >
                            {inv.invoiceId}
                          </td>
                          <td
                            style={{
                              padding: '17px 16px 18px',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 500,
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#475569',
                            }}
                          >
                            {inv.clientId || '—'}
                          </td>
                          <td
                            style={{
                              padding: '17px 16px 18px',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 500,
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#475569',
                            }}
                          >
                            {inv.projectId || '—'}
                          </td>
                          <td
                            style={{
                              padding: '17px 16px 18px',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 400,
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#475569',
                            }}
                          >
                            {inv.invoiceDate || '—'}
                          </td>
                          <td
                            style={{
                              padding: '17px 16px 18px',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 400,
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#475569',
                            }}
                          >
                            {inv.dueDate || '—'}
                          </td>
                          <td
                            style={{
                              padding: '17px 16px 18px',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 700,
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#0F172A',
                            }}
                          >
                            {formatINR(inv.totalAmount)}
                          </td>
                          <td
                            style={{
                              padding: '17px 16px 18px',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 500,
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#475569',
                            }}
                          >
                            {formatINR(inv.paidAmount)}
                          </td>
                          <td
                            style={{
                              padding: '17px 16px 18px',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 700,
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#0F172A',
                            }}
                          >
                            {formatINR(inv.outstandingAmount)}
                          </td>
                          <td
                            style={{
                              padding: '17px 16px 18px',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 500,
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: isOverdue ? '#EF4444' : '#475569',
                            }}
                          >
                            {isOverdue ? inv.daysOverdue : '-'}
                          </td>
                          <td
                            style={{
                              padding: '12px 20px',
                              textAlign: 'center',
                            }}
                          >
                            <button
                              title="Actions"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                              }}
                            >
                              <MoreVertical style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'Payments' && (
              <table
                style={{
                  width: '100%',
                  minWidth: '900px',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: 'rgba(248, 250, 252, 0.75)',
                      borderBottom: '1px solid #E2E8F0',
                      height: '40px',
                    }}
                  >
                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      PAYMENT ID
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      INVOICE ID
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      CLIENT
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      DATE
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      AMOUNT
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      MODE
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      REFERENCE
                    </th>
                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#64748B', textAlign: 'center' }}>
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTable ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '36px', textAlign: 'center' }}>
                        <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5] inline" /> Loading payments...
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                        No payments found.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr
                        key={p.id}
                        style={{ height: '51px', borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ padding: '17px 20px', fontWeight: 600, fontSize: '12px', color: '#4F46E5' }}>{p.id}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#475569' }}>{p.invoiceId}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#475569' }}>{p.clientName}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#475569' }}>{p.paymentDate}</td>
                        <td style={{ padding: '17px 16px', fontWeight: 700, fontSize: '12px', color: '#0F172A' }}>{formatINR(p.amount)}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#475569' }}>{p.mode}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#475569' }}>{p.referenceNo || '—'}</td>
                        <td style={{ padding: '17px 20px', textAlign: 'center', fontSize: '12px', color: '#10B981', fontWeight: 600 }}>{p.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'Expenses' && (
              <table
                style={{
                  width: '100%',
                  minWidth: '900px',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: 'rgba(248, 250, 252, 0.75)',
                      borderBottom: '1px solid #E2E8F0',
                      height: '40px',
                    }}
                  >
                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      EXPENSE CODE
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      CATEGORY
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      DESCRIPTION
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      DATE
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      AMOUNT
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      PROJECT ID
                    </th>
                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#64748B', textAlign: 'center' }}>
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTable ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px', textAlign: 'center' }}>
                        <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5] inline" /> Loading expenses...
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                        No expenses found.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((e) => (
                      <tr
                        key={e.id}
                        style={{ height: '51px', borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ padding: '17px 20px', fontWeight: 600, fontSize: '12px', color: '#4F46E5' }}>{e.expenseCode}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#475569' }}>{e.category}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#475569' }}>{e.description}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#475569' }}>{e.expenseDate}</td>
                        <td style={{ padding: '17px 16px', fontWeight: 700, fontSize: '12px', color: '#0F172A' }}>{formatINR(e.totalAmount)}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#475569' }}>{e.projectId || '—'}</td>
                        <td style={{ padding: '17px 20px', textAlign: 'center', fontSize: '12px', color: '#0F172A', fontWeight: 500 }}>{e.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'Cash Flow' && (
              <table
                style={{
                  width: '100%',
                  minWidth: '900px',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: 'rgba(248, 250, 252, 0.75)',
                      borderBottom: '1px solid #E2E8F0',
                      height: '40px',
                    }}
                  >
                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      CASH FLOW ID
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      PERIOD
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      INFLOWS
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      OUTFLOWS
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      NET CASH FLOW
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                      CLOSING CASH
                    </th>
                    <th style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#64748B', textAlign: 'center' }}>
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTable ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px', textAlign: 'center' }}>
                        <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5] inline" /> Loading cash flow...
                      </td>
                    </tr>
                  ) : cashFlows.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                        No cash flow records found.
                      </td>
                    </tr>
                  ) : (
                    cashFlows.map((cf) => (
                      <tr
                        key={cf.id}
                        style={{ height: '51px', borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ padding: '17px 20px', fontWeight: 600, fontSize: '12px', color: '#4F46E5' }}>{cf.cashFlowId}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                          {cf.period}
                        </td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#10B981', fontWeight: 600 }}>{formatINR(cf.totalInflows)}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>{formatINR(cf.totalOutflows)}</td>
                        <td style={{ padding: '17px 16px', fontWeight: 700, fontSize: '12px', color: cf.netCashFlow >= 0 ? '#10B981' : '#EF4444' }}>{formatINR(cf.netCashFlow)}</td>
                        <td style={{ padding: '17px 16px', fontSize: '12px', color: '#0F172A', fontWeight: 700 }}>{formatINR(cf.closingCash)}</td>
                        <td style={{ padding: '17px 20px', textAlign: 'center', fontSize: '12px', color: '#0F172A', fontWeight: 500 }}>{cf.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls Footer */}
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              width: '100%',
              height: '63px',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            {/* Left: Showing Text */}
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#64748B',
              }}
            >
              Showing {startRecord} - {endRecord} of {totalElements}{' '}
              {activeTab.toLowerCase()}
            </span>

            {/* Right: Numerical Buttons & Page Size */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
              {/* Numerical Page Buttons */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
                {/* Prev Button */}
                <button
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '28px',
                    height: '28px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '4px',
                    cursor: page <= 0 ? 'not-allowed' : 'pointer',
                    opacity: page <= 0 ? 0.5 : 1,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (page > 0) e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  <ChevronLeft style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                  const pageNum = idx;
                  const isActive = page === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      style={{
                        boxSizing: 'border-box',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '28px',
                        height: '28px',
                        background: isActive ? '#4F46E5' : 'transparent',
                        border: isActive ? 'none' : '1px solid transparent',
                        borderRadius: '4px',
                        boxShadow: isActive ? '0px 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: isActive ? '#FFFFFF' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#F1F5F9';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span
                      style={{
                        padding: '0 4px',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '12px',
                        color: '#94A3B8',
                      }}
                    >
                      ...
                    </span>
                    <button
                      onClick={() => setPage(totalPages - 1)}
                      style={{
                        boxSizing: 'border-box',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '28px',
                        height: '28px',
                        background: page === totalPages - 1 ? '#4F46E5' : 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '12px',
                        color: page === totalPages - 1 ? '#FFFFFF' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* Next Button */}
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '28px',
                    height: '28px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '4px',
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    opacity: page >= totalPages - 1 ? 0.5 : 1,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (page < totalPages - 1) e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  <ChevronRight style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
                </button>
              </div>

              {/* Page Size Dropdown */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                style={{
                  boxSizing: 'border-box',
                  width: '111px',
                  height: '30px',
                  padding: '0px 8px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Record Payment Modal */}
        {isRecordPaymentOpen && (
          <RecordPaymentModal
            isOpen={isRecordPaymentOpen}
            onClose={() => setIsRecordPaymentOpen(false)}
            onSubmit={handleRecordPaymentSubmit}
            clients={paymentClientOptions}
          />
        )}
      </div>
      );
};
