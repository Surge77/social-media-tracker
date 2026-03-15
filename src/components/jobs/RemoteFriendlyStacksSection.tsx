'use client'

import { Globe2, LaptopMinimalCheck } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { JobsSectionHeader } from '@/components/jobs/JobsSectionHeader'
import type { RemoteFriendlyStackEntry } from '@/hooks/useJobsIntelligence'

interface RemoteFriendlyStacksSectionProps {
  entries: RemoteFriendlyStackEntry[]
  isLoading: boolean
}

export function RemoteFriendlyStacksSection({ entries, isLoading }: RemoteFriendlyStacksSectionProps) {
  return (
    <section className="space-y-4">
      <JobsSectionHeader
        eyebrow="Remote-friendly stacks"
        title="Technologies with strong distributed hiring"
        description="Remote share highlights where globally accessible hiring is concentrated, not just where absolute openings are largest."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))
          : entries.slice(0, 3).map((entry) => (
              <div key={entry.technologySlug} className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remote readiness</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{entry.technologyName}</h3>
                  </div>
                  <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-400">
                    <LaptopMinimalCheck className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remote-heavy share</span>
                    <span className="font-semibold text-foreground">{Math.round(entry.remoteRatio * 100)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                      style={{ width: `${Math.round(entry.remoteRatio * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/60 px-3 py-2.5">
                  <span className="text-sm text-muted-foreground">Openings tracked</span>
                  <span className="text-sm font-semibold text-foreground">{entry.activeJobs.toLocaleString()}</span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Most common role families</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from(new Set(entry.topRoles)).map((role) => (
                      <span key={`${entry.technologySlug}-${role}`} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-foreground">
                        <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
      </div>
    </section>
  )
}
