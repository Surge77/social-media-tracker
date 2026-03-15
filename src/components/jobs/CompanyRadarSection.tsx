'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { JobsSectionHeader } from '@/components/jobs/JobsSectionHeader'
import type { CompanyRadarEntry } from '@/hooks/useJobsIntelligence'

interface CompanyRadarSectionProps {
  entries: CompanyRadarEntry[]
  isLoading: boolean
}

export function CompanyRadarSection({ entries, isLoading }: CompanyRadarSectionProps) {
  return (
    <section className="space-y-4">
      <JobsSectionHeader
        eyebrow="Company radar"
        title="Which companies are hiring which stacks"
        description="Company-level demand surfaces repeated stack signals, location spread, and remote appetite without forcing users through a raw listings feed."
      />

      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-sm">
        <div className="hidden grid-cols-[minmax(0,1.15fr)_0.9fr_0.8fr_0.8fr] gap-3 border-b border-border/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span>Company</span>
          <span>Stacks</span>
          <span className="text-right">Openings</span>
          <span className="text-right">Remote</span>
        </div>

        <div className="divide-y divide-border/50">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="px-5 py-4">
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1.15fr)_0.9fr_0.8fr_0.8fr]">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="ml-auto h-4 w-14" />
                    <Skeleton className="ml-auto h-4 w-12" />
                  </div>
                </div>
              ))
            : entries.slice(0, 5).map((entry) => (
                <div key={entry.companySlug} className="px-5 py-4">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1.15fr)_0.9fr_0.8fr_0.8fr]">
                  <div className="min-w-0">
                    <Link href={`/jobs/companies/${entry.companySlug}`} className="text-sm font-semibold text-foreground transition-colors hover:text-primary">
                      {entry.companyName}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {entry.topLocations.slice(0, 2).join(' · ') || 'Distributed hiring footprint'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(entry.topTechnologies.slice(0, 3))).map((technology) => (
                      <span key={`${entry.companySlug}-${technology}`} className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-foreground">
                        {technology}
                      </span>
                    ))}
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{entry.activeJobs.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">open now</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{Math.round(entry.remoteRatio * 100)}%</p>
                    <p className="text-xs text-muted-foreground">remote share</p>
                  </div>
                </div>
                </div>
              ))}
        </div>

        {!isLoading && entries.length > 0 && (
          <div className="border-t border-border/60 px-5 py-3">
            <Link href={`/jobs/companies/${entries[0].companySlug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Start with the most active company
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
