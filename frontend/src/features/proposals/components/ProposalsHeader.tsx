import React, { useState } from 'react';
import { FileText, RotateCw, Plus } from 'lucide-react';

interface ProposalsHeaderProps {
  lastUpdated: string;
  onRefresh: () => void;
  onCreateProposal: () => void;
}

export const ProposalsHeader: React.FC<ProposalsHeaderProps> = ({
  lastUpdated,
  onRefresh,
  onCreateProposal,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 w-full"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* 1. Left Area: Document icon + Title & Description (flexible space) */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] shrink-0 shadow-2xs">
          <FileText className="w-6 h-6 stroke-[2]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-7 m-0">
            Proposals
          </h1>
          <p
            className="text-xs text-slate-500 leading-4 font-normal m-0 mt-0.5"
            style={{
              maxWidth: '439px',
            }}
          >
            Create, manage, and track client proposals, including their validity, value, and decision status.
          </p>
        </div>
      </div>

      {/* Right Controls Container: Middle/right timestamp + Far right Create button */}
      <div className="flex items-center gap-4 sm:gap-5 shrink-0 self-start md:self-center">
        {/* 2. Middle/right Area: Refresh control */}
        <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
          <button
            type="button"
            onClick={handleRefreshClick}
            title="Refresh proposal data"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
          >
            <RotateCw
              className={`w-3.5 h-3.5 stroke-[2] ${
                isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* 3. Far right Area: Create Proposal button */}
        <button
          type="button"
          onClick={onCreateProposal}
          className="inline-flex items-center gap-2 px-4 py-2 h-10 bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Proposal</span>
        </button>
      </div>
    </div>
  );
};

