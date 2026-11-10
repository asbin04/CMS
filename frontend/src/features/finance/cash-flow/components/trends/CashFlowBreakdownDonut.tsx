import React, { useState } from 'react';
import { OutflowBreakdownCategory } from '../../types';
import { formatIndianCurrency, MOCK_OUTFLOW_BREAKDOWN } from '../../mockData';

const EXACT_CATEGORY_COLORS: Record<string, string> = {
  'Vendor Payments': '#3930A8',
  'Payroll Payments': '#8188F8',
  'Operating Expenses': '#2EB8E8',
  'Other Outflows': '#8BBDF8',
};

interface CashFlowBreakdownDonutProps {
  categories?: OutflowBreakdownCategory[];
  totalAmount?: number;
}

export const CashFlowBreakdownDonut: React.FC<CashFlowBreakdownDonutProps> = ({
  categories,
  totalAmount = 5285000,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const rawCategories = categories && categories.length > 0 ? categories : MOCK_OUTFLOW_BREAKDOWN;

  const safeCategories = rawCategories.map((cat) => ({
    ...cat,
    color: EXACT_CATEGORY_COLORS[cat.name] || cat.color,
  }));

  // SVG dimensions for Donut matching designer specs
  const size = 190;
  const strokeWidth = 32;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Normalize percentages across all 4 categories to ensure exact 360-degree allocation
  // (Prevents the 4th category 'Other Outflows' from being crowded out by unnormalized percentages)
  const totalPercentage = safeCategories.reduce((acc, cat) => acc + (cat.percentage || 0), 0) || 100;

  let accumulatedPercent = 0;
  const slices = safeCategories.map((cat, idx) => {
    const effectivePercent = (cat.percentage / totalPercentage) * 100;
    const strokeDasharray = `${(effectivePercent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += effectivePercent;
    return {
      ...cat,
      idx,
      effectivePercent,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const isAnyHovered = hoveredIndex !== null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3">
        Cash Flow Breakdown (Total)
      </h3>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto px-2">
        {/* Donut Chart with Collections-Standard Hover & Fixed Center Content */}
        <div className="relative w-[190px] h-[190px] shrink-0">
          <svg
            data-testid="donut-svg"
            width={size}
            height={size}
            className="transform -rotate-90 select-none overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.idx;

              return (
                <circle
                  key={slice.name}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="butt"
                  style={{
                    cursor: 'pointer',
                    pointerEvents: 'stroke',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity: isAnyHovered && !isHovered ? 0.45 : 1,
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${center}px ${center}px`,
                  }}
                  onMouseEnter={() => setHoveredIndex(slice.idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}

            {/* Empty Center Hole Mask: Ensures hovering over center hole or center text NEVER highlights any segment */}
            <circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="transparent"
              style={{ pointerEvents: 'all', cursor: 'default' }}
              onMouseEnter={() => setHoveredIndex(null)}
              onMouseMove={() => setHoveredIndex(null)}
            />
          </svg>

          {/* Constant center value & label - Matches Collections behavior, never replaced on hover */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2 select-none">
            <span className="text-[19px] font-bold text-slate-900 tracking-tight">
              {formatIndianCurrency(totalAmount)}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-0.5 max-w-[120px] truncate">
              Total Outflows
            </span>
          </div>
        </div>

        {/* Legend List with Interactive Collections-standard Hover Sync */}
        <div className="flex flex-col gap-3.5 w-full max-w-[210px]">
          {safeCategories.map((cat, idx) => {
            const isHovered = hoveredIndex === idx;
            const nameParts = cat.name.split(' ');

            return (
              <div
                key={cat.name}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-start justify-between text-xs p-1.5 rounded-xl cursor-pointer transition-all ${
                  isHovered ? 'bg-slate-100/90 shadow-2xs font-medium' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 transition-transform ${
                      isHovered ? 'scale-125' : ''
                    }`}
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className={`flex flex-col text-[12.5px] leading-[1.25] transition-colors ${
                    isHovered ? 'text-slate-950 font-semibold' : 'text-slate-600 font-medium'
                  }`}>
                    {nameParts.map((part, i) => (
                      <span key={i}>{part}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end text-right shrink-0">
                  <span className={`text-[13px] leading-[1.25] transition-colors ${
                    isHovered ? 'text-slate-950 font-extrabold' : 'text-slate-900 font-bold'
                  }`}>
                    {formatIndianCurrency(cat.amount)}
                  </span>
                  <span className={`text-[11px] font-normal leading-[1.25] mt-0.5 transition-colors ${
                    isHovered ? 'text-slate-600 font-medium' : 'text-slate-400'
                  }`}>
                    ({cat.percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
