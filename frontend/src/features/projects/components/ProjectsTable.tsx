import React, { useState, useEffect } from 'react';
import { MoreVertical, Plus, Search, ChevronLeft, ChevronRight, ChevronDown, Edit2, Trash2, Check } from 'lucide-react';
import { ExportButton } from '@/components/ui/ExportButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { Project } from '../types/project';

interface ProjectsTableProps {
  projects: Project[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onCreateProjectClick: () => void;
  onExportClick: () => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  onQuickStatusChange?: (project: Project, newStatus: string) => void;
  // Filters
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedClient: string;
  onClientChange: (client: string) => void;
  clientOptions: string[];
  selectedManager: string;
  onManagerChange: (manager: string) => void;
  managerOptions: string[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
}

const formatCurrency = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '₹ 0';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return '₹ 0';
  return '₹ ' + num.toLocaleString('en-IN');
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  totalRecords,
  currentPage,
  pageSize,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  onCreateProjectClick,
  onExportClick,
  onEditProject,
  onDeleteProject,
  onQuickStatusChange,
  searchQuery,
  onSearchChange,
  selectedClient,
  onClientChange,
  clientOptions,
  selectedManager,
  onManagerChange,
  managerOptions,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIdx = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalRecords);

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    let bg = '#EFF6FF';
    let border = '#BFDBFE';
    let color = '#4F46E5';

    if (s.includes('completed')) {
      bg = '#ECFDF5';
      border = '#A7F3D0';
      color = '#059669';
    } else if (s.includes('planning')) {
      bg = '#F8FAFC';
      border = '#E2E8F0';
      color = '#64748B';
    } else if (s.includes('hold') || s.includes('risk')) {
      bg = '#FFFBEB';
      border = '#FDE68A';
      color = '#D97706';
    }

    return (
      <span
        style={{
          boxSizing: 'border-box',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '24px',
          padding: '3px 10px',
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 500,
          fontFamily: 'Inter',
          color: color,
          whiteSpace: 'nowrap',
        }}
      >
        {status}
      </span>
    );
  };

  const renderPriorityBadge = (priority: string) => {
    const p = (priority || '').toLowerCase();
    let bg = '#FFFBEB';
    let border = '#FDE68A';
    let color = '#D97706';

    if (p.includes('high')) {
      bg = '#FEF2F2';
      border = '#FECACA';
      color = '#DC2626';
    } else if (p.includes('low')) {
      bg = '#F1F5F9';
      border = '#E2E8F0';
      color = '#475569';
    }

    return (
      <span
        style={{
          boxSizing: 'border-box',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '24px',
          padding: '3px 10px',
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 500,
          fontFamily: 'Inter',
          color: color,
          whiteSpace: 'nowrap',
        }}
      >
        {priority}
      </span>
    );
  };

  const renderHealthIndicator = (health: string) => {
    const isAtRisk = (health || '').toLowerCase().includes('risk');
    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '9999px',
            background: isAtRisk ? '#F59E0B' : '#10B981',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: '12px',
            lineHeight: '16px',
            color: isAtRisk ? '#F59E0B' : '#059669',
            whiteSpace: 'nowrap',
          }}
        >
          {health}
        </span>
      </div>
    );
  };

  const getDaysRemaining = (p: Project): number => {
    if (p.daysRemaining !== undefined && p.daysRemaining !== null) {
      return p.daysRemaining;
    }
    if ((p.status || '').toLowerCase() === 'completed') {
      return 0;
    }
    if (!p.plannedEndDate) return 0;
    try {
      const end = new Date(p.plannedEndDate);
      const now = new Date();
      end.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
  };

  const getScheduleStatus = (p: Project): string => {
    if (p.scheduleStatus) return p.scheduleStatus;
    const s = (p.status || '').toLowerCase();
    const h = (p.health || '').toLowerCase();
    if (s.includes('completed')) return 'Completed';
    if (h.includes('risk') || s.includes('hold')) return 'At Risk';
    if (p.plannedEndDate) {
      const end = new Date(p.plannedEndDate);
      const now = new Date();
      if (end.getTime() < now.getTime() && !s.includes('completed')) {
        return 'Delayed';
      }
    }
    return 'On Schedule';
  };

  const renderScheduleStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    let bg = '#ECFDF5';
    let border = '#A7F3D0';
    let color = '#059669';

    if (s.includes('risk') || s.includes('hold')) {
      bg = '#FFFBEB';
      border = '#FDE68A';
      color = '#D97706';
    } else if (s.includes('completed')) {
      bg = '#EFF6FF';
      border = '#BFDBFE';
      color = '#4F46E5';
    } else if (s.includes('delay')) {
      bg = '#FEF2F2';
      border = '#FECACA';
      color = '#DC2626';
    }

    return (
      <span
        style={{
          boxSizing: 'border-box',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '24px',
          padding: '3px 10px',
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 500,
          fontFamily: 'Inter',
          color: color,
          whiteSpace: 'nowrap',
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '20px',
        gap: '16px',
        width: '100%',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          height: '32px',
        }}
      >
        <div
          style={{
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: '18px',
            lineHeight: '28px',
            color: '#0F172A',
          }}
        >
          Projects
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <ExportButton onClick={onExportClick} />
          <button
            onClick={onCreateProjectClick}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '6px 14px',
              gap: '6px',
              height: '32px',
              background: '#4F46E5',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '12px',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
            Create Project
          </button>
        </div>
      </div>

      {/* Filter Bar matching Figma: 2 rows */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
        }}
      >
        {/* Row 1: Search + Client + Project Manager */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: '12px',
            width: '100%',
            flexWrap: 'wrap',
          }}
        >
          {/* Search Input */}
          <div
            style={{
              position: 'relative',
              flex: '1 1 300px',
              minWidth: '240px',
              height: '30px',
            }}
          >
            <Search
              size={14}
              color="#94A3B8"
              style={{
                position: 'absolute',
                left: '10px',
                top: '8px',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Project ID, Project Code, Project Name or Client ID..."
              style={{
                boxSizing: 'border-box',
                width: '100%',
                height: '30px',
                paddingLeft: '32px',
                paddingRight: '10px',
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

          {/* Client Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '155px' }}>
            <label
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '10px',
                lineHeight: '15px',
                color: '#94A3B8',
              }}
            >
              Client
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                value={selectedClient}
                onChange={(e) => onClientChange(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '30px',
                  padding: '4px 28px 4px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#334155',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                }}
              >
                <option value="All">All Clients</option>
                {clientOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                color="#64748B"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Project Manager Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '155px' }}>
            <label
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '10px',
                lineHeight: '15px',
                color: '#94A3B8',
              }}
            >
              Project Manager
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                value={selectedManager}
                onChange={(e) => onManagerChange(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '30px',
                  padding: '4px 28px 4px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#334155',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                }}
              >
                <option value="All">All Managers</option>
                {managerOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                color="#64748B"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Status + Priority (Each 50% width) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
          }}
        >
          {/* Status Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            <label
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '10px',
                lineHeight: '15px',
                color: '#94A3B8',
              }}
            >
              Status
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '30px',
                  padding: '4px 28px 4px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#334155',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                }}
              >
                <option value="All">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planning">Planning</option>
                <option value="On Hold">On Hold</option>
              </select>
              <ChevronDown
                size={14}
                color="#64748B"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Priority Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            <label
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '10px',
                lineHeight: '15px',
                color: '#94A3B8',
              }}
            >
              Priority
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                value={selectedPriority}
                onChange={(e) => onPriorityChange(e.target.value)}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: '30px',
                  padding: '4px 28px 4px 10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  color: '#334155',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                }}
              >
                <option value="All">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <ChevronDown
                size={14}
                color="#64748B"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 14-Column Projects Table */}
      <div
        style={{
          boxSizing: 'border-box',
          width: '100%',
          overflowX: 'auto',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
        }}
      >
        <table
          style={{
            width: '100%',
            minWidth: '1608.53px',
            borderCollapse: 'collapse',
            textAlign: 'left',
            whiteSpace: 'nowrap',
          }}
        >
          <thead>
            <tr
              style={{
                height: '42px',
                background: 'rgba(248, 250, 252, 0.75)',
                borderBottom: '1px solid #E2E8F0',
                whiteSpace: 'nowrap',
              }}
            >
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '119.84px' }}>Project ID</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '101.09px' }}>Project Code</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '213.45px' }}>Project Name</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '77.17px' }}>Client ID</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '140.48px' }}>Project Manager</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '106.03px' }}>Start Date</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '126.16px' }}>Planned End Date</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '113.47px' }}>Status</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '96.47px' }}>Priority</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '97.81px' }}>Health</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '111.95px' }}>Contract Value</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '118.22px', textAlign: 'center' }}>Days Remaining</th>
              <th style={{ padding: '12px 16px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '121.17px' }}>Schedule Status</th>
              <th style={{ padding: '12px', fontFamily: 'Inter', fontWeight: 700, fontSize: '11px', lineHeight: '16px', color: '#475569', width: '65.2px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} style={{ height: '53px', borderTop: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="text" width={75} height={12} /></td>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="text" width={65} height={12} /></td>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="text" width={130} height={12} /></td>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="text" width={60} height={12} /></td>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="text" width={90} height={12} /></td>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="text" width={75} height={12} /></td>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="text" width={75} height={12} /></td>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="badge" width={70} height={18} /></td>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="badge" width={60} height={18} /></td>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="badge" width={65} height={18} /></td>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="text" width={75} height={12} /></td>
                  <td style={{ padding: '18px 16px', textAlign: 'center' }}><Skeleton variant="text" width={30} height={12} className="mx-auto" /></td>
                  <td style={{ padding: '18px 16px' }}><Skeleton variant="badge" width={75} height={18} /></td>
                  <td style={{ padding: '12px', textAlign: 'center' }}><Skeleton variant="circular" width={22} height={22} className="mx-auto" /></td>
                </tr>
              ))
            ) : projects.length === 0 ? (
              <tr>
                <td
                  colSpan={14}
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    fontFamily: 'Inter',
                    fontSize: '13px',
                    color: '#94A3B8',
                  }}
                >
                  No projects found.
                </td>
              </tr>
            ) : (
              projects.map((p, idx) => (
                <tr
                  key={p.id || idx}
                  style={{
                    height: '53px',
                    borderTop: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  {/* Project ID */}
                  <td style={{ padding: '18px 16px 19px', fontFamily: 'Inter', fontWeight: 600, fontSize: '12px', lineHeight: '16px', color: '#4F46E5', cursor: 'pointer', width: '119.84px' }}>
                    {p.id}
                  </td>
                  {/* Project Code */}
                  <td style={{ padding: '18px 16px 19px', fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: '#475569', width: '101.09px' }}>
                    {p.projectCode}
                  </td>
                  {/* Project Name */}
                  <td style={{ padding: '18px 16px 19px', fontFamily: 'Inter', fontWeight: 600, fontSize: '12px', lineHeight: '16px', color: '#1E293B', width: '213.45px' }}>
                    {p.projectName}
                  </td>
                  {/* Client ID */}
                  <td style={{ padding: '18px 16px 19px', fontFamily: 'Inter', fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#4F46E5', cursor: 'pointer', width: '77.17px' }}>
                    {p.clientId}
                  </td>
                  {/* Project Manager */}
                  <td style={{ padding: '18px 16px 19px', fontFamily: 'Inter', fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#334155', width: '124.48px' }}>
                    {p.projectManager}
                  </td>
                  {/* Start Date */}
                  <td style={{ padding: '18px 16px 19px 32px', fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: '#64748B', width: '122.04px' }}>
                    {formatDate(p.startDate)}
                  </td>
                  {/* Planned End Date */}
                  <td style={{ padding: '18px 16px 19px', fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: '#64748B', width: '126.16px' }}>
                    {formatDate(p.plannedEndDate)}
                  </td>
                  {/* Status */}
                  <td style={{ padding: '14.5px 16px', width: '113.47px' }}>{renderStatusBadge(p.status)}</td>
                  {/* Priority */}
                  <td style={{ padding: '14.5px 16px', width: '96.47px' }}>{renderPriorityBadge(p.priority)}</td>
                  {/* Health */}
                  <td style={{ padding: '18px 16px 19px', width: '81.81px' }}>{renderHealthIndicator(p.health)}</td>
                  {/* Contract Value */}
                  <td style={{ padding: '18px 16px 19px 32px', fontFamily: 'Inter', fontWeight: 600, fontSize: '12px', lineHeight: '16px', color: '#1E293B', width: '127.95px' }}>
                    {formatCurrency(p.contractValue)}
                  </td>
                  {/* Days Remaining */}
                  <td style={{ padding: '18px 16px 19px', textAlign: 'center', fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: '#475569', width: '118.22px' }}>
                    {getDaysRemaining(p)}
                  </td>
                  {/* Schedule Status */}
                  <td style={{ padding: '14.5px 16px', width: '121.17px' }}>
                    {renderScheduleStatusBadge(getScheduleStatus(p))}
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '14.5px 12px', textAlign: 'center', position: 'relative', width: '65.2px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === p.id ? null : p.id);
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      className="hover:bg-slate-100"
                      title="Actions"
                    >
                      <MoreVertical size={16} color="#94A3B8" />
                    </button>

                    {activeMenuId === p.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '40px',
                          width: '160px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                          zIndex: 40,
                          padding: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          textAlign: 'left',
                        }}
                      >
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onEditProject?.(p);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            border: 'none',
                            background: 'transparent',
                            fontFamily: 'Inter',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#334155',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            width: '100%',
                          }}
                          className="hover:bg-slate-100"
                        >
                          <Edit2 size={13} color="#4F46E5" />
                          <span>Edit Project</span>
                        </button>

                        <div style={{ height: '1px', background: '#F1F5F9', margin: '2px 0' }} />

                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#94A3B8', padding: '2px 10px', textTransform: 'uppercase' }}>
                          Set Status
                        </div>
                        {['In Progress', 'Completed', 'Planning', 'On Hold', 'At Risk'].map((st) => (
                          <button
                            key={st}
                            onClick={() => {
                              setActiveMenuId(null);
                              onQuickStatusChange?.(p, st);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '4px 10px',
                              border: 'none',
                              background: p.status === st ? '#EFF6FF' : 'transparent',
                              fontFamily: 'Inter',
                              fontSize: '11px',
                              fontWeight: p.status === st ? 600 : 400,
                              color: p.status === st ? '#2563EB' : '#475569',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              width: '100%',
                            }}
                            className="hover:bg-slate-50"
                          >
                            <span>{st}</span>
                            {p.status === st && <Check size={12} color="#2563EB" />}
                          </button>
                        ))}

                        <div style={{ height: '1px', background: '#F1F5F9', margin: '2px 0' }} />

                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onDeleteProject?.(p);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            border: 'none',
                            background: 'transparent',
                            fontFamily: 'Inter',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#DC2626',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            width: '100%',
                          }}
                          className="hover:bg-red-50"
                        >
                          <Trash2 size={13} color="#DC2626" />
                          <span>Delete Project</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0px 0px',
          width: '100%',
          borderTop: '1px solid #F1F5F9',
        }}
      >
        {/* Record count summary */}
        <div
          style={{
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#64748B',
          }}
        >
          Showing <span style={{ fontWeight: 600, color: '#0F172A' }}>{startIdx} – {endIdx}</span> of{' '}
          <span style={{ fontWeight: 600, color: '#0F172A' }}>{totalRecords}</span> records
        </div>

        {/* Page controls + Size dropdown */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px' }}>
            {/* Prev button */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '28px',
                height: '28px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={14} color="#64748B" />
            </button>

            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pg) => {
              const isActive = pg === currentPage;
              return (
                <button
                  key={pg}
                  onClick={() => onPageChange(pg)}
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '28px',
                    height: '28px',
                    background: isActive ? '#4F46E5' : '#FFFFFF',
                    border: isActive ? 'none' : '1px solid #E2E8F0',
                    borderRadius: '4px',
                    fontFamily: 'Inter',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '12px',
                    color: isActive ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {pg}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span style={{ padding: '0 4px', color: '#94A3B8', fontSize: '12px' }}>...</span>
                <button
                  onClick={() => onPageChange(totalPages)}
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '28px',
                    height: '28px',
                    background: currentPage === totalPages ? '#4F46E5' : '#FFFFFF',
                    border: currentPage === totalPages ? 'none' : '1px solid #E2E8F0',
                    borderRadius: '4px',
                    fontFamily: 'Inter',
                    fontWeight: currentPage === totalPages ? 600 : 400,
                    fontSize: '12px',
                    color: currentPage === totalPages ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {totalPages}
                </button>
              </>
            )}

            {/* Next button */}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '28px',
                height: '28px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.5 : 1,
              }}
            >
              <ChevronRight size={14} color="#64748B" />
            </button>
          </div>

          {/* Page Size Dropdown */}
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              boxSizing: 'border-box',
              height: '28px',
              padding: '2px 8px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '4px',
              fontFamily: 'Inter',
              fontSize: '12px',
              color: '#475569',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>
    </div>
  );
};

