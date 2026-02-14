'use client'

import React, { useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Label,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, GitBranch, Users, Briefcase, Blocks } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompareData } from '@/types'

interface TrendChartProps {
  compareData: CompareData
  technologies: Array<{ slug: string; name: string; color: string }>
  className?: string
}

type MetricType = 'composite' | 'github' | 'community' | 'jobs' | 'ecosystem'

const METRICS: Array<{ key: MetricType; label: string; icon: React.ReactNode }> = [
  { key: 'composite', label: 'Overall', icon: <TrendingUp size={14} /> },
  { key: 'github', label: 'GitHub', icon: <GitBranch size={14} /> },
  { key: 'community', label: 'Community', icon: <Users size={14} /> },
  { key: 'jobs', label: 'Jobs', icon: <Briefcase size={14} /> },
  { key: 'ecosystem', label: 'Ecosystem', icon: <Blocks size={14} /> },
]

const SCORE_ZONES = [
  { y1: 70, y2: 100, fill: '#10B981', label: 'Strong' },
  { y1: 40, y2: 70, fill: '#F59E0B', label: 'Moderate' },
  { y1: 0, y2: 40, fill: '#EF4444', label: 'Low' },
] as const

export function TrendChart({ compareData, technologies, className }: TrendChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('composite')
  const [showForecast, setShowForecast] = useState(true)

  const chartData = compareData.chart_data

  // Simple linear regression forecast
  const forecastData = useMemo(() => {
    if (!showForecast || !chartData || chartData.length < 5) return []

    const forecasts: Array<Record<string, string | number | boolean>> = []
    const forecastDays = 14

    technologies.forEach((tech) => {
      const values = chartData
        .map((d, i) => ({ x: i, y: Number(d[tech.slug]) || 0 }))
        .filter(v => v.y > 0)

      if (values.length < 5) return

      // Linear regression
      const n = values.length
      const sumX = values.reduce((sum, v) => sum + v.x, 0)
      const sumY = values.reduce((sum, v) => sum + v.y, 0)
      const sumXY = values.reduce((sum, v) => sum + v.x * v.y, 0)
      const sumXX = values.reduce((sum, v) => sum + v.x * v.x, 0)

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n

      // Generate forecast points
      for (let i = 1; i <= forecastDays; i++) {
        const x = n + i - 1
        const y = Math.max(0, Math.min(100, slope * x + intercept))

        const forecastDate = new Date(chartData[chartData.length - 1].date as string)
        forecastDate.setDate(forecastDate.getDate() + i)

        if (!forecasts[i - 1]) {
          forecasts[i - 1] = {
            date: forecastDate.toISOString().split('T')[0],
            isForecast: true,
          }
        }

        forecasts[i - 1][`${tech.slug}_forecast`] = y
      }
    })

    return forecasts
  }, [chartData, technologies, showForecast])

  // Period changes
  const periodChanges = useMemo(() => {
    if (!chartData || chartData.length < 2) return []
    const first = chartData[0]
    const last = chartData[chartData.length - 1]
    return technologies.map((tech) => {
      const startVal = Number(first[tech.slug]) || 0
      const endVal = Number(last[tech.slug]) || 0
      const change = Math.round((endVal - startVal) * 10) / 10
      return { name: tech.name, color: tech.color, change }
    })
  }, [chartData, technologies])

  const combinedData = [...chartData, ...forecastData]

  const formatDate = (dateStr: unknown) => {
    const date = new Date(String(dateStr))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const dateStr = formatDate(label)
    const isForecast = payload[0]?.payload?.isForecast
    const sorted = [...payload]
      .filter((p: any) => !p.dataKey.includes('_forecast'))
      .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0))

    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-lg">
        <p className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {dateStr}
          {isForecast && (
            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              Forecast
            </span>
          )}
        </p>
        <div className="space-y-1">
          {sorted.map((entry: any) => {
            const scoreLevel = entry.value >= 70 ? 'text-emerald-400' :
              entry.value >= 40 ? 'text-amber-400' : 'text-red-400'
            return (
              <div key={entry.name} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-xs">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}
                </span>
                <span className={cn('text-xs font-mono font-semibold', scoreLevel)}>
                  {Math.round(entry.value)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Metric Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {METRICS.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                selectedMetric === metric.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
              )}
            >
              {metric.icon}
              <span className="hidden xs:inline">{metric.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForecast(!showForecast)}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
            showForecast
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'border border-border bg-card/50 text-muted-foreground hover:bg-card'
          )}
        >
          {showForecast ? '✓' : ''} 14-Day Forecast
        </button>
      </div>

      {/* Period change pills */}
      {periodChanges.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-muted-foreground">Period change:</span>
          {periodChanges.map((pc) => (
            <span
              key={pc.name}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
                pc.change > 0 ? 'border-emerald-500/20 text-emerald-400' :
                pc.change < 0 ? 'border-red-500/20 text-red-400' :
                'border-border text-muted-foreground'
              )}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: pc.color }}
              />
              {pc.change > 0 ? <TrendingUp size={11} /> : pc.change < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
              {pc.change > 0 ? '+' : ''}{pc.change}
            </span>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={combinedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              {technologies.map((tech) => (
                <linearGradient key={tech.slug} id={`gradient${tech.slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tech.color} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={tech.color} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>

            {/* Score zone backgrounds */}
            {SCORE_ZONES.map((zone) => (
              <ReferenceArea
                key={zone.label}
                y1={zone.y1}
                y2={zone.y2}
                fill={zone.fill}
                fillOpacity={0.04}
              />
            ))}

            {/* Threshold lines */}
            <ReferenceLine y={70} stroke="#10B981" strokeOpacity={0.2} strokeDasharray="4 4" />
            <ReferenceLine y={40} stroke="#F59E0B" strokeOpacity={0.2} strokeDasharray="4 4" />

            {/* Forecast separator */}
            {showForecast && forecastData.length > 0 && (
              <ReferenceLine
                x={chartData[chartData.length - 1].date}
                stroke="hsl(var(--primary))"
                strokeOpacity={0.3}
                strokeDasharray="4 4"
              >
                <Label value="Forecast →" position="top" fill="hsl(var(--primary))" fontSize={10} />
              </ReferenceLine>
            )}

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }}
              iconType="circle"
              iconSize={8}
            />

            {/* Historical data as filled areas */}
            {technologies.map((tech) => (
              <Area
                key={tech.slug}
                type="monotone"
                dataKey={tech.slug}
                name={tech.name}
                stroke={tech.color}
                strokeWidth={2.5}
                fill={`url(#gradient${tech.slug})`}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
                connectNulls
              />
            ))}

            {/* Forecast lines (dashed) */}
            {showForecast && technologies.map((tech) => (
              <Line
                key={`${tech.slug}_forecast`}
                type="monotone"
                dataKey={`${tech.slug}_forecast`}
                stroke={tech.color}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-6 rounded bg-gradient-to-b from-primary/60 to-primary/10" />
          <span>Historical trend (area)</span>
        </div>
        {showForecast && (
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 border-t-2 border-dashed border-primary" />
            <span>14-day forecast (dashed line)</span>
          </div>
        )}
      </div>
    </div>
  )
}
