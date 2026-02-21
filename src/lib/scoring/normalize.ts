import { mean, standardDeviation } from 'simple-statistics'

/**
 * Z-score normalize an array of values.
 * Returns z-scores where 0 = average, +1 = one std dev above, etc.
 * Clamps output to [-3, +3] to prevent outlier distortion.
 */
export function zScoreNormalize(values: number[]): number[] {
  if (values.length === 0) return []
  const m = mean(values)
  const sd = standardDeviation(values)
  if (sd === 0) return values.map(() => 0)
  return values.map((v) => Math.max(-3, Math.min(3, (v - m) / sd)))
}

/**
 * Convert a z-score to 0-100 scale.
 * z = -3 → 0, z = 0 → 50, z = +3 → 100
 */
export function zScoreTo100(z: number): number {
  return Math.max(0, Math.min(100, ((z + 3) / 6) * 100))
}

/**
 * Min-Max normalize to 0-100 scale.
 * Used when z-score is overkill (e.g., sentiment already on 0-1 scale).
 */
export function minMaxNormalize(value: number, min: number, max: number): number {
  if (max === min) return 50
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}

/**
 * Percentile-rank normalization.
 *
 * Returns values on a 0–100 scale where each value represents its
 * position relative to all other values in the array.
 *
 * Unlike z-score (which clusters around 50), percentile ranks naturally
 * spread from 0 to 100 — the lowest value gets 0, the highest gets 100,
 * and every other value is proportionally in-between.
 *
 * Ties are handled by average rank so tied technologies share the same score.
 *
 * Edge cases:
 *   - Empty array  → []
 *   - Single value → [50]  (neutral, as if at median)
 *   - All same     → all 50 (no information, treat as neutral)
 */
export function percentileRankNormalize(values: number[]): number[] {
  if (values.length === 0) return []
  if (values.length === 1) return [50]

  const allSame = values.every((v) => v === values[0])
  if (allSame) return values.map(() => 50)

  // Pair each value with its original index, then sort ascending
  const sorted = values
    .map((v, i) => ({ value: v, index: i }))
    .sort((a, b) => a.value - b.value)

  const ranks = new Array<number>(values.length)
  let i = 0

  while (i < sorted.length) {
    let j = i
    // Find the end of the tie group
    while (j < sorted.length && sorted[j].value === sorted[i].value) j++
    // Average rank for ties (0-based), then map to 0-100
    const avgRank = (i + j - 1) / 2
    const percentile = (avgRank / (values.length - 1)) * 100
    for (let k = i; k < j; k++) {
      ranks[sorted[k].index] = Math.round(percentile * 100) / 100
    }
    i = j
  }

  return ranks
}
