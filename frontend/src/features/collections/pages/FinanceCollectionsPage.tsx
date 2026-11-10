import React from 'react';
import { CircleDollarSign, Layers, Clock, ShieldCheck } from 'lucide-react';

export const FinanceCollectionsPage: React.FC = () => {
  return (
    <div
      className="w-full min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <CircleDollarSign className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">
                Collections
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Finance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 m-0 mt-0.5 font-normal">
              Finance collections management, settlement schedules, and accounts receivable tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs text-slate-600 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Initialized & Ready</span>
          </div>
        </div>
      </div>

      {/* Clean Empty Placeholder State */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-8 sm:p-14 text-center max-w-4xl mx-auto mt-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center mx-auto mb-5 text-slate-400">
          <Layers className="w-8 h-8 stroke-[1.8]" />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
          Finance Collections Workspace
        </h2>

        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
          This dedicated workspace is reserved for Finance module collections. The route is active and ready for future module development.
        </p>

        {/* Feature readiness checklist cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Separate Route</span>
            </div>
            <p className="text-xs text-slate-600 m-0 font-medium">/finance/collections</p>
            <p className="text-[11px] text-slate-400 m-0 mt-0.5">Isolated from Management Collections</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Sidebar Active</span>
            </div>
            <p className="text-xs text-slate-600 m-0 font-medium">Finance Navigation</p>
            <p className="text-[11px] text-slate-400 m-0 mt-0.5">Preserved in sidebar structure</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Module Status</span>
            </div>
            <p className="text-xs text-slate-600 m-0 font-medium">Ready for Development</p>
            <p className="text-[11px] text-slate-400 m-0 mt-0.5">Component template initialized</p>
          </div>
        </div>
      </div>
    </div>
  );
};

