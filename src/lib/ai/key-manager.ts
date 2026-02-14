/**
 * Multi-key rotation manager.
 *
 * Tracks RPM, TPM, daily usage, cooldowns, and failures for all 8 keys
 * across 7 providers. Picks the best available key per request.
 */

// ---- Types ----

export type ProviderName =
  | 'gemini'
  | 'groq'
  | 'xai'
  | 'mistral'
  | 'cerebras'
  | 'openrouter'
  | 'huggingface'

export interface APIKeyConfig {
  key: string
  provider: ProviderName
  model: string
  rpmLimit: number
  tpmLimit: number
  dailyLimit: number | null // null = unlimited
  currentRPM: number
  currentTPM: number
  dailyUsage: number
  lastResetMinute: number
  lastResetDay: string
  consecutiveFailures: number
  cooldownUntil: number | null // timestamp, null = not cooling down
}

// ---- Key Manager ----

export class KeyManager {
  private keys: APIKeyConfig[]

  constructor(configs: APIKeyConfig[]) {
    this.keys = configs
  }

  /**
   * Get the best available key using weighted selection:
   * 1. Filter out keys in cooldown
   * 2. Filter out keys at daily limit
   * 3. Reset per-minute counters if a new minute started
   * 4. Filter out keys at RPM limit
   * 5. Sort by preference + available headroom
   */
  getKey(preferredProvider?: string): APIKeyConfig | null {
    const now = Date.now()
    const currentMinute = Math.floor(now / 60000)
    const today = new Date().toISOString().split('T')[0]

    const available = this.keys
      .filter((k) => {
        // Skip keys in cooldown
        if (k.cooldownUntil && now < k.cooldownUntil) return false

        // Reset daily counters if a new day
        if (k.lastResetDay !== today) {
          k.dailyUsage = 0
          k.lastResetDay = today
        }

        // Skip keys at daily limit
        if (k.dailyLimit && k.dailyUsage >= k.dailyLimit) return false

        // Reset per-minute counters if a new minute
        if (k.lastResetMinute !== currentMinute) {
          k.currentRPM = 0
          k.currentTPM = 0
          k.lastResetMinute = currentMinute
        }

        // Skip keys at RPM limit
        if (k.currentRPM >= k.rpmLimit) return false

        return true
      })
      .sort((a, b) => {
        // Prefer the requested provider
        if (preferredProvider) {
          if (
            a.provider === preferredProvider &&
            b.provider !== preferredProvider
          )
            return -1
          if (
            b.provider === preferredProvider &&
            a.provider !== preferredProvider
          )
            return 1
        }
        // Then sort by available headroom (lowest usage ratio first)
        const aRatio = a.currentRPM / a.rpmLimit
        const bRatio = b.currentRPM / b.rpmLimit
        return aRatio - bRatio
      })

    return available[0] ?? null
  }

  /** Record a successful call. */
  recordSuccess(key: APIKeyConfig, tokensUsed: number): void {
    key.currentRPM++
    key.currentTPM += tokensUsed
    key.dailyUsage++
    key.consecutiveFailures = 0
    key.cooldownUntil = null
  }

  /**
   * Record a failure. Escalating cooldown:
   * - 429 → immediate 60s cooldown
   * - 3 failures → 5 min
   * - 5 failures → 30 min
   * - 10 failures → 2 hours
   */
  recordFailure(key: APIKeyConfig, statusCode?: number): void {
    key.consecutiveFailures++

    if (statusCode === 429) {
      key.cooldownUntil = Date.now() + 60_000
      return
    }

    if (key.consecutiveFailures >= 10) {
      key.cooldownUntil = Date.now() + 2 * 60 * 60_000
    } else if (key.consecutiveFailures >= 5) {
      key.cooldownUntil = Date.now() + 30 * 60_000
    } else if (key.consecutiveFailures >= 3) {
      key.cooldownUntil = Date.now() + 5 * 60_000
    }
  }

  /** Get usage stats for monitoring / health endpoint. */
  getStats(): Array<{
    provider: string
    model: string
    rpm: number
    rpmLimit: number
    dailyUsage: number
    dailyLimit: number | null
    inCooldown: boolean
    consecutiveFailures: number
  }> {
    return this.keys.map((k) => ({
      provider: k.provider,
      model: k.model,
      rpm: k.currentRPM,
      rpmLimit: k.rpmLimit,
      dailyUsage: k.dailyUsage,
      dailyLimit: k.dailyLimit,
      inCooldown: k.cooldownUntil ? Date.now() < k.cooldownUntil : false,
      consecutiveFailures: k.consecutiveFailures,
    }))
  }

  /** Check if any keys are configured at all. */
  get hasKeys(): boolean {
    return this.keys.length > 0
  }
}

// ---- Factory ----

const KEY_DEFAULTS = {
  currentRPM: 0,
  currentTPM: 0,
  dailyUsage: 0,
  lastResetMinute: 0,
  lastResetDay: '',
  consecutiveFailures: 0,
  cooldownUntil: null,
}

/**
 * Create a KeyManager initialized from environment variables.
 * All 7 providers, 8 keys total.
 */
export function createKeyManager(): KeyManager {
  const keys: APIKeyConfig[] = []

  // Gemini (2 keys = 30 RPM, 3000 RPD combined)
  const geminiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
  ].filter(Boolean) as string[]

  for (const key of geminiKeys) {
    keys.push({
      key,
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      rpmLimit: 15,
      tpmLimit: 1_000_000,
      dailyLimit: 1500,
      ...KEY_DEFAULTS,
    })
  }

  // Groq (fastest inference — primary for chat)
  if (process.env.GROQ_API_KEY) {
    keys.push({
      key: process.env.GROQ_API_KEY,
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      rpmLimit: 30,
      tpmLimit: 131_000,
      dailyLimit: 14400,
      ...KEY_DEFAULTS,
    })
  }

  // xAI Grok (strong model — secondary chat)
  if (process.env.XAI_API_KEY) {
    keys.push({
      key: process.env.XAI_API_KEY,
      provider: 'xai',
      model: 'grok-2',
      rpmLimit: 60,
      tpmLimit: 400_000,
      dailyLimit: 100,
      ...KEY_DEFAULTS,
    })
  }

  // Mistral (good quality — batch fallback)
  if (process.env.MISTRAL_API_KEY) {
    keys.push({
      key: process.env.MISTRAL_API_KEY,
      provider: 'mistral',
      model: 'mistral-small-latest',
      rpmLimit: 30,
      tpmLimit: 500_000,
      dailyLimit: null,
      ...KEY_DEFAULTS,
    })
  }

  // Cerebras (fastest raw inference ~200ms — Groq backup)
  if (process.env.CEREBRAS_API_KEY) {
    keys.push({
      key: process.env.CEREBRAS_API_KEY,
      provider: 'cerebras',
      model: 'llama-3.3-70b',
      rpmLimit: 30,
      tpmLimit: 1_000_000,
      dailyLimit: null,
      ...KEY_DEFAULTS,
    })
  }

  // OpenRouter (meta-router — ultimate fallback)
  if (process.env.OPENROUTER_API_KEY) {
    keys.push({
      key: process.env.OPENROUTER_API_KEY,
      provider: 'openrouter',
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      rpmLimit: 20,
      tpmLimit: 200_000,
      dailyLimit: null,
      ...KEY_DEFAULTS,
    })
  }

  // Hugging Face (free inference — lowest priority)
  if (process.env.HUGGINGFACE_API_KEY) {
    keys.push({
      key: process.env.HUGGINGFACE_API_KEY,
      provider: 'huggingface',
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      rpmLimit: 10,
      tpmLimit: 100_000,
      dailyLimit: null,
      ...KEY_DEFAULTS,
    })
  }

  return new KeyManager(keys)
}
