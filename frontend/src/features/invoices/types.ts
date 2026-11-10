export type InvoiceStatus = 'Paid' | 'Partially Paid' | 'Unpaid';

export type InvoiceAgingBucket =
  | '1 - 30 Days'
  | '31 - 60 Days'
  | '61 - 90 Days'
  | '90+ Days'
  | 'No Due Date';

export type InvoiceCollectionStatus =
  | 'In Progress'
  | 'Completed'
  | 'Pending'
  | 'Follow Up';

export interface InvoiceRecord {
  invoiceId: string;
  invoiceDate: string;
  clientId: string;
  clientName?: string;
  projectId: string;
  contractId: string;
  dueDate: string;
  amountBeforeTax: number;
  taxRate?: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  paymentTermsDays: number;
  daysOverdue: number;
  agingBucket: InvoiceAgingBucket;
  collectionStatus: InvoiceCollectionStatus;
  outstanding: 'Yes' | 'No';
  notes?: string;
  createdAt?: string;
}

export interface InvoiceKpiSummary {
  totalInvoices: number;
  totalInvoicesTrend: number;
  totalInvoiceValue: number;
  totalInvoiceValueTrend: number;
  paidAmount: number;
  paidAmountTrend: number;
  outstandingAmount: number;
  outstandingAmountTrend: number;
}

export interface InvoiceFilters {
  search: string;
  invoiceDate: string;
  client: string;
  project: string;
  status: string;
  collectionStatus: string;
  preset?: 'overdue' | 'due-soon' | null;
  // Advanced filters (More Filters)
  dueDate?: string;
  paymentTerms?: string;
  agingBucket?: string;
  outstandingOnly?: boolean;
  minAmount?: string;
  maxAmount?: string;
}

export type InvoiceSortOption =
  | 'Invoice Date (Newest)'
  | 'Invoice Date (Oldest)'
  | 'Total Amount (High to Low)'
  | 'Total Amount (Low to High)'
  | 'Due Date (Soonest)'
  | 'Due Date (Latest)'
  | 'Invoice ID (Newest)'
  | 'Invoice ID (Oldest)';
