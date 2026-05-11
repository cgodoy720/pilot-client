import React, { useState, useEffect, useRef, useCallback } from 'react';
import useAuthStore from '../../stores/authStore';
import { useStreamingText } from '../../hooks/useStreamingText';
import './PathfinderCompass.css';

const API_URL = import.meta.env.VITE_API_URL;

const PROFILE_LABELS = {
  connector: 'The Connector',
  demonstrator: 'The Demonstrator',
  presence_builder: 'The Presence Builder',
  skill_sharpener: 'The Skill Sharpener',
  builder_entrepreneur: 'The Builder-Entrepreneur',
};

// Stable unique ID counter
let _msgId = 0;
const nextId = () => `${Date.now()}-${++_msgId}`;

function attachStableClientKeys(messages) {
  const seen = new Map();
  return messages.map((m, idx) => {
    const base = String(m?.id ?? `${m?.role || 'msg'}-${idx}`);
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    return {
      ...m,
      clientKey: m?.clientKey || (n === 1 ? base : `${base}-${n}`),
    };
  });
}

// ── Signal parsers ─────────────────────────────────────────────────────────────

const COMPLETE_START = '[COMPASS_COMPLETE]';
const COMPLETE_END = '[/COMPASS_COMPLETE]';
const ADD_GOALS_START = '[COMPASS_ADD_GOALS]';
const ADD_GOALS_END = '[/COMPASS_ADD_GOALS]';

function extractBetween(text, start, end) {
  const s = text.indexOf(start);
  const e = text.indexOf(end);
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(text.slice(s + start.length, e)); }
  catch { return null; }
}

function stripForDisplay(text) {
  const signals = [COMPLETE_START, ADD_GOALS_START];
  const cuts = signals.map(s => text.indexOf(s)).filter(i => i !== -1);
  let result = cuts.length ? text.slice(0, Math.min(...cuts)).trimEnd() : text;
  // Strip any partial signal prefix at the tail (streaming artifact)
  for (const signal of signals) {
    for (let len = signal.length - 1; len > 0; len--) {
      if (result.endsWith(signal.slice(0, len))) {
        result = result.slice(0, -len).trimEnd();
        break;
      }
    }
  }
  return result;
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  const seen = new Map();
  return parts.map((p) => {
    const keyBase = `inline:${p}`;
    const n = (seen.get(keyBase) || 0) + 1;
    seen.set(keyBase, n);
    const key = `${keyBase}:${n}`;
    return p.startsWith('**') && p.endsWith('**')
      ? <strong key={key}>{p.slice(2, -2)}</strong>
      : <React.Fragment key={key}>{p}</React.Fragment>;
  });
}

function renderMarkdown(text) {
  if (!text) return null;
  // Join continuation lines (starting with , ; or :) to their previous line
  const rawLines = text.split('\n');
  const lines = [];
  for (const line of rawLines) {
    if (lines.length > 0 && /^[,;:]\s/.test(line)) {
      lines[lines.length - 1] += ' ' + line.replace(/^[,;:]\s+/, '');
    } else {
      lines.push(line);
    }
  }
  const seen = new Map();
  return lines.map((line) => {
    const kind = line.startsWith('### ')
      ? 'h3'
      : line.startsWith('## ')
      ? 'h2'
      : line.startsWith('# ')
      ? 'h1'
      : line.match(/^[-*] /)
      ? 'li'
      : !line.trim()
      ? 'gap'
      : 'p';
    const keyBase = `md:${kind}:${line}`;
    const n = (seen.get(keyBase) || 0) + 1;
    seen.set(keyBase, n);
    const key = `${keyBase}:${n}`;

    if (line.startsWith('### ')) {
      return <div key={key} className="compass__md-h3">{renderInline(line.slice(4))}</div>;
    }
    if (line.startsWith('## ')) {
      return <div key={key} className="compass__md-h3">{renderInline(line.slice(3))}</div>;
    }
    if (line.startsWith('# ')) {
      return <div key={key} className="compass__md-h3">{renderInline(line.slice(2))}</div>;
    }
    if (line.match(/^[-*] /)) {
      return <div key={key} className="compass__md-li">{renderInline(line.slice(2))}</div>;
    }
    if (!line.trim()) {
      return <div key={key} className="compass__md-gap" />;
    }
    return <div key={key}>{renderInline(line)}</div>;
  });
}

function normalizeChatHistory(chatHistory) {
  if (!Array.isArray(chatHistory)) return [];
  return chatHistory
    .filter((m) => (
      m &&
      typeof m === 'object' &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.trim()
    ))
    .map((m, idx) => ({
      id: `srv-${m.id ?? idx}`,
      role: m.role,
      content: m.content,
    }));
}

// ── Per-message component (stable key = stable hook state for smooth streaming)

function ChatMessage({ message, userName }) {
  const smoothContent = useStreamingText(message.content || '');
  const isCoach = message.role === 'assistant';

  if (message.streaming && !message.content) {
    return (
      <div className="compass__preloader">
        <div className="compass__chat-spinner" />
      </div>
    );
  }

  return (
    <div className={`compass__message compass__message--${isCoach ? 'coach' : 'user'}`}>
      <div className="compass__message-label">
        {isCoach ? 'Compass' : (userName || 'You')}
      </div>
      <div className="compass__message-bubble">
        {isCoach ? renderMarkdown(smoothContent) : message.content}
      </div>
    </div>
  );
}

// ── Goal check / progress UI ──────────────────────────────────────────────────

const CHECK_SVG = (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function GoalProgress({ goal, onProgress }) {
  const target = goal.target_count || 1;
  const progress = goal.progress_count || 0;

  if (target === 1) {
    return (
      <div
        className={`compass__goal-check${goal.is_completed ? ' compass__goal-check--done' : ''}`}
        onClick={(e) => { e.stopPropagation(); onProgress(goal, goal.is_completed ? 0 : 1); }}
      >
        {goal.is_completed && CHECK_SVG}
      </div>
    );
  }

  return (
    <div className="compass__goal-dots">
      {Array.from({ length: target }, (_, i) => (
        <div
          key={`goal-${goal.id || goal.goal_key || 'x'}-dot-${i + 1}`}
          className={`compass__goal-dot${progress > i ? ' compass__goal-dot--filled' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            // Clicking the last filled dot undoes it; otherwise fill to this step
            const newProgress = progress === i + 1 ? i : i + 1;
            onProgress(goal, newProgress);
          }}
        />
      ))}
    </div>
  );
}

// ── CompassDashboard ──────────────────────────────────────────────────────────

function CompassDashboard({ status, cycleEnded, onGoalProgress, isLoading = false }) {
  const [pastCycleIdx, setPastCycleIdx] = useState(0);
  if (isLoading || !status) {
    return (
      <div className="compass__dashboard compass__dashboard--loading" aria-busy="true" aria-live="polite">
        <div className="compass__card">
          <div className="compass__card-title">Your Current Strategy</div>
          <div className="compass__skeleton-line compass__skeleton-line--lg" />
          <div className="compass__skeleton-line" />
          <div className="compass__skeleton-line compass__skeleton-line--short" />
        </div>
        <div className="compass__card">
          <div className="compass__card-title">Current Cycle</div>
          <div className="compass__skeleton-line compass__skeleton-line--md" />
          <div className="compass__skeleton-bar" />
          <div className="compass__skeleton-line compass__skeleton-line--short" />
        </div>
        <div className="compass__card">
          <div className="compass__card-title">Cycle Goals</div>
          <div className="compass__skeleton-goal-row" />
          <div className="compass__skeleton-goal-row" />
          <div className="compass__skeleton-goal-row" />
        </div>
      </div>
    );
  }

  if (!status.enrolled) {
    return (
      <div className="compass__dashboard">
        <div className="compass__card">
          <div className="compass__card-title">Your Current Strategy</div>
          <div className="compass__profile-empty">
            Your strategy will appear here once you finish talking with Compass.
          </div>
        </div>
        <div className="compass__card">
          <div className="compass__card-title">Current Cycle</div>
          <div className="compass__profile-empty">No active cycle yet.</div>
        </div>
        <div className="compass__card">
          <div className="compass__card-title">Cycle Goals</div>
          <div className="compass__goals-empty">Goals will appear here after setup.</div>
        </div>
      </div>
    );
  }

  const { enrollment, goals, previousGoals = [] } = status;
  const profileLabel = PROFILE_LABELS[enrollment.cycle_profile] || enrollment.cycle_profile;

  const start = enrollment.start_date ? new Date(enrollment.start_date) : null;
  const end = enrollment.end_date ? new Date(enrollment.end_date) : null;
  const today = new Date();
  const totalDays = start && end ? Math.round((end - start) / 86400000) : 14;
  const elapsed = start ? Math.round((today - start) / 86400000) : 0;
  const daysRemaining = end ? Math.max(0, Math.round((end - today) / 86400000)) : 0;
  const pct = Math.min(100, Math.round((elapsed / totalDays) * 100));

  const fmtDate = (d) => d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const startStr = fmtDate(start);
  const endStr = fmtDate(end);

  // Group previous goals by cycle
  const prevCycleMap = {};
  for (const g of previousGoals) {
    if (!prevCycleMap[g.cycle_id]) {
      prevCycleMap[g.cycle_id] = {
        cycle_number: g.cycle_number,
        profile: g.profile,
        start_date: g.start_date,
        end_date: g.end_date,
        goals: [],
      };
    }
    prevCycleMap[g.cycle_id].goals.push(g);
  }
  const prevCycles = Object.values(prevCycleMap).sort((a, b) => b.cycle_number - a.cycle_number);

  return (
    <div className="compass__dashboard">
      <div className="compass__card">
        <div className="compass__card-title">Your Current Strategy</div>
        <div className="compass__profile-name">{profileLabel}</div>
        {enrollment.recommendation_reasoning && (
          <div className="compass__profile-reasoning">{enrollment.recommendation_reasoning}</div>
        )}
      </div>

      <div className="compass__card">
        <div className="compass__card-title">Current Cycle</div>
        {cycleEnded ? (
          <>
            <div className="compass__cycle-row">
              <span className="compass__cycle-label">Cycle {enrollment.cycle_number}</span>
              <span className="compass__cycle-value" style={{ color: '#4242ea' }}>Complete</span>
            </div>
            <div className="compass__cycle-bar-track">
              <div className="compass__cycle-bar-fill" style={{ width: '100%' }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              {startStr} — {endStr}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#555', lineHeight: 1.5 }}>
              Talk to Compass to review this cycle and start your next one.
            </div>
          </>
        ) : (
          <>
            <div className="compass__cycle-row">
              <span className="compass__cycle-label">Cycle {enrollment.cycle_number}</span>
              <span className="compass__cycle-value">{daysRemaining}d remaining</span>
            </div>
            <div className="compass__cycle-bar-track">
              <div className="compass__cycle-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              {startStr}{endStr ? ` — ${endStr}` : ''}
            </div>
          </>
        )}
      </div>

      <div className="compass__card">
        <div className="compass__card-title">Cycle Goals</div>
        {goals && goals.length > 0 ? (
          <div className="compass__goals-list">
            {goals.map(g => (
              <div
                key={g.id}
                className={`compass__goal-item${g.is_completed ? ' compass__goal-item--done' : ''}`}
              >
                <GoalProgress goal={g} onProgress={onGoalProgress} />
                <span>{g.goal_text}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="compass__goals-empty">No goals set yet.</div>
        )}
      </div>

      {prevCycles.length > 0 && (() => {
        const clampedIdx = Math.min(pastCycleIdx, prevCycles.length - 1);
        const cycle = prevCycles[clampedIdx];
        return (
          <div className="compass__card">
            <div className="compass__card-title-row">
              <div className="compass__card-title">Past Cycles</div>
              {prevCycles.length > 1 && (
                <div className="compass__past-cycle-nav">
                  <button
                    className="compass__past-cycle-nav-btn"
                    onClick={() => setPastCycleIdx(i => Math.min(i + 1, prevCycles.length - 1))}
                    disabled={clampedIdx === prevCycles.length - 1}
                    aria-label="Older cycle"
                  >‹</button>
                  <span className="compass__past-cycle-nav-label">{clampedIdx + 1} / {prevCycles.length}</span>
                  <button
                    className="compass__past-cycle-nav-btn"
                    onClick={() => setPastCycleIdx(i => Math.max(i - 1, 0))}
                    disabled={clampedIdx === 0}
                    aria-label="Newer cycle"
                  >›</button>
                </div>
              )}
            </div>
            <div className="compass__past-cycle">
              <div className="compass__past-cycle-header">
                <span className="compass__past-cycle-label">
                  Cycle {cycle.cycle_number} · {PROFILE_LABELS[cycle.profile] || cycle.profile}
                </span>
                <span className="compass__past-cycle-date">
                  {fmtDate(new Date(cycle.start_date))} – {fmtDate(new Date(cycle.end_date))}
                </span>
              </div>
              <div className="compass__goals-list" style={{ marginTop: 6 }}>
                {cycle.goals.map(g => (
                  <div
                    key={g.id}
                    className={`compass__goal-item compass__goal-item--readonly${g.is_completed ? ' compass__goal-item--done' : ''}`}
                  >
                    <div className={`compass__goal-check${g.is_completed ? ' compass__goal-check--done' : ''}`}>
                      {g.is_completed && CHECK_SVG}
                    </div>
                    <span>{g.goal_text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── CompassChat ───────────────────────────────────────────────────────────────

// Cap persisted local message count so a long-running session can't blow
// past the browser's 5-10 MB localStorage quota. Tuned generously: even at
// ~4 KB per message this stays well under 250 KB.
const MAX_PERSISTED_COMPASS_MESSAGES = 50;

// Match the auth store shape across all known login responses. The /unified-auth
// payload uses `user_id`; older code paths used `userId`/`id`. If NONE of those
// resolves we return null — the caller MUST treat null as "no persistence" and
// skip both reads and writes. The previous `compass_messages_anon` fallback
// silently shared a single localStorage key across every authenticated user
// whose payload happened to omit all three id fields, which would leak chat
// history across accounts on shared devices.
function compassStorageKeyForUser(user) {
  const id = user?.user_id ?? user?.userId ?? user?.id;
  if (id == null || id === '') return null;
  return `compass_messages_${id}`;
}

// Hard ceiling on a single chat message before we send it to the LLM. This is
// a UX/cost guard, not a security boundary — the server enforces its own
// (shorter, currently 4 000) limit. We pick a slightly smaller value so the
// client gives a friendly "shorten this" error instead of letting the server
// truncate silently.
const MAX_CLIENT_MESSAGE_CHARS = 3500;

function safeWriteCompassHistory(storageKey, messages) {
  // Caller passes null when there's no resolvable user id — skip persistence
  // entirely rather than fall back to a shared key.
  if (!storageKey) return;
  // Drop streaming placeholders before persisting and cap to the most recent
  // MAX_PERSISTED_COMPASS_MESSAGES. If the browser still throws QuotaExceeded
  // (tab is sharing storage with other apps), retry with a half-sized window
  // before giving up — and surface the failure in the console rather than
  // silently swallowing it the way the old `catch { /* ignore */ }` did.
  const persisted = messages.filter(m => !m.streaming);
  const trimmed = persisted.slice(-MAX_PERSISTED_COMPASS_MESSAGES);
  try {
    localStorage.setItem(storageKey, JSON.stringify(trimmed));
    return;
  } catch (err) {
    // QuotaExceededError name differs by browser; fall back to a smaller window.
    try {
      const halved = trimmed.slice(-Math.max(10, Math.floor(trimmed.length / 2)));
      localStorage.setItem(storageKey, JSON.stringify(halved));
    } catch (innerErr) {
      console.warn('Compass: failed to persist chat history (quota?):', innerErr?.message || innerErr);
    }
  }
}

function CompassChat({ status, cycleEnded, onEnrollmentComplete }) {
  const token = useAuthStore(s => s.token);
  const user = useAuthStore(s => s.user);

  const storageKey = compassStorageKeyForUser(user);

  const [messages, setMessages] = useState(() => {
    if (!storageKey) return [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return attachStableClientKeys(parsed);
      }
    } catch { /* ignore */ }
    return [];
  });
  const messagesRef = useRef(messages);
  const updateMessages = useCallback((updater) => {
    setMessages(prev => {
      const nextRaw = typeof updater === 'function' ? updater(prev) : updater;
      const next = attachStableClientKeys(nextRaw);
      messagesRef.current = next;
      safeWriteCompassHistory(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const initDoneRef = useRef(messagesRef.current.length > 0);
  const cycleEndSentRef = useRef(false);
  const serverHistoryHydratedRef = useRef(false);
  const statusRef = useRef(status);
  const cycleEndedRef = useRef(cycleEnded);
  const sendMessageRef = useRef(null);
  // Mirror of isStreaming for use INSIDE sendMessage. The `isStreaming` state
  // is here because the UI needs to react to it (button disabled, banner
  // text), but if we close over it inside sendMessage we have to include it
  // in useCallback deps. That recreates sendMessage on every flip, schedules
  // a useEffect to update sendMessageRef.current, and leaves a one-frame
  // window where the cycle-end / init effects can call the previous closure
  // through the ref. Reading from a ref inside sendMessage avoids the dep
  // entirely (same pattern as statusRef / cycleEndedRef).
  const isStreamingRef = useRef(false);
  // Tracks the in-flight SSE fetch so we can abort it on unmount or when the
  // user navigates away mid-stream. Without this the decoder loop keeps
  // running against a closed connection and `updateMessages` keeps firing
  // against unmounted state — a real memory leak that also pollutes logs
  // with "Can't perform a React state update on an unmounted component".
  const streamAbortRef = useRef(null);
  // Tracks whether the component is still mounted. We check this before
  // every state update issued by the streaming reader so a late chunk
  // arriving after unmount can't trigger a setState.
  const isMountedRef = useRef(true);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);

  // Unmount cleanup: abort any in-flight Compass stream and mark the
  // component as unmounted so the streaming reader bails out at the next
  // chunk boundary instead of writing to dead state.
  //
  // We MUST re-assign isMountedRef.current = true on every setup, not just
  // rely on `useRef(true)`'s initial value. In React StrictMode (enabled in
  // dev via main.jsx), every component is mounted, the cleanup is invoked,
  // and the component is mounted again on the very first render. The first
  // cleanup flips isMountedRef.current to false, and `useRef` returns the
  // SAME ref object on the second mount — so without re-arming it here the
  // ref stays false forever, which makes every `if (!isMountedRef.current)`
  // gate in the SSE reader trigger immediately and silently drop the entire
  // chat response.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (streamAbortRef.current) {
        try { streamAbortRef.current.abort(); } catch { /* ignore */ }
        streamAbortRef.current = null;
      }
    };
  }, []);

  // Sync status / cycleEnded / isStreaming refs SYNCHRONOUSLY during render.
  // Doing this in a useEffect leaves a one-frame window where a completion
  // payload arriving during the first render would observe stale `false`
  // and call /onboarding/complete a second time, creating a duplicate
  // enrollment. React lets us mutate refs during render as long as the
  // value is derived from state/props (no scheduling, no observable side
  // effect).
  statusRef.current = status;
  cycleEndedRef.current = cycleEnded;
  isStreamingRef.current = isStreaming;

  // Track whether user has scrolled away from the bottom
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      userScrolledUpRef.current = el.scrollHeight - el.scrollTop - el.clientHeight > 80;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (userScrolledUpRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Hydrate persisted server-side history once (fallbacks to localStorage-first behavior).
  useEffect(() => {
    if (serverHistoryHydratedRef.current) return;
    if (!status) return;

    // If local history already exists, keep it and mark hydration complete.
    if (messagesRef.current.length > 0) {
      serverHistoryHydratedRef.current = true;
      return;
    }

    const normalizedServerHistory = normalizeChatHistory(status.chatHistory);

    if (normalizedServerHistory.length === 0) return;

    const hydrated = attachStableClientKeys(normalizedServerHistory);
    messagesRef.current = hydrated;
    initDoneRef.current = true;
    setMessages(hydrated);
    safeWriteCompassHistory(storageKey, hydrated);
    serverHistoryHydratedRef.current = true;
  }, [status, storageKey]);

  // Initial onboarding greeting (only fires when not enrolled and no messages)
  useEffect(() => {
    if (initDoneRef.current) return;
    if (status === null) return;
    // If the status fetch failed (network blip / 5xx), don't fire the
    // onboarding greeting yet — wait for the next successful refresh. The
    // refreshStatus catch block sets fetchError: true precisely so we can
    // distinguish this from a genuine "not enrolled" state.
    if (status?.fetchError) return;
    if (status?.enrolled) { initDoneRef.current = true; return; }
    initDoneRef.current = true;
    sendMessageRef.current?.('__init__', true, '__init__');
  }, [status]);

  // Cycle-end check-in (fires independently whenever a cycle has ended)
  useEffect(() => {
    if (!cycleEnded || cycleEndSentRef.current) return;
    if (status === null || !status?.enrolled) return;
    if (status?.fetchError) return;
    cycleEndSentRef.current = true;
    sendMessageRef.current?.('__cycle_end__', true, '__cycle_end__');
  }, [cycleEnded, status]);

  const handleCompletionPayload = useCallback(async (payload) => {
    setIsCompleting(true);
    try {
      // Read from `cycleEndedRef` (kept in sync with the `cycleEnded` prop
      // synchronously during render — see `cycleEndedRef.current = cycleEnded`
      // above) instead of closing over the prop. Doing it this way means we
      // can leave `cycleEnded` OUT of this useCallback's dep array: if the
      // prop flipped between render and this callback firing, the ref already
      // has the new value, and we avoid recreating the callback (and any
      // dependent effects) on every cycle-end transition.
      const endpoint = cycleEndedRef.current
        ? `${API_URL}/api/pathfinder/compass/cycle/new`
        : `${API_URL}/api/pathfinder/compass/onboarding/complete`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          profile: payload.profile,
          reasoning: payload.reasoning,
          goals: payload.goals,
          quiz_summary: payload.quiz_summary,
          flags: payload.flags || [],
        }),
      });
      if (!res.ok) {
        console.error('Compass completion endpoint returned non-ok:', res.status);
        return;
      }

      try {
        const statusRes = await fetch(`${API_URL}/api/pathfinder/compass/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statusRes.ok) {
          console.error('Compass status refresh returned non-ok:', statusRes.status);
          return;
        }
        const statusJson = await statusRes.json();
        // The user may have navigated away during the POST + status round-trip.
        // onEnrollmentComplete is `setStatus` on the parent — calling it after
        // unmount triggers a setState-on-unmounted warning and can mask state
        // resets if the parent remounts.
        if (!isMountedRef.current) return;
        onEnrollmentComplete(statusJson);
      } catch (statusErr) {
        console.error('Compass status refresh failed:', statusErr);
      }
    } catch (err) {
      console.error('Failed to complete onboarding/new cycle:', err);
    } finally {
      if (isMountedRef.current) setIsCompleting(false);
    }
  }, [token, onEnrollmentComplete]);

  const handleAddGoalsPayload = useCallback(async (payload) => {
    setIsCompleting(true);
    try {
      const res = await fetch(`${API_URL}/api/pathfinder/compass/goals/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ goals: payload.goals }),
      });
      if (!res.ok) {
        console.error('Compass add-goals endpoint returned non-ok:', res.status);
        return;
      }

      try {
        const statusRes = await fetch(`${API_URL}/api/pathfinder/compass/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statusRes.ok) {
          console.error('Compass status refresh returned non-ok:', statusRes.status);
          return;
        }
        const statusJson = await statusRes.json();
        // Same unmount-guard rationale as in handleCompletionPayload above.
        if (!isMountedRef.current) return;
        onEnrollmentComplete(statusJson);
      } catch (statusErr) {
        console.error('Compass status refresh failed:', statusErr);
      }
    } catch (err) {
      console.error('Failed to add goals:', err);
    } finally {
      if (isMountedRef.current) setIsCompleting(false);
    }
  }, [token, onEnrollmentComplete]);

  const sendMessage = useCallback(async (text, isInit = false, initText = '__init__') => {
    const messageText = isInit ? initText : text.trim();
    if (!messageText) return;
    if (isStreamingRef.current) return;

    // Client-side length guard. The server's MAX_CHAT_MESSAGE_CHARS would
    // truncate silently; we'd rather show the builder a clear "too long"
    // message in the chat stream so they know to shorten it. Skip this for
    // server-side trigger messages (`__init__`, `__cycle_end__`).
    if (!isInit && messageText.length > MAX_CLIENT_MESSAGE_CHARS) {
      const errorId = nextId();
      updateMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `That message is a bit long for me to read in one go (${messageText.length.toLocaleString()} chars). Try splitting it into chunks under ${MAX_CLIENT_MESSAGE_CHARS.toLocaleString()} characters.`,
          id: errorId,
        },
      ]);
      return;
    }

    // Cap history we send up to the server. localStorage is already capped
    // at 50 messages by safeWriteCompassHistory, but messagesRef.current is
    // not — once a session rehydrates server-stored history (up to 60 turns)
    // and keeps chatting, the in-memory list grows unbounded and every send
    // would push more bytes. The server independently truncates to its own
    // MAX_HISTORY_MESSAGES, but matching the cap here keeps payloads small,
    // makes our UI behavior predictable, and avoids a silent context-shape
    // mismatch where the client thinks it sent 80 turns and the server
    // actually used 40.
    const MAX_HISTORY_TO_SEND = 40;
    const historyForApi = messagesRef.current
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .filter(m => !m.streaming && m.content)
      .slice(-MAX_HISTORY_TO_SEND)
      .map(m => ({ role: m.role, content: m.content }));

    const userMsgId = nextId();
    const streamMsgId = nextId();

    if (!isInit) {
      userScrolledUpRef.current = false;
      updateMessages(prev => [
        ...prev,
        { role: 'user', content: text.trim(), id: userMsgId },
      ]);
    }

    setInput('');
    setIsStreaming(true);

    updateMessages(prev => [
      ...prev,
      { role: 'assistant', content: '', id: streamMsgId, streaming: true },
    ]);

    const mode = (statusRef.current?.enrolled || cycleEndedRef.current) ? 'coaching' : 'onboarding';

    // Bind a fresh AbortController to this request and stash it on the ref
    // so the unmount cleanup can cancel us. Aborting any prior controller
    // first guards against the case where two sends overlap (shouldn't
    // happen — `isStreaming` gates new sends — but defensive).
    if (streamAbortRef.current) {
      try { streamAbortRef.current.abort(); } catch { /* ignore */ }
    }
    let abortController = new AbortController();
    streamAbortRef.current = abortController;

    // Single-retry on transient stream failures. Mirrors the server-side
    // anthropic retry — covers Render proxy timeouts, network blips, and
    // server crashes that drop the SSE connection BEFORE any chunk
    // reached the browser. We only retry on the abrupt-failure path
    // (no SSE chunks received). Once any text has rendered into the
    // assistant bubble, retrying would either duplicate the partial
    // text or clobber it — neither is a good UX. Capped at 2 attempts
    // total so a genuinely-down server doesn't double the wait time.
    const MAX_ATTEMPTS = 2;
    let attempt = 0;
    let succeeded = false;

    try {
      while (attempt < MAX_ATTEMPTS && !succeeded) {
        attempt++;
        let firstChunkReceived = false;
        try {
          const res = await fetch(`${API_URL}/api/pathfinder/compass/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ message: messageText, history: historyForApi, mode }),
            signal: abortController.signal,
          });

          // Allow 429 (rate-limit) to fall through into the SSE reader
          // below. The server emits a `text/event-stream` body with one
          // `type:'error'` event whose `error` field carries a friendly
          // user-facing message ("You're sending messages too quickly...").
          // Throwing here on 429 — as the prior code did — would surface
          // the generic catch-block "Something went wrong on my end."
          // string instead, hiding the crafted server message.
          // Other non-ok statuses (5xx, 401, etc.) still throw and route
          // through the catch block as before.
          if (!res.ok && res.status !== 429) throw new Error(`Request failed: ${res.status}`);

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let fullContent = '';
          let rafId = null;

          const flushDisplay = () => {
            rafId = null;
            const displayContent = stripForDisplay(fullContent);
            updateMessages(prev =>
              prev.map(m => m.id === streamMsgId ? { ...m, content: displayContent } : m)
            );
          };

          while (true) {
            // Bail out if the user navigated away. The unmount cleanup also
            // calls abortController.abort(), which causes reader.read() to
            // reject — but checking isMountedRef here means we stop processing
            // any in-flight chunk immediately rather than waiting for the
            // reject to propagate.
            if (!isMountedRef.current) break;

            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text') {
                  firstChunkReceived = true;
                  fullContent += data.content;
                  if (fullContent.includes(COMPLETE_START) || fullContent.includes(ADD_GOALS_START)) {
                    setIsCompleting(true);
                  }
                  // Batch display updates to animation frames — smooth 60fps render
                  if (!rafId) rafId = requestAnimationFrame(flushDisplay);
                } else if (data.type === 'error') {
                  // Surface server-emitted SSE errors instead of silently
                  // dropping them. The server emits these from two paths
                  // today: rate-limit (compassChatRateLimit handler →
                  // HTTP 429) and role-denial (requireBuilderRoleForChat
                  // → HTTP 200, intentional so the global fetch
                  // interceptor doesn't auto-logout). Both ship with a
                  // user-facing `error` string. A graceful server-emitted
                  // error counts as a successful round-trip from the
                  // retry's perspective — we have a real reply for the
                  // bubble; retrying would either duplicate it or
                  // clobber it on the next attempt.
                  firstChunkReceived = true;
                  fullContent = data.error || 'Something went wrong.';
                  if (!rafId) rafId = requestAnimationFrame(flushDisplay);
                }
              } catch { /* ignore parse errors */ }
            }
          }

          // Flush any remaining content not yet rendered. Skip post-unmount —
          // setting state on a dead component does nothing useful and just
          // logs a warning.
          if (rafId) cancelAnimationFrame(rafId);
          if (!isMountedRef.current) return;
          flushDisplay();

          // Check for completion signals
          const completionPayload = extractBetween(fullContent, COMPLETE_START, COMPLETE_END);
          const addGoalsPayload = extractBetween(fullContent, ADD_GOALS_START, ADD_GOALS_END);
          const displayContent = stripForDisplay(fullContent);
          updateMessages(prev =>
            prev.map(m => m.id === streamMsgId ? { ...m, content: displayContent, streaming: false } : m)
          );

          if (completionPayload) {
            await handleCompletionPayload(completionPayload);
          } else if (addGoalsPayload) {
            await handleAddGoalsPayload(addGoalsPayload);
          }
          succeeded = true;
        } catch (err) {
          // AbortError is expected when the user navigates away mid-stream.
          // Don't surface a "something went wrong" message — there's no UI to
          // surface it on, and the next page load will recover from server
          // history anyway. Any other error is a real failure. Returning
          // here still runs the OUTER finally below, which clears
          // streaming flags and the abort ref — JS guarantees finally
          // runs after a return inside a try/catch.
          const isAbort = err?.name === 'AbortError' || abortController.signal.aborted;
          if (isAbort) {
            return;
          }
          // Retry only when nothing reached the user yet AND we have
          // attempts left. Once any text rendered into the bubble, a
          // retry would either duplicate or clobber the partial reply —
          // both worse than just surfacing the error. The retry path
          // covers Render proxy timeouts, transient LLM 5xx, and brief
          // network blips between client and Render that all share
          // the failure mode of "stream died before any chunk arrived".
          if (!firstChunkReceived && attempt < MAX_ATTEMPTS) {
            console.warn(`[compass-chat-retry] attempt ${attempt}/${MAX_ATTEMPTS} failed (${err?.message || err?.name}), retrying once`);
            // Reset the abort controller for the retry — the previous
            // one may have been signal-aborted in the failure path or
            // by upstream cleanup. Stash the new one on the ref so
            // unmount cleanup can still cancel us mid-retry.
            abortController = new AbortController();
            streamAbortRef.current = abortController;
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          console.error('Compass chat error:', err);
          if (isMountedRef.current) {
            updateMessages(prev =>
              prev.map(m =>
                m.id === streamMsgId
                  ? { ...m, content: 'Something went wrong on my end. Give it a moment and try again.', streaming: false }
                  : m
              )
            );
          }
          break;
        }
      }
    } finally {
      // Cleanup runs on every exit path — success, retry-exhausted
      // failure, abort, and any return inside the try block above.
      // Clear the ref only if it still points at THIS controller —
      // a newer send may have already replaced it.
      if (streamAbortRef.current === abortController) {
        streamAbortRef.current = null;
      }
      if (isMountedRef.current) {
        setIsStreaming(false);
        setIsCompleting(false); // safety net — clears banner if no handler ran
      }
    }
    // isStreaming intentionally NOT in deps — see isStreamingRef declaration
    // above. Including it would recreate sendMessage on every flip, schedule
    // a useEffect to update sendMessageRef, and leave a one-frame window
    // where the cycle-end / init effects fire through the previous closure.
  }, [token, handleCompletionPayload, handleAddGoalsPayload, updateMessages]);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isDisabled = isStreaming || isCompleting;
  const placeholder = status?.enrolled ? 'Ask Compass anything...' : 'Talk to Compass...';

  return (
    <div className="compass__chat">
      <div className="compass__chat-header">
        <div className="compass__chat-avatar">C</div>
        <div>
          <div className="compass__chat-name">
            Compass
            <span className="compass__beta-tag">Beta</span>
          </div>
          <div className="compass__chat-role">Your personal career coach</div>
        </div>
      </div>

      <div className="compass__messages" ref={messagesContainerRef}>
        {messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => (
            <ChatMessage key={m.clientKey} message={m} userName={user?.firstName} />
          ))}
        <div ref={messagesEndRef} />
      </div>

      {isCompleting && (
        <div className="compass__completing">
          <div className="compass__spinner" />
          {status?.enrolled && !cycleEnded
            ? 'Adding goal...'
            : 'Setting up your cycle...'}
        </div>
      )}


      <div className="compass__input-area">
        <div className="compass__input-row">
          <textarea
            className="compass__input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
          />
          <button
            className="compass__send-btn"
            onClick={() => sendMessage(input)}
            disabled={isDisabled || !input.trim()}
          >
            Send
          </button>
        </div>
        <div className="compass__input-hint">Shift+Enter for new line · Enter to send</div>
      </div>
    </div>
  );
}

// ── PathfinderCompass (main) ───────────────────────────────────────────────────

function isCycleEnded(enrollment) {
  if (!enrollment?.end_date) return false;
  return new Date() > new Date(enrollment.end_date);
}

export default function PathfinderCompass() {
  const token = useAuthStore(s => s.token);
  const [status, setStatus] = useState(null);
  const isStatusLoading = status === null;
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/pathfinder/compass/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`status fetch failed: ${response.status}`);
      setStatus(await response.json());
    } catch (err) {
      // CRITICAL: previously this collapsed every network/5xx to
      // `{ enrolled: false }`, which the init effect (`if (status?.enrolled)`)
      // could not distinguish from a genuine "not enrolled yet" state. The
      // builder would see the __init__ onboarding greeting fire every time
      // their connection blipped, and a stray enrollment write could be
      // triggered if they engaged with the chat. Surface a distinct
      // `fetchError: true` flag so the init effect can wait it out instead.
      console.warn('Compass status fetch failed; suppressing onboarding trigger:', err?.message || err);
      setStatus({ enrolled: false, fetchError: true });
    }
  }, [token]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleGoalProgress = useCallback(async (goal, newProgressCount) => {
    const currentStatus = statusRef.current;
    if (!currentStatus?.enrolled) return;
    // Defensive: server may shape `goals` differently in future versions; never
    // assume it's an array.
    const goalsList = Array.isArray(currentStatus.goals) ? currentStatus.goals : [];
    const originalGoal = goalsList.find((g) => g.id === goal.id);
    if (!originalGoal) return;

    const target = originalGoal.target_count || 1;
    const clamped = Math.min(newProgressCount, target);
    const newCompleted = clamped >= target;

    // Optimistic update — guard against an undefined or non-array `goals`
    // shape so a server schema drift doesn't crash the dashboard.
    setStatus(prev => ({
      ...prev,
      goals: (prev?.goals ?? []).map(g =>
        g.id === goal.id
          ? { ...g, progress_count: clamped, is_completed: newCompleted }
          : g
      ),
    }));

    try {
      const response = await fetch(`${API_URL}/api/pathfinder/compass/goals/${goal.id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ progress_count: clamped }),
      });
      if (!response.ok) throw new Error(`goal progress update failed: ${response.status}`);
    } catch (err) {
      console.error('Failed to update goal:', err);
      // Refetch authoritative server state to avoid stale optimistic reverts.
      await refreshStatus();
    }
  }, [token, refreshStatus]);

  const cycleEnded = status?.enrolled ? isCycleEnded(status.enrollment) : false;

  return (
    <div className={`compass${isStatusLoading ? ' compass--loading' : ''}`}>
      <CompassChat status={status} cycleEnded={cycleEnded} onEnrollmentComplete={setStatus} />
      <CompassDashboard
        status={status}
        cycleEnded={cycleEnded}
        onGoalProgress={handleGoalProgress}
        isLoading={isStatusLoading}
      />
    </div>
  );
}
