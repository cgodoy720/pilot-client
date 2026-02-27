/**
 * Shared cohort utilities for the admin dashboard.
 * Uses the staff-accessible /api/permissions/cohorts endpoint (not admin-only org management).
 * Converts names to legacy format (with dash) for legacy API calls.
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch active builder cohorts from the staff-accessible permissions endpoint.
 * Returns array of { name, legacyName, cohort_id, is_active, curriculum_day_count }
 */
export const fetchPursuitBuilderCohorts = async (token) => {
  const res = await fetch(`${API_URL}/api/permissions/cohorts?type=builder`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Cohorts API error: ${res.status}`);
  const data = await res.json();
  const cohorts = data.cohorts || [];

  return cohorts
    .map(c => ({
      name: c.name,
      legacyName: toLegacyFormat(c.name),
      cohort_id: c.cohort_id,
      is_active: true,
      curriculum_day_count: parseInt(c.curriculum_day_count) || 0,
    }))
    .sort((a, b) => b.name.localeCompare(a.name));
};

/**
 * Convert org management name to legacy API format.
 * "December 2025 L1" → "December 2025 - L1"
 * "March 2025 L3+" → "March 2025 - L3+"
 * "March 2025" → "March 2025" (no level, no change)
 */
export const toLegacyFormat = (name) => {
  if (!name) return '';
  // Match "Month Year Level" pattern
  const match = name.match(/^(\w+ \d{4})\s+(L\S+)$/);
  if (match) return `${match[1]} - ${match[2]}`;
  return name;
};

/**
 * Convert legacy format back to org management format.
 * "December 2025 - L1" → "December 2025 L1"
 */
export const fromLegacyFormat = (name) => {
  if (!name) return '';
  return name.replace(/\s+-\s+/, ' ');
};
