import { beforeEach, describe, expect, it, vi } from 'vitest'

const { runCronStepWithRetry, insertFetchLog } = vi.hoisted(() => ({
  runCronStepWithRetry: vi.fn(),
  insertFetchLog: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    from: (table: string) => {
      if (table !== 'fetch_logs') {
        throw new Error(`Unexpected table: ${table}`)
      }

      return {
        insert: insertFetchLog,
      }
    },
  }),
}))

vi.mock('@/lib/cron/orchestrator', () => ({
  buildShardedCronStepUrls: vi.fn((baseUrl: string, path: string, shardCount = 1) =>
    shardCount <= 1
      ? [`${baseUrl}${path}`]
      : Array.from({ length: shardCount }, (_, shardIndex) =>
          `${baseUrl}${path}?shardIndex=${shardIndex}&shardCount=${shardCount}`
        )
  ),
  buildInternalCronHeaders: vi.fn(() => ({ 'x-internal-cron': 'top-secret' })),
  hasCronSecretConfigError: vi.fn(() => false),
  isAuthorizedScheduledRequest: vi.fn(() => true),
  resolveCronBaseUrl: vi.fn(() => 'https://devtrends.pro'),
  runCronStepWithRetry,
}))

import { GET } from '@/app/api/cron/fetch-daily/route'

describe('GET /api/cron/fetch-daily', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    insertFetchLog.mockResolvedValue({ error: null })
  })

  it('fans out fetch batches without running scoring inline', async () => {
    runCronStepWithRetry.mockResolvedValue({
      ok: true,
      status: 200,
      attemptCount: 1,
    })

    const response = await GET(new Request('https://devtrends.pro/api/cron/fetch-daily'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(runCronStepWithRetry).toHaveBeenCalledTimes(27)
    expect(runCronStepWithRetry).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'scoring' })
    )
    expect(runCronStepWithRetry).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://devtrends.pro/api/cron/fetch-daily/batch-4a?shardIndex=11&shardCount=12',
      })
    )
    expect(body.success).toBe(true)
    expect(body.stepResults).toHaveLength(27)
  })

  it('does not run scoring when a fetch batch fails', async () => {
    runCronStepWithRetry
      .mockResolvedValueOnce({
        name: 'fetcher-1',
        url: 'https://devtrends.pro/api/cron/fetch-daily/batch-1?shardIndex=0&shardCount=6',
        ok: false,
        status: 401,
        attemptCount: 2,
        error: 'HTTP 401',
      })
      .mockResolvedValue({
        ok: true,
        status: 200,
        attemptCount: 1,
      })

    const response = await GET(new Request('https://devtrends.pro/api/cron/fetch-daily'))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(runCronStepWithRetry).toHaveBeenCalledTimes(27)
    expect(runCronStepWithRetry).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'scoring' })
    )
    expect(body.failedSteps).toHaveLength(1)
  })
})
