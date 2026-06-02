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
