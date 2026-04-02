import React, { useState } from 'react';
import useNavStore from '../../stores/navStore';
import ProgramMetricsTab from '../AdminDashboard/tabs/ProgramMetricsTab';
import CohortComparisonTab from '../AdminDashboard/tabs/CohortComparisonTab';

const SUBTABS = [
  { id: 'program-performance', label: 'Program Performance' },
  { id: 'cohort-performance',  label: 'Cohort Performance' },
];

const TAB_TRIGGER_BASE = 'px-5 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap';
const TAB_TRIGGER_ACTIVE = 'border-[#4242EA] text-[#4242EA]';
const TAB_TRIGGER_INACTIVE = 'border-transparent text-slate-500 hover:text-[#1E1E1E] hover:border-slate-300';

const ProgramAnalytics = () => {
  const isSecondaryNavPage = useNavStore((s) => s.isSecondaryNavPage);
  const [activeTab, setActiveTab] = useState('program-performance');

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {!isSecondaryNavPage && (
        <div className="bg-white border-b border-[#E3E3E3] px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl font-bold text-[#1E1E1E]" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Program Analytics
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Cross-cohort health and pipeline metrics</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 pt-0">
        <div className="bg-white border-b border-[#E3E3E3] flex overflow-x-auto">
          {SUBTABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${TAB_TRIGGER_BASE} ${activeTab === tab.id ? TAB_TRIGGER_ACTIVE : TAB_TRIGGER_INACTIVE}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'program-performance' && <ProgramMetricsTab />}
          {activeTab === 'cohort-performance' && <CohortComparisonTab />}
        </div>
      </div>
    </div>
  );
};

export default ProgramAnalytics;
