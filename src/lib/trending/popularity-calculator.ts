import { ContentSource } from '@/types/database.types'

export interface PopularityFactors {
  score: number
  comments: number
  engagement: number
  shares: number
  views: number
  source: ContentSource
}

export interface PopularityWeights {
  score: number
  comments: number
  engagement: number
  shares: number
  views: number
}

// Default weights for different engagement metrics
const DEFAULT_WEIGHTS: PopularityWeights = {
  score: 1.0,      // Base score (upvotes, likes, etc.)
  comments: 0.8,   // Comments indicate engagement
  engagement: 0.6, // General engagement metrics
  shares: 1.2,     // Shares are high-value actions
  views: 0.1       // Views are low-value but volume matters
}

// Source-specific weight adjustments
const SOURCE_ADJUSTMENTS: Record<ContentSource, PopularityWeights> = {
  hackernews: {
    score: 1.2,      // HN scores are meaningful
    comments: 1.0,   // HN comments are high quality
    engagement: 0.8,
    shares: 1.5,     // HN shares are valuable
    views: 0.1
  },
  rss: {
    score: 0.8,      // RSS doesn't have native scoring
    comments: 0.6,   // RSS comments are less common
    engagement: 1.0,
    shares: 1.0,
    views: 0.2       // RSS views might be more meaningful
  },
  newsapi: {
    score: 0.9,      // NewsAPI doesn't have native scoring
    comments: 0.7,   // Comments vary by source
    engagement: 1.1, // NewsAPI tracks engagement well
    shares: 1.1,
    views: 0.15
  }
}

export async function calculatePopularityScore(
  score: number,
  comments: number,
  engagement: number,
  shares: number,
  views: number,
  source: ContentSource
): Promise<number> {
  const factors: PopularityFactors = {
    score,
    comments,
    engagement,
    shares,
    views,
    source
  }

  return calculatePopularityScoreFromFactors(factors)
}

export function calculatePopularityScoreFromFactors(factors: PopularityFactors): number {
  const weights = getSourceAdjustedWeights(factors.source)
  
  // Calculate weighted components
  const scoreComponent = Math.log(Math.max(1, factors.score)) * weights.score
  const commentsComponent = Math.log(Math.max(1, factors.comments)) * weights.comments
  const engagementComponent = Math.log(Math.max(1, factors.engagement)) * weights.engagement
  const sharesComponent = Math.log(Math.max(1, factors.shares)) * weights.shares
  const viewsComponent = Math.log(Math.max(1, factors.views)) * weights.views

  // Combine components with diminishing returns (logarithmic scaling)
  const rawScore = scoreComponent + commentsComponent + engagementComponent + sharesComponent + viewsComponent

  // Apply source-specific normalization
  const normalizedScore = normalizeBySource(rawScore, factors.source)

  // Apply engagement ratio bonus (high engagement relative to views)
  const engagementRatio = factors.views > 0 ? (factors.engagement + factors.shares) / factors.views : 0
  const engagementBonus = Math.min(2.0, engagementRatio * 10) // Cap at 2x bonus

  return Math.max(0, normalizedScore * (1 + engagementBonus))
}

function getSourceAdjustedWeights(source: ContentSource): PopularityWeights {
  const baseWeights = { ...DEFAULT_WEIGHTS }
  const adjustments = SOURCE_ADJUSTMENTS[source] || DEFAULT_WEIGHTS

  return {
    score: baseWeights.score * adjustments.score,
    comments: baseWeights.comments * adjustments.comments,
    engagement: baseWeights.engagement * adjustments.engagement,
    shares: baseWeights.shares * adjustments.shares,
    views: baseWeights.views * adjustments.views
  }
}

function normalizeBySource(rawScore: number, source: ContentSource): number {
  // Apply source-specific normalization to account for different scales
  switch (source) {
    case 'hackernews':
      // HN scores tend to be lower but more meaningful
      return rawScore * 1.5
    case 'rss':
      // RSS has varied scoring, normalize conservatively
      return rawScore * 1.0
    case 'newsapi':
      // NewsAPI might have inflated metrics, normalize down
      return rawScore * 0.9
    default:
      return rawScore
  }
}

export function calculateTrendingVelocity(
  currentScore: number,
  previousScore: number,
  timeElapsedHours: number
): number {
  if (timeElapsedHours <= 0) {
    return 0
  }

  const scoreDelta = currentScore - previousScore
  return scoreDelta / timeElapsedHours
}

export function calculateConfidenceScore(
  popularityScore: number,
  velocity: number,
  dataPoints: number,
  ageHours: number
): number {
  // Base confidence from popularity score
  let confidence = Math.min(0.8, popularityScore / 100)

  // Velocity contribution
  if (velocity > 0) {
    confidence += Math.min(0.15, velocity / 50)
  } else if (velocity < -5) {
    confidence -= 0.1 // Penalty for declining content
  }

  // Data points contribution (more data = higher confidence)
  const dataPointsBonus = Math.min(0.1, dataPoints / 100)
  confidence += dataPointsBonus

  // Age penalty (very new content is less reliable)
  if (ageHours < 1) {
    confidence *= 0.7
  } else if (ageHours < 6) {
    confidence *= 0.9
  }

  // Age penalty for very old content
  if (ageHours > 168) { // 1 week
    confidence *= 0.8
  }

  return Math.max(0, Math.min(1, confidence))
}

export function explainPopularityScore(factors: PopularityFactors): string {
  const weights = getSourceAdjustedWeights(factors.source)
  const components = []

  if (factors.score > 0) {
    const contribution = Math.log(Math.max(1, factors.score)) * weights.score
    components.push(`${factors.score} ${getScoreLabel(factors.source)} (${contribution.toFixed(1)} points)`)
  }

  if (factors.comments > 0) {
    const contribution = Math.log(Math.max(1, factors.comments)) * weights.comments
    components.push(`${factors.comments} comments (${contribution.toFixed(1)} points)`)
  }

  if (factors.shares > 0) {
    const contribution = Math.log(Math.max(1, factors.shares)) * weights.shares
    components.push(`${factors.shares} shares (${contribution.toFixed(1)} points)`)
  }

  if (factors.engagement > 0) {
    const contribution = Math.log(Math.max(1, factors.engagement)) * weights.engagement
    components.push(`${factors.engagement} engagements (${contribution.toFixed(1)} points)`)
  }

  if (factors.views > 0) {
    const contribution = Math.log(Math.max(1, factors.views)) * weights.views
    components.push(`${factors.views} views (${contribution.toFixed(1)} points)`)
  }

  const explanation = components.length > 0 
    ? `Popularity based on: ${components.join(', ')}`
    : 'No engagement data available'

  return explanation + `. Source: ${factors.source} (${getSourceDescription(factors.source)}).`
}

function getScoreLabel(source: ContentSource): string {
  switch (source) {
    case 'hackernews': return 'points'
    case 'rss': return 'score'
    case 'newsapi': return 'score'
    default: return 'score'
  }
}

function getSourceDescription(source: ContentSource): string {
  switch (source) {
    case 'hackernews': return 'high-quality tech community'
    case 'rss': return 'curated news feeds'
    case 'newsapi': return 'news aggregation service'
    default: return 'unknown source'
  }
}

// Utility function to batch calculate popularity scores
export async function batchCalculatePopularityScores(
  items: Array<{
    id: number
    score: number
    comment_count: number
    source: ContentSource
    content_popularity?: {
      engagement_count: number
      share_count: number
      view_count: number
    }
  }>
): Promise<Array<{ id: number; popularityScore: number; explanation: string }>> {
  return Promise.all(
    items.map(async (item) => {
      const popularity = item.content_popularity
      const popularityScore = await calculatePopularityScore(
        item.score || 0,
        item.comment_count || 0,
        popularity?.engagement_count || 0,
        popularity?.share_count || 0,
        popularity?.view_count || 0,
        item.source
      )

      const explanation = explainPopularityScore({
        score: item.score || 0,
        comments: item.comment_count || 0,
        engagement: popularity?.engagement_count || 0,
        shares: popularity?.share_count || 0,
        views: popularity?.view_count || 0,
        source: item.source
      })

      return {
        id: item.id,
        popularityScore,
        explanation
      }
    })
  )
}