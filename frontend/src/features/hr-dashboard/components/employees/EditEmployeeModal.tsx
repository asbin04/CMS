import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle } from 'lucide-react';
import { Employee, EmploymentType, EmployeeStatus } from '../../types';

interface EditEmployeeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updated: Employee) => void;
  departments: string[];
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSubmit,
  departments,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full Time');
  const [status, setStatus] = useState<EmployeeStatus>('Active');
  const [monthlyCtc, setMonthlyCtc] = useState('');
  const [location, setLocation] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setEmail(employee.email || `${employee.name.toLowerCase().replace(/\s+/g, '.')}@kalpanaaa.com`);
      setPhone(employee.phone || '+91 98765 43210');
      setDepartment(employee.department || 'Development');
      setDesignation(employee.designation || '');
      setEmploymentType(employee.employmentType || 'Full Time');
      setStatus(employee.status || 'Active');
      setMonthlyCtc(employee.monthlyCtc || '');
      setLocation(employee.location || 'Bangalore HQ');
      setErrors({});
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!designation.trim()) errs.designation = 'Designation is required';
    if (!monthlyCtc.trim()) errs.monthlyCtc = 'Monthly CTC is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const updatedEmp: Employee = {
      ...employee,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department,
      designation: designation.trim(),
      employmentType,
      status,
      monthlyCtc: monthlyCtc.trim(),
      location: location.trim(),
    };

    onSubmit(updatedEmp);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#FAFCFF] sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5]">
              <Edit3 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Edit Employee Details
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Update record for {employee.id} ({employee.name})
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
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full h-9 px-3 text-xs rounded-xl border ${
                  errors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-[#4F46E5]`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#4F46E5]"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className={`w-full h-9 px-3 text-xs rounded-xl border ${
                  errors.designation ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-[#4F46E5]`}
              />
              {errors.designation && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.designation}</p>}
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Full Time">Full Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
                <option value="Part Time">Part Time</option>
              </select>
            </div>

            {/* Monthly CTC */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly CTC <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={monthlyCtc}
                onChange={(e) => setMonthlyCtc(e.target.value)}
                className={`w-full h-9 px-3 text-xs rounded-xl border ${
                  errors.monthlyCtc ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                } focus:outline-none focus:border-[#4F46E5]`}
              />
              {errors.monthlyCtc && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.monthlyCtc}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="Active">Active</option>
                <option value="On Notice">On Notice</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

