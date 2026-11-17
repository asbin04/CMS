import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  Briefcase,
  IndianRupee,
  LayoutGrid,
  Landmark,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { CreateEmployeePayload } from '@/types/employee';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEmployeePayload) => Promise<void>;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // Section 1: Basic Information
  const [employeeId, setEmployeeId] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Section 2: Organisation Details
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [reportingManager, setReportingManager] = useState('');
  const [location, setLocation] = useState('');

  // Section 3: Employment Details
  const [employmentType, setEmploymentType] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState('');
  const [yearsOfService, setYearsOfService] = useState('');
  const [tenureStatus, setTenureStatus] = useState('');
  const [notes, setNotes] = useState('');

  // Section 4: Compensation Details
  const [monthlyCtc, setMonthlyCtc] = useState('');
  const [monthlyCost, setMonthlyCost] = useState('');
  const [annualCtc, setAnnualCtc] = useState('');

  // Section 5: Salary Structure
  const [basicPercentage, setBasicPercentage] = useState('');
  const [hraPercentage, setHraPercentage] = useState('');
  const [otherAllowance, setOtherAllowance] = useState('');

  // Section 6: Statutory Contributions & Taxes
  const [employeePfPercentage, setEmployeePfPercentage] = useState('');
  const [employeeEsiPercentage, setEmployeeEsiPercentage] = useState('');
  const [ptMonthly, setPtMonthly] = useState('');
  const [tdsMonthly, setTdsMonthly] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !workEmail.trim() || !phone.trim()) {
      setError('Please fill in all required fields (Full Name, Work Email, Phone).');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const initials = fullName
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'EM';

      const numericMonthlyCtc = parseFloat(String(monthlyCtc).replace(/[^0-9.]/g, '')) || 0;
      const numericAnnualCtc =
        parseFloat(String(annualCtc).replace(/[^0-9.]/g, '')) || numericMonthlyCtc * 12;

      await onSubmit({
        employeeId: employeeId.trim() || undefined,
        employeeCode: employeeCode.trim() || undefined,
        fullName: fullName.trim(),
        avatarInitials: initials,
        avatarColor: '#1D4ED8',
        avatarBg: '#DBEAFE',
        workEmail: workEmail.trim(),
        phone: phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        department: department || 'Engineering',
        designation: designation || 'Software Engineer',
        employmentType: employmentType || 'Full Time',
        status: status || 'Active',
        location: location || 'Bangalore',
        reportingManager: reportingManager || '',
        joiningDate:
          joiningDate ||
          new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        tenureStatus: tenureStatus || '< 1 Year',
        monthlyCtc: numericMonthlyCtc,
        annualCtc: numericAnnualCtc,
        yearsOfService: yearsOfService.trim() || undefined,
        notes: notes.trim() || undefined,
        monthlyCost: parseFloat(String(monthlyCost).replace(/[^0-9.]/g, '')) || 0,
        basicPercentage: parseFloat(String(basicPercentage).replace(/[^0-9.]/g, '')) || 0,
        hraPercentage: parseFloat(String(hraPercentage).replace(/[^0-9.]/g, '')) || 0,
        otherAllowance: parseFloat(String(otherAllowance).replace(/[^0-9.]/g, '')) || 0,
        employeePfPercentage: parseFloat(String(employeePfPercentage).replace(/[^0-9.]/g, '')) || 0,
        employeeEsiPercentage: parseFloat(String(employeeEsiPercentage).replace(/[^0-9.]/g, '')) || 0,
        ptMonthly: parseFloat(String(ptMonthly).replace(/[^0-9.]/g, '')) || 0,
        tdsMonthly: parseFloat(String(tdsMonthly).replace(/[^0-9.]/g, '')) || 0,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      {/* AddEmployeeModalCard: 896px max width, border-radius 16px, exact figma auto layout */}
      <div className="relative w-full max-w-[896px] max-h-[95vh] bg-white border border-[#F1F5F9] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] rounded-[16px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header (Height: 75px) */}
        <div className="h-[75px] px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[16px] font-bold text-[#0F172A] leading-6">Add Employee</h2>
            <p className="text-[12px] font-normal text-[#64748B] leading-4">
              Enter complete employee details to create a new record.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 p-1.5 rounded-[8px] flex items-center justify-center text-[#94A3B8] hover:text-[#475569] hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Form - Modal Body (Scrollable form sections) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 text-[12px] rounded-[8px] bg-rose-50 text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <div className="h-[26px] bg-[#F8FAFC] border border-[#F1F5F9] rounded-[4px] px-3 flex items-center gap-2 select-none">
              <User className="w-4 h-4 text-[#4F46E5] stroke-[1.5]" />
              <span className="text-[13px] font-semibold text-[#1E293B] leading-4">
                Basic Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Employee ID */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter employee ID"
                  className="w-full h-[34px] px-3 py-2 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Employee Code */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Employee Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  placeholder="Enter employee code"
                  className="w-full h-[34px] px-3 py-2 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full h-[34px] px-3 py-2 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="Enter work email"
                  className="w-full h-[34px] px-3 py-2 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Phone Row */}
            <div className="w-full max-w-[415px]">
              <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                Phone <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center">
                <div className="h-[34px] px-3 bg-[#F8FAFC] border border-[#E2E8F0] border-r-0 rounded-l-[8px] flex items-center gap-1.5 text-[12px] text-[#334155] select-none flex-shrink-0">
                  <span>+91</span>
                  <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1 h-[34px] px-3 text-[12px] bg-white border border-[#E2E8F0] rounded-r-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Organisation Details */}
          <div className="space-y-3">
            <div className="h-[26px] bg-[#F8FAFC] border border-[#F1F5F9] rounded-[4px] px-3 flex items-center gap-2 select-none">
              <Building2 className="w-4 h-4 text-[#4F46E5] stroke-[1.5]" />
              <span className="text-[13px] font-semibold text-[#1E293B] leading-4">
                Organisation Details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Department ID */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Department ID <span className="text-rose-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-[34px] px-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select department
                  </option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              {/* Designation ID */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Designation ID <span className="text-rose-500">*</span>
                </label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full h-[34px] px-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select designation
                  </option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="HR Executive">HR Executive</option>
                  <option value="Accounts Manager">Accounts Manager</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Operations Executive">Operations Executive</option>
                  <option value="Marketing Specialist">Marketing Specialist</option>
                </select>
              </div>

              {/* Reporting Manager ID */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Reporting Manager ID
                </label>
                <select
                  value={reportingManager}
                  onChange={(e) => setReportingManager(e.target.value)}
                  className="w-full h-[34px] px-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select reporting manager
                  </option>
                  <option value="Akshit Ujjain">Akshit Ujjain</option>
                  <option value="Amit Sharma">Amit Sharma</option>
                  <option value="Priya Kapoor">Priya Kapoor</option>
                  <option value="Rohan Kumar">Rohan Kumar</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-[34px] px-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select location
                  </option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Remote">Remote</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Employment Details */}
          <div className="space-y-3">
            <div className="h-[26px] bg-[#F8FAFC] border border-[#F1F5F9] rounded-[4px] px-3 flex items-center gap-2 select-none">
              <Briefcase className="w-4 h-4 text-[#4F46E5] stroke-[1.5]" />
              <span className="text-[13px] font-semibold text-[#1E293B] leading-4">
                Employment Details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Employment Type */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Employment Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full h-[34px] px-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select employment type
                  </option>
                  <option value="Full Time">Full Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Joining Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative w-full h-[34px]">
                  <Calendar className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    placeholder="Select joining date"
                    className="w-full h-[34px] pl-9 pr-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-[34px] px-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select status
                  </option>
                  <option value="Active">Active</option>
                  <option value="On Notice">On Notice</option>
                  <option value="Probation">Probation</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Years of Service */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Years of Service
                </label>
                <input
                  type="text"
                  value={yearsOfService}
                  onChange={(e) => setYearsOfService(e.target.value)}
                  placeholder="Enter years of service"
                  className="w-full h-[34px] px-3 py-2 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Sub Row: Current Tenure Status & Notes */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-full sm:w-[199.5px]">
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Current Tenure Status
                </label>
                <select
                  value={tenureStatus}
                  onChange={(e) => setTenureStatus(e.target.value)}
                  className="w-full h-[34px] px-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select tenure status
                  </option>
                  <option value="< 1 Year">&lt; 1 Year</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="3+ Years">3+ Years</option>
                </select>
              </div>

              <div className="flex-1 w-full">
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes (if any)"
                  rows={2}
                  className="w-full h-[50px] p-2 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Compensation Details */}
          <div className="space-y-3">
            <div className="h-[26px] bg-[#F8FAFC] border border-[#F1F5F9] rounded-[4px] px-3 flex items-center gap-2 select-none">
              <IndianRupee className="w-4 h-4 text-[#4F46E5] stroke-[1.5]" />
              <span className="text-[13px] font-semibold text-[#1E293B] leading-4">
                Compensation Details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Monthly CTC */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Monthly CTC
                </label>
                <div className="relative w-full h-[34px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#64748B] pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={monthlyCtc}
                    onChange={(e) => setMonthlyCtc(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-[34px] pl-7 pr-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Monthly Cost */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Monthly Cost
                </label>
                <div className="relative w-full h-[34px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#64748B] pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={monthlyCost}
                    onChange={(e) => setMonthlyCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-[34px] pl-7 pr-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Annual CTC */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Annual CTC
                </label>
                <div className="relative w-full h-[34px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#64748B] pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={annualCtc}
                    onChange={(e) => setAnnualCtc(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-[34px] pl-7 pr-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Salary Structure */}
          <div className="space-y-3">
            <div className="h-[25px] bg-[#F8FAFC] border-b border-[#F1F5F9] rounded-[4px] px-3 flex items-center gap-2 select-none">
              <LayoutGrid className="w-4 h-4 text-[#4F46E5] stroke-[1.5]" />
              <span className="text-[13px] font-semibold text-[#1E293B] leading-4">
                Salary Structure
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Basic % */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Basic %
                </label>
                <div className="relative w-full h-[34px]">
                  <input
                    type="text"
                    value={basicPercentage}
                    onChange={(e) => setBasicPercentage(e.target.value)}
                    placeholder="0.0"
                    className="w-full h-[34px] pl-3 pr-8 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#94A3B8] pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              {/* HRA % */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  HRA %
                </label>
                <div className="relative w-full h-[34px]">
                  <input
                    type="text"
                    value={hraPercentage}
                    onChange={(e) => setHraPercentage(e.target.value)}
                    placeholder="0.0"
                    className="w-full h-[34px] pl-3 pr-8 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#94A3B8] pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              {/* Other Allowance */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Other Allowance
                </label>
                <div className="relative w-full h-[34px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#64748B] pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={otherAllowance}
                    onChange={(e) => setOtherAllowance(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-[34px] pl-7 pr-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Statutory Contributions & Taxes */}
          <div className="space-y-3">
            <div className="h-[26px] bg-[#F8FAFC] border border-[#F1F5F9] rounded-[4px] px-3 flex items-center gap-2 select-none">
              <Landmark className="w-4 h-4 text-[#4F46E5] stroke-[1.5]" />
              <span className="text-[13px] font-semibold text-[#1E293B] leading-4">
                Statutory Contributions & Taxes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Employee PF % */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Employee PF %
                </label>
                <div className="relative w-full h-[34px]">
                  <input
                    type="text"
                    value={employeePfPercentage}
                    onChange={(e) => setEmployeePfPercentage(e.target.value)}
                    placeholder="0.0"
                    className="w-full h-[34px] pl-3 pr-8 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#94A3B8] pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              {/* Employee ESI % */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  Employee ESI %
                </label>
                <div className="relative w-full h-[34px]">
                  <input
                    type="text"
                    value={employeeEsiPercentage}
                    onChange={(e) => setEmployeeEsiPercentage(e.target.value)}
                    placeholder="0.0"
                    className="w-full h-[34px] pl-3 pr-8 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#94A3B8] pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              {/* PT Monthly */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  PT Monthly
                </label>
                <div className="relative w-full h-[34px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#64748B] pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={ptMonthly}
                    onChange={(e) => setPtMonthly(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-[34px] pl-7 pr-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* TDS Monthly */}
              <div>
                <label className="block text-[12px] font-medium text-[#334155] leading-4 mb-1.5">
                  TDS Monthly
                </label>
                <div className="relative w-full h-[34px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#64748B] pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={tdsMonthly}
                    onChange={(e) => setTdsMonthly(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-[34px] pl-7 pr-3 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer (Height: 71px) */}
          <div className="h-[71px] -mx-6 -mb-6 px-7 border-t border-[#F1F5F9] bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-[82.31px] h-[38px] px-5 bg-white border border-[#CBD5E1] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[8px] text-[12px] font-semibold text-[#334155] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[132px] h-[36px] px-6 bg-[#4F46E5] hover:bg-[#4338CA] shadow-[0px_4px_6px_-1px_rgba(59,130,246,0.25),0px_2px_4px_-2px_rgba(59,130,246,0.25)] rounded-[8px] text-[12px] font-semibold text-white transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
