import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../../stores/authStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { listSuites, runEval, listBatches, getBatch, getCase } from '../../../services/coachEvalsApi';

const BRAND = '#4242EA';

const DIMENSION_LABELS = {
  teaching: 'Teaching',
  challenge_design: 'Challenge design',
  grading_quality: 'Grading quality',
  grading_consistency: 'Grading consistency',
  remediation: 'Remediation',
  completion: 'Completion',
  end_to_end: 'End-to-end',
};

// Short, unambiguous labels for the compact per-case dimension chips.
// (The slice(0,4) approach collapsed "Grading quality" and "Grading
// consistency" both to "Grad".)
const DIMENSION_SHORT = {
  teaching: 'Teach',
  challenge_design: 'Chall',
  grading_quality: 'Grade',
  grading_consistency: 'Consist',
  remediation: 'Remed',
  completion: 'Compl',
  end_to_end: 'E2E',
};

const fmtTime = (ts) => (ts ? new Date(ts).toLocaleString() : '—');
const scoreTone = (s) => (s == null ? 'slate' : s >= 80 ? 'green' : s >= 60 ? 'amber' : 'red');

const TONES = {
  slate: 'bg-slate-100 text-slate-600 border-slate-300',
  green: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  amber: 'bg-amber-100 text-amber-700 border-amber-300',
  red: 'bg-rose-100 text-rose-700 border-rose-300',
};

const Chip = ({ children, tone = 'slate' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${TONES[tone]}`}>
    {children}
  </span>
);

const StatusBadge = ({ status }) => {
  const tone = status === 'done' ? 'green' : status === 'failed' ? 'red' : 'amber';
  return <Chip tone={tone}>{status}</Chip>;
};

/** Per-case verdict detail panel. */
const CaseDetail = ({ token, caseId, onClose, onViewTimeline }) => {
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    getCase(token, caseId).then((data) => { if (live) setC(data); }).finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [token, caseId]);

  if (loading) return <div className="p-4 text-slate-400 text-sm">Loading case…</div>;
  if (!c) return null;

  const dims = c.dimension_scores || {};
  const reasons = c.judge_reasoning || {};

  return (
    <div className="border border-[#E3E3E3] rounded-lg bg-white p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-slate-800">
          {c.persona_key} · task {c.task_id}
          {c.overall_score != null && <span className="ml-2"><Chip tone={scoreTone(c.overall_score)}>overall {c.overall_score}</Chip></span>}
        </div>
        <div className="flex items-center gap-3">
          {c.thread_id && (onViewTimeline ? (
            <button onClick={() => onViewTimeline(c.thread_id)} className="text-xs font-medium" style={{ color: BRAND }}>
              View agent timeline →
            </button>
          ) : (
            <Link to={`/admin/coach?tab=runs&thread=${c.thread_id}`} className="text-xs font-medium" style={{ color: BRAND }}>
              View agent timeline →
            </Link>
          ))}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        </div>
      </div>

      {c.error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2 mb-3">{c.error}</div>}

      <div className="space-y-2">
        {Object.keys(DIMENSION_LABELS).filter((d) => dims[d]).map((d) => (
          <div key={d} className="border border-[#EEE] rounded-md p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-700">{DIMENSION_LABELS[d]}</span>
              <Chip tone={scoreTone(dims[d].score)}>{dims[d].score}</Chip>
              {dims[d].pass ? <Chip tone="green">pass</Chip> : <Chip tone="red">fail</Chip>}
            </div>
            {reasons[d]?.reasoning && <p className="text-xs text-slate-600">{reasons[d].reasoning}</p>}
            {reasons[d]?.evidence && <p className="text-[11px] text-slate-400 mt-1 italic">{reasons[d].evidence}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Selected batch: cases table + case detail. */
const BatchDetail = ({ token, batchId, onViewTimeline }) => {
  const [data, setData] = useState(null);
  const [openCase, setOpenCase] = useState(null);

  const load = useCallback(async () => {
    const d = await getBatch(token, batchId);
    setData(d);
  }, [token, batchId]);

  useEffect(() => { load(); }, [load]);

  // Poll while the batch is still running.
  useEffect(() => {
    if (!data || data.batch.status !== 'running') return;
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [data, load]);

  if (!data) return <div className="p-6 text-slate-400 text-sm">Loading batch…</div>;
  const { batch, cases } = data;
  const agg = batch.aggregate_scores || {};

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-lg font-bold text-[#1E1E1E]">Batch #{batch.id} · {batch.suite_key}</h2>
        <StatusBadge status={batch.status} />
        <span className="text-xs text-slate-400">{batch.completed_cases}/{batch.total_cases} cases</span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        {fmtTime(batch.started_at)} · model {batch.model_under_test || 'default'} · judge {batch.judge_model || 'default'}
      </p>

      {batch.status === 'done' && (
        <div className="flex flex-wrap gap-4 mb-5 bg-[#F7F7F9] border border-[#E3E3E3] rounded-lg px-4 py-3 text-xs">
          <div><span className="text-slate-400">Overall</span> <span className="font-semibold text-slate-700">{agg.overall ?? '—'}</span></div>
          <div><span className="text-slate-400">Pass rate</span> <span className="font-semibold text-slate-700">{agg.pass_rate != null ? `${Math.round(agg.pass_rate * 100)}%` : '—'}</span></div>
          {agg.dimensions && Object.entries(agg.dimensions).map(([d, s]) => (
            <div key={d}><span className="text-slate-400">{DIMENSION_LABELS[d] || d}</span> <span className="font-semibold text-slate-700">{s}</span></div>
          ))}
        </div>
      )}
      {batch.error && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2 mb-4">{batch.error}</div>}

      <table className="w-full text-xs border border-[#E3E3E3] rounded-md overflow-hidden">
        <thead className="bg-[#F7F7F9] text-slate-600">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Persona</th>
            <th className="text-left px-3 py-2 font-semibold">Task</th>
            <th className="text-left px-3 py-2 font-semibold">Status</th>
            <th className="text-left px-3 py-2 font-semibold">Overall</th>
            <th className="text-left px-3 py-2 font-semibold">Dimensions</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-t border-[#EEE] hover:bg-[#F7F7F9] cursor-pointer" onClick={() => setOpenCase(openCase === c.id ? null : c.id)}>
              <td className="px-3 py-2 text-slate-800">{c.persona_key}</td>
              <td className="px-3 py-2 text-slate-600">{c.task_id}</td>
              <td className="px-3 py-2"><StatusBadge status={c.status} /></td>
              <td className="px-3 py-2">{c.overall_score != null ? <Chip tone={scoreTone(c.overall_score)}>{c.overall_score}</Chip> : '—'}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(c.dimension_scores || {}).map(([d, v]) => (
                    <Chip key={d} tone={scoreTone(v.score)}>{DIMENSION_SHORT[d] || d} {v.score}</Chip>
                  ))}
                </div>
              </td>
              <td className="px-3 py-2 text-slate-400">{c.passed ? '✓' : c.status === 'done' ? '✗' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {openCase && <CaseDetail token={token} caseId={openCase} onClose={() => setOpenCase(null)} onViewTimeline={onViewTimeline} />}
    </div>
  );
};

const CoachEvals = ({ embedded = false, onViewTimeline = null }) => {
  const token = useAuthStore((s) => s.token);
  const { canAccessPage } = usePermissions();

  const [suites, setSuites] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [suiteKey, setSuiteKey] = useState('');
  const [modelUnderTest, setModelUnderTest] = useState('');
  const [judgeModel, setJudgeModel] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const loadBatches = useCallback(async () => {
    const d = await listBatches(token);
    setBatches(d.batches || []);
    return d.batches || [];
  }, [token]);

  useEffect(() => {
    listSuites(token).then((d) => {
      setSuites(d.suites || []);
      if (d.suites?.length) setSuiteKey(d.suites[0].key);
    }).catch((e) => setError(e.message));
    loadBatches().catch((e) => setError(e.message));
  }, [token, loadBatches]);

  // Refresh the batch list periodically while any batch is running.
  useEffect(() => {
    const anyRunning = batches.some((b) => b.status === 'running');
    if (!anyRunning) return;
    pollRef.current = setInterval(() => loadBatches(), 5000);
    return () => clearInterval(pollRef.current);
  }, [batches, loadBatches]);

  if (!canAccessPage('coach_evals')) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] p-8 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const { batchId } = await runEval(token, {
        suiteKey,
        modelUnderTest: modelUnderTest.trim() || undefined,
        judgeModel: judgeModel.trim() || undefined,
      });
      await loadBatches();
      setSelectedBatch(batchId);
    } catch (e) {
      setError(e.message || 'Failed to start eval');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-0 font-proxima ${embedded ? 'h-full' : 'h-screen bg-[#EFEFEF]'}`}>
      {!embedded && (
        <div className="shrink-0 bg-white border-b border-[#E3E3E3] px-8 py-4">
          <h1 className="text-2xl font-bold text-[#1E1E1E]">Coach Evals</h1>
          <p className="text-slate-500 text-sm mt-0.5">Automated quality evaluation of the v2 coach agent</p>
        </div>
      )}

      {/* run bar */}
      <div className="shrink-0 bg-white border-b border-[#E3E3E3] px-8 py-3 flex flex-wrap items-end gap-3">
        <label className="text-xs text-slate-500">
          <div className="mb-1">Suite</div>
          <select value={suiteKey} onChange={(e) => setSuiteKey(e.target.value)} className="text-sm border border-[#E3E3E3] rounded-md px-2 py-1.5 min-w-48">
            {suites.map((s) => <option key={s.key} value={s.key}>{s.key} — {s.description}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          <div className="mb-1">Model under test (optional)</div>
          <input value={modelUnderTest} onChange={(e) => setModelUnderTest(e.target.value)} placeholder="default" className="text-sm border border-[#E3E3E3] rounded-md px-2 py-1.5 w-56" />
        </label>
        <label className="text-xs text-slate-500">
          <div className="mb-1">Judge model (optional)</div>
          <input value={judgeModel} onChange={(e) => setJudgeModel(e.target.value)} placeholder="default" className="text-sm border border-[#E3E3E3] rounded-md px-2 py-1.5 w-56" />
        </label>
        <button
          onClick={handleRun}
          disabled={running || !suiteKey}
          className="text-sm font-medium text-white rounded-md px-4 py-2 disabled:opacity-50"
          style={{ backgroundColor: BRAND }}
        >
          {running ? 'Starting…' : 'Run eval'}
        </button>
        {error && <span className="text-xs text-rose-600">{error}</span>}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* batch list — scrolls independently */}
        <aside className="w-80 shrink-0 border-r border-[#E3E3E3] bg-white overflow-y-auto min-h-0">
          {batches.length === 0 && <div className="p-4 text-slate-400 text-sm">No eval batches yet.</div>}
          {batches.map((b) => {
            const active = selectedBatch === b.id;
            const agg = b.aggregate_scores || {};
            return (
              <button key={b.id} onClick={() => setSelectedBatch(b.id)} className={`w-full text-left px-4 py-3 border-b border-[#F0F0F0] hover:bg-[#F7F7F9] ${active ? 'bg-[#F0F0FF]' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">#{b.id} {b.suite_key}</span>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  {agg.overall != null && <Chip tone={scoreTone(agg.overall)}>{agg.overall}</Chip>}
                  <span>{b.completed_cases}/{b.total_cases}</span>
                  <span className="ml-auto">{fmtTime(b.started_at)}</span>
                </div>
              </button>
            );
          })}
        </aside>

        <main className="flex-1 min-h-0 overflow-y-auto bg-[#EFEFEF]">
          {selectedBatch ? (
            <BatchDetail token={token} batchId={selectedBatch} onViewTimeline={onViewTimeline} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Run a suite or select a batch.</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoachEvals;
