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

const progressState = (p, weeksInL3) => {
  if (p.is_employed) return 'placed';

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
  active:      { label: 'Moving',      cls: 'bg-blue-50 text-blue-700' },
  in_pipeline: { label: 'In Pipeline', cls: 'bg-[#4242EA]/10 text-[#4242EA]' },
  placed:      { label: 'Placed',      cls: 'bg-green-100 text-green-700' },
};

const riskFlag = (p, weeksInL3) => {
  const buildStrands = ['demonstrator', 'builder_entrepreneur'];
  if (p.deployed_builds === 0 && buildStrands.includes(p.current_profile)) return 'No active build';
  const lastMs = p.last_activity ? Date.now() - new Date(p.last_activity) : Infinity;
  if (lastMs > 14 * 86_400_000 && p.engagement_tier !== 'engaged') return 'Gone dark';
  if (weeksInL3 > 8 && p.application_count === 0) return 'No applications';
  return null;
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

// ── Summary strip ─────────────────────────────────────────────────────────────

const StatCard = ({ number, label, subtitle }) => (
  <Card className="bg-white border border-[#C8C8C8]">
    <CardContent className="p-4 text-center">
      <div className="text-3xl font-bold text-[#4242EA]">{number}</div>
      <div className="text-xs text-[#6B7280] mt-1">{label}</div>
      {subtitle && <div className="text-[10px] text-[#C8C8C8] mt-0.5">{subtitle}</div>}
    </CardContent>
  </Card>
);

// ── Main component ────────────────────────────────────────────────────────────

const BuilderMetricsTab = ({ selectedCohortId, cohorts }) => {
  const token = useAuthStore((s) => s.token);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [summaries, setSummaries] = useState({});
  const fetchingRef = useRef(new Set());
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const selectedCohort = useMemo(
    () => cohorts?.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );

  const weeksInL3 = useMemo(
    () => weeksFromCohortName(selectedCohort?.name),
    [selectedCohort]
  );

  useEffect(() => {
    if (!selectedCohortId || !token) return;
    setLoading(true);
    setPage(1);
    fetch(`${API_BASE}/api/external-cohorts/${selectedCohortId}/participants`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setParticipants(Array.isArray(data) ? data : []))
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false));
  }, [selectedCohortId, token]);

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

  const PROGRESS_ORDER = { stalled: 0, active: 1, in_pipeline: 2, placed: 3 };
  const ENGAGEMENT_ORDER = { no_data: 0, not_engaged: 1, engaged: 2 };

  const filtered = useMemo(() => {
    let list = participants;
    if (statusFilter === 'active')    list = list.filter(p => p.active);
    if (statusFilter === 'withdrawn') list = list.filter(p => !p.active);
    const q = search.toLowerCase();
    if (q) list = list.filter(
      p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
           (p.email || '').toLowerCase().includes(q)
    );

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
  }, [participants, search, statusFilter, sortKey, sortDir, weeksInL3]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => ({
    enrolled:   participants.filter(p => p.active).length,
    engaged:    participants.filter(p => p.engagement_tier === 'engaged').length,
    searching:  participants.filter(p => ['active', 'in_pipeline'].includes(progressState(p, weeksInL3))).length,
    placed:     participants.filter(p => p.is_employed).length,
  }), [participants, weeksInL3]);

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
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard number={summary.enrolled}   label="enrolled" />
        <StatCard number={summary.engaged}    label="engaged this week" />
        <StatCard number={summary.searching}  label="in search" subtitle="Moving or In Pipeline" />
        <StatCard number={summary.placed}     label="placed" />
      </div>

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
                {paged.map((p) => {
                  const eng = engagementBadge(p.engagement_tier);
                  const lastActive = formatLastActive(p.last_activity);
                  const initials = getInitials(p.first_name, p.last_name);
                  const isExpanded = expandedUserId === p.user_id;
                  const summary = summaries[p.user_id];
                  const summaryLoading = isExpanded && summary === undefined;
                  const progress = progressState(p, weeksInL3);
                  const flag = riskFlag(p, weeksInL3);

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
                              <div className="text-xs text-[#6B7280]">{p.email}</div>
                              {flag && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                  <span className="text-[11px] text-red-500">{flag}</span>
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
                            <Badge className={`${PROGRESS_CONFIG[progress].cls} text-xs`}>
                              {PROGRESS_CONFIG[progress].label}
                            </Badge>
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
                            <BuilderExpandedRow summary={summary} loading={summaryLoading} participant={p} />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#E3E3E3]">
              <span className="text-sm text-[#6B7280]">
                Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} Builders
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default BuilderMetricsTab;
