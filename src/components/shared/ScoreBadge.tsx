import React from 'react'
import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** Confidence grade from the confidence scoring system (A-F).
   *  D and F grades apply a visual de-emphasis to signal the score is provisional. */
  confidenceGrade?: string | null
}

const CONFIDENCE_TOOLTIP: Record<string, string> = {
  D: 'Low confidence — limited data sources active. Treat this score as provisional.',
  F: 'Very low confidence — insufficient data. This score may not reflect reality.',
}

export const ScoreBadge = React.forwardRef<HTMLDivElement, ScoreBadgeProps>(
  ({ score, className, size = 'md', confidenceGrade }, ref) => {
    const isLowConfidence = confidenceGrade === 'D' || confidenceGrade === 'F'
    const tooltipText = isLowConfidence && confidenceGrade ? CONFIDENCE_TOOLTIP[confidenceGrade] : undefined

    if (score === null) {
      return (
        <div
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center rounded font-mono font-medium text-muted-foreground',
            size === 'sm' && 'h-5 min-w-[2.5rem] px-1.5 text-xs',
            size === 'md' && 'h-6 min-w-[3rem] px-2 text-sm',
            size === 'lg' && 'h-8 min-w-[4rem] px-3 text-base',
            className
          )}
        >
          --
        </div>
      )
    }

    // Terminal color coding: green >70, amber 40-70, red <40
    // When confidence is D/F, override to muted slate regardless of score value
    const getScoreColor = (value: number) => {
      if (isLowConfidence) return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
      if (value >= 70) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      if (value >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      return 'text-red-400 bg-red-500/10 border-red-500/20'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded border font-mono font-semibold tabular-nums',
          size === 'sm' && 'h-5 min-w-[2.5rem] px-1.5 text-xs',
          size === 'md' && 'h-6 min-w-[3rem] px-2 text-sm',
          size === 'lg' && 'h-8 min-w-[4rem] px-3 text-base',
          isLowConfidence && 'opacity-60',
          getScoreColor(score),
          className
        )}
        title={tooltipText}
      >
        {Math.round(score)}
        {/* Low-confidence indicator dot */}
        {isLowConfidence && (
          <span
            className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-400 opacity-80"
            aria-label="Low confidence score"
          />
        )}
      </div>
    )
  }
)

ScoreBadge.displayName = 'ScoreBadge'
