import { apiClient } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../services/api/apiEndpoints';
import { triggerNotificationRefresh } from '../../../services/notificationService';
import { Client, ClientsMetrics } from '../types/clients';

function mapClient(item: any): Client {
  return {
    id: item.id,
    clientCode: item.clientCode || item.client_code || `CL-${String(item.id || '').replace('C-', '')}`,
    clientName: item.clientName || item.client_name || 'Unnamed Client',
    companyName: item.companyName || item.company_name || 'Company Name',
    industry: item.industry || 'IT Services',
    contactPerson: item.contactPerson || item.contact_person || 'Contact Person',
    email: item.email || '',
    phone: item.phone || '',
    country: item.country || 'India',
    city: item.city || 'Bangalore',
    clientType: item.clientType || item.client_type || 'Enterprise',
    accountOwner: item.accountOwner || item.account_owner || '',
    status: item.status || 'Active',
    creditLimit: item.creditLimit || item.credit_limit || '₹ 10,00,000',
    onboardingDate: item.onboardingDate || item.onboarding_date || '15 Jan 2024',
    notes: item.notes || '',
    createdAt: item.createdAt || item.created_at,
    updatedAt: item.updatedAt || item.updated_at,
  };
}

export const clientsService = {
  async getClients(): Promise<Client[]> {
    const res = await apiClient.get<Client[]>(API_ENDPOINTS.CLIENTS_RESOURCE.BASE);
    const data = res.data || [];
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(mapClient);
  },

  async getClientById(id: string): Promise<Client> {
    const res = await apiClient.get<Client>(API_ENDPOINTS.CLIENTS_RESOURCE.BY_ID(id));
    return mapClient(res.data);
  },

  async createClient(client: Partial<Client>): Promise<Client> {
    const res = await apiClient.post<Client>(API_ENDPOINTS.CLIENTS_RESOURCE.BASE, client);
    triggerNotificationRefresh();
    return mapClient(res.data);
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const res = await apiClient.put<Client>(API_ENDPOINTS.CLIENTS_RESOURCE.BY_ID(id), updates);
    triggerNotificationRefresh();
    return mapClient(res.data);
  },

  async deleteClient(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CLIENTS_RESOURCE.BY_ID(id));
    triggerNotificationRefresh();
  },

  getMetrics(clients: Client[]): ClientsMetrics {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => String(c.status).toLowerCase() === 'active').length;
    const pendingClients = clients.filter((c) => String(c.status).toLowerCase() === 'pending').length;
    const newClients = pendingClients > 0
      ? pendingClients
      : clients.filter((c) => {
          const s = String(c.status).toLowerCase();
          return s === 'pending' || s === 'prospect';
        }).length;

    let totalCreditAmount = 0;
    for (const c of clients) {
      if (c.creditLimit) {
        const cleaned = String(c.creditLimit).replace(/[^\d]/g, '');
        if (cleaned) {
          totalCreditAmount += parseInt(cleaned, 10);
        }
      }
    }

    let formattedCreditLimit = '₹ 0';
    if (totalCreditAmount >= 10000000) {
      formattedCreditLimit = `₹ ${(totalCreditAmount / 10000000).toFixed(2)} Cr`;
    } else if (totalCreditAmount >= 100000) {
      formattedCreditLimit = `₹ ${(totalCreditAmount / 100000).toFixed(2)} Lakh`;
    } else if (totalCreditAmount > 0) {
      formattedCreditLimit = `₹ ${totalCreditAmount.toLocaleString('en-IN')}`;
    }

    return {
      totalClients,
      totalClientsTrend: '↑ 12% vs last month',
      activeClients,
      activeClientsTrend: '↑ 8% vs last month',
      newClients,
      newClientsTrend: '↑ 20% vs last month',
      totalCreditLimit: formattedCreditLimit,
      totalCreditLimitTrend: '↑ 18% vs last month',
    };
  },
};
