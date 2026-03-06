import { describe, expect, it } from 'vitest'

import {
  isAuthorizedCronRequest,
  isAuthorizedScheduledRequest,
} from '@/lib/cron/orchestrator'

describe('cron auth helpers', () => {
  const env = {
    CRON_SECRET: 'top-secret',
    VERCEL_ENV: 'production',
  }

  it('accepts Vercel bearer auth for scheduled entry routes', () => {
    const request = new Request('https://example.com/api/cron/fetch-daily', {
      headers: {
        authorization: 'Bearer top-secret',
      },
    })

    expect(isAuthorizedScheduledRequest(request, env)).toBe(true)
  })

  it('rejects internal-only auth for scheduled entry routes', () => {
    const request = new Request('https://example.com/api/cron/fetch-daily', {
      headers: {
        'x-internal-cron': 'top-secret',
      },
    })

    expect(isAuthorizedScheduledRequest(request, env)).toBe(false)
  })

  it('accepts internal fan-out auth for child cron routes', () => {
    const request = new Request('https://example.com/api/cron/fetch-daily/batch-1', {
      headers: {
        'x-internal-cron': 'top-secret',
      },
    })

    expect(isAuthorizedCronRequest(request, env)).toBe(true)
  })
})
