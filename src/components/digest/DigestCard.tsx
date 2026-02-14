'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Target, Zap, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { DigestSection } from '@/lib/ai/generators/weekly-digest'

interface DigestCardProps {
  section: DigestSection
  index: number
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  'Biggest Mover': TrendingUp,
  'Biggest Drop': TrendingDown,
  'Category Spotlight': Target,
  'Emerging Tech': Zap,
  'Job Market Signal': Briefcase
}

export function DigestCard({ section, index }: DigestCardProps) {
  const prefersReducedMotion = useReducedMotion()

  // Determine icon based on section title
  let Icon: React.ElementType = Target
  for (const [key, IconComponent] of Object.entries(SECTION_ICONS)) {
    if (section.title.includes(key)) {
      Icon = IconComponent as React.ElementType
      break
    }
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.5, delay: index * 0.1 }}
      className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold mb-3">{section.title}</h2>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {section.narrative}
          </p>

          {section.technologies && section.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {section.technologies.map((tech) => (
                <Link
                  key={tech.slug}
                  href={`/technologies/${tech.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors text-xs font-medium"
                >
                  <span>{tech.name}</span>
                  {tech.change !== undefined && (
                    <span className={tech.change > 0 ? 'text-success' : 'text-destructive'}>
                      {tech.change > 0 ? '+' : ''}{tech.change.toFixed(1)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
