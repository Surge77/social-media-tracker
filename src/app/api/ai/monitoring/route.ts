/**
 * GET /api/ai/monitoring
 *
 * Returns aggregated AI system health metrics
 */

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createKeyManager } from '@/lib/ai/key-manager'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const keyManager = createKeyManager()

  // Get telemetry data from last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: telemetry } = await supabase
    .from('ai_telemetry')
    .select('*')
    .gte('timestamp', twentyFourHoursAgo)

  // Calculate aggregate metrics
  const totalGenerations = telemetry?.filter(t => t.event === 'generation').length || 0
  const totalErrors = telemetry?.filter(t => t.event === 'error').length || 0
  const totalFallbacks = telemetry?.filter(t => t.metadata?.fallback === true).length || 0

  const qualityScores = telemetry
    ?.filter(t => t.quality_score !== null)
    .map(t => t.quality_score) || []

  const latencies = telemetry
    ?.filter(t => t.latency_ms !== null)
    .map(t => t.latency_ms) || []

  const avgQualityScore = qualityScores.length > 0
    ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
    : 0

  const avgLatencyMs = latencies.length > 0
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
    : 0

  // Get cache data (insights accessed vs generated)
  const { data: insights } = await supabase
    .from('ai_insights')
    .select('generated_at, last_accessed')
    .gte('generated_at', twentyFourHoursAgo)

  const cacheHits = insights?.filter(i =>
    i.last_accessed && i.last_accessed > i.generated_at
  ).length || 0

  const cacheTotal = insights?.length || 0
  const cacheHitRate = cacheTotal > 0 ? (cacheHits / cacheTotal) * 100 : 0

  // Get provider status from key manager
  const providerStats = keyManager.getStats()

  // Transform provider stats to match frontend interface
  const providerStatus = providerStats.map(p => ({
    name: p.provider,
    status: p.inCooldown ? 'down' : 'up',
    rpm: p.rpm,
    rpmLimit: p.rpmLimit,
    dailyUsage: p.dailyUsage,
    consecutiveFailures: p.consecutiveFailures,
    inCooldown: p.inCooldown
  }))

  // Calculate error and fallback rates
  const errorRate = totalGenerations > 0
    ? (totalErrors / (totalGenerations + totalErrors)) * 100
    : 0

  const fallbackRate = totalGenerations > 0
    ? (totalFallbacks / totalGenerations) * 100
    : 0

  // Get feedback data
  const { data: feedback } = await supabase
    .from('insight_feedback')
    .select('helpful')
    .gte('created_at', twentyFourHoursAgo)

  const positiveFeedback = feedback?.filter(f => f.helpful).length || 0
  const totalFeedback = feedback?.length || 0
  const positiveFeedbackRate = totalFeedback > 0
    ? (positiveFeedback / totalFeedback) * 100
    : 0

  // Estimate costs (simplified - $0.000001 per token for free tier monitoring)
  const totalTokensInput = telemetry?.reduce((sum, t) => sum + (t.token_input || 0), 0) || 0
  const totalTokensOutput = telemetry?.reduce((sum, t) => sum + (t.token_output || 0), 0) || 0
  const estimatedCost = (totalTokensInput + totalTokensOutput) * 0.000001

  // Identify alerts
  const alerts: string[] = []

  if (avgQualityScore > 0 && avgQualityScore < 60) {
    alerts.push('Quality score below 60 - review recent insights')
  }

  if (errorRate > 10) {
    alerts.push(`High error rate: ${errorRate.toFixed(1)}% - check provider health`)
  }

  if (fallbackRate > 20) {
    alerts.push(`High fallback rate: ${fallbackRate.toFixed(1)}% - primary providers struggling`)
  }

  if (estimatedCost > 5) {
    alerts.push(`Estimated cost today: $${estimatedCost.toFixed(2)} - approaching threshold`)
  }

  if (providerStatus.every(p => p.inCooldown)) {
    alerts.push('All providers in cooldown - system degraded')
  }

  // System health status
  const isHealthy = errorRate < 5 && avgQualityScore > 70 && providerStatus.some(p => !p.inCooldown)
  const status = isHealthy ? 'healthy' : (errorRate > 20 || providerStatus.every(p => p.inCooldown) ? 'degraded' : 'warning')

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    last24h: {
      totalGenerations,
      totalErrors,
      errorRate: Math.round(errorRate * 10) / 10,
      fallbackRate: Math.round(fallbackRate * 10) / 10,
      cacheHitRate: Math.round(cacheHitRate * 10) / 10,
      avgQualityScore: Math.round(avgQualityScore),
      avgLatencyMs: Math.round(avgLatencyMs),
      positiveFeedbackRate: Math.round(positiveFeedbackRate * 10) / 10,
      estimatedCost: Math.round(estimatedCost * 100) / 100
    },
    providers: providerStatus,
    alerts
  })
}
