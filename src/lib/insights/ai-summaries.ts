/**
 * Template-based honest tech summaries
 *
 * Generates opinionated one-liners from score data without LLM costs.
 * Tone: Friend who tells the truth, not a salesperson.
 *
 * Tiered insight generation:
 *   Tier 1 (0 dimensions): "Just added — insights coming soon"
 *   Tier 2 (1 dimension):  Focused single-signal insight, always includes tech name
 *   Tier 3 (2-3 dims):     Decision tree insight + "(based on partial data)"
 *   Tier 4 (4 dims):       Full multi-factor insight
 *
 * Rule: every returned string must include the technology name to prevent duplicates.
 */

import type { TechnologyWithScore } from '@/types'

export function generateTechSummary(tech: TechnologyWithScore): string {
  const {
    github_score,
    community_score,
    jobs_score,
    ecosystem_score,
  } = tech

  const hasGithub    = github_score    != null
  const hasCommunity = community_score != null
  const hasJobs      = jobs_score      != null
  const hasEcosystem = ecosystem_score != null
  const availableDimensions = [hasGithub, hasCommunity, hasJobs, hasEcosystem].filter(Boolean).length

  // --- TIER 1: No data at all ---
  if (availableDimensions === 0) {
    return `${tech.name} was just added — insights will appear once data starts flowing`
  }

  // --- TIER 2: Single dimension ---
  if (availableDimensions === 1) {
    return generateSingleDimensionInsight(tech, { hasGithub, hasCommunity, hasJobs, hasEcosystem })
  }

  // --- TIER 3 & 4: Decision tree ---
  const insight = generateDecisionTreeInsight(tech)
  if (availableDimensions <= 2) {
    return `${insight} (based on partial data)`
  }
  return insight
}

/**
 * Single-dimension insight. Always embeds tech name for uniqueness.
 */
function generateSingleDimensionInsight(
  tech: TechnologyWithScore,
  dims: { hasGithub: boolean; hasCommunity: boolean; hasJobs: boolean; hasEcosystem: boolean }
): string {
  const mom  = tech.momentum ?? 0
  const name = tech.name

  // Jobs-only (most common case)
  if (dims.hasJobs) {
    const jobs = tech.jobs_score ?? 0
    if (jobs >= 60) {
      if (mom > 5)  return `${name} job demand is climbing fast — companies are actively hiring right now`
      if (mom < -5) return `${name} still has strong job listings, but employer interest is cooling — watch this`
      return `Solid job market for ${name} — employers reliably hire for this skill`
    }
    if (jobs >= 40) {
      if (mom > 5) return `${name} is gaining employer attention — job demand is on the rise`
      return `Moderate ${name} job demand — opportunities exist but aren't everywhere`
    }
    if (mom > 10) return `${name} job market is niche but growing fast — early movers benefit`
    if (mom > 0)  return `${name} has limited but growing job listings — specialist territory`
    return `Few ${name} job postings right now — primarily a specialist or niche skill`
  }

  // GitHub-only
  if (dims.hasGithub) {
    const gh = tech.github_score ?? 0
    if (gh >= 60) return `${name} has very active GitHub presence — strong open-source momentum`
    if (gh >= 30) return `${name} has steady GitHub activity — development is ongoing`
    return `${name} is quiet on GitHub — may be early-stage or highly niche`
  }

  // Community-only
  if (dims.hasCommunity) {
    const comm = tech.community_score ?? 0
    if (comm >= 60) return `Developers can't stop talking about ${name} — community buzz is real`
    if (comm >= 30) return `${name} is getting attention in developer circles — worth monitoring`
    return `${name} has a quiet community presence — not widely discussed yet`
  }

  // Ecosystem-only
  if (dims.hasEcosystem) {
    const eco = tech.ecosystem_score ?? 0
    if (eco >= 60) return `${name} has a thriving ecosystem — well-supported with packages and tooling`
    if (eco >= 30) return `${name}'s ecosystem is growing — package support is building up`
    return `${name} has a small ecosystem — limited tooling and packages available`
  }

  return `${name} — ${getScoreLabel(tech.composite_score ?? 0).toLowerCase()} with limited data so far`
}

/**
 * Full decision tree for 2–4 dimension techs. Always embeds tech name.
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
    name,
  } = tech

  const dimensions = [
    { name: 'community', score: community_score ?? 0, label: 'community buzz' },
    { name: 'jobs',      score: jobs_score      ?? 0, label: 'job demand' },
    { name: 'github',    score: github_score    ?? 0, label: 'open-source activity' },
    { name: 'ecosystem', score: ecosystem_score ?? 0, label: 'ecosystem growth' },
  ]
  const strongest = dimensions.reduce((max, d) => (d.score > max.score ? d : max))

  const mom   = momentum        ?? 0
  const score = composite_score ?? 0
  const comm  = community_score ?? 0
  const jobs  = jobs_score      ?? 0

  // 1. Strong positive momentum
  if (mom > 10) {
    if (strongest.name === 'community') {
      return `Developers can't stop talking about ${name} — the buzz is real, but watch if hiring follows`
    }
    if (strongest.name === 'jobs') {
      return `Companies are aggressively hiring for ${name} right now — strong career move`
    }
    if (strongest.name === 'github') {
      return `Open-source contributors are flooding into ${name} — early signal of mainstream adoption`
    }
    // ecosystem
    return `${name}'s ecosystem is exploding — more packages, more downloads, more maturity`
  }

  // 2. Moderate positive momentum
  if (mom >= 3 && mom <= 10) {
    return `${name} is growing steadily — ${strongest.label} is the main driver right now`
  }

  // 3. High buzz, low jobs (overhyped)
  if (comm >= 45 && jobs < 35) {
    return `${name} has lots of hype but few job postings — great to learn, risky to bet your career on yet`
  }

  // 4. Low buzz, high jobs (hidden gem)
  if (comm < 40 && jobs >= 40 && mom > 0) {
    return `${name} is under the radar but companies are actively hiring — less competition is your edge`
  }

  // 5. Stable workhorse
  if (Math.abs(mom) <= 3 && score > 60) {
    return `${name} is a stable workhorse — not exciting, but employers reliably hire for it`
  }

  // 6. Declining but still pays
  if (mom < -3 && mom >= -8 && jobs >= 40) {
    return `${name} still pays the bills, but excitement is fading — good now, less certain long-term`
  }

  // 7. Strong negative momentum
  if (mom < -8) {
    return `${name} is losing ground — consider alternatives unless you have a specific reason to stay`
  }

  // 8. Sparkline trend
  if (sparkline && sparkline.length >= 3) {
    const last3 = sparkline.slice(-3)
    const allIncreasing = last3.every((val, i) => i === 0 || val > last3[i - 1])
    const allDecreasing = last3.every((val, i) => i === 0 || val < last3[i - 1])

    if (allIncreasing && mom > 0) {
      return `${name} is on an upward streak — ${getScoreLabel(score).toLowerCase()} and climbing`
    }
    if (allDecreasing && mom < 0) {
      return `${name} is ${getScoreLabel(score).toLowerCase()} overall but has been slipping recently`
    }
  }

  // 9. Default fallback — always unique via name + momentum
  return `${name} is ${getScoreLabel(score).toLowerCase()} overall — ${getMomentumLabel(mom)}`
}

function getScoreLabel(score: number): string {
  if (score >= 75) return 'Strong performer'
  if (score >= 60) return 'Solid choice'
  if (score >= 45) return 'Decent option'
  if (score >= 30) return 'Niche player'
  return 'Specialized use'
}

function getMomentumLabel(momentum: number): string {
  if (momentum > 5)   return 'rising fast'
  if (momentum > 0)   return 'gaining traction'
  if (momentum === 0) return 'holding steady'
  if (momentum > -5)  return 'cooling off'
  return 'declining'
}

/**
 * Generate primary driver explanation for movers & shakers
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
