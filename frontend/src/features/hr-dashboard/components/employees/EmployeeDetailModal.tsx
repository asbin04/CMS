import React from 'react';
import { X, User, Mail, Phone, MapPin, Building, Briefcase, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { Employee } from '../../types';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (emp: Employee) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !employee) return null;

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
      case 'on notice':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
      case 'inactive':
      case 'exited':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#FAFCFF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5]">
              <User className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {employee.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {employee.id} • {employee.designation}
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

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Quick status bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-medium">Employment Status</span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(employee.status)}`}>
              {employee.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">
                Department
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{employee.department}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">
                Employment Type
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{employee.employmentType}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">
                Joining Date
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{employee.joiningDate}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-1">
                Monthly CTC
              </span>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <CreditCard className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>{employee.monthlyCtc}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-xl border border-slate-100 space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              Contact & Location
            </h4>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{employee.email || `${employee.name.toLowerCase().replace(/\s+/g, '.')}@kalpanaaa.com`}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{employee.phone || '+91 98765 43210'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{employee.location || 'Bangalore HQ (Campus 2)'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
            >
              Edit Employee
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

