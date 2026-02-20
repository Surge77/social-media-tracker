import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface RankChangeBadgeProps {
  rank: number
  prevRank: number | null
}

export function RankChangeBadge({ rank, prevRank }: RankChangeBadgeProps) {
  if (prevRank === null) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  const change = prevRank - rank

  if (change === 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus size={10} />0
      </span>
    )
  }

  if (change > 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-emerald-500">
        <TrendingUp size={10} />+{change}
      </span>
    )
  }

  return (
    <span className="flex items-center gap-0.5 text-xs text-destructive">
      <TrendingDown size={10} />{change}
    </span>
  )
}
