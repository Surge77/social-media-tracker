'use client'

import React from 'react'
import { Calendar, Sparkles, Clock, ChevronLeft, ChevronRight, LayoutList } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeeklyDigest } from '@/lib/ai/generators/weekly-digest'

interface AvailableWeek {
  week_start: string
  generated_at: string
}

interface DigestHeaderProps {
  weekStart: string
  generatedAt: string
  digest: WeeklyDigest
  availableWeeks: AvailableWeek[]
  selectedWeek: string
  onWeekChange: (week: string) => void
}

function calcReadTime(digest: WeeklyDigest): number {
  const allText = [
    ...digest.sections.map((s) => s.narrative),
    ...digest.keyTakeaways,
  ].join(' ')
  const words = allText.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function formatWeekRange(weekStart: string) {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

function formatWeekLabel(weekStart: string) {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export function DigestHeader({
  weekStart,
  generatedAt,
  digest,
  availableWeeks,
  selectedWeek,
  onWeekChange,
}: DigestHeaderProps) {
  const readTime = calcReadTime(digest)
  const weekRange = formatWeekRange(weekStart)

  const currentIndex = availableWeeks.findIndex((w) => w.week_start === selectedWeek)
  const hasPrev = currentIndex < availableWeeks.length - 1
  const hasNext = currentIndex > 0

  const generatedDate = new Date(generatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-4">
      {/* AI badge */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">AI-Generated Intelligence</span>
      </div>

      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Weekly Digest
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{weekRange}</span>
            </div>
            <span className="text-border">·</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{readTime} min read</span>
            </div>
            <span className="text-border">·</span>
            <div className="flex items-center gap-1.5">
              <LayoutList className="h-3.5 w-3.5" />
              <span>{digest.sections.length} sections</span>
            </div>
            <span className="text-border">·</span>
            <span>Updated {generatedDate}</span>
          </div>
        </div>

        {/* Archive navigation */}
        {availableWeeks.length > 1 && (
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card/50 p-1">
            <button
              onClick={() => hasPrev && onWeekChange(availableWeeks[currentIndex + 1].week_start)}
              disabled={!hasPrev}
              className={cn(
                'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                hasPrev
                  ? 'text-foreground hover:bg-muted'
                  : 'cursor-not-allowed text-muted-foreground/40'
              )}
              title="Previous week"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>

            {/* Week dropdown */}
            <select
              value={selectedWeek}
              onChange={(e) => onWeekChange(e.target.value)}
              className="rounded-md bg-muted/50 px-2 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {availableWeeks.map((w) => (
                <option key={w.week_start} value={w.week_start}>
                  {formatWeekLabel(w.week_start)}
                </option>
              ))}
            </select>

            <button
              onClick={() => hasNext && onWeekChange(availableWeeks[currentIndex - 1].week_start)}
              disabled={!hasNext}
              className={cn(
                'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
                hasNext
                  ? 'text-foreground hover:bg-muted'
                  : 'cursor-not-allowed text-muted-foreground/40'
              )}
              title="Next week"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
