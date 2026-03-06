type CronEnv = Record<string, string | undefined> & {
  VERCEL_ENV?: string
  CRON_SECRET?: string
}

function getExpectedBearerToken(env: CronEnv): string | null {
  return env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : null
}

export function hasCronSecretConfigError(env: CronEnv): boolean {
  return env.VERCEL_ENV === 'production' && !env.CRON_SECRET
}

export function resolveCronBaseUrl(request: Request, env: CronEnv): string {
  try {
    return new URL(request.url).origin
  } catch {
    if (env.NEXT_PUBLIC_APP_URL) return env.NEXT_PUBLIC_APP_URL
    if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`
    return 'http://localhost:3000'
  }
}

export function isAuthorizedScheduledRequest(
  request: Request,
  env: CronEnv
): boolean {
  const expectedBearerToken = getExpectedBearerToken(env)

  return (
    request.headers.get('x-vercel-cron') === '1' ||
    (expectedBearerToken !== null &&
      request.headers.get('authorization') === expectedBearerToken)
  )
}

export function isAuthorizedCronRequest(request: Request, env: CronEnv): boolean {
  return (
    isAuthorizedScheduledRequest(request, env) ||
    (!!env.CRON_SECRET &&
      request.headers.get('x-internal-cron') === env.CRON_SECRET)
  )
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

export type CronShardConfig = {
  shardIndex: number
  shardCount: number
}

export function resolveCronShardConfig(
  request: Request,
  defaultShardCount = 1
): CronShardConfig {
  try {
    const url = new URL(request.url)
    const shardCountParam = Number(url.searchParams.get('shardCount'))
    const shardIndexParam = Number(url.searchParams.get('shardIndex'))

    const shardCount = Number.isInteger(shardCountParam) && shardCountParam > 0
      ? shardCountParam
      : defaultShardCount
    const shardIndex = Number.isInteger(shardIndexParam) && shardIndexParam >= 0
      ? shardIndexParam
      : 0

    return {
      shardIndex: Math.min(shardIndex, shardCount - 1),
      shardCount,
    }
  } catch {
    return {
      shardIndex: 0,
      shardCount: defaultShardCount,
    }
  }
}

export function selectItemsForCronShard<T>(
  items: T[],
  { shardIndex, shardCount }: CronShardConfig
): T[] {
  if (shardCount <= 1) return items
  return items.filter((_, index) => index % shardCount === shardIndex)
}

export function buildShardedCronStepUrls(
  baseUrl: string,
  path: string,
  shardCount = 1
): string[] {
  if (shardCount <= 1) {
    return [`${baseUrl}${path}`]
  }

  return Array.from({ length: shardCount }, (_, shardIndex) => (
    `${baseUrl}${path}?shardIndex=${shardIndex}&shardCount=${shardCount}`
  ))
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
