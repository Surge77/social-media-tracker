import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsLocationRows } from '@/lib/jobs/intelligence'

type LocationDetailPageProps = {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Location Demand Detail',
  description: 'Location-level hiring detail within the jobs intelligence surface.',
}

function prettyLabel(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default async function LocationDetailPage({ params }: LocationDetailPageProps) {
  const { slug } = await params
  const supabase = createSupabaseAdminClient()
  const rows = (await getJobsLocationRows(supabase)).filter((entry) => entry.locationSlug === slug)
  const headline = rows[0]

  return (
    <div className="app-page py-8">
      <div className="app-section space-y-6">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to jobs intelligence
        </Link>

        <div className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">Location detail</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{prettyLabel(slug)}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
            Market-level demand snapshot showing which technologies have the strongest hiring presence in this location.
          </p>

          {rows.length > 0 ? (
            <>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Openings</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{headline?.activeJobs.toLocaleString()}</p>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remote share</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{Math.round(headline?.remoteRatio ?? 0)}%</p>
                </div>
                <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tracked companies</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{headline?.companyCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-background/70">
                <div className="grid grid-cols-[minmax(0,1.2fr)_0.8fr_0.8fr] gap-3 border-b border-border/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Technology</span>
                  <span className="text-right">Active</span>
                  <span className="text-right">Remote</span>
                </div>
                <div className="divide-y divide-border/50">
                  {rows.map((row) => (
                    <div key={`${row.locationSlug}-${row.technologySlug}`} className="grid grid-cols-[minmax(0,1.2fr)_0.8fr_0.8fr] gap-3 px-5 py-4">
                      <Link href={`/technologies/${row.technologySlug}`} className="text-sm font-semibold text-foreground transition-colors hover:text-primary">
                        {row.technologyName}
                      </Link>
                      <span className="text-right text-sm text-foreground">{row.activeJobs.toLocaleString()}</span>
                      <span className="text-right text-sm text-muted-foreground">{Math.round(row.remoteRatio)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-border/70 bg-background/60 px-5 py-6 text-sm text-muted-foreground">
              No location-specific jobs intelligence is available yet for this market.
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/jobs" className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50">
              Return to dashboard
            </Link>
            <Link href="/jobs" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Browse hotter markets
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
