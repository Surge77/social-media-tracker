import { describe, expect, it } from 'vitest'
import {
  buildShardedCronStepUrls,
  buildInternalCronHeaders,
  hasCronSecretConfigError,
  resolveCronBaseUrl,
  resolveCronShardConfig,
  selectItemsForCronShard,
} from '@/lib/cron/orchestrator'

describe('cron orchestrator helpers', () => {
  it('fails fast in production when CRON_SECRET is missing', () => {
    expect(
      hasCronSecretConfigError({ VERCEL_ENV: 'production', CRON_SECRET: undefined })
    ).toBe(true)
  })

  it('allows missing CRON_SECRET outside production', () => {
    expect(
      hasCronSecretConfigError({ VERCEL_ENV: 'preview', CRON_SECRET: undefined })
    ).toBe(false)
  })

  it('builds internal auth header when secret exists', () => {
    expect(
      buildInternalCronHeaders({ VERCEL_ENV: 'production', CRON_SECRET: 'abc123' })
    ).toEqual({ 'x-internal-cron': 'abc123' })
  })

  it('prefers the incoming request origin for cron fan-out', () => {
    const request = new Request('https://devtrends.pro/api/cron/fetch-daily')

    expect(
      resolveCronBaseUrl(request, {
        VERCEL_ENV: 'production',
        VERCEL_URL: 'generated-preview-url.vercel.app',
        NEXT_PUBLIC_APP_URL: 'https://fallback.example.com',
      })
    ).toBe('https://devtrends.pro')
  })

  it('falls back to env urls when request origin is unavailable', () => {
    expect(
      resolveCronBaseUrl(
        { url: 'not-a-valid-url' } as Request,
        {
          VERCEL_ENV: 'production',
          NEXT_PUBLIC_APP_URL: 'https://fallback.example.com',
          VERCEL_URL: 'generated-preview-url.vercel.app',
        }
      )
    ).toBe('https://fallback.example.com')
  })

  it('parses shard config from the request url', () => {
    const request = new Request(
      'https://devtrends.pro/api/cron/fetch-daily/batch-1?shardIndex=2&shardCount=6'
    )

    expect(resolveCronShardConfig(request)).toEqual({
      shardIndex: 2,
      shardCount: 6,
    })
  })

  it('selects a deterministic subset for a shard', () => {
    expect(
      selectItemsForCronShard(
        ['a', 'b', 'c', 'd', 'e', 'f'],
        { shardIndex: 1, shardCount: 3 }
      )
    ).toEqual(['b', 'e'])
  })

  it('builds sharded cron step urls', () => {
    expect(
      buildShardedCronStepUrls(
        'https://devtrends.pro',
        '/api/cron/fetch-daily/batch-1',
        3
      )
    ).toEqual([
      'https://devtrends.pro/api/cron/fetch-daily/batch-1?shardIndex=0&shardCount=3',
      'https://devtrends.pro/api/cron/fetch-daily/batch-1?shardIndex=1&shardCount=3',
      'https://devtrends.pro/api/cron/fetch-daily/batch-1?shardIndex=2&shardCount=3',
    ])
  })
})
