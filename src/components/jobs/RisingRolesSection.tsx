'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { JobsSectionHeader } from '@/components/jobs/JobsSectionHeader'
import type { RisingRoleEntry } from '@/hooks/useJobsIntelligence'

interface RisingRolesSectionProps {
  entries: RisingRoleEntry[]
  isLoading: boolean
}

function formatDelta(value: number) {
  const prefix = value >= 0 ? '+' : ''
  return `${prefix}${Math.round(value)}%`
}

export function RisingRolesSection({ entries, isLoading }: RisingRolesSectionProps) {
  return (
    <section className="space-y-4">
      <JobsSectionHeader
        eyebrow="Rising roles"
        title="Fastest-growing role and stack combinations"
        description="Growth-ranked pairings that are gaining speed now, even when their total volume is still below the obvious incumbents."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))
          : entries.slice(0, 6).map((entry) => (
              <div key={`${entry.roleSlug}-${entry.technologySlug}`} className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                    {entry.roleLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    {formatDelta(entry.growth7d)}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-lg font-semibold tracking-tight text-foreground">{entry.technologyName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.activeJobs.toLocaleString()} active roles across {entry.companyCount.toLocaleString()} companies
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
                    style={{ width: `${Math.min(Math.max(entry.remoteRatio * 100, 12), 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Remote share: {Math.round(entry.remoteRatio * 100)}%
                </p>

                <div className="mt-4">
                  <Link
                    href={`/jobs/roles/${entry.roleSlug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    View role detail
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
      </div>
    </section>
  )
}
