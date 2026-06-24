import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../stores/authStore';
import useNavStore from '../../stores/navStore';
import { usePermissions } from '../../hooks/usePermissions';
import OverviewTab from './tabs/OverviewTab';
import TodayTab from './tabs/TodayTab';
import AssessmentsTab from './tabs/AssessmentsTab';
import L2SelectionsTab from './tabs/L2SelectionsTab';
import LogsTab from './tabs/LogsTab';
import BuilderMetricsTab from './tabs/BuilderMetricsTab';
import EngagementTodayTab from './tabs/EngagementTodayTab';
import ScheduleTab from './tabs/ScheduleTab';
import PlanProgressTab from './tabs/PlanProgressTab';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7001';
const STORAGE_KEY = 'pursuit_program_slug';
const COHORT_STORAGE_KEY = 'pursuit_selected_cohort';
const DEFAULT_COHORT_NAME = 'March 2026 L1';

const TABS = [
  { id: 'today',       label: 'Today' },
  { id: 'overview',    label: 'Overview' },
  { id: 'logs',        label: 'Logs' },
  { id: 'assessments', label: 'Assessments' },
  { id: 'l2',          label: 'L2' },
];

const TAB_BASE = 'px-5 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap';
const TAB_ACTIVE = 'border-[#4242EA] text-[#4242EA]';
const TAB_INACTIVE = 'border-transparent text-slate-500 hover:text-[#1E1E1E] hover:border-slate-300';

const AdminDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const { canAccessPage } = usePermissions();
  const [activeTab, setActiveTab] = useState('today');

  const [programs, setPrograms] = useState([]);
  const [programSlug, setProgramSlug] = useState(() => localStorage.getItem(STORAGE_KEY) || 'ai-native-builder');
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohortId, setSelectedCohortId] = useState(() => localStorage.getItem(COHORT_STORAGE_KEY) || '');

  // Load programs once
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/admin/dashboard/programs`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json())
      .then(data => { if (data.success) setPrograms(data.programs); })
      .catch(() => {});
  }, [token]);

  // Load cohorts when program changes
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/admin/dashboard/program-cohorts?programSlug=${programSlug}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json())
      .then(data => {
        const list = data.cohorts || [];
        setCohorts(list);
        // If we have a persisted selection and it exists in this program's cohorts, keep it
        const persisted = localStorage.getItem(COHORT_STORAGE_KEY);
        if (persisted && list.some(c => c.cohort_id === persisted)) {
          setSelectedCohortId(persisted);
        } else if (list.length > 0) {
          // Default to March 2026 L1 if it exists, otherwise first cohort
          const defaultCohort = list.find(c => c.name === DEFAULT_COHORT_NAME);
          const id = defaultCohort ? defaultCohort.cohort_id : list[0].cohort_id;
          setSelectedCohortId(id);
          localStorage.setItem(COHORT_STORAGE_KEY, id);
        } else {
          setSelectedCohortId('');
        }
      })
      .catch(() => { setCohorts([]); setSelectedCohortId(''); });
  }, [token, programSlug]);

  const handleProgramChange = (slug) => {
    setProgramSlug(slug);
    localStorage.setItem(STORAGE_KEY, slug);
    // Clear persisted cohort when switching programs — will re-default on load
    localStorage.removeItem(COHORT_STORAGE_KEY);
  };

  const selectedCohort = useMemo(
    () => cohorts.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );

  const isL3Plus = selectedCohortId === 'ALL_L3PLUS' || selectedCohort?.name?.includes('L3+');
  const isClassDay = [1, 2, 3, 4].includes(new Date().getDay()); // Mon/Tue/Wed/Thu

  // L2 tab: show for L1 cohorts in week 7+ OR completed cohorts (is_active=false)
  // L3+ gets Schedule or Plan Progress tab instead of L2
  const visibleTabs = useMemo(
    () => {
      const base = TABS.filter(tab => {
        if (tab.id === 'l2') {
          if (selectedCohort?.level !== 'L1') return false;
          if (selectedCohort?.is_active === false) return true;
          return (parseInt(selectedCohort?.current_week) || 0) >= 7;
        }
        return true;
      });

      if (!isL3Plus) return base;

      // L3+ gets a Schedule (class day) or Plan Progress tab, placed after Logs
      // and before Assessments → Today · Overview · Logs · Schedule · Assessments.
      const l3Tab = { id: isClassDay ? 'schedule' : 'plan_progress', label: isClassDay ? 'Schedule' : 'Plan Progress' };
      const assessIdx = base.findIndex(t => t.id === 'assessments');
      const result = [...base];
      result.splice(assessIdx >= 0 ? assessIdx : result.length, 0, l3Tab);
      return result;
    },
    [selectedCohort, isL3Plus, isClassDay]
  );

  // If active tab became hidden (e.g., L2 hidden), reset to overview
  useEffect(() => {
    if (!visibleTabs.find(t => t.id === activeTab)) {
      setActiveTab('overview');
    }
  }, [visibleTabs, activeTab]);

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
      {/* Header */}
      <div className="bg-white border-b border-[#E3E3E3] px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E1E1E]" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Cohort Hub
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Per-cohort facilitator workspace</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {programs.length > 1 && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 font-medium">Program</label>
                <select
                  value={programSlug}
                  onChange={(e) => handleProgramChange(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-[#E3E3E3] rounded-md bg-white text-[#1E1E1E] focus:border-[#4242EA] focus:outline-none"
                >
                  {programs.map(p => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}{p.organization ? ` — ${p.organization}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">Cohort</label>
              <select
                value={selectedCohortId}
                onChange={e => { setSelectedCohortId(e.target.value); localStorage.setItem(COHORT_STORAGE_KEY, e.target.value); }}
                className="px-3 py-1.5 text-sm border border-[#E3E3E3] rounded-md bg-white text-[#1E1E1E] focus:border-[#4242EA] focus:outline-none"
              >
                {cohorts.some(c => c.name?.includes('L3+')) && (
                  <option value="ALL_L3PLUS">All L3+ (aggregate)</option>
                )}
                {cohorts.map(c => <option key={c.cohort_id} value={c.cohort_id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-[#E3E3E3] px-8">
        <div className="max-w-7xl mx-auto w-full flex">
          {visibleTabs.map(tab => (
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
      <div className={`${isL3Plus && activeTab === 'overview' ? 'max-w-screen-2xl' : 'max-w-7xl'} mx-auto px-8 py-6`}>
        {activeTab === 'today' && (
          isL3Plus
            ? <EngagementTodayTab selectedCohortId={selectedCohortId} cohorts={cohorts} />
            : <TodayTab           selectedCohortId={selectedCohortId} cohorts={cohorts} />
        )}
        {activeTab === 'schedule'      && <ScheduleTab      selectedCohortId={selectedCohortId} cohorts={cohorts} />}
        {activeTab === 'plan_progress' && <PlanProgressTab  selectedCohortId={selectedCohortId} cohorts={cohorts} />}
        {activeTab === 'overview' && (
          isL3Plus
            ? <BuilderMetricsTab selectedCohortId={selectedCohortId} cohorts={cohorts} />
            : <OverviewTab       selectedCohortId={selectedCohortId} cohorts={cohorts} programSlug={programSlug} />
        )}
        {activeTab === 'assessments' && <AssessmentsTab  selectedCohortId={selectedCohortId} cohorts={cohorts} />}
        {activeTab === 'l2'          && <L2SelectionsTab selectedCohortId={selectedCohortId} cohorts={cohorts} />}
        {activeTab === 'logs'        && <LogsTab         selectedCohortId={selectedCohortId} cohorts={cohorts} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
