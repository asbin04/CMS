import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DeploymentPage } from '@/features/projects/pages/DeploymentPage';
import {
  deploymentService,
  INITIAL_DEPLOYMENT_ITEMS,
  INITIAL_DEPLOYMENT_KPIS,
} from '@/features/projects/services/deploymentService';

describe('DeploymentPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(deploymentService, 'getDeployments').mockResolvedValue(INITIAL_DEPLOYMENT_ITEMS);
    vi.spyOn(deploymentService, 'getKpis').mockResolvedValue(INITIAL_DEPLOYMENT_KPIS);
    vi.spyOn(deploymentService, 'getFilterOptions').mockResolvedValue({
      environments: ['Production', 'Staging', 'UAT', 'QA'],
      deploymentStatuses: ['Successful', 'Failed', 'In-Progress'],
      handoverStatuses: ['Handed Over', 'Pending'],
      projects: ['PRJ-001', 'PRJ-002', 'PRJ-003', 'PRJ-004', 'PRJ-005'],
    });
  });

  it('renders exact header title and subtitle from Figma specification', async () => {
    render(
      <BrowserRouter>
        <DeploymentPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Deployment / Go-Live' })).toBeInTheDocument();
    expect(
      screen.getByText('Track and manage releases, deployments, go-live activities and handover status.')
    ).toBeInTheDocument();
  });

  it('renders all 5 KPI cards with exact values', async () => {
    render(
      <BrowserRouter>
        <DeploymentPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // 1. Total Deployments: 124
      expect(screen.getByText('Total Deployments')).toBeInTheDocument();
      expect(screen.getByText('124')).toBeInTheDocument();

      // 2. Successful Deployments: 109
      expect(screen.getByText('Successful Deployments')).toBeInTheDocument();
      expect(screen.getByText('109')).toBeInTheDocument();

      // 3. Failed Deployments: 6
      expect(screen.getByText('Failed Deployments')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();

      // 4. Go-Live Completed: 98
      expect(screen.getByText('Go-Live Completed')).toBeInTheDocument();
      expect(screen.getByText('98')).toBeInTheDocument();

      // 5. Handover Pending: 12
      expect(screen.getByText('Handover Pending')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  it('renders all 16 table columns and top deployment row correctly', async () => {
    render(
      <BrowserRouter>
        <DeploymentPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // 16 Column Headers
      expect(screen.getByRole('columnheader', { name: 'Deployment ID' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Project ID' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Release Version' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Deployment Date' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Environment' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Deployment Owner' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Pre-Deployment Checklist' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Backup Completed' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Rollback Plan' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Deployment Status' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Smoke Test' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Client Confirmation' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Go-Live Date' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Handover Status' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Issues / Notes' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();

      // Top Row Elements
      expect(screen.getByText('DEP-2026-0186')).toBeInTheDocument();
      expect(screen.getByText('v2.4.0')).toBeInTheDocument();
      expect(screen.getAllByText('Amit Sharma').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('DEP-2028-0185')).toBeInTheDocument();
      expect(screen.getByText('Go-live successful')).toBeInTheDocument();
    });
  });

  it('filters deployments when typing into search input', async () => {
    render(
      <BrowserRouter>
        <DeploymentPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('DEP-2026-0186')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by Deployment ID, Project ID, Release Version...');
    fireEvent.change(searchInput, { target: { value: 'DEP-2028-0185' } });

    await waitFor(() => {
      expect(deploymentService.getDeployments).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'DEP-2028-0185' })
      );
    });
  });

  it('opens add deployment modal on button click and submits new deployment', async () => {
    vi.spyOn(deploymentService, 'createDeployment').mockResolvedValue({
      id: 'DEP-2026-0187',
      projectId: 'PRJ-001',
      releaseVersion: 'v2.5.0',
      deploymentDate: '29 Oct 2026',
      environment: 'Production',
      deploymentOwner: 'Amit Sharma',
      preDeploymentChecklist: 'Completed',
      backupCompleted: 'Yes',
      rollbackPlan: 'Available',
      smokeTest: 'Successful',
      status: 'Live',
      clientSignOff: 'Completed',
      goLiveDate: '29 Oct 2026',
      handoverStatus: 'Handed Over',
      releaseNotes: 'New feature launch',
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <DeploymentPage />
        </BrowserRouter>
      );
    });

    const addButton = screen.getByRole('button', { name: /Add Deployment/i });
    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(screen.getByText('Add Deployment / Release')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Create Deployment/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(deploymentService.createDeployment).toHaveBeenCalled();
    });
  });
});
