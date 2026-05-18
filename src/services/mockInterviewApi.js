const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function startInterview(token, interviewType, focusArea) {
  const res = await fetch(`${API_URL}/api/pathfinder/mock-interviews/start`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ interviewType, focusArea }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to start interview: ${res.status}`);
  }
  return res.json();
}

export async function completeInterview(token, interviewId, durationSeconds) {
  const res = await fetch(`${API_URL}/api/pathfinder/mock-interviews/${encodeURIComponent(interviewId)}/complete`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ durationSeconds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to complete interview: ${res.status}`);
  }
  return res.json();
}

export async function getInterview(token, interviewId) {
  const res = await fetch(`${API_URL}/api/pathfinder/mock-interviews/${encodeURIComponent(interviewId)}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch interview: ${res.status}`);
  }
  return res.json();
}

export async function getInterviewHistory(token, page = 1, limit = 20) {
  const res = await fetch(
    `${API_URL}/api/pathfinder/mock-interviews?page=${page}&limit=${limit}`,
    { headers: getHeaders(token) }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch history: ${res.status}`);
  }
  return res.json();
}

/**
 * Stream the interviewer's first message (greeting + first question) as audio.
 */
export async function streamFirstMessage(token, interviewId, model, { onAudio, onTranscript, onDone, onError }) {
  const res = await fetch(`${API_URL}/api/pathfinder/mock-interviews/${encodeURIComponent(interviewId)}/first-message`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ model }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    onError?.(err.error || `Failed: ${res.status}`);
    return;
  }

  await processSSEStream(res, { onAudio, onTranscript, onDone, onError });
}

/**
 * Send user audio and stream back the interviewer's audio response.
 */
export async function streamInterviewResponse(token, interviewId, audioBase64, format, model, { onAudio, onTranscript, onDone, onError }) {
  const res = await fetch(`${API_URL}/api/pathfinder/mock-interviews/${encodeURIComponent(interviewId)}/stream`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ audio: audioBase64, format, model }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    onError?.(err.error || `Failed: ${res.status}`);
    return;
  }

  await processSSEStream(res, { onAudio, onTranscript, onDone, onError });
}

async function processSSEStream(response, { onAudio, onTranscript, onDone, onError }) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

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
        if (data.type === 'audio') onAudio?.(data.data);
        else if (data.type === 'transcript') onTranscript?.(data.text);
        else if (data.type === 'done') onDone?.(data);
        else if (data.type === 'error') onError?.(data.error);
      } catch {
        // skip malformed
      }
    }
  }
}

export async function abandonInterview(token, interviewId) {
  const res = await fetch(`${API_URL}/api/pathfinder/mock-interviews/${encodeURIComponent(interviewId)}/abandon`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to abandon interview: ${res.status}`);
  }
  return res.json();
}
