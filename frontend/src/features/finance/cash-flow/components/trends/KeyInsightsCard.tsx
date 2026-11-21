import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface KeyInsightsCardProps {
  insights?: string[];
}

export const KeyInsightsCard: React.FC<KeyInsightsCardProps> = ({
  insights = [],
}) => {
  const items = insights || [];

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
          {items.length === 0 ? (
            <p className="text-xs text-slate-400 m-0 py-4 text-center">
              No cash flow insights available for this period.
            </p>
          ) : (
            items.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 leading-relaxed m-0 font-medium">
                  {insight}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
