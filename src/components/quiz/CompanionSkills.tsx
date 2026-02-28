'use client'

import React, { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getTechResources } from '@/lib/quiz/resources'
import type { TechnologyWithScore } from '@/types'
import Link from 'next/link'

interface CompanionSkillsProps {
  slug: string
  technologies: TechnologyWithScore[]
  className?: string
}

export function CompanionSkills({ slug, technologies, className }: CompanionSkillsProps) {
  const prefersReducedMotion = useReducedMotion()
  const resources = getTechResources(slug)

  const companions = useMemo(() => {
    if (!resources?.companions?.length) return []
    return resources.companions
      .slice(0, 3)
      .map(c => ({
        ...c,
        tech: technologies.find(t => t.slug === c.slug),
      }))
      .filter(c => c.coOccurrencePercent > 0)
  }, [resources, technologies])

  if (!companions.length) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground mb-2">
        Developers learning this also picked up:
      </p>
      <motion.div
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? false : 'visible'}
        variants={prefersReducedMotion ? undefined : containerVariants}
        className="flex flex-wrap gap-2"
      >
        {companions.map(({ slug: cSlug, coOccurrencePercent, tech }) => {
          const momentum = tech?.momentum ?? null
          const MomentumIcon =
            momentum !== null && momentum > 3
              ? TrendingUp
              : momentum !== null && momentum < -3
              ? TrendingDown
              : null

          const momentumColor =
            momentum !== null && momentum > 3
              ? 'text-success'
              : momentum !== null && momentum < -3
              ? 'text-destructive'
              : 'text-muted-foreground'

          const displayName = tech?.name ?? cSlug

          return (
            <motion.div key={cSlug} variants={prefersReducedMotion ? undefined : itemVariants}>
              <Link
                href={`/technologies/${cSlug}`}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50',
                  'bg-secondary/30 hover:bg-secondary/60 hover:border-primary/40',
                  'text-xs font-medium transition-all',
                )}
              >
                {/* Co-occurrence dot */}
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-foreground">{displayName}</span>
                <span className="text-muted-foreground">{coOccurrencePercent}%</span>
                {MomentumIcon && (
                  <MomentumIcon className={cn('w-3 h-3', momentumColor)} />
                )}
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
