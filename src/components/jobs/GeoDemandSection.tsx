'use client'

import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { JobsSectionHeader } from '@/components/jobs/JobsSectionHeader'
import type { GeoDemandEntry } from '@/hooks/useJobsIntelligence'

interface GeoDemandSectionProps {
  entries: GeoDemandEntry[]
  isLoading: boolean
}

export function GeoDemandSection({ entries, isLoading }: GeoDemandSectionProps) {
  const maxValue = Math.max(...entries.map((entry) => entry.activeJobs), 1)

  return (
    <section className="space-y-4">
      <JobsSectionHeader
        eyebrow="Geo demand"
        title="Where each stack is hiring strongest"
        description="A ranked geographic demand view without the overhead and ambiguity of an interactive map."
      />

      <div className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <div className="space-y-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                <>
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </>
                </div>
              ))
            : entries.slice(0, 5).map((entry) => (
                <div key={`${entry.locationSlug}-${entry.topTechnology ?? 'mixed'}`} className="space-y-2">
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/jobs/locations/${entry.locationSlug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary">
                        <MapPin className="h-4 w-4 text-amber-400" />
                        {entry.locationLabel}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Top stack: {entry.topTechnology ?? 'Mixed demand'} · Remote share {Math.round(entry.remoteRatio * 100)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{entry.activeJobs.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{entry.locationType ?? 'market'}</p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
                      style={{ width: `${Math.max(12, (entry.activeJobs / maxValue) * 100)}%` }}
                    />
                  </div>
                </>
                </div>
              ))}
        </div>

        {!isLoading && entries.length > 0 && (
          <div className="mt-5 border-t border-border/60 pt-4">
            <Link href={`/jobs/locations/${entries[0].locationSlug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Drill into the hottest market
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
