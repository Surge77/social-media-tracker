'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Star, TrendingUp, TrendingDown, BarChart3, RefreshCw, Zap, Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { LoadingSpinner } from '@/components/ui/loading'

interface StarDataPoint {
  date: string
  stars: number
}

interface ChartDataPoint {
  date: string
  stars: number
  delta: number
  growthRate: number // percentage growth from previous day
  movingAvg: number // 7-day moving average of stars
}

interface StarHistoryChartProps {
  slug: string
  techColor?: string | null
}

type ViewMode = 'cumulative' | 'daily'

const PERIODS = [
  { value: '90d', label: '90d', minDays: 0 },
  { value: '1y', label: '1y', minDays: 91 },
  { value: 'all', label: 'All', minDays: 180 },
]

function formatStars(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function formatDelta(n: number): string {
  const prefix = n >= 0 ? '+' : ''
  return `${prefix}${formatStars(n)}`
}

function formatPercent(n: number): string {
  const prefix = n >= 0 ? '+' : ''
  return `${prefix}${n.toFixed(2)}%`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

export function StarHistoryChart({ slug, techColor }: StarHistoryChartProps) {
  const prefersReducedMotion = useReducedMotion()
  const [period, setPeriod] = React.useState('90d')
  const [viewMode, setViewMode] = React.useState<ViewMode>('cumulative')
  const [rawData, setRawData] = React.useState<StarDataPoint[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null)
  const [totalDaysAvailable, setTotalDaysAvailable] = React.useState(0)

  const fetchData = React.useCallback(() => {
    setIsLoading(true)
    setError(null)
    setNote(null)

    fetch(`/api/technologies/${slug}/stars?period=${period}`)
      .then((r) => {
        if (!r.ok) throw new Error(`API error ${r.status}`)
        return r.json()
      })
      .then((res) => {
        setRawData(res.data ?? [])
        setLastUpdated(res.last_updated ?? null)
        setTotalDaysAvailable(res.total_days_available ?? 0)
        if (res.note) setNote(res.note)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load star history')
        setIsLoading(false)
      })
  }, [slug, period])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Compute enriched chart data with deltas, growth rates, and moving averages
  const chartData: ChartDataPoint[] = React.useMemo(() => {
    if (rawData.length === 0) return []

    return rawData.map((point, i) => {
      const delta = i === 0 ? 0 : point.stars - rawData[i - 1].stars
      const growthRate = i === 0 || rawData[i - 1].stars === 0
        ? 0
        : ((point.stars - rawData[i - 1].stars) / rawData[i - 1].stars) * 100

      // 7-day moving average
      const windowStart = Math.max(0, i - 6)
      const window = rawData.slice(windowStart, i + 1)
      const movingAvg = window.reduce((sum, p) => sum + p.stars, 0) / window.length

      return {
        date: point.date,
        stars: point.stars,
        delta,
        growthRate,
        movingAvg: Math.round(movingAvg),
      }
    })
  }, [rawData])

  const color = techColor ?? '#F59E0B'

  // Compute stats for the info-dense header
  const stats = React.useMemo(() => {
    if (chartData.length === 0) return null

    const latest = chartData[chartData.length - 1]
    const earliest = chartData[0]
    const gained = latest.stars - earliest.stars
    const gainPercent = earliest.stars > 0
      ? ((gained / earliest.stars) * 100)
      : 0

    const deltas = chartData.slice(1).map(d => d.delta)
    const avgDailyGain = deltas.length > 0
      ? Math.round(deltas.reduce((sum, d) => sum + d, 0) / deltas.length)
      : 0

    const peakDayIdx = deltas.reduce((maxIdx, val, idx) => val > deltas[maxIdx] ? idx : maxIdx, 0)
    const peakDay = chartData[peakDayIdx + 1]
    const peakDelta = deltas[peakDayIdx] ?? 0

    const worstDayIdx = deltas.reduce((minIdx, val, idx) => val < deltas[minIdx] ? idx : minIdx, 0)
    const worstDelta = deltas[worstDayIdx] ?? 0

    // Velocity: stars/day over last 7 days vs first 7 days
    const recentDeltas = deltas.slice(-7)
    const earlyDeltas = deltas.slice(0, 7)
    const recentVelocity = recentDeltas.length > 0
      ? recentDeltas.reduce((s, d) => s + d, 0) / recentDeltas.length
      : 0
    const earlyVelocity = earlyDeltas.length > 0
      ? earlyDeltas.reduce((s, d) => s + d, 0) / earlyDeltas.length
      : 0
    const velocityTrend = recentVelocity - earlyVelocity

    // Positive day percentage
    const positiveDays = deltas.filter(d => d > 0).length
    const positivePct = deltas.length > 0 ? (positiveDays / deltas.length) * 100 : 0

    return {
      total: latest.stars,
      gained,
      gainPercent,
      avgDailyGain,
      peakDay,
      peakDelta,
      worstDelta,
      recentVelocity: Math.round(recentVelocity * 10) / 10,
      velocityTrend,
      positivePct: Math.round(positivePct),
      daysTracked: chartData.length,
    }
  }, [chartData])

  // Y-axis domain
  const yDomain = React.useMemo(() => {
    if (chartData.length === 0) return [0, 100]

    if (viewMode === 'daily') {
      const deltas = chartData.map((d) => d.delta)
      const min = Math.min(...deltas)
      const max = Math.max(...deltas)
      const padding = Math.max(Math.abs(max - min) * 0.15, 1)
      return [Math.floor(min - padding), Math.ceil(max + padding)]
    }

    const stars = chartData.map((d) => d.stars)
    const min = Math.min(...stars)
    const max = Math.max(...stars)
    const range = max - min
    const padding = Math.max(range * 0.1, 10)
    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)]
  }, [chartData, viewMode])

  // Average line value for reference
  const avgValue = React.useMemo(() => {
    if (chartData.length === 0) return 0
    if (viewMode === 'daily') {
      const deltas = chartData.map(d => d.delta)
      return Math.round(deltas.reduce((s, d) => s + d, 0) / deltas.length)
    }
    return Math.round(chartData.reduce((s, d) => s + d.stars, 0) / chartData.length)
  }, [chartData, viewMode])

  const dataKey = viewMode === 'daily' ? 'delta' : 'stars'

  const formatDate = (dateStr: unknown) => {
    const date = new Date(String(dateStr))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatDateShort = (dateStr: unknown) => {
    const date = new Date(String(dateStr))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Enhanced tooltip with growth rate
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value: number; payload: ChartDataPoint }>
    label?: unknown
  }) => {
    if (!active || !payload || payload.length === 0) return null
    const point = payload[0].payload
    return (
      <div className="rounded-xl border border-border/60 bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-md">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {new Date(String(label)).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Star size={13} className="text-yellow-500" fill="currentColor" />
            {formatStars(point.stars)} stars
          </p>
          {point.delta !== 0 && (
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 text-xs font-semibold ${point.delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {point.delta > 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {formatDelta(point.delta)}
              </span>
              <span className={`text-xs ${point.growthRate > 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                ({formatPercent(point.growthRate)})
              </span>
            </div>
          )}
          {point.movingAvg > 0 && viewMode === 'cumulative' && (
            <p className="text-xs text-muted-foreground/80">
              7d avg: {formatStars(point.movingAvg)}
            </p>
          )}
        </div>
      </div>
    )
  }

  const visiblePeriods = PERIODS.filter((p) => totalDaysAvailable >= p.minDays || p.value === '90d')

  // --- Render states ---
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-muted/10">
        <LoadingSpinner size="sm" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted/80 hover:shadow-md"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      </div>
    )
  }

  if (note) {
    return (
      <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-border bg-muted/10">
        <p className="text-sm text-muted-foreground">{note}</p>
      </div>
    )
  }

  if (chartData.length === 0 || !stats) {
    return (
      <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-border bg-muted/10">
        <p className="text-sm text-muted-foreground">No star history data available yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top bar: controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ backgroundColor: `${color}15` }}>
            <Star size={14} style={{ color }} fill={color} />
            <span className="text-sm font-bold text-foreground">
              {formatStars(stats.total)}
            </span>
          </div>
          {stats.gained !== 0 && (
            <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${stats.gained > 0
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
              }`}>
              {stats.gained > 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {formatDelta(stats.gained)}
              <span className="opacity-70">({formatPercent(stats.gainPercent)})</span>
            </span>
          )}
          {lastUpdated && (
            <span className="text-xs text-muted-foreground/50" title={`Last data: ${lastUpdated}`}>
              · {timeAgo(lastUpdated)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-border/50 bg-muted/30 p-0.5">
            <button
              onClick={() => setViewMode('cumulative')}
              title="Total stars"
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${viewMode === 'cumulative'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <TrendingUp size={13} />
            </button>
            <button
              onClick={() => setViewMode('daily')}
              title="Daily gain"
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${viewMode === 'daily'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <BarChart3 size={13} />
            </button>
          </div>

          {/* Period selector */}
          <div className="flex rounded-lg border border-border/50 bg-muted/30 p-0.5">
            {visiblePeriods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${period === p.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats grid - the info-dense part */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {/* Avg daily gain */}
        <div className="rounded-lg border border-border/30 bg-muted/10 px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
            <Zap size={10} />
            Daily avg
          </div>
          <div className={`mt-0.5 text-sm font-bold ${stats.avgDailyGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatDelta(stats.avgDailyGain)}/day
          </div>
        </div>

        {/* Peak day */}
        <div className="rounded-lg border border-border/30 bg-muted/10 px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
            <ArrowUpRight size={10} />
            Best day
          </div>
          <div className="mt-0.5 text-sm font-bold text-emerald-400">
            {formatDelta(stats.peakDelta)}
          </div>
          {stats.peakDay && (
            <div className="text-[10px] text-muted-foreground/60">
              {new Date(stats.peakDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>

        {/* Velocity trend */}
        <div className="rounded-lg border border-border/30 bg-muted/10 px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {stats.velocityTrend > 0 ? <TrendingUp size={10} /> : stats.velocityTrend < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
            Velocity
          </div>
          <div className={`mt-0.5 text-sm font-bold ${stats.velocityTrend > 1 ? 'text-emerald-400' :
              stats.velocityTrend < -1 ? 'text-red-400' :
                'text-muted-foreground'
            }`}>
            {stats.recentVelocity > 0 ? '+' : ''}{stats.recentVelocity}/day
          </div>
          <div className="text-[10px] text-muted-foreground/60">
            last 7d
          </div>
        </div>

        {/* Positive days */}
        <div className="rounded-lg border border-border/30 bg-muted/10 px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
            <Calendar size={10} />
            Growth days
          </div>
          <div className="mt-0.5 text-sm font-bold text-foreground">
            {stats.positivePct}%
          </div>
          <div className="text-[10px] text-muted-foreground/60">
            of {stats.daysTracked} days
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`starGradient-${slug}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="40%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
              {/* Glow effect for the line */}
              <filter id={`glow-${slug}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 6"
              stroke="hsl(var(--border))"
              opacity={0.15}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              dy={5}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={viewMode === 'daily' ? formatDelta : formatStars}
              width={50}
              domain={yDomain}
              allowDataOverflow={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: color,
                strokeWidth: 1,
                strokeDasharray: '4 4',
                opacity: 0.5,
              }}
            />
            {/* Average reference line */}
            <ReferenceLine
              y={avgValue}
              stroke={color}
              strokeDasharray="6 6"
              strokeOpacity={0.3}
              label={{
                value: viewMode === 'daily' ? `avg ${formatDelta(avgValue)}` : `avg ${formatStars(avgValue)}`,
                position: 'right',
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 9,
                opacity: 0.5,
              }}
            />
            {/* Zero line for daily view */}
            {viewMode === 'daily' && (
              <ReferenceLine
                y={0}
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity={0.3}
              />
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#starGradient-${slug})`}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: color,
                fill: 'hsl(var(--background))',
                style: { filter: `drop-shadow(0 0 6px ${color})` },
              }}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom info bar */}
      {viewMode === 'daily' && chartData.length > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground/60">
          <span>
            Avg: <span className={stats.avgDailyGain >= 0 ? 'text-emerald-400/80' : 'text-red-400/80'}>
              {formatDelta(stats.avgDailyGain)}/day
            </span>
          </span>
          <span>
            Peak: <span className="text-emerald-400/80">{formatDelta(stats.peakDelta)}</span>
            {' · '}
            Worst: <span className="text-red-400/80">{formatDelta(stats.worstDelta)}</span>
          </span>
        </div>
      )}
    </div>
  )
}
