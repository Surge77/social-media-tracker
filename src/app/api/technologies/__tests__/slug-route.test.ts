import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Module mocks ---

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => mockSupabase,
}))

vi.mock('@/lib/scoring/scoring-date', () => ({
  getCanonicalScoringDate: vi.fn().mockResolvedValue({ scoringDate: '2026-01-15' }),
  getTargetDateDaysAgo: vi.fn().mockReturnValue('2025-10-17'),
}))

vi.mock('@/lib/insights', () => ({
  computeDecisionSummary: vi.fn().mockReturnValue({
    verdict: 'Strong',
    headline: 'Solid choice',
    points: [],
  }),
  computeWhatChanged: vi.fn().mockReturnValue([]),
}))

// --- Supabase mock ---

let mockSupabase: ReturnType<typeof makeSupabaseMock>

/**
 * Build a chainable Supabase mock where .from(table) returns different data
 * based on the table name and call order.
 *
 * Call order for daily_scores:
 *   #1 → currentScoresQuery  (resolved via .maybeSingle())
 *   #2 → chartQuery          (resolved via awaiting the chain directly)
 *   #3 → allScoresOnDate     (resolved via awaiting the chain, only if scores != null)
 *   #4 → relatedScores       (resolved via awaiting the chain, only if related.length > 0)
 */
function makeSupabaseMock(options: {
  tech?: Record<string, unknown> | null
  scores?: Record<string, unknown> | null
  signals?: Record<string, unknown>[]
  related?: Record<string, unknown>[]
  allScores?: Record<string, unknown>[]
} = {}) {
  const { tech = null, scores = null, signals = [], related = [], allScores = [] } = options
  const callCounts: Record<string, number> = {}

  function makeChain(data: unknown) {
    const self: Record<string, unknown> = {
      select: () => self,
      eq: () => self,
      neq: () => self,
      order: () => self,
      limit: () => self,
      gte: () => self,
      lte: () => self,
      not: () => self,
      in: () => self,
      gt: () => self,
      single: () =>
        Promise.resolve({
          data,
          error: data === null ? { message: 'not found', code: 'PGRST116' } : null,
        }),
      maybeSingle: () => Promise.resolve({ data, error: null }),
      then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
        Promise.resolve({ data, error: null }).then(resolve, reject),
    }
    return self
  }

  return {
    from: (table: string) => {
      callCounts[table] = (callCounts[table] ?? 0) + 1
      const n = callCounts[table]

      if (table === 'technologies') {
        return makeChain(n === 1 ? tech : related)
      }

      if (table === 'daily_scores') {
        if (n === 1) return makeChain(scores)       // currentScoresQuery → maybeSingle
        if (n === 2) return makeChain([])            // chartQuery → direct await
        if (n === 3) return makeChain(allScores)     // allScoresOnDate → direct await
        return makeChain([])                         // relatedScores → direct await
      }

      if (table === 'data_points_latest') return makeChain(signals)
      if (table === 'data_points') return makeChain([])

      return makeChain(null)
    },
  }
}

// --- Tech fixture for Supabase rows ---

const techRow = {
  id: 'uuid-react',
  slug: 'react',
  name: 'React',
  description: 'A JS library for building UIs',
  category: 'frontend',
  ecosystem: null,
  color: '#61DAFB',
  website_url: null,
  github_repo: null,
  npm_package: null,
  stackoverflow_tag: 'reactjs',
  first_appeared: 2013,
  maintained_by: 'Meta',
  is_active: true,
}

const scoresRow = {
  technology_id: 'uuid-react',
  score_date: '2026-01-15',
  composite_score: 75,
  github_score: 80,
  community_score: 85,
  jobs_score: 70,
  ecosystem_score: 72,
  onchain_score: null,
  momentum: 3,
  data_completeness: 0.9,
  raw_sub_scores: {},
}

// --- Import route handler ---

import { GET } from '@/app/api/technologies/[slug]/route'

// --- Tests ---

describe('GET /api/technologies/[slug]', () => {
  beforeEach(() => {
    mockSupabase = makeSupabaseMock()
  })

  describe('tech not found', () => {
    it('returns 404 when technology does not exist', async () => {
      mockSupabase = makeSupabaseMock({ tech: null })

      const response = await GET(
        new Request('http://localhost/api/technologies/unknown') as any,
        { params: Promise.resolve({ slug: 'unknown' }) }
      )

      expect(response.status).toBe(404)
      const body = await response.json() as Record<string, unknown>
      expect(body.error).toBe('Technology not found')
    })
  })

  describe('tech found with scores', () => {
    it('returns 200 with full response shape', async () => {
      const allScoresData = [
        { technology_id: 'uuid-react', composite_score: 75, github_score: 80, community_score: 85, jobs_score: 70, ecosystem_score: 72 },
      ]

      mockSupabase = makeSupabaseMock({
        tech: techRow,
        scores: scoresRow,
        signals: [],
        related: [],
        allScores: allScoresData,
      })

      const response = await GET(
        new Request('http://localhost/api/technologies/react') as any,
        { params: Promise.resolve({ slug: 'react' }) }
      )

      expect(response.status).toBe(200)

      const body = await response.json() as Record<string, unknown>

      // Technology shape
      expect(body.technology).toBeDefined()
      const technology = body.technology as Record<string, unknown>
      expect(technology.slug).toBe('react')
      expect(technology.name).toBe('React')
      expect(technology.category).toBe('frontend')

      // Scores shape
      expect(body.current_scores).toBeDefined()
      const scores = body.current_scores as Record<string, unknown>
      expect(scores.composite_score).toBe(75)
      expect(scores.momentum).toBe(3)

      // Chart data (empty in this test — chart query returns [])
      expect(body.chart_data).toBeInstanceOf(Array)

      // Latest signals shape
      expect(body.latest_signals).toBeDefined()

      // Rank computed: only 1 tech in allScores with our ID → rank = 1
      expect(body.rank).toBe(1)
      expect(body.total_ranked).toBe(1)

      // Related techs empty
      expect(body.related_technologies).toBeInstanceOf(Array)
    })
  })

  describe('missing daily_scores', () => {
    it('returns 200 with null current_scores and null rank when no scores exist', async () => {
      mockSupabase = makeSupabaseMock({
        tech: techRow,
        scores: null,
        signals: [],
      })

      const response = await GET(
        new Request('http://localhost/api/technologies/react') as any,
        { params: Promise.resolve({ slug: 'react' }) }
      )

      expect(response.status).toBe(200)

      const body = await response.json() as Record<string, unknown>

      expect(body.technology).toBeDefined()
      expect(body.current_scores).toBeNull()
      expect(body.rank).toBeNull()
      expect(body.total_ranked).toBeNull()
      expect(body.chart_data).toBeInstanceOf(Array)
    })
  })

  describe('latest signals', () => {
    it('includes youtube signals when yt_video_count data point is present', async () => {
      const signalsWithYoutube = [
        { source: 'youtube', metric: 'yt_video_count', value: 120, metadata: null },
        { source: 'youtube', metric: 'yt_total_views', value: 5000000, metadata: null },
        { source: 'youtube', metric: 'yt_avg_likes', value: 1200, metadata: null },
        { source: 'youtube', metric: 'yt_upload_velocity', value: 4, metadata: null },
      ]

      mockSupabase = makeSupabaseMock({
        tech: techRow,
        scores: null,
        signals: signalsWithYoutube,
      })

      const response = await GET(
        new Request('http://localhost/api/technologies/react') as any,
        { params: Promise.resolve({ slug: 'react' }) }
      )

      const body = await response.json() as Record<string, unknown>
      const signals = body.latest_signals as Record<string, unknown>
      const youtube = signals.youtube as Record<string, unknown> | null

      expect(youtube).not.toBeNull()
      expect(youtube!.videoCount30d).toBe(120)
      expect(youtube!.totalViews).toBe(5000000)
    })

    it('sets youtube to null when no yt_video_count data point', async () => {
      mockSupabase = makeSupabaseMock({ tech: techRow, scores: null, signals: [] })

      const response = await GET(
        new Request('http://localhost/api/technologies/react') as any,
        { params: Promise.resolve({ slug: 'react' }) }
      )

      const body = await response.json() as Record<string, unknown>
      const signals = body.latest_signals as Record<string, unknown>
      expect(signals.youtube).toBeNull()
    })
  })
})
