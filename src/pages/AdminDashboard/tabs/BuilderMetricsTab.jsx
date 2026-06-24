import React, { useState, useEffect, useMemo, useRef } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table';
import { getStageLabel } from '../../PathfinderAdmin/components/shared/utils.jsx';
import BuilderExpandedRow from './BuilderExpandedRow';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { cachedAdminApi } from '../../../services/cachedAdminApi';
import CohortDailyBreakdown from '../../../components/CohortPerformanceDashboard/CohortDailyBreakdown';
import DayBuilderStatusModal from '../../../components/CohortPerformanceDashboard/DayBuilderStatusModal';
import CohortBuckets from '../components/CohortBuckets';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7001';
const PAGE_SIZE = 15;

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatLastActive = (ts) => {
  if (!ts) return null;
  const days = Math.floor((Date.now() - new Date(ts)) / 86_400_000);
  if (days === 0) return { label: 'Today', red: false };
  if (days === 1) return { label: 'Yesterday', red: false };
  return { label: `${days} days ago`, red: days > 7 };
};

const dash = <span className="text-gray-400">—</span>;

const num = (n) => (n > 0 ? <span className="font-semibold text-[#4242EA]">{n}</span> : dash);

const getInitials = (first, last) =>
  `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();

const AVATAR_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500',
];
const avatarColor = (userId) => AVATAR_COLORS[userId % AVATAR_COLORS.length];

const stageBadgeClass = (stage) => {
  const map = {
    screen:    'bg-blue-100 text-blue-700',
    oa:        'bg-indigo-100 text-indigo-700',
    interview: 'bg-[#4242EA]/10 text-[#4242EA]',
    offer:     'bg-green-100 text-green-600',
    accepted:  'bg-green-600 text-white',
    rejected:  'bg-gray-100 text-gray-500',
    withdrawn: 'bg-gray-100 text-gray-500',
    applied:   'bg-blue-50 text-blue-600',
    prospect:  'bg-gray-50 text-gray-500',
  };
  return map[stage] || 'bg-gray-100 text-gray-500';
};

const engagementBadge = (tier) => {
  if (tier === 'engaged')     return { label: 'Engaged',     cls: 'bg-[#4242EA] text-white' };
  if (tier === 'not_engaged') return { label: 'Not Engaged', cls: 'bg-[#EF4444] text-white' };
  return { label: 'No data', cls: 'bg-gray-100 text-gray-500' };
};

const rowBorderColor = (tier) => {
  if (tier === 'engaged')     return 'border-l-[#4242EA]';
  if (tier === 'not_engaged') return 'border-l-[#EF4444]';
  return 'border-l-[#E3E3E3]';
};

const PROFILE_LABELS = {
  connector:            'Connector',
  demonstrator:         'Demonstrator',
  presence_builder:     'Presence Builder',
  skill_sharpener:      'Skill Sharpener',
  builder_entrepreneur: 'Entrepreneur',
};

const PIPELINE_STAGES = new Set(['screen', 'oa', 'interview', 'offer', 'accepted']);

// "In transit" = apprenticeship / contract / temp placements (SMB, Mizuho, JPMC
// apprentices) — employed but not a permanent placement.
const IN_TRANSIT_TYPES = new Set(['contract', 'apprenticeship', 'internship', 'part-time', 'temporary', 'temp']);
const isInTransit = (p) =>
  p.is_employed && (
    /apprentice|intern/i.test(p.placement?.role || '') ||
    IN_TRANSIT_TYPES.has((p.placement?.job_type || '').toLowerCase())
  );

const progressState = (p, weeksInL3) => {
  if (p.is_employed) return isInTransit(p) ? 'in_transit' : 'placed';

  const hasResponse = PIPELINE_STAGES.has(p.highest_stage);
  const profile = p.current_profile;

  if (profile === 'connector') {
    if (hasResponse) return 'in_pipeline';
    if (p.hustle_count > 0 || p.application_count > 0) return 'active';
    return 'stalled';
  }
  if (profile === 'demonstrator') {
    if (hasResponse) return 'in_pipeline';
    if (p.deployed_builds > 0 || p.application_count > 0) return 'active';
    return 'stalled';
  }
  if (profile === 'presence_builder') {
    if (hasResponse) return 'in_pipeline';
    if (p.attendance_this_week || p.hustle_count > 0) return 'active';
    return 'stalled';
  }
  if (profile === 'skill_sharpener') {
    if (hasResponse) return 'in_pipeline';
    if (p.compass_this_week || p.application_count > 0) return 'active';
    return 'stalled';
  }
  if (profile === 'builder_entrepreneur') {
    if (hasResponse) return 'in_pipeline';
    if (p.deployed_builds > 0 || p.hustle_count > 0) return 'active';
    return 'stalled';
  }
  // No profile yet
  if (hasResponse) return 'in_pipeline';
  if (p.compass_this_week || p.application_count > 0) return 'active';
  return 'stalled';
};

const PROGRESS_CONFIG = {
  stalled:     { label: 'Stalled',     cls: 'bg-red-50 text-red-600' },
  active:      { label: 'Job hunting',            cls: 'bg-blue-50 text-blue-700' },
  in_pipeline: { label: 'In interview pipeline',  cls: 'bg-[#4242EA]/10 text-[#4242EA]' },
  in_transit:  { label: 'Hired (trial/contract)', cls: 'bg-amber-100 text-amber-700' },
  placed:      { label: 'Placed',      cls: 'bg-green-100 text-green-700' },
};

// ── Risk hierarchy (within-stage triage) ──────────────────────────────────────
// on-track / at-risk / high-risk. The stage says WHERE a builder is; risk says
// whether you need to worry about them there. Applies to every stage incl. Placed.
const RISK_ORDER = ['high_risk', 'at_risk', 'on_track'];
const RISK_CONFIG = {
  high_risk: { label: 'High risk', short: 'High',     cls: 'bg-red-50 text-red-600',     dot: 'bg-red-500' },
  at_risk:   { label: 'At risk',   short: 'At risk',  cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  on_track:  { label: 'On track',  short: 'On track', cls: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
};

// PRD 4 risk-engine levels → PRD 3 triage tiers. (no_data → on_track tier but
// keeps its reason so the gap is still readable in the row.)
const AI_TO_TIER = { high: 'high_risk', medium: 'at_risk', low: 'on_track', no_data: 'on_track' };

// SEAM for PRD 4: if the AI risk engine has supplied p.ai_risk = { level, type, reasons },
// use it (mapped to the triage tier); otherwise fall back to the interim heuristic below.
const computeRisk = (p, weeksInL3) => {
  if (p.ai_risk?.level) {
    return {
      level: AI_TO_TIER[p.ai_risk.level] || 'on_track',
      reasons: p.ai_risk.reasons || [],
      type: p.ai_risk.type || null,
      noData: p.ai_risk.level === 'no_data',
      source: 'ai',
    };
  }
  const reasons = [];
  const lastMs = p.last_activity ? Date.now() - new Date(p.last_activity) : Infinity;
  const goneDark = lastMs > 14 * 86_400_000 && p.engagement_tier !== 'engaged';

  if (p.is_employed) {
    if (p.employment_type && p.employment_type !== 'full-time') reasons.push('Temp/part-time — needs path to full-time');
    if (goneDark) reasons.push('No recent activity');
    const level = reasons.length >= 2 ? 'high_risk' : reasons.length === 1 ? 'at_risk' : 'on_track';
    return { level, reasons };
  }

  if (goneDark) reasons.push('Gone dark (14+ days inactive)');
  if (p.engagement_tier === 'not_engaged') reasons.push('Not engaged this week');
  if (weeksInL3 > 8 && p.application_count === 0) reasons.push('No job applications');
  if (p.deployed_builds === 0 && ['demonstrator', 'builder_entrepreneur'].includes(p.current_profile)) reasons.push('No active build');
  if (progressState(p, weeksInL3) === 'stalled') reasons.push('Stalled in job search');

  const level = (goneDark || reasons.length >= 2) ? 'high_risk' : reasons.length === 1 ? 'at_risk' : 'on_track';
  return { level, reasons };
};

const weeksFromCohortName = (name) => {
  if (!name) return 0;
  const clean = name.replace(/\s*L3\+.*$/i, '').trim();
  const months = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };
  const match = clean.match(/^(\w+)\s+(\d{4})$/i);
  if (!match) return 0;
  const month = months[match[1].toLowerCase()];
  if (month === undefined) return 0;
  const start = new Date(parseInt(match[2], 10), month, 1);
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / (7 * 86_400_000)));
};

const SortHead = ({ label, sortK, current, dir, onSort, className = '' }) => (
  <TableHead
    className={`cursor-pointer select-none hover:text-[#1A1A1A] ${className}`}
    onClick={() => onSort(sortK)}
  >
    <div className="flex items-center gap-1">
      {label}
      <span className="text-[10px] text-[#C8C8C8]">
        {current === sortK ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
      </span>
    </div>
  </TableHead>
);

// ── Signal dots ───────────────────────────────────────────────────────────────

const SignalDot = ({ active, label }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#4242EA]' : 'bg-[#C8C8C8]'}`} />
    <span className="text-[10px] text-gray-400 whitespace-nowrap">{label}</span>
  </div>
);

const HollowDot = ({ label }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="w-2 h-2 rounded-full border border-[#C8C8C8]" />
    <span className="text-[10px] text-gray-400 whitespace-nowrap">{label}</span>
  </div>
);

// ── Segment cards (clickable lifecycle filters) ───────────────────────────────

// Lifecycle priority order: most-urgent first.
const SEGMENT_ORDER = ['stalled', 'active', 'in_pipeline', 'in_transit', 'placed'];

// Two-tier grouping for the table: the working set ("in active job search" — incl.
// contract/trial, who are still being helped) above those "outside active help".
const SEGMENT_TIERS = [
  { key: 'active',  label: 'In active job search', segments: ['active', 'in_pipeline', 'in_transit'] },
  { key: 'outside', label: 'Outside active help',  segments: ['stalled', 'placed'] },
];

// Compact on-track / at-risk / high-risk breakdown (dots + counts).
const RiskBreakdown = ({ counts, className = '' }) => (
  <div className={`flex items-center gap-2.5 text-[11px] text-[#6B7280] ${className}`}>
    {RISK_ORDER.map(r => (
      <span key={r} className="flex items-center gap-1" title={RISK_CONFIG[r].label}>
        <span className={`w-1.5 h-1.5 rounded-full ${RISK_CONFIG[r].dot}`} />
        {counts?.[r] || 0}
      </span>
    ))}
  </div>
);

const SegmentCard = ({ seg, count, risk, active, onClick, members }) => {
  const cfg = PROGRESS_CONFIG[seg];
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`w-full text-left rounded-lg border p-4 transition-all ${
          active
            ? 'border-[#4242EA] ring-2 ring-[#4242EA]/30 bg-[#4242EA]/5'
            : 'border-[#C8C8C8] bg-white hover:border-[#4242EA]/50'
        }`}
      >
        <div className="text-3xl font-bold text-[#1A1A1A]">{count}</div>
        <div className="mt-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
        </div>
        <RiskBreakdown counts={risk} className="mt-2" />
      </button>
      <MemberCard members={members} emptyText={`No ${cfg.label} builders`} />
    </div>
  );
};

// Hover card listing the builders behind a number (shown on group-hover).
const fmtDay = (d) => { if (!d) return ''; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); } catch { return ''; } };
// Build a one-line detail for a weekly activity item (company/role/stage/date).
const activityDetail = (x) => [
  `${x.company || x.type || ''}${x.role ? ` (${x.role})` : ''}`.trim(),
  x.stage || '',
  fmtDay(x.date),
].filter(Boolean).join(' · ');

const MemberCard = ({ members, emptyText = 'None' }) => (
  <div className="hidden group-hover:block absolute z-30 left-0 top-full mt-1 w-72 max-h-64 overflow-y-auto bg-white border border-[#E3E3E3] rounded-md shadow-lg p-2 text-xs font-normal normal-case text-left">
    {members && members.length ? (
      <ul className="space-y-1">
        {members.map((m, i) => (
          <li key={i} className="flex justify-between gap-3">
            <span className="text-[#1A1A1A] flex-shrink-0">{m.name}</span>
            {m.detail && <span className="text-[#6B7280] text-right truncate">{m.detail}</span>}
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-slate-400">{emptyText}</div>
    )}
  </div>
);

// Headline stat with a hover card revealing the builders behind the number.
const StatHover = ({ children, onClick, danger, members, emptyText = 'None' }) => (
  <span className="relative group inline-block">
    {onClick ? (
      <button type="button" onClick={onClick}
        className={`cursor-pointer hover:underline ${danger ? 'text-red-600' : 'hover:text-[#4242EA]'}`}>
        {children}
      </button>
    ) : (
      <span className="cursor-help border-b border-dotted border-slate-300">{children}</span>
    )}
    <MemberCard members={members} emptyText={emptyText} />
  </span>
);

// ── Cohort health strip (pipeline funnel + risk mix) ──────────────────────────

const FUNNEL_STAGES = [
  { key: 'not_applied', label: 'Not applied', color: 'bg-gray-300' },
  { key: 'applied',     label: 'Applied',     color: 'bg-blue-300' },
  { key: 'screen',      label: 'Screen',      color: 'bg-blue-400' },
  { key: 'oa',          label: 'OA',          color: 'bg-indigo-400' },
  { key: 'interview',   label: 'Interview',   color: 'bg-[#4242EA]' },
  { key: 'offer',       label: 'Offer',       color: 'bg-emerald-400' },
  { key: 'in_transit',  label: 'Contract/trial', color: 'bg-amber-400' },
  { key: 'placed',      label: 'Placed',      color: 'bg-emerald-600' },
];
const RISK_MIX = [
  { key: 'high_risk', label: 'High',     color: 'bg-red-500',   hex: '#ef4444' },
  { key: 'at_risk',   label: 'At risk',  color: 'bg-amber-500', hex: '#f59e0b' },
  { key: 'on_track',  label: 'On track', color: 'bg-green-500', hex: '#22c55e' },
  { key: 'no_data',   label: 'No data',  color: 'bg-gray-300',  hex: '#d1d5db' },
];

// Risk mix as a donut + hoverable legend.
const RiskPie = ({ counts, membersByKey }) => {
  const data = RISK_MIX.map(s => ({ name: s.label, key: s.key, value: counts[s.key] || 0, hex: s.hex })).filter(d => d.value > 0);
  return (
    <div className="flex items-center gap-4">
      <PieChart width={120} height={120}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={34} outerRadius={56} paddingAngle={2} stroke="none">
          {data.map(d => <Cell key={d.key} fill={d.hex} />)}
        </Pie>
        <Tooltip formatter={(v, n) => [`${v} builders`, n]} />
      </PieChart>
      <div className="flex-1 space-y-1">
        {RISK_MIX.map(s => (
          <span key={s.key} className="relative group flex items-center gap-1.5 text-xs text-[#6B7280] cursor-help">
            <span className={`w-2 h-2 rounded-full ${s.color}`} />
            {s.label} <span className="font-semibold text-[#1A1A1A]">{counts[s.key] || 0}</span>
            {membersByKey && <MemberCard members={membersByKey[s.key]} emptyText={`No ${s.label.toLowerCase()} builders`} />}
          </span>
        ))}
      </div>
    </div>
  );
};

const CohortHealthStrip = ({ funnel, riskMix, riskMembers }) => {
  const total = FUNNEL_STAGES.reduce((sum, s) => sum + (funnel[s.key] || 0), 0) || 1;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-white border border-[#C8C8C8]">
        <CardContent className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
            Where the cohort is now <span className="font-normal normal-case text-slate-400">· % of builders by stage</span>
          </div>
          <div className="space-y-1.5">
            {FUNNEL_STAGES.map(s => {
              const v = funnel[s.key] || 0;
              const pct = Math.round((v / total) * 100);
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="w-20 text-xs text-[#6B7280] flex-shrink-0">{s.label}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                    <div className={`h-4 ${s.color} rounded`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-16 text-right text-xs font-semibold text-[#1A1A1A]">{v} · {pct}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-[#C8C8C8]">
        <CardContent className="p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Risk mix</div>
          <RiskPie counts={riskMix} membersByKey={riskMembers} />
        </CardContent>
      </Card>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const BuilderMetricsTab = ({ selectedCohortId, cohorts }) => {
  const token = useAuthStore((s) => s.token);
  const [participants, setParticipants] = useState([]);
  const [participantsRefresh, setParticipantsRefresh] = useState(0);
  const [slackEngagement, setSlackEngagement] = useState({});
  const [health, setHealth] = useState({});
  const [dailyBreakdown, setDailyBreakdown] = useState([]);   // attendance calendar data
  const [attendanceDay, setAttendanceDay] = useState(null);
  const [dayBuilders, setDayBuilders] = useState(null);
  const [dayBuildersLoading, setDayBuildersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [summaries, setSummaries] = useState({});
  const fetchingRef = useRef(new Set());
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [segmentFilter, setSegmentFilter] = useState(null);
  const [riskFilter, setRiskFilter] = useState('all'); // 'all' | 'at_risk' | 'high_risk'

  // Click a card → filter to that segment; click the active card → clear;
  // click another → switch. Pure state, no reload.
  const toggleSegment = (seg) => {
    setSegmentFilter(cur => (cur === seg ? null : seg));
    setPage(1);
  };

  // One-click triage drill: jump to a stage + risk level together.
  const drillRisk = (seg, level) => {
    setSegmentFilter(seg);
    setRiskFilter(level);
    setPage(1);
  };

  const selectedCohort = useMemo(
    () => cohorts?.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );

  const [weekOffset, setWeekOffset] = useState(0);
  const [conversion, setConversion] = useState(null);

  const isAggregate = selectedCohortId === 'ALL_L3PLUS';

  const weeksInL3 = useMemo(
    () => weeksFromCohortName(selectedCohort?.name),
    [selectedCohort]
  );

  useEffect(() => {
    if (!selectedCohortId || !token) return;
    setLoading(true);
    setPage(1);
    const url = isAggregate
      ? `${API_BASE}/api/external-cohorts/aggregate/l3plus/participants?weekOffset=${weekOffset}`
      : `${API_BASE}/api/external-cohorts/${selectedCohortId}/participants?weekOffset=${weekOffset}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setParticipants(Array.isArray(data) ? data : []))
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false));
  }, [selectedCohortId, token, weekOffset, isAggregate, participantsRefresh]);

  // Per-builder Slack engagement (for the Learning bucket's "on Slack" sub-split). Resilient → {}.
  useEffect(() => {
    if (!selectedCohortId || !token) return;
    let cancelled = false;
    const url = isAggregate
      ? `${API_BASE}/api/external-cohorts/aggregate/l3plus/slack-engagement`
      : `${API_BASE}/api/external-cohorts/${selectedCohortId}/slack-engagement`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (!cancelled) setSlackEngagement(d && typeof d === 'object' ? d : {}); })
      .catch(() => { if (!cancelled) setSlackEngagement({}); });
    return () => { cancelled = true; };
  }, [selectedCohortId, token, isAggregate, participantsRefresh]);

  // Per-builder Builder Health counts (attendance / learning / hustling over last 7 curriculum days).
  useEffect(() => {
    if (!selectedCohortId || !token) return;
    let cancelled = false;
    const url = isAggregate
      ? `${API_BASE}/api/external-cohorts/aggregate/l3plus/health`
      : `${API_BASE}/api/external-cohorts/${selectedCohortId}/health`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (!cancelled) setHealth(d && typeof d === 'object' ? d : {}); })
      .catch(() => { if (!cancelled) setHealth({}); });
    return () => { cancelled = true; };
  }, [selectedCohortId, token, isAggregate, participantsRefresh]);

  // Cohort job-search conversion funnel + "stuck" detection (separate endpoint; resilient).
  useEffect(() => {
    if (!selectedCohortId || !token) return;
    let cancelled = false;
    const url = isAggregate
      ? `${API_BASE}/api/external-cohorts/aggregate/l3plus/conversion-funnel`
      : `${API_BASE}/api/external-cohorts/${selectedCohortId}/conversion-funnel`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (!cancelled) setConversion(d || null); })
      .catch(() => { if (!cancelled) setConversion(null); });
    return () => { cancelled = true; };
  }, [selectedCohortId, token, isAggregate]);

  // Daily attendance calendar (original cohort calendar view). Single-cohort only.
  useEffect(() => {
    const cohortName = selectedCohort?.name;
    if (!cohortName || !token || isAggregate) { setDailyBreakdown([]); return; }
    let cancelled = false;
    cachedAdminApi.getCachedCohortDailyBreakdown(cohortName, token, { period: 'last-30-days' })
      .then(res => { if (!cancelled) setDailyBreakdown(res.data?.dailyBreakdown || []); })
      .catch(() => { if (!cancelled) setDailyBreakdown([]); });
    return () => { cancelled = true; };
  }, [selectedCohort, token, isAggregate]);

  const handleAttendanceDayClick = async (day) => {
    const cohortName = selectedCohort?.name;
    if (!cohortName || !day?.date) return;
    setAttendanceDay(day);
    setDayBuildersLoading(true);
    try {
      const res = await cachedAdminApi.getCachedDayBuilderStatus(cohortName, day.date, token);
      setDayBuilders(res.data);
    } catch { setDayBuilders(null); }
    finally { setDayBuildersLoading(false); }
  };

  const fetchSummary = async (userId) => {
    if (summaries[userId] !== undefined || fetchingRef.current.has(userId)) return;
    fetchingRef.current.add(userId);
    try {
      const r = await fetch(`${API_BASE}/api/external-cohorts/${selectedCohortId}/builders/${userId}/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      setSummaries(prev => ({ ...prev, [userId]: data }));
    } catch {
      setSummaries(prev => ({ ...prev, [userId]: { compass: null, logs: [] } }));
    } finally {
      fetchingRef.current.delete(userId);
    }
  };

  const handleRowClick = (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
      fetchSummary(userId);
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const PROGRESS_ORDER = { stalled: 0, active: 1, in_pipeline: 2, in_transit: 3, placed: 4 };
  const ENGAGEMENT_ORDER = { no_data: 0, not_engaged: 1, engaged: 2 };

  // 1. Status scope (active / all / withdrawn) — the population the cards count over.
  const scoped = useMemo(() => {
    if (statusFilter === 'active')    return participants.filter(p => p.active);
    if (statusFilter === 'withdrawn') return participants.filter(p => !p.active);
    return participants;
  }, [participants, statusFilter]);

  // Segment counts so "19 Moving" matches exactly what clicking the card shows.
  const segmentCounts = useMemo(() => {
    const c = { stalled: 0, active: 0, in_pipeline: 0, in_transit: 0, placed: 0 };
    scoped.forEach(p => { c[progressState(p, weeksInL3)] += 1; });
    return c;
  }, [scoped, weeksInL3]);

  // Risk breakdown per segment: { stalled: {on_track, at_risk, high_risk}, ... }
  const riskCounts = useMemo(() => {
    const r = {};
    SEGMENT_ORDER.forEach(s => { r[s] = { on_track: 0, at_risk: 0, high_risk: 0 }; });
    scoped.forEach(p => { r[progressState(p, weeksInL3)][computeRisk(p, weeksInL3).level] += 1; });
    return r;
  }, [scoped, weeksInL3]);

  const headerTotals = useMemo(() => ({
    enrolled: participants.filter(p => p.active).length,
    engaged:  scoped.filter(p => p.engagement_tier === 'engaged').length,
  }), [participants, scoped]);

  // Job-search pipeline: count builders by their furthest stage.
  const funnel = useMemo(() => {
    const f = { not_applied: 0, applied: 0, screen: 0, oa: 0, interview: 0, offer: 0, in_transit: 0, placed: 0 };
    scoped.forEach(p => {
      if (p.is_employed || p.highest_stage === 'accepted') { if (isInTransit(p)) f.in_transit += 1; else f.placed += 1; }
      else if (p.highest_stage === 'offer') f.offer += 1;
      else if (p.highest_stage === 'interview') f.interview += 1;
      else if (p.highest_stage === 'oa') f.oa += 1;
      else if (p.highest_stage === 'screen') f.screen += 1;
      else if (p.highest_stage === 'applied') f.applied += 1;
      else f.not_applied += 1;
    });
    return f;
  }, [scoped]);

  // Weekly job-search activity — non-exclusive overlays from the new backend
  // fields (a builder can be in more than one). Plus headline derived counts.
  const weeklyActivity = useMemo(() => {
    const applied = scoped.filter(p => p.applied_this_week);
    const interviewing = scoped.filter(p => p.interviewed_this_week);
    const rejected = scoped.filter(p => p.rejected_this_week);
    const networking = scoped.filter(p => p.networking_this_week);
    const noActivity = scoped.filter(p => p.no_jobsearch_this_week);
    return { applied, interviewing, rejected, networking, noActivity };
  }, [scoped]);

  // Single source of truth for the active-help framing of the cohort. Derived from
  // segmentCounts (what the table groups by) so every surface ties out.
  //  · in jobs       = placed + contract/trial (inclusive — contract counts as "in a job")
  //  · active search = job-hunting + in-pipeline + contract/trial (contract is still being helped)
  //  · outside help  = placed + stalled  ·  active + outside === total
  const jobBuckets = useMemo(() => {
    const placed = segmentCounts.placed;
    const contract = segmentCounts.in_transit;
    const stalled = segmentCounts.stalled;
    return {
      placed, contract, stalled,
      total: scoped.length,
      inJobs: placed + contract,
      activeSearch: segmentCounts.active + segmentCounts.in_pipeline + contract,
      outsideHelp: placed + stalled,
    };
  }, [segmentCounts, scoped.length]);

  // Special-initiative members (Goldman / Mizuho / JPMC …), not-yet-placed first.
  const initiativeBuilders = useMemo(() =>
    scoped
      .filter(p => (p.initiatives || []).length > 0)
      .map(p => ({ ...p, _placed: p.is_employed || p.highest_stage === 'accepted' }))
      .sort((a, b) => (a._placed ? 1 : 0) - (b._placed ? 1 : 0) || `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)),
    [scoped]);

  // Risk mix across the cohort (AI risk where present, heuristic otherwise).
  const riskMix = useMemo(() => {
    const r = { high_risk: 0, at_risk: 0, on_track: 0, no_data: 0 };
    scoped.forEach(p => {
      const rk = computeRisk(p, weeksInL3);
      if (rk.noData) r.no_data += 1; else r[rk.level] += 1;
    });
    return r;
  }, [scoped, weeksInL3]);

  // Attendance summary — avg per-builder rate, EXCLUDING placed builders (they've
  // left class, so their trailing attendance shouldn't count against the cohort).
  const attendanceSummary = useMemo(() => {
    const eligible = scoped.filter(p => progressState(p, weeksInL3) !== 'placed');
    const withRate = eligible.filter(p => p.attendance_rate != null);
    const pct = withRate.length
      ? Math.round(withRate.reduce((s, p) => s + p.attendance_rate, 0) / withRate.length)
      : null;
    return {
      pct,
      counted: withRate.length,            // builders with an attendance rate
      eligible: eligible.length,           // non-placed headcount
      placedExcluded: scoped.length - eligible.length,
    };
  }, [scoped, weeksInL3]);
  const attendanceOverall = attendanceSummary.pct;

  // Day-before (most recent class day) + weekly average, from the daily breakdown.
  // Formula (explicit): attended that day (present + late) ÷ (L3+ enrolled − placed).
  // Denominator = attendanceSummary.eligible. Single-cohort only (breakdown not fetched in aggregate).
  const attendanceDays = useMemo(() => {
    const denom = attendanceSummary.eligible;
    // Only count days attendance was ACTUALLY taken (real check-ins). The endpoint
    // back-fills `absent` to the full roster for past days with no records, so a day
    // where attendance was never taken must NOT read as 0% — skip it.
    const days = (dailyBreakdown || [])
      .filter(d => !d.isHoliday && ((d.present || 0) + (d.late || 0) + (d.excused || 0)) > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!days.length || !denom) return null;
    const attended = d => (d.present || 0) + (d.late || 0);
    const pctOf = d => Math.min(100, Math.round((attended(d) / denom) * 100));
    const last = days[days.length - 1];
    const cutoff = new Date(last.date); cutoff.setDate(cutoff.getDate() - 6);
    const week = days.filter(d => new Date(d.date) >= cutoff);
    const avg = arr => Math.round(arr.reduce((s, d) => s + pctOf(d), 0) / arr.length);
    return {
      dayBeforePct: pctOf(last),
      dayBeforeAttended: attended(last),
      dayBeforeDate: last.date,
      weeklyAvgPct: avg(week),
      weekDayCount: week.length,
      denom,
    };
  }, [dailyBreakdown, attendanceSummary.eligible]);

  // The builders behind each headline number — shown on hover.
  const headlineMembers = useMemo(() => {
    const nm = p => `${p.first_name} ${p.last_name}`.trim();
    return {
      segments: SEGMENT_ORDER.map(s => ({ name: PROGRESS_CONFIG[s].label, detail: String(segmentCounts[s]) })),
      placed: scoped.filter(p => progressState(p, weeksInL3) === 'placed')
        .map(p => ({ name: nm(p), detail: p.placement?.company || '—' })),
      in_transit: scoped.filter(p => progressState(p, weeksInL3) === 'in_transit')
        .map(p => ({ name: nm(p), detail: [p.placement?.company, p.placement?.role].filter(Boolean).join(' · ') || '—' })),
      interviewing: scoped.filter(p => p.highest_stage === 'interview')
        .map(p => ({ name: nm(p), detail: p.top_application?.company || '—' })),
      high_risk: scoped.filter(p => computeRisk(p, weeksInL3).level === 'high_risk')
        .map(p => { const r = computeRisk(p, weeksInL3); return { name: nm(p), detail: r.type || (r.reasons && r.reasons[0]) || 'high risk' }; }),
      low_attendance: scoped.filter(p => progressState(p, weeksInL3) !== 'placed' && p.attendance_rate != null && p.attendance_rate < 70)
        .sort((a, b) => a.attendance_rate - b.attendance_rate)
        .map(p => ({ name: nm(p), detail: `${p.attendance_rate}%` })),
      goldman: scoped.filter(p => p.goldman)
        .map(p => ({ name: nm(p), detail: p.goldman })),
    };
  }, [scoped, weeksInL3, segmentCounts]);

  // Builders per lifecycle segment / per risk level — for the card & legend hovers.
  const segmentMembers = useMemo(() => {
    const nm = p => `${p.first_name} ${p.last_name}`.trim();
    const detail = p => p.is_employed
      ? (p.placement?.company || '')
      : (p.top_application ? `${p.top_application.stage}${p.top_application.company ? ` @ ${p.top_application.company}` : ''}` : (PROFILE_LABELS[p.current_profile] || ''));
    const m = { stalled: [], active: [], in_pipeline: [], in_transit: [], placed: [] };
    scoped.forEach(p => { m[progressState(p, weeksInL3)].push({ name: nm(p), detail: detail(p) }); });
    return m;
  }, [scoped, weeksInL3]);

  const riskMembers = useMemo(() => {
    const nm = p => `${p.first_name} ${p.last_name}`.trim();
    const m = { high_risk: [], at_risk: [], on_track: [], no_data: [] };
    scoped.forEach(p => {
      const r = computeRisk(p, weeksInL3);
      const k = r.noData ? 'no_data' : r.level;
      m[k].push({ name: nm(p), detail: r.type || (r.reasons && r.reasons[0]) || '' });
    });
    return m;
  }, [scoped, weeksInL3]);

  // 2. Apply search + (segment filter if a card is active), then sort.
  const visible = useMemo(() => {
    let list = scoped;
    const q = search.toLowerCase();
    if (q) list = list.filter(
      p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
           (p.email || '').toLowerCase().includes(q)
    );
    if (segmentFilter) list = list.filter(p => progressState(p, weeksInL3) === segmentFilter);
    if (riskFilter !== 'all') list = list.filter(p => computeRisk(p, weeksInL3).level === riskFilter);

    list = [...list].sort((a, b) => {
      let av, bv;
      if (sortKey === 'name') {
        av = `${a.last_name} ${a.first_name}`.toLowerCase();
        bv = `${b.last_name} ${b.first_name}`.toLowerCase();
      } else if (sortKey === 'engagement') {
        av = ENGAGEMENT_ORDER[a.engagement_tier] ?? 0;
        bv = ENGAGEMENT_ORDER[b.engagement_tier] ?? 0;
      } else if (sortKey === 'progress') {
        av = PROGRESS_ORDER[progressState(a, weeksInL3)] ?? 0;
        bv = PROGRESS_ORDER[progressState(b, weeksInL3)] ?? 0;
      } else if (sortKey === 'strand') {
        av = (PROFILE_LABELS[a.current_profile] || '').toLowerCase();
        bv = (PROFILE_LABELS[b.current_profile] || '').toLowerCase();
      } else if (sortKey === 'goals') {
        av = a.goals_total > 0 ? a.goals_completed / a.goals_total : -1;
        bv = b.goals_total > 0 ? b.goals_completed / b.goals_total : -1;
      } else if (sortKey === 'last_active') {
        av = a.last_activity ? new Date(a.last_activity).getTime() : 0;
        bv = b.last_activity ? new Date(b.last_activity).getTime() : 0;
      } else {
        av = a[sortKey] ?? 0;
        bv = b[sortKey] ?? 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [scoped, search, segmentFilter, riskFilter, sortKey, sortDir, weeksInL3]);

  // 3. Default (no segment selected) → bucket into the four lifecycle sections.
  const groups = useMemo(() => {
    if (segmentFilter) return null;
    const g = { stalled: [], active: [], in_pipeline: [], in_transit: [], placed: [] };
    visible.forEach(p => g[progressState(p, weeksInL3)].push(p));
    return g;
  }, [visible, segmentFilter, weeksInL3]);

  // Pagination only applies in single-segment mode.
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const paged = segmentFilter ? visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : visible;

  const renderRow = (p) => {
    const eng = engagementBadge(p.engagement_tier);
    const lastActive = formatLastActive(p.last_activity);
    const initials = getInitials(p.first_name, p.last_name);
    const isExpanded = expandedUserId === p.user_id;
    const rowSummary = summaries[p.user_id];
    const summaryLoading = isExpanded && rowSummary === undefined;
    const progress = progressState(p, weeksInL3);
    const risk = computeRisk(p, weeksInL3);
    const riskCfg = RISK_CONFIG[risk.level];

    const pct = p.goals_total > 0
      ? Math.min(100, Math.round((p.goals_completed / p.goals_total) * 100))
      : 0;

    return (
      <React.Fragment key={p.user_id}>
        <TableRow
          onClick={() => handleRowClick(p.user_id)}
          className={`border-l-4 ${rowBorderColor(p.engagement_tier)} hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
        >
          {/* Builder cell */}
          <TableCell className="pl-4 py-3">
            <div className="flex items-center gap-3">
              <div className={`relative w-10 h-10 rounded-full ${avatarColor(p.user_id)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-bold">{initials}</span>
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#C8C8C8] border border-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#1A1A1A]">
                  {p.first_name} {p.last_name}
                </div>
                {p.placement?.company ? (
                  <div className="text-xs truncate">
                    <span className="text-[#1A1A1A] font-medium">→ {p.placement.company}</span>
                    {p.placement.role ? <span className="text-[#6B7280]"> · {p.placement.role}</span> : null}
                  </div>
                ) : (
                  <div className="text-xs text-[#6B7280] truncate">{p.email}</div>
                )}
                {risk.level !== 'on_track' && risk.reasons?.length > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${riskCfg.dot}`} />
                    <span className="text-[11px] text-[#6B7280]">{risk.reasons.slice(0, 2).join(' · ')}</span>
                  </div>
                )}
              </div>
            </div>
          </TableCell>

          {/* Status */}
          <TableCell>
            {p.active
              ? <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
              : <Badge className="bg-gray-100 text-gray-600 text-xs">Inactive</Badge>
            }
          </TableCell>

          {/* Engagement */}
          <TableCell>
            <div className="space-y-1.5">
              <Badge className={`${eng.cls} text-xs px-2 py-0.5`}>{eng.label}</Badge>
              <div className="flex items-end gap-2">
                <SignalDot active={p.attendance_this_week} label="In Person" />
                <SignalDot active={p.compass_this_week}    label="Compass" />
                <SignalDot active={p.log_this_week}        label="1:1" />
              </div>
            </div>
          </TableCell>

          {/* Search Status — strand + progress combined */}
          <TableCell>
            <div className="space-y-1.5">
              {p.current_profile ? (
                <div className="text-sm font-semibold text-[#1A1A1A]">
                  {PROFILE_LABELS[p.current_profile] || p.current_profile}
                </div>
              ) : (
                <div className="text-sm text-[#6B7280]">No strand yet</div>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge className={`${PROGRESS_CONFIG[progress].cls} text-xs`}>
                  {PROGRESS_CONFIG[progress].label}
                </Badge>
                {risk.noData ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-dashed border-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    No data
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${riskCfg.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${riskCfg.dot}`} />
                    {riskCfg.short}
                  </span>
                )}
              </div>
            </div>
          </TableCell>

          {/* Cycle Progress */}
          <TableCell>
            {p.goals_total > 0 ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 bg-[#4242EA] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-xs text-[#6B7280]">{p.goals_completed}/{p.goals_total} goals</span>
              </div>
            ) : dash}
          </TableCell>

          {/* Placement */}
          <TableCell>
            {p.is_employed ? (
              <Badge className={`text-xs ${
                p.employment_type === 'full-time'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {p.employment_type
                  ? p.employment_type.charAt(0).toUpperCase() + p.employment_type.slice(1)
                  : 'Placed'}
              </Badge>
            ) : p.highest_stage && p.highest_stage !== 'prospect' ? (
              <Badge className={`${stageBadgeClass(p.highest_stage)} text-xs`}>
                {getStageLabel(p.highest_stage)}
              </Badge>
            ) : dash}
          </TableCell>

          {/* Deployed Builds */}
          <TableCell>{num(p.deployed_builds)}</TableCell>

          {/* Last Active */}
          <TableCell>
            {lastActive
              ? <span className={lastActive.red ? 'text-[#EF4444] text-sm' : 'text-sm text-[#374151]'}>{lastActive.label}</span>
              : dash
            }
          </TableCell>
        </TableRow>

        {isExpanded && (
          <TableRow className="border-l-4 border-l-[#4242EA]">
            <TableCell colSpan={8} className="p-0">
              <BuilderExpandedRow
                summary={rowSummary}
                loading={summaryLoading}
                participant={p}
                cohortId={p.cohort_id || selectedCohortId}
                token={token}
                onChange={() => setParticipantsRefresh(n => n + 1)}
              />
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  if (!selectedCohortId) {
    return <p className="text-sm text-slate-400 text-center py-8">Select a cohort to view metrics.</p>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#4242EA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Plain-English headline — hover any stat to see the builders behind it;
          filterable ones are also clickable. */}
      <div className="text-base font-semibold text-[#1A1A1A] flex flex-wrap items-center gap-x-1.5">
        <StatHover members={headlineMembers.segments} emptyText="—">{headerTotals.enrolled} builders</StatHover>
        <span className="text-[#C8C8C8]">·</span>
        <StatHover onClick={() => toggleSegment('placed')} members={headlineMembers.placed} emptyText="No placements yet">{segmentCounts.placed} placed</StatHover>
        <span className="text-[#C8C8C8]">·</span>
        <StatHover onClick={() => toggleSegment('in_transit')} members={headlineMembers.in_transit} emptyText="None in transit">{segmentCounts.in_transit} in transit</StatHover>
        <span className="text-[#C8C8C8]">·</span>
        <StatHover members={headlineMembers.interviewing} emptyText="No one interviewing">{funnel.interview} interviewing</StatHover>
        <span className="text-[#C8C8C8]">·</span>
        <StatHover onClick={() => { setSegmentFilter(null); setRiskFilter('high_risk'); setPage(1); }} danger members={headlineMembers.high_risk} emptyText="No high-risk builders">{riskMix.high_risk} high-risk</StatHover>
        {headlineMembers.goldman.length > 0 && (
          <>
            <span className="text-[#C8C8C8]">·</span>
            <StatHover members={headlineMembers.goldman} emptyText="None">{headlineMembers.goldman.length} on Goldman Demo Day</StatHover>
          </>
        )}
      </div>

      {/* Easy attendance view — most recent class day + this week's average.
          Falls back to the cohort attendance-rate average in aggregate / no daily data. */}
      <Card className="bg-white border border-[#C8C8C8]">
        <CardContent className="p-4">
          {attendanceDays ? (
            <>
            <div className="flex items-center gap-8 flex-wrap">
              <div className="flex items-baseline gap-3">
                <span className={`text-3xl font-bold ${attendanceDays.dayBeforePct >= 80 ? 'text-green-600' : attendanceDays.dayBeforePct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                  {attendanceDays.dayBeforePct}%
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-[#1A1A1A]">Last class</div>
                  <div className="text-xs text-[#6B7280]">
                    {new Date(attendanceDays.dayBeforeDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}{attendanceDays.dayBeforeAttended}/{attendanceDays.denom} attended
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#1A1A1A]">{attendanceDays.weeklyAvgPct}%</span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-[#1A1A1A]">Weekly average</div>
                  <div className="text-xs text-[#6B7280]">last 7 days · {attendanceDays.weekDayCount} class day{attendanceDays.weekDayCount !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">Attended ÷ {attendanceDays.denom} enrolled (L3+ minus placed)</div>
            </>
          ) : (
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#1A1A1A]">
                {attendanceSummary.pct != null ? `${attendanceSummary.pct}%` : '—'}
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-[#1A1A1A]">Attendance (avg)</div>
                <div className="text-xs text-[#6B7280]">
                  across {attendanceSummary.eligible} builder{attendanceSummary.eligible !== 1 ? 's' : ''} in class
                  {attendanceSummary.placedExcluded > 0 && <> · excludes {attendanceSummary.placedExcluded} placed</>}
                  {isAggregate && <> · select a single cohort for daily detail</>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active-help framing — partitions the cohort so the working set is obvious */}
      <div className="text-sm text-[#374151] bg-[#F7F7FB] border border-[#E3E3E3] rounded-lg px-3 py-2">
        Of <span className="font-semibold text-[#1A1A1A]">{jobBuckets.total}</span>:{' '}
        <span className="font-semibold text-[#4242EA]">{jobBuckets.activeSearch}</span> in active job search
        <span className="text-[#C8C8C8]"> · </span>
        <span className="font-semibold text-[#1A1A1A]">{jobBuckets.outsideHelp}</span> outside active help
        <span className="text-[#6B7280]"> ({jobBuckets.stalled} stalled · {jobBuckets.placed} placed)</span>
        <span className="text-[#9CA3AF]"> — the {jobBuckets.contract} contract/trial count in active search (convert → placed, don't → back to searching)</span>
      </div>

      {/* Lifecycle health header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-[#6B7280]">
          <span className="font-semibold text-[#1A1A1A]">{headerTotals.engaged}</span> engaged this week
        </div>
        {(segmentFilter || riskFilter !== 'all') && (
          <button
            type="button"
            onClick={() => { setSegmentFilter(null); setRiskFilter('all'); setPage(1); }}
            className="text-xs text-[#4242EA] hover:underline"
          >
            Clear filters · show all
          </button>
        )}
      </div>

      {/* Conversion (cumulative) — top of the Overview */}
      {conversion?.conversion && (
        <Card className="bg-white border border-[#C8C8C8]">
          <CardContent className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Conversion (cumulative)</div>
            <div className="flex items-center gap-2 text-sm text-[#374151] flex-wrap">
              <span className="font-semibold">{conversion.conversion.applied}</span> applied
              <span className="text-slate-400">→ {conversion.conversion.rates.appliedToInterview ?? '—'}% →</span>
              <span className="font-semibold">{conversion.conversion.interviewed}</span> interviewed
              <span className="text-slate-400">→ {conversion.conversion.rates.interviewToOffer ?? '—'}% →</span>
              <span className="font-semibold">{conversion.conversion.offered}</span> offers
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-green-700">{conversion.conversion.placed}</span> placed
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journey buckets — Learning / Deployments / Applied / Interviewing / Offers / Placed */}
      <CohortBuckets
        scoped={scoped}
        weeksInL3={weeksInL3}
        computeRisk={computeRisk}
        slackEngagement={slackEngagement}
        health={health}
        isAggregate={isAggregate}
      />

      {/* Job-search alerts — rejections, silence, and stalls (week toggle) */}
      <Card className="bg-white border border-[#C8C8C8]">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-bold text-[#1A1A1A]">Job-search alerts</span>
            <div className="flex rounded-md border border-[#E3E3E3] overflow-hidden text-xs">
              {[{ v: 0, l: 'Last 7 days' }, { v: 1, l: '8–14 days ago' }, { v: 2, l: '15–21 days ago' }].map(o => (
                <button
                  key={o.v}
                  onClick={() => setWeekOffset(o.v)}
                  className={`px-3 py-1 transition-colors ${weekOffset === o.v ? 'bg-[#4242EA] text-white' : 'bg-white text-[#6B7280] hover:bg-gray-50'}`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {weeklyActivity.rejected.length > 0 && (
            <div className="border border-red-200 bg-red-50 rounded-lg px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-red-700 mb-1">
                Rejected — last 7 days ({weeklyActivity.rejected.length})
              </div>
              <div className="space-y-0.5">
                {weeklyActivity.rejected.map(p => (
                  <div key={p.user_id} className="text-xs text-red-800">
                    <span className="font-medium">{p.first_name} {p.last_name}</span>
                    {(p.rejected_this_week_list || []).slice(0, 3).map((x, i) => (
                      <span key={i} className="text-red-500"> · {x.company || ''}{x.role ? ` (${x.role})` : ''}</span>
                    ))}
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-red-600 mt-0.5">Debrief + re-target — keep momentum after a setback.</div>
            </div>
          )}

          {weeklyActivity.noActivity.length > 0 && (
            <div className="border border-amber-200 bg-amber-50 rounded-lg px-3 py-2.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 mb-1">
                No job-search activity in the last 7 days ({weeklyActivity.noActivity.length})
              </div>
              <div className="text-xs text-amber-800">
                {weeklyActivity.noActivity.map(p => `${p.first_name} ${p.last_name}`).join(', ')}
              </div>
              <div className="text-[10px] text-amber-600 mt-0.5">Active job-seekers with no applications, interviews, or networking logged — check in.</div>
            </div>
          )}

          {conversion?.stuck?.length > 0 && (
            <div className="border-t border-[#EFEFEF] pt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Where builders are stuck (14+ days, no movement)</div>
              <div className="space-y-2">
                {conversion.stuck.map(g => (
                  <div key={g.stage} className="text-xs">
                    <div className="font-semibold text-[#1A1A1A]">{g.count} stuck at <span className="capitalize">{g.stage}</span></div>
                    <ul className="mt-0.5 space-y-0.5">
                      {g.builders.slice(0, 8).map(b => (
                        <li key={b.user_id} className="text-[#6B7280]">
                          {b.name}{b.why ? <span className="text-slate-400"> — {b.why}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance — original cohort calendar view (single cohort only; not meaningful aggregated) */}
      {isAggregate ? (
        <div className="text-xs text-slate-400 border border-dashed border-[#C8C8C8] rounded-lg px-3 py-2.5 bg-white/50">
          Attendance is per-cohort — select a single cohort to view the calendar.
        </div>
      ) : (
        <CohortDailyBreakdown
          dailyBreakdown={dailyBreakdown}
          cohort={selectedCohort?.name || ''}
          requirement={80}
          onDayClick={handleAttendanceDayClick}
          loading={false}
        />
      )}

      <DayBuilderStatusModal
        isOpen={!!attendanceDay}
        onClose={() => { setAttendanceDay(null); setDayBuilders(null); }}
        dayData={dayBuilders}
        loading={dayBuildersLoading}
      />

      {/* Table card */}
      <Card className="bg-white border border-[#C8C8C8]">
        {/* Table top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E3E3E3]">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-[#1A1A1A]">Builders</span>
            <div className="flex rounded-md border border-[#E3E3E3] overflow-hidden text-xs">
              {['active', 'all', 'withdrawn'].map(f => (
                <button
                  key={f}
                  onClick={() => { setStatusFilter(f); setPage(1); }}
                  className={`px-3 py-1 capitalize transition-colors ${
                    statusFilter === f
                      ? 'bg-[#4242EA] text-white'
                      : 'bg-white text-[#6B7280] hover:bg-gray-50'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {/* Risk triage filter */}
            <div className="flex rounded-md border border-[#E3E3E3] overflow-hidden text-xs">
              {[['all', 'All risk'], ['at_risk', 'At risk'], ['high_risk', 'High risk']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => { setRiskFilter(val); setPage(1); }}
                  className={`px-3 py-1 transition-colors ${
                    riskFilter === val
                      ? 'bg-[#4242EA] text-white'
                      : 'bg-white text-[#6B7280] hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Input
            placeholder="Search builders…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-56 text-sm h-8"
          />
        </div>

        {participants.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No Builders enrolled yet.</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <SortHead label="Builder"       sortK="name"        current={sortKey} dir={sortDir} onSort={handleSort} className="w-[220px] pl-5" />
                  <TableHead className="w-[90px]">Status</TableHead>
                  <SortHead label="Engagement"   sortK="engagement"  current={sortKey} dir={sortDir} onSort={handleSort} className="w-[160px]" />
                  <SortHead label="Search Status" sortK="progress"   current={sortKey} dir={sortDir} onSort={handleSort} className="w-[200px]" />
                  <SortHead label="Goals"        sortK="goals"       current={sortKey} dir={sortDir} onSort={handleSort} className="w-[130px]" />
                  <TableHead className="w-[150px]">Placement</TableHead>
                  <SortHead label="Deployed"     sortK="deployed_builds" current={sortKey} dir={sortDir} onSort={handleSort} className="w-[110px]" />
                  <SortHead label="Last Active"  sortK="last_active" current={sortKey} dir={sortDir} onSort={handleSort} className="w-[110px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {segmentFilter ? (
                  paged.length > 0
                    ? paged.map(renderRow)
                    : (
                      <TableRow>
                        <TableCell colSpan={8} className="py-10 text-center text-gray-400 text-sm">
                          No builders in this segment{search ? ' matching your search' : ''}.
                        </TableCell>
                      </TableRow>
                    )
                ) : visible.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-gray-400 text-sm">
                      No builders match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  SEGMENT_TIERS.map((tier) => {
                    const tierSegs = tier.segments.filter(s => groups[s] && groups[s].length > 0);
                    if (tierSegs.length === 0) return null;
                    const tierCount = tier.segments.reduce((n, s) => n + (segmentCounts[s] || 0), 0);
                    return (
                      <React.Fragment key={tier.key}>
                        <TableRow className="bg-[#EEF0FF] hover:bg-[#EEF0FF] border-l-4 border-l-[#4242EA]">
                          <TableCell colSpan={8} className="py-2 pl-5">
                            <span className="text-xs font-bold uppercase tracking-wide text-[#4242EA]">{tier.label}</span>
                            <span className="text-xs text-[#6B7280] ml-2">{tierCount} builder{tierCount !== 1 ? 's' : ''}</span>
                          </TableCell>
                        </TableRow>
                        {tierSegs.map((seg) => {
                          const rows = groups[seg];
                          const cfg = PROGRESS_CONFIG[seg];
                          return (
                            <React.Fragment key={seg}>
                              <TableRow className="bg-gray-50 hover:bg-gray-50 border-l-4 border-l-transparent">
                                <TableCell colSpan={8} className="py-2 pl-8">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                                    <span className="text-xs text-[#6B7280]">{segmentCounts[seg]} builder{segmentCounts[seg] !== 1 ? 's' : ''}</span>
                                    <span className="flex items-center gap-2.5 text-[11px]">
                                      <span className="flex items-center gap-1 text-[#6B7280]">
                                        <span className={`w-1.5 h-1.5 rounded-full ${RISK_CONFIG.on_track.dot}`} />{riskCounts[seg].on_track} on track
                                      </span>
                                      <button type="button" onClick={() => drillRisk(seg, 'at_risk')} disabled={!riskCounts[seg].at_risk}
                                        className="flex items-center gap-1 text-amber-700 enabled:hover:underline disabled:opacity-50">
                                        <span className={`w-1.5 h-1.5 rounded-full ${RISK_CONFIG.at_risk.dot}`} />{riskCounts[seg].at_risk} at risk
                                      </button>
                                      <button type="button" onClick={() => drillRisk(seg, 'high_risk')} disabled={!riskCounts[seg].high_risk}
                                        className="flex items-center gap-1 text-red-600 enabled:hover:underline disabled:opacity-50">
                                        <span className={`w-1.5 h-1.5 rounded-full ${RISK_CONFIG.high_risk.dot}`} />{riskCounts[seg].high_risk} high-risk
                                      </button>
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                              {rows.map(renderRow)}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Footer: pagination in single-segment mode, total count when grouped */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#E3E3E3]">
              {segmentFilter ? (
                <>
                  <span className="text-sm text-[#6B7280]">
                    Showing {visible.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, visible.length)} of {visible.length} {PROGRESS_CONFIG[segmentFilter].label}{riskFilter !== 'all' ? ` · ${RISK_CONFIG[riskFilter].label}` : ''} Builders
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</Button>
                  </div>
                </>
              ) : (
                <span className="text-sm text-[#6B7280]">
                  {visible.length} {riskFilter !== 'all' ? `${RISK_CONFIG[riskFilter].label} ` : ''}Builder{visible.length !== 1 ? 's' : ''}{riskFilter === 'all' ? ` across ${SEGMENT_ORDER.filter(s => groups[s]?.length).length} segments` : ''}
                </span>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default BuilderMetricsTab;
