import React from 'react';
import { UniversalBarChart, BarDataPoint } from '../../../components/charts/UniversalBarChart';
import { UniversalDonutChart } from '../../../components/charts/UniversalDonutChart';
import { UniversalAreaLineChart } from '../../../components/charts/UniversalAreaLineChart';
import {
  EmployeeRecord,
  AttendanceRecord,
} from '../types';
import {
  generateHeadcountChartData,
  generateAttendanceDonutData,
  generateMonthlyCtcTrendData,
} from '../mockData';

interface HrChartsSectionProps {
  employees: EmployeeRecord[];
  attendance: AttendanceRecord[];
}

export const HrChartsSection: React.FC<HrChartsSectionProps> = ({
  employees,
  attendance,
}) => {
  const barData: BarDataPoint[] = generateHeadcountChartData(employees);
  const donutData = generateAttendanceDonutData(attendance);
  const trendData = generateMonthlyCtcTrendData(employees);

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Row 1: Headcount by Department & Attendance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Headcount Bar Chart (7 cols) */}
        <div className="lg:col-span-7 flex flex-col min-w-0">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between h-full">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-slate-900 m-0">Headcount by Department</h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">Active workforce vs. employees currently serving notice.</p>
            </div>

            <UniversalBarChart
              data={barData}
              series={[
                { key: 'Active', name: 'Active Employees', color: '#4F46E5' },
                { key: 'On Notice', name: 'On Notice', color: '#EA580C' },
              ]}
              height={260}
              showLegend={true}
              barRadius={[4, 4, 0, 0]}
            />
          </div>
        </div>

        {/* Attendance Donut (5 cols) */}
        <div className="lg:col-span-5 flex flex-col min-w-0">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between h-full">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-slate-900 m-0">Attendance Status Ratio</h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">Punctuality and daily biometric status distribution.</p>
            </div>

            <div className="flex items-center justify-center py-2">
              <UniversalDonutChart
                data={donutData}
                centerPrimaryText={String(attendance.length)}
                centerSecondaryText="Total Logs"
                showLegend={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Monthly CTC & Hiring Trend */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 m-0">Monthly Payroll & Hiring Trend</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">6-month growth in monthly CTC expenditure (₹ in thousands) alongside headcount.</p>
          </div>
        </div>

        <UniversalAreaLineChart
          data={trendData}
          series={[
            {
              key: 'Monthly CTC (₹k)',
              name: 'Monthly CTC (₹k)',
              strokeColor: '#059669',
              fillGradient: true,
              fillColorStart: '#10B981',
              fillColorEnd: '#ECFDF5',
            },
            {
              key: 'Headcount',
              name: 'Headcount',
              strokeColor: '#6366F1',
              fillGradient: false,
            },
          ]}
          height={260}
          showLegend={true}
          valueFormatter={(val) => (val > 100 ? `₹${val}k` : `${val} staff`)}
        />
      </div>
    </div>
  );
};
