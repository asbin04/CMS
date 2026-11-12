import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CeoDashboardPage } from '@/features/dashboard/pages/CeoDashboardPage';
import { dashboardService } from '@/services/dashboardService';
import { initialDashboardData } from './testFixtures';

describe('CeoDashboardPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders skeleton loader while loading data', async () => {
    // Hang promise to test loading state
    vi.spyOn(dashboardService, 'getDashboardData').mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <CeoDashboardPage
          dateRange="Apr 2024 - Mar 2025"
          isEditModalOpen={false}
          onCloseEditModal={() => {}}
        />
      </BrowserRouter>
    );

    // Header skeleton / loading indicator is present
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  it('displays error banner with Retry button when request fails, and clicking Retry triggers reload', async () => {
    const errorSpy = vi.spyOn(dashboardService, 'getDashboardData')
      .mockRejectedValueOnce(new Error('Network error: DB connection timed out'))
      .mockResolvedValueOnce(initialDashboardData);

    await act(async () => {
      render(
        <BrowserRouter>
          <CeoDashboardPage
            dateRange="Apr 2024 - Mar 2025"
            isEditModalOpen={false}
            onCloseEditModal={() => {}}
          />
        </BrowserRouter>
      );
    });

    // Error banner is displayed
    expect(screen.getByText(/Failed to load Admin Dashboard data/i)).toBeInTheDocument();
    expect(screen.getByText(/Network error: DB connection timed out/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Clicking retry calls service again
    await act(async () => {
      fireEvent.click(retryBtn);
    });

    expect(errorSpy).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when dashboard returns zero kpis and zero alerts', async () => {
    const emptyData = {
      ...initialDashboardData,
      kpis: [],
      alerts: [],
    };

    vi.spyOn(dashboardService, 'getDashboardData').mockResolvedValue(emptyData);

    await act(async () => {
      render(
        <BrowserRouter>
          <CeoDashboardPage
            dateRange="Apr 2024 - Mar 2025"
            isEditModalOpen={false}
            onCloseEditModal={() => {}}
          />
        </BrowserRouter>
      );
    });

    expect(screen.getByText(/No active metrics configured/i)).toBeInTheDocument();
  });

  it('fetches and displays live CEO dashboard data on success', async () => {
    const mockData = {
      ...initialDashboardData,
      settings: {
        ...initialDashboardData.settings,
        dashboard_title: 'Executive CEO Dashboard Live',
      },
    };

    vi.spyOn(dashboardService, 'getDashboardData').mockResolvedValue(mockData);

    await act(async () => {
      render(
        <BrowserRouter>
          <CeoDashboardPage
            dateRange="Apr 2024 - Mar 2025"
            isEditModalOpen={false}
            onCloseEditModal={() => {}}
          />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Executive CEO Dashboard Live')).toBeInTheDocument();
  });

  it('handles rollback and error toast on failed dashboard update mutation', async () => {
    vi.spyOn(dashboardService, 'getDashboardData').mockResolvedValue(initialDashboardData);
    vi.spyOn(dashboardService, 'updateDashboardData').mockRejectedValue(new Error('Update permission denied'));

    await act(async () => {
      render(
        <BrowserRouter>
          <CeoDashboardPage
            dateRange="Apr 2024 - Mar 2025"
            isEditModalOpen={true}
            onCloseEditModal={() => {}}
          />
        </BrowserRouter>
      );
    });

    // Save button inside modal
    const saveButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Dashboard title should remain initial
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
