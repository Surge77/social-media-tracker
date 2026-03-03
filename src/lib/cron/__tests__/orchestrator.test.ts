import { describe, expect, it } from 'vitest'
import { buildInternalCronHeaders, hasCronSecretConfigError } from '@/lib/cron/orchestrator'

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
})
