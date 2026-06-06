const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001';

export const searchBuilders = async (q, token) => {
  const response = await fetch(
    `${API_URL}/api/admin/headshots/search-builders?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) return [];
  return response.json();
};

export const checkHeadshotMatches = async (filenames, token) => {
  const response = await fetch(`${API_URL}/api/admin/headshots/check-matches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ filenames }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Check failed (${response.status})`);
  }
  return response.json();
};

/**
 * @param {File[]} files
 * @param {string} token
 * @param {{ filename: string, userId: number }[]} assignments — manual picks for ambiguous files
 */
export const bulkUploadHeadshots = async (files, token, assignments = []) => {
  const formData = new FormData();
  files.forEach(f => formData.append('headshots', f));
  if (assignments.length > 0) {
    formData.append('assignments', JSON.stringify(assignments));
  }

  const response = await fetch(`${API_URL}/api/admin/headshots/bulk-upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed (${response.status})`);
  }
  return response.json();
};
