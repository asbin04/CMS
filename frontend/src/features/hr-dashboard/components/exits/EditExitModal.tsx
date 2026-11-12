import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle } from 'lucide-react';
import { ExitRecord, ExitType, ExitStatus } from '../../types';

interface EditExitModalProps {
  exitRecord: ExitRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updated: ExitRecord) => void;
}

export const EditExitModal: React.FC<EditExitModalProps> = ({
  exitRecord,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [exitType, setExitType] = useState<ExitType>('Resignation');
  const [resignationDate, setResignationDate] = useState('');
  const [lastWorkingDay, setLastWorkingDay] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<ExitStatus>('Notice Period');
  const [handoverStatus, setHandoverStatus] = useState('');
  const [clearanceStatus, setClearanceStatus] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (exitRecord) {
      setExitType(exitRecord.exitType || 'Resignation');
      setResignationDate(exitRecord.resignationDate || '');
      setLastWorkingDay(exitRecord.lastWorkingDay || '');
      setReason(exitRecord.reason || '');
      setStatus(exitRecord.status || 'Notice Period');
      setHandoverStatus(exitRecord.handoverStatus || '');
      setClearanceStatus(exitRecord.clearanceStatus || '');
      setErrors({});
    }
  }, [exitRecord]);

  if (!isOpen || !exitRecord) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!lastWorkingDay.trim()) errs.lastWorkingDay = 'Last working day is required';
    if (!reason.trim()) errs.reason = 'Exit reason is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const updated: ExitRecord = {
      ...exitRecord,
      exitType,
      resignationDate,
      lastWorkingDay,
      reason: reason.trim(),
      status,
      handoverStatus: handoverStatus.trim(),
      clearanceStatus: clearanceStatus.trim(),
    };

    onSubmit(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#FAFCFF] sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444]">
              <Edit3 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Edit Exit Record
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {exitRecord.id} • {exitRecord.employeeName} ({exitRecord.employeeId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Exit Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exit Type
              </label>
              <select
                value={exitType}
                onChange={(e) => setExitType(e.target.value as ExitType)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Resignation">Resignation</option>
                <option value="Termination">Termination</option>
                <option value="Retirement">Retirement</option>
                <option value="Contract End">Contract End</option>
              </select>
            </div>

            {/* Exit Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exit Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ExitStatus)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="In Progress">In Progress</option>
                <option value="Notice Period">Notice Period</option>
                <option value="Pending Clearance">Pending Clearance</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Resignation Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resignation Date
              </label>
              <input
                type="date"
                value={resignationDate}
                onChange={(e) => setResignationDate(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Last Working Day */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Working Day <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={lastWorkingDay}
                onChange={(e) => setLastWorkingDay(e.target.value)}
                className={`w-full h-9 px-3 text-xs rounded-xl border ${
                  errors.lastWorkingDay ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-[#4F46E5]`}
              />
              {errors.lastWorkingDay && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.lastWorkingDay}</p>}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exit Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full p-2.5 text-xs rounded-xl border ${
                errors.reason ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
              } focus:outline-none focus:border-[#4F46E5]`}
            />
            {errors.reason && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.reason}</p>}
          </div>

          {/* Handover Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Handover Status
            </label>
            <input
              type="text"
              value={handoverStatus}
              onChange={(e) => setHandoverStatus(e.target.value)}
              placeholder="e.g. Knowledge transfer ongoing with team lead"
              className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Clearance Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clearance Status
            </label>
            <input
              type="text"
              value={clearanceStatus}
              onChange={(e) => setClearanceStatus(e.target.value)}
              placeholder="e.g. IT assets returned, finance clearance pending"
              className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
            >
              Update Exit Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

