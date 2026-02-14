/**
 * Provider factory — creates the right AIProvider from a key config.
 */

import type { AIProvider } from '@/lib/ai/provider'
import type { APIKeyConfig } from '@/lib/ai/key-manager'
import { GeminiProvider } from '@/lib/ai/providers/gemini'
import {
  GroqProvider,
  XAIProvider,
  MistralProvider,
  CerebrasProvider,
  OpenRouterProvider,
  HuggingFaceProvider,
} from '@/lib/ai/providers/openai-compatible'

export function createProviderFromKey(config: APIKeyConfig): AIProvider {
  switch (config.provider) {
    case 'gemini':
      return new GeminiProvider(config.key)
    case 'groq':
      return new GroqProvider(config.key, config.model)
    case 'xai':
      return new XAIProvider(config.key, config.model)
    case 'mistral':
      return new MistralProvider(config.key, config.model)
    case 'cerebras':
      return new CerebrasProvider(config.key, config.model)
    case 'openrouter':
      return new OpenRouterProvider(config.key, config.model)
    case 'huggingface':
      return new HuggingFaceProvider(config.key, config.model)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
