const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001';

export const submitIntake = async (formData, token) => {
  const response = await fetch(`${API_URL}/api/platform-intake`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit request');
  }
  return response.json();
};

export const fetchAllSubmissions = async (token) => {
  const response = await fetch(`${API_URL}/api/platform-intake`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch submissions');
  }
  return response.json();
};
