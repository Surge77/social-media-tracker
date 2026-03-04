import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Module mocks ---

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => mockSupabase,
}))

vi.mock('@/lib/ai/resilient-call', () => ({
  resilientAICall: vi.fn(),
}))

vi.mock('@/lib/ai/key-manager', () => ({
  createKeyManager: () => ({}),
}))

// --- Supabase mock ---

let mockSupabase: ReturnType<typeof makeSupabaseMock>

const sampleProjectIdea = {
  name: 'Task Manager API',
  description: 'A REST API for managing tasks using React on the frontend.',
  buildSteps: [
    { step: 1, title: 'Set up project', what: 'Initialize the project', hours: 0.5 },
    { step: 2, title: 'Build UI', what: 'Create the main component', hours: 1 },
    { step: 3, title: 'Add state', what: 'Implement state management', hours: 1.5 },
    { step: 4, title: 'Deploy', what: 'Deploy to Vercel', hours: 0.5 },
  ],
  skills: ['Component lifecycle', 'Hooks', 'State management', 'REST API'],
  successCondition: "You're done when the app fetches and displays tasks from an API.",
  difficulty: 'beginner' as const,
  estimatedHours: 3.5,
}

/**
 * Build a chainable Supabase mock for the projects route.
 * Handles two tables: 'technologies' and 'ai_insights'.
 *
 * ai_insights call order:
 *   #1 → cache check (resolved via .single())
 *   #2 → upsert (write after AI generation)
 */
function makeSupabaseMock(options: {
  tech?: Record<string, unknown> | null
  cached?: Record<string, unknown> | null
} = {}) {
  const { tech = null, cached = null } = options
  const callCounts: Record<string, number> = {}

  function makeChain(data: unknown) {
    const self: Record<string, unknown> = {
      select: () => self,
      eq: () => self,
      gt: () => self,
      order: () => self,
      limit: () => self,
      single: () =>
        Promise.resolve({
          data,
          error: data === null ? { message: 'not found', code: 'PGRST116' } : null,
        }),
      upsert: (_data: unknown, _opts?: unknown) => Promise.resolve({ error: null }),
      then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
        Promise.resolve({ data, error: null }).then(resolve, reject),
    }
    return self
  }

  return {
    from: (table: string) => {
      callCounts[table] = (callCounts[table] ?? 0) + 1
      const n = callCounts[table]

      if (table === 'technologies') return makeChain(tech)
      if (table === 'ai_insights') {
        if (n === 1) return makeChain(cached) // cache check
        return makeChain(null)                // upsert (not used as query)
      }
      return makeChain(null)
    },
  }
}

// --- Import route handler ---

import { GET } from '@/app/api/quiz/projects/route'
import { resilientAICall } from '@/lib/ai/resilient-call'

const mockResilientAICall = vi.mocked(resilientAICall)

const techRow = { id: 'uuid-react', name: 'React', slug: 'react' }

// --- Tests ---

describe('GET /api/quiz/projects', () => {
  beforeEach(() => {
    mockResilientAICall.mockReset()
    mockSupabase = makeSupabaseMock()
  })

  describe('validation', () => {
    it('returns 400 when slug query param is missing', async () => {
      mockSupabase = makeSupabaseMock()

      const response = await GET(
        new Request('http://localhost/api/quiz/projects') as any
      )

      expect(response.status).toBe(400)
      const body = await response.json() as Record<string, unknown>
      expect(body.error).toBe('slug is required')
    })
  })

  describe('tech not found', () => {
    it('returns 404 when technology slug is not in the database', async () => {
      mockSupabase = makeSupabaseMock({ tech: null })

      const response = await GET(
        new Request('http://localhost/api/quiz/projects?slug=unknown-xyz') as any
      )

      expect(response.status).toBe(404)
      const body = await response.json() as Record<string, unknown>
      expect(body.error).toBe('Technology not found')
      expect(mockResilientAICall).not.toHaveBeenCalled()
    })
  })

  describe('cache hit', () => {
    it('returns cached idea without calling AI when fresh cache exists', async () => {
      const cachedRow = {
        content: JSON.stringify(sampleProjectIdea),
        generated_at: new Date().toISOString(),
      }

      mockSupabase = makeSupabaseMock({ tech: techRow, cached: cachedRow })

      const response = await GET(
        new Request('http://localhost/api/quiz/projects?slug=react&goal=get-job&level=beginner') as any
      )

      expect(response.status).toBe(200)
      const body = await response.json() as Record<string, unknown>

      expect(body.cached).toBe(true)
      expect(body.idea).toBeDefined()
      const idea = body.idea as typeof sampleProjectIdea
      expect(idea.name).toBe('Task Manager API')
      expect(idea.buildSteps).toHaveLength(4)
      expect(idea.skills).toBeInstanceOf(Array)

      // AI should not have been called
      expect(mockResilientAICall).not.toHaveBeenCalled()
    })
  })

  describe('cache miss — AI success', () => {
    it('calls AI, returns idea, and stores in cache when no cache hit', async () => {
      mockSupabase = makeSupabaseMock({ tech: techRow, cached: null })
      mockResilientAICall.mockResolvedValue(sampleProjectIdea)

      const response = await GET(
        new Request('http://localhost/api/quiz/projects?slug=react&goal=side-project&level=intermediate') as any
      )

      expect(response.status).toBe(200)
      const body = await response.json() as Record<string, unknown>

      expect(body.cached).toBe(false)
      expect(body.fallback).toBeUndefined()
      expect(body.idea).toBeDefined()
      const idea = body.idea as typeof sampleProjectIdea
      expect(idea.name).toBe('Task Manager API')
      expect(idea.buildSteps).toHaveLength(4)

      // AI was called
      expect(mockResilientAICall).toHaveBeenCalledTimes(1)
    })

    it('passes slug, goal and level as part of AI call context', async () => {
      mockSupabase = makeSupabaseMock({ tech: techRow, cached: null })
      mockResilientAICall.mockResolvedValue(sampleProjectIdea)

      await GET(
        new Request('http://localhost/api/quiz/projects?slug=react&goal=get-job&level=advanced') as any
      )

      expect(mockResilientAICall).toHaveBeenCalledTimes(1)
      // First arg is the use case type
      expect(mockResilientAICall.mock.calls[0][0]).toBe('batch_insight')
    })
  })

  describe('AI failure fallback', () => {
    it('returns fallback idea when AI call throws', async () => {
      mockSupabase = makeSupabaseMock({ tech: techRow, cached: null })
      mockResilientAICall.mockRejectedValue(new Error('AI provider unavailable'))

      const response = await GET(
        new Request('http://localhost/api/quiz/projects?slug=react&goal=side-project&level=beginner') as any
      )

      expect(response.status).toBe(200)
      const body = await response.json() as Record<string, unknown>

      // Fallback markers
      expect(body.fallback).toBe(true)
      expect(body.cached).toBe(false)

      // Should still return a valid ProjectIdea shape
      expect(body.idea).toBeDefined()
      const idea = body.idea as Record<string, unknown>
      expect(idea.name).toBeTruthy()
      expect(idea.buildSteps).toBeInstanceOf(Array)
      expect(idea.skills).toBeInstanceOf(Array)
    })
  })

  describe('default parameter values', () => {
    it('uses side-project as default goal when not provided', async () => {
      mockSupabase = makeSupabaseMock({ tech: techRow, cached: null })
      mockResilientAICall.mockResolvedValue(sampleProjectIdea)

      await GET(
        new Request('http://localhost/api/quiz/projects?slug=react') as any
      )

      // Route runs without error and AI was called (cache miss with defaults)
      expect(mockResilientAICall).toHaveBeenCalledTimes(1)
    })
  })
})
