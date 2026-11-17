import React, { useState, useEffect } from 'react';
import { X, Folder } from 'lucide-react';
import { CreateProjectPayload } from '../types/project';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectPayload) => Promise<void>;
  clientOptions: string[];
  managerOptions: string[];
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clientOptions,
  managerOptions,
}) => {
  const [projectCode, setProjectCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientId, setClientId] = useState(clientOptions[0] || '');
  const [projectManager, setProjectManager] = useState(managerOptions[0] || '');
  const [startDate, setStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [priority, setPriority] = useState('Medium');
  const [contractValue, setContractValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!projectCode.trim() || !projectName.trim() || !clientId || !projectManager || !startDate || !plannedEndDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        projectCode: projectCode.trim(),
        projectName: projectName.trim(),
        clientId: clientId.trim(),
        projectManager: projectManager.trim(),
        startDate,
        plannedEndDate,
        status,
        priority,
        health: 'On Track',
        contractValue: contractValue ? parseFloat(contractValue.replace(/[^0-9.]/g, '')) : 0,
        tasksCompleted: 0,
        tasksTotal: 0,
        progress: 0,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create project');
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
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Folder size={18} color="#059669" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'Inter', fontWeight: 700, fontSize: '16px', color: '#0F172A' }}>
                Create New Project
              </h3>
              <p style={{ margin: 0, fontFamily: 'Inter', fontSize: '12px', color: '#64748B' }}>
                Add project scope, assigned client and manager
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} color="#64748B" />
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
              marginBottom: '16px',
            }}
          >
            {formError}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontWeight: 500, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                Project Code *
              </label>
              <input
                type="text"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                placeholder="e.g. PRJ-011"
                required
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '34px',
                  padding: '6px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontWeight: 500, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                Client ID *
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="e.g. CL-001"
                required
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '34px',
                  padding: '6px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'Inter', fontWeight: 500, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. NextGen Cloud Portal"
              required
              style={{
                boxSizing: 'border-box',
                width: '100%',
                height: '34px',
                padding: '6px 10px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontSize: '12px',
                color: '#0F172A',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontWeight: 500, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                Project Manager *
              </label>
              <input
                type="text"
                value={projectManager}
                onChange={(e) => setProjectManager(e.target.value)}
                placeholder="Enter project manager name"
                required
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '34px',
                  padding: '6px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontWeight: 500, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                Contract Value (₹)
              </label>
              <input
                type="number"
                value={contractValue}
                onChange={(e) => setContractValue(e.target.value)}
                placeholder="e.g. 1500000"
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '34px',
                  padding: '6px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontWeight: 500, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '34px',
                  padding: '6px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontWeight: 500, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                Planned End Date *
              </label>
              <input
                type="date"
                value={plannedEndDate}
                onChange={(e) => setPlannedEndDate(e.target.value)}
                required
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '34px',
                  padding: '6px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontWeight: 500, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '34px',
                  padding: '6px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planning">Planning</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontWeight: 500, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '34px',
                  padding: '6px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                boxSizing: 'border-box',
                padding: '8px 16px',
                height: '34px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '12px',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                boxSizing: 'border-box',
                padding: '8px 18px',
                height: '34px',
                background: '#4F46E5',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '12px',
                color: '#FFFFFF',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

