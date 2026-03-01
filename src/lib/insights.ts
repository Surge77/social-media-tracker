/**
 * Human-readable insights engine.
 *
 * Converts raw scores and metrics into plain-English labels
 * that help developers make career decisions.
 */

import type { ExplainerDimension } from '@/components/technologies/ScoreExplainer'

// ---- Status Labels ----

export type TechStatus =
  | 'strong-growth'
  | 'high-demand'
  | 'established'
  | 'emerging'
  | 'slowing'
  | 'low-demand'
  | 'collecting-data'

interface StatusInfo {
  label: string
  description: string
  color: string // Tailwind color class
  bgColor: string
  borderColor: string
}

export const STATUS_INFO: Record<TechStatus, StatusInfo> = {
  'strong-growth': {
    label: 'Strong Growth',
    description: 'High scores and accelerating adoption — invest now',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  'high-demand': {
    label: 'High Demand',
    description: 'Surging community interest and employer demand',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  established: {
    label: 'Established',
    description: 'Proven and stable — reliable career skill',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  emerging: {
    label: 'Emerging',
    description: 'Growing adoption — early investment opportunity',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  slowing: {
    label: 'Slowing',
    description: 'Still relevant but losing momentum',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  'low-demand': {
    label: 'Low Demand',
    description: 'Declining interest — consider alternatives',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  'collecting-data': {
    label: 'New',
    description: 'Recently added — still gathering signals',
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
  if (dataCompleteness !== null && dataCompleteness < 0.3) return 'collecting-data'

  const score = compositeScore ?? 0
  const mom = momentum ?? 0

  // High demand: extreme momentum regardless of score (check before strong-growth)
  if (mom > 12) return 'high-demand'

  // Strong growth: good score AND strong positive momentum
  if (score >= 50 && mom > 8) return 'strong-growth'

  // Established: high score, stable momentum (industry standard)
  if (score >= 60 && Math.abs(mom) <= 5) return 'established'

  // Emerging: medium score with positive momentum
  if (score >= 35 && mom > 3) return 'emerging'

  // Slowing: decent score but negative momentum
  if (score >= 40 && mom < -3) return 'slowing'

  // Low demand: low score or strong negative momentum
  if (score < 30 || mom < -8) return 'low-demand'

  // Default: emerging
  return 'emerging'
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
  // Count how many scores are strictly greater to get correct rank (avoids off-by-one for top score)
  const rank = sorted.filter((s) => s > score).length + 1
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

// ---- Comparison Insights ----

interface ComparedTech {
  name: string
  compositeScore: number | null
  momentum: number | null
  githubScore: number | null
  communityScore: number | null
  jobsScore: number | null
  ecosystemScore: number | null
  dataCompleteness: number | null
}

/**
 * Generate a plain-English comparison summary for 2-4 technologies.
 * This is the "so what?" — the thing users actually want to know.
 */
export function getComparisonSummary(techs: ComparedTech[]): string {
  if (techs.length < 2) return ''

  const sorted = [...techs].sort(
    (a, b) => (b.compositeScore ?? 0) - (a.compositeScore ?? 0)
  )
  const leader = sorted[0]
  const runner = sorted[1]
  const leaderScore = leader.compositeScore ?? 0
  const runnerScore = runner.compositeScore ?? 0
  const gap = leaderScore - runnerScore

  // Check if leader has momentum advantage too
  const leaderMom = leader.momentum ?? 0
  const runnerMom = runner.momentum ?? 0

  if (gap < 5) {
    // Very close
    if (leaderMom > runnerMom + 5) {
      return `${leader.name} and ${runner.name} are neck-and-neck overall, but ${leader.name} has stronger momentum — it's gaining ground faster.`
    }
    if (runnerMom > leaderMom + 5) {
      return `${leader.name} barely edges out ${runner.name} on score, but ${runner.name} is growing faster — it could overtake soon.`
    }
    return `${leader.name} and ${runner.name} are very close in overall strength. Your choice may come down to which ecosystem fits your project better.`
  }

  if (gap >= 20) {
    // Large gap
    const runnerStrength = getBestDimension(runner)
    if (runnerStrength) {
      return `${leader.name} leads significantly overall, but ${runner.name} ${runnerStrength}. Pick ${leader.name} for a safer bet, or ${runner.name} if ${runnerStrength.replace('has stronger', 'you need strong').replace('leads in', 'you prioritize')}.`
    }
    return `${leader.name} is the clear frontrunner here — stronger across most dimensions. ${runner.name} may still be worth learning for specific use cases.`
  }

  // Moderate gap
  const leaderStrength = getBestDimension(leader)
  const runnerStrength = getBestDimension(runner)
  if (leaderStrength && runnerStrength) {
    return `${leader.name} leads overall and ${leaderStrength}. ${runner.name} ${runnerStrength}. Both are solid choices — it depends on what matters most to you.`
  }

  return `${leader.name} scores higher overall. ${runner.name} is still competitive but trails in most dimensions.`
}

function getBestDimension(tech: ComparedTech): string | null {
  const dims = [
    { score: tech.githubScore, label: 'has stronger open-source activity' },
    { score: tech.communityScore, label: 'has more community buzz' },
    { score: tech.jobsScore, label: 'leads in job market demand' },
    { score: tech.ecosystemScore, label: 'has a healthier ecosystem' },
  ]
  const best = dims
    .filter((d) => d.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]
  return best && (best.score ?? 0) >= 50 ? best.label : null
}

/**
 * For a specific dimension, explain who wins and what it means.
 */
export function getDimensionComparison(
  dimension: 'github' | 'community' | 'jobs' | 'ecosystem',
  techs: Array<{ name: string; score: number | null }>
): { winner: string | null; insight: string } {
  const withScores = techs.filter((t) => t.score !== null)
  if (withScores.length === 0) return { winner: null, insight: 'No data available for this dimension.' }

  const sorted = [...withScores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const best = sorted[0]
  const gap = sorted.length >= 2 ? (best.score ?? 0) - (sorted[1].score ?? 0) : 0

  const dimensionContext: Record<string, { tight: string; clear: string; dominant: string }> = {
    github: {
      tight: 'Both have similar open-source activity — active development and community contributions.',
      clear: `${best.name} has more GitHub traction — more stars, forks, and contributor activity.`,
      dominant: `${best.name} dominates on GitHub — significantly more developer interest and activity.`,
    },
    community: {
      tight: 'Similar levels of developer buzz — both are discussed regularly in tech communities.',
      clear: `${best.name} gets more attention on Hacker News, Reddit, and dev blogs.`,
      dominant: `${best.name} is generating far more community discussion — it's the hotter topic right now.`,
    },
    jobs: {
      tight: 'Both are in similar demand from employers — either is a solid resume skill.',
      clear: `${best.name} appears in more job postings — employers are actively looking for this skill.`,
      dominant: `${best.name} has significantly higher job demand — a much safer bet for employment.`,
    },
    ecosystem: {
      tight: 'Both have healthy ecosystems — good package downloads and Stack Overflow support.',
      clear: `${best.name} has a more mature ecosystem — more downloads and community resources.`,
      dominant: `${best.name} has a much larger ecosystem — far more packages, downloads, and SO activity.`,
    },
  }

  const context = dimensionContext[dimension]
  if (gap < 8) return { winner: null, insight: context.tight }
  if (gap < 20) return { winner: best.name, insight: context.clear }
  return { winner: best.name, insight: context.dominant }
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

// ---- Score Explainer Builder ----

/**
 * Build the ExplainerDimension[] array from a DailyScore's raw_sub_scores.
 *
 * This converts the stored pipeline data into the structured format that
 * ScoreExplainer needs to render the "Why This Score?" breakdown.
 *
 * rawSubScores shape (stored by pipeline.ts):
 *   github, community, jobs, ecosystem, onchain (numbers, may be null)
 *   momentum_detail: { shortTerm, mediumTerm, longTerm, trend, acceleration, volatility, streak }
 *   confidence: { overall, grade, sourceCoverage, signalAgreement }
 *   lifecycle: { stage, confidence, reasoning, daysInStage, transitionProbability }
 */
export function buildScoreExplainerDimensions(
  scores: {
    github_score: number | null
    community_score: number | null
    jobs_score: number | null
    ecosystem_score: number | null
    onchain_score?: number | null
  },
  rawSubScores: Record<string, unknown> | null,
  category: string
): ExplainerDimension[] {
  // Category-based weights (matching adaptive-weights.ts defaults per category)
  const WEIGHT_MAP: Record<string, { github: number; community: number; jobs: number; ecosystem: number }> = {
    language: { github: 20, community: 15, jobs: 35, ecosystem: 30 },
    frontend: { github: 25, community: 25, jobs: 25, ecosystem: 25 },
    backend: { github: 20, community: 15, jobs: 35, ecosystem: 30 },
    database: { github: 15, community: 10, jobs: 40, ecosystem: 35 },
    devops: { github: 15, community: 15, jobs: 40, ecosystem: 30 },
    cloud: { github: 10, community: 15, jobs: 45, ecosystem: 30 },
    mobile: { github: 20, community: 20, jobs: 30, ecosystem: 30 },
    ai_ml: { github: 25, community: 30, jobs: 25, ecosystem: 20 },
    blockchain: { github: 20, community: 20, jobs: 25, ecosystem: 15 },
  }

  const weights = WEIGHT_MAP[category] ?? { github: 25, community: 20, jobs: 25, ecosystem: 30 }

  const momentum = rawSubScores?.momentum_detail as Record<string, number> | undefined
  const confidence = rawSubScores?.confidence as Record<string, number | string> | undefined
  // Factor percentiles stored by scoring pipeline (populated since scoring pipeline update)
  const fp = rawSubScores?.factor_percentiles as Record<string, Record<string, number>> | undefined

  const dims: ExplainerDimension[] = []

  // ---- GitHub ----
  if (scores.github_score !== null || category !== 'cloud') {
    dims.push({
      key: 'github',
      score: scores.github_score,
      weightPct: weights.github,
      factors: [
        {
          label: 'Star velocity (30-day gain)',
          value: fp?.github?.stars ?? null,
          unit: 'pct',
        },
        {
          label: 'Fork momentum',
          value: fp?.github?.forks ?? null,
          unit: 'pct',
        },
        {
          label: 'Issue close rate (percentile)',
          value: fp?.github?.issueCloseRate ?? null,
          unit: 'pct',
        },
        {
          label: 'Active contributors (percentile)',
          value: fp?.github?.contributors ?? null,
          unit: 'pct',
        },
        // If we have momentum detail, show it as a contextual signal
        ...(momentum
          ? [
            {
              label: 'Short-term momentum',
              value: momentum.shortTerm != null
                ? Math.max(0, Math.min(100, 50 + momentum.shortTerm * 10))
                : null,
              direction: (momentum.shortTerm > 0 ? 'positive' : momentum.shortTerm < 0 ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral',
            },
          ]
          : []),
      ],
    })
  }

  // ---- Community ----
  dims.push({
    key: 'community',
    score: scores.community_score,
    weightPct: weights.community,
    factors: [
      { label: 'Hacker News mentions (30d)', value: fp?.community?.hnMentions ?? null, unit: 'pct' },
      { label: 'Reddit posts (30d)', value: fp?.community?.redditPosts ?? null, unit: 'pct' },
      { label: 'Dev.to articles (30d)', value: fp?.community?.devtoArticles ?? null, unit: 'pct' },
      { label: 'RSS tech blog mentions', value: fp?.community?.rssMentions ?? null, unit: 'pct' },
      { label: 'YouTube tutorial videos', value: fp?.community?.youtube ?? null, unit: 'pct' },
      // Show signal agreement from confidence as a health indicator
      ...(confidence?.signalAgreement != null
        ? [
          {
            label: 'Signal agreement across dimensions',
            value: confidence.signalAgreement as number,
            direction: (
              (confidence.signalAgreement as number) >= 70 ? 'positive'
                : (confidence.signalAgreement as number) >= 40 ? 'neutral'
                  : 'negative'
            ) as 'positive' | 'negative' | 'neutral',
          },
        ]
        : []),
    ],
  })

  // ---- Jobs ----
  dims.push({
    key: 'jobs',
    score: scores.jobs_score,
    weightPct: weights.jobs,
    factors: [
      { label: 'Adzuna job postings (percentile)', value: fp?.jobs?.adzuna ?? null, unit: 'pct' },
      { label: 'JSearch job postings (percentile)', value: fp?.jobs?.jsearch ?? null, unit: 'pct' },
      { label: 'Remotive remote jobs (percentile)', value: fp?.jobs?.remotive ?? null, unit: 'pct' },
    ],
  })

  // ---- Ecosystem ----
  dims.push({
    key: 'ecosystem',
    score: scores.ecosystem_score,
    weightPct: weights.ecosystem,
    factors: [
      { label: 'Package downloads (percentile)', value: fp?.ecosystem?.downloads ?? null, unit: 'pct' },
      {
        label: 'SO questions — 30-day (primary signal)',
        value: fp?.ecosystem?.soMentions ?? null,
        unit: 'pct',
      },
      {
        label: 'SO questions — all-time (tiebreaker)',
        value: fp?.ecosystem?.soQuestions ?? null,
        unit: 'pct',
      },
      { label: 'Dependent packages (Libraries.io)', value: fp?.ecosystem?.dependents ?? null, unit: 'pct' },
    ],
  })

  // ---- Onchain (blockchain only) ----
  if (category === 'blockchain' && scores.onchain_score !== null && scores.onchain_score !== undefined) {
    dims.push({
      key: 'onchain',
      score: scores.onchain_score,
      weightPct: 20,
      factors: [
        { label: 'Protocol TVL rank', value: null, unit: 'score' },
        { label: 'On-chain dev activity', value: null, unit: 'score' },
        { label: 'Network transaction volume trend', value: null, unit: 'score' },
      ],
    })
  }

  return dims
}

