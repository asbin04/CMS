import React, { useState, useEffect } from 'react';
import { X, Plus, Building, Tag, DollarSign } from 'lucide-react';
import { ClientApproval } from '../../types/approvals';

interface AddClientApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ClientApproval, 'id' | 'approval_id' | 'request_date' | 'status'>) => void;
}

export const AddClientApprovalModal: React.FC<AddClientApprovalModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [clientName, setClientName] = useState('');
  const [requestType, setRequestType] = useState('Proposal Approval');
  const [referenceId, setReferenceId] = useState('');
  const [requester, setRequester] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !referenceId.trim()) {
      alert('Please fill in client name and reference ID.');
      return;
    }

    onSubmit({
      client_name: clientName.trim(),
      request_type: requestType,
      reference_id: referenceId.trim(),
      requester: requester.trim(),
      due_date: dueDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: amount.trim() || '-'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 z-10 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Add Client Approval Request</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Client Name</label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 focus-within:border-indigo-500 focus-within:bg-white">
              <Building size={14} className="text-slate-400" />
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Zenith Global Ltd"
                className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Request Type</label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 focus-within:border-indigo-500 focus-within:bg-white">
              <Tag size={14} className="text-slate-400" />
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-800"
              >
                <option value="Proposal Approval">Proposal Approval</option>
                <option value="Contract Approval">Contract Approval</option>
                <option value="Client Onboarding">Client Onboarding</option>
                <option value="Special Pricing / Payment Terms">Special Pricing / Payment Terms</option>
                <option value="Client Change Request">Client Change Request</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Reference ID</label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. PR-2025-012 or CL-0034"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 outline-none text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Requester</label>
              <input
                type="text"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                placeholder="e.g. Vikram T"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 outline-none text-slate-800 placeholder-slate-400 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="DD MMM YYYY"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 outline-none text-slate-800 placeholder-slate-400 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Amount (if applicable)</label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 focus-within:border-indigo-500 focus-within:bg-white">
              <DollarSign size={14} className="text-slate-400" />
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. ₹ 6,00,000 or -"
                className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
