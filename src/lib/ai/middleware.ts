/**
 * AI rate limiting middleware for API routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimitHeaders } from '@/lib/ai/rate-limiter'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function withAIRateLimit(
  req: NextRequest,
  endpoint: string,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const supabase = await createSupabaseServerClient()
  const result = await checkRateLimit(endpoint, ip, supabase)

  if (!result.allowed) {
    return NextResponse.json(
      {
        error:
          'Rate limit exceeded. Please wait before making more requests.',
      },
      { status: 429, headers: rateLimitHeaders(result) }
    )
  }

  const response = await handler()
  // Add rate limit headers to successful responses
  Object.entries(rateLimitHeaders(result)).forEach(([key, value]) => {
    response.headers.set(key, value as string)
  })
  return response
}

/** Extract client IP from request headers. */
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
