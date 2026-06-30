import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Module-level cache — the skill taxonomy is stable within a session.
let _cache = null;

/**
 * Fetch the valid skill-taxonomy tags for the personalized-task skill picker.
 * Returns [{ slug, name, category }]. Cached after the first successful call.
 */
export async function fetchSkillTags(token) {
  if (_cache) return _cache;
  const res = await axios.get(`${API_URL}/api/curriculum/skill-tags`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  _cache = res.data?.skillTags || [];
  return _cache;
}
