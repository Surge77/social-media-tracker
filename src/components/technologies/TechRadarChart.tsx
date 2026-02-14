'use client'

import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TechRadarChartProps {
  githubScore: number | null
  communityScore: number | null
  jobsScore: number | null
  ecosystemScore: number | null
  compositeScore?: number | null
  techColor?: string
  className?: string
}

export function TechRadarChart({
  githubScore,
  communityScore,
  jobsScore,
  ecosystemScore,
  compositeScore,
  techColor = 'hsl(var(--primary))',
  className
}: TechRadarChartProps) {
  const prefersReducedMotion = useReducedMotion()

  // Prepare radar chart data
  const radarData = [
    {
      metric: 'Jobs',
      value: jobsScore ?? 0,
      fullMark: 100,
    },
    {
      metric: 'Community',
      value: communityScore ?? 0,
      fullMark: 100,
    },
    {
      metric: 'GitHub',
      value: githubScore ?? 0,
      fullMark: 100,
    },
    {
      metric: 'Ecosystem',
      value: ecosystemScore ?? 0,
      fullMark: 100,
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload

    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="font-semibold text-foreground">{data.metric}</p>
        <p className="text-sm text-muted-foreground">
          Score: <span className="font-medium text-foreground">{data.value.toFixed(1)}/100</span>
        </p>
      </div>
    )
  }

  // Calculate average score
  const scores = [jobsScore, communityScore, githubScore, ecosystemScore].filter(
    (s): s is number => s !== null
  )
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className="overflow-hidden border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Metric Profile</h3>
              <p className="text-sm text-muted-foreground">
                Performance across key dimensions
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {avgScore.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{
                    fill: 'hsl(var(--foreground))',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 10,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke={techColor}
                  fill={techColor}
                  fillOpacity={0.6}
                  isAnimationActive={!prefersReducedMotion}
                  animationDuration={800}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Center composite score badge (if provided) */}
            {compositeScore !== null && compositeScore !== undefined && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-full border-2 bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm" style={{ borderColor: techColor }}>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: techColor }}>
                      {Math.round(compositeScore)}
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                      Overall
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Score Details */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
            {radarData.map((item, index) => {
              const percentage = item.value
              const isLow = percentage < 40
              const isMid = percentage >= 40 && percentage < 70
              const isHigh = percentage >= 70

              return (
                <div key={item.metric} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.metric}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={prefersReducedMotion ? false : { width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className={cn(
                          'h-full rounded-full',
                          isHigh && 'bg-success',
                          isMid && 'bg-warning',
                          isLow && 'bg-destructive'
                        )}
                      />
                    </div>
                    <span className="min-w-[2.5rem] text-right text-xs font-semibold text-foreground">
                      {Math.round(item.value)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
