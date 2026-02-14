// src/components/quiz/roadmap/RoadmapSkeleton.tsx
// Loading skeleton for roadmap generation

'use client'

import { cn } from '@/lib/utils'

export function RoadmapSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-3/4 bg-muted rounded-lg" />
        <div className="h-4 w-1/2 bg-muted rounded-lg" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded-lg" />
          </div>
        ))}
      </div>

      {/* Phase cards skeleton */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-6 space-y-4">
            {/* Phase header */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-4 w-48 bg-muted rounded" />
              </div>
              <div className="h-10 w-10 bg-muted rounded-full" />
            </div>

            {/* Nodes skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted rounded-full" />
                    <div className="h-6 w-20 bg-muted rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RoadmapNodeSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("border border-border rounded-lg p-4 space-y-3 animate-pulse", className)}>
      <div className="h-5 w-3/4 bg-muted rounded" />
      <div className="h-3 w-1/2 bg-muted rounded" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-muted rounded-full" />
        <div className="h-6 w-20 bg-muted rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-5/6 bg-muted rounded" />
      </div>
    </div>
  )
}
