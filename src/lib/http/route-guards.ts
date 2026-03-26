type RouteGuardEnv = Record<string, string | undefined> & {
  ADMIN_API_SECRET?: string
  NODE_ENV?: string
  VERCEL_ENV?: string
}

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status })
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  return realIp || 'unknown'
}

export function requireDevelopmentOnly(env: RouteGuardEnv): Response | null {
  if (env.NODE_ENV === 'development') {
    return null
  }

  return jsonError('Not found', 404)
}

function getAdminSecret(env: RouteGuardEnv): string | null {
  const secret = env.ADMIN_API_SECRET?.trim()
  return secret ? secret : null
}

function matchesAdminSecret(request: Request, secret: string): boolean {
  const bearer = request.headers.get('authorization')
  if (bearer === `Bearer ${secret}`) {
    return true
  }

  return request.headers.get('x-admin-secret') === secret
}

export function requireAdminAccess(
  request: Request,
  env: RouteGuardEnv
): Response | null {
  const secret = getAdminSecret(env)
  if (!secret) {
    return jsonError('Admin route is not configured', 500)
  }

  if (matchesAdminSecret(request, secret)) {
    return null
  }

  return jsonError('Unauthorized', 401)
}
