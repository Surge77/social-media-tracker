import React from 'react'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface Signal {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'flat'
}

interface SourceSignalCardProps {
  title: string
  icon?: React.ReactNode
  signals: Signal[]
  link?: string
  className?: string
}

export const SourceSignalCard = React.forwardRef<HTMLDivElement, SourceSignalCardProps>(
  ({ title, icon, signals, link, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50',
          className
        )}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Signals */}
        {signals.length > 0 ? (
          <div className="space-y-2">
            {signals.map((signal, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{signal.label}</span>
                <span className="font-mono font-medium text-foreground">
                  {typeof signal.value === 'number'
                    ? signal.value.toLocaleString()
                    : signal.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </div>
    )
  }
)

SourceSignalCard.displayName = 'SourceSignalCard'
