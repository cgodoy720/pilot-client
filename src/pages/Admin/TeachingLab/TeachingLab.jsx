/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import useAuthStore from '../../../stores/authStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/ui/sheet';
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

// Selectable styles for the compare view (the 6-way enum; 'demonstration' was
// merged into 'example_based'). 'balanced' is a fallback, not a teaching choice.
const STYLE_OPTIONS = ['socratic', 'direct', 'example_based', 'inquiry_based', 'problem_based', 'experiential'];

// Plain-English explanation of how each style teaches (mirrors the server's
// TEACHING_STYLE_GUIDANCE intent) — shown as a hover tooltip so the difference
// in approach is readable before picking styles to compare.
const STYLE_DESCRIPTIONS = {
  socratic: 'Leads with probing questions and lets you reason to the answer yourself — deliberately withholds the conclusion.',
  direct: 'Explains the concept plainly up front and states the answer, then checks your understanding. No drawing-it-out.',
  example_based: 'Shows a concrete worked example first, then has you try a closely parallel one (“show, then do”). Theory comes after.',
  inquiry_based: 'Hands you an open question to investigate and offers hints rather than answers — you discover it through exploration.',
  problem_based: 'Drops you into a real, messy problem from the start and teaches each concept only when you need it to make progress.',
  experiential: 'Has you attempt it first, then debriefs what happened, names the underlying lesson, and has you try again (try → reflect → retry).',
};

// Tailwind renderers for coach markdown (the @tailwindcss/typography `prose`
// plugin isn't installed in this project, so `prose` classes are no-ops — we
// style each element explicitly instead).
const MD_COMPONENTS = {
  p: ({ ...p }) => <p className="my-1.5 leading-relaxed first:mt-0 last:mb-0" {...p} />,
  strong: ({ ...p }) => <strong className="font-semibold text-slate-900" {...p} />,
  em: ({ ...p }) => <em className="italic" {...p} />,
  ul: ({ ...p }) => <ul className="list-disc pl-5 my-1.5 space-y-0.5" {...p} />,
  ol: ({ ...p }) => <ol className="list-decimal pl-5 my-1.5 space-y-0.5" {...p} />,
  li: ({ ...p }) => <li className="leading-relaxed" {...p} />,
  h1: ({ ...p }) => <h1 className="font-bold text-[15px] text-slate-900 mt-2 mb-1 first:mt-0" {...p} />,
  h2: ({ ...p }) => <h2 className="font-bold text-[14px] text-slate-900 mt-2 mb-1 first:mt-0" {...p} />,
  h3: ({ ...p }) => <h3 className="font-semibold text-[13px] text-slate-900 mt-2 mb-1 first:mt-0" {...p} />,
  blockquote: ({ ...p }) => <blockquote className="border-l-2 border-slate-300 pl-3 italic text-slate-600 my-1.5" {...p} />,
  a: ({ ...p }) => <a className="text-[#4242EA] underline" target="_blank" rel="noreferrer" {...p} />,
  hr: () => <hr className="my-2 border-slate-200" />,
  pre: ({ ...p }) => <pre className="bg-slate-100 rounded-md p-2.5 my-2 overflow-x-auto text-[12px] font-mono" {...p} />,
  code: ({ className, children, ...p }) =>
    /language-/.test(className || '') ? (
      <code className="font-mono text-[12px]" {...p}>{children}</code>
    ) : (
      <code className="bg-slate-100 rounded px-1 py-0.5 text-[12px] font-mono" {...p}>{children}</code>
    ),
};

// One chat turn. Coach (assistant) text renders as markdown; builder is plain.
const ChatBubble = ({ role, content }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
        role === 'user'
          ? 'bg-slate-200 text-slate-800 rounded-br-sm whitespace-pre-wrap'
          : 'bg-[#4242EA]/[0.06] border border-[#4242EA]/20 text-slate-800 rounded-bl-sm'
      }`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wide mb-1 text-slate-400">
        {role === 'user' ? 'Builder' : 'Coach'}
      </div>
      {role === 'assistant' ? (
        <div className="text-sm text-slate-800">
          <ReactMarkdown components={MD_COMPONENTS}>{content || ''}</ReactMarkdown>
        </div>
      ) : (
        content
      )}
    </div>
  </div>
);

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
 * Live demo (rendered inside the right-slide Sheet): actually run the coach's
 * learn phase in the classified method so staff see what it OUTPUTS, not just
 * the predicted directive. Auto-starts on mount (the Sheet opening IS the "see
 * coach in action" action); stateless multi-turn — type a builder reply to keep
 * going. Coach text renders as markdown. Remounts fresh per open via `key`.
 */
const CoachInAction = ({ token, method }) => {
  const [convo, setConvo] = useState([]);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reply, setReply] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const startedRef = useRef(false);

  const start = useCallback(async () => {
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
  }, [token, method]);

  // Auto-run the first coach turn when the sheet opens (once).
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start();
  }, [start]);

  // Keep the latest turn in view.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [convo, loading]);

  // Auto-focus the reply field whenever it's the builder's turn (coach done
  // responding and at least one coach turn has landed).
  useEffect(() => {
    if (!loading && convo.length > 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, convo.length]);

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

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* scrollable conversation */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
        {task && (
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
            <span className="font-semibold text-slate-700">Sample task:</span> {task.title}
            {task.learning_goal ? <div className="text-slate-400 mt-0.5">{task.learning_goal}</div> : null}
          </div>
        )}
        {convo.map((m, i) => (
          <ChatBubble key={i} role={m.role} content={m.content} />
        ))}
        {loading && <div className="text-xs text-slate-400 pl-1">Coach is responding…</div>}
        {error && <p className="text-sm text-rose-600 pl-1">{error}</p>}
      </div>

      {/* pinned reply bar */}
      <div className="shrink-0 border-t border-[#E3E3E3] px-5 py-3 flex items-center gap-2 bg-white">
        <input
          ref={inputRef}
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
    </div>
  );
};

// A style chip with a hover tooltip explaining how that style teaches. Used for
// the (non-interactive) column headers + "Comparing" bar in the compare view.
const StyleChip = ({ style }) => (
  <span className="relative group inline-block">
    <Chip tone={methodTone(style)}>{methodLabel(style)}</Chip>
    {STYLE_DESCRIPTIONS[style] && (
      <div className="pointer-events-none absolute left-0 top-full mt-2 w-64 rounded-md bg-slate-900 text-white text-xs leading-relaxed px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg">
        {STYLE_DESCRIPTIONS[style]}
      </div>
    )}
  </span>
);

/**
 * Compare view: run the SAME conversation across 2–4 teaching styles as
 * side-by-side columns. One shared "builder" input drives every column; each
 * column keeps its own (diverging) conversation. Stateless — each turn re-posts
 * that column's full history to /coach-turn.
 */
const CompareView = ({ token }) => {
  const [selected, setSelected] = useState(['socratic', 'example_based']);
  const [started, setStarted] = useState(false);
  const [cols, setCols] = useState({}); // style -> { convo: [], loading, error }
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const toggle = (s) => {
    if (started) return;
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 4 ? [...prev, s] : prev
    );
  };

  const start = async () => {
    if (selected.length < 2 || busy) return;
    setBusy(true);
    setStarted(true);
    setCols(Object.fromEntries(selected.map((s) => [s, { convo: [], loading: true }])));
    await Promise.all(
      selected.map(async (s) => {
        try {
          const data = await coachTurn(token, { teachingMethod: s, messages: [] });
          setCols((prev) => ({
            ...prev,
            [s]: {
              convo: [
                { role: 'user', content: data.seededOpener || "Hi! I'm ready to get started — can you teach me this?" },
                { role: 'assistant', content: data.reply },
              ],
              loading: false,
            },
          }));
        } catch (e) {
          setCols((prev) => ({ ...prev, [s]: { convo: [], loading: false, error: e.message } }));
        }
      })
    );
    setBusy(false);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setBusy(true);
    // Build each column's next history (incl. the shared builder message) up front.
    const nextConvos = Object.fromEntries(
      selected.map((s) => [s, [...(cols[s]?.convo || []), { role: 'user', content: text }]])
    );
    setCols((prev) => {
      const next = { ...prev };
      selected.forEach((s) => { next[s] = { ...next[s], convo: nextConvos[s], loading: true }; });
      return next;
    });
    await Promise.all(
      selected.map(async (s) => {
        try {
          const data = await coachTurn(token, { teachingMethod: s, messages: nextConvos[s] });
          setCols((prev) => ({
            ...prev,
            [s]: { ...prev[s], convo: [...nextConvos[s], { role: 'assistant', content: data.reply }], loading: false },
          }));
        } catch (e) {
          setCols((prev) => ({ ...prev, [s]: { ...prev[s], loading: false, error: e.message } }));
        }
      })
    );
    setBusy(false);
  };

  const reset = () => {
    setStarted(false);
    setCols({});
    setInput('');
  };

  // Focus the shared input when it's the builder's turn (all columns done).
  useEffect(() => {
    if (started && !busy && inputRef.current) inputRef.current.focus();
  }, [busy, started]);

  if (!started) {
    return (
      <div className="px-6 py-6 max-w-2xl">
        <h2 className="text-sm font-bold text-[#1E1E1E] mb-1">Compare teaching styles</h2>
        <p className="text-sm text-slate-500 mb-4">
          Pick 2–4 styles. They&apos;ll teach the same sample task side by side, driven by one shared
          builder input, so you can watch how each one diverges.
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          {STYLE_OPTIONS.map((s) => {
            const on = selected.includes(s);
            return (
              <div key={s} className="relative group">
                <button
                  onClick={() => toggle(s)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    on ? `${TONES[methodTone(s)]} font-medium` : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {methodLabel(s)}
                </button>
                {/* hover tooltip: how this style teaches */}
                <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 rounded-md bg-slate-900 text-white text-xs leading-relaxed px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-lg">
                  {STYLE_DESCRIPTIONS[s]}
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={start}
          disabled={selected.length < 2}
          className="px-4 py-1.5 rounded-md text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: BRAND }}
        >
          Compare {selected.length} {selected.length === 1 ? 'style' : 'styles'}
        </button>
        {selected.length < 2 && <span className="ml-3 text-xs text-slate-400">Pick at least 2.</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-5 py-2.5 border-b border-[#E3E3E3] flex items-center gap-3 bg-white">
        <span className="text-sm font-semibold text-slate-700">Comparing</span>
        {selected.map((s) => <StyleChip key={s} style={s} />)}
        <button onClick={reset} className="ml-auto text-xs text-slate-500 hover:text-slate-800 underline">
          Change styles
        </button>
      </div>

      {/* columns */}
      <div className="flex-1 min-h-0 flex overflow-x-auto divide-x divide-[#E3E3E3]">
        {selected.map((s) => {
          const col = cols[s] || { convo: [], loading: false };
          return (
            <div key={s} className="flex flex-col min-w-[320px] flex-1 min-h-0">
              <div className="shrink-0 px-4 py-2 border-b border-[#E3E3E3] bg-slate-50">
                <StyleChip style={s} />
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
                {col.convo.map((m, i) => <ChatBubble key={i} role={m.role} content={m.content} />)}
                {col.loading && <div className="text-xs text-slate-400 pl-1">Coach is responding…</div>}
                {col.error && <p className="text-sm text-rose-600 pl-1">{col.error}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* shared builder input */}
      <div className="shrink-0 border-t border-[#E3E3E3] px-5 py-3 flex items-center gap-2 bg-white">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Reply as the builder — sent to every column…"
          disabled={busy}
          className="flex-1 rounded-md border border-[#D8D8E0] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4242EA]/30 focus:border-[#4242EA] disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="px-3 py-1.5 rounded-md text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: BRAND }}
        >
          Send to all
        </button>
      </div>
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
  const [coachOpen, setCoachOpen] = useState(false);
  const [mode, setMode] = useState('classify'); // 'classify' | 'compare'

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
      setCoachOpen(false); // close any open demo from a prior classification
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
    setMode('classify');
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
      <main className="flex-1 min-h-0 flex flex-col">
        <div className="shrink-0 bg-white border-b border-[#E3E3E3] px-6 py-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-[#1E1E1E]">Personalized Learning</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {mode === 'compare'
                ? 'Run the same task across multiple teaching styles side by side to see how the coach diverges.'
                : `Mock-test how onboarding classifies a builder's learning-style answer — predicted style, confidence vs the ${floor} floor, and the teaching method the coach would actually use. Read-only.`}
            </p>
          </div>
          <div className="shrink-0 inline-flex bg-slate-100 border border-[#E3E3E3] rounded-lg p-0.5">
            {['classify', 'compare'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  mode === m ? 'bg-[#4242EA] text-white font-medium' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m === 'classify' ? 'Classify' : 'Compare styles'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {mode === 'compare' ? (
            <CompareView token={token} />
          ) : (
            <div className="h-full overflow-y-auto">
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
          <SunkenSection title="See the coach in action" hint="Run the real coach learn phase in this method — not a prediction">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCoachOpen(true)}
                className="px-4 py-1.5 rounded-md text-sm font-medium text-white"
                style={{ backgroundColor: BRAND }}
              >
                See Coach in Action
              </button>
              <span className="text-sm text-slate-500">
                Opens a live conversation where the coach teaches as{' '}
                <Chip tone={methodTone(result.effectiveMethod)}>{methodLabel(result.effectiveMethod)}</Chip>
              </span>
            </div>
          </SunkenSection>
        )}

        {!result && !loading && (
          <div className="px-6 py-16 text-center text-slate-400 text-sm">
            Type an answer or pick an example to see how the coach classifies it.
          </div>
        )}
            </div>
          )}
        </div>
      </main>

      {/* Right-slide sheet: the real coach learn phase, live */}
      <Sheet open={coachOpen} onOpenChange={setCoachOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 flex flex-col gap-0 font-proxima"
        >
          <SheetHeader className="shrink-0 px-5 py-4 border-b border-[#E3E3E3] text-left space-y-1">
            <SheetTitle className="flex items-center gap-2 text-base">
              Coach in action
              {result && <Chip tone={methodTone(result.effectiveMethod)}>{methodLabel(result.effectiveMethod)}</Chip>}
            </SheetTitle>
            <SheetDescription className="text-xs">
              The real coach learn phase, run live in this teaching method. Reply as the builder to continue.
            </SheetDescription>
          </SheetHeader>
          {coachOpen && result && (
            <CoachInAction
              key={`${lastAnswer}::${result.effectiveMethod}`}
              token={token}
              method={result.effectiveMethod}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TeachingLab;
