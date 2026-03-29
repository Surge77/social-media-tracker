import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsCompanies, getJobsOpenings } from '@/lib/jobs/aggregator'
import { withCanonicalMetadata } from '@/lib/seo'

type CompanyDetailPageProps = {
  params: Promise<{ slug: string }>
}

function prettyLabel(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: CompanyDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const label = prettyLabel(slug)

  return withCanonicalMetadata(`/jobs/companies/${slug}`, {
    title: `${label} Hiring Detail`,
    description: `Company-level hiring radar for ${label}, including openings, stack concentration, remote share, and source coverage.`,
  })
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { slug } = await params
  const supabase = createSupabaseAdminClient()
  const [companies, openings] = await Promise.all([
    getJobsCompanies(supabase, { company: slug }),
    getJobsOpenings(supabase, { company: slug, page: 1, pageSize: 12 }),
  ])
  const company = companies.companies.find((entry) => entry.companySlug === slug)

  return (
    <div className="app-page py-8">
      <div className="app-section space-y-6">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to jobs intelligence
        </Link>

        <div className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">Company detail</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{prettyLabel(slug)}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
            Company-level hiring radar showing stack concentration and remote appetite for this employer.
          </p>

          {company ? (
            <>
              <div className="mt-6 grid gap-4 lg:grid-cols-4">
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Openings</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{company.activeOpenings.toLocaleString()}</p>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{company.recentOpenings.toLocaleString()}</p>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remote share</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{Math.round(company.remoteShare)}%</p>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source coverage</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{company.sourceCoverage.toFixed(1)}x</p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-border/60 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top stacks</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {company.topTechnologies.map((technology) => (
                    <span key={technology.slug} className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-foreground">
                      {technology.name} · {technology.openings}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-background/70">
                <div className="grid grid-cols-[minmax(0,1.3fr)_0.8fr_0.8fr_0.8fr] gap-3 border-b border-border/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Opening</span>
                  <span className="text-right">Posted</span>
                  <span className="text-right">Coverage</span>
                  <span className="text-right">Score</span>
                </div>
                <div className="divide-y divide-border/50">
                  {openings.openings.map((opening) => (
                    <div key={opening.id} className="grid grid-cols-[minmax(0,1.3fr)_0.8fr_0.8fr_0.8fr] gap-3 px-5 py-4">
                      <div className="min-w-0">
                        {opening.jobUrl ? (
                          <Link href={opening.jobUrl} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary">
                            {opening.title}
                            <ArrowUpRight className="h-4 w-4 opacity-60" />
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-foreground">{opening.title}</p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">{opening.locationText ?? 'Location unavailable'}</p>
                      </div>
                      <span className="text-right text-sm text-muted-foreground">
                        {opening.postedAt ? new Date(opening.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </span>
                      <span className="text-right text-sm text-muted-foreground">{opening.sourceCount} sources</span>
                      <span className="text-right text-sm font-semibold text-foreground">{Math.round(opening.recommendationScore)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-border/70 bg-background/60 px-5 py-6 text-sm text-muted-foreground">
              No company-specific jobs intelligence is available yet for this company.
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/jobs" className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50">
              Return to dashboard
            </Link>
            <Link href="/jobs" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              See more hiring companies
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
