import React from 'react';
import { Users, Target, FileText, ThumbsUp } from 'lucide-react';
import { SalesPerformanceData } from '../types';

interface SalesPerformanceCardsProps {
  data: SalesPerformanceData;
}

export const SalesPerformanceCards: React.FC<SalesPerformanceCardsProps> = ({ data }) => {
  const { leads, opportunities, proposals, contracts } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
      {/* 1. Leads Performance */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex flex-col transition-all hover:border-slate-300">
        <div className="flex items-center gap-2 pb-4 text-[#7C3AED]">
          <Users className="w-4 h-4 stroke-[2.2]" />
          <h2 className="text-sm font-bold tracking-tight">Leads Performance</h2>
        </div>
        <div className="space-y-3.5 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Total Leads</span>
            <span className="text-slate-900 font-bold">{leads.totalLeads}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Open Leads</span>
            <span className="text-slate-900 font-bold">{leads.openLeads}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Won Leads</span>
            <span className="text-slate-900 font-bold">{leads.wonLeads}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Lead → Won %</span>
            <span className="text-slate-900 font-bold">{leads.leadWonPct}</span>
          </div>
        </div>
      </div>

      {/* 2. Opportunities Performance */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex flex-col transition-all hover:border-slate-300">
        <div className="flex items-center gap-2 pb-4 text-[#0284C7]">
          <Target className="w-4 h-4 stroke-[2.2]" />
          <h2 className="text-sm font-bold tracking-tight leading-tight">
            Opportunities Performance
          </h2>
        </div>
        <div className="space-y-3.5 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Total Opportunities</span>
            <span className="text-slate-900 font-bold">{opportunities.totalOpportunities}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Open Opportunities</span>
            <span className="text-slate-900 font-bold">{opportunities.openOpportunities}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Pipeline Value</span>
            <span className="text-slate-900 font-bold">{opportunities.pipelineValue}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Weighted Pipeline</span>
            <span className="text-slate-900 font-bold">{opportunities.weightedPipeline}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Won Opportunity Value</span>
            <span className="text-slate-900 font-bold">{opportunities.wonOpportunityValue}</span>
          </div>
        </div>
      </div>

      {/* 3. Proposal Performance */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex flex-col transition-all hover:border-slate-300">
        <div className="flex items-center gap-2 pb-4 text-[#D97706]">
          <FileText className="w-4 h-4 stroke-[2.2]" />
          <h2 className="text-sm font-bold tracking-tight">Proposal Performance</h2>
        </div>
        <div className="space-y-3.5 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Total Proposal Value</span>
            <span className="text-slate-900 font-bold">{proposals.totalProposalValue}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Accepted Proposal Value</span>
            <span className="text-slate-900 font-bold">{proposals.acceptedProposalValue}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Proposal Win Rate</span>
            <span className="text-slate-900 font-bold">{proposals.proposalWinRate}</span>
          </div>
        </div>
      </div>

      {/* 4. Contract Performance */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex flex-col transition-all hover:border-slate-300">
        <div className="flex items-center gap-2 pb-4 text-[#16A34A]">
          <ThumbsUp className="w-4 h-4 stroke-[2.2]" />
          <h2 className="text-sm font-bold tracking-tight">Contract Performance</h2>
        </div>
        <div className="space-y-3.5 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Active Contracts</span>
            <span className="text-slate-900 font-bold">{contracts.activeContracts}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-normal">Contracted Value</span>
            <span className="text-slate-900 font-bold">{contracts.contractedValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

