import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsCompanyRows } from '@/lib/jobs/intelligence'

type CompanyDetailPageProps = {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Company Hiring Detail',
  description: 'Company-level hiring detail within the jobs intelligence surface.',
}

function prettyLabel(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { slug } = await params
  const supabase = createSupabaseAdminClient()
  const company = (await getJobsCompanyRows(supabase)).find((entry) => entry.companySlug === slug)

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
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Openings</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{company.activeJobs.toLocaleString()}</p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remote share</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{Math.round(company.remoteRatio)}%</p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top stacks</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {company.topTechnologies.map((technology) => (
                    <span key={technology.slug} className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-foreground">
                      {technology.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
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
