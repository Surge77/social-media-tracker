'use client'

import Link from 'next/link'
import { ArrowRight, Building2, BriefcaseBusiness, MoveUpRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { JobsSectionHeader } from '@/components/jobs/JobsSectionHeader'
import type { HiringNowEntry } from '@/hooks/useJobsIntelligence'

interface HiringNowSectionProps {
  entries: HiringNowEntry[]
  isLoading: boolean
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toLocaleString()
}

export function HiringNowSection({ entries, isLoading }: HiringNowSectionProps) {
  return (
    <section className="space-y-4">
      <JobsSectionHeader
        eyebrow="Hiring now"
        title="Top technologies with live demand"
        description="A job-seeker-first leaderboard balancing total openings, fresh posting flow, company breadth, and remote-friendly demand."
        action={
          <Link
            href="/technologies?sort=jobs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Explore technologies
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-border/70 bg-card/90 shadow-sm">
          <div className="grid grid-cols-[minmax(0,1.6fr)_0.8fr_0.8fr_0.8fr] gap-3 border-b border-border/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Technology</span>
            <span className="text-right">Active</span>
            <span className="text-right">Companies</span>
            <span className="text-right">Remote</span>
          </div>

          <div className="divide-y divide-border/50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-[minmax(0,1.6fr)_0.8fr_0.8fr_0.8fr] gap-3 px-5 py-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="ml-auto h-4 w-14" />
                    <Skeleton className="ml-auto h-4 w-12" />
                    <Skeleton className="ml-auto h-4 w-12" />
                  </div>
                ))
              : entries.slice(0, 5).map((entry) => (
                  <div key={entry.technologySlug} className="grid grid-cols-[minmax(0,1.6fr)_0.8fr_0.8fr_0.8fr] gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <Link
                        href={`/technologies/${entry.technologySlug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        {entry.technologyName}
                        <MoveUpRight className="h-3.5 w-3.5 opacity-60" />
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.trendLabel ?? `${formatCompact(entry.newJobs)} new openings in the current window`}
                      </p>
                    </div>
                    <span className="text-right text-sm font-semibold text-foreground">{formatCompact(entry.activeJobs)}</span>
                    <span className="text-right text-sm text-muted-foreground">{formatCompact(entry.companyCount)}</span>
                    <span className="text-right text-sm text-muted-foreground">{Math.round(entry.remoteRatio * 100)}%</span>
                  </div>
                ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Why these rank</h3>
          <div className="mt-4 space-y-3">
            {[
              { icon: BriefcaseBusiness, label: 'Fresh demand', text: 'New openings matter more than stale total inventory.' },
              { icon: Building2, label: 'Company breadth', text: 'Broader employer spread is a safer signal than one large hiring spike.' },
              { icon: ArrowRight, label: 'Remote-readiness', text: 'Stacks with strong remote share float higher for globally mobile candidates.' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/60 bg-background/60 p-3">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
