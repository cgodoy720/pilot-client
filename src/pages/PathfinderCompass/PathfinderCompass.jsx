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
const COACH_FLAG_START = '[COMPASS_COACH_FLAG]';
const COACH_FLAG_END = '[/COMPASS_COACH_FLAG]';
const LOG_START = '[COMPASS_LOG]';
const LOG_END = '[/COMPASS_LOG]';

function extractBetween(text, start, end) {
  const s = text.indexOf(start);
  const e = text.indexOf(end);
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(text.slice(s + start.length, e)); }
  catch { return null; }
}

function stripForDisplay(text) {
  const signalPairs = [
    [COMPLETE_START, COMPLETE_END],
    [ADD_GOALS_START, ADD_GOALS_END],
    [COACH_FLAG_START, COACH_FLAG_END],
    [LOG_START, LOG_END],
  ];
  let result = text;
  // Remove complete signal blocks (start tag through end tag)
  for (const [start, end] of signalPairs) {
    let s;
    while ((s = result.indexOf(start)) !== -1) {
      const e = result.indexOf(end, s);
      if (e !== -1) {
        result = result.slice(0, s) + result.slice(e + end.length);
      } else {
        // No closing tag — strip from start tag to end of string
        result = result.slice(0, s);
        break;
      }
    }
  }
  // Strip any partial signal prefix at the tail (streaming artifact)
  const allSignals = [COMPLETE_START, ADD_GOALS_START, COACH_FLAG_START, LOG_START];
  for (const signal of allSignals) {
    for (let len = signal.length - 1; len > 0; len--) {
      if (result.endsWith(signal.slice(0, len))) {
        result = result.slice(0, -len);
        break;
      }
    }
  }
  return result.trim();
}

// ── Fuzzy search helper ───────────────────────────────────────────────────────

function fuzzyMatch(text, query) {
  if (!query || query.length < 2) return [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matches = [];

  // Exact substring matches first
  let pos = 0;
  while ((pos = lowerText.indexOf(lowerQuery, pos)) !== -1) {
    matches.push({ index: pos, length: query.length });
    pos += 1;
  }
  if (matches.length > 0) return matches;

  // Fuzzy: split query into words & match each with tolerance
  const words = lowerQuery.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (word.length < 3) continue;
    // Sliding window with edit distance 1: allow 1 char mismatch
    const wLen = word.length;
    for (let i = 0; i <= lowerText.length - wLen; i++) {
      const slice = lowerText.slice(i, i + wLen);
      let mismatches = 0;
      for (let j = 0; j < wLen && mismatches < 2; j++) {
        if (slice[j] !== word[j]) mismatches++;
      }
      if (mismatches <= 1) {
        // Avoid overlapping matches
        if (!matches.some(m => Math.abs(m.index - i) < wLen)) {
          matches.push({ index: i, length: wLen });
        }
      }
    }
  }
  return matches;
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderInline(text, searchQuery) {
  // Split on bold (**...**), markdown links ([text](url)), and bare URLs
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)>,]+)/g);
  const seen = new Map();
  return parts.map((p) => {
    const keyBase = `inline:${p}`;
    const n = (seen.get(keyBase) || 0) + 1;
    seen.set(keyBase, n);
    const key = `${keyBase}:${n}`;
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={key}>{searchQuery ? applySearchHighlights(p.slice(2, -2), searchQuery) : p.slice(2, -2)}</strong>;
    }
    const mdLink = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (mdLink) {
      return <a key={key} href={mdLink[2]} target="_blank" rel="noopener noreferrer" className="compass__link">{searchQuery ? applySearchHighlights(mdLink[1], searchQuery) : mdLink[1]}</a>;
    }
    if (/^https?:\/\//.test(p)) {
      return <a key={key} href={p} target="_blank" rel="noopener noreferrer" className="compass__link">{p}</a>;
    }
    return <React.Fragment key={key}>{searchQuery ? applySearchHighlights(p, searchQuery) : p}</React.Fragment>;
  });
}

function renderMarkdown(text, searchQuery) {
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
      : line.match(/^\d+\.\s/)
      ? 'ol'
      : !line.trim()
      ? 'gap'
      : 'p';
    const keyBase = `md:${kind}:${line}`;
    const n = (seen.get(keyBase) || 0) + 1;
    seen.set(keyBase, n);
    const key = `${keyBase}:${n}`;

    if (line.startsWith('### ')) {
      return <div key={key} className="compass__md-h3">{renderInline(line.slice(4), searchQuery)}</div>;
    }
    if (line.startsWith('## ')) {
      return <div key={key} className="compass__md-h3">{renderInline(line.slice(3), searchQuery)}</div>;
    }
    if (line.startsWith('# ')) {
      return <div key={key} className="compass__md-h3">{renderInline(line.slice(2), searchQuery)}</div>;
    }
    if (line.match(/^[-*] /)) {
      return <div key={key} className="compass__md-li">{renderInline(line.slice(2), searchQuery)}</div>;
    }
    const olMatch = line.match(/^(\d+)\.\s(.*)/);
    if (olMatch) {
      return <div key={key} className="compass__md-ol"><span className="compass__md-ol-num">{olMatch[1]}.</span> {renderInline(olMatch[2], searchQuery)}</div>;
    }
    if (!line.trim()) {
      return <div key={key} className="compass__md-gap" />;
    }
    return <div key={key}>{renderInline(line, searchQuery)}</div>;
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

function applySearchHighlights(text, query) {
  if (!query || query.length < 2 || typeof text !== 'string' || !text) return text;
  let hits;
  try {
    hits = fuzzyMatch(text, query);
  } catch {
    return text;
  }
  if (!hits || hits.length === 0) return text;
  const sorted = [...hits].sort((a, b) => a.index - b.index);
  const parts = [];
  let lastEnd = 0;
  for (const m of sorted) {
    if (m.index < lastEnd) continue;
    if (m.index > lastEnd) parts.push(text.slice(lastEnd, m.index));
    parts.push(
      <mark key={`sh-${m.index}`} className="compass__search-highlight">
        {text.slice(m.index, m.index + m.length)}
      </mark>
    );
    lastEnd = m.index + m.length;
  }
  if (lastEnd < text.length) parts.push(text.slice(lastEnd));
  return parts;
}

function ChatMessage({ message, userName, searchQuery }) {
  const smoothContent = useStreamingText(message.content || '');
  const isCoach = message.role === 'assistant';

  if (message.streaming && !message.content) {
    return (
      <div className="compass__preloader">
        <div className="compass__chat-spinner" />
      </div>
    );
  }

  // Don't render empty bubbles (e.g. when entire content was a signal that got stripped)
  if (!message.content?.trim()) return null;

  return (
    <div className={`compass__message compass__message--${isCoach ? 'coach' : 'user'}`}>
      <div className="compass__message-label">
        {isCoach ? 'Compass' : (userName || 'You')}
      </div>
      <div className="compass__message-bubble">
        {isCoach
          ? renderMarkdown(smoothContent, searchQuery)
          : applySearchHighlights(message.content, searchQuery)}
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

  const dots = Array.from({ length: target }, (_, i) => (
    <div
      key={`goal-${goal.id || goal.goal_key || 'x'}-dot-${i + 1}`}
      className={`compass__goal-dot${progress > i ? ' compass__goal-dot--filled' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        const newProgress = progress === i + 1 ? i : i + 1;
        onProgress(goal, newProgress);
      }}
    />
  ));

  if (target > 5) {
    const rows = [];
    for (let i = 0; i < dots.length; i += 5) {
      rows.push(
        <div key={`row-${i}`} className="compass__goal-dots">
          {dots.slice(i, i + 5)}
        </div>
      );
    }
    return <div className="compass__goal-dots-rows">{rows}</div>;
  }

  return <div className="compass__goal-dots">{dots}</div>;
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
              <span className="compass__cycle-value">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining</span>
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
                  <span className="compass__past-cycle-nav-label">{prevCycles[clampedIdx].cycle_number} / {prevCycles.length}</span>
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

function isDailyCheckinDue(user) {
  const key = compassTimestampKey(user);
  if (!key) return false;
  const now = new Date();
  const etHour = parseInt(now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }));
  if (etHour < 17) return false;
  const ts = localStorage.getItem(key);
  if (!ts) return true; // never messaged → due
  // If the builder already messaged today (ET), skip
  const todayET = now.toLocaleDateString('en-US', { timeZone: 'America/New_York' });
  const lastMsgDateET = new Date(Number(ts)).toLocaleDateString('en-US', { timeZone: 'America/New_York' });
  return todayET !== lastMsgDateET;
}

function compassTimestampKey(user) {
  const id = user?.user_id ?? user?.userId ?? user?.id;
  if (id == null || id === '') return null;
  return `compass_last_msg_ts_${id}`;
}

function getHoursSinceLastMessage(user) {
  const key = compassTimestampKey(user);
  if (!key) return null;
  const ts = localStorage.getItem(key);
  if (!ts) return null;
  return (Date.now() - Number(ts)) / 3600000;
}

function touchLastMessageTimestamp(user) {
  const key = compassTimestampKey(user);
  if (key) localStorage.setItem(key, String(Date.now()));
}

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
  // Always keep the first message (onboarding greeting) so it isn't lost when
  // the conversation grows past the cap. Slice the tail for the rest.
  let trimmed;
  if (persisted.length > MAX_PERSISTED_COMPASS_MESSAGES) {
    const first = persisted[0];
    const tail = persisted.slice(-(MAX_PERSISTED_COMPASS_MESSAGES - 1));
    trimmed = tail[0]?.id === first?.id ? tail : [first, ...tail];
  } else {
    trimmed = persisted;
  }
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const searchInputRef = useRef(null);
  const initDoneRef = useRef(messagesRef.current.length > 0);
  const cycleEndSentRef = useRef(false);
  const lastCycleIdRef = useRef(null);
  const nudgeResumeSentRef = useRef(false);
  const coachIntroSentRef = useRef(false);
  const jobAlertSentRef = useRef(false);
  const dailyCheckinSentRef = useRef(false);
  // Capture check-in eligibility at mount before other triggers update the timestamp
  const dailyCheckinDueAtMount = useRef(isDailyCheckinDue(user));
  const sessionFirstSendRef = useRef(true);
  const serverHistoryHydratedRef = useRef(false);
  const statusRef = useRef(status);
  const cycleEndedRef = useRef(cycleEnded);
  const sendMessageRef = useRef(null);
  const textareaRef = useRef(null);
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
    touchLastMessageTimestamp(user);
  }, [status, user]);

  // Reset cycle-end sentinel when a new cycle starts
  useEffect(() => {
    const cycleId = status?.enrollment?.cycle_id ?? null;
    if (cycleId && cycleId !== lastCycleIdRef.current) {
      lastCycleIdRef.current = cycleId;
      cycleEndSentRef.current = false;
    }
  }, [status]);

  // Cycle-end check-in (fires independently whenever a cycle has ended)
  useEffect(() => {
    if (!cycleEnded || cycleEndSentRef.current) return;
    if (status === null || !status?.enrolled) return;
    if (status?.fetchError) return;
    cycleEndSentRef.current = true;
    sendMessageRef.current?.('__cycle_end__', true, '__cycle_end__');
    touchLastMessageTimestamp(user);
  }, [cycleEnded, status, user]);

  // Nudge resume: builder started onboarding (has history) but didn't finish
  // (not enrolled) and it's been 24+ hours since their last message.
  useEffect(() => {
    if (nudgeResumeSentRef.current) return;
    if (status === null || status?.fetchError) return;
    if (status?.enrolled) return;
    // Only fire if there's existing chat history (they started but didn't finish)
    if (messagesRef.current.length === 0) return;
    const hours = getHoursSinceLastMessage(user);
    if (hours === null || hours < 24) return;
    nudgeResumeSentRef.current = true;
    sendMessageRef.current?.('__nudge_resume__', true, '__nudge_resume__');
    touchLastMessageTimestamp(user);
  }, [status, user]);

  // Coach intro migration: enrolled builder whose has_coach is unknown.
  // Fires once to ask the coach question so all existing builders get the flag set.
  // Skip if cycle has ended — the cycle-end check-in takes priority.
  // Uses coach_intro_shown from server to prevent re-asking across sessions.
  useEffect(() => {
    if (coachIntroSentRef.current) return;
    if (status === null || status?.fetchError) return;
    if (!status?.enrolled) return;
    if (status?.has_coach !== null && status?.has_coach !== undefined) return;
    if (status?.coach_intro_shown) return;
    if (cycleEnded) return;
    coachIntroSentRef.current = true;
    // Mark as shown immediately so it won't re-fire on next visit
    fetch(`${API_URL}/api/pathfinder/compass/coach-intro-shown`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    }).catch(() => {});
    sendMessageRef.current?.('__coach_intro__', true, '__coach_intro__');
    touchLastMessageTimestamp(user);
  }, [status, user, cycleEnded, token]);

  // Job alert: detect new shared job postings and auto-surface them in chat
  useEffect(() => {
    if (jobAlertSentRef.current) return;
    if (status === null || status?.fetchError) return;
    if (!status?.enrolled) return;
    if (!status?.recent_jobs?.length) return;
    // Wait for init / cycle-end / coach-intro triggers to finish first
    if (!initDoneRef.current) return;

    const uid = user?.user_id ?? user?.userId ?? user?.id;
    const seenKey = `compass_seen_jobs_${uid}`;
    const seen = JSON.parse(localStorage.getItem(seenKey) || '[]');
    const newJobs = status.recent_jobs.filter(j => !seen.includes(j.id));
    if (newJobs.length === 0) return;

    jobAlertSentRef.current = true;
    // Mark all as seen immediately so we don't re-alert
    const allSeen = [...new Set([...seen, ...newJobs.map(j => j.id)])];
    localStorage.setItem(seenKey, JSON.stringify(allSeen));

    // Wait for any in-flight triggers (re-engagement, cycle-end, etc.) to finish streaming
    const waitAndSend = () => {
      if (isStreamingRef.current) {
        setTimeout(waitAndSend, 1000);
        return;
      }
      const payload = JSON.stringify({ jobs: newJobs });
      sendMessageRef.current?.(`__job_alert__${payload}`, true, '__job_alert__');
    };
    setTimeout(waitAndSend, 3000);
  }, [status, user]);

  // Daily check-in: after 5pm ET, if builder hasn't messaged today, prompt them
  useEffect(() => {
    if (dailyCheckinSentRef.current) return;
    if (status === null || status?.fetchError) return;
    if (!status?.enrolled) return;
    if (cycleEnded) return;
    if (!initDoneRef.current) return;
    if (!dailyCheckinDueAtMount.current) return;

    dailyCheckinSentRef.current = true;
    const waitAndSend = () => {
      if (isStreamingRef.current) {
        setTimeout(waitAndSend, 1000);
        return;
      }
      sendMessageRef.current?.('__daily_checkin__', true, '__daily_checkin__');
      touchLastMessageTimestamp(user);
    };
    setTimeout(waitAndSend, 3000);
  }, [status, user, cycleEnded]);

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
        const errBody = await res.json().catch(() => ({}));
        console.error('Compass completion endpoint returned error:', res.status, errBody);
      }
      // Always refresh status so the right panel reflects DB state
      const statusRes = await fetch(`${API_URL}/api/pathfinder/compass/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statusRes.ok) {
        const statusJson = await statusRes.json();
        if (isMountedRef.current) onEnrollmentComplete(statusJson);
      }
    } catch (err) {
      console.error('Failed to complete onboarding/new cycle:', err);
    } finally {
      if (isMountedRef.current) setIsCompleting(false);
    }
  }, [token, onEnrollmentComplete]);

  const handleLogPayload = useCallback(async (payload) => {
    try {
      const entries = Array.isArray(payload.entries) ? payload.entries : [payload];
      const res = await fetch(`${API_URL}/api/pathfinder/compass/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Compass log endpoint returned non-ok:', res.status);
      }
    } catch (err) {
      console.error('Failed to log compass entries:', err);
    }
  }, [token]);

  const handleCoachFlagPayload = useCallback(async (payload) => {
    try {
      const res = await fetch(`${API_URL}/api/pathfinder/compass/coach-flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ has_coach: payload.has_coach }),
      });
      if (!res.ok) {
        console.error('Compass coach-flag endpoint returned non-ok:', res.status);
        return;
      }
      // Refresh status so dashboard and future prompts reflect the flag
      try {
        const statusRes = await fetch(`${API_URL}/api/pathfinder/compass/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statusRes.ok) {
          const statusJson = await statusRes.json();
          if (isMountedRef.current) onEnrollmentComplete(statusJson);
        }
      } catch (statusErr) {
        console.error('Compass status refresh failed after coach flag:', statusErr);
      }
    } catch (err) {
      console.error('Failed to set coach flag:', err);
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
        const errBody = await res.json().catch(() => ({}));
        console.error('Compass goals/add endpoint returned error:', res.status, errBody);
      }
      // Always refresh status so the right panel reflects DB state
      const statusRes = await fetch(`${API_URL}/api/pathfinder/compass/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statusRes.ok) {
        const statusJson = await statusRes.json();
        if (isMountedRef.current) onEnrollmentComplete(statusJson);
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
      touchLastMessageTimestamp(user);
    }

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '';
    setIsStreaming(true);

    updateMessages(prev => [
      ...prev,
      { role: 'assistant', content: '', id: streamMsgId, streaming: true },
    ]);

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
            body: JSON.stringify({
              message: messageText,
              history: historyForApi,
              reentry_gap_hours: sessionFirstSendRef.current ? Math.round(getHoursSinceLastMessage(user) || 0) : 0,
            }),
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
          // through the catch block as before. Stash the status on the
          // error so the retry decision can skip 4xx (auth, permission,
          // not-found) — those will never become valid by retrying.
          if (!res.ok && res.status !== 429) {
            const httpErr = new Error(`Request failed: ${res.status}`);
            httpErr.status = res.status;
            throw httpErr;
          }

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
          const coachFlagPayload = extractBetween(fullContent, COACH_FLAG_START, COACH_FLAG_END);
          const displayContent = stripForDisplay(fullContent);
          updateMessages(prev =>
            prev.map(m => m.id === streamMsgId ? { ...m, content: displayContent, streaming: false } : m)
          );

          // Coach flag and log are fire-and-forget — don't block on them
          if (coachFlagPayload) {
            handleCoachFlagPayload(coachFlagPayload);
          }
          const logPayload = extractBetween(fullContent, LOG_START, LOG_END);
          if (logPayload) {
            handleLogPayload(logPayload);
          }

          if (completionPayload) {
            await handleCompletionPayload(completionPayload);
          } else if (addGoalsPayload) {
            await handleAddGoalsPayload(addGoalsPayload);
          }
          succeeded = true;
          sessionFirstSendRef.current = false;
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
          //
          // Skip retry on HTTP 4xx (auth, permission, not-found, bad
          // request). A 401 won't have a fresh token in 1.5 seconds and
          // a 404 won't materialize a new endpoint — retrying just
          // delays the inevitable error message and wastes the round
          // trip. 5xx and network/abort-style errors (no `status` field)
          // still get the retry. 429 never reaches here because it
          // routes into the SSE reader as a server-emitted error event,
          // which sets firstChunkReceived=true and exits this branch.
          const isClient4xx = err?.status >= 400 && err?.status < 500;
          if (!firstChunkReceived && attempt < MAX_ATTEMPTS && !isClient4xx) {
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
  }, [token, handleCompletionPayload, handleAddGoalsPayload, handleCoachFlagPayload, handleLogPayload, updateMessages]);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── Voice input (Web Speech API + Audio Waveform) ───────────────────────────
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const waveCanvasRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const voiceTranscriptRef = useRef('');

  const hasSpeechApi = typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const drawWaveform = useCallback(() => {
    const canvas = waveCanvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Smoothed amplitude history for fluid animation
    const smoothed = new Float32Array(bufferLength).fill(0);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      const w = canvas.width;
      const h = canvas.height;
      const mid = h / 2;
      ctx.clearRect(0, 0, w, h);

      // Smooth the data for fluid motion
      for (let i = 0; i < bufferLength; i++) {
        const raw = (dataArray[i] - 128) / 128;
        smoothed[i] += (raw - smoothed[i]) * 0.3;
      }

      // Sample fewer points and interpolate with curves
      const points = 64;
      const step = bufferLength / points;

      // Draw filled wave (gradient)
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, 'rgba(66, 66, 234, 0.0)');
      gradient.addColorStop(0.3, 'rgba(66, 66, 234, 0.08)');
      gradient.addColorStop(0.5, 'rgba(66, 66, 234, 0.12)');
      gradient.addColorStop(0.7, 'rgba(66, 66, 234, 0.08)');
      gradient.addColorStop(1, 'rgba(66, 66, 234, 0.0)');

      ctx.beginPath();
      ctx.moveTo(0, mid);
      for (let i = 0; i <= points; i++) {
        const idx = Math.floor(i * step);
        const x = (i / points) * w;
        const amp = smoothed[Math.min(idx, bufferLength - 1)] * mid * 1.8;
        if (i === 0) {
          ctx.lineTo(x, mid + amp);
        } else {
          const prevX = ((i - 1) / points) * w;
          const cpx = (prevX + x) / 2;
          ctx.quadraticCurveTo(cpx, mid + smoothed[Math.min(Math.floor((i - 1) * step), bufferLength - 1)] * mid * 1.8, x, mid + amp);
        }
      }
      // Mirror back for bottom fill
      for (let i = points; i >= 0; i--) {
        const idx = Math.floor(i * step);
        const x = (i / points) * w;
        const amp = smoothed[Math.min(idx, bufferLength - 1)] * mid * 1.8;
        if (i === points) {
          ctx.lineTo(x, mid - amp);
        } else {
          const nextX = ((i + 1) / points) * w;
          const cpx = (nextX + x) / 2;
          ctx.quadraticCurveTo(cpx, mid - smoothed[Math.min(Math.floor((i + 1) * step), bufferLength - 1)] * mid * 1.8, x, mid - amp);
        }
      }
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw smooth center line
      ctx.beginPath();
      ctx.moveTo(0, mid);
      for (let i = 0; i <= points; i++) {
        const idx = Math.floor(i * step);
        const x = (i / points) * w;
        const amp = smoothed[Math.min(idx, bufferLength - 1)] * mid * 1.8;
        if (i === 0) {
          ctx.moveTo(x, mid + amp);
        } else {
          const prevX = ((i - 1) / points) * w;
          const cpx = (prevX + x) / 2;
          ctx.quadraticCurveTo(cpx, mid + smoothed[Math.min(Math.floor((i - 1) * step), bufferLength - 1)] * mid * 1.8, x, mid + amp);
        }
      }
      ctx.strokeStyle = '#4242ea';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw mirrored line
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const idx = Math.floor(i * step);
        const x = (i / points) * w;
        const amp = smoothed[Math.min(idx, bufferLength - 1)] * mid * 1.8;
        if (i === 0) {
          ctx.moveTo(x, mid - amp);
        } else {
          const prevX = ((i - 1) / points) * w;
          const cpx = (prevX + x) / 2;
          ctx.quadraticCurveTo(cpx, mid - smoothed[Math.min(Math.floor((i - 1) * step), bufferLength - 1)] * mid * 1.8, x, mid - amp);
        }
      }
      ctx.strokeStyle = 'rgba(66, 66, 234, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };
    draw();
  }, []);

  const stopWaveform = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      // Stop mic stream tracks to turn off browser mic indicator
      if (audioContextRef.current._stream) {
        audioContextRef.current._stream.getTracks().forEach(t => t.stop());
      }
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      analyserRef.current = null;
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      stopWaveform();
      // Apply accumulated transcript
      const transcript = voiceTranscriptRef.current;
      if (transcript) {
        setInput(prev => {
          const prefix = prev && !prev.endsWith(' ') ? prev + ' ' : prev;
          return prefix + transcript;
        });
        voiceTranscriptRef.current = '';
        // Auto-resize textarea after transcript is applied
        requestAnimationFrame(() => {
          const ta = textareaRef.current;
          if (ta) {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 168) + 'px';
          }
        });
      }
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;
    recognitionRef.current = recognition;
    voiceTranscriptRef.current = '';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          voiceTranscriptRef.current += event.results[i][0].transcript;
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      stopWaveform();
      // Apply transcript on auto-end
      const transcript = voiceTranscriptRef.current;
      if (transcript) {
        setInput(prev => {
          const prefix = prev && !prev.endsWith(' ') ? prev + ' ' : prev;
          return prefix + transcript;
        });
        voiceTranscriptRef.current = '';
        requestAnimationFrame(() => {
          const ta = textareaRef.current;
          if (ta) {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 168) + 'px';
          }
        });
      }
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted') console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      stopWaveform();
      recognitionRef.current = null;
    };

    // Start audio analyser for waveform
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      // Store stream so we can stop tracks later
      audioCtx._stream = stream;
      drawWaveform();
    }).catch(() => {
      // If mic access fails, still allow speech recognition without waveform
    });

    recognition.start();
    setIsListening(true);
  }, [isListening, drawWaveform, stopWaveform]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      stopWaveform();
    };
  }, [stopWaveform]);

  const isDisabled = isStreaming || isCompleting;
  const placeholder = status?.enrolled ? 'Ask Compass anything...' : 'Talk to Compass...';

  // ── Search logic ─────────────────────────────────────────────────────────────
  const searchResults = React.useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const visibleMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
    const results = [];
    visibleMessages.forEach((m, msgIdx) => {
      const text = stripForDisplay(m.content || '');
      const hits = fuzzyMatch(text, searchQuery);
      hits.forEach(hit => {
        results.push({ msgIdx, messageKey: m.clientKey, ...hit });
      });
    });
    return results;
  }, [messages, searchQuery]);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setSearchQuery('');
    setSearchIndex(0);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchIndex(0);
  }, []);

  const scrollToSearchResult = useCallback((idx) => {
    if (!searchResults[idx]) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    const highlights = container.querySelectorAll('.compass__search-highlight');
    // Find the nth highlight that matches this result's global index
    let globalIdx = 0;
    for (const result of searchResults) {
      if (globalIdx === idx) break;
      globalIdx++;
    }
    const target = highlights[idx];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Pulse the active one
      highlights.forEach(h => h.classList.remove('compass__search-highlight--active'));
      target.classList.add('compass__search-highlight--active');
    }
  }, [searchResults]);

  const nextResult = useCallback(() => {
    if (searchResults.length === 0) return;
    const next = (searchIndex + 1) % searchResults.length;
    setSearchIndex(next);
    scrollToSearchResult(next);
  }, [searchIndex, searchResults, scrollToSearchResult]);

  const prevResult = useCallback(() => {
    if (searchResults.length === 0) return;
    const prev = (searchIndex - 1 + searchResults.length) % searchResults.length;
    setSearchIndex(prev);
    scrollToSearchResult(prev);
  }, [searchIndex, searchResults, scrollToSearchResult]);

  // Auto-scroll to first result when query changes
  useEffect(() => {
    if (searchResults.length > 0) {
      setSearchIndex(0);
      // Small delay to let highlights render
      setTimeout(() => scrollToSearchResult(0), 100);
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="compass__chat">
      <div className="compass__chat-header">
        <div className="compass__chat-avatar">C</div>
        <div style={{ flex: 1 }}>
          <div className="compass__chat-name">
            Compass
            <span className="compass__beta-tag">Beta</span>
          </div>
          <div className="compass__chat-role">Your personal career coach</div>
        </div>
        <button
          className="compass__search-toggle"
          onClick={searchOpen ? closeSearch : openSearch}
          aria-label={searchOpen ? 'Close search' : 'Search chat'}
          title="Search chat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {searchOpen && (
        <div className="compass__search-bar">
          <input
            ref={searchInputRef}
            className="compass__search-input"
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSearchIndex(0); }}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); e.shiftKey ? prevResult() : nextResult(); }
              if (e.key === 'Escape') closeSearch();
            }}
            placeholder="Search messages..."
          />
          <span className="compass__search-count">
            {searchResults.length > 0 ? `${searchIndex + 1} / ${searchResults.length}` : searchQuery.length >= 2 ? '0 results' : ''}
          </span>
          <button className="compass__search-nav" onClick={prevResult} disabled={searchResults.length === 0} aria-label="Previous match">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button className="compass__search-nav" onClick={nextResult} disabled={searchResults.length === 0} aria-label="Next match">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button className="compass__search-close" onClick={closeSearch} aria-label="Close search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div className="compass__messages" ref={messagesContainerRef}>
        {messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => (
            <ChatMessage key={m.clientKey} message={m} userName={user?.firstName} searchQuery={searchOpen ? searchQuery : ''} />
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
          {isListening ? (
            <div className="compass__waveform-container">
              <canvas ref={waveCanvasRef} className="compass__waveform-canvas" width="600" height="64" />
              <span className="compass__waveform-label">Listening...</span>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              className="compass__input"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                const ta = e.target;
                ta.style.height = 'auto';
                ta.style.height = Math.min(ta.scrollHeight, 168) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isDisabled}
              rows={1}
            />
          )}
          {hasSpeechApi && (
            <button
              className={`compass__mic-btn${isListening ? ' compass__mic-btn--active' : ''}`}
              onClick={toggleVoice}
              disabled={isDisabled}
              aria-label={isListening ? 'Stop recording' : 'Start voice input'}
              title={isListening ? 'Stop recording' : 'Voice input'}
            >
              {isListening ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>
          )}
          <button
            className="compass__send-btn"
            onClick={() => sendMessage(input)}
            disabled={isDisabled || !input.trim()}
          >
            Send
          </button>
        </div>
        <div className="compass__input-hint">Shift+Enter for new line · Enter to send{hasSpeechApi ? ' · Mic for voice' : ''}</div>
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
