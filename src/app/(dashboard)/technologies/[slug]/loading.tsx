import { Skeleton } from '@/components/ui/skeleton'

export default function TechnologyDetailLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Back button */}
      <Skeleton className="mb-6 h-5 w-16" />

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <Skeleton className="mb-2 h-9 w-48" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-12 w-16 rounded-lg" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
      </div>

      {/* Recommendation card */}
      <div className="mb-8 rounded-lg border border-border/50 bg-muted/10 p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-1 h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-36" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-muted/10 p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded" />
                  <div>
                    <Skeleton className="mb-1 h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-8 w-12 rounded-md" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="mt-2 h-3 w-48" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-28" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>

      {/* Signals */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-muted/10 p-4">
              <Skeleton className="mb-3 h-5 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
