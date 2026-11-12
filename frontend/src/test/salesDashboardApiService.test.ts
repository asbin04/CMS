import { describe, it, expect, vi, beforeEach } from 'vitest';
import { salesDashboardService } from '../features/sales-dashboard/services/salesDashboardService';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/apiEndpoints';

describe('SalesDashboardService Frontend-to-Backend Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. getDashboardData calls /reports/sales-dashboard with normalized period parameter', async () => {
    const mockResponse = {
      success: true,
      message: 'Sales dashboard retrieved successfully',
      data: {
        period: 'Apr 2024 - Mar 2025',
        lastUpdated: '11 Nov 2026, 04:33 PM',
        kpis: {
          totalLeads: 30,
          totalOpportunities: 8,
          totalProposalsValue: 47967000,
          formattedProposalsValue: '₹ 4,79,67,000.00',
          activeContracts: 24,
        },
        performance: {
          leads: {
            totalLeads: 30,
            openLeads: 26,
            wonLeads: 2,
            lostLeads: 2,
            leadWonPct: 6.67,
            formattedTotalLeads: '30.00',
            formattedOpenLeads: '26.00',
            formattedWonLeads: '2.00',
            formattedLeadWonPct: '6.67%',
          },
          opportunities: {
            totalOpportunities: 8,
            openOpportunities: 6,
            pipelineValue: 2500000,
            weightedPipeline: 1250000,
            wonOpportunityValue: 500000,
            formattedTotalOpportunities: '8.00',
            formattedOpenOpportunities: '6.00',
            formattedPipelineValue: '₹ 25,00,000.00',
            formattedWeightedPipeline: '₹ 12,50,000.00',
            formattedWonOpportunityValue: '₹ 5,00,000.00',
          },
          proposals: {
            totalProposalValue: 47967000,
            acceptedProposalValue: 21771000,
            proposalWinRate: 43.31,
            formattedTotalProposalValue: '₹ 4,79,67,000.00',
            formattedAcceptedProposalValue: '₹ 2,17,71,000.00',
            formattedProposalWinRate: '43.31%',
          },
          contracts: {
            activeContracts: 24,
            contractedValue: 18000000,
            formattedActiveContracts: '24.00',
            formattedContractedValue: '₹ 1,80,00,000.00',
          },
        },
        funnelStages: [
          { id: 'leads', label: 'LEADS', sublabel: 'LEADS', value: 30, color: '#4F46E5', textColor: '#FFF', subtextColor: '#E0E7FF' },
          { id: 'opportunities', label: 'OPPORTUNITIES', sublabel: 'OPPORTUNITIES', value: 8, color: '#717DF5', textColor: '#FFF', subtextColor: '#E0E7FF' },
          { id: 'proposals', label: 'PROPOSALS', sublabel: 'PROPOSALS', value: 44, color: '#9CA8F7', textColor: '#0F172A', subtextColor: '#334155' },
          { id: 'contracts', label: 'CONTRACTS', sublabel: 'CONTRACTS', value: 24, color: '#DCE4FD', textColor: '#0F172A', subtextColor: '#334155' },
        ],
        conversion: {
          leadToOpportunity: '26.67%',
          opportunityToProposal: '100.00%',
          proposalToContract: '54.55%',
          overallConversion: '26.67%',
          rawLeadToOpportunity: 26.67,
          rawOpportunityToProposal: 100.0,
          rawProposalToContract: 54.55,
          rawOverallConversion: 26.67,
        },
        workflowStages: [],
      },
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(mockResponse as any);

    const result = await salesDashboardService.getDashboardData('Apr 2024 - Mar 2025');

    expect(getSpy).toHaveBeenCalledWith(
      API_ENDPOINTS.REPORTS.SALES_DASHBOARD,
      { period: 'Apr 2024 - Mar 2025' }
    );
    expect(result.kpis.totalLeads).toBe(30);
    expect(result.conversion.opportunityToProposal).toBe('100.00%');
    expect(result.conversion.overallConversion).toBe('26.67%');
  });

  it('2. getDashboardData passes explicit startDate and endDate when provided in query params', async () => {
    const mockResponse = {
      success: true,
      message: 'Success',
      data: { period: 'Custom Range', kpis: { totalLeads: 15 } },
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(mockResponse as any);

    await salesDashboardService.getDashboardData({
      startDate: '2024-04-01',
      endDate: '2024-09-30',
      period: 'H1 2024',
    });

    expect(getSpy).toHaveBeenCalledWith(
      API_ENDPOINTS.REPORTS.SALES_DASHBOARD,
      { startDate: '2024-04-01', endDate: '2024-09-30', period: 'H1 2024' }
    );
  });

  it('3. getKpis, getPerformance, and getFunnel call their respective backend endpoints', async () => {
    const kpiSpy = vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url === API_ENDPOINTS.REPORTS.SALES_DASHBOARD_KPIS) {
        return { success: true, data: { totalLeads: 30, totalOpportunities: 8 } } as any;
      }
      if (url === API_ENDPOINTS.REPORTS.SALES_DASHBOARD_PERFORMANCE) {
        return { success: true, data: { leads: { totalLeads: 30 } } } as any;
      }
      if (url === API_ENDPOINTS.REPORTS.SALES_DASHBOARD_FUNNEL) {
        return { success: true, data: { stages: [], conversion: { overallConversion: '26.67%' } } } as any;
      }
      throw new Error(`Unexpected url: ${url}`);
    });

    const kpis = await salesDashboardService.getKpis('This Quarter');
    expect(kpis.totalLeads).toBe(30);

    const perf = await salesDashboardService.getPerformance('Last 30 Days');
    expect(perf.leads.totalLeads).toBe(30);

    const funnel = await salesDashboardService.getFunnel('All Period');
    expect(funnel.conversion.overallConversion).toBe('26.67%');

    expect(kpiSpy).toHaveBeenCalledTimes(3);
  });

  it('4. exportReport downloads CSV file via backend endpoint with authentication header', async () => {
    localStorage.setItem('auth_token', 'mock-valid-jwt');

    const csvContent = 'KALPANAAA CMS - Sales Performance\nPeriod,Apr 2024 - Mar 2025';
    const mockBlob = new Blob([csvContent], { type: 'text/csv' });

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => mockBlob,
    } as any);

    // Mock DOM download anchor
    const linkClickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      setAttribute: vi.fn(),
      style: {},
      click: linkClickSpy,
      remove: vi.fn(),
    } as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);

    await salesDashboardService.exportReport({ period: 'Apr 2024 - Mar 2025' });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(API_ENDPOINTS.REPORTS.SALES_DASHBOARD_EXPORT),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-valid-jwt',
        }),
      })
    );
    expect(linkClickSpy).toHaveBeenCalled();

    localStorage.removeItem('auth_token');
  });
});

