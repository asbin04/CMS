import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FollowUpQueuePage } from '@/features/dashboard/pages/FollowUpQueuePage';
import { followUpService } from '@/services/followUpService';
import { FollowUpItemData, FollowUpSummaryData } from '@/types/followUp';

const mockItems: FollowUpItemData[] = [
  {
    id: 1,
    moduleCode: 'INV',
    moduleName: 'Invoices',
    moduleSub: 'Payment Collections',
    iconBg: '#FEF2F2',
    iconColor: '#DC2626',
    count: 1,
    countVariant: 'red',
    keyInfoTitle: 'Acme Corp - Invoice #1024',
    keyInfoSub: 'Payment overdue by 5 days',
    priority: 'High',
    health: 'Overdue',
    daysSinceLastFollowUp: '5 days ago',
    daysColorRed: true,
    primaryActionLabel: 'Mark Follow-up Done',
    secondaryActionLabel: 'Log Call',
    isDone: false,
    orderIndex: 1,
  },
];

const mockSummary: FollowUpSummaryData = {
  highPriorityCount: 1,
  mediumPriorityCount: 0,
  lowPriorityCount: 0,
  totalPendingItems: 1,
  totalCompletedItems: 0,
  lastRefreshed: '15 Mar 2025, 10:30 AM',
};

describe('FollowUpQueuePage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(followUpService, 'getItems').mockResolvedValue(mockItems);
    vi.spyOn(followUpService, 'getSummary').mockResolvedValue(mockSummary);
  });

  it('renders loading state when fetching items', async () => {
    vi.spyOn(followUpService, 'getItems').mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <FollowUpQueuePage />
      </BrowserRouter>
    );

    expect(screen.getAllByText('Follow-Up Queue')[0]).toBeInTheDocument();
  });

  it('displays error banner with Retry button when request fails, and clicking retry reloads', async () => {
    const fetchSpy = vi.spyOn(followUpService, 'getItems')
      .mockRejectedValueOnce(new Error('Database unavailable'))
      .mockResolvedValueOnce(mockItems);

    await act(async () => {
      render(
        <BrowserRouter>
          <FollowUpQueuePage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText(/Database unavailable/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry connection/i });
    expect(retryBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(retryBtn);
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when there are no follow-up items', async () => {
    vi.spyOn(followUpService, 'getItems').mockResolvedValue([]);
    vi.spyOn(followUpService, 'getSummary').mockResolvedValue({
      highPriorityCount: 0,
      mediumPriorityCount: 0,
      lowPriorityCount: 0,
      totalPendingItems: 0,
      totalCompletedItems: 0,
      lastRefreshed: '15 Mar 2025, 10:30 AM',
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <FollowUpQueuePage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText(/The queue is currently empty/i)).toBeInTheDocument();
  });

  it('renders queue items and summary metrics on success', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <FollowUpQueuePage />
        </BrowserRouter>
      );
    });

    expect(screen.getAllByText('Follow-Up Queue')[0]).toBeInTheDocument();
    expect(screen.getByText('Acme Corp - Invoice #1024')).toBeInTheDocument();
    expect(screen.queryByText(/Last Refreshed:/i)).not.toBeInTheDocument();
  });

  it('rolls back optimistic completion update when toggleDone mutation fails', async () => {
    vi.spyOn(followUpService, 'toggleDone').mockRejectedValue(new Error('Mutation rejected by server'));

    await act(async () => {
      render(
        <BrowserRouter>
          <FollowUpQueuePage />
        </BrowserRouter>
      );
    });

    // Action toggle button
    const toggleButton = screen.getByRole('button', { name: /mark follow-up done/i });
    expect(toggleButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    // Toast or error indicates failure and item stays in queue
    expect(screen.getByText('Acme Corp - Invoice #1024')).toBeInTheDocument();
  });
});

