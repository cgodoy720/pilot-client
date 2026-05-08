export function isCompassEligibleUser(user) {
  if (!user) return false;
  if (user.role === 'staff' || user.role === 'admin') return true;

  const isBuilder = user.role === 'builder' || user.userType === 'builder';
  if (!isBuilder) return false;

  const cohort = typeof user.cohort === 'string' ? user.cohort.trim() : '';
  const normalizeCohort = (value) => value
    .toLowerCase()
    .replace(/[^\w+\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return normalizeCohort(cohort) === normalizeCohort('March 2025 L3+');
}
