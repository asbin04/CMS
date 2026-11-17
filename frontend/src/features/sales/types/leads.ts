export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'LinkedIn'
  | 'Event'
  | 'Cold Call'
  | 'Partner'
  | 'Social Media'
  | 'Other';

export type ServiceInterest =
  | 'Web Development'
  | 'Mobile App'
  | 'AI Solutions'
  | 'ERP Solution'
  | 'E-commerce'
  | 'Digital Marketing'
  | 'Cloud & DevOps'
  | 'Custom Software'
  | 'UI/UX Design'
  | 'Cybersecurity';

export type LeadStage =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type LeadStatus =
  | 'Open'
  | 'In Progress'
  | 'Active'
  | 'Follow-up Required'
  | 'Converted'
  | 'Archived'
  | 'On Hold'
  | 'Lost';

export interface Lead {
  id: string; // Server-generated lead ID, e.g. "L-YYYY-NNN"
  leadDate: string; // ISO date string e.g. "2025-03-15"
  company: string;
  contactName: string;
  email: string;
  phone: string;
  source: LeadSource | string;
  serviceInterest: ServiceInterest | string;
  country: string;
  city: string;
  ownerId: string;
  stage: LeadStage | string;
  status: LeadStatus | string;
  leadScore?: number | null;
  expectedValue?: number | string | null;
  expectedCloseDate?: string | null;
  nextFollowUp?: string | null;
  estimatedValue?: number | string | null;
  lostReason?: string | null;
  notes?: string | null;
  confirmTypoDomain?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadsMetrics {
  totalLeads: number;
  totalLeadsTrend?: string | null;
  newLeads: number;
  newLeadsTrend?: string | null;
  followUpsDue: number;
  followUpsDueTrend?: string | null;
  convertedLeads: number;
  convertedLeadsTrend?: string | null;
  lastUpdated?: string | null;
}

export interface LeadSummaryDto {
  totalLeads: number;
  newThisMonth: number;
  followUpsDue: number;
  convertedLeads: number;
  totalLeadsMoM: number | null;
  newLeadsMoM: number | null;
  followUpsDueMoM: number | null;
  convertedMoM: number | null;
  lastUpdated?: string;
}

export interface LeadsFilterState {
  searchQuery: string;
  leadDateRange: string;
  source: string;
  serviceInterest: string;
  country: string;
  city: string;
  ownerId: string;
  stage: string;
  status: string;
  nextFollowUpDateRange: string;
}

export type LeadSortOption =
  | 'date-desc'
  | 'date-asc'
  | 'company-asc'
  | 'company-desc'
  | 'contact-asc'
  | 'id-desc';
