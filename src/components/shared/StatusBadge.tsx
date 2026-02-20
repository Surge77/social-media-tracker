'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { getTechStatus, STATUS_INFO, type TechStatus } from '@/lib/insights'

interface StatusBadgeProps {
  compositeScore: number | null
  momentum: number | null
  dataCompleteness: number | null
  className?: string
  size?: 'sm' | 'md'
  showDescription?: boolean
}

export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ compositeScore, momentum, dataCompleteness, className, size = 'sm', showDescription = false }, ref) => {
    const status = getTechStatus(compositeScore, momentum, dataCompleteness)
    const info = STATUS_INFO[status]

    return (
      <div
        ref={ref}
        className={cn('inline-flex flex-col', className)}
        title={info.description}
      >
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md border font-semibold whitespace-nowrap leading-none',
            size === 'sm' && 'px-2 py-1 text-[11px]',
            size === 'md' && 'px-2.5 py-1.5 text-xs',
            info.color,
            info.bgColor,
            info.borderColor
          )}
        >
          <StatusDot status={status} size={size} />
          {info.label}
        </span>
        {showDescription && (
          <span className="mt-1 text-xs text-muted-foreground">{info.description}</span>
        )}
      </div>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

function StatusDot({ status, size }: { status: TechStatus; size: 'sm' | 'md' }) {
  const dotColors: Record<TechStatus, string> = {
    'strong-growth': 'bg-emerald-400',
    'high-demand':   'bg-orange-400',
    'established':   'bg-blue-400',
    'emerging':      'bg-cyan-400',
    'slowing':       'bg-amber-400',
    'low-demand':    'bg-red-400',
    'collecting-data': 'bg-slate-400',
  }

  return (
    <span
      className={cn(
        'shrink-0 rounded-full',
        size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
        dotColors[status]
      )}
    />
  )
}
