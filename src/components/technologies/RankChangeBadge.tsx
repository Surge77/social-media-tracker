import React from 'react'
import { cn } from '@/lib/utils'

interface RankChangeBadgeProps {
  rankChange: number | null
  className?: string
}

export function RankChangeBadge({ rankChange, className }: RankChangeBadgeProps) {
  if (rankChange === null || rankChange === 0) {
    return (
      <span className={cn('text-xs font-medium text-muted-foreground', className)}>
        —
      </span>
    )
  }

  const isPositive = rankChange > 0
  const icon = isPositive ? '▲' : '▼'
  const colorClass = isPositive ? 'text-success' : 'text-destructive'

  return (
    <span className={cn('text-xs font-medium', colorClass, className)}>
      {icon}
      {Math.abs(rankChange)}
    </span>
  )
}
