/**
 * GET /api/ai/health
 *
 * Returns AI system health status — provider availability, metrics, alerts.
 */

import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createKeyManager } from '@/lib/ai/key-manager'

export async function GET() {
  const keyManager = createKeyManager()
  const supabase = createSupabaseAdminClient()

  const providerStats = keyManager.getStats()

  // Fetch last 24h metrics from telemetry
  const oneDayAgo = new Date(Date.now() - 24 * 3_600_000).toISOString()

  const { data: telemetry } = await supabase
    .from('ai_telemetry')
    .select('event, latency_ms, quality_score')
    .gte('timestamp', oneDayAgo)

  const events = telemetry ?? []
  const generations = events.filter((e) => e.event === 'generation')
  const cacheHits = events.filter((e) => e.event === 'cache_hit')
  const qualityFails = events.filter((e) => e.event === 'quality_fail')
  const errors = events.filter((e) => e.event === 'error')

  const totalRequests = generations.length + cacheHits.length
  const cacheHitRate =
    totalRequests > 0
      ? Math.round((cacheHits.length / totalRequests) * 100)
      : 0

  const avgLatency =
    generations.length > 0
      ? Math.round(
          generations.reduce((sum, e) => sum + (e.latency_ms ?? 0), 0) /
            generations.length
        )
      : 0

  const avgQuality =
    generations.length > 0
      ? Math.round(
          generations.reduce(
            (sum, e) => sum + (e.quality_score ?? 0),
            0
          ) / generations.length
        )
      : 0

  const fallbackRate =
    generations.length > 0
      ? Math.round(
          (qualityFails.length / generations.length) * 100
        )
      : 0

  const errorRate =
    totalRequests > 0
      ? Math.round((errors.length / totalRequests) * 100)
      : 0

  // Determine overall status
  const anyProviderUp = providerStats.some((p) => !p.inCooldown)
  const highErrorRate = errorRate > 20
  const status = !anyProviderUp
    ? 'down'
    : highErrorRate
      ? 'degraded'
      : 'healthy'

  const alerts: string[] = []
  if (!anyProviderUp) alerts.push('All AI providers are in cooldown')
  if (highErrorRate) alerts.push(`Error rate is ${errorRate}%`)
  if (fallbackRate > 20)
    alerts.push(`Quality failure rate is ${fallbackRate}%`)
  if (avgQuality > 0 && avgQuality < 60)
    alerts.push(`Average quality score is low (${avgQuality})`)

  return NextResponse.json({
    status,
    providers: providerStats.map((p) => ({
      name: p.provider,
      status: p.inCooldown
        ? 'circuit_open'
        : p.consecutiveFailures > 0
          ? 'degraded'
          : 'up',
      rpm: p.rpm,
      rpmLimit: p.rpmLimit,
      dailyUsage: p.dailyUsage,
      consecutiveFailures: p.consecutiveFailures,
    })),
    last24h: {
      totalGenerations: generations.length,
      cacheHitRate,
      avgQualityScore: avgQuality,
      avgLatencyMs: avgLatency,
      fallbackRate,
      errorRate,
    },
    alerts,
  })
}
