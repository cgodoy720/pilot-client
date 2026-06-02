const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001';

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

export const bulkUploadHeadshots = async (files, token) => {
  const formData = new FormData();
  files.forEach(f => formData.append('headshots', f));

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
