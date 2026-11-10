import React, { useState, useEffect } from 'react';
import { X, ClipboardList, AlertCircle } from 'lucide-react';
import { RequirementRecord, RequirementPriority, RequirementStatus, BillableOption } from '../../types';

interface EditRequirementModalProps {
  isOpen: boolean;
  requirement: RequirementRecord | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<RequirementRecord>) => void;
}

export const EditRequirementModal: React.FC<EditRequirementModalProps> = ({
  isOpen,
  requirement,
  onClose,
  onSave,
}) => {
  const [requirementFeature, setRequirementFeature] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Feature');
  const [priority, setPriority] = useState<RequirementPriority>('Medium');
  const [status, setStatus] = useState<RequirementStatus>('In Progress');
  const [assignedApprover, setAssignedApprover] = useState('CEO – Akshit Ujjain');
  const [scopeFreeze, setScopeFreeze] = useState<BillableOption>('No');
  const [completionPercentage, setCompletionPercentage] = useState<number | string>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (requirement && isOpen) {
      setRequirementFeature(requirement.requirementFeature);
      setDescription(requirement.description || '');
      setType(requirement.type);
      setPriority(requirement.priority);
      setStatus(requirement.status);
      setAssignedApprover(requirement.assignedApprover || 'CEO – Akshit Ujjain');
      setScopeFreeze(requirement.scopeFreeze);
      setCompletionPercentage(requirement.completionPercentage);
      setError(null);
    }
  }, [requirement, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const mainEl = document.querySelector('main');
      const prevMainOverflow = mainEl ? mainEl.style.overflow : '';

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (mainEl) {
        mainEl.style.overflow = 'hidden';
      }

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        if (mainEl) {
          mainEl.style.overflow = prevMainOverflow;
        }
      };
    }
  }, [isOpen]);

  if (!isOpen || !requirement) return null;

  const completionNum =
    typeof completionPercentage === 'number'
      ? completionPercentage
      : parseInt(completionPercentage, 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!requirementFeature.trim()) {
      setError('Feature title cannot be empty.');
      return;
    }
    if (isNaN(completionNum) || completionNum < 0 || completionNum > 100) {
      setError('Completion percentage must be between 0 and 100.');
      return;
    }

    onSave(requirement.requirementId, {
      requirementFeature: requirementFeature.trim(),
      description: description.trim(),
      type,
      priority,
      status,
      assignedApprover,
      scopeFreeze,
      completionPercentage: status === 'Completed' ? 100 : completionNum,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-req-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <ClipboardList className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="edit-req-title" className="text-base font-bold text-slate-900 leading-tight">
                Edit Requirement
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{requirement.requirementId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Requirement / Feature Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={requirementFeature}
              onChange={(e) => setRequirementFeature(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors h-[38px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors h-[38px] cursor-pointer"
              >
                <option value="Feature">Feature</option>
                <option value="Enhancement">Enhancement</option>
                <option value="New">New</option>
                <option value="Bug Fix">Bug Fix</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequirementPriority)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors h-[38px] cursor-pointer"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  const s = e.target.value as RequirementStatus;
                  setStatus(s);
                  if (s === 'Completed') setCompletionPercentage(100);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors h-[38px] cursor-pointer"
              >
                <option value="In Progress">In Progress</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scope Freeze</label>
              <select
                value={scopeFreeze}
                onChange={(e) => setScopeFreeze(e.target.value as BillableOption)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors h-[38px] cursor-pointer"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Approved By</label>
            <select
              value={assignedApprover}
              onChange={(e) => setAssignedApprover(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors h-[38px] cursor-pointer"
            >
              <option value="CEO – Akshit Ujjain">CEO – Akshit Ujjain</option>
              <option value="MD – Gaurav Tripathy">MD – Gaurav Tripathy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Completion Percentage ({completionNum}%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                disabled={status === 'Completed'}
                value={status === 'Completed' ? 100 : completionPercentage}
                onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                className="flex-1 accent-indigo-600 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                disabled={status === 'Completed'}
                value={status === 'Completed' ? 100 : completionPercentage}
                onChange={(e) => setCompletionPercentage(e.target.value)}
                className="w-16 px-2 py-1.5 border border-slate-200 rounded-xl text-xs text-center font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequirementModal;

