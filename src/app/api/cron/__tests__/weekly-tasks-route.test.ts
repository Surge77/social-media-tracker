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
  buildInternalBearerHeaders: vi.fn(() => ({
    Authorization: 'Bearer top-secret',
    'Content-Type': 'application/json',
  })),
  buildInternalCronHeaders: vi.fn(() => ({ 'x-internal-cron': 'top-secret' })),
  hasCronSecretConfigError: vi.fn(() => false),
  isAuthorizedScheduledRequest: vi.fn(() => true),
  resolveCronBaseUrl: vi.fn(() => 'https://devtrends.pro'),
  runCronStepWithRetry,
}))

import { GET } from '@/app/api/cron/weekly-tasks/route'

describe('GET /api/cron/weekly-tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    insertFetchLog.mockResolvedValue({ error: null })
  })

  it('returns partial success when only jobs intelligence fails', async () => {
    runCronStepWithRetry
      .mockResolvedValueOnce({
        name: 'fetch-weekly',
        url: 'https://devtrends.pro/api/cron/fetch-weekly',
        ok: true,
        status: 200,
        attemptCount: 1,
      })
      .mockResolvedValueOnce({
        name: 'jobs-intelligence',
        url: 'https://devtrends.pro/api/cron/fetch-weekly/jobs-intelligence',
        ok: false,
        status: 500,
        attemptCount: 2,
        error: 'HTTP 500',
      })
      .mockResolvedValueOnce({
        name: 'digest-generate',
        url: 'https://devtrends.pro/api/ai/digest/generate',
        ok: true,
        status: 200,
        attemptCount: 1,
      })
      .mockResolvedValueOnce({
        name: 'cleanup',
        url: 'https://devtrends.pro/api/cron/cleanup',
        ok: true,
        status: 200,
        attemptCount: 1,
      })

    const response = await GET(new Request('https://devtrends.pro/api/cron/weekly-tasks'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.partial).toBe(true)
    expect(body.failedSteps).toEqual([
      expect.objectContaining({
        name: 'jobs-intelligence',
        ok: false,
      }),
    ])
    expect(insertFetchLog).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'weekly_tasks_orchestrator',
        status: 'partial',
        error_message: 'jobs-intelligence: HTTP 500',
      })
    )
  })

  it('fails when a required weekly step fails', async () => {
    runCronStepWithRetry
      .mockResolvedValueOnce({
        name: 'fetch-weekly',
        url: 'https://devtrends.pro/api/cron/fetch-weekly',
        ok: false,
        status: 500,
        attemptCount: 2,
        error: 'HTTP 500',
      })
      .mockResolvedValueOnce({
        name: 'jobs-intelligence',
        url: 'https://devtrends.pro/api/cron/fetch-weekly/jobs-intelligence',
        ok: true,
        status: 200,
        attemptCount: 1,
      })
      .mockResolvedValueOnce({
        name: 'digest-generate',
        url: 'https://devtrends.pro/api/ai/digest/generate',
        ok: true,
        status: 200,
        attemptCount: 1,
      })
      .mockResolvedValueOnce({
        name: 'cleanup',
        url: 'https://devtrends.pro/api/cron/cleanup',
        ok: true,
        status: 200,
        attemptCount: 1,
      })

    const response = await GET(new Request('https://devtrends.pro/api/cron/weekly-tasks'))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.failedSteps).toEqual([
      expect.objectContaining({
        name: 'fetch-weekly',
        ok: false,
      }),
    ])
    expect(insertFetchLog).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'weekly_tasks_orchestrator',
        status: 'failed',
        error_message: 'fetch-weekly: HTTP 500',
      })
    )
  })
})
