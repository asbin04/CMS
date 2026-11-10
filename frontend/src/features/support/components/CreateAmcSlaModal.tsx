import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CreateAmcSlaContractInput } from '../types/amcSla';

interface CreateAmcSlaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAmcSlaContractInput) => Promise<void>;
}

export const CreateAmcSlaModal: React.FC<CreateAmcSlaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateAmcSlaContractInput>({
    clientId: 'CL-001',
    clientName: 'Acme Corp',
    projectId: 'PRJ-001',
    projectName: 'Cloud ERP Migration',
    serviceType: 'Application Support',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    renewalDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contractValue: 2400000,
    responseSla: '2 hrs',
    resolutionSla: '12 hrs',
    coverageHours: '24/7 Support',
    status: 'Active',
    penaltyClause: 'Applicable (5%)',
    renewalAlert: 'Normal',
    assignedManager: 'Rahul Sharma',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto font-['Inter']">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Create AMC / SLA Contract</h2>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client ID</label>
              <input
                required
                type="text"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project ID</label>
              <input
                required
                type="text"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Value (₹)</label>
              <input
                required
                type="number"
                value={formData.contractValue}
                onChange={(e) => setFormData({ ...formData, contractValue: Number(e.target.value) })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                required
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                required
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Renewal Date</label>
              <input
                required
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
                placeholder="e.g. 2 hrs"
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution SLA</label>
              <input
                type="text"
                value={formData.resolutionSla}
                onChange={(e) => setFormData({ ...formData, resolutionSla: e.target.value })}
                placeholder="e.g. 12 hrs"
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Coverage Hours</label>
              <input
                type="text"
                value={formData.coverageHours}
                onChange={(e) => setFormData({ ...formData, coverageHours: e.target.value })}
                placeholder="e.g. 24/7 Support"
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Manager</label>
              <input
                type="text"
                value={formData.assignedManager}
                onChange={(e) => setFormData({ ...formData, assignedManager: e.target.value })}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Penalty Clause</label>
              <input
                type="text"
                value={formData.penaltyClause}
                onChange={(e) => setFormData({ ...formData, penaltyClause: e.target.value })}
                placeholder="e.g. Applicable (5%)"
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
              {isSubmitting ? 'Creating...' : 'Create Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

