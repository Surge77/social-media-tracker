import React from 'react'
import { cn } from '@/lib/utils'
import type { ConfidenceGrade } from '@/lib/scoring/confidence'

interface ConfidenceBadgeProps {
  /** New: A-F confidence grade from the confidence scoring system */
  grade?: ConfidenceGrade | null
  /** Legacy: completeness ratio 0-1 (auto-mapped to grade if grade not provided) */
  completeness?: number | null
  className?: string
  size?: 'sm' | 'md'
}

const GRADE_CONFIG: Record<
  ConfidenceGrade,
  { label: string; color: string; description: string }
> = {
  A: {
    label: 'A',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Very high confidence — rich data from many sources',
  },
  B: {
    label: 'B',
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    description: 'Good confidence — solid data coverage',
  },
  C: {
    label: 'C',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'Moderate confidence — some data gaps',
  },
  D: {
    label: 'D',
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    description: 'Low confidence — limited data available',
  },
  F: {
    label: 'F',
    color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    description: 'Very low confidence — insufficient data',
  },
}

function completenessToGrade(completeness: number | null): ConfidenceGrade {
  if (completeness === null || completeness < 0.2) return 'F'
  if (completeness < 0.4) return 'D'
  if (completeness < 0.6) return 'C'
  if (completeness < 0.8) return 'B'
  return 'A'
}

export const ConfidenceBadge = React.forwardRef<HTMLDivElement, ConfidenceBadgeProps>(
  ({ grade, completeness, className, size = 'sm' }, ref) => {
    const resolvedGrade = grade ?? completenessToGrade(completeness ?? null)
    const config = GRADE_CONFIG[resolvedGrade]

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded border font-semibold',
          size === 'sm' && 'h-5 px-2 text-xs',
          size === 'md' && 'h-6 px-2.5 text-sm',
          config.color,
          className
        )}
        title={config.description}
      >
        {config.label}
      </div>
    )
  }
)

ConfidenceBadge.displayName = 'ConfidenceBadge'
