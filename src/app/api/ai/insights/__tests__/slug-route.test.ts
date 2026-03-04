import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => mockSupabase,
}))

vi.mock('@/lib/ai/resilient-call', () => ({
  resilientAICall: vi.fn().mockResolvedValue({
    summary: 'React is a popular frontend library.',
    outlook: 'Strong continued growth expected.',
    strengths: ['Large ecosystem'],
    weaknesses: ['JSX learning curve'],
    recommendation: 'Recommended',
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
  getInsightWithFreshness: vi.fn().mockResolvedValue({ freshness: 'miss', data: null, age: null }),
  computeDataHash: vi.fn().mockReturnValue('hash-abc'),
  queueRegeneration: vi.fn(),
}))

vi.mock('@/lib/ai/key-manager', () => ({
  createKeyManager: vi.fn().mockReturnValue({}),
}))

vi.mock('@/lib/ai/quality-monitor', () => ({
  checkInsightQuality: vi.fn().mockReturnValue({ passed: true, score: 90, checks: {} }),
}))

// ─── Supabase mock ──────────────────────────────────────────────────────────

let mockSupabase: ReturnType<typeof makeSupabase>

const techRow = {
  id: 'uuid-react',
  name: 'React',
  slug: 'react',
  category: 'frontend',
  description: 'A JS library',
}

const scoreRow = {
  technology_id: 'uuid-react',
  composite_score: 75,
  github_score: 80,
  community_score: 85,
  jobs_score: 70,
  ecosystem_score: 72,
  momentum: 3,
  raw_sub_scores: { confidence: { overall: 75, sourceCoverage: 80, signalAgreement: 70, grade: 'B' } },
}

function makeChain(data: unknown) {
  const self: Record<string, unknown> = {
    select: () => self,
    eq: () => self,
    neq: () => self,
    order: () => self,
    limit: () => self,
    gte: () => self,
    in: () => self,
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

function makeSupabase(opts: { tech?: unknown; score?: unknown } = {}) {
  const tech = opts.tech !== undefined ? opts.tech : techRow
  const score = opts.score !== undefined ? opts.score : scoreRow
  const callCounts: Record<string, number> = {}

  return {
    from: (table: string) => {
      callCounts[table] = (callCounts[table] ?? 0) + 1
      const n = callCounts[table]

      if (table === 'technologies') {
        // n=1: tech lookup (single); n=2: category peers lookup (list)
        if (n === 1) return makeChain(tech)
        return makeChain([{ id: 'uuid-react', name: 'React', category: 'frontend' }])
      }

      if (table === 'daily_scores') {
        // n=1: latest score (.single()); n=2: peers list (.then())
        if (n === 1) return makeChain(score)
        return makeChain([scoreRow])
      }

      if (table === 'ai_insights') return makeChain(null)
      if (table === 'momentum_analysis') return makeChain(null)

      return makeChain(null)
    },
    rpc: vi.fn().mockResolvedValue({ error: null }),
  }
}

// ─── Import after mocks ─────────────────────────────────────────────────────

import { GET } from '@/app/api/ai/insights/[slug]/route'
import { checkRateLimit } from '@/lib/ai/rate-limiter'
import { getInsightWithFreshness } from '@/lib/ai/cache-strategy'

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/ai/insights/[slug]', () => {
  beforeEach(() => {
    mockSupabase = makeSupabase()
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, remaining: 10, resetAt: Date.now() + 60000 } as any)
    vi.mocked(getInsightWithFreshness).mockResolvedValue({ freshness: 'miss', data: null, age: null } as any)
  })

  it('returns 404 when tech not found', async () => {
    mockSupabase = makeSupabase({ tech: null })
    const res = await GET(
      new Request('http://localhost/api/ai/insights/unknown') as any,
      { params: Promise.resolve({ slug: 'unknown' }) }
    )
    expect(res.status).toBe(404)
    const body = await res.json() as Record<string, unknown>
    expect(body.error).toMatch(/not found/i)
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() + 60000 } as any)
    const res = await GET(
      new Request('http://localhost/api/ai/insights/react') as any,
      { params: Promise.resolve({ slug: 'react' }) }
    )
    expect(res.status).toBe(429)
  })

  it('returns cached insight when cache is fresh', async () => {
    const cachedInsight = { summary: 'Cached', outlook: 'Good', strengths: [], weaknesses: [], recommendation: 'Yes' }
    vi.mocked(getInsightWithFreshness).mockResolvedValue({ freshness: 'fresh', data: cachedInsight, age: 1 } as any)

    const res = await GET(
      new Request('http://localhost/api/ai/insights/react') as any,
      { params: Promise.resolve({ slug: 'react' }) }
    )
    expect(res.status).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(body.cached).toBe(true)
    expect(body.insight).toMatchObject(cachedInsight)
  })

  it('generates insight and returns it when cache miss', async () => {
    const res = await GET(
      new Request('http://localhost/api/ai/insights/react') as any,
      { params: Promise.resolve({ slug: 'react' }) }
    )
    expect(res.status).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(body.cached).toBe(false)
    expect(body.insight).toBeDefined()
  })
})
