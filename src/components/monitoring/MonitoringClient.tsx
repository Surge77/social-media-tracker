'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MetricsGrid } from '@/components/monitoring/MetricsGrid'
import { ProviderStatus } from '@/components/monitoring/ProviderStatus'
import { QualityChart } from '@/components/monitoring/QualityChart'
import { FeedbackAnalysis } from '@/components/monitoring/FeedbackAnalysis'
import { CostTracking } from '@/components/monitoring/CostTracking'
import type { FeedbackAnalysis as FeedbackAnalysisType } from '@/lib/ai/feedback-analyzer'
import type { CostSummary } from '@/lib/ai/cost-tracker'

interface MonitoringData {
  status: 'healthy' | 'warning' | 'degraded'
  timestamp: string
  last24h: {
    totalGenerations: number
    totalErrors: number
    errorRate: number
    fallbackRate: number
    cacheHitRate: number
    avgQualityScore: number
    avgLatencyMs: number
    positiveFeedbackRate: number
    estimatedCost: number
  }
  providers: Array<{
    name: string
    status: 'up' | 'down'
    rpm: number
    rpmLimit: number
    dailyUsage: number
    consecutiveFailures: number
    inCooldown?: boolean
  }>
  alerts: string[]
}

export function MonitoringClient() {
  const prefersReducedMotion = useReducedMotion()
  const [data, setData] = useState<MonitoringData | null>(null)
  const [feedbackData, setFeedbackData] = useState<FeedbackAnalysisType | null>(null)
  const [costData, setCostData] = useState<CostSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = async () => {
    try {
      const [monitoringRes, feedbackRes, costRes] = await Promise.all([
        fetch('/api/ai/monitoring'),
        fetch('/api/ai/feedback/analyze?days=30'),
        fetch('/api/ai/costs?days=30')
      ])

      if (!monitoringRes.ok) throw new Error('Failed to fetch monitoring data')

      const monitoringData = await monitoringRes.json()
      setData(monitoringData)

      if (feedbackRes.ok) {
        const feedbackJson = await feedbackRes.json()
        setFeedbackData(feedbackJson)
      }

      if (costRes.ok) {
        const costJson = await costRes.json()
        setCostData(costJson)
      }

      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000) // Refresh every 30s
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const statusColors = {
    healthy: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    degraded: 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI System Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time health and performance metrics
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`text-sm font-semibold uppercase ${statusColors[data.status]}`}>
                {data.status}
              </span>
            </div>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                autoRefresh
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-accent'
              }`}
            >
              {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
            </button>

            <button
              onClick={fetchData}
              className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
              title="Refresh now"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {((data.alerts && data.alerts.length > 0) || (costData?.alerts && costData.alerts.length > 0)) && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            className="mb-8 rounded-lg border-2 border-yellow-500/50 bg-yellow-500/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                  Active Alerts ({(data.alerts?.length || 0) + (costData?.alerts?.length || 0)})
                </h3>
                <ul className="space-y-1">
                  {data.alerts?.map((alert, i) => (
                    <li key={`monitoring-${i}`} className="text-sm text-yellow-800 dark:text-yellow-200">
                      • {alert}
                    </li>
                  ))}
                  {costData?.alerts?.map((alert, i) => (
                    <li key={`cost-${i}`} className="text-sm text-yellow-800 dark:text-yellow-200">
                      💰 {alert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Metrics Grid */}
        <MetricsGrid data={data.last24h} />

        {/* Provider Status */}
        <ProviderStatus providers={data.providers} />

        {/* Cost Tracking */}
        {costData && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold mb-4">Cost Tracking & Budget</h2>
            <CostTracking summary={costData} />
          </motion.div>
        )}

        {/* Feedback Analysis */}
        {feedbackData && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold mb-4">Feedback Analysis</h2>
            <FeedbackAnalysis analysis={feedbackData} />
          </motion.div>
        )}

        {/* Quality Chart (placeholder for future) */}
        <QualityChart />

        {/* Last Updated */}
        <p className="text-xs text-center text-muted-foreground mt-8">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </motion.div>
    </div>
  )
}
