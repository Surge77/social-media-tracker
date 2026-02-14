'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  TrendingUp,
  Database,
  Clock,
  ThumbsUp,
  AlertCircle,
  DollarSign,
  Zap
} from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface MetricsGridProps {
  data: {
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
}

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: string
  index: number
}

function MetricCard({ icon: Icon, label, value, subtitle, color = 'text-primary', index }: MetricCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.3, delay: index * 0.05 }}
      className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg bg-primary/10 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}

export function MetricsGrid({ data }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard
        icon={Activity}
        label="Total Generations"
        value={data.totalGenerations}
        subtitle="Last 24 hours"
        index={0}
      />

      <MetricCard
        icon={TrendingUp}
        label="Quality Score"
        value={data.avgQualityScore > 0 ? data.avgQualityScore : 'N/A'}
        subtitle={data.avgQualityScore > 70 ? 'Good' : data.avgQualityScore > 50 ? 'Fair' : 'Low'}
        color={data.avgQualityScore > 70 ? 'text-green-600' : data.avgQualityScore > 50 ? 'text-yellow-600' : 'text-red-600'}
        index={1}
      />

      <MetricCard
        icon={Database}
        label="Cache Hit Rate"
        value={`${data.cacheHitRate}%`}
        subtitle={data.cacheHitRate > 90 ? 'Excellent' : data.cacheHitRate > 70 ? 'Good' : 'Low'}
        color={data.cacheHitRate > 90 ? 'text-green-600' : 'text-yellow-600'}
        index={2}
      />

      <MetricCard
        icon={Clock}
        label="Avg Latency"
        value={data.avgLatencyMs > 0 ? `${data.avgLatencyMs}ms` : 'N/A'}
        subtitle={data.avgLatencyMs < 1000 ? 'Fast' : data.avgLatencyMs < 3000 ? 'Moderate' : 'Slow'}
        color={data.avgLatencyMs < 1000 ? 'text-green-600' : 'text-yellow-600'}
        index={3}
      />

      <MetricCard
        icon={ThumbsUp}
        label="Positive Feedback"
        value={data.positiveFeedbackRate > 0 ? `${data.positiveFeedbackRate}%` : 'N/A'}
        subtitle={`From ${data.totalGenerations} generations`}
        color={data.positiveFeedbackRate > 75 ? 'text-green-600' : 'text-yellow-600'}
        index={4}
      />

      <MetricCard
        icon={AlertCircle}
        label="Error Rate"
        value={`${data.errorRate}%`}
        subtitle={`${data.totalErrors} errors`}
        color={data.errorRate < 5 ? 'text-green-600' : data.errorRate < 10 ? 'text-yellow-600' : 'text-red-600'}
        index={5}
      />

      <MetricCard
        icon={Zap}
        label="Fallback Rate"
        value={`${data.fallbackRate}%`}
        subtitle={data.fallbackRate < 10 ? 'Low' : 'High'}
        color={data.fallbackRate < 10 ? 'text-green-600' : 'text-yellow-600'}
        index={6}
      />

      <MetricCard
        icon={DollarSign}
        label="Estimated Cost"
        value={`$${data.estimatedCost.toFixed(2)}`}
        subtitle="Last 24 hours"
        color={data.estimatedCost < 1 ? 'text-green-600' : data.estimatedCost < 5 ? 'text-yellow-600' : 'text-red-600'}
        index={7}
      />
    </div>
  )
}
