'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, Zap, AlertTriangle, Archive } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { CompareData } from '@/types'

interface LifecycleTimelineProps {
  compareData: CompareData
  className?: string
}

const STAGE_CONFIG: Record<string, {
  label: string
  color: string
  bgColor: string
  icon: React.ReactNode
  position: number // 0-100 position on timeline
  description: string
}> = {
  emerging: {
    label: 'Emerging',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    icon: <Zap className="h-4 w-4" />,
    position: 10,
    description: 'New & growing fast',
  },
  growing: {
    label: 'Growing',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    icon: <TrendingUp className="h-4 w-4" />,
    position: 30,
    description: 'Strong adoption',
  },
  mature: {
    label: 'Mature',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    icon: <Activity className="h-4 w-4" />,
    position: 60,
    description: 'Stable & established',
  },
  plateau: {
    label: 'Plateau',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    icon: <Activity className="h-4 w-4" />,
    position: 70,
    description: 'Peak adoption',
  },
  declining: {
    label: 'Declining',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    icon: <AlertTriangle className="h-4 w-4" />,
    position: 85,
    description: 'Losing ground',
  },
  legacy: {
    label: 'Legacy',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    icon: <Archive className="h-4 w-4" />,
    position: 95,
    description: 'Outdated',
  },
  niche: {
    label: 'Niche',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    icon: <Activity className="h-4 w-4" />,
    position: 50,
    description: 'Specialized',
  },
  hype: {
    label: 'Hype',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    icon: <Zap className="h-4 w-4" />,
    position: 20,
    description: 'Volatile & trending',
  },
}

export function LifecycleTimeline({ compareData, className }: LifecycleTimelineProps) {
  const prefersReducedMotion = useReducedMotion()
  const lifecycleData = compareData.lifecycle_data || {}

  // DEBUG: Log what we're receiving
  console.log('LifecycleTimeline DEBUG:', {
    hasCompareData: !!compareData,
    lifecycleDataFromCompare: compareData.lifecycle_data,
    lifecycleDataKeys: Object.keys(lifecycleData),
    technologies: compareData.technologies?.map(t => t.slug)
  })

  // Build tech positions with lifecycle info
  const techPositions = compareData.technologies
    .map((tech) => {
      const lifecycle = lifecycleData[tech.slug]
      if (!lifecycle) return null

      const config = STAGE_CONFIG[lifecycle.stage] || STAGE_CONFIG.niche

      return {
        slug: tech.slug,
        name: tech.name,
        color: tech.color,
        lifecycle,
        stageConfig: config,
      }
    })
    .filter((t): t is NonNullable<typeof t> => t !== null)

  if (techPositions.length === 0) {
    return (
      <div className={cn('rounded-lg border border-border bg-card/30 p-8 text-center', className)}>
        <p className="text-sm text-muted-foreground">Lifecycle data unavailable</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('rounded-xl border border-border bg-card/30 p-6', className)}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Lifecycle Stage</h3>
        <p className="text-sm text-muted-foreground">
          Where each technology sits in its lifecycle
        </p>
      </div>

      {/* Timeline */}
      <div className="relative mb-8">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-6 h-0.5 bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-red-500/30" />

        {/* Stage markers */}
        <div className="relative flex justify-between">
          {['emerging', 'growing', 'mature', 'declining'].map((stage) => {
            const config = STAGE_CONFIG[stage]
            return (
              <div key={stage} className="flex flex-col items-center">
                <div className={cn('rounded-full p-2', config.bgColor)}>
                  <div className={config.color}>{config.icon}</div>
                </div>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  {config.label}
                </p>
              </div>
            )
          })}
        </div>

        {/* Tech dots positioned on timeline */}
        <div className="relative mt-8 h-32">
          {techPositions.map((tech, idx) => {
            const left = `${tech.stageConfig.position}%`

            return (
              <motion.div
                key={tech.slug}
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="absolute"
                style={{ left, top: `${idx * 36}px` }}
              >
                <div className="flex items-center gap-3">
                  {/* Dot */}
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-md',
                      tech.stageConfig.bgColor
                    )}
                    style={{ borderColor: tech.color }}
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: tech.color }}
                    />
                  </div>

                  {/* Label */}
                  <div className="rounded-md border border-border bg-card px-3 py-1.5 shadow-sm">
                    <p className="text-sm font-semibold text-foreground">{tech.name}</p>
                    <p className={cn('text-xs', tech.stageConfig.color)}>
                      {tech.stageConfig.label}
                      {tech.lifecycle.confidence > 0 && (
                        <span className="ml-1 text-muted-foreground">
                          ({Math.round(tech.lifecycle.confidence * 100)}% conf.)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 space-y-3">
        {techPositions.map((tech) => (
          <div
            key={tech.slug}
            className="rounded-lg border border-border bg-card/50 p-3"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: tech.color }}>
                {tech.name}
              </span>
              <span className={cn('text-xs font-medium', tech.stageConfig.color)}>
                {tech.stageConfig.label} — {tech.stageConfig.description}
              </span>
            </div>
            {tech.lifecycle.reasoning.length > 0 && (
              <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                {tech.lifecycle.reasoning.slice(0, 2).map((reason, idx) => (
                  <li key={idx}>• {reason}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
