/**
 * Bayesian smoothing for low-data technologies.
 *
 * Pulls scores toward the global mean when data is sparse.
 * As dataPointCount grows past CONFIDENCE_THRESHOLD, the raw score dominates.
 */

const CONFIDENCE_THRESHOLD = 50

export function bayesianSmooth(
  rawScore: number,
  dataPointCount: number,
  globalMean: number
): number {
  return (
    (CONFIDENCE_THRESHOLD * globalMean + rawScore * dataPointCount) /
    (CONFIDENCE_THRESHOLD + dataPointCount)
  )
}
