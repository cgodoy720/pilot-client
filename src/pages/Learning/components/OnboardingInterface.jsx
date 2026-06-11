import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import useAuthStore from '../../../stores/authStore';
import {
  startSession,
  getSession,
  abandonSession,
  completeSession,
  streamChat,
} from '../../../services/onboardingApi';
import { useStreamingText } from '../../../hooks/useStreamingText';
import { Button } from '../../../components/ui/button';
import AutoExpandTextarea from '../../../components/AutoExpandTextarea';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Streaming markdown bubble — coach turns animate as text arrives via SSE.
// Mirrors the same pattern used in Learning.jsx and PathfinderCompass.jsx.
// ---------------------------------------------------------------------------
const StreamingMarkdownMessage = ({ content }) => {
  const displayedContent = useStreamingText(content || '');
  // Convert bare URLs to clickable links.
  const processed = displayedContent.replace(
    /(?<!\()(?<!]\()https?:\/\/[^\s)]+/g,
    (url) => `[${url}](${url})`
  );
  return (
    <div className="text-carbon-black leading-relaxed text-base font-proxima">
      <ReactMarkdown
        components={{
          p: (props) => <p className="mb-3" {...props} />,
          ul: (props) => <ul className="list-disc pl-6 my-3 space-y-1" {...props} />,
          ol: (props) => <ol className="list-decimal pl-6 my-3 space-y-1" {...props} />,
          a: (props) => (
            <a className="text-blue-500 hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          strong: (props) => <strong className="font-semibold text-carbon-black" {...props} />,
          em: (props) => <em className="italic text-carbon-black" {...props} />,
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
};

// ---------------------------------------------------------------------------
// OnboardingInterface — SSE-streamed chat with voice dictation.
// Uses the shared AutoExpandTextarea component (Learning.jsx's input tray)
// with the new opt-in showMicButton prop — the visual is identical to the
// regular chat input, with a Voice button added on the bottom-left.
// ---------------------------------------------------------------------------
function OnboardingInterface({ taskId, userId, isCompleted, isLastTask, onComplete }) {
  const token = useAuthStore((s) => s.token);

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]); // [{ role: 'user'|'coach', content, seq }]
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState('');
  const startTimeRef = useRef(Date.now());
  const completedRef = useRef(false);
  // Synchronous in-flight guard for handleComplete. A bare useState would
  // let a fast double-click slip through because the state update is async
  // — both clicks would read isFinishing=false in the same microtask and
  // both call completeSession.
  const finishingRef = useRef(false);
  const seqRef = useRef(0);
  const streamingMsgIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  // Ref-synced session id so sendChat reads the latest value without closing
  // over a stale state read. setState is async — the useEffect that calls
  // setSessionId(...) followed by sendChat('') in the same tick would
  // otherwise see sessionId=null in sendChat's closure.
  const sessionIdRef = useRef(null);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Auto-scroll on new turns / streamed chunks.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---- Stream a chat turn through SSE, threading chunks into one bubble ----
  const sendChat = useCallback(
    async (messageText) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      setIsSending(true);
      setError('');

      // Optimistically append the builder's bubble (unless this is the opening
      // call with empty message text).
      if (messageText.length > 0) {
        seqRef.current += 1;
        setMessages((prev) => [
          ...prev,
          { id: `u-${seqRef.current}`, role: 'user', content: messageText, seq: seqRef.current },
        ]);
      }
      // Prepare a streaming coach bubble.
      seqRef.current += 1;
      const coachBubbleId = `c-${seqRef.current}`;
      streamingMsgIdRef.current = coachBubbleId;
      setMessages((prev) => [
        ...prev,
        { id: coachBubbleId, role: 'coach', content: '', seq: seqRef.current, streaming: true },
      ]);

      // Tear down any prior stream.
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        await streamChat(token, sid, messageText, {
          signal: abortRef.current.signal,
          onText: ({ content }) => {
            setMessages((prev) => prev.map((m) =>
              m.id === coachBubbleId ? { ...m, content: (m.content || '') + content } : m
            ));
          },
          onDone: () => {
            setMessages((prev) => prev.map((m) =>
              m.id === coachBubbleId ? { ...m, streaming: false } : m
            ));
          },
          onError: ({ error: errMsg }) => {
            setMessages((prev) => prev.map((m) =>
              m.id === coachBubbleId ? { ...m, content: errMsg || 'Something went wrong.', streaming: false } : m
            ));
          },
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Chat stream failed:', err);
          setMessages((prev) => prev.map((m) =>
            m.id === coachBubbleId
              ? { ...m, content: 'Something went wrong on my end — try sending that again.', streaming: false }
              : m
          ));
        }
      } finally {
        setIsSending(false);
        streamingMsgIdRef.current = null;
      }
    },
    [token]  // Intentionally NOT depending on sessionId — we read it via sessionIdRef.current.
  );

  // ---- On Start: create the session, hydrate prior turns (resume), kick off opening ----
  useEffect(() => {
    if (!hasStarted) return;
    let cancelled = false;
    setIsLoading(true);
    setError('');
    startTimeRef.current = Date.now();

    (async () => {
      try {
        const startData = await startSession(token, taskId);
        if (cancelled) return;
        // Set ref immediately so any synchronous sendChat call later in this
        // tick sees the correct id (the sync-from-state useEffect runs on
        // the NEXT render, which is too late).
        sessionIdRef.current = startData.sessionId;
        setSessionId(startData.sessionId);

        // Resume: pull prior transcript if the session already has turns.
        let hadPriorTurns = false;
        try {
          const { messages: priorMessages } = await getSession(token, startData.sessionId);
          if (!cancelled && Array.isArray(priorMessages) && priorMessages.length > 0) {
            hadPriorTurns = true;
            const hydrated = priorMessages.map((m) => {
              seqRef.current += 1;
              return {
                id: `r-${seqRef.current}`,
                role: m.role === 'builder' ? 'user' : 'coach',
                content: m.content || '',
                seq: seqRef.current,
              };
            });
            setMessages(hydrated);
          }
        } catch (hydrateErr) {
          console.error('Failed to hydrate prior onboarding turns:', hydrateErr);
        }

        setIsLoading(false);

        // Kick off the OPENING (empty message) ONLY if no prior turns existed.
        if (!hadPriorTurns && !cancelled) {
          // Don't await — let the SSE stream drive the UI from here.
          sendChat('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to start onboarding session');
          setIsLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, taskId]);

  // ---- Abandon: best-effort on unmount when not completed ----
  // Mount-once cleanup so we only fire abandon ONCE on actual unmount, not on
  // every sessionId change. Read sessionId via the ref so we get whatever
  // value was current at unmount time.
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      const sid = sessionIdRef.current;
      if (!completedRef.current && sid) {
        abandonSession(token, sid).catch(() => { /* ignore */ });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Handlers ----
  // AutoExpandTextarea's onSubmit signature: (messageText, modelChoice). The
  // model arg is ignored for onboarding — the coach model is server-fixed via
  // ONBOARDING_CHAT_MODEL env on the controller.
  const handleSubmit = (messageText) => {
    if (!messageText || !messageText.trim() || isSending) return;
    sendChat(messageText.trim());
  };

  // Finalize the session (enqueues server-side extraction) then hand control
  // back to the parent so the task carousel can advance. The completedRef
  // guard suppresses the abandon-on-unmount cleanup since we're completing
  // cleanly. Idempotent — re-clicks are no-ops while finishing.
  const handleComplete = useCallback(async () => {
    if (completedRef.current || finishingRef.current) return;
    finishingRef.current = true;
    setIsFinishing(true);
    // Tear down any in-flight stream so completeSession isn't racing chat.
    if (abortRef.current) abortRef.current.abort();
    try {
      const sid = sessionIdRef.current;
      if (sid) {
        const durationSeconds = Math.max(
          0,
          Math.round((Date.now() - startTimeRef.current) / 1000)
        );
        await completeSession(token, sid, { durationSeconds });
      }
      completedRef.current = true;
      onComplete?.();
    } catch (err) {
      console.error('Failed to complete onboarding session:', err);
      toast.error('Could not finish onboarding — please try again.');
      // Reset both gates so the user can retry.
      finishingRef.current = false;
      setIsFinishing(false);
    }
  }, [token, onComplete]);

  // ---- Pre-call screen ----
  if (!hasStarted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-light px-6 py-10">
        <div className="max-w-xl w-full text-center">
          <h2 className="text-2xl font-proxima-bold text-carbon-black mb-3">Meet your coach</h2>
          <p className="text-[#666] font-proxima mb-8">
            You&apos;ll have a short conversation. Type your replies, or click the mic to speak
            them — your voice gets transcribed into the chat. The coach replies in text. Take
            your time; you can finish whenever you&apos;re ready.
          </p>
          <Button
            onClick={() => setHasStarted(true)}
            className="bg-pursuit-purple hover:bg-pursuit-purple/90 px-8 py-6 text-base font-proxima-bold"
          >
            Start conversation
          </Button>
        </div>
      </div>
    );
  }

  // ---- Loading the session ----
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-light">
        <div className="flex items-center gap-3 text-[#666] font-proxima">
          <Loader2 className="w-5 h-5 animate-spin" />
          Setting up your onboarding…
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-light px-6">
        <div className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-mastery-pink mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-carbon-black font-proxima mb-2">
            We couldn&apos;t start your onboarding session
          </h2>
          <p className="text-[#666] font-proxima text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const userInitial = userId ? String(userId).charAt(0).toUpperCase() : 'U';

  // ---- Chat surface ----
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-bg-light relative">
      {/* Transcript — full height, scrolls behind the absolutely-positioned
          input tray. pb-44 reserves space so the last message clears the tray
          when scrolled to bottom; mid-scroll messages just slide behind it. */}
      <div className="flex-1 min-h-0 overflow-y-auto py-8 px-6 pb-44">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 && (
            <div className="flex items-center gap-3">
              <img src="/preloader.gif" alt="Loading…" className="w-8 h-8" />
              <span className="italic text-gray-500 text-sm font-proxima">
                Connecting you with your coach…
              </span>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={message.id ?? index} className="mb-6">
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

      {/* Input tray — absolutely positioned over the transcript so messages
          scroll behind it (matches Learning.jsx). pointer-events-none on the
          wrapper lets clicks pass through the gutter; the inner block restores
          pointer events for the textarea itself. */}
      <div className="absolute bottom-6 left-0 right-0 px-6 z-10 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          {/* Discrete Finish action — a small chip above the textarea so the
              builder always has a clean exit when they feel the conversation
              is done. Replaces the old "Your Coach" header bar the user asked
              us to remove; the action stays but the chrome is gone. */}
          <div className="flex justify-end mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleComplete}
              disabled={isFinishing || isCompleted}
              title="Finish onboarding"
              className="text-xs font-proxima text-pursuit-purple border-pursuit-purple/40 hover:bg-pursuit-purple/5"
            >
              {isFinishing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Wrapping up…
                </>
              ) : (
                isLastTask ? 'Finish & wrap up' : 'Finish onboarding'
              )}
            </Button>
          </div>
          <AutoExpandTextarea
            onSubmit={handleSubmit}
            disabled={isSending || isCompleted || isFinishing}
            showMicButton
            placeholder="Reply to your coach…"
          />
        </div>
      </div>
    </div>
  );
}

export default OnboardingInterface;
