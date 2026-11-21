import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LeaveManagementPage } from '../features/leave/pages/LeaveManagementPage';
import { leaveService } from '../features/leave/services/leaveService';
import { LeaveMetrics, LeaveRecord } from '../features/leave/types/leave';

const mockLeaves: LeaveRecord[] = [
  {
    id: 'LV-00086',
    employeeId: 'EMP-001',
    employeeName: 'Amit Sharma',
    leaveType: 'Casual Leave',
    fromDate: '28 Oct 2026',
    toDate: '28 Oct 2026',
    days: 1,
    reason: 'Personal work',
    approvalStatus: 'Pending',
    approvedBy: null,
    calculatedDays: 1,
    leaveStatus: 'Pending',
  },
  {
    id: 'LV-00085',
    employeeId: 'EMP-004',
    employeeName: 'Sneha Nair',
    leaveType: 'Sick Leave',
    fromDate: '26 Oct 2026',
    toDate: '27 Oct 2026',
    days: 2,
    reason: 'Fever and rest',
    approvalStatus: 'Approved',
    approvedBy: 'Akshit Ujjain',
    calculatedDays: 2,
    leaveStatus: 'Approved',
  },
  {
    id: 'LV-00083',
    employeeId: 'EMP-002',
    employeeName: 'Priya Kapoor',
    leaveType: 'Casual Leave',
    fromDate: '20 Oct 2026',
    toDate: '20 Oct 2026',
    days: 1,
    reason: 'Personal work',
    approvalStatus: 'Rejected',
    approvedBy: 'Arjun Nair',
    calculatedDays: 1,
    leaveStatus: 'Rejected',
  },
];

const mockMetrics: LeaveMetrics = {
  totalRequests: 86,
  totalRequestsTrend: '↑ 12% vs last month',
  approvedRequests: 62,
  approvedRequestsTrend: '↑ 8% vs last month',
  pendingRequests: 14,
  pendingRequestsTrend: '↓ 8% vs last month',
  rejectedRequests: 10,
  rejectedRequestsTrend: '↓ 17% vs last month',
};

describe('LeaveManagementPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(leaveService, 'getLeaves').mockResolvedValue(mockLeaves);
    vi.spyOn(leaveService, 'getMetrics').mockResolvedValue(mockMetrics);
  });

  it('renders page header and metric cards with live values', async () => {
    render(
      <BrowserRouter>
        <LeaveManagementPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Leave Management')).toBeInTheDocument();
    expect(screen.getByText('View and manage employee leave requests, approvals and leave records.')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('86')).toBeInTheDocument();
      expect(screen.getByText('62')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('renders leave records in the horizontal table', async () => {
    render(
      <BrowserRouter>
        <LeaveManagementPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('LV-00086')).toBeInTheDocument();
      expect(screen.getByText('Amit Sharma')).toBeInTheDocument();
      expect(screen.getByText('LV-00085')).toBeInTheDocument();
      expect(screen.getByText('Sneha Nair')).toBeInTheDocument();
    });
  });

  it('filters records when search query is entered', async () => {
    render(
      <BrowserRouter>
        <LeaveManagementPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('LV-00086')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by Leave ID, Employee ID or Employee Name...');
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'Sneha' } });
    });

    expect(screen.queryByText('Amit Sharma')).not.toBeInTheDocument();
    expect(screen.getByText('Sneha Nair')).toBeInTheDocument();
  });

  it('filters records by approval status dropdown', async () => {
    render(
      <BrowserRouter>
        <LeaveManagementPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('LV-00086')).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole('combobox', { name: /filter by approval status/i });
    act(() => {
      fireEvent.change(statusSelect, { target: { value: 'Approved' } });
    });

    expect(screen.queryByText('Amit Sharma')).not.toBeInTheDocument();
    expect(screen.getByText('Sneha Nair')).toBeInTheDocument();
  });

  it('shows error banner with retry button when API fails', async () => {
    vi.spyOn(leaveService, 'getLeaves').mockRejectedValueOnce(new Error('Network failure'));

    render(
      <BrowserRouter>
        <LeaveManagementPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Network failure/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    vi.spyOn(leaveService, 'getLeaves').mockResolvedValue(mockLeaves);
    act(() => {
      fireEvent.click(retryBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('LV-00086')).toBeInTheDocument();
    });
  });

  it('opens and closes Add Leave modal', async () => {
    render(
      <BrowserRouter>
        <LeaveManagementPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Leave Management')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /add leave/i });
    act(() => {
      fireEvent.click(addBtn);
    });

    expect(screen.getByText('Add Leave Request')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    act(() => {
      fireEvent.click(cancelBtn);
    });

    expect(screen.queryByText('Add Leave Request')).not.toBeInTheDocument();
  });

  it('approves a leave using current approver name', async () => {
    const updateSpy = vi.spyOn(leaveService, 'updateLeave').mockResolvedValue({
      ...mockLeaves[0],
      approvalStatus: 'Approved',
      approvedBy: 'Akshit Ujjain',
      leaveStatus: 'Approved',
    });

    render(
      <BrowserRouter>
        <LeaveManagementPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('LV-00086')).toBeInTheDocument();
    });

    // Click on LV-00086 to open detail modal
    const lvBtn = screen.getByRole('button', { name: 'LV-00086' });
    act(() => {
      fireEvent.click(lvBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Leave Details')).toBeInTheDocument();
    });

    const approveBtn = screen.getByRole('button', { name: /^approve$/i });
    act(() => {
      fireEvent.click(approveBtn);
    });

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        'LV-00086',
        expect.objectContaining({
          approvalStatus: 'Approved',
          approvedBy: expect.stringMatching(/Akshit Ujjain|Gaurav Tripathy|Asbin T S/),
        })
      );
    });
  });
});

