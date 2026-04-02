import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../../stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7001';
const LEGACY_API = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api';

// ── helpers ─────────────────────────────────────────────────────────────────

const npsColor   = (n) => n >= 50 ? 'text-green-600' : n >= 0 ? 'text-yellow-600' : 'text-red-500';
const npsBorder  = (n) => n >= 50 ? 'border-green-200 bg-green-50' : n >= 0 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50';

const Delta = ({ value }) => {
  if (value == null) return <span className="text-slate-300">—</span>;
  if (value === 0)   return <span className="text-slate-400 text-xs">±0</span>;
  const pos = value > 0;
  return (
    <span className={`text-xs font-medium ${pos ? 'text-green-600' : 'text-red-500'}`}>
      {pos ? '+' : ''}{value}
    </span>
  );
};

const MetricCell = ({ value, delta, suffix = '%' }) => (
  <div className="flex flex-col items-end gap-0.5">
    <span className="text-sm font-medium text-[#1E1E1E]">
      {value != null ? `${value}${suffix}` : <span className="text-slate-300">—</span>}
    </span>
    <Delta value={delta} />
  </div>
);

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

// ── main component ───────────────────────────────────────────────────────────

const CohortComparisonTab = () => {
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [active, setActive]       = useState([]);
  const [completed, setCompleted] = useState([]);
  const [npsMap, setNpsMap]       = useState({});   // cohort name → latest NPS
  const [expanded, setExpanded]   = useState(null); // cohort_id or null
  const [detail, setDetail]       = useState({});   // cohort_id → { withdrawals, quotes }

  // ── fetch cohort metrics ──────────────────────────────────────────────────

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
      if (!comparison.success) throw new Error(comparison.error || 'Failed to load comparison data');
      setActive(comparison.active || []);
      setCompleted(comparison.completed || []);

      // Build NPS map: cohort name → most recent NPS score
      const map = {};
      if (Array.isArray(nps)) {
        nps.forEach(d => {
          if (!map[d.cohort] || d.program_week > map[d.cohort].week) {
            map[d.cohort] = { score: Math.round(d.nps), week: d.program_week };
          }
        });
      }
      setNpsMap(map);
    }).catch(err => {
      setError(err.message);
    }).finally(() => setLoading(false));
  }, [token]);

  // ── expand / collapse row ─────────────────────────────────────────────────

  const toggleRow = async (cohort) => {
    const cid = cohort.cohort_id;
    if (expanded === cid) {
      setExpanded(null);
      return;
    }
    setExpanded(cid);

    if (detail[cid]) return; // already fetched

    // Fetch withdrawals + NPS responses in parallel
    const startDate = cohort.start_date
      ? cohort.start_date.split('T')[0]
      : '2024-01-01';
    const today = new Date().toISOString().split('T')[0];

    try {
      const [detailRes, responsesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/dashboard/cohort-week-detail?cohortId=${cid}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()),
        fetch(`${LEGACY_API}/surveys/responses?startDate=${startDate}&endDate=${today}`)
          .then(r => r.json())
          .catch(() => []),
      ]);

      // Filter responses to this cohort (exact or partial name match)
      const allResponses = Array.isArray(responsesRes) ? responsesRes : [];
      const cohortResponses = allResponses.filter(r =>
        r.cohort === cohort.name ||
        (r.cohort && cohort.name &&
          (r.cohort.toLowerCase().includes(cohort.name.toLowerCase().slice(0, 10)) ||
           cohort.name.toLowerCase().includes(r.cohort.toLowerCase().slice(0, 10))))
      );

      // Sort newest first, take up to 3 with any text
      const quotes = cohortResponses
        .filter(r => r.what_we_did_well || r.what_to_improve)
        .sort((a, b) => {
          const da = new Date(a.task_date?.value || a.task_date || 0);
          const db = new Date(b.task_date?.value || b.task_date || 0);
          return db - da;
        })
        .slice(0, 3)
        .map(r => ({
          score: r.referral_likelihood,
          well: r.what_we_did_well || null,
          improve: r.what_to_improve || null,
          date: r.task_date?.value || r.task_date || null,
        }));

      setDetail(prev => ({
        ...prev,
        [cid]: { withdrawals: detailRes.withdrawals || [], quotes },
      }));
    } catch {
      setDetail(prev => ({ ...prev, [cid]: { withdrawals: [], quotes: [] } }));
    }
  };

  // ── NPS lookup with fuzzy name match ─────────────────────────────────────

  const getNps = (cohortName) => {
    if (npsMap[cohortName]) return npsMap[cohortName].score;
    // Try partial match
    const key = Object.keys(npsMap).find(k =>
      k.toLowerCase().includes(cohortName.toLowerCase().slice(0, 10)) ||
      cohortName.toLowerCase().includes(k.toLowerCase().slice(0, 10))
    );
    return key ? npsMap[key].score : null;
  };

  // ── render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#E3E3E3] p-8 text-center text-slate-400 text-sm">
        Loading cohort data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-[#E3E3E3] p-8 text-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  const totalCohorts = active.length + completed.length;
  if (totalCohorts === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#E3E3E3] p-8 text-center text-slate-400 text-sm">
        No cohort data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CohortTable
        title="Active"
        cohorts={active}
        getNps={getNps}
        expanded={expanded}
        detail={detail}
        onToggle={toggleRow}
      />
      {completed.length > 0 && (
        <CohortTable
          title="Completed"
          cohorts={completed}
          getNps={getNps}
          expanded={expanded}
          detail={detail}
          onToggle={toggleRow}
        />
      )}
    </div>
  );
};

// ── table sub-component ───────────────────────────────────────────────────────

const CohortTable = ({ title, cohorts, getNps, expanded, detail, onToggle }) => {
  if (cohorts.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-[#E3E3E3] overflow-hidden">
      {/* section label */}
      <div className="px-6 py-3 bg-[#FAFAFA] border-b border-[#E3E3E3] flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <span className="text-xs text-slate-400">{cohorts.length}</span>
      </div>

      {/* header */}
      <div className="grid grid-cols-[1fr_80px_80px_80px_120px_120px_100px] items-center px-6 py-2 border-b border-[#E3E3E3] text-[11px] font-medium uppercase tracking-wide text-slate-400">
        <span>Cohort</span>
        <span className="text-right">Week</span>
        <span className="text-right">Original</span>
        <span className="text-right">Active</span>
        <span className="text-right">Attendance</span>
        <span className="text-right">Submissions</span>
        <span className="text-right">NPS</span>
      </div>

      {/* rows */}
      {cohorts.map((c) => {
        const isExpanded = expanded === c.cohort_id;
        const nps = getNps(c.name);
        const rowDetail = detail[c.cohort_id];

        return (
          <React.Fragment key={c.cohort_id}>
            <button
              className="w-full grid grid-cols-[1fr_80px_80px_80px_120px_120px_100px] items-center px-6 py-3.5 border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] transition-colors text-left cursor-pointer"
              onClick={() => onToggle(c)}
            >
              {/* name + date */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-[#1E1E1E] truncate">{c.name}</span>
                <span className="text-xs text-slate-400">{formatDate(c.start_date)}</span>
              </div>

              {/* current week */}
              <div className="text-right">
                <span className="text-sm text-slate-500">
                  {c.current_week != null ? `Wk ${c.current_week}` : '—'}
                </span>
              </div>

              {/* original enrolled */}
              <div className="text-right">
                <span className="text-sm text-slate-500">{c.original_enrolled}</span>
              </div>

              {/* active builders */}
              <div className="text-right">
                <span className="text-sm font-medium text-[#1E1E1E]">{c.enrolled}</span>
              </div>

              {/* attendance */}
              <div className="flex justify-end">
                <MetricCell value={c.attendance.current} delta={c.attendance.change} />
              </div>

              {/* submission rate */}
              <div className="flex justify-end">
                <MetricCell value={c.submission_rate.current} delta={c.submission_rate.change} />
              </div>

              {/* NPS */}
              <div className="flex justify-end">
                {nps != null ? (
                  <span className={`text-sm font-semibold ${npsColor(nps)}`}>{nps}</span>
                ) : (
                  <span className="text-slate-300 text-sm">—</span>
                )}
              </div>
            </button>

            {/* inline expand */}
            {isExpanded && (
              <ExpandedRow cohort={c} detail={rowDetail} nps={nps} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── expanded row ──────────────────────────────────────────────────────────────

const ExpandedRow = ({ cohort, detail, nps }) => {
  const loading = !detail;

  return (
    <div className="bg-[#FAFAFA] border-b border-[#E3E3E3] px-6 py-4 space-y-4">

      {/* top row: withdrawals + NPS score */}
      <div className="grid grid-cols-2 gap-6 max-w-2xl">

        {/* withdrawals */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Recent Withdrawals (14 days)
          </p>
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

        {/* NPS score */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            NPS (latest)
          </p>
          {nps != null ? (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-semibold ${npsBorder(nps)} ${npsColor(nps)}`}>
              {nps}
              <span className="font-normal text-slate-500 text-xs">
                {nps >= 50 ? 'Promoter majority' : nps >= 0 ? 'Neutral' : 'Detractor majority'}
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No NPS data</p>
          )}
        </div>

      </div>

      {/* NPS response highlights */}
      {loading ? (
        <p className="text-xs text-slate-400">Loading responses...</p>
      ) : detail.quotes && detail.quotes.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Recent Responses
          </p>
          <div className="space-y-2">
            {detail.quotes.map((q, i) => {
              const isPromoter = q.score >= 9;
              const isDetractor = q.score <= 6;
              const scoreColor = isPromoter ? 'text-green-600 bg-green-50 border-green-200'
                : isDetractor ? 'text-red-500 bg-red-50 border-red-200'
                : 'text-yellow-600 bg-yellow-50 border-yellow-200';
              return (
                <div key={i} className="bg-white border border-[#E3E3E3] rounded px-3 py-2.5 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded border font-semibold text-[10px] ${scoreColor}`}>
                      {q.score}/10
                    </span>
                    {q.date && (
                      <span className="text-slate-400">
                        {new Date(q.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {q.well && (
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-500">Well: </span>{q.well}
                    </p>
                  )}
                  {q.improve && (
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-500">Improve: </span>{q.improve}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : detail.quotes && detail.quotes.length === 0 ? (
        <p className="text-xs text-slate-400">No survey responses found for this cohort.</p>
      ) : null}

      {/* metric context */}
      <div className="flex gap-6 text-xs text-slate-500">
        {cohort.attendance.previous != null && (
          <span>Attendance prev week: <strong>{cohort.attendance.previous}%</strong></span>
        )}
        {cohort.submission_rate.previous != null && (
          <span>Submissions prev week: <strong>{cohort.submission_rate.previous}%</strong></span>
        )}
        {cohort.current_week != null && (
          <span>Currently on Week <strong>{cohort.current_week}</strong></span>
        )}
      </div>
    </div>
  );
};

export default CohortComparisonTab;
