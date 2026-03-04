import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(mockSupabaseServer()),
}))

vi.mock('@/lib/ai/resilient-call', () => ({
  resilientAIStreamCall: vi.fn().mockImplementation(
    async (_useCase, _prompt, _opts, _km, onChunk) => {
      await onChunk('Hello ')
      await onChunk('there!')
      return { providerUsed: 'groq' }
    }
  ),
}))

vi.mock('@/lib/ai/key-manager', () => ({
  createKeyManager: vi.fn().mockReturnValue({}),
}))

vi.mock('@/lib/ai/telemetry', () => ({
  logTelemetry: vi.fn(),
}))

// ─── Supabase server mock ────────────────────────────────────────────────────

function makeChain(data: unknown) {
  const self: Record<string, unknown> = {
    select: () => self,
    eq: () => self,
    in: () => self,
    order: () => self,
    limit: () => self,
    // update() must return self so callers can chain .eq() after it
    update: () => self,
    insert: vi.fn().mockResolvedValue({ error: null }),
    upsert: vi.fn().mockResolvedValue({ error: null }),
    single: () => Promise.resolve({ data, error: data === null ? { message: 'not found' } : null }),
    maybeSingle: () => Promise.resolve({ data, error: null }),
    then: (resolve: (v: unknown) => unknown) =>
      Promise.resolve({ data, error: null }).then(resolve),
  }
  return self
}

function mockSupabaseServer() {
  const conversation = {
    id: 'conv-1',
    session_id: 'test-session-id',
    messages: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  return {
    from: (table: string) => {
      if (table === 'conversations') return makeChain(conversation)
      if (table === 'technologies') return makeChain([])
      return makeChain(null)
    },
  }
}

// ─── Import after mocks ─────────────────────────────────────────────────────

import { POST } from '@/app/api/ai/ask/route'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('POST /api/ai/ask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSupabaseServer() as any)
  })

  it('returns 400 when request body is invalid (missing question)', async () => {
    const res = await POST(
      new Request('http://localhost/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: '00000000-0000-0000-0000-000000000000' }),
      }) as any
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when sessionId is not a valid UUID', async () => {
    const res = await POST(
      new Request('http://localhost/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'What should I learn?', sessionId: 'not-a-uuid' }),
      }) as any
    )
    expect(res.status).toBe(400)
  })

  it('returns streaming SSE response on valid input', async () => {
    const res = await POST(
      new Request('http://localhost/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'What should I learn next?',
          sessionId: '123e4567-e89b-12d3-a456-426614174000',
        }),
      }) as any
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/event-stream')
  })

  it('SSE stream contains chunk and done events', async () => {
    const res = await POST(
      new Request('http://localhost/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Tell me about React',
          sessionId: '123e4567-e89b-12d3-a456-426614174001',
        }),
      }) as any
    )

    expect(res.body).not.toBeNull()
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    const chunks: string[] = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(decoder.decode(value))
    }

    const fullText = chunks.join('')
    expect(fullText).toContain('chunk')
    expect(fullText).toContain('done')
  })
})
