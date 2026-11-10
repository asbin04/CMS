import { InvoiceRecord, InvoiceAgingBucket, InvoiceCollectionStatus, InvoiceStatus, InvoiceKpiSummary } from './types';

// Format currency as Indian Rupee (e.g. "₹ 1,41,600")
export const formatRupee = (amount: number): string => {
  if (isNaN(amount)) return '₹ 0';
  const formatted = new Intl.NumberFormat('en-IN').format(Math.round(amount));
  return `₹ ${formatted}`;
};

// Format currency with no space for KPI card 2 (e.g. "₹48,20,000")
export const formatRupeeCompact = (amount: number): string => {
  if (isNaN(amount)) return '₹0';
  const formatted = new Intl.NumberFormat('en-IN').format(Math.round(amount));
  return `₹${formatted}`;
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Parse date strings in formats like "28 Oct 2026", "2026-10-28", or "28/10/2026"
export const parseInvoiceDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();

  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // Format: DD MMM YYYY (e.g. "28 Oct 2026")
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthIdx = MONTH_NAMES.indexOf(parts[1]);
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && monthIdx >= 0 && !isNaN(year)) {
      return new Date(year, monthIdx, day);
    }
  }

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
};

// Format date to display string "DD MMM YYYY" (e.g. "28 Oct 2026")
export const formatDateDisplay = (date: Date): string => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = MONTH_NAMES[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
};

// Format date to HTML input value "YYYY-MM-DD"
export const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return '';
  const parsed = parseInvoiceDate(dateStr);
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export interface InvoiceDateFilterRange {
  invoiceDateFrom: string;
  invoiceDateTo: string;
}

/**
 * Parses an invoice date filter string (e.g. "Oct 2026", "Sep 2026", "Feb 2024", "2026-10")
 * into inclusive ISO date boundaries (YYYY-MM-DD) without timezone shifts.
 * Handles leap years correctly (e.g. Feb 2024 ends on 29th).
 * Returns null if "All" or "All Dates" is selected.
 */
export const parseInvoiceDateFilter = (filterStr?: string): InvoiceDateFilterRange | null => {
  if (
    !filterStr ||
    filterStr.trim() === '' ||
    filterStr.trim().toLowerCase() === 'all' ||
    filterStr.trim().toLowerCase() === 'all dates'
  ) {
    return null;
  }

  const trimmed = filterStr.trim();

  // Pattern: "Oct 2026", "October 2026", etc.
  const monthYearMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const monthPart = monthYearMatch[1].substring(0, 3).toLowerCase();
    const year = parseInt(monthYearMatch[2], 10);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIndex = months.indexOf(monthPart);
    if (monthIndex >= 0 && !isNaN(year)) {
      const monthNum = monthIndex + 1;
      const mm = String(monthNum).padStart(2, '0');
      const lastDay = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
      const dd = String(lastDay).padStart(2, '0');
      return {
        invoiceDateFrom: `${year}-${mm}-01`,
        invoiceDateTo: `${year}-${mm}-${dd}`,
      };
    }
  }

  // Pattern: "YYYY-MM" (e.g. "2026-10")
  const yyyyMmMatch = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (yyyyMmMatch) {
    const year = parseInt(yyyyMmMatch[1], 10);
    const monthNum = parseInt(yyyyMmMatch[2], 10);
    if (monthNum >= 1 && monthNum <= 12 && !isNaN(year)) {
      const mm = String(monthNum).padStart(2, '0');
      const lastDay = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
      const dd = String(lastDay).padStart(2, '0');
      return {
        invoiceDateFrom: `${year}-${mm}-01`,
        invoiceDateTo: `${year}-${mm}-${dd}`,
      };
    }
  }

  return null;
};

// Add days to a given date string and return "DD MMM YYYY"
export const addDaysToDate = (startDateStr: string, daysToAdd: number): string => {
  const base = parseInvoiceDate(startDateStr);
  base.setDate(base.getDate() + daysToAdd);
  return formatDateDisplay(base);
};

// Normalize date to start of calendar day (midnight) to prevent hour/minute skew
export const normalizeToStartOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// CMS Reference Date Calculation Logic (consistent with Collections & backend)
export const getReferenceDate = (targetDate?: Date): Date => {
  if (targetDate && targetDate.getFullYear() <= 2025) {
    return new Date(2025, 2, 21); // 21 Mar 2025 simulation baseline
  }
  const now = new Date();
  return normalizeToStartOfDay(now);
};

export const calculateDaysOverdue = (dueDateStr: string): number => {
  if (!dueDateStr) return 0;
  const dueDate = normalizeToStartOfDay(parseInvoiceDate(dueDateStr));
  const refDate = normalizeToStartOfDay(getReferenceDate(dueDate));
  const diffTime = refDate.getTime() - dueDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const calculateAgingBucket = (daysOverdue: number, dueDateStr?: string): InvoiceAgingBucket => {
  if (!dueDateStr || daysOverdue <= 0) return 'No Due Date';
  if (daysOverdue <= 30) return '1 - 30 Days';
  if (daysOverdue <= 60) return '31 - 60 Days';
  if (daysOverdue <= 90) return '61 - 90 Days';
  return '90+ Days';
};

// Rule 1: OVERDUE
// - Outstanding amount > 0
// - Due date is strictly before current CMS reference date
export const isInvoiceOverdue = (dueDateStr: string, outstandingAmount: number): boolean => {
  if (!dueDateStr || outstandingAmount <= 0) return false;
  const dueDate = normalizeToStartOfDay(parseInvoiceDate(dueDateStr));
  const refDate = normalizeToStartOfDay(getReferenceDate(dueDate));
  return dueDate.getTime() < refDate.getTime();
};

// Rule 2: DUE SOON
// - Outstanding amount > 0
// - Due date is today or within the next 30 days
// - Excludes overdue and paid invoices
export const isInvoiceDueSoon = (dueDateStr: string, outstandingAmount: number): boolean => {
  if (!dueDateStr || outstandingAmount <= 0) return false;
  const dueDate = normalizeToStartOfDay(parseInvoiceDate(dueDateStr));
  const refDate = normalizeToStartOfDay(getReferenceDate(dueDate));
  const diffTime = dueDate.getTime() - refDate.getTime();
  const daysUntilDue = Math.round(diffTime / (1000 * 60 * 60 * 24));
  // Today (0) or within the next 30 days (1 to 30)
  return daysUntilDue >= 0 && daysUntilDue <= 30;
};

// Determine Status and Collection Status from Paid & Total Amount
export const deriveStatuses = (
  totalAmount: number,
  paidAmount: number,
  daysOverdue: number
): { status: InvoiceStatus; collectionStatus: InvoiceCollectionStatus; outstanding: 'Yes' | 'No' } => {
  if (paidAmount >= totalAmount && totalAmount > 0) {
    return {
      status: 'Paid',
      collectionStatus: 'Completed',
      outstanding: 'No',
    };
  }

  if (paidAmount > 0 && paidAmount < totalAmount) {
    return {
      status: 'Partially Paid',
      collectionStatus: 'In Progress',
      outstanding: 'Yes',
    };
  }

  // Unpaid
  let colStatus: InvoiceCollectionStatus = 'Pending';
  if (daysOverdue > 10) {
    colStatus = 'Follow Up';
  }

  return {
    status: 'Unpaid',
    collectionStatus: colStatus,
    outstanding: 'Yes',
  };
};

// Generate next unique invoice ID (e.g. "INV-2026-129")
export const generateNextInvoiceId = (existingInvoices: InvoiceRecord[]): string => {
  let highestNum = 128;
  const year = new Date().getFullYear();

  existingInvoices.forEach((inv) => {
    const match = inv.invoiceId.match(/INV-\d{4}-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > highestNum) highestNum = num;
    }
  });

  return `INV-${year}-${highestNum + 1}`;
};

// Compute dynamic KPI summary from any list of invoice records
export const computeInvoiceKpis = (invoices: InvoiceRecord[]): InvoiceKpiSummary => {
  const totalInvoices = invoices.length;
  let totalInvoiceValue = 0;
  let paidAmount = 0;
  let outstandingAmount = 0;

  invoices.forEach((inv) => {
    totalInvoiceValue += inv.totalAmount || 0;
    paidAmount += inv.paidAmount || 0;
    outstandingAmount += inv.outstandingAmount || 0;
  });

  return {
    totalInvoices,
    totalInvoicesTrend: 12,
    totalInvoiceValue,
    totalInvoiceValueTrend: 15,
    paidAmount,
    paidAmountTrend: 18,
    outstandingAmount,
    outstandingAmountTrend: -8,
  };
};

// Export filtered records to CSV with proper quotation and escaping
export const exportInvoicesToCsv = (invoices: InvoiceRecord[], filename = 'invoices_export'): void => {
  if (!invoices || invoices.length === 0) return;

  const columns = [
    { key: 'invoiceId', label: 'Invoice ID' },
    { key: 'invoiceDate', label: 'Invoice Date' },
    { key: 'clientId', label: 'Client ID' },
    { key: 'clientName', label: 'Client Name' },
    { key: 'projectId', label: 'Project ID' },
    { key: 'contractId', label: 'Contract ID' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'amountBeforeTax', label: 'Amount Before Tax' },
    { key: 'taxAmount', label: 'Tax Amount' },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'paidAmount', label: 'Paid Amount' },
    { key: 'outstandingAmount', label: 'Outstanding Amount' },
    { key: 'status', label: 'Status' },
    { key: 'paymentTermsDays', label: 'Payment Terms Days' },
    { key: 'daysOverdue', label: 'Days Overdue' },
    { key: 'agingBucket', label: 'Aging Bucket' },
    { key: 'collectionStatus', label: 'Collection Status' },
    { key: 'outstanding', label: 'Outstanding' },
  ];

  const headers = columns.map((c) => `"${c.label}"`).join(',');
  const rows = invoices.map((inv) => {
    return columns
      .map((col) => {
        const val = (inv as unknown as Record<string, unknown>)[col.key];
        if (val === undefined || val === null) return '""';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const nowStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
