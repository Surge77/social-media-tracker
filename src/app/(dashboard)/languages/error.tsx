'use client'

export default function LanguagesError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
      <p className="text-sm text-destructive">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  )
}
