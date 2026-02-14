'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, TrendingUp, TrendingDown, Activity, X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { AnomalyType, AnomalySeverity } from '@/lib/detection/anomaly'

interface Anomaly {
  type: AnomalyType
  severity: AnomalySeverity
  metric: string
  deviationSigma: number
  explanation: string | null
}

interface AnomalyBannerProps {
  anomalies: Anomaly[]
  techSlug: string
  onDismiss?: () => void
}

const SEVERITY_COLORS: Record<AnomalySeverity, { bg: string; border: string; text: string; icon: string }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  notable: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-900 dark:text-amber-100',
    icon: 'text-amber-600 dark:text-amber-400'
  },
  significant: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-900 dark:text-orange-100',
    icon: 'text-orange-600 dark:text-orange-400'
  },
  critical: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-100',
    icon: 'text-red-600 dark:text-red-400'
  }
}

const ANOMALY_ICONS: Record<AnomalyType, React.ElementType> = {
  spike: TrendingUp,
  drop: TrendingDown,
  divergence: Activity,
  trend_break: AlertTriangle,
  correlation_break: AlertTriangle
}

export function AnomalyBanner({ anomalies, techSlug, onDismiss }: AnomalyBannerProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Check localStorage for dismissal
  useEffect(() => {
    if (anomalies.length > 0) {
      const firstAnomalyKey = `dismissed_anomaly_${techSlug}_${anomalies[0].type}_${anomalies[0].metric}`
      const dismissed = localStorage.getItem(firstAnomalyKey)
      setIsDismissed(dismissed === 'true')
    }
  }, [anomalies, techSlug])

  if (anomalies.length === 0 || isDismissed) {
    return null
  }

  const primaryAnomaly = anomalies[0]
  const remainingCount = anomalies.length - 1
  const severity = primaryAnomaly.severity
  const colors = SEVERITY_COLORS[severity]
  const Icon = ANOMALY_ICONS[primaryAnomaly.type]

  const handleDismiss = () => {
    const key = `dismissed_anomaly_${techSlug}_${primaryAnomaly.type}_${primaryAnomaly.metric}`
    localStorage.setItem(key, 'true')
    setIsDismissed(true)
    onDismiss?.()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
        transition={prefersReducedMotion ? {} : { duration: 0.3 }}
        className={cn(
          'rounded-lg border-2 p-4',
          colors.bg,
          colors.border,
          colors.text
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', colors.icon)} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold mb-1">
                  {severity === 'critical' && 'Critical '}
                  {severity === 'significant' && 'Significant '}
                  {severity === 'notable' && 'Notable '}
                  {primaryAnomaly.type === 'spike' && 'Activity Spike Detected'}
                  {primaryAnomaly.type === 'drop' && 'Activity Drop Detected'}
                  {primaryAnomaly.type === 'divergence' && 'Signal Divergence Detected'}
                  {primaryAnomaly.type === 'trend_break' && 'Trend Reversal Detected'}
                  {primaryAnomaly.type === 'correlation_break' && 'Correlation Break Detected'}
                </h3>

                {primaryAnomaly.explanation ? (
                  <p className="text-sm opacity-90">
                    {primaryAnomaly.explanation}
                  </p>
                ) : (
                  <p className="text-sm opacity-90">
                    {primaryAnomaly.metric} showed a {primaryAnomaly.deviationSigma.toFixed(1)}σ deviation from expected values.
                  </p>
                )}

                {remainingCount > 0 && !isExpanded && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className={cn(
                      'mt-2 text-sm font-medium flex items-center gap-1 hover:underline',
                      colors.icon
                    )}
                  >
                    Show {remainingCount} more anomal{remainingCount === 1 ? 'y' : 'ies'}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}

                {isExpanded && remainingCount > 0 && (
                  <div className="mt-3 space-y-2">
                    {anomalies.slice(1).map((anomaly, index) => {
                      const AnomalyIcon = ANOMALY_ICONS[anomaly.type]
                      return (
                        <div key={index} className="flex items-start gap-2 text-sm opacity-80">
                          <AnomalyIcon className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium capitalize">{anomaly.type.replace('_', ' ')}</span>
                            {' in '}{anomaly.metric}
                            {' '}({anomaly.deviationSigma.toFixed(1)}σ)
                            {anomaly.explanation && (
                              <p className="mt-1">{anomaly.explanation}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    <button
                      onClick={() => setIsExpanded(false)}
                      className={cn(
                        'text-sm font-medium flex items-center gap-1 hover:underline',
                        colors.icon
                      )}
                    >
                      Show less
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleDismiss}
                className={cn(
                  'shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors',
                  colors.icon
                )}
                aria-label="Dismiss anomaly banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
