import type { TechnologyCategory } from '@/types'

// ---- Weight profiles ----

export interface WeightProfile {
  github: number
  community: number
  jobs: number
  ecosystem: number
  onchain?: number  // Only set for blockchain category
}

/**
 * Base weights by category.
 *
 * Rationale:
 * - Languages/backend/database/devops/cloud: job market signal is strongest
 *   (employers explicitly list these).
 * - Frontend: balanced — equal mix of community hype and employer demand.
 * - AI/ML: community signal leads adoption by 6-12 months, weight it higher.
 * - Mobile: moderate balance, ecosystem maturity matters.
 */
const CATEGORY_WEIGHTS: Record<TechnologyCategory, WeightProfile> = {
  language: { github: 0.20, community: 0.15, jobs: 0.35, ecosystem: 0.30 },
  frontend: { github: 0.25, community: 0.25, jobs: 0.25, ecosystem: 0.25 },
  backend:  { github: 0.20, community: 0.15, jobs: 0.35, ecosystem: 0.30 },
  database: { github: 0.15, community: 0.10, jobs: 0.40, ecosystem: 0.35 },
  devops:   { github: 0.15, community: 0.15, jobs: 0.40, ecosystem: 0.30 },
  cloud:    { github: 0.10, community: 0.15, jobs: 0.45, ecosystem: 0.30 },
  mobile:     { github: 0.20, community: 0.20, jobs: 0.30, ecosystem: 0.30 },
  ai_ml:      { github: 0.25, community: 0.30, jobs: 0.25, ecosystem: 0.20 },
  blockchain: { github: 0.20, community: 0.20, jobs: 0.25, ecosystem: 0.15, onchain: 0.20 },
}

/**
 * Compute adaptive weights based on category + maturity.
 *
 * New techs (< 365 days of data): boost github + community (early signals).
 * Mature techs (> 365 days): boost jobs + ecosystem (adoption signals).
 *
 * Output always sums to 1.0.
 */
export function getAdaptiveWeights(
  category: TechnologyCategory,
  dataAgeDays: number,
  dataCompleteness: number
): WeightProfile {
  const base = CATEGORY_WEIGHTS[category]

  // Maturity factor: 0 = brand new, 1 = mature (>365 days of data)
  const maturity = Math.min(1, dataAgeDays / 365)

  // New techs: boost github + community (early signals)
  // Mature techs: boost jobs + ecosystem (adoption signals)
  const raw = {
    github:    base.github    * (1 + (1 - maturity) * 0.3),
    community: base.community * (1 + (1 - maturity) * 0.2),
    jobs:      base.jobs      * (1 + maturity * 0.2),
    ecosystem: base.ecosystem * (1 + maturity * 0.1),
  }

  // Low completeness: reduce weight of dimensions more likely to be missing
  // (jobs data is often sparse for niche techs)
  if (dataCompleteness < 0.5) {
    raw.jobs *= 0.8
    raw.ecosystem *= 0.9
    raw.github *= 1.1
    raw.community *= 1.1
  }

  // Re-normalize so weights sum to 1.0
  const total = raw.github + raw.community + raw.jobs + raw.ecosystem
  return {
    github:    raw.github    / total,
    community: raw.community / total,
    jobs:      raw.jobs      / total,
    ecosystem: raw.ecosystem / total,
  }
}

/**
 * Get the default fixed weights (backward compatible).
 * Used as fallback when category is unknown.
 */
export const DEFAULT_WEIGHTS: WeightProfile = {
  github: 0.25,
  community: 0.20,
  jobs: 0.25,
  ecosystem: 0.30,
}
