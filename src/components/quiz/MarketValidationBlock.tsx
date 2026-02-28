'use client'

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { NumberTicker } from '@/components/ui/number-ticker'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TechnologyWithScore } from '@/types'

interface MarketValidationBlockProps {
  slug: string
  technologies: TechnologyWithScore[]
  label?: string
}

export function MarketValidationBlock({ slug, technologies, label }: MarketValidationBlockProps) {
  const prefersReducedMotion = useReducedMotion()
  const tech = useMemo(() => technologies.find(t => t.slug === slug), [slug, technologies])

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (!tech) {
    return (
      <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
        <Card className="border border-border/40 bg-muted/20 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Market data loading…</span>
          </div>
        </Card>
      </motion.div>
    )
  }

  const momentum = tech.momentum ?? 0
  const jobsScore = Math.round(tech.jobs_score ?? 0)
  const compositeScore = Math.round(tech.composite_score ?? 0)

  const momentumLabel =
    momentum > 5
      ? 'Accelerating'
      : momentum > 0
      ? 'Growing'
      : momentum < -5
      ? 'Declining'
      : 'Stable'

  const momentumColor =
    momentum > 5
      ? 'text-success'
      : momentum > 0
      ? 'text-success/80'
      : momentum < -5
      ? 'text-destructive'
      : 'text-muted-foreground'

  const MomentumIcon = momentum > 3 ? TrendingUp : momentum < -3 ? TrendingDown : Minus

  const verdict = buildVerdict(momentum, jobsScore)

  return (
    <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
      <Card className="border border-border/50 bg-card overflow-hidden">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {label ?? 'Market Signal — backed by live data'}
            </span>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-3">
            <MetricBox
              value={jobsScore}
              label="Job demand"
              suffix="/100"
              prefersReducedMotion={prefersReducedMotion}
            />
            <div className="flex flex-col items-center gap-1">
              <div className={cn('flex items-center gap-1 text-xl font-bold tabular-nums', momentumColor)}>
                <MomentumIcon className="w-4 h-4" />
                <span>{momentum > 0 ? '+' : ''}{momentum.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground text-center">momentum</span>
            </div>
            <MetricBox
              value={compositeScore}
              label="trend score"
              suffix="/100"
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>

          {/* Sparkline */}
          {tech.sparkline && tech.sparkline.length > 1 && (
            <Sparkline data={tech.sparkline} momentum={momentum} />
          )}

          {/* Verdict */}
          <p className="text-xs text-muted-foreground italic">{verdict}</p>
        </div>
      </Card>
    </motion.div>
  )
}

function MetricBox({
  value,
  label,
  suffix,
  prefersReducedMotion,
}: {
  value: number
  label: string
  suffix: string
  prefersReducedMotion: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xl font-bold text-foreground tabular-nums">
        {prefersReducedMotion ? (
          <span>{value}</span>
        ) : (
          <NumberTicker value={value} />
        )}
        <span className="text-xs text-muted-foreground font-normal">{suffix}</span>
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  )
}

function Sparkline({ data, momentum }: { data: number[]; momentum: number }) {
  const width = 240
  const height = 32
  const padX = 4
  const padY = 4

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * (width - padX * 2)
    const y = height - padY - ((v - min) / range) * (height - padY * 2)
    return `${x},${y}`
  })

  const color = momentum > 3 ? '#3ecf8e' : momentum < -3 ? '#ef4444' : '#6b7280'

  return (
    <div className="rounded-md bg-muted/30 px-2 py-1">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-6" aria-hidden>
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.8}
        />
      </svg>
    </div>
  )
}

function buildVerdict(momentum: number, jobsScore: number): string {
  if (momentum > 8 && jobsScore > 60) return 'High job demand, accelerating momentum — strong market signal'
  if (momentum > 3 && jobsScore > 40) return 'Growing demand, positive market trend'
  if (momentum > 0 && jobsScore > 50) return 'Stable demand with steady upward momentum'
  if (momentum < -5) return 'Declining momentum — market interest is cooling'
  if (jobsScore > 60) return 'Strong job market — slower growth but high existing demand'
  return 'Moderate market presence — emerging or stabilizing'
}
