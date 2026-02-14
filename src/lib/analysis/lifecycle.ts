/**
 * Technology Lifecycle Classification
 *
 * Classifies technologies into lifecycle stages based on momentum patterns,
 * score trends, volatility, and historical data.
 *
 * 8 Stages:
 * - emerging: New tech, low scores, high growth momentum
 * - growing: Strong upward momentum, increasing adoption
 * - mature: High scores, stable momentum, low volatility
 * - declining: Negative momentum, decreasing scores
 * - legacy: Low scores, stable or declining, old tech
 * - niche: Moderate scores, stable, specialized category
 * - hype: Extremely high volatility, rapid score changes
 * - plateau: High scores, near-zero momentum, stable
 */

import type { MomentumAnalysis } from '@/lib/scoring/enhanced-momentum'
import type { ConfidenceBreakdown } from '@/lib/scoring/confidence'

export type LifecycleStage =
  | 'emerging'
  | 'growing'
  | 'mature'
  | 'declining'
  | 'legacy'
  | 'niche'
  | 'hype'
  | 'plateau'

export interface LifecycleClassification {
  stage: LifecycleStage
  confidence: number // 0-1
  reasoning: string[] // Human-readable reasons for this classification
  daysInStage: number // Estimated days in current stage
  stageTransitionProbability: number // 0-1, likelihood of transitioning soon
  previousStage?: LifecycleStage
}

interface ClassificationContext {
  compositeScore: number // 0-100
  momentum: MomentumAnalysis
  confidence: ConfidenceBreakdown
  dataAgeDays: number // Days since first data point
  category: string
  recentScores: number[] // Last 30 days of scores
}

/**
 * Classify a technology's lifecycle stage
 */
export function classifyLifecycle(context: ClassificationContext): LifecycleClassification {
  const {
    compositeScore,
    momentum,
    confidence,
    dataAgeDays,
    category,
    recentScores,
  } = context

  const reasoning: string[] = []
  let stage: LifecycleStage
  let classificationConfidence = 0.8

  // Calculate volatility from recent scores
  const volatility = calculateVolatility(recentScores)
  const scoreRange = Math.max(...recentScores) - Math.min(...recentScores)

  // ---- Stage Classification Logic ----

  // 1. HYPE: Extremely high volatility and rapid changes
  if (volatility > 10 && scoreRange > 30 && momentum.trend === 'volatile') {
    stage = 'hype'
    reasoning.push('Extremely high volatility and rapid score swings')
    reasoning.push(`Volatility: ${volatility.toFixed(1)}, Score range: ${scoreRange.toFixed(1)}`)
    classificationConfidence = 0.9

    // 2. EMERGING: New tech, low-to-moderate scores, strong growth
  } else if (
    dataAgeDays < 180 &&
    compositeScore < 60 &&
    (momentum.trend === 'accelerating' || momentum.shortTerm > 2)
  ) {
    stage = 'emerging'
    reasoning.push('Recently appeared with strong growth momentum')
    reasoning.push(`Age: ${dataAgeDays} days, Score: ${compositeScore.toFixed(1)}`)
    reasoning.push(`Short-term momentum: ${momentum.shortTerm.toFixed(2)}`)
    classificationConfidence = 0.85

    // 3. GROWING: Strong sustained growth across multiple windows
  } else if (
    momentum.shortTerm > 1 &&
    momentum.mediumTerm > 0.5 &&
    (momentum.trend === 'accelerating' || momentum.trend === 'stable') &&
    compositeScore < 85
  ) {
    stage = 'growing'
    reasoning.push('Strong sustained growth momentum')
    reasoning.push(`Short-term: +${momentum.shortTerm.toFixed(2)}, Medium-term: +${momentum.mediumTerm.toFixed(2)}`)
    reasoning.push(`Current score: ${compositeScore.toFixed(1)}`)
    classificationConfidence = 0.9

    // 4. MATURE: High scores, stable, low volatility
  } else if (
    compositeScore >= 70 &&
    Math.abs(momentum.mediumTerm) < 1 &&
    volatility < 5 &&
    dataAgeDays > 365
  ) {
    stage = 'mature'
    reasoning.push('High score with stable, low-volatility performance')
    reasoning.push(`Score: ${compositeScore.toFixed(1)}, Volatility: ${volatility.toFixed(1)}`)
    reasoning.push(`Age: ${Math.floor(dataAgeDays / 365)} years`)
    classificationConfidence = 0.95

    // 5. PLATEAU: High scores, near-zero momentum
  } else if (
    compositeScore >= 70 &&
    Math.abs(momentum.shortTerm) < 0.5 &&
    Math.abs(momentum.mediumTerm) < 0.5 &&
    momentum.trend === 'stable'
  ) {
    stage = 'plateau'
    reasoning.push('High score but minimal momentum in either direction')
    reasoning.push(`Score: ${compositeScore.toFixed(1)}, Momentum: ${momentum.shortTerm.toFixed(2)}`)
    classificationConfidence = 0.85

    // 6. DECLINING: Negative momentum, losing ground
  } else if (
    momentum.shortTerm < -1 &&
    momentum.mediumTerm < -0.5 &&
    (momentum.trend === 'decelerating' || momentum.trend === 'reversing')
  ) {
    stage = 'declining'
    reasoning.push('Sustained negative momentum across time windows')
    reasoning.push(`Short-term: ${momentum.shortTerm.toFixed(2)}, Medium-term: ${momentum.mediumTerm.toFixed(2)}`)
    if (momentum.streak < -7) {
      reasoning.push(`Declining for ${Math.abs(momentum.streak)} consecutive days`)
    }
    classificationConfidence = 0.9

    // 7. LEGACY: Old tech, low scores, stable or declining
  } else if (
    dataAgeDays > 730 && // 2+ years old
    compositeScore < 40 &&
    momentum.mediumTerm <= 0
  ) {
    stage = 'legacy'
    reasoning.push('Long-established technology with low current scores')
    reasoning.push(`Age: ${Math.floor(dataAgeDays / 365)} years, Score: ${compositeScore.toFixed(1)}`)
    reasoning.push('Negative or flat momentum')
    classificationConfidence = 0.85

    // 8. NICHE: Moderate scores, stable, specialized
  } else if (
    compositeScore >= 40 &&
    compositeScore < 70 &&
    Math.abs(momentum.mediumTerm) < 1 &&
    volatility < 5
  ) {
    stage = 'niche'
    reasoning.push('Moderate score with stable performance')
    reasoning.push(`Score: ${compositeScore.toFixed(1)}, Volatility: ${volatility.toFixed(1)}`)
    reasoning.push('Likely strong in a specific domain')
    classificationConfidence = 0.7

    // Default fallback
  } else {
    // If none of the above, determine based on score + momentum direction
    if (compositeScore >= 60 && momentum.mediumTerm > 0) {
      stage = 'growing'
      reasoning.push('Positive momentum with solid score')
    } else if (compositeScore >= 60) {
      stage = 'plateau'
      reasoning.push('High score, unclear momentum pattern')
    } else if (momentum.mediumTerm > 0) {
      stage = 'emerging'
      reasoning.push('Low score but showing growth')
    } else {
      stage = 'niche'
      reasoning.push('Moderate score, stable pattern')
    }
    classificationConfidence = 0.6
  }

  // Adjust confidence based on data quality
  if (confidence.grade === 'A' || confidence.grade === 'B') {
    classificationConfidence = Math.min(1, classificationConfidence + 0.05)
  } else if (confidence.grade === 'D' || confidence.grade === 'F') {
    classificationConfidence *= 0.8
    reasoning.push(`Limited data confidence (grade ${confidence.grade})`)
  }

  // Estimate days in stage
  const daysInStage = estimateDaysInStage(momentum, stage)

  // Calculate stage transition probability
  const stageTransitionProbability = calculateTransitionProbability(
    stage,
    momentum,
    volatility,
    daysInStage
  )

  return {
    stage,
    confidence: Math.round(classificationConfidence * 100) / 100,
    reasoning,
    daysInStage,
    stageTransitionProbability,
  }
}

/**
 * Calculate volatility as standard deviation of recent scores
 */
function calculateVolatility(scores: number[]): number {
  if (scores.length < 2) return 0

  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length
  const variance =
    scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length

  return Math.sqrt(variance)
}

/**
 * Estimate how many days the technology has been in its current stage
 * Based on momentum streak and trend consistency
 */
function estimateDaysInStage(momentum: MomentumAnalysis, stage: LifecycleStage): number {
  const { streak } = momentum

  // For stages driven by momentum direction
  if (stage === 'growing' || stage === 'declining') {
    return Math.abs(streak)
  }

  // For stable stages, estimate based on confidence
  // High confidence = likely been there a while
  if (stage === 'mature' || stage === 'plateau' || stage === 'niche') {
    return Math.max(14, Math.min(90, 30))
  }

  // For volatile/transitional stages
  if (stage === 'emerging' || stage === 'hype') {
    return Math.min(Math.abs(streak), 30)
  }

  // Legacy: been there a long time
  if (stage === 'legacy') {
    return 180
  }

  return 7 // Default
}

/**
 * Calculate probability of transitioning to a different stage soon
 * Higher probability when:
 * - In a volatile stage (hype, emerging)
 * - Momentum is reversing
 * - Been in stage for a long time
 */
function calculateTransitionProbability(
  stage: LifecycleStage,
  momentum: MomentumAnalysis,
  volatility: number,
  daysInStage: number
): number {
  let baseProbability = 0.1

  // Volatile stages are inherently unstable
  if (stage === 'hype' || stage === 'emerging') {
    baseProbability = 0.6
  }

  // Growing/declining are medium stability
  if (stage === 'growing' || stage === 'declining') {
    baseProbability = 0.3
  }

  // Mature/plateau/legacy are very stable
  if (stage === 'mature' || stage === 'plateau' || stage === 'legacy') {
    baseProbability = 0.05
  }

  // Momentum reversal increases transition probability
  if (momentum.trend === 'reversing') {
    baseProbability += 0.3
  }

  // High volatility increases probability
  if (volatility > 8) {
    baseProbability += 0.2
  }

  // Long time in stage increases probability (natural lifecycle progression)
  if (daysInStage > 90) {
    baseProbability += 0.15
  }

  return Math.min(1, Math.round(baseProbability * 100) / 100)
}

/**
 * Get human-readable description for a lifecycle stage
 */
export function getLifecycleDescription(stage: LifecycleStage): string {
  const descriptions: Record<LifecycleStage, string> = {
    emerging: 'Early stage — growing adoption, high potential',
    growing: 'Rapid growth — increasing developer adoption',
    mature: 'Industry standard — stable and widely adopted',
    declining: 'Losing momentum — consider alternatives',
    legacy: 'Maintenance mode — being replaced by newer options',
    niche: 'Specialized — strong in a specific domain',
    hype: 'Highly volatile — wait for stability before adopting',
    plateau: 'Stable peak — widely adopted but not growing',
  }

  return descriptions[stage]
}

/**
 * Get recommended action for developers based on lifecycle stage
 */
export function getLifecycleRecommendation(stage: LifecycleStage): string {
  const recommendations: Record<LifecycleStage, string> = {
    emerging: 'Worth learning for future opportunities, but production use carries risk',
    growing: 'Strong learning investment — adoption is accelerating',
    mature: 'Safe production choice — widely supported and stable',
    declining: 'Maintain existing skills, but prioritize learning alternatives',
    legacy: 'Only learn if required for maintenance work',
    niche: 'Learn if it matches your specialization or project needs',
    hype: 'Monitor developments but wait for clearer direction',
    plateau: 'Safe for production, but limited future growth potential',
  }

  return recommendations[stage]
}
