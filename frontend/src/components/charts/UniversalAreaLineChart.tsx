import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export interface LineSeriesConfig {
  key: string;
  name: string;
  strokeColor: string;
  fillGradient?: boolean;
  fillColorStart?: string;
  fillColorEnd?: string;
}

export interface AreaLineDataPoint {
  label: string;
  [key: string]: any;
}

interface UniversalAreaLineChartProps {
  data: AreaLineDataPoint[];
  series: LineSeriesConfig[];
  height?: number;
  valueFormatter?: (val: number) => string;
  showLegend?: boolean;
  yAxisWidth?: number;
  ticks?: number[];
  domain?: [number | string, number | string];
  showDots?: boolean;
  strokeWidth?: number;
}

// Custom Light Theme Tooltip
const CustomTooltip = ({ active, payload, label, valueFormatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xs text-slate-900 px-3 py-2 rounded-lg text-xs shadow-md border border-slate-200 pointer-events-none z-50">
        <p className="font-bold text-slate-800 pb-1 border-b border-slate-100 mb-1 text-[11px]">{label}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 my-0.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: item.color || item.stroke }}
            />
            <span className="text-slate-600 text-[11px] font-medium">{item.name}:</span>
            <span className="font-bold text-slate-900 text-[11px] ml-auto">
              {valueFormatter ? valueFormatter(item.value) : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const UniversalAreaLineChart: React.FC<UniversalAreaLineChartProps> = ({
  data,
  series,
  height = 145,
  valueFormatter = (v) => `${v}`,
  showLegend = false,
  yAxisWidth = 0,
  ticks,
  domain,
  showDots = false,
  strokeWidth = 2
}) => {
  return (
    <div className="w-full flex flex-col select-none">
      {showLegend && (
        <div className="flex items-center gap-4 mb-2 text-[11px] text-slate-500 font-medium">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-0.5 rounded-full inline-block"
                style={{ backgroundColor: s.strokeColor }}
              />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ width: '100%', height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: yAxisWidth > 0 ? 0 : -25, bottom: 0 }}
          >
            <defs>
              {series.map((s, idx) => (
                <linearGradient key={idx} id={`areaGrad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.fillColorStart || s.strokeColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.fillColorEnd || s.strokeColor} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.7} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }}
              dy={4}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94A3B8', fontSize: 9 }}
              width={yAxisWidth}
              ticks={ticks}
              domain={domain}
              tickFormatter={(v) => (v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${v}`)}
            />
            <Tooltip
              content={<CustomTooltip valueFormatter={valueFormatter} />}
              offset={12}
              wrapperStyle={{ outline: 'none', zIndex: 50 }}
            />

            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.strokeColor}
                strokeWidth={strokeWidth}
                fill={s.fillGradient !== false ? `url(#areaGrad-${s.key})` : 'transparent'}
                dot={showDots ? { r: 2.5, fill: s.strokeColor, stroke: s.strokeColor } : false}
                activeDot={{ r: 4, fill: s.strokeColor, stroke: '#FFFFFF', strokeWidth: 2 }}
                animationDuration={900}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
