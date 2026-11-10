import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export interface DonutDataItem {
  label: string;
  value: number;
  percentage?: number;
  color: string;
  secondaryInfo?: string;
}

interface UniversalDonutChartProps {
  data: DonutDataItem[];
  centerPrimaryText: string;
  centerSecondaryText?: string;
  size?: number;
  showLegend?: boolean;
  valueFormatter?: (val: number) => string;
}

export const UniversalDonutChart: React.FC<UniversalDonutChartProps> = ({
  data,
  centerPrimaryText,
  centerSecondaryText,
  size = 120,
  showLegend = true
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

  return (
    <div className="flex items-center gap-4 w-full select-none">
      {/* Donut Chart with Steady, Clean Center Text - No overlapping tooltips */}
      <div className="relative shrink-0" style={{ width: `${size}px`, height: `${size}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={size * 0.33}
              outerRadius={size * 0.47}
              paddingAngle={2.5}
              stroke="#ffffff"
              strokeWidth={1.5}
              animationDuration={600}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {data.map((entry, index) => {
                const isHovered = hoveredIndex === index;
                const isAnyHovered = hoveredIndex !== null;

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      opacity: isAnyHovered && !isHovered ? 0.45 : 1,
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                      transformOrigin: 'center center'
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Permanent, Crisp Center Text matching SVG */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-1">
          <span className={`${size >= 160 ? 'text-[17px] leading-[22px]' : 'text-[18px] leading-[24px]'} font-semibold text-slate-900 tracking-tight`}>
            {centerPrimaryText}
          </span>
          {centerSecondaryText && (
            <span
              className="text-[11px] text-slate-500 font-normal leading-[14px] mt-0.5 truncate"
              style={{ maxWidth: size >= 150 ? `${Math.round(size * 0.7)}px` : '72px' }}
            >
              {centerSecondaryText}
            </span>
          )}
        </div>
      </div>

      {/* Legend Column with Interactive Hover Sync */}
      {showLegend && (
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {data.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            const pct = item.percentage !== undefined ? item.percentage : Math.round((item.value / total) * 100);

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between text-[12px] leading-[18px] px-2 py-1 rounded-md cursor-pointer transition-all ${
                  isHovered ? 'bg-slate-100/90 shadow-2xs font-medium' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 transition-transform ${isHovered ? 'scale-125' : ''}`}
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`truncate text-[12px] leading-[18px] ${isHovered ? 'text-slate-950 font-semibold' : 'text-slate-600 font-normal'}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  {item.secondaryInfo && (
                    <span className="text-[12px] leading-[18px] font-semibold text-slate-900">{item.secondaryInfo}</span>
                  )}
                  <span className={`text-[12px] leading-[18px] ${isHovered ? 'text-slate-900 font-semibold' : item.secondaryInfo ? 'text-slate-400 font-normal' : 'text-slate-500 font-normal'}`}>
                    {item.secondaryInfo ? `(${pct}%)` : `${pct}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
