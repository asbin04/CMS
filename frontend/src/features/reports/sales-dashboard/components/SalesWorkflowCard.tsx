import React from 'react';
import {
  Users,
  Target,
  FileText,
  ThumbsUp,
  ArrowRight,
  Calendar,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { WorkflowStage } from '../types';

interface SalesWorkflowCardProps {
  stages: WorkflowStage[];
  onNavigateFollowUpQueue: () => void;
}

export const SalesWorkflowCard: React.FC<SalesWorkflowCardProps> = ({
  stages,
  onNavigateFollowUpQueue,
}) => {
  const getStageIcon = (id: string) => {
    switch (id) {
      case 'lead':
        return <Users className="w-3.5 h-3.5 stroke-[2.2]" />;
      case 'opportunity':
        return <Target className="w-3.5 h-3.5 stroke-[2.2]" />;
      case 'proposal':
        return <FileText className="w-3.5 h-3.5 stroke-[2.2]" />;
      case 'contract':
        return <ThumbsUp className="w-3.5 h-3.5 stroke-[2.2]" />;
      default:
        return <Users className="w-3.5 h-3.5 stroke-[2.2]" />;
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between transition-all hover:border-slate-300 h-full">
      {/* Card Header */}
      <div className="flex items-center gap-2 pb-5 text-slate-900">
        <Layers className="w-4 h-4 text-[#4F46E5] stroke-[2.2]" />
        <h2 className="text-sm sm:text-base font-bold tracking-tight">Sales Workflow</h2>
      </div>

      {/* Workflow Horizontal Steps */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 flex-1">
        {stages.map((stage, idx) => (
          <React.Fragment key={stage.id}>
            <div
              className="flex-1 min-w-0 rounded-2xl p-3.5 flex flex-col items-center text-center transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: stage.cardBg,
                borderColor: stage.cardBorder,
                borderWidth: '1px',
              }}
            >
              {/* White Circle Badge with Stage Icon */}
              <div
                className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center mb-2.5 shrink-0"
                style={{ color: stage.badgeText }}
              >
                {getStageIcon(stage.id)}
              </div>

              {/* Title & Description */}
              <h3 className="text-xs font-bold text-slate-900 mb-1 tracking-tight">
                {stage.title}
              </h3>
              <p className="text-[11px] text-slate-500 leading-snug">
                {stage.description}
              </p>
            </div>

            {/* Right Arrow between stages */}
            {idx < stages.length - 1 && (
              <div className="hidden md:flex items-center justify-center text-slate-400 shrink-0 px-0.5">
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom Banner: Daily Sales Activities */}
      <div className="mt-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#DCE4FD] flex items-center justify-center text-[#4F46E5] shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Daily Sales Activities
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-normal">
              Use the Follow-Up Queue for your daily lead and opportunity follow-ups.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateFollowUpQueue}
          className="h-9 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <span>View Follow-Up Queue</span>
          <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
};

