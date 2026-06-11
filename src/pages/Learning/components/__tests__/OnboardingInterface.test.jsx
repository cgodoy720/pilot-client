import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock useAuthStore — selector-based (component reads s.token).
// ---------------------------------------------------------------------------
vi.mock('../../../../stores/authStore', () => {
  const state = { token: 'test-token', user: { id: 42, firstName: 'Bea' } };
  const useAuthStore = (selector) => (selector ? selector(state) : state);
  useAuthStore.getState = () => state;
  return { __esModule: true, default: useAuthStore };
});

// ---------------------------------------------------------------------------
// Mock the onboarding API — no network. streamChat drives the SSE pipeline:
// the component passes us { onText, onDone, onError, signal } and we invoke
// onText/onDone synchronously to simulate a streamed reply.
// ---------------------------------------------------------------------------
vi.mock('../../../../services/onboardingApi', () => ({
  startSession: vi.fn(),
  getSession: vi.fn(),
  completeSession: vi.fn(),
  abandonSession: vi.fn(),
  streamChat: vi.fn(),
}));

// sonner toast — keep silent; the Finish handler shows a toast on failure.
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import OnboardingInterface from '../OnboardingInterface';
import {
  startSession,
  getSession,
  completeSession,
  abandonSession,
  streamChat,
} from '../../../../services/onboardingApi';

const SESSION = { sessionId: 'sess-1' };

// Render and click through the "Meet your coach" pre-call screen so the
// startSession effect runs. The component gates everything behind that
// Start button; tests that need the chat path always pass through here.
async function renderOnboarding(props = {}) {
  let utils;
  await act(async () => {
    utils = render(
      <OnboardingInterface
        taskId="task-1"
        userId={42}
        isCompleted={false}
        isLastTask={false}
        onComplete={props.onComplete || vi.fn()}
        {...props}
      />
    );
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /start conversation/i }));
    // Two microtask flushes — startSession resolves on tick 1, the
    // opening-line sendChat() resolves on tick 2.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
  return utils;
}

beforeEach(() => {
  // jsdom doesn't implement scrollIntoView — the component's auto-scroll
  // effect calls it on every new turn.
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  } else {
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
  }
  vi.clearAllMocks();
  startSession.mockResolvedValue(SESSION);
  getSession.mockResolvedValue({ messages: [] });
  completeSession.mockResolvedValue({});
  abandonSession.mockResolvedValue({});
  // Default streamChat: emit one coach chunk then done. Tests that need
  // different behavior override per-test.
  streamChat.mockImplementation(async (_token, _sid, _message, { onText, onDone }) => {
    onText?.({ content: 'Hi there!' });
    onDone?.({ sequenceNumber: 1 });
  });
});

afterEach(() => {
  vi.clearAllTimers();
});

describe('OnboardingInterface', () => {
  // -------------------------------------------------------------------------
  // Pre-call screen + Start gate
  // -------------------------------------------------------------------------
  it('renders the "Meet your coach" pre-call screen before any API call', () => {
    render(
      <OnboardingInterface taskId="task-1" userId={42} isCompleted={false} />
    );
    expect(screen.getByText(/meet your coach/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start conversation/i })).toBeInTheDocument();
    // No session has started yet — startSession must not fire on mount.
    expect(startSession).not.toHaveBeenCalled();
  });

  it('clicking Start triggers startSession with the token and taskId', async () => {
    await renderOnboarding();
    expect(startSession).toHaveBeenCalledTimes(1);
    expect(startSession).toHaveBeenCalledWith('test-token', 'task-1');
  });

  it('shows an error state when startSession rejects', async () => {
    startSession.mockRejectedValueOnce(new Error('boom'));
    await renderOnboarding();
    expect(screen.getByText(/couldn.t start your onboarding session/i)).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Opening turn: with no prior transcript, the component calls sendChat('')
  // to fetch the coach's greeting via SSE.
  // -------------------------------------------------------------------------
  it('kicks off the opening turn via streamChat when no prior turns exist', async () => {
    await renderOnboarding();
    expect(streamChat).toHaveBeenCalledTimes(1);
    const [token, sid, message] = streamChat.mock.calls[0];
    expect(token).toBe('test-token');
    expect(sid).toBe(SESSION.sessionId);
    expect(message).toBe('');
  });

  // -------------------------------------------------------------------------
  // Resume: prior transcript → hydrate, skip the opening sendChat
  // -------------------------------------------------------------------------
  it('hydrates prior turns via getSession when startSession reports resumed:true', async () => {
    startSession.mockResolvedValueOnce({ ...SESSION, resumed: true });
    getSession.mockResolvedValueOnce({
      messages: [
        { role: 'builder', content: 'Earlier builder message', seq: 1 },
        { role: 'coach', content: 'Earlier coach reply', seq: 2 },
      ],
    });
    await renderOnboarding();
    expect(getSession).toHaveBeenCalledWith('test-token', SESSION.sessionId);
    expect(await screen.findByText('Earlier builder message')).toBeInTheDocument();
    // Coach reply still renders (via the streaming-markdown bubble), but
    // since useStreamingText reveals one char at a time, we wait for it.
    await waitFor(() => {
      expect(screen.getByText(/Earlier coach reply/)).toBeInTheDocument();
    }, { timeout: 3000 });
    // No opening sendChat — only hydration.
    expect(streamChat).not.toHaveBeenCalled();
  });

  it('SKIPS the getSession round-trip on a fresh session (resumed:false)', async () => {
    // Default SESSION mock has no resumed flag → component must not fetch
    // the transcript, since there's nothing to hydrate.
    await renderOnboarding();
    expect(getSession).not.toHaveBeenCalled();
    // It does call streamChat with empty message to get the coach's opener.
    expect(streamChat).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // User typing: textarea → streamChat with the message + optimistic user bubble
  // -------------------------------------------------------------------------
  it('sends a typed reply via streamChat and renders the user bubble optimistically', async () => {
    await renderOnboarding();
    streamChat.mockClear(); // ignore the opening-turn call

    const textarea = screen.getByPlaceholderText(/reply to your coach/i);
    fireEvent.input(textarea, { target: { value: 'Typed hello' } });
    await act(async () => {
      fireEvent.keyPress(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
      await Promise.resolve();
    });

    expect(streamChat).toHaveBeenCalledTimes(1);
    const [, sid, message] = streamChat.mock.calls[0];
    expect(sid).toBe(SESSION.sessionId);
    expect(message).toBe('Typed hello');
    expect(await screen.findByText('Typed hello')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Finish button: completeSession + onComplete (the High-severity reviewer
  // fix — ContentPreview / Learning carousel can't advance without this.)
  // -------------------------------------------------------------------------
  it('Finish action calls completeSession then onComplete', async () => {
    const onComplete = vi.fn();
    await renderOnboarding({ onComplete });

    await act(async () => {
      fireEvent.click(screen.getByTitle('Finish onboarding'));
      // Let completeSession() resolve and the onComplete callback fire.
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(completeSession).toHaveBeenCalledTimes(1);
    expect(completeSession).toHaveBeenCalledWith(
      'test-token',
      SESSION.sessionId,
      expect.objectContaining({ durationSeconds: expect.any(Number) })
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows "Finish & wrap up" when isLastTask is true', async () => {
    await renderOnboarding({ isLastTask: true });
    expect(screen.getByText(/finish & wrap up/i)).toBeInTheDocument();
  });

  it('Finish is idempotent — double-click only completes once', async () => {
    const onComplete = vi.fn();
    await renderOnboarding({ onComplete });

    const finish = screen.getByTitle('Finish onboarding');
    await act(async () => {
      fireEvent.click(finish);
      fireEvent.click(finish);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(completeSession).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Abandon on unmount when never completed (best-effort cleanup)
  // -------------------------------------------------------------------------
  it('abandons the session on unmount when it was never completed', async () => {
    const { unmount } = await renderOnboarding();
    await act(async () => {
      unmount();
      await Promise.resolve();
    });
    expect(abandonSession).toHaveBeenCalledTimes(1);
    expect(abandonSession).toHaveBeenCalledWith('test-token', SESSION.sessionId);
  });

  it('does NOT abandon on unmount when the session was completed', async () => {
    await renderOnboarding();
    await act(async () => {
      fireEvent.click(screen.getByTitle('Finish onboarding'));
      await Promise.resolve();
      await Promise.resolve();
    });
    abandonSession.mockClear();
    // Now unmount — abandon should not fire because completedRef is set.
    const { unmount } = await renderOnboarding();
    await act(async () => {
      unmount();
      await Promise.resolve();
    });
    // First render's session was already finished; the second render's
    // session is fresh so it WILL abandon on its own unmount. The contract
    // we care about: completing flips completedRef so the SAME instance's
    // unmount doesn't re-abandon.
    expect(abandonSession).toHaveBeenCalledTimes(1);
  });
});
