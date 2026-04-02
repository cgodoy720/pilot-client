import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7001';
const LEGACY_API = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api';

// ── helpers ─────────────────────────────────────────────────────────────────

const npsColor  = (n) => n >= 50 ? 'text-green-600' : n >= 0 ? 'text-yellow-600' : 'text-red-500';
const npsBorder = (n) => n >= 50 ? 'border-green-200 bg-green-50' : n >= 0 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50';

const Delta = ({ value }) => {
  if (value == null) return <span className="text-slate-300 text-xs">—</span>;
  if (value === 0)   return <span className="text-slate-400 text-xs">±0</span>;
  const pos = value > 0;
  return (
    <span className={`text-xs font-medium ${pos ? 'text-green-600' : 'text-red-500'}`}>
      {pos ? '+' : ''}{value}
    </span>
  );
};

const MetricCell = ({ value, delta, showDelta, suffix = '%' }) => (
  <div className="flex flex-col items-end gap-0.5">
    <span className="text-sm font-medium text-[#1E1E1E]">
      {value != null ? `${value}${suffix}` : <span className="text-slate-300">—</span>}
    </span>
    {showDelta && <Delta value={delta} />}
  </div>
);

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// ── main component ───────────────────────────────────────────────────────────

const CohortComparisonTab = () => {
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [active, setActive]     = useState([]);
  const [completed, setCompleted] = useState([]);
  const [npsMap, setNpsMap]     = useState({});   // name → { latest, allTime }
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail]     = useState({});   // cohort_id → { withdrawals, absences, quotes }
  const [mode, setMode]         = useState('last_week'); // 'last_week' | 'all_time'

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const today = new Date().toISOString().split('T')[0];
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    Promise.all([
      fetch(`${API_BASE}/api/admin/dashboard/cohort-comparison`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch(`${LEGACY_API}/surveys/nps/weekly-by-cohort?startDate=${sixMonthsAgo}&endDate=${today}&mode=calendar`)
        .then(r => r.json())
        .catch(() => []),
    ]).then(([comparison, nps]) => {
      if (!comparison.success) throw new Error(comparison.error || 'Failed to load');
      setActive(comparison.active || []);
      setCompleted(comparison.completed || []);

      // Build NPS map: name → { latest score, all-time average }
      const map = {};
      if (Array.isArray(nps)) {
        nps.forEach(d => {
          if (!map[d.cohort]) map[d.cohort] = { scores: [], latest: null, latestWeek: -1 };
          map[d.cohort].scores.push(d.nps);
          if (d.program_week > map[d.cohort].latestWeek) {
            map[d.cohort].latest = Math.round(d.nps);
            map[d.cohort].latestWeek = d.program_week;
          }
        });
        Object.values(map).forEach(v => {
          v.allTime = v.scores.length ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length) : null;
          delete v.scores;
          delete v.latestWeek;
        });
      }
      setNpsMap(map);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const toggleRow = async (cohort) => {
    const cid = cohort.cohort_id;
    if (expanded === cid) { setExpanded(null); return; }
    setExpanded(cid);
    if (detail[cid]) return;

    const startDate = cohort.start_date ? cohort.start_date.split('T')[0] : '2024-01-01';
    const today = new Date().toISOString().split('T')[0];

    const [detailRes, responsesRes] = await Promise.all([
      fetch(`${API_BASE}/api/admin/dashboard/cohort-week-detail?cohortId=${cid}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).catch(() => ({ withdrawals: [], absences: null })),
      fetch(`${LEGACY_API}/surveys/responses?startDate=${startDate}&endDate=${today}`)
        .then(r => r.json()).catch(() => []),
    ]);

    const allResponses = Array.isArray(responsesRes) ? responsesRes : [];
    const cohortResponses = allResponses.filter(r =>
      r.cohort === cohort.name ||
      (r.cohort && cohort.name && (
        r.cohort.toLowerCase().includes(cohort.name.toLowerCase().slice(0, 10)) ||
        cohort.name.toLowerCase().includes(r.cohort.toLowerCase().slice(0, 10))
      ))
    );
    const quotes = cohortResponses
      .filter(r => r.what_we_did_well || r.what_to_improve)
      .sort((a, b) => new Date(b.task_date?.value || b.task_date || 0) - new Date(a.task_date?.value || a.task_date || 0))
      .slice(0, 3)
      .map(r => ({
        score: r.referral_likelihood,
        well: r.what_we_did_well || null,
        improve: r.what_to_improve || null,
        date: r.task_date?.value || r.task_date || null,
      }));

    setDetail(prev => ({
      ...prev,
      [cid]: {
        withdrawals: detailRes.withdrawals || [],
        absences: detailRes.absences || null,
        quotes,
      },
    }));
  };

  const getNps = (cohortName) => {
    const entry = npsMap[cohortName] || Object.entries(npsMap).find(([k]) =>
      k.toLowerCase().includes(cohortName.toLowerCase().slice(0, 10)) ||
      cohortName.toLowerCase().includes(k.toLowerCase().slice(0, 10))
    )?.[1];
    if (!entry) return { latest: null, allTime: null };
    return entry;
  };

  if (loading) return <div className="bg-white rounded-lg border border-[#E3E3E3] p-8 text-center text-slate-400 text-sm">Loading cohort data...</div>;
  if (error)   return <div className="bg-white rounded-lg border border-[#E3E3E3] p-8 text-center text-red-500 text-sm">{error}</div>;
  if (!active.length && !completed.length) return <div className="bg-white rounded-lg border border-[#E3E3E3] p-8 text-center text-slate-400 text-sm">No cohort data available.</div>;

  return (
    <div className="space-y-4">
      {/* toggle */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-md border border-[#E3E3E3] overflow-hidden">
          {[['last_week', 'Last Week'], ['all_time', 'All Time']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setMode(val)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                mode === val
                  ? 'bg-[#4242EA] text-white'
                  : 'bg-white text-slate-500 hover:bg-[#EFEFEF]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          {mode === 'last_week' ? 'Metrics reflect the last fully completed curriculum week' : 'Metrics averaged across all completed curriculum weeks'}
        </span>
      </div>

      <CohortTable title="Active"     cohorts={active}    getNps={getNps} expanded={expanded} detail={detail} onToggle={toggleRow} mode={mode} />
      {completed.length > 0 && (
        <CohortTable title="Completed" cohorts={completed} getNps={getNps} expanded={expanded} detail={detail} onToggle={toggleRow} mode={mode} />
      )}
    </div>
  );
};

// ── table ────────────────────────────────────────────────────────────────────

const COLS = 'grid-cols-[1fr_80px_80px_80px_120px_120px_100px]';

const CohortTable = ({ title, cohorts, getNps, expanded, detail, onToggle, mode }) => {
  if (!cohorts.length) return null;
  const showDelta = mode === 'last_week';

  return (
    <div className="bg-white rounded-lg border border-[#E3E3E3] overflow-hidden">
      <div className="px-6 py-3 bg-[#FAFAFA] border-b border-[#E3E3E3] flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <span className="text-xs text-slate-400">{cohorts.length}</span>
      </div>

      <div className={`grid ${COLS} items-center px-6 py-2 border-b border-[#E3E3E3] text-[11px] font-medium uppercase tracking-wide text-slate-400`}>
        <span>Cohort</span>
        <span className="text-right">{mode === 'last_week' ? 'Week' : 'Wks Done'}</span>
        <span className="text-right">Original</span>
        <span className="text-right">Active</span>
        <span className="text-right">Attendance</span>
        <span className="text-right">Submissions</span>
        <span className="text-right">NPS</span>
      </div>

      {cohorts.map((c) => {
        const isExpanded = expanded === c.cohort_id;
        const nps = getNps(c.name);
        const npsScore = mode === 'last_week' ? nps.latest : nps.allTime;
        const rowDetail = detail[c.cohort_id];

        const attendance    = mode === 'last_week' ? c.attendance.current    : c.attendance.all_time;
        const attDelta      = mode === 'last_week' ? c.attendance.change      : null;
        const submissions   = mode === 'last_week' ? c.submission_rate.current : c.submission_rate.all_time;
        const subDelta      = mode === 'last_week' ? c.submission_rate.change  : null;

        return (
          <React.Fragment key={c.cohort_id}>
            <button
              className={`w-full grid ${COLS} items-center px-6 py-3.5 border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] transition-colors text-left`}
              onClick={() => onToggle(c)}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-[#1E1E1E] truncate">{c.name}</span>
                <span className="text-xs text-slate-400">{formatDate(c.start_date)}</span>
              </div>

              <div className="text-right">
                <span className="text-sm text-slate-500">
                  {mode === 'last_week'
                    ? (c.current_week != null ? `Wk ${c.current_week}` : '—')
                    : (c.completed_weeks != null ? c.completed_weeks : '—')}
                </span>
              </div>

              <div className="text-right">
                <span className="text-sm text-slate-500">{c.original_enrolled ?? '—'}</span>
              </div>

              <div className="text-right">
                <span className="text-sm font-medium text-[#1E1E1E]">{c.enrolled}</span>
              </div>

              <div className="flex justify-end">
                <MetricCell value={attendance} delta={attDelta} showDelta={showDelta} />
              </div>

              <div className="flex justify-end">
                <MetricCell value={submissions} delta={subDelta} showDelta={showDelta} />
              </div>

              <div className="flex justify-end">
                {npsScore != null
                  ? <span className={`text-sm font-semibold ${npsColor(npsScore)}`}>{npsScore}</span>
                  : <span className="text-slate-300 text-sm">—</span>}
              </div>
            </button>

            {isExpanded && <ExpandedRow cohort={c} detail={rowDetail} nps={nps} mode={mode} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── expanded row ──────────────────────────────────────────────────────────────

const ExpandedRow = ({ cohort, detail, nps, mode }) => {
  const loading = !detail;
  const npsScore = mode === 'last_week' ? nps.latest : nps.allTime;

  return (
    <div className="bg-[#FAFAFA] border-b border-[#E3E3E3] px-6 py-4 space-y-4">

      <div className="grid grid-cols-3 gap-6">

        {/* withdrawals */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Recent Withdrawals (14 days)</p>
          {loading ? (
            <p className="text-xs text-slate-400">Loading...</p>
          ) : detail.withdrawals.length === 0 ? (
            <p className="text-xs text-slate-400">None</p>
          ) : (
            <ul className="space-y-1">
              {detail.withdrawals.map((w) => (
                <li key={w.user_id} className="flex items-center justify-between text-sm text-[#1E1E1E]">
                  <span>{w.name}</span>
                  <span className="text-xs text-slate-400 ml-4">
                    {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* last week absences */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Last Week Absences</p>
          {loading ? (
            <p className="text-xs text-slate-400">Loading...</p>
          ) : detail.absences == null ? (
            <p className="text-xs text-slate-400">No data</p>
          ) : (
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 w-20">Excused</span>
                <span className="font-medium text-[#1E1E1E]">{detail.absences.excused ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 w-20">Unexcused</span>
                <span className="font-medium text-[#1E1E1E]">{detail.absences.unexcused ?? 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* NPS */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            NPS ({mode === 'last_week' ? 'latest' : 'all time avg'})
          </p>
          {npsScore != null ? (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-semibold ${npsBorder(npsScore)} ${npsColor(npsScore)}`}>
              {npsScore}
              <span className="font-normal text-slate-500 text-xs">
                {npsScore >= 50 ? 'Promoter majority' : npsScore >= 0 ? 'Neutral' : 'Detractor majority'}
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No NPS data</p>
          )}
        </div>

      </div>

      {/* NPS response highlights */}
      {!loading && detail.quotes?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Recent Responses</p>
          <div className="space-y-2">
            {detail.quotes.map((q, i) => {
              const isPromoter  = q.score >= 9;
              const isDetractor = q.score <= 6;
              const scoreColor  = isPromoter ? 'text-green-600 bg-green-50 border-green-200'
                : isDetractor ? 'text-red-500 bg-red-50 border-red-200'
                : 'text-yellow-600 bg-yellow-50 border-yellow-200';
              return (
                <div key={i} className="bg-white border border-[#E3E3E3] rounded px-3 py-2.5 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded border font-semibold text-[10px] ${scoreColor}`}>{q.score}/10</span>
                    {q.date && <span className="text-slate-400">{new Date(q.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                  </div>
                  {q.well    && <p className="text-slate-600"><span className="font-medium text-slate-500">Well: </span>{q.well}</p>}
                  {q.improve && <p className="text-slate-600"><span className="font-medium text-slate-500">Improve: </span>{q.improve}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!loading && detail.quotes?.length === 0 && (
        <p className="text-xs text-slate-400">No survey responses found for this cohort.</p>
      )}

      {/* metric context */}
      <div className="flex gap-6 text-xs text-slate-500">
        {cohort.attendance.previous != null && <span>Attendance prev week: <strong>{cohort.attendance.previous}%</strong></span>}
        {cohort.submission_rate.previous != null && <span>Submissions prev week: <strong>{cohort.submission_rate.previous}%</strong></span>}
        {cohort.current_week != null && <span>Currently on Week <strong>{cohort.current_week}</strong></span>}
      </div>

    </div>
  );
};

export default CohortComparisonTab;
