import { Skeleton } from '@/components/ui/skeleton'

export default function TechnologiesLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="mb-2 h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Table skeleton */}
      <div className="hidden rounded-lg border border-border bg-card/30 md:block">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex gap-6">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 border-b border-border/50 px-4 py-4">
            <Skeleton className="h-4 w-6" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-3 rounded-full" />
              <div>
                <Skeleton className="mb-1 h-5 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-12 rounded-md" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>

      {/* Card grid skeleton (mobile) */}
      <div className="grid gap-4 sm:grid-cols-2 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card/30 p-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-8 w-12 rounded-md" />
            </div>
            <div className="mb-3 flex gap-2">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
            <Skeleton className="mb-3 h-4 w-full" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
