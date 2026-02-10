/**
 * Human-readable insights engine.
 *
 * Converts raw scores and metrics into plain-English labels
 * that help developers make career decisions.
 */

// ---- Status Labels ----

export type TechStatus =
  | 'rising-star'
  | 'hot-right-now'
  | 'stable-leader'
  | 'worth-watching'
  | 'cooling-down'
  | 'declining'
  | 'new-entry'

interface StatusInfo {
  label: string
  description: string
  color: string // Tailwind color class
  bgColor: string
  borderColor: string
}

export const STATUS_INFO: Record<TechStatus, StatusInfo> = {
  'rising-star': {
    label: 'Rising Star',
    description: 'Growing fast across multiple signals',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  'hot-right-now': {
    label: 'Hot Right Now',
    description: 'High community buzz and momentum',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  'stable-leader': {
    label: 'Stable Leader',
    description: 'Consistently high scores, safe bet',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  'worth-watching': {
    label: 'Worth Watching',
    description: 'Showing potential, building momentum',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  'cooling-down': {
    label: 'Cooling Down',
    description: 'Still relevant but losing momentum',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  declining: {
    label: 'Declining',
    description: 'Losing relevance, consider alternatives',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  'new-entry': {
    label: 'New Entry',
    description: 'Recently added, collecting data',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
  },
}

/**
 * Determine a technology's status based on score + momentum + completeness
 */
export function getTechStatus(
  compositeScore: number | null,
  momentum: number | null,
  dataCompleteness: number | null
): TechStatus {
  if (dataCompleteness !== null && dataCompleteness < 0.3) return 'new-entry'

  const score = compositeScore ?? 0
  const mom = momentum ?? 0

  // Rising star: good score AND strong positive momentum
  if (score >= 50 && mom > 8) return 'rising-star'

  // Hot right now: high momentum regardless of score
  if (mom > 12) return 'hot-right-now'

  // Stable leader: high score, low momentum (already on top)
  if (score >= 60 && Math.abs(mom) <= 5) return 'stable-leader'

  // Worth watching: medium score with positive momentum
  if (score >= 35 && mom > 3) return 'worth-watching'

  // Cooling down: decent score but negative momentum
  if (score >= 40 && mom < -3) return 'cooling-down'

  // Declining: low score or strong negative momentum
  if (score < 30 || mom < -8) return 'declining'

  // Default: worth watching
  return 'worth-watching'
}

// ---- Score Descriptions ----

/**
 * Convert a numeric score (0-100) into a human-readable label
 */
export function getScoreLabel(score: number | null): string {
  if (score === null) return 'No data'
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Strong'
  if (score >= 50) return 'Good'
  if (score >= 35) return 'Fair'
  if (score >= 20) return 'Low'
  return 'Minimal'
}

/**
 * Get a human-readable description for each sub-score
 */
export function getSubScoreInsight(
  category: 'github' | 'community' | 'jobs' | 'ecosystem',
  score: number | null
): string {
  if (score === null) return 'No data available for this metric'

  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

  const insights: Record<string, Record<string, string>> = {
    github: {
      high: 'Very active development — lots of stars, forks, and contributors',
      medium: 'Moderate development activity — healthy but not explosive',
      low: 'Limited GitHub activity — may be niche or early-stage',
    },
    community: {
      high: 'Hot in developer communities — frequently discussed on HN, Reddit, and blogs',
      medium: 'Some community buzz — mentioned occasionally in tech discussions',
      low: 'Quiet community presence — not widely discussed yet',
    },
    jobs: {
      high: 'Strong job market demand — many companies hiring for this skill',
      medium: 'Moderate job demand — opportunities available but not abundant',
      low: 'Limited job postings — niche market or emerging technology',
    },
    ecosystem: {
      high: 'Thriving ecosystem — widely downloaded, lots of Stack Overflow activity',
      medium: 'Growing ecosystem — decent adoption and community support',
      low: 'Small ecosystem — limited packages and community resources',
    },
  }

  return insights[category]?.[level] ?? 'Data available'
}

// ---- Momentum Descriptions ----

/**
 * Convert momentum number into plain-English trend description
 */
export function getMomentumInsight(momentum: number | null): string {
  if (momentum === null) return 'Not enough data to determine trend'
  if (momentum > 15) return 'Surging — growing much faster than average'
  if (momentum > 8) return 'Rising quickly — gaining significant traction'
  if (momentum > 3) return 'Trending up — steady growth'
  if (momentum > -3) return 'Stable — holding steady'
  if (momentum > -8) return 'Slowing down — losing some momentum'
  if (momentum > -15) return 'Declining — falling behind peers'
  return 'Dropping fast — significant decline'
}

// ---- Percentile Rankings ----

/**
 * Calculate where this technology ranks among all technologies
 * Returns a string like "Top 10%" or "Top 25%"
 */
export function getPercentileRank(
  score: number | null,
  allScores: number[]
): string {
  if (score === null || allScores.length === 0) return 'Unranked'

  const sorted = [...allScores].sort((a, b) => b - a)
  const rank = sorted.findIndex((s) => s <= score) + 1
  const percentile = Math.round((rank / sorted.length) * 100)

  if (percentile <= 5) return 'Top 5%'
  if (percentile <= 10) return 'Top 10%'
  if (percentile <= 25) return 'Top 25%'
  if (percentile <= 50) return 'Top half'
  return 'Bottom half'
}

// ---- Job Market Insights ----

/**
 * Format job count into human-readable string
 */
export function getJobInsight(jobScore: number | null, momentum: number | null): string {
  if (jobScore === null) return 'No job data available'

  const trend =
    momentum !== null && momentum > 3
      ? ' and growing'
      : momentum !== null && momentum < -3
        ? ' but declining'
        : ''

  if (jobScore >= 70) return `High demand — many companies hiring${trend}`
  if (jobScore >= 50) return `Good demand — solid job market${trend}`
  if (jobScore >= 30) return `Some demand — jobs available in specific sectors${trend}`
  return `Limited demand — niche or emerging skill${trend}`
}

// ---- Recommendation Engine ----

/**
 * Generate a brief recommendation based on all available data
 */
export function getRecommendation(
  compositeScore: number | null,
  momentum: number | null,
  jobScore: number | null,
  communityScore: number | null,
  dataCompleteness: number | null
): string {
  if (dataCompleteness !== null && dataCompleteness < 0.3) {
    return 'We are still collecting data for this technology. Check back in a few days for a full analysis.'
  }

  const score = compositeScore ?? 0
  const mom = momentum ?? 0
  const jobs = jobScore ?? 0

  // High score + high momentum = learn it now
  if (score >= 60 && mom > 5 && jobs >= 50) {
    return 'Strong investment — high demand, growing fast, and well-supported. A safe bet for career growth.'
  }

  // High score, stable = reliable choice
  if (score >= 60 && Math.abs(mom) <= 5) {
    return 'Established technology with stable demand. A reliable skill that employers value.'
  }

  // Rising fast but smaller
  if (mom > 10 && score < 60) {
    return 'Gaining momentum quickly. Could be a smart early investment if the trend continues.'
  }

  // Good jobs but declining buzz
  if (jobs >= 50 && mom < -3) {
    return 'Still in demand for jobs, but community interest is declining. Good for immediate employment, less certain long-term.'
  }

  // Low across the board
  if (score < 30 && jobs < 30) {
    return 'Niche technology with limited mainstream demand. Only pursue if you have a specific use case.'
  }

  // Default
  return 'A viable technology worth considering based on your specific goals and interests.'
}
