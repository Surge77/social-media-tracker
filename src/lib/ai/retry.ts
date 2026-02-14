/**
 * Retry logic with exponential backoff and jitter.
 */

interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  retryableStatusCodes: number[]
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryableStatusCodes: [429, 500, 502, 503, 504],
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: Error, delayMs: number) => void
): Promise<T> {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config }

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const isLastAttempt = attempt === cfg.maxRetries
      if (isLastAttempt) throw error

      // Check if error is retryable
      const statusCode =
        (error as { status?: number })?.status ??
        (error as { statusCode?: number })?.statusCode
      if (statusCode && !cfg.retryableStatusCodes.includes(statusCode)) {
        throw error // Non-retryable error, fail immediately
      }

      // Exponential backoff with jitter
      const exponentialDelay = cfg.baseDelayMs * Math.pow(2, attempt)
      const jitter = Math.random() * cfg.baseDelayMs
      const delay = Math.min(exponentialDelay + jitter, cfg.maxDelayMs)

      // Respect Retry-After header if present
      const retryAfter = (error as { headers?: Record<string, string> })
        ?.headers?.['retry-after']
      const actualDelay = retryAfter
        ? Math.max(delay, parseInt(retryAfter, 10) * 1000)
        : delay

      onRetry?.(attempt + 1, error as Error, actualDelay)
      await new Promise((resolve) => setTimeout(resolve, actualDelay))
    }
  }

  throw new Error('Unreachable')
}
