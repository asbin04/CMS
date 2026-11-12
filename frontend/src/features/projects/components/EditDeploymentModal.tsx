import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DeploymentItem, UpdateDeploymentPayload } from '../types/deployment';

interface EditDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, payload: UpdateDeploymentPayload) => Promise<void>;
  deployment: DeploymentItem | null;
  projectOptions: string[];
}

export const EditDeploymentModal: React.FC<EditDeploymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  deployment,
  projectOptions,
}) => {
  const [projectId, setProjectId] = useState('PRJ-001');
  const [releaseVersion, setReleaseVersion] = useState('');
  const [deploymentDate, setDeploymentDate] = useState('');
  const [environment, setEnvironment] = useState('Production');
  const [deploymentOwner, setDeploymentOwner] = useState('');
  const [preDeploymentChecklist, setPreDeploymentChecklist] = useState('Completed');
  const [backupCompleted, setBackupCompleted] = useState('Yes');
  const [rollbackPlan, setRollbackPlan] = useState('Available');
  const [smokeTest, setSmokeTest] = useState('Successful');
  const [status, setStatus] = useState('Live');
  const [clientSignOff, setClientSignOff] = useState('Completed');
  const [goLiveDate, setGoLiveDate] = useState('');
  const [handoverStatus, setHandoverStatus] = useState('Handed Over');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (deployment) {
      setProjectId(deployment.projectId || 'PRJ-001');
      setReleaseVersion(deployment.releaseVersion || '');
      setDeploymentDate(deployment.deploymentDate || '');
      setEnvironment(deployment.environment || 'Production');
      setDeploymentOwner(deployment.deploymentOwner || '');
      setPreDeploymentChecklist(deployment.preDeploymentChecklist || 'Completed');
      setBackupCompleted(deployment.backupCompleted || 'Yes');
      setRollbackPlan(deployment.rollbackPlan || 'Available');
      setSmokeTest(deployment.smokeTest || 'Successful');
      setStatus(deployment.status || 'Live');
      setClientSignOff(deployment.clientSignOff || 'Completed');
      setGoLiveDate(deployment.goLiveDate || '');
      setHandoverStatus(deployment.handoverStatus || 'Handed Over');
      setReleaseNotes(deployment.releaseNotes || '');
    }
  }, [deployment]);

  if (!isOpen || !deployment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseVersion.trim()) {
      setError('Release Version is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(deployment.id, {
        projectId,
        releaseVersion: releaseVersion.trim(),
        deploymentDate: deploymentDate.trim(),
        environment,
        deploymentOwner: deploymentOwner.trim(),
        preDeploymentChecklist,
        backupCompleted,
        rollbackPlan,
        smokeTest,
        status,
        clientSignOff,
        goLiveDate: goLiveDate.trim() || '-',
        handoverStatus,
        releaseNotes: releaseNotes.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update deployment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-['Inter']">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div>
            <h2 className="text-[16px] font-bold text-[#0F172A]">Edit Deployment</h2>
            <span className="text-[12px] font-semibold text-[#4F46E5]">{deployment.id}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[12px]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Project ID
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              >
                {projectOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Release Version *
              </label>
              <input
                type="text"
                value={releaseVersion}
                onChange={(e) => setReleaseVersion(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="UAT">UAT</option>
                <option value="QA">QA</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Deployment Owner
              </label>
              <input
                type="text"
                value={deploymentOwner}
                onChange={(e) => setDeploymentOwner(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Deployment Date
              </label>
              <input
                type="text"
                value={deploymentDate}
                onChange={(e) => setDeploymentDate(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Go-Live Date
              </label>
              <input
                type="text"
                value={goLiveDate}
                onChange={(e) => setGoLiveDate(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Pre-Deployment Checklist
              </label>
              <select
                value={preDeploymentChecklist}
                onChange={(e) => setPreDeploymentChecklist(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Backup Completed
              </label>
              <select
                value={backupCompleted}
                onChange={(e) => setBackupCompleted(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Rollback Plan
              </label>
              <select
                value={rollbackPlan}
                onChange={(e) => setRollbackPlan(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Smoke Test
              </label>
              <select
                value={smokeTest}
                onChange={(e) => setSmokeTest(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Successful">Successful</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Live">Live</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                Handover Status
              </label>
              <select
                value={handoverStatus}
                onChange={(e) => setHandoverStatus(e.target.value)}
                className="w-full h-[36px] px-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Handed Over">Handed Over</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#334155] mb-1">
              Release Notes
            </label>
            <textarea
              rows={3}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              className="w-full p-3 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-[13px] font-semibold text-[#475569] hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

