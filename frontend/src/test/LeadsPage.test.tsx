import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LeadsPage } from '../features/sales/pages/LeadsPage';
import { leadsService } from '../features/sales/services/leadsService';
import { Lead, LeadsMetrics } from '../features/sales/types/leads';

const mockLeads: Lead[] = [
  {
    id: 'L-2025-001',
    leadDate: '2025-03-15',
    company: 'Alpha Infotech',
    contactName: 'Rohit Sharma',
    email: 'rohit@alphainfo.com',
    phone: '9876543210',
    source: 'Website',
    serviceInterest: 'Cloud & DevOps',
    country: 'India',
    city: 'Bangalore',
    ownerId: 'EMP-001',
    stage: 'New',
    status: 'Open',
    estimatedValue: 1200000,
    leadScore: 85,
    nextFollowUp: '2025-03-20',
  },
];

const mockMetrics: LeadsMetrics = {
  totalLeads: 1,
  totalLeadsTrend: '↑ 10% vs last month',
  newLeads: 1,
  newLeadsTrend: '↑ 5% vs last month',
  followUpsDue: 0,
  followUpsDueTrend: null,
  convertedLeads: 0,
  convertedLeadsTrend: null,
  lastUpdated: '15 Mar 2025, 10:30 AM',
};

describe('LeadsPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(leadsService, 'getLeads').mockResolvedValue(mockLeads);
    vi.spyOn(leadsService, 'getSummary').mockResolvedValue(mockMetrics);
  });

  it('renders loading state initially', async () => {
    vi.spyOn(leadsService, 'getLeads').mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <LeadsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Leads')).toBeInTheDocument();
  });

  it('displays error banner with Retry button when API fails, and clicking retry reloads', async () => {
    const getLeadsSpy = vi.spyOn(leadsService, 'getLeads')
      .mockRejectedValueOnce(new Error('Network error loading leads'))
      .mockResolvedValueOnce(mockLeads);

    await act(async () => {
      render(
        <BrowserRouter>
          <LeadsPage />
        </BrowserRouter>
      );
    });

    const errorBanner = screen.getByRole('alert');
    expect(errorBanner).toHaveTextContent('Network error loading leads');

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await act(async () => {
      fireEvent.click(retryBtn);
    });

    expect(getLeadsSpy).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when no leads are returned', async () => {
    vi.spyOn(leadsService, 'getLeads').mockResolvedValue([]);

    await act(async () => {
      render(
        <BrowserRouter>
          <LeadsPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('No Leads Found')).toBeInTheDocument();
  });

  it('renders success state with live leads and server timestamp', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <LeadsPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Alpha Infotech')).toBeInTheDocument();
    expect(screen.getByText('Rohit Sharma')).toBeInTheDocument();
    expect(screen.queryByText(/Last Updated:/i)).not.toBeInTheDocument();
  });

  it('rolls back optimistic state when lead update fails', async () => {
    vi.spyOn(leadsService, 'updateLead').mockRejectedValueOnce(new Error('Server rejected lead update'));

    await act(async () => {
      render(
        <BrowserRouter>
          <LeadsPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Alpha Infotech')).toBeInTheDocument();

    // Open three-dot menu
    const actionBtn = screen.getByLabelText(/Actions for Alpha Infotech/i);
    await act(async () => {
      fireEvent.click(actionBtn);
    });

    // Three-dot menu displays View Details, Edit, and Delete options
    expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Edit$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Delete$/i })).toBeInTheDocument();

    // Click Edit option
    const editBtn = screen.getByRole('button', { name: /^Edit$/i });
    await act(async () => {
      fireEvent.click(editBtn);
    });

    // Save changes in Edit Lead modal
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Verify error notification appeared and previous leads retained
    await waitFor(() => {
      expect(screen.getByText(/Server rejected lead update/i)).toBeInTheDocument();
      expect(screen.getByText('Alpha Infotech')).toBeInTheDocument();
    });
  });

  it('opens View Details modal with complete lead info matching screenshot design', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <LeadsPage />
        </BrowserRouter>
      );
    });

    // Open three-dot menu
    const actionBtn = screen.getByLabelText(/Actions for Alpha Infotech/i);
    await act(async () => {
      fireEvent.click(actionBtn);
    });

    // Click View Details
    const viewBtn = screen.getByRole('button', { name: /view details/i });
    await act(async () => {
      fireEvent.click(viewBtn);
    });

    // Verify Lead Details modal content
    const modalDialog = screen.getByRole('dialog', { name: /Lead Details/i });
    expect(modalDialog).toBeInTheDocument();
    expect(within(modalDialog).getByText('View complete information for this lead.')).toBeInTheDocument();
    expect(within(modalDialog).getByText('Lead Information')).toBeInTheDocument();
    expect(within(modalDialog).getAllByText('Alpha Infotech').length).toBeGreaterThanOrEqual(1);
    expect(within(modalDialog).getByText('rohit@alphainfo.com')).toBeInTheDocument();
    expect(within(modalDialog).getByText('9876543210')).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByLabelText(/Close modal/i);
    await act(async () => {
      fireEvent.click(closeBtn);
    });
    expect(screen.queryByRole('dialog', { name: /Lead Details/i })).toBeNull();
  });

  it('opens Delete Lead confirmation modal, cancels and deletes properly', async () => {
    const deleteSpy = vi.spyOn(leadsService, 'deleteLead').mockResolvedValue(undefined);

    await act(async () => {
      render(
        <BrowserRouter>
          <LeadsPage />
        </BrowserRouter>
      );
    });

    // Open three-dot menu
    const actionBtn = screen.getByLabelText(/Actions for Alpha Infotech/i);
    await act(async () => {
      fireEvent.click(actionBtn);
    });

    // Click Delete option
    const deleteOption = screen.getByRole('button', { name: /^Delete$/i });
    await act(async () => {
      fireEvent.click(deleteOption);
    });

    // Confirmation dialog appears
    const deleteDialog = screen.getByRole('dialog', { name: /Delete Lead\?/i });
    expect(deleteDialog).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this lead\?/i)).toBeInTheDocument();

    // Click Cancel first
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    await act(async () => {
      fireEvent.click(cancelBtn);
    });
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Alpha Infotech')).toBeInTheDocument();

    // Reopen Delete and Confirm
    await act(async () => {
      fireEvent.click(actionBtn);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Delete$/i }));
    });

    const confirmDeleteBtn = screen.getByRole('button', { name: /^Delete Lead$/i });
    await act(async () => {
      fireEvent.click(confirmDeleteBtn);
    });

    expect(deleteSpy).toHaveBeenCalledWith('L-2025-001');
    expect(screen.queryByRole('dialog', { name: /Delete Lead\?/i })).toBeNull();
  });

  it('filters by Next Follow-up single date when selected from calendar', async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const targetDateStr = `${currentYear}-${currentMonth}-20`;

    const twoLeads: Lead[] = [
      {
        ...mockLeads[0],
        nextFollowUp: targetDateStr,
      },
      {
        id: 'L-2025-002',
        leadDate: '2025-03-16',
        company: 'Beta Solutions',
        contactName: 'Priya Patel',
        email: 'priya@betasolutions.com',
        phone: '9876543211',
        source: 'Referral',
        serviceInterest: 'AI Solutions',
        country: 'India',
        city: 'Mumbai',
        ownerId: 'EMP-002',
        stage: 'Qualified',
        status: 'Active',
        estimatedValue: 1500000,
        leadScore: 90,
        nextFollowUp: '2020-01-01',
      },
    ];
    vi.spyOn(leadsService, 'getLeads').mockResolvedValue(twoLeads);

    await act(async () => {
      render(
        <BrowserRouter>
          <LeadsPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Alpha Infotech')).toBeInTheDocument();
    expect(screen.getByText('Beta Solutions')).toBeInTheDocument();

    // Click Next Follow-up button to open single date picker
    const followUpBtn = screen.getByRole('button', { name: /filter by next follow-up/i });
    await act(async () => {
      fireEvent.click(followUpBtn);
    });

    // Verify calendar dialog is open
    const dialog = screen.getByRole('dialog', { name: /calendar date picker/i });
    expect(dialog).toBeInTheDocument();
    // Verify no "SELECT PERIOD" presets panel
    expect(screen.queryByText(/SELECT PERIOD/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /apply/i })).not.toBeInTheDocument();

    // Click day 20 in the calendar
    const day20Btn = screen.getAllByRole('button', { name: '20' })[0];
    await act(async () => {
      fireEvent.click(day20Btn);
    });

    // Calendar should immediately close
    expect(screen.queryByRole('dialog', { name: /calendar date picker/i })).not.toBeInTheDocument();

    // Only Alpha Infotech (nextFollowUp: 2025-03-20) should remain, Beta Solutions filtered out
    expect(screen.getByText('Alpha Infotech')).toBeInTheDocument();
    expect(screen.queryByText('Beta Solutions')).not.toBeInTheDocument();

    // Clear filters restores all leads
    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    await act(async () => {
      fireEvent.click(clearBtn);
    });

    expect(screen.getByText('Alpha Infotech')).toBeInTheDocument();
    expect(screen.getByText('Beta Solutions')).toBeInTheDocument();
  });
});
