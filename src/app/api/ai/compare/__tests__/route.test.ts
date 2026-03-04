import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => mockSupabase,
}))

vi.mock('@/lib/ai/resilient-call', () => ({
  resilientAICall: vi.fn().mockResolvedValue({
    verdict: 'React is better for most use cases',
    dimensions: [],
    winner: 'react',
    summary: 'Comparison complete',
  }),
}))

vi.mock('@/lib/ai/rate-limiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 10, resetAt: Date.now() + 60000 }),
  rateLimitHeaders: vi.fn().mockReturnValue({}),
}))

vi.mock('@/lib/ai/telemetry', () => ({
  logTelemetry: vi.fn(),
}))

vi.mock('@/lib/ai/cache-strategy', () => ({
  comparisonCacheKey: vi.fn().mockReturnValue('react+vue'),
  computeDataHash: vi.fn().mockReturnValue('hash-xyz'),
  enforceComparisonCacheLimit: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/ai/key-manager', () => ({
  createKeyManager: vi.fn().mockReturnValue({}),
}))

// ─── Supabase mock ──────────────────────────────────────────────────────────

let mockSupabase: ReturnType<typeof makeSupabase>

const techs = [
  { id: 'uuid-react', name: 'React', slug: 'react', category: 'frontend', description: 'UI library' },
  { id: 'uuid-vue', name: 'Vue', slug: 'vue', category: 'frontend', description: 'Progressive framework' },
]

function makeChain(data: unknown) {
  const self: Record<string, unknown> = {
    select: () => self,
    eq: () => self,
    in: () => self,
    order: () => self,
    limit: () => self,
    gte: () => self,
    upsert: vi.fn().mockResolvedValue({ error: null }),
    rpc: vi.fn().mockResolvedValue({ error: null }),
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

function makeSupabase(opts: { techsData?: unknown } = {}) {
  const techsData = opts.techsData !== undefined ? opts.techsData : techs

  return {
    from: (table: string) => {
      if (table === 'technologies') return makeChain(techsData)
      if (table === 'ai_insights') return makeChain(null) // cache miss
      if (table === 'daily_scores') return makeChain({ composite_score: 70, raw_sub_scores: {} })
      if (table === 'momentum_analysis') return makeChain(null)
      return makeChain(null)
    },
    rpc: vi.fn().mockResolvedValue({ error: null }),
  }
}

// ─── Import after mocks ─────────────────────────────────────────────────────

import { GET } from '@/app/api/ai/compare/route'
import { checkRateLimit } from '@/lib/ai/rate-limiter'

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/ai/compare', () => {
  beforeEach(() => {
    mockSupabase = makeSupabase()
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, remaining: 10, resetAt: Date.now() + 60000 } as any)
  })

  it('returns 400 when slugs param is missing', async () => {
    const res = await GET(new NextRequest('http://localhost/api/ai/compare') as any)
    expect(res.status).toBe(400)
    const body = await res.json() as Record<string, unknown>
    expect(body.error).toMatch(/Missing slugs/i)
  })

  it('returns 400 when fewer than 2 slugs provided', async () => {
    const res = await GET(new NextRequest('http://localhost/api/ai/compare?slugs=react') as any)
    expect(res.status).toBe(400)
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() + 60000 } as any)
    const res = await GET(new NextRequest('http://localhost/api/ai/compare?slugs=react,vue') as any)
    expect(res.status).toBe(429)
  })

  it('returns 404 when technologies not found', async () => {
    mockSupabase = makeSupabase({ techsData: [] })
    const res = await GET(new NextRequest('http://localhost/api/ai/compare?slugs=react,vue') as any)
    expect(res.status).toBe(404)
  })

  it('returns comparison on success', async () => {
    const res = await GET(new NextRequest('http://localhost/api/ai/compare?slugs=react,vue') as any)
    expect(res.status).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(body.comparison).toBeDefined()
    expect(body.cached).toBe(false)
  })
})
