import React from 'react';
import { ExternalLink, FileText, ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit, Trash2 } from 'lucide-react';
import {
  DevelopmentRecord,
  DevelopmentEnvironment,
  CodeReviewStatus,
  DevelopmentStatus,
} from '../types';
import { TableActionMenu } from '../../../components/ui/TableActionMenu';
import { StatusDropdownMenu, StatusItemConfig } from '../../../components/ui/StatusDropdownMenu';

interface DevelopmentTableProps {
  records: DevelopmentRecord[];
  onViewDetails: (record: DevelopmentRecord) => void;
  onEdit: (record: DevelopmentRecord) => void;
  onDelete: (record: DevelopmentRecord) => void;
  onIdClick?: (type: 'dev' | 'project' | 'req' | 'task' | 'release', id: string) => void;
  onUpdateCodeReviewStatus?: (id: string, newStatus: CodeReviewStatus) => void;
  onUpdateStatus?: (id: string, newStatus: DevelopmentStatus) => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
  sortField?: string | null;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

const CODE_REVIEW_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'Approved', label: 'Approved', dotColor: '#10B981', textColor: '#059669' },
  { value: 'In Review', label: 'In Review', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Changes Requested', label: 'Changes Requested', dotColor: '#EF4444', textColor: '#DC2626' },
];

const DEVELOPMENT_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'Released', label: 'Released', dotColor: '#10B981', textColor: '#059669' },
  { value: 'In Progress', label: 'In Progress', dotColor: '#0284C7', textColor: '#0284C7' },
  { value: 'QA', label: 'QA', dotColor: '#9333EA', textColor: '#9333EA' },
];

// GitHub icon SVG component
const GitHubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const DevelopmentTable: React.FC<DevelopmentTableProps> = ({
  records,
  onViewDetails,
  onEdit,
  onDelete,
  onIdClick,
  onUpdateCodeReviewStatus,
  onUpdateStatus,
  onShowToast,
  sortField = null,
  sortOrder = 'asc',
  onSort,
}) => {
  const getEnvironmentBadge = (env: DevelopmentEnvironment) => {
    switch (env) {
      case 'Dev':
        return 'bg-[#E0F2FE] text-[#0284C7]';
      case 'QA':
        return 'bg-[#F3E8FF] text-[#9333EA]';
      case 'Staging':
        return 'bg-[#FEF3C7] text-[#D97706]';
      case 'Prod':
        return 'bg-[#DCFCE7] text-[#16A34A]';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getCodeReviewBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#ECFDF5] text-[#059669]';
      case 'In Review':
        return 'bg-[#FEF3C7] text-[#D97706]';
      case 'Changes Requested':
        return 'bg-[#FEE2E2] text-[#DC2626]';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Released':
        return 'bg-[#ECFDF5] text-[#059669]';
      case 'In Progress':
        return 'bg-[#E0F2FE] text-[#0284C7]';
      case 'QA':
        return 'bg-[#F3E8FF] text-[#9333EA]';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleViewDocument = (record: DevelopmentRecord) => {
    const link = record.documentationLink ? record.documentationLink.trim() : '';

    if (!link || link === '#' || link === '—' || link === '-') {
      onShowToast?.('No documentation link is available for this development.', 'info');
      return;
    }

    let validUrl = link;
    if (!/^https?:\/\//i.test(validUrl)) {
      if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(validUrl)) {
        validUrl = `https://${validUrl}`;
      } else {
        onShowToast?.('No documentation link is available for this development.', 'info');
        return;
      }
    }

    try {
      const parsed = new URL(validUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        window.open(parsed.href, '_blank', 'noopener,noreferrer');
      } else {
        onShowToast?.('No documentation link is available for this development.', 'info');
      }
    } catch {
      onShowToast?.('No documentation link is available for this development.', 'info');
    }
  };

  const renderSortableHeader = (field: string, label: string, align: 'left' | 'center' = 'left') => {
    const isSorted = sortField === field;
    return (
      <th
        key={field}
        onClick={() => onSort?.(field)}
        className={`py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-[#4F46E5] transition-colors ${
          align === 'center' ? 'text-center' : 'text-left'
        }`}
      >
        <div className={`inline-flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : ''}`}>
          <span>{label}</span>
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="w-3 h-3 text-[#4F46E5] shrink-0" />
            ) : (
              <ArrowDown className="w-3 h-3 text-[#4F46E5] shrink-0" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60 hover:opacity-100 shrink-0" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="w-full overflow-x-auto relative min-h-[300px]">
      <table className="w-full text-left border-collapse min-w-[1550px]">
        <thead>
          <tr className="border-b border-[#DCE3ED] bg-[#F8FAFC]/60">
            {renderSortableHeader('developmentId', 'Development ID')}
            {renderSortableHeader('projectId', 'Project ID')}
            {renderSortableHeader('requirementId', 'Requirement ID')}
            {renderSortableHeader('taskId', 'Task / Ticket ID')}
            {renderSortableHeader('developer', 'Developer')}
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              Repository URL
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              Branch
            </th>
            {renderSortableHeader('environment', 'Environment', 'center')}
            {renderSortableHeader('buildVersion', 'Build Version')}
            {renderSortableHeader('codeReviewStatus', 'Code Review Status', 'center')}
            {renderSortableHeader('qaHandoffDate', 'QA Handoff Date')}
            {renderSortableHeader('releaseId', 'Release ID', 'center')}
            {renderSortableHeader('status', 'Status', 'center')}
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              Technical Notes
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              Documentation Link
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {records.length === 0 ? (
            <tr>
              <td colSpan={16} className="py-12 text-center text-slate-400 text-xs">
                No development records found matching your filters.
              </td>
            </tr>
          ) : (
            records.map((row) => (
              <tr
                key={row.developmentId}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {/* 1. Development ID */}
                <td className="py-3 px-4 text-xs font-medium text-[#4F46E5] whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => (onIdClick ? onIdClick('dev', row.developmentId) : onViewDetails(row))}
                    className="hover:underline focus:outline-none cursor-pointer"
                  >
                    {row.developmentId}
                  </button>
                </td>

                {/* 2. Project ID */}
                <td className="py-3 px-4 text-xs font-medium text-[#4F46E5] whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => (onIdClick ? onIdClick('project', row.projectId) : onViewDetails(row))}
                    className="hover:underline focus:outline-none cursor-pointer"
                  >
                    {row.projectId}
                  </button>
                </td>

                {/* 3. Requirement ID */}
                <td className="py-3 px-4 text-xs font-medium text-[#4F46E5] whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => (onIdClick ? onIdClick('req', row.requirementId) : onViewDetails(row))}
                    className="hover:underline focus:outline-none cursor-pointer"
                  >
                    {row.requirementId}
                  </button>
                </td>

                {/* 4. Task / Ticket ID */}
                <td className="py-3 px-4 text-xs font-medium text-[#4F46E5] whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => (onIdClick ? onIdClick('task', row.taskId) : onViewDetails(row))}
                    className="hover:underline focus:outline-none cursor-pointer"
                  >
                    {row.taskId}
                  </button>
                </td>

                {/* 5. Developer */}
                <td className="py-3 px-4 text-xs text-slate-800 font-medium whitespace-nowrap">
                  {row.developer}
                </td>

                {/* 6. Repository URL */}
                <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                  <a
                    href={row.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#4F46E5] transition-colors"
                    title={row.repositoryUrl}
                  >
                    <GitHubIcon className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                    <span className="truncate max-w-[190px]">
                      {row.repositoryUrl.replace(/^https?:\/\//, '')}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </a>
                </td>

                {/* 7. Branch */}
                <td className="py-3 px-4 text-[11.5px] font-mono text-slate-600 whitespace-nowrap">
                  {row.branch}
                </td>

                {/* 8. Environment */}
                <td className="py-3 px-4 text-xs whitespace-nowrap text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[10.5px] font-semibold rounded-md ${getEnvironmentBadge(
                      row.environment
                    )}`}
                  >
                    {row.environment}
                  </span>
                </td>

                {/* 9. Build Version */}
                <td className="py-3 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                  {row.buildVersion}
                </td>

                {/* 10. Code Review Status */}
                <td className="py-3 px-4 text-xs whitespace-nowrap text-center">
                  <StatusDropdownMenu
                    currentStatus={row.codeReviewStatus}
                    options={CODE_REVIEW_STATUS_CONFIGS}
                    headerTitle="CHANGE REVIEW STATUS"
                    triggerVariant="badge"
                    getBadgeClass={getCodeReviewBadge}
                    onSelect={(newStatus) =>
                      onUpdateCodeReviewStatus?.(row.developmentId, newStatus as CodeReviewStatus)
                    }
                  />
                </td>

                {/* 11. QA Handoff Date */}
                <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {row.qaHandoffDate}
                </td>

                {/* 12. Release ID */}
                <td className="py-3 px-4 text-xs whitespace-nowrap text-center font-medium">
                  {row.releaseId && row.releaseId !== '-' ? (
                    <button
                      type="button"
                      onClick={() => (onIdClick ? onIdClick('release', row.releaseId) : onViewDetails(row))}
                      className="text-[#4F46E5] hover:underline focus:outline-none cursor-pointer"
                    >
                      {row.releaseId}
                    </button>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>

                {/* 13. Status */}
                <td className="py-3 px-4 text-xs whitespace-nowrap text-center">
                  <StatusDropdownMenu
                    currentStatus={row.status}
                    options={DEVELOPMENT_STATUS_CONFIGS}
                    headerTitle="CHANGE STATUS"
                    triggerVariant="badge"
                    getBadgeClass={getStatusBadge}
                    onSelect={(newStatus) =>
                      onUpdateStatus?.(row.developmentId, newStatus as DevelopmentStatus)
                    }
                  />
                </td>

                {/* 14. Technical Notes */}
                <td className="py-3 px-4 text-xs text-slate-600 max-w-[190px] truncate" title={row.technicalNotes}>
                  {row.technicalNotes}
                </td>

                {/* 15. Documentation Link */}
                <td className="py-3 px-4 text-xs whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleViewDocument(row)}
                    className="inline-flex items-center gap-1.5 text-[#4F46E5] hover:underline font-medium cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                    <span>View Doc</span>
                    <ExternalLink className="w-3 h-3 text-[#4F46E5] shrink-0" />
                  </button>
                </td>

                {/* 16. Actions */}
                <td className="py-3 px-4 text-xs text-center whitespace-nowrap">
                  <TableActionMenu
                    items={[
                      {
                        key: 'view-details',
                        label: 'View Details',
                        icon: <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
                        onClick: () => onViewDetails(row),
                      },
                      {
                        key: 'edit',
                        label: 'Edit Development',
                        icon: <Edit className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
                        onClick: () => onEdit(row),
                      },
                      {
                        key: 'view-document',
                        label: 'View Document',
                        icon: <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
                        onClick: () => handleViewDocument(row),
                      },
                      {
                        key: 'delete',
                        label: 'Delete',
                        icon: <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />,
                        onClick: () => onDelete(row),
                        variant: 'danger',
                        hasDividerAbove: true,
                      },
                    ]}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
