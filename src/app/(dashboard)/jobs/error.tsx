'use client'

export default function JobsError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="app-page py-8">
      <div className="flex min-h-[620px] items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-sm text-destructive">
            {error.message || 'There was a problem loading jobs intelligence.'}
          </p>
          <button
            onClick={() => reset()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  )
}
