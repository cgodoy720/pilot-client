export function isCompassEligibleUser(user) {
  if (!user) return false;
  if (user.role === 'staff' || user.role === 'admin') return true;

  const isBuilder = user.role === 'builder' || user.userType === 'builder';
  if (!isBuilder) return false;

  const cohort = typeof user.cohort === 'string' ? user.cohort.trim() : '';

  return cohort === 'March 2025 L3+';
}
