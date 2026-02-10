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
