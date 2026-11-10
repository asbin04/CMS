import React from 'react';
import { CashFlowTab } from '../types';

interface CashFlowTabsProps {
  activeTab: CashFlowTab;
  onTabChange: (tab: CashFlowTab) => void;
}

export const CashFlowTabs: React.FC<CashFlowTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-slate-200/80 mb-5">
      <div className="flex items-center gap-6">
        <button
          type="button"
          data-testid="tab-cash-flow"
          onClick={() => onTabChange('cash-flow')}
          className={`pb-2.5 px-1 text-sm transition-colors cursor-pointer relative ${
            activeTab === 'cash-flow'
              ? 'text-[#4F46E5] font-semibold border-b-2 border-[#4F46E5]'
              : 'text-slate-500 hover:text-slate-700 font-medium'
          }`}
        >
          Cash Flow
        </button>

        <button
          type="button"
          data-testid="tab-trends-analysis"
          onClick={() => onTabChange('trends-analysis')}
          className={`pb-2.5 px-1 text-sm transition-colors cursor-pointer relative ${
            activeTab === 'trends-analysis'
              ? 'text-[#4F46E5] font-semibold border-b-2 border-[#4F46E5]'
              : 'text-slate-500 hover:text-slate-700 font-medium'
          }`}
        >
          Trends & Analysis
        </button>
      </div>
    </div>
  );
};
