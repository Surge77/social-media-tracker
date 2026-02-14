/**
 * Stale cache handling and graceful degradation.
 *
 * Freshness tiers:
 * 1. FRESH (< 24h, data hash matches): Serve immediately.
 * 2. STALE (24h-72h, or hash mismatch): Serve with disclaimer. Regenerate in background.
 * 3. EXPIRED (> 72h): Serve template fallback with "AI analysis updating" note.
 * 4. NONE (never generated): Serve template fallback. Queue for generation.
 *
 * Key principle: NEVER show blank. Something is always better than nothing.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export type CacheFreshness = 'fresh' | 'stale' | 'expired' | 'none'

export interface CacheResult<T> {
  data: T | null
  freshness: CacheFreshness
  age: number | null // hours since generation
  shouldRegenerate: boolean
}

export async function getInsightWithFreshness<T>(
  technologyId: string,
  insightType: string,
  supabase: SupabaseClient,
  currentDataHash: string
): Promise<CacheResult<T>> {
  const { data: cached } = await supabase
    .from('ai_insights')
    .select('insight_data, generated_at, input_data_hash')
    .eq('technology_id', technologyId)
    .eq('insight_type', insightType)
    .single()

  if (!cached) {
    return {
      data: null,
      freshness: 'none',
      age: null,
      shouldRegenerate: true,
    }
  }

  const ageHours =
    (Date.now() - new Date(cached.generated_at).getTime()) / 3_600_000
  const hashMatches = cached.input_data_hash === currentDataHash

  if (ageHours < 24 && hashMatches) {
    return {
      data: cached.insight_data as T,
      freshness: 'fresh',
      age: ageHours,
      shouldRegenerate: false,
    }
  }

  if (ageHours < 72) {
    return {
      data: cached.insight_data as T,
      freshness: 'stale',
      age: ageHours,
      shouldRegenerate: true,
    }
  }

  // Expired but still return it — better than nothing
  return {
    data: cached.insight_data as T,
    freshness: 'expired',
    age: ageHours,
    shouldRegenerate: true,
  }
}

// ---- Background regeneration queue ----

const regenerationQueue = new Set<string>()

export function queueRegeneration(
  technologyId: string,
  insightType: string,
  regenerateFn: () => Promise<void>
): void {
  const key = `${technologyId}:${insightType}`
  if (regenerationQueue.has(key)) return // already queued
  regenerationQueue.add(key)

  regenerateFn()
    .catch((err) =>
      console.error(
        `[Cache] Background regeneration failed for ${key}:`,
        err
      )
    )
    .finally(() => regenerationQueue.delete(key))
}

// ---- Data hash computation ----

/**
 * Compute a simple hash of the input data for cache invalidation.
 * Uses a string-based hash — not cryptographic, just for change detection.
 */
export function computeDataHash(data: Record<string, unknown>): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return hash.toString(36)
}

// ---- Comparison cache helpers ----

export function comparisonCacheKey(slugs: string[]): string {
  return [...slugs].sort().join('+')
}

export async function enforceComparisonCacheLimit(
  supabase: SupabaseClient,
  maxCached: number = 500,
  evictionDays: number = 7
): Promise<void> {
  // Delete comparisons not accessed in evictionDays
  await supabase
    .from('ai_insights')
    .delete()
    .eq('insight_type', 'comparison')
    .lt(
      'last_accessed',
      new Date(
        Date.now() - evictionDays * 24 * 3_600_000
      ).toISOString()
    )

  // If still over limit, delete oldest by last_accessed
  const { count } = await supabase
    .from('ai_insights')
    .select('*', { count: 'exact', head: true })
    .eq('insight_type', 'comparison')

  if (count && count > maxCached) {
    const excess = count - maxCached
    const { data: oldest } = await supabase
      .from('ai_insights')
      .select('id')
      .eq('insight_type', 'comparison')
      .order('last_accessed', { ascending: true })
      .limit(excess)

    if (oldest?.length) {
      await supabase
        .from('ai_insights')
        .delete()
        .in(
          'id',
          oldest.map((r) => r.id)
        )
    }
  }
}
