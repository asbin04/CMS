import React from 'react';
import { Layers } from 'lucide-react';

export const PageHeader: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 w-full">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] shrink-0 shadow-2xs">
          <Layers className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-7 m-0">
            Timesheets &amp; Requirements
          </h1>
          <p className="text-xs text-slate-500 leading-4 font-normal m-0 mt-0.5">
            Track project effort with timesheets and manage project requirements with full visibility.
          </p>
        </div>
      </div>
    </div>
  );
};

