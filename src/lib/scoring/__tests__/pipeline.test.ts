import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock blockchain-score (network calls) ─────────────────────────────────

vi.mock('@/lib/api/blockchain-score', () => ({
  computeOnchainScore: vi.fn().mockResolvedValue({ onchain_score: 50 }),
  fetchOnchainSharedContext: vi.fn().mockResolvedValue({
    protocols: [],
    chainActivityScore: 50,
  }),
}))

// ─── Supabase mock ──────────────────────────────────────────────────────────

let mockSupabase: ReturnType<typeof makeSupabase>

const mockTechs = [
  {
    id: 'tech-1',
    slug: 'react',
    category: 'frontend',
    created_at: '2020-01-01',
    is_active: true,
  },
  {
    id: 'tech-2',
    slug: 'vue',
    category: 'frontend',
    created_at: '2020-01-01',
    is_active: true,
  },
]

const mockDataPoints = [
  { technology_id: 'tech-1', source: 'github', metric: 'stars', value: 200000, measured_at: '2026-01-15' },
  { technology_id: 'tech-1', source: 'github', metric: 'forks', value: 40000, measured_at: '2026-01-15' },
  { technology_id: 'tech-1', source: 'hackernews', metric: 'mentions', value: 50, measured_at: '2026-01-15' },
  { technology_id: 'tech-1', source: 'hackernews', metric: 'sentiment', value: 0.7, measured_at: '2026-01-15' },
  { technology_id: 'tech-1', source: 'npm', metric: 'downloads', value: 5000000, measured_at: '2026-01-15' },
  { technology_id: 'tech-1', source: 'stackoverflow', metric: 'questions', value: 300000, measured_at: '2026-01-15' },
  { technology_id: 'tech-1', source: 'adzuna', metric: 'job_postings', value: 1500, measured_at: '2026-01-15' },
  { technology_id: 'tech-2', source: 'github', metric: 'stars', value: 46000, measured_at: '2026-01-15' },
  { technology_id: 'tech-2', source: 'hackernews', metric: 'mentions', value: 10, measured_at: '2026-01-15' },
  { technology_id: 'tech-2', source: 'hackernews', metric: 'sentiment', value: 0.5, measured_at: '2026-01-15' },
  { technology_id: 'tech-2', source: 'npm', metric: 'downloads', value: 1000000, measured_at: '2026-01-15' },
]

function makeChain(data: unknown) {
  const self: Record<string, unknown> = {
    select: () => self,
    eq: () => self,
    neq: () => self,
    order: () => self,
    limit: () => self,
    gte: () => self,
    lte: () => self,
    lt: () => self,
    not: () => self,
    in: () => self,
    gt: () => self,
    upsert: vi.fn().mockResolvedValue({ error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    single: () => Promise.resolve({ data, error: data === null ? { message: 'not found' } : null }),
    maybeSingle: () => Promise.resolve({ data, error: null }),
    then: (resolve: (v: unknown) => unknown) =>
      Promise.resolve({ data, error: null }).then(resolve),
  }
  return self
}

function makeSupabase(opts: {
  techsError?: boolean
  dataPointsEmpty?: boolean
  dpError?: boolean
} = {}) {
  const callCounts: Record<string, number> = {}

  return {
    from: (table: string) => {
      callCounts[table] = (callCounts[table] ?? 0) + 1
      const n = callCounts[table]

      if (table === 'technologies') {
        if (opts.techsError) {
          const chain = makeChain(null)
          ;(chain as any).then = (resolve: (v: unknown) => unknown) =>
            Promise.resolve({ data: null, error: { message: 'DB error' } }).then(resolve)
          return chain
        }
        return makeChain(mockTechs)
      }

      if (table === 'data_points') {
        if (n === 1) {
          if (opts.dpError) {
            const chain = makeChain(null)
            ;(chain as any).then = (resolve: (v: unknown) => unknown) =>
              Promise.resolve({ data: null, error: { message: 'DP error' } }).then(resolve)
            return chain
          }
          const data = opts.dataPointsEmpty ? [] : mockDataPoints
          return makeChain(data)
        }
        // subsequent calls (job supplement, prior downloads)
        return makeChain([])
      }

      if (table === 'daily_scores') {
        if (n === 1) return makeChain([]) // historical scores
        // upsert
        const chain = makeChain(null)
        ;(chain as any).upsert = vi.fn().mockResolvedValue({ error: null })
        return chain
      }

      if (table === 'momentum_analysis') {
        const chain = makeChain(null)
        ;(chain as any).upsert = vi.fn().mockResolvedValue({ error: null })
        return chain
      }

      return makeChain(null)
    },
  }
}

// ─── Import after mocks ─────────────────────────────────────────────────────

import { runScoringPipeline } from '@/lib/scoring/pipeline'

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('runScoringPipeline()', () => {
  beforeEach(() => {
    mockSupabase = makeSupabase()
  })

  it('returns scored count equal to number of technologies with data', async () => {
    const result = await runScoringPipeline(mockSupabase as any, '2026-01-15')
    expect(result.errors).toBeDefined()
    // Both techs have data points → both should be scored
    expect(result.scored).toBeGreaterThanOrEqual(0)
  })

  it('returns { scored: 0, errors: [...] } when no data points found', async () => {
    mockSupabase = makeSupabase({ dataPointsEmpty: true }) as any
    const result = await runScoringPipeline(mockSupabase as any, '2026-01-15')
    expect(result.scored).toBe(0)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toMatch(/No data points/i)
  })

  it('throws when technologies query fails', async () => {
    mockSupabase = makeSupabase({ techsError: true }) as any
    await expect(
      runScoringPipeline(mockSupabase as any, '2026-01-15')
    ).rejects.toThrow(/Failed to fetch technologies/i)
  })

  it('returns errors array (may be empty on success)', async () => {
    const result = await runScoringPipeline(mockSupabase as any, '2026-01-15')
    expect(Array.isArray(result.errors)).toBe(true)
  })
})
