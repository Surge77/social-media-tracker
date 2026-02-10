'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, Trophy, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MomentumBadge } from '@/components/technologies/MomentumBadge'
import {
  getScoreLabel,
  getMomentumInsight,
  getJobInsight,
  getDimensionComparison,
} from '@/lib/insights'
import type { TechnologyWithScore } from '@/types'

interface CompareTableProps {
  technologies: TechnologyWithScore[]
  className?: string
}

interface DimensionConfig {
  key: 'github' | 'community' | 'jobs' | 'ecosystem'
  label: string
  question: string
  scoreKey: 'github_score' | 'community_score' | 'jobs_score' | 'ecosystem_score'
  color: string
  bgColor: string
}

const DIMENSIONS: DimensionConfig[] = [
  {
    key: 'github',
    label: 'Open-Source Activity',
    question: 'Which has more active development?',
    scoreKey: 'github_score',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  {
    key: 'community',
    label: 'Community Buzz',
    question: 'Which one are developers talking about?',
    scoreKey: 'community_score',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  {
    key: 'jobs',
    label: 'Job Market Demand',
    question: 'Which one will get me hired?',
    scoreKey: 'jobs_score',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    key: 'ecosystem',
    label: 'Ecosystem Health',
    question: 'Which has better tooling and support?',
    scoreKey: 'ecosystem_score',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
]

export const CompareTable = React.forwardRef<HTMLDivElement, CompareTableProps>(
  ({ technologies, className }, ref) => {
    const prefersReducedMotion = useReducedMotion()

    if (technologies.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex min-h-[300px] items-center justify-center rounded-lg border border-border bg-card/30 p-8',
            className
          )}
        >
          <p className="text-sm text-muted-foreground">No technologies selected</p>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        {/* Overall Score Cards */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.4 }}
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${technologies.length}, 1fr)` }}
        >
          {technologies.map((tech) => {
            const isHighest =
              tech.composite_score !== null &&
              tech.composite_score ===
                Math.max(...technologies.map((t) => t.composite_score ?? -1))

            return (
              <div
                key={tech.id}
                className={cn(
                  'rounded-lg border p-4 text-center transition-all',
                  isHighest
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-card/30'
                )}
              >
                <Link
                  href={`/technologies/${tech.slug}`}
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tech.color }}
                  />
                  {tech.name}
                  <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <div className="mt-3 flex justify-center">
                  <ScoreBadge score={tech.composite_score} size="lg" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getScoreLabel(tech.composite_score)} overall
                </p>

                <div className="mt-3 flex justify-center">
                  <StatusBadge
                    compositeScore={tech.composite_score}
                    momentum={tech.momentum}
                    dataCompleteness={tech.data_completeness}
                  />
                </div>

                <div className="mt-2 flex justify-center">
                  <MomentumBadge momentum={tech.momentum} />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                  {getMomentumInsight(tech.momentum).split(' — ')[0]}
                </p>
              </div>
            )
          })}
        </motion.div>

        {/* Dimension-by-dimension comparison */}
        {DIMENSIONS.map((dim, index) => {
          const techScores = technologies.map((t) => ({
            name: t.name,
            score: t[dim.scoreKey],
          }))
          const { winner, insight } = getDimensionComparison(dim.key, techScores)

          const maxScore = Math.max(
            ...technologies.map((t) => t[dim.scoreKey] ?? 0)
          )

          return (
            <motion.div
              key={dim.key}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion ? {} : { duration: 0.3, delay: 0.1 + index * 0.08 }
              }
              className="rounded-lg border border-border bg-card/30 p-4"
            >
              {/* Dimension header */}
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <div>
                  <h3 className={cn('text-sm font-semibold', dim.color)}>
                    {dim.label}
                  </h3>
                  <p className="text-xs text-muted-foreground italic">
                    {dim.question}
                  </p>
                </div>
                {winner && (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
                    <Trophy size={12} />
                    {winner}
                  </span>
                )}
                {!winner && techScores.some((t) => t.score !== null) && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Minus size={12} />
                    Tie
                  </span>
                )}
              </div>

              {/* Score bars */}
              <div className="space-y-2">
                {technologies.map((tech) => {
                  const score = tech[dim.scoreKey]
                  const isWinner = winner === tech.name
                  return (
                    <div key={tech.id} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 truncate text-xs font-medium text-foreground/80">
                        {tech.name}
                      </span>
                      <div className="relative flex-1 h-5 overflow-hidden rounded-full bg-muted/30">
                        <motion.div
                          initial={prefersReducedMotion ? { width: `${score ?? 0}%` } : { width: 0 }}
                          animate={{ width: `${score ?? 0}%` }}
                          transition={prefersReducedMotion ? {} : { duration: 0.6, delay: 0.2 + index * 0.08 }}
                          className={cn(
                            'h-full rounded-full transition-colors',
                            isWinner
                              ? dim.color.replace('text-', 'bg-')
                              : 'bg-muted-foreground/30'
                          )}
                        />
                        {score !== null && (
                          <span className="absolute inset-y-0 right-2 flex items-center text-[11px] font-mono font-semibold text-foreground/70">
                            {Math.round(score)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Insight text */}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {insight}
              </p>
            </motion.div>
          )
        })}

        {/* Job market callout */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.3, delay: 0.5 }}
          className="rounded-lg border border-border/50 bg-muted/10 p-4"
        >
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Job Market Takeaway
          </h3>
          <div className="space-y-1">
            {technologies.map((tech) => (
              <p key={tech.id} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">{tech.name}:</span>{' '}
                {getJobInsight(tech.jobs_score, tech.momentum)}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }
)

CompareTable.displayName = 'CompareTable'
