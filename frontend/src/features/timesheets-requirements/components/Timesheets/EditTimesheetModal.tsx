import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';
import { TimesheetRecord, BillableOption } from '../../types';
import { MASTER_TASKS } from '../../mockData';
import { calculateBillableAmount } from '../../utils/calculations';
import { formatRupee, parseRupee } from '../../utils/formatters';

interface EditTimesheetModalProps {
  isOpen: boolean;
  timesheet: TimesheetRecord | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<TimesheetRecord>) => void;
}

export const EditTimesheetModal: React.FC<EditTimesheetModalProps> = ({
  isOpen,
  timesheet,
  onClose,
  onSave,
}) => {
  const [taskId, setTaskId] = useState('');
  const [hours, setHours] = useState<number | string>(8);
  const [billable, setBillable] = useState<BillableOption>('Yes');
  const [billableRate, setBillableRate] = useState<number | string>(1500);
  const [assignedApprover, setAssignedApprover] = useState('CEO – Akshit Ujjain');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timesheet && isOpen) {
      setTaskId(timesheet.taskId);
      setHours(timesheet.hours);
      setBillable(timesheet.billable);
      setBillableRate(parseRupee(timesheet.billableRate) || 1500);
      setAssignedApprover(timesheet.assignedApprover || 'CEO – Akshit Ujjain');
      setNotes(timesheet.notes || '');
      setError(null);
    }
  }, [timesheet, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const mainEl = document.querySelector('main');
      const prevMainOverflow = mainEl ? mainEl.style.overflow : '';

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (mainEl) {
        mainEl.style.overflow = 'hidden';
      }

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        if (mainEl) {
          mainEl.style.overflow = prevMainOverflow;
        }
      };
    }
  }, [isOpen]);

  if (!isOpen || !timesheet) return null;

  const hoursNum = typeof hours === 'number' ? hours : parseFloat(hours) || 0;
  const rateNum = typeof billableRate === 'number' ? billableRate : parseFloat(billableRate) || 0;
  const calculatedBillableAmount = calculateBillableAmount(hoursNum, rateNum, billable === 'Yes');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskId.trim()) {
      setError('Task ID cannot be empty.');
      return;
    }
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setError('Hours must be greater than 0.');
      return;
    }
    if (hoursNum > 24) {
      setError('Hours cannot exceed 24 hours per entry.');
      return;
    }

    onSave(timesheet.timesheetId, {
      taskId: taskId.trim(),
      hours: hoursNum,
      billable,
      billableRate: billable === 'Yes' ? formatRupee(rateNum, true) : '-',
      billableAmount: formatRupee(calculatedBillableAmount, true),
      assignedApprover,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
      style={{
        fontFamily: "'Inter', sans-serif",
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-timesheet-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="edit-timesheet-title" className="text-base font-bold text-slate-900 leading-tight">
                Edit Timesheet Entry
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{timesheet.timesheetId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task ID</label>
              <input
                type="text"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors h-[38px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hours</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors h-[38px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billable</label>
              <select
                value={billable}
                onChange={(e) => setBillable(e.target.value as BillableOption)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors h-[38px] cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billable Rate (₹/hr)</label>
              <input
                type="number"
                step="50"
                disabled={billable === 'No'}
                value={billable === 'No' ? 0 : billableRate}
                onChange={(e) => setBillableRate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors h-[38px] ${
                  billable === 'No'
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Recomputed Billable Amount</span>
            <span className="text-sm font-bold text-slate-900">
              {formatRupee(calculatedBillableAmount, true)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Approved By</label>
            <select
              value={assignedApprover}
              onChange={(e) => setAssignedApprover(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors h-[38px] cursor-pointer"
            >
              <option value="CEO – Akshit Ujjain">CEO – Akshit Ujjain</option>
              <option value="MD – Gaurav Tripathy">MD – Gaurav Tripathy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-400 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTimesheetModal;


