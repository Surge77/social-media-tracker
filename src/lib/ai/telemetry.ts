/**
 * AI telemetry — fire-and-forget logging of every AI call.
 *
 * Logs to the ai_telemetry Supabase table for monitoring and dashboarding.
 * Never blocks the response on logging.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export type TelemetryEvent =
  | 'generation'
  | 'cache_hit'
  | 'cache_miss'
  | 'quality_fail'
  | 'retry'
  | 'fallback'
  | 'circuit_open'
  | 'rate_limited'
  | 'feedback_received'
  | 'error'

export interface AITelemetryData {
  event: TelemetryEvent
  provider: string
  model: string
  use_case: string
  latency_ms: number | null
  token_input: number | null
  token_output: number | null
  quality_score: number | null
  error: string | null
  metadata: Record<string, unknown>
}

/**
 * Log a telemetry event. Fire-and-forget — never blocks the response.
 */
export function logTelemetry(
  data: AITelemetryData,
  supabase: SupabaseClient
): void {
  supabase
    .from('ai_telemetry')
    .insert({
      ...data,
      timestamp: new Date().toISOString(),
    })
    .then(({ error }) => {
      if (error) console.error('[Telemetry] Failed to log:', error)
    })
}

// ---- Cost tracking ----

const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  'gemini-2.0-flash': { input: 0.0, output: 0.0 },
  'llama-3.3-70b-versatile': { input: 0.0, output: 0.0 },
  'llama-3.3-70b': { input: 0.0, output: 0.0 },
  'grok-2': { input: 0.0, output: 0.0 },
  'mistral-small-latest': { input: 0.0, output: 0.0 },
  'meta-llama/llama-3.3-70b-instruct:free': { input: 0.0, output: 0.0 },
  'meta-llama/Llama-3.3-70B-Instruct': { input: 0.0, output: 0.0 },
}

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rates = COST_PER_1K_TOKENS[model] ?? {
    input: 0.001,
    output: 0.002,
  }
  return (
    (inputTokens / 1000) * rates.input +
    (outputTokens / 1000) * rates.output
  )
}

export const DAILY_COST_ALERT_THRESHOLD_USD = 5.0
