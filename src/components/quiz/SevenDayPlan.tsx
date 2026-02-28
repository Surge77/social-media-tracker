'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Play, BookOpen, Zap, Share2, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getTechResources } from '@/lib/quiz/resources'

interface SevenDayPlanProps {
  slug: string
  commitment: string
  goal: string
  className?: string
}

interface DayBlock {
  days: string
  type: 'learn' | 'read' | 'build' | 'share'
  label: string
  resource: string
  estimatedHours: number
}

const TYPE_CONFIG = {
  learn: {
    color: 'border-l-blue-500',
    bg: 'bg-blue-500/5',
    icon: Play,
    iconColor: 'text-blue-500',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  read: {
    color: 'border-l-purple-500',
    bg: 'bg-purple-500/5',
    icon: BookOpen,
    iconColor: 'text-purple-500',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  build: {
    color: 'border-l-warning',
    bg: 'bg-warning/5',
    icon: Zap,
    iconColor: 'text-warning',
    badge: 'bg-warning/10 text-orange-600 dark:text-orange-400',
  },
  share: {
    color: 'border-l-success',
    bg: 'bg-success/5',
    icon: Share2,
    iconColor: 'text-success',
    badge: 'bg-success/10 text-green-600 dark:text-green-400',
  },
} as const

function buildPlan(commitment: string, resources: ReturnType<typeof getTechResources>): DayBlock[] {
  const videoTitle = resources?.youtube?.title ?? 'crash course video'
  const learnResource = resources?.primaryLearnResource ?? 'official docs'

  const standard: DayBlock[] = [
    { days: 'Day 1–2', type: 'learn', label: 'Watch', resource: videoTitle, estimatedHours: 2 },
    { days: 'Day 3–4', type: 'read', label: 'Read', resource: `${learnResource} — Quick Start`, estimatedHours: 3 },
    { days: 'Day 5–6', type: 'build', label: 'Build', resource: 'Weekend project (starter snippet)', estimatedHours: 4 },
    { days: 'Day 7', type: 'share', label: 'Share', resource: 'Push to GitHub, write README', estimatedHours: 1 },
  ]

  if (commitment === '2hrs' || commitment === '5hrs') {
    return standard.map(d => ({
      ...d,
      days: d.days.replace('Day ', 'Wk 1–2 '),
    }))
  }

  if (commitment === 'fulltime') {
    return [
      { days: 'Day 1 AM', type: 'learn', label: 'Watch', resource: videoTitle, estimatedHours: 1 },
      { days: 'Day 1 PM', type: 'read', label: 'Read', resource: `${learnResource} — Quick Start`, estimatedHours: 3 },
      { days: 'Day 2 AM', type: 'build', label: 'Build', resource: 'Weekend project (starter snippet)', estimatedHours: 4 },
      { days: 'Day 2 PM', type: 'share', label: 'Share', resource: 'Push to GitHub, deploy demo', estimatedHours: 2 },
    ]
  }

  return standard
}

export function SevenDayPlan({ slug, commitment, goal, className }: SevenDayPlanProps) {
  const prefersReducedMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const resources = getTechResources(slug)

  const plan = buildPlan(commitment, resources)

  const isCompressed = commitment === 'fulltime'
  const isExtended = commitment === '2hrs' || commitment === '5hrs'
  const planLabel = isCompressed ? '2-Day Intensive Plan' : isExtended ? '2-Week Plan' : '7-Day Plan'

  return (
    <div className={className}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{planLabel}</span>
          <Badge variant="secondary" className="text-xs">{plan.reduce((a, b) => a + b.estimatedHours, 0)}h total</Badge>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? {} : { height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {plan.map((block, i) => {
                const config = TYPE_CONFIG[block.type]
                const Icon = config.icon
                return (
                  <motion.div
                    key={i}
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: -8 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className={cn('border-l-4 p-3', config.color, config.bg)}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-20 shrink-0">{block.days}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Icon className={cn('w-3 h-3', config.iconColor)} />
                          <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded', config.badge)}>
                            {block.label}
                          </span>
                        </div>
                        <span className="text-sm text-foreground flex-1 min-w-0">{block.resource}</span>
                        <span className="text-xs text-muted-foreground shrink-0">~{block.estimatedHours}h</span>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
