import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, FileText, Trash2, RotateCcw } from 'lucide-react';
import { LeaveRecord } from '../types/leave';
import { AUTHORIZED_APPROVERS, getCurrentApproverName } from '../../../utils/approverUtils';

interface LeaveDetailModalProps {
  record: LeaveRecord | null;
  onClose: () => void;
  onApprove: (id: string, approverName?: string) => Promise<void>;
  onReject: (id: string, approverName?: string) => Promise<void>;
  onResetPending?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const LeaveDetailModal: React.FC<LeaveDetailModalProps> = ({
  record,
  onClose,
  onApprove,
  onReject,
  onResetPending,
  onDelete,
}) => {
  const [approverName, setApproverName] = useState(() => getCurrentApproverName());
  const [processing, setProcessing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (record) {
      if (record.approvedBy && record.approvedBy !== '-' && record.approvedBy.trim() !== '') {
        setApproverName(record.approvedBy);
      } else {
        setApproverName(getCurrentApproverName());
      }
    }
  }, [record?.id, record?.approvedBy]);

  if (!record) return null;

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await onApprove(record.id, approverName);
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);
      await onReject(record.id, approverName);
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  const handleResetPending = async () => {
    if (!onResetPending) return;
    try {
      setProcessing(true);
      await onResetPending(record.id);
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setProcessing(true);
      await onDelete(record.id);
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  const renderBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200">
            Rejected
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">Leave Details</h3>
              <p className="text-xs text-blue-600 font-medium">{record.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Employee</p>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{record.employeeName}</p>
              <p className="text-[11px] text-blue-600 font-medium">{record.employeeId}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Current Status</p>
              <div className="mt-1">{renderBadge(record.approvalStatus)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
            <div>
              <p className="text-[11px] font-medium text-slate-500">Leave Type</p>
              <p className="text-slate-800 font-semibold mt-0.5">{record.leaveType}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Days Requested</p>
              <p className="text-slate-800 font-semibold mt-0.5">{record.days} day(s)</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Calculated Days</p>
              <p className="text-slate-800 font-semibold mt-0.5">{record.calculatedDays} day(s)</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">From Date</p>
              <p className="text-slate-800 font-medium mt-0.5">{record.fromDate}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">To Date</p>
              <p className="text-slate-800 font-medium mt-0.5">{record.toDate}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Approved By</p>
              <p className="text-slate-800 font-medium mt-0.5">{record.approvedBy || '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-1">Reason for Leave</p>
            <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-lg text-xs text-slate-700 leading-relaxed">
              {record.reason || 'No reason specified'}
            </div>
          </div>

          {/* If Pending: Choose Approver input */}
          {record.approvalStatus === 'Pending' && (
            <div className="pt-2">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Approved By</label>
              <div className="relative">
                <select
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                >
                  {AUTHORIZED_APPROVERS.map((approver) => (
                    <option key={approver} value={approver}>
                      {approver}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Delete confirmation state */}
          {confirmDelete && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center justify-between">
              <span>Are you sure you want to permanently delete this leave?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {record.approvalStatus === 'Pending' ? (
              <>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleReject}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </>
            ) : (
              onResetPending && (
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleResetPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mark Pending</span>
                </button>
              )
            )}

            {onDelete && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete Leave Request"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
