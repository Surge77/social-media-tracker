import { ContentSource, TrendType, TrendingWindow } from '@/types/database.types'

export interface TrendExplanation {
  summary: string
  factors: string[]
  algorithm: string
  confidence: string
  recommendations?: string[]
}

export function generateTrendExplanation(
  trendingScore: number,
  velocity: number,
  trendType: TrendType,
  confidence: number,
  source: ContentSource,
  window: TrendingWindow,
  ageHours: number,
  popularityFactors: {
    score: number
    comments: number
    shares: number
    engagement: number
    views: number
  }
): TrendExplanation {
  const explanation: TrendExplanation = {
    summary: generateSummary(trendType, trendingScore, confidence),
    factors: generateFactors(popularityFactors, source, ageHours, velocity),
    algorithm: generateAlgorithmExplanation(window, source),
    confidence: generateConfidenceExplanation(confidence, trendType),
    recommendations: generateRecommendations(trendType, velocity, confidence)
  }

  return explanation
}

function generateSummary(trendType: TrendType, score: number, confidence: number): string {
  const confidenceLevel = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low'
  
  switch (trendType) {
    case 'viral':
      return `This content is going viral with exceptional growth (score: ${score.toFixed(1)}, ${confidenceLevel} confidence)`
    case 'rising':
      return `This content is rapidly rising in popularity (score: ${score.toFixed(1)}, ${confidenceLevel} confidence)`
    case 'hot':
      return `This content is currently hot with high engagement (score: ${score.toFixed(1)}, ${confidenceLevel} confidence)`
    case 'sustained':
      return `This content has sustained popularity over time (score: ${score.toFixed(1)}, ${confidenceLevel} confidence)`
    default:
      return `This content has moderate trending activity (score: ${score.toFixed(1)}, ${confidenceLevel} confidence)`
  }
}

function generateFactors(
  factors: { score: number; comments: number; shares: number; engagement: number; views: number },
  source: ContentSource,
  ageHours: number,
  velocity: number
): string[] {
  const factorList: string[] = []

  // Engagement factors
  if (factors.score > 0) {
    const scoreLabel = getSourceScoreLabel(source)
    factorList.push(`${factors.score} ${scoreLabel} indicating community approval`)
  }

  if (factors.comments > 0) {
    const commentLevel = factors.comments > 50 ? 'high' : factors.comments > 10 ? 'moderate' : 'some'
    factorList.push(`${commentLevel} discussion activity (${factors.comments} comments)`)
  }

  if (factors.shares > 0) {
    const shareLevel = factors.shares > 100 ? 'extensive' : factors.shares > 20 ? 'significant' : 'some'
    factorList.push(`${shareLevel} sharing activity (${factors.shares} shares)`)
  }

  if (factors.engagement > 0) {
    factorList.push(`${factors.engagement} total engagements across platforms`)
  }

  // Velocity factor
  if (velocity > 5) {
    factorList.push(`rapid growth velocity (${velocity.toFixed(1)} points/hour)`)
  } else if (velocity > 0) {
    factorList.push(`positive growth momentum (${velocity.toFixed(1)} points/hour)`)
  } else if (velocity < -2) {
    factorList.push(`declining momentum (${velocity.toFixed(1)} points/hour)`)
  }

  // Age factor
  if (ageHours < 1) {
    factorList.push('very recent content (less than 1 hour old)')
  } else if (ageHours < 6) {
    factorList.push(`recent content (${ageHours.toFixed(1)} hours old)`)
  } else if (ageHours < 24) {
    factorList.push(`content from today (${ageHours.toFixed(1)} hours old)`)
  } else {
    const days = Math.floor(ageHours / 24)
    factorList.push(`content from ${days} day${days > 1 ? 's' : ''} ago`)
  }

  // Source factor
  factorList.push(`sourced from ${getSourceDescription(source)}`)

  return factorList
}

function generateAlgorithmExplanation(window: TrendingWindow, source: ContentSource): string {
  const windowDesc = getWindowDescription(window)
  const sourceWeight = getSourceWeight(source)
  
  return `Trending calculated using ${windowDesc} time window with ${sourceWeight} weighting for ${source} content. ` +
         `Algorithm combines engagement metrics, time decay, and velocity to identify trending content.`
}

function generateConfidenceExplanation(confidence: number, trendType: TrendType): string {
  const percentage = Math.round(confidence * 100)
  
  if (confidence > 0.8) {
    return `${percentage}% confidence - Strong trending signals with reliable data points`
  } else if (confidence > 0.6) {
    return `${percentage}% confidence - Good trending indicators with some uncertainty`
  } else if (confidence > 0.4) {
    return `${percentage}% confidence - Moderate trending signals, monitor for changes`
  } else {
    return `${percentage}% confidence - Weak trending signals, may be noise or early stage`
  }
}

function generateRecommendations(trendType: TrendType, velocity: number, confidence: number): string[] {
  const recommendations: string[] = []

  switch (trendType) {
    case 'viral':
      recommendations.push('Monitor closely - viral content can peak quickly')
      recommendations.push('Consider featuring prominently while momentum lasts')
      break
    case 'rising':
      recommendations.push('Good candidate for promotion - rising content often continues to grow')
      recommendations.push('Track velocity to predict peak timing')
      break
    case 'hot':
      recommendations.push('Currently popular - good for immediate visibility')
      recommendations.push('May have staying power if engagement remains high')
      break
    case 'sustained':
      recommendations.push('Reliable evergreen content - good for long-term visibility')
      recommendations.push('Less time-sensitive than other trending types')
      break
  }

  if (confidence < 0.5) {
    recommendations.push('Low confidence - wait for more data before major decisions')
  }

  if (velocity < -5) {
    recommendations.push('Declining rapidly - consider reducing prominence')
  }

  return recommendations
}

function getSourceScoreLabel(source: ContentSource): string {
  switch (source) {
    case 'hackernews': return 'points'
    case 'rss': return 'engagement points'
    case 'newsapi': return 'popularity points'
    default: return 'points'
  }
}

function getSourceDescription(source: ContentSource): string {
  switch (source) {
    case 'hackernews': return 'Hacker News (high-quality tech community)'
    case 'rss': return 'RSS feeds (curated news sources)'
    case 'newsapi': return 'NewsAPI (news aggregation service)'
    default: return 'unknown source'
  }
}

function getWindowDescription(window: TrendingWindow): string {
  switch (window) {
    case '15m': return '15-minute'
    case '1h': return '1-hour'
    case '6h': return '6-hour'
    case '24h': return '24-hour'
    case '7d': return '7-day'
    case '30d': return '30-day'
    default: return 'unknown'
  }
}

function getSourceWeight(source: ContentSource): string {
  switch (source) {
    case 'hackernews': return 'high-quality'
    case 'rss': return 'standard'
    case 'newsapi': return 'adjusted'
    default: return 'standard'
  }
}