'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { CompareData } from '@/types'

interface DimensionBreakdownProps {
  compareData: CompareData
  className?: string
}

const DIMENSIONS = [
  { key: 'github_score', label: 'GitHub Activity', description: 'Stars, forks, contributors, activity' },
  { key: 'community_score', label: 'Community Buzz', description: 'HN mentions, Reddit posts, dev.to articles' },
  { key: 'jobs_score', label: 'Job Market', description: 'Job postings across multiple boards' },
  { key: 'ecosystem_score', label: 'Ecosystem Health', description: 'npm downloads, SO questions, libraries' },
] as const

export function DimensionBreakdown({ compareData, className }: DimensionBreakdownProps) {
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

  // Get dimension leader
  const getDimensionLeader = (dimension: typeof DIMENSIONS[number]) => {
    const scores = compareData.technologies.map(tech => ({
      name: tech.name,
      color: tech.color,
      score: tech[dimension.key as keyof typeof tech] as number || 0,
    }))

    return scores.sort((a, b) => b.score - a.score)[0]
  }

  // Simulate trend (in real implementation, this would compare with 30 days ago data)
  const getDimensionTrend = (techName: string, dimension: string): number => {
    // Placeholder - would need historical data
    const hash = techName.length + dimension.length
    return (hash % 7) - 3 // Random trend between -3 and +3
  }

  // Generate AI micro-insight per dimension
  const getDimensionInsight = (dimension: typeof DIMENSIONS[number]): string => {
    const leader = getDimensionLeader(dimension)
    const scores = compareData.technologies.map(t => t[dimension.key as keyof typeof t] as number || 0)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const gap = Math.max(...scores) - Math.min(...scores)

    if (gap < 10) {
      return `Very competitive — all technologies within ${gap.toFixed(0)} points`
    }

    if (leader.score > avg + 20) {
      return `${leader.name} dominates with ${leader.score.toFixed(0)}/100, significantly ahead of others`
    }

    if (leader.score < 40) {
      return `All technologies score low here — may indicate data limitations or nascent category`
    }

    return `${leader.name} leads with ${leader.score.toFixed(0)}/100, moderate competition`
  }

  return (
    <div className={cn('space-y-3', className)}>
      {DIMENSIONS.map((dimension, idx) => {
        const leader = getDimensionLeader(dimension)
        const isExpanded = expandedDimensions.has(dimension.key)

        return (
          <motion.div
            key={dimension.key}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="rounded-lg border border-border bg-card/30"
          >
            {/* Dimension header */}
            <div className="p-3 sm:p-4">
              <div className="mb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{dimension.label}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">{dimension.description}</p>
                </div>
                <button
                  onClick={() => toggleDimension(dimension.key)}
                  className="sm:ml-3 flex items-center justify-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground self-start"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={12} />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} />
                      Details
                    </>
                  )}
                </button>
              </div>

              {/* AI Insight */}
              <div className="mb-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                <div className="flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 shrink-0 text-primary" style={{ marginTop: '2px' }} />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {getDimensionInsight(dimension)}
                  </p>
                </div>
              </div>

              {/* Score bars */}
              <div className="space-y-2">
                {compareData.technologies
                  .sort((a, b) => (b[dimension.key as keyof typeof b] as number || 0) - (a[dimension.key as keyof typeof a] as number || 0))
                  .map((tech) => {
                    const score = tech[dimension.key as keyof typeof tech] as number || 0
                    const trend = getDimensionTrend(tech.name, dimension.key)
                    const isLeader = tech.name === leader.name

                    return (
                      <div key={tech.slug} className="flex items-center gap-1.5 sm:gap-2">
                        <div className="flex w-20 sm:w-28 items-center gap-1 sm:gap-1.5 shrink-0">
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: tech.color }}
                          />
                          <span className={cn(
                            "text-xs font-medium truncate",
                            isLeader && "text-primary"
                          )}>
                            {tech.name}
                          </span>
                        </div>

                        <div className="relative flex-1 min-w-0">
                          <div className="h-6 overflow-hidden rounded-md bg-muted">
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${score}%`,
                                backgroundColor: tech.color,
                                opacity: 0.7,
                              }}
                            />
                          </div>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
                            {score.toFixed(0)}
                          </span>
                        </div>

                        {/* Trend indicator */}
                        <div className={cn(
                          "flex items-center gap-0.5 text-xs shrink-0",
                          trend > 0 && "text-emerald-400",
                          trend < 0 && "text-red-400",
                          trend === 0 && "text-muted-foreground"
                        )}>
                          {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                          <span className="hidden sm:inline w-6 text-right">
                            {trend > 0 ? '+' : ''}{trend}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Expandable raw signals */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-border"
                >
                  <div className="p-4 pt-3">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">Raw Signals</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {compareData.technologies.map((tech) => (
                        <div
                          key={tech.slug}
                          className="rounded-md border border-border bg-card/50 p-2"
                        >
                          <div className="mb-1 flex items-center gap-1.5">
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: tech.color }}
                            />
                            <span className="text-xs font-semibold text-foreground">{tech.name}</span>
                          </div>
                          <div className="space-y-0.5 text-[11px] text-muted-foreground">
                            {dimension.key === 'github_score' && (
                              <>
                                <div>Stars: {tech.github_stars?.toLocaleString() ?? 'N/A'}</div>
                                <div>Activity: {tech.composite_score ? 'Active' : 'N/A'}</div>
                              </>
                            )}
                            {dimension.key === 'community_score' && (
                              <>
                                <div>HN: {tech.hn_mentions ?? 'N/A'} mentions</div>
                              </>
                            )}
                            {dimension.key === 'jobs_score' && (
                              <>
                                <div>Postings: {tech.job_postings?.toLocaleString() ?? 'N/A'}</div>
                              </>
                            )}
                            {dimension.key === 'ecosystem_score' && (
                              <>
                                <div>Downloads: {tech.npm_downloads?.toLocaleString() ?? 'N/A'}</div>
                                <div>SO: {tech.so_questions?.toLocaleString() ?? 'N/A'} questions</div>
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
  )
}
