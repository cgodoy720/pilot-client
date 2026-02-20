/**
 * Shared cohort utilities for the admin dashboard.
 * Single source of truth: org management API filtered by type=builder, org=Pursuit.
 * Converts names to legacy format (with dash) for legacy API calls.
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch Pursuit builder cohorts from org management API.
 * Returns array of { name, legacyName, cohort_id, is_active, ... }
 */
export const fetchPursuitBuilderCohorts = async (token) => {
  const res = await fetch(`${API_URL}/api/admin/organization-management/cohorts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Cohorts API error: ${res.status}`);
  const data = await res.json();
  const all = data.cohorts || data.data || data;
  if (!Array.isArray(all)) return [];

  return all
    .filter(c =>
      (c.cohort_type || c.type) === 'builder' &&
      (c.organization_name || '').toLowerCase() === 'pursuit'
    )
    .map(c => ({
      name: c.name,
      legacyName: toLegacyFormat(c.name),
      cohort_id: c.cohort_id,
      is_active: c.is_active,
      course_level: c.course_level,
      enrolled_count: c.enrolled_count,
    }))
    .sort((a, b) => {
      // Sort active first, then by name descending (newest first)
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return b.name.localeCompare(a.name);
    });
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
