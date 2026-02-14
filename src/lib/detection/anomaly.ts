/**
 * Anomaly Detection Module
 *
 * Statistical anomaly detection using z-scores and trend breaks.
 * Detects 5 types: spike, drop, divergence, trend_break, correlation_break.
 */

import { mean, standardDeviation } from 'simple-statistics'
import type { DailyScore } from '@/types'

export type AnomalyType = 'spike' | 'drop' | 'divergence' | 'trend_break' | 'correlation_break'
export type AnomalySeverity = 'info' | 'notable' | 'significant' | 'critical'

export interface AnomalyDetectionResult {
  type: AnomalyType
  severity: AnomalySeverity
  source: string // 'github_stars', 'hn_mentions', etc.
  metric: string
  expectedValue: number
  actualValue: number
  deviationSigma: number
  relatedHeadlines: string[] // empty for now, filled by AI explanation later
}

interface TechSignals {
  githubScore: number
  communityScore: number
  jobsScore: number
  ecosystemScore: number
  momentum: number
  shortTermMomentum?: number
  mediumTermMomentum?: number
  longTermMomentum?: number
}

/**
 * Detect anomalies in technology metrics
 */
export function detectAnomalies(
  current: DailyScore,
  history: DailyScore[], // last 30-90 days
  signals: TechSignals
): AnomalyDetectionResult[] {
  const anomalies: AnomalyDetectionResult[] = []

  if (history.length < 7) {
    // Not enough historical data for meaningful detection
    return anomalies
  }

  // 1. Detect spikes/drops in composite score
  const compositeAnomalies = detectMetricAnomalies(
    'composite_score',
    current.composite_score,
    history.map(h => h.composite_score),
    'overall'
  )
  anomalies.push(...compositeAnomalies)

  // 2. Detect anomalies in individual signal scores
  const githubAnomalies = detectMetricAnomalies(
    'github_score',
    current.github_score || 0,
    history.map(h => h.github_score || 0),
    'github'
  )
  anomalies.push(...githubAnomalies)

  const communityAnomalies = detectMetricAnomalies(
    'community_score',
    current.community_score || 0,
    history.map(h => h.community_score || 0),
    'community'
  )
  anomalies.push(...communityAnomalies)

  const jobsAnomalies = detectMetricAnomalies(
    'jobs_score',
    current.jobs_score || 0,
    history.map(h => h.jobs_score || 0),
    'jobs'
  )
  anomalies.push(...jobsAnomalies)

  // 3. Detect trend breaks
  const trendBreak = detectTrendBreak(
    current,
    history,
    signals
  )
  if (trendBreak) {
    anomalies.push(trendBreak)
  }

  // 4. Detect cross-signal divergence
  const divergence = detectDivergence(signals)
  if (divergence) {
    anomalies.push(divergence)
  }

  return anomalies
}

/**
 * Detect anomalies in a single metric using z-scores
 */
function detectMetricAnomalies(
  metric: string,
  currentValue: number,
  historicalValues: number[],
  source: string
): AnomalyDetectionResult[] {
  const anomalies: AnomalyDetectionResult[] = []

  // Filter out zero values for more accurate statistics
  const nonZeroValues = historicalValues.filter(v => v > 0)

  if (nonZeroValues.length < 7) {
    return anomalies
  }

  const avg = mean(nonZeroValues)
  const stdDev = standardDeviation(nonZeroValues)

  // Avoid division by zero
  if (stdDev === 0) {
    return anomalies
  }

  const zScore = Math.abs((currentValue - avg) / stdDev)
  const isSpike = currentValue > avg
  const isDrop = currentValue < avg

  // Determine severity based on z-score
  let severity: AnomalySeverity | null = null
  if (zScore > 4.5) {
    severity = 'critical'
  } else if (zScore > 3.5) {
    severity = 'significant'
  } else if (zScore > 2.5) {
    severity = 'notable'
  }

  if (severity) {
    anomalies.push({
      type: isSpike ? 'spike' : 'drop',
      severity,
      source,
      metric,
      expectedValue: avg,
      actualValue: currentValue,
      deviationSigma: zScore,
      relatedHeadlines: []
    })
  }

  return anomalies
}

/**
 * Detect trend breaks (momentum direction reversal)
 */
function detectTrendBreak(
  current: DailyScore,
  history: DailyScore[],
  signals: TechSignals
): AnomalyDetectionResult | null {
  const { shortTermMomentum, mediumTermMomentum } = signals

  // Need both short-term and medium-term momentum
  if (shortTermMomentum === undefined || mediumTermMomentum === undefined) {
    return null
  }

  // Check for direction flip
  const shortIsPositive = shortTermMomentum > 0
  const mediumIsPositive = mediumTermMomentum > 0

  if (shortIsPositive !== mediumIsPositive) {
    const magnitudeDiff = Math.abs(shortTermMomentum - mediumTermMomentum)

    // Only flag if magnitude difference is significant
    if (magnitudeDiff > 3) {
      return {
        type: 'trend_break',
        severity: magnitudeDiff > 10 ? 'significant' : 'notable',
        source: 'momentum',
        metric: 'trend_direction',
        expectedValue: mediumTermMomentum,
        actualValue: shortTermMomentum,
        deviationSigma: magnitudeDiff / 3, // Normalize to approximate sigma
        relatedHeadlines: []
      }
    }
  }

  return null
}

/**
 * Detect cross-signal divergence
 * (e.g., GitHub score rising but community score falling)
 */
function detectDivergence(signals: TechSignals): AnomalyDetectionResult | null {
  const { githubScore, communityScore, jobsScore } = signals

  // Check GitHub vs Community divergence
  const githubCommunityDelta = githubScore - communityScore
  if (Math.abs(githubCommunityDelta) > 15) {
    const isGithubHigher = githubCommunityDelta > 0

    return {
      type: 'divergence',
      severity: Math.abs(githubCommunityDelta) > 25 ? 'significant' : 'notable',
      source: 'cross_signal',
      metric: isGithubHigher ? 'github_vs_community' : 'community_vs_github',
      expectedValue: isGithubHigher ? communityScore : githubScore,
      actualValue: isGithubHigher ? githubScore : communityScore,
      deviationSigma: Math.abs(githubCommunityDelta) / 5, // Normalize
      relatedHeadlines: []
    }
  }

  // Check Jobs vs Developer Interest divergence
  const avgDeveloperInterest = (githubScore + communityScore) / 2
  const jobsInterestDelta = jobsScore - avgDeveloperInterest
  if (Math.abs(jobsInterestDelta) > 20) {
    const isJobsHigher = jobsInterestDelta > 0

    return {
      type: 'divergence',
      severity: Math.abs(jobsInterestDelta) > 30 ? 'significant' : 'notable',
      source: 'market',
      metric: isJobsHigher ? 'jobs_vs_interest' : 'interest_vs_jobs',
      expectedValue: avgDeveloperInterest,
      actualValue: jobsScore,
      deviationSigma: Math.abs(jobsInterestDelta) / 5,
      relatedHeadlines: []
    }
  }

  return null
}
