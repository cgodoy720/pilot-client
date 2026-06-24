import React, { useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/card';

// Journey buckets for the Overview. Learning + Deployments are cross-cutting (a
// builder can be in them AND a job stage); the four job stages are mutually
// exclusive by furthest stage (mirrors the conversion funnel).
const BUCKETS = [
  { id: 'learning',     label: 'Learning',     accent: 'bg-slate-100 text-slate-700' },
  { id: 'deployments',  label: 'Deployments',  accent: 'bg-indigo-100 text-indigo-700' },
  { id: 'applied',      label: 'Applied',      accent: 'bg-blue-50 text-blue-700' },
  { id: 'interviewing', label: 'Interviewing', accent: 'bg-[#4242EA]/10 text-[#4242EA]' },
  { id: 'offers',       label: 'Offers',       accent: 'bg-amber-100 text-amber-700' },
  { id: 'contract',     label: 'Contract/trial', accent: 'bg-orange-100 text-orange-700' },
  { id: 'placed',       label: 'Placed',       accent: 'bg-green-100 text-green-700' },
];

const nm = (b) => `${b.first_name} ${b.last_name}`.trim();
const IN_TRANSIT_TYPES = new Set(['contract', 'apprenticeship', 'internship', 'part-time', 'temporary', 'temp']);
const isInTransit = (b) => !!b.is_employed && (/apprentice|intern/i.test(b.placement?.role || '') || IN_TRANSIT_TYPES.has((b.placement?.job_type || '').toLowerCase()));
const hasJob = (b) => !!b.is_employed || b.highest_stage === 'accepted' || (b.jobs_placed || 0) > 0;
const isContract = (b) => hasJob(b) && isInTransit(b);          // employed, contract/trial — still converting
const isPermanentPlaced = (b) => hasJob(b) && !isInTransit(b);  // full-time / permanent placement
const recentlyActive = (b) => {
  if (!b.last_activity) return false;
  return (Date.now() - new Date(b.last_activity).getTime()) < 7 * 86_400_000;
};
const onPlatform = (b) => !!(b.compass_this_week || b.attendance_this_week || b.log_this_week || recentlyActive(b));

// Which buckets a builder belongs to (membership only — overlap allowed).
const membership = (b, slackEngagement) => {
  const onSlack = !!slackEngagement?.[b.user_id];
  const m = new Set();
  if (onPlatform(b) || onSlack) m.add('learning');
  if ((b.initiatives || []).length > 0) m.add('deployments');
  if (b.highest_stage === 'applied') m.add('applied');
  if (['screen', 'oa', 'interview'].includes(b.highest_stage)) m.add('interviewing');
  if (b.highest_stage === 'offer') m.add('offers');
  if (isContract(b)) m.add('contract');
  if (isPermanentPlaced(b)) m.add('placed');
  return m;
};

// Short "activities they've done" string per builder for a given bucket.
const activitiesFor = (bucketId, b, slackEngagement) => {
  const parts = [];
  if (bucketId === 'learning') {
    if (b.compass_this_week) parts.push('Compass this week');
    if (b.attendance_this_week) parts.push('Attended');
    if (b.log_this_week) parts.push('Coach log');
    const sl = slackEngagement?.[b.user_id];
    if (sl) parts.push(`Slack ×${sl.count}`);
    if (!parts.length && recentlyActive(b)) parts.push('Active on platform');
  } else if (bucketId === 'deployments') {
    (b.initiatives || []).forEach(i => parts.push(i.status && i.status !== 'selected' ? `${i.initiative_name} · ${i.status}` : i.initiative_name));
    if (b.deployed_builds > 0) parts.push(`${b.deployed_builds} deployed`);
    else if (b.demo_build?.name) parts.push(b.demo_build.name);
  } else if (bucketId === 'applied') {
    parts.push(`${b.application_count || 0} application${(b.application_count || 0) === 1 ? '' : 's'}`);
    const recent = (b.applied_this_week_list || []).map(x => x.company).filter(Boolean).slice(0, 3);
    if (recent.length) parts.push(`this week: ${recent.join(', ')}`);
  } else if (bucketId === 'interviewing') {
    const iv = (b.interviewed_this_week_list || [])[0] || b.top_application;
    if (iv) parts.push([iv.company, iv.role, iv.stage].filter(Boolean).join(' · '));
    else parts.push('In interview process');
  } else if (bucketId === 'offers') {
    const t = b.top_application;
    parts.push(t?.company ? `Offer · ${[t.company, t.role].filter(Boolean).join(' · ')}` : 'Has an offer');
  } else if (bucketId === 'contract') {
    const p = b.placement;
    parts.push(p?.company ? `${[p.company, p.role].filter(Boolean).join(' · ')} — contract/trial` : 'Contract/trial — converting');
  } else if (bucketId === 'placed') {
    const p = b.placement;
    parts.push(p?.company ? [p.company, p.role].filter(Boolean).join(' · ') : 'Placed');
  }
  return parts.join(' · ');
};

const RISK_PILL = {
  high_risk: 'bg-red-50 text-red-600',
  at_risk:   'bg-amber-50 text-amber-700',
};

// ── Builder Health: Attendance / Learning / Hustling over last 7 curriculum days ──
const DOT = { green: 'bg-green-500', yellow: 'bg-amber-500', red: 'bg-red-500', waived: 'bg-slate-200', tbd: 'bg-slate-300' };
const LEVEL_CHIP = {
  green: 'bg-green-100 text-green-700', yellow: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-600', waived: 'bg-slate-100 text-slate-400', tbd: 'bg-slate-100 text-slate-400',
};
const score = (n) => (n >= 2 ? 'green' : n === 1 ? 'yellow' : 'red'); // 2+/1/0 = green/yellow/red

// Compose a builder's health verdict from raw counts + stage waivers.
const healthOf = (b, counts) => {
  const initiatives = b.initiatives || [];
  const deploymentPlaced = initiatives.some(i => i.status === 'placed');
  const fullTime = isPermanentPlaced(b);     // permanent placement → all waived, green
  const contract = isContract(b);            // contract/trial → still converting (hustle only)
  const activeDeployment = !fullTime && !contract && !deploymentPlaced && initiatives.length > 0;
  const c = counts || { attended: 0, learning_days: 0, hustle_events: 0 };
  const hustling = score(c.hustle_events || 0);

  if (fullTime) return { attendance: 'waived', learning: 'waived', hustling: 'waived', overall: 'green', high_risk: false, note: 'Placed full-time — health waived' };
  if (deploymentPlaced) return { attendance: 'waived', learning: 'waived', hustling: 'waived', overall: 'tbd', high_risk: false, note: 'In deployment — activity TBD' };
  if (contract) return { attendance: 'waived', learning: 'waived', hustling, overall: hustling, high_risk: false, note: 'Contract/trial — converting (hustle only)' };

  const attendance = score(c.attended || 0);
  const learning = activeDeployment ? 'waived' : score(c.learning_days || 0);
  const active = [attendance, learning, hustling].filter(d => d !== 'waived');
  const overall = active.includes('red') ? 'red' : active.includes('yellow') ? 'yellow' : 'green';
  const high_risk = !activeDeployment && (c.learning_days || 0) === 0 && (c.attended || 0) === 0;
  return { attendance, learning, hustling, overall, high_risk, note: activeDeployment ? 'Active deployment — learning waived' : null };
};

const CohortBuckets = ({ scoped, weeksInL3, computeRisk, slackEngagement, health, isAggregate }) => {
  // Group builders into buckets + split Learning into its two sub-groups.
  const grouped = useMemo(() => {
    const g = Object.fromEntries(BUCKETS.map(b => [b.id, []]));
    const learnSub = { platform: [], slack: [] };
    (scoped || []).forEach(b => {
      const m = membership(b, slackEngagement);
      BUCKETS.forEach(bk => { if (m.has(bk.id)) g[bk.id].push(b); });
      if (m.has('learning')) {
        if (onPlatform(b)) learnSub.platform.push(b);
        if (slackEngagement?.[b.user_id]) learnSub.slack.push(b);
      }
    });
    return { g, learnSub };
  }, [scoped, slackEngagement]);

  const riskOf = (b) => computeRisk(b, weeksInL3);
  const healthSummary = useMemo(() => {
    const s = { green: 0, yellow: 0, red: 0, tbd: 0 };
    (scoped || []).forEach(b => { const o = healthOf(b, health?.[b.user_id]).overall; s[o] = (s[o] || 0) + 1; });
    return s;
  }, [scoped, health]);

  const Row = ({ b, bucketId }) => {
    const counts = health?.[b.user_id];
    const h = healthOf(b, counts);
    const r = riskOf(b);
    const action = h.high_risk
      ? 'Inactive 7 days — check in'
      : (b.next_action || (r.level !== 'on_track' ? (r.type || (r.reasons && r.reasons[0])) : null));
    const activity = activitiesFor(bucketId, b, slackEngagement);
    const tip = counts
      ? `Attendance ${counts.attended}/${counts.curriculum_days || 7} · Learning ${counts.learning_days} · Hustling ${counts.hustle_events}${h.note ? ` · ${h.note}` : ''}`
      : (h.note || 'No health data');
    return (
      <div className="flex items-start justify-between gap-2 py-1.5 border-t border-[#F0F0F0] first:border-t-0">
        <div className="min-w-0">
          <div className="text-sm font-medium text-[#1A1A1A]">
            {nm(b)}
            {isAggregate && b.cohort_name ? <span className="text-[11px] font-normal text-slate-400"> · {b.cohort_name}</span> : null}
          </div>
          {activity && <div className="text-xs text-[#6B7280]">{activity}</div>}
          {action && <div className="text-[11px] text-[#4242EA] mt-0.5">→ {action}</div>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0" title={tip}>
          <span className={`w-2.5 h-2.5 rounded-full ${DOT[h.overall] || DOT.tbd}`} />
          <div className="flex items-center gap-0.5">
            {[['A', h.attendance], ['L', h.learning], ['H', h.hustling]].map(([ltr, lv]) => (
              <span key={ltr} className={`text-[9px] font-bold w-4 h-4 rounded flex items-center justify-center ${LEVEL_CHIP[lv] || LEVEL_CHIP.tbd}`}>{ltr}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm font-bold text-[#1A1A1A]">Where builders are — by journey stage</div>
        <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
          <span className="font-semibold text-[#1A1A1A]">Builder health:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />{healthSummary.green}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />{healthSummary.yellow}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{healthSummary.red}</span>
          {healthSummary.tbd > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" />{healthSummary.tbd} TBD</span>}
          <span className="text-slate-400">· dots = A(ttendance) L(earning) H(ustling), last 7 class days</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
        {BUCKETS.map(bk => {
          const list = grouped.g[bk.id];
          const atRisk = list.filter(b => { const o = healthOf(b, health?.[b.user_id]).overall; return o === 'red' || o === 'yellow'; }).length;
          return (
            <Card key={bk.id} className="bg-white border border-[#C8C8C8]">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bk.accent}`}>{bk.label}</span>
                    <span className="text-sm font-semibold text-[#1A1A1A]">{list.length}</span>
                  </span>
                  {atRisk > 0 && <span className="text-[11px] text-amber-700">{atRisk} need attention</span>}
                </div>
                <div className="overflow-y-auto max-h-64 pr-1">
                  {list.length === 0 ? (
                    <div className="text-xs text-slate-400 py-1">No builders.</div>
                  ) : bk.id === 'learning' ? (
                    <div className="space-y-2">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">On the platform ({grouped.learnSub.platform.length})</div>
                        {grouped.learnSub.platform.length === 0
                          ? <div className="text-xs text-slate-400">None this week.</div>
                          : grouped.learnSub.platform.map(b => <Row key={b.user_id} b={b} bucketId="learning" />)}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">On Slack with Stef ({grouped.learnSub.slack.length})</div>
                        {grouped.learnSub.slack.length === 0
                          ? <div className="text-xs text-slate-400">No Slack activity matched this week.</div>
                          : grouped.learnSub.slack.map(b => <Row key={b.user_id} b={b} bucketId="learning" />)}
                      </div>
                    </div>
                  ) : (
                    list.map(b => <Row key={b.user_id} b={b} bucketId={bk.id} />)
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CohortBuckets;
