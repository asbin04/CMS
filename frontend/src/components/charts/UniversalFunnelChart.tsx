import React, { useState } from 'react';

export interface FunnelStageItem {
  stage_name: string;
  lead_count: number;
  conversion_rate?: number;
  color_hex: string;
  textColor?: string;
  subtextColor?: string;
  sublabel?: string;
}

export interface FunnelConversionOverviewItem {
  label: string;
  value: string;
}

export interface UniversalFunnelChartProps {
  data: FunnelStageItem[];
  height?: number;
  variant?: 'compact' | 'detailed';
  showLabelsInside?: boolean;
  conversionOverview?: FunnelConversionOverviewItem[];
  overallConversion?: string;
  funnelWidth?: number | string;
  className?: string;
}

export const UniversalFunnelChart: React.FC<UniversalFunnelChartProps> = ({
  data,
  height = 145,
  variant = 'compact',
  showLabelsInside = false,
  conversionOverview,
  overallConversion,
  funnelWidth,
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const isDetailed = variant === 'detailed' || showLabelsInside || Boolean(conversionOverview);

  // Width percentages from top to bottom
  const widthSteps = [
    { top: 100, bottom: 84 },
    { top: 82, bottom: 66 },
    { top: 64, bottom: 48 },
    { top: 46, bottom: 32 },
  ];

  if (isDetailed) {
    return (
      <div className={`grid grid-cols-1 2xl:grid-cols-12 gap-5 2xl:gap-6 items-center flex-1 w-full select-none min-w-0 ${className}`}>
        {/* Visual Inverted Trapezoid Funnel */}
        <div className="2xl:col-span-6 flex items-center justify-center py-1 min-w-0 w-full">
          <div
            className="w-full flex flex-col items-center justify-center gap-1 min-w-0"
            style={{ maxWidth: funnelWidth || '230px' }}
          >
            {data.map((stage, idx) => {
              const step = widthSteps[idx] || { top: Math.max(30 - idx * 5, 20), bottom: Math.max(20 - idx * 5, 10) };
              const isHovered = hoveredIdx === idx;
              const textColor = stage.textColor || (idx < 2 ? '#FFFFFF' : '#0F172A');
              const subtextColor = stage.subtextColor || (idx < 2 ? '#E0E7FF' : '#334155');
              const insetPct = (step.top - step.bottom) / 2;

              return (
                <div
                  key={stage.stage_name}
                  className="w-full flex justify-center cursor-pointer min-w-0"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div
                    style={{
                      width: `${step.top}%`,
                      height: '42px',
                      backgroundColor: stage.color_hex,
                      clipPath: `polygon(0 0, 100% 0, ${100 - insetPct}% 100%, ${insetPct}% 100%)`,
                    }}
                    className={`flex flex-col items-center justify-center text-center transition-all duration-200 rounded-xs min-w-0 ${
                      isHovered ? 'scale-[1.03] brightness-105 shadow-md' : 'hover:opacity-95'
                    } ${hoveredIdx !== null && !isHovered ? 'opacity-85' : 'opacity-100'}`}
                  >
                    <span
                      style={{ color: textColor }}
                      className="text-xs sm:text-[13px] font-bold leading-none truncate px-1"
                    >
                      {stage.lead_count.toLocaleString('en-IN')}
                    </span>
                    <span
                      style={{ color: subtextColor }}
                      className="text-[9px] font-semibold tracking-wider uppercase mt-1 leading-none truncate px-1"
                    >
                      {stage.sublabel || stage.stage_name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Conversion Overview */}
        {conversionOverview && (
          <div className="2xl:col-span-6 flex flex-col justify-between h-full py-1 min-w-0 w-full">
            <div className="min-w-0">
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-3.5 tracking-tight">
                Conversion Overview
              </h3>
              <div className="space-y-3.5 min-w-0">
                {conversionOverview.map((item, idx) => {
                  const isHovered = hoveredIdx === idx;
                  return (
                    <div
                      key={typeof item.label === 'string' ? item.label : idx}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className={`flex items-center justify-between text-xs transition-colors rounded-md py-0.5 px-1 min-w-0 ${
                        isHovered ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <div className="text-slate-600 font-normal text-xs leading-[1.35] min-w-0">
                        {typeof item.label === 'string' && item.label.includes('\n') ? (
                          item.label.split('\n').map((line, lIdx) => (
                            <span key={lIdx} className="block">
                              {line}
                            </span>
                          ))
                        ) : (
                          item.label
                        )}
                      </div>
                      <span className="text-slate-900 font-bold text-xs sm:text-[13px] shrink-0 ml-2">
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Highlight Box: Overall Conversion */}
            {overallConversion && (
              <div className="mt-5 2xl:mt-7 bg-[#EEF2FF] border border-[#E0E7FF]/80 rounded-xl px-3.5 py-2.5 flex items-center justify-between min-w-0">
                <span className="text-xs font-bold text-[#4F46E5] truncate">Overall Conversion</span>
                <span className="text-xs font-bold text-[#4338CA] shrink-0 ml-2">{overallConversion}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default / Compact Layout (used in CEO Dashboard SalesDeliverySection)
  return (
    <div className={`flex items-center gap-4 w-full select-none ${className}`}>
      {/* Visual Trapezoid Funnel */}
      <div
        className="flex flex-col items-center justify-center gap-1 shrink-0"
        style={{ width: '130px', height: `${height}px` }}
      >
        {data.map((stage, idx) => {
          const step = widthSteps[idx] || { top: 30 - idx * 5, bottom: 20 - idx * 5 };
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={stage.stage_name}
              className="w-full flex justify-center cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                style={{
                  width: `${step.top}%`,
                  height: '24px',
                  backgroundColor: stage.color_hex,
                  clipPath: `polygon(0 0, 100% 0, ${100 - (step.top - step.bottom) / 2}% 100%, ${(step.top - step.bottom) / 2}% 100%)`,
                }}
                className={`transition-all duration-200 rounded-sm ${
                  isHovered ? 'scale-105 brightness-110 shadow-lg' : 'hover:opacity-90'
                } ${hoveredIdx !== null && !isHovered ? 'opacity-60' : 'opacity-100'}`}
              />
            </div>
          );
        })}
      </div>

      {/* Legend & Stats Column */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {data.map((stage, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={stage.stage_name}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between px-2 py-1 rounded-md cursor-pointer transition-colors ${
                isHovered ? 'bg-slate-100' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: stage.color_hex }}
                />
                <span className={`text-xs ${isHovered ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                  {stage.stage_name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-slate-900">{stage.lead_count}</span>
                {stage.conversion_rate !== undefined && (
                  <span className="text-[11px] text-slate-400 font-medium">({stage.conversion_rate}%)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
