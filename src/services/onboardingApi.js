const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function startSession(token, taskId) {
  const res = await fetch(`${API_URL}/api/onboarding-session/start`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ taskId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to start onboarding session: ${res.status}`);
  }
  return res.json();
}

export async function getSession(token, sessionId) {
  const res = await fetch(`${API_URL}/api/onboarding-session/${encodeURIComponent(sessionId)}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch onboarding session: ${res.status}`);
  }
  return res.json();
}

export async function completeSession(token, sessionId, { durationSeconds }) {
  const res = await fetch(`${API_URL}/api/onboarding-session/${encodeURIComponent(sessionId)}/complete`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ durationSeconds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to complete onboarding session: ${res.status}`);
  }
  return res.json();
}

export async function abandonSession(token, sessionId) {
  const res = await fetch(`${API_URL}/api/onboarding-session/${encodeURIComponent(sessionId)}/abandon`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to abandon onboarding session: ${res.status}`);
  }
  return res.json();
}

/**
 * SSE-streamed onboarding chat. Mirrors the Compass /chat pattern.
 *
 * Pass message='' on the FIRST call (transcript empty) to get the coach's
 * opening turn — the server detects this and generates a warm greeting +
 * first anchor question via buildOpeningLine.
 *
 * Callbacks fire as the SSE stream arrives:
 *   onText({ content })       — incremental chunk
 *   onDone({ sequenceNumber }) — stream finished cleanly
 *   onError({ error })         — server-emitted SSE error event
 *
 * `signal` is an AbortSignal — abort to tear down an in-flight stream
 * (e.g., on unmount). Returns when the stream ends, errors, or is aborted.
 */
export async function streamChat(token, sessionId, message, { onText, onDone, onError, signal } = {}) {
  const res = await fetch(
    `${API_URL}/api/onboarding-session/${encodeURIComponent(sessionId)}/chat`,
    {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ message: message || '' }),
      signal,
    }
  );
  if (!res.ok && res.status !== 429) {
    throw new Error(`Chat request failed: ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      let data;
      try {
        data = JSON.parse(line.slice(6));
      } catch {
        continue;
      }
      if (data.type === 'text') {
        onText?.(data);
      } else if (data.type === 'done') {
        onDone?.(data);
      } else if (data.type === 'error') {
        onError?.(data);
      }
    }
  }
}
