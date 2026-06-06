import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import useAuthStore from '../../../stores/authStore';
import {
  startSession,
  getSession,
  completeSession,
  abandonSession,
} from '../../../services/onboardingApi';
import { ONBOARDING_VOICES } from '../../../services/onboardingVoices';
import { useStreamingText } from '../../../hooks/useStreamingText';
import AutoExpandTextarea from '../../../components/AutoExpandTextarea';
import { Button } from '../../../components/ui/button';
import { Mic, MicOff, AlertCircle, Loader2, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';

import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  useRoomContext,
  useTrackToggle,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

// Mirrors the inline StreamingMarkdownMessage in Learning.jsx (same useStreamingText
// hook + ReactMarkdown markup) so coach turns render identically to the chat branch.
const StreamingMarkdownMessage = ({ content, animateOnMount = false }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const effectiveContent = animateOnMount && !hasMounted ? '' : (content || '');
  const displayedContent = useStreamingText(effectiveContent);

  let processedContent = displayedContent;

  // Never render completion control markers in UI.
  processedContent = processedContent.replace(/\[TASK(?:_| )COMPLETE\]/gi, '').trim();

  // Convert bare URLs to clickable links.
  processedContent = processedContent.replace(
    /(?<!\()(?<!]\()https?:\/\/[^\s)]+/g,
    (url) => `[${url}](${url})`
  );

  // Convert bullet points to markdown.
  processedContent = processedContent.replace(/^•\s+/gm, '- ');
  processedContent = processedContent.replace(/\n•\s+/g, '\n- ');

  return (
    <div className="text-carbon-black leading-relaxed text-base font-proxima">
      <ReactMarkdown
        components={{
          p: ({ node, children, ...props }) => (
            <p className="mb-4" {...props}>{children}</p>
          ),
          h1: ({ node, children, ...props }) => (
            <h1 className="text-xl font-semibold mt-6 mb-4 first:mt-0 text-carbon-black" {...props}>{children}</h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="text-lg font-semibold mt-5 mb-3 first:mt-0 text-carbon-black" {...props}>{children}</h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-base font-semibold mt-4 mb-2 first:mt-0 text-carbon-black" {...props}>{children}</h3>
          ),
          ul: ({ node, children, ...props }) => (
            <ul className="list-disc pl-6 my-4 space-y-1 text-carbon-black" {...props}>{children}</ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol className="list-decimal pl-6 my-4 space-y-1 text-carbon-black" {...props}>{children}</ol>
          ),
          li: ({ node, children, ...props }) => (
            <li className="text-carbon-black" {...props}>{children}</li>
          ),
          a: ({ node, children, ...props }) => (
            <a className="text-blue-500 hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
          ),
          strong: ({ node, children, ...props }) => (
            <strong className="font-semibold text-carbon-black" {...props}>{children}</strong>
          ),
          em: ({ node, children, ...props }) => (
            <em className="italic text-carbon-black" {...props}>{children}</em>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

// Inner room content — runs inside <LiveKitRoom>, so it has room context.
function InnerRoom({ userId, initialMessages, isLastTask, onFinish }) {
  const room = useRoomContext();
  const voiceAssistant = useVoiceAssistant();
  const [messages, setMessages] = useState(initialMessages || []);
  const [typedDraftSeq, setTypedDraftSeq] = useState(0);
  const messagesEndRef = useRef(null);
  const seqRef = useRef(initialMessages?.length || 0);

  const agentState = voiceAssistant.state;
  const isAgentSpeaking = agentState === 'speaking';
  const isAgentListening = agentState === 'listening';
  const isAgentThinking = agentState === 'thinking';

  const {
    toggle: toggleMic,
    enabled: micEnabled,
    pending: micPending,
  } = useTrackToggle({ source: Track.Source.Microphone });

  const [micDenied, setMicDenied] = useState(false);

  // Detect mic permission denial — keep the SAME session running on typed input.
  const handleToggleMic = useCallback(async () => {
    try {
      await toggleMic();
      setMicDenied(false);
    } catch (err) {
      console.error('Microphone unavailable:', err);
      setMicDenied(true);
    }
  }, [toggleMic]);

  // Subscribe to LiveKit transcriptions (Req 2.4): render both speakers, and
  // stream interim text live as the agent speaks.
  //
  // The agent worker (via voice.AgentSession's SyncedTextOutput) publishes
  // text segments synchronized with TTS audio playback. Each segment has a
  // stable `id` and arrives multiple times: first with partial text and
  // `final: false`, then with the full text and `final: true`. We key bubbles
  // by `segmentId` and update their content in-place so the on-screen text
  // matches what the user is hearing in real time. Final-only would produce a
  // 1–2 sec lag after each sentence completes.
  useEffect(() => {
    if (!room) return;

    const handleTranscription = (segments, participant) => {
      if (!segments?.length) return;
      const role = participant?.identity?.startsWith('builder-') ? 'user' : 'coach';

      setMessages((prev) => {
        const next = [...prev];
        for (const seg of segments) {
          if (!seg?.id) continue;
          const idx = next.findIndex((m) => m.segmentId === seg.id);
          if (idx >= 0) {
            // Update in place — same bubble, growing text.
            next[idx] = {
              ...next[idx],
              content: seg.text,
              final: !!seg.final,
            };
          } else {
            seqRef.current += 1;
            next.push({
              role,
              content: seg.text,
              seq: seqRef.current,
              ts: Date.now(),
              segmentId: seg.id,
              final: !!seg.final,
            });
          }
        }
        return next;
      });
    };

    room.on('transcriptionReceived', handleTranscription);
    return () => room.off('transcriptionReceived', handleTranscription);
  }, [room]);

  // Auto-scroll on new turns.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typedDraftSeq]);

  // Typed fallback (Req 2.6, 14.1–14.2): send the typed turn to the agent over
  // the LiveKit data channel and optimistically append it as a user bubble.
  const handleTypedSubmit = useCallback(
    async (text) => {
      const trimmed = (text || '').trim();
      if (!trimmed || !room?.localParticipant) return;

      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ type: 'typed_turn', text: trimmed })
        );
        await room.localParticipant.publishData(payload, { reliable: true });
      } catch (err) {
        console.error('Failed to send typed turn:', err);
        toast.error('Could not send your message. Please try again.');
        return;
      }

      seqRef.current += 1;
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: trimmed, seq: seqRef.current, ts: Date.now() },
      ]);
      setTypedDraftSeq((n) => n + 1);
    },
    [room]
  );

  const statusText = isAgentSpeaking
    ? 'Speaking...'
    : isAgentListening
    ? 'Listening...'
    : isAgentThinking
    ? 'Thinking...'
    : 'Connecting...';

  const userInitial = userId ? String(userId).charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden bg-bg-light">
      {/* Voice affordances bar */}
      <div className="border-b border-stardust px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-proxima font-semibold text-carbon-black">Your Coach</p>
              <p className="text-xs text-[#666] font-proxima">{statusText}</p>
            </div>
            {voiceAssistant.audioTrack && (
              <div className="w-28 h-10">
                <BarVisualizer
                  state={agentState}
                  barCount={5}
                  trackRef={voiceAssistant.audioTrack}
                  className="w-full h-full"
                  options={{ minHeight: 4 }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={micEnabled ? 'default' : 'destructive'}
              size="lg"
              disabled={micPending}
              className={`rounded-full w-12 h-12 p-0 ${micEnabled ? 'bg-pursuit-purple hover:bg-[#3535c0]' : ''}`}
              onClick={handleToggleMic}
              title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[#666]"
              onClick={onFinish}
              title="Finish onboarding"
            >
              <PhoneOff className="w-4 h-4 mr-1" />
              {isLastTask ? 'Finish & Wrap Up' : 'Finish'}
            </Button>
          </div>
        </div>

        {micDenied && (
          <div className="max-w-2xl mx-auto mt-3 flex items-start gap-2 rounded-lg bg-mastery-pink/10 border border-mastery-pink/30 px-3 py-2">
            <AlertCircle className="w-4 h-4 text-mastery-pink mt-0.5 flex-shrink-0" />
            <p className="text-xs text-carbon-black font-proxima">
              Microphone access is unavailable. No problem — you can keep this same conversation going by typing your
              replies below.
            </p>
          </div>
        )}
      </div>

      {/* Running transcript */}
      <div className="flex-1 min-h-0 overflow-y-auto py-8 px-6" style={{ paddingBottom: '140px' }}>
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 && (
            <div className="flex items-center gap-3">
              <img src="/preloader.gif" alt="Loading..." className="w-8 h-8" />
              <span className="italic text-gray-500 text-sm font-proxima">
                Connecting you with your coach...
              </span>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={message.seq ?? index} className="mb-6">
              {message.role === 'user' ? (
                <div className="bg-stardust rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <span className="text-pursuit-purple text-sm font-proxima font-semibold">
                        {userInitial}
                      </span>
                    </div>
                    <div className="flex-1 text-carbon-black leading-relaxed text-base font-proxima">
                      {message.content}
                    </div>
                  </div>
                </div>
              ) : (
                <StreamingMarkdownMessage content={message.content} />
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Typed fallback tray */}
      <div className="absolute bottom-6 left-0 right-0 px-6 z-10 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <AutoExpandTextarea
            onSubmit={handleTypedSubmit}
            placeholder="Type a reply to your coach..."
          />
        </div>
      </div>

      <RoomAudioRenderer />
    </div>
  );
}

function OnboardingInterface({ taskId, userId, isCompleted, isLastTask, onComplete }) {
  const token = useAuthStore((s) => s.token);

  const [connection, setConnection] = useState(null); // { sessionId, livekitToken, livekitUrl }
  const [initialMessages, setInitialMessages] = useState([]);
  const [error, setError] = useState('');
  // Pre-call state: builder hasn't picked a voice yet. We deliberately do NOT
  // call startSession on mount — it only fires once they click "Start". A nice
  // side effect: React StrictMode's mount→unmount→remount no longer triggers
  // duplicate dispatches because there's nothing to dispatch until the user
  // confirms. selectedVoiceId starts null so the user has to actively pick.
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  const [previewingVoiceId, setPreviewingVoiceId] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const startTimeRef = useRef(Date.now());
  const completedRef = useRef(false);
  const previewAudioRef = useRef(null);
  const previewAbortRef = useRef(null);
  const previewBlobUrlRef = useRef(null);

  const playVoicePreview = useCallback(
    async (voiceId) => {
      setSelectedVoiceId(voiceId);

      // Cancel any in-flight preview fetch from a prior click.
      if (previewAbortRef.current) previewAbortRef.current.abort();
      previewAbortRef.current = new AbortController();

      // Stop any currently playing preview.
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }
      // Release the previous Blob URL to avoid leaking memory across clicks.
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
        previewBlobUrlRef.current = null;
      }

      setPreviewingVoiceId(voiceId);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/onboarding-session/voice-preview/${encodeURIComponent(voiceId)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: previewAbortRef.current.signal,
          },
        );
        if (!res.ok) {
          setPreviewingVoiceId(null);
          return; // silent fail; user can click again to retry
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        previewBlobUrlRef.current = url;
        if (previewAudioRef.current) {
          previewAudioRef.current.src = url;
          await previewAudioRef.current.play().catch(() => {});
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Voice preview failed:', err);
        }
      } finally {
        setPreviewingVoiceId((current) => (current === voiceId ? null : current));
      }
    },
    [token],
  );

  // Cleanup any in-flight preview state on unmount.
  useEffect(() => {
    return () => {
      if (previewAbortRef.current) previewAbortRef.current.abort();
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
        previewBlobUrlRef.current = null;
      }
    };
  }, []);

  // Fires when the builder clicks "Start" with a chosen voice.
  useEffect(() => {
    if (!hasStarted) return;
    let cancelled = false;
    setIsLoading(true);
    startTimeRef.current = Date.now();

    (async () => {
      try {
        const data = await startSession(token, taskId, selectedVoiceId);
        if (cancelled) return;

        // Resume hydration (Req 14.7): pull prior transcript turns before connecting.
        if (data.resumed && data.sessionId) {
          try {
            const { messages: priorMessages } = await getSession(token, data.sessionId);
            if (!cancelled && Array.isArray(priorMessages)) {
              setInitialMessages(
                priorMessages.map((m) => ({
                  role: m.role === 'builder' ? 'user' : 'coach',
                  content: m.content,
                  seq: m.seq,
                  ts: m.ts,
                }))
              );
            }
          } catch (hydrateErr) {
            console.error('Failed to hydrate prior onboarding turns:', hydrateErr);
          }
        }

        if (!cancelled) {
          setConnection({
            sessionId: data.sessionId,
            livekitToken: data.livekitToken,
            livekitUrl: data.livekitUrl,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to start onboarding session');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, taskId]);

  // Completion: complete the session (enqueues extraction) then advance the task.
  const handleComplete = useCallback(async () => {
    if (completedRef.current) return;
    completedRef.current = true;

    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      if (connection?.sessionId) {
        await completeSession(token, connection.sessionId, { durationSeconds });
      }
    } catch (err) {
      console.error('Failed to complete onboarding session:', err);
    }
    onComplete?.();
  }, [connection, token, onComplete]);

  // Abandon when the component unmounts before completion (best-effort, Req 14.6).
  useEffect(() => {
    return () => {
      if (!completedRef.current && connection?.sessionId) {
        abandonSession(token, connection.sessionId).catch((err) =>
          console.error('Failed to abandon onboarding session:', err)
        );
      }
    };
  }, [connection, token]);

  // Pre-call: voice picker. Only renders when the builder hasn't clicked "Start"
  // yet. After they click, hasStarted=true → the useEffect above fires startSession
  // → we transition to the loading state below, then to the LiveKitRoom.
  if (!hasStarted) {
    const genderPillClass = (gender) => {
      if (gender === 'female')  return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      if (gender === 'male')    return 'bg-sky-50 text-sky-700 border-sky-200';
      if (gender === 'neutral') return 'bg-slate-100 text-slate-700 border-slate-300';
      return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-start bg-bg-light px-6 py-10 overflow-y-auto">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-proxima-bold text-carbon-black mb-2">
              Pick your coach&apos;s voice
            </h2>
            <p className="text-[#666] font-proxima">
              Click a voice to hear a quick sample. Pick the one you&apos;d most enjoy
              hearing for the next 15–20 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {ONBOARDING_VOICES.map((voice) => {
              const selected = voice.id === selectedVoiceId;
              const previewing = voice.id === previewingVoiceId;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => playVoicePreview(voice.id)}
                  className={`text-left rounded-lg border-2 px-4 py-3 transition-colors font-proxima
                    ${selected
                      ? 'border-pursuit-purple bg-pursuit-purple/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'}
                  `}
                  aria-pressed={selected}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="flex items-center gap-2 font-proxima-bold text-carbon-black">
                      {voice.name}
                      {previewing && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-pursuit-purple" />
                      )}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${genderPillClass(voice.gender)}`}>
                      {voice.gender}
                    </span>
                  </div>
                  <p className="text-sm text-[#666] leading-snug">
                    {voice.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-2 sticky bottom-4">
            <Button
              onClick={() => setHasStarted(true)}
              disabled={!selectedVoiceId}
              className="bg-pursuit-purple hover:bg-pursuit-purple/90 disabled:bg-gray-300 disabled:cursor-not-allowed px-8 py-6 text-base font-proxima-bold shadow-lg"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start conversation
            </Button>
            {!selectedVoiceId && (
              <p className="text-xs text-[#888] font-proxima">
                Pick a voice to continue
              </p>
            )}
          </div>

          {/* Hidden audio element used for all voice previews. Single ref so
              switching voices interrupts the previous sample cleanly. */}
          <audio ref={previewAudioRef} className="hidden" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-light">
        <div className="flex items-center gap-3 text-[#666] font-proxima">
          <Loader2 className="w-5 h-5 animate-spin" />
          Setting up your onboarding conversation...
        </div>
      </div>
    );
  }

  if (error || !connection?.livekitToken || !connection?.livekitUrl) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-light px-6">
        <div className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-mastery-pink mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-carbon-black font-proxima mb-2">
            We couldn&apos;t start your onboarding session
          </h2>
          <p className="text-[#666] font-proxima text-sm">
            {error || 'The session could not be initialized. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={connection.livekitUrl}
      token={connection.livekitToken}
      connect={true}
      audio={true}
      video={false}
      className="flex-1 min-h-0 flex flex-col"
      onDisconnected={handleComplete}
    >
      {isCompleted && (
        <div className="bg-pursuit-purple/10 border-b border-pursuit-purple/20 px-6 py-2">
          <p className="max-w-2xl mx-auto text-xs text-pursuit-purple font-proxima">
            You&apos;ve already completed onboarding — feel free to pick the conversation back up any time.
          </p>
        </div>
      )}
      <InnerRoom
        userId={userId}
        initialMessages={initialMessages}
        isLastTask={isLastTask}
        onFinish={handleComplete}
      />
    </LiveKitRoom>
  );
}

export default OnboardingInterface;
