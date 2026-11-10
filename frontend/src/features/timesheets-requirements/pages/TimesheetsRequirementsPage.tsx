import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { TimesheetsSection } from '../components/Timesheets/TimesheetsSection';
import { RequirementsSection } from '../components/Requirements/RequirementsSection';

export const TimesheetsRequirementsPage: React.FC = () => {
  return (
    <div
      className="w-full min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Main Combined Page Header */}
        <PageHeader />

        {/* Section 1: Timesheets */}
        <TimesheetsSection />

        {/* Section 2: Requirements */}
        <RequirementsSection />
      </div>
    </div>
  );
};

export default TimesheetsRequirementsPage;

