import React, { useState } from 'react';
import { BarChart2, ChevronDown } from 'lucide-react';
import { SalesPipelineStage, ProjectStatusItem } from '../../types/dashboard';
import { UniversalDonutChart } from '../charts/UniversalDonutChart';

interface SalesDeliverySectionProps {
  pipelineStages: SalesPipelineStage[];
  projectStatuses: ProjectStatusItem[];
}

export const SalesDeliverySection: React.FC<SalesDeliverySectionProps> = ({
  pipelineStages,
  projectStatuses
}) => {
  const [period, setPeriod] = useState('Last 6 Months');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const safePipelineStages = pipelineStages && pipelineStages.length > 0 ? pipelineStages : [
    { stage_name: 'Leads', lead_count: 0, conversion_rate: 0, color_hex: '#3B82F6' },
    { stage_name: 'Opportunities', lead_count: 0, conversion_rate: 0, color_hex: '#14B8A6' },
    { stage_name: 'Proposals', lead_count: 0, conversion_rate: 0, color_hex: '#FBBF24' },
    { stage_name: 'Contracts', lead_count: 0, conversion_rate: 0, color_hex: '#F97316' }
  ];

  const safeProjectStatuses = projectStatuses && projectStatuses.length > 0 ? projectStatuses : [
    { status_name: 'Planning', project_count: 0, percentage: 0, color_hex: '#38BDF8' },
    { status_name: 'In Progress', project_count: 0, percentage: 0, color_hex: '#10B981' },
    { status_name: 'UAT', project_count: 0, percentage: 0, color_hex: '#F59E0B' },
    { status_name: 'Deployment', project_count: 0, percentage: 0, color_hex: '#6366F1' },
    { status_name: 'On Hold', project_count: 0, percentage: 0, color_hex: '#F43F5E' }
  ];

  const totalProjects = safeProjectStatuses.reduce(
    (acc, curr: any) => acc + (curr.project_count ?? curr.projectCount ?? 0),
    0
  );

  const [selectedStatus, setSelectedStatus] = useState<string>('In Progress');
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const activeStatusName = hoveredStatus || selectedStatus;
  const activeStatusItem = safeProjectStatuses.find(
    (s: any) => (s.status_name ?? s.statusName)?.toLowerCase() === activeStatusName?.toLowerCase()
  ) || safeProjectStatuses.find((s: any) => (s.status_name ?? s.statusName)?.toLowerCase() === 'in progress') || safeProjectStatuses[0];

  const centerValue = activeStatusItem
    ? ((activeStatusItem as any).project_count ?? (activeStatusItem as any).projectCount ?? 0)
    : totalProjects;

  const centerLabel = activeStatusItem
    ? ((activeStatusItem as any).status_name ?? (activeStatusItem as any).statusName ?? 'In Progress')
    : 'Active Projects';

  return (
    <div
      className="bg-white border border-[#F1F5F9] rounded-[16px] p-6 flex flex-col transition-all duration-200"
      style={{
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.04), 0px 1px 2px rgba(0, 0, 0, 0.02)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-5 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
            <BarChart2 size={16} className="text-[#2563EB] stroke-[1.67]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[14px] font-bold text-[#1E293B] leading-5">
              Sales & Delivery Overview
            </h3>
            <p className="text-[11.5px] font-normal text-[#94A3B8] leading-[17px]">
              Weighted sales pipeline and active project count with opportunity stage and project status breakdowns.
            </p>
          </div>
        </div>

        {/* Dropdown Filter */}
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1 rounded-lg text-[12px] font-medium text-[#475569] bg-white hover:bg-slate-50 transition-colors h-[26px]"
          >
            <span>{period}</span>
            <ChevronDown size={12} className="text-[#94A3B8]" />
          </button>
          {showPeriodDropdown && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-[#E2E8F0] rounded-lg shadow-lg p-1 z-30 text-xs">
              {['Last 6 Months', 'Last Quarter', 'Full FY25'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setPeriod(opt);
                    setShowPeriodDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-50 ${
                    period === opt ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-[#475569]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2 Columns: Funnel and Active Projects Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 items-start">
        {/* Column 1: Sales Pipeline by Stage */}
        <div className="flex flex-col w-full">
          <h4 className="text-[12px] font-bold text-[#334155] leading-4 mb-4">
            Sales Pipeline by Stage
          </h4>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Visual Funnel Trapezoids */}
            <div className="flex flex-col items-center w-[180px] shrink-0 gap-1.5">
              <div
                className="w-[180px] h-[30px] bg-[#3B82F6] rounded-[2px] transition-transform hover:scale-[1.02]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 91.67% 100%, 8.33% 100%)' }}
                title="Leads"
              />
              <div
                className="w-[150px] h-[30px] bg-[#10B981] rounded-[2px] transition-transform hover:scale-[1.02]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)' }}
                title="Opportunities"
              />
              <div
                className="w-[120px] h-[30px] bg-[#F59E0B] rounded-[2px] transition-transform hover:scale-[1.02]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 87.5% 100%, 12.5% 100%)' }}
                title="Proposals"
              />
              <div
                className="w-[90px] h-[30px] bg-[#F97316] rounded-[2px] transition-transform hover:scale-[1.02]"
                style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }}
                title="Contracts"
              />
            </div>

            {/* Stage Metrics List */}
            <div className="flex flex-col gap-2 flex-1 w-full justify-between">
              {safePipelineStages.map((stage: any, idx: number) => {
                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#F97316'];
                const stageColor = stage.color_hex || colors[idx % colors.length];
                const leadCount = stage.lead_count ?? stage.leadCount ?? 0;
                const firstStage: any = safePipelineStages[0];
                const firstStageCount = firstStage?.lead_count ?? firstStage?.leadCount ?? 0;
                const convRate = stage.conversion_rate ?? stage.conversionRate ?? (firstStageCount > 0 ? Math.round((leadCount / firstStageCount) * 100) : 0);

                return (
                  <div key={stage.stage_name || idx} className="h-[28px] flex items-center justify-between text-xs px-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-[2px] shrink-0" style={{ backgroundColor: stageColor }} />
                      <span className="text-[13px] font-normal text-[#1E293B]">{stage.stage_name}</span>
                    </div>
                    <span className="text-[13px] font-bold text-[#1E293B]">
                      {leadCount} <span className="font-normal text-[#64748B]">({convRate}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Active Projects by Status */}
        <div className="flex flex-col w-full">
          <h4 className="text-[12px] font-bold text-[#334155] leading-4 mb-4">
            Active Projects by Status
          </h4>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="relative shrink-0 flex items-center justify-center" style={{ filter: 'drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.08))' }}>
              <UniversalDonutChart
                data={safeProjectStatuses.map((item: any) => ({
                  id: item.status_name ?? item.statusName ?? '',
                  label: item.status_name ?? item.statusName ?? '',
                  value: item.project_count ?? item.projectCount ?? 0,
                  percentage: item.percentage ?? 0,
                  color: item.color_hex ?? item.colorHex ?? '#10B981',
                }))}
                centerPrimaryText={centerValue}
                centerSecondaryText={centerLabel}
                size={144}
                showLegend={false}
                activeId={activeStatusName}
                onSegmentHover={(item) => setHoveredStatus(item ? item.label : null)}
                onSegmentClick={(item) => setSelectedStatus(item.label)}
              />
            </div>

            {/* Custom Interactive Legend exactly matching Design */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0 w-full text-xs">
              {safeProjectStatuses.map((item: any, idx: number) => {
                const label = item.status_name ?? item.statusName ?? '';
                const count = item.project_count ?? item.projectCount ?? 0;
                const pct = item.percentage ?? (totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0);
                const color = item.color_hex ?? item.colorHex ?? '#10B981';
                const isActive = activeStatusName?.toLowerCase() === label.toLowerCase();

                return (
                  <div
                    key={label || idx}
                    onMouseEnter={() => setHoveredStatus(label)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    onClick={() => setSelectedStatus(label)}
                    className={`flex items-center justify-between text-[13px] leading-[20px] px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-[#F0FDF4] text-[#0F172A] font-semibold shadow-xs'
                        : 'hover:bg-slate-50 text-[#334155] font-normal'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200 ${isActive ? 'scale-125' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate">{label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className={isActive ? 'font-bold text-[#0F172A]' : 'font-medium text-[#1E293B]'}>{count}</span>
                      <span className="text-[#64748B] font-normal">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
