import React, { useState, useEffect } from 'react';
import { X, Folder, Check } from 'lucide-react';
import { Project, UpdateProjectPayload } from '../types/project';

interface EditProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateProjectPayload) => Promise<void>;
  clientOptions: string[];
  managerOptions: string[];
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onSubmit,
  clientOptions,
  managerOptions,
}) => {
  const [projectCode, setProjectCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientId, setClientId] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [startDate, setStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [priority, setPriority] = useState('Medium');
  const [health, setHealth] = useState('On Track');
  const [contractValue, setContractValue] = useState('');
  const [progress, setProgress] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setProjectCode(project.projectCode || '');
      setProjectName(project.projectName || '');
      setClientId(project.clientId || (clientOptions[0] || ''));
      setProjectManager(project.projectManager || (managerOptions[0] || ''));
      setStartDate(project.startDate ? project.startDate.substring(0, 10) : '');
      setPlannedEndDate(project.plannedEndDate ? project.plannedEndDate.substring(0, 10) : '');
      setStatus(project.status || 'In Progress');
      setPriority(project.priority || 'Medium');
      setHealth(project.health || 'On Track');
      setContractValue(project.contractValue != null ? String(project.contractValue) : '');
      setProgress(project.progress || 0);
      setTasksCompleted(project.tasksCompleted || 0);
      setTasksTotal(project.tasksTotal || 0);
    }
  }, [project, clientOptions, managerOptions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!projectCode.trim() || !projectName.trim() || !clientId || !projectManager || !startDate || !plannedEndDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(project.id, {
        projectCode: projectCode.trim(),
        projectName: projectName.trim(),
        clientId: clientId.trim(),
        projectManager: projectManager.trim(),
        startDate,
        plannedEndDate,
        status,
        priority,
        health,
        contractValue: contractValue ? parseFloat(contractValue.replace(/[^0-9.]/g, '')) : 0,
        tasksCompleted,
        tasksTotal,
        progress: Number(progress),
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Folder size={18} color="#059669" />
            </div>
            <div>
              <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '18px', color: '#0F172A' }}>
                Edit Project ({project.id})
              </div>
              <div style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', color: '#64748B' }}>
                Update project details and status.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {formError && (
          <div
            style={{
              padding: '10px 14px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontSize: '12px',
              color: '#DC2626',
            }}
          >
            {formError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1: Code & Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Project Code *
              </label>
              <input
                type="text"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Project Name *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Row 2: Client & Project Manager */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Client ID *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#0F172A',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              >
                {clientOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Project Manager *
              </label>
              <select
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#0F172A',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              >
                {managerOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Start Date & Planned End Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Planned End Date *
              </label>
              <input
                type="date"
                value={plannedEndDate}
                onChange={(e) => setPlannedEndDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Row 4: Status, Priority & Health */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#0F172A',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planning">Planning</option>
                <option value="On Hold">On Hold</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#0F172A',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Health
              </label>
              <select
                value={health}
                onChange={(e) => setHealth(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#0F172A',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              >
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>
          </div>

          {/* Row 5: Contract Value & Progress */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Contract Value (₹)
              </label>
              <input
                type="number"
                value={contractValue}
                onChange={(e) => setContractValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '13px',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Progress ({progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                style={{
                  width: '100%',
                  marginTop: '8px',
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '13px',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#4F46E5',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '13px',
                color: '#FFFFFF',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <Check size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

