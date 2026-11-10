import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { DeploymentItem } from '../types/deployment';
import { formatDeploymentDisplayDate } from '../services/deploymentService';

interface DeploymentTableProps {
  deployments: DeploymentItem[];
  isLoading?: boolean;
  onView: (deployment: DeploymentItem) => void;
  onEdit: (deployment: DeploymentItem) => void;
  onDelete: (deployment: DeploymentItem) => void;
}

export const DeploymentTable: React.FC<DeploymentTableProps> = ({
  deployments,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const totalItems = deployments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDeployments = deployments.slice(startIndex, startIndex + pageSize);

  const renderEnvironmentBadge = (env: string) => {
    const normalized = (env || '').trim().toLowerCase();
    let bg = '#ECFDF5';
    let border = '#A7F3D0';
    let text = '#047857';

    if (normalized === 'staging') {
      bg = '#FFFBEB';
      border = '#FDE68A';
      text = '#B45309';
    } else if (normalized === 'uat' || normalized === 'qa') {
      bg = '#FAF5FF';
      border = '#E9D5FF';
      text = '#7E22CE';
    }

    return (
      <span
        style={{
          boxSizing: 'border-box',
          height: '22px',
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '9999px',
          padding: '2px 10px',
          color: text,
        }}
        className="inline-flex items-center text-[11px] font-medium leading-[16px] whitespace-nowrap"
      >
        {env}
      </span>
    );
  };

  const renderChecklistBadge = (val: string) => {
    const isCompleted =
      (val || '').toLowerCase().includes('complete') ||
      (val || '').toLowerCase().includes('yes');
    return (
      <span
        style={{
          boxSizing: 'border-box',
          height: '22px',
          background: isCompleted ? '#ECFDF5' : '#FFFBEB',
          border: `1px solid ${isCompleted ? '#A7F3D0' : '#FDE68A'}`,
          borderRadius: '9999px',
          padding: '2px 10px',
          gap: '4px',
          color: isCompleted ? '#047857' : '#B45309',
        }}
        className="inline-flex items-center text-[11px] font-medium leading-[16px] whitespace-nowrap"
      >
        {isCompleted ? (
          <CheckCircle2 className="w-3 h-3 text-[#059669]" />
        ) : (
          <Clock className="w-3 h-3 text-[#D97706]" />
        )}
        <span>{isCompleted ? 'Completed' : 'Pending'}</span>
      </span>
    );
  };

  const renderBackupBadge = (val: string) => {
    const isYes = (val || '').toLowerCase() === 'yes';
    return (
      <span
        style={{
          height: '20px',
          background: isYes ? '#ECFDF5' : '#FFF1F2',
          borderRadius: '4px',
          padding: '2px 8px',
          color: isYes ? '#047857' : '#BE123C',
        }}
        className="inline-flex items-center text-[11px] font-medium leading-[16px] whitespace-nowrap"
      >
        {isYes ? 'Yes' : 'No'}
      </span>
    );
  };

  const renderRollbackBadge = (val: string) => {
    const isAvail =
      (val || '').toLowerCase().includes('avail') &&
      !(val || '').toLowerCase().includes('not');
    return (
      <span
        style={{
          boxSizing: 'border-box',
          height: '22px',
          background: isAvail ? '#ECFDF5' : '#FFF1F2',
          border: `1px solid ${isAvail ? '#A7F3D0' : '#FECDD3'}`,
          borderRadius: '9999px',
          padding: '2px 10px',
          color: isAvail ? '#047857' : '#BE123C',
        }}
        className="inline-flex items-center text-[11px] font-medium leading-[16px] whitespace-nowrap"
      >
        {isAvail ? 'Available' : 'Not Available'}
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    if (!status || status === '-' || status === 'null') {
      return (
        <span className="font-normal text-[12px] leading-[16px] text-[#64748B]">
          -
        </span>
      );
    }
    const norm = (status || '').toLowerCase();
    const isFailed = norm.includes('fail') || norm.includes('cancel');
    const isInProgress = norm.includes('progress') || norm.includes('active');

    let bg = '#ECFDF5';
    let border = '#A7F3D0';
    let text = '#047857';
    let label = 'Successful';

    if (isFailed) {
      bg = '#FFF1F2';
      border = '#FECDD3';
      text = '#BE123C';
      label = 'Failed';
    } else if (isInProgress) {
      bg = '#EFF6FF';
      border = '#BFDBFE';
      text = '#1D4ED8';
      label = 'In Progress';
    }

    return (
      <span
        style={{
          boxSizing: 'border-box',
          height: '22px',
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '9999px',
          padding: '2px 10px',
          color: text,
        }}
        className="inline-flex items-center text-[11px] font-medium leading-[16px] whitespace-nowrap"
      >
        {label}
      </span>
    );
  };

  const renderSmokeTestBadge = (val: string) => {
    if (!val || val === '-' || val === 'null') {
      return (
        <span className="font-normal text-[12px] leading-[16px] text-[#64748B]">
          -
        </span>
      );
    }
    const norm = val.toLowerCase();
    const isPass = norm.includes('pass') || norm.includes('success');
    const isFail = norm.includes('fail');

    if (!isPass && !isFail) {
      return (
        <span className="font-normal text-[12px] leading-[16px] text-[#64748B]">
          -
        </span>
      );
    }

    return (
      <span
        style={{
          height: '20px',
          padding: '2px 8px',
          borderRadius: '4px',
          color: isPass ? '#047857' : '#E11D48',
        }}
        className="inline-flex items-center gap-1 text-[11px] font-medium leading-[16px] whitespace-nowrap"
      >
        {isPass ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-[#E11D48]" />
        )}
        <span>{isPass ? 'Pass' : 'Fail'}</span>
      </span>
    );
  };

  const renderClientConfirmationBadge = (val: string) => {
    if (!val || val === '-' || val === 'null') {
      return (
        <span className="font-normal text-[12px] leading-[16px] text-[#64748B]">
          -
        </span>
      );
    }
    const norm = val.toLowerCase();
    const isConfirmed =
      norm.includes('confirm') ||
      norm.includes('complete') ||
      norm.includes('signed');
    const isPending = norm.includes('pending');

    if (!isConfirmed && !isPending) {
      return (
        <span className="font-normal text-[12px] leading-[16px] text-[#64748B]">
          -
        </span>
      );
    }

    return (
      <span
        style={{
          boxSizing: 'border-box',
          height: '22px',
          background: isConfirmed ? '#ECFDF5' : '#FFFBEB',
          border: `1px solid ${isConfirmed ? '#A7F3D0' : '#FDE68A'}`,
          borderRadius: '9999px',
          padding: '2px 10px',
          color: isConfirmed ? '#047857' : '#B45309',
        }}
        className="inline-flex items-center text-[11px] font-medium leading-[16px] whitespace-nowrap"
      >
        {isConfirmed ? 'Confirmed' : 'Pending'}
      </span>
    );
  };

  const renderHandoverBadge = (val: string) => {
    if (!val || val === '-' || val === 'null') {
      return (
        <span className="font-normal text-[12px] leading-[16px] text-[#64748B]">
          -
        </span>
      );
    }
    const norm = val.toLowerCase();
    const isCompleted = norm.includes('complete') || norm.includes('handed');
    const isInProgress = norm.includes('progress');
    const isPending = norm.includes('pending');

    let bg = '#ECFDF5';
    let border = '#A7F3D0';
    let text = '#047857';
    let label = 'Completed';

    if (isInProgress) {
      bg = '#EFF6FF';
      border = '#BFDBFE';
      text = '#1D4ED8';
      label = 'In Progress';
    } else if (isPending) {
      bg = '#FFFBEB';
      border = '#FDE68A';
      text = '#B45309';
      label = 'Pending';
    } else if (!isCompleted) {
      return (
        <span className="font-normal text-[12px] leading-[16px] text-[#64748B]">
          -
        </span>
      );
    }

    return (
      <span
        style={{
          boxSizing: 'border-box',
          height: '22px',
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '9999px',
          padding: '2px 10px',
          color: text,
        }}
        className="inline-flex items-center text-[11px] font-medium leading-[16px] whitespace-nowrap"
      >
        {label}
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full font-['Inter']">
      {/* Horizontally scrollable table container matching 1837.23px specification */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1837.23px] border-collapse text-left font-['Inter']">
          <thead>
            <tr
              style={{
                height: '58.5px',
                background: 'rgba(248, 250, 252, 0.8)',
                borderBottom: '1px solid #E2E8F0',
              }}
              className="text-[11px] font-semibold leading-[16px] text-[#475569]"
            >
              <th style={{ width: '124.14px', minWidth: '124.14px', padding: '19.75px 16px 20.75px' }}>
                Deployment ID
              </th>
              <th style={{ width: '83.36px', minWidth: '83.36px', padding: '19.75px 16px 20.75px' }}>
                Project ID
              </th>
              <th style={{ width: '117.27px', minWidth: '117.27px', padding: '19.75px 16px 20.75px' }}>
                Release Version
              </th>
              <th style={{ width: '123.5px', minWidth: '123.5px', padding: '19.75px 16px 20.75px' }}>
                Deployment Date
              </th>
              <th style={{ width: '111.3px', minWidth: '111.3px', padding: '19.75px 16px 20.75px' }}>
                Environment
              </th>
              <th style={{ width: '140.48px', minWidth: '140.48px', padding: '19.75px 16px 20.75px' }}>
                Deployment Owner
              </th>
              <th style={{ width: '127.42px', minWidth: '127.42px', padding: '12px 16px' }}>
                Pre-Deployment Checklist
              </th>
              <th style={{ width: '90.11px', minWidth: '90.11px', padding: '12px 16px' }}>
                Backup Completed
              </th>
              <th style={{ width: '103.25px', minWidth: '103.25px', padding: '19.75px 16px 20.75px' }}>
                Rollback Plan
              </th>
              <th style={{ width: '113.47px', minWidth: '113.47px', padding: '12px 16px' }}>
                Deployment Status
              </th>
              <th style={{ width: '91.11px', minWidth: '91.11px', padding: '12px 16px' }}>
                Smoke Test
              </th>
              <th style={{ width: '109.73px', minWidth: '109.73px', padding: '12px 16px' }}>
                Client Confirmation
              </th>
              <th style={{ width: '103.25px', minWidth: '103.25px', padding: '19.75px 16px 20.75px' }}>
                Go-Live Date
              </th>
              <th style={{ width: '113.47px', minWidth: '113.47px', padding: '12px 16px' }}>
                Handover Status
              </th>
              <th style={{ width: '212.89px', minWidth: '212.89px', padding: '19.75px 16px 20.75px' }}>
                Issues / Notes
              </th>
              <th
                style={{
                  width: '72.48px',
                  minWidth: '72.48px',
                  padding: '19.75px 16px 20.75px',
                  textAlign: 'right',
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={16} className="py-12 text-center text-[13px] text-[#64748B]">
                  Loading deployments...
                </td>
              </tr>
            ) : paginatedDeployments.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-12 text-center text-[13px] text-[#64748B]">
                  No deployments found matching criteria.
                </td>
              </tr>
            ) : (
              paginatedDeployments.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    height: '53px',
                    borderTop: '1px solid #F1F5F9',
                  }}
                  className="hover:bg-[#F8FAFC] transition-colors text-[12px]"
                >
                  {/* 1. Deployment ID */}
                  <td style={{ width: '124.14px', minWidth: '124.14px', padding: '18px 16px 19px' }}>
                    <span
                      onClick={() => onView(item)}
                      className="font-medium text-[12px] leading-[16px] text-[#4F46E5] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      {item.id}
                    </span>
                  </td>

                  {/* 2. Project ID */}
                  <td style={{ width: '83.36px', minWidth: '83.36px', padding: '18px 16px 19px' }}>
                    <span className="font-medium text-[12px] leading-[16px] text-[#4F46E5] whitespace-nowrap">
                      {item.projectId}
                    </span>
                  </td>

                  {/* 3. Release Version */}
                  <td style={{ width: '117.27px', minWidth: '117.27px', padding: '18px 16px 19px' }}>
                    <span className="font-normal text-[12px] leading-[16px] text-[#334155] whitespace-nowrap">
                      {item.releaseVersion}
                    </span>
                  </td>

                  {/* 4. Deployment Date */}
                  <td style={{ width: '123.5px', minWidth: '123.5px', padding: '18px 16px 19px' }}>
                    <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                      {formatDeploymentDisplayDate(item.deploymentDate)}
                    </span>
                  </td>

                  {/* 5. Environment */}
                  <td style={{ width: '111.3px', minWidth: '111.3px', padding: '15.5px 16px' }}>
                    {renderEnvironmentBadge(item.environment)}
                  </td>

                  {/* 6. Deployment Owner */}
                  <td style={{ width: '140.48px', minWidth: '140.48px', padding: '18px 16px 19px' }}>
                    <span className="font-medium text-[12px] leading-[16px] text-[#1E293B] whitespace-nowrap">
                      {item.deploymentOwner}
                    </span>
                  </td>

                  {/* 7. Pre-Deployment Checklist */}
                  <td style={{ width: '127.42px', minWidth: '127.42px', padding: '15.5px 16px' }}>
                    {renderChecklistBadge(item.preDeploymentChecklist)}
                  </td>

                  {/* 8. Backup Completed */}
                  <td style={{ width: '90.11px', minWidth: '90.11px', padding: '16.5px 16px' }}>
                    {renderBackupBadge(item.backupCompleted)}
                  </td>

                  {/* 9. Rollback Plan */}
                  <td style={{ width: '103.25px', minWidth: '103.25px', padding: '15.5px 16px' }}>
                    {renderRollbackBadge(item.rollbackPlan)}
                  </td>

                  {/* 10. Deployment Status */}
                  <td style={{ width: '113.47px', minWidth: '113.47px', padding: '15.5px 16px' }}>
                    {renderStatusBadge(item.status)}
                  </td>

                  {/* 11. Smoke Test */}
                  <td style={{ width: '91.11px', minWidth: '91.11px', padding: '16px 16px 17px' }}>
                    {renderSmokeTestBadge(item.smokeTest)}
                  </td>

                  {/* 12. Client Confirmation */}
                  <td style={{ width: '109.73px', minWidth: '109.73px', padding: '15.5px 16px' }}>
                    {renderClientConfirmationBadge(item.clientSignOff)}
                  </td>

                  {/* 13. Go-Live Date */}
                  <td style={{ width: '103.25px', minWidth: '103.25px', padding: '18px 16px 19px' }}>
                    <span className="font-normal text-[12px] leading-[16px] text-[#475569] whitespace-nowrap">
                      {formatDeploymentDisplayDate(item.goLiveDate)}
                    </span>
                  </td>

                  {/* 14. Handover Status */}
                  <td style={{ width: '113.47px', minWidth: '113.47px', padding: '15.5px 16px' }}>
                    {renderHandoverBadge(item.handoverStatus)}
                  </td>

                  {/* 15. Issues / Notes */}
                  <td style={{ width: '212.89px', minWidth: '212.89px', padding: '18px 16px 19px' }}>
                    <span
                      className="font-normal text-[12px] leading-[16px] text-[#475569] truncate block max-w-[195px]"
                      title={item.releaseNotes}
                    >
                      {item.releaseNotes && item.releaseNotes !== '-' ? item.releaseNotes : '-'}
                    </span>
                  </td>

                  {/* 16. Actions */}
                  <td
                    style={{
                      width: '72.48px',
                      minWidth: '72.48px',
                      padding: '14.5px 16px',
                      textAlign: 'right',
                      position: 'relative',
                    }}
                  >
                    <div className="flex items-center justify-end w-full">
                      <button
                        type="button"
                        aria-label="Actions"
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-[4px] text-[#4F46E5] hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4 text-[#4F46E5]" />
                      </button>
                    </div>

                    {activeMenuId === item.id && (
                      <div className="absolute right-4 top-10 w-28 bg-white border border-[#E2E8F0] shadow-lg rounded-[8px] py-1 z-30 font-['Inter'] text-[12px] text-left">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onView(item);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[#334155] hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#4F46E5]" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onEdit(item);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[#334155] hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-[#059669]" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onDelete(item);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[#DC2626] hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                          <span>Delete</span>
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
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border-t border-[#E2E8F0] text-[12px] text-[#64748B] gap-3">
        <div className="font-medium text-[12px] leading-[16px] text-[#64748B]">
          Showing {totalItems === 0 ? 0 : startIndex + 1} –{' '}
          {Math.min(startIndex + pageSize, totalItems)} of {totalItems} deployments
        </div>

        <div className="flex items-center gap-3">
          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-[4px] border border-[#E2E8F0] text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 flex items-center justify-center rounded-[4px] text-[12px] transition-colors ${
                    page === currentPage
                      ? 'bg-[#4F46E5] text-white font-semibold shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                      : 'border border-transparent text-[#475569] font-medium hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

            {totalPages > 5 && (
              <>
                <span className="px-1 text-[#94A3B8]">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-7 h-7 flex items-center justify-center rounded-[4px] text-[12px] font-medium ${
                    currentPage === totalPages
                      ? 'bg-[#4F46E5] text-white font-semibold'
                      : 'border border-transparent text-[#475569] hover:bg-slate-50'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 flex items-center justify-center rounded-[4px] border border-[#E2E8F0] text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              &gt;
            </button>
          </div>

          {/* Rows per page dropdown */}
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-[28px] pl-2.5 pr-7 bg-white border border-[#E2E8F0] rounded-[8px] text-[12px] text-[#334155] font-medium appearance-none cursor-pointer focus:outline-none focus:border-[#4F46E5]"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
