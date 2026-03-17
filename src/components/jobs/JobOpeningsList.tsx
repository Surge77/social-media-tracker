'use client'

import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, Building2, Clock3, MapPin, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { JobsOpening } from '@/hooks/useJobsAggregator'
import { JobsPagination } from '@/components/jobs/JobsPagination'

function formatMoney(value: number | null, currency: string | null): string | null {
  if (value == null) return null
  if (currency === 'USD' || currency == null) return `$${Math.round(value).toLocaleString()}`
  return `${currency} ${Math.round(value).toLocaleString()}`
}

function formatSalary(opening: JobsOpening): string | null {
  if (opening.salaryMin == null && opening.salaryMax == null) return null
  const min = formatMoney(opening.salaryMin, opening.salaryCurrency)
  const max = formatMoney(opening.salaryMax, opening.salaryCurrency)
  if (min && max) return `${min} - ${max}`
  return min ?? max
}

function formatPostedAt(postedAt: string | null): string {
  if (!postedAt) return 'Date unavailable'
  const date = new Date(postedAt)
  const deltaHours = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60))
  if (deltaHours < 24) return `${deltaHours}h ago`
  return `${Math.max(1, Math.round(deltaHours / 24))}d ago`
}

export function JobOpeningsList({
  openings,
  isLoading,
  page,
  totalPages,
  onPageChange,
  total,
}: {
  openings: JobsOpening[]
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
            Live openings
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Real jobs first, ranked by freshness and source confidence
          </h2>
          {!isLoading && total > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Showing {openings.length} openings on this page from {total.toLocaleString()} matching roles.
            </p>
          )}
        </div>
        <p className="max-w-xl text-sm text-muted-foreground">
          Every opening blends multiple sightings when available, then explains why it is worth paying attention to.
        </p>
      </div>

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="mt-3 h-4 w-1/2" />
                <Skeleton className="mt-4 h-16 w-full" />
              </div>
            ))
          : openings.map((opening) => {
              const salary = formatSalary(opening)
              return (
                <article key={opening.id} className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                          Score {Math.round(opening.recommendationScore)}
                        </span>
                        {opening.sourceBadges.map((badge) => (
                          <span key={`${opening.id}-${badge.source}`} className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                            {badge.label}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {opening.jobUrl ? (
                              <Link href={opening.jobUrl} target="_blank" className="inline-flex items-center gap-1.5 hover:text-primary">
                                {opening.title}
                                <ArrowUpRight className="h-4 w-4 opacity-60" />
                              </Link>
                            ) : (
                              opening.title
                            )}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Building2 className="h-4 w-4" />
                              {opening.companyName ?? 'Unknown company'}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              {opening.locationText ?? (opening.isRemote ? 'Remote' : 'Location unavailable')}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 className="h-4 w-4" />
                              {formatPostedAt(opening.postedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="min-w-[180px] rounded-2xl border border-border/70 bg-background/70 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Why this matters</p>
                          <ul className="mt-2 space-y-2 text-sm text-foreground">
                            {opening.whyThisMatters.map((reason) => (
                              <li key={`${opening.id}-${reason}`} className="flex items-start gap-2">
                                <Sparkles className="mt-0.5 h-3.5 w-3.5 text-primary" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {opening.matchedTechnologies.map((technology) => (
                          <span key={`${opening.id}-${technology.slug}`} className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground">
                            {technology.name}
                          </span>
                        ))}
                        {opening.extractedSkills.map((skill) => (
                          <span key={`${opening.id}-${skill.slug}`} className="rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                            {skill.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid min-w-[210px] grid-cols-2 gap-3 xl:w-[240px]">
                      <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Confidence</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{Math.round(opening.confidenceScore)}</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Coverage</p>
                        <p className="mt-2 text-lg font-semibold text-foreground">{opening.sourceCount} sources</p>
                      </div>
                      <div className="col-span-2 rounded-2xl border border-border/70 bg-background/70 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Compensation</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">{salary ?? 'Salary unavailable'}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {opening.roleLabel ?? 'Role'} · {opening.employmentType ?? 'Type unknown'} · {opening.isRemote ? 'Remote-friendly' : 'On-site or location-bound'}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
      </div>

      {!isLoading && openings.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 p-8 text-center">
          <BriefcaseBusiness className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No openings matched the current stack, role, and market filters.
          </p>
        </div>
      )}

      {!isLoading && total > 0 && (
        <JobsPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </section>
  )
}
