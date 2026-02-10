/**
 * Compute momentum as the change in composite score over 30 days.
 * Returns a value from -100 to +100.
 *
 * On days 1-29, momentum is 0 for all technologies (not enough history).
 */
export function computeMomentum(
  todayScore: number,
  score30DaysAgo: number | null
): number {
  if (score30DaysAgo === null) return 0
  return Math.max(-100, Math.min(100, todayScore - score30DaysAgo))
}
