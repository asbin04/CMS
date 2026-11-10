import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AmcSlaContract, UpdateAmcSlaContractInput } from '../types/amcSla';

interface EditAmcSlaModalProps {
  contract: AmcSlaContract | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateAmcSlaContractInput) => Promise<void>;
}

export const EditAmcSlaModal: React.FC<EditAmcSlaModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !contract) return null;

  const [formData, setFormData] = useState<UpdateAmcSlaContractInput>({
    clientId: contract.clientId,
    clientName: contract.clientName,
    projectId: contract.projectId,
    projectName: contract.projectName,
    serviceType: contract.serviceType,
    startDate: contract.startDate,
    endDate: contract.endDate,
    renewalDate: contract.renewalDate,
    contractValue: contract.contractValue,
    responseSla: contract.responseSla,
    resolutionSla: contract.resolutionSla,
    coverageHours: contract.coverageHours,
    status: contract.status,
    penaltyClause: contract.penaltyClause,
    renewalAlert: contract.renewalAlert,
    assignedManager: contract.assignedManager,
    notes: contract.notes,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(contract.id, formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto font-['Inter']">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Edit AMC / SLA Contract</h2>
            <p className="text-xs text-indigo-600 font-semibold">{contract.contractCode}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="Application Support">Application Support</option>
                <option value="Infrastructure Support">Infrastructure Support</option>
                <option value="Managed Services">Managed Services</option>
                <option value="Technical Support">Technical Support</option>
                <option value="AMC (Overall)">AMC (Overall)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Expiring">Expiring</option>
                <option value="Expired">Expired</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Renewal Alert</label>
              <select
                value={formData.renewalAlert}
                onChange={(e) => setFormData({ ...formData, renewalAlert: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="Expiring (≤ 30 Days)">Expiring (≤ 30 Days)</option>
                <option value="Renewal Overdue">Renewal Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Value (₹)</label>
              <input
                type="number"
                value={formData.contractValue}
                onChange={(e) => setFormData({ ...formData, contractValue: Number(e.target.value) })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Renewal Date</label>
              <input
                type="date"
                value={formData.renewalDate}
                onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Response SLA</label>
              <input
                type="text"
                value={formData.responseSla}
                onChange={(e) => setFormData({ ...formData, responseSla: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution SLA</label>
              <input
                type="text"
                value={formData.resolutionSla}
                onChange={(e) => setFormData({ ...formData, resolutionSla: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Coverage Hours</label>
              <input
                type="text"
                value={formData.coverageHours}
                onChange={(e) => setFormData({ ...formData, coverageHours: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Penalty Clause</label>
              <input
                type="text"
                value={formData.penaltyClause}
                onChange={(e) => setFormData({ ...formData, penaltyClause: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Manager</label>
              <input
                type="text"
                value={formData.assignedManager}
                onChange={(e) => setFormData({ ...formData, assignedManager: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

