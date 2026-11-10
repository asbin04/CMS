import React, { useState, useEffect } from 'react';
import { X, Edit2, Check, ChevronDown, Loader2 } from 'lucide-react';
import {
  DevelopmentRecord,
  DevelopmentEnvironment,
  CodeReviewStatus,
  DevelopmentStatus,
} from '../types';
import {
  PROJECT_OPTIONS,
  ENVIRONMENT_OPTIONS,
  STATUS_OPTIONS,
  REVIEW_STATUS_OPTIONS,
} from '../mockData';

interface EditDevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DevelopmentRecord | null;
  onSave: (updatedRecord: DevelopmentRecord) => Promise<void> | void;
}

export const EditDevelopmentModal: React.FC<EditDevelopmentModalProps> = ({
  isOpen,
  onClose,
  record,
  onSave,
}) => {
  const [projectId, setProjectId] = useState('');
  const [requirementId, setRequirementId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [developer, setDeveloper] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [environment, setEnvironment] = useState<DevelopmentEnvironment>('Dev');
  const [buildVersion, setBuildVersion] = useState('');
  const [codeReviewStatus, setCodeReviewStatus] = useState<CodeReviewStatus>('Approved');
  const [qaHandoffDate, setQaHandoffDate] = useState('');
  const [releaseId, setReleaseId] = useState('');
  const [status, setStatus] = useState<DevelopmentStatus>('In Progress');
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [documentationLink, setDocumentationLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setProjectId(record.projectId);
      setRequirementId(record.requirementId);
      setTaskId(record.taskId);
      setDeveloper(record.developer);
      setRepositoryUrl(record.repositoryUrl);
      setBranch(record.branch);
      setEnvironment(record.environment);
      setBuildVersion(record.buildVersion);
      setCodeReviewStatus(record.codeReviewStatus);
      setQaHandoffDate(record.qaHandoffDate);
      setReleaseId(record.releaseId === '-' ? '' : record.releaseId);
      setStatus(record.status);
      setTechnicalNotes(record.technicalNotes);
      setDocumentationLink(record.documentationLink);
      setError(null);
      setIsSubmitting(false);
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!developer.trim()) {
      setError('Developer name is required.');
      return;
    }
    if (!requirementId.trim()) {
      setError('Requirement ID is required.');
      return;
    }
    if (!taskId.trim()) {
      setError('Task / Ticket ID is required.');
      return;
    }
    if (!repositoryUrl.trim()) {
      setError('Repository URL is required.');
      return;
    }
    if (!branch.trim()) {
      setError('Branch name is required.');
      return;
    }
    if (!buildVersion.trim()) {
      setError('Build version is required.');
      return;
    }

    const updatedRecord: DevelopmentRecord = {
      ...record,
      projectId,
      requirementId,
      taskId,
      developer: developer.trim(),
      repositoryUrl: repositoryUrl.trim(),
      branch: branch.trim(),
      environment,
      buildVersion: buildVersion.trim(),
      codeReviewStatus,
      qaHandoffDate: qaHandoffDate.trim(),
      releaseId: releaseId.trim() || '-',
      status,
      technicalNotes: technicalNotes.trim(),
      documentationLink: documentationLink.trim(),
    };

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(updatedRecord);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update development record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectChoices = PROJECT_OPTIONS.filter((p) => p !== 'All Projects');
  const environmentChoices = ENVIRONMENT_OPTIONS.filter((e) => e !== 'All Environment') as DevelopmentEnvironment[];
  const statusChoices = STATUS_OPTIONS.filter((s) => s !== 'All Status') as DevelopmentStatus[];
  const reviewChoices = REVIEW_STATUS_OPTIONS.filter((r) => r !== 'All Review Status') as CodeReviewStatus[];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5]">
              <Edit2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">
                Edit Development Entry
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Updating {record.developmentId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Row 1: Development ID (Read-only) & Project ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Development ID
                </label>
                <input
                  type="text"
                  value={record.developmentId}
                  disabled
                  className="w-full h-9 px-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Project ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full h-9 pl-3 pr-8 bg-white border border-[#E2E8F0] hover:border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] appearance-none cursor-pointer"
                  >
                    {projectChoices.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Requirement ID & Task ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Requirement ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={requirementId}
                  onChange={(e) => setRequirementId(e.target.value)}
                  placeholder="e.g. REQ-2026-0184"
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Task / Ticket ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  placeholder="e.g. TSK-00128"
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  required
                />
              </div>
            </div>

            {/* Row 3: Developer & Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Developer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  placeholder="e.g. Amit Sharma"
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. feature/login"
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  required
                />
              </div>
            </div>

            {/* Row 4: Repository URL */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Repository URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="github.com/kalpanaa/prj-001"
                className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                required
              />
            </div>

            {/* Row 5: Environment & Build Version */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Environment
                </label>
                <div className="relative">
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as DevelopmentEnvironment)}
                    className="w-full h-9 pl-3 pr-8 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] appearance-none cursor-pointer"
                  >
                    {environmentChoices.map((env) => (
                      <option key={env} value={env}>
                        {env}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Build Version <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={buildVersion}
                  onChange={(e) => setBuildVersion(e.target.value)}
                  placeholder="e.g. v1.2.0"
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  required
                />
              </div>
            </div>

            {/* Row 6: Code Review Status & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Code Review Status
                </label>
                <div className="relative">
                  <select
                    value={codeReviewStatus}
                    onChange={(e) => setCodeReviewStatus(e.target.value as CodeReviewStatus)}
                    className="w-full h-9 pl-3 pr-8 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] appearance-none cursor-pointer"
                  >
                    {reviewChoices.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DevelopmentStatus)}
                    className="w-full h-9 pl-3 pr-8 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] appearance-none cursor-pointer"
                  >
                    {statusChoices.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 7: QA Handoff Date & Release ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  QA Handoff Date
                </label>
                <input
                  type="text"
                  value={qaHandoffDate}
                  onChange={(e) => setQaHandoffDate(e.target.value)}
                  placeholder="e.g. 28 Oct 2026"
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Release ID (Optional)
                </label>
                <input
                  type="text"
                  value={releaseId}
                  onChange={(e) => setReleaseId(e.target.value)}
                  placeholder="e.g. REL-014 or leave empty for '-'"
                  className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            {/* Row 8: Technical Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Technical Notes
              </label>
              <textarea
                value={technicalNotes}
                onChange={(e) => setTechnicalNotes(e.target.value)}
                placeholder="Brief summary of code changes or status notes..."
                rows={2}
                className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] resize-none"
              />
            </div>

            {/* Row 9: Documentation Link */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Documentation Link (Optional)
              </label>
              <input
                type="text"
                value={documentationLink}
                onChange={(e) => setDocumentationLink(e.target.value)}
                placeholder="e.g. https://docs.kalpanaa.com"
                className="w-full h-9 px-3 bg-white border border-[#E2E8F0] rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

