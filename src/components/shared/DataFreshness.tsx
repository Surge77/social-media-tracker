import React from 'react'
import { Clock, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataFreshnessProps {
  timestamp: string | null
  className?: string
  /** Number of active data sources currently reporting (optional) */
  sourceCount?: number | null
  /** Total expected sources for this technology's category (optional) */
  totalSources?: number | null
  /** Signal agreement score 0-100 from confidence.signalAgreement */
  signalAgreement?: number | null
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
  ({ timestamp, className, sourceCount, totalSources, signalAgreement }, ref) => {
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

    // Source coverage ratio (e.g. 8/14)
    const hasSourceInfo = sourceCount != null && totalSources != null
    const sourceFraction = hasSourceInfo
      ? `${sourceCount}/${totalSources} sources`
      : null

    const fullTitle = [
      `Computed at: ${new Date(timestamp).toLocaleString()}`,
      sourceFraction ? `Active sources: ${sourceFraction}` : null,
    ]
      .filter(Boolean)
      .join(' · ')

    // Signal agreement indicator
    const hasAgreement = signalAgreement != null
    const agreementColor = !hasAgreement ? ''
      : signalAgreement >= 70 ? 'text-emerald-400'
      : signalAgreement >= 40 ? 'text-amber-400'
      : 'text-red-400'
    const agreementLabel = !hasAgreement ? ''
      : signalAgreement >= 70 ? 'Sources agree'
      : signalAgreement >= 40 ? 'Mixed signals'
      : 'Conflicting data'

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 text-xs',
          isStale ? 'text-amber-400' : 'text-muted-foreground',
          className
        )}
        title={fullTitle}
      >
        {/* Source count pill */}
        {hasSourceInfo && (
          <span className="inline-flex items-center gap-1 rounded border border-current/20 bg-current/5 px-1.5 py-0.5 font-medium">
            <Database size={10} />
            {sourceFraction}
          </span>
        )}

        {/* Signal agreement pill */}
        {hasAgreement && (
          <span className={cn(
            'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-medium border-current/20 bg-current/5',
            agreementColor
          )}>
            {agreementLabel}
          </span>
        )}

        {/* Freshness */}
        <span className="inline-flex items-center gap-1">
          <Clock size={12} />
          <span>synced {relativeTime}</span>
          {isStale && <span className="text-amber-400">⚠</span>}
        </span>
      </div>
    )
  }
)

DataFreshness.displayName = 'DataFreshness'
