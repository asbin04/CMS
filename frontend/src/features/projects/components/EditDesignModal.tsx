import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { UiuxDesignItem, UpdateUiuxPayload } from '../types/uiux';

interface EditDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: UiuxDesignItem | null;
  onSubmit: (id: string, payload: UpdateUiuxPayload) => Promise<void>;
  projectOptions: string[];
}

export const EditDesignModal: React.FC<EditDesignModalProps> = ({
  isOpen,
  onClose,
  design,
  onSubmit,
  projectOptions,
}) => {
  const [projectId, setProjectId] = useState('PRJ-001');
  const [requirementId, setRequirementId] = useState('');
  const [screenFeature, setScreenFeature] = useState('');
  const [designType, setDesignType] = useState('UI Design');
  const [version, setVersion] = useState('v1.0');
  const [designer, setDesigner] = useState('Amit Sharma');
  const [tool, setTool] = useState('Figma');
  const [prototypeUrl, setPrototypeUrl] = useState('');
  const [clientFeedback, setClientFeedback] = useState('');
  const [feedbackDate, setFeedbackDate] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('Pending');
  const [approvedBy, setApprovedBy] = useState('-');
  const [approvalDate, setApprovalDate] = useState('-');
  const [changeRequest, setChangeRequest] = useState('-');
  const [status, setStatus] = useState('In Progress');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (design) {
      setProjectId(design.projectId || 'PRJ-001');
      setRequirementId(design.requirementId || '');
      setScreenFeature(design.screenFeature || '');
      setDesignType(design.designType || 'UI Design');
      setVersion(design.version || 'v1.0');
      setDesigner(design.designer || 'Amit Sharma');
      setTool(design.tool || 'Figma');
      setPrototypeUrl(design.prototypeUrl || '');
      setClientFeedback(design.clientFeedback || '');
      setFeedbackDate(design.feedbackDate || '');
      setApprovalStatus(design.approvalStatus || 'Pending');
      setApprovedBy(design.approvedBy || '-');
      setApprovalDate(design.approvalDate || '-');
      setChangeRequest(design.changeRequest || '-');
      setStatus(design.status || 'In Progress');
      setNotes(design.notes || '');
    }
  }, [design]);

  if (!isOpen || !design) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenFeature.trim()) {
      setError('Screen / Feature name is required');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(design.id, {
        projectId,
        requirementId,
        screenFeature: screenFeature.trim(),
        designType,
        version: version.trim() || 'v1.0',
        designer,
        tool,
        prototypeUrl: prototypeUrl.trim() || 'https://www.figma.com',
        clientFeedback: clientFeedback.trim() || '-',
        feedbackDate: feedbackDate || undefined,
        approvalStatus,
        approvedBy: approvedBy.trim() || '-',
        approvalDate: approvalDate || undefined,
        changeRequest: changeRequest.trim() || '-',
        status,
        notes: notes.trim() || '-',
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update design');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Edit Design Deliverable ({design.id})</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Project ID</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {projectOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Requirement ID</label>
              <input
                type="text"
                value={requirementId}
                onChange={(e) => setRequirementId(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Screen / Feature Name</label>
            <input
              type="text"
              value={screenFeature}
              onChange={(e) => setScreenFeature(e.target.value)}
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Design Type</label>
              <select
                value={designType}
                onChange={(e) => setDesignType(e.target.value)}
                className="w-full h-9 px-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="UI Design">UI Design</option>
                <option value="UI/UX">UI/UX</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tool</label>
              <select
                value={tool}
                onChange={(e) => setTool(e.target.value)}
                className="w-full h-9 px-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Figma">Figma</option>
                <option value="Adobe XD">Adobe XD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Designer</label>
              <select
                value={designer}
                onChange={(e) => setDesigner(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Amit Sharma">Amit Sharma</option>
                <option value="Sneha Nair">Sneha Nair</option>
                <option value="Divya Patel">Divya Patel</option>
                <option value="Rohan Verma">Rohan Verma</option>
                <option value="Vikram Shah">Vikram Shah</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Prototype URL</label>
              <input
                type="url"
                value={prototypeUrl}
                onChange={(e) => setPrototypeUrl(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Approval Status</label>
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Approved By</label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Change Request</label>
              <input
                type="text"
                value={changeRequest}
                onChange={(e) => setChangeRequest(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Client Feedback</label>
            <textarea
              value={clientFeedback}
              onChange={(e) => setClientFeedback(e.target.value)}
              rows={2}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

