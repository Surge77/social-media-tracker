/**
 * Resilient AI call wrapper.
 *
 * Every AI call goes through: key rotation → circuit breaker → retry → fallback chain.
 * If the preferred provider fails, it tries each fallback in order.
 * Only throws if ALL providers are exhausted.
 */

import type { AIProvider, GenerateOptions } from '@/lib/ai/provider'
import type { KeyManager } from '@/lib/ai/key-manager'
import type { UseCase } from '@/lib/ai/router'
import { ROUTING_TABLE, getProviderForUseCase } from '@/lib/ai/router'
import { circuitBreakers } from '@/lib/ai/circuit-breaker'
import { withRetry } from '@/lib/ai/retry'
import { createProviderFromKey } from '@/lib/ai/providers/factory'

export class AllProvidersExhaustedError extends Error {
  constructor(useCase: string) {
    super(
      `All AI providers exhausted for use case: ${useCase}. No fallbacks available.`
    )
    this.name = 'AllProvidersExhaustedError'
  }
}

export async function resilientAICall<T>(
  useCase: UseCase,
  generateFn: (provider: AIProvider) => Promise<T>,
  keyManager: KeyManager
): Promise<T> {
  // Try preferred provider with retry
  const primary = getProviderForUseCase(useCase, keyManager)
  if (primary) {
    try {
      const breaker =
        circuitBreakers[primary.keyConfig.provider] ??
        circuitBreakers.openrouter
      const result = await breaker.execute(() =>
        withRetry(
          () => generateFn(primary.provider),
          { maxRetries: 2 },
          (attempt, _err, delay) => {
            console.warn(
              `[AI] Retry ${attempt} for ${useCase} (${primary.keyConfig.provider}), waiting ${delay}ms`
            )
          }
        )
      )
      keyManager.recordSuccess(primary.keyConfig, 0)
      return result
    } catch (error) {
      keyManager.recordFailure(
        primary.keyConfig,
        (error as { status?: number })?.status
      )
      console.error(
        `[AI] Primary provider failed for ${useCase}:`,
        (error as Error).message
      )
    }
  }

  // Try each fallback provider
  const route = ROUTING_TABLE[useCase]
  for (const fallbackProvider of route.fallbackOrder) {
    const fallbackKey = keyManager.getKey(fallbackProvider)
    if (!fallbackKey) continue

    try {
      const provider = createProviderFromKey(fallbackKey)
      const breaker =
        circuitBreakers[fallbackProvider] ?? circuitBreakers.openrouter
      const result = await breaker.execute(() =>
        withRetry(() => generateFn(provider), { maxRetries: 1 })
      )
      keyManager.recordSuccess(fallbackKey, 0)
      return result
    } catch (error) {
      keyManager.recordFailure(
        fallbackKey,
        (error as { status?: number })?.status
      )
      console.error(
        `[AI] Fallback ${fallbackProvider} failed for ${useCase}:`,
        (error as Error).message
      )
    }
  }

  // All providers exhausted
  throw new AllProvidersExhaustedError(useCase)
}

/**
 * Resilient AI streaming wrapper.
 *
 * Iterates provider.generateStream() and calls onChunk for each text chunk.
 * Falls back to generateText (no artificial delay) if all providers fail streaming.
 * Uses the same key rotation / circuit breaker / retry chain as resilientAICall.
 */
export async function resilientAIStreamCall(
  useCase: UseCase,
  prompt: string,
  options: GenerateOptions,
  keyManager: KeyManager,
  onChunk: (chunk: string) => Promise<void>
): Promise<{ providerUsed: string }> {
  const tryStream = async (
    provider: AIProvider,
    keyConfig: import('@/lib/ai/key-manager').APIKeyConfig
  ): Promise<string> => {
    let chunkCount = 0
    for await (const chunk of provider.generateStream(prompt, options)) {
      await onChunk(chunk)
      chunkCount++
    }
    keyManager.recordSuccess(keyConfig, 0)
    return keyConfig.provider
  }

  // Try preferred provider
  const primary = getProviderForUseCase(useCase, keyManager)
  if (primary) {
    try {
      const breaker =
        circuitBreakers[primary.keyConfig.provider] ?? circuitBreakers.openrouter
      const used = await breaker.execute(() => tryStream(primary.provider, primary.keyConfig))
      return { providerUsed: used }
    } catch (error) {
      keyManager.recordFailure(
        primary.keyConfig,
        (error as { status?: number })?.status
      )
      console.error(
        `[AI Stream] Primary provider failed for ${useCase}:`,
        (error as Error).message
      )
    }
  }

  // Try each fallback provider
  const route = ROUTING_TABLE[useCase]
  for (const fallbackProvider of route.fallbackOrder) {
    const fallbackKey = keyManager.getKey(fallbackProvider)
    if (!fallbackKey) continue

    try {
      const provider = createProviderFromKey(fallbackKey)
      const breaker =
        circuitBreakers[fallbackProvider] ?? circuitBreakers.openrouter
      const used = await breaker.execute(() => tryStream(provider, fallbackKey))
      return { providerUsed: used }
    } catch (error) {
      keyManager.recordFailure(
        fallbackKey,
        (error as { status?: number })?.status
      )
      console.error(
        `[AI Stream] Fallback ${fallbackProvider} failed for ${useCase}:`,
        (error as Error).message
      )
    }
  }

  // All streaming providers exhausted — fall back to generateText (no delay)
  console.warn(`[AI Stream] All streaming failed for ${useCase}, falling back to generateText`)
  const text = await resilientAICall(
    useCase,
    (provider) => provider.generateText(prompt, options),
    keyManager
  )
  await onChunk(text)
  return { providerUsed: 'text-fallback' }
}
