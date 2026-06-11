import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import useAuthStore from '../../../stores/authStore';
import { usePermissions } from '../../../hooks/usePermissions';
import {
  searchUsers,
  getSnapshot,
  runMockFlow,
} from '../../../services/builderProfileInspectorApi';

const BRAND = '#4242EA';

// Scenarios are mirrored from the SHARED CONTRACT; the server is the
// authoritative source of which ones are runnable.
const SCENARIOS = [
  {
    key: 'onboarding_no_artifacts',
    label: 'Onboarding · no artifacts',
    description: 'No app, no workshop. Run extraction on a transcript-only fixture.',
  },
  {
    key: 'onboarding_with_workshop',
    label: 'Onboarding · workshop',
    description: 'Workshop build_review + competency priors, then extraction.',
  },
  {
    key: 'onboarding_with_application',
    label: 'Onboarding · application',
    description: 'Extraction sees a transcript that references application answers.',
  },
  {
    key: 'onboarding_full_intake',
    label: 'Onboarding · full intake',
    description: 'Workshop + application + extraction.',
  },
  {
    key: 'task_completion_passing',
    label: 'Task completion · passing',
    description: 'updateBuilderProfile (score 85, passed) + reflect.',
  },
  {
    key: 'task_completion_failing',
    label: 'Task completion · failing',
    description: 'updateBuilderProfile (score 40, failed). No reflect.',
  },
  {
    key: 'full_journey',
    label: 'Full journey',
    description: 'Full intake then 3 sequential passing task completions.',
  },
];

const fmtTime = (ts) => (ts ? new Date(ts).toLocaleString() : '—');
const fmtNum = (n) => (n == null ? '—' : Number(n).toLocaleString());
const fmtDuration = (s) => (s == null ? '—' : `${Math.round(Number(s))}s`);

const TONES = {
  slate: 'bg-slate-100 text-slate-600 border-slate-300',
  green: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  amber: 'bg-amber-100 text-amber-700 border-amber-300',
  red: 'bg-rose-100 text-rose-700 border-rose-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-300',
  violet: 'bg-violet-100 text-violet-700 border-violet-300',
};

const Chip = ({ children, tone = 'slate' }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${TONES[tone]}`}
  >
    {children}
  </span>
);

// Tiny shadcn-style card so this file is self-contained while still matching
// the look of CoachRuns/CoachEvals (white card, slate border, rounded-lg).
const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-[#E3E3E3] rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ title, subtitle, right, onToggle, open }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between px-4 py-3 border-b border-[#EEE] hover:bg-[#FAFAFC] text-left"
  >
    <div className="min-w-0">
      <div className="text-sm font-semibold text-slate-800 truncate">{title}</div>
      {subtitle && <div className="text-[11px] text-slate-400 truncate">{subtitle}</div>}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      {right}
      {onToggle && <span className="text-slate-400 text-xs">{open ? '▾' : '▸'}</span>}
    </div>
  </button>
);

const Section = ({ title, subtitle, right, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="mb-3">
      <CardHeader
        title={title}
        subtitle={subtitle}
        right={right}
        onToggle={() => setOpen((o) => !o)}
        open={open}
      />
      {open && <div className="px-4 py-3">{children}</div>}
    </Card>
  );
};

// Renders an envelope's markdown body + Fields table + last 5 provenance entries.
const EnvelopeBody = ({ envelope }) => {
  if (!envelope) {
    return <div className="text-xs text-slate-400">No envelope yet.</div>;
  }
  const md = envelope.markdown || envelope.content || envelope.summary || '';
  const fields = envelope.fields || envelope.data || {};
  const provenance = Array.isArray(envelope.provenance) ? envelope.provenance : [];

  return (
    <div className="space-y-4">
      {md ? (
        <div className="prose prose-sm max-w-none text-slate-700">
          <ReactMarkdown>{md}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-xs text-slate-400">No markdown body.</div>
      )}

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
          Fields
        </div>
        {fields && Object.keys(fields).length > 0 ? (
          <div className="border border-[#EEE] rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(fields).map(([k, v]) => (
                  <tr key={k} className="border-t border-[#EEE] first:border-t-0">
                    <td className="px-3 py-1.5 text-slate-500 font-mono align-top w-1/3">{k}</td>
                    <td className="px-3 py-1.5 text-slate-800 align-top">
                      {typeof v === 'string' ? (
                        v
                      ) : (
                        <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                          {JSON.stringify(v, null, 2)}
                        </pre>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-xs text-slate-400">No fields.</div>
        )}
      </div>

      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
          Provenance (last 5)
        </div>
        {provenance.length > 0 ? (
          <ul className="space-y-1">
            {provenance.slice(-5).reverse().map((p, i) => (
              <li key={i} className="text-[11px] text-slate-600 flex items-start gap-2">
                <Chip tone="slate">{p.source || p.type || 'entry'}</Chip>
                <span className="flex-1">
                  {p.summary || p.note || JSON.stringify(p)}
                  {p.at && <span className="text-slate-400 ml-2">{fmtTime(p.at)}</span>}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-slate-400">No provenance.</div>
        )}
      </div>
    </div>
  );
};

// The 6 known behavioral fields for the Learning Profile, per contract.
const LEARNING_PROFILE_BEHAVIORAL_FIELDS = [
  'pacing',
  'depth_preference',
  'feedback_style',
  'autonomy',
  'modality',
  'challenge_appetite',
];

const LearningProfileBody = ({ envelope }) => {
  if (!envelope) {
    return <div className="text-xs text-slate-400">No learning profile yet.</div>;
  }
  const fields = envelope.fields || envelope.data || {};
  const behavioral = LEARNING_PROFILE_BEHAVIORAL_FIELDS.map((k) => [k, fields[k]]);
  const otherKeys = Object.keys(fields).filter(
    (k) => !LEARNING_PROFILE_BEHAVIORAL_FIELDS.includes(k),
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
          Behavioral fields
        </div>
        <div className="border border-violet-200 bg-violet-50/40 rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <tbody>
              {behavioral.map(([k, v]) => (
                <tr key={k} className="border-t border-violet-100 first:border-t-0">
                  <td className="px-3 py-1.5 font-mono text-violet-800 align-top w-1/3">{k}</td>
                  <td className="px-3 py-1.5 text-slate-800 align-top">
                    {v == null ? (
                      <span className="text-slate-400 italic">—</span>
                    ) : typeof v === 'string' ? (
                      v
                    ) : (
                      <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                        {JSON.stringify(v, null, 2)}
                      </pre>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {otherKeys.length > 0 && (
        <EnvelopeBody envelope={{ ...envelope, fields: Object.fromEntries(otherKeys.map((k) => [k, fields[k]])) }} />
      )}
      {otherKeys.length === 0 && (envelope.markdown || envelope.provenance) && (
        <EnvelopeBody envelope={{ ...envelope, fields: {} }} />
      )}
    </div>
  );
};

const CompetenciesBody = ({ competencies }) => {
  const bySkill = competencies?.by_skill || {};
  const rows = Object.entries(bySkill);
  if (rows.length === 0) return <div className="text-xs text-slate-400">No competency evidence yet.</div>;
  return (
    <div className="border border-[#EEE] rounded-md overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-[#F7F7F9] text-slate-600">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Skill tag</th>
            <th className="text-left px-3 py-2 font-semibold w-32">Evidence count</th>
            <th className="text-left px-3 py-2 font-semibold w-32">Last confidence</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([tag, info]) => {
            const evidence = Array.isArray(info?.evidence) ? info.evidence : [];
            const last = evidence[evidence.length - 1];
            const conf = last?.confidence ?? info?.last_confidence ?? null;
            return (
              <tr key={tag} className="border-t border-[#EEE]">
                <td className="px-3 py-2 text-slate-800 font-mono">{tag}</td>
                <td className="px-3 py-2 text-slate-700">{evidence.length || info?.evidence_count || 0}</td>
                <td className="px-3 py-2">{conf != null ? <Chip tone="violet">{conf}</Chip> : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const PerformanceBody = ({ performance }) => {
  const entries = Array.isArray(performance?.entries) ? performance.entries : [];
  if (entries.length === 0) return <div className="text-xs text-slate-400">No performance entries yet.</div>;
  return (
    <ul className="space-y-2">
      {entries.map((e, i) => (
        <details key={i} className="border border-[#EEE] rounded-md">
          <summary className="px-3 py-2 cursor-pointer text-xs text-slate-800 flex items-center gap-2">
            <span className="font-semibold">{e.task_title || e.title || `Entry ${i + 1}`}</span>
            {e.overall_score != null && <Chip tone={e.passed ? 'green' : 'red'}>{e.overall_score}</Chip>}
            {e.at && <span className="text-slate-400 ml-auto">{fmtTime(e.at)}</span>}
          </summary>
          <div className="px-3 py-2 border-t border-[#EEE] text-xs text-slate-600">
            {e.summary || e.feedback || (
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                {JSON.stringify(e, null, 2)}
              </pre>
            )}
          </div>
        </details>
      ))}
    </ul>
  );
};

const SkillLevelsBody = ({ skillLevels }) => {
  const entries = Object.entries(skillLevels || {});
  if (entries.length === 0) return <div className="text-xs text-slate-400">No skill levels yet.</div>;
  const sorted = entries.sort((a, b) => Number(b[1]) - Number(a[1]));
  return (
    <div className="border border-[#EEE] rounded-md overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-[#F7F7F9] text-slate-600">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Skill tag</th>
            <th className="text-left px-3 py-2 font-semibold w-24">Level</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(([tag, level]) => (
            <tr key={tag} className="border-t border-[#EEE]">
              <td className="px-3 py-2 text-slate-800 font-mono">{tag}</td>
              <td className="px-3 py-2">
                <Chip tone={Number(level) >= 80 ? 'green' : Number(level) >= 50 ? 'amber' : 'slate'}>
                  {level}
                </Chip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ApplyAccuracyBody = ({ accuracyBySkill }) => {
  const rows = Object.entries(accuracyBySkill || {});
  if (rows.length === 0) return <div className="text-xs text-slate-400">No apply accuracy recorded.</div>;
  return (
    <div className="border border-[#EEE] rounded-md overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-[#F7F7F9] text-slate-600">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Skill tag</th>
            <th className="text-left px-3 py-2 font-semibold w-20">Passed</th>
            <th className="text-left px-3 py-2 font-semibold w-20">Failed</th>
            <th className="text-left px-3 py-2 font-semibold w-20">Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([tag, info]) => (
            <tr key={tag} className="border-t border-[#EEE]">
              <td className="px-3 py-2 text-slate-800 font-mono">{tag}</td>
              <td className="px-3 py-2 text-slate-700">{info?.passed ?? 0}</td>
              <td className="px-3 py-2 text-slate-700">{info?.failed ?? 0}</td>
              <td className="px-3 py-2">
                {info?.rate != null ? (
                  <Chip tone={info.rate >= 0.75 ? 'green' : info.rate >= 0.5 ? 'amber' : 'red'}>
                    {Math.round(info.rate * 100)}%
                  </Chip>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const OnboardingAssessmentBody = ({ assessment }) => {
  if (!assessment) return <div className="text-xs text-slate-400">No onboarding assessment.</div>;
  const transcript = Array.isArray(assessment.transcript) ? assessment.transcript : [];
  const buildReview = assessment.build_review || null;
  const meta = assessment.extraction_meta || {};
  const anchors = Array.isArray(meta.anchors_covered) ? meta.anchors_covered : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Chip tone="slate">{transcript.length} transcript turns</Chip>
        {meta.partial && <Chip tone="amber">partial extraction</Chip>}
        {meta.run_at && <span className="text-slate-400">extracted {fmtTime(meta.run_at)}</span>}
      </div>

      {buildReview && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
            Build review
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap break-words bg-[#F7F7F9] border border-[#E3E3E3] rounded-md px-3 py-2 max-h-80 overflow-auto">
            {JSON.stringify(buildReview, null, 2)}
          </pre>
        </div>
      )}

      {anchors.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
            Anchors covered
          </div>
          <div className="flex flex-wrap gap-1">
            {anchors.map((a) => (
              <Chip key={a} tone="blue">{a}</Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RecentApplyOutcomesBody = ({ outcomes }) => {
  if (!Array.isArray(outcomes) || outcomes.length === 0) {
    return <div className="text-xs text-slate-400">No apply outcomes yet.</div>;
  }
  return (
    <div className="border border-[#EEE] rounded-md overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-[#F7F7F9] text-slate-600">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Task</th>
            <th className="text-left px-3 py-2 font-semibold w-16">Score</th>
            <th className="text-left px-3 py-2 font-semibold w-16">Passed</th>
            <th className="text-left px-3 py-2 font-semibold w-20">Attempt</th>
            <th className="text-left px-3 py-2 font-semibold">When</th>
          </tr>
        </thead>
        <tbody>
          {outcomes.map((o, i) => (
            <tr key={`${o.task_id}-${i}`} className="border-t border-[#EEE]">
              <td className="px-3 py-2 text-slate-800 truncate max-w-[14rem]" title={o.task_title}>
                {o.task_title || `Task ${o.task_id}`}
              </td>
              <td className="px-3 py-2">
                {o.overall_score != null ? (
                  <Chip tone={o.passed ? 'green' : 'red'}>{o.overall_score}</Chip>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-3 py-2">{o.passed ? <Chip tone="green">yes</Chip> : <Chip tone="red">no</Chip>}</td>
              <td className="px-3 py-2 text-slate-700">{o.attempt_number ?? '—'}</td>
              <td className="px-3 py-2 text-slate-400">{fmtTime(o.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RecentOnboardingSessionsBody = ({ sessions }) => {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return <div className="text-xs text-slate-400">No onboarding sessions.</div>;
  }
  return (
    <div className="border border-[#EEE] rounded-md overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-[#F7F7F9] text-slate-600">
          <tr>
            <th className="text-left px-3 py-2 font-semibold w-24">Status</th>
            <th className="text-left px-3 py-2 font-semibold w-20">Duration</th>
            <th className="text-left px-3 py-2 font-semibold">Started at</th>
            <th className="text-left px-3 py-2 font-semibold w-24">Build review</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-t border-[#EEE]">
              <td className="px-3 py-2">
                <Chip tone={s.status === 'completed' ? 'green' : s.status === 'failed' ? 'red' : 'amber'}>
                  {s.status}
                </Chip>
              </td>
              <td className="px-3 py-2 text-slate-700">{fmtDuration(s.duration_seconds)}</td>
              <td className="px-3 py-2 text-slate-400">{fmtTime(s.started_at)}</td>
              <td className="px-3 py-2">
                {s.build_review_ready ? <Chip tone="green">ready</Chip> : <Chip tone="slate">no</Chip>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// The full snapshot rendered as a stack of sections.
const SnapshotView = ({ snapshot }) => {
  if (!snapshot) return null;
  const { identity = {}, profile = {}, recent_apply_outcomes, recent_onboarding_sessions } = snapshot;
  return (
    <div>
      <Card className="mb-3">
        <div className="px-4 py-3">
          <div className="text-sm font-semibold text-slate-800">
            {identity.first_name} {identity.last_name}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {identity.email} · cohort {identity.cohort || '—'} · user_id {identity.user_id}
          </div>
        </div>
      </Card>

      <Section title="Background" subtitle="background envelope" defaultOpen>
        <EnvelopeBody envelope={profile.background} />
      </Section>

      <Section title="Goals" subtitle="goals envelope">
        <EnvelopeBody envelope={profile.goals} />
      </Section>

      <Section title="Learning Profile" subtitle="learning_profile envelope · 6 behavioral fields highlighted">
        <LearningProfileBody envelope={profile.learning_profile} />
      </Section>

      <Section title="Competencies" subtitle="evidence accumulated per skill tag">
        <CompetenciesBody competencies={profile.competencies} />
      </Section>

      <Section title="Performance" subtitle="task-level performance entries">
        <PerformanceBody performance={profile.performance} />
      </Section>

      <Section title="Skill Levels" subtitle="EMA-weighted skill levels (sorted)">
        <SkillLevelsBody skillLevels={profile.skill_levels} />
      </Section>

      <Section title="Apply Accuracy By Skill" subtitle="passed / failed / rate">
        <ApplyAccuracyBody accuracyBySkill={profile.apply_accuracy_by_skill} />
      </Section>

      <Section title="Onboarding Assessment" subtitle="transcript + build_review + extraction_meta">
        <OnboardingAssessmentBody assessment={profile.onboarding_assessment} />
      </Section>

      <Section title="Recent Apply Outcomes" subtitle="last 10, newest first">
        <RecentApplyOutcomesBody outcomes={recent_apply_outcomes} />
      </Section>

      <Section title="Recent Onboarding Sessions" subtitle="last 3">
        <RecentOnboardingSessionsBody sessions={recent_onboarding_sessions} />
      </Section>
    </div>
  );
};

const StageCard = ({ stage, index }) => {
  return (
    <Card className="mb-3">
      <div className="px-4 py-3 border-b border-[#EEE] flex items-center gap-2">
        <Chip tone="violet">step {index + 1}</Chip>
        <span className="text-sm font-semibold text-slate-800">{stage.stage}</span>
        <span className="ml-auto">
          {stage.llm_mock_used ? (
            <Chip tone="amber">llm mock used</Chip>
          ) : (
            <Chip tone="slate">db only</Chip>
          )}
        </span>
      </div>
      <div className="px-4 py-3">
        {Array.isArray(stage.diff_summary) && stage.diff_summary.length > 0 ? (
          <ul className="space-y-1 list-disc pl-5">
            {stage.diff_summary.map((line, i) => (
              <li key={i} className="text-xs text-slate-700 font-mono">{line}</li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-slate-400">No diff recorded for this stage.</div>
        )}
      </div>
    </Card>
  );
};

const MockFlowPanel = ({
  token,
  selectedUserId,
  onSnapshotRefresh,
}) => {
  const [scenario, setScenario] = useState(SCENARIOS[0].key);
  const [resetFirst, setResetFirst] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await runMockFlow(token, {
        scenario,
        userId: selectedUserId ?? undefined,
        resetFirst,
      });
      setResult(res);
      // Refresh the left pane's snapshot after the mock run completes.
      if (onSnapshotRefresh) onSnapshotRefresh(res.userId);
    } catch (e) {
      setError(e.message || 'Failed to run mock flow');
    } finally {
      setRunning(false);
    }
  };

  const selected = SCENARIOS.find((s) => s.key === scenario) || SCENARIOS[0];

  return (
    <div>
      <Card className="mb-4">
        <div className="px-4 py-3 border-b border-[#EEE]">
          <div className="text-sm font-semibold text-slate-800">Run Mock Flow</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Drives the real profile-write pipeline with a mocked LLM. Safe-listed to the
            mock test cohort server-side.
          </div>
        </div>
        <div className="px-4 py-3 space-y-3">
          <label className="block">
            <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Scenario</div>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full text-sm border border-[#E3E3E3] rounded-md px-2 py-1.5"
            >
              {SCENARIOS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.key} — {s.label}
                </option>
              ))}
            </select>
            {selected.description && (
              <div className="text-[11px] text-slate-500 mt-1">{selected.description}</div>
            )}
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={resetFirst}
              onChange={(e) => setResetFirst(e.target.checked)}
              className="h-4 w-4"
            />
            Reset profile first (NULL envelopes + clear reflect/onboarding writes)
          </label>

          <div className="text-[11px] text-slate-500">
            Target: {selectedUserId ? <code className="font-mono">user {selectedUserId}</code> : <em>sentinel mock user</em>}
          </div>

          <button
            onClick={handleRun}
            disabled={running || !scenario}
            className="text-sm font-medium text-white rounded-md px-4 py-2 disabled:opacity-50 w-full"
            style={{ backgroundColor: BRAND }}
          >
            {running ? 'Running…' : 'Run'}
          </button>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2">
              {error}
            </div>
          )}
        </div>
      </Card>

      {result && (
        <Card className="mb-4">
          <div className="px-4 py-3 border-b border-[#EEE]">
            <div className="text-sm font-semibold text-slate-800">
              Result · {result.scenario}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              user {result.userId} · {Array.isArray(result.stages_run) ? result.stages_run.length : 0} stages
            </div>
          </div>
          <div className="px-4 py-3">
            {Array.isArray(result.stages_run) && result.stages_run.length > 0 ? (
              result.stages_run.map((s, i) => <StageCard key={i} stage={s} index={i} />)
            ) : (
              <div className="text-xs text-slate-400">No stages reported.</div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

const UserPicker = ({ token, selected, onSelect }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.trim().length < 1) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const data = await searchUsers(token, q.trim());
        setResults(data.results || []);
      } catch (e) {
        setError(e.message || 'Search failed');
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [q, token]);

  return (
    <div>
      <div className="p-3 border-b border-[#E3E3E3] bg-white">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search builders by name or email…"
          className="w-full text-sm px-3 py-1.5 border border-[#E3E3E3] rounded-md focus:outline-none focus:ring-1"
          style={{ '--tw-ring-color': BRAND }}
        />
      </div>
      <div>
        {searching && <div className="px-4 py-2 text-xs text-slate-400">Searching…</div>}
        {error && <div className="px-4 py-2 text-xs text-rose-600">{error}</div>}
        {!searching && q && results.length === 0 && (
          <div className="px-4 py-2 text-xs text-slate-400">No matches.</div>
        )}
        {results.map((u) => {
          const active = selected === u.user_id;
          return (
            <button
              key={u.user_id}
              onClick={() => onSelect(u)}
              className={`w-full text-left px-4 py-2 border-b border-[#F0F0F0] hover:bg-[#F7F7F9] ${
                active ? 'bg-[#F0F0FF]' : ''
              }`}
            >
              <div className="text-sm font-semibold text-slate-800 truncate">
                {u.first_name} {u.last_name}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {u.email} · {u.cohort || '—'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const CoachProfiles = ({ embedded = false }) => {
  const token = useAuthStore((s) => s.token);
  const { canAccessPage } = usePermissions();

  const [selectedUser, setSelectedUser] = useState(null); // { user_id, first_name, ... }
  const [snapshot, setSnapshot] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState(null);

  const loadSnapshot = useCallback(
    async (userId) => {
      if (!userId) return;
      setSnapshotLoading(true);
      setSnapshotError(null);
      try {
        const data = await getSnapshot(token, userId);
        setSnapshot(data);
      } catch (e) {
        setSnapshotError(e.message || 'Failed to load snapshot');
      } finally {
        setSnapshotLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (selectedUser?.user_id) {
      loadSnapshot(selectedUser.user_id);
    } else {
      setSnapshot(null);
    }
  }, [selectedUser, loadSnapshot]);

  // Called from MockFlowPanel after a successful run.
  const handleMockFlowComplete = useCallback(
    (userId) => {
      if (!userId) return;
      // If the server ran on the sentinel user without a current selection,
      // surface that user as the selected one so the snapshot updates.
      if (!selectedUser || selectedUser.user_id !== userId) {
        setSelectedUser((prev) => ({
          ...(prev || {}),
          user_id: userId,
          first_name: prev?.first_name || 'Mock',
          last_name: prev?.last_name || 'User',
          email: prev?.email || '',
          cohort: prev?.cohort || 'Mock Flow Test Cohort',
        }));
      } else {
        loadSnapshot(userId);
      }
    },
    [selectedUser, loadSnapshot],
  );

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

  return (
    <div className={`flex flex-col min-h-0 font-proxima ${embedded ? 'h-full' : 'h-screen bg-[#EFEFEF]'}`}>
      {!embedded && (
        <div className="shrink-0 bg-white border-b border-[#E3E3E3] px-8 py-4">
          <h1 className="text-2xl font-bold text-[#1E1E1E]">Profiles</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Inspect builder profile state and exercise the mock-flow pipeline
          </p>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* LEFT — user picker + snapshot */}
        <aside className="w-1/2 shrink-0 border-r border-[#E3E3E3] bg-white flex flex-col min-h-0">
          <UserPicker
            token={token}
            selected={selectedUser?.user_id}
            onSelect={(u) => setSelectedUser(u)}
          />
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#EFEFEF] p-4">
            {!selectedUser && (
              <div className="text-sm text-slate-500 bg-white border border-[#E3E3E3] rounded-lg p-6">
                Pick a builder on the left, or hit <strong>Run Mock Flow</strong> with a sentinel mock user.
              </div>
            )}

            {selectedUser && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-slate-500">
                    Snapshot for <code className="font-mono">{selectedUser.email || `user ${selectedUser.user_id}`}</code>
                  </div>
                  <button
                    onClick={() => loadSnapshot(selectedUser.user_id)}
                    className="text-xs px-3 py-1.5 rounded-md border border-[#E3E3E3] hover:bg-[#F7F7F9] text-slate-600 bg-white"
                  >
                    ↻ Refresh snapshot
                  </button>
                </div>

                {snapshotLoading && (
                  <div className="text-sm text-slate-400">Loading snapshot…</div>
                )}
                {snapshotError && (
                  <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2">
                    {snapshotError}
                  </div>
                )}
                {!snapshotLoading && !snapshotError && <SnapshotView snapshot={snapshot} />}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT — sticky mock-flow panel */}
        <main className="w-1/2 min-h-0 overflow-y-auto bg-[#EFEFEF] p-4">
          <MockFlowPanel
            token={token}
            selectedUserId={selectedUser?.user_id ?? null}
            onSnapshotRefresh={handleMockFlowComplete}
          />
        </main>
      </div>
    </div>
  );
};

export default CoachProfiles;
