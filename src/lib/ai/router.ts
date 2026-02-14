/**
 * Provider router — picks the best provider per use case.
 *
 * Gemini: best JSON schema enforcement, cheapest batch → batch work
 * Groq/Cerebras: fastest inference (~200-400ms) → real-time chat
 * xAI Grok: strong reasoning → smart fallback
 * Mistral: reliable quality → batch fallback
 * OpenRouter: routes to best free model → ultimate fallback
 * HuggingFace: slowest → emergency-only
 */

import type { AIProvider } from '@/lib/ai/provider'
import type { KeyManager, APIKeyConfig } from '@/lib/ai/key-manager'
import { createProviderFromKey } from '@/lib/ai/providers/factory'

export type UseCase =
  | 'batch_insight'
  | 'comparison'
  | 'chat'
  | 'digest'
  | 'anomaly_explain'

interface RouteConfig {
  preferredProvider: string
  fallbackOrder: string[]
  maxLatencyMs: number
  temperature: number
}

export const ROUTING_TABLE: Record<UseCase, RouteConfig> = {
  batch_insight: {
    preferredProvider: 'gemini',
    fallbackOrder: [
      'mistral',
      'xai',
      'openrouter',
      'groq',
      'huggingface',
    ],
    maxLatencyMs: 5000,
    temperature: 0.3,
  },
  comparison: {
    preferredProvider: 'gemini',
    fallbackOrder: [
      'xai',
      'mistral',
      'openrouter',
      'groq',
      'huggingface',
    ],
    maxLatencyMs: 5000,
    temperature: 0.3,
  },
  chat: {
    preferredProvider: 'groq',
    fallbackOrder: [
      'cerebras',
      'xai',
      'gemini',
      'openrouter',
      'mistral',
      'huggingface',
    ],
    maxLatencyMs: 2000,
    temperature: 0.5,
  },
  digest: {
    preferredProvider: 'gemini',
    fallbackOrder: ['xai', 'mistral', 'openrouter'],
    maxLatencyMs: 15000,
    temperature: 0.4,
  },
  anomaly_explain: {
    preferredProvider: 'gemini',
    fallbackOrder: [
      'xai',
      'groq',
      'cerebras',
      'mistral',
      'openrouter',
    ],
    maxLatencyMs: 3000,
    temperature: 0.3,
  },
}

export function getProviderForUseCase(
  useCase: UseCase,
  keyManager: KeyManager
): { provider: AIProvider; keyConfig: APIKeyConfig } | null {
  const route = ROUTING_TABLE[useCase]

  // Try preferred provider first
  let keyConfig = keyManager.getKey(route.preferredProvider)
  if (keyConfig) {
    return { provider: createProviderFromKey(keyConfig), keyConfig }
  }

  // Try fallbacks in order
  for (const fallback of route.fallbackOrder) {
    keyConfig = keyManager.getKey(fallback)
    if (keyConfig) {
      return { provider: createProviderFromKey(keyConfig), keyConfig }
    }
  }

  return null
}
