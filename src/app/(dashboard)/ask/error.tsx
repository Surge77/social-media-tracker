'use client'

import Link from 'next/link'

export default function AskError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">AI chat didn&apos;t load</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {error.message || 'There was a problem connecting to the AI. Try again in a moment.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
