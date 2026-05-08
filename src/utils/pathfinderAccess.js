export function isCompassEligibleUser(user) {
  if (!user) return false;
  if (user.role === 'staff' || user.role === 'admin') return true;

  const isBuilder = user.role === 'builder' || user.userType === 'builder';
  if (!isBuilder) return false;

  const cohort = typeof user.cohort === 'string' ? user.cohort.trim() : '';
  // Strip every char that isn't a word char or whitespace — including `+`
  // which we deliberately want to drop ("L3+" should normalize to "l3"). The
  // earlier `[^\w+\s]` was a typo: inside a char class `+` is literal, so it
  // was actually preserving `+` and silently misbehaving for any name
  // containing one. `[^\w\s]` is the intended pattern.
  const normalizeCohort = (value) => value
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return normalizeCohort(cohort) === normalizeCohort('March 2025 L3+');
}
