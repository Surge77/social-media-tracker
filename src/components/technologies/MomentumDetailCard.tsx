'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MomentumDetailProps {
  momentumDetail: {
    shortTerm: number
    mediumTerm: number
    longTerm: number
    trend: string
    acceleration?: number
    volatility?: number
  } | null
  currentScore: number | null
  className?: string
}

const TREND_CONFIG: Record<string, { label: string; color: string; Icon: typeof TrendingUp }> = {
  SURGING: { label: 'Surging', color: 'text-emerald-400', Icon: TrendingUp },
  RISING: { label: 'Rising', color: 'text-emerald-400', Icon: TrendingUp },
  STABLE: { label: 'Stable', color: 'text-muted-foreground', Icon: Minus },
  SLOWING: { label: 'Slowing', color: 'text-amber-400', Icon: TrendingDown },
  DECLINING: { label: 'Declining', color: 'text-red-400', Icon: TrendingDown },
  FALLING: { label: 'Falling', color: 'text-red-400', Icon: TrendingDown },
}

function WindowColumn({
  label,
  value,
  currentScore,
}: {
  label: string
  value: number
  currentScore: number | null
}) {
  const change = currentScore !== null ? value - currentScore : null
  const isPositive = change !== null && change > 1
  const isNegative = change !== null && change < -1

  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'text-lg font-bold font-mono tabular-nums',
          isPositive && 'text-emerald-400',
          isNegative && 'text-red-400',
          !isPositive && !isNegative && 'text-foreground'
        )}
      >
        {Math.round(value)}
      </span>
      {change !== null && Math.abs(change) > 0.5 && (
        <span
          className={cn(
            'text-[10px] font-medium',
            isPositive && 'text-emerald-400',
            isNegative && 'text-red-400',
            !isPositive && !isNegative && 'text-muted-foreground'
          )}
        >
          {isPositive ? '+' : ''}{change.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export function MomentumDetailCard({ momentumDetail, currentScore, className }: MomentumDetailProps) {
  if (!momentumDetail) return null

  const trend = momentumDetail.trend?.toUpperCase() ?? 'STABLE'
  const trendConfig = TREND_CONFIG[trend] ?? TREND_CONFIG.STABLE
  const { Icon, label: trendLabel, color: trendColor } = trendConfig

  return (
    <div className={cn(
      'rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm',
      className
    )}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Trend Over Time</span>
        <div className={cn('flex items-center gap-1', trendColor)}>
          <Icon size={14} />
          <span className="text-xs font-medium">{trendLabel}</span>
        </div>
      </div>

      {/* 7d / 30d / 90d columns */}
      <div className="flex items-start gap-2 mb-3">
        <WindowColumn label="7-day" value={momentumDetail.shortTerm} currentScore={currentScore} />
        <div className="w-px h-10 bg-border/50 self-center" />
        <WindowColumn label="30-day" value={momentumDetail.mediumTerm} currentScore={currentScore} />
        <div className="w-px h-10 bg-border/50 self-center" />
        <WindowColumn label="90-day" value={momentumDetail.longTerm} currentScore={currentScore} />
      </div>

      {/* Optional acceleration/volatility */}
      {(momentumDetail.acceleration !== undefined || momentumDetail.volatility !== undefined) && (
        <div className="flex items-center gap-3 pt-2 border-t border-border/30">
          {momentumDetail.acceleration !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Acceleration:</span>
              <span className={cn(
                'font-medium',
                momentumDetail.acceleration > 0 ? 'text-emerald-400' : momentumDetail.acceleration < 0 ? 'text-red-400' : 'text-muted-foreground'
              )}>
                {momentumDetail.acceleration > 0 ? '+' : ''}{momentumDetail.acceleration.toFixed(2)}
              </span>
            </div>
          )}
          {momentumDetail.volatility !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Volatility:</span>
              <span className="font-medium text-foreground">{momentumDetail.volatility.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      <p className="mt-2 text-[10px] text-muted-foreground/60">
        EMA scores for each window. Values show where the score trended, not raw score.
      </p>
    </div>
  )
}
