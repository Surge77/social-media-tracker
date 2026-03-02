'use client'

import React from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, GitBranch } from 'lucide-react'
import { TechIcon } from '@/components/shared/TechIcon'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { LoadingSpinner } from '@/components/ui/loading'
import { cn } from '@/lib/utils'
import type { TechnologyCategory } from '@/types'
import type { PairConfidence, RiskFlag } from '@/lib/scoring/pair-scoring'

interface PairEntry {
  slug: string
  name: string
  category: TechnologyCategory
  pairScore: number
  pairConfidence: PairConfidence
  whyPair: string[]
  riskFlags: RiskFlag[]
}

interface PairingIntelligencePanelProps {
  slug: string
  techName: string
}

const CONFIDENCE_CONFIG: Record<PairConfidence, { label: string; className: string }> = {
  A: { label: 'A', className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
  B: { label: 'B', className: 'text-primary bg-primary/10 border-primary/25' },
  C: { label: 'C', className: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  D: { label: 'D', className: 'text-orange-400 bg-orange-500/10 border-orange-500/25' },
  F: { label: 'F', className: 'text-red-400 bg-red-500/10 border-red-500/25' },
}

const RISK_LABELS: Record<RiskFlag, string> = {
  'divergent-momentum': 'Divergent trends',
  'low-data': 'Limited data',
  'hype-without-jobs': 'Hype vs. jobs gap',
  'both-declining': 'Both declining',
  'low-ecosystem': 'Thin ecosystem',
}

type Mode = 'career' | 'stack'

const MODE_TABS: Array<{ key: Mode; label: string }> = [
  { key: 'career', label: 'Career' },
  { key: 'stack', label: 'Stack' },
]

export function PairingIntelligencePanel({ slug, techName }: PairingIntelligencePanelProps) {
  const [mode, setMode] = React.useState<Mode>('career')
  const [pairs, setPairs] = React.useState<PairEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    setIsLoading(true)
    setError(false)
    fetch(`/api/technologies/${slug}/pairs?mode=${mode}&limit=6`)
      .then((r) => r.json())
      .then((data) => {
        setPairs(data.pairs ?? [])
        setIsLoading(false)
      })
      .catch(() => {
        setError(true)
        setIsLoading(false)
      })
  }, [slug, mode])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Pairing Intelligence</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Technologies that combine well with {techName} — ranked by signal quality
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-muted/20 p-0.5">
          {MODE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-all',
                mode === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex h-32 items-center justify-center gap-3">
          <LoadingSpinner size="sm" />
          <p className="text-xs text-muted-foreground">Ranking pairs…</p>
        </div>
      )}

      {error && (
        <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">Could not load pairing data.</p>
        </div>
      )}

      {!isLoading && !error && pairs.length === 0 && (
        <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">No pairing data available.</p>
        </div>
      )}

      {!isLoading && !error && pairs.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {pairs.map((pair) => {
            const conf = CONFIDENCE_CONFIG[pair.pairConfidence]
            return (
              <div
                key={pair.slug}
                className="group rounded-xl border border-border bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/50"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <TechIcon slug={pair.slug} name={pair.name} size={22} />
                    <div className="min-w-0">
                      <Link
                        href={`/technologies/${pair.slug}`}
                        className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        {pair.name}
                      </Link>
                      <CategoryBadge category={pair.category} size="sm" />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={cn(
                        'inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold',
                        conf.className
                      )}
                    >
                      {conf.label}
                    </span>
                    <span className="tabular-nums text-sm font-bold text-foreground">
                      {pair.pairScore}
                    </span>
                  </div>
                </div>

                <div className="mb-2 space-y-0.5">
                  {pair.whyPair.slice(0, 2).map((why, i) => (
                    <p key={i} className="text-xs leading-relaxed text-muted-foreground">
                      · {why}
                    </p>
                  ))}
                </div>

                {pair.riskFlags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {pair.riskFlags.map((flag) => (
                      <span
                        key={flag}
                        className="inline-flex items-center gap-0.5 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive/80"
                      >
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {RISK_LABELS[flag]}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/compare?a=${slug}&b=${pair.slug}`}
                  className="mt-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <GitBranch className="h-3 w-3" />
                  Compare
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )
          })}
        </div>
      )}

      <p className="px-1 text-[11px] text-muted-foreground">
        Pair scores derived from demand synergy, momentum alignment, ecosystem fit, and community
        signal. Not a guarantee of technical compatibility.
      </p>
    </div>
  )
}
