import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TransactionControlPage } from '../features/reports/pages/TransactionControlPage';
import { transactionControlService } from '../features/reports/services/transactionControlService';
import { TransactionControlResponse } from '../features/reports/types/transactionControl';
import { AppRouter } from '../app/router';

const mockLiveResponse: TransactionControlResponse = {
  verificationAvailable: true,
  checkedAt: '2026-11-11T18:00:00Z',
  defaultSelectedCheckId: 'invalid-payment-invoices',
  checks: [
    {
      id: 'invalid-relationships',
      control: 'Invalid relationships',
      description: 'Records whose client, project, or invoice references do not match master registers.',
      classification: 'CRITICAL',
      count: 1,
      actionLabel: 'Fix linked records',
      actionPath: '/sales/contracts',
      nested: false,
      statusFilterLabel: 'Status',
      statusOptions: ['Flagged'],
      records: [
        {
          id: 'rel-1',
          primaryLabel: 'PAY-901',
          secondaryLabel: 'Payment',
          date: '2026-11-05',
          invoiceId: 'INV-9999',
          clientId: 'CL-999',
          clientName: 'Unknown Client',
          amount: 42000,
          modeOrReference: 'NEFT',
          referenceSub: 'UTR-9988',
          status: 'Flagged',
          checkDetail: 'Unmatched invoice ID; Unmatched client ID',
          actionLabel: 'Open Payments',
          actionPath: '/finance/payments',
        },
      ],
    },
    {
      id: 'invalid-payment-invoices',
      control: 'Invalid payment invoices',
      description: 'Nonblank Invoice ID does not match the invoice register.',
      classification: 'CRITICAL',
      count: 2,
      actionLabel: 'Link payment to valid invoice',
      actionPath: '/finance/payments',
      nested: true,
      statusFilterLabel: 'Payment status',
      statusOptions: ['Unmatched', 'Pending'],
      records: [
        {
          id: 'pay-inv-1',
          primaryLabel: 'PAY-101',
          secondaryLabel: 'finance_payments',
          date: '2026-11-01',
          invoiceId: 'INV-MISSING-1',
          clientId: 'CL-001',
          clientName: 'Acme Corp',
          amount: 55000,
          modeOrReference: 'NEFT',
          referenceSub: 'UTR-001122',
          status: 'Unmatched',
          checkDetail: 'Invoice ID not found in register',
          actionLabel: 'Fix in Payments',
          actionPath: '/finance/payments',
        },
        {
          id: 'pay-inv-2',
          primaryLabel: 'PAY-102',
          secondaryLabel: 'finance_payments',
          date: '2026-11-03',
          invoiceId: 'INV-MISSING-2',
          clientId: 'CL-002',
          clientName: 'Beta Systems',
          amount: 18500,
          modeOrReference: 'UPI',
          referenceSub: 'UPI-889900',
          status: 'Pending',
          checkDetail: 'Invoice ID not found in register',
          actionLabel: 'Fix in Payments',
          actionPath: '/finance/payments',
        },
      ],
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
  ],
};

describe('TransactionControlPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders exact static headings, all six workbook checks, and filters live records', async () => {
    vi.spyOn(transactionControlService, 'getChecks').mockResolvedValue(mockLiveResponse);
    const recheckSpy = vi
      .spyOn(transactionControlService, 'recheck')
      .mockResolvedValue(mockLiveResponse);

    render(
      <MemoryRouter>
        <TransactionControlPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Transaction Control' })).toBeInTheDocument();
    expect(
      screen.getByText('Review transaction exceptions and open the source records for correction.')
    ).toBeInTheDocument();
    expect(screen.getByText('Transaction checks')).toBeInTheDocument();
    expect(
      screen.getByText('Six workbook-defined controls. Select a check to review its source records.')
    ).toBeInTheDocument();
    expect(screen.getByText('Read-only calculated results')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('INV-MISSING-1')).toBeInTheDocument();
      expect(screen.getByText('INV-MISSING-2')).toBeInTheDocument();
      expect(screen.getByText('₹ 55,000')).toBeInTheDocument();
      expect(screen.getByText('₹ 18,500')).toBeInTheDocument();
    });

    expect(screen.getByText('Invalid relationships')).toBeInTheDocument();
    expect(screen.getAllByText('Invalid payment invoices').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Invoice review flags')).toBeInTheDocument();
    expect(screen.getByText('Overdue collections')).toBeInTheDocument();
    expect(screen.getByText('Overdue tasks')).toBeInTheDocument();
    expect(screen.getByText('Data quality issues')).toBeInTheDocument();
    expect(screen.getByText('Amounts keep their source currency when available')).toBeInTheDocument();

    // Search filters rows
    const searchInput = screen.getByPlaceholderText('Search payment ID, invoice ID or reference...');
    fireEvent.change(searchInput, { target: { value: 'INV-MISSING-2' } });
    expect(screen.queryByText('INV-MISSING-1')).not.toBeInTheDocument();
    expect(screen.getByText('INV-MISSING-2')).toBeInTheDocument();

    // Reset filters restores all rows
    fireEvent.click(screen.getByRole('button', { name: /Reset filters/i }));
    expect(screen.getByText('INV-MISSING-1')).toBeInTheDocument();
    expect(screen.getByText('INV-MISSING-2')).toBeInTheDocument();

    // Status dropdown filters by status
    fireEvent.click(screen.getByRole('button', { name: /^All$/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Pending' }));
    expect(screen.queryByText('INV-MISSING-1')).not.toBeInTheDocument();
    expect(screen.getByText('INV-MISSING-2')).toBeInTheDocument();

    // Selecting another check updates bottom card
    fireEvent.click(screen.getByText('Invalid relationships'));
    expect(screen.getByText('INV-9999')).toBeInTheDocument();

    // Recheck button triggers backend recheck endpoint
    fireEvent.click(screen.getByRole('button', { name: /Recheck/i }));
    await waitFor(() => {
      expect(recheckSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('shows unavailable fallback state without fake data when backend check fails', async () => {
    vi.spyOn(transactionControlService, 'getChecks').mockRejectedValue(
      new Error('Service unavailable')
    );

    render(
      <MemoryRouter>
        <TransactionControlPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recheck unavailable')).toBeInTheDocument();
    });

    expect(screen.getByText('No verified payment results yet')).toBeInTheDocument();
    expect(
      screen.getByText(/Validate the source fields and calculation before loading payment records\./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/No sample company transactions are shown\./i)).toBeInTheDocument();
    expect(screen.getByText('Results unavailable · not 0 invalid invoices')).toBeInTheDocument();
  });

  it('mounts TransactionControlPage cleanly at /reports/transaction-control', async () => {
    localStorage.setItem('auth_token', 'test-token');
    vi.spyOn(transactionControlService, 'getChecks').mockResolvedValue(mockLiveResponse);

    render(
      <MemoryRouter initialEntries={['/reports/transaction-control']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { name: 'Transaction Control' }, { timeout: 5000 })
    ).toBeInTheDocument();
  });
});

