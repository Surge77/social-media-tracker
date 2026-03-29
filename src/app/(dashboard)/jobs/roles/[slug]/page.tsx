import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsRoleRows } from '@/lib/jobs/intelligence'
import { withCanonicalMetadata } from '@/lib/seo'

type RoleDetailPageProps = {
  params: Promise<{ slug: string }>
}

function prettyLabel(slug: string) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: RoleDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const label = prettyLabel(slug)

  return withCanonicalMetadata(`/jobs/roles/${slug}`, {
    title: `${label} Hiring Detail`,
    description: `Hiring demand, growth, and remote-share detail for ${label} roles within the DevTrends jobs intelligence surface.`,
  })
}

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
  const { slug } = await params
  const supabase = createSupabaseAdminClient()
  const rows = (await getJobsRoleRows(supabase)).filter((entry) => entry.roleSlug === slug)

  return (
    <div className="app-page py-8">
      <div className="app-section space-y-6">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to jobs intelligence
        </Link>

        <div className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">Role detail</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">{prettyLabel(slug)}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
            Hiring intelligence for this role family, ranked by the technologies currently showing the strongest demand and strongest near-term growth.
          </p>

          {rows.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-background/70">
              <div className="grid grid-cols-[minmax(0,1.2fr)_0.8fr_0.8fr_0.8fr] gap-3 border-b border-border/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Technology</span>
                <span className="text-right">Active</span>
                <span className="text-right">Growth</span>
                <span className="text-right">Remote</span>
              </div>
              <div className="divide-y divide-border/50">
                {rows.map((row) => (
                  <div key={`${row.roleSlug}-${row.technologySlug}`} className="grid grid-cols-[minmax(0,1.2fr)_0.8fr_0.8fr_0.8fr] gap-3 px-5 py-4">
                    <Link href={`/technologies/${row.technologySlug}`} className="min-w-0 text-sm font-semibold text-foreground transition-colors hover:text-primary">
                      {row.technologyName}
                    </Link>
                    <span className="text-right text-sm text-foreground">{row.activeJobs.toLocaleString()}</span>
                    <span className={`text-right text-sm font-medium ${row.growth7d >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.growth7d >= 0 ? '+' : ''}{row.growth7d.toFixed(1)}
                    </span>
                    <span className="text-right text-sm text-muted-foreground">{Math.round(row.remoteRatio)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-border/70 bg-background/60 px-5 py-6 text-sm text-muted-foreground">
              No role-specific jobs intelligence is available yet for this family.
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/jobs" className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50">
              Return to dashboard
            </Link>
            <Link href="/jobs" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Explore other role families
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
