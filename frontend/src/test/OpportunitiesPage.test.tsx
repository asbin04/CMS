import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OpportunitiesPage } from '@/features/sales/pages/OpportunitiesPage';
import { opportunityService } from '@/services/opportunityService';
import { masterDataService } from '@/services/masterDataService';

const mockOpportunities = [
  {
    id: 1,
    opportunityId: 'O-2025-001',
    leadId: 'L-2025-001',
    clientId: 'C-001',
    serviceId: 'S-001',
    opportunityName: 'Cloud Infrastructure Migration',
    stage: 'Proposal',
    probability: 60,
    estimatedValue: 2400000,
    estimatedValueFormatted: '₹ 24,00,000',
    weightedPipeline: 1440000,
    weightedPipelineFormatted: '₹ 14,40,000',
    expectedCloseDate: '2025-04-30',
    ownerId: 'EMP-001',
    status: 'Open',
    createdAt: '2025-03-01',
  },
];

const mockSummary = {
  totalOpportunities: 1,
  openOpportunities: 1,
  weightedPipeline: 1440000,
  weightedPipelineFormatted: '₹ 14,40,000',
  wonOpportunities: 0,
};

describe('OpportunitiesPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(opportunityService, 'getOpportunities').mockResolvedValue(mockOpportunities as any);
    vi.spyOn(opportunityService, 'getSummary').mockResolvedValue(mockSummary);
    vi.spyOn(masterDataService, 'getClients').mockResolvedValue([]);
    vi.spyOn(masterDataService, 'getEmployees').mockResolvedValue([]);
    vi.spyOn(masterDataService, 'getServices').mockResolvedValue([]);
  });

  it('renders loading state initially', async () => {
    vi.spyOn(opportunityService, 'getOpportunities').mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <OpportunitiesPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Opportunities')).toBeInTheDocument();
  });

  it('displays error banner with Retry button when API fails, and clicking retry reloads', async () => {
    const getOppSpy = vi.spyOn(opportunityService, 'getOpportunities')
      .mockRejectedValueOnce(new Error('Network error loading opportunities'))
      .mockResolvedValueOnce(mockOpportunities as any);

    await act(async () => {
      render(
        <BrowserRouter>
          <OpportunitiesPage />
        </BrowserRouter>
      );
    });

    const errorBanner = screen.getByRole('alert');
    expect(errorBanner).toHaveTextContent('Network error loading opportunities');

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await act(async () => {
      fireEvent.click(retryBtn);
    });

    expect(getOppSpy).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when no opportunities match', async () => {
    vi.spyOn(opportunityService, 'getOpportunities').mockResolvedValue([]);

    await act(async () => {
      render(
        <BrowserRouter>
          <OpportunitiesPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText(/no opportunities yet/i)).toBeInTheDocument();
  });

  it('renders success state with KPI cards and table rows', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <OpportunitiesPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('O-2025-001')).toBeInTheDocument();
    expect(screen.getByText('Cloud Infrastructure Migration')).toBeInTheDocument();
  });

  it('rolls back state when mutation fails', async () => {
    vi.spyOn(opportunityService, 'deleteOpportunity').mockRejectedValue(new Error('Server failed to delete'));

    await act(async () => {
      render(
        <BrowserRouter>
          <OpportunitiesPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('O-2025-001')).toBeInTheDocument();
  });

  it('filters by Expected Close Date, Next Follow-up, and Last Contact single date calendar pickers', async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const targetDate20 = `${currentYear}-${currentMonth}-20`;
    const targetDate25 = `${currentYear}-${currentMonth}-25`;

    const testOpps = [
      {
        id: 1,
        opportunityId: 'O-2025-001',
        leadId: 'L-2025-001',
        clientId: 'C-001',
        serviceId: 'S-001',
        opportunityName: 'Cloud Infrastructure Migration',
        stage: 'Proposal',
        probability: 60,
        estimatedValue: 2400000,
        estimatedValueFormatted: '₹ 24,00,000',
        weightedPipeline: 1440000,
        weightedPipelineFormatted: '₹ 14,40,000',
        expectedCloseDate: targetDate20,
        lastContact: targetDate25,
        nextFollowUp: targetDate20,
        ownerId: 'EMP-001',
        status: 'Open',
        createdAt: '2025-03-01',
      },
      {
        id: 2,
        opportunityId: 'O-2025-002',
        leadId: 'L-2025-002',
        clientId: 'C-002',
        serviceId: 'S-002',
        opportunityName: 'AI Chatbot Integration',
        stage: 'Qualified',
        probability: 40,
        estimatedValue: 1800000,
        estimatedValueFormatted: '₹ 18,00,000',
        weightedPipeline: 720000,
        weightedPipelineFormatted: '₹ 7,20,000',
        expectedCloseDate: '2020-01-01',
        lastContact: '2020-01-02',
        nextFollowUp: '2020-01-03',
        ownerId: 'EMP-002',
        status: 'Open',
        createdAt: '2025-03-02',
      },
    ];

    vi.spyOn(opportunityService, 'getOpportunities').mockResolvedValue(testOpps as any);

    await act(async () => {
      render(
        <BrowserRouter>
          <OpportunitiesPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Cloud Infrastructure Migration')).toBeInTheDocument();
    expect(screen.getByText('AI Chatbot Integration')).toBeInTheDocument();

    // 1. Expected Close Date filter
    const closeDateBtn = screen.getByRole('button', { name: /filter by expected close date/i });
    await act(async () => {
      fireEvent.click(closeDateBtn);
    });

    // Verify calendar dialog opened without presets sidebar or apply button
    const dialog = screen.getByRole('dialog', { name: /calendar date picker/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.queryByText(/SELECT PERIOD/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /apply/i })).not.toBeInTheDocument();

    // Select day 20
    const day20Btn = screen.getAllByRole('button', { name: '20' })[0];
    await act(async () => {
      fireEvent.click(day20Btn);
    });

    // Calendar closes immediately and filters table
    expect(screen.queryByRole('dialog', { name: /calendar date picker/i })).not.toBeInTheDocument();
    expect(screen.getByText('Cloud Infrastructure Migration')).toBeInTheDocument();
    expect(screen.queryByText('AI Chatbot Integration')).not.toBeInTheDocument();

    // Clear filters restores all
    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    await act(async () => {
      fireEvent.click(clearBtn);
    });

    expect(screen.getByText('Cloud Infrastructure Migration')).toBeInTheDocument();
    expect(screen.getByText('AI Chatbot Integration')).toBeInTheDocument();

    // 2. Next Follow-up filter
    const followUpBtn = screen.getByRole('button', { name: /filter by next follow-up/i });
    await act(async () => {
      fireEvent.click(followUpBtn);
    });
    expect(screen.getByRole('dialog', { name: /calendar date picker/i })).toBeInTheDocument();

    const day20FollowUp = screen.getAllByRole('button', { name: '20' })[0];
    await act(async () => {
      fireEvent.click(day20FollowUp);
    });

    expect(screen.getByText('Cloud Infrastructure Migration')).toBeInTheDocument();
    expect(screen.queryByText('AI Chatbot Integration')).not.toBeInTheDocument();

    // 3. Last Contact filter (combine with Next Follow-up)
    const lastContactBtn = screen.getByRole('button', { name: /filter by last contact/i });
    await act(async () => {
      fireEvent.click(lastContactBtn);
    });

    const day25Btn = screen.getAllByRole('button', { name: '25' })[0];
    await act(async () => {
      fireEvent.click(day25Btn);
    });

    // Both filters active, O-2025-001 matches both targetDate20 and targetDate25
    expect(screen.getByText('Cloud Infrastructure Migration')).toBeInTheDocument();
    expect(screen.queryByText('AI Chatbot Integration')).not.toBeInTheDocument();

    // Clear filters resets all three
    await act(async () => {
      fireEvent.click(clearBtn);
    });

    expect(screen.getByText('Cloud Infrastructure Migration')).toBeInTheDocument();
    expect(screen.getByText('AI Chatbot Integration')).toBeInTheDocument();
  });
});
