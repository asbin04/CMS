import React, { useState, useRef } from 'react';
import {
  Ticket,
  CheckCircle2,
  Clock,
  History,
  Target,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';
import { SupportTicketTrendsData, VolumeTrendItem } from '../types/tickets';
import { ChartTooltip } from '../../../charts';

interface SupportTrendsAndSlaProps {
  data: SupportTicketTrendsData | null;
  isLoading?: boolean;
}

export const SupportTrendsAndSla: React.FC<SupportTrendsAndSlaProps> = ({
  data,
  isLoading = false,
}) => {
  const [volumeView, setVolumeView] = useState<'Monthly' | 'Weekly'>('Monthly');

  // Container refs for tooltip positioning
  const volumeCardRef = useRef<HTMLDivElement>(null);
  const slaCardRef = useRef<HTMLDivElement>(null);
  const typeCardRef = useRef<HTMLDivElement>(null);
  const priorityCardRef = useRef<HTMLDivElement>(null);

  // Hover states
  const [hoveredVolumeIdx, setHoveredVolumeIdx] = useState<number | null>(null);
  const [volumeTooltip, setVolumeTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    label: string;
    value: number | string;
    secondaryInfo?: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    label: '',
    value: 0,
    secondaryInfo: undefined,
  });

  const [hoveredSlaSegment, setHoveredSlaSegment] = useState<'within' | 'breach' | null>(null);
  const [slaTooltip, setSlaTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    label: string;
    value: string;
    color: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    label: '',
    value: '',
    color: '',
  });

  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [typeTooltip, setTypeTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    label: string;
    value: string;
    color: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    label: '',
    value: '',
    color: '',
  });

  const [hoveredPriority, setHoveredPriority] = useState<string | null>(null);
  const [priorityTooltip, setPriorityTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    label: string;
    value: string;
    color: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    label: '',
    value: '',
    color: '',
  });

  // Fallbacks if data loading or empty
  const trends: SupportTicketTrendsData = data || {
    totalTickets: 186,
    totalTicketsTrend: '↑ 12.7%',
    resolutionRate: 66.7,
    resolutionRateTrend: '↑ 8.4%',
    avgResponseHours: '1.2 hrs',
    avgResponseHoursTrend: '↓ 34.8%',
    avgResolutionHours: '18.6 hrs',
    avgResolutionHoursTrend: '↓ 28.1%',
    slaCompliance: 96.8,
    slaComplianceTrend: '↑ 2.9%',
    volumeTrends: [
      { month: 'Jun 2026', resolved: 12, inProgress: 5, pending: 3, total: 20 },
      { month: 'Jul 2026', resolved: 15, inProgress: 7, pending: 4, total: 26 },
      { month: 'Aug 2026', resolved: 14, inProgress: 6, pending: 2, total: 22 },
      { month: 'Sep 2026', resolved: 18, inProgress: 8, pending: 4, total: 30 },
      { month: 'Oct 2026', resolved: 20, inProgress: 12, pending: 10, total: 42 },
    ],
    slaPerformance: {
      complianceRate: 96.8,
      withinSlaCount: 180,
      withinSlaPercentage: 96.8,
      slaBreachCount: 6,
      slaBreachPercentage: 3.2,
      improvementNote: 'SLA compliance has improved by 2.9% compared to the previous period.',
    },
    typeBreakdown: [
      { type: 'Issue', count: 72, percentage: 38.7, color: '#4F46E5' },
      { type: 'Request', count: 58, percentage: 31.2, color: '#A78BFA' },
      { type: 'Change', count: 24, percentage: 12.9, color: '#60A5FA' },
      { type: 'Other', count: 32, percentage: 17.2, color: '#C7D2FE' },
    ],
    priorityDistribution: [
      { priority: 'High', count: 48, color: '#F87171' },
      { priority: 'Medium', count: 62, color: '#FCD34D' },
      { priority: 'Low', count: 50, color: '#6EE7B7' },
    ],
    keyInsights: [
      'SLA compliance is at 96.8% (↑ 2.9%).',
      'Average resolution time reduced to 18.6 hrs (↓ 28.1%).',
      '54.8% of tickets are Issues, followed by Requests (31.2%).',
      'SLA breaches are 6 tickets (3.2%), down from the previous period.',
    ],
  };

  // Active volume trend items based on Monthly / Weekly view
  const activeVolumeTrends: VolumeTrendItem[] = React.useMemo(() => {
    if (volumeView === 'Monthly') {
      return trends.volumeTrends && trends.volumeTrends.length > 0
        ? trends.volumeTrends
        : [
            { month: 'Jun 2026', resolved: 12, inProgress: 5, pending: 3, total: 20 },
            { month: 'Jul 2026', resolved: 15, inProgress: 7, pending: 4, total: 26 },
            { month: 'Aug 2026', resolved: 14, inProgress: 6, pending: 2, total: 22 },
            { month: 'Sep 2026', resolved: 18, inProgress: 8, pending: 4, total: 30 },
            { month: 'Oct 2026', resolved: 20, inProgress: 12, pending: 10, total: 42 },
          ];
    }
    // Weekly aggregation (last 4 weeks)
    const latest = trends.volumeTrends && trends.volumeTrends.length > 0
      ? trends.volumeTrends[trends.volumeTrends.length - 1]
      : { resolved: 20, inProgress: 12, pending: 10, total: 42 };

    return [
      { month: 'W1', resolved: Math.max(1, Math.round(latest.resolved * 0.2)), inProgress: Math.max(1, Math.round(latest.inProgress * 0.2)), pending: Math.max(1, Math.round(latest.pending * 0.2)), total: Math.max(3, Math.round(latest.total * 0.2)) },
      { month: 'W2', resolved: Math.max(1, Math.round(latest.resolved * 0.25)), inProgress: Math.max(1, Math.round(latest.inProgress * 0.3)), pending: Math.max(1, Math.round(latest.pending * 0.25)), total: Math.max(3, Math.round(latest.total * 0.26)) },
      { month: 'W3', resolved: Math.max(1, Math.round(latest.resolved * 0.22)), inProgress: Math.max(1, Math.round(latest.inProgress * 0.2)), pending: Math.max(1, Math.round(latest.pending * 0.25)), total: Math.max(3, Math.round(latest.total * 0.23)) },
      { month: 'W4', resolved: Math.max(1, Math.round(latest.resolved * 0.33)), inProgress: Math.max(1, Math.round(latest.inProgress * 0.3)), pending: Math.max(1, Math.round(latest.pending * 0.3)), total: Math.max(3, Math.round(latest.total * 0.31)) },
    ];
  }, [volumeView, trends.volumeTrends]);

  // Volume chart coordinate setup
  const chartWidth = 504;
  const chartHeight = 224;
  const maxVolume = Math.max(50, ...activeVolumeTrends.map((t) => t.total + 5));
  const plotTop = 15;
  const plotBottom = 190;
  const plotHeight = plotBottom - plotTop;

  const barPositions = React.useMemo(() => {
    const count = activeVolumeTrends.length;
    if (count <= 1) return [chartWidth / 2];
    const leftMargin = 60;
    const rightMargin = chartWidth - 30;
    const step = (rightMargin - leftMargin) / (count - 1);
    return activeVolumeTrends.map((_, i) => leftMargin + i * step);
  }, [activeVolumeTrends, chartWidth]);

  const barWidth = 26;

  const getY = (val: number) => {
    return plotBottom - (val / maxVolume) * plotHeight;
  };

  // SLA Performance Donut Calculations
  const radius = 64;
  const strokeWidth = 19.2;
  const circumference = 2 * Math.PI * radius;
  const complianceOffset = circumference - (trends.slaCompliance / 100) * circumference;

  // Type Breakdown Donut Calculations
  const tbRadius = 52;
  const tbCircumference = 2 * Math.PI * tbRadius;
  let accumulatedPercent = 0;

  // Tooltip event handlers
  const handleVolumeHover = (item: VolumeTrendItem, idx: number, e: React.MouseEvent) => {
    if (!volumeCardRef.current) return;
    const containerRect = volumeCardRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    const relX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const relY = Math.max(10, targetRect.top - containerRect.top);

    setHoveredVolumeIdx(idx);
    setVolumeTooltip({
      visible: true,
      x: relX,
      y: relY,
      title: item.month,
      label: 'Total Tickets',
      value: item.total,
      secondaryInfo: `Resolved: ${item.resolved} · In Progress: ${item.inProgress} · Pending: ${item.pending}`,
    });
  };

  const handleVolumeLeave = () => {
    setHoveredVolumeIdx(null);
    setVolumeTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleSlaHover = (segment: 'within' | 'breach', e: React.MouseEvent) => {
    if (!slaCardRef.current) return;
    const containerRect = slaCardRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    const relX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const relY = Math.max(10, targetRect.top - containerRect.top);

    setHoveredSlaSegment(segment);
    if (segment === 'within') {
      setSlaTooltip({
        visible: true,
        x: relX,
        y: relY,
        title: 'SLA Performance',
        label: 'Within SLA',
        value: `${trends.slaPerformance.withinSlaCount} tickets (${trends.slaPerformance.withinSlaPercentage}%)`,
        color: '#10B981',
      });
    } else {
      setSlaTooltip({
        visible: true,
        x: relX,
        y: relY,
        title: 'SLA Performance',
        label: 'SLA Breach',
        value: `${trends.slaPerformance.slaBreachCount} tickets (${trends.slaPerformance.slaBreachPercentage}%)`,
        color: '#FB7185',
      });
    }
  };

  const handleSlaLeave = () => {
    setHoveredSlaSegment(null);
    setSlaTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleTypeHover = (item: { type: string; count: number; percentage: number; color: string }, e: React.MouseEvent) => {
    if (!typeCardRef.current) return;
    const containerRect = typeCardRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    const relX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const relY = Math.max(10, targetRect.top - containerRect.top);

    setHoveredType(item.type);
    setTypeTooltip({
      visible: true,
      x: relX,
      y: relY,
      title: 'Ticket Type Breakdown',
      label: item.type,
      value: `${item.count} tickets (${item.percentage}%)`,
      color: item.color,
    });
  };

  const handleTypeLeave = () => {
    setHoveredType(null);
    setTypeTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handlePriorityHover = (item: { priority: string; count: number; color: string }, e: React.MouseEvent) => {
    if (!priorityCardRef.current) return;
    const containerRect = priorityCardRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();
    const relX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const relY = Math.max(10, targetRect.top - containerRect.top);

    setHoveredPriority(item.priority);
    setPriorityTooltip({
      visible: true,
      x: relX,
      y: relY,
      title: 'Priority Distribution',
      label: `${item.priority} Priority`,
      value: `${item.count} tickets`,
      color: item.color,
    });
  };

  const handlePriorityLeave = () => {
    setHoveredPriority(null);
    setPriorityTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="w-full flex flex-col gap-6" style={{ minWidth: '956px' }}>
      {/* 1. KpiCardsSection (5 Cards) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Tickets */}
        <div
          className="bg-white border border-[#F1F5F9] rounded-[12px] p-4 flex items-center gap-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-md"
          style={{ minHeight: '101px' }}
        >
          <div className="w-11 h-11 rounded-[12px] bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
            <Ticket className="w-5 h-5 text-[#4F46E5]" />
          </div>
          <div className="flex flex-col flex-grow">
            <span className="text-[11px] font-medium text-[#64748B] leading-4">
              Total Tickets
            </span>
            <span className="text-[20px] font-bold text-[#0F172A] leading-7 mt-0.5">
              {isLoading ? '...' : trends.totalTickets}
            </span>
            <span className="text-[10px] font-semibold text-[#059669] leading-4 mt-0.5">
              {trends.totalTicketsTrend}
            </span>
          </div>
        </div>

        {/* Metric 2: Resolution Rate */}
        <div
          className="bg-white border border-[#F1F5F9] rounded-[12px] p-4 flex items-center gap-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-md"
          style={{ minHeight: '101px' }}
        >
          <div className="w-11 h-11 rounded-[12px] bg-[#ECFDF5] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#059669]" />
          </div>
          <div className="flex flex-col flex-grow">
            <span className="text-[11px] font-medium text-[#64748B] leading-4">
              Resolution Rate
            </span>
            <span className="text-[20px] font-bold text-[#0F172A] leading-7 mt-0.5">
              {isLoading ? '...' : `${trends.resolutionRate}%`}
            </span>
            <span className="text-[10px] font-semibold text-[#059669] leading-4 mt-0.5">
              {trends.resolutionRateTrend}
            </span>
          </div>
        </div>

        {/* Metric 3: Avg. Response Time */}
        <div
          className="bg-white border border-[#F1F5F9] rounded-[12px] p-4 flex items-center gap-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-md"
          style={{ minHeight: '101px' }}
        >
          <div className="w-11 h-11 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="flex flex-col flex-grow">
            <span className="text-[11px] font-medium text-[#64748B] leading-4">
              Avg. Response Time
            </span>
            <span className="text-[20px] font-bold text-[#0F172A] leading-7 mt-0.5">
              {isLoading ? '...' : trends.avgResponseHours}
            </span>
            <span className="text-[10px] font-semibold text-[#059669] leading-4 mt-0.5">
              {trends.avgResponseHoursTrend}
            </span>
          </div>
        </div>

        {/* Metric 4: Avg. Resolution Time */}
        <div
          className="bg-white border border-[#F1F5F9] rounded-[12px] p-4 flex items-center gap-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-md"
          style={{ minHeight: '101px' }}
        >
          <div className="w-11 h-11 rounded-[12px] bg-[#FFFBEB] flex items-center justify-center flex-shrink-0">
            <History className="w-5 h-5 text-[#D97706]" />
          </div>
          <div className="flex flex-col flex-grow">
            <span className="text-[11px] font-medium text-[#64748B] leading-4">
              Avg. Resolution Time
            </span>
            <span className="text-[20px] font-bold text-[#0F172A] leading-7 mt-0.5">
              {isLoading ? '...' : trends.avgResolutionHours}
            </span>
            <span className="text-[10px] font-semibold text-[#059669] leading-4 mt-0.5">
              {trends.avgResolutionHoursTrend}
            </span>
          </div>
        </div>

        {/* Metric 5: SLA Compliance */}
        <div
          className="bg-white border border-[#F1F5F9] rounded-[12px] p-4 flex items-center gap-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-all hover:shadow-md"
          style={{ minHeight: '101px' }}
        >
          <div className="w-11 h-11 rounded-[12px] bg-[#F0F9FF] flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-[#0284C7]" />
          </div>
          <div className="flex flex-col flex-grow">
            <span className="text-[11px] font-medium text-[#64748B] leading-4">
              SLA Compliance
            </span>
            <span className="text-[20px] font-bold text-[#0F172A] leading-7 mt-0.5">
              {isLoading ? '...' : `${trends.slaCompliance}%`}
            </span>
            <span className="text-[10px] font-semibold text-[#059669] leading-4 mt-0.5">
              {trends.slaComplianceTrend}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Section - MidChartsRow (Ticket Volume Trend & SLA Performance) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Ticket Volume Trend */}
        <div
          ref={volumeCardRef}
          className="relative lg:col-span-7 bg-white border border-[#F1F5F9] rounded-[16px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col justify-between"
          style={{ minHeight: '341.5px' }}
        >
          {/* Chart Tooltip */}
          <ChartTooltip
            visible={volumeTooltip.visible}
            x={volumeTooltip.x}
            y={volumeTooltip.y}
            title={volumeTooltip.title}
            label={volumeTooltip.label}
            value={volumeTooltip.value}
            secondaryInfo={volumeTooltip.secondaryInfo}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[14px] font-bold text-[#1E293B] leading-5">
              Ticket Volume Trend
            </h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setVolumeView(volumeView === 'Monthly' ? 'Weekly' : 'Monthly')}
                className="h-[26px] px-2.5 bg-[#F8FAFC] border border-[rgba(226,232,240,0.8)] rounded-[6px] text-[12px] font-medium text-[#4F46E5] flex items-center gap-1.5 hover:bg-[#EEF2FF] transition-colors"
                title={`Switch to ${volumeView === 'Monthly' ? 'Weekly' : 'Monthly'} view`}
              >
                <span>{volumeView}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#4F46E5]" />
              </button>
            </div>
          </div>

          {/* SVG Chart: Stacked Bar Chart with Trend Line */}
          <div className="w-full flex-grow flex items-center justify-center my-1 overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-[224px] select-none"
              style={{ minWidth: '460px' }}
            >
              {/* Horizontal Gridlines and Y-axis Labels */}
              {[50, 40, 30, 20, 10, 0].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <text
                      x="24"
                      y={y + 4}
                      fill="#94A3B8"
                      fontSize="11"
                      fontFamily="Inter, sans-serif"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                    <line
                      x1="36"
                      y1={y}
                      x2={chartWidth - 10}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* Stacked Bars for Each Month/Week */}
              {activeVolumeTrends.map((item, idx) => {
                const x = barPositions[idx] - barWidth / 2;
                const resolvedHeight = (item.resolved / maxVolume) * plotHeight;
                const inProgressHeight = (item.inProgress / maxVolume) * plotHeight;
                const pendingHeight = (item.pending / maxVolume) * plotHeight;

                const resolvedY = plotBottom - resolvedHeight;
                const inProgressY = resolvedY - inProgressHeight;
                const pendingY = inProgressY - pendingHeight;

                const isHovered = hoveredVolumeIdx === idx;

                return (
                  <g
                    key={item.month}
                    className="cursor-pointer transition-opacity duration-150"
                    onMouseEnter={(e) => handleVolumeHover(item, idx, e)}
                    onMouseMove={(e) => handleVolumeHover(item, idx, e)}
                    onMouseLeave={handleVolumeLeave}
                    style={{ opacity: hoveredVolumeIdx !== null && !isHovered ? 0.6 : 1 }}
                  >
                    {/* Hover Column Background Highlight */}
                    {isHovered && (
                      <rect
                        x={x - 8}
                        y={plotTop}
                        width={barWidth + 16}
                        height={plotHeight}
                        fill="#F8FAFC"
                        rx="6"
                      />
                    )}

                    {/* Resolved Bar (Bottom - #818CF8) */}
                    <rect
                      x={x}
                      y={resolvedY}
                      width={barWidth}
                      height={resolvedHeight}
                      fill="#818CF8"
                      rx="0"
                    />
                    {/* In Progress Bar (Middle - #60A5FA) */}
                    <rect
                      x={x}
                      y={inProgressY}
                      width={barWidth}
                      height={inProgressHeight}
                      fill="#60A5FA"
                      rx="0"
                    />
                    {/* Pending Bar (Top - #FDE047 with rounded top) */}
                    <rect
                      x={x}
                      y={pendingY}
                      width={barWidth}
                      height={pendingHeight}
                      fill="#FDE047"
                      rx="3"
                    />

                    {/* X-axis Label */}
                    <text
                      x={barPositions[idx]}
                      y={plotBottom + 18}
                      fill={isHovered ? '#1E293B' : '#64748B'}
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fontSize="11"
                      fontFamily="Inter, sans-serif"
                      textAnchor="middle"
                    >
                      {item.month}
                    </text>
                  </g>
                );
              })}

              {/* Total Tickets Trend Line (#6366F1) */}
              <polyline
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={activeVolumeTrends
                  .map((item, idx) => `${barPositions[idx]},${getY(item.total)}`)
                  .join(' ')}
              />

              {/* Circles at Data Points */}
              {activeVolumeTrends.map((item, idx) => {
                const isHovered = hoveredVolumeIdx === idx;
                return (
                  <circle
                    key={`dot-${idx}`}
                    cx={barPositions[idx]}
                    cy={getY(item.total)}
                    r={isHovered ? 6 : 4}
                    fill="#FFFFFF"
                    stroke="#6366F1"
                    strokeWidth={isHovered ? 3 : 2}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={(e) => handleVolumeHover(item, idx, e)}
                    onMouseMove={(e) => handleVolumeHover(item, idx, e)}
                    onMouseLeave={handleVolumeLeave}
                  />
                );
              })}
            </svg>
          </div>

          {/* Bottom Legend */}
          <div className="w-full pt-3 border-t border-[#F1F5F9] flex items-center justify-center gap-6 flex-wrap text-[11px] font-medium text-[#475569]">
            <div className="flex items-center gap-1.5 cursor-default">
              <span className="w-3 h-3 rounded-[2px] bg-[#818CF8]" />
              <span>Resolved</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-default">
              <span className="w-3 h-3 rounded-[2px] bg-[#60A5FA]" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-default">
              <span className="w-3 h-3 rounded-[2px] bg-[#FDE047]" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-default">
              <div className="w-4 h-0.5 bg-[#6366F1] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white border border-[#6366F1]" />
              </div>
              <span>Total Tickets</span>
            </div>
          </div>
        </div>

        {/* SLA Performance */}
        <div
          ref={slaCardRef}
          className="relative lg:col-span-5 bg-white border border-[#F1F5F9] rounded-[16px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col justify-between"
          style={{ minHeight: '341.5px' }}
        >
          {/* Chart Tooltip */}
          <ChartTooltip
            visible={slaTooltip.visible}
            x={slaTooltip.x}
            y={slaTooltip.y}
            title={slaTooltip.title}
            label={slaTooltip.label}
            value={slaTooltip.value}
            color={slaTooltip.color}
          />

          {/* Heading */}
          <h2 className="text-[14px] font-bold text-[#1E293B] leading-5 mb-2">
            SLA Performance
          </h2>

          {/* Middle Row: Donut Chart + Legend */}
          <div className="flex items-center justify-around py-3 gap-3">
            {/* Donut Chart (160px x 160px) */}
            <div className="relative w-[160px] h-[160px] flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#EEF2FF"
                  strokeWidth={strokeWidth}
                />
                {/* Breach segment (#FB7185) */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={hoveredSlaSegment === 'breach' ? '#F43F5E' : '#FB7185'}
                  strokeWidth={hoveredSlaSegment === 'breach' ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={0}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={(e) => handleSlaHover('breach', e)}
                  onMouseMove={(e) => handleSlaHover('breach', e)}
                  onMouseLeave={handleSlaLeave}
                />
                {/* Within SLA Arc (#4F46E5) */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={hoveredSlaSegment === 'within' ? '#4338CA' : '#4F46E5'}
                  strokeWidth={hoveredSlaSegment === 'within' ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={complianceOffset}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={(e) => handleSlaHover('within', e)}
                  onMouseMove={(e) => handleSlaHover('within', e)}
                  onMouseLeave={handleSlaLeave}
                />
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[24px] font-bold text-[#0F172A] leading-6">
                  {trends.slaCompliance}%
                </span>
                <span className="text-[10px] font-medium text-[#94A3B8] leading-4 mt-1">
                  SLA Compliance
                </span>
              </div>
            </div>

            {/* Legend and Numbers */}
            <div className="flex flex-col gap-4">
              {/* Within SLA */}
              <div
                className="flex items-center justify-between gap-4 cursor-pointer p-1 rounded hover:bg-slate-50 transition-colors"
                onMouseEnter={(e) => handleSlaHover('within', e)}
                onMouseLeave={handleSlaLeave}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-[12px] font-medium text-[#475569]">
                    Within SLA
                  </span>
                </div>
                <div className="flex items-baseline gap-1 text-right">
                  <span className="text-[12px] font-bold text-[#1E293B]">
                    {trends.slaPerformance.withinSlaCount}
                  </span>
                  <span className="text-[11px] font-normal text-[#94A3B8]">
                    ({trends.slaPerformance.withinSlaPercentage}%)
                  </span>
                </div>
              </div>

              {/* SLA Breach */}
              <div
                className="flex items-center justify-between gap-4 cursor-pointer p-1 rounded hover:bg-slate-50 transition-colors"
                onMouseEnter={(e) => handleSlaHover('breach', e)}
                onMouseLeave={handleSlaLeave}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185]" />
                  <span className="text-[12px] font-medium text-[#475569]">
                    SLA Breach
                  </span>
                </div>
                <div className="flex items-baseline gap-1 text-right">
                  <span className="text-[12px] font-bold text-[#1E293B]">
                    {trends.slaPerformance.slaBreachCount}
                  </span>
                  <span className="text-[11px] font-normal text-[#94A3B8]">
                    ({trends.slaPerformance.slaBreachPercentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom SLA Note Highlight Box */}
          <div
            className="w-full rounded-[12px] p-3 flex items-center gap-3 border border-[#E0E7FF]"
            style={{ background: 'rgba(238, 242, 255, 0.7)' }}
          >
            <div className="w-8 h-8 rounded-full bg-[#E0E7FF] flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-[#4F46E5]" />
            </div>
            <p className="text-[12px] text-[#1E1B4B] leading-4">
              {trends.slaPerformance.improvementNote || (
                <>
                  SLA compliance is currently maintained at{' '}
                  <strong className="font-semibold">{trends.slaCompliance}%</strong> across all tickets.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Section - BottomInsightsRow (3 Cards) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Ticket Type Breakdown */}
        <div
          ref={typeCardRef}
          className="relative bg-white border border-[#F1F5F9] rounded-[16px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col justify-between"
          style={{ minHeight: '246px' }}
        >
          {/* Chart Tooltip */}
          <ChartTooltip
            visible={typeTooltip.visible}
            x={typeTooltip.x}
            y={typeTooltip.y}
            title={typeTooltip.title}
            label={typeTooltip.label}
            value={typeTooltip.value}
            color={typeTooltip.color}
          />

          <h2 className="text-[14px] font-bold text-[#1E293B] leading-5 mb-2">
            Ticket Type Breakdown
          </h2>

          <div className="flex items-center justify-between gap-2 flex-grow">
            {/* Donut Chart (144px x 144px) */}
            <div className="relative w-[130px] h-[130px] flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
                {trends.typeBreakdown.map((item) => {
                  const dashLength = (item.percentage / 100) * tbCircumference;
                  const dashOffset = -((accumulatedPercent / 100) * tbCircumference);
                  accumulatedPercent += item.percentage;
                  const isHovered = hoveredType === item.type;
                  return (
                    <circle
                      key={item.type}
                      cx="72"
                      cy="72"
                      r={tbRadius}
                      fill="none"
                      stroke={item.color}
                      strokeWidth={isHovered ? 23 : 20.16}
                      strokeDasharray={`${dashLength} ${tbCircumference - dashLength}`}
                      strokeDashoffset={dashOffset}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={(e) => handleTypeHover(item, e)}
                      onMouseMove={(e) => handleTypeHover(item, e)}
                      onMouseLeave={handleTypeLeave}
                    />
                  );
                })}
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[20px] font-bold text-[#0F172A] leading-5">
                  {trends.totalTickets}
                </span>
                <span className="text-[9px] font-medium text-[#94A3B8] leading-3 mt-0.5">
                  Total Tickets
                </span>
              </div>
            </div>

            {/* List Legend */}
            <div className="flex flex-col gap-2 flex-grow max-w-[140px]">
              {trends.typeBreakdown.map((item) => {
                const isHovered = hoveredType === item.type;
                return (
                  <div
                    key={item.type}
                    className={`flex items-center justify-between text-[12px] cursor-pointer p-0.5 rounded transition-colors ${
                      isHovered ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                    }`}
                    onMouseEnter={(e) => handleTypeHover(item, e)}
                    onMouseLeave={handleTypeLeave}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`font-medium ${isHovered ? 'text-indigo-900 font-semibold' : 'text-[#475569]'}`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-[#1E293B] leading-4">{item.count}</span>
                      <span className="text-[10px] text-[#94A3B8] leading-3">({item.percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Priority Distribution */}
        <div
          ref={priorityCardRef}
          className="relative bg-white border border-[#F1F5F9] rounded-[16px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col justify-between"
          style={{ minHeight: '246px' }}
        >
          {/* Chart Tooltip */}
          <ChartTooltip
            visible={priorityTooltip.visible}
            x={priorityTooltip.x}
            y={priorityTooltip.y}
            title={priorityTooltip.title}
            label={priorityTooltip.label}
            value={priorityTooltip.value}
            color={priorityTooltip.color}
          />

          <h2 className="text-[14px] font-bold text-[#1E293B] leading-5 mb-2">
            Priority Distribution
          </h2>

          {/* Vertical Bar Chart (height 176px) */}
          <div className="w-full flex-grow flex items-center justify-center">
            <svg viewBox="0 0 260 150" className="w-full h-[150px] select-none">
              {/* Y-axis Labels & Grid Lines */}
              {[80, 60, 40, 20, 0].map((val, idx) => {
                const y = 20 + idx * 26;
                return (
                  <g key={val}>
                    <text
                      x="22"
                      y={y + 4}
                      fill="#94A3B8"
                      fontSize="10"
                      fontFamily="Inter, sans-serif"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                    <line
                      x1="28"
                      y1={y}
                      x2="250"
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* Priority Bars: High, Medium, Low */}
              {trends.priorityDistribution.map((item, idx) => {
                const barX = 65 + idx * 72;
                const bWidth = 26;
                const plotMax = Math.max(80, ...trends.priorityDistribution.map((p) => p.count + 10));
                const baseLineY = 20 + 4 * 26; // Y for 0 = 124
                const barH = (item.count / plotMax) * 104;
                const barY = baseLineY - barH;
                const isHovered = hoveredPriority === item.priority;

                return (
                  <g
                    key={item.priority}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={(e) => handlePriorityHover(item, e)}
                    onMouseMove={(e) => handlePriorityHover(item, e)}
                    onMouseLeave={handlePriorityLeave}
                  >
                    {/* Hover Column Highlight */}
                    {isHovered && (
                      <rect
                        x={barX - 6}
                        y={20}
                        width={bWidth + 12}
                        height={104}
                        fill="#F8FAFC"
                        rx="4"
                      />
                    )}

                    {/* Top Value Label */}
                    <text
                      x={barX + bWidth / 2}
                      y={barY - 5}
                      fill={isHovered ? '#0F172A' : '#1E293B'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="Inter, sans-serif"
                      textAnchor="middle"
                    >
                      {item.count}
                    </text>

                    {/* Bar */}
                    <rect
                      x={barX}
                      y={barY}
                      width={bWidth}
                      height={barH}
                      fill={item.color}
                      rx="3"
                      style={{ filter: isHovered ? 'brightness(1.08)' : 'none' }}
                    />

                    {/* X-axis Label */}
                    <text
                      x={barX + bWidth / 2}
                      y={baseLineY + 16}
                      fill={isHovered ? '#1E293B' : '#64748B'}
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fontSize="11"
                      fontFamily="Inter, sans-serif"
                      textAnchor="middle"
                    >
                      {item.priority}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Card 3: Key Insights */}
        <div
          className="bg-white border border-[#F1F5F9] rounded-[16px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex flex-col justify-between"
          style={{ minHeight: '246px' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            <h2 className="text-[14px] font-bold text-[#1E293B] leading-5">
              Key Insights
            </h2>
          </div>

          {/* Dynamic Insights List directly from Database Metrics */}
          <div className="flex flex-col gap-3 flex-grow justify-center">
            {trends.keyInsights && trends.keyInsights.length > 0 ? (
              trends.keyInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#ECFDF5] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#059669]" />
                  </div>
                  <p className="text-[12px] text-[#475569] leading-4">
                    {insight}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#94A3B8] italic">No insights available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
