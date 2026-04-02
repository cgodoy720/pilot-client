import React, { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import useNavStore from '../../stores/navStore';
import { usePermissions } from '../../hooks/usePermissions';
import OverviewTab from './tabs/OverviewTab';
import BuildersTab from './tabs/BuildersTab';
import PerformanceTab from './tabs/PerformanceTab';
import AttendanceTab from './tabs/AttendanceTab';
import SurveyTab from './tabs/SurveyTab';
import AssessmentsTab from './tabs/AssessmentsTab';
import L2SelectionsTab from './tabs/L2SelectionsTab';
import LogsTab from './tabs/LogsTab';
import { fetchPursuitBuilderCohorts } from './utils/cohortUtils';

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'roster',      label: 'Roster' },
  { id: 'performance', label: 'Performance' },
  { id: 'attendance',  label: 'Attendance' },
  { id: 'nps',         label: 'NPS' },
  { id: 'assessments', label: 'Assessments' },
  { id: 'l2',          label: 'L2' },
  { id: 'logs',        label: 'Logs' },
];

const TAB_BASE = 'px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap';
const TAB_ACTIVE = 'border-[#4242EA] text-[#4242EA]';
const TAB_INACTIVE = 'border-transparent text-slate-500 hover:text-[#1E1E1E] hover:border-slate-300';

const AdminDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const { canAccessPage } = usePermissions();
  const isSecondaryNavPage = useNavStore((s) => s.isSecondaryNavPage);
  const [activeTab, setActiveTab] = useState('overview');

  const [cohorts, setCohorts] = useState([]);
  const [selectedCohortId, setSelectedCohortId] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchPursuitBuilderCohorts(token)
      .then(data => {
        setCohorts(data);
        if (data.length > 0) setSelectedCohortId(data[0].cohort_id);
      })
      .catch(console.error);
  }, [token]);

  if (!canAccessPage('admin_dashboard')) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] p-8 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {!isSecondaryNavPage && (
        <div className="bg-white border-b border-[#E3E3E3] px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#1E1E1E]" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                Cohort Hub
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">Per-cohort facilitator workspace</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="text-xs text-slate-500 font-medium">Cohort</label>
              <select
                value={selectedCohortId}
                onChange={e => setSelectedCohortId(e.target.value)}
                className="px-3 py-1.5 text-sm border border-[#E3E3E3] rounded-md bg-white text-[#1E1E1E] focus:border-[#4242EA] focus:outline-none"
              >
                {cohorts.map(c => <option key={c.cohort_id} value={c.cohort_id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="bg-white border-b border-[#E3E3E3] px-8 flex overflow-x-auto">
        <div className="max-w-7xl mx-auto w-full flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${TAB_BASE} ${activeTab === tab.id ? TAB_ACTIVE : TAB_INACTIVE}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {activeTab === 'overview'    && <OverviewTab    selectedCohortId={selectedCohortId} cohorts={cohorts} />}
        {activeTab === 'roster'      && <BuildersTab    selectedCohortId={selectedCohortId} cohorts={cohorts} />}
        {activeTab === 'performance' && <PerformanceTab selectedCohortId={selectedCohortId} cohorts={cohorts} />}
        {activeTab === 'attendance'  && <AttendanceTab  selectedCohortId={selectedCohortId} cohorts={cohorts} />}
        {activeTab === 'nps'         && <SurveyTab      selectedCohortId={selectedCohortId} cohorts={cohorts} />}
        {activeTab === 'assessments' && <AssessmentsTab selectedCohortId={selectedCohortId} cohorts={cohorts} />}
        {activeTab === 'l2'          && <L2SelectionsTab selectedCohortId={selectedCohortId} cohorts={cohorts} />}
        {activeTab === 'logs'        && <LogsTab        selectedCohortId={selectedCohortId} cohorts={cohorts} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
