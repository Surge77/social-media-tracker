export type Recommendation = 'learn-it' | 'watch-it' | 'maintain' | 'caution' | 'declining'

export interface Verdict {
  recommendation: Recommendation
  badge: string
  headline: string
  reasoning: string
  riskLevel: 'low' | 'medium' | 'high'
  momentumLabel: 'Rising' | 'Stable' | 'Declining'
}

/**
 * Generate a plain-language career verdict from raw scores.
 *
 * Score ranges from actual pipeline data:
 *   composite: ~45–49 (narrow band due to Bayesian smoothing)
 *   momentum:  raw value, typically –25 to +25
 *   jobsScore: 0–100 (widest spread, best differentiator)
 */
export function generateVerdict(
  composite: number | null,
  momentum: number | null,
  jobsScore: number | null,
  name: string,
): Verdict {
  const c = composite ?? 0
  const m = momentum ?? 0   // raw momentum, NOT 0–100 scale
  const j = jobsScore ?? 0

  // Momentum label uses raw thresholds
  const momentumLabel: Verdict['momentumLabel'] =
    m > 5 ? 'Rising' : m < -5 ? 'Declining' : 'Stable'

  let recommendation: Recommendation

  // Calibrated to actual data ranges (composite 45–49, jobs 45–76, momentum –24 to +21)
  if (j >= 65 && m > 5 && c >= 47.5) {
    // Strong job market + rising momentum + above-median score
    recommendation = 'learn-it'
  } else if (m > 10 || (j >= 58 && m > 3)) {
    // Either surging momentum or high demand + positive trend
    recommendation = 'watch-it'
  } else if (j >= 50 || (c >= 46.5 && m > -8)) {
    // Decent demand or stable/positive signal above median
    recommendation = 'maintain'
  } else if (m < -12 && j < 50) {
    // Severe momentum decline with weak demand
    recommendation = 'declining'
  } else {
    recommendation = 'caution'
  }

  const riskLevel: Verdict['riskLevel'] =
    recommendation === 'learn-it'
      ? 'low'
      : recommendation === 'watch-it' || recommendation === 'maintain'
      ? 'medium'
      : 'high'

  const config: Record<Recommendation, { badge: string; headline: string; reasoning: string }> = {
    'learn-it': {
      badge: 'Learn It',
      headline: `${name} is a strong career investment right now`,
      reasoning: `High job demand paired with rising momentum makes this a low-risk, high-reward addition to your stack.`,
    },
    'watch-it': {
      badge: 'Watch It',
      headline: `${name} is gaining momentum — worth learning soon`,
      reasoning: `Momentum is accelerating and early movers will have an advantage before demand fully catches up. Start now.`,
    },
    'maintain': {
      badge: 'Maintain',
      headline: `${name} is stable — safe to keep but not urgent to learn`,
      reasoning: `Solid demand but not accelerating. If it's already in your stack, maintain it. New learners should weigh alternatives first.`,
    },
    'caution': {
      badge: 'Caution',
      headline: `${name} shows mixed signals — invest carefully`,
      reasoning: `Job demand and momentum signals are inconsistent. Consider your specific context before committing significant time.`,
    },
    'declining': {
      badge: 'Declining',
      headline: `${name} is losing ground — consider alternatives`,
      reasoning: `Multiple signals point to reduced adoption and interest. Your time is likely better invested in higher-momentum alternatives.`,
    },
  }

  return {
    recommendation,
    riskLevel,
    momentumLabel,
    ...config[recommendation],
  }
}
