import React, { useState } from 'react';
import { X, CreditCard, AlertCircle } from 'lucide-react';
import {
  PayrollRecord,
  EmploymentType,
  PayrollStatus,
  ProcessPayrollPayload,
  PayrollFilterOptions,
} from '../../types/payroll';

interface ProcessPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ProcessPayrollPayload) => Promise<void>;
  filterOptions: PayrollFilterOptions;
  isSubmitting?: boolean;
}

export const ProcessPayrollModal: React.FC<ProcessPayrollModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  filterOptions,
  isSubmitting = false,
}) => {
  const [payrollMonth, setPayrollMonth] = useState('Oct 2026');
  const [employeeId, setEmployeeId] = useState('EMP-001');
  const [employeeName, setEmployeeName] = useState('Amit Sharma');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full Time');
  const [monthlyCtc, setMonthlyCtc] = useState<number>(600000);
  const [workingDays, setWorkingDays] = useState<number>(22);
  const [lopDays, setLopDays] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PayrollStatus>('Paid');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [bankAccount, setBankAccount] = useState('XXXXXXXX4589');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const paidDays = Math.max(0, workingDays - lopDays);
  const daysRatio = workingDays > 0 ? paidDays / workingDays : 1;
  const monthlyRate = monthlyCtc / 12;
  const basicPay = Math.round(monthlyRate * 0.5 * daysRatio);
  const hra = Math.round(basicPay * 0.5);
  const allowances = Math.round(monthlyRate * 0.1 * daysRatio);
  const grossSalary = basicPay + hra + allowances;
  const deductions = Math.round(grossSalary * 0.08);
  const netSalary = grossSalary - deductions;

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setEmployeeId(selectedId);
    const emp = filterOptions.employees?.find((x) => x.employeeId === selectedId);
    if (emp) {
      setEmployeeName(emp.employeeName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        payrollMonth,
        employeeId,
        employeeName,
        employmentType,
        monthlyCtc,
        workingDays,
        paidDays,
        lopDays,
        basicPay,
        hra,
        allowances,
        deductions,
        paymentStatus,
        paymentDate: paymentStatus === 'Paid' ? new Date().toISOString().slice(0, 10) : undefined,
        paymentMode: 'Bank Transfer',
        bankName,
        bankAccount,
        panNumber,
        notes,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to process payroll record. Please check inputs.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight m-0">
                Process Monthly Payroll
              </h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Calculate earnings, deductions, and record salary disbursement in the database.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payroll Month */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Payroll Month</label>
              <input
                type="text"
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                required
                placeholder="e.g. Oct 2026"
                className="h-9 px-3 text-xs rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Employment Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="h-9 px-3 text-xs rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="Full Time">Full Time</option>
                <option value="Contract">Contract</option>
                <option value="Part Time">Part Time</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            {/* Employee Selection */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Select Employee</label>
              <select
                value={employeeId}
                onChange={handleEmployeeChange}
                className="h-9 px-3 text-xs rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                {filterOptions.employees?.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.employeeName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly CTC */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Annual / Monthly CTC (₹)</label>
              <input
                type="number"
                value={monthlyCtc}
                onChange={(e) => setMonthlyCtc(Number(e.target.value))}
                required
                min={50000}
                step={10000}
                className="h-9 px-3 text-xs rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Payment Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PayrollStatus)}
                className="h-9 px-3 text-xs rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
              </select>
            </div>

            {/* Working Days */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Working Days</label>
              <input
                type="number"
                value={workingDays}
                onChange={(e) => setWorkingDays(Number(e.target.value))}
                min={1}
                max={31}
                className="h-9 px-3 text-xs rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* LOP Days */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Loss of Pay (LOP) Days</label>
              <input
                type="number"
                value={lopDays}
                onChange={(e) => setLopDays(Number(e.target.value))}
                min={0}
                max={workingDays}
                className="h-9 px-3 text-xs rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Salary Breakdown Preview Card */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-2 mt-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Calculated Salary Breakdown
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Paid Days:</span>
                <span className="font-semibold text-slate-900">{paidDays} / {workingDays}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Basic Pay:</span>
                <span className="font-semibold text-slate-900">₹ {basicPay.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">HRA:</span>
                <span className="font-semibold text-slate-900">₹ {hra.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Allowances:</span>
                <span className="font-semibold text-slate-900">₹ {allowances.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Gross Salary:</span>
                <span className="font-semibold text-slate-900">₹ {grossSalary.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Deductions (8%):</span>
                <span className="font-semibold text-rose-600">₹ {deductions.toLocaleString('en-IN')}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Net Salary Disbursed:</span>
                <span className="font-bold text-base text-indigo-700">₹ {netSalary.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Bank Account</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">PAN Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                className="h-9 px-3 text-xs rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9] mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 h-9 rounded-lg border border-[#E2E8F0] text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 h-9 rounded-lg bg-[#4338CA] hover:bg-[#3730A3] active:bg-[#312E81] text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs disabled:opacity-60"
            >
              {isSubmitting ? 'Processing...' : 'Confirm & Save Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

