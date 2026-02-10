'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { Code, Users, Briefcase, Package } from 'lucide-react'

interface ScoreBreakdownProps {
  githubScore: number | null
  communityScore: number | null
  jobsScore: number | null
  ecosystemScore: number | null
  className?: string
}

const SUB_SCORES = [
  {
    key: 'github',
    label: 'GitHub Activity',
    description: 'Stars, forks, contributors, issue resolution',
    icon: Code,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
  },
  {
    key: 'community',
    label: 'Community Buzz',
    description: 'HN mentions, Reddit posts, Dev.to articles, sentiment',
    icon: Users,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  {
    key: 'jobs',
    label: 'Job Market',
    description: 'Job postings across Adzuna, JSearch, Remotive',
    icon: Briefcase,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    key: 'ecosystem',
    label: 'Ecosystem Health',
    description: 'Package downloads, Stack Overflow activity',
    icon: Package,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
] as const

export const ScoreBreakdown = React.forwardRef<HTMLDivElement, ScoreBreakdownProps>(
  ({ githubScore, communityScore, jobsScore, ecosystemScore, className }, ref) => {
    const prefersReducedMotion = useReducedMotion()

    const scores = {
      github: githubScore,
      community: communityScore,
      jobs: jobsScore,
      ecosystem: ecosystemScore,
    }

    return (
      <div ref={ref} className={cn('grid gap-4 sm:grid-cols-2', className)}>
        {SUB_SCORES.map((item, index) => {
          const score = scores[item.key]
          const Icon = item.icon

          return (
            <motion.div
              key={item.key}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={prefersReducedMotion ? {} : { duration: 0.3, delay: index * 0.1 }}
              className={cn(
                'rounded-lg border p-4 backdrop-blur-sm transition-all hover:shadow-lg',
                item.bgColor,
                item.borderColor
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={cn('rounded p-1.5', item.bgColor)}>
                    <Icon className={cn('h-4 w-4', item.color)} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.label}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ScoreBadge score={score} size="lg" />
              </div>

              {/* Progress bar */}
              <div className="relative h-2 overflow-hidden rounded-full bg-muted/30">
                <motion.div
                  initial={prefersReducedMotion ? { width: `${score ?? 0}%` } : { width: 0 }}
                  animate={{ width: `${score ?? 0}%` }}
                  transition={
                    prefersReducedMotion ? {} : { duration: 0.8, delay: index * 0.1 + 0.2 }
                  }
                  className={cn('h-full rounded-full', item.color.replace('text-', 'bg-'))}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }
)

ScoreBreakdown.displayName = 'ScoreBreakdown'
