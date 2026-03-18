import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock factory so we control what provider is created ───────────────────

vi.mock('@/lib/ai/providers/factory', () => ({
  createProviderFromKey: vi.fn(),
}))

// Mock retry to avoid real backoff delays in tests
vi.mock('@/lib/ai/retry', () => ({
  withRetry: vi.fn(async (fn: () => Promise<unknown>) => fn()),
}))

import { createProviderFromKey } from '@/lib/ai/providers/factory'
import { resilientAICall, AllProvidersExhaustedError } from '@/lib/ai/resilient-call'
import { KeyManager } from '@/lib/ai/key-manager'
import type { APIKeyConfig } from '@/lib/ai/key-manager'

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeKeyConfig(provider: string, key = 'test-key'): APIKeyConfig {
  return {
    key,
    provider: provider as APIKeyConfig['provider'],
    model: 'test-model',
    rpmLimit: 100,
    tpmLimit: 100000,
    dailyLimit: null,
    currentRPM: 0,
    currentTPM: 0,
    dailyUsage: 0,
    lastResetMinute: 0,
    lastResetDay: '2026-01-15',
    consecutiveFailures: 0,
    cooldownUntil: null,
  }
}

function makeKeyManager(providers: string[]): KeyManager {
  return new KeyManager(providers.map((p) => makeKeyConfig(p)))
}

function mockProvider(generate: () => Promise<string>) {
  return {
    generateText: generate,
    generate,
    generateStream: async function* () { yield 'chunk' },
  }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('resilientAICall()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns result when primary provider succeeds', async () => {
    const provider = mockProvider(async () => 'ai response')
    vi.mocked(createProviderFromKey).mockReturnValue(provider as any)

    const km = makeKeyManager(['gemini'])
    // Use unique useCase per test to avoid cross-test circuit breaker state
    const result = await resilientAICall(
      'batch_insight',
      (p) => p.generateText('prompt', {}),
      km
    )
    expect(result).toBe('ai response')
  })

  it('falls back to second provider when primary throws', async () => {
    const failingProvider = mockProvider(async () => { throw new Error('Primary failed') })
    const successProvider = mockProvider(async () => 'fallback response')

    vi.mocked(createProviderFromKey)
      .mockReturnValueOnce(failingProvider as any)
      .mockReturnValue(successProvider as any)

    // Use a different use-case to avoid circuit breaker state from previous test
    const km = makeKeyManager(['gemini', 'mistral', 'xai', 'openrouter', 'groq', 'huggingface'])
    const result = await resilientAICall(
      'digest',
      (p) => p.generateText('prompt', {}),
      km
    )
    expect(result).toBe('fallback response')
  })

  it('falls back to another provider when the primary result is rejected by quality gating', async () => {
    const genericProvider = mockProvider(async () => 'generic response')
    const strongProvider = mockProvider(async () => 'strong response')

    vi.mocked(createProviderFromKey)
      .mockReturnValueOnce(genericProvider as any)
      .mockReturnValue(strongProvider as any)

    const km = makeKeyManager(['gemini', 'mistral', 'xai', 'openrouter', 'groq', 'huggingface'])
    const result = await resilientAICall(
      'batch_insight',
      (p) => p.generateText('prompt', {}),
      km,
      {
        acceptResult: (value) => value !== 'generic response',
        rejectionMessage: 'generic result rejected',
      }
    )

    expect(result).toBe('strong response')
  })

  it('throws AllProvidersExhaustedError when all providers fail', async () => {
    const failingProvider = mockProvider(async () => { throw new Error('fail') })
    vi.mocked(createProviderFromKey).mockReturnValue(failingProvider as any)

    // Only 1 provider so fallback list is also empty → all exhausted
    const km = makeKeyManager(['gemini'])
    // Remove fallback keys by constructing with just gemini
    await expect(
      resilientAICall('summary', (p) => p.generateText('prompt', {}), km)
    ).rejects.toThrow(AllProvidersExhaustedError)
  })

  it('AllProvidersExhaustedError message contains use case', async () => {
    const failingProvider = mockProvider(async () => { throw new Error('fail') })
    vi.mocked(createProviderFromKey).mockReturnValue(failingProvider as any)

    const km = makeKeyManager(['gemini'])
    try {
      await resilientAICall('outlook', (p) => p.generateText('prompt', {}), km)
    } catch (e) {
      expect((e as Error).message).toContain('outlook')
    }
  })
})
