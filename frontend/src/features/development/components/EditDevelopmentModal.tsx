import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Code2,
  ChevronDown,
  Link2,
  GitBranch,
  Calendar,
  Archive,
  Settings,
  Zap,
  FileText,
} from 'lucide-react';
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
import { projectLookupService } from '../../timesheets-requirements/services/projectLookupService';
import { requirementsApiService } from '../../timesheets-requirements/services/requirementsApiService';

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
  const [developerId, setDeveloperId] = useState('');
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

  const datePickerRef = useRef<HTMLInputElement>(null);

  // Lookups with sensible default fallback options
  const [projectOptions, setProjectOptions] = useState<string[]>(() =>
    PROJECT_OPTIONS.filter((p) => p !== 'All Projects')
  );
  const [requirementOptions, setRequirementOptions] = useState<{ id: string; name: string }[]>([
    { id: 'REQ-2026-0041', name: 'REQ-2026-0041 - Live CE' },
    { id: 'REQ-2026-0184', name: 'REQ-2026-0184 - User Auth' },
    { id: 'REQ-2026-0186', name: 'REQ-2026-0186 - Core Module' },
  ]);
  const [taskOptions, setTaskOptions] = useState<{ id: string; name: string }[]>([
    { id: 'TSK-00114', name: 'TSK-00114 - AWS Product' },
    { id: 'TSK-00128', name: 'TSK-00128 - Login Module' },
    { id: 'TSK-00129', name: 'TSK-00129 - API Integration' },
  ]);
  const [employeeOptions, setEmployeeOptions] = useState<{ id: string; name: string }[]>([
    { id: 'EMP-001', name: 'Amit Sharma' },
    { id: 'EMP-002', name: 'Pooja Verma' },
    { id: 'EMP-003', name: 'Rahul Nair' },
    { id: 'EMP-004', name: 'Sneha Patel' },
    { id: 'EMP-005', name: 'Vikram Rao' },
  ]);

  // Sync state when record or open changes
  useEffect(() => {
    if (record && isOpen) {
      setProjectId(record.projectId || '');
      setRequirementId(record.requirementId || '');
      setTaskId(record.taskId || '');
      setDeveloper(record.developer || '');
      setDeveloperId(record.developerId || '');
      setRepositoryUrl(record.repositoryUrl || '');
      setBranch(record.branch || '');
      setEnvironment(record.environment || 'Dev');
      setBuildVersion(record.buildVersion || '');
      setCodeReviewStatus(record.codeReviewStatus || 'Approved');
      setQaHandoffDate(record.qaHandoffDate || '');
      setReleaseId(record.releaseId === '-' ? '' : record.releaseId || '');
      setStatus(record.status || 'In Progress');
      setTechnicalNotes(record.technicalNotes || '');
      setDocumentationLink(record.documentationLink || '');
      setError(null);
      setIsSubmitting(false);

      // Ensure record values are present in options so select never renders empty
      if (record.projectId) {
        setProjectOptions((prev) =>
          prev.includes(record.projectId) ? prev : [record.projectId, ...prev]
        );
      }
      if (record.requirementId) {
        setRequirementOptions((prev) =>
          prev.some((r) => r.id === record.requirementId)
            ? prev
            : [{ id: record.requirementId, name: record.requirementId }, ...prev]
        );
      }
      if (record.taskId) {
        setTaskOptions((prev) =>
          prev.some((t) => t.id === record.taskId)
            ? prev
            : [{ id: record.taskId, name: record.taskId }, ...prev]
        );
      }
      if (record.developer) {
        setEmployeeOptions((prev) =>
          prev.some((e) => e.name === record.developer || e.id === record.developerId)
            ? prev
            : [{ id: record.developerId || 'EMP-REC', name: record.developer }, ...prev]
        );
      }
    }
  }, [record, isOpen]);

  // Load project options and employee options from lookup services
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
            setProjectOptions((prev) => {
              const combined = Array.from(new Set([...pCodes, ...prev]));
              return combined;
            });
          }

          if (employees.length > 0) {
            setEmployeeOptions((prev) => {
              const fromApi = employees.map((e) => ({ id: e.id, name: e.name }));
              const existingIds = new Set(fromApi.map((e) => e.id));
              const missing = prev.filter((p) => !existingIds.has(p.id));
              return [...fromApi, ...missing];
            });
          }
        }
      } catch {
        // Fallback maintained
      }
    };

    loadInitialOptions();

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
          if (reqsPage && reqsPage.content && reqsPage.content.length > 0) {
            const reqs = reqsPage.content.map((r) => ({
              id: r.requirementId,
              name: `${r.requirementId} - ${r.requirementFeature || r.type}`,
            }));
            setRequirementOptions((prev) => {
              const apiIds = new Set(reqs.map((r) => r.id));
              const keep = prev.filter((p) => !apiIds.has(p.id));
              return [...reqs, ...keep];
            });
          }

          if (tasks && tasks.length > 0) {
            const tList = tasks.map((t) => ({
              id: t.id,
              name: `${t.id} - ${t.name}`,
            }));
            setTaskOptions((prev) => {
              const apiIds = new Set(tList.map((t) => t.id));
              const keep = prev.filter((p) => !apiIds.has(p.id));
              return [...tList, ...keep];
            });
          }
        }
      } catch {
        // Keep existing options
      }
    };

    loadProjectChildren();

    return () => {
      isMounted = false;
    };
  }, [isOpen, projectId]);

  if (!isOpen || !record) return null;

  const handleOpenDatePicker = () => {
    if (datePickerRef.current) {
      if (typeof datePickerRef.current.showPicker === 'function') {
        datePickerRef.current.showPicker();
      } else {
        datePickerRef.current.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!developer.trim() && !developerId) {
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

    const updatedRecord: DevelopmentRecord = {
      ...record,
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

  const inputClass =
    'modal-border-input w-full h-[38px] px-3 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20 transition-colors';
  const iconInputClass =
    'modal-border-input w-full h-[38px] pl-9 pr-3 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20 transition-colors';
  const selectClass = (hasValue: boolean) =>
    `modal-border-input w-full h-[38px] pl-3 pr-8 bg-white text-xs appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20 transition-colors ${
      !hasValue ? 'text-slate-400' : 'text-slate-800 font-medium'
    }`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        .modal-border-input {
          border: 1px solid #C7D5E8 !important;
          background-color: #FFFFFF !important;
          border-radius: 10px !important;
        }
        .modal-border-input:focus {
          border-color: #4F46E5 !important;
        }
      `}</style>

      <div className="bg-white rounded-[20px] border border-slate-100 shadow-2xl w-full max-w-[960px] flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header - separated from body with light border */}
        <div className="flex items-center justify-between px-7 py-3.5 border-b border-[#F1F5F9] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5] shrink-0">
              <Code2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-slate-900 leading-tight">
                Edit Development Entry
              </h2>
              <p className="text-[12px] text-slate-500 font-normal mt-0.5">
                Update development details for{' '}
                <span className="font-mono font-medium text-slate-700">
                  {record.developmentId}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - full view without internal scrollbar at target resolution (1188x855) */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="px-7 py-3.5 space-y-3 overflow-y-auto max-h-[calc(92vh-125px)]">
            {/* Error message */}
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* Section 1: Project & Requirement Details */}
            <div>
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg px-3 py-1.5 flex items-center gap-2 mb-2">
                <Archive className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span className="text-[11.5px] font-semibold text-slate-800 tracking-tight">
                  Project & Requirement Details
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-3.5 gap-y-2.5">
                {/* Row 1, Col 1: Development ID (Read-only) */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    <span className="text-red-500 mr-1">*</span>Development ID
                  </label>
                  <input
                    type="text"
                    value={record.developmentId}
                    disabled
                    readOnly
                    className={`${inputClass} font-mono bg-slate-50 text-slate-600 cursor-not-allowed`}
                  />
                </div>

                {/* Row 1, Col 2: Project ID */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    <span className="text-red-500 mr-1">*</span>Project ID
                  </label>
                  <div className="relative">
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className={selectClass(Boolean(projectId))}
                    >
                      <option value="" disabled hidden>
                        Select project
                      </option>
                      {projectOptions.map((p) => (
                        <option key={p} value={p} className="text-slate-800">
                          {p}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Row 1, Col 3: Requirement ID */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    <span className="text-red-500 mr-1">*</span>Requirement ID
                  </label>
                  <div className="relative">
                    <select
                      value={requirementId}
                      onChange={(e) => setRequirementId(e.target.value)}
                      className={selectClass(Boolean(requirementId))}
                    >
                      <option value="" disabled hidden>
                        Select requirement
                      </option>
                      {requirementOptions.map((r) => (
                        <option key={r.id} value={r.id} className="text-slate-800">
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Row 1, Col 4: Task / Ticket ID */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    <span className="text-red-500 mr-1">*</span>Task / Ticket ID
                  </label>
                  <div className="relative">
                    <select
                      value={taskId}
                      onChange={(e) => setTaskId(e.target.value)}
                      className={selectClass(Boolean(taskId))}
                    >
                      <option value="" disabled hidden>
                        Select task / ticket
                      </option>
                      {taskOptions.map((t) => (
                        <option key={t.id} value={t.id} className="text-slate-800">
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Row 2, Col 1: Developer */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    <span className="text-red-500 mr-1">*</span>Developer
                  </label>
                  <div className="relative">
                    <select
                      value={developerId || developer}
                      onChange={(e) => {
                        const selected = employeeOptions.find(
                          (emp) => emp.id === e.target.value || emp.name === e.target.value
                        );
                        if (selected) {
                          setDeveloperId(selected.id);
                          setDeveloper(selected.name);
                        } else {
                          setDeveloper(e.target.value);
                        }
                      }}
                      className={selectClass(Boolean(developerId || developer))}
                    >
                      <option value="" disabled hidden>
                        Select developer
                      </option>
                      {employeeOptions.map((emp) => (
                        <option key={emp.id} value={emp.id} className="text-slate-800">
                          {emp.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Row 2, Col 2: Repository URL */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    Repository URL
                  </label>
                  <div className="relative">
                    <Link2 className="w-3.5 h-3.5 text-[#6366F1] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={repositoryUrl}
                      onChange={(e) => setRepositoryUrl(e.target.value)}
                      placeholder="e.g., https://github.com/k"
                      className={iconInputClass}
                    />
                  </div>
                </div>

                {/* Row 2, Col 3: Branch */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    Branch
                  </label>
                  <div className="relative">
                    <GitBranch className="w-3.5 h-3.5 text-[#6366F1] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g., feature/login"
                      className={`${iconInputClass} font-mono`}
                    />
                  </div>
                </div>

                {/* Row 2, Col 4: Environment */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    Environment
                  </label>
                  <div className="relative">
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value as DevelopmentEnvironment)}
                      className={selectClass(Boolean(environment))}
                    >
                      <option value="" disabled hidden>
                        Select environment
                      </option>
                      {ENVIRONMENT_OPTIONS.filter((e) => e !== 'All Environment').map((env) => (
                        <option key={env} value={env} className="text-slate-800">
                          {env}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Build & Review Details */}
            <div>
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg px-3 py-1.5 flex items-center gap-2 mb-2">
                <Settings className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span className="text-[11.5px] font-semibold text-slate-800 tracking-tight">
                  Build & Review Details
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-3.5 gap-y-2.5">
                {/* Build Version */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    Build Version
                  </label>
                  <input
                    type="text"
                    value={buildVersion}
                    onChange={(e) => setBuildVersion(e.target.value)}
                    placeholder="e.g., v1.2.0"
                    className={`${inputClass} font-mono`}
                  />
                </div>

                {/* Code Review Status */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    Code Review Status
                  </label>
                  <div className="relative">
                    <select
                      value={codeReviewStatus}
                      onChange={(e) => setCodeReviewStatus(e.target.value as CodeReviewStatus)}
                      className={selectClass(Boolean(codeReviewStatus))}
                    >
                      <option value="" disabled hidden>
                        Select status
                      </option>
                      {REVIEW_STATUS_OPTIONS.filter((s) => s !== 'All Review Status').map((st) => (
                        <option key={st} value={st} className="text-slate-800">
                          {st}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* QA Handoff Date */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    QA Handoff Date
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleOpenDatePicker}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      value={qaHandoffDate}
                      onChange={(e) => setQaHandoffDate(e.target.value)}
                      placeholder="Select date"
                      className={iconInputClass}
                    />
                    <input
                      ref={datePickerRef}
                      type="date"
                      tabIndex={-1}
                      aria-hidden="true"
                      className="absolute opacity-0 pointer-events-none w-0 h-0"
                      onChange={(e) => {
                        if (e.target.value) {
                          setQaHandoffDate(e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Release ID */}
                <div>
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    Release ID
                  </label>
                  <input
                    type="text"
                    value={releaseId}
                    onChange={(e) => setReleaseId(e.target.value)}
                    placeholder="e.g., REL-014"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Status & Notes */}
            <div>
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg px-3 py-1.5 flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span className="text-[11.5px] font-semibold text-slate-800 tracking-tight">
                  Status & Notes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-3.5 gap-y-2.5">
                {/* Status */}
                <div className="md:col-span-1">
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    <span className="text-red-500 mr-1">*</span>Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as DevelopmentStatus)}
                      className={selectClass(Boolean(status))}
                    >
                      <option value="" disabled hidden>
                        Select status
                      </option>
                      {STATUS_OPTIONS.filter((s) => s !== 'All Status').map((st) => (
                        <option key={st} value={st} className="text-slate-800">
                          {st}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Technical Notes */}
                <div className="md:col-span-3">
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    Technical Notes
                  </label>
                  <div className="relative">
                    <textarea
                      value={technicalNotes}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setTechnicalNotes(e.target.value);
                        }
                      }}
                      maxLength={500}
                      placeholder="Add technical notes (e.g., login API updated, UI changes, bug fixes...)"
                      className="modal-border-input w-full h-[68px] p-2.5 pb-5 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20 resize-none transition-colors"
                    />
                    <span className="absolute bottom-2 right-3 text-[11px] text-slate-400 pointer-events-none">
                      {technicalNotes.length} / 500
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Documentation */}
            <div>
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg px-3 py-1.5 flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span className="text-[11.5px] font-semibold text-slate-800 tracking-tight">
                  Documentation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-3.5 gap-y-2.5">
                <div className="md:col-span-2">
                  <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                    Documentation Link
                  </label>
                  <div className="relative">
                    <Link2 className="w-3.5 h-3.5 text-[#6366F1] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={documentationLink}
                      onChange={(e) => setDocumentationLink(e.target.value)}
                      placeholder="e.g., https://docs.kalpanaaa.com/dev-0433"
                      className={iconInputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions - visible at bottom with light border and identical button styling */}
          <div className="flex items-center justify-end gap-3 px-7 py-3 border-t border-[#F1F5F9] bg-white rounded-b-[20px] shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 bg-white border border-solid border-[#C7D5E8] hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Development'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
