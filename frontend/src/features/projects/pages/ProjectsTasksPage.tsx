import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Folder, CheckCircle } from 'lucide-react';
import { ReloadButton } from '@/components/ui/ReloadButton';
import {
  Project,
  ProjectTask,
  ProjectKpis,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
} from '../types/project';
import { projectService } from '../services/projectService';
import { masterDataService, MasterClient, MasterEmployee } from '@/services/masterDataService';
import { ProjectKpiCards } from '../components/ProjectKpiCards';
import { ProjectsTable } from '../components/ProjectsTable';
import { ProjectTasksTable } from '../components/ProjectTasksTable';
import { AddProjectModal } from '../components/AddProjectModal';
import { EditProjectModal } from '../components/EditProjectModal';
import { AddTaskModal } from '../components/AddTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PRJ-2026-048',
    projectCode: 'PRJ-001',
    projectName: 'School Management System',
    clientId: 'CL-001',
    projectManager: 'Amit Sharma',
    startDate: '2026-10-01',
    plannedEndDate: '2026-12-31',
    status: 'In Progress',
    priority: 'High',
    health: 'On Track',
    contractValue: 12000000,
    tasksCompleted: 12,
    tasksTotal: 18,
    progress: 65,
    daysRemaining: 60,
    scheduleStatus: 'On Schedule',
  },
  {
    id: 'PRJ-2026-047',
    projectCode: 'PRJ-002',
    projectName: 'Homeopathy Clinic Portal',
    clientId: 'CL-003',
    projectManager: 'Sneha Nair',
    startDate: '2026-09-15',
    plannedEndDate: '2026-11-15',
    status: 'In Progress',
    priority: 'Medium',
    health: 'At Risk',
    contractValue: 4800000,
    tasksCompleted: 8,
    tasksTotal: 12,
    progress: 70,
    daysRemaining: 15,
    scheduleStatus: 'At Risk',
  },
  {
    id: 'PRJ-2026-046',
    projectCode: 'PRJ-003',
    projectName: 'Company Management System',
    clientId: 'CL-002',
    projectManager: 'Rohan Verma',
    startDate: '2026-09-01',
    plannedEndDate: '2026-11-30',
    status: 'In Progress',
    priority: 'High',
    health: 'On Track',
    contractValue: 8600000,
    tasksCompleted: 14,
    tasksTotal: 20,
    progress: 45,
    daysRemaining: 30,
    scheduleStatus: 'On Schedule',
  },
  {
    id: 'PRJ-2026-045',
    projectCode: 'PRJ-004',
    projectName: 'Laundry Services Website',
    clientId: 'CL-005',
    projectManager: 'Divya Patel',
    startDate: '2026-08-20',
    plannedEndDate: '2026-10-20',
    status: 'In Progress',
    priority: 'Medium',
    health: 'On Track',
    contractValue: 1800000,
    tasksCompleted: 6,
    tasksTotal: 10,
    progress: 80,
    daysRemaining: 10,
    scheduleStatus: 'On Schedule',
  },
  {
    id: 'PRJ-2026-044',
    projectCode: 'PRJ-005',
    projectName: 'AI Chatbot Automation',
    clientId: 'CL-004',
    projectManager: 'Vikram Shah',
    startDate: '2026-08-10',
    plannedEndDate: '2026-09-30',
    status: 'Completed',
    priority: 'Low',
    health: 'Healthy',
    contractValue: 5600000,
    tasksCompleted: 15,
    tasksTotal: 15,
    progress: 100,
    daysRemaining: 0,
    scheduleStatus: 'Completed',
  },
  {
    id: 'PRJ-2026-043',
    projectCode: 'PRJ-006',
    projectName: 'Logistics Fleet Tracking App',
    clientId: 'CL-006',
    projectManager: 'Amit Sharma',
    startDate: '2026-07-01',
    plannedEndDate: '2026-11-15',
    status: 'In Progress',
    priority: 'High',
    health: 'On Track',
    contractValue: 1850000,
    tasksCompleted: 20,
    tasksTotal: 25,
    progress: 80,
  },
  {
    id: 'PRJ-2026-042',
    projectCode: 'PRJ-007',
    projectName: 'Hospital OPD Management System',
    clientId: 'CL-007',
    projectManager: 'Sneha Nair',
    startDate: '2026-06-15',
    plannedEndDate: '2026-10-31',
    status: 'In Progress',
    priority: 'Medium',
    health: 'At Risk',
    contractValue: 950000,
    tasksCompleted: 11,
    tasksTotal: 18,
    progress: 60,
  },
  {
    id: 'PRJ-2026-041',
    projectCode: 'PRJ-008',
    projectName: 'Fintech Payment Gateway Integration',
    clientId: 'CL-008',
    projectManager: 'Rohan Verma',
    startDate: '2026-05-10',
    plannedEndDate: '2026-09-30',
    status: 'Completed',
    priority: 'High',
    health: 'On Track',
    contractValue: 2200000,
    tasksCompleted: 30,
    tasksTotal: 30,
    progress: 100,
  },
  {
    id: 'PRJ-2026-040',
    projectCode: 'PRJ-009',
    projectName: 'Retail E-commerce Storefront',
    clientId: 'CL-009',
    projectManager: 'Divya Patel',
    startDate: '2026-04-01',
    plannedEndDate: '2026-08-15',
    status: 'Completed',
    priority: 'Low',
    health: 'On Track',
    contractValue: 650000,
    tasksCompleted: 16,
    tasksTotal: 16,
    progress: 100,
  },
  {
    id: 'PRJ-2026-039',
    projectCode: 'PRJ-010',
    projectName: 'HRMS Employee Self-Service App',
    clientId: 'CL-010',
    projectManager: 'Vikram Shah',
    startDate: '2026-03-01',
    plannedEndDate: '2026-07-31',
    status: 'Completed',
    priority: 'Medium',
    health: 'On Track',
    contractValue: 1100000,
    tasksCompleted: 22,
    tasksTotal: 22,
    progress: 100,
  },
];

export const INITIAL_TASKS: ProjectTask[] = [
  {
    id: 'TSK-00128',
    projectId: 'PRJ-001',
    milestone: 'M1 - Planning',
    taskName: 'Requirement Analysis',
    assignedTo: 'Amit Sharma',
    priority: 'High',
    startDate: '2026-10-01',
    dueDate: '2026-10-05',
    estimatedHours: 24,
    actualHours: 20,
    status: 'In Progress',
    progress: 80,
    dependencies: 'None',
    subtasksCompleted: 3,
    subtasksTotal: 4,
    health: 'On Track',
    billable: true,
    daysRemaining: 2,
  },
  {
    id: 'TSK-00127',
    projectId: 'PRJ-001',
    milestone: 'M2 - Design',
    taskName: 'UI/UX Design',
    assignedTo: 'Sneha Nair',
    priority: 'High',
    startDate: '2026-10-06',
    dueDate: '2026-10-15',
    estimatedHours: 40,
    actualHours: 24,
    status: 'In Progress',
    progress: 60,
    dependencies: 'TSK-00128',
    subtasksCompleted: 4,
    subtasksTotal: 6,
    health: 'On Track',
    billable: true,
    daysRemaining: 5,
  },
  {
    id: 'TSK-00126',
    projectId: 'PRJ-002',
    milestone: 'M1 - Setup',
    taskName: 'System Configuration',
    assignedTo: 'Rohan Verma',
    priority: 'Medium',
    startDate: '2026-09-15',
    dueDate: '2026-09-20',
    estimatedHours: 16,
    actualHours: 16,
    status: 'Completed',
    progress: 100,
    dependencies: 'None',
    subtasksCompleted: 2,
    subtasksTotal: 2,
    health: 'Healthy',
    billable: true,
    daysRemaining: 0,
  },
  {
    id: 'TSK-00125',
    projectId: 'PRJ-003',
    milestone: 'M2 - Development',
    taskName: 'API Integration',
    assignedTo: 'Divya Patel',
    priority: 'High',
    startDate: '2026-09-10',
    dueDate: '2026-09-25',
    estimatedHours: 48,
    actualHours: 36,
    status: 'In Progress',
    progress: 75,
    dependencies: 'TSK-00124',
    subtasksCompleted: 5,
    subtasksTotal: 8,
    health: 'At Risk',
    billable: true,
    daysRemaining: 5,
  },
  {
    id: 'TSK-00124',
    projectId: 'PRJ-003',
    milestone: 'M3 - Testing',
    taskName: 'System Testing',
    assignedTo: 'Vikram Shah',
    priority: 'Medium',
    startDate: '2026-09-26',
    dueDate: '2026-10-05',
    estimatedHours: 24,
    actualHours: 8,
    status: 'In Progress',
    progress: 33,
    dependencies: 'TSK-00125',
    subtasksCompleted: 2,
    subtasksTotal: 5,
    health: 'On Track',
    billable: false,
    daysRemaining: 7,
  },
  {
    id: 'TSK-00123',
    projectId: 'PRJ-001',
    milestone: 'M3 - Development',
    taskName: 'Database Schema & Migrations',
    assignedTo: 'Amit Sharma',
    priority: 'High',
    startDate: '2026-10-16',
    dueDate: '2026-10-25',
    estimatedHours: 45,
    actualHours: 20,
    status: 'In Progress',
    progress: 45,
    dependencies: 'TSK-00127',
    subtasksCompleted: 2,
    subtasksTotal: 4,
    health: 'On Track',
  },
  {
    id: 'TSK-00122',
    projectId: 'PRJ-002',
    milestone: 'M2 - Development',
    taskName: 'Patient Record Module',
    assignedTo: 'Sneha Nair',
    priority: 'Medium',
    startDate: '2026-09-21',
    dueDate: '2026-10-10',
    estimatedHours: 70,
    actualHours: 65,
    status: 'In Progress',
    progress: 90,
    dependencies: 'TSK-00126',
    subtasksCompleted: 6,
    subtasksTotal: 7,
    health: 'On Track',
  },
  {
    id: 'TSK-00121',
    projectId: 'PRJ-004',
    milestone: 'M1 - Planning',
    taskName: 'Catalog & Booking Workflow',
    assignedTo: 'Divya Patel',
    priority: 'Low',
    startDate: '2026-08-20',
    dueDate: '2026-09-05',
    estimatedHours: 35,
    actualHours: 35,
    status: 'Completed',
    progress: 100,
    dependencies: 'None',
    subtasksCompleted: 3,
    subtasksTotal: 3,
    health: 'On Track',
  },
  {
    id: 'TSK-00120',
    projectId: 'PRJ-005',
    milestone: 'M2 - Development',
    taskName: 'NLP Intent Model Training',
    assignedTo: 'Vikram Shah',
    priority: 'High',
    startDate: '2026-08-25',
    dueDate: '2026-09-15',
    estimatedHours: 60,
    actualHours: 60,
    status: 'Completed',
    progress: 100,
    dependencies: 'None',
    subtasksCompleted: 4,
    subtasksTotal: 4,
    health: 'On Track',
  },
  {
    id: 'TSK-00119',
    projectId: 'PRJ-006',
    milestone: 'M1 - Setup',
    taskName: 'GPS Telemetry Integration',
    assignedTo: 'Amit Sharma',
    priority: 'High',
    startDate: '2026-07-10',
    dueDate: '2026-08-05',
    estimatedHours: 80,
    actualHours: 75,
    status: 'Completed',
    progress: 100,
    dependencies: 'None',
    subtasksCompleted: 5,
    subtasksTotal: 5,
    health: 'On Track',
  },
];

export const ProjectsTasksPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<ProjectTask[]>(INITIAL_TASKS);
  const [masterClients, setMasterClients] = useState<MasterClient[]>([]);
  const [masterEmployees, setMasterEmployees] = useState<MasterEmployee[]>([]);
  const [kpis, setKpis] = useState<ProjectKpis>({
    totalProjects: 48,
    totalProjectsTrend: '↑ 12% vs last month',
    activeProjects: 32,
    activeProjectsTrend: '↑ 18% vs last month',
    projectsAtRisk: 6,
    projectsAtRiskTrend: '↓ 5% vs last month',
    totalContractValue: 48690,
    totalContractValueFormatted: '₹ 4,8690',
    totalContractValueTrend: '↑ 14% vs last month',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<ProjectTask | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    type: 'project' | 'task';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Projects Filter & Pagination State
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState('All');
  const [selectedManager, setSelectedManager] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [projectPage, setProjectPage] = useState(1);
  const [projectPageSize, setProjectPageSize] = useState(10);

  // Tasks Filter & Pagination State
  const [taskSearch, setTaskSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedMilestone, setSelectedMilestone] = useState('All');
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [selectedTaskStatus, setSelectedTaskStatus] = useState('All');
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize, setTaskPageSize] = useState(10);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Fetch live data from backend API and master tables
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [pData, tData, kData, mClients, mEmps] = await Promise.all([
        projectService.getProjects().catch(() => []),
        projectService.getTasks().catch(() => []),
        projectService.getProjectKpis().catch(() => null),
        masterDataService.getClients().catch(() => []),
        masterDataService.getEmployees().catch(() => []),
      ]);
      if (pData && pData.length > 0) setProjects(pData);
      if (tData && tData.length > 0) setTasks(tData);
      if (kData) setKpis(kData);
      if (mClients && mClients.length > 0) setMasterClients(mClients);
      if (mEmps && mEmps.length > 0) setMasterEmployees(mEmps);
    } catch {
      // Don't wipe initialized design data on transient network hiccups
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived filter options combining master tables and current data
  const clientOptions = useMemo(() => {
    const fromMaster = masterClients.map((c) => c.id || c.name || '').filter(Boolean);
    const fromProjects = projects.map((p) => p.clientId).filter(Boolean);
    return Array.from(new Set([...fromProjects, ...fromMaster]));
  }, [projects, masterClients]);

  const managerOptions = useMemo(() => {
    const fromMaster = masterEmployees.map((e) => e.fullName).filter(Boolean);
    const fromProjects = projects.map((p) => p.projectManager).filter(Boolean);
    return Array.from(new Set([...fromProjects, ...fromMaster]));
  }, [projects, masterEmployees]);

  const projectOptions = useMemo(() => {
    const fromProjects = projects.map((p) => p.projectCode || p.id).filter(Boolean);
    const fromTasks = tasks.map((t) => t.projectId).filter(Boolean);
    return Array.from(new Set([...fromTasks, ...fromProjects]));
  }, [tasks, projects]);

  const milestoneOptions = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.milestone).filter(Boolean)));
  }, [tasks]);

  const assigneeOptions = useMemo(() => {
    const fromMaster = masterEmployees.map((e) => e.fullName).filter(Boolean);
    const fromTasks = tasks.map((t) => t.assignedTo).filter(Boolean);
    return Array.from(new Set([...fromTasks, ...fromMaster]));
  }, [tasks, masterEmployees]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (projectSearch.trim()) {
        const query = projectSearch.toLowerCase();
        const match =
          (p.id && p.id.toLowerCase().includes(query)) ||
          (p.projectCode && p.projectCode.toLowerCase().includes(query)) ||
          (p.projectName && p.projectName.toLowerCase().includes(query)) ||
          (p.clientId && p.clientId.toLowerCase().includes(query));
        if (!match) return false;
      }
      if (selectedClient !== 'All' && p.clientId !== selectedClient) return false;
      if (selectedManager !== 'All' && p.projectManager !== selectedManager) return false;
      if (selectedStatus !== 'All' && p.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      if (selectedPriority !== 'All' && p.priority.toLowerCase() !== selectedPriority.toLowerCase()) return false;
      return true;
    });
  }, [projects, projectSearch, selectedClient, selectedManager, selectedStatus, selectedPriority]);

  const paginatedProjects = useMemo(() => {
    const start = (projectPage - 1) * projectPageSize;
    return filteredProjects.slice(start, start + projectPageSize);
  }, [filteredProjects, projectPage, projectPageSize]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (taskSearch.trim()) {
        const query = taskSearch.toLowerCase();
        const match =
          (t.id && t.id.toLowerCase().includes(query)) ||
          (t.projectId && t.projectId.toLowerCase().includes(query)) ||
          (t.taskName && t.taskName.toLowerCase().includes(query)) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(query));
        if (!match) return false;
      }
      if (selectedProject !== 'All' && t.projectId !== selectedProject) return false;
      if (selectedMilestone !== 'All' && t.milestone !== selectedMilestone) return false;
      if (selectedAssignee !== 'All' && t.assignedTo !== selectedAssignee) return false;
      if (selectedTaskStatus !== 'All' && t.status.toLowerCase() !== selectedTaskStatus.toLowerCase()) return false;
      return true;
    });
  }, [tasks, taskSearch, selectedProject, selectedMilestone, selectedAssignee, selectedTaskStatus]);

  const paginatedTasks = useMemo(() => {
    const start = (taskPage - 1) * taskPageSize;
    return filteredTasks.slice(start, start + taskPageSize);
  }, [filteredTasks, taskPage, taskPageSize]);

  // Handlers for Projects
  const handleCreateProject = async (payload: CreateProjectPayload) => {
    await projectService.createProject(payload);
    await fetchData();
    showSuccess(`Project "${payload.projectName}" created successfully`);
  };

  const handleUpdateProject = async (id: string, payload: UpdateProjectPayload) => {
    await projectService.updateProject(id, payload);
    await fetchData();
    showSuccess(`Project ${id} updated successfully`);
  };

  const handleQuickStatusChangeProject = async (project: Project, newStatus: string) => {
    await projectService.updateProject(project.id, { status: newStatus });
    await fetchData();
    showSuccess(`Project ${project.id} status changed to ${newStatus}`);
  };

  // Handlers for Tasks
  const handleCreateTask = async (payload: CreateTaskPayload) => {
    await projectService.createTask(payload);
    await fetchData();
    showSuccess(`Task "${payload.taskName}" created successfully`);
  };

  const handleUpdateTask = async (id: string, payload: UpdateTaskPayload) => {
    await projectService.updateTask(id, payload);
    await fetchData();
    showSuccess(`Task ${id} updated successfully`);
  };

  const handleQuickStatusChangeTask = async (task: ProjectTask, newStatus: string) => {
    await projectService.updateTask(task.id, { status: newStatus });
    await fetchData();
    showSuccess(`Task ${task.id} status changed to ${newStatus}`);
  };

  // Delete Confirmation Handler
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      setIsDeleting(true);
      if (deleteItem.type === 'project') {
        await projectService.deleteProject(deleteItem.id);
        showSuccess(`Project "${deleteItem.name}" deleted successfully`);
      } else {
        await projectService.deleteTask(deleteItem.id);
        showSuccess(`Task "${deleteItem.name}" deleted successfully`);
      }
      setDeleteItem(null);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = (type: 'projects' | 'tasks') => {
    const csvContent =
      type === 'projects'
        ? [
            ['Project ID', 'Project Code', 'Project Name', 'Client ID', 'Project Manager', 'Start Date', 'Planned End Date', 'Status', 'Priority', 'Health', 'Contract Value', 'Tasks', 'Progress'],
            ...filteredProjects.map((p) => [
              p.id,
              p.projectCode,
              p.projectName,
              p.clientId,
              p.projectManager,
              p.startDate,
              p.plannedEndDate,
              p.status,
              p.priority,
              p.health,
              p.contractValue,
              `${p.tasksCompleted}/${p.tasksTotal}`,
              `${p.progress}%`,
            ]),
          ]
            .map((e) => e.join(','))
            .join('\n')
        : [
            ['Task ID', 'Project ID', 'Milestone', 'Task Name', 'Assigned To', 'Priority', 'Start Date', 'Due Date', 'Estimated Hours', 'Actual Hours', 'Status', 'Progress', 'Dependencies', 'Subtasks', 'Health'],
            ...filteredTasks.map((t) => [
              t.id,
              t.projectId,
              t.milestone,
              t.taskName,
              t.assignedTo,
              t.priority,
              t.startDate,
              t.dueDate,
              t.estimatedHours,
              t.actualHours,
              t.status,
              `${t.progress}%`,
              t.dependencies,
              `${t.subtasksCompleted}/${t.subtasksTotal}`,
              t.health,
            ]),
          ]
            .map((e) => e.join(','))
            .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px',
        gap: '24px',
        width: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Page Title & Icon matching Figma */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0px',
          gap: '12px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          {/* Green Badge Icon */}
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '12px',
              flexShrink: 0,
            }}
          >
            <Folder size={20} color="#059669" strokeWidth={1.75} />
          </div>

          {/* Heading & Subtitle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
            }}
          >
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '30px',
                color: '#0F172A',
              }}
            >
              Projects & Task
            </div>
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#64748B',
              }}
            >
              Plan, track and deliver projects with tasks, milestones and financial performance.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ReloadButton
            onClick={fetchData}
            title="Refresh projects and tasks"
          />
        </div>
      </div>

      {successMessage && (
        <div
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '8px',
            fontFamily: 'Inter',
            fontSize: '13px',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={16} color="#059669" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            fontFamily: 'Inter',
            fontSize: '13px',
            color: '#DC2626',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <ProjectKpiCards isLoading={isLoading} kpis={kpis} />

      {/* Section 1: Projects Table */}
      <ProjectsTable
        isLoading={isLoading}
        projects={paginatedProjects}
        totalRecords={filteredProjects.length}
        currentPage={projectPage}
        pageSize={projectPageSize}
        onPageChange={setProjectPage}
        onPageSizeChange={(sz) => {
          setProjectPageSize(sz);
          setProjectPage(1);
        }}
        onCreateProjectClick={() => setIsAddProjectModalOpen(true)}
        onExportClick={() => handleExport('projects')}
        onEditProject={(p) => setEditProject(p)}
        onDeleteProject={(p) =>
          setDeleteItem({
            type: 'project',
            id: p.id,
            name: p.projectName,
          })
        }
        onQuickStatusChange={handleQuickStatusChangeProject}
        searchQuery={projectSearch}
        onSearchChange={(q) => {
          setProjectSearch(q);
          setProjectPage(1);
        }}
        selectedClient={selectedClient}
        onClientChange={(c) => {
          setSelectedClient(c);
          setProjectPage(1);
        }}
        clientOptions={clientOptions}
        selectedManager={selectedManager}
        onManagerChange={(m) => {
          setSelectedManager(m);
          setProjectPage(1);
        }}
        managerOptions={managerOptions}
        selectedStatus={selectedStatus}
        onStatusChange={(s) => {
          setSelectedStatus(s);
          setProjectPage(1);
        }}
        selectedPriority={selectedPriority}
        onPriorityChange={(p) => {
          setSelectedPriority(p);
          setProjectPage(1);
        }}
      />

      {/* Section 2: Project Tasks Table */}
      <ProjectTasksTable
        isLoading={isLoading}
        tasks={paginatedTasks}
        totalRecords={filteredTasks.length}
        currentPage={taskPage}
        pageSize={taskPageSize}
        onPageChange={setTaskPage}
        onPageSizeChange={(sz) => {
          setTaskPageSize(sz);
          setTaskPage(1);
        }}
        onCreateTaskClick={() => setIsAddTaskModalOpen(true)}
        onExportClick={() => handleExport('tasks')}
        onEditTask={(t) => setEditTask(t)}
        onDeleteTask={(t) =>
          setDeleteItem({
            type: 'task',
            id: t.id,
            name: t.taskName,
          })
        }
        onQuickStatusChange={handleQuickStatusChangeTask}
        searchQuery={taskSearch}
        onSearchChange={(q) => {
          setTaskSearch(q);
          setTaskPage(1);
        }}
        selectedProject={selectedProject}
        onProjectChange={(p) => {
          setSelectedProject(p);
          setTaskPage(1);
        }}
        projectOptions={projectOptions}
        selectedMilestone={selectedMilestone}
        onMilestoneChange={(m) => {
          setSelectedMilestone(m);
          setTaskPage(1);
        }}
        milestoneOptions={milestoneOptions}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={(a) => {
          setSelectedAssignee(a);
          setTaskPage(1);
        }}
        assigneeOptions={assigneeOptions}
        selectedStatus={selectedTaskStatus}
        onStatusChange={(s) => {
          setSelectedTaskStatus(s);
          setTaskPage(1);
        }}
      />

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onSubmit={handleCreateProject}
        clientOptions={clientOptions}
        managerOptions={managerOptions}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={Boolean(editProject)}
        project={editProject}
        onClose={() => setEditProject(null)}
        onSubmit={handleUpdateProject}
        clientOptions={clientOptions}
        managerOptions={managerOptions}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projectOptions={projectOptions}
        assigneeOptions={assigneeOptions}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={Boolean(editTask)}
        task={editTask}
        onClose={() => setEditTask(null)}
        onSubmit={handleUpdateTask}
        projectOptions={projectOptions}
        assigneeOptions={assigneeOptions}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteItem)}
        title={deleteItem?.type === 'project' ? 'Delete Project' : 'Delete Task'}
        itemName={deleteItem?.name || ''}
        warningText={
          deleteItem?.type === 'project'
            ? 'Deleting this project will also delete all tasks associated with it.'
            : undefined
        }
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
