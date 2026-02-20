/**
 * Template-based honest tech summaries
 *
 * Generates opinionated one-liners from score data without LLM costs.
 * Tone: Friend who tells the truth, not a salesperson.
 *
 * Tiered insight generation:
 *   Tier 1 (0 dimensions): "Just added — we'll have insights once data starts flowing"
 *   Tier 2 (1 dimension):  Focused single-signal insight from whatever IS available
 *   Tier 3 (2-3 dims):     Existing decision tree + "(based on partial data)" suffix
 *   Tier 4 (4 dims):       Full multi-factor insight, no caveats
 */

import type { TechnologyWithScore } from '@/types'

export function generateTechSummary(tech: TechnologyWithScore): string {
  const {
    composite_score,
    momentum,
    github_score,
    community_score,
    jobs_score,
    ecosystem_score,
    sparkline,
  } = tech

  // Count which dimensions actually have real data (null = no data fetched yet)
  const hasGithub    = github_score    != null
  const hasCommunity = community_score != null
  const hasJobs      = jobs_score      != null
  const hasEcosystem = ecosystem_score != null
  const availableDimensions = [hasGithub, hasCommunity, hasJobs, hasEcosystem].filter(Boolean).length

  // --- TIER 1: Truly no data ---
  if (availableDimensions === 0) {
    return "Just added — we'll have insights once data starts flowing"
  }

  // --- TIER 2: Single dimension — generate focused insight from what we have ---
  if (availableDimensions === 1) {
    return generateSingleDimensionInsight(tech, { hasGithub, hasCommunity, hasJobs, hasEcosystem })
  }

  // --- TIER 3 & 4: Run the decision tree, then optionally append a partial-data note ---
  const insight = generateDecisionTreeInsight(tech)
  if (availableDimensions <= 2) {
    return `${insight} (based on partial data)`
  }
  return insight
}

/**
 * Focused insight when only one data dimension is available.
 * Most common case: jobs-only (95%+ of partial-data techs get jobs data first).
 */
function generateSingleDimensionInsight(
  tech: TechnologyWithScore,
  dims: { hasGithub: boolean; hasCommunity: boolean; hasJobs: boolean; hasEcosystem: boolean }
): string {
  const mom  = tech.momentum ?? 0
  const name = tech.name

  // Jobs-only (most common — Adzuna/JSearch/Remotive runs weekly)
  if (dims.hasJobs) {
    const jobs = tech.jobs_score ?? 0
    if (jobs >= 60) {
      if (mom > 5)  return `Strong job demand and climbing — companies are actively hiring for ${name}`
      if (mom < -5) return `Still plenty of jobs, but employer interest is cooling — watch this space`
      return `Solid job market — employers reliably hire for ${name}`
    }
    if (jobs >= 40) {
      if (mom > 5) return `Job demand is growing — ${name} is gaining employer attention`
      return `Moderate job demand — opportunities available in specific sectors`
    }
    if (mom > 10) return `Niche job market but growing fast — early movers could benefit`
    return `Limited job postings right now — more of a specialist skill`
  }

  // GitHub-only
  if (dims.hasGithub) {
    const gh = tech.github_score ?? 0
    if (gh >= 60) return `Very active on GitHub — strong open-source community around ${name}`
    if (gh >= 30) return `Moderate GitHub activity — development is ongoing`
    return `Quiet on GitHub — may be early-stage or niche`
  }

  // Community-only
  if (dims.hasCommunity) {
    const comm = tech.community_score ?? 0
    if (comm >= 60) return `Hot topic in developer communities — lots of buzz around ${name}`
    if (comm >= 30) return `Getting some attention in the developer community`
    return `Quiet community presence — not widely discussed yet`
  }

  // Ecosystem-only
  if (dims.hasEcosystem) {
    const eco = tech.ecosystem_score ?? 0
    if (eco >= 60) return `Thriving ecosystem — well-supported with packages and tooling`
    if (eco >= 30) return `Growing ecosystem — building up package support`
    return `Small ecosystem — limited tooling available`
  }

  return `${getScoreLabel(tech.composite_score ?? 0)} overall — limited data available`
}

/**
 * Full decision tree for 2-4 dimension techs.
 * Unchanged from original except extracted to a named function.
 */
function generateDecisionTreeInsight(tech: TechnologyWithScore): string {
  const {
    composite_score,
    momentum,
    github_score,
    community_score,
    jobs_score,
    ecosystem_score,
    sparkline,
  } = tech

  const dimensions = [
    { name: 'community', score: community_score ?? 0, label: 'community buzz' },
    { name: 'jobs',      score: jobs_score      ?? 0, label: 'job demand' },
    { name: 'github',    score: github_score    ?? 0, label: 'open source activity' },
    { name: 'ecosystem', score: ecosystem_score ?? 0, label: 'ecosystem growth' },
  ]
  const strongest = dimensions.reduce((max, d) => (d.score > max.score ? d : max))

  const mom   = momentum        ?? 0
  const score = composite_score ?? 0
  const comm  = community_score ?? 0
  const jobs  = jobs_score      ?? 0

  // 1. Strong positive momentum (momentum > 10)
  if (mom > 10) {
    if (strongest.name === 'community') {
      return `Developers can't stop talking about ${tech.name} — community buzz is real, but watch if jobs follow`
    }
    if (strongest.name === 'jobs') {
      return `Companies are hiring for ${tech.name} aggressively — strong career move right now`
    }
    if (strongest.name === 'github') {
      return `Open source contributors are pouring in — early signal of mainstream adoption`
    }
    if (strongest.name === 'ecosystem') {
      return `Ecosystem growth exploding — more packages, more downloads, more maturity`
    }
  }

  // 2. Moderate positive momentum (3-10)
  if (mom >= 3 && mom <= 10) {
    return `Growing steadily — ${strongest.label} is the main driver. Worth watching.`
  }

  // 3. High buzz, low jobs (overhyped signal)
  if (comm >= 45 && jobs < 35) {
    return `Lots of hype, few job postings. Fun to learn, risky to bet your career on — yet.`
  }

  // 4. Low buzz, high jobs (hidden gem signal)
  if (comm < 40 && jobs >= 40 && mom > 0) {
    return `Under the radar but companies are hiring. Less competition = your advantage.`
  }

  // 5. Stable workhorse (low momentum but high score)
  if (Math.abs(mom) <= 3 && score > 60) {
    return `Stable workhorse — not exciting, but employers reliably hire for this`
  }

  // 6. Declining with good jobs (fading but still pays)
  if (mom < -3 && mom >= -8 && jobs >= 40) {
    return `Still pays the bills, but the excitement is fading. Good for now, less certain long-term.`
  }

  // 7. Strong negative momentum (momentum < -8)
  if (mom < -8) {
    return `Losing ground — consider alternatives unless you have a specific reason to stay`
  }

  // 8. Sparkline-based insights (if we have trend data)
  if (sparkline && sparkline.length >= 3) {
    const last3 = sparkline.slice(-3)
    const allIncreasing = last3.every((val, i) => i === 0 || val > last3[i - 1])
    const allDecreasing = last3.every((val, i) => i === 0 || val < last3[i - 1])

    if (allIncreasing && mom > 0) {
      return `${getScoreLabel(score)} overall — on a streak upward ↑`
    }
    if (allDecreasing && mom < 0) {
      return `${getScoreLabel(score)} overall — slipping recently`
    }
  }

  // 9. Default: combine score label with momentum insight
  return `${getScoreLabel(score)} overall — ${getMomentumLabel(mom)}`
}

function getScoreLabel(score: number): string {
  if (score >= 75) return 'Strong performer'
  if (score >= 60) return 'Solid choice'
  if (score >= 45) return 'Decent option'
  if (score >= 30) return 'Niche player'
  return 'Specialized use'
}

function getMomentumLabel(momentum: number): string {
  if (momentum > 5)  return 'rising fast'
  if (momentum > 0)  return 'gaining traction'
  if (momentum === 0) return 'holding steady'
  if (momentum > -5) return 'cooling off'
  return 'declining'
}

/**
 * Generate primary driver explanation for movers
 */
export function getPrimaryDriver(
  scoreDeltas: {
    github_delta: number
    community_delta: number
    jobs_delta: number
    ecosystem_delta: number
  }
): string {
  const deltas = [
    { name: 'github',    value: Math.abs(scoreDeltas.github_delta),    label: 'GitHub activity spiked' },
    { name: 'community', value: Math.abs(scoreDeltas.community_delta), label: 'Community buzz surged' },
    { name: 'jobs',      value: Math.abs(scoreDeltas.jobs_delta),      label: 'Job demand increased' },
    { name: 'ecosystem', value: Math.abs(scoreDeltas.ecosystem_delta), label: 'Ecosystem growth accelerated' },
  ]

  const largest = deltas.reduce((max, d) => (d.value > max.value ? d : max))

  if (scoreDeltas[`${largest.name}_delta` as keyof typeof scoreDeltas] < 0) {
    const negativeLabels: Record<string, string> = {
      github:    'GitHub activity declined',
      community: 'Community interest waning',
      jobs:      'Job postings decreased',
      ecosystem: 'Ecosystem growth slowing',
    }
    return negativeLabels[largest.name]
  }

  return largest.label
}
