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
import { Package, TrendingUp, BarChart3, RefreshCw } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { LoadingSpinner } from '@/components/ui/loading'

interface DownloadDataPoint {
    date: string
    downloads: number
    source: string
}

interface ChartDataPoint {
    date: string
    downloads: number
    delta: number
}

interface PackageDownloadsChartProps {
    slug: string
    techColor?: string | null
}

type ViewMode = 'cumulative' | 'daily'

const PERIODS = [
    { value: '90d', label: '90 days', minDays: 0 },
    { value: '1y', label: '1 year', minDays: 91 },
    { value: 'all', label: 'All time', minDays: 180 },
]

function formatDownloads(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return String(n)
}

function formatDelta(n: number): string {
    const prefix = n >= 0 ? '+' : ''
    return `${prefix}${formatDownloads(n)}`
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

export function PackageDownloadsChart({ slug, techColor }: PackageDownloadsChartProps) {
    const prefersReducedMotion = useReducedMotion()
    const [period, setPeriod] = React.useState('90d')
    const [viewMode, setViewMode] = React.useState<ViewMode>('cumulative')
    const [rawData, setRawData] = React.useState<DownloadDataPoint[]>([])
    const [dataSource, setDataSource] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [note, setNote] = React.useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = React.useState<string | null>(null)
    const [totalDaysAvailable, setTotalDaysAvailable] = React.useState(0)

    const fetchData = React.useCallback(() => {
        setIsLoading(true)
        setError(null)
        setNote(null)

        fetch(`/api/technologies/${slug}/downloads?period=${period}`)
            .then((r) => {
                if (!r.ok) throw new Error(`API error ${r.status}`)
                return r.json()
            })
            .then((res) => {
                setRawData(res.data ?? [])
                setLastUpdated(res.last_updated ?? null)
                setTotalDaysAvailable(res.total_days_available ?? 0)
                setDataSource(res.source ?? null)
                if (res.note) setNote(res.note)
                setIsLoading(false)
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : 'Failed to load download history')
                setIsLoading(false)
            })
    }, [slug, period])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const chartData: ChartDataPoint[] = React.useMemo(() => {
        if (rawData.length === 0) return []

        return rawData.map((point, i) => ({
            date: point.date,
            downloads: point.downloads,
            delta: i === 0 ? 0 : point.downloads - rawData[i - 1].downloads,
        }))
    }, [rawData])

    const color = techColor ?? '#3B82F6'

    const yDomain = React.useMemo(() => {
        if (chartData.length === 0) return [0, 100]

        if (viewMode === 'daily') {
            const deltas = chartData.map((d) => d.delta)
            const min = Math.min(...deltas)
            const max = Math.max(...deltas)
            const padding = Math.max(Math.abs(max - min) * 0.15, 1)
            return [Math.floor(min - padding), Math.ceil(max + padding)]
        }

        const downloads = chartData.map((d) => d.downloads)
        const min = Math.min(...downloads)
        const max = Math.max(...downloads)
        const range = max - min
        const padding = Math.max(range * 0.1, 10)
        return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)]
    }, [chartData, viewMode])

    const dataKey = viewMode === 'daily' ? 'delta' : 'downloads'

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
        payload?: Array<{ value: number; payload: ChartDataPoint }>
        label?: unknown
    }) => {
        if (!active || !payload || payload.length === 0) return null
        const point = payload[0].payload
        return (
            <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                <p className="mb-1 text-xs text-muted-foreground">{formatDate(label)}</p>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Package size={12} className="opacity-80" style={{ color }} />
                    {formatDownloads(point.downloads)} downloads
                </p>
                {point.delta !== 0 && (
                    <p className={`text-xs ${point.delta > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {formatDelta(point.delta)} that day
                    </p>
                )}
            </div>
        )
    }

    const visiblePeriods = PERIODS.filter((p) => totalDaysAvailable >= p.minDays || p.value === '90d')

    if (isLoading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border bg-muted/20">
                <LoadingSpinner size="sm" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5">
                <p className="text-sm text-destructive">{error}</p>
                <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
                >
                    <RefreshCw size={12} />
                    Retry
                </button>
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

    if (chartData.length === 0) {
        return (
            <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-border bg-muted/20">
                <p className="text-sm text-muted-foreground">No downloads history data available yet</p>
            </div>
        )
    }

    const latest = chartData[chartData.length - 1]?.downloads ?? 0
    const earliest = chartData[0]?.downloads ?? 0
    const gained = latest - earliest

    const avgDailyGain =
        chartData.length > 1
            ? Math.round(chartData.slice(1).reduce((sum, d) => sum + d.delta, 0) / (chartData.length - 1))
            : 0

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Package size={14} style={{ color }} />
                    <span className="text-sm font-semibold text-foreground">
                        {formatDownloads(latest)} max downloads
                    </span>
                    {gained > 0 && (
                        <span className="text-xs text-emerald-500">+{formatDownloads(gained)}</span>
                    )}
                    {gained < 0 && (
                        <span className="text-xs text-red-400">{formatDownloads(gained)}</span>
                    )}
                    {dataSource && (
                        <span className="rounded bg-muted/50 px-1 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            {dataSource}
                        </span>
                    )}
                    {lastUpdated && (
                        <span className="text-xs text-muted-foreground/60" title={`Last data: ${lastUpdated}`}>
                            · Updated {timeAgo(lastUpdated)}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex rounded-full border border-border bg-muted/40 p-0.5">
                        <button
                            onClick={() => setViewMode('cumulative')}
                            title="Total downloads"
                            className={`rounded-full p-1.5 transition-colors ${viewMode === 'cumulative'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <TrendingUp size={12} />
                        </button>
                        <button
                            onClick={() => setViewMode('daily')}
                            title="Daily change"
                            className={`rounded-full p-1.5 transition-colors ${viewMode === 'daily'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <BarChart3 size={12} />
                        </button>
                    </div>

                    <div className="flex gap-1">
                        {visiblePeriods.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${period === p.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {viewMode === 'daily' && chartData.length > 1 && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                        Avg daily change:{' '}
                        <span className={avgDailyGain >= 0 ? 'text-emerald-500' : 'text-red-400'}>
                            {formatDelta(avgDailyGain)}/day
                        </span>
                    </span>
                </div>
            )}

            <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id={`downloadGradient-${slug}`} x1="0" y1="0" x2="0" y2="1">
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
                            tickFormatter={viewMode === 'daily' ? formatDelta : formatDownloads}
                            width={52}
                            domain={yDomain}
                            allowDataOverflow={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#downloadGradient-${slug})`}
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
