import { zScoreTo100, minMaxNormalize } from '@/lib/scoring/normalize'
import type { WeightProfile } from '@/lib/scoring/adaptive-weights'
import { DEFAULT_WEIGHTS } from '@/lib/scoring/adaptive-weights'

// ---- Sub-score weights within the composite ----

const COMPOSITE_WEIGHTS = DEFAULT_WEIGHTS

// ---- Sub-score functions ----

/**
 * GitHub Score (0-100)
 *
 * Components:
 *   - starVelocityZ: z-scored star gain (or raw stars on day 1)
 *   - forkVelocityZ: z-scored fork count
 *   - issueCloseRate: closed / (closed + open), 0 to 1
 *   - contributorGrowthZ: z-scored active contributors (last 4 weeks)
 */
export function computeGitHubScore(
  starVelocityZ: number,
  forkVelocityZ: number,
  issueCloseRate: number,
  contributorGrowthZ: number = 0
): number {
  const starComponent        = zScoreTo100(starVelocityZ)      * 0.35
  const forkComponent        = zScoreTo100(forkVelocityZ)      * 0.15
  const issueComponent       = (issueCloseRate * 100)           * 0.20
  const contributorComponent = zScoreTo100(contributorGrowthZ) * 0.30
  return starComponent + forkComponent + issueComponent + contributorComponent
}

/**
 * Community Score (0-100)
 *
 * Components:
 *   - hnMentionsZ: z-scored HN mention count
 *   - hnSentiment: 0 to 1 (0 = negative, 1 = positive)
 *   - redditPostsZ: z-scored Reddit post count
 *   - redditSentiment: 0 to 1 (0 = negative, 1 = positive)
 *   - devtoArticlesZ: z-scored Dev.to article count
 *   - rssMentionsZ: z-scored RSS mention count across tech news feeds
 */
export function computeCommunityScore(
  hnMentionsZ: number,
  hnSentiment: number,
  redditPostsZ: number,
  devtoArticlesZ: number,
  redditSentiment: number = 0.5,
  rssMentionsZ: number = 0
): number {
  const hnComponent = zScoreTo100(hnMentionsZ) * 0.30
  const redditComponent = zScoreTo100(redditPostsZ) * 0.20
  const devtoComponent = zScoreTo100(devtoArticlesZ) * 0.20
  const rssComponent = zScoreTo100(rssMentionsZ) * 0.15
  // Combined sentiment from HN (60% weight) and Reddit (40% weight)
  const combinedSentiment = hnSentiment * 0.6 + redditSentiment * 0.4
  const sentimentAdjustment = (combinedSentiment - 0.5) * 30 // -15 to +15
  return Math.max(
    0,
    Math.min(100, hnComponent + redditComponent + devtoComponent + rssComponent + sentimentAdjustment)
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
 *   - downloadsZ: z-scored across all package registries
 *   - downloadGrowthRate: week-over-week percentage change (clamped -0.5 to 1.0)
 *   - soQuestionsZ: z-scored SO all-time question count (maturity/depth signal)
 *   - soMentionsZ: z-scored SO 30-day question count (recent activity signal)
 *   - dependentsZ: z-scored Libraries.io dependents_count (production adoption signal)
 */
export function computeEcosystemScore(
  downloadsZ: number,
  downloadGrowthRate: number,
  soQuestionsZ: number,
  soMentionsZ: number = 0,
  dependentsZ: number = 0
): number {
  const downloadComponent   = zScoreTo100(downloadsZ)                         * 0.20
  const growthComponent     = minMaxNormalize(downloadGrowthRate, -0.5, 1.0)  * 0.15
  const soComponent         = zScoreTo100(soQuestionsZ)                       * 0.15
  const soMentionsComponent = zScoreTo100(soMentionsZ)                        * 0.15
  const dependentsComponent = zScoreTo100(dependentsZ)                        * 0.35
  return downloadComponent + growthComponent + soComponent + soMentionsComponent + dependentsComponent
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
 * How many dimensions are realistically achievable per category.
 *
 * Cloud platforms (AWS, Azure, GCP, Vercel, Railway) have no GitHub repo
 * and no package downloads — penalizing them against 4 dims is unfair.
 * DevOps tools often lack package downloads too.
 */
const MAX_POSSIBLE_DIMENSIONS: Record<string, number> = {
  cloud:    2, // community + jobs only
  devops:   3, // github + community + jobs (no package downloads)
  language: 3, // github + community + jobs (languages distributed via OS, not pkg registries)
  frontend: 4,
  backend:  4,
  database: 4,
  mobile:   4,
  ai_ml:    4,
  testing:  4,
  other:    4,
}

/**
 * Compute the final composite score with weight redistribution.
 *
 * If a sub-score is null (no data for that dimension), its weight
 * is redistributed proportionally among available sub-scores.
 *
 * @param subScores - The four sub-scores (null = no data for that dimension)
 * @param weights - Optional adaptive weights. Falls back to DEFAULT_WEIGHTS.
 * @param category - Technology category for category-relative completeness.
 *                   Without it, completeness is computed against 4 dimensions.
 */
export function computeCompositeScore(
  subScores: SubScores,
  weights?: WeightProfile,
  category?: string
): CompositeResult {
  const w = weights ?? COMPOSITE_WEIGHTS
  const available: { score: number; weight: number }[] = []

  if (subScores.github !== null)
    available.push({ score: subScores.github, weight: w.github })
  if (subScores.community !== null)
    available.push({ score: subScores.community, weight: w.community })
  if (subScores.jobs !== null)
    available.push({ score: subScores.jobs, weight: w.jobs })
  if (subScores.ecosystem !== null)
    available.push({ score: subScores.ecosystem, weight: w.ecosystem })

  if (available.length === 0) return { composite: 0, completeness: 0 }

  const totalAvailableWeight = available.reduce((sum, a) => sum + a.weight, 0)
  const composite = available.reduce(
    (sum, a) => sum + a.score * (a.weight / totalAvailableWeight),
    0
  )

  // Use category-relative max so cloud/devops techs aren't unfairly penalized
  const maxDims = category ? (MAX_POSSIBLE_DIMENSIONS[category] ?? 4) : 4
  const completeness = Math.min(1, available.length / maxDims)

  return {
    composite: Math.round(composite * 100) / 100,
    completeness,
  }
}
