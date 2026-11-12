import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  RotateCw,
  Clock,
  Check,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { transactionControlService } from '../services/transactionControlService';
import {
  TransactionCheckClassification,
  TransactionControlCheck,
  TransactionControlRecord,
} from '../types/transactionControl';

const WORKBOOK_CONTROL_DEFINITIONS: TransactionControlCheck[] = [
  {
    id: 'invalid-relationships',
    control: 'Invalid relationships',
    description: 'Records whose client, project, or invoice references do not match master registers.',
    classification: 'CRITICAL',
    count: 0,
    actionLabel: 'Fix linked records',
    actionPath: '/sales/contracts',
    nested: false,
    statusFilterLabel: 'Status',
    statusOptions: [],
    records: [],
  },
  {
    id: 'invalid-payment-invoices',
    control: 'Invalid payment invoices',
    description: 'Nonblank Invoice ID does not match the invoice register.',
    classification: 'CRITICAL',
    count: 0,
    actionLabel: 'Link payment to valid invoice',
    actionPath: '/finance/payments',
    nested: true,
    statusFilterLabel: 'Payment status',
    statusOptions: [],
    records: [],
  },
  {
    id: 'invoice-review-flags',
    control: 'Invoice review flags',
    description: 'Invoices or payments with balance variances, negative values, or mismatched statuses.',
    classification: 'REVIEW',
    count: 0,
    actionLabel: 'Check invoice receipts',
    actionPath: '/finance/invoices',
    nested: false,
    statusFilterLabel: 'Status',
    statusOptions: [],
    records: [],
  },
  {
    id: 'overdue-collections',
    control: 'Overdue collections',
    description: 'Invoices with remaining balance past their due date.',
    classification: 'ACTION',
    count: 0,
    actionLabel: 'Open Collections',
    actionPath: '/management/collections',
    nested: false,
    statusFilterLabel: 'Status',
    statusOptions: [],
    records: [],
  },
  {
    id: 'overdue-tasks',
    control: 'Overdue tasks',
    description: 'Open project tasks whose planned due date has elapsed without completion.',
    classification: 'ACTION',
    count: 0,
    actionLabel: 'Open Project Control',
    actionPath: '/projects/tasks',
    nested: false,
    statusFilterLabel: 'Status',
    statusOptions: [],
    records: [],
  },
  {
    id: 'data-quality-issues',
    control: 'Data quality issues',
    description: 'Client, invoice, or payment records missing required identifiers or non-positive amounts.',
    classification: 'REVIEW',
    count: 0,
    actionLabel: 'Open Data Quality',
    actionPath: '/reports/data-quality',
    nested: false,
    statusFilterLabel: 'Status',
    statusOptions: [],
    records: [],
  },
];

const CLASSIFICATION_STYLES: Record<
  TransactionCheckClassification,
  { bg: string; border: string; text: string }
> = {
  CRITICAL: { bg: '#FEF2F2', border: '#FEE2E2', text: '#DC2626' },
  REVIEW: { bg: '#EEF2FF', border: '#E0E7FF', text: '#4F46E5' },
  ACTION: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' },
};

const TABLE_COLUMNS_BY_CHECK: Record<string, string[]> = {
  'invalid-relationships': [
    'RECORD / ROW',
    'DATE',
    'LINKED ID',
    'CLIENT / PROJECT',
    'AMOUNT / HOURS',
    'CONTEXT',
    'RELATIONSHIP CHECK',
    'ACTION',
  ],
  'invalid-payment-invoices': [
    'PAYMENT / ROW',
    'DATE',
    'INVOICE ID',
    'CLIENT ID',
    'AMOUNT',
    'MODE / REFERENCE',
    'PAYMENT CHECK',
    'ACTION',
  ],
  'invoice-review-flags': [
    'RECORD / ROW',
    'DATE',
    'INVOICE ID',
    'CLIENT ID',
    'AMOUNT',
    'PAID / REFERENCE',
    'REVIEW FLAG',
    'ACTION',
  ],
  'overdue-collections': [
    'INVOICE / ROW',
    'DUE DATE',
    'INVOICE ID',
    'CLIENT ID',
    'OUTSTANDING',
    'AGEING / FOLLOW-UP',
    'COLLECTION CHECK',
    'ACTION',
  ],
  'overdue-tasks': [
    'TASK / ROW',
    'DUE DATE',
    'PROJECT ID',
    'ASSIGNED TO',
    'HOURS',
    'PRIORITY / DELAY',
    'TASK CHECK',
    'ACTION',
  ],
  'data-quality-issues': [
    'RECORD / ROW',
    'UPDATED',
    'RECORD ID',
    'CLIENT / OWNER',
    'AMOUNT / MODULE',
    'MISSING / ISSUE',
    'QUALITY CHECK',
    'ACTION',
  ],
};

function formatIndianCurrency(value?: number | null, fallback?: string | null): string {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    const formatted = Math.abs(Math.round(value)).toLocaleString('en-IN');
    return value < 0 ? `-₹ ${formatted}` : `₹ ${formatted}`;
  }
  return fallback || '—';
}

function formatIndianNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getRecordStatusBadgeStyle(status?: string | null): { bg: string; border: string; text: string } {
  const normalized = (status || '').trim().toLowerCase();
  if (normalized === 'matched' || normalized === 'paid' || normalized === 'active') {
    return { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669' };
  }
  if (normalized === 'partially matched' || normalized === 'partially paid' || normalized === 'in progress') {
    return { bg: '#FFF7ED', border: '#FFEDD5', text: '#C2410C' };
  }
  if (normalized === 'pending' || normalized === 'due soon' || normalized === 'review') {
    return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' };
  }
  if (normalized === 'unmatched' || normalized === 'overdue' || normalized === 'flagged') {
    return { bg: '#FEF2F2', border: '#FEE2E2', text: '#DC2626' };
  }
  return { bg: '#F8FAFC', border: '#E2E8F0', text: '#64748B' };
}

export const TransactionControlPage: React.FC = () => {
  const navigate = useNavigate();

  const [checks, setChecks] = useState<TransactionControlCheck[]>(WORKBOOK_CONTROL_DEFINITIONS);
  const [selectedCheckId, setSelectedCheckId] = useState<string>('invalid-payment-invoices');
  const [verificationAvailable, setVerificationAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const applyResponse = useCallback((response: Awaited<ReturnType<typeof transactionControlService.getChecks>>, isManual: boolean) => {
    if (response && Array.isArray(response.checks) && response.checks.length > 0) {
      setChecks(response.checks);
      setVerificationAvailable(Boolean(response.verificationAvailable));
      if (!isManual && response.defaultSelectedCheckId) {
        setSelectedCheckId(response.defaultSelectedCheckId);
      }
    } else {
      setChecks(WORKBOOK_CONTROL_DEFINITIONS);
      setVerificationAvailable(false);
    }
  }, []);

  const loadChecks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await transactionControlService.getChecks();
      applyResponse(response, false);
    } catch {
      setChecks(WORKBOOK_CONTROL_DEFINITIONS);
      setVerificationAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, [applyResponse]);

  useEffect(() => {
    loadChecks();
  }, [loadChecks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCheck = useMemo(() => {
    return (
      checks.find((c) => c.id === selectedCheckId) ||
      checks.find((c) => c.id === 'invalid-payment-invoices') ||
      checks[0]
    );
  }, [checks, selectedCheckId]);

  const statusOptions = useMemo(() => {
    const unique = new Set<string>(['All']);
    (activeCheck?.statusOptions || []).forEach((s) => {
      if (s && s.trim()) unique.add(s);
    });
    return Array.from(unique);
  }, [activeCheck]);

  const filteredRecords = useMemo<TransactionControlRecord[]>(() => {
    const source = activeCheck?.records || [];
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return source.filter((rec) => {
      if (statusFilter !== 'All' && (rec.status || '') !== statusFilter) {
        return false;
      }
      if (!normalizedSearch) return true;
      const haystack = [
        rec.primaryLabel,
        rec.secondaryLabel,
        rec.invoiceId,
        rec.clientId,
        rec.clientName,
        rec.modeOrReference,
        rec.referenceSub,
        rec.checkDetail,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [activeCheck, searchQuery, statusFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredRecords.length / pageSize)),
    [filteredRecords.length, pageSize]
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safePage, pageSize]);

  const activeColumns =
    TABLE_COLUMNS_BY_CHECK[activeCheck.id] || TABLE_COLUMNS_BY_CHECK['invalid-payment-invoices'];

  const handleSelectCheck = (checkId: string) => {
    setSelectedCheckId(checkId);
    setStatusFilter('All');
    setCurrentPage(1);
    setIsStatusDropdownOpen(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCurrentPage(1);
    setIsStatusDropdownOpen(false);
  };

  const handleRecheck = async () => {
    if (!verificationAvailable || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const response = await transactionControlService.recheck();
      applyResponse(response, true);
    } catch {
      setChecks(WORKBOOK_CONTROL_DEFINITIONS);
      setVerificationAvailable(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  const showUnavailableState = !isLoading && !verificationAvailable;
  const startEntry = filteredRecords.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endEntry = Math.min(safePage * pageSize, filteredRecords.length);

  return (
    <div
      className="w-full flex flex-col gap-[20px] p-[24px] box-border antialiased"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 1. Section - PageHeader */}
      <section className="flex flex-row justify-between items-center gap-4 flex-wrap w-full">
        <div className="flex flex-row items-start gap-[14px]">
          <div className="pt-[2px]">
            <div className="w-[40px] h-[40px] rounded-[12px] bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-[20px] h-[20px] text-[#4F46E5]" strokeWidth={1.67} />
            </div>
          </div>
          <div className="flex flex-col gap-[2px]">
            <h1 className="m-0 font-bold text-[20px] leading-[28px] tracking-[-0.5px] text-[#0F172A]">
              Transaction Control
            </h1>
            <p className="m-0 font-normal text-[12px] leading-[16px] text-[#64748B]">
              Review transaction exceptions and open the source records for correction.
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center gap-[10px]">
          <button
            type="button"
            onClick={handleRecheck}
            disabled={showUnavailableState || isRefreshing}
            className={`h-[30px] px-[12px] py-[6px] inline-flex items-center gap-[6px] bg-white border border-[#E2E8F0] rounded-[8px] font-medium text-[12px] leading-[16px] transition-colors ${
              showUnavailableState
                ? 'text-[#94A3B8] cursor-not-allowed'
                : 'text-[#334155] hover:bg-[#F8FAFC] cursor-pointer'
            }`}
          >
            <RotateCw
              className={`w-[14px] h-[14px] ${
                showUnavailableState ? 'text-[#94A3B8]' : 'text-[#64748B]'
              } ${isRefreshing ? 'animate-spin' : ''}`}
              strokeWidth={1.5}
            />
            <span>
              {showUnavailableState
                ? 'Recheck unavailable'
                : isRefreshing
                ? 'Rechecking...'
                : 'Recheck'}
            </span>
          </button>
        </div>
      </section>

      {/* 2. Section - TransactionChecksCard */}
      <section className="w-full bg-white border border-[rgba(226,232,240,0.9)] rounded-[12px] overflow-hidden box-border">
        {/* Card Header Area */}
        <div className="px-[20px] pt-[16px] pb-[12px] flex flex-row justify-between items-start gap-4 flex-wrap">
          <div className="flex flex-col gap-[2px]">
            <h2 className="m-0 font-semibold text-[14px] leading-[20px] text-[#0F172A]">
              Transaction checks
            </h2>
            <p className="m-0 font-normal text-[12px] leading-[16px] text-[#64748B]">
              Six workbook-defined controls. Select a check to review its source records.
            </p>
            <div className="pt-[2px] flex flex-row items-center gap-[4px]">
              <Clock className="w-[12px] h-[12px] text-[#94A3B8] shrink-0" strokeWidth={1.5} />
              <span className="font-normal text-[11px] leading-[16px] text-[#94A3B8]">
                Classification describes the check, not a confirmed incident.
              </span>
            </div>
          </div>

          <div className="h-[27px] px-[10px] py-[4px] inline-flex items-center gap-[4px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] shrink-0">
            <Check className="w-[12px] h-[12px] text-[#94A3B8]" strokeWidth={1.5} />
            <span className="font-medium text-[11px] leading-[16px] text-[#64748B] whitespace-nowrap">
              Read-only calculated results
            </span>
          </div>
        </div>

        {/* Transaction Checks Table */}
        <div className="border-t border-[#F1F5F9] overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-[37px] bg-[rgba(248,250,252,0.7)] border-b border-[#F1F5F9]">
                <th className="px-[20px] py-[10px] font-semibold text-[11px] leading-[16px] tracking-[0.55px] uppercase text-[#94A3B8]">
                  CONTROL
                </th>
                <th className="px-[16px] py-[10px] font-semibold text-[11px] leading-[16px] tracking-[0.55px] uppercase text-[#94A3B8]">
                  COUNT
                </th>
                <th className="px-[16px] py-[10px] font-semibold text-[11px] leading-[16px] tracking-[0.55px] uppercase text-[#94A3B8]">
                  CLASSIFICATION
                </th>
                <th className="px-[20px] py-[10px] text-right font-semibold text-[11px] leading-[16px] tracking-[0.55px] uppercase text-[#94A3B8]">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {checks.map((check) => {
                const isSelected = check.id === activeCheck.id;
                const badgeStyle = CLASSIFICATION_STYLES[check.classification];

                return (
                  <tr
                    key={check.id}
                    onClick={() => handleSelectCheck(check.id)}
                    aria-selected={isSelected}
                    className={`h-[43px] cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[rgba(238,242,255,0.28)] shadow-[inset_2px_0_0_#6366F1]'
                        : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <td
                      className={`py-[10px] pr-[20px] font-medium text-[12px] leading-[16px] text-[#1E293B] ${
                        check.nested ? 'pl-[30px]' : 'pl-[20px]'
                      }`}
                    >
                      {check.control}
                    </td>
                    <td className="px-[16px] py-[10px] font-semibold text-[12px] leading-[16px] tabular-nums">
                      {isLoading ? (
                        <span className="inline-block w-5 h-3 rounded bg-slate-200 animate-pulse" />
                      ) : !verificationAvailable ? (
                        <span className="font-medium text-[#94A3B8]">—</span>
                      ) : (
                        <span className={check.count > 0 ? 'text-[#0F172A]' : 'text-[#64748B]'}>
                          {formatIndianNumber(check.count)}
                        </span>
                      )}
                    </td>
                    <td className="px-[16px] py-[10px]">
                      <span
                        className="inline-flex items-center px-[8px] py-[2px] h-[22px] rounded-[4px] font-semibold text-[10px] leading-[16px] tracking-[0.25px]"
                        style={{
                          backgroundColor: badgeStyle.bg,
                          border: `1px solid ${badgeStyle.border}`,
                          color: badgeStyle.text,
                        }}
                      >
                        {check.classification}
                      </span>
                    </td>
                    <td className="px-[20px] py-[10px] text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(check.actionPath);
                        }}
                        className="inline-flex items-center gap-[4px] font-medium text-[12px] leading-[16px] text-[#4F46E5] hover:text-[#4338CA] cursor-pointer bg-transparent border-0 p-0"
                      >
                        <span>{check.actionLabel}</span>
                        <ArrowRight className="w-[12px] h-[12px]" strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Disclaimer */}
        <div className="px-[20px] py-[10px] bg-[rgba(248,250,252,0.5)] border-t border-[#F1F5F9]">
          <p className="m-0 font-normal text-[11px] leading-[16px] text-[#94A3B8]">
            {verificationAvailable
              ? 'Counts reflect live database records. A record may appear in several checks; do not add these rows into a total.'
              : 'Counts are unavailable, not zero. A record may appear in several checks; do not add these rows into a total.'}
          </p>
        </div>
      </section>

      {/* 3. Section - SelectedCheckRecordsCard */}
      <section className="w-full bg-white border border-[rgba(226,232,240,0.9)] rounded-[12px] overflow-hidden box-border">
        {/* Sub-header Area */}
        <div className="px-[20px] pt-[20px] pb-[12px] flex flex-col gap-[2px]">
          <h3 className="m-0 font-semibold text-[16px] leading-[24px] text-[#0F172A]">
            {activeCheck.control}
          </h3>
          <p className="m-0 pb-[12px] font-normal text-[12px] leading-[16px] text-[#64748B]">
            {activeCheck.description}
          </p>

          {/* Filter & Search Toolbar */}
          <div className="pt-[14px] flex flex-row items-center gap-[12px] flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search
                className="w-[16px] h-[16px] text-[#94A3B8] absolute left-[12px] top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search payment ID, invoice ID or reference..."
                className="w-full h-[30px] pl-[36px] pr-[12px] bg-white border border-[#E2E8F0] rounded-[8px] font-normal text-[12px] leading-[15px] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6366F1] box-border"
              />
            </div>

            <div className="flex flex-row items-center gap-[12px] shrink-0">
              {/* Status Dropdown */}
              <div className="relative flex flex-row items-center gap-[6px]" ref={dropdownRef}>
                <span className="font-normal text-[12px] leading-[16px] text-[#64748B]">
                  {activeCheck.statusFilterLabel || 'Payment status'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={isStatusDropdownOpen}
                  className="h-[30px] px-[10px] py-[6px] inline-flex items-center gap-[8px] bg-white border border-[#E2E8F0] rounded-[8px] font-medium text-[12px] leading-[16px] text-[#334155] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <span>{statusFilter}</span>
                  <ChevronDown className="w-[14px] h-[14px] text-[#94A3B8]" strokeWidth={1.5} />
                </button>

                {isStatusDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute right-0 top-[34px] z-20 min-w-[150px] bg-white border border-[#E2E8F0] rounded-[8px] shadow-md py-1"
                  >
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setStatusFilter(option);
                          setCurrentPage(1);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-[12px] cursor-pointer transition-colors ${
                          statusFilter === option
                            ? 'bg-[#EEF2FF] text-[#4F46E5] font-medium'
                            : 'text-[#334155] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Button - Reset Filters */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="pl-[4px] inline-flex items-center gap-[6px] font-medium text-[12px] leading-[16px] text-[#4F46E5] hover:text-[#4338CA] cursor-pointer bg-transparent border-0"
              >
                <RotateCw className="w-[14px] h-[14px] text-[#4F46E5]" strokeWidth={1.5} />
                <span>Reset filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="border-t border-[#F1F5F9] overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-[37px] bg-[rgba(248,250,252,0.7)] border-b border-[#F1F5F9]">
                {activeColumns.map((col, idx) => (
                  <th
                    key={col}
                    className={`py-[10px] font-bold text-[11px] leading-[16px] tracking-[0.55px] uppercase text-[#94A3B8] whitespace-nowrap ${
                      idx === 0
                        ? 'pl-[20px] pr-[16px]'
                        : idx === activeColumns.length - 1
                        ? 'pl-[16px] pr-[20px] text-right'
                        : 'px-[16px]'
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            {paginatedRecords.length > 0 && !isLoading && (
              <tbody className="divide-y divide-[#F1F5F9]">
                {paginatedRecords.map((record) => {
                  const statusBadge = getRecordStatusBadgeStyle(record.status);
                  return (
                    <tr key={record.id} className="hover:bg-[#F8FAFC]/90 transition-colors">
                      <td className="pl-[20px] pr-[16px] py-[12px] align-top">
                        <div className="font-semibold text-[12px] leading-[16px] text-[#4F46E5] tabular-nums">
                          {record.primaryLabel}
                        </div>
                        {record.secondaryLabel && (
                          <div className="font-normal text-[11px] leading-[15px] text-[#94A3B8]">
                            {record.secondaryLabel}
                          </div>
                        )}
                      </td>
                      <td className="px-[16px] py-[12px] font-normal text-[12px] leading-[16px] text-[#475569] tabular-nums whitespace-nowrap align-top">
                        {formatDisplayDate(record.date)}
                      </td>
                      <td className="px-[16px] py-[12px] font-medium text-[12px] leading-[16px] text-[#1E293B] tabular-nums whitespace-nowrap align-top">
                        {record.invoiceId || '—'}
                      </td>
                      <td className="px-[16px] py-[12px] align-top">
                        <div className="font-medium text-[12px] leading-[16px] text-[#2563EB] tabular-nums">
                          {record.clientId || '—'}
                        </div>
                        {record.clientName && (
                          <div className="font-normal text-[11px] leading-[15px] text-[#64748B]">
                            {record.clientName}
                          </div>
                        )}
                      </td>
                      <td className="px-[16px] py-[12px] font-bold text-[12px] leading-[16px] text-[#0F172A] tabular-nums whitespace-nowrap align-top">
                        {formatIndianCurrency(record.amount, record.metricDisplay)}
                      </td>
                      <td className="px-[16px] py-[12px] align-top">
                        <div className="font-medium text-[12px] leading-[16px] text-[#334155]">
                          {record.modeOrReference || '—'}
                        </div>
                        {record.referenceSub && (
                          <div className="font-mono text-[11px] leading-[15px] text-[#64748B] tabular-nums">
                            {record.referenceSub}
                          </div>
                        )}
                      </td>
                      <td className="px-[16px] py-[12px] align-top">
                        <div className="font-medium text-[12px] leading-[16px] text-[#1E293B]">
                          {record.checkDetail}
                        </div>
                        {record.status && (
                          <span
                            className="mt-1 inline-flex items-center px-[8px] py-[1px] rounded-full font-medium text-[11px] leading-[16px]"
                            style={{
                              backgroundColor: statusBadge.bg,
                              border: `1px solid ${statusBadge.border}`,
                              color: statusBadge.text,
                            }}
                          >
                            {record.status}
                          </span>
                        )}
                      </td>
                      <td className="pl-[16px] pr-[20px] py-[12px] text-right whitespace-nowrap align-top">
                        <button
                          type="button"
                          onClick={() => navigate(record.actionPath)}
                          className="inline-flex items-center gap-[4px] font-medium text-[12px] leading-[16px] text-[#4F46E5] hover:text-[#4338CA] cursor-pointer bg-transparent border-0 p-0"
                        >
                          <span>{record.actionLabel}</span>
                          <ArrowRight className="w-[12px] h-[12px]" strokeWidth={1.75} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>

          {/* Empty State / Loading State Container */}
          {(isLoading || filteredRecords.length === 0) && (
            <div className="min-h-[246px] flex flex-col justify-center items-center px-4 py-[40px]">
              <div className="w-full max-w-[384px] flex flex-col items-center text-center">
                <div className="pb-[12px]">
                  <div className="w-[40px] h-[40px] rounded-[12px] bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center">
                    <FileText
                      className={`w-[20px] h-[20px] text-[#6366F1] ${
                        isLoading ? 'animate-pulse' : ''
                      }`}
                      strokeWidth={1.67}
                    />
                  </div>
                </div>
                <h4 className="m-0 font-semibold text-[14px] leading-[20px] text-[#1E293B] text-center">
                  {isLoading
                    ? 'Evaluating transaction control checks...'
                    : !verificationAvailable
                    ? 'No verified payment results yet'
                    : activeCheck.records.length === 0
                    ? `No ${activeCheck.control.toLowerCase()} exceptions found`
                    : 'No matching exception records'}
                </h4>
                <p className="m-0 pt-[4px] px-[6px] font-normal text-[12px] leading-[20px] text-[#94A3B8] text-center">
                  {isLoading ? (
                    'Checking relationships, invoices, collections, tasks, and data quality across live records.'
                  ) : !verificationAvailable ? (
                    <>
                      Validate the source fields and calculation before loading payment records.
                      <br />
                      No sample company transactions are shown.
                    </>
                  ) : activeCheck.records.length === 0 ? (
                    <>
                      All live database records passed this workbook-defined control.
                      <br />
                      No sample company transactions are shown.
                    </>
                  ) : (
                    'No records match the current search or status filter.'
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Table Summary & Pagination Footer */}
        <div className="px-[20px] py-[10px] bg-[rgba(248,250,252,0.5)] border-t border-[#F1F5F9] flex flex-row justify-between items-center gap-4 flex-wrap">
          <span className="font-normal text-[11px] leading-[16px] text-[#94A3B8] tabular-nums">
            {verificationAvailable
              ? `Showing ${formatIndianNumber(startEntry)} - ${formatIndianNumber(
                  endEntry
                )} of ${formatIndianNumber(filteredRecords.length)} ${activeCheck.control.toLowerCase()}`
              : 'Results unavailable · not 0 invalid invoices'}
          </span>

          <div className="flex flex-row items-center gap-4 flex-wrap">
            {verificationAvailable && filteredRecords.length > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-[#64748B] tabular-nums">
                <select
                  aria-label="Rows per page"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-[24px] px-1.5 rounded border border-[#E2E8F0] bg-white text-[11px] font-medium text-[#334155] cursor-pointer"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <span>
                  Page {formatIndianNumber(safePage)} of {formatIndianNumber(totalPages)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-[24px] h-[24px] inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-[13px] h-[13px]" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="w-[24px] h-[24px] inline-flex items-center justify-center rounded border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-[13px] h-[13px]" />
                  </button>
                </div>
              </div>
            )}
            <span className="font-normal text-[11px] leading-[16px] text-[#94A3B8]">
              Amounts keep their source currency when available
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
