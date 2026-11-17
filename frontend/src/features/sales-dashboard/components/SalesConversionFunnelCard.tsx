import React from 'react';
import { Filter } from 'lucide-react';
import { FunnelStageData, ConversionOverviewData } from '../types';

interface SalesConversionFunnelCardProps {
  stages: FunnelStageData[];
  conversion: ConversionOverviewData;
}

export const SalesConversionFunnelCard: React.FC<SalesConversionFunnelCardProps> = ({
  stages,
  conversion,
}) => {
  const getStageValue = (id: string, fallbackIdx: number): number => {
    const s = stages.find((item) => item.id.toLowerCase().includes(id));
    if (s) return s.value;
    return stages[fallbackIdx]?.value ?? 0;
  };

  const leadsVal = getStageValue('lead', 0);
  const oppsVal = getStageValue('opp', 1);
  const proposalsVal = getStageValue('prop', 2);
  const contractsVal = getStageValue('contract', 3);

  return (
    <div className="box-border flex flex-col p-5 bg-white border border-[#E2E8F0]/90 rounded-[12px] h-[335.5px] shadow-none w-full">
      {/* Header */}
      <div className="flex items-center pb-4 text-slate-900 border-b border-[#F1F5F9]/60">
        <Filter className="w-5 h-5 stroke-[#4F46E5] stroke-[2]" />
        <h2 className="ml-2 font-['Inter'] font-bold text-[14px] leading-5 text-[#0F172A]">
          Sales Conversion Funnel
        </h2>
      </div>

      {/* Funnel and Conversion Overview Split */}
      <div className="flex flex-row items-center justify-around gap-2.5 pt-2 w-full h-[223px]">
        {/* Left: Funnel Graphic Tiers */}
        <div className="w-[171px] h-[164px] flex flex-col items-center justify-center gap-1 shrink-0">
          {/* Tier 1: Leads */}
          <div
            className="w-[171px] h-[41px] bg-[#5D4BED] flex flex-col items-center justify-center text-center transition-all hover:brightness-105"
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 88% 100%, 12% 100%)',
            }}
          >
            <span className="font-['Inter'] font-bold text-[12px] leading-[18px] text-white">
              {leadsVal.toLocaleString('en-IN')}
            </span>
            <span className="font-['Inter'] font-medium text-[7px] leading-[15px] tracking-[0.5px] uppercase text-[#E0E7FF]">
              LEADS
            </span>
          </div>

          {/* Tier 2: Opportunities */}
          <div
            className="w-[171px] h-[37px] bg-[#8796F6] flex flex-col items-center justify-center text-center transition-all hover:brightness-105"
            style={{
              clipPath: 'polygon(12% 0%, 88% 0%, 78% 100%, 22% 100%)',
            }}
          >
            <span className="font-['Inter'] font-bold text-[12px] leading-[18px] text-white">
              {oppsVal.toLocaleString('en-IN')}
            </span>
            <span className="font-['Inter'] font-medium text-[7px] leading-[15px] tracking-[0.5px] uppercase text-[#E0E7FF]">
              OPPORTUNITIES
            </span>
          </div>

          {/* Tier 3: Proposals */}
          <div
            className="w-[171px] h-[33px] bg-[#C7D2FE] flex flex-col items-center justify-center text-center transition-all hover:brightness-105"
            style={{
              clipPath: 'polygon(22% 0%, 78% 0%, 70% 100%, 30% 100%)',
            }}
          >
            <span className="font-['Inter'] font-bold text-[12px] leading-[18px] text-[#1E293B]">
              {proposalsVal.toLocaleString('en-IN')}
            </span>
            <span className="font-['Inter'] font-semibold text-[7px] leading-[15px] tracking-[0.5px] uppercase text-[#475569]">
              PROPOSALS
            </span>
          </div>

          {/* Tier 4: Contracts */}
          <div
            className="w-[171px] h-[33px] bg-[#E8EDFC] flex flex-col items-center justify-center text-center transition-all hover:brightness-105"
            style={{
              clipPath: 'polygon(30% 0%, 70% 0%, 65% 100%, 35% 100%)',
            }}
          >
            <span className="font-['Inter'] font-bold text-[12px] leading-[18px] text-[#1E293B]">
              {contractsVal.toLocaleString('en-IN')}
            </span>
            <span className="font-['Inter'] font-semibold text-[7px] leading-[15px] tracking-[0.5px] uppercase text-[#475569]">
              CONTRACTS
            </span>
          </div>
        </div>

        {/* Right: Conversion Overview Table */}
        <div className="w-[153px] h-[219px] flex flex-col justify-between pl-2 shrink-0">
          <div>
            <h4 className="font-['Inter'] font-bold text-[10px] leading-4 text-[#0F172A] mb-3">
              Conversion Overview
            </h4>
            <div className="flex flex-col gap-3">
              {/* Row 1 */}
              <div className="flex items-center justify-between">
                <div className="font-['Inter'] font-medium text-[10px] leading-4 text-[#475569]">
                  <span className="block">Lead →</span>
                  <span className="block">Opportunity</span>
                </div>
                <span className="font-['Inter'] font-bold text-[10px] leading-4 text-[#0F172A]">
                  {conversion.leadToOpportunity}
                </span>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between">
                <div className="font-['Inter'] font-medium text-[10px] leading-4 text-[#475569]">
                  <span className="block">Opportunity →</span>
                  <span className="block">Proposal</span>
                </div>
                <span className="font-['Inter'] font-bold text-[10px] leading-4 text-[#0F172A]">
                  {conversion.opportunityToProposal}
                </span>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between">
                <div className="font-['Inter'] font-medium text-[10px] leading-4 text-[#475569]">
                  <span>Proposal → Contract</span>
                </div>
                <span className="font-['Inter'] font-bold text-[10px] leading-4 text-[#0F172A]">
                  {conversion.proposalToContract}
                </span>
              </div>
            </div>
          </div>

          {/* Highlight Box: Overall Conversion */}
          <div className="box-border w-[153px] h-[29px] bg-[#EEF2FF] border border-[#E0E7FF] rounded-[8px] px-2.5 flex items-center justify-between mt-3.5">
            <span className="font-['Inter'] font-bold text-[10px] leading-4 text-[#4F46E5]">
              Overall Conversion
            </span>
            <span className="font-['Inter'] font-bold text-[10px] leading-5 text-[#4338CA]">
              {conversion.overallConversion}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
