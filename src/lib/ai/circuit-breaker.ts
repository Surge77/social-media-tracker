/**
 * Circuit breaker pattern — prevents hammering a dead service.
 *
 * States:
 * - closed: normal operation, requests flow through
 * - open: too many failures, all requests immediately rejected
 * - half-open: after timeout, allow a few requests to test recovery
 */

type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeoutMs: number
  halfOpenMaxAttempts: number
}

export class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failures = 0
  private successes = 0
  private lastFailureTime = 0
  private config: CircuitBreakerConfig

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      resetTimeoutMs: 60_000,
      halfOpenMaxAttempts: 2,
      ...config,
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (
        Date.now() - this.lastFailureTime >
        this.config.resetTimeoutMs
      ) {
        this.state = 'half-open'
        this.successes = 0
      } else {
        throw new CircuitOpenError(
          'Circuit breaker is open — AI provider temporarily unavailable'
        )
      }
    }

    try {
      const result = await fn()

      if (this.state === 'half-open') {
        this.successes++
        if (this.successes >= this.config.halfOpenMaxAttempts) {
          this.state = 'closed'
          this.failures = 0
        }
      } else {
        this.failures = 0
      }

      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()

      if (this.failures >= this.config.failureThreshold) {
        this.state = 'open'
      }

      throw error
    }
  }

  getState(): {
    state: CircuitState
    failures: number
    lastFailure: number
  } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailureTime,
    }
  }
}

export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CircuitOpenError'
  }
}

// One circuit breaker per provider
export const circuitBreakers: Record<string, CircuitBreaker> = {
  gemini: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  groq: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  xai: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  mistral: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  cerebras: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  openrouter: new CircuitBreaker({
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  huggingface: new CircuitBreaker({
    failureThreshold: 3,
    resetTimeoutMs: 120_000,
  }),
}
