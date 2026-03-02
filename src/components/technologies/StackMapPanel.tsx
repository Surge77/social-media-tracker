'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { TechIcon } from '@/components/shared/TechIcon'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { MomentumBadge } from '@/components/technologies/MomentumBadge'
import { LoadingSpinner } from '@/components/ui/loading'
import { cn } from '@/lib/utils'
import type { TechnologyCategory } from '@/types'

type PairingStrength = 'essential' | 'common' | 'optional'

interface StackEntry {
  slug: string
  name: string
  color: string | null
  category: TechnologyCategory
  description: string | null
  composite_score: number | null
  momentum: number | null
  reason: string
  pairingStrength: PairingStrength
}

interface StackMapPanelProps {
  slug: string
  techName: string
}

const STRENGTH_CONFIG: Record<PairingStrength, { label: string; className: string }> = {
  essential: {
    label: 'Essential',
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  },
  common: {
    label: 'Common',
    className: 'bg-primary/15 text-primary border border-primary/25',
  },
  optional: {
    label: 'Optional',
    className: 'bg-muted/60 text-muted-foreground border border-border',
  },
}

export function StackMapPanel({ slug, techName }: StackMapPanelProps) {
  const [stack, setStack] = React.useState<StackEntry[]>([])
  const [stackSummary, setStackSummary] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`/api/technologies/${slug}/stack`)
      .then((r) => r.json())
      .then((data) => {
        setStack(data.stack ?? [])
        setStackSummary(data.stackSummary ?? null)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [slug])

  if (isLoading) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/20">
        <LoadingSpinner size="sm" />
        <p className="text-xs text-muted-foreground">Analyzing production stacks…</p>
      </div>
    )
  }

  if (stack.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">No stack data available for {techName}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* AI-generated stack summary */}
      {stackSummary && (
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground leading-relaxed">{stackSummary}</p>
        </div>
      )}

      {/* Companion cards */}
      <div className="space-y-2.5">
        {stack.map((entry) => {
          const strength = STRENGTH_CONFIG[entry.pairingStrength] ?? STRENGTH_CONFIG.optional
          return (
            <Link
              key={entry.slug}
              href={`/technologies/${entry.slug}`}
              className="group flex gap-4 rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              {/* Left: icon */}
              <div className="shrink-0 pt-0.5">
                <TechIcon slug={entry.slug} name={entry.name} color={entry.color} size={28} />
              </div>

              {/* Middle: name + badges + reason */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {entry.name}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide',
                      strength.className
                    )}
                  >
                    {strength.label}
                  </span>
                  <CategoryBadge category={entry.category} size="sm" />
                  {entry.momentum !== null && (
                    <MomentumBadge momentum={entry.momentum} size="sm" showValue={false} />
                  )}
                </div>

                {/* AI-generated reason */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {entry.reason}
                </p>
              </div>

              {/* Right: score */}
              <div className="shrink-0 self-center">
                <ScoreBadge score={entry.composite_score} size="sm" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Attribution */}
      <p className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
        <Sparkles size={10} />
        Stack analysis generated by AI based on job postings, GitHub repos, and engineering patterns.
      </p>
    </div>
  )
}
