import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => mockSupabase,
}))

vi.mock('@/lib/scoring/pipeline', () => ({
  runScoringPipeline: vi.fn().mockResolvedValue({ scored: 42, errors: [] }),
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
    insert: vi.fn().mockResolvedValue({ error: null }),
    upsert: vi.fn().mockResolvedValue({ error: null }),
    single: () => Promise.resolve({ data, error: null }),
    maybeSingle: () => Promise.resolve({ data, error: null }),
    then: (resolve: (v: unknown) => unknown) =>
      Promise.resolve({ data, error: null }).then(resolve),
  }
  return self
}

function makeSupabase() {
  return {
    from: (table: string) => {
      if (table === 'daily_scores') return makeChain([])
      if (table === 'technologies') return makeChain([])
      if (table === 'fetch_logs') {
        const chain = makeChain(null)
        ;(chain as any).insert = vi.fn().mockResolvedValue({ error: null })
        return chain
      }
      return makeChain(null)
    },
  }
}

// ─── Import after mocks ─────────────────────────────────────────────────────

import { GET } from '@/app/api/cron/fetch-daily/batch-scoring/route'
import { runScoringPipeline } from '@/lib/scoring/pipeline'

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('GET /api/cron/fetch-daily/batch-scoring', () => {
  beforeEach(() => {
    mockSupabase = makeSupabase()
    vi.clearAllMocks()
    vi.mocked(runScoringPipeline).mockResolvedValue({ scored: 42, errors: [] })
    // Not in production mode — no auth check
    process.env.VERCEL_ENV = 'development'
  })

  it('calls runScoringPipeline when authorized (dev mode, no auth check)', async () => {
    const res = await GET(new Request('http://localhost/api/cron/fetch-daily/batch-scoring') as any)
    expect(res.status).toBe(200)
    expect(runScoringPipeline).toHaveBeenCalledOnce()
  })

  it('returns success shape with scored count', async () => {
    const res = await GET(new Request('http://localhost/api/cron/fetch-daily/batch-scoring') as any)
    const body = await res.json() as Record<string, unknown>
    expect(body.success).toBe(true)
    expect(body.scored).toBe(42)
    expect(body.batch).toBe('scoring')
  })

  it('returns error response when runScoringPipeline throws', async () => {
    vi.mocked(runScoringPipeline).mockRejectedValue(new Error('Pipeline exploded'))
    const res = await GET(new Request('http://localhost/api/cron/fetch-daily/batch-scoring') as any)
    expect(res.status).toBe(500)
    const body = await res.json() as Record<string, unknown>
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/Pipeline exploded/i)
  })

  it('returns 401 in production without proper auth headers', async () => {
    process.env.VERCEL_ENV = 'production'
    process.env.CRON_SECRET = 'my-secret'
    const res = await GET(new Request('http://localhost/api/cron/fetch-daily/batch-scoring') as any)
    expect(res.status).toBe(401)
    delete process.env.VERCEL_ENV
  })

  it('succeeds in production with correct x-internal-cron header', async () => {
    process.env.VERCEL_ENV = 'production'
    process.env.CRON_SECRET = 'my-secret'
    const res = await GET(
      new Request('http://localhost/api/cron/fetch-daily/batch-scoring', {
        headers: { 'x-internal-cron': 'my-secret' },
      }) as any
    )
    expect(res.status).toBe(200)
    delete process.env.VERCEL_ENV
  })

  it('succeeds in production with bearer auth', async () => {
    process.env.VERCEL_ENV = 'production'
    process.env.CRON_SECRET = 'my-secret'
    const res = await GET(
      new Request('http://localhost/api/cron/fetch-daily/batch-scoring', {
        headers: { authorization: 'Bearer my-secret' },
      }) as any
    )
    expect(res.status).toBe(200)
    delete process.env.VERCEL_ENV
  })
})
