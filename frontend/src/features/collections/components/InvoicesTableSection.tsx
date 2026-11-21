import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  Calendar,
  FileText,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Eye,
  Phone,
  Mail,
  History,
  LucideIcon,
} from 'lucide-react';
import { ExportButton } from '../../../components/ui/ExportButton';
import { Invoice, CollectionStatus, AgeingBucket } from '../types';
import { formatRupee, exportInvoicesToCsv, parseInvoiceDate } from '../utils';
import { StatusDropdownMenu, StatusItemConfig } from '../../../components/ui/StatusDropdownMenu';

const COLLECTION_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'Paid', label: 'Paid', dotColor: '#059669', textColor: '#059669' },
  { value: 'Partially Paid', label: 'Partially Paid', dotColor: '#0284C7', textColor: '#0284C7' },
  { value: 'Due Soon', label: 'Due Soon', dotColor: '#F59E0B', textColor: '#F59E0B' },
  { value: 'Overdue', label: 'Overdue', dotColor: '#EF4444', textColor: '#EF4444' },
  { value: 'Open', label: 'Open', dotColor: '#64748B', textColor: '#64748B' },
];

interface InvoicesTableSectionProps {
  invoices: Invoice[];
  selectedInvoiceId?: string;
  onSelectInvoice: (invoice: Invoice) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onCallEmail?: (invoice: Invoice) => void;
  onSendReminder?: (invoice: Invoice) => void;
  onViewInvoice?: (invoice: Invoice) => void;
  onPaymentHistory?: (invoice: Invoice) => void;
  onUpdateStatus?: (invoiceId: string, newStatus: CollectionStatus) => void;
}

type SortField = 'id' | 'dueDate' | 'outstanding' | 'daysOverdue' | 'ageingBucket' | 'status';
type SortOrder = 'asc' | 'desc';

interface ActionMenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

const ActionMenuItem: React.FC<ActionMenuItemProps> = ({ icon: Icon, label, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '9px 12px',
        border: 'none',
        borderRadius: '10px',
        backgroundColor: isHovered ? '#EFF6FF' : 'transparent',
        color: isHovered ? '#2563EB' : '#1E293B',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '16px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Icon size={15} color={isHovered ? '#2563EB' : '#64748B'} />
      <span>{label}</span>
    </button>
  );
};

export const InvoicesTableSection: React.FC<InvoicesTableSectionProps> = ({
  invoices,
  selectedInvoiceId,
  onSelectInvoice,
  statusFilter,
  setStatusFilter,
  onCallEmail,
  onSendReminder,
  onViewInvoice,
  onPaymentHistory,
  onUpdateStatus,
}) => {
  // Action Menu state
  const [menuInvoice, setMenuInvoice] = useState<Invoice | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  // Close 3-dot action menu on click outside or window resize/scroll
  useEffect(() => {
    if (!menuInvoice) return;

    const handleClose = () => {
      setMenuInvoice(null);
      setMenuPosition(null);
    };

    document.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);

    return () => {
      document.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [menuInvoice]);

  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>, inv: Invoice) => {
    e.stopPropagation();
    if (menuInvoice?.id === inv.id) {
      setMenuInvoice(null);
      setMenuPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 175; // Approx height for 4 items
    const openUpward = rect.bottom + dropdownHeight > window.innerHeight;

    setMenuInvoice(inv);
    setMenuPosition({
      top: openUpward ? rect.top - dropdownHeight : rect.bottom + 4,
      right: Math.max(16, window.innerWidth - rect.right),
    });
  };

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('All Clients');
  const [ageingFilter, setAgeingFilter] = useState('All Buckets');
  const [dateRangeFilter, setDateRangeFilter] = useState('');

  // Pagination states
  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting states (null = default dataset creation order)
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Unique clients for filter dropdown
  const uniqueClients = useMemo(() => {
    const clients = Array.from(new Set(invoices.map((inv) => inv.client)));
    return ['All Clients', ...clients];
  }, [invoices]);

  const uniqueStatuses: Array<string> = [
    'All Statuses',
    'Overdue',
    'Due Soon',
    'Partially Paid',
    'Paid',
    'Open',
  ];

  const uniqueAgeingBuckets: Array<string> = [
    'All Buckets',
    'Current',
    '1–30 days',
    '31–60 days',
    '61–90 days',
    '90+ days',
  ];

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setClientFilter('All Clients');
    setStatusFilter('All Statuses');
    setAgeingFilter('All Buckets');
    setDateRangeFilter('');
    setSortField(null);
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Filtered and sorted data
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search query (Invoice ID or Client name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = inv.id.toLowerCase().includes(q);
        const matchesClient = inv.client.toLowerCase().includes(q);
        if (!matchesId && !matchesClient) return false;
      }

      // Client filter
      if (clientFilter !== 'All Clients' && inv.client !== clientFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'All Statuses' && inv.status !== statusFilter) {
        return false;
      }

      // Ageing Bucket filter
      if (ageingFilter !== 'All Buckets' && inv.ageingBucket !== ageingFilter) {
        return false;
      }

      return true;
    });
  }, [invoices, searchQuery, clientFilter, statusFilter, ageingFilter]);

  // Ensure newly created or top-selected invoice is not hidden by pagination or filters
  useEffect(() => {
    if (selectedInvoiceId && invoices.length > 0 && invoices[0]?.id === selectedInvoiceId) {
      if (searchQuery && !filteredInvoices.some((i) => i.id === selectedInvoiceId)) {
        setSearchQuery('');
      }
      if (clientFilter !== 'All Clients' && !filteredInvoices.some((i) => i.id === selectedInvoiceId)) {
        setClientFilter('All Clients');
      }
      if (ageingFilter !== 'All Buckets' && !filteredInvoices.some((i) => i.id === selectedInvoiceId)) {
        setAgeingFilter('All Buckets');
      }
      setCurrentPage(1);
    }
  }, [selectedInvoiceId, invoices]);

  // Sort logic (preserves creation order when sortField is null)
  const sortedInvoices = useMemo(() => {
    if (!sortField) {
      return filteredInvoices;
    }
    const list = [...filteredInvoices];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = a.id.localeCompare(b.id);
      } else if (sortField === 'outstanding') {
        comparison = a.outstanding - b.outstanding;
      } else if (sortField === 'daysOverdue') {
        const d1 = a.daysOverdue ?? -1;
        const d2 = b.daysOverdue ?? -1;
        comparison = d1 - d2;
      } else if (sortField === 'dueDate') {
        comparison = parseInvoiceDate(a.dueDate).getTime() - parseInvoiceDate(b.dueDate).getTime();
      } else if (sortField === 'ageingBucket') {
        comparison = a.ageingBucket.localeCompare(b.ageingBucket);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredInvoices, sortField, sortOrder]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(sortedInvoices.length / rowsPerPage));
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedInvoices.slice(start, start + rowsPerPage);
  }, [sortedInvoices, currentPage, rowsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportTable = () => {
    exportInvoicesToCsv('invoices_receivables', filteredInvoices);
  };



  // Helper for Ageing text color
  const getAgeingColor = (bucket: AgeingBucket, daysOverdue: number | null) => {
    switch (bucket) {
      case '31–60 days':
        return '#D97706';
      case '1–30 days':
        return daysOverdue ? '#16A34A' : '#D97706';
      case '61–90 days':
        return '#EA580C';
      case '90+ days':
        return '#DC2626';
      case 'Current':
      default:
        return '#64748B';
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '20px',
        marginBottom: '24px',
      }}
    >
      {/* Search & Filters Card Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={18} color="#4F46E5" />
          </div>
          <div>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 700,
                lineHeight: '20px',
                color: '#0F172A',
                margin: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Search & filters
            </h3>
            <p
              style={{
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '16px',
                color: '#64748B',
                margin: '2px 0 0 0',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Find and filter invoices to manage collections.
            </p>
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={handleClearFilters}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#4F46E5',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: '16px',
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: '6px',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <RotateCcw size={14} />
          <span>Clear filters</span>
        </button>
      </div>

      {/* Filter Controls Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 1.4fr) repeat(3, minmax(140px, 1fr)) minmax(160px, 1fr)',
          gap: '12px',
          alignItems: 'end',
          marginBottom: '16px',
        }}
      >
        {/* Search Input */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              height: '38px',
              padding: '0 12px',
            }}
          >
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by invoice ID or client"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12px',
                lineHeight: '16px',
                fontFamily: "'Inter', sans-serif",
                color: '#0F172A',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Client Dropdown */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: '16px',
              color: '#334155',
              marginBottom: '4px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Client
          </label>
          <select
            value={clientFilter}
            onChange={(e) => {
              setClientFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              height: '38px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '0 10px',
              fontSize: '12px',
              lineHeight: '16px',
              color: '#0F172A',
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {uniqueClients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>

        {/* Collection Status Dropdown */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: '16px',
              color: '#334155',
              marginBottom: '4px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Collection status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              height: '38px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '0 10px',
              fontSize: '12px',
              lineHeight: '16px',
              color: '#0F172A',
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {uniqueStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Ageing Bucket Dropdown */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: '16px',
              color: '#334155',
              marginBottom: '4px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Ageing bucket
          </label>
          <select
            value={ageingFilter}
            onChange={(e) => {
              setAgeingFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              height: '38px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '0 10px',
              fontSize: '12px',
              lineHeight: '16px',
              color: '#0F172A',
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {uniqueAgeingBuckets.map((bucket) => (
              <option key={bucket} value={bucket}>
                {bucket}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date Range */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 500,
              lineHeight: '16px',
              color: '#334155',
              marginBottom: '4px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Due date range
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              height: '38px',
              padding: '0 10px',
              cursor: 'pointer',
            }}
          >
            <Calendar size={14} color="#64748B" />
            <input
              type="text"
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              placeholder="Select date range"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12px',
                lineHeight: '16px',
                fontFamily: "'Inter', sans-serif",
                color: '#0F172A',
                width: '100%',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </div>

      {/* Nested Table Box: Invoices & Receivables */}
      <div
        style={{
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Table Box Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={16} color="#4F46E5" />
            </div>
            <div>
              <h4
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  lineHeight: '20px',
                  color: '#0F172A',
                  margin: 0,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Invoices & receivables
              </h4>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: '16px',
                  color: '#64748B',
                  margin: '1px 0 0 0',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                List of client invoices with outstanding amounts and recommended collection actions.
              </p>
            </div>
          </div>

          <ExportButton onClick={handleExportTable} label="Export table" />
        </div>

        {/* Scrollable Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              minWidth: '1500px',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '12px',
              fontFamily: "'Inter', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <th
                  onClick={() => handleSort('id')}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>INVOICE ID</span>
                    <ArrowUpDown size={12} color="#94A3B8" />
                  </div>
                </th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>CLIENT</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>INVOICE DATE</th>
                <th
                  onClick={() => handleSort('dueDate')}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>DUE DATE</span>
                    <ArrowUpDown size={12} color="#94A3B8" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('outstanding')}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <span>OUTSTANDING</span>
                    <ArrowUpDown size={12} color="#94A3B8" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('daysOverdue')}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <span>DAYS OVERDUE</span>
                    <ArrowUpDown size={12} color="#94A3B8" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('ageingBucket')}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>AGEING</span>
                    <ArrowUpDown size={12} color="#94A3B8" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    width: '130px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>STATUS</span>
                    <ArrowUpDown size={12} color="#94A3B8" />
                  </div>
                </th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap', width: '160px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: 'center',
                      padding: '36px',
                      color: '#64748B',
                      fontSize: '12px',
                      lineHeight: '16px',
                    }}
                  >
                    No invoices match your selected filters.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => {
                  const isSelected = inv.id === selectedInvoiceId;
                  const isOverdue = inv.status === 'Overdue';
                  const isDueSoon = inv.status === 'Due Soon';

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => onSelectInvoice(inv)}
                      style={{
                        backgroundColor: isSelected ? '#F1F5F9' : '#FFFFFF',
                        borderBottom: '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F1F5F9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isSelected ? '#F1F5F9' : '#FFFFFF';
                      }}
                    >
                      {/* 1. Invoice ID */}
                      <td
                        style={{
                          padding: '12px 16px',
                          color: '#4F46E5',
                          fontWeight: 600,
                          fontSize: '12px',
                          lineHeight: '16px',
                          whiteSpace: 'nowrap',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {inv.id}
                      </td>

                      {/* 2. Client */}
                      <td
                        style={{
                          padding: '12px 16px',
                          color: '#0F172A',
                          fontWeight: 600,
                          fontSize: '12px',
                          lineHeight: '16px',
                          whiteSpace: 'nowrap',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {inv.client}
                      </td>

                      {/* 3. Invoice Date */}
                      <td
                        style={{
                          padding: '12px 16px',
                          color: '#64748B',
                          fontSize: '12px',
                          lineHeight: '16px',
                          fontWeight: 400,
                          whiteSpace: 'nowrap',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {inv.invoiceDate}
                      </td>

                      {/* 4. Due Date */}
                      <td
                        style={{
                          padding: '12px 16px',
                          fontWeight: 500,
                          fontSize: '12px',
                          lineHeight: '16px',
                          color: isOverdue ? '#991B1B' : isDueSoon ? '#92400E' : '#64748B',
                          whiteSpace: 'nowrap',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {inv.dueDate}
                      </td>

                      {/* 5. Outstanding */}
                      <td
                        style={{
                          padding: '12px 16px',
                          color: '#0F172A',
                          fontWeight: 600,
                          fontSize: '12px',
                          lineHeight: '16px',
                          textAlign: 'right',
                          whiteSpace: 'nowrap',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {formatRupee(inv.outstanding)}
                      </td>

                      {/* 6. Days Overdue */}
                      <td
                        style={{
                          padding: '12px 16px',
                          fontWeight: 500,
                          fontSize: '12px',
                          lineHeight: '16px',
                          textAlign: 'right',
                          color: inv.daysOverdue ? '#991B1B' : '#64748B',
                          whiteSpace: 'nowrap',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {inv.daysOverdue !== null && inv.daysOverdue > 0 ? inv.daysOverdue : '-'}
                      </td>

                      {/* 7. Ageing */}
                      <td
                        style={{
                          padding: '12px 16px',
                          fontWeight: 500,
                          fontSize: '12px',
                          lineHeight: '16px',
                          color: getAgeingColor(inv.ageingBucket, inv.daysOverdue),
                          whiteSpace: 'nowrap',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {inv.ageingBucket}
                      </td>

                      {/* 8. Status Dropdown */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', width: '130px' }}>
                        <StatusDropdownMenu
                          currentStatus={inv.status}
                          options={COLLECTION_STATUS_CONFIGS}
                          onSelect={(newStatus) => onUpdateStatus?.(inv.id, newStatus as CollectionStatus)}
                        />
                      </td>

                      {/* 9. Action (Aligned slots: 114px button + 28px three-dots) */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', width: '160px' }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '114px 28px',
                            gap: '8px',
                            alignItems: 'center',
                            width: '150px',
                          }}
                        >
                          {/* Fixed-width action button slot */}
                          <div style={{ width: '114px', height: '28px', display: 'flex' }}>
                            {inv.status === 'Overdue' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onCallEmail) {
                                    onCallEmail(inv);
                                  } else {
                                    onSelectInvoice(inv);
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: '#EEF2FF',
                                  border: '1px solid #C7D2FE',
                                  color: '#4F46E5',
                                  borderRadius: '6px',
                                  padding: '0 8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  lineHeight: '16px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  whiteSpace: 'nowrap',
                                  fontFamily: "'Inter', sans-serif",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E0E7FF')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EEF2FF')}
                              >
                                Call + email
                              </button>
                            )}
                            {(inv.status === 'Due Soon' || inv.status === 'Partially Paid') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onSendReminder) {
                                    onSendReminder(inv);
                                  } else {
                                    onSelectInvoice(inv);
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: '#EFF6FF',
                                  border: '1px solid #BFDBFE',
                                  color: '#1E40AF',
                                  borderRadius: '6px',
                                  padding: '0 8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  lineHeight: '16px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  whiteSpace: 'nowrap',
                                  fontFamily: "'Inter', sans-serif",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DBEAFE')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                              >
                                Send reminder
                              </button>
                            )}
                            {inv.status === 'Open' && (
                              <button
                                type="button"
                                disabled
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: '#F8FAFC',
                                  border: '1px solid #E2E8F0',
                                  color: '#94A3B8',
                                  borderRadius: '6px',
                                  padding: '0 8px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  lineHeight: '16px',
                                  cursor: 'default',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  whiteSpace: 'nowrap',
                                  fontFamily: "'Inter', sans-serif",
                                }}
                              >
                                No action
                              </button>
                            )}
                            {inv.status === 'Paid' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onViewInvoice) {
                                    onViewInvoice(inv);
                                  } else {
                                    onSelectInvoice(inv);
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: '#F0FDF4',
                                  border: '1px solid #BBF7D0',
                                  color: '#166534',
                                  borderRadius: '6px',
                                  padding: '0 8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  lineHeight: '16px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  whiteSpace: 'nowrap',
                                  fontFamily: "'Inter', sans-serif",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DCFCE7')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                              >
                                Receipt
                              </button>
                            )}
                          </div>

                          {/* Fixed-width 3-dots more vertical menu slot */}
                          <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={(e) => handleOpenMenu(e, inv)}
                              title="More options"
                              style={{
                                width: '28px',
                                height: '28px',
                                background: menuInvoice?.id === inv.id ? '#F1F5F9' : 'none',
                                border: 'none',
                                color: menuInvoice?.id === inv.id ? '#0F172A' : '#94A3B8',
                                cursor: 'pointer',
                                padding: 0,
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (menuInvoice?.id !== inv.id) {
                                  e.currentTarget.style.color = '#475569';
                                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (menuInvoice?.id !== inv.id) {
                                  e.currentTarget.style.color = '#94A3B8';
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '12px 18px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            gap: '6px',
          }}
        >
          {/* Previous Page */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentPage === 1 ? '#CBD5E1' : '#64748B',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: isActive ? 'none' : '1px solid transparent',
                  backgroundColor: isActive ? '#4F46E5' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentPage === totalPages ? '#CBD5E1' : '#64748B',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>


      {/* 3-Dot Action Dropdown Menu */}
      {menuInvoice && menuPosition && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            width: '184px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            padding: '6px',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {/* 1. View Invoice — eye icon */}
          <ActionMenuItem
            icon={Eye}
            label="View Invoice"
            onClick={() => {
              const currentInv = menuInvoice;
              setMenuInvoice(null);
              setMenuPosition(null);
              if (onViewInvoice) {
                onViewInvoice(currentInv);
              } else {
                onSelectInvoice(currentInv);
              }
            }}
          />

          {/* 2. Call + Email — phone icon */}
          <ActionMenuItem
            icon={Phone}
            label="Call + Email"
            onClick={() => {
              const currentInv = menuInvoice;
              setMenuInvoice(null);
              setMenuPosition(null);
              if (onCallEmail) {
                onCallEmail(currentInv);
              } else {
                onSelectInvoice(currentInv);
              }
            }}
          />

          {/* 3. Send Reminder — envelope icon */}
          <ActionMenuItem
            icon={Mail}
            label="Send Reminder"
            onClick={() => {
              const currentInv = menuInvoice;
              setMenuInvoice(null);
              setMenuPosition(null);
              if (onSendReminder) {
                onSendReminder(currentInv);
              } else {
                onSelectInvoice(currentInv);
              }
            }}
          />

          {/* 4. Payment History — history icon */}
          <ActionMenuItem
            icon={History}
            label="Payment History"
            onClick={() => {
              const currentInv = menuInvoice;
              setMenuInvoice(null);
              setMenuPosition(null);
              if (onPaymentHistory) {
                onPaymentHistory(currentInv);
              } else {
                onSelectInvoice(currentInv);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
