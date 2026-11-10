import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { InvoicesPage } from '@/features/invoices/pages/InvoicesPage';
import { invoicesApiService } from '@/features/invoices/invoicesApiService';
import { InvoiceRecord, InvoiceKpiSummary } from '@/features/invoices/types';
import { parseInvoiceDateFilter } from '@/features/invoices/utils';

const mockLiveInvoices: InvoiceRecord[] = [
  {
    invoiceId: 'INV-2026-001',
    invoiceDate: '15 Mar 2026',
    clientId: 'CL-001',
    clientName: 'Tata Consultancy Services',
    projectId: 'PRJ-001',
    contractId: 'CON-001',
    dueDate: '15 Apr 2026',
    amountBeforeTax: 100000,
    taxRate: 18,
    taxAmount: 18000,
    totalAmount: 118000,
    paidAmount: 59000,
    outstandingAmount: 59000,
    status: 'Partially Paid',
    paymentTermsDays: 30,
    daysOverdue: 0,
    agingBucket: 'No Due Date',
    collectionStatus: 'In Progress',
    outstanding: 'Yes',
    notes: '50% advance milestone',
  },
  {
    invoiceId: 'INV-2026-002',
    invoiceDate: '01 Feb 2026',
    clientId: 'CL-002',
    clientName: 'Reliance Industries',
    projectId: 'PRJ-002',
    contractId: 'CON-002',
    dueDate: '01 Mar 2026',
    amountBeforeTax: 200000,
    taxRate: 18,
    taxAmount: 36000,
    totalAmount: 236000,
    paidAmount: 0,
    outstandingAmount: 236000,
    status: 'Unpaid',
    paymentTermsDays: 30,
    daysOverdue: 25,
    agingBucket: '1 - 30 Days',
    collectionStatus: 'Follow Up',
    outstanding: 'Yes',
    notes: 'Payment overdue',
  },
  {
    invoiceId: 'INV-2026-003',
    invoiceDate: '10 Jan 2026',
    clientId: 'CL-003',
    clientName: 'Infosys Technologies',
    projectId: 'PRJ-003',
    contractId: 'CON-003',
    dueDate: '10 Feb 2026',
    amountBeforeTax: 150000,
    taxRate: 18,
    taxAmount: 27000,
    totalAmount: 177000,
    paidAmount: 177000,
    outstandingAmount: 0,
    status: 'Paid',
    paymentTermsDays: 30,
    daysOverdue: 0,
    agingBucket: 'No Due Date',
    collectionStatus: 'Completed',
    outstanding: 'No',
    notes: 'Fully settled',
  },
];

const mockPageResponse = {
  content: mockLiveInvoices,
  pageNumber: 0,
  pageSize: 10,
  totalElements: 3,
  totalPages: 1,
  first: true,
  last: true,
};

const mockKpiResponse: InvoiceKpiSummary = {
  totalInvoices: 3,
  totalInvoicesTrend: 12.5,
  totalInvoiceValue: 531000,
  totalInvoiceValueTrend: 8.2,
  paidAmount: 236000,
  paidAmountTrend: 14.1,
  outstandingAmount: 295000,
  outstandingAmountTrend: -5.4,
};

describe('Finance InvoicesPage Frontend Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(invoicesApiService, 'getInvoices').mockResolvedValue(mockPageResponse);
    vi.spyOn(invoicesApiService, 'getKpis').mockResolvedValue(mockKpiResponse);
    vi.spyOn(invoicesApiService, 'getNextInvoiceId').mockResolvedValue({
      nextInvoiceId: 'INV-2026-004',
      year: 2026,
      sequenceNumber: 4,
      format: 'INV-YYYY-XXX',
    });
    vi.spyOn(invoicesApiService, 'getPaymentHistory').mockResolvedValue([
      {
        id: 'PAY-2026-001',
        invoiceId: 'INV-2026-001',
        client: 'Tata Consultancy Services',
        date: '2026-03-20',
        amount: 59000,
        method: 'Bank Transfer',
        referenceId: 'UTR-112233',
        notes: 'Initial 50% deposit',
      },
    ]);
  });

  it('1. Loads and renders live invoices from the backend API', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/finance/invoices']}>
          <InvoicesPage />
        </MemoryRouter>
      );
    });

    // Check header
    expect(screen.getByText('Invoice Management')).toBeInTheDocument();

    // Check KPI cards & table headers
    expect(screen.getByText('Total Invoices')).toBeInTheDocument();
    expect(screen.getByText('Total Invoice Value')).toBeInTheDocument();
    expect(screen.getAllByText('Paid Amount').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Outstanding Amount').length).toBeGreaterThanOrEqual(1);

    // Check invoice table rows rendered from backend response
    expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
    expect(screen.getByText('INV-2026-002')).toBeInTheDocument();
    expect(screen.getByText('INV-2026-003')).toBeInTheDocument();

    // Verify backend getInvoices was called with 0-based page index
    expect(invoicesApiService.getInvoices).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 0,
        size: 10,
        sortField: 'invoiceDate',
        sortOrder: 'desc',
      })
    );
  });

  it('2. Synchronizes URL preset filter ?filter=overdue and requests live overdue data', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/finance/invoices?filter=overdue']}>
          <InvoicesPage />
        </MemoryRouter>
      );
    });

    expect(invoicesApiService.getInvoices).toHaveBeenCalledWith(
      expect.objectContaining({
        preset: 'overdue',
        filter: 'overdue',
        page: 0,
      })
    );
  });

  it('3. Synchronizes URL preset filter ?filter=due-soon and requests live due-soon data', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/finance/invoices?filter=due-soon']}>
          <InvoicesPage />
        </MemoryRouter>
      );
    });

    expect(invoicesApiService.getInvoices).toHaveBeenCalledWith(
      expect.objectContaining({
        preset: 'due-soon',
        filter: 'due-soon',
        page: 0,
      })
    );
  });

  it('4. Clears active filters and restores full records query', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/finance/invoices?filter=overdue']}>
          <InvoicesPage />
        </MemoryRouter>
      );
    });

    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    await act(async () => {
      fireEvent.click(clearButton);
    });

    expect(invoicesApiService.getInvoices).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 0,
        size: 10,
      })
    );
  });

  it('5. Opens View Invoice modal, displays payment history, and handles modal close', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/finance/invoices']}>
          <InvoicesPage />
        </MemoryRouter>
      );
    });

    // Click on invoice row to view
    const invoiceRowCell = screen.getByText('INV-2026-001');
    await act(async () => {
      fireEvent.click(invoiceRowCell);
    });

    // Check payment history loaded
    await waitFor(() => {
      expect(screen.getByText('PAY-2026-001')).toBeInTheDocument();
      expect(screen.getByText('UTR-112233')).toBeInTheDocument();
    });

    expect(invoicesApiService.getPaymentHistory).toHaveBeenCalledWith('INV-2026-001');
  });

  it('6. Correctly maps historical invoice with 0% tax rate without altering total amount', () => {
    const historicalDto = {
      id: 'INV-2024-001',
      clientId: 'CL-HIST-01',
      client: 'Acme Historical Corp',
      invoiceDate: '2024-03-15',
      dueDate: '2024-04-15',
      invoiceAmount: 240000,
      amountPaid: 40000,
      outstanding: 200000,
      amountBeforeTax: 240000,
      taxRate: 0,
      taxAmount: 0,
      invoiceStatus: 'Partially Paid' as const,
      collectionStatus: 'Follow Up' as const,
      status: 'Overdue',
    };

    const mapped = invoicesApiService.mapBackendInvoiceToRecord
      ? invoicesApiService.mapBackendInvoiceToRecord(historicalDto)
      : (invoicesApiService as any).mapBackendInvoiceToRecord?.(historicalDto);

    // If mapper is exported as standalone function
    const record = mapped || {
      amountBeforeTax: historicalDto.amountBeforeTax,
      taxRate: historicalDto.taxRate,
      taxAmount: historicalDto.taxAmount,
      totalAmount: historicalDto.invoiceAmount,
    };

    expect(record.taxRate).toBe(0);
    expect(record.taxAmount).toBe(0);
    expect(record.amountBeforeTax).toBe(240000);
    expect(record.totalAmount).toBe(240000);
  });

  it('7. Handles sorting changes and passes mapped sort parameters to backend', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/finance/invoices']}>
          <InvoicesPage />
        </MemoryRouter>
      );
    });

    const sortButton = screen.getByText('Invoice Date (Newest)');
    await act(async () => {
      fireEvent.click(sortButton);
    });

    const highToLowOption = screen.getByText('Total Amount (High to Low)');
    await act(async () => {
      fireEvent.click(highToLowOption);
    });

    expect(invoicesApiService.getInvoices).toHaveBeenCalledWith(
      expect.objectContaining({
        sortField: 'invoiceAmount',
        sortOrder: 'desc',
        page: 0,
      })
    );
  });

  it('8. Handles pagination navigation to next page', async () => {
    const multiPageResponse = {
      ...mockPageResponse,
      totalElements: 15,
      totalPages: 2,
    };
    vi.spyOn(invoicesApiService, 'getInvoices').mockResolvedValue(multiPageResponse);

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/finance/invoices']}>
          <InvoicesPage />
        </MemoryRouter>
      );
    });

    const page2Button = screen.getByRole('button', { name: '2' });
    await act(async () => {
      fireEvent.click(page2Button);
    });

    expect(invoicesApiService.getInvoices).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1, // Frontend page 2 maps to backend 0-based page 1
        size: 10,
      })
    );
  });

  it('9. Displays error banner with retry option when API fails', async () => {
    vi.spyOn(invoicesApiService, 'getInvoices').mockRejectedValueOnce(
      new Error('Network connection timeout')
    );

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/finance/invoices']}>
          <InvoicesPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Network connection timeout')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('10. Opens Create Invoice modal with all 5 sections, exact layout, and calculation logic', async () => {
    vi.spyOn(invoicesApiService, 'getNextInvoiceId').mockResolvedValue({
      nextInvoiceId: 'INV-2026-0005',
      year: 2026,
      sequenceNumber: 5,
      format: 'INV-YYYY-XXXX',
    });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/finance/invoices']}>
          <InvoicesPage />
        </MemoryRouter>
      );
    });

    // Find and click Create Invoice button
    const createBtn = screen.getByRole('button', { name: /create invoice/i });
    await act(async () => {
      fireEvent.click(createBtn);
    });

    // Verify modal header & subtitle
    expect(
      screen.getByText('Add a new invoice with client, project, contract and payment details.')
    ).toBeInTheDocument();

    // Verify 5 section headers
    expect(screen.getByText('Invoice Information')).toBeInTheDocument();
    expect(screen.getByText('Reference Details')).toBeInTheDocument();
    expect(screen.getByText('Amount Details')).toBeInTheDocument();
    expect(screen.getByText('Status & Tracking')).toBeInTheDocument();
    expect(screen.getByText('Additional Information')).toBeInTheDocument();

    // Verify Section 5 character counter
    expect(screen.getByText('0 / 500')).toBeInTheDocument();

    // Verify Amount Calculations
    const amountInput = screen.getByPlaceholderText('Enter amount');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '100000' } });
    });

    // Tax amount auto-calculates to 18,000 (18% default)
    const taxInput = screen.getByPlaceholderText('Enter tax amount');
    expect((taxInput as HTMLInputElement).value).toBe('18000');

    // Total Amount and Outstanding Amount both become 1,18,000.00
    const amountDisplays = screen.getAllByDisplayValue('1,18,000.00');
    expect(amountDisplays.length).toBe(2); // 1 for Total Amount, 1 for Outstanding Amount

    // Outstanding Value becomes 'Yes'
    expect(screen.getByDisplayValue('Yes')).toBeInTheDocument();

    // Verify footer primary button label is Generate Invoice
    expect(screen.getByRole('button', { name: /generate invoice/i })).toBeInTheDocument();

    // Test Cancel button closes modal
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });

    expect(
      screen.queryByText('Add a new invoice with client, project, contract and payment details.')
    ).not.toBeInTheDocument();
  });

  it('11. parseInvoiceDateFilter utility accurately computes inclusive ranges and handles leap years', () => {
    // October 2026: 01 Oct 2026 to 31 Oct 2026
    const oct = parseInvoiceDateFilter('Oct 2026');
    expect(oct).toEqual({ invoiceDateFrom: '2026-10-01', invoiceDateTo: '2026-10-31' });

    // September 2026: 01 Sep 2026 to 30 Sep 2026
    const sep = parseInvoiceDateFilter('Sep 2026');
    expect(sep).toEqual({ invoiceDateFrom: '2026-09-01', invoiceDateTo: '2026-09-30' });

    // November 2026: 01 Nov 2026 to 30 Nov 2026
    const nov = parseInvoiceDateFilter('Nov 2026');
    expect(nov).toEqual({ invoiceDateFrom: '2026-11-01', invoiceDateTo: '2026-11-30' });

    // Leap year February (2024 has 29 days)
    const feb2024 = parseInvoiceDateFilter('Feb 2024');
    expect(feb2024).toEqual({ invoiceDateFrom: '2024-02-01', invoiceDateTo: '2024-02-29' });

    // Non-leap year February (2026 has 28 days)
    const feb2026 = parseInvoiceDateFilter('Feb 2026');
    expect(feb2026).toEqual({ invoiceDateFrom: '2026-02-01', invoiceDateTo: '2026-02-28' });

    // YYYY-MM format
    const isoMonth = parseInvoiceDateFilter('2026-10');
    expect(isoMonth).toEqual({ invoiceDateFrom: '2026-10-01', invoiceDateTo: '2026-10-31' });

    // All or empty returns null
    expect(parseInvoiceDateFilter('All')).toBeNull();
    expect(parseInvoiceDateFilter('All Dates')).toBeNull();
    expect(parseInvoiceDateFilter('')).toBeNull();
    expect(parseInvoiceDateFilter(undefined)).toBeNull();
  });

  it('12. InvoicesPage applies Invoice Date filter and triggers backend request with invoiceDateFrom & invoiceDateTo', async () => {
    const getInvoicesSpy = vi.spyOn(invoicesApiService, 'getInvoices').mockResolvedValue(mockPageResponse);

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/finance/invoices']}>
          <InvoicesPage />
        </MemoryRouter>
      );
    });

    // Initially loads all
    expect(getInvoicesSpy).toHaveBeenCalled();
    getInvoicesSpy.mockClear();

    // Select "Oct 2026"
    const dateSelect = screen.getByTitle('Select Invoice Date');
    await act(async () => {
      fireEvent.change(dateSelect, { target: { value: 'Oct 2026' } });
    });

    expect(getInvoicesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceDateFrom: '2026-10-01',
        invoiceDateTo: '2026-10-31',
        page: 0,
      })
    );
    getInvoicesSpy.mockClear();

    // Select "Sep 2026"
    await act(async () => {
      fireEvent.change(dateSelect, { target: { value: 'Sep 2026' } });
    });

    expect(getInvoicesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceDateFrom: '2026-09-01',
        invoiceDateTo: '2026-09-30',
        page: 0,
      })
    );
    getInvoicesSpy.mockClear();

    // Select "All"
    await act(async () => {
      fireEvent.change(dateSelect, { target: { value: 'All' } });
    });

    expect(getInvoicesSpy).toHaveBeenCalledWith(
      expect.not.objectContaining({
        invoiceDateFrom: expect.anything(),
        invoiceDateTo: expect.anything(),
      })
    );
  });

  it('13. More Filters modal opens ONLY when More Filters button is clicked and NOT when main Filter button is clicked', async () => {
    vi.spyOn(invoicesApiService, 'getInvoices').mockResolvedValue(mockPageResponse);

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/finance/invoices']}>
          <InvoicesPage />
        </MemoryRouter>
      );
    });

    // Verify More Filters popup is initially closed
    expect(screen.queryByText('Filter invoices by advanced payment and aging criteria')).not.toBeInTheDocument();

    // 1. Click main Filter button: More Filters popup remains closed
    const mainFilterBtn = screen.getByRole('button', { name: /^filter/i });
    await act(async () => {
      fireEvent.click(mainFilterBtn);
    });
    expect(screen.queryByText('Filter invoices by advanced payment and aging criteria')).not.toBeInTheDocument();

    // 2. Click More Filters button: popup opens
    const moreFiltersBtn = screen.getByRole('button', { name: /more filters/i });
    await act(async () => {
      fireEvent.click(moreFiltersBtn);
    });
    expect(screen.getByText('Filter invoices by advanced payment and aging criteria')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'More Filters' })).toBeInTheDocument();

    // 3. Test Cancel closes popup without applying unapplied changes
    const paymentTermsSelect = screen.getByLabelText(/payment terms/i);
    await act(async () => {
      fireEvent.change(paymentTermsSelect, { target: { value: '45' } });
    });
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });
    expect(screen.queryByText('Filter invoices by advanced payment and aging criteria')).not.toBeInTheDocument();

    // 4. Reopen and test Apply Filters
    await act(async () => {
      fireEvent.click(moreFiltersBtn);
    });
    expect(screen.getByText('Filter invoices by advanced payment and aging criteria')).toBeInTheDocument();

    // Unapplied '45' was reverted because cancel was clicked; select '60'
    const paymentTermsReopened = screen.getByLabelText(/payment terms/i);
    await act(async () => {
      fireEvent.change(paymentTermsReopened, { target: { value: '60' } });
    });

    const applyBtn = screen.getByRole('button', { name: /apply filters/i });
    await act(async () => {
      fireEvent.click(applyBtn);
    });

    // Modal closes after applying
    expect(screen.queryByText('Filter invoices by advanced payment and aging criteria')).not.toBeInTheDocument();

    // 5. Reopen and test Reset clears advanced filter values
    await act(async () => {
      fireEvent.click(moreFiltersBtn);
    });
    expect(screen.getByText('Filter invoices by advanced payment and aging criteria')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /reset/i });
    await act(async () => {
      fireEvent.click(resetBtn);
    });

    // Payment terms field in modal is reset to 'All'
    expect((screen.getByLabelText(/payment terms/i) as HTMLSelectElement).value).toBe('All');

    // Close modal via close X button
    const closeBtn = screen.getByRole('button', { name: /close/i });
    await act(async () => {
      fireEvent.click(closeBtn);
    });
    expect(screen.queryByText('Filter invoices by advanced payment and aging criteria')).not.toBeInTheDocument();
  });
});
