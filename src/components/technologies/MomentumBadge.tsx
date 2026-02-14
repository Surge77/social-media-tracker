import React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MomentumBadgeProps {
  momentum: number | null
  className?: string
  size?: 'sm' | 'md'
  showValue?: boolean
}

type MomentumDirection = 'up' | 'down' | 'flat'

const getMomentumDirection = (momentum: number | null): MomentumDirection => {
  if (momentum == null || Math.abs(momentum) < 2) return 'flat'
  return momentum > 0 ? 'up' : 'down'
}

const MOMENTUM_CONFIG: Record<MomentumDirection, { icon: typeof TrendingUp; color: string }> = {
  up: { icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  down: { icon: TrendingDown, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  flat: { icon: Minus, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
}

export const MomentumBadge = React.forwardRef<HTMLDivElement, MomentumBadgeProps>(
  ({ momentum, className, size = 'sm', showValue = true }, ref) => {
    const direction = getMomentumDirection(momentum)
    const config = MOMENTUM_CONFIG[direction]
    const Icon = config.icon

    const iconSize = size === 'sm' ? 12 : 14

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded border font-medium tabular-nums',
          size === 'sm' && 'h-5 px-1.5 text-xs',
          size === 'md' && 'h-6 px-2 text-sm',
          config.color,
          className
        )}
        title={`Momentum: ${momentum != null ? momentum.toFixed(1) : 'N/A'}%`}
      >
        <Icon size={iconSize} strokeWidth={2.5} />
        {showValue && momentum != null && (
          <span className="font-mono">
            {momentum > 0 ? '+' : ''}
            {Math.round(momentum)}%
          </span>
        )}
      </div>
    )
  }
)

MomentumBadge.displayName = 'MomentumBadge'
