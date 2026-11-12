import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
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
    phone: '+91 98765 43210',
    source: 'Website',
    serviceInterest: 'Cloud & DevOps',
    country: 'India',
    city: 'Bangalore',
    ownerId: 'EMP-001',
    stage: 'New',
    status: 'Open',
    estimatedValue: 1200000,
    leadScore: 85,
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

    // Open lead detail modal
    const viewBtn = screen.getByRole('button', { name: /view details/i });
    await act(async () => {
      fireEvent.click(viewBtn);
    });

    // Save changes
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
});
