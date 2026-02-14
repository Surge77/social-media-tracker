/**
 * Rate limiting for public-facing AI endpoints.
 *
 * Uses Supabase `check_rate_limit` RPC for distributed tracking
 * across Vercel serverless instances. Fails open on errors.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  identifier: 'ip' | 'user' | 'session'
}

const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  '/api/ai/ask': {
    windowMs: 60_000,
    maxRequests: 5,
    identifier: 'ip',
  },
  '/api/ai/compare': {
    windowMs: 60_000,
    maxRequests: 10,
    identifier: 'ip',
  },
  '/api/ai/insights': {
    windowMs: 60_000,
    maxRequests: 30,
    identifier: 'ip',
  },
  '/api/ai/feedback': {
    windowMs: 60_000,
    maxRequests: 20,
    identifier: 'ip',
  },
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: string
}

export async function checkRateLimit(
  endpoint: string,
  identifier: string,
  supabase: SupabaseClient
): Promise<RateLimitResult> {
  const config = ENDPOINT_LIMITS[endpoint]
  if (!config) return { allowed: true, remaining: Infinity, resetAt: '' }

  const windowStart = new Date(
    Math.floor(Date.now() / config.windowMs) * config.windowMs
  ).toISOString()

  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_window_start: windowStart,
      p_max_requests: config.maxRequests,
    })

    if (error) {
      // Fail open — allow the request but log the error
      console.error('[RateLimit] Check failed, failing open:', error)
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: windowStart,
      }
    }

    const resetAt = new Date(
      Math.floor(Date.now() / config.windowMs) * config.windowMs +
        config.windowMs
    ).toISOString()

    return {
      allowed: data.allowed,
      remaining: Math.max(0, config.maxRequests - data.request_count),
      resetAt,
    }
  } catch {
    // Fail open on unexpected errors
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: windowStart,
    }
  }
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt,
  }
}
