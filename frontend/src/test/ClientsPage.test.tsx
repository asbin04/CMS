import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClientsPage } from '../features/clients/pages/ClientsPage';
import { clientsService } from '../features/clients/services/clientsService';
import { Client } from '../features/clients/types/clients';

const mockClients: Client[] = [
  {
    id: 'C-001',
    clientCode: 'CL-001',
    clientName: 'Acme Corporation',
    companyName: 'Acme Global Ltd',
    industry: 'IT Services',
    contactPerson: 'John Doe',
    email: 'john@acme.com',
    phone: '9876543210',
    country: 'India',
    city: 'Bangalore',
    clientType: 'Enterprise',
    accountOwner: 'Akshit Ujjain',
    status: 'Active',
    creditLimit: '₹ 10,00,000',
    onboardingDate: '2024-01-15',
    notes: 'Important enterprise client',
  },
  {
    id: 'C-002',
    clientCode: 'CL-002',
    clientName: 'Beta Technologies',
    companyName: 'Beta Tech Solutions',
    industry: 'Healthcare',
    contactPerson: 'Jane Smith',
    email: 'jane@betatech.com',
    phone: '9876543211',
    country: 'United States',
    city: 'Mumbai',
    clientType: 'SMB',
    accountOwner: 'Rohan Sharma',
    status: 'Pending',
    creditLimit: '₹ 5,00,000',
    onboardingDate: '2024-03-20',
    notes: 'Healthcare SMB',
  },
  {
    id: 'C-003',
    clientCode: 'CL-003',
    clientName: 'Gamma Industries',
    companyName: 'Gamma Logistics Pvt Ltd',
    industry: 'Logistics',
    contactPerson: 'Robert Brown',
    email: 'robert@gamma.com',
    phone: '9876543212',
    country: 'India',
    city: 'Delhi',
    clientType: 'Startup',
    accountOwner: 'Akshit Ujjain',
    status: 'Active',
    creditLimit: '₹ 2,00,000',
    onboardingDate: '2024-05-10',
    notes: 'Logistics startup',
  },
];

vi.mock('../features/clients/services/clientsService', () => ({
  clientsService: {
    getClients: vi.fn(),
    getMetrics: vi.fn((clients: Client[]) => ({
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === 'Active').length,
      newClients: clients.filter((c) => c.status === 'Pending').length,
      totalCreditLimit: '₹ 17,00,000',
    })),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
  },
}));

describe('ClientsPage Unified Filter & Table Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(clientsService.getClients).mockResolvedValue(mockClients);
  });

  it('renders unified filter and table layout matching Leads page specification', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsPage />
        </BrowserRouter>
      );
    });

    // Top Row: Search bar, Filters button, Clear Filters button
    expect(
      screen.getByPlaceholderText(/Search by client ID, client name, company, email or phone.../i)
    ).toBeDefined();
    const filtersBtn = screen.getByRole('button', { name: /^Filters$/i });
    const clearFiltersBtn = screen.getByRole('button', { name: /Clear Filters/i });
    expect(filtersBtn).toBeDefined();
    expect(clearFiltersBtn).toBeDefined();

    // Filter section: 7 fields (Status, Client Type, Industry, Country, City, Account Owner, Onboarding Date)
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('Client Type')).toBeDefined();
    expect(screen.getByText('Industry')).toBeDefined();
    expect(screen.getByText('Country')).toBeDefined();
    expect(screen.getByText('City')).toBeDefined();
    expect(screen.getByText('Account Owner')).toBeDefined();
    expect(screen.getByText('Onboarding Date')).toBeDefined();
    expect(screen.getByText('Select date range')).toBeDefined();

    // Table header section directly integrated within the unified card: dynamic Clients count, Sort by, Export button
    expect(screen.getByRole('heading', { name: /Clients \(3\)/i })).toBeDefined();
    expect(screen.getByText('Sort by')).toBeDefined();
    expect(screen.getByDisplayValue('Onboarding Date (Newest)')).toBeDefined();
    expect(screen.getByRole('button', { name: /Export/i })).toBeDefined();

    // Verify all 3 client rows are rendered
    expect(screen.getByText('Acme Corporation')).toBeDefined();
    expect(screen.getByText('Beta Technologies')).toBeDefined();
    expect(screen.getByText('Gamma Industries')).toBeDefined();
  });

  it('filters clients dynamically by search query and updates client count', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsPage />
        </BrowserRouter>
      );
    });

    const searchInput = screen.getByPlaceholderText(
      /Search by client ID, client name, company, email or phone.../i
    );

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Acme' } });
    });

    expect(screen.getByRole('heading', { name: /Clients \(1\)/i })).toBeDefined();
    expect(screen.getByText('Acme Corporation')).toBeDefined();
    expect(screen.queryByText('Beta Technologies')).toBeNull();
    expect(screen.queryByText('Gamma Industries')).toBeNull();
  });

  it('filters clients by status dropdown and resets with Clear Filters', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsPage />
        </BrowserRouter>
      );
    });

    // Target the Status select (first 'All' select)
    const allSelects = screen.getAllByDisplayValue('All');
    const statusSelect = allSelects[0];

    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'Pending' } });
    });

    expect(screen.getByRole('heading', { name: /Clients \(1\)/i })).toBeDefined();
    expect(screen.getByText('Beta Technologies')).toBeDefined();
    expect(screen.queryByText('Acme Corporation')).toBeNull();

    // Click Clear Filters
    const clearFiltersBtn = screen.getByRole('button', { name: /Clear Filters/i });
    await act(async () => {
      fireEvent.click(clearFiltersBtn);
    });

    expect(screen.getByRole('heading', { name: /Clients \(3\)/i })).toBeDefined();
    expect(screen.getByText('Acme Corporation')).toBeDefined();
    expect(screen.getByText('Beta Technologies')).toBeDefined();
    expect(screen.getByText('Gamma Industries')).toBeDefined();
  });

  it('toggles filter grid visibility with Filters button', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsPage />
        </BrowserRouter>
      );
    });

    const filtersBtn = screen.getByRole('button', { name: /^Filters$/i });
    expect(screen.getByText('Select date range')).toBeDefined();

    // Toggle off
    await act(async () => {
      fireEvent.click(filtersBtn);
    });
    expect(screen.queryByText('Select date range')).toBeNull();

    // Toggle on
    await act(async () => {
      fireEvent.click(filtersBtn);
    });
    expect(screen.getByText('Select date range')).toBeDefined();
  });

  it('renders consistent action menu button for each row and handles View Details and Edit', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <ClientsPage />
        </BrowserRouter>
      );
    });

    const actionBtns = screen.getAllByLabelText(/Actions for /i);
    expect(actionBtns.length).toBe(3);

    // Open first row action menu
    await act(async () => {
      fireEvent.click(actionBtns[0]);
    });

    expect(screen.getByRole('button', { name: /View Details/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Edit Client/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeDefined();
  });
});
