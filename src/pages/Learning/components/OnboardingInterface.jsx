import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import useAuthStore from '../../../stores/authStore';
import {
  startSession,
  getSession,
  completeSession,
  abandonSession,
} from '../../../services/onboardingApi';
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

  // Subscribe to LiveKit transcriptions (Req 2.4): render both speakers.
  useEffect(() => {
    if (!room) return;

    const handleTranscription = (segments, participant) => {
      const finals = segments.filter((s) => s.final);
      if (!finals.length) return;
      const role = participant?.identity?.startsWith('builder-') ? 'user' : 'coach';
      setMessages((prev) => [
        ...prev,
        ...finals.map((s) => {
          seqRef.current += 1;
          return { role, content: s.text, seq: seqRef.current, ts: Date.now() };
        }),
      ]);
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
  const [isLoading, setIsLoading] = useState(true);
  const startTimeRef = useRef(Date.now());
  const completedRef = useRef(false);

  // On mount: start (or resume) the session, hydrating prior turns for resume (Req 14.7).
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await startSession(token, taskId);
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
  }, [taskId]);

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
