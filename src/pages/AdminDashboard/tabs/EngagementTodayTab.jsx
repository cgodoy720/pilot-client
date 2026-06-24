import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import useAuthStore from '../../../stores/authStore';
import { Card, CardContent } from '../../../components/ui/card';
import DateNavigator from '../components/DateNavigator';
import AttendanceStatusSelect from '../components/AttendanceStatusSelect';
import CoachPrepPanel from '../components/CoachPrepPanel';
import CoachBriefing from '../components/CoachBriefing';
import { getCachedDayBuilderStatus, cachedAdminApi } from '../../../services/cachedAdminApi';

const getTodayET = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7002';

const getInitials = (first, last) =>
  `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();

const AVATAR_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500',
];
const avatarColor = (userId) => AVATAR_COLORS[userId % AVATAR_COLORS.length];

// Engagement tier → visual treatment. Drives both the card's left border and
// the small per-builder chip. Lower rank = needs attention sooner.
const TIER = {
  not_engaged: { rank: 0, border: 'border-l-[#EF4444]', chip: 'bg-red-50 text-red-600',    label: 'Not Engaged' },
  no_data:     { rank: 1, border: 'border-l-[#E3E3E3]', chip: 'bg-gray-100 text-gray-500', label: 'No Data' },
  engaged:     { rank: 2, border: 'border-l-[#4242EA]', chip: 'bg-[#4242EA]/10 text-[#4242EA]', label: 'Engaged' },
};
const tierOf = (b) => TIER[b.engagement_tier] || TIER.no_data;

const PRESENT_STATUSES = new Set(['present', 'late']);

// Multi-stage badges — where each builder is in their journey (can be several at once).
const STAGE_BADGE = {
  Learning:      'bg-slate-100 text-slate-700',
  Applying:      'bg-blue-50 text-blue-700',
  Interviewing:  'bg-[#4242EA]/10 text-[#4242EA]',
  'Have Offers': 'bg-amber-100 text-amber-700',
  Placed:        'bg-green-100 text-green-700',
};
const stagesOf = (b) => {
  const placed = !!b.is_employed || b.highest_stage === 'accepted' || (b.jobs_placed || 0) > 0;
  const stages = [];
  if (b.compass_this_week || b.attendance_this_week) stages.push('Learning');
  if ((b.application_count || 0) > 0 && !placed) stages.push('Applying');
  if (['screen', 'oa', 'interview'].includes(b.highest_stage)) stages.push('Interviewing');
  if (b.highest_stage === 'offer') stages.push('Have Offers');
  if (placed) stages.push('Placed');
  return stages;
};

// Fallback "action to take" by risk type, when no next-step has been logged.
const ACTION_BY_TYPE = {
  'wellbeing/personal crisis': 'Proactive 1:1 + connect to support',
  'engagement drop': 'Escalate outreach; confirm intent',
  'behavioral/safety concern': 'Direct check-in; document',
  'targeting mismatch': 'Realign job-search strategy',
  'coaching gap': 'Schedule a check-in — overdue',
  'placement strain': 'Help prioritize / de-load',
  'program-fit/commitment': 'Clarify commitment + options',
  'schedule/work conflict': 'Confirm schedule plan',
};

const EngagementTodayTab = ({ selectedCohortId, cohorts }) => {
  const token = useAuthStore((s) => s.token);
  const [participants, setParticipants] = useState([]);
  const [dayStatus, setDayStatus] = useState(null); // { noClass, dayType, builders: [...] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayET);
  const [todayLesson, setTodayLesson] = useState(null); // what the cohort is learning that day
  const [refreshKey, setRefreshKey] = useState(0);
  const [notInRoomOpen, setNotInRoomOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');
  const autoExcusedRef = useRef(new Set());
  const [coachPrep, setCoachPrep] = useState({});       // { [userId]: saved prep content }
  const [prepGenerating, setPrepGenerating] = useState(false);
  const [briefingKey, setBriefingKey] = useState(0);    // bumped to refetch the briefing after a run
  const [prepLoaded, setPrepLoaded] = useState(false);  // saved-prep fetch has resolved for this cohort+date
  const prepGenRef = useRef(new Set());                 // one auto-gen attempt per cohort+date (no loop)

  const selectedCohort = useMemo(
    () => cohorts?.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );
  const cohortName = selectedCohort?.name || '';

  // Weekly engagement data — only depends on the cohort, not the date.
  useEffect(() => {
    if (!selectedCohortId || !token) return;
    let cancelled = false;
    fetch(`${API_BASE}/api/external-cohorts/${selectedCohortId}/participants`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(`Participants failed (${r.status})`); return r.json(); })
      .then(data => { if (!cancelled) setParticipants(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setParticipants([]); });
    return () => { cancelled = true; };
  }, [selectedCohortId, token]);

  // What the cohort is learning on the selected date (curriculum daily goal + objectives).
  useEffect(() => {
    if (!selectedCohortId || !token || !selectedDate) { setTodayLesson(null); return; }
    let cancelled = false;
    fetch(`${API_BASE}/api/external-cohorts/${selectedCohortId}/curriculum-day?date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (!cancelled) setTodayLesson(d || null); })
      .catch(() => { if (!cancelled) setTodayLesson(null); });
    return () => { cancelled = true; };
  }, [selectedCohortId, selectedDate, token]);

  // Per-day attendance roster (also tells us whether this is a class day).
  useEffect(() => {
    if (!cohortName || !token || !selectedDate) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    getCachedDayBuilderStatus(cohortName, selectedDate, token, { forceRefresh: refreshKey > 0 })
      .then(res => { if (!cancelled) setDayStatus(res.data); })
      .catch(() => { if (!cancelled) { setDayStatus(null); setError('Could not load attendance for this date.'); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [cohortName, selectedDate, token, refreshKey]);

  const noClass = dayStatus?.noClass === true;

  // Auto-excuse placed builders on class days (best-effort, once per cohort+date).
  useEffect(() => {
    if (!selectedCohortId || !token || !dayStatus || noClass) return;
    const key = `${selectedCohortId}:${selectedDate}`;
    if (autoExcusedRef.current.has(key)) return;
    autoExcusedRef.current.add(key);
    fetch(`${API_BASE}/api/external-cohorts/${selectedCohortId}/auto-excuse-employed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate }),
    })
      .then(r => { if (r.ok) { cachedAdminApi.invalidateAllAttendanceCaches(); setRefreshKey(k => k + 1); } })
      .catch(() => {});
  }, [selectedCohortId, selectedDate, token, dayStatus, noClass]);

  const handleSaved = async () => {
    cachedAdminApi.invalidateAllAttendanceCaches();
    setRefreshKey(k => k + 1);
  };

  // Read the SAVED cohort prep for this date. Reads NEVER regenerate — switching
  // dates / revisiting serves the saved copy (the token + consistency fix).
  useEffect(() => {
    if (!selectedCohortId || !token || !selectedDate) return;
    let cancelled = false;
    setPrepLoaded(false);
    fetch(`${API_BASE}/api/admin/dashboard/cohort-coach-prep?cohortId=${selectedCohortId}&date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => { if (!cancelled) { setCoachPrep(j.data || {}); setPrepLoaded(true); } })
      .catch(() => { if (!cancelled) { setCoachPrep({}); setPrepLoaded(true); } });
    return () => { cancelled = true; };
  }, [selectedCohortId, selectedDate, token]);

  // Ensure coverage: when viewing today, if ANY active builder on the roster lacks
  // saved prep, auto-generate the whole cohort ONCE (self-heals empty/partial states
  // — no per-student clicking). Guarded to one attempt per cohort+date so it can't loop.
  useEffect(() => {
    if (!selectedCohortId || !token || !selectedDate || !dayStatus || !prepLoaded || prepGenerating) return;
    if (selectedDate !== getTodayET()) return;
    const rosterIds = (dayStatus.builders || []).map(b => b.userId);
    if (rosterIds.length === 0) return;
    const missing = rosterIds.some(id => !coachPrep[id]);
    const key = `${selectedCohortId}:${selectedDate}`;
    if (!missing || prepGenRef.current.has(key)) return;
    prepGenRef.current.add(key);
    let cancelled = false;
    setPrepGenerating(true);
    // The backend persists each builder's prep AS IT COMPLETES, so poll the saved
    // map while the batch runs — cards fill in progressively instead of all-at-once.
    const poll = setInterval(() => {
      fetch(`${API_BASE}/api/admin/dashboard/cohort-coach-prep?cohortId=${selectedCohortId}&date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(j => { if (!cancelled && j.data) setCoachPrep(prev => ({ ...prev, ...j.data })); })
        .catch(() => {});
    }, 4000);
    (async () => {
      try {
        await fetch(`${API_BASE}/api/admin/dashboard/generate-cohort-prep`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ cohortId: selectedCohortId, date: selectedDate }),
        });
        if (cancelled) return;
        const j = await fetch(`${API_BASE}/api/admin/dashboard/cohort-coach-prep?cohortId=${selectedCohortId}&date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json());
        if (cancelled) return;
        setCoachPrep(j.data || {});
        setBriefingKey(k => k + 1); // the same run wrote the briefing — refetch it
      } catch { /* ignore */ }
      finally { clearInterval(poll); if (!cancelled) setPrepGenerating(false); }
    })();
    return () => { cancelled = true; clearInterval(poll); };
  }, [selectedCohortId, selectedDate, token, dayStatus, coachPrep, prepLoaded, prepGenerating]);

  // Manual "Refresh prep": regenerate the whole cohort + briefing for this date.
  const handleRefreshAllPrep = async () => {
    if (!selectedCohortId || !token || prepGenerating) return;
    setPrepGenerating(true);
    const poll = setInterval(() => {
      fetch(`${API_BASE}/api/admin/dashboard/cohort-coach-prep?cohortId=${selectedCohortId}&date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(j => { if (j.data) setCoachPrep(prev => ({ ...prev, ...j.data })); })
        .catch(() => {});
    }, 4000);
    try {
      await fetch(`${API_BASE}/api/admin/dashboard/generate-cohort-prep`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortId: selectedCohortId, date: selectedDate }),
      });
      const j = await fetch(`${API_BASE}/api/admin/dashboard/cohort-coach-prep?cohortId=${selectedCohortId}&date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json());
      setCoachPrep(j.data || {});
      setBriefingKey(k => k + 1);
    } catch { /* ignore */ }
    clearInterval(poll);
    setPrepGenerating(false);
  };

  // Join the per-day roster with weekly engagement, then bucket the builders.
  const { inRoom, remote, notInRoom } = useMemo(() => {
    const byId = new Map((participants || []).map(p => [p.user_id, p]));
    const roster = (dayStatus?.builders || []).map(b => {
      const p = byId.get(b.userId) || {};
      return {
        ...b,
        engagement_tier: p.engagement_tier || 'no_data',
        is_employed: !!p.is_employed,
        employment_type: p.employment_type || null,
        active: p.active !== false,
        next_action: p.next_action || null,
        ai_risk: p.ai_risk || null,
        placement: p.placement || null,
        current_profile: p.current_profile || null,
        deployed_builds: p.deployed_builds || 0,
        attendance_rate: p.attendance_rate ?? null,
        // Stage signals (multi-stage badges)
        highest_stage: p.highest_stage || null,
        application_count: p.application_count || 0,
        jobs_placed: p.jobs_placed || 0,
        compass_this_week: !!p.compass_this_week,
        attendance_this_week: !!p.attendance_this_week,
      };
    });

    const visible = roster.filter(b => {
      if (statusFilter === 'active') return b.active;
      if (statusFilter === 'withdrawn') return !b.active;
      return true;
    });

    // Placed builders need less attention → sink them to the bottom; among the
    // rest, surface who needs attention first (Not Engaged → No data → Engaged).
    const byAttention = (a, b) =>
      (a.is_employed ? 1 : 0) - (b.is_employed ? 1 : 0) ||
      tierOf(a).rank - tierOf(b).rank ||
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);

    const present = visible.filter(b => PRESENT_STATUSES.has(b.status)).sort(byAttention);
    const remoteEngaged = visible
      .filter(b => !PRESENT_STATUSES.has(b.status) && b.engagement_tier === 'engaged')
      .sort(byAttention);
    const rest = visible
      .filter(b => !PRESENT_STATUSES.has(b.status) && b.engagement_tier !== 'engaged')
      .sort(byAttention);

    return { inRoom: present, remote: remoteEngaged, notInRoom: rest };
  }, [participants, dayStatus, statusFilter]);

  const BuilderRow = ({ b, showControl, present }) => {
    const tier = tierOf(b);
    const stages = stagesOf(b);
    const action = b.next_action || (b.ai_risk?.type ? ACTION_BY_TYPE[b.ai_risk.type] : null);
    return (
      <Card className={`bg-white border border-[#C8C8C8] border-l-4 ${tier.border}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${avatarColor(b.userId)} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-xs font-bold">{getInitials(b.firstName, b.lastName)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#1A1A1A] truncate">
                {b.firstName} {b.lastName}
              </div>
              <div className="text-xs text-[#6B7280] truncate">{b.email}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {b.is_employed && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  {b.employment_type ? b.employment_type.charAt(0).toUpperCase() + b.employment_type.slice(1) : 'Placed'}
                </span>
              )}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tier.chip}`}>{tier.label}</span>
              {showControl && (
                <AttendanceStatusSelect builder={b} selectedDate={selectedDate} onSaved={handleSaved} />
              )}
            </div>
          </div>
          {stages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {stages.map(s => (
                <span key={s} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STAGE_BADGE[s]}`}>{s}</span>
              ))}
            </div>
          )}
          {present && action && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-[#374151] bg-[#F5F5FF] border border-[#E3E3F5] rounded px-2 py-1.5">
              <span className="text-[#4242EA] font-semibold flex-shrink-0">Action:</span>
              <span className="min-w-0">{action}</span>
            </div>
          )}
          <CoachPrepPanel
            builder={b}
            cohortId={selectedCohortId}
            prep={coachPrep[b.userId] || null}
            selectedDate={selectedDate}
            generating={prepGenerating}
          />
        </CardContent>
      </Card>
    );
  };

  const Section = ({ title, count, children }) => (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-2">
        {title}
        <span className="text-slate-300 font-normal normal-case">({count})</span>
      </h4>
      {children}
    </div>
  );

  if (!cohortName) {
    return <p className="text-sm text-gray-400 text-center py-12">Select a cohort to view today.</p>;
  }

  if (loading && !dayStatus) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#4242EA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {todayLesson && (todayLesson.daily_goal || (todayLesson.learning_objectives || []).length > 0) && (
        <Card className="bg-[#F5F5FF] border border-[#E3E3F5]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wide text-[#4242EA]">What builders are learning today</span>
              {todayLesson.day_number != null && <span className="text-[11px] text-slate-400">Day {todayLesson.day_number}{todayLesson.week ? ` · Week ${todayLesson.week}` : ''}</span>}
            </div>
            {todayLesson.daily_goal && (
              <p className="text-sm text-[#1A1A1A] leading-relaxed">{todayLesson.daily_goal}</p>
            )}
            {(todayLesson.learning_objectives || []).length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-[#374151] list-disc list-inside">
                {todayLesson.learning_objectives.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <CoachBriefing selectedCohortId={selectedCohortId} refreshKey={briefingKey} />

      {prepGenerating && (() => {
        const ids = (dayStatus?.builders || []).map(b => b.userId);
        const ready = ids.filter(id => coachPrep[id]).length;
        return (
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-[#F5F5FF] border border-[#E3E3F5] rounded-lg p-4">
            <div className="w-4 h-4 border-2 border-[#4242EA] border-t-transparent rounded-full animate-spin" />
            Preparing today’s coach prep — cards fill in as they’re ready{ids.length ? ` (${ready}/${ids.length})` : ''}…
          </div>
        );
      })()}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAllPrep}
            disabled={prepGenerating}
            className="flex items-center gap-1.5 text-xs font-medium text-[#4242EA] hover:text-[#3535c8] disabled:text-slate-300"
            title="Regenerate today's coach prep for the whole cohort"
          >
            <Sparkles size={13} className={prepGenerating ? 'animate-pulse' : ''} />
            {prepGenerating ? 'Preparing coach prep…' : 'Refresh prep'}
          </button>
          <div className="flex rounded-md border border-[#E3E3E3] overflow-hidden text-xs">
            {['active', 'all', 'withdrawn'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 transition-colors ${
                  statusFilter === f ? 'bg-[#4242EA] text-white' : 'bg-white text-[#6B7280] hover:bg-gray-50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">{error}</div>
      )}

      {noClass ? (
        // Genuine no-class day: no attendance. Surface remote/engaged follow-ups.
        <>
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-center">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-sm font-medium text-slate-600">No class today{dayStatus?.dayType ? ` — ${dayStatus.dayType}` : ''}</p>
            <p className="text-xs text-slate-400 mt-1">Attendance isn’t tracked. Daily follow-ups below.</p>
          </div>
          <Section title="Remote / Follow-ups" count={remote.length}>
            {remote.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">No engaged builders to follow up with.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {remote.map(b => <BuilderRow key={b.userId} b={b} showControl={false} />)}
              </div>
            )}
          </Section>
        </>
      ) : (
        <>
          {/* At-a-glance daily counts (replaces the old weekly engagement strip) */}
          <p className="text-sm text-[#374151]">
            <span className="font-semibold text-[#1A1A1A]">{inRoom.length}</span> checked in
            {inRoom.filter(b => b.status === 'late').length > 0 && (
              <span className="text-amber-600"> ({inRoom.filter(b => b.status === 'late').length} late)</span>
            )}
            <span className="text-slate-300 mx-2">·</span>
            <span className="font-semibold text-[#1A1A1A]">{remote.length}</span> remote
            <span className="text-slate-300 mx-2">·</span>
            <span className="font-semibold text-[#1A1A1A]">{notInRoom.length}</span> not in
          </p>

          {/* Checked in — attendance tracker, needs-attention first */}
          <Section title="Checked in" count={inRoom.length}>
            {inRoom.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">No one marked present yet — take attendance below.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {inRoom.map(b => <BuilderRow key={b.userId} b={b} showControl present />)}
              </div>
            )}
          </Section>

          {/* Remote / engaged but not physically present */}
          {remote.length > 0 && (
            <Section title="Remote / Not in the room" count={remote.length}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {remote.map(b => <BuilderRow key={b.userId} b={b} showControl />)}
              </div>
            </Section>
          )}

          {/* Everyone else — collapsible */}
          <div>
            <button
              onClick={() => setNotInRoomOpen(o => !o)}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2"
            >
              Not in the room
              <span className="text-slate-300 font-normal normal-case">({notInRoom.length})</span>
              <svg
                className={`w-4 h-4 transition-transform ${notInRoomOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {notInRoomOpen && (
              notInRoom.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">Everyone is accounted for.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {notInRoom.map(b => <BuilderRow key={b.userId} b={b} showControl />)}
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EngagementTodayTab;
