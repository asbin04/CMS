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
  stages: WorkflowStageData[];
  onNavigateFollowUpQueue: () => void;
}

interface StageStyleConfig {
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeColor: string;
  icon: React.ReactNode;
}

const STAGE_CONFIGS: Record<string, StageStyleConfig> = {
  lead: {
    cardBg: '#F8F5FF',
    cardBorder: '#EDE4FF',
    badgeBg: '#F1E8FE',
    badgeColor: '#8B5CF6',
    icon: <Users className="w-4 h-4 stroke-[2.2]" />,
  },
  opportunity: {
    cardBg: '#F0F8FF',
    cardBorder: '#E1F0FD',
    badgeBg: '#E2F1FE',
    badgeColor: '#0284C7',
    icon: <Target className="w-4 h-4 stroke-[2.2]" />,
  },
  proposal: {
    cardBg: '#FFFDF0',
    cardBorder: '#FDF0B5',
    badgeBg: '#FEF3C7',
    badgeColor: '#D97706',
    icon: <FileText className="w-4 h-4 stroke-[2.2]" />,
  },
  contract: {
    cardBg: '#F0FBF5',
    cardBorder: '#D5F5E3',
    badgeBg: '#D7F7E6',
    badgeColor: '#059669',
    icon: <ThumbsUp className="w-4 h-4 stroke-[2.2]" />,
  },
};

export const SalesWorkflowCard: React.FC<SalesWorkflowCardProps> = ({
  stages,
  onNavigateFollowUpQueue,
}) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between transition-all hover:border-slate-300 h-full">
      {/* Card Header with Inbox Tray Icon */}
      <div className="flex items-center gap-2.5 pb-5 text-slate-900">
        <Inbox className="w-5 h-5 text-[#4F46E5] stroke-[2.2]" />
        <h2 className="text-base font-bold tracking-tight text-slate-900">Sales Workflow</h2>
      </div>

      {/* Workflow Horizontal Steps */}
      <div className="flex flex-col md:flex-row items-stretch gap-3 flex-1">
        {stages.map((stage, idx) => {
          const config = STAGE_CONFIGS[stage.id] || {
            cardBg: stage.cardBg?.startsWith('#') ? stage.cardBg : '#F8FAFC',
            cardBorder: stage.cardBorder?.startsWith('#') ? stage.cardBorder : '#E2E8F0',
            badgeBg: stage.badgeBg?.startsWith('#') ? stage.badgeBg : '#EEF2FF',
            badgeColor: stage.badgeText?.startsWith('#') ? stage.badgeText : '#4F46E5',
            icon: <Users className="w-4 h-4 stroke-[2.2]" />,
          };

          const cardBg = stage.cardBg?.startsWith('#') ? stage.cardBg : config.cardBg;
          const cardBorder = stage.cardBorder?.startsWith('#') ? stage.cardBorder : config.cardBorder;
          const badgeBg = stage.badgeBg?.startsWith('#') ? stage.badgeBg : config.badgeBg;
          const badgeColor = stage.badgeText?.startsWith('#') ? stage.badgeText : config.badgeColor;

          return (
            <React.Fragment key={stage.id}>
              <div
                className="flex-1 min-w-0 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center justify-start transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  borderWidth: '1px',
                }}
              >
                {/* Colored Circle Badge with Stage Icon */}
                <div
                  className="w-10 h-10 rounded-full shadow-2xs flex items-center justify-center mb-3 shrink-0"
                  style={{
                    backgroundColor: badgeBg,
                    color: badgeColor,
                  }}
                >
                  {config.icon}
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 tracking-tight truncate w-full">
                  {stage.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[155px] break-words">
                  {stage.description}
                </p>
              </div>

              {/* Right Arrow between stages */}
              {idx < stages.length - 1 && (
                <div className="hidden md:flex items-center justify-center text-[#6366F1] shrink-0 px-0.5 self-center">
                  <ArrowRight className="w-4 h-4 stroke-[2] text-[#6366F1]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom Banner: Daily Sales Activities */}
      <div className="mt-5 sm:mt-6 bg-[#F8FAFF] border border-[#E9EDFD] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white border border-[#DCE4FD] flex items-center justify-center text-[#4F46E5] shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5 stroke-[2] text-[#4F46E5]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Daily Sales Activities
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-normal">
              Use the Follow-Up Queue for your daily lead and opportunity follow-ups.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateFollowUpQueue}
          className="h-10 px-5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <span>View Follow-Up Queue</span>
          <ExternalLink className="w-4 h-4 stroke-[2.2] text-white" />
        </button>
      </div>
    </div>
  );
};
