'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Target, Zap, Briefcase, ArrowUpRight, GitCompare } from 'lucide-react'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import { TechIcon } from '@/components/shared/TechIcon'
import type { DigestSection } from '@/lib/ai/generators/weekly-digest'

// ─── Section config ───────────────────────────────────────────────────────────

interface SectionConfig {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  cardBg: string
  border: string
  stripColor: string
  changePositiveColor: string
  changeNegativeColor: string
}

const SECTION_CONFIGS: Record<string, SectionConfig> = {
  'Biggest Mover': {
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    cardBg: 'bg-emerald-500/[0.03]',
    border: 'border-emerald-500/25',
    stripColor: 'from-emerald-500/60 via-emerald-400 to-emerald-500/60',
    changePositiveColor: 'text-emerald-500',
    changeNegativeColor: 'text-red-400',
  },
  'Biggest Drop': {
    icon: TrendingDown,
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    cardBg: 'bg-red-500/[0.03]',
    border: 'border-red-500/25',
    stripColor: 'from-red-500/60 via-red-400 to-red-500/60',
    changePositiveColor: 'text-emerald-500',
    changeNegativeColor: 'text-red-400',
  },
  'Emerging Tech': {
    icon: Zap,
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
    cardBg: 'bg-violet-500/[0.03]',
    border: 'border-violet-500/25',
    stripColor: 'from-violet-500/60 via-violet-400 to-violet-500/60',
    changePositiveColor: 'text-emerald-500',
    changeNegativeColor: 'text-red-400',
  },
  'Job Market Signal': {
    icon: Briefcase,
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-500',
    cardBg: 'bg-sky-500/[0.03]',
    border: 'border-sky-500/25',
    stripColor: 'from-sky-500/60 via-sky-400 to-sky-500/60',
    changePositiveColor: 'text-emerald-500',
    changeNegativeColor: 'text-red-400',
  },
  'Category Spotlight': {
    icon: Target,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    cardBg: 'bg-amber-500/[0.03]',
    border: 'border-amber-500/25',
    stripColor: 'from-amber-500/60 via-amber-400 to-amber-500/60',
    changePositiveColor: 'text-emerald-500',
    changeNegativeColor: 'text-red-400',
  },
}

const DEFAULT_CONFIG: SectionConfig = {
  icon: Target,
  iconBg: 'bg-primary/10',
  iconColor: 'text-primary',
  cardBg: 'bg-card',
  border: 'border-border',
  stripColor: 'from-primary/60 via-primary to-primary/60',
  changePositiveColor: 'text-emerald-500',
  changeNegativeColor: 'text-red-400',
}

function getSectionConfig(title: string): SectionConfig {
  for (const [key, config] of Object.entries(SECTION_CONFIGS)) {
    if (title.includes(key)) return config
  }
  return DEFAULT_CONFIG
}

// ─── Number highlighting ──────────────────────────────────────────────────────

function HighlightedNarrative({ text }: { text: string }) {
  // Match signed numbers (±), plain numbers, and percentages
  const parts = text.split(/(\b[+-]?\d+(?:\.\d+)?(?:x|%|pts?)?\b)/g)

  return (
    <>
      {parts.map((part, i) => {
        if (/^[+-]?\d+(?:\.\d+)?(?:x|%|pts?)?$/.test(part)) {
          const isPositive = part.startsWith('+')
          const isNegative = part.startsWith('-')
          return (
            <span
              key={i}
              className={cn(
                'font-semibold',
                isPositive && 'text-emerald-500',
                isNegative && 'text-red-400',
                !isPositive && !isNegative && 'text-foreground font-semibold'
              )}
            >
              {part}
            </span>
          )
        }
        return <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </>
  )
}

// ─── Tech change chip ─────────────────────────────────────────────────────────

function TechChip({
  slug,
  name,
  change,
  positiveColor,
  negativeColor,
}: {
  slug: string
  name: string
  change?: number
  positiveColor: string
  negativeColor: string
}) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <div className="group flex items-center gap-0 rounded-lg border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-sm">
      {/* Tech name + change */}
      <Link
        href={`/technologies/${slug}`}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
      >
        <TechIcon slug={slug} name={name} size={16} showBackground={false} />
        <span>{name}</span>

        {change !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-sm font-bold',
              isPositive && positiveColor,
              isNegative && negativeColor,
              !isPositive && !isNegative && 'text-muted-foreground'
            )}
          >
            {isPositive && <TrendingUp className="h-3 w-3" />}
            {isNegative && <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{change.toFixed(1)}
          </span>
        )}
      </Link>

      {/* Divider */}
      <div className="h-8 w-px bg-border" />

      {/* Compare link */}
      <Link
        href={`/compare?techs=${slug}`}
        className="flex items-center gap-1 px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:text-primary"
        title={`Compare ${name}`}
      >
        <GitCompare className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DigestCardProps {
  section: DigestSection
  index: number
  sectionId: string
}

export function DigestCard({ section, index, sectionId }: DigestCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const config = getSectionConfig(section.title)
  const Icon = config.icon

  return (
    <motion.div
      id={sectionId}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.45, delay: index * 0.08 }}
      className={cn(
        'relative rounded-lg border p-6 transition-shadow hover:shadow-md',
        config.cardBg,
        config.border
      )}
    >
      {/* Color strip at top */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-gradient-to-r',
          config.stripColor
        )}
      />

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            config.iconBg
          )}
        >
          <Icon className={cn('h-5 w-5', config.iconColor)} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="mb-3 text-lg font-semibold text-foreground">{section.title}</h2>

          {/* Narrative with highlighted numbers */}
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            <HighlightedNarrative text={section.narrative} />
          </p>

          {/* Tech chips */}
          {section.technologies && section.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {section.technologies.map((tech) => (
                <TechChip
                  key={tech.slug}
                  slug={tech.slug}
                  name={tech.name}
                  change={tech.change}
                  positiveColor={config.changePositiveColor}
                  negativeColor={config.changeNegativeColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
