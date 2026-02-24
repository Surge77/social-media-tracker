'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ScoreBadge } from '@/components/shared/ScoreBadge'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { MomentumBadge } from '@/components/technologies/MomentumBadge'
import { Sparkline } from '@/components/technologies/Sparkline'
import type { TechnologyWithScore } from '@/types'

interface RelatedTechnologiesProps {
  technologies: TechnologyWithScore[]
  className?: string
}

export const RelatedTechnologies = React.forwardRef<HTMLDivElement, RelatedTechnologiesProps>(
  ({ technologies, className }, ref) => {
    const prefersReducedMotion = useReducedMotion()

    if (technologies.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex min-h-[200px] items-center justify-center rounded-lg border border-border bg-muted/20 p-8',
            className
          )}
        >
          <p className="text-sm text-muted-foreground">No related technologies found</p>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {technologies.map((tech, index) => (
          <motion.div
            key={tech.id}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              href={`/technologies/${tech.slug}`}
              className="group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              <div className="h-full rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50 hover:shadow-lg">
                {/* Header */}
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {tech.name}
                  </h4>
                  <ScoreBadge score={tech.composite_score} size="sm" />
                </div>

                {/* Description */}
                <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
                  {tech.description}
                </p>

                {/* Badges */}
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <CategoryBadge category={tech.category} size="sm" />
                  <MomentumBadge momentum={tech.momentum} size="sm" showValue={false} />
                </div>

                {/* Sparkline */}
                <Sparkline data={tech.sparkline} width={80} height={24} showDelta={true} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    )
  }
)

RelatedTechnologies.displayName = 'RelatedTechnologies'
