import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CreateSupportTicketPayload } from '../types/tickets';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSupportTicketPayload) => Promise<void>;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateSupportTicketPayload>({
    clientId: 'CL-001',
    clientName: 'Acme Corp',
    projectId: 'PRJ-001',
    projectName: 'Cloud ERP Migration',
    amcSlaId: 'AMC-001',
    openedDate: new Date().toISOString().split('T')[0],
    ticketType: 'Issue',
    priority: 'High',
    issueRequest: '',
    description: '',
    assignedTo: 'Rohan Verma',
    assignedToEmail: 'rohan.v@company.com',
    status: 'In Progress',
    channel: 'Portal',
    resolutionTime: '-',
    slaDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    slaStatus: 'Within SLA',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.issueRequest.trim()) {
      setFormError('Issue / Request summary is required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setFormError(null);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-base font-semibold text-[#111827]">Create Support Ticket</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3 text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
              {formError}
            </div>
          )}

          {/* Issue Summary */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#374151]">Issue / Request Summary *</label>
            <input
              type="text"
              required
              value={formData.issueRequest}
              onChange={(e) => setFormData({ ...formData, issueRequest: e.target.value })}
              placeholder="e.g. Application login failure"
              className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
            />
          </div>

          {/* Row: Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#374151]">Ticket Type *</label>
              <select
                value={formData.ticketType}
                onChange={(e) => setFormData({ ...formData, ticketType: e.target.value })}
                className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              >
                <option value="Issue">Issue</option>
                <option value="Request">Request</option>
                <option value="Incident">Incident</option>
                <option value="Bug">Bug</option>
                <option value="Task">Task</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#374151]">Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Row: Client ID & Project ID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#374151]">Client ID *</label>
              <input
                type="text"
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#374151]">Project ID *</label>
              <input
                type="text"
                required
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* Row: AMC/SLA ID & Channel */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#374151]">AMC / SLA ID</label>
              <input
                type="text"
                value={formData.amcSlaId || ''}
                onChange={(e) => setFormData({ ...formData, amcSlaId: e.target.value })}
                placeholder="e.g. AMC-001 or SLA-002"
                className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#374151]">Channel</label>
              <select
                value={formData.channel || 'Portal'}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              >
                <option value="Portal">Portal</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="Slack">Slack</option>
              </select>
            </div>
          </div>

          {/* Row: Assigned To & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#374151]">Assigned To *</label>
              <input
                type="text"
                required
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#374151]">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              >
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Open">Open</option>
              </select>
            </div>
          </div>

          {/* Row: Opened Date & SLA Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#374151]">Opened Date *</label>
              <input
                type="date"
                required
                value={formData.openedDate}
                onChange={(e) => setFormData({ ...formData, openedDate: e.target.value })}
                className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#374151]">SLA Due Date</label>
              <input
                type="date"
                value={formData.slaDueDate || ''}
                onChange={(e) => setFormData({ ...formData, slaDueDate: e.target.value })}
                className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#374151]">Notes</label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Issue resolved and validated by client"
              className="h-9 px-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#374151]">Description</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the issue or request..."
              className="p-3 text-xs border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-[#4B35E6] rounded-lg hover:bg-[#3E2BD1] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

