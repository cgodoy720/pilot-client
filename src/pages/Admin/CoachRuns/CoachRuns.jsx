import React, { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../../../stores/authStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { listCoachRuns, getCoachRun } from '../../../services/coachRunsApi';

const BRAND = '#4242EA';

// Order + display labels for the v2 coach graph nodes.
const NODE_META = {
  init:          { label: 'Init',           color: 'bg-slate-100 text-slate-700 border-slate-300' },
  learn:         { label: 'Learn',          color: 'bg-blue-100 text-blue-700 border-blue-300' },
  generateApply: { label: 'Generate Apply', color: 'bg-violet-100 text-violet-700 border-violet-300' },
  apply:         { label: 'Apply',          color: 'bg-amber-100 text-amber-700 border-amber-300' },
  grade:         { label: 'Grade',          color: 'bg-rose-100 text-rose-700 border-rose-300' },
  remediate:     { label: 'Remediate',      color: 'bg-orange-100 text-orange-700 border-orange-300' },
  complete:      { label: 'Complete',       color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
};

const fmtTime = (ts) => (ts ? new Date(ts).toLocaleString() : '—');
const fmtMs = (ms) => (ms == null ? '—' : `${ms.toLocaleString()} ms`);
const fmtNum = (n) => (n == null ? '—' : Number(n).toLocaleString());

/** Collapsible labeled text panel (system prompt, raw output, etc.) */
const Panel = ({ title, children, mono = true, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  if (children == null || children === '') return null;
  return (
    <div className="border border-[#E3E3E3] rounded-md overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#F7F7F9] hover:bg-[#EFEFF3] text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</span>
        <span className="text-slate-400 text-xs">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <pre
          className={`px-3 py-2 text-xs text-slate-800 whitespace-pre-wrap break-words max-h-96 overflow-auto bg-white ${mono ? 'font-mono' : ''}`}
        >
          {typeof children === 'string' ? children : JSON.stringify(children, null, 2)}
        </pre>
      )}
    </div>
  );
};

const Chip = ({ children, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 border-slate-300',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    red: 'bg-rose-100 text-rose-700 border-rose-300',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${tones[tone]}`}>
      {children}
    </span>
  );
};

/** Renders the grade node's criteria scores as a table. */
const CriteriaTable = ({ criteriaScores }) => {
  if (!Array.isArray(criteriaScores) || criteriaScores.length === 0) return null;
  return (
    <div className="border border-[#E3E3E3] rounded-md overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-[#F7F7F9] text-slate-600">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Criterion</th>
            <th className="text-left px-3 py-2 font-semibold w-16">Score</th>
            <th className="text-left px-3 py-2 font-semibold w-16">Met</th>
            <th className="text-left px-3 py-2 font-semibold">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {criteriaScores.map((c, i) => (
            <tr key={i} className="border-t border-[#EEE]">
              <td className="px-3 py-2 text-slate-800">{c.criterion || '—'}</td>
              <td className="px-3 py-2 text-slate-800">{c.score ?? '—'}</td>
              <td className="px-3 py-2">
                {c.met ? <Chip tone="green">yes</Chip> : <Chip tone="red">no</Chip>}
              </td>
              <td className="px-3 py-2 text-slate-600">{c.evidence || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** One agent step in the timeline. */
const StepCard = ({ step }) => {
  const meta = NODE_META[step.node] || { label: step.node, color: 'bg-slate-100 text-slate-700 border-slate-300' };
  const sr = step.structured_result || {};
  const isGrade = step.node === 'grade';

  return (
    <div className="relative pl-8 pb-6">
      {/* timeline rail + dot */}
      <div className="absolute left-2.5 top-2 bottom-0 w-px bg-[#E3E3E3]" />
      <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 ${meta.color}`} />

      <div className="bg-white border border-[#E3E3E3] rounded-lg p-4 shadow-sm">
        {/* header */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-[11px] text-slate-400">
            {step.phase_in}{step.phase_out && step.phase_out !== step.phase_in ? ` → ${step.phase_out}` : ''}
          </span>
          <span className="flex-1" />
          {step.model && <Chip>{step.model}</Chip>}
          <Chip>{fmtMs(step.latency_ms)}</Chip>
          {step.total_tokens != null && <Chip>{fmtNum(step.total_tokens)} tok</Chip>}
        </div>

        {/* markers / quick facts */}
        <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-slate-500">
          {step.learn_turn_count != null && step.node === 'learn' && <span>turn {step.learn_turn_count}</span>}
          {step.attempt_number != null && <span>attempt {step.attempt_number}</span>}
          {sr.readyForApply === true && <Chip tone="green">READY_FOR_APPLY</Chip>}
          {sr.applySubmitted === true && <Chip tone="green">APPLY_SUBMITTED</Chip>}
          {typeof sr.overallScore === 'number' && (
            <Chip tone={sr.passed ? 'green' : 'red'}>score {sr.overallScore} · {sr.passed ? 'passed' : 'failed'}</Chip>
          )}
          {sr.applyMode && <span>mode: {sr.applyMode}</span>}
          {step.thinking_label && <span className="italic">“{step.thinking_label}”</span>}
          <span className="ml-auto">{fmtTime(step.created_at)}</span>
        </div>

        {/* grade criteria table inline */}
        {isGrade && sr.criteriaScores && (
          <div className="mb-3">
            <CriteriaTable criteriaScores={sr.criteriaScores} />
            {sr.feedback && <p className="mt-2 text-xs text-slate-600 italic">{sr.feedback}</p>}
          </div>
        )}

        {/* collapsible detail panels */}
        <div className="space-y-2">
          {step.user_message && <Panel title="Builder Input">{step.user_message}</Panel>}
          <Panel title="System Prompt">{step.system_prompt}</Panel>
          {step.raw_output && step.raw_output !== step.visible_output && (
            <Panel title="Raw LLM Output (pre-strip)">{step.raw_output}</Panel>
          )}
          {step.visible_output && <Panel title="Visible Output" defaultOpen>{step.visible_output}</Panel>}
          <Panel title="Structured Result">{sr}</Panel>
          {step.error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2">
              Error: {step.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RunDetail = ({ token, threadId }) => {
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCoachRun(token, threadId);
      setRun(data);
    } catch (e) {
      setError(e.message || 'Failed to load run');
    } finally {
      setLoading(false);
    }
  }, [token, threadId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading run…</div>;
  if (error) return <div className="p-8 text-rose-600 text-sm">{error}</div>;
  if (!run) return null;

  const id = run.identity || {};
  const totals = run.usageTotals || {};

  return (
    <div className="p-6">
      {/* run header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#1E1E1E]">
            {id.first_name} {id.last_name} <span className="text-slate-400 font-normal">· {id.task_title}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {id.email} · {id.cohort} · thread #{run.thread_id} · {run.steps.length} steps
          </p>
          {id.v2_learning_goal && (
            <p className="text-xs text-slate-600 mt-1 max-w-2xl"><span className="font-semibold">Goal:</span> {id.v2_learning_goal}</p>
          )}
        </div>
        <button
          onClick={load}
          className="text-xs px-3 py-1.5 rounded-md border border-[#E3E3E3] hover:bg-[#F7F7F9] text-slate-600"
        >
          ↻ Refresh
        </button>
      </div>

      {/* run-level usage strip */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs bg-[#F7F7F9] border border-[#E3E3E3] rounded-lg px-4 py-3">
        <div><span className="text-slate-400">LLM calls</span> <span className="font-semibold text-slate-700">{fmtNum(totals.call_count)}</span></div>
        <div><span className="text-slate-400">Prompt tok</span> <span className="font-semibold text-slate-700">{fmtNum(totals.prompt_tokens)}</span></div>
        <div><span className="text-slate-400">Completion tok</span> <span className="font-semibold text-slate-700">{fmtNum(totals.completion_tokens)}</span></div>
        <div><span className="text-slate-400">Total tok</span> <span className="font-semibold text-slate-700">{fmtNum(totals.total_tokens)}</span></div>
        <div><span className="text-slate-400">Est. cost</span> <span className="font-semibold text-slate-700">${Number(totals.estimated_cost_usd || 0).toFixed(4)}</span></div>
      </div>

      {/* agent timeline */}
      <div>
        {run.steps.map((step) => <StepCard key={step.id} step={step} />)}
      </div>
    </div>
  );
};

const CoachRuns = ({ embedded = false, openThreadId = null }) => {
  const token = useAuthStore((s) => s.token);
  const { canAccessPage } = usePermissions();

  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(openThreadId);

  const loadRuns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCoachRuns(token);
      setRuns(data.runs || []);
    } catch (e) {
      setError(e.message || 'Failed to load runs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadRuns(); }, [loadRuns]);

  // Open a specific run when requested (e.g. the Coach Evals tab passes the
  // eval case's thread). RunDetail loads by thread id independently of the
  // list, so this works even for eval-cohort threads filtered out below.
  useEffect(() => {
    if (openThreadId != null) setSelected(openThreadId);
  }, [openThreadId]);

  if (!canAccessPage('coach_observability')) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] p-8 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Hide synthetic eval-harness personas from the real run list (they still
  // open via the ?thread= deep-link from Coach Evals).
  const realRuns = runs.filter((r) => r.cohort !== 'Eval Harness');
  const q = search.trim().toLowerCase();
  const filtered = q
    ? realRuns.filter((r) =>
        `${r.first_name} ${r.last_name} ${r.email} ${r.task_title} ${r.cohort}`.toLowerCase().includes(q))
    : realRuns;

  return (
    <div className={embedded ? '' : 'min-h-screen bg-[#EFEFEF]'}>
      {!embedded && (
        <div className="bg-white border-b border-[#E3E3E3] px-8 py-4">
          <h1 className="text-2xl font-bold text-[#1E1E1E]" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
            Coach Runs
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Per-agent observability for v2 personalized-task runs
          </p>
        </div>
      )}

      <div className="flex max-w-[1600px] mx-auto" style={{ minHeight: embedded ? 'calc(100vh - 210px)' : 'calc(100vh - 73px)' }}>
        {/* left: run list */}
        <aside className="w-96 shrink-0 border-r border-[#E3E3E3] bg-white flex flex-col">
          <div className="p-3 border-b border-[#E3E3E3] flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search builder, task, cohort…"
              className="flex-1 text-sm px-3 py-1.5 border border-[#E3E3E3] rounded-md focus:outline-none focus:ring-1"
              style={{ '--tw-ring-color': BRAND }}
            />
            <button
              onClick={loadRuns}
              className="text-xs px-3 py-1.5 rounded-md border border-[#E3E3E3] hover:bg-[#F7F7F9] text-slate-600"
            >
              ↻
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {loading && <div className="p-4 text-slate-400 text-sm">Loading…</div>}
            {error && <div className="p-4 text-rose-600 text-sm">{error}</div>}
            {!loading && filtered.length === 0 && (
              <div className="p-4 text-slate-400 text-sm">No coach runs recorded yet.</div>
            )}
            {filtered.map((r) => {
              const active = selected === r.thread_id;
              const meta = NODE_META[r.last_node] || {};
              return (
                <button
                  key={r.thread_id}
                  onClick={() => setSelected(r.thread_id)}
                  className={`w-full text-left px-4 py-3 border-b border-[#F0F0F0] hover:bg-[#F7F7F9] ${active ? 'bg-[#F0F0FF]' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {r.first_name} {r.last_name}
                    </span>
                    {r.overall_score != null && (
                      <Chip tone={r.passed ? 'green' : 'red'}>{r.overall_score}</Chip>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{r.task_title}</div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className={`px-1.5 py-0.5 rounded border ${meta.color || 'border-slate-200'}`}>
                      {meta.label || r.last_node}
                    </span>
                    <span>{r.step_count} steps</span>
                    <span className="ml-auto">{fmtTime(r.last_step_at)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* right: detail */}
        <main className="flex-1 overflow-auto">
          {selected ? (
            <RunDetail token={token} threadId={selected} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Select a run to inspect its agent timeline.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoachRuns;
