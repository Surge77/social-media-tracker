import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConversationManager, type ChatMessage } from '@/lib/ai/conversation-manager'
import type { SupabaseClient } from '@supabase/supabase-js'

// Minimal Supabase mock — returns controlled data from maybeSingle
function makeSupabaseMock(rowData: Record<string, unknown> | null) {
  const updateChain = {
    eq: vi.fn().mockResolvedValue({ error: null }),
  }
  const queryChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnValue(updateChain),
    upsert: vi.fn().mockResolvedValue({ error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: rowData, error: null }),
    single: vi.fn().mockResolvedValue({ data: rowData, error: null }),
  }

  return {
    supabase: { from: vi.fn().mockReturnValue(queryChain) } as unknown as SupabaseClient,
    chain: queryChain,
    updateChain,
  }
}

describe('ConversationManager.getOrCreateConversation', () => {
  let manager: ConversationManager

  beforeEach(() => {
    manager = new ConversationManager()
  })

  it('returns existing conversation from DB row', async () => {
    const { supabase } = makeSupabaseMock({
      session_id: 'abc-123',
      messages: [{ role: 'user', content: 'hi', timestamp: '2026-01-01T00:00:00Z' }],
      technologies_discussed: ['react'],
    })

    const conv = await manager.getOrCreateConversation('abc-123', supabase)
    expect(conv.sessionId).toBe('abc-123')
    expect(conv.messages).toHaveLength(1)
    expect(conv.technologiesDiscussed).toContain('react')
  })

  it('returns empty conversation when no row found (maybeSingle returns null)', async () => {
    const { supabase } = makeSupabaseMock(null)

    const conv = await manager.getOrCreateConversation('new-session', supabase)
    expect(conv.sessionId).toBe('new-session')
    expect(conv.messages).toHaveLength(0)
    expect(conv.technologiesDiscussed).toHaveLength(0)
  })

  it('calls upsert (not insert) to prevent race condition', async () => {
    const { supabase, chain } = makeSupabaseMock(null)

    await manager.getOrCreateConversation('new-session', supabase)

    expect(chain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ session_id: 'new-session' }),
      expect.objectContaining({ onConflict: 'session_id' })
    )
  })
})

describe('ConversationManager.addMessageWithConversation', () => {
  it('appends message without re-fetching conversation', async () => {
    const manager = new ConversationManager()
    const { supabase, chain } = makeSupabaseMock(null)

    const conversation = {
      sessionId: 'sess-1',
      messages: [] as ChatMessage[],
      technologiesDiscussed: [] as string[],
    }

    await manager.addMessageWithConversation(
      conversation,
      { role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
      supabase
    )

    // Should NOT have called maybeSingle (no re-fetch)
    expect(chain.maybeSingle).not.toHaveBeenCalled()

    // Should have mutated the conversation in memory
    expect(conversation.messages).toHaveLength(1)
    expect(conversation.messages[0]?.content).toBe('Hello')
  })

  it('accumulates messages across sequential calls', async () => {
    const manager = new ConversationManager()
    const { supabase } = makeSupabaseMock(null)

    const conversation = {
      sessionId: 'sess-2',
      messages: [] as ChatMessage[],
      technologiesDiscussed: [] as string[],
    }

    await manager.addMessageWithConversation(
      conversation,
      { role: 'user', content: 'First', timestamp: new Date().toISOString() },
      supabase
    )
    await manager.addMessageWithConversation(
      conversation,
      { role: 'assistant', content: 'Second', timestamp: new Date().toISOString() },
      supabase
    )

    expect(conversation.messages).toHaveLength(2)
    expect(conversation.messages[1]?.content).toBe('Second')
  })
})

describe('ConversationManager.extractTechnologies', () => {
  const manager = new ConversationManager()

  it('extracts known tech names', () => {
    const techs = manager.extractTechnologies('Should I learn React or Vue?')
    expect(techs).toContain('react')
    expect(techs).toContain('vue')
  })

  it('does not false-positive on plain "go" as English word', () => {
    // "golang" is in the list but not bare "go"
    const techs = manager.extractTechnologies('Let me go ahead and try this')
    expect(techs).not.toContain('go')
    expect(techs).not.toContain('golang')
  })

  it('does not false-positive on "rest"', () => {
    // "rest" removed from keyword list — graphql remains
    const techs = manager.extractTechnologies('I need some rest today')
    expect(techs).not.toContain('rest')
  })

  it('deduplicates results', () => {
    const techs = manager.extractTechnologies('React react REACT')
    expect(techs.filter(t => t === 'react')).toHaveLength(1)
  })
})
