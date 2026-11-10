import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AmcSlaPage } from '../features/support/pages/AmcSlaPage';
import { amcSlaService } from '../features/support/services/amcSlaService';
import { AmcSlaContract } from '../features/support/types/amcSla';

const mockContracts: AmcSlaContract[] = [
  {
    id: 1,
    contractCode: 'AMC-0012',
    clientId: 'CL-001',
    clientName: 'Acme Corp',
    projectId: 'PRJ-001',
    projectName: 'Cloud ERP Migration',
    serviceType: 'Application Support',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    renewalDate: '2027-03-15',
    contractValue: 2400000,
    responseSla: '2 hrs',
    resolutionSla: '12 hrs',
    coverageHours: '24/7 Support',
    status: 'Active',
    penaltyClause: 'Applicable (5%)',
    renewalAlert: 'Normal',
    assignedManager: 'Rahul Sharma',
    notes: 'Full stack enterprise ERP support and maintenance.',
  },
  {
    id: 2,
    contractCode: 'SLA-0009',
    clientId: 'CL-003',
    clientName: 'Apex Financial',
    projectId: 'PRJ-002',
    projectName: 'Mobile Banking App',
    serviceType: 'Infrastructure Support',
    startDate: '2026-02-10',
    endDate: '2027-02-09',
    renewalDate: '2027-01-25',
    contractValue: 3600000,
    responseSla: '1 hr',
    resolutionSla: '8 hrs',
    coverageHours: '24x7 Mission Critical',
    status: 'Active',
    penaltyClause: 'Standard SLA Penalty',
    renewalAlert: 'Expiring (≤ 30 Days)',
    assignedManager: 'Sneha Rao',
    notes: 'High availability cloud infrastructure monitoring.',
  },
  {
    id: 3,
    contractCode: 'AMC-0011',
    clientId: 'CL-002',
    clientName: 'Global Logistics',
    projectId: 'PRJ-003',
    projectName: 'Payment Gateway Integration',
    serviceType: 'Managed Services',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    renewalDate: '2026-12-15',
    contractValue: 4800000,
    responseSla: '2 hrs',
    resolutionSla: '16 hrs',
    coverageHours: '12x6 Business Hours',
    status: 'Active',
    penaltyClause: '2% per day',
    renewalAlert: 'Renewal Overdue',
    assignedManager: 'Vikram Malhotra',
    notes: 'Continuous DevOps and container platform management.',
  },
];

describe('AmcSlaPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(amcSlaService, 'getContracts').mockResolvedValue(mockContracts);
    vi.spyOn(amcSlaService, 'getKpis').mockResolvedValue({
      totalContracts: 48,
      activeContracts: 38,
      expiringContracts: 6,
      renewalOverdueContracts: 2,
      totalContractValue: 248500,
      formattedContractValue: '₹ 2,48,500',
      renewalDue30Days: 6,
      upcoming31to90Days: 10,
      overdueRenewals: 2,
      greater90Days: 12,
    });
    vi.spyOn(amcSlaService, 'getFilterOptions').mockResolvedValue({
      serviceTypes: [
        'Application Support',
        'Infrastructure Support',
        'Managed Services',
        'Technical Support',
        'AMC (Overall)',
      ],
      statuses: ['Active', 'Expiring', 'Expired', 'Terminated'],
      renewalAlerts: ['Expiring (≤ 30 Days)', 'Renewal Overdue', 'Normal'],
      owners: ['Rahul Sharma', 'Sneha Rao', 'Vikram Malhotra', 'Amit Sharma', 'Divya Patel'],
      renewalWindows: ['Overdue', '≤ 30 Days', '31 – 90 Days', '> 90 Days'],
    });
  });

  it('renders header, title, and buttons properly', async () => {
    render(<AmcSlaPage />);

    expect(screen.getByRole('heading', { name: 'AMC / SLA' })).toBeInTheDocument();
    expect(
      screen.getByText('Manage Annual Maintenance Contracts (AMC) and Service Level Agreements (SLA).')
    ).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('+ Create AMC / SLA')).toBeInTheDocument();
  });

  it('renders all 5 KPI cards with live values', async () => {
    render(<AmcSlaPage />);

    const kpiSection = screen.getByTestId('amc-kpi-cards');
    await waitFor(() => {
      expect(kpiSection).toHaveTextContent('Total Contracts');
      expect(kpiSection).toHaveTextContent('48');
      expect(kpiSection).toHaveTextContent('Active Contracts');
      expect(kpiSection).toHaveTextContent('38');
      expect(kpiSection).toHaveTextContent('Expiring (≤ 30 Days)');
      expect(kpiSection).toHaveTextContent('6');
      expect(kpiSection).toHaveTextContent('Renewal Overdue');
      expect(kpiSection).toHaveTextContent('2');
      expect(kpiSection).toHaveTextContent('Total Contract Value');
      expect(kpiSection).toHaveTextContent('₹ 2,48,500');
    });
  });

  it('renders table headers and data rows', async () => {
    render(<AmcSlaPage />);

    await waitFor(() => {
      expect(screen.getByText('AMC-0012')).toBeInTheDocument();
      expect(screen.getByText('SLA-0009')).toBeInTheDocument();
      expect(screen.getByText('AMC-0011')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Application Support').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Infrastructure Support').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Managed Services').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('₹ 24,00,000')).toBeInTheDocument();
    expect(screen.getByText('₹ 36,00,000')).toBeInTheDocument();
  });

  it('toggles filter dropdowns when Filters button is clicked', async () => {
    render(<AmcSlaPage />);

    // Initially open
    expect(screen.getByTestId('filter-dropdowns-row')).toBeInTheDocument();

    // Click Filters button to collapse
    const filterBtn = screen.getByRole('button', { name: /^filters$/i });
    fireEvent.click(filterBtn);
    expect(screen.queryByTestId('filter-dropdowns-row')).not.toBeInTheDocument();

    // Click Filters button again to re-open
    fireEvent.click(filterBtn);
    expect(screen.getByTestId('filter-dropdowns-row')).toBeInTheDocument();
  });

  it('clears filters when Clear Filters button is clicked', async () => {
    render(<AmcSlaPage />);

    const searchInput = screen.getByPlaceholderText('Search by AMC / SLA ID, Client, Project, or Notes...');
    fireEvent.change(searchInput, { target: { value: 'Acme' } });
    expect(searchInput).toHaveValue('Acme');

    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    fireEvent.click(clearBtn);

    expect(searchInput).toHaveValue('');
  });

  it('switches tabs between AMC / SLA and Renewals & Alerts and renders dedicated renewals dashboard', async () => {
    render(<AmcSlaPage />);

    await waitFor(() => {
      expect(screen.getByText('AMC-0012')).toBeInTheDocument();
    });

    const renewalsTab = screen.getByRole('button', { name: /renewals & alerts/i });
    fireEvent.click(renewalsTab);

    // In renewals tab, verify Renewals & Alerts KPI cards, Timeline chart, and Alerts card appear
    await waitFor(() => {
      expect(screen.getByTestId('amc-renewals-kpi-cards')).toBeInTheDocument();
      expect(screen.getByText('Renewal Due (≤ 30 Days)')).toBeInTheDocument();
      expect(screen.getByText('Upcoming (31 – 90 Days)')).toBeInTheDocument();
      expect(screen.getByText('Overdue Renewals')).toBeInTheDocument();
      expect(screen.getByText('Renewal Timeline')).toBeInTheDocument();
      expect(screen.getByText('Renewal Alerts')).toBeInTheDocument();
    });

    // In renewals table, all contract rows are rendered with their renewal metrics
    expect(screen.getByText('AMC-0012')).toBeInTheDocument();
    expect(screen.getByText('SLA-0009')).toBeInTheDocument();
    expect(screen.getByText('AMC-0011')).toBeInTheDocument();
  });

  it('opens and closes create contract modal', async () => {
    render(<AmcSlaPage />);

    const createBtn = screen.getByRole('button', { name: /\+ create amc \/ sla/i });
    fireEvent.click(createBtn);

    expect(screen.getByRole('heading', { name: 'Create AMC / SLA Contract' })).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole('heading', { name: 'Create AMC / SLA Contract' })).not.toBeInTheDocument();
  });
});
