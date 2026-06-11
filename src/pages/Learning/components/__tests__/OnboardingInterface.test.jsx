import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

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
// Mock the onboarding API — no network.
// ---------------------------------------------------------------------------
vi.mock('../../../../services/onboardingApi', () => ({
  startSession: vi.fn(),
  getSession: vi.fn(),
  completeSession: vi.fn(),
  abandonSession: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock livekit-client — only Track.Source.Microphone is referenced.
// ---------------------------------------------------------------------------
vi.mock('livekit-client', () => ({
  Track: { Source: { Microphone: 'microphone' } },
}));

// ---------------------------------------------------------------------------
// Mock @livekit/components-react.
//   - LiveKitRoom: passthrough renderer; captures props (token/url/onDisconnected).
//   - useRoomContext: returns a controllable fake room with .on/.off and
//     .localParticipant.publishData.
//   - useVoiceAssistant / useTrackToggle: controllable via test-level refs.
// ---------------------------------------------------------------------------
const lkState = {
  lastRoomProps: null,
  room: null,
  voiceAssistant: { state: 'connecting', audioTrack: null },
  trackToggle: { toggle: vi.fn().mockResolvedValue(undefined), enabled: true, pending: false },
};

function makeFakeRoom() {
  const handlers = {};
  return {
    handlers,
    on: vi.fn((event, cb) => {
      handlers[event] = handlers[event] || [];
      handlers[event].push(cb);
    }),
    off: vi.fn((event, cb) => {
      if (!handlers[event]) return;
      handlers[event] = handlers[event].filter((h) => h !== cb);
    }),
    emit(event, ...args) {
      (handlers[event] || []).forEach((h) => h(...args));
    },
    localParticipant: {
      publishData: vi.fn().mockResolvedValue(undefined),
    },
  };
}

vi.mock('@livekit/components-react', () => ({
  LiveKitRoom: ({ children, serverUrl, token, onDisconnected }) => {
    lkState.lastRoomProps = { serverUrl, token, onDisconnected };
    return <div data-testid="livekit-room">{children}</div>;
  },
  RoomAudioRenderer: () => <div data-testid="room-audio-renderer" />,
  BarVisualizer: () => <div data-testid="bar-visualizer" />,
  useVoiceAssistant: () => lkState.voiceAssistant,
  useRoomContext: () => lkState.room,
  useTrackToggle: () => lkState.trackToggle,
}));

vi.mock('@livekit/components-styles', () => ({}));

// ---------------------------------------------------------------------------
// sonner toast — avoid real toasts.
// ---------------------------------------------------------------------------
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import OnboardingInterface from '../OnboardingInterface';
import {
  startSession,
  getSession,
  completeSession,
  abandonSession,
} from '../../../../services/onboardingApi';

const CONNECTION = {
  sessionId: 'sess-1',
  livekitToken: 'lk-token-xyz',
  livekitUrl: 'wss://lk.example.com',
};

function resetLk() {
  lkState.lastRoomProps = null;
  lkState.room = makeFakeRoom();
  lkState.voiceAssistant = { state: 'listening', audioTrack: null };
  lkState.trackToggle = {
    toggle: vi.fn().mockResolvedValue(undefined),
    enabled: true,
    pending: false,
  };
}

// Render, click through the "Meet your coach" pre-call screen, and flush the
// startSession effect that fires once hasStarted=true. The pre-call gate was
// added with the SSE-chat rewrite; without the click no test ever reaches the
// effect that calls startSession.
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
  // Click "Start conversation" to flip hasStarted → triggers startSession effect.
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /start conversation/i }));
    await Promise.resolve();
    await Promise.resolve();
  });
  return utils;
}

// jsdom does not implement scrollIntoView (used by the auto-scroll effect).
beforeEach(() => {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  } else {
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
  }
  vi.clearAllMocks();
  resetLk();
  startSession.mockResolvedValue(CONNECTION);
  getSession.mockResolvedValue({ messages: [] });
  completeSession.mockResolvedValue({});
  abandonSession.mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllTimers();
});

// Coach turns are rendered through useStreamingText (RAF-revealed) + ReactMarkdown.
// Match the innermost <p> node once it has fully revealed the text.
function findCoachText(text) {
  return screen.findByText(
    (content, el) => el?.tagName === 'P' && el.textContent === text,
    {},
    { timeout: 3000 }
  );
}

describe('OnboardingInterface', () => {
  // -------------------------------------------------------------------------
  // Mount → startSession + LiveKitRoom with returned token/url (Req 14.x)
  // -------------------------------------------------------------------------
  it('calls startSession on mount and renders LiveKitRoom with the returned token/url', async () => {
    await renderOnboarding();

    expect(startSession).toHaveBeenCalledTimes(1);
    expect(startSession).toHaveBeenCalledWith('test-token', 'task-1');

    expect(screen.getByTestId('livekit-room')).toBeInTheDocument();
    expect(lkState.lastRoomProps.token).toBe(CONNECTION.livekitToken);
    expect(lkState.lastRoomProps.serverUrl).toBe(CONNECTION.livekitUrl);
  });

  it('shows an error state when startSession rejects (no token/url)', async () => {
    startSession.mockRejectedValueOnce(new Error('boom'));
    await renderOnboarding();

    expect(screen.queryByTestId('livekit-room')).not.toBeInTheDocument();
    expect(screen.getByText(/couldn.t start your onboarding session/i)).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // transcriptionReceived → both coach and builder bubbles (Req 2.4)
  // -------------------------------------------------------------------------
  it('renders a builder (user) bubble and a coach bubble from transcriptionReceived', async () => {
    await renderOnboarding();

    // Builder turn: participant identity starts with 'builder-' → user bubble.
    act(() => {
      lkState.room.emit(
        'transcriptionReceived',
        [{ text: 'Hi there, I am the builder.', final: true }],
        { identity: 'builder-42' }
      );
    });

    // Coach turn: any other identity → coach bubble.
    act(() => {
      lkState.room.emit(
        'transcriptionReceived',
        [{ text: 'Welcome! I am your coach.', final: true }],
        { identity: 'agent-coach' }
      );
    });

    expect(await screen.findByText('Hi there, I am the builder.')).toBeInTheDocument();
    // Coach text is streamed by useStreamingText — wait for it to fully reveal.
    expect(await findCoachText('Welcome! I am your coach.')).toBeInTheDocument();
  });

  it('ignores non-final transcription segments', async () => {
    await renderOnboarding();

    act(() => {
      lkState.room.emit(
        'transcriptionReceived',
        [{ text: 'partial interim text', final: false }],
        { identity: 'builder-42' }
      );
    });

    expect(screen.queryByText('partial interim text')).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Typed fallback → publishData + optimistic user bubble (Req 2.6, 14.1, 14.2)
  // -------------------------------------------------------------------------
  it('publishData with encoded typed_turn and optimistically renders the user bubble', async () => {
    await renderOnboarding();

    const textarea = screen.getByPlaceholderText('Type a reply to your coach...');
    fireEvent.input(textarea, { target: { value: 'Typed hello' } });

    await act(async () => {
      fireEvent.keyPress(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
      await Promise.resolve();
    });

    expect(lkState.room.localParticipant.publishData).toHaveBeenCalledTimes(1);
    const [payload, opts] = lkState.room.localParticipant.publishData.mock.calls[0];
    const decoded = JSON.parse(new TextDecoder().decode(payload));
    expect(decoded).toEqual({ type: 'typed_turn', text: 'Typed hello' });
    expect(opts).toEqual({ reliable: true });

    // optimistic user bubble
    expect(await screen.findByText('Typed hello')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Mic-denied → inline notice, typed tray still usable, SAME session
  // (no second startSession call) (Req 14.x)
  // -------------------------------------------------------------------------
  it('shows mic-denied notice when toggle rejects and keeps the same session (typed tray usable)', async () => {
    lkState.trackToggle = {
      toggle: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
      enabled: false,
      pending: false,
    };
    const consoleErr = vi.spyOn(console, 'error').mockImplementation(() => {});

    await renderOnboarding();

    expect(startSession).toHaveBeenCalledTimes(1);

    // Toggle the mic (button shows MicOff when not enabled) → toggle rejects.
    const micButton = screen.getByTitle('Unmute microphone');
    await act(async () => {
      fireEvent.click(micButton);
      await Promise.resolve();
    });

    // Inline notice surfaces.
    expect(await screen.findByText(/Microphone access is unavailable/i)).toBeInTheDocument();

    // Typed tray remains usable, same session — no new startSession.
    const textarea = screen.getByPlaceholderText('Type a reply to your coach...');
    fireEvent.input(textarea, { target: { value: 'still typing' } });
    await act(async () => {
      fireEvent.keyPress(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
      await Promise.resolve();
    });

    expect(lkState.room.localParticipant.publishData).toHaveBeenCalledTimes(1);
    expect(startSession).toHaveBeenCalledTimes(1); // no re-start
    expect(await screen.findByText('still typing')).toBeInTheDocument();

    consoleErr.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Resume → getSession called, prior turns hydrated/rendered (Req 14.7)
  // -------------------------------------------------------------------------
  it('hydrates prior turns via getSession when startSession returns resumed:true', async () => {
    startSession.mockResolvedValueOnce({ ...CONNECTION, resumed: true });
    getSession.mockResolvedValueOnce({
      messages: [
        { role: 'builder', content: 'Earlier builder message', seq: 1, ts: 1 },
        { role: 'coach', content: 'Earlier coach reply', seq: 2, ts: 2 },
      ],
    });

    await renderOnboarding();

    expect(getSession).toHaveBeenCalledTimes(1);
    expect(getSession).toHaveBeenCalledWith('test-token', CONNECTION.sessionId);

    // Prior builder turn → user bubble.
    expect(await screen.findByText('Earlier builder message')).toBeInTheDocument();
    // Prior coach turn → coach bubble (streamed; full content on mount path).
    expect(await findCoachText('Earlier coach reply')).toBeInTheDocument();
  });

  it('does not call getSession when the session is not resumed', async () => {
    startSession.mockResolvedValueOnce({ ...CONNECTION, resumed: false });
    await renderOnboarding();
    expect(getSession).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Completion: onDisconnected and Finish both completeSession + onComplete
  // -------------------------------------------------------------------------
  it('completeSession + onComplete when LiveKitRoom onDisconnected fires', async () => {
    const onComplete = vi.fn();
    await renderOnboarding({ onComplete });

    await act(async () => {
      lkState.lastRoomProps.onDisconnected();
      await Promise.resolve();
    });

    expect(completeSession).toHaveBeenCalledTimes(1);
    expect(completeSession).toHaveBeenCalledWith(
      'test-token',
      CONNECTION.sessionId,
      expect.objectContaining({ durationSeconds: expect.any(Number) })
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('completeSession + onComplete when the Finish action is clicked', async () => {
    const onComplete = vi.fn();
    await renderOnboarding({ onComplete });

    const finishButton = screen.getByTitle('Finish onboarding');
    await act(async () => {
      fireEvent.click(finishButton);
      await Promise.resolve();
    });

    expect(completeSession).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('completes only once even if disconnect and finish both fire', async () => {
    const onComplete = vi.fn();
    await renderOnboarding({ onComplete });

    await act(async () => {
      lkState.lastRoomProps.onDisconnected();
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.click(screen.getByTitle('Finish onboarding'));
      await Promise.resolve();
    });

    expect(completeSession).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Abandon on unmount before completion (best-effort, Req 14.6)
  // -------------------------------------------------------------------------
  it('abandons the session on unmount when it was never completed', async () => {
    const { unmount } = await renderOnboarding();

    await act(async () => {
      unmount();
      await Promise.resolve();
    });

    expect(abandonSession).toHaveBeenCalledTimes(1);
    expect(abandonSession).toHaveBeenCalledWith('test-token', CONNECTION.sessionId);
  });
});
