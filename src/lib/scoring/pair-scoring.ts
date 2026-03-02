/**
 * Pairing intelligence scoring engine.
 *
 * Derives pair scores entirely from daily_scores subscores.
 * No tech_relationships dependency.
 *
 * Formula:
 *   30% demand synergy    (jobs_score compatibility)
 *   25% momentum align    (same direction, non-divergent)
 *   20% ecosystem fit     (ecosystem_score complementarity)
 *   15% community valid   (community_score without pure hype)
 *   10% maturity balance  (data_completeness pairing)
 */

export type PairConfidence = 'A' | 'B' | 'C' | 'D' | 'F'
export type RiskFlag =
  | 'divergent-momentum'
  | 'low-data'
  | 'hype-without-jobs'
  | 'both-declining'
  | 'low-ecosystem'

export interface PairScore {
  pairedSlug: string
  pairScore: number
  pairConfidence: PairConfidence
  compatibility: {
    demandSynergy: number
    momentumAlignment: number
    ecosystemFit: number
    communityValidation: number
    maturityBalance: number
  }
  whyPair: string[]
  riskFlags: RiskFlag[]
}

interface TechScores {
  slug: string
  composite_score: number | null
  github_score: number | null
  community_score: number | null
  jobs_score: number | null
  ecosystem_score: number | null
  momentum: number | null
  data_completeness: number | null
}

export function scorePair(base: TechScores, candidate: TechScores): PairScore {
  const b = {
    composite: base.composite_score ?? 50,
    github: base.github_score ?? 50,
    community: base.community_score ?? 50,
    jobs: base.jobs_score ?? 50,
    ecosystem: base.ecosystem_score ?? 50,
    momentum: base.momentum ?? 0,
    completeness: base.data_completeness ?? 0.5,
  }
  const c = {
    composite: candidate.composite_score ?? 50,
    github: candidate.github_score ?? 50,
    community: candidate.community_score ?? 50,
    jobs: candidate.jobs_score ?? 50,
    ecosystem: candidate.ecosystem_score ?? 50,
    momentum: candidate.momentum ?? 0,
    completeness: candidate.data_completeness ?? 0.5,
  }

  const avgJobs = (b.jobs + c.jobs) / 2
  const jobsDiff = Math.abs(b.jobs - c.jobs)
  const demandSynergy = Math.max(0, Math.min(100, avgJobs - jobsDiff * 0.3))

  const bothPositive = b.momentum > 0 && c.momentum > 0
  const bothNegative = b.momentum < 0 && c.momentum < 0
  const opposite =
    (b.momentum > 3 && c.momentum < -3) || (b.momentum < -3 && c.momentum > 3)
  const momentumDivergence = Math.abs(b.momentum - c.momentum)
  let momentumAlignment: number
  if (opposite) {
    momentumAlignment = Math.max(10, 50 - momentumDivergence * 3)
  } else if (bothPositive) {
    momentumAlignment = Math.min(100, 65 + Math.min(b.momentum, c.momentum) * 2)
  } else if (bothNegative) {
    momentumAlignment = Math.max(
      15,
      50 - Math.abs(Math.max(b.momentum, c.momentum)) * 2
    )
  } else {
    momentumAlignment = Math.max(20, 55 - momentumDivergence * 2)
  }

  const avgEco = (b.ecosystem + c.ecosystem) / 2
  const bothMature = b.ecosystem >= 50 && c.ecosystem >= 50
  const ecosystemFit = Math.min(100, avgEco + (bothMature ? 10 : 0))

  const avgCommunity = (b.community + c.community) / 2
  const hypeFlag =
    (b.community > 70 && b.jobs < 25) || (c.community > 70 && c.jobs < 25)
  const communityValidation = Math.min(100, avgCommunity * (hypeFlag ? 0.8 : 1))

  const avgCompleteness = (b.completeness + c.completeness) / 2
  const maturityBalance = Math.min(100, avgCompleteness * 100 + 10)

  const pairScore = Math.round(
    demandSynergy * 0.3 +
      momentumAlignment * 0.25 +
      ecosystemFit * 0.2 +
      communityValidation * 0.15 +
      maturityBalance * 0.1
  )

  const minCompleteness = Math.min(b.completeness, c.completeness)
  let pairConfidence: PairConfidence
  if (minCompleteness >= 0.8 && pairScore >= 70) pairConfidence = 'A'
  else if (minCompleteness >= 0.6 && pairScore >= 55) pairConfidence = 'B'
  else if (minCompleteness >= 0.4 && pairScore >= 40) pairConfidence = 'C'
  else if (minCompleteness >= 0.2) pairConfidence = 'D'
  else pairConfidence = 'F'

  const riskFlags: RiskFlag[] = []
  if (opposite) riskFlags.push('divergent-momentum')
  if (minCompleteness < 0.3) riskFlags.push('low-data')
  if (hypeFlag) riskFlags.push('hype-without-jobs')
  if (bothNegative && (b.momentum < -5 || c.momentum < -5))
    riskFlags.push('both-declining')
  if (Math.min(b.ecosystem, c.ecosystem) < 20) riskFlags.push('low-ecosystem')

  const whyPair: string[] = []
  if (demandSynergy >= 60)
    whyPair.push('Strong combined job market demand across both skills')
  else if (demandSynergy >= 40)
    whyPair.push('Moderate combined employer demand')
  if (momentumAlignment >= 65 && bothPositive)
    whyPair.push('Both gaining momentum — likely co-rising in adoption')
  if (ecosystemFit >= 65)
    whyPair.push('Mature ecosystems — well-supported in production')
  if (communityValidation >= 60 && !hypeFlag)
    whyPair.push('Validated by developer community signal, not just hype')
  if (whyPair.length === 0)
    whyPair.push(
      `Combined score of ${pairScore}/100 based on demand, momentum, and ecosystem signals`
    )

  return {
    pairedSlug: candidate.slug,
    pairScore,
    pairConfidence,
    compatibility: {
      demandSynergy: Math.round(demandSynergy),
      momentumAlignment: Math.round(momentumAlignment),
      ecosystemFit: Math.round(ecosystemFit),
      communityValidation: Math.round(communityValidation),
      maturityBalance: Math.round(maturityBalance),
    },
    whyPair: whyPair.slice(0, 3),
    riskFlags,
  }
}

export function reweightForCareer(base: PairScore): PairScore {
  const { demandSynergy, momentumAlignment, ecosystemFit, communityValidation, maturityBalance } =
    base.compatibility
  const pairScore = Math.round(
    demandSynergy * 0.4 +
      momentumAlignment * 0.3 +
      ecosystemFit * 0.1 +
      communityValidation * 0.1 +
      maturityBalance * 0.1
  )
  return { ...base, pairScore }
}

export function reweightForStack(base: PairScore): PairScore {
  const { demandSynergy, momentumAlignment, ecosystemFit, communityValidation, maturityBalance } =
    base.compatibility
  const pairScore = Math.round(
    demandSynergy * 0.2 +
      momentumAlignment * 0.15 +
      ecosystemFit * 0.4 +
      communityValidation * 0.15 +
      maturityBalance * 0.1
  )
  return { ...base, pairScore }
}
