import React from 'react';
import {
  Users,
  Target,
  FileText,
  ThumbsUp,
  ArrowRight,
  Calendar,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import { WorkflowStageData } from '../types';

interface SalesWorkflowCardProps {
  stages?: WorkflowStageData[];
  onNavigateFollowUpQueue: () => void;
}

export const SalesWorkflowCard: React.FC<SalesWorkflowCardProps> = ({
  onNavigateFollowUpQueue,
}) => {
  return (
    <div className="box-border flex flex-col justify-between p-5 bg-white border border-[#E2E8F0]/90 rounded-[12px] h-[335.5px] shadow-none w-full">
      {/* Top Container */}
      <div className="flex flex-col gap-2 w-full">
        {/* Header */}
        <div className="flex items-center pb-4 text-slate-900 border-b border-[#F1F5F9]/60">
          <Inbox className="w-5 h-5 stroke-[#4F46E5] stroke-[2]" />
          <h2 className="ml-2 font-['Inter'] font-bold text-[14px] leading-5 text-[#0F172A]">
            Sales Workflow
          </h2>
        </div>

        {/* Workflow Process Steps Container */}
        <div className="flex flex-row items-center justify-center gap-2 w-full h-[150.5px]">
          {/* Step 1: Lead */}
          <div className="box-border flex-1 h-[150px] min-h-[140px] bg-[#F4F0FF] border border-[#F3E8FF] rounded-[12px] flex flex-col items-center justify-center p-2 text-center transition-all hover:-translate-y-0.5">
            <div className="w-8 h-8 rounded-full bg-[rgba(233,213,255,0.5)] flex items-center justify-center mb-2 shrink-0">
              <Users className="w-4 h-4 stroke-[#7E22CE] stroke-[1.8]" />
            </div>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A] mb-1">
              Lead
            </span>
            <p className="font-['Inter'] font-normal text-[11px] leading-[15px] text-[#64748B] text-center max-w-[150px] px-1">
              Capture and qualify potential customers.
            </p>
          </div>

          {/* Step Arrow 1 */}
          <div className="flex items-center justify-center shrink-0">
            <ArrowRight className="w-3.5 h-3.5 stroke-[#4F46E5] stroke-[1.8]" />
          </div>

          {/* Step 2: Opportunity */}
          <div className="box-border flex-1 h-[150.5px] min-h-[140px] bg-[#F0F6FF] border border-[#E0F2FE] rounded-[12px] flex flex-col items-center justify-center p-2 text-center transition-all hover:-translate-y-0.5">
            <div className="w-8 h-8 rounded-full bg-[rgba(186,230,253,0.5)] flex items-center justify-center mb-2 shrink-0">
              <Target className="w-4 h-4 stroke-[#0369A1] stroke-[1.8]" />
            </div>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A] mb-1">
              Opportunity
            </span>
            <p className="font-['Inter'] font-normal text-[11px] leading-[15px] text-[#64748B] text-center max-w-[150px] px-1">
              Develop and pursue qualified business opportunities.
            </p>
          </div>

          {/* Step Arrow 2 */}
          <div className="flex items-center justify-center shrink-0">
            <ArrowRight className="w-3.5 h-3.5 stroke-[#4F46E5] stroke-[1.8]" />
          </div>

          {/* Step 3: Proposal */}
          <div className="box-border flex-1 h-[150.5px] min-h-[140px] bg-[#FFFBEB] border border-[#FEF3C7] rounded-[12px] flex flex-col items-center justify-center p-2 text-center transition-all hover:-translate-y-0.5">
            <div className="w-8 h-8 rounded-full bg-[rgba(253,230,138,0.5)] flex items-center justify-center mb-2 shrink-0">
              <FileText className="w-4 h-4 stroke-[#B45309] stroke-[1.8]" />
            </div>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A] mb-1">
              Proposal
            </span>
            <p className="font-['Inter'] font-normal text-[11px] leading-[15px] text-[#64748B] text-center max-w-[150px] px-1">
              Create and share commercial proposals with clients.
            </p>
          </div>

          {/* Step Arrow 3 */}
          <div className="flex items-center justify-center shrink-0">
            <ArrowRight className="w-3.5 h-3.5 stroke-[#4F46E5] stroke-[1.8]" />
          </div>

          {/* Step 4: Contract */}
          <div className="box-border flex-1 h-[150px] min-h-[140px] bg-[#ECFDF5] border border-[#D1FAE5] rounded-[12px] flex flex-col items-center justify-center p-2 text-center transition-all hover:-translate-y-0.5">
            <div className="w-8 h-8 rounded-full bg-[rgba(167,243,208,0.5)] flex items-center justify-center mb-2 shrink-0">
              <ThumbsUp className="w-4 h-4 stroke-[#047857] stroke-[1.8]" />
            </div>
            <span className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A] mb-1">
              Contract
            </span>
            <p className="font-['Inter'] font-normal text-[11px] leading-[15px] text-[#64748B] text-center max-w-[150px] px-1">
              Convert accepted proposals into active contracts.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Banner: Daily Sales Activities */}
      <div className="box-border w-full h-[79px] bg-[rgba(237,233,254,0.45)] border border-[#E0E7FF] rounded-[12px] p-3.5 flex flex-row items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="box-border w-10 h-10 bg-[#EEF2FF] border border-[rgba(199,210,254,0.6)] rounded-[8px] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 stroke-[#4F46E5] stroke-[2]" />
          </div>
          <div className="min-w-0 flex flex-col">
            <h4 className="font-['Inter'] font-bold text-[12px] leading-4 text-[#0F172A] truncate">
              Daily Sales Activities
            </h4>
            <p className="font-['Inter'] font-normal text-[11px] leading-4 text-[#64748B] truncate">
              Use the Follow-Up Queue for your daily lead and opportunity follow-ups.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateFollowUpQueue}
          className="box-border h-8 px-4 bg-[#4F46E5] hover:bg-[#4338CA] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[8px] flex items-center gap-1.5 text-white transition-all cursor-pointer shrink-0"
        >
          <span className="font-['Inter'] font-semibold text-[12px] leading-4 text-white text-center">
            View Follow-Up Queue
          </span>
          <ExternalLink className="w-3.5 h-3.5 stroke-white stroke-[2]" />
        </button>
      </div>
    </div>
  );
};
