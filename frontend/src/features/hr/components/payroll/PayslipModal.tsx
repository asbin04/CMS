import React from 'react';
import { X, Printer, Download, Building2, CheckCircle2 } from 'lucide-react';
import { PayrollRecord } from '../../types/payroll';
import { formatIndianCurrency } from './PayrollTable';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PayrollRecord | null;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between sticky top-0 bg-white z-10 print:hidden">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span>Payslip Preview</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono">
              {record.payrollId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-8 flex flex-col gap-6 text-slate-800 print:p-0">
          {/* Company Branding & Payslip Header */}
          <div className="border-b border-slate-200 pb-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0D172E] text-white flex items-center justify-center font-bold text-lg">
                <Building2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                  KALPANAAA SOFTWARE SOLUTIONS
                </h1>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Private Limited • Bengaluru, Karnataka, India
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                PAYSLIP
              </span>
              <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                {record.payrollMonth}
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">
                Ref: {record.payrollId}
              </span>
            </div>
          </div>

          {/* Employee Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Employee Name</span>
              <span className="font-bold text-slate-900 text-sm">{record.employeeName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Employee ID</span>
              <span className="font-semibold text-slate-800">{record.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Employment Type</span>
              <span className="font-semibold text-slate-800">{record.employmentType}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">PAN Number</span>
              <span className="font-mono text-slate-800">{record.panNumber || 'ABCDE1234F'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Bank Name</span>
              <span className="font-semibold text-slate-800">{record.bankName || 'HDFC Bank'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Bank Account</span>
              <span className="font-mono text-slate-800">{record.bankAccount || 'XXXXXXXX4589'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Working Days</span>
              <span className="font-semibold text-slate-800">{record.workingDays} Days</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Paid Days</span>
              <span className="font-semibold text-slate-800">{record.paidDays} Days</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Loss of Pay (LOP)</span>
              <span className="font-semibold text-slate-800">{record.lopDays} Days</span>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-2 bg-[#F1F5F9] font-bold text-slate-700 py-2.5 px-4 uppercase text-[11px] tracking-wider border-b border-slate-200">
              <div>Earnings</div>
              <div>Deductions</div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              {/* Earnings column */}
              <div className="p-4 flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Basic Salary</span>
                  <span className="font-semibold text-slate-900">{formatIndianCurrency(record.basicPay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">House Rent Allowance (HRA)</span>
                  <span className="font-semibold text-slate-900">{formatIndianCurrency(record.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Special Allowances</span>
                  <span className="font-semibold text-slate-900">{formatIndianCurrency(record.allowances)}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Gross Earnings</span>
                  <span>{formatIndianCurrency(record.grossSalary)}</span>
                </div>
              </div>

              {/* Deductions column */}
              <div className="p-4 flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Provident Fund (PF)</span>
                  <span className="font-semibold text-slate-900">
                    {formatIndianCurrency(record.deductions * 0.6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Professional Tax / TDS</span>
                  <span className="font-semibold text-slate-900">
                    {formatIndianCurrency(record.deductions * 0.4)}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-rose-600">
                  <span>Total Deductions</span>
                  <span>{formatIndianCurrency(record.deductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block">
                Net Pay Disbursed
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-900 block mt-0.5">
                {formatIndianCurrency(record.netSalary)}
              </span>
              <span className="text-[11px] text-indigo-600/80 block mt-1">
                Disbursed via {record.paymentMode || 'Bank Transfer'} on{' '}
                {record.paymentDate || 'End of Month'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{record.paymentStatus}</span>
              </span>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            This is a computer-generated payslip and requires no physical signature.
          </div>
        </div>
      </div>
    </div>
  );
};

