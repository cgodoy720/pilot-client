import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/badge';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7001';

const INITIATIVE_STATUSES = ['selected', 'in_process', 'placed', 'dropped'];

const cohortShorthand = (cohortName) => {
  if (!cohortName) return null;
  const clean = cohortName.replace(/\s*L3\+.*$/i, '').trim();
  const match = clean.match(/^(\w+)\s+(\d{4})$/);
  if (!match) return clean;
  return `${match[1].slice(0, 1).toUpperCase()}${match[2].slice(2)}`;
};

const PROFILE_LABELS = {
  connector:            'Connector',
  demonstrator:         'Demonstrator',
  presence_builder:     'Presence Builder',
  skill_sharpener:      'Skill Sharpener',
  builder_entrepreneur: 'Entrepreneur',
};

const cycleStatusBadge = (status) => {
  if (status === 'active')    return 'bg-blue-100 text-blue-700';
  if (status === 'completed') return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-500';
};

const logTypeBadge = (type) => {
  const map = {
    check_in:    'bg-blue-50 text-blue-600',
    behavioral:  'bg-red-50 text-red-600',
    milestone:   'bg-green-50 text-green-700',
    note:        'bg-gray-100 text-gray-600',
  };
  return map[type] || 'bg-gray-100 text-gray-500';
};

const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const keywordsFromGoals = (goals) => {
  if (!goals?.length) return [];
  return goals.flatMap(g =>
    (g.goal_text || '').split(/\s+/).filter(w => w.length >= 3).map(w => w.toLowerCase())
  );
};

const logMentionsGoal = (log, keywords) => {
  if (!keywords.length) return false;
  const text = `${log.notes || ''} ${log.next_steps || ''}`.toLowerCase();
  return keywords.some(kw => text.includes(kw));
};

// ── Compass Panel ─────────────────────────────────────────────────────────────

const GoalRow = ({ goal }) => {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const pct = goal.target_count > 0
    ? Math.min(100, Math.round((goal.progress_count / goal.target_count) * 100))
    : 0;

  return (
    <li className="space-y-1">
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 flex-shrink-0 w-3 h-3 rounded-full border ${goal.is_completed ? 'bg-[#4242EA] border-[#4242EA]' : 'border-[#C8C8C8]'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[#1A1A1A]">{goal.goal_text}</span>
            <span className="text-xs text-[#6B7280]">{goal.progress_count}/{goal.target_count}</span>
            {goal.is_completed && (
              <Badge className="bg-green-100 text-green-700 text-xs">Completed</Badge>
            )}
          </div>
          <div className="mt-1 w-32 h-1 bg-gray-100 rounded-full">
            <div className="h-1 bg-[#4242EA] rounded-full" style={{ width: `${pct}%` }} />
          </div>
          {goal.is_completed && goal.completion_evidence && (
            <button
              onClick={() => setEvidenceOpen(o => !o)}
              className="mt-1 text-xs text-[#4242EA] hover:underline"
            >
              {evidenceOpen ? 'Hide evidence' : 'Show evidence'}
            </button>
          )}
          {evidenceOpen && goal.completion_evidence && (
            <p className="mt-1 text-xs text-[#6B7280] bg-gray-50 rounded px-2 py-1">{goal.completion_evidence}</p>
          )}
        </div>
      </div>
    </li>
  );
};

const CompassPanel = ({ compass }) => {
  const [historyOpen, setHistoryOpen] = useState(false);

  if (!compass) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400 py-8">
        Builder hasn't started Compass yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Cycle header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[#6B7280]">Cycle {compass.cycle_number ?? '—'}</span>
        {compass.cycle_status && (
          <Badge className={`${cycleStatusBadge(compass.cycle_status)} text-xs`}>
            {compass.cycle_status.charAt(0).toUpperCase() + compass.cycle_status.slice(1)}
          </Badge>
        )}
        {compass.current_profile && (
          <span className="text-xs font-medium text-[#4242EA]">
            {PROFILE_LABELS[compass.current_profile] || compass.current_profile}
          </span>
        )}
      </div>

      {/* Recommendation reasoning */}
      {compass.recommendation_reasoning && (
        <p className="text-sm text-[#374151] leading-relaxed">{compass.recommendation_reasoning}</p>
      )}

      {/* Goals */}
      {compass.goals?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-[#1A1A1A] mb-2">Goals this cycle</div>
          <ul className="space-y-3">
            {compass.goals.map((g, i) => <GoalRow key={i} goal={g} />)}
          </ul>
        </div>
      )}

      {/* History */}
      {compass.history?.length > 0 && (
        <div>
          <button
            onClick={() => setHistoryOpen(o => !o)}
            className="text-xs text-[#4242EA] hover:underline"
          >
            {historyOpen ? 'Hide history' : `Show history (${compass.history.length} cycle${compass.history.length > 1 ? 's' : ''})`}
          </button>
          {historyOpen && (
            <ul className="mt-2 space-y-1">
              {compass.history.map((h, i) => (
                <li key={i} className="text-xs text-[#6B7280]">
                  Cycle {h.cycle_number} — {PROFILE_LABELS[h.profile] || h.profile} —{' '}
                  {h.completed_goals}/{h.total_goals} goals —{' '}
                  {fmtDate(h.start_date)} to {fmtDate(h.end_date)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// ── Log Panel ─────────────────────────────────────────────────────────────────

const LogPanel = ({ logs, compassGoals }) => {
  const keywords = keywordsFromGoals(compassGoals);

  if (!logs?.length) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400 py-8">
        No log entries yet.
      </div>
    );
  }

  const flags = logs.filter(l =>
    l.log_type === 'behavioral' || l.support_ticket
  );
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - 30);
  const checkIns = logs.filter(l =>
    l.log_type !== 'behavioral' && !l.support_ticket &&
    new Date(l.interaction_date || l.created_at) >= recentCutoff
  );

  // Most recent log with next_steps
  const withNextSteps = logs.find(l => l.next_steps?.trim());

  return (
    <div className="space-y-4">
      {/* Flags */}
      {flags.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-[#1A1A1A] mb-2">Flags</div>
          <ul className="space-y-2">
            {flags.map((l) => {
              if (logMentionsGoal(l, keywords)) {
                return (
                  <li key={l.log_id} className="text-xs text-[#6B7280] italic">
                    {fmtDate(l.interaction_date || l.created_at)} — see plan
                  </li>
                );
              }
              return (
                <li key={l.log_id} className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7280]">{fmtDate(l.interaction_date || l.created_at)}</span>
                    {l.support_ticket && (
                      <Badge className="bg-red-50 text-red-600 text-xs">{l.support_ticket.support_category}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#374151] line-clamp-2">{l.notes}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Recent check-ins */}
      {checkIns.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-[#1A1A1A] mb-2">Recent Check-ins</div>
          <ul className="space-y-2">
            {checkIns.map((l) => {
              if (logMentionsGoal(l, keywords)) {
                return (
                  <li key={l.log_id} className="text-xs text-[#6B7280] italic">
                    {fmtDate(l.interaction_date || l.created_at)} — see plan
                  </li>
                );
              }
              return (
                <li key={l.log_id} className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7280]">{fmtDate(l.interaction_date || l.created_at)}</span>
                    <Badge className={`${logTypeBadge(l.log_type)} text-xs`}>
                      {(l.log_type || '').replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#374151] line-clamp-2">{l.notes}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Next steps */}
      {withNextSteps && (
        <div>
          <div className="text-xs font-semibold text-[#1A1A1A] mb-1">Next Steps</div>
          <p className="text-sm text-[#374151]">{withNextSteps.next_steps}</p>
        </div>
      )}
    </div>
  );
};

// ── Initiative tag control ──────────────────────────────────────────────────
// Flags a builder into a special initiative (Goldman / Mizuho / JPMC / …) in the
// DB at selection time — the persisted source the "Special initiatives" highlight reads.

const InitiativeTagControl = ({ participant, cohortId, token, onChange }) => {
  const userId = participant?.user_id;
  const initiatives = participant?.initiatives || [];

  const [options, setOptions] = useState([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('selected');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  // Fetch the picklist once when the add form is first opened.
  useEffect(() => {
    if (!adding || options.length || !token) return;
    fetch(`${API_BASE}/api/external-cohorts/initiatives/options`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => setOptions(Array.isArray(j.options) ? j.options : []))
      .catch(() => setOptions([]));
  }, [adding, options.length, token]);

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const save = async () => {
    const initiative_name = name.trim();
    if (!initiative_name || !cohortId || !userId || busy) return;
    setBusy(true);
    try {
      await fetch(`${API_BASE}/api/external-cohorts/${cohortId}/builders/${userId}/initiative`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ initiative_name, status, notes: notes.trim() || null }),
      });
      setAdding(false); setName(''); setStatus('selected'); setNotes('');
      onChange?.();
    } catch { /* ignore */ }
    setBusy(false);
  };

  const remove = async (initiative_name) => {
    if (!cohortId || !userId || busy) return;
    setBusy(true);
    try {
      // Idempotent: a synthesized Goldman-bridge entry has no DB row, so this no-ops
      // and the bridge re-adds it on refresh (acceptable — staff tag the real selection).
      await fetch(
        `${API_BASE}/api/external-cohorts/${cohortId}/builders/${userId}/initiative?initiative_name=${encodeURIComponent(initiative_name)}`,
        { method: 'DELETE', headers: authHeaders },
      );
      onChange?.();
    } catch { /* ignore */ }
    setBusy(false);
  };

  return (
    <div className="px-6 py-3 border-b border-[#E3E3E3] bg-white">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide mr-1">Initiatives</span>
        {initiatives.length === 0 && !adding && (
          <span className="text-xs text-[#9CA3AF]">None flagged</span>
        )}
        {initiatives.map((it, i) => (
          <Badge key={`${it.initiative_name}-${i}`} variant="secondary" className="gap-1 bg-[#EEF0FF] text-[#4242EA] border border-[#D8DBFF]">
            {it.initiative_name}
            {it.status && it.status !== 'selected' ? <span className="opacity-70">· {it.status.replace(/_/g, ' ')}</span> : null}
            <button
              type="button"
              onClick={() => remove(it.initiative_name)}
              disabled={busy}
              className="ml-0.5 text-[#4242EA]/60 hover:text-[#4242EA] disabled:opacity-40"
              aria-label={`Remove ${it.initiative_name}`}
            >×</button>
          </Badge>
        ))}
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-xs font-medium text-[#4242EA] hover:underline"
          >+ Add</button>
        )}
      </div>

      {adding && (
        <div className="flex items-center flex-wrap gap-2 mt-2">
          <input
            list="initiative-options"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Initiative (e.g. Mizuho)"
            className="text-sm border border-[#C8C8C8] rounded px-2 py-1 w-48"
          />
          <datalist id="initiative-options">
            {options.map(o => <option key={o} value={o} />)}
          </datalist>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="text-sm border border-[#C8C8C8] rounded px-2 py-1 capitalize"
          >
            {INITIATIVE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="text-sm border border-[#C8C8C8] rounded px-2 py-1 flex-1 min-w-[8rem]"
          />
          <button
            type="button"
            onClick={save}
            disabled={busy || !name.trim()}
            className="text-xs font-semibold text-white bg-[#4242EA] rounded px-3 py-1 disabled:opacity-40"
          >{busy ? 'Saving…' : 'Save'}</button>
          <button
            type="button"
            onClick={() => { setAdding(false); setName(''); setNotes(''); }}
            className="text-xs text-[#6B7280] hover:underline"
          >Cancel</button>
        </div>
      )}
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────

const BuilderExpandedRow = ({ summary, loading, participant, cohortId, token, onChange }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-4 border-[#4242EA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!summary) return null;

  const shorthand = cohortShorthand(participant?.cohort);

  const p = participant || {};

  return (
    <div className="bg-gray-50">
      {/* Job search metrics strip */}
      <div className="flex gap-8 px-6 py-4 border-b border-[#E3E3E3]">
        <div>
          <div className="text-xs text-[#6B7280] mb-0.5">Applications</div>
          <div className="text-xl font-bold text-[#1A1A1A]">{p.application_count || 0}</div>
          {p.highest_stage && p.highest_stage !== 'prospect' && (
            <div className="text-xs text-[#6B7280] mt-0.5 capitalize">
              Highest: {p.highest_stage.replace(/_/g, ' ')}
            </div>
          )}
        </div>
        <div>
          <div className="text-xs text-[#6B7280] mb-0.5">Hustles</div>
          <div className="text-xl font-bold text-[#1A1A1A]">{p.hustle_count || 0}</div>
        </div>
        {p.deployed_builds > 0 && (
          <div>
            <div className="text-xs text-[#6B7280] mb-0.5">Deployed Builds</div>
            <div className="text-xl font-bold text-[#4242EA]">{p.deployed_builds}</div>
          </div>
        )}
      </div>

      {/* Initiative tagging — flag at selection time (Goldman / Mizuho / JPMC / …) */}
      {cohortId && participant?.user_id && (
        <InitiativeTagControl
          participant={participant}
          cohortId={cohortId}
          token={token}
          onChange={onChange}
        />
      )}

      {/* Detail panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">Compass Plan</div>
            {shorthand && <span className="text-xs text-[#6B7280]">{shorthand}</span>}
          </div>
          <CompassPanel compass={summary.compass} />
        </div>
        <div>
          <div className="text-xs font-bold text-[#1A1A1A] mb-3 uppercase tracking-wide">Staff Log</div>
          <LogPanel logs={summary.logs} compassGoals={summary.compass?.goals} />
        </div>
      </div>
    </div>
  );
};

export default BuilderExpandedRow;
