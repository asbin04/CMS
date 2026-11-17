import React from 'react';
import { Folder, PlayCircle, AlertTriangle, Layers } from 'lucide-react';
import { ProjectKpis } from '../types/project';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

interface ProjectKpiCardsProps {
  kpis: ProjectKpis;
  isLoading?: boolean;
}

export const ProjectKpiCards: React.FC<ProjectKpiCardsProps> = ({ kpis, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Card 1: Total Projects */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '16px',
          height: '103px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '0px',
            width: '100%',
            height: '69px',
          }}
        >
          {/* Blue Icon */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              background: '#EFF6FF',
              borderRadius: '12px',
              flexShrink: 0,
            }}
          >
            <Folder size={20} color="#4F46E5" strokeWidth={1.75} />
          </div>

          {/* Metric Data */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
            }}
          >
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '11px',
                lineHeight: '16px',
                color: '#64748B',
                marginBottom: '1px',
              }}
            >
              Total Projects
            </div>
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '32px',
                color: '#0F172A',
              }}
            >
              {kpis.totalProjects}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#059669',
                }}
              >
                {kpis.totalProjectsTrend.split(' vs ')[0] || '↑ 12%'}
              </span>
              <span
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#94A3B8',
                }}
              >
                vs last month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Active Projects */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '16px',
          height: '103px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '0px',
            width: '100%',
            height: '69px',
          }}
        >
          {/* Green Icon */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              background: '#ECFDF5',
              borderRadius: '12px',
              flexShrink: 0,
            }}
          >
            <PlayCircle size={20} color="#059669" strokeWidth={1.75} />
          </div>

          {/* Metric Data */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
            }}
          >
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '11px',
                lineHeight: '16px',
                color: '#64748B',
                marginBottom: '1px',
              }}
            >
              Active Projects
            </div>
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '32px',
                color: '#0F172A',
              }}
            >
              {kpis.activeProjects}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#059669',
                }}
              >
                {kpis.activeProjectsTrend.split(' vs ')[0] || '↑ 18%'}
              </span>
              <span
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#94A3B8',
                }}
              >
                vs last month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Projects at Risk */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '16px',
          height: '103px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '0px',
            width: '100%',
            height: '69px',
          }}
        >
          {/* Amber Icon */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              background: '#FFFBEB',
              borderRadius: '12px',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} color="#F59E0B" strokeWidth={1.75} />
          </div>

          {/* Metric Data */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
            }}
          >
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '11px',
                lineHeight: '16px',
                color: '#64748B',
                marginBottom: '1px',
              }}
            >
              Projects at Risk
            </div>
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '32px',
                color: '#0F172A',
              }}
            >
              {kpis.projectsAtRisk}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#F43F5E',
                }}
              >
                {kpis.projectsAtRiskTrend.split(' vs ')[0] || '↓ 5%'}
              </span>
              <span
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#94A3B8',
                }}
              >
                vs last month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Total Contract Value */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '16px',
          height: '103px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '0px',
            width: '100%',
            height: '69px',
          }}
        >
          {/* Purple Icon */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              background: '#FAF5FF',
              borderRadius: '12px',
              flexShrink: 0,
            }}
          >
            <Layers size={20} color="#9333EA" strokeWidth={1.75} />
          </div>

          {/* Metric Data */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0px',
            }}
          >
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '11px',
                lineHeight: '16px',
                color: '#64748B',
                marginBottom: '1px',
              }}
            >
              Total Contract Value
            </div>
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '32px',
                color: '#0F172A',
                whiteSpace: 'nowrap',
              }}
            >
              {kpis.totalContractValueFormatted || '₹ 4,8690'}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                marginTop: '2px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#059669',
                }}
              >
                {kpis.totalContractValueTrend.split(' vs ')[0] || '↑ 14%'}
              </span>
              <span
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#94A3B8',
                }}
              >
                vs last month
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
