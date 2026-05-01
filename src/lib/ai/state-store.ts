/**
 * Lightweight persistence for AI infrastructure state across serverless cold starts.
 *
 * Uses system_config as a key-value store with an in-memory cache (60s TTL)
 * so warm instances avoid DB reads on every request.
 *
 * All DB operations are wrapped in try-catch — DB failures must never
 * break AI calls.
 */

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const CACHE_TTL_MS = 60_000

interface CacheEntry {
  value: unknown
  expiresAt: number
}

const memCache = new Map<string, CacheEntry>()

export async function loadPersistedState<T>(key: string): Promise<T | null> {
  const hit = memCache.get(key)
  if (hit && hit.expiresAt > Date.now()) return hit.value as T

  try {
    const supabase = createSupabaseAdminClient()
    const { data } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', key)
      .single()

    const parsed = data?.value
      ? (JSON.parse(data.value as string) as T)
      : null

    memCache.set(key, { value: parsed, expiresAt: Date.now() + CACHE_TTL_MS })
    return parsed
  } catch {
    return null
  }
}

/** Fire-and-forget — does not block the caller. */
export function persistState(key: string, value: unknown): void {
  memCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })

  void (async () => {
    try {
      const supabase = createSupabaseAdminClient()
      await supabase
        .from('system_config')
        .upsert(
          { key, value: JSON.stringify(value) },
          { onConflict: 'key' }
        )
    } catch {
      // Silent — DB failures must never break AI calls
    }
  })()
}
