/**
 * OpenAI-compatible provider base class.
 *
 * Groq, xAI, Mistral, Cerebras, OpenRouter, and HuggingFace all use
 * the OpenAI chat completions API format. One base class, 6 subclasses
 * that only differ by URL and optional headers.
 */

import type { AIProvider, GenerateOptions } from '@/lib/ai/provider'
import { ProviderError } from '@/lib/ai/provider'

export class OpenAICompatibleProvider implements AIProvider {
  constructor(
    protected apiKey: string,
    protected model: string,
    protected baseURL: string,
    protected extraHeaders: Record<string, string> = {}
  ) {}

  async generateJSON<T>(
    prompt: string,
    _schema?: object,
    options?: GenerateOptions
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...this.extraHeaders,
      },
      body: JSON.stringify({
        model: options?.model ?? this.model,
        messages: [
          ...(options?.systemPrompt
            ? [{ role: 'system', content: options.systemPrompt }]
            : []),
          {
            role: 'user',
            content:
              prompt +
              '\n\nRespond with valid JSON only. No markdown, no code fences.',
          },
        ],
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 2048,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const err = await response.text().catch(() => 'unknown')
      throw new ProviderError(
        `${this.baseURL} error: ${response.status} ${err.slice(0, 200)}`,
        response.status,
        this.providerName
      )
    }

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content) as T
  }

  async generateText(
    prompt: string,
    options?: GenerateOptions
  ): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...this.extraHeaders,
      },
      body: JSON.stringify({
        model: options?.model ?? this.model,
        messages: [
          ...(options?.systemPrompt
            ? [{ role: 'system', content: options.systemPrompt }]
            : []),
          { role: 'user', content: prompt },
        ],
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.maxTokens ?? 1024,
      }),
    })

    if (!response.ok) {
      const err = await response.text().catch(() => 'unknown')
      throw new ProviderError(
        `API error: ${response.status} ${err.slice(0, 200)}`,
        response.status,
        this.providerName
      )
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async *generateStream(
    prompt: string,
    options?: GenerateOptions
  ): AsyncIterable<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...this.extraHeaders,
      },
      body: JSON.stringify({
        model: options?.model ?? this.model,
        messages: [
          ...(options?.systemPrompt
            ? [{ role: 'system', content: options.systemPrompt }]
            : []),
          { role: 'user', content: prompt },
        ],
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.maxTokens ?? 2048,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new ProviderError(
        `Stream error: ${response.status}`,
        response.status,
        this.providerName
      )
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
      for (const line of lines) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // Incomplete JSON chunk — skip
        }
      }
    }
  }

  protected get providerName(): string {
    try {
      const url = new URL(this.baseURL)
      return url.hostname.split('.')[0]
    } catch {
      return 'unknown'
    }
  }
}

// ---- Provider subclasses (differ only by URL + optional headers) ----

export class GroqProvider extends OpenAICompatibleProvider {
  constructor(apiKey: string, model: string) {
    super(apiKey, model, 'https://api.groq.com/openai/v1')
  }
}

export class XAIProvider extends OpenAICompatibleProvider {
  constructor(apiKey: string, model: string) {
    super(apiKey, model, 'https://api.x.ai/v1')
  }
}

export class MistralProvider extends OpenAICompatibleProvider {
  constructor(apiKey: string, model: string) {
    super(apiKey, model, 'https://api.mistral.ai/v1')
  }
}

export class CerebrasProvider extends OpenAICompatibleProvider {
  constructor(apiKey: string, model: string) {
    super(apiKey, model, 'https://api.cerebras.ai/v1')
  }
}

export class OpenRouterProvider extends OpenAICompatibleProvider {
  constructor(apiKey: string, model: string) {
    super(apiKey, model, 'https://openrouter.ai/api/v1', {
      'HTTP-Referer': 'https://devtrends.dev',
      'X-Title': 'DevTrends Intelligence Engine',
    })
  }
}

export class HuggingFaceProvider extends OpenAICompatibleProvider {
  constructor(apiKey: string, model: string) {
    super(
      apiKey,
      model,
      `https://api-inference.huggingface.co/models/${model}/v1`
    )
  }
}
