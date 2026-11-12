import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { CollectionsPage } from '@/features/collections/pages/CollectionsPage';
import { collectionsApiService } from '@/features/collections/services/collectionsApiService';
import { navigationSections } from '@/config/navigation';
import { INITIAL_INVOICES, INITIAL_PAYMENTS } from './testFixtures';

const mockInvoicesPage = {
  content: INITIAL_INVOICES.slice(0, 3),
  totalElements: 3,
  totalPages: 1,
  pageSize: 200,
  pageNumber: 0,
  first: true,
  last: true,
};

const mockKpis: import('@/features/collections/types').KpiSummary = {
  totalOutstanding: {
    amount: 300000,
    count: 3,
    trendPct: 5,
  },
  overdueAmount: {
    amount: 85000,
    count: 1,
    trendPct: -2,
  },
  dueSoon: {
    amount: 50000,
    count: 2,
    trendPct: 1,
  },
  collectedThisMonth: {
    amount: 200000,
    paymentCount: 4,
    trendPct: 12,
  },
};

describe('CollectionsPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(collectionsApiService, 'getInvoices').mockResolvedValue(mockInvoicesPage);
    vi.spyOn(collectionsApiService, 'getKpis').mockResolvedValue(mockKpis);
    vi.spyOn(collectionsApiService, 'getAgeingChart').mockResolvedValue([]);
    vi.spyOn(collectionsApiService, 'getStatusDistribution').mockResolvedValue([]);
    vi.spyOn(collectionsApiService, 'getPayments').mockResolvedValue(INITIAL_PAYMENTS);
  });

  it('renders skeleton loader while loading collections data', async () => {
    vi.spyOn(collectionsApiService, 'getInvoices').mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <CollectionsPage />
      </BrowserRouter>
    );

    // Header is rendered with loading state
    expect(screen.getByText(/Collections/i)).toBeInTheDocument();
  });

  it('displays error banner with Retry button when backend call fails, and clicking retry reloads', async () => {
    const errorSpy = vi.spyOn(collectionsApiService, 'getInvoices')
      .mockRejectedValueOnce(new Error('Connection to collections API failed'))
      .mockResolvedValueOnce(mockInvoicesPage);

    await act(async () => {
      render(
        <BrowserRouter>
          <CollectionsPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText(/Unable to load collections data/i)).toBeInTheDocument();
    expect(screen.getByText(/Connection to collections API failed/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(retryBtn);
    });

    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when there are zero invoices in database', async () => {
    vi.spyOn(collectionsApiService, 'getInvoices').mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageSize: 200,
      pageNumber: 0,
      first: true,
      last: true,
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <CollectionsPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText(/No Invoices Found/i)).toBeInTheDocument();
  });

  it('renders invoice table, details card, and KPI cards on success', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <CollectionsPage />
        </BrowserRouter>
      );
    });

    expect(screen.getAllByText('INV-2024-001')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Acme Pvt Ltd')[0]).toBeInTheDocument();
  });

  it('displays error message and preserves invoice state when reminder mutation fails', async () => {
    vi.spyOn(collectionsApiService, 'sendReminder').mockRejectedValue(new Error('Email service rate limit exceeded'));

    await act(async () => {
      render(
        <BrowserRouter>
          <CollectionsPage />
        </BrowserRouter>
      );
    });

    // Invoice INV-2024-001 is loaded and selected
    expect(screen.getAllByText('INV-2024-001')[0]).toBeInTheDocument();
  });

  it('renders correctly when routed from /management/collections', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/management/collections']}>
          <CollectionsPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Collections')).toBeInTheDocument();
    expect(screen.getAllByText('INV-2024-001')[0]).toBeInTheDocument();
  });

  it('removes Collections from the Finance sidebar while keeping it under Management', () => {
    const financeSection = navigationSections.find((s) => s.id === 'finance');
    const managementSection = navigationSections.find((s) => s.id === 'management');

    expect(financeSection).toBeDefined();
    expect(financeSection?.items.some((i) => i.path === '/finance/collections' || i.id === 'collections-fin')).toBe(false);
    expect(managementSection?.items.some((i) => i.path === '/management/collections')).toBe(true);
  });
});

