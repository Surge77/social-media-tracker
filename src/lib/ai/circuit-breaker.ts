/**
 * Circuit breaker pattern — prevents hammering a dead service.
 *
 * States:
 * - closed: normal operation, requests flow through
 * - open: too many failures, all requests immediately rejected
 * - half-open: after timeout, allow a few requests to test recovery
 *
 * State is persisted to Supabase (system_config) so it survives
 * serverless cold starts. Reads are lazy and cached for 60s.
 * Writes are fire-and-forget and never block the request path.
 */

import { loadPersistedState, persistState } from '@/lib/ai/state-store'

type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeoutMs: number
  halfOpenMaxAttempts: number
}

interface PersistedCircuitState {
  state: CircuitState
  failures: number
  lastFailureTime: number
}

type PersistedAllCircuits = Record<string, PersistedCircuitState>

const STORE_KEY = 'ai_circuit_breaker_states'

export class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failures = 0
  private successes = 0
  private lastFailureTime = 0
  private config: CircuitBreakerConfig
  private provider: string
  private initialized = false

  constructor(provider: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.provider = provider
    this.config = {
      failureThreshold: 5,
      resetTimeoutMs: 60_000,
      halfOpenMaxAttempts: 2,
      ...config,
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return
    this.initialized = true

    const all = await loadPersistedState<PersistedAllCircuits>(STORE_KEY)
    const saved = all?.[this.provider]
    if (!saved) return

    this.state = saved.state
    this.failures = saved.failures
    this.lastFailureTime = saved.lastFailureTime
  }

  private saveState(): void {
    void loadPersistedState<PersistedAllCircuits>(STORE_KEY).then((all) => {
      persistState(STORE_KEY, {
        ...(all ?? {}),
        [this.provider]: {
          state: this.state,
          failures: this.failures,
          lastFailureTime: this.lastFailureTime,
        },
      })
    })
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.ensureInitialized()

    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeoutMs) {
        this.state = 'half-open'
        this.successes = 0
        this.saveState()
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
          this.saveState()
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
        this.saveState()
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
  gemini: new CircuitBreaker('gemini', {
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  groq: new CircuitBreaker('groq', {
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  xai: new CircuitBreaker('xai', {
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  mistral: new CircuitBreaker('mistral', {
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  cerebras: new CircuitBreaker('cerebras', {
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  openrouter: new CircuitBreaker('openrouter', {
    failureThreshold: 5,
    resetTimeoutMs: 60_000,
  }),
  huggingface: new CircuitBreaker('huggingface', {
    failureThreshold: 3,
    resetTimeoutMs: 120_000,
  }),
}
