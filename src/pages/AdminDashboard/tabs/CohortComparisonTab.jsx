import React, { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';

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

const scoreColor = (s) => s >= 9 ? 'text-green-600' : s <= 6 ? 'text-red-500' : 'text-yellow-600';
const scoreBg    = (s) => s >= 9 ? 'bg-green-50 border-green-200' : s <= 6 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';

// ── tooltip ─────────────────────────────────────────────────────────────────

const Tip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute z-50 top-full right-0 mt-1.5 w-52 px-2.5 py-1.5 rounded bg-[#1E1E1E] text-white text-[11px] leading-snug font-normal normal-case tracking-normal shadow-lg pointer-events-none whitespace-normal">
          {text}
        </span>
      )}
    </span>
  );
};

// ── main component ───────────────────────────────────────────────────────────

const CohortComparisonTab = ({ programSlug = 'ai-native-builder' }) => {
  const token = useAuthStore((s) => s.token);

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [active, setActive]     = useState([]);
  const [completed, setCompleted] = useState([]);
  const [npsMap, setNpsMap]     = useState({});
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail]     = useState({});
  const [mode, setMode]         = useState('last_week');
  const [drawerData, setDrawerData] = useState(null);
  const [courseFilter, setCourseFilter] = useState('all');

  // Clear cached detail when programSlug changes
  useEffect(() => { setDetail({}); setExpanded(null); setCourseFilter('all'); }, [programSlug]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const today = new Date().toISOString().split('T')[0];
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    Promise.all([
      fetch(`${API_BASE}/api/admin/dashboard/cohort-comparison?programSlug=${programSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch(`${LEGACY_API}/surveys/nps/weekly-by-cohort?startDate=${sixMonthsAgo}&endDate=${today}&mode=calendar`)
        .then(r => r.json())
        .catch(() => []),
    ]).then(([comparison, nps]) => {
      if (!comparison.success) throw new Error(comparison.error || 'Failed to load');
      setActive(comparison.active || []);
      setCompleted(comparison.completed || []);

      const map = {};
      if (Array.isArray(nps)) {
        nps.forEach(d => {
          if (!map[d.cohort]) map[d.cohort] = {
            scores: [], latest: null, latestWeek: -1,
            responseCounts: [], latestResponses: 0,
            latestWeekStart: null, latestWeekEnd: null,
          };
          map[d.cohort].scores.push(d.nps);
          map[d.cohort].responseCounts.push(d.total_responses || 0);
          if (d.program_week > map[d.cohort].latestWeek) {
            map[d.cohort].latest = Math.round(d.nps);
            map[d.cohort].latestWeek = d.program_week;
            map[d.cohort].latestResponses = d.total_responses || 0;
            map[d.cohort].latestWeekStart = d.week_start?.value || null;
            map[d.cohort].latestWeekEnd = d.week_end?.value || null;
          }
        });
        Object.values(map).forEach(v => {
          v.allTime = v.scores.length ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length) : null;
          v.totalResponses = v.responseCounts.reduce((a, b) => a + b, 0);
          delete v.scores;
          delete v.latestWeek;
          delete v.responseCounts;
        });
      }
      setNpsMap(map);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, programSlug]);

  const toggleRow = useCallback(async (cohort, rowMode, npsWeekStart, npsWeekEnd) => {
    const cid = cohort.cohort_id;
    if (expanded === cid) { setExpanded(null); return; }
    setExpanded(cid);

    const cacheKey = `${cid}_${rowMode}`;
    if (detail[cacheKey]) return;

    const today = new Date().toISOString().split('T')[0];
    // Use exact NPS week dates when available, otherwise cohort start → today
    const surveyStart = (rowMode === 'last_week' && npsWeekStart) ? npsWeekStart : (cohort.start_date ? cohort.start_date.split('T')[0] : '2024-01-01');
    const surveyEnd = (rowMode === 'last_week' && npsWeekEnd) ? npsWeekEnd : today;

    const [detailRes, responsesRes] = await Promise.all([
      fetch(`${API_BASE}/api/admin/dashboard/cohort-week-detail?cohortId=${cid}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).catch(() => ({ withdrawals: [], absences: null })),
      fetch(`${LEGACY_API}/surveys/responses?startDate=${surveyStart}&endDate=${surveyEnd}`)
        .then(r => r.json()).catch(() => []),
    ]);

    const allResponses = Array.isArray(responsesRes) ? responsesRes : [];
    let cohortResponses = allResponses.filter(r => r.cohort === cohort.name);

    const withFeedback = cohortResponses.filter(r => r.what_we_did_well || r.what_to_improve);
    const scores = cohortResponses.map(r => r.referral_likelihood).filter(s => s != null);
    const promoters = scores.filter(s => s >= 9);
    const detractors = scores.filter(s => s <= 6);

    const allQuotes = withFeedback
      .sort((a, b) => new Date(b.task_date?.value || b.task_date || 0) - new Date(a.task_date?.value || a.task_date || 0))
      .map(r => ({
        score: r.referral_likelihood,
        name: r.user_name || null,
        well: r.what_we_did_well || null,
        improve: r.what_to_improve || null,
        date: r.task_date?.value || r.task_date || null,
      }));

    // Show everything immediately — AI themes load async below
    setDetail(prev => ({
      ...prev,
      [cacheKey]: {
        withdrawals: detailRes.withdrawals || [],
        absences: detailRes.absences || null,
        cohortName: cohort.name,
        insights: {
          totalResponses: cohortResponses.length,
          feedbackCount: withFeedback.length,
          avgScore: scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null,
          promoterCount: promoters.length,
          detractorCount: detractors.length,
          passiveCount: scores.length - promoters.length - detractors.length,
          concerns: null, // loading
          strengths: null, // loading
          allQuotes,
          isLastWeek: rowMode === 'last_week',
        },
      },
    }));

    // Fire AI summarization in the background — updates in place when done
    const improveTexts = cohortResponses.filter(r => r.what_to_improve).map(r => r.what_to_improve);
    const praiseTexts = cohortResponses.filter(r => r.what_we_did_well && r.referral_likelihood >= 9).map(r => r.what_we_did_well);
    if (improveTexts.length > 0 || praiseTexts.length > 0) {
      fetch(`${API_BASE}/api/admin/dashboard/survey-insights`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ improve: improveTexts, praise: praiseTexts }),
      }).then(r => r.json()).then(aiRes => {
        setDetail(prev => {
          const existing = prev[cacheKey];
          if (!existing) return prev;
          return { ...prev, [cacheKey]: { ...existing, insights: { ...existing.insights, concerns: aiRes.concerns || [], strengths: aiRes.strengths || [] } } };
        });
      }).catch(() => {
        setDetail(prev => {
          const existing = prev[cacheKey];
          if (!existing) return prev;
          return { ...prev, [cacheKey]: { ...existing, insights: { ...existing.insights, concerns: [], strengths: [] } } };
        });
      });
    } else {
      setDetail(prev => {
        const existing = prev[cacheKey];
        if (!existing) return prev;
        return { ...prev, [cacheKey]: { ...existing, insights: { ...existing.insights, concerns: [], strengths: [] } } };
      });
    }
  }, [expanded, detail, token]);

  const getNps = (cohortName) => {
    const entry = npsMap[cohortName];
    if (!entry) return { latest: null, allTime: null, totalResponses: 0, latestResponses: 0, latestWeekStart: null, latestWeekEnd: null };
    return entry;
  };

  if (loading) return <div className="bg-white rounded-lg border border-[#E3E3E3] p-8 text-center text-slate-400 text-sm">Loading cohort data...</div>;
  if (error)   return <div className="bg-white rounded-lg border border-[#E3E3E3] p-8 text-center text-red-500 text-sm">{error}</div>;
  if (!active.length && !completed.length) return <div className="bg-white rounded-lg border border-[#E3E3E3] p-8 text-center text-slate-400 text-sm">No cohort data available.</div>;

  // Derive available courses from data
  const allCohorts = [...active, ...completed];
  const courses = [...new Set(allCohorts.map(c => c.level).filter(Boolean))].sort();
  const filterFn = (c) => courseFilter === 'all' || c.level === courseFilter;
  const filteredActive = active.filter(filterFn);
  const filteredCompleted = completed.filter(filterFn);

  return (
    <div className="space-y-4">
      {/* Course filter */}
      {courses.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Course</span>
          <div className="flex rounded-md border border-[#E3E3E3] overflow-hidden">
            <button
              onClick={() => setCourseFilter('all')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                courseFilter === 'all' ? 'bg-[#4242EA] text-white' : 'bg-white text-slate-500 hover:bg-[#EFEFEF]'
              }`}
            >
              All
            </button>
            {courses.map(level => (
              <button
                key={level}
                onClick={() => setCourseFilter(level)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  courseFilter === level ? 'bg-[#4242EA] text-white' : 'bg-white text-slate-500 hover:bg-[#EFEFEF]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

      <CohortTable title="Active" cohorts={filteredActive} getNps={getNps} expanded={expanded} detail={detail} onToggle={toggleRow} mode={mode} onModeChange={setMode} onOpenDrawer={setDrawerData} />
      {filteredCompleted.length > 0 && (
        <CohortTable title="Completed" cohorts={filteredCompleted} getNps={getNps} expanded={expanded} detail={detail} onToggle={toggleRow} mode="all_time" onOpenDrawer={setDrawerData} />
      )}

      {/* Quotes drawer */}
      <Sheet open={!!drawerData} onOpenChange={(open) => { if (!open) setDrawerData(null); }}>
        <SheetContent side="right" className="w-[500px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base font-semibold text-[#1E1E1E]">
              {drawerData?.title || 'Survey Responses'}
            </SheetTitle>
            <p className="text-xs text-slate-400">{drawerData?.quotes?.length || 0} responses with feedback</p>
          </SheetHeader>
          <div className="mt-4 space-y-0">
            {drawerData?.quotes?.map((q, i) => (
              <div key={i} className="py-3 border-b border-[#F0F0F0] last:border-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {q.score != null && (
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${scoreBg(q.score)} ${scoreColor(q.score)}`}>
                      {q.score}/10
                    </span>
                  )}
                  {q.name && <span className="text-xs font-medium text-[#1E1E1E]">{q.name}</span>}
                  {q.date && (
                    <span className="text-[11px] text-slate-400">
                      {new Date(q.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                {q.well && (
                  <p className="text-xs text-slate-600 mb-1">
                    <span className="font-medium text-green-600">Did well: </span>{q.well}
                  </p>
                )}
                {q.improve && (
                  <p className="text-xs text-slate-600">
                    <span className="font-medium text-red-500">Improve: </span>{q.improve}
                  </p>
                )}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// ── table ────────────────────────────────────────────────────────────────────

const COLS = 'grid-cols-[1fr_70px_80px_85px_100px_80px_110px_70px]';

const TOOLTIPS = {
  week_lw: 'Last fully completed curriculum week number',
  week_at: 'Total number of fully completed curriculum weeks',
  enrolled: 'Total builders ever enrolled, including withdrawn',
  active: 'Builders currently enrolled and active',
  completed: 'Builders still active at program end',
  attendance: 'Avg daily attendance among active builders. Late counts as present.',
  tasks: 'Completion rate for question-based tasks. Only counts builders present that day.',
  deliverables: 'Submission rate for document, video, and link deliverables. Only counts builders present that day.',
  nps: 'Net Promoter Score (−100 to +100). n = weekly survey responses.',
};

const CohortTable = ({ title, cohorts, getNps, expanded, detail, onToggle, mode, onModeChange, onOpenDrawer }) => {
  if (!cohorts.length) return null;
  const showDelta = mode === 'last_week';
  const isActive = title === 'Active';
  const countLabel = isActive ? 'Active' : 'Completed';

  return (
    <div className="bg-white rounded-lg border border-[#E3E3E3] overflow-hidden">
      <div className="px-6 py-3 bg-[#FAFAFA] border-b border-[#E3E3E3] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
          <span className="text-xs text-slate-400">{cohorts.length}</span>
        </div>
        {onModeChange && (
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">
              {mode === 'last_week' ? 'Last completed curriculum week' : 'All completed curriculum weeks'}
            </span>
            <div className="flex rounded-md border border-[#E3E3E3] overflow-hidden w-[170px]">
              {[['last_week', 'Last Week'], ['all_time', 'All Time']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => onModeChange(val)}
                  className={`flex-1 py-1 text-xs font-medium transition-colors ${
                    mode === val
                      ? 'bg-[#4242EA] text-white'
                      : 'bg-white text-slate-500 hover:bg-[#EFEFEF]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={`grid ${COLS} items-center px-6 py-2 border-b border-[#E3E3E3] text-[11px] font-medium uppercase tracking-wide text-slate-400`}>
        <span>Cohort</span>
        <span className="text-right"><Tip text={mode === 'last_week' ? TOOLTIPS.week_lw : TOOLTIPS.week_at}>{mode === 'last_week' ? 'Week' : 'Wks Done'}</Tip></span>
        <span className="text-right"><Tip text={TOOLTIPS.enrolled}>Enrolled</Tip></span>
        <span className="text-right"><Tip text={isActive ? TOOLTIPS.active : TOOLTIPS.completed}>{countLabel}</Tip></span>
        <span className="text-right"><Tip text={TOOLTIPS.attendance}>Attendance</Tip></span>
        <span className="text-right"><Tip text={TOOLTIPS.tasks}>Tasks</Tip></span>
        <span className="text-right"><Tip text={TOOLTIPS.deliverables}>Deliverables</Tip></span>
        <span className="text-right"><Tip text={TOOLTIPS.nps}>NPS</Tip></span>
      </div>

      {cohorts.map((c) => {
        const isExpanded = expanded === c.cohort_id;
        const nps = getNps(c.name);
        const npsScore = mode === 'last_week' ? nps.latest : nps.allTime;
        const npsN = mode === 'last_week' ? nps.latestResponses : nps.totalResponses;
        const rowDetail = detail[`${c.cohort_id}_${mode}`];

        const attendance    = mode === 'last_week' ? c.attendance.current       : c.attendance.all_time;
        const attDelta      = mode === 'last_week' ? c.attendance.change        : null;
        const taskCompl     = mode === 'last_week' ? c.task_completion.current  : c.task_completion.all_time;
        const taskDelta     = mode === 'last_week' ? c.task_completion.change   : null;
        const deliverable   = mode === 'last_week' ? c.deliverables.current     : c.deliverables.all_time;
        const delivDelta    = mode === 'last_week' ? c.deliverables.change      : null;

        return (
          <React.Fragment key={c.cohort_id}>
            <button
              className={`w-full grid ${COLS} items-center px-6 py-3.5 border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] transition-colors text-left`}
              onClick={() => onToggle(c, mode, nps.latestWeekStart, nps.latestWeekEnd)}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-[#1E1E1E] truncate">{c.name}</span>
                <span className="text-xs text-slate-400">{formatDate(c.start_date)}</span>
              </div>
              <div className="text-right"><span className="text-sm text-slate-500">{mode === 'last_week' ? (c.current_week != null ? `Wk ${c.current_week}` : '—') : (c.completed_weeks != null ? c.completed_weeks : '—')}</span></div>
              <div className="text-right"><span className="text-sm text-slate-500">{c.original_enrolled ?? '—'}</span></div>
              <div className="text-right"><span className="text-sm font-medium text-[#1E1E1E]">{c.enrolled}</span></div>
              <div className="flex justify-end"><MetricCell value={attendance} delta={attDelta} showDelta={showDelta} /></div>
              <div className="flex justify-end"><MetricCell value={taskCompl} delta={taskDelta} showDelta={showDelta} /></div>
              <div className="flex justify-end"><MetricCell value={deliverable} delta={delivDelta} showDelta={showDelta} /></div>
              <div className="flex flex-col items-end gap-0.5">
                {npsScore != null
                  ? <>
                      <span className={`text-sm font-semibold ${npsColor(npsScore)}`}>{npsScore}</span>
                      {npsN > 0 && <span className="text-[10px] text-slate-400">n={npsN}</span>}
                    </>
                  : <span className="text-slate-300 text-sm">—</span>}
              </div>
            </button>
            {isExpanded && <ExpandedRow cohort={c} detail={rowDetail} nps={nps} mode={mode} onOpenDrawer={onOpenDrawer} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── expanded row ──────────────────────────────────────────────────────────────

const ExpandedRow = ({ cohort, detail, nps, mode, onOpenDrawer }) => {
  const loading = !detail;
  const npsScore = mode === 'last_week' ? nps.latest : nps.allTime;
  const insights = detail?.insights;

  const openQuotes = () => {
    if (!insights?.allQuotes?.length) return;
    const period = insights.isLastWeek ? 'Last Week' : 'All-Time';
    onOpenDrawer({
      title: `${detail.cohortName} — ${period} Survey Responses`,
      quotes: insights.allQuotes,
    });
  };

  return (
    <div className="bg-[#FAFAFA] border-b border-[#E3E3E3] px-6 py-4 space-y-4">

      <div className="grid grid-cols-3 gap-6">
        {/* withdrawals */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Recent Withdrawals (14 days)</p>
          {loading ? <p className="text-xs text-slate-400">Loading...</p>
           : detail.withdrawals.length === 0 ? <p className="text-xs text-slate-400">None</p>
           : <ul className="space-y-1">{detail.withdrawals.map((w) => (
              <li key={w.user_id} className="flex items-center justify-between text-sm text-[#1E1E1E]">
                <span>{w.name}</span>
                <span className="text-xs text-slate-400 ml-4">{new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </li>
            ))}</ul>}
        </div>

        {/* absences */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Last Week Absences</p>
          {loading ? <p className="text-xs text-slate-400">Loading...</p>
           : detail.absences == null ? <p className="text-xs text-slate-400">No data</p>
           : <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><span className="text-slate-500 w-20">Excused</span><span className="font-medium text-[#1E1E1E]">{detail.absences.excused ?? 0}</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-500 w-20">Unexcused</span><span className="font-medium text-[#1E1E1E]">{detail.absences.unexcused ?? 0}</span></div>
            </div>}
        </div>

        {/* NPS */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">NPS ({mode === 'last_week' ? 'latest' : 'all time avg'})</p>
          {npsScore != null ? (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-semibold ${npsBorder(npsScore)} ${npsColor(npsScore)}`}>
              {npsScore}
              <span className="font-normal text-slate-500 text-xs">{npsScore >= 50 ? 'Promoter majority' : npsScore >= 0 ? 'Neutral' : 'Detractor majority'}</span>
            </div>
          ) : <p className="text-xs text-slate-400">No NPS data</p>}
        </div>
      </div>

      {/* AI-summarized survey insights */}
      {!loading && insights && insights.totalResponses > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wide text-slate-400">
                {insights.isLastWeek ? 'Last Week' : 'All-Time'} Survey
              </span>
              {' '}{insights.feedbackCount} responses with feedback, avg {insights.avgScore}/10
              <span className="text-slate-400 ml-1">({insights.promoterCount}P / {insights.passiveCount}N / {insights.detractorCount}D)</span>
            </p>
            {insights.allQuotes.length > 0 && (
              <button onClick={openQuotes} className="text-[11px] text-[#4242EA] hover:underline shrink-0">
                View {insights.allQuotes.length} individual responses
              </button>
            )}
          </div>

          {insights.concerns === null ? (
            <p className="text-xs text-slate-400 animate-pulse">Analyzing feedback themes...</p>
          ) : (
            <>
              {insights.concerns.length > 0 && (
                <div className="space-y-1">
                  {insights.concerns.map((c, i) => (
                    <p key={i} className="text-xs text-[#1E1E1E] pl-3 border-l-2 border-red-300">{c}</p>
                  ))}
                </div>
              )}
              {insights.strengths?.length > 0 && (
                <div className="space-y-1">
                  {insights.strengths.map((s, i) => (
                    <p key={i} className="text-xs text-[#1E1E1E] pl-3 border-l-2 border-green-300">{s}</p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {!loading && (!insights || insights.totalResponses === 0) && (
        <p className="text-xs text-slate-400">No survey responses found for this cohort.</p>
      )}

      {/* metric context */}
      <div className="flex gap-6 text-xs text-slate-500">
        {cohort.attendance.previous != null && <span>Attendance prev week: <strong>{cohort.attendance.previous}%</strong></span>}
        {cohort.task_completion.previous != null && <span>Tasks prev week: <strong>{cohort.task_completion.previous}%</strong></span>}
        {cohort.deliverables.previous != null && <span>Deliverables prev week: <strong>{cohort.deliverables.previous}%</strong></span>}
        {cohort.current_week != null && <span>Currently on Week <strong>{cohort.current_week}</strong></span>}
      </div>
    </div>
  );
};

export default CohortComparisonTab;
