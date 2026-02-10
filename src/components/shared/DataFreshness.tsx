import React from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataFreshnessProps {
  timestamp: string | null
  className?: string
}

function getRelativeTime(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const DataFreshness = React.forwardRef<HTMLDivElement, DataFreshnessProps>(
  ({ timestamp, className }, ref) => {
    if (!timestamp) {
      return (
        <div
          ref={ref}
          className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground', className)}
        >
          <Clock size={12} />
          <span>No data yet</span>
        </div>
      )
    }

    const relativeTime = getRelativeTime(timestamp)
    const diffMs = new Date().getTime() - new Date(timestamp).getTime()
    const diffHours = diffMs / 3600000

    // Stale data warning (>48 hours)
    const isStale = diffHours > 48

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs',
          isStale ? 'text-amber-400' : 'text-muted-foreground',
          className
        )}
        title={new Date(timestamp).toLocaleString()}
      >
        <Clock size={12} />
        <span>Updated {relativeTime}</span>
        {isStale && <span className="text-amber-400">⚠</span>}
      </div>
    )
  }
)

DataFreshness.displayName = 'DataFreshness'
