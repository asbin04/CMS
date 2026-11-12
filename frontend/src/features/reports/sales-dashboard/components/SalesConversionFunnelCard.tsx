import React from 'react';
import { Filter } from 'lucide-react';
import { FunnelStage, ConversionOverviewData } from '../types';
import {
  UniversalFunnelChart,
  FunnelStageItem,
  FunnelConversionOverviewItem,
} from '../../../../components/charts/UniversalFunnelChart';

interface SalesConversionFunnelCardProps {
  stages: FunnelStage[];
  conversion: ConversionOverviewData;
}

export const SalesConversionFunnelCard: React.FC<SalesConversionFunnelCardProps> = ({
  stages,
  conversion,
}) => {
  // Map feature funnel stages to UniversalFunnelChart schema
  const universalData: FunnelStageItem[] = stages.map((stage) => ({
    stage_name: stage.id,
    sublabel: stage.label,
    lead_count: stage.value,
    color_hex: stage.color,
    textColor: stage.textColor,
    subtextColor: stage.subtextColor,
  }));

  const conversionOverview: FunnelConversionOverviewItem[] = [
    { label: 'Lead →\nOpportunity', value: conversion.leadToOpportunity },
    { label: 'Opportunity →\nProposal', value: conversion.opportunityToProposal },
    { label: 'Proposal → Contract', value: conversion.proposalToContract },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between transition-all hover:border-slate-300 h-full">
      {/* Card Header */}
      <div className="flex items-center gap-2 pb-5 text-slate-900">
        <Filter className="w-4 h-4 text-[#4F46E5] stroke-[2.2]" />
        <h2 className="text-sm sm:text-base font-bold tracking-tight">
          Sales Conversion Funnel
        </h2>
      </div>

      {/* Main Body: Reusable UniversalFunnelChart in detailed mode */}
      <UniversalFunnelChart
        variant="detailed"
        data={universalData}
        conversionOverview={conversionOverview}
        overallConversion={conversion.overallConversion}
      />
    </div>
  );
};
