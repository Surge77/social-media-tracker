'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  GitBranch,
  Users,
  Briefcase,
  Blocks,
  Crown,
  Zap,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { CompareData } from '@/types'

interface CompetitiveBreakdownProps {
  compareData: CompareData
  className?: string
}

const DIMENSIONS = [
  {
    key: 'github_score',
    label: 'GitHub Activity',
    icon: GitBranch,
    description: 'Developer interest & project health',
    signals: ['stars', 'contributors', 'commits'],
  },
  {
    key: 'community_score',
    label: 'Community Buzz',
    icon: Users,
    description: 'Discussions, articles, and sentiment',
    signals: ['HN mentions', 'Reddit posts', 'dev.to articles'],
  },
  {
    key: 'jobs_score',
    label: 'Job Market',
    icon: Briefcase,
    description: 'Career opportunities available now',
    signals: ['job postings', 'salary range', 'demand growth'],
  },
  {
    key: 'ecosystem_score',
    label: 'Ecosystem Health',
    icon: Blocks,
    description: 'Tools, libraries, and integrations',
    signals: ['npm packages', 'SO questions', 'documentation'],
  },
] as const

export function CompetitiveBreakdown({ compareData, className }: CompetitiveBreakdownProps) {
  const prefersReducedMotion = useReducedMotion()
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set())

  const toggleDimension = (key: string) => {
    const newExpanded = new Set(expandedDimensions)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedDimensions(newExpanded)
  }

  // Analyze dimension
  const analyzeDimension = (dimension: typeof DIMENSIONS[number]) => {
    const scores = compareData.technologies.map((tech) => ({
      name: tech.name,
      slug: tech.slug,
      color: tech.color,
      score: (tech[dimension.key as keyof typeof tech] as number) || 0,
      jobPostings: tech.job_postings || null,
      githubStars: tech.github_stars || null,
      npmDownloads: tech.npm_downloads || null,
    }))

    const sorted = scores.sort((a, b) => b.score - a.score)
    const winner = sorted[0]
    const runnerUp = sorted[1]
    const gap = winner.score - runnerUp.score

    // Determine competitiveness
    let competitiveness: 'blowout' | 'clear-leader' | 'close-race' | 'tied'
    let insight: string

    if (gap < 5) {
      competitiveness = 'close-race'
      insight = `Neck and neck! Only ${gap.toFixed(1)} points separate ${winner.name} and ${runnerUp.name}.`
    } else if (gap < 15) {
      competitiveness = 'clear-leader'
      insight = `${winner.name} has the edge with a ${gap.toFixed(0)}-point lead.`
    } else if (gap < 30) {
      competitiveness = 'blowout'
      insight = `${winner.name} dominates this category by ${gap.toFixed(0)} points.`
    } else {
      competitiveness = 'blowout'
      insight = `${winner.name} completely dominates — ${gap.toFixed(0)} points ahead!`
    }

    return { sorted, winner, runnerUp, gap, competitiveness, insight }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Competitive Breakdown</h3>
        <p className="text-sm text-muted-foreground">
          Head-to-head comparison across all dimensions — see who wins where
        </p>
      </div>

      {/* Dimensions */}
      <div className="space-y-4">
        {DIMENSIONS.map((dimension, idx) => {
          const analysis = analyzeDimension(dimension)
          const isExpanded = expandedDimensions.has(dimension.key)
          const Icon = dimension.icon

          return (
            <motion.div
              key={dimension.key}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="rounded-xl border border-border bg-card/30 overflow-hidden"
            >
              {/* Dimension Header */}
              <div className="p-4 sm:p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 rounded-lg bg-primary/10 p-2 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-semibold text-foreground">{dimension.label}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">{dimension.description}</p>
                    </div>
                  </div>

                  {/* Winner Badge */}
                  <div className="shrink-0 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 px-3 py-1.5 flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="text-xs font-bold text-yellow-500">{analysis.winner.name}</span>
                  </div>
                </div>

                {/* Competition Visual */}
                <div className="space-y-2.5">
                  {analysis.sorted.map((tech, techIdx) => {
                    const isWinner = techIdx === 0
                    const percentage = (tech.score / 100) * 100

                    return (
                      <div key={tech.slug} className="relative">
                        {/* Tech name + score */}
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: tech.color }}
                            />
                            <span className={cn(
                              "font-medium",
                              isWinner ? "text-foreground font-semibold" : "text-muted-foreground"
                            )}>
                              {tech.name}
                            </span>
                            {isWinner && <Trophy className="h-3 w-3 text-yellow-500" />}
                          </div>
                          <span className={cn(
                            "font-mono text-xs font-bold tabular-nums",
                            tech.score >= 70 ? "text-emerald-400" :
                            tech.score >= 40 ? "text-amber-400" : "text-red-400"
                          )}>
                            {tech.score.toFixed(0)}/100
                          </span>
                        </div>

                        {/* Bar */}
                        <div className="relative h-7 sm:h-8 rounded-lg bg-muted/50 overflow-hidden">
                          <motion.div
                            initial={prefersReducedMotion ? { width: `${percentage}%` } : { width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 + techIdx * 0.1, ease: 'easeOut' }}
                            className={cn(
                              "h-full rounded-lg transition-all",
                              isWinner && "shadow-[0_0_20px_rgba(0,0,0,0.1)]"
                            )}
                            style={{
                              backgroundColor: tech.color,
                              opacity: isWinner ? 0.9 : 0.6,
                            }}
                          />

                          {/* Gap indicator for non-winners */}
                          {!isWinner && (
                            <div
                              className="absolute top-0 right-0 bottom-0 flex items-center justify-end pr-2 text-[10px] font-semibold text-muted-foreground"
                            >
                              -{(analysis.winner.score - tech.score).toFixed(0)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Competitiveness Indicator */}
                <div className={cn(
                  "mt-4 rounded-lg border px-3 py-2.5 flex items-start gap-2",
                  analysis.competitiveness === 'close-race' && "border-yellow-500/30 bg-yellow-500/5",
                  analysis.competitiveness === 'clear-leader' && "border-blue-500/30 bg-blue-500/5",
                  analysis.competitiveness === 'blowout' && "border-emerald-500/30 bg-emerald-500/5",
                )}>
                  {analysis.competitiveness === 'close-race' && <Zap className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />}
                  {analysis.competitiveness === 'clear-leader' && <TrendingUp className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />}
                  {analysis.competitiveness === 'blowout' && <Trophy className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs font-semibold",
                      analysis.competitiveness === 'close-race' && "text-yellow-600 dark:text-yellow-400",
                      analysis.competitiveness === 'clear-leader' && "text-blue-600 dark:text-blue-400",
                      analysis.competitiveness === 'blowout' && "text-emerald-600 dark:text-emerald-400",
                    )}>
                      {analysis.competitiveness === 'close-race' && 'Close Race!'}
                      {analysis.competitiveness === 'clear-leader' && 'Clear Leader'}
                      {analysis.competitiveness === 'blowout' && 'Dominant Winner'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{analysis.insight}</p>
                  </div>
                </div>

                {/* Expand/Collapse button */}
                <button
                  onClick={() => toggleDimension(dimension.key)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-md border border-border bg-card/50 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-card hover:text-foreground"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={14} />
                      Hide Raw Signals
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      Show Raw Signals
                    </>
                  )}
                </button>
              </div>

              {/* Expandable Raw Signals */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-border bg-muted/20"
                  >
                    <div className="p-4">
                      <p className="mb-3 text-xs font-semibold text-muted-foreground">
                        What powers this score:
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {analysis.sorted.map((tech) => (
                          <div
                            key={tech.slug}
                            className="rounded-lg border border-border bg-card p-3"
                          >
                            <div className="mb-2 flex items-center gap-1.5">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: tech.color }}
                              />
                              <span className="text-xs font-semibold text-foreground">{tech.name}</span>
                            </div>
                            <div className="space-y-1 text-[11px] text-muted-foreground">
                              {dimension.key === 'github_score' && (
                                <>
                                  <div>⭐ Stars: {tech.githubStars?.toLocaleString() ?? 'N/A'}</div>
                                  <div>📊 Activity: High</div>
                                </>
                              )}
                              {dimension.key === 'community_score' && (
                                <>
                                  <div>💬 Discussions: Active</div>
                                  <div>📝 Articles: Regular</div>
                                </>
                              )}
                              {dimension.key === 'jobs_score' && (
                                <>
                                  <div>💼 Postings: {tech.jobPostings?.toLocaleString() ?? 'N/A'}</div>
                                  <div>📈 Growth: Trending</div>
                                </>
                              )}
                              {dimension.key === 'ecosystem_score' && (
                                <>
                                  <div>📦 Downloads: {tech.npmDownloads?.toLocaleString() ?? 'N/A'}</div>
                                  <div>🔧 Packages: Extensive</div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Overall Summary */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="mt-6 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/20 p-2 shrink-0">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-foreground">Overall Winner Analysis</h4>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {(() => {
                const winCounts = new Map<string, number>()
                DIMENSIONS.forEach((dim) => {
                  const analysis = analyzeDimension(dim)
                  const current = winCounts.get(analysis.winner.name) || 0
                  winCounts.set(analysis.winner.name, current + 1)
                })

                const sortedWinners = Array.from(winCounts.entries()).sort((a, b) => b[1] - a[1])
                const topWinner = sortedWinners[0]

                if (topWinner[1] === 4) {
                  return `${topWinner[0]} dominates across all dimensions — the clear choice.`
                } else if (topWinner[1] === 3) {
                  return `${topWinner[0]} leads in ${topWinner[1]} out of 4 categories — strong overall performer.`
                } else {
                  return `No clear overall winner — ${sortedWinners.map(([name, count]) => `${name} (${count})`).join(', ')}. Choose based on what matters most to you.`
                }
              })()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
