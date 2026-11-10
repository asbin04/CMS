import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { KEY_INSIGHTS } from '../../mockData';

interface KeyInsightsCardProps {
  insights?: string[];
}

export const KeyInsightsCard: React.FC<KeyInsightsCardProps> = ({
  insights = KEY_INSIGHTS,
}) => {
  const items = insights && insights.length > 0 ? insights : KEY_INSIGHTS;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight m-0">
            Key Insights
          </h3>
        </div>

        <div className="space-y-3.5">
          {items.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 leading-relaxed m-0">
                {idx === 0 ? (
                  <>
                    Total inflows are <span className="font-bold text-slate-900">19.3% higher</span> than total outflows.
                  </>
                ) : idx === 1 ? (
                  <>
                    Closing cash has increased by <span className="font-bold text-slate-900">77.0%</span> from Jun 2026 to Oct 2026.
                  </>
                ) : idx === 2 ? (
                  <>
                    Vendor payments account for <span className="font-bold text-slate-900">53.6%</span> of total outflows.
                  </>
                ) : idx === 3 ? (
                  <>
                    Net cash flow for Oct 2026 is <span className="font-bold text-slate-900">₹ 4,65,000</span>.
                  </>
                ) : (
                  insight
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
