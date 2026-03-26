import { describe, expect, it } from 'vitest'

import {
  getClientIp,
  requireAdminAccess,
  requireDevelopmentOnly,
} from '@/lib/http/route-guards'

describe('route guards', () => {
  it('extracts the first forwarded IP address', () => {
    const request = new Request('http://localhost/api/test', {
      headers: {
        'x-forwarded-for': '203.0.113.1, 10.0.0.1',
      },
    })

    expect(getClientIp(request)).toBe('203.0.113.1')
  })

  it('blocks development-only routes outside development', async () => {
    const result = requireDevelopmentOnly({
      NODE_ENV: 'production',
    })

    expect(result).not.toBeNull()
    expect(result?.status).toBe(404)
    await expect(result?.json()).resolves.toEqual({ error: 'Not found' })
  })

  it('rejects admin routes when the secret is missing or invalid', async () => {
    const request = new Request('http://localhost/api/admin/data-health')

    const result = requireAdminAccess(request, {
      ADMIN_API_SECRET: 'top-secret',
    })

    expect(result).not.toBeNull()
    expect(result?.status).toBe(401)
    await expect(result?.json()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('allows admin routes with a matching bearer token', () => {
    const request = new Request('http://localhost/api/admin/data-health', {
      headers: {
        authorization: 'Bearer top-secret',
      },
    })

    const result = requireAdminAccess(request, {
      ADMIN_API_SECRET: 'top-secret',
    })

    expect(result).toBeNull()
  })
})
