// @vitest-environment jsdom
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TopNav } from '../components/layout/TopNav';
import { notificationService, NOTIFICATION_REFRESH_EVENT } from '../services/notificationService';

vi.mock('../services/notificationService', async () => {
  const actual = await vi.importActual<typeof import('../services/notificationService')>('../services/notificationService');
  return {
    ...actual,
    notificationService: {
      getNotifications: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    },
  };
});

describe('TopNav Notification System', () => {
  const mockNotifications = [
    {
      id: 1,
      title: 'Pending Leave Approval',
      detail: 'Arun S submitted sick leave for 3 days',
      type: 'APPROVAL',
      link: '/management/approval-inbox',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Invoice Overdue Notice',
      detail: 'Invoice INV-2024-001 is past due date',
      type: 'INVOICE',
      link: '/management/collections',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders unread badge when unreadCount > 0 from database', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValue({
      unreadCount: 2,
      notifications: mockNotifications,
    });

    render(
      <BrowserRouter>
        <TopNav />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalled();
    });

    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
  });

  it('opens notification dropdown showing live items and allows marking all as read', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValue({
      unreadCount: 2,
      notifications: mockNotifications,
    });
    vi.mocked(notificationService.markAllAsRead).mockResolvedValue(2);

    render(
      <BrowserRouter>
        <TopNav />
      </BrowserRouter>
    );

    const bellBtn = await screen.findByRole('button', { name: /notification bell/i });
    fireEvent.click(bellBtn);

    expect(await screen.findByText('Pending Leave Approval')).toBeInTheDocument();
    expect(screen.getByText('Invoice Overdue Notice')).toBeInTheDocument();
    expect(screen.getByText('2 New')).toBeInTheDocument();

    const markAllBtn = screen.getByText('Mark all read');
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(notificationService.markAllAsRead).toHaveBeenCalled();
    });
  });

  it('refreshes notifications when portal-notification-refresh event is dispatched', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce({
      unreadCount: 1,
      notifications: [mockNotifications[0]],
    });

    render(
      <BrowserRouter>
        <TopNav />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    // Mock next response with updated count from db
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce({
      unreadCount: 3,
      notifications: [
        ...mockNotifications,
        {
          id: 3,
          title: 'New Lead Added',
          detail: 'Acme Corp was added',
          type: 'LEAD',
          link: '/sales/leads',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    // Fire custom event
    window.dispatchEvent(new CustomEvent(NOTIFICATION_REFRESH_EVENT));

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('renders long user profile name and down arrow without overlap', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValue({
      unreadCount: 0,
      notifications: [],
    });

    render(
      <BrowserRouter>
        <TopNav userName="Gaurav Kumar Tripathi" userRole="ADMIN" />
      </BrowserRouter>
    );

    const nameEl = screen.getByText('Gaurav Kumar Tripathi');
    expect(nameEl).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();

    // The name element container should not have rigid 73px width
    const parentContainer = nameEl.closest('.sm\\:flex');
    expect(parentContainer).toBeInTheDocument();
    expect(parentContainer).not.toHaveStyle({ width: '73px' });
  });
});
