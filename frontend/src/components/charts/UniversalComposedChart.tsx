import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface ComposedBarSeries {
  key: string;
  name: string;
  color: string;
  barWidth?: number;
  radius?: [number, number, number, number];
}

export interface ComposedLineSeries {
  key: string;
  name: string;
  color: string;
  strokeWidth?: number;
  dot?: boolean | object;
}

export interface ComposedDataPoint {
  label: string;
  [key: string]: any;
}

interface UniversalComposedChartProps {
  data: ComposedDataPoint[];
  barSeries?: ComposedBarSeries[];
  lineSeries?: ComposedLineSeries[];
  height?: number;
  valueFormatter?: (val: number) => string;
  showLegend?: boolean;
  yAxisWidth?: number;
  domain?: [number | string, number | string];
  ticks?: number[];
}

// Light theme tooltip matching Collections & CEO Dashboard standard
const CustomTooltip = ({ active, payload, label, valueFormatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xs text-slate-900 px-3.5 py-2.5 rounded-xl text-xs shadow-md border border-slate-200 pointer-events-none z-50 min-w-[150px]">
        <p className="font-bold text-slate-800 pb-1.5 border-b border-slate-100 mb-1.5 text-xs">
          {label}
        </p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 my-1">
            <span
              className="w-2.5 h-2.5 rounded-xs shrink-0 inline-block"
              style={{ backgroundColor: item.color || item.fill || item.stroke }}
            />
            <span className="text-slate-600 text-[11px] font-medium">{item.name}:</span>
            <span className="font-extrabold text-slate-900 text-xs ml-auto">
              {valueFormatter ? valueFormatter(item.value) : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const UniversalComposedChart: React.FC<UniversalComposedChartProps> = ({
  data,
  barSeries = [],
  lineSeries = [],
  height = 240,
  valueFormatter = (v) => `${v}`,
  showLegend = true,
  yAxisWidth = 80,
  domain,
  ticks,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col select-none">
      <div style={{ width: '100%', height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <ComposedChart
            data={data}
            margin={{ top: 12, right: 16, left: yAxisWidth > 0 ? 0 : -20, bottom: 4 }}
            onMouseMove={(state: any) => {
              if (state && typeof state.activeTooltipIndex === 'number') {
                setHoveredIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={(props: any) => {
                const { x, y, payload, index } = props;
                const isHovered = hoveredIndex === index;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={4}
                      dy={10}
                      textAnchor="middle"
                      fill={isHovered ? '#0F172A' : '#94A3B8'}
                      fontSize={isHovered ? 11 : 10.5}
                      fontWeight={isHovered ? 700 : 500}
                    >
                      {payload.value}
                    </text>
                  </g>
                );
              }}
              height={30}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={10.5}
              tickLine={false}
              axisLine={false}
              width={yAxisWidth}
              tickFormatter={valueFormatter}
              domain={domain}
              ticks={ticks}
            />
            <Tooltip
              content={<CustomTooltip valueFormatter={valueFormatter} />}
              cursor={{ fill: '#F1F5F9', opacity: 0.65, rx: 6 }}
              offset={12}
              wrapperStyle={{ outline: 'none', zIndex: 50 }}
            />
            {barSeries.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                fill={s.color}
                radius={s.radius || [4, 4, 0, 0]}
                barSize={s.barWidth || 16}
                animationDuration={600}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {data.map((_, idx) => {
                  const isHovered = hoveredIndex === idx;
                  const isAnyHovered = hoveredIndex !== null;

                  return (
                    <Cell
                      key={`cell-${idx}`}
                      fill={s.color}
                      style={{
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease, filter 0.2s ease',
                        opacity: isAnyHovered && !isHovered ? 0.38 : 1,
                        filter: isHovered
                          ? 'brightness(1.12) drop-shadow(0 6px 12px rgba(0,0,0,0.18))'
                          : 'none',
                      }}
                    />
                  );
                })}
              </Bar>
            ))}
            {lineSeries.map((s) => (
              <Line
                key={s.key}
                type="linear"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={s.strokeWidth || 2.2}
                dot={{
                  r: 4,
                  fill: '#FFFFFF',
                  stroke: s.color,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6.5,
                  fill: s.color,
                  stroke: '#FFFFFF',
                  strokeWidth: 2.5,
                  filter: 'drop-shadow(0 2px 6px rgba(99,102,241,0.4))',
                }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {showLegend && (
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600 font-medium select-none">
          {barSeries.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-[3px] inline-block"
                style={{ backgroundColor: s.color }}
              />
              <span>{s.name}</span>
            </div>
          ))}
          {lineSeries.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="w-2 h-0.5" style={{ backgroundColor: s.color }} />
                <span
                  className="w-2.5 h-2.5 rounded-full border-2 bg-white"
                  style={{ borderColor: s.color }}
                />
                <span className="w-2 h-0.5" style={{ backgroundColor: s.color }} />
              </div>
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
