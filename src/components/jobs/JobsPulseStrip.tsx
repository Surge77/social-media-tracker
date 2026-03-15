'use client'

import { BriefcaseBusiness, Building2, MapPinned, Radar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { JobsOverviewPulse } from '@/hooks/useJobsIntelligence'

interface JobsPulseStripProps {
  pulse: JobsOverviewPulse | null
  isLoading: boolean
  lastUpdated: string | null
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toLocaleString()
}

export function JobsPulseStrip({ pulse, isLoading, lastUpdated }: JobsPulseStripProps) {
  const cards = [
    {
      label: 'Active Jobs',
      value: pulse ? formatCompact(pulse.activeJobs) : '—',
      sub: 'live openings across tracked stacks',
      icon: BriefcaseBusiness,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'New This Window',
      value: pulse ? formatCompact(pulse.newJobs) : '—',
      sub: 'freshly surfaced roles',
      icon: Radar,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Remote Share',
      value: pulse ? `${Math.round(pulse.remoteShare * 100)}%` : '—',
      sub: 'roles trending remote-first',
      icon: MapPinned,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Hiring Stacks',
      value: pulse ? formatCompact(pulse.hiringTechCount) : '—',
      sub: 'technologies with active demand',
      icon: Building2,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
  ]

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
            Today&apos;s job pulse
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Jobs Intelligence
          </h1>
        </div>
        <div className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
          {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Live hiring signals'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="group rounded-3xl border border-border/70 bg-card/90 p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs leading-snug text-muted-foreground">{card.label}</p>
                <div className={`shrink-0 rounded-2xl p-2 transition-transform group-hover:scale-105 ${card.bg}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="mt-3 h-8 w-24" />
              ) : (
                <p className={`mt-3 text-2xl font-bold leading-none tracking-tight ${card.color}`}>
                  {card.value}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{card.sub}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
