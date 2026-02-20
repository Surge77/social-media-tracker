/**
 * Next.js Instrumentation Hook
 *
 * Called once when the server process starts.
 * In development: starts the dev scheduler so data stays fresh for demos.
 * In production: no-op (Vercel crons handle scheduling).
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run in the Node.js runtime (not the Edge runtime)
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // Only run in development — production uses Vercel crons
  if (process.env.NODE_ENV !== 'development') return

  const { startDevScheduler } = await import('@/lib/dev-scheduler')
  startDevScheduler()
}
