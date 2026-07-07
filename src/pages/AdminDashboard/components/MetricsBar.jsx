import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../../stores/authStore';
import MetricDetailDrawer from './MetricDetailDrawer';
import { combineNps, latestWeekRows, totalResponses } from '../utils/npsUtils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7001';
const LEGACY_API = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api';

const MetricsBar = ({ selectedCohortId, cohorts, programSlug = 'ai-native-builder' }) => {
  const token = useAuthStore((s) => s.token);
  const [mode, setMode] = useState('last_week');
  const [compData, setCompData] = useState(null);
  const [npsMap, setNpsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [drawerMetric, setDrawerMetric] = useState(null);

  const selectedCohort = useMemo(
    () => cohorts?.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    Promise.all([
      fetch(`${API_BASE}/api/admin/dashboard/cohort-comparison?programSlug=${programSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).catch(() => ({ success: false })),
      fetch(`${LEGACY_API}/surveys/nps/weekly-by-cohort?startDate=${sixMonthsAgo}&endDate=${today}&mode=calendar`)
        .then(r => r.json()).catch(() => []),
    ]).then(([comparison, nps]) => {
      if (comparison.success) {
        setCompData({ active: comparison.active || [], completed: comparison.completed || [] });
      }
      // Build NPS map
      const map = {};
      if (Array.isArray(nps)) {
        const rowsByCohort = {};
        nps.forEach(d => {
          (rowsByCohort[d.cohort] = rowsByCohort[d.cohort] || []).push(d);
        });
        Object.entries(rowsByCohort).forEach(([cohort, rows]) => {
          const latestRows = latestWeekRows(rows);
          map[cohort] = {
            latest: combineNps(latestRows),
            latestResponses: totalResponses(latestRows),
            allTime: combineNps(rows),
            totalResponses: totalResponses(rows),
          };
        });
      }
      setNpsMap(map);
    }).finally(() => setLoading(false));
  }, [token, programSlug]);

  // Find the selected cohort in comparison data
  const cohortRow = useMemo(() => {
    if (!compData || !selectedCohortId) return null;
    const all = [...(compData.active || []), ...(compData.completed || [])];
    return all.find(c => c.cohort_id === selectedCohortId) || null;
  }, [compData, selectedCohortId]);

  const nps = useMemo(() => {
    if (!selectedCohort?.name) return { latest: null, allTime: null, latestResponses: 0, totalResponses: 0 };
    return npsMap[selectedCohort.name] || { latest: null, allTime: null, latestResponses: 0, totalResponses: 0 };
  }, [npsMap, selectedCohort]);

  // Completed cohorts only have all_time data — force that mode
  const isCompleted = cohortRow && !cohortRow.is_active;
  const effectiveMode = isCompleted ? 'all_time' : mode;

  // Auto-switch to all_time when selecting a completed cohort
  useEffect(() => {
    if (isCompleted && mode !== 'all_time') setMode('all_time');
  }, [isCompleted]);

  if (!selectedCohortId) return null;

  const getValue = (metric) => {
    if (!cohortRow) return null;
    const obj = cohortRow[metric];
    if (!obj) return null;
    return effectiveMode === 'last_week' ? obj.current : obj.all_time;
  };

  const npsScore = effectiveMode === 'last_week' ? nps.latest : nps.allTime;
  const npsN = effectiveMode === 'last_week' ? nps.latestResponses : nps.totalResponses;

  const tiles = [
    {
      id: 'enrolled',
      label: 'Enrolled',
      value: cohortRow?.original_enrolled ?? '—',
      sub: null,
      color: 'text-[#1E1E1E]',
      bg: 'bg-white',
    },
    {
      id: 'active',
      label: 'Active',
      value: cohortRow?.enrolled ?? '—',
      sub: null,
      color: 'text-[#4242EA]',
      bg: 'bg-white',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      value: getValue('attendance') != null ? `${getValue('attendance')}%` : '—',
      sub: 'vs 80% target',
      color: getValue('attendance') >= 80 ? 'text-green-600' : getValue('attendance') >= 60 ? 'text-yellow-600' : 'text-red-500',
      bg: 'bg-white',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      value: getValue('task_completion') != null ? `${getValue('task_completion')}%` : '—',
      sub: 'completion',
      color: getValue('task_completion') >= 80 ? 'text-green-600' : getValue('task_completion') >= 60 ? 'text-yellow-600' : 'text-red-500',
      bg: 'bg-white',
    },
    {
      id: 'deliverables',
      label: 'Deliverables',
      value: getValue('deliverables') != null ? `${getValue('deliverables')}%` : '—',
      sub: 'submission',
      color: getValue('deliverables') >= 80 ? 'text-green-600' : getValue('deliverables') >= 60 ? 'text-yellow-600' : 'text-red-500',
      bg: 'bg-white',
    },
    {
      id: 'nps',
      label: 'NPS',
      value: npsScore ?? '—',
      sub: npsN > 0 ? `n=${npsN}` : null,
      color: npsScore >= 50 ? 'text-green-600' : npsScore >= 0 ? 'text-yellow-600' : 'text-red-500',
      bg: 'bg-white',
    },
  ];

  return (
    <div className="rounded-lg border border-[#E3E3E3] bg-white p-4 space-y-3">
      {/* Header with toggle — visually contained */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#1E1E1E]">
            {selectedCohort?.name || 'Cohort'}
            {isCompleted && <span className="ml-2 text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Completed</span>}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {effectiveMode === 'last_week' ? 'Last completed curriculum week' : 'All completed curriculum weeks'}
          </p>
        </div>
        {!isCompleted && (
          <div className="flex rounded-md border border-[#E3E3E3] overflow-hidden">
            {[['last_week', 'Last Week'], ['all_time', 'All Time']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setMode(val)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  mode === val ? 'bg-[#4242EA] text-white' : 'bg-white text-slate-500 hover:bg-[#EFEFEF]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {tiles.map(tile => (
          <button
            key={tile.id}
            onClick={() => setDrawerMetric(tile.id)}
            className="rounded-lg border border-[#EFEFEF] bg-[#FAFAFA] p-3.5 text-left hover:border-[#4242EA] hover:shadow-sm transition-all"
          >
            <p className="text-xs text-slate-500 font-medium">{tile.label}</p>
            <p className={`text-2xl font-bold mt-1 ${loading ? 'text-slate-300' : tile.color}`}>
              {loading ? '...' : tile.value}
            </p>
            {tile.sub && <p className="text-[11px] text-slate-400 mt-0.5">{tile.sub}</p>}
          </button>
        ))}
      </div>

      {!loading && !cohortRow && (
        <p className="text-xs text-slate-400 text-center">No comparison data available for this cohort.</p>
      )}

      {drawerMetric && (
        <MetricDetailDrawer
          metric={drawerMetric}
          cohortRow={cohortRow}
          nps={nps}
          mode={effectiveMode}
          cohortName={selectedCohort?.name}
          selectedCohortId={selectedCohortId}
          onClose={() => setDrawerMetric(null)}
        />
      )}
    </div>
  );
};

export default MetricsBar;
