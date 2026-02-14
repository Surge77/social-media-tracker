'use client'

// src/components/quiz/roadmap/RoadmapStats.tsx
// Beautiful stats visualization for the roadmap

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, BookOpen, Briefcase, Calendar, TrendingUp, Award } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { GeneratedRoadmap } from '@/lib/quiz/roadmap-engine'

interface RoadmapStatsProps {
  roadmap: GeneratedRoadmap
  className?: string
}

export function RoadmapStats({ roadmap, className }: RoadmapStatsProps) {
  const prefersReducedMotion = useReducedMotion()

  const totalHours = roadmap.phases.reduce((sum, phase) => {
    return sum + phase.nodes.reduce((nodeSum: number, node: any) => {
      return nodeSum + (node.isSkipped ? 0 : node.estimatedHours)
    }, 0)
  }, 0)

  const totalJobs = roadmap.jobImpact[roadmap.jobImpact.length - 1]?.jobsQualifiedFor ?? 0

  const estimatedMonths = Math.ceil(roadmap.totalWeeks / 4)

  const weeklyHours = roadmap.userContext.timeCommitment === '5hrs' ? 5 :
                       roadmap.userContext.timeCommitment === '10hrs' ? 10 :
                       roadmap.userContext.timeCommitment === '20hrs' ? 20 : 40

  const stats = [
    {
      icon: Calendar,
      label: 'Timeline',
      value: roadmap.totalWeeks,
      unit: roadmap.totalWeeks === 1 ? 'week' : 'weeks',
      subtext: `${estimatedMonths} ${estimatedMonths === 1 ? 'month' : 'months'}`,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: BookOpen,
      label: 'Technologies',
      value: roadmap.totalNodes,
      unit: roadmap.totalNodes === 1 ? 'tech' : 'techs',
      subtext: 'to master',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: Clock,
      label: 'Time Investment',
      value: totalHours,
      unit: 'hours',
      subtext: `${weeklyHours} hrs/week`,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: Briefcase,
      label: 'Job Opportunities',
      value: totalJobs.toLocaleString(),
      unit: 'jobs',
      subtext: "you'll qualify for",
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background to-muted/20 p-6 transition-all hover:shadow-lg hover:shadow-primary/5"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative">
              {/* Icon */}
              <div className={cn('inline-flex rounded-xl p-3', stat.bgColor)}>
                <stat.icon className={cn('h-6 w-6', stat.textColor)} />
              </div>

              {/* Value */}
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <p className={cn('text-4xl font-bold', stat.textColor)}>
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.unit}
                  </p>
                </div>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {stat.label}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.subtext}
                </p>
              </div>

              {/* Trend indicator */}
              <div className="mt-3 flex items-center gap-1 text-xs">
                <TrendingUp className={cn('h-3 w-3', stat.textColor)} />
                <span className={cn('font-medium', stat.textColor)}>
                  On track
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary card */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background via-background to-primary/5 p-6"
      >
        {/* Decorative element */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />

        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3">
              <Award className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold">Your Learning Plan</h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                At your pace ({weeklyHours} hrs/week), you'll complete this roadmap in approximately{' '}
                <span className="font-bold text-primary">{estimatedMonths} {estimatedMonths === 1 ? 'month' : 'months'}</span>.
                {' '}By the end, you'll have mastered{' '}
                <span className="font-semibold text-foreground">{roadmap.totalNodes} technologies</span>
                {' '}and qualify for{' '}
                <span className="font-semibold text-foreground">{totalJobs.toLocaleString()}+ job positions</span>.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {roadmap.userContext.motivation === 'get-first-job' && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <Briefcase className="h-3 w-3" />
                    Optimized for job hunting
                  </div>
                )}
                {roadmap.userContext.motivation === 'level-up' && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <TrendingUp className="h-3 w-3" />
                    Career advancement focused
                  </div>
                )}
                {roadmap.userContext.motivation === 'switch-specialty' && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <TrendingUp className="h-3 w-3" />
                    Specialty transition path
                  </div>
                )}
                {roadmap.userContext.motivation === 'build-product' && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <BookOpen className="h-3 w-3" />
                    Product-building ready
                  </div>
                )}
                {roadmap.userContext.motivation === 'future-proof' && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <TrendingUp className="h-3 w-3" />
                    Future-proofed stack
                  </div>
                )}

                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {weeklyHours} hrs weekly commitment
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
