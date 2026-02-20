import type { TechnologyCategory } from '@/types'

// ---- Types ----

export type ConfidenceGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface ConfidenceBreakdown {
  overall: number           // 0-100
  sourceCoverage: number    // 0-100: how many of possible sources have data
  dataRecency: number       // 0-100: how fresh is the latest data point
  historicalDepth: number   // 0-100: how many days of continuous data
  signalAgreement: number   // 0-100: do sub-scores agree? (low = contradictory)
  grade: ConfidenceGrade
}

// ---- Source expectations per category ----

/**
 * Maximum possible data sources per category.
 * Not every tech will have all sources (e.g., a database won't have npm downloads).
 */
const MAX_SOURCES: Record<TechnologyCategory, number> = {
  language: 14,  // +github_stats, +librariesio, +npms, +extended_registry
  frontend: 14,
  backend: 13,   // not all backend techs have npm
  database: 10,  // +librariesio
  devops: 10,    // +librariesio
  cloud: 9,      // +librariesio
  mobile: 11,    // +librariesio, +pubdev for Flutter/Dart
  ai_ml: 12,     // +librariesio, +npms for Python ML packages
}

// ---- Main function ----

/**
 * Compute confidence score for a technology's data.
 *
 * High confidence = many sources, fresh data, long history, signals agree.
 * Low confidence = sparse sources, stale data, short history, contradictory signals.
 */
export function computeConfidence(
  category: TechnologyCategory,
  activeSources: number,
  lastDataPointAgeHours: number,
  historyDays: number,
  subScores: {
    github: number | null
    community: number | null
    jobs: number | null
    ecosystem: number | null
  }
): ConfidenceBreakdown {
  const maxSources = MAX_SOURCES[category]

  // Source coverage: what fraction of expected sources are reporting data
  const sourceCoverage = Math.min(100, (activeSources / maxSources) * 100)

  // Data recency: how fresh is the latest data point
  const dataRecency =
    lastDataPointAgeHours < 24 ? 100
    : lastDataPointAgeHours < 48 ? 80
    : lastDataPointAgeHours < 72 ? 50
    : lastDataPointAgeHours < 168 ? 30 // 1 week
    : 10

  // Historical depth: how many days of data do we have
  // 30+ days = full confidence on this dimension
  const historicalDepth = Math.min(100, (historyDays / 30) * 100)

  // Signal agreement: how similar are the non-null sub-scores
  const signalAgreement = computeSignalAgreement(subScores)

  // Weighted overall score
  const overall =
    sourceCoverage * 0.35 +
    dataRecency * 0.25 +
    historicalDepth * 0.20 +
    signalAgreement * 0.20

  const grade = gradeFromScore(overall)

  return {
    overall: Math.round(overall),
    sourceCoverage: Math.round(sourceCoverage),
    dataRecency: Math.round(dataRecency),
    historicalDepth: Math.round(historicalDepth),
    signalAgreement: Math.round(signalAgreement),
    grade,
  }
}

// ---- Helpers ----

/**
 * Measure how much the sub-scores agree with each other.
 * High agreement = all sub-scores are similar → confident.
 * Low agreement = sub-scores diverge widely → contradictory signals.
 */
function computeSignalAgreement(subScores: {
  github: number | null
  community: number | null
  jobs: number | null
  ecosystem: number | null
}): number {
  const scores = [
    subScores.github,
    subScores.community,
    subScores.jobs,
    subScores.ecosystem,
  ].filter((s): s is number => s !== null)

  // Can't compute agreement with fewer than 2 scores
  if (scores.length < 2) return 50 // neutral — no evidence of disagreement

  const scoreMean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance =
    scores.reduce((sum, s) => sum + (s - scoreMean) ** 2, 0) / scores.length
  const stdDev = Math.sqrt(variance)

  // High std dev = disagreement. 20+ std dev = major contradiction.
  // Scale: 0 std dev → 100 agreement, 30+ std dev → 0 agreement
  return Math.max(0, Math.min(100, 100 - stdDev * 3))
}

function gradeFromScore(score: number): ConfidenceGrade {
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 50) return 'C'
  if (score >= 30) return 'D'
  return 'F'
}

/**
 * Get a human-readable label for a confidence grade.
 */
export function getConfidenceLabel(grade: ConfidenceGrade): string {
  switch (grade) {
    case 'A': return 'High confidence'
    case 'B': return 'Good confidence'
    case 'C': return 'Moderate confidence'
    case 'D': return 'Low confidence'
    case 'F': return 'Very low confidence'
  }
}

/**
 * Get a description for showing in tooltips / detail views.
 */
export function getConfidenceDescription(breakdown: ConfidenceBreakdown): string {
  const parts: string[] = []

  if (breakdown.sourceCoverage >= 80) {
    parts.push('strong source coverage')
  } else if (breakdown.sourceCoverage < 40) {
    parts.push('limited sources')
  }

  if (breakdown.historicalDepth >= 80) {
    parts.push(`solid history`)
  } else if (breakdown.historicalDepth < 40) {
    parts.push('short history')
  }

  if (breakdown.signalAgreement >= 80) {
    parts.push('signals agree')
  } else if (breakdown.signalAgreement < 40) {
    parts.push('contradictory signals')
  }

  if (parts.length === 0) return 'Moderate data quality'
  return parts.join(' · ')
}
