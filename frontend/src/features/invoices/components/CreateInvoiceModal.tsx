import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  IdCard,
  CircleDollarSign,
  Settings,
  MessageSquare,
  Calendar,
  ChevronDown,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { InvoiceRecord, InvoiceAgingBucket, InvoiceCollectionStatus, InvoiceStatus } from '../types';
import { formatDateForInput, calculateDaysOverdue, calculateAgingBucket } from '../utils';
import { invoicesApiService, CreateInvoicePayload } from '../invoicesApiService';
import { clientsService } from '../../clients/services/clientsService';
import { apiClient } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../services/api/apiEndpoints';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newInvoice: InvoiceRecord) => void;
  suggestedId: string;
}

interface ClientOption {
  id: string;
  name: string;
}

interface DropdownOption {
  id: string;
  name: string;
}

// Fallback clients if backend query is offline or loading
const DEFAULT_CLIENTS: ClientOption[] = [
  { id: 'CL-001', name: 'Tata Consultancy Services' },
  { id: 'CL-002', name: 'Reliance Industries' },
  { id: 'CL-003', name: 'Infosys Technologies' },
  { id: 'CL-004', name: 'Wipro Technologies' },
  { id: 'CL-005', name: 'HCL Technologies' },
  { id: 'CL-006', name: 'Tech Mahindra' },
  { id: 'CL-007', name: 'L&T Infotech' },
  { id: 'CL-008', name: 'Mindtree Solutions' },
];

const DEFAULT_PROJECTS: DropdownOption[] = [
  { id: 'PRJ-001', name: 'Enterprise Cloud Portal' },
  { id: 'PRJ-002', name: 'Core ERP Modernization' },
  { id: 'PRJ-003', name: 'Fintech Data Pipeline' },
  { id: 'PRJ-004', name: 'Supply Chain Intelligence' },
  { id: 'PRJ-005', name: 'AI Analytics Engine' },
  { id: 'PRJ-006', name: 'Security & Compliance Suite' },
];

const DEFAULT_CONTRACTS: DropdownOption[] = [
  { id: 'CON-001', name: 'Annual Maintenance Master Agreement' },
  { id: 'CON-002', name: 'Dedicated Agile Team Retainer' },
  { id: 'CON-003', name: 'Time & Materials Work Order' },
  { id: 'CON-004', name: 'Fixed Price Milestone Agreement' },
  { id: 'CON-005', name: 'Cloud Infrastructure Support' },
  { id: 'CON-006', name: 'Staff Augmentation SOW' },
];

const formatFriendlyDate = (isoDateStr: string): string => {
  if (!isoDateStr) return '';
  const parts = isoDateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
  const d = new Date(isoDateStr);
  return isNaN(d.getTime()) ? isoDateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  suggestedId,
}) => {
  // Section 1: Invoice Information
  const [invoiceId, setInvoiceId] = useState(suggestedId || 'INV-2026-0001');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);

  // Section 2: Reference Details
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [contractId, setContractId] = useState('');
  const [clientOptions, setClientOptions] = useState<ClientOption[]>(DEFAULT_CLIENTS);
  const [projectOptions] = useState<DropdownOption[]>(DEFAULT_PROJECTS);
  const [contractOptions, setContractOptions] = useState<DropdownOption[]>(DEFAULT_CONTRACTS);

  // Section 3: Amount Details
  const [amountBeforeTax, setAmountBeforeTax] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [hasCustomTax, setHasCustomTax] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');

  // Section 4: Status & Tracking
  const [status, setStatus] = useState<string>('');
  const [daysOverdue, setDaysOverdue] = useState<number>(0);
  const [agingBucket, setAgingBucket] = useState<string>('');
  const [collectionStatus, setCollectionStatus] = useState<string>('');

  // Section 5: Additional Information
  const [notes, setNotes] = useState('');

  // Submission & UI States
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize on modal open
  useEffect(() => {
    if (isOpen) {
      setInvoiceId(suggestedId || 'INV-2026-0001');
      invoicesApiService.getNextInvoiceId().then((res) => {
        if (res && res.nextInvoiceId) {
          setInvoiceId(res.nextInvoiceId);
        }
      }).catch(() => {});

      // Fetch live clients
      clientsService.getClients().then((cls) => {
        if (cls && cls.length > 0) {
          setClientOptions(
            cls.map((c) => ({
              id: c.clientCode || c.id,
              name: c.clientName || c.companyName || c.id,
            }))
          );
        }
      }).catch(() => {});

      // Fetch live contracts
      apiClient.get<any[]>(API_ENDPOINTS.CONTRACTS.BASE).then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setContractOptions(
            res.data.map((ct: any) => ({
              id: ct.contractId || `CON-${ct.id}`,
              name: ct.contractType ? `${ct.contractId || ct.id} (${ct.contractType})` : ct.contractId || ct.id,
            }))
          );
        }
      }).catch(() => {});

      const today = new Date();
      const todayIso = today.toISOString().split('T')[0];
      setInvoiceDate(todayIso);

      const due = new Date(today);
      due.setDate(due.getDate() + 30);
      setDueDate(due.toISOString().split('T')[0]);

      setPaymentTermsDays(30);
      setClientId('');
      setClientName('');
      setProjectId('');
      setContractId('');
      setAmountBeforeTax('');
      setTaxAmount('');
      setHasCustomTax(false);
      setPaidAmount('');
      setStatus('');
      setDaysOverdue(0);
      setAgingBucket('');
      setCollectionStatus('');
      setNotes('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, suggestedId]);

  // Derived financial numbers
  const numBeforeTax = Math.max(0, parseFloat(amountBeforeTax.replace(/,/g, '')) || 0);
  const numTax = Math.max(0, parseFloat(taxAmount.replace(/,/g, '')) || 0);
  const totalAmount = numBeforeTax + numTax;
  const numPaid = Math.max(0, parseFloat(paidAmount.replace(/,/g, '')) || 0);
  const outstandingAmount = Math.max(0, totalAmount - numPaid);
  const outstandingValue: 'Yes' | 'No' = outstandingAmount > 0 ? 'Yes' : 'No';

  // Auto-calculate Due Date when Invoice Date or Payment Terms change
  const handleDateOrTermsChange = (newDateStr: string, newTerms: number) => {
    if (newDateStr && !isNaN(newTerms)) {
      const parts = newDateStr.split('-');
      if (parts.length === 3) {
        const base = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(base.getTime())) {
          base.setDate(base.getDate() + Number(newTerms));
          const y = base.getFullYear();
          const m = String(base.getMonth() + 1).padStart(2, '0');
          const d = String(base.getDate()).padStart(2, '0');
          const calculatedDue = `${y}-${m}-${d}`;
          setDueDate(calculatedDue);
          updateDerivedTracking(calculatedDue);
        }
      }
    }
  };

  // Auto update Days Overdue and Aging Bucket based on Due Date
  const updateDerivedTracking = (dueStr: string) => {
    if (!dueStr) {
      setDaysOverdue(0);
      setAgingBucket('Current');
      return;
    }
    const overdue = calculateDaysOverdue(dueStr);
    setDaysOverdue(overdue);
    setAgingBucket(calculateAgingBucket(overdue, dueStr));
  };

  // Amount Before Tax change
  const handleAmountBeforeTaxChange = (raw: string) => {
    setAmountBeforeTax(raw);
    const parsed = parseFloat(raw.replace(/,/g, ''));
    if (!isNaN(parsed) && parsed >= 0) {
      if (!hasCustomTax) {
        const standardTax = Math.round(parsed * 0.18);
        setTaxAmount(String(standardTax));
      }
    } else if (!hasCustomTax) {
      setTaxAmount('');
    }
  };

  // Tax Amount change
  const handleTaxAmountChange = (raw: string) => {
    setTaxAmount(raw);
    setHasCustomTax(true);
  };

  // Client Selection
  const handleClientChange = (cId: string) => {
    setClientId(cId);
    const found = clientOptions.find((c) => c.id === cId);
    setClientName(found ? found.name : cId);
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceId.trim()) {
      setError('Invoice ID is required.');
      return;
    }
    if (!invoiceDate) {
      setError('Invoice Date is required.');
      return;
    }
    if (!dueDate) {
      setError('Due Date is required.');
      return;
    }
    if (!clientId.trim()) {
      setError('Client ID is required.');
      return;
    }
    if (!amountBeforeTax.trim() || isNaN(numBeforeTax) || numBeforeTax < 0) {
      setError('Please enter a valid Amount Before Tax.');
      return;
    }
    if (!taxAmount.trim() || isNaN(numTax) || numTax < 0) {
      setError('Please enter a valid Tax Amount.');
      return;
    }
    if (numPaid > totalAmount) {
      setError(`Paid amount (₹ ${numPaid.toLocaleString('en-IN')}) cannot exceed total invoice amount (₹ ${totalAmount.toLocaleString('en-IN')}).`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Determine effective backend status values
      const effectiveInvoiceStatus: InvoiceStatus =
        (status as InvoiceStatus) ||
        (outstandingAmount <= 0 ? 'Paid' : numPaid > 0 ? 'Partially Paid' : 'Unpaid');

      const effectiveCollectionStatus: InvoiceCollectionStatus =
        (collectionStatus as InvoiceCollectionStatus) ||
        (outstandingAmount <= 0
          ? 'Completed'
          : daysOverdue > 0
          ? 'Follow Up'
          : numPaid > 0
          ? 'In Progress'
          : 'Pending');

      const payload: CreateInvoicePayload = {
        invoiceId: invoiceId.trim(),
        clientId: clientId.trim(),
        client: clientName.trim() || clientId.trim(),
        clientName: clientName.trim() || clientId.trim(),
        projectId: projectId.trim() || undefined,
        contractId: contractId.trim() || undefined,
        invoiceDate: formatDateForInput(invoiceDate),
        dueDate: formatDateForInput(dueDate),
        amountBeforeTax: numBeforeTax,
        taxRate: numBeforeTax > 0 ? Math.round((numTax / numBeforeTax) * 100) : 18,
        taxAmount: numTax,
        invoiceAmount: totalAmount,
        paymentTermsDays: Number(paymentTermsDays) || 30,
        notes: notes.trim(),
        statusOverride: effectiveInvoiceStatus,
      };

      const created = await invoicesApiService.createInvoice(payload);

      // If initial payment was provided at creation, record it via Collections Payment API
      if (numPaid > 0) {
        try {
          const targetInvoiceId = created.invoiceId || invoiceId.trim();
          await invoicesApiService.recordPayment(targetInvoiceId, {
            amount: numPaid,
            paymentDate: formatDateForInput(invoiceDate),
            paymentMethod: 'Bank Transfer',
            referenceId: `INIT-${targetInvoiceId}`,
            notes: 'Initial payment recorded during invoice creation',
          });
        } catch {
          // Non-blocking: invoice was created successfully
        }
      }

      onSave(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice. Please verify all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-[94%] sm:w-[92%] max-w-[1150px] max-h-[96vh] shadow-2xl border border-[#F1F5F9] my-auto transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-3.5 pb-2 border-b border-[#F1F5F9] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5] shrink-0">
              <FileText className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight m-0">Create Invoice</h2>
              <p className="text-xs text-gray-500 m-0 mt-0.5">
                Add a new invoice with client, project, contract and payment details.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="px-6 py-2.5 space-y-2.5 overflow-y-auto max-h-[calc(96vh-115px)] lg:overflow-visible">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* SECTION 1: Invoice Information                            */}
            {/* ========================================================= */}
            <div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] rounded-md mb-1.5">
                <FileText className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                <span className="text-xs font-semibold text-slate-800">Invoice Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Invoice ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Invoice ID <span className="text-red-500 font-normal">*</span>
                  </label>
                  <input
                    type="text"
                    value={invoiceId}
                    readOnly
                    className="w-full h-9 px-2.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden cursor-not-allowed"
                  />
                </div>

                {/* 2. Invoice Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Invoice Date <span className="text-red-500 font-normal">*</span>
                  </label>
                  <div className="relative flex items-center h-9 px-2.5 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <Calendar className="w-3.5 h-3.5 text-[#6366F1] mr-2 shrink-0 pointer-events-none" />
                    <span className={`text-xs font-medium ${invoiceDate ? 'text-slate-800' : 'text-slate-400'}`}>
                      {invoiceDate ? formatFriendlyDate(invoiceDate) : 'Select date'}
                    </span>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => {
                        setInvoiceDate(e.target.value);
                        handleDateOrTermsChange(e.target.value, paymentTermsDays);
                      }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* 3. Due Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Due Date <span className="text-red-500 font-normal">*</span>
                  </label>
                  <div className="relative flex items-center h-9 px-2.5 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <Calendar className="w-3.5 h-3.5 text-[#6366F1] mr-2 shrink-0 pointer-events-none" />
                    <span className={`text-xs font-medium ${dueDate ? formatFriendlyDate(dueDate) : 'text-slate-400'}`}>
                      {dueDate ? formatFriendlyDate(dueDate) : 'Select date'}
                    </span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        updateDerivedTracking(e.target.value);
                      }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* 4. Payment Terms Days */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Payment Terms Days <span className="text-red-500 font-normal">*</span>
                  </label>
                  <div className="relative flex items-center h-9 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <input
                      type="number"
                      min="0"
                      value={paymentTermsDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const safeVal = isNaN(val) ? 0 : val;
                        setPaymentTermsDays(safeVal);
                        handleDateOrTermsChange(invoiceDate, safeVal);
                      }}
                      className="w-full h-full pl-2.5 pr-11 text-xs text-slate-800 font-medium bg-transparent focus:outline-hidden"
                      required
                    />
                    <span className="absolute right-2.5 text-xs text-slate-400 pointer-events-none">days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 2: Reference Details                              */}
            {/* ========================================================= */}
            <div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] rounded-md mb-1.5">
                <IdCard className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                <span className="text-xs font-semibold text-slate-800">Reference Details</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Client ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Client ID <span className="text-red-500 font-normal">*</span>
                  </label>
                  <div className="relative flex items-center h-9 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <select
                      value={clientId}
                      onChange={(e) => handleClientChange(e.target.value)}
                      className={`w-full h-full pl-2.5 pr-8 text-xs font-medium bg-transparent appearance-none focus:outline-hidden cursor-pointer ${
                        clientId ? 'text-slate-800' : 'text-slate-400'
                      }`}
                      required
                    >
                      <option value="" disabled>
                        Select client
                      </option>
                      {clientOptions.map((c) => (
                        <option key={c.id} value={c.id} className="text-slate-800">
                          {c.id} ({c.name})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none shrink-0" />
                  </div>
                </div>

                {/* 2. Project ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Project ID
                  </label>
                  <div className="relative flex items-center h-9 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className={`w-full h-full pl-2.5 pr-8 text-xs font-medium bg-transparent appearance-none focus:outline-hidden cursor-pointer ${
                        projectId ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      <option value="">Select project</option>
                      {projectOptions.map((p) => (
                        <option key={p.id} value={p.id} className="text-slate-800">
                          {p.id} ({p.name})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none shrink-0" />
                  </div>
                </div>

                {/* 3. Contract ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Contract ID
                  </label>
                  <div className="relative flex items-center h-9 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <select
                      value={contractId}
                      onChange={(e) => setContractId(e.target.value)}
                      className={`w-full h-full pl-2.5 pr-8 text-xs font-medium bg-transparent appearance-none focus:outline-hidden cursor-pointer ${
                        contractId ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      <option value="">Select contract</option>
                      {contractOptions.map((c) => (
                        <option key={c.id} value={c.id} className="text-slate-800">
                          {c.id} ({c.name})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 3: Amount Details                                 */}
            {/* ========================================================= */}
            <div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] rounded-md mb-1.5">
                <CircleDollarSign className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                <span className="text-xs font-semibold text-slate-800">Amount Details</span>
              </div>

              {/* Row 1: Amount Before Tax, Tax Amount, Total Amount */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Amount Before Tax <span className="text-red-500 font-normal">*</span>
                  </label>
                  <div className="relative flex items-center h-9 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <span className="absolute left-2.5 text-xs text-slate-400 pointer-events-none font-medium">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Enter amount"
                      value={amountBeforeTax}
                      onChange={(e) => handleAmountBeforeTaxChange(e.target.value)}
                      className="w-full h-full pl-6 pr-2.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal bg-transparent focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Tax Amount <span className="text-red-500 font-normal">*</span>
                  </label>
                  <div className="relative flex items-center h-9 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <span className="absolute left-2.5 text-xs text-slate-400 pointer-events-none font-medium">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Enter tax amount"
                      value={taxAmount}
                      onChange={(e) => handleTaxAmountChange(e.target.value)}
                      className="w-full h-full pl-6 pr-2.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal bg-transparent focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Total Amount <span className="text-red-500 font-normal">*</span>
                  </label>
                  <div className="relative flex items-center h-9 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
                    <span className="absolute left-2.5 text-xs text-slate-400 pointer-events-none font-medium">₹</span>
                    <input
                      type="text"
                      readOnly
                      value={totalAmount > 0 ? totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      className="w-full h-full pl-6 pr-2.5 text-xs text-slate-700 font-medium bg-transparent cursor-not-allowed focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Paid Amount, Outstanding Amount, Outstanding */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Paid Amount
                  </label>
                  <div className="relative flex items-center h-9 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <span className="absolute left-2.5 text-xs text-slate-400 pointer-events-none font-medium">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Enter paid amount"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="w-full h-full pl-6 pr-2.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal bg-transparent focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Outstanding Amount
                  </label>
                  <div className="relative flex items-center h-9 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
                    <span className="absolute left-2.5 text-xs text-slate-400 pointer-events-none font-medium">₹</span>
                    <input
                      type="text"
                      readOnly
                      value={outstandingAmount > 0 ? outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      className="w-full h-full pl-6 pr-2.5 text-xs text-slate-700 font-medium bg-transparent cursor-not-allowed focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Outstanding
                  </label>
                  <div className="relative flex items-center h-9 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
                    <input
                      type="text"
                      readOnly
                      value={outstandingValue}
                      className="w-full h-full px-2.5 text-xs text-slate-700 font-medium bg-transparent cursor-not-allowed focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 4: Status & Tracking                              */}
            {/* ========================================================= */}
            <div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] rounded-md mb-1.5">
                <Settings className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                <span className="text-xs font-semibold text-slate-800">Status & Tracking</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Status <span className="text-red-500 font-normal">*</span>
                  </label>
                  <div className="relative flex items-center h-9 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                      className={`w-full h-full pl-2.5 pr-8 text-xs font-medium bg-transparent appearance-none focus:outline-hidden cursor-pointer ${
                        status ? 'text-slate-800' : 'text-slate-400'
                      }`}
                      required
                    >
                      <option value="" disabled>Select status</option>
                      <option value="Unpaid" className="text-slate-800">Unpaid</option>
                      <option value="Partially Paid" className="text-slate-800">Partially Paid</option>
                      <option value="Paid" className="text-slate-800">Paid</option>
                      <option value="Draft" className="text-slate-800">Draft</option>
                      <option value="Cancelled" className="text-slate-800">Cancelled</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none shrink-0" />
                  </div>
                </div>

                {/* 2. Days Overdue */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Days Overdue
                  </label>
                  <div className="relative flex items-center h-9 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
                    <input
                      type="text"
                      readOnly
                      value={daysOverdue}
                      className="w-full h-full pl-2.5 pr-11 text-xs text-slate-700 font-medium bg-transparent cursor-not-allowed focus:outline-hidden"
                    />
                    <span className="absolute right-2.5 text-xs text-slate-400 pointer-events-none">days</span>
                  </div>
                </div>

                {/* 3. Aging Bucket */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Aging Bucket
                  </label>
                  <div className="relative flex items-center h-9 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <select
                      value={agingBucket}
                      onChange={(e) => setAgingBucket(e.target.value as InvoiceAgingBucket)}
                      className={`w-full h-full pl-2.5 pr-8 text-xs font-medium bg-transparent appearance-none focus:outline-hidden cursor-pointer ${
                        agingBucket ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      <option value="">Select bucket</option>
                      <option value="Current" className="text-slate-800">Current</option>
                      <option value="1 - 30 Days" className="text-slate-800">1 - 30 Days</option>
                      <option value="31 - 60 Days" className="text-slate-800">31 - 60 Days</option>
                      <option value="61 - 90 Days" className="text-slate-800">61 - 90 Days</option>
                      <option value="90+ Days" className="text-slate-800">90+ Days</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none shrink-0" />
                  </div>
                </div>

                {/* 4. Collection Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                    Collection Status
                  </label>
                  <div className="relative flex items-center h-9 bg-white border border-[#E2E8F0] rounded-lg focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1] transition-all">
                    <select
                      value={collectionStatus}
                      onChange={(e) => setCollectionStatus(e.target.value as InvoiceCollectionStatus)}
                      className={`w-full h-full pl-2.5 pr-8 text-xs font-medium bg-transparent appearance-none focus:outline-hidden cursor-pointer ${
                        collectionStatus ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      <option value="">Select status</option>
                      <option value="Pending" className="text-slate-800">Pending</option>
                      <option value="In Progress" className="text-slate-800">In Progress</option>
                      <option value="Follow Up" className="text-slate-800">Follow Up</option>
                      <option value="Escalated" className="text-slate-800">Escalated</option>
                      <option value="Completed" className="text-slate-800">Completed</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 5: Additional Information                         */}
            {/* ========================================================= */}
            <div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] rounded-md mb-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
                <span className="text-xs font-semibold text-slate-800">Additional Information</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 leading-none">
                  Notes
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    maxLength={500}
                    placeholder="Add any internal notes, remarks or payment details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 pb-5 border border-[#E2E8F0] rounded-lg text-xs text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] focus:outline-hidden transition-all resize-none max-h-[52px]"
                  />
                  <span className="absolute right-2.5 bottom-1 text-[10px] text-slate-400 pointer-events-none font-normal">
                    {notes.length} / 500
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* FOOTER: Actions                                           */}
          {/* ========================================================= */}
          <div className="flex items-center justify-end gap-3 px-6 py-2.5 border-t border-[#F1F5F9] shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-60 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Generating Invoice...</span>
                </>
              ) : (
                <span>Generate Invoice</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
