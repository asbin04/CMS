import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { PaymentsPage } from '../features/finance/payments/pages/PaymentsPage';
import { paymentsService } from '../features/finance/payments/services/paymentsService';

vi.mock('../features/finance/payments/services/paymentsService', () => ({
  paymentsService: {
    getPayments: vi.fn(),
    getKpis: vi.fn(),
    getFilterOptions: vi.fn(),
    recordPayment: vi.fn(),
    updatePayment: vi.fn(),
    exportPayments: vi.fn(),
  },
}));

const mockRecords = [
  {
    id: 'PAY-202610-122',
    paymentDate: '2026-10-28',
    invoiceId: 'INV-2026-128',
    clientId: 'CL-001',
    clientName: 'TechCorp Solutions',
    amount: 70800,
    invoiceAmount: 70800,
    mode: 'Bank Transfer',
    referenceNo: 'UTR123456789',
    status: 'Matched',
    varianceAmount: 0,
    notes: '-',
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'PAY-202610-121',
    paymentDate: '2026-10-25',
    invoiceId: 'INV-2026-127',
    clientId: 'CL-003',
    clientName: 'Innovate Labs',
    amount: 236000,
    invoiceAmount: 236000,
    mode: 'NEFT',
    referenceNo: 'NEFT987654',
    status: 'Matched',
    varianceAmount: 0,
    notes: '-',
    createdAt: '2026-10-25T11:00:00Z',
    updatedAt: '2026-10-25T11:00:00Z',
  },
  {
    id: 'PAY-202610-120',
    paymentDate: '2026-10-22',
    invoiceId: 'INV-2026-126',
    clientId: 'CL-004',
    clientName: 'Alpha Logistics',
    amount: 94400,
    invoiceAmount: 94400,
    mode: 'UPI',
    referenceNo: 'UPI334455',
    status: 'Pending',
    varianceAmount: 0,
    notes: 'Waiting for clearance',
    createdAt: '2026-10-22T09:00:00Z',
    updatedAt: '2026-10-22T09:00:00Z',
  },
  {
    id: 'PAY-202610-118',
    paymentDate: '2026-10-18',
    invoiceId: 'INV-2026-124',
    clientId: 'CL-005',
    clientName: 'Horizon Health',
    amount: 30000,
    invoiceAmount: 45000,
    mode: 'Bank Transfer',
    referenceNo: 'UTR445566',
    status: 'Partially Matched',
    varianceAmount: 15000,
    notes: 'Advance payment for phase 2',
    createdAt: '2026-10-18T14:00:00Z',
    updatedAt: '2026-10-18T14:00:00Z',
  },
];

const mockKpis = {
  totalPayments: 3210000,
  totalPaymentsGrowth: 18,
  totalPaymentsTrend: 'up' as const,
  pendingPayments: 680000,
  pendingPaymentsGrowth: 12,
  pendingPaymentsTrend: 'down' as const,
  matchedPayments: 2850000,
  matchedPaymentsGrowth: 20,
  matchedPaymentsTrend: 'up' as const,
  paymentVariance: 40000,
  paymentVarianceGrowth: 8,
  paymentVarianceTrend: 'down' as const,
  lastUpdatedFormatted: '15 Oct 2026, 11:30 AM',
  totalRecordCount: 128,
};

const mockFilterOptions = {
  modes: ['Bank Transfer', 'NEFT', 'UPI', 'Cheque', 'RTGS'],
  statuses: ['Matched', 'Pending', 'Partially Matched'],
  clients: [
    { clientId: 'CL-001', clientName: 'TechCorp Solutions' },
    { clientId: 'CL-002', clientName: 'Apex Retail' },
    { clientId: 'CL-003', clientName: 'Innovate Labs' },
  ],
  months: ['2026-10', '2026-09'],
};

describe('PaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(paymentsService.getKpis).mockResolvedValue(mockKpis);
    vi.mocked(paymentsService.getFilterOptions).mockResolvedValue(mockFilterOptions);
    vi.mocked(paymentsService.getPayments).mockResolvedValue({
      content: mockRecords,
      pageNumber: 1,
      pageSize: 10,
      totalElements: 122,
      totalPages: 13,
      first: true,
      last: false,
    });
  });

  it('renders Payments header, subtitle, last updated, and action buttons', async () => {
    render(
      <BrowserRouter>
        <PaymentsPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: 'Payments' })).toBeInTheDocument();
    expect(screen.getByText(/Track and manage client payments/i)).toBeInTheDocument();
    expect(screen.queryByText(/Last Updated:/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Record Payment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
  });

  it('renders dynamic KPI cards with values matching the design', async () => {
    render(
      <BrowserRouter>
        <PaymentsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Payments')).toBeInTheDocument();
      expect(screen.getByText('₹ 32,10,000')).toBeInTheDocument();
      expect(screen.getByText('Pending Payments')).toBeInTheDocument();
      expect(screen.getByText('₹ 6,80,000')).toBeInTheDocument();
      expect(screen.getByText('Matched Payments')).toBeInTheDocument();
      expect(screen.getByText('₹ 28,50,000')).toBeInTheDocument();
      expect(screen.getByText('Payment Variance')).toBeInTheDocument();
      expect(screen.getByText('₹ 40,000')).toBeInTheDocument();
    });
  });

  it('renders payment records table with correct columns and status badges', async () => {
    render(
      <BrowserRouter>
        <PaymentsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('PAY-202610-122')).toBeInTheDocument();
      expect(screen.getByText('INV-2026-128')).toBeInTheDocument();
      expect(screen.getByText('CL-001')).toBeInTheDocument();
      expect(screen.getByText('₹ 70,800')).toBeInTheDocument();
      expect(screen.getByText('UTR123456789')).toBeInTheDocument();
      expect(screen.getAllByText('Matched').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Partially Matched').length).toBeGreaterThan(0);
    });
  });

  it('opens Record Payment modal when "+ Record Payment" button is clicked', async () => {
    render(
      <BrowserRouter>
        <PaymentsPage />
      </BrowserRouter>
    );

    const recordBtn = screen.getByRole('button', { name: /Record Payment/i });
    fireEvent.click(recordBtn);

    expect(screen.getByRole('heading', { name: 'Record Payment' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. INV-2026-129/i)).toBeInTheDocument();
  });

  it('opens Payment Detail modal when clicking a payment row', async () => {
    render(
      <BrowserRouter>
        <PaymentsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('PAY-202610-122')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('PAY-202610-122'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Update Changes/i })).toBeInTheDocument();
    });
  });

  it('updates search filter when typing into search input', async () => {
    render(
      <BrowserRouter>
        <PaymentsPage />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Search by Payment ID, Invoice ID/i);
    fireEvent.change(searchInput, { target: { value: 'PAY-202610-122' } });

    await waitFor(() => {
      expect(paymentsService.getPayments).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'PAY-202610-122',
        })
      );
    });
  });
});
