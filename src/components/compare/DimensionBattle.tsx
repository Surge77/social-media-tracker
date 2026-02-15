'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, GitBranch, Users, Briefcase, Blocks, TrendingUp } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { CompareData } from '@/types'

interface DimensionBattleProps {
  compareData: CompareData
  className?: string
}

const DIMENSIONS = [
  {
    key: 'github_score',
    label: 'GitHub Activity',
    icon: GitBranch,
    description: 'Developer interest & open source momentum',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    key: 'community_score',
    label: 'Community Buzz',
    icon: Users,
    description: 'Discussions, articles, and community engagement',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    key: 'jobs_score',
    label: 'Job Market',
    icon: Briefcase,
    description: 'Career opportunities and hiring demand',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    key: 'ecosystem_score',
    label: 'Ecosystem',
    icon: Blocks,
    description: 'Tools, libraries, and integrations',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
] as const

export function DimensionBattle({ compareData, className }: DimensionBattleProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('rounded-xl border border-border bg-card/30 p-5', className)}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Dimension Battles</h3>
        <p className="text-sm text-muted-foreground">
          Head-to-head showdown across all 4 core metrics
        </p>
      </div>

      <div className="grid gap-3">
        {DIMENSIONS.map((dimension, dimIdx) => {
          const Icon = dimension.icon

          // Get scores for this dimension
          const techScores = compareData.technologies.map((tech) => ({
            name: tech.name,
            slug: tech.slug,
            color: tech.color,
            score: (tech[dimension.key as keyof typeof tech] as number) || 0,
          }))

          // Sort by score
          const sorted = [...techScores].sort((a, b) => b.score - a.score)
          const winner = sorted[0]
          const maxScore = Math.max(...techScores.map(t => t.score))

          return (
            <motion.div
              key={dimension.key}
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: dimIdx * 0.1 }}
              className={cn(
                'rounded-lg border p-3',
                dimension.borderColor,
                dimension.bgColor
              )}
            >
              {/* Dimension Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn('rounded-md p-1.5', dimension.bgColor)}>
                    <Icon className={cn('h-4 w-4', dimension.color)} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{dimension.label}</h4>
                    <p className="text-xs text-muted-foreground">{dimension.description}</p>
                  </div>
                </div>

                {/* Winner Badge */}
                <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 px-2.5 py-1">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-bold text-yellow-500">{winner.name}</span>
                </div>
              </div>

              {/* Battle Bars */}
              <div className="space-y-2">
                {sorted.map((tech, techIdx) => {
                  const percentage = maxScore > 0 ? (tech.score / maxScore) * 100 : 0
                  const isWinner = techIdx === 0
                  const gap = isWinner ? 0 : winner.score - tech.score

                  return (
                    <div key={tech.slug} className="relative">
                      {/* Tech Info */}
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
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
                        <div className="flex items-center gap-2">
                          {!isWinner && gap > 0 && (
                            <span className="text-xs text-red-400 font-medium">
                              -{gap.toFixed(0)}
                            </span>
                          )}
                          <span className={cn(
                            "font-bold tabular-nums",
                            tech.score >= 70 ? "text-emerald-400" :
                            tech.score >= 40 ? "text-amber-400" : "text-red-400"
                          )}>
                            {tech.score.toFixed(0)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-6 rounded-md bg-muted/50 overflow-hidden">
                        <motion.div
                          initial={prefersReducedMotion ? { width: `${percentage}%` } : { width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: dimIdx * 0.1 + techIdx * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-md"
                          style={{
                            backgroundColor: tech.color,
                            opacity: isWinner ? 0.9 : 0.6,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick Insight */}
              <div className="mt-3 rounded-md bg-card/50 border border-border px-2.5 py-2">
                <p className="text-xs text-muted-foreground">
                  {(() => {
                    const gap = sorted[0].score - sorted[sorted.length - 1].score
                    if (gap < 10) {
                      return `🔥 Super competitive! Only ${gap.toFixed(0)} points separate first and last.`
                    } else if (gap < 25) {
                      return `⚔️ ${sorted[0].name} leads, but others are competitive.`
                    } else {
                      return `👑 ${sorted[0].name} dominates this dimension by ${gap.toFixed(0)} points.`
                    }
                  })()}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-foreground">Key Takeaway</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {(() => {
                const winCounts = new Map<string, number>()
                DIMENSIONS.forEach((dim) => {
                  const scores = compareData.technologies.map((tech) => ({
                    name: tech.name,
                    score: (tech[dim.key as keyof typeof tech] as number) || 0,
                  }))
                  const winner = scores.sort((a, b) => b.score - a.score)[0]
                  const current = winCounts.get(winner.name) || 0
                  winCounts.set(winner.name, current + 1)
                })

                const sortedWinners = Array.from(winCounts.entries()).sort((a, b) => b[1] - a[1])
                const topWinner = sortedWinners[0]

                if (topWinner[1] === 4) {
                  return `${topWinner[0]} sweeps all 4 dimensions — total domination!`
                } else if (topWinner[1] === 3) {
                  return `${topWinner[0]} wins 3 out of 4 battles. Strong all-around choice.`
                } else {
                  const winners = sortedWinners.map(([name, count]) => `${name} (${count})`).join(', ')
                  return `Split decision: ${winners}. Each tech has its strengths — choose based on what matters most.`
                }
              })()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
