/**
 * A/B Testing Framework for Prompt Experimentation
 *
 * Allows running controlled experiments to compare prompt versions
 * with statistical significance testing
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface ABTest {
  id: string
  testKey: string
  promptKey: string
  variantA: {
    version: number
    promptId: string
  }
  variantB: {
    version: number
    promptId: string
  }
  metrics: {
    variantA: ABTestMetrics
    variantB: ABTestMetrics
  }
  status: 'running' | 'completed' | 'cancelled'
  winner: 'A' | 'B' | null
  confidence: number
  pValue: number | null
  startedAt: string
  completedAt: string | null
  targetSampleSize: number
}

export interface ABTestMetrics {
  samples: number
  avgQualityScore: number
  positiveRate: number
  avgLatencyMs: number
  errorRate: number
  feedbackCount: number
  positiveFeedback: number
}

export interface ABTestResult {
  variant: 'A' | 'B'
  promptId: string
  version: number
}

/**
 * Calculate chi-square test for categorical data (feedback: positive/negative)
 */
function chiSquareTest(
  aPositive: number,
  aNegative: number,
  bPositive: number,
  bNegative: number
): { pValue: number; significant: boolean } {
  const n = aPositive + aNegative + bPositive + bNegative

  if (n === 0) {
    return { pValue: 1, significant: false }
  }

  // Calculate expected values
  const rowA = aPositive + aNegative
  const rowB = bPositive + bNegative
  const colPos = aPositive + bPositive
  const colNeg = aNegative + bNegative

  const expectedAPos = (rowA * colPos) / n
  const expectedANeg = (rowA * colNeg) / n
  const expectedBPos = (rowB * colPos) / n
  const expectedBNeg = (rowB * colNeg) / n

  // Chi-square statistic
  const chiSquare =
    Math.pow(aPositive - expectedAPos, 2) / expectedAPos +
    Math.pow(aNegative - expectedANeg, 2) / expectedANeg +
    Math.pow(bPositive - expectedBPos, 2) / expectedBPos +
    Math.pow(bNegative - expectedBNeg, 2) / expectedBNeg

  // Degrees of freedom = 1 for 2x2 table
  // Approximate p-value using chi-square distribution
  // For df=1: critical value at p=0.01 is 6.635, at p=0.05 is 3.841
  // Check higher threshold first to avoid misclassifying p=0.01 as p=0.05
  const pValue = chiSquare > 6.635 ? 0.01 : chiSquare > 3.841 ? 0.05 : 0.1

  return { pValue, significant: pValue < 0.05 }
}

/**
 * Calculate t-test for continuous data (quality scores)
 */
function tTest(
  samplesA: number[],
  samplesB: number[]
): { pValue: number; significant: boolean } {
  if (samplesA.length === 0 || samplesB.length === 0) {
    return { pValue: 1, significant: false }
  }

  const meanA = samplesA.reduce((a, b) => a + b, 0) / samplesA.length
  const meanB = samplesB.reduce((a, b) => a + b, 0) / samplesB.length

  const varianceA =
    samplesA.reduce((sum, x) => sum + Math.pow(x - meanA, 2), 0) /
    (samplesA.length - 1)
  const varianceB =
    samplesB.reduce((sum, x) => sum + Math.pow(x - meanB, 2), 0) /
    (samplesB.length - 1)

  const pooledSE = Math.sqrt(
    varianceA / samplesA.length + varianceB / samplesB.length
  )

  if (pooledSE === 0) {
    return { pValue: 1, significant: false }
  }

  const tStat = Math.abs(meanA - meanB) / pooledSE

  // Approximate p-value: t > 1.96 ≈ p < 0.05, t > 2.58 ≈ p < 0.01
  const pValue = tStat > 2.58 ? 0.01 : tStat > 1.96 ? 0.05 : 0.1

  return { pValue, significant: pValue < 0.05 }
}

/**
 * Analyze A/B test results and determine winner
 */
export function analyzeABTest(
  metricsA: ABTestMetrics,
  metricsB: ABTestMetrics
): {
  winner: 'A' | 'B' | null
  confidence: number
  pValue: number
  reason: string
} {
  // Need minimum sample size
  const minSamples = 30
  if (metricsA.samples < minSamples || metricsB.samples < minSamples) {
    return {
      winner: null,
      confidence: 0,
      pValue: 1,
      reason: `Insufficient samples (need ${minSamples} per variant)`
    }
  }

  // Test 1: Positive feedback rate (chi-square test)
  const feedbackTest = chiSquareTest(
    metricsA.positiveFeedback,
    metricsA.feedbackCount - metricsA.positiveFeedback,
    metricsB.positiveFeedback,
    metricsB.feedbackCount - metricsB.positiveFeedback
  )

  // Test 2: Quality scores (simulated t-test - we use averages as proxy)
  const qualityDiff = Math.abs(metricsA.avgQualityScore - metricsB.avgQualityScore)
  const qualitySignificant = qualityDiff > 5 // 5 point difference is meaningful

  // Combined decision
  let winner: 'A' | 'B' | null = null
  let confidence = 0
  let reason = ''

  if (feedbackTest.significant || qualitySignificant) {
    // Determine winner based on multiple metrics
    let scoreA = 0
    let scoreB = 0

    // Positive rate (weight: 40%)
    if (metricsA.positiveRate > metricsB.positiveRate) scoreA += 40
    else scoreB += 40

    // Quality score (weight: 40%)
    if (metricsA.avgQualityScore > metricsB.avgQualityScore) scoreA += 40
    else scoreB += 40

    // Error rate (weight: 20%, lower is better)
    if (metricsA.errorRate < metricsB.errorRate) scoreA += 20
    else scoreB += 20

    winner = scoreA > scoreB ? 'A' : 'B'
    confidence = Math.max(scoreA, scoreB) / 100

    const metrics = winner === 'A' ? metricsA : metricsB
    reason = `Winner has ${(metrics.positiveRate * 100).toFixed(1)}% positive rate, ${metrics.avgQualityScore.toFixed(1)} quality score, ${(metrics.errorRate * 100).toFixed(1)}% error rate`
  } else {
    reason = 'No statistically significant difference detected'
  }

  return {
    winner,
    confidence,
    pValue: feedbackTest.pValue,
    reason
  }
}

/**
 * Create new A/B test
 */
export async function createABTest(
  supabase: SupabaseClient,
  promptKey: string,
  versionA: number,
  versionB: number,
  targetSampleSize = 100
): Promise<ABTest> {
  // Get prompt IDs for both versions
  const { data: promptA } = await supabase
    .from('prompt_versions')
    .select('id')
    .eq('prompt_key', promptKey)
    .eq('version', versionA)
    .single()

  const { data: promptB } = await supabase
    .from('prompt_versions')
    .select('id')
    .eq('prompt_key', promptKey)
    .eq('version', versionB)
    .single()

  if (!promptA || !promptB) {
    throw new Error('Invalid prompt versions')
  }

  // Create test record (stored in system_config for now)
  const testKey = `ab_test_${promptKey}_v${versionA}_v${versionB}_${Date.now()}`

  const test: ABTest = {
    id: testKey,
    testKey,
    promptKey,
    variantA: { version: versionA, promptId: promptA.id },
    variantB: { version: versionB, promptId: promptB.id },
    metrics: {
      variantA: {
        samples: 0,
        avgQualityScore: 0,
        positiveRate: 0,
        avgLatencyMs: 0,
        errorRate: 0,
        feedbackCount: 0,
        positiveFeedback: 0
      },
      variantB: {
        samples: 0,
        avgQualityScore: 0,
        positiveRate: 0,
        avgLatencyMs: 0,
        errorRate: 0,
        feedbackCount: 0,
        positiveFeedback: 0
      }
    },
    status: 'running',
    winner: null,
    confidence: 0,
    pValue: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    targetSampleSize
  }

  await supabase
    .from('system_config')
    .insert({
      config_key: testKey,
      config_value: test
    })

  return test
}

/**
 * Get active A/B test for a prompt
 */
export async function getActiveTest(
  supabase: SupabaseClient,
  promptKey: string
): Promise<ABTest | null> {
  const { data } = await supabase
    .from('system_config')
    .select('config_value')
    .like('config_key', `ab_test_${promptKey}%`)
    .single()

  if (!data) return null

  const test = data.config_value as ABTest
  if (test.status !== 'running') return null

  return test
}

/**
 * Record test result and update metrics
 */
export async function recordTestResult(
  supabase: SupabaseClient,
  testKey: string,
  variant: 'A' | 'B',
  metrics: {
    qualityScore: number
    latencyMs: number
    error: boolean
    positiveFeedback?: boolean
  }
): Promise<void> {
  const { data } = await supabase
    .from('system_config')
    .select('config_value')
    .eq('config_key', testKey)
    .single()

  if (!data) return

  const test = data.config_value as ABTest
  const variantMetrics = variant === 'A' ? test.metrics.variantA : test.metrics.variantB

  // Update metrics
  const n = variantMetrics.samples
  variantMetrics.samples++
  variantMetrics.avgQualityScore =
    (variantMetrics.avgQualityScore * n + metrics.qualityScore) / variantMetrics.samples
  variantMetrics.avgLatencyMs =
    (variantMetrics.avgLatencyMs * n + metrics.latencyMs) / variantMetrics.samples
  variantMetrics.errorRate =
    (variantMetrics.errorRate * n + (metrics.error ? 1 : 0)) / variantMetrics.samples

  if (metrics.positiveFeedback !== undefined) {
    variantMetrics.feedbackCount++
    if (metrics.positiveFeedback) {
      variantMetrics.positiveFeedback++
    }
    variantMetrics.positiveRate = variantMetrics.positiveFeedback / variantMetrics.feedbackCount
  }

  // Check if test should complete
  if (
    test.metrics.variantA.samples >= test.targetSampleSize &&
    test.metrics.variantB.samples >= test.targetSampleSize
  ) {
    const analysis = analyzeABTest(test.metrics.variantA, test.metrics.variantB)
    test.winner = analysis.winner
    test.confidence = analysis.confidence
    test.pValue = analysis.pValue
    test.status = 'completed'
    test.completedAt = new Date().toISOString()
  }

  // Save updated test
  await supabase
    .from('system_config')
    .update({ config_value: test })
    .eq('config_key', testKey)
}
