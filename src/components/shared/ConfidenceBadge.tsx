import React from 'react'
import { cn } from '@/lib/utils'

interface ConfidenceBadgeProps {
  completeness: number | null
  className?: string
  size?: 'sm' | 'md'
}

type ConfidenceLevel = 'High' | 'Medium' | 'Low'

const getConfidenceLevel = (completeness: number | null): ConfidenceLevel => {
  if (completeness === null || completeness < 0.4) return 'Low'
  if (completeness < 0.7) return 'Medium'
  return 'High'
}

const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  High: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
}

export const ConfidenceBadge = React.forwardRef<HTMLDivElement, ConfidenceBadgeProps>(
  ({ completeness, className, size = 'sm' }, ref) => {
    const level = getConfidenceLevel(completeness)

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded border font-medium',
          size === 'sm' && 'h-5 px-2 text-xs',
          size === 'md' && 'h-6 px-2.5 text-sm',
          CONFIDENCE_COLORS[level],
          className
        )}
        title={`Data completeness: ${completeness !== null ? Math.round(completeness * 100) : 0}%`}
      >
        {level}
      </div>
    )
  }
)

ConfidenceBadge.displayName = 'ConfidenceBadge'
