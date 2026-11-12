import React from 'react';
import { RecentActivityItem } from '../types';
import { INITIAL_RECENT_ACTIVITIES } from '../mockData';

interface RecentActivitiesSectionProps {
  activities?: RecentActivityItem[];
}

export const RecentActivitiesSection: React.FC<RecentActivitiesSectionProps> = ({
  activities = [],
}) => {
  // Only display Leave, Attendance, Employee activities and filter out old/seed items
  const validActivities = activities.filter(
    (a) =>
      ['Leave', 'Attendance', 'Employee'].includes(a.type) &&
      !['act-1', 'act-2', 'act-3', 'act-4', 'act-5'].includes(a.id) &&
      !a.date.includes('2025')
  );

  // Always display the 5 most recent activities
  const displayItems = validActivities.slice(0, 5);

  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0]/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-start h-full min-h-[368.5px] min-w-0">
      {/* Top Header */}
      <div className="shrink-0 mb-4">
        <h2 className="text-[17px] font-bold text-slate-900 m-0 leading-tight">Recent Activities</h2>
        <p className="text-xs text-slate-500 m-0 mt-0.5">Latest HR activities and updates.</p>
      </div>

      {/* Horizontal Scrollable Table Wrapper */}
      <div className="overflow-x-auto w-full table-horizontal-scroll pb-1">
        <table className="w-full text-left border-collapse text-xs min-w-[620px]">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="py-2.5 px-3.5 font-semibold text-[11px] tracking-wider text-slate-400 uppercase rounded-l-lg text-left whitespace-nowrap w-[120px]">
                Date
              </th>
              <th className="py-2.5 px-3.5 font-semibold text-[11px] tracking-wider text-slate-400 uppercase text-left whitespace-nowrap w-[130px]">
                Type
              </th>
              <th className="py-2.5 px-3.5 font-semibold text-[11px] tracking-wider text-slate-400 uppercase text-left whitespace-nowrap min-w-[260px]">
                Description
              </th>
              <th className="py-2.5 px-3.5 font-semibold text-[11px] tracking-wider text-slate-400 uppercase rounded-r-lg text-right whitespace-nowrap w-[110px]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-xs text-slate-400">
                  No recent activities recorded.
                </td>
              </tr>
            ) : (
              displayItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Date */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 font-normal text-xs">
                    {item.date}
                  </td>

                  {/* Type with colored dot indicator */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.typeColor }}
                      />
                      <span className="font-semibold text-slate-800 text-xs">{item.type}</span>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="py-3 px-3.5 text-slate-600 font-normal text-xs whitespace-nowrap">
                    {item.description}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-right">
                    {item.status === 'Completed' ? (
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
