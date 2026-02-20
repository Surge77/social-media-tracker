'use client'

import React from 'react'
import Link from 'next/link'
import { Star, Briefcase, MessageSquare, TrendingUp } from 'lucide-react'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import type { TechnologyCategory } from '@/types'

interface Alternative {
  slug: string
  name: string
  category: TechnologyCategory
  description: string | null
  color: string | null
  github_repo: string | null
  stars: number | null
  forks: number | null
  stackoverflow_questions: number | null
  job_listings: number
  composite_score: number | null
}

interface AlternativesPanelProps {
  slug: string
}

function formatNumber(n: number | null): string {
  if (n === null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function MetricCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

// "vs" comparison strip — highlight which alt leads each metric
function LeadsIn({ alts, metric }: { alts: Alternative[]; metric: keyof Alternative }) {
  const values = alts.map((a) => Number(a[metric] ?? 0))
  const maxVal = Math.max(...values)
  if (maxVal === 0) return null

  const leader = alts[values.indexOf(maxVal)]
  const metricLabels: Partial<Record<keyof Alternative, string>> = {
    stars: 'stars',
    stackoverflow_questions: 'SO questions',
    job_listings: 'jobs',
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span className="font-medium text-foreground">{leader.name}</span>
      <span className="text-muted-foreground">leads in {metricLabels[metric]}</span>
    </span>
  )
}

export function AlternativesPanel({ slug }: AlternativesPanelProps) {
  const [alts, setAlts] = React.useState<Alternative[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`/api/technologies/${slug}/alternatives`)
      .then((r) => r.json())
      .then((data) => {
        setAlts(data.alternatives ?? [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [slug])

  if (isLoading) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-border bg-muted/20">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (alts.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">No alternatives found</p>
      </div>
    )
  }

  // Determine leaders per metric for the "vs" strip
  const hasStars = alts.some((a) => a.stars !== null)
  const hasSO = alts.some((a) => a.stackoverflow_questions !== null)
  const hasJobs = alts.some((a) => a.job_listings > 0)

  return (
    <div className="space-y-4">
      {/* Alternatives grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {alts.map((alt) => (
          <Link
            key={alt.slug}
            href={`/technologies/${alt.slug}`}
            className="group block rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50 hover:shadow-lg"
          >
            {/* Name + category */}
            <div className="mb-2">
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {alt.name}
              </h4>
              <div className="mt-1">
                <CategoryBadge category={alt.category} size="sm" />
              </div>
            </div>

            {/* Description */}
            {alt.description && (
              <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{alt.description}</p>
            )}

            {/* Metrics row */}
            <div className="flex justify-around border-t border-border pt-3">
              <MetricCell
                icon={<Star size={11} />}
                label="Stars"
                value={formatNumber(alt.stars)}
              />
              <MetricCell
                icon={<MessageSquare size={11} />}
                label="SO Q's"
                value={formatNumber(alt.stackoverflow_questions)}
              />
              <MetricCell
                icon={<Briefcase size={11} />}
                label="Jobs"
                value={formatNumber(alt.job_listings)}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* "vs" comparison strip */}
      {alts.length > 1 && (hasStars || hasSO || hasJobs) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
          <span className="flex items-center gap-1 text-xs font-medium text-primary">
            <TrendingUp size={12} />
            Leaders:
          </span>
          {hasStars && <LeadsIn alts={alts} metric="stars" />}
          {hasSO && <LeadsIn alts={alts} metric="stackoverflow_questions" />}
          {hasJobs && <LeadsIn alts={alts} metric="job_listings" />}
        </div>
      )}
    </div>
  )
}
