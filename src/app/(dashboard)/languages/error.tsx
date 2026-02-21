'use client'

export default function LanguagesError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-lg font-semibold text-foreground">Language rankings didn&apos;t load</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        {error.message || 'There was a problem fetching language ranking data. Try again in a moment.'}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  )
}
