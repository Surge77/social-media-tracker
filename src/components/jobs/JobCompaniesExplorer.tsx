'use client'

import Link from 'next/link'
import { Building2, MoveUpRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { JobsCompany } from '@/hooks/useJobsAggregator'
import { JobsPagination } from '@/components/jobs/JobsPagination'

export function JobCompaniesExplorer({
  companies,
  isLoading,
  page,
  totalPages,
  onPageChange,
  total,
}: {
  companies: JobsCompany[]
  isLoading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  total: number
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
            Company radar
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            The employers driving the current stack demand
          </h2>
          {!isLoading && total > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Showing {companies.length} companies on this page from {total.toLocaleString()} matching employers.
            </p>
          )}
        </div>
        <p className="max-w-xl text-sm text-muted-foreground">
          Company cards summarize opening intensity, stack concentration, market spread, and how broad each employer&apos;s source coverage is.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-4 h-20 w-full" />
              </div>
            ))
          : companies.map((company) => (
              <article key={company.companySlug} className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      <Link href={`/jobs/companies/${company.companySlug}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                        {company.companyName}
                        <MoveUpRight className="h-4 w-4 opacity-60" />
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {company.topMarkets.join(' · ') || 'Distributed footprint'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Openings</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">{company.activeOpenings}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Recent</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">{company.recentOpenings}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Remote share</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">{Math.round(company.remoteShare)}%</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Source coverage</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">{company.sourceCoverage.toFixed(1)}x</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {company.topTechnologies.map((technology) => (
                    <span key={`${company.companySlug}-${technology.slug}`} className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground">
                      {technology.name} · {technology.openings}
                    </span>
                  ))}
                </div>
              </article>
            ))}
      </div>

      {!isLoading && total > 0 && (
        <JobsPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </section>
  )
}
