import { Skeleton } from '@/components/ui/skeleton'

export default function CompareLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="mb-2 h-10 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Selector */}
      <div className="mb-8 rounded-lg border border-border bg-card/30 p-4">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Chart */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-40" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>

      {/* Table */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-6 w-44" />
        <div className="rounded-lg border border-border bg-card/30">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 px-4 py-3">
              <Skeleton className="h-4 w-28" />
              <div className="flex gap-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
