import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ContractsPage } from '@/features/sales/pages/ContractsPage';
import { contractService } from '@/services/contractService';
import { masterDataService } from '@/services/masterDataService';

const todayYMD = new Date();
const currentY = todayYMD.getFullYear();
const currentM = String(todayYMD.getMonth() + 1).padStart(2, '0');
const currentMonth15 = `${currentY}-${currentM}-15`;

const sampleContracts = [
  {
    id: 1,
    contractId: 'C-2025-001',
    clientId: 'C-001',
    proposalId: 'P-2025-001',
    contractType: 'Service Agreement',
    startDate: currentMonth15,
    endDate: '2026-03-14',
    renewalDate: '2026-02-14',
    contractValue: 1200000,
    contractValueFormatted: '₹ 12,00,000',
    noticePeriod: 30,
    paymentTerms: 'Monthly',
    status: 'Active',
  },
];

const sampleSummary = {
  totalContracts: 1,
  totalContractsTrend: '↑ 14%',
  activeContracts: 1,
  activeContractsTrend: '↑ 8%',
  expiringContracts: 0,
  expiringContractsTrend: null,
  totalContractValue: 1200000,
  totalContractValueFormatted: '₹ 12,00,000',
  totalContractValueTrend: null,
};

describe('ContractsPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(contractService, 'getContracts').mockResolvedValue(sampleContracts as any);
    vi.spyOn(contractService, 'getSummary').mockResolvedValue(sampleSummary);
    vi.spyOn(masterDataService, 'getClients').mockResolvedValue([]);
    vi.spyOn(masterDataService, 'getEmployees').mockResolvedValue([]);
    vi.spyOn(masterDataService, 'getServices').mockResolvedValue([]);
  });

  it('renders loading state initially', async () => {
    vi.spyOn(contractService, 'getContracts').mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <ContractsPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Contracts' })).toBeInTheDocument();
  });

  it('displays error banner with Retry button when API fails, and clicking retry reloads', async () => {
    const getContractsSpy = vi.spyOn(contractService, 'getContracts')
      .mockRejectedValueOnce(new Error('Network error loading contracts'))
      .mockResolvedValueOnce(sampleContracts as any);

    await act(async () => {
      render(
        <BrowserRouter>
          <ContractsPage />
        </BrowserRouter>
      );
    });

    const errorBanner = screen.getByRole('alert');
    expect(errorBanner).toHaveTextContent('Network error loading contracts');

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await act(async () => {
      fireEvent.click(retryBtn);
    });

    expect(getContractsSpy).toHaveBeenCalledTimes(2);
  });

  it('renders empty state when no contracts match', async () => {
    vi.spyOn(contractService, 'getContracts').mockResolvedValue([]);

    await act(async () => {
      render(
        <BrowserRouter>
          <ContractsPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText(/no contracts yet/i)).toBeInTheDocument();
  });

  it('renders success state with KPI cards and table rows', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ContractsPage />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('C-2025-001')).toBeInTheDocument();
    expect(screen.getAllByText('Service Agreement').length).toBeGreaterThanOrEqual(1);
  });

  it('filters by Start Date, End Date, and Renewal Date single date calendar pickers', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ContractsPage />
        </BrowserRouter>
      );
    });

    // 1. Filter by Start Date
    const startDateBtn = screen.getByRole('button', { name: /Filter by Start Date/i });
    expect(startDateBtn).toBeInTheDocument();
    fireEvent.click(startDateBtn);

    // Dialog should open with SingleDatePicker (role="dialog" and name="Calendar Date Picker")
    const datePicker = screen.getByRole('dialog', { name: /Calendar Date Picker/i });
    expect(datePicker).toBeInTheDocument();
    expect(datePicker.className).toContain('w-[276px]');

    // Click date '15'
    const day15Btn = screen.getByRole('button', { name: '15' });
    fireEvent.click(day15Btn);

    // After clicking, dialog closes and contract with startDate 2025-03-15 matches
    expect(screen.queryByRole('dialog', { name: /Calendar Date Picker/i })).toBeNull();
    expect(screen.getByText('C-2025-001')).toBeInTheDocument();

    // 2. Clear filters restores
    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearBtn);
    expect(startDateBtn).toHaveTextContent(/Select date/i);
  });
});
