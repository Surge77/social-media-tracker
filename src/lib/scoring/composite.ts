import { zScoreTo100, minMaxNormalize } from '@/lib/scoring/normalize'

// ---- Sub-score weights within the composite ----

const COMPOSITE_WEIGHTS = {
  github: 0.25,
  community: 0.20,
  jobs: 0.25,
  ecosystem: 0.30,
}

// ---- Sub-score functions ----

/**
 * GitHub Score (0-100)
 *
 * Components:
 *   - starVelocityZ: z-scored star gain (or raw stars on day 1)
 *   - forkVelocityZ: z-scored fork count
 *   - issueCloseRate: closed / (closed + open), 0 to 1
 *   - contributorGrowthZ: z-scored (not available in MVP — use 0)
 */
export function computeGitHubScore(
  starVelocityZ: number,
  forkVelocityZ: number,
  issueCloseRate: number,
  contributorGrowthZ: number = 0
): number {
  const starComponent = zScoreTo100(starVelocityZ) * 0.40
  const forkComponent = zScoreTo100(forkVelocityZ) * 0.20
  const issueComponent = (issueCloseRate * 100) * 0.20
  const contributorComponent = zScoreTo100(contributorGrowthZ) * 0.20
  return starComponent + forkComponent + issueComponent + contributorComponent
}

/**
 * Community Score (0-100)
 *
 * Components:
 *   - hnMentionsZ: z-scored HN mention count
 *   - hnSentiment: 0 to 1 (0 = negative, 1 = positive)
 *   - redditPostsZ: z-scored Reddit post count
 *   - devtoArticlesZ: z-scored Dev.to article count
 */
export function computeCommunityScore(
  hnMentionsZ: number,
  hnSentiment: number,
  redditPostsZ: number,
  devtoArticlesZ: number
): number {
  const hnComponent = zScoreTo100(hnMentionsZ) * 0.35
  const redditComponent = zScoreTo100(redditPostsZ) * 0.25
  const devtoComponent = zScoreTo100(devtoArticlesZ) * 0.25
  const sentimentAdjustment = (hnSentiment - 0.5) * 30 // -15 to +15
  return Math.max(
    0,
    Math.min(100, hnComponent + redditComponent + devtoComponent + sentimentAdjustment)
  )
}

/**
 * Jobs Score (0-100)
 *
 * Components:
 *   - adzunaCountZ: z-scored Adzuna job posting count
 *   - jsearchCountZ: z-scored JSearch job posting count
 *   - remotiveCountZ: z-scored Remotive job posting count
 */
export function computeJobsScore(
  adzunaCountZ: number,
  jsearchCountZ: number,
  remotiveCountZ: number
): number {
  return (
    zScoreTo100(adzunaCountZ) * 0.40 +
    zScoreTo100(jsearchCountZ) * 0.40 +
    zScoreTo100(remotiveCountZ) * 0.20
  )
}

/**
 * Ecosystem Score (0-100)
 *
 * Components:
 *   - downloadsZ: z-scored within same ecosystem (JS vs JS, Py vs Py)
 *   - downloadGrowthRate: percentage change (e.g., 0.15 for +15%)
 *   - soQuestionsZ: z-scored SO question count
 */
export function computeEcosystemScore(
  downloadsZ: number,
  downloadGrowthRate: number,
  soQuestionsZ: number
): number {
  const downloadComponent = zScoreTo100(downloadsZ) * 0.40
  const growthComponent = minMaxNormalize(downloadGrowthRate, -0.5, 1.0) * 0.25
  const soComponent = zScoreTo100(soQuestionsZ) * 0.35
  return downloadComponent + growthComponent + soComponent
}

// ---- Composite score ----

export interface SubScores {
  github: number | null
  community: number | null
  jobs: number | null
  ecosystem: number | null
}

export interface CompositeResult {
  composite: number
  completeness: number
}

/**
 * Compute the final composite score with weight redistribution.
 *
 * If a sub-score is null (no data for that dimension), its weight
 * is redistributed proportionally among available sub-scores.
 */
export function computeCompositeScore(subScores: SubScores): CompositeResult {
  const available: { score: number; weight: number }[] = []

  if (subScores.github !== null)
    available.push({ score: subScores.github, weight: COMPOSITE_WEIGHTS.github })
  if (subScores.community !== null)
    available.push({ score: subScores.community, weight: COMPOSITE_WEIGHTS.community })
  if (subScores.jobs !== null)
    available.push({ score: subScores.jobs, weight: COMPOSITE_WEIGHTS.jobs })
  if (subScores.ecosystem !== null)
    available.push({ score: subScores.ecosystem, weight: COMPOSITE_WEIGHTS.ecosystem })

  if (available.length === 0) return { composite: 0, completeness: 0 }

  const totalAvailableWeight = available.reduce((sum, a) => sum + a.weight, 0)
  const composite = available.reduce(
    (sum, a) => sum + a.score * (a.weight / totalAvailableWeight),
    0
  )
  const completeness = available.length / 4

  return {
    composite: Math.round(composite * 100) / 100,
    completeness,
  }
}
