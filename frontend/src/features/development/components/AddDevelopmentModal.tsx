import React, { useState, useEffect } from 'react';
import { X, Code2, Check, ChevronDown, Loader2 } from 'lucide-react';
import {
  DevelopmentFormData,
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
import { projectLookupService } from '../../timesheets-requirements/services/projectLookupService';
import { requirementsApiService } from '../../timesheets-requirements/services/requirementsApiService';

interface AddDevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DevelopmentFormData) => Promise<void> | void;
  nextId?: string;
}

export const AddDevelopmentModal: React.FC<AddDevelopmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nextId = 'DEV-2026-0001',
}) => {
  const [projectId, setProjectId] = useState('PRJ-001');
  const [requirementId, setRequirementId] = useState('REQ-2026-0186');
  const [taskId, setTaskId] = useState('TSK-00129');
  const [developer, setDeveloper] = useState('Amit Sharma');
  const [developerId, setDeveloperId] = useState('EMP-001');
  const [repositoryUrl, setRepositoryUrl] = useState('https://github.com/kalpanaa/prj-001');
  const [branch, setBranch] = useState('feature/new-module');
  const [environment, setEnvironment] = useState<DevelopmentEnvironment>('Dev');
  const [buildVersion, setBuildVersion] = useState('v1.0.0');
  const [codeReviewStatus, setCodeReviewStatus] = useState<CodeReviewStatus>('In Review');
  const [qaHandoffDate, setQaHandoffDate] = useState('29 Oct 2026');
  const [releaseId, setReleaseId] = useState('');
  const [status, setStatus] = useState<DevelopmentStatus>('In Progress');
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [documentationLink, setDocumentationLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lookups
  const [projectOptions, setProjectOptions] = useState<string[]>([]);
  const [requirementOptions, setRequirementOptions] = useState<{ id: string; name: string }[]>([]);
  const [taskOptions, setTaskOptions] = useState<{ id: string; name: string }[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ id: string; name: string }[]>([]);

  // Load projects and employees on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadInitialOptions = async () => {
      try {
        const [projects, employees] = await Promise.all([
          projectLookupService.getProjects(),
          projectLookupService.getEmployees(),
        ]);

        if (isMounted) {
          const pCodes = projects.map((p) => p.projectCode || p.id).filter(Boolean);
          if (pCodes.length > 0) {
            setProjectOptions(pCodes);
          } else {
            setProjectOptions(PROJECT_OPTIONS.filter((p) => p !== 'All Projects'));
          }

          if (employees.length > 0) {
            setEmployeeOptions(employees.map((e) => ({ id: e.id, name: e.name })));
          }
        }
      } catch {
        if (isMounted) {
          setProjectOptions(PROJECT_OPTIONS.filter((p) => p !== 'All Projects'));
        }
      }
    };

    loadInitialOptions();
    setError(null);
    setIsSubmitting(false);

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Load requirements and tasks when project changes
  useEffect(() => {
    if (!isOpen || !projectId) return;

    let isMounted = true;
    const loadProjectChildren = async () => {
      try {
        const [reqsPage, tasks] = await Promise.all([
          requirementsApiService.getRequirements({ project: projectId, size: 50 }),
          projectLookupService.getTasksForProject(projectId),
        ]);

        if (isMounted) {
          const reqs = reqsPage.content.map((r) => ({
            id: r.requirementId,
            name: `${r.requirementId} - ${r.requirementFeature || r.type}`,
          }));
          setRequirementOptions(reqs);
          if (reqs.length > 0) {
            setRequirementId((prev) => (prev && reqs.some((r) => r.id === prev) ? prev : reqs[0].id));
          }

          const tList = tasks.map((t) => ({
            id: t.id,
            name: `${t.id} - ${t.name}`,
          }));
          setTaskOptions(tList);
          if (tList.length > 0) {
            setTaskId((prev) => (prev && tList.some((t) => t.id === prev) ? prev : tList[0].id));
          }
        }
      } catch {
        // Fallback
      }
    };

    loadProjectChildren();

    return () => {
      isMounted = false;
    };
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!developer.trim()) {
      setError('Developer is required.');
      return;
    }
    if (!projectId.trim()) {
      setError('Project ID is required.');
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

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        developmentId: nextId,
        projectId: projectId.trim(),
        requirementId: requirementId.trim(),
        taskId: taskId.trim(),
        developer: developer.trim(),
        developerId: developerId || undefined,
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
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create development record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Add Development Activity
              </h2>
              <p className="text-xs text-slate-500">
                Register code progress, build version, environment, and QA handoff.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Development ID (Auto) */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Development ID
              </label>
              <input
                type="text"
                readOnly
                value={nextId}
                className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-700 cursor-not-allowed"
              />
            </div>

            {/* Project ID */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Project ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full h-[36px] pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-[#4F46E5]"
                >
                  {projectOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Requirement ID */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Requirement ID <span className="text-rose-500">*</span>
              </label>
              {requirementOptions.length > 0 ? (
                <div className="relative">
                  <select
                    value={requirementId}
                    onChange={(e) => setRequirementId(e.target.value)}
                    className="w-full h-[36px] pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-[#4F46E5]"
                  >
                    {requirementOptions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <input
                  type="text"
                  value={requirementId}
                  onChange={(e) => setRequirementId(e.target.value)}
                  placeholder="REQ-2026-0186"
                  className="w-full h-[36px] px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                />
              )}
            </div>

            {/* Task / Ticket ID */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Task / Ticket ID <span className="text-rose-500">*</span>
              </label>
              {taskOptions.length > 0 ? (
                <div className="relative">
                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className="w-full h-[36px] pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-[#4F46E5]"
                  >
                    {taskOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <input
                  type="text"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  placeholder="TSK-00129"
                  className="w-full h-[36px] px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                />
              )}
            </div>

            {/* Developer */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Developer <span className="text-rose-500">*</span>
              </label>
              {employeeOptions.length > 0 ? (
                <div className="relative">
                  <select
                    value={developerId}
                    onChange={(e) => {
                      const selected = employeeOptions.find((emp) => emp.id === e.target.value);
                      setDeveloperId(e.target.value);
                      if (selected) setDeveloper(selected.name);
                    }}
                    className="w-full h-[36px] pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-[#4F46E5]"
                  >
                    {employeeOptions.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <input
                  type="text"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  placeholder="Developer name"
                  className="w-full h-[36px] px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
                />
              )}
            </div>

            {/* Branch */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Branch <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="feature/login"
                className="w-full h-[36px] px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Repository URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Repository URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/kalpanaa/prj-001"
                className="w-full h-[36px] px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Environment */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Environment <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as DevelopmentEnvironment)}
                  className="w-full h-[36px] pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-[#4F46E5]"
                >
                  {ENVIRONMENT_OPTIONS.filter((e) => e !== 'All Environment').map((env) => (
                    <option key={env} value={env}>
                      {env}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Build Version */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Build Version <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={buildVersion}
                onChange={(e) => setBuildVersion(e.target.value)}
                placeholder="v1.0.0"
                className="w-full h-[36px] px-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Code Review Status */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Code Review Status
              </label>
              <div className="relative">
                <select
                  value={codeReviewStatus}
                  onChange={(e) => setCodeReviewStatus(e.target.value as CodeReviewStatus)}
                  className="w-full h-[36px] pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-[#4F46E5]"
                >
                  {REVIEW_STATUS_OPTIONS.filter((s) => s !== 'All Review Status').map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Development Status <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DevelopmentStatus)}
                  className="w-full h-[36px] pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-[#4F46E5]"
                >
                  {STATUS_OPTIONS.filter((s) => s !== 'All Status').map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* QA Handoff Date */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                QA Handoff Date
              </label>
              <input
                type="text"
                value={qaHandoffDate}
                onChange={(e) => setQaHandoffDate(e.target.value)}
                placeholder="28 Oct 2026 or YYYY-MM-DD"
                className="w-full h-[36px] px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Release ID */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Release ID (optional)
              </label>
              <input
                type="text"
                value={releaseId}
                onChange={(e) => setReleaseId(e.target.value)}
                placeholder="REL-014 or -"
                className="w-full h-[36px] px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Technical Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Technical Notes
              </label>
              <textarea
                value={technicalNotes}
                onChange={(e) => setTechnicalNotes(e.target.value)}
                placeholder="Add notes about architecture, dependencies, or API updates..."
                rows={2}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] resize-none"
              />
            </div>

            {/* Documentation Link */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Documentation Link
              </label>
              <input
                type="text"
                value={documentationLink}
                onChange={(e) => setDocumentationLink(e.target.value)}
                placeholder="https://docs.kalpanaa.com"
                className="w-full h-[36px] px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Development</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
