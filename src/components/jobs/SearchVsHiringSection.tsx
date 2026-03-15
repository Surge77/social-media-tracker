'use client'

import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { JobsSectionHeader } from '@/components/jobs/JobsSectionHeader'
import type { DemandQuadrant, SearchVsHiringPoint } from '@/hooks/useJobsIntelligence'

interface SearchVsHiringSectionProps {
  points: SearchVsHiringPoint[]
  isLoading: boolean
}

const QUADRANT_META: Record<DemandQuadrant, { label: string; color: string }> = {
  'real-growth': { label: 'Real growth', color: '#10b981' },
  'hype-risk': { label: 'Hype risk', color: '#fb7185' },
  underrated: { label: 'Underrated', color: '#f59e0b' },
  'stable-demand': { label: 'Stable demand', color: '#38bdf8' },
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: SearchVsHiringPoint }>
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-foreground">{point.technologyName}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Search velocity {point.searchVelocity.toFixed(1)} · Jobs velocity {point.jobsVelocity.toFixed(1)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {point.activeJobs.toLocaleString()} active jobs · {QUADRANT_META[point.quadrant].label}
      </p>
    </div>
  )
}

export function SearchVsHiringSection({ points, isLoading }: SearchVsHiringSectionProps) {
  const safePoints = points.slice(0, 12)

  return (
    <section className="space-y-4">
      <JobsSectionHeader
        eyebrow="Search vs hiring"
        title="Separate curiosity from real market demand"
        description="Search velocity catches attention. Hiring velocity catches adoption. The gap between them is where hype, hidden opportunity, and stable winners show up."
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border/70 bg-card/90 p-4 shadow-sm">
          {isLoading ? (
            <Skeleton className="h-[360px] w-full rounded-2xl" />
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
                <ReferenceArea x1={0} y1={0} fill="rgba(16,185,129,0.05)" />
                <ReferenceArea x2={0} y1={0} fill="rgba(251,113,133,0.05)" />
                <ReferenceArea x1={0} y2={0} fill="rgba(245,158,11,0.05)" />
                <ReferenceArea x2={0} y2={0} fill="rgba(56,189,248,0.05)" />
                <ReferenceLine x={0} stroke="rgba(148, 163, 184, 0.5)" />
                <ReferenceLine y={0} stroke="rgba(148, 163, 184, 0.5)" />
                <XAxis
                  type="number"
                  dataKey="searchVelocity"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                  label={{ value: 'Search velocity', position: 'insideBottom', offset: -8, fill: 'currentColor', fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="jobsVelocity"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                  label={{ value: 'Hiring velocity', angle: -90, position: 'insideLeft', fill: 'currentColor', fontSize: 12 }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter data={safePoints} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <div className="space-y-3">
            {(Object.entries(QUADRANT_META) as Array<[DemandQuadrant, { label: string; color: string }]>).map(([quadrant, meta]) => {
              const count = points.filter((point) => point.quadrant === quadrant).length
              return (
                <div key={quadrant} className="rounded-2xl border border-border/60 bg-background/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{count} tracked</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {quadrant === 'real-growth' && 'Both search and hiring are accelerating — candidates should lean in early.'}
                    {quadrant === 'hype-risk' && 'Search is outrunning actual hiring — useful for awareness, risky for pure job bets.'}
                    {quadrant === 'underrated' && 'Hiring is stronger than public buzz suggests — often a better interview-market wedge.'}
                    {quadrant === 'stable-demand' && 'Demand is holding without dramatic spikes — safer, steadier opportunities.'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
