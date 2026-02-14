import React from 'react'
import { cn } from '@/lib/utils'

interface LifecycleBadgeProps {
  stage: string | null
  className?: string
  size?: 'sm' | 'md'
}

const LIFECYCLE_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string; description: string }
> = {
  emerging: {
    label: 'Emerging',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'Early stage — growing adoption, high potential',
  },
  growing: {
    label: 'Growing',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Rapid growth — increasing developer adoption',
  },
  mature: {
    label: 'Mature',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Industry standard — stable and widely adopted',
  },
  declining: {
    label: 'Declining',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Losing momentum — consider alternatives',
  },
  legacy: {
    label: 'Legacy',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    description: 'Maintenance mode — being replaced by newer options',
  },
  niche: {
    label: 'Niche',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    description: 'Specialized — strong in a specific domain',
  },
}

const DEFAULT_CONFIG = {
  label: 'Unknown',
  color: 'text-slate-400',
  bgColor: 'bg-slate-500/10',
  borderColor: 'border-slate-500/30',
  description: 'Lifecycle stage not determined',
}

export const LifecycleBadge = React.forwardRef<HTMLDivElement, LifecycleBadgeProps>(
  ({ stage, className, size = 'sm' }, ref) => {
    if (!stage) return null

    const normalized = stage.toLowerCase().trim()
    const config = LIFECYCLE_CONFIG[normalized] ?? DEFAULT_CONFIG

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md border font-semibold',
          size === 'sm' && 'h-6 px-2.5 text-xs',
          size === 'md' && 'h-7 px-3 text-sm',
          config.color,
          config.bgColor,
          config.borderColor,
          className
        )}
        title={config.description}
      >
        {config.label}
      </div>
    )
  }
)

LifecycleBadge.displayName = 'LifecycleBadge'
