import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Check } from 'lucide-react';
import { ProjectTask, UpdateTaskPayload } from '../types/project';

interface EditTaskModalProps {
  isOpen: boolean;
  task: ProjectTask | null;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateTaskPayload) => Promise<void>;
  projectOptions: string[];
  assigneeOptions: string[];
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  task,
  onClose,
  onSubmit,
  projectOptions,
  assigneeOptions,
}) => {
  const [projectId, setProjectId] = useState('');
  const [milestone, setMilestone] = useState('');
  const [taskName, setTaskName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [progress, setProgress] = useState(0);
  const [dependencies, setDependencies] = useState('None');
  const [health, setHealth] = useState('On Track');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setProjectId(task.projectId || (projectOptions[0] || ''));
      setMilestone(task.milestone || '');
      setTaskName(task.taskName || '');
      setAssignedTo(task.assignedTo || (assigneeOptions[0] || ''));
      setPriority(task.priority || 'Medium');
      setStartDate(task.startDate ? task.startDate.substring(0, 10) : '');
      setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
      setEstimatedHours(task.estimatedHours != null ? String(task.estimatedHours) : '40');
      setActualHours(task.actualHours != null ? String(task.actualHours) : '0');
      setStatus(task.status || 'In Progress');
      setProgress(task.progress || 0);
      setDependencies(task.dependencies || 'None');
      setHealth(task.health || 'On Track');
    }
  }, [task, projectOptions, assigneeOptions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!projectId || !milestone.trim() || !taskName.trim() || !assignedTo || !startDate || !dueDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(task.id, {
        projectId: projectId.trim(),
        milestone: milestone.trim(),
        taskName: taskName.trim(),
        assignedTo: assignedTo.trim(),
        priority,
        startDate,
        dueDate,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : 0,
        actualHours: actualHours ? parseFloat(actualHours) : 0,
        status,
        progress: Number(progress),
        dependencies: dependencies.trim() || 'None',
        health,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update task');
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
                background: '#EEF2FF',
                border: '1px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckSquare size={18} color="#4F46E5" />
            </div>
            <div>
              <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '18px', color: '#0F172A' }}>
                Edit Task ({task.id})
              </div>
              <div style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', color: '#64748B' }}>
                Update task progress, milestone and schedule.
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
          {/* Row 1: Task Name */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
              Task Name *
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
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

          {/* Row 2: Project & Milestone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
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
                {projectOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Milestone *
              </label>
              <input
                type="text"
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                required
                placeholder="e.g. M1 - Planning"
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

          {/* Row 3: Assigned To & Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Assigned To *
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
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
                {assigneeOptions.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
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
          </div>

          {/* Row 4: Start Date & Due Date */}
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
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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

          {/* Row 5: Estimated Hours, Actual Hours & Dependencies */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                Est. Hours
              </label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
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
                Actual Hours
              </label>
              <input
                type="number"
                value={actualHours}
                onChange={(e) => setActualHours(e.target.value)}
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
                Dependencies
              </label>
              <input
                type="text"
                value={dependencies}
                onChange={(e) => setDependencies(e.target.value)}
                placeholder="e.g. None"
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

          {/* Row 6: Status & Progress */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                <option value="Pending">Pending</option>
                <option value="Review">Review</option>
                <option value="Blocked">Blocked</option>
              </select>
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

