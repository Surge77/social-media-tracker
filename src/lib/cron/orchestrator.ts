type CronEnv = Record<string, string | undefined> & {
  VERCEL_ENV?: string
  CRON_SECRET?: string
}

export function hasCronSecretConfigError(env: CronEnv): boolean {
  return env.VERCEL_ENV === 'production' && !env.CRON_SECRET
}

export function buildInternalCronHeaders(env: CronEnv): Record<string, string> {
  if (!env.CRON_SECRET) return {}
  return { 'x-internal-cron': env.CRON_SECRET }
}

export function buildInternalBearerHeaders(
  env: CronEnv,
  extraHeaders?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {
    ...buildInternalCronHeaders(env),
    ...(extraHeaders ?? {}),
  }

  if (env.CRON_SECRET) {
    headers.Authorization = `Bearer ${env.CRON_SECRET}`
  }

  return headers
}

export type CronStepResult = {
  name: string
  url: string
  ok: boolean
  status: number | null
  attemptCount: number
  error?: string
}

type RunStepOptions = {
  name: string
  url: string
  init?: RequestInit
  retries?: number
}

export async function runCronStepWithRetry(
  options: RunStepOptions
): Promise<CronStepResult> {
  const { name, url, init, retries = 1 } = options
  let lastError: unknown = null
  let lastStatus: number | null = null
  let attemptCount = 0

  for (let i = 0; i <= retries; i += 1) {
    attemptCount += 1
    try {
      const response = await fetch(url, init)
      lastStatus = response.status
      if (response.ok) {
        return {
          name,
          url,
          ok: true,
          status: response.status,
          attemptCount,
        }
      }
      lastError = `HTTP ${response.status}`
    } catch (error) {
      lastError = error
    }
  }

  const errorMessage =
    lastError instanceof Error ? lastError.message : String(lastError)

  return {
    name,
    url,
    ok: false,
    status: lastStatus,
    attemptCount,
    error: errorMessage,
  }
}
