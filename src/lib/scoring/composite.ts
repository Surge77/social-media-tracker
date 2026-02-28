import { minMaxNormalize } from '@/lib/scoring/normalize'
import type { WeightProfile } from '@/lib/scoring/adaptive-weights'
import { DEFAULT_WEIGHTS } from '@/lib/scoring/adaptive-weights'

// ---- Sub-score weights within the composite ----

const COMPOSITE_WEIGHTS = DEFAULT_WEIGHTS

// ---- Sub-score functions ----

/**
 * GitHub Score (0-100)
 *
 * Components:
 *   - starVelocityPct: percentile-ranked star gain (0-100)
 *   - forkVelocityPct: percentile-ranked fork count (0-100)
 *   - issueCloseRate: closed / (closed + open), 0 to 1 (not percentile-ranked)
 *   - contributorGrowthPct: percentile-ranked active contributors (0-100)
 */
export function computeGitHubScore(
  starVelocityPct: number,
  forkVelocityPct: number,
  issueCloseRate: number,
  contributorGrowthPct: number = 50
): number {
  const starComponent        = starVelocityPct        * 0.35
  const forkComponent        = forkVelocityPct        * 0.15
  const issueComponent       = (issueCloseRate * 100) * 0.20
  const contributorComponent = contributorGrowthPct   * 0.30
  return starComponent + forkComponent + issueComponent + contributorComponent
}

/**
 * Community Score (0-100)
 *
 * Components:
 *   - hnMentionsPct: percentile-ranked HN mention count (0-100)
 *   - hnSentiment: 0 to 1 (not percentile-ranked — absolute sentiment scale)
 *   - redditPostsPct: percentile-ranked Reddit post count (0-100)
 *   - devtoArticlesPct: percentile-ranked Dev.to article count (0-100)
 *   - redditSentiment: 0 to 1 (not percentile-ranked)
 *   - rssMentionsPct: percentile-ranked RSS mention count (0-100)
 */
export function computeCommunityScore(
  hnMentionsPct: number,
  hnSentiment: number,
  redditPostsPct: number,
  devtoArticlesPct: number,
  redditSentiment: number = 0.5,
  rssMentionsPct: number = 50
): number {
  const hnComponent     = hnMentionsPct    * 0.30
  const redditComponent = redditPostsPct   * 0.20
  const devtoComponent  = devtoArticlesPct * 0.20
  const rssComponent    = rssMentionsPct   * 0.15
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
 *   - adzunaCountPct: percentile-ranked Adzuna job posting count (0-100)
 *   - jsearchCountPct: percentile-ranked JSearch job posting count (0-100)
 *   - remotiveCountPct: percentile-ranked Remotive job posting count (0-100)
 */
export function computeJobsScore(
  adzunaCountPct: number,
  jsearchCountPct: number,
  remotiveCountPct: number
): number {
  return (
    adzunaCountPct  * 0.40 +
    jsearchCountPct * 0.40 +
    remotiveCountPct * 0.20
  )
}

/**
 * Ecosystem Score (0-100)
 *
 * Components:
 *   - downloadsPct: percentile-ranked across all package registries (0-100)
 *   - downloadGrowthRate: week-over-week percentage change (clamped -0.5 to 1.0, NOT percentile-ranked)
 *   - soQuestionsPct: percentile-ranked SO all-time question count (0-100)
 *   - soMentionsPct: percentile-ranked SO 30-day question count (0-100)
 *   - dependentsPct: percentile-ranked Libraries.io dependents_count (0-100)
 */
export function computeEcosystemScore(
  downloadsPct: number,
  downloadGrowthRate: number,
  soQuestionsPct: number,
  soMentionsPct: number = 50,
  dependentsPct: number = 50
): number {
  const downloadComponent   = downloadsPct                                     * 0.20
  const growthComponent     = minMaxNormalize(downloadGrowthRate, -0.5, 1.0)  * 0.15
  const soComponent         = soQuestionsPct                                   * 0.15
  const soMentionsComponent = soMentionsPct                                    * 0.15
  const dependentsComponent = dependentsPct                                    * 0.35
  return downloadComponent + growthComponent + soComponent + soMentionsComponent + dependentsComponent
}

// ---- Composite score ----

export interface SubScores {
  github: number | null
  community: number | null
  jobs: number | null
  ecosystem: number | null
  onchain?: number | null  // blockchain techs only
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
  cloud:       2, // community + jobs only
  devops:      3, // github + community + jobs (no package downloads)
  language:    3, // github + community + jobs (languages distributed via OS, not pkg registries)
  frontend:    4,
  backend:     4,
  database:    4,
  mobile:      4,
  ai_ml:       4,
  blockchain:  5, // github + community + jobs + ecosystem + onchain
  testing:     4,
  other:       4,
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
  // onchain dimension — blockchain techs only; null treated as missing (redistributed)
  if (subScores.onchain != null && w.onchain != null)
    available.push({ score: subScores.onchain, weight: w.onchain })

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

/**
 * On-Chain Score (0-100) — blockchain techs only.
 *
 * Components:
 *   - tvlScore:            TVL rank among top 100 DeFi protocols (0-100)
 *   - devActivityScore:   CoinGecko commit/PR velocity for backing chain (0-100)
 *   - chainActivityScore: Etherscan network tx trend (0-100)
 *
 * For non-protocol techs (Solidity, Hardhat, etc.):
 *   - tvlScore is 0, weights redistribute to devActivity + chainActivity
 */
export function computeOnchainScoreFromParts(
  tvlScore: number,
  devActivityScore: number,
  chainActivityScore: number,
  hasProtocol: boolean
): number {
  if (hasProtocol) {
    return Math.round(
      tvlScore           * 0.40 +
      devActivityScore   * 0.40 +
      chainActivityScore * 0.20
    )
  }
  return Math.round(
    devActivityScore   * 0.70 +
    chainActivityScore * 0.30
  )
}
