export type TransactionCheckClassification = 'CRITICAL' | 'REVIEW' | 'ACTION';

export interface TransactionControlRecord {
  id: string;
  primaryLabel: string;
  secondaryLabel?: string | null;
  date?: string | null;
  invoiceId?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  amount?: number | null;
  metricDisplay?: string | null;
  modeOrReference?: string | null;
  referenceSub?: string | null;
  status?: string | null;
  checkDetail: string;
  actionLabel: string;
  actionPath: string;
}

export interface TransactionControlCheck {
  id: string;
  control: string;
  description: string;
  classification: TransactionCheckClassification;
  count: number;
  actionLabel: string;
  actionPath: string;
  nested: boolean;
  statusFilterLabel: string;
  statusOptions: string[];
  records: TransactionControlRecord[];
}

export interface TransactionControlResponse {
  verificationAvailable: boolean;
  checkedAt?: string | null;
  defaultSelectedCheckId: string;
  checks: TransactionControlCheck[];
}

