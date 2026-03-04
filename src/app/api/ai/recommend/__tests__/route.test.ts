import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => mockSupabase,
}))

vi.mock('@/lib/ai/resilient-call', () => ({
  resilientAICall: vi.fn().mockResolvedValue({
    recommendations: [
      { technology: 'typescript', reason: 'High demand in frontend jobs', score: 88 },
      { technology: 'react', reason: 'Most used frontend library', score: 85 },
    ],
    context: { goal: 'learning', focus: 'frontend', level: 'beginner' },
  }),
}))

vi.mock('@/lib/ai/rate-limiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 10, resetAt: Date.now() + 60000 }),
  rateLimitHeaders: vi.fn().mockReturnValue({}),
}))

vi.mock('@/lib/ai/key-manager', () => ({
  createKeyManager: vi.fn().mockReturnValue({}),
}))

// ─── Supabase mock ──────────────────────────────────────────────────────────

let mockSupabase: ReturnType<typeof makeSupabase>

function makeChain(data: unknown) {
  const self: Record<string, unknown> = {
    select: () => self,
    eq: () => self,
    in: () => self,
    order: () => self,
    limit: () => self,
    upsert: vi.fn().mockResolvedValue({ error: null }),
    single: () =>
      Promise.resolve({
        data,
        error: data === null ? { message: 'not found', code: 'PGRST116' } : null,
      }),
    maybeSingle: () => Promise.resolve({ data, error: null }),
    then: (resolve: (v: unknown) => unknown) =>
      Promise.resolve({ data, error: null }).then(resolve),
  }
  return self
}

function makeSupabase(opts: { cached?: boolean } = {}) {
  const cacheData = opts.cached
    ? {
        insight_data: {
          recommendations: [{ technology: 'react', reason: 'cached', score: 80 }],
          context: {},
        },
        generated_at: new Date().toISOString(),
      }
    : null

  return {
    from: (table: string) => {
      if (table === 'ai_insights') return makeChain(cacheData)
      return makeChain(null)
    },
  }
}

// ─── Import after mocks ─────────────────────────────────────────────────────

import { GET } from '@/app/api/ai/recommend/route'
import { checkRateLimit } from '@/lib/ai/rate-limiter'

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/ai/recommend', () => {
  beforeEach(() => {
    mockSupabase = makeSupabase()
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, remaining: 10, resetAt: Date.now() + 60000 } as any)
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() + 60000 } as any)
    const res = await GET(new NextRequest('http://localhost/api/ai/recommend') as any)
    expect(res.status).toBe(429)
  })

  it('returns recommendation on success', async () => {
    const res = await GET(new NextRequest('http://localhost/api/ai/recommend?goal=learning&focus=frontend&level=beginner') as any)
    expect(res.status).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(body.recommendation).toBeDefined()
    expect(body.cached).toBe(false)
  })

  it('returns cached recommendation when cache is fresh', async () => {
    mockSupabase = makeSupabase({ cached: true })
    const res = await GET(new NextRequest('http://localhost/api/ai/recommend?goal=learning&focus=frontend&level=beginner') as any)
    expect(res.status).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(body.cached).toBe(true)
    expect(body.recommendation).toBeDefined()
  })

  it('accepts default params (no query string)', async () => {
    const res = await GET(new NextRequest('http://localhost/api/ai/recommend') as any)
    expect(res.status).toBe(200)
  })
})
