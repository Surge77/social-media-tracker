'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface AISummaryTooltipProps {
  summary: string
  className?: string
  maxLength?: number
}

export function AISummaryTooltip({
  summary,
  className,
  maxLength = 60,
}: AISummaryTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const needsTruncation = summary.length > maxLength
  const displayText = needsTruncation
    ? summary.slice(0, maxLength) + '...'
    : summary

  if (!needsTruncation) {
    return <span className={cn('text-sm text-muted-foreground', className)}>{summary}</span>
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={cn('cursor-help text-sm text-muted-foreground', className)}>
        {displayText}
      </span>

      {showTooltip && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-md bg-popover p-3 text-sm text-popover-foreground shadow-lg">
          {summary}
          <div className="absolute left-4 top-full h-0 w-0 border-8 border-transparent border-t-popover" />
        </div>
      )}
    </div>
  )
}
