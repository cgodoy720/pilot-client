/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../../../stores/authStore';
import { listLabPresets, classifyTeachingMethod, coachTurn } from '../../../services/onboardingLabApi';

const BRAND = '#4242EA';

const TONES = {
  slate: 'bg-slate-100 text-slate-600 border-slate-300',
  green: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  amber: 'bg-amber-100 text-amber-700 border-amber-300',
  red: 'bg-rose-100 text-rose-700 border-rose-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-300',
  violet: 'bg-violet-100 text-violet-700 border-violet-300',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
  orange: 'bg-orange-100 text-orange-700 border-orange-300',
  teal: 'bg-teal-100 text-teal-700 border-teal-300',
};

const Chip = ({ children, tone = 'slate' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${TONES[tone]}`}>
    {children}
  </span>
);

// Each teaching style gets its own distinct color (matches the Golden Dataset tab).
const METHOD_LABELS = {
  socratic: 'Socratic',
  direct: 'Direct',
  example_based: 'Example-based',
  demonstration: 'Demonstration',
  inquiry_based: 'Inquiry-based',
  problem_based: 'Problem-based',
  experiential: 'Experiential',
  balanced: 'Balanced (no preference)',
};
const METHOD_TONE = {
  socratic: 'violet',
  direct: 'blue',
  example_based: 'teal',
  demonstration: 'orange',
  inquiry_based: 'indigo',
  problem_based: 'fuchsia',
  experiential: 'cyan',
  balanced: 'slate',
};
const methodLabel = (m) => METHOD_LABELS[m] || m || '—';
const methodTone = (m) => METHOD_TONE[m] || 'slate';

// A 0..1 confidence bar with the floor marker drawn at `floor`.
const ConfidenceBar = ({ confidence, floor = 0.7 }) => {
  const c = typeof confidence === 'number' ? confidence : 0;
  const pct = Math.max(0, Math.min(100, c * 100));
  const passes = c >= floor;
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: passes ? '#10b981' : '#f59e0b' }}
        />
        {/* floor marker */}
        <div
          className="absolute top-[-3px] bottom-[-3px] w-px bg-slate-500"
          style={{ left: `${floor * 100}%` }}
          title={`Confidence floor (${floor})`}
        />
      </div>
      <span className="text-xs font-mono text-slate-600 w-10 text-right">
        {typeof confidence === 'number' ? confidence.toFixed(2) : '—'}
      </span>
    </div>
  );
};

const SunkenSection = ({ title, hint, children }) => (
  <section className="bg-white border-t border-[#E3E3E3] first:border-t-0 px-6 py-5">
    {title && (
      <div className="mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    )}
    {children}
  </section>
);

/** The result of one classification run. */
const ResultView = ({ result, answer, floor }) => {
  if (!result) return null;
  const { raw, wouldPersist, effectiveMethod, guidance } = result;
  const omitted = !raw || !raw.value;

  return (
    <div className="space-y-0">
      <SunkenSection title="Answer tested">
        <p className="text-sm text-slate-700 italic">“{answer}”</p>
      </SunkenSection>

      <SunkenSection title="Classifier output" hint="What the behavioral pass returned for anchor #9">
        {omitted ? (
          <div className="flex items-center gap-2">
            <Chip tone="amber">Omitted — no usable signal</Chip>
            <span className="text-xs text-slate-500">the classifier declined to pick a style</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone={methodTone(raw.value)}>{methodLabel(raw.value)}</Chip>
              {raw.source && <Chip tone="slate">{raw.source}</Chip>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Confidence vs floor ({floor})</span>
                <span className={`text-xs font-medium ${raw.confidence >= floor ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {raw.confidence >= floor ? 'clears floor' : 'below floor'}
                </span>
              </div>
              <ConfidenceBar confidence={raw.confidence} floor={floor} />
            </div>
            {raw.evidence && (
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-500">Evidence: </span>
                {raw.evidence}
              </div>
            )}
          </div>
        )}
      </SunkenSection>

      <SunkenSection title="What the coach would do" hint="After the confidence floor + neutral fallback">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {wouldPersist ? (
              <Chip tone="green">Persisted as preference</Chip>
            ) : (
              <Chip tone="amber">Dropped → no stored preference</Chip>
            )}
            <span className="text-slate-400 text-xs">→</span>
            <span className="text-sm text-slate-600">Effective teaching method:</span>
            <Chip tone={methodTone(effectiveMethod)}>{methodLabel(effectiveMethod)}</Chip>
          </div>
          <div className="rounded-md border border-[#E3E3E3] bg-[#F7F7F9] px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Guidance injected into the learn prompt
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{guidance}</p>
          </div>
        </div>
      </SunkenSection>
    </div>
  );
};

/**
 * Live demo: actually run the coach's learn phase in the classified method so
 * staff see what it OUTPUTS, not just the predicted directive. Stateless multi-
 * turn — type a builder reply to keep the conversation going. Remounts (fresh
 * convo) per classification via a `key` on the parent.
 */
const CoachInAction = ({ token, method }) => {
  const [convo, setConvo] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState('');

  const start = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coachTurn(token, { teachingMethod: method, messages: [] });
      setTask(data.task || null);
      setConvo([
        { role: 'user', content: data.seededOpener || "Hi! I'm ready to get started — can you teach me this?" },
        { role: 'assistant', content: data.reply },
      ]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    const text = reply.trim();
    if (!text || loading) return;
    const next = [...convo, { role: 'user', content: text }];
    setConvo(next);
    setReply('');
    setLoading(true);
    setError(null);
    try {
      const data = await coachTurn(token, { teachingMethod: method, messages: next });
      setConvo([...next, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (convo.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">
          Run the coach&apos;s teaching phase as <Chip tone={methodTone(method)}>{methodLabel(method)}</Chip> on a
          sample task to see what it actually says.
        </p>
        <button
          onClick={start}
          disabled={loading}
          className="px-4 py-1.5 rounded-md text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: BRAND }}
        >
          {loading ? 'Running the coach…' : 'See the coach teach this'}
        </button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {task && (
        <div className="text-xs text-slate-500">
          Teaching: <span className="font-semibold text-slate-700">{task.title}</span>
          {task.learning_goal ? <span className="text-slate-400"> — {task.learning_goal}</span> : null}
        </div>
      )}
      <div className="space-y-2.5">
        {convo.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-slate-200 text-slate-800 rounded-br-sm'
                  : 'bg-[#4242EA]/8 border border-[#4242EA]/20 text-slate-800 rounded-bl-sm'
              }`}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide mb-0.5 text-slate-400">
                {m.role === 'user' ? 'Builder' : 'Coach'}
              </div>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-slate-400 pl-1">Coach is responding…</div>}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Reply as the builder to continue…"
          disabled={loading}
          className="flex-1 rounded-md border border-[#D8D8E0] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4242EA]/30 focus:border-[#4242EA] disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={loading || !reply.trim()}
          className="px-3 py-1.5 rounded-md text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: BRAND }}
        >
          Send
        </button>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
};

const TeachingLab = () => {
  const token = useAuthStore((s) => s.token);
  const [presets, setPresets] = useState([]);
  const [question, setQuestion] = useState('');
  const [floor, setFloor] = useState(0.7);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lastAnswer, setLastAnswer] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await listLabPresets(token);
        if (!alive) return;
        setPresets(data.presets || []);
        setQuestion(data.question || '');
        if (typeof data.floor === 'number') setFloor(data.floor);
      } catch (e) {
        if (alive) setError(e.message);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const run = useCallback(
    async (text) => {
      const a = (text ?? answer).trim();
      if (!a) return;
      setLoading(true);
      setError(null);
      setLastAnswer(a);
      try {
        const data = await classifyTeachingMethod(token, { answer: a });
        setResult(data);
      } catch (e) {
        setError(e.message);
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [answer, token]
  );

  const loadPreset = (p) => {
    setAnswer(p.answer);
    run(p.answer);
  };

  // Group presets for the gallery.
  const groups = presets.reduce((acc, p) => {
    (acc[p.group] = acc[p.group] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="flex h-full min-h-0 bg-[#EFEFEF] font-proxima">
      {/* Left rail — preset gallery */}
      <aside className="w-72 shrink-0 bg-white border-r border-[#E3E3E3] overflow-y-auto">
        <div className="px-4 py-3 border-b border-[#E3E3E3]">
          <h2 className="text-sm font-bold text-[#1E1E1E]">Example answers</h2>
          <p className="text-xs text-slate-400 mt-0.5">Click one to classify it</p>
        </div>
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="px-3 py-3 border-b border-[#EEE]">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-1 mb-1.5">
              {group}
            </div>
            <div className="space-y-1">
              {items.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadPreset(p)}
                  disabled={loading}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-sm text-slate-700 hover:bg-[#F2F2FB] disabled:opacity-50 transition-colors"
                  title={p.answer}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </aside>

      {/* Right pane — tester + result */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="bg-white border-b border-[#E3E3E3] px-6 py-4">
          <h1 className="text-base font-bold text-[#1E1E1E]">Teaching Lab</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Mock-test how onboarding classifies a builder&apos;s learning-style answer — predicted style,
            confidence vs the {floor} floor, and the teaching method the coach would actually use. Read-only.
          </p>
        </div>

        <SunkenSection
          title="Mock anchor-#9 answer"
          hint={question ? `Coach asks: “${question}”` : undefined}
        >
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type how a builder might describe the way they like to learn…"
            rows={4}
            className="w-full rounded-md border border-[#D8D8E0] px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4242EA]/30 focus:border-[#4242EA] resize-y"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => run()}
              disabled={loading || !answer.trim()}
              className="px-4 py-1.5 rounded-md text-sm font-medium text-white disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: BRAND }}
            >
              {loading ? 'Classifying…' : 'Classify'}
            </button>
            {error && <span className="text-sm text-rose-600">{error}</span>}
          </div>
        </SunkenSection>

        {result && <ResultView result={result} answer={lastAnswer} floor={floor} />}

        {result && (
          <SunkenSection title="See the coach in action" hint="The real coach learn phase run in this method — not a prediction">
            <CoachInAction
              key={`${lastAnswer}::${result.effectiveMethod}`}
              token={token}
              method={result.effectiveMethod}
            />
          </SunkenSection>
        )}

        {!result && !loading && (
          <div className="px-6 py-16 text-center text-slate-400 text-sm">
            Type an answer or pick an example to see how the coach classifies it.
          </div>
        )}
      </main>
    </div>
  );
};

export default TeachingLab;
