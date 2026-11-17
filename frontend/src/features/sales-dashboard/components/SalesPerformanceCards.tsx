import React from 'react';
import { Users, Target, FileText, ThumbsUp } from 'lucide-react';
import { SalesPerformanceData } from '../types';

interface SalesPerformanceCardsProps {
  data: SalesPerformanceData;
}

export const SalesPerformanceCards: React.FC<SalesPerformanceCardsProps> = ({ data }) => {
  const { leads, opportunities, proposals, contracts } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full items-stretch">
      {/* 1. Leads Performance */}
      <div className="box-border flex flex-col p-4 bg-white border border-[#E2E8F0]/90 rounded-[12px] h-[214px] shadow-none">
        <div className="flex items-center pb-3 border-b border-[#F1F5F9]">
          <Users className="w-4 h-4 stroke-[#7C3AED] stroke-[1.8]" />
          <h2 className="ml-2 font-['Inter'] font-bold text-[14px] leading-5 text-[#6D28D9]">
            Leads Performance
          </h2>
        </div>
        <div className="flex flex-col gap-2.5 pt-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Total Leads
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A]">
              {leads.formattedTotalLeads}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Open Leads
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#1E293B]">
              {leads.formattedOpenLeads}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Won Leads
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#1E293B]">
              {leads.formattedWonLeads}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-[#F8FAFC] pt-1">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Lead → Won %
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A]">
              {leads.formattedLeadWonPct}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Opportunities Performance */}
      <div className="box-border flex flex-col p-4 bg-white border border-[#E2E8F0]/90 rounded-[12px] h-[214px] shadow-none">
        <div className="flex items-center pb-3 border-b border-[#F1F5F9]">
          <Target className="w-4 h-4 stroke-[#0284C7] stroke-[1.8]" />
          <h2 className="ml-2 font-['Inter'] font-bold text-[14px] leading-5 text-[#0369A1]">
            Opportunities Performance
          </h2>
        </div>
        <div className="flex flex-col gap-2 pt-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Total Opportunities
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A]">
              {opportunities.formattedTotalOpportunities}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Open Opportunities
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A]">
              {opportunities.formattedOpenOpportunities}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Pipeline Value
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#1E293B]">
              {opportunities.formattedPipelineValue}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Weighted Pipeline
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#1E293B]">
              {opportunities.formattedWeightedPipeline}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-[#F8FAFC] pt-0.5">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Won Opportunity Value
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#1E293B]">
              {opportunities.formattedWonOpportunityValue}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Proposal Performance */}
      <div className="box-border flex flex-col p-4 bg-white border border-[#E2E8F0]/90 rounded-[12px] h-[214px] shadow-none">
        <div className="flex items-center pb-3 border-b border-[#F1F5F9]">
          <FileText className="w-4 h-4 stroke-[#D97706] stroke-[1.8]" />
          <h2 className="ml-2 font-['Inter'] font-bold text-[14px] leading-5 text-[#B45309]">
            Proposal Performance
          </h2>
        </div>
        <div className="flex flex-col gap-2.5 pt-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Total Proposal Value
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A]">
              {proposals.formattedTotalProposalValue}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Accepted Proposal Value
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A]">
              {proposals.formattedAcceptedProposalValue}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-[#F8FAFC] pt-1">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Proposal Win Rate
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A]">
              {proposals.formattedProposalWinRate}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Contract Performance */}
      <div className="box-border flex flex-col p-4 bg-white border border-[#E2E8F0]/90 rounded-[12px] h-[214px] shadow-none">
        <div className="flex items-center pb-3 border-b border-[#F1F5F9]">
          <ThumbsUp className="w-4 h-4 stroke-[#059669] stroke-[1.8]" />
          <h2 className="ml-2 font-['Inter'] font-bold text-[14px] leading-5 text-[#047857]">
            Contract Performance
          </h2>
        </div>
        <div className="flex flex-col gap-4 pt-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Active Contracts
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A]">
              {contracts.formattedActiveContracts}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-[#F8FAFC] pt-2">
            <span className="font-['Inter'] font-normal text-[12px] leading-4 text-[#475569]">
              Contracted Value
            </span>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A]">
              {contracts.formattedContractedValue}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
