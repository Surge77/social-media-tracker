'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export function TrendChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 animate-pulse', className)}>
      {/* Metric toggles skeleton */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-20 rounded-md bg-muted" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-[300px] sm:h-[350px] md:h-[400px] rounded-lg bg-muted" />

      {/* Legend skeleton */}
      <div className="flex gap-4">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-4 w-28 rounded bg-muted" />
      </div>
    </div>
  )
}

export function DimensionBreakdownSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 animate-pulse', className)}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-card/30 p-4">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
            </div>
            <div className="h-7 w-16 rounded-md bg-muted" />
          </div>

          {/* Insight */}
          <div className="mb-3 h-12 rounded-md bg-muted" />

          {/* Score bars */}
          <div className="space-y-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-6 flex-1 rounded bg-muted" />
                <div className="h-4 w-8 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function CareerScorecardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card/30 p-6 animate-pulse', className)}>
      {/* Header */}
      <div className="mb-5 space-y-2">
        <div className="h-5 w-48 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>

      {/* Tech cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card/50 p-4">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
              </div>
              <div className="h-6 w-16 rounded bg-muted" />
            </div>

            {/* Metrics grid */}
            <div className="mb-3 grid gap-2 grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="rounded-md border border-border bg-background/50 p-2.5">
                  <div className="mb-1 h-3 w-20 rounded bg-muted" />
                  <div className="h-4 w-16 rounded bg-muted" />
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="mb-3 h-16 rounded-md bg-muted" />

            {/* Advice */}
            <div className="h-12 rounded-md bg-muted" />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-5 h-20 rounded-lg bg-muted" />
    </div>
  )
}
