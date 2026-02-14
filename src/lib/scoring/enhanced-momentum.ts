/**
 * Enhanced momentum analysis with multi-window EMA,
 * acceleration detection, volatility, and trend classification.
 *
 * Replaces the simple `computeMomentum(today, 30DaysAgo)` delta
 * with a rich analysis that tells you *how* something is moving,
 * not just *that* it moved.
 */

// ---- Types ----

export type MomentumTrend =
  | 'accelerating'  // growing and speeding up
  | 'decelerating'  // growing but slowing down
  | 'stable'        // flat, minimal change
  | 'reversing'     // direction just flipped
  | 'volatile'      // high variance, no clear direction

export interface MomentumAnalysis {
  shortTerm: number    // 7-day EMA rate of change
  mediumTerm: number   // 30-day EMA rate of change
  longTerm: number     // 90-day EMA rate of change
  acceleration: number // 2nd derivative — is growth speeding up?
  volatility: number   // standard deviation of daily changes
  trend: MomentumTrend
  confidence: number   // 0-1 based on data availability
  streak: number       // consecutive days of same direction (negative = down streak)
}

// ---- EMA computation ----

/**
 * Compute Exponential Moving Average for a series of values.
 * EMA gives more weight to recent values, making it more responsive
 * than a simple moving average.
 */
function computeEMA(values: number[], window: number): number[] {
  if (values.length === 0) return []
  const k = 2 / (window + 1)
  const result: number[] = [values[0]]
  for (let i = 1; i < values.length; i++) {
    result.push(values[i] * k + result[i - 1] * (1 - k))
  }
  return result
}

// ---- Main analysis function ----

/**
 * Analyze momentum from a time series of daily scores.
 *
 * @param scores - Array of { date, score } sorted chronologically (oldest first)
 * @returns Full momentum analysis
 */
export function analyzeMomentum(
  scores: Array<{ date: string; score: number }>
): MomentumAnalysis {
  // Not enough data — return safe defaults
  if (scores.length < 3) {
    return {
      shortTerm: 0,
      mediumTerm: 0,
      longTerm: 0,
      acceleration: 0,
      volatility: 0,
      trend: 'stable',
      confidence: 0,
      streak: 0,
    }
  }

  const values = scores.map((s) => s.score)

  // Multi-window EMA
  const ema7 = computeEMA(values, 7)
  const ema30 = computeEMA(values, 30)
  const ema90 = computeEMA(values, Math.min(90, values.length))

  // Rate of change = latest EMA value - previous EMA value
  const shortTerm =
    ema7.length >= 2 ? ema7[ema7.length - 1] - ema7[ema7.length - 2] : 0
  const mediumTerm =
    ema30.length >= 2 ? ema30[ema30.length - 1] - ema30[ema30.length - 2] : 0
  const longTerm =
    ema90.length >= 2 ? ema90[ema90.length - 1] - ema90[ema90.length - 2] : 0

  // Acceleration = change in rate of change (short vs medium)
  const acceleration = shortTerm - mediumTerm

  // Volatility = standard deviation of daily deltas
  const deltas = values.slice(1).map((v, i) => v - values[i])
  let volatility = 0
  if (deltas.length > 0) {
    const deltaMean = deltas.reduce((a, b) => a + b, 0) / deltas.length
    volatility = Math.sqrt(
      deltas.reduce((sum, d) => sum + (d - deltaMean) ** 2, 0) / deltas.length
    )
  }

  // Streak: consecutive days moving in the same direction
  let streak = 0
  if (deltas.length > 0) {
    const lastDelta = deltas[deltas.length - 1]
    const lastSign = Math.sign(lastDelta)
    streak = 1
    for (let i = deltas.length - 2; i >= 0; i--) {
      if (Math.sign(deltas[i]) === lastSign && lastSign !== 0) {
        streak++
      } else {
        break
      }
    }
    // Negative streak for downward movement
    streak = streak * (lastSign || 1)
  }

  // Classify trend
  const trend = classifyTrend(shortTerm, mediumTerm, acceleration, volatility)

  // Confidence: more data points = higher confidence, caps at 60 days
  const confidence = Math.min(1, scores.length / 60)

  return {
    shortTerm: round(shortTerm, 3),
    mediumTerm: round(mediumTerm, 3),
    longTerm: round(longTerm, 3),
    acceleration: round(acceleration, 3),
    volatility: round(volatility, 3),
    trend,
    confidence: round(confidence, 2),
    streak,
  }
}

// ---- Trend classification ----

function classifyTrend(
  shortTerm: number,
  mediumTerm: number,
  acceleration: number,
  volatility: number
): MomentumTrend {
  // High volatility overrides everything — no clear direction
  if (volatility > 3) return 'volatile'

  // Direction just flipped (short-term vs medium-term disagree)
  if (
    Math.sign(shortTerm) !== Math.sign(mediumTerm) &&
    Math.abs(shortTerm) > 0.5 &&
    Math.abs(mediumTerm) > 0.5
  ) {
    return 'reversing'
  }

  // Accelerating: moving in a direction and speeding up
  if (Math.abs(shortTerm) > 0.3 && acceleration > 0.5) return 'accelerating'

  // Decelerating: moving in a direction but slowing down
  if (Math.abs(shortTerm) > 0.3 && acceleration < -0.5) return 'decelerating'

  // Stable: minimal movement
  return 'stable'
}

// ---- Legacy compatibility ----

/**
 * Backward-compatible momentum value for existing `daily_scores.momentum` column.
 * Returns a single number that represents the overall momentum direction and magnitude.
 * Range: approximately -100 to +100.
 */
export function computeLegacyMomentum(analysis: MomentumAnalysis): number {
  // Weighted blend of short + medium term, clamped to [-100, 100]
  const raw = analysis.shortTerm * 0.4 + analysis.mediumTerm * 0.6
  // Scale up for readability (EMA deltas are small numbers)
  const scaled = raw * 10
  return Math.max(-100, Math.min(100, Math.round(scaled * 100) / 100))
}

// ---- Utility ----

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
