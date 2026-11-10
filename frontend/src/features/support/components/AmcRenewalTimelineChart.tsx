import React, { useState } from 'react';

interface AmcRenewalTimelineChartProps {
  overdue: number;
  dueSoon30: number;
  upcoming31to90: number;
  greater90: number;
  total?: number;
  onSelectWindow?: (window: string) => void;
}

export const AmcRenewalTimelineChart: React.FC<AmcRenewalTimelineChartProps> = ({
  overdue,
  dueSoon30,
  upcoming31to90,
  greater90,
  total = 48,
  onSelectWindow,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const bars = [
    { label: 'Overdue', value: overdue, color: '#F87171', windowKey: 'Overdue' },
    { label: '≤ 30 Days', value: dueSoon30, color: '#FBBF24', windowKey: '≤ 30 Days' },
    { label: '31 – 90 Days', value: upcoming31to90, color: '#38BDF8', windowKey: '31 – 90 Days' },
    { label: '> 90 Days', value: greater90, color: '#A78BFA', windowKey: '> 90 Days' },
  ];

  const yMax = 16;
  const chartHeightPx = 110;

  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '476px',
        height: '251px',
        background: '#FFFFFF',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        borderRadius: '12px',
        padding: '20px',
      }}
      className="flex flex-col justify-between items-start font-['Inter'] relative select-none"
    >
      {/* Title */}
      <h3 className="font-semibold text-[14px] leading-[20px] text-[#1E293B]">
        Renewal Timeline
      </h3>

      {/* Visual Chart Area */}
      <div className="flex flex-col items-start w-full gap-2 relative">
        <div className="flex flex-row items-end w-full h-[144px]">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between items-end h-[144px] pb-1 pr-3 w-[32px] shrink-0 text-[11px] font-medium text-[#94A3B8]">
            <span>16</span>
            <span>12</span>
            <span>8</span>
            <span>4</span>
            <span>0</span>
          </div>

          {/* Bars Container */}
          <div className="flex flex-row justify-between items-end flex-1 h-[144px] border-b border-[#E2E8F0] px-2 gap-4 relative">
            {bars.map((bar, idx) => {
              const heightPx = Math.max(6, (bar.value / yMax) * chartHeightPx);
              const percentage = total > 0 ? ((bar.value / total) * 100).toFixed(1) : '0';
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={bar.label}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onSelectWindow?.(bar.windowKey)}
                  className="flex flex-col justify-end items-center flex-1 h-full cursor-pointer group relative"
                  style={{ width: '84.62px' }}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-[#0F172A] text-white text-[11px] font-medium px-2.5 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none transition-opacity">
                      <span>{bar.label}: </span>
                      <span className="font-bold">{bar.value} contracts</span>
                      <span className="text-[#94A3B8] ml-1">({percentage}%)</span>
                    </div>
                  )}

                  {/* Value Above Bar */}
                  <span
                    className={`font-bold text-[12px] leading-[16px] mb-1 transition-transform ${
                      isHovered ? 'scale-110 text-[#0F172A]' : 'text-[#1E293B]'
                    }`}
                  >
                    {bar.value}
                  </span>

                  {/* Bar Shape */}
                  <div
                    style={{
                      height: `${heightPx}px`,
                      backgroundColor: bar.color,
                      borderRadius: '2px 2px 0px 0px',
                    }}
                    className={`w-full transition-all duration-200 ${
                      isHovered ? 'opacity-90 brightness-95 shadow-md' : 'hover:opacity-95'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="flex flex-row justify-between items-start w-full pl-[32px] pr-2">
          {bars.map((bar) => (
            <div
              key={bar.label}
              className="flex justify-center items-center flex-1 text-center"
              style={{ width: '84.62px' }}
            >
              <span className="font-medium text-[11px] leading-[16px] text-[#475569] whitespace-nowrap">
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

