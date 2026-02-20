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
} from 'recharts'
import { Star } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface StarDataPoint {
  date: string
  stars: number
}

interface StarHistoryChartProps {
  slug: string
  techColor?: string | null
}

const PERIODS = [
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
  { value: 'all', label: 'All time' },
]

function formatStars(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function StarHistoryChart({ slug, techColor }: StarHistoryChartProps) {
  const prefersReducedMotion = useReducedMotion()
  const [period, setPeriod] = React.useState('1y')
  const [data, setData] = React.useState<StarDataPoint[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [note, setNote] = React.useState<string | null>(null)

  React.useEffect(() => {
    setIsLoading(true)
    setNote(null)

    fetch(`/api/technologies/${slug}/stars?period=${period}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res.data ?? [])
        if (res.note) setNote(res.note)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [slug, period])

  const color = techColor ?? '#F59E0B'

  const formatDate = (dateStr: unknown) => {
    const date = new Date(String(dateStr))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value: number }>
    label?: unknown
  }) => {
    if (!active || !payload || payload.length === 0) return null
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
        <p className="mb-1 text-xs text-muted-foreground">{formatDate(label)}</p>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Star size={12} className="text-yellow-500" />
          {formatStars(payload[0].value)}
        </p>
      </div>
    )
  }

  if (note) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">{note}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border bg-muted/20">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">No star history data available yet</p>
      </div>
    )
  }

  const latest = data[data.length - 1]?.stars ?? 0
  const earliest = data[0]?.stars ?? 0
  const gained = latest - earliest

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Star size={14} className="text-yellow-500" />
          <span className="text-sm font-semibold text-foreground">
            {formatStars(latest)} total stars
          </span>
          {gained > 0 && (
            <span className="text-xs text-emerald-500">+{formatStars(gained)} this period</span>
          )}
        </div>

        {/* Period selector */}
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`starGradient-${slug}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatStars}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="stars"
              stroke={color}
              strokeWidth={2}
              fill={`url(#starGradient-${slug})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
              isAnimationActive={!prefersReducedMotion}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
