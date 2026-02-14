'use client'

// src/components/quiz/roadmap/RoadmapMilestone.tsx
// Milestone celebration component

import React from 'react'
import { Sparkles, Rocket, Star, PartyPopper } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { Milestone } from '@/lib/quiz/roadmap-engine'

interface RoadmapMilestoneProps {
  milestone: Milestone
  className?: string
}

export function RoadmapMilestone({ milestone, className }: RoadmapMilestoneProps) {
  const prefersReducedMotion = useReducedMotion()

  const getCelebrationIcon = () => {
    switch (milestone.celebration) {
      case 'confetti':
        return PartyPopper
      case 'fireworks':
        return Sparkles
      case 'rocket':
        return Rocket
      case 'star':
        return Star
      default:
        return Sparkles
    }
  }

  const CelebrationIcon = getCelebrationIcon()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('relative', className)}
    >
      <Card className="relative overflow-hidden border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        {/* Background decoration */}
        <div className="absolute -right-4 -top-4 opacity-10">
          <CelebrationIcon className="h-32 w-32" />
        </div>

        {/* Content */}
        <div className="relative">
          {/* Icon */}
          <motion.div
            initial={prefersReducedMotion ? {} : { rotate: -10 }}
            animate={prefersReducedMotion ? {} : { rotate: 10 }}
            transition={prefersReducedMotion ? {} : {
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 1,
              ease: 'easeInOut'
            }}
            className="mb-4"
          >
            <CelebrationIcon className="h-12 w-12 text-primary" aria-hidden="true" />
          </motion.div>

          {/* Title */}
          <h3 className="mb-2 text-2xl font-bold">{milestone.title}</h3>

          {/* Description */}
          <p className="mb-3 text-muted-foreground">{milestone.description}</p>

          {/* Job impact */}
          {milestone.jobImpact && (
            <div className="mt-4 rounded-lg border border-primary/20 bg-background/50 p-3">
              <p className="text-sm font-medium text-primary">
                💼 {milestone.jobImpact}
              </p>
            </div>
          )}

          {/* Celebration badge */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span className="font-medium">Phase {milestone.afterPhase} Complete</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
