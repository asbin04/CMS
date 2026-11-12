import React from 'react';
import { HrTabType } from '../types';

interface HrEmployeeTabsProps {
  activeTab: HrTabType;
  onTabChange: (tab: HrTabType) => void;
}

const TABS: { id: HrTabType; label: string }[] = [
  { id: 'employees', label: 'Employees' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'leave', label: 'Leave' },
  { id: 'exits', label: 'Exits' },
];

export const HrEmployeeTabs: React.FC<HrEmployeeTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-white border-b border-[#E2E8F0] px-6 pt-3 flex items-center gap-8 sm:gap-9 overflow-x-auto scrollbar-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`pb-3.5 pt-1.5 text-sm font-semibold transition-colors relative whitespace-nowrap cursor-pointer border-none bg-transparent ${
              isActive
                ? 'text-[#4F46E5]'
                : 'text-[#64748B] hover:text-[#1E293B] font-medium'
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#4F46E5] rounded-t-sm" />
            )}
          </button>
        );
      })}
    </div>
  );
};

