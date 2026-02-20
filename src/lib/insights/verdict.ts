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
 * momentum is 0–100 where 50 = neutral, >60 = positive, <40 = negative.
 */
export function generateVerdict(
  composite: number | null,
  momentum: number | null,
  jobsScore: number | null,
  name: string,
): Verdict {
  const c = composite ?? 0
  const m = momentum ?? 50
  const j = jobsScore ?? 0

  const momentumLabel: Verdict['momentumLabel'] =
    m >= 60 ? 'Rising' : m <= 40 ? 'Declining' : 'Stable'

  let recommendation: Recommendation

  if (c >= 70 && j >= 65) {
    recommendation = 'learn-it'
  } else if (c >= 55 && m >= 60) {
    recommendation = 'watch-it'
  } else if (c >= 55) {
    recommendation = 'maintain'
  } else if (c >= 30) {
    recommendation = 'caution'
  } else {
    recommendation = 'declining'
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
      reasoning: `High job demand paired with solid community activity makes this a low-risk, high-reward addition to your stack.`,
    },
    'watch-it': {
      badge: 'Watch It',
      headline: `${name} is gaining momentum — worth learning soon`,
      reasoning: `Momentum is accelerating and early movers will have an advantage before demand fully catches up. Start now.`,
    },
    'maintain': {
      badge: 'Maintain',
      headline: `${name} is stable — safe to keep but not urgent to learn`,
      reasoning: `Solid but not accelerating. If it's already in your stack, maintain it. New learners should weigh alternatives first.`,
    },
    'caution': {
      badge: 'Caution',
      headline: `${name} shows mixed signals — invest carefully`,
      reasoning: `Job demand, community activity, and growth signals are inconsistent. Consider your specific context before committing significant time.`,
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
