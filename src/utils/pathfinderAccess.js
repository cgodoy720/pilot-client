// Compass access gate.
//
// SECURITY NOTE: this is a CLIENT-side convenience check that controls
// whether the Compass tab/route is rendered. It is NOT the source of truth.
// The server enforces the same rule on every Compass endpoint, so even if a
// builder bypasses this UI gate they get a 403. Don't add new auth-only
// behaviour that depends solely on this function returning true.
//
// Rule:
//   - staff and admin always have access
//   - builders have access only if their cohort is exactly "March 2025 L3+"
//
// We intentionally do NOT strip the trailing `+` or lowercase-collapse the
// level token, because "March 2025 L3" and "March 2025 L3+" are distinct
// cohorts in the system. An earlier version of this file ran the cohort
// through a `[^\w\s]` strip, which folded both onto the same key and
// silently granted L3 builders Compass access.
export function isCompassEligibleUser(user) {
  if (!user) return false;
  if (user.role === 'staff' || user.role === 'admin') return true;

  const isBuilder = user.role === 'builder' || user.userType === 'builder';
  if (!isBuilder) return false;

  const cohort = typeof user.cohort === 'string' ? user.cohort.trim() : '';
  if (!cohort) return false;

  // Case-insensitive whitespace-tolerant comparison that preserves `+` and
  // any other meaningful punctuation. We deliberately don't run `cohort`
  // through a destructive regex strip — see comment block above.
  const canonicalize = (value) =>
    value.toLowerCase().replace(/\s+/g, ' ').trim();

  return canonicalize(cohort) === canonicalize('March 2025 L3+');
}
