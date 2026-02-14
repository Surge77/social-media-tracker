/**
 * AI Provider abstraction layer.
 *
 * Every LLM provider implements this interface.
 * Business logic never touches provider-specific APIs directly.
 */

export interface GenerateOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface AIProvider {
  /** Generate a structured JSON response matching a schema. */
  generateJSON<T>(prompt: string, schema?: object, options?: GenerateOptions): Promise<T>

  /** Generate a plain text response. */
  generateText(prompt: string, options?: GenerateOptions): Promise<string>

  /** Stream a response as an async iterable of text chunks. */
  generateStream(prompt: string, options?: GenerateOptions): AsyncIterable<string>
}

/**
 * Error thrown when an API call fails with a known status code.
 * Allows retry logic to inspect the status.
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly provider: string
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}
