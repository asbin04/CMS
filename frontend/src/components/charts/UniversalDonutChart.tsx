import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export interface DonutDataItem {
  id?: string;
  label: string;
  value: number;
  percentage?: number;
  color: string;
  secondaryInfo?: string;
  formatted?: string;
}

export interface UniversalDonutChartProps {
  data: DonutDataItem[];
  centerPrimaryText: string | number;
  centerSecondaryText?: string;
  size?: number;
  showLegend?: boolean;
  valueFormatter?: (val: number) => string;
  interactiveCenterHover?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  strokeWidth?: number;
  activeId?: string | null;
  className?: string;
  onSegmentHover?: (item: DonutDataItem | null) => void;
  onSegmentClick?: (item: DonutDataItem) => void;
}

export const UniversalDonutChart: React.FC<UniversalDonutChartProps> = ({
  data,
  centerPrimaryText,
  centerSecondaryText,
  size = 120,
  showLegend = true,
  valueFormatter,
  interactiveCenterHover = true,
  innerRadius,
  outerRadius,
  paddingAngle = 3,
  strokeWidth = 2,
  activeId,
  className = '',
  onSegmentHover,
  onSegmentClick
}) => {
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<number | null>(null);

  // Determine current active or hovered index (controlled or internal)
  const currentHoveredIndex = activeId !== undefined && activeId !== null
    ? data.findIndex((d) => (d.id ?? d.label) === activeId)
    : internalHoveredIndex;

  const total = data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0) || 1;
  const hoveredItem = currentHoveredIndex !== null && currentHoveredIndex >= 0 ? data[currentHoveredIndex] : null;

  // Center display values with interactive hover sync
  const displayPrimary = hoveredItem && interactiveCenterHover
    ? (hoveredItem.formatted
        ? hoveredItem.value
        : valueFormatter
        ? valueFormatter(hoveredItem.value)
        : hoveredItem.value)
    : centerPrimaryText;

  const displaySecondary = hoveredItem && interactiveCenterHover
    ? hoveredItem.label
    : centerSecondaryText;

  const calculatedInner = innerRadius ?? Math.round(size * 0.32);
  const calculatedOuter = outerRadius ?? Math.round(size * 0.48);

  const handleMouseEnter = (index: number, item: DonutDataItem) => {
    setInternalHoveredIndex(index);
    if (onSegmentHover) onSegmentHover(item);
  };

  const handleMouseLeave = () => {
    setInternalHoveredIndex(null);
    if (onSegmentHover) onSegmentHover(null);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 w-full select-none ${className}`}>
      {/* Donut Chart with Gapped Slices & Steady Center Text */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: `${size}px`, height: `${size}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={calculatedInner}
              outerRadius={calculatedOuter}
              paddingAngle={paddingAngle}
              stroke="#FFFFFF"
              strokeWidth={strokeWidth}
              animationDuration={800}
              onMouseEnter={(_, index) => handleMouseEnter(index, data[index])}
              onMouseLeave={handleMouseLeave}
              onClick={(_, index) => onSegmentClick && onSegmentClick(data[index])}
            >
              {data.map((entry, index) => {
                const isHovered = currentHoveredIndex === index;
                const isAnyHovered = currentHoveredIndex !== null && currentHoveredIndex >= 0;

                return (
                  <Cell
                    key={`donut-cell-${entry.id ?? entry.label ?? index}`}
                    fill={entry.color}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      opacity: isAnyHovered && !isHovered ? 0.65 : 1,
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center center',
                      filter: isHovered ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))' : 'none'
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Crisp Center Text - No Ellipsis Truncation, Multi-line Capable */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-1">
          <span
            className={`font-bold text-slate-900 tracking-tight leading-tight transition-all duration-200 ${
              size >= 140 ? 'text-[22px]' : size >= 120 ? 'text-[18px]' : 'text-[16px]'
            }`}
          >
            {displayPrimary}
          </span>
          {displaySecondary && (
            <span
              className={`font-medium transition-all duration-200 leading-[12px] mt-0.5 text-center break-words ${
                hoveredItem && interactiveCenterHover ? 'text-[10px] font-semibold text-indigo-600' : 'text-[10px] text-slate-500'
              }`}
              style={{
                maxWidth: `${Math.max(calculatedInner * 1.9, 68)}px`,
              }}
              title={String(displaySecondary)}
            >
              {displaySecondary}
            </span>
          )}
        </div>
      </div>

      {/* Legend Column with Interactive 2-Way Hover Synchronization */}
      {showLegend && (
        <div className="flex flex-col gap-1.5 flex-1 min-w-0 w-full text-xs">
          {data.map((item, idx) => {
            const isHovered = currentHoveredIndex === idx;
            const pct = item.percentage !== undefined ? item.percentage : Math.round((item.value / total) * 100);

            return (
              <div
                key={item.id ?? item.label ?? idx}
                onMouseEnter={() => handleMouseEnter(idx, item)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onSegmentClick && onSegmentClick(item)}
                className={`flex items-center justify-between text-[12px] leading-[18px] px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-200 ${
                  isHovered ? 'bg-slate-100/90 shadow-xs font-medium' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200 ${isHovered ? 'scale-125' : ''}`}
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`truncate text-[12px] leading-[18px] ${isHovered ? 'text-slate-950 font-semibold' : 'text-slate-600 font-normal'}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  {item.formatted ? (
                    <span className="text-[12px] leading-[18px] font-semibold text-slate-900">{item.formatted}</span>
                  ) : (
                    <>
                      {item.secondaryInfo && (
                        <span className="text-[12px] leading-[18px] font-semibold text-slate-900">{item.secondaryInfo}</span>
                      )}
                      <span className={`text-[12px] leading-[18px] ${isHovered ? 'text-slate-900 font-semibold' : item.secondaryInfo ? 'text-slate-400 font-normal' : 'text-slate-500 font-normal'}`}>
                        {item.secondaryInfo ? `(${pct}%)` : `${pct}%`}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
