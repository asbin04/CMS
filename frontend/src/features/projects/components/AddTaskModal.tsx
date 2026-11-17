import React, { useState, useEffect } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { CreateTaskPayload } from '../types/project';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskPayload) => Promise<void>;
  projectOptions: string[];
  assigneeOptions: string[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectOptions,
  assigneeOptions,
}) => {
  const [projectId, setProjectId] = useState(projectOptions[0] || '');
  const [milestone, setMilestone] = useState('');
  const [taskName, setTaskName] = useState('');
  const [assignedTo, setAssignedTo] = useState(assigneeOptions[0] || '');
  const [priority, setPriority] = useState('Medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('40');
  const [status, setStatus] = useState('In Progress');
  const [dependencies, setDependencies] = useState('None');
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

    if (!projectId || !milestone.trim() || !taskName.trim() || !assignedTo || !startDate || !dueDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        projectId: projectId.trim(),
        milestone: milestone.trim(),
        taskName: taskName.trim(),
        assignedTo: assignedTo.trim(),
        priority,
        startDate,
        dueDate,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : 0,
        actualHours: 0,
        status,
        progress: 0,
        dependencies: dependencies.trim() || 'None',
        subtasksCompleted: 0,
        subtasksTotal: 0,
        health: 'On Track',
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create task');
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
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckSquare size={18} color="#4F46E5" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'Inter', fontWeight: 700, fontSize: '16px', color: '#0F172A' }}>
                Create Project Task
              </h3>
              <p style={{ margin: 0, fontFamily: 'Inter', fontSize: '12px', color: '#64748B' }}>
                Assign milestone deliverable to team member
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
                Project *
              </label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="e.g. PRJ-001"
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
                Milestone *
              </label>
              <input
                type="text"
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                placeholder="e.g. M1 - Planning"
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
              Task Name *
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Backend Architecture & Security Review"
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
                Assigned To *
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Sneha Nair"
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
                Estimated Hours
              </label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="e.g. 40"
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
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
                <option value="Review">Review</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'Inter', fontWeight: 500, fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
              Dependencies
            </label>
            <input
              type="text"
              value={dependencies}
              onChange={(e) => setDependencies(e.target.value)}
              placeholder="e.g. TSK-00128 or None"
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
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

