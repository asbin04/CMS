import React from 'react';
import {
  Users,
  Clock,
  CreditCard,
  UserPlus,
  TrendingUp,
  Search,
  AlertTriangle,
  Calendar,
  UserMinus,
} from 'lucide-react';
import { HrKpiMetric } from '../types';

interface HrKpiCardsProps {
  metrics: HrKpiMetric[];
}

export const HrKpiCards: React.FC<HrKpiCardsProps> = ({ metrics }) => {
  const renderIcon = (iconName: HrKpiMetric['iconName']) => {
    switch (iconName) {
      case 'users':
        return <Users className="w-5 h-5 stroke-[2.2]" />;
      case 'clock':
        return <Clock className="w-5 h-5 stroke-[2.2]" />;
      case 'credit-card':
        return <CreditCard className="w-5 h-5 stroke-[2.2]" />;
      case 'user-plus':
        return <UserPlus className="w-5 h-5 stroke-[2.2]" />;
      case 'trending-up':
        return <TrendingUp className="w-5 h-5 stroke-[2.2]" />;
      case 'search':
        return <Search className="w-5 h-5 stroke-[2.2]" />;
      case 'alert-triangle':
        return <AlertTriangle className="w-5 h-5 stroke-[2.2]" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 stroke-[2.2]" />;
      case 'user-minus':
        return <UserMinus className="w-5 h-5 stroke-[2.2]" />;
      default:
        return <Users className="w-5 h-5 stroke-[2.2]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center gap-3.5 sm:gap-4 select-none"
        >
          {/* Icon Container with specific background and icon color */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
            style={{
              backgroundColor: metric.iconBg,
              color: metric.iconColor,
            }}
          >
            {renderIcon(metric.iconName)}
          </div>

          {/* Metric Details */}
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-slate-500 leading-tight block truncate">
              {metric.label}
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-1 tracking-tight block truncate">
              {metric.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

