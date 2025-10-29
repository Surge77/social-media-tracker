import { NextRequest } from 'next/server'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyGenerator: (req: NextRequest) => string
}

interface RateLimitResult {
  success: boolean
  retryAfter?: number
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = config.keyGenerator(request)
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Clean up expired entries
  for (const [storeKey, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(storeKey)
    }
  }

  const current = rateLimitStore.get(key)
  
  if (!current) {
    // First request in window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return { success: true }
  }

  if (current.resetTime < now) {
    // Window has expired, reset
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return { success: true }
  }

  if (current.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((current.resetTime - now) / 1000)
    return { success: false, retryAfter }
  }

  // Increment count
  current.count++
  return { success: true }
}

// Helper function to get client IP
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}