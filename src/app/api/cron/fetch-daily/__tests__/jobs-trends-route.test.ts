import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  fetchTechnologyGoogleTrendsSignal,
  rebuildJobsIntelligenceRollups,
} = vi.hoisted(() => ({
  fetchTechnologyGoogleTrendsSignal: vi.fn(),
  rebuildJobsIntelligenceRollups: vi.fn(),
}))

const upsertDataPoints = vi.fn()

const technologies = [
  { id: 'tech-1', name: 'React', slug: 'react', is_active: true },
  { id: 'tech-2', name: 'Next.js', slug: 'nextjs', is_active: true },
]

vi.mock('@/lib/api/serpapi-jobs', () => ({
  fetchTechnologyGoogleTrendsSignal,
}))

vi.mock('@/lib/jobs/intelligence', () => ({
  rebuildJobsIntelligenceRollups,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    from: (table: string) => {
      if (table === 'technologies') {
        const chain: Record<string, unknown> = {
          select: () => chain,
          eq: () => chain,
          limit: () => chain,
          then: (resolve: (value: unknown) => unknown) =>
            Promise.resolve({ data: technologies, error: null }).then(resolve),
        }
        return chain
      }

      if (table === 'data_points') {
        return {
          upsert: upsertDataPoints.mockResolvedValue({ error: null }),
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    },
  }),
}))

import { GET } from '@/app/api/cron/fetch-daily/jobs-trends/route'

describe('GET /api/cron/fetch-daily/jobs-trends', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.VERCEL_ENV
    delete process.env.CRON_SECRET
    delete process.env.JOBS_TRENDS_MAX_TECHS

    rebuildJobsIntelligenceRollups.mockResolvedValue({
      rebuilt: true,
      summaryRows: 1,
    })
  })

  it('returns partial success when one technology is rate limited', async () => {
    fetchTechnologyGoogleTrendsSignal
      .mockResolvedValueOnce({
        searchInterest: 72,
        searchVelocity: 4,
        searchAcceleration: 2,
        geoSpread: 9,
        relatedQueriesRisingCount: 3,
        raw: { ok: true },
      })
      .mockRejectedValueOnce(new Error('SerpApi Google Trends error 429'))

    const response = await GET(
      new Request('http://localhost/api/cron/fetch-daily/jobs-trends')
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.technologiesProcessed).toBe(2)
    expect(body.technologiesSucceeded).toBe(1)
    expect(body.technologiesFailed).toBe(1)
    expect(body.dataPointsCreated).toBe(5)
    expect(body.errors).toEqual(['nextjs: SerpApi Google Trends error 429'])
    expect(upsertDataPoints).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          technology_id: 'tech-1',
          source: 'googletrends',
          metric: 'interest_index',
          value: 72,
        }),
      ]),
      { onConflict: 'technology_id,source,metric,measured_at' }
    )
    expect(rebuildJobsIntelligenceRollups).toHaveBeenCalledOnce()
  })
})
