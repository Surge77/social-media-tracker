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
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-md border font-semibold',
            size === 'sm' && 'h-6 px-2.5 text-xs',
            size === 'md' && 'h-7 px-3 text-sm',
            info.color,
            info.bgColor,
            info.borderColor
          )}
        >
          {info.label}
        </div>
        {showDescription && (
          <span className="mt-1 text-xs text-muted-foreground">{info.description}</span>
        )}
      </div>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'
