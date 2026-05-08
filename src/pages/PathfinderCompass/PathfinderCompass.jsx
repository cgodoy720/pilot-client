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

function CompassChat({ status, cycleEnded, onEnrollmentComplete }) {
  const token = useAuthStore(s => s.token);
  const user = useAuthStore(s => s.user);

  const storageKey = `compass_messages_${user?.userId || 'anon'}`;

  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(`compass_messages_${user?.userId || 'anon'}`);
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
      try {
        localStorage.setItem(storageKey, JSON.stringify(next.filter(m => !m.streaming)));
      } catch { /* ignore */ }
      return next;
    });
  }, [storageKey]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const initDoneRef = useRef(messagesRef.current.length > 0);
  const cycleEndSentRef = useRef(false);
  const serverHistoryHydratedRef = useRef(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);

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
    if (!status || !Array.isArray(status.chatHistory)) return;

    // If local history already exists, keep it and mark hydration complete.
    if (messagesRef.current.length > 0) {
      serverHistoryHydratedRef.current = true;
      return;
    }

    const normalizedServerHistory = status.chatHistory
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map((m, idx) => ({
        id: `srv-${m.id ?? idx}`,
        role: m.role,
        content: m.content,
      }));

    if (normalizedServerHistory.length === 0) return;

    const hydrated = attachStableClientKeys(normalizedServerHistory);
    messagesRef.current = hydrated;
    initDoneRef.current = true;
    setMessages(hydrated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(hydrated));
    } catch { /* ignore */ }
    serverHistoryHydratedRef.current = true;
  }, [status, storageKey]);

  // Initial onboarding greeting (only fires when not enrolled and no messages)
  useEffect(() => {
    if (initDoneRef.current) return;
    if (status === null) return;
    if (status?.enrolled) { initDoneRef.current = true; return; }
    initDoneRef.current = true;
    sendMessage('__init__', true, '__init__');
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cycle-end check-in (fires independently whenever a cycle has ended)
  useEffect(() => {
    if (!cycleEnded || cycleEndSentRef.current) return;
    if (status === null || !status?.enrolled) return;
    cycleEndSentRef.current = true;
    sendMessage('__cycle_end__', true, '__cycle_end__');
  }, [cycleEnded, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompletionPayload = useCallback(async (payload) => {
    setIsCompleting(true);
    try {
      // If cycle ended, start a new cycle; otherwise complete initial onboarding
      const endpoint = cycleEnded
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
        onEnrollmentComplete(await statusRes.json());
      } catch (statusErr) {
        console.error('Compass status refresh failed:', statusErr);
      }
    } catch (err) {
      console.error('Failed to complete onboarding/new cycle:', err);
    } finally {
      setIsCompleting(false);
    }
  }, [token, cycleEnded, onEnrollmentComplete]);

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
        onEnrollmentComplete(await statusRes.json());
      } catch (statusErr) {
        console.error('Compass status refresh failed:', statusErr);
      }
    } catch (err) {
      console.error('Failed to add goals:', err);
    } finally {
      setIsCompleting(false);
    }
  }, [token, onEnrollmentComplete]);

  const sendMessage = useCallback(async (text, isInit = false, initText = '__init__') => {
    const messageText = isInit ? initText : text.trim();
    if (!messageText) return;
    if (isStreaming) return;

    const historyForApi = messagesRef.current
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .filter(m => !m.streaming && m.content)
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

    const mode = (status?.enrolled || cycleEnded) ? 'coaching' : 'onboarding';

    try {
      const res = await fetch(`${API_URL}/api/pathfinder/compass/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: messageText, history: historyForApi, mode }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

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
              fullContent += data.content;
              if (fullContent.includes(COMPLETE_START) || fullContent.includes(ADD_GOALS_START)) {
                setIsCompleting(true);
              }
              // Batch display updates to animation frames — smooth 60fps render
              if (!rafId) rafId = requestAnimationFrame(flushDisplay);
            }
          } catch { /* ignore parse errors */ }
        }
      }

      // Flush any remaining content not yet rendered
      if (rafId) cancelAnimationFrame(rafId);
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
    } catch (err) {
      console.error('Compass chat error:', err);
      updateMessages(prev =>
        prev.map(m =>
          m.id === streamMsgId
            ? { ...m, content: 'Something went wrong on my end. Give it a moment and try again.', streaming: false }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setIsCompleting(false); // safety net — clears banner if no handler ran
    }
  }, [isStreaming, token, status, cycleEnded, handleCompletionPayload, handleAddGoalsPayload, updateMessages]);

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

  useEffect(() => {
    fetch(`${API_URL}/api/pathfinder/compass/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ enrolled: false }));
  }, [token]);

  const handleGoalProgress = useCallback(async (goal, newProgressCount) => {
    if (!status?.enrolled) return;
    const target = goal.target_count || 1;
    const clamped = Math.min(newProgressCount, target);
    const newCompleted = clamped >= target;

    // Optimistic update
    setStatus(prev => ({
      ...prev,
      goals: prev.goals.map(g =>
        g.id === goal.id
          ? { ...g, progress_count: clamped, is_completed: newCompleted }
          : g
      ),
    }));

    try {
      await fetch(`${API_URL}/api/pathfinder/compass/goals/${goal.id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ progress_count: clamped }),
      });
    } catch (err) {
      console.error('Failed to update goal:', err);
      // Revert on error
      setStatus(prev => ({
        ...prev,
        goals: prev.goals.map(g =>
          g.id === goal.id
            ? { ...g, progress_count: goal.progress_count, is_completed: goal.is_completed }
            : g
        ),
      }));
    }
  }, [status, token]);

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
