import React from 'react'
import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const ScoreBadge = React.forwardRef<HTMLDivElement, ScoreBadgeProps>(
  ({ score, className, size = 'md' }, ref) => {
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
    const getScoreColor = (value: number) => {
      if (value >= 70) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      if (value >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      return 'text-red-400 bg-red-500/10 border-red-500/20'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded border font-mono font-semibold tabular-nums',
          size === 'sm' && 'h-5 min-w-[2.5rem] px-1.5 text-xs',
          size === 'md' && 'h-6 min-w-[3rem] px-2 text-sm',
          size === 'lg' && 'h-8 min-w-[4rem] px-3 text-base',
          getScoreColor(score),
          className
        )}
      >
        {Math.round(score)}
      </div>
    )
  }
)

ScoreBadge.displayName = 'ScoreBadge'
