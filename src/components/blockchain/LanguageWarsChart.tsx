'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { useTheme } from 'next-themes'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguageWars } from '@/hooks/useLanguageWars'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function LanguageWarsChart() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'midnight'
  const prefersReducedMotion = useReducedMotion()
  const { data, isLoading, isError } = useLanguageWars()

  const languages = data?.languages ?? []

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (isError || languages.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Language data unavailable.</p>
      </div>
    )
  }

  const chartData = languages.map((l) => ({
    name: l.name,
    score: l.composite_score,
    vm: l.vm,
    color: l.color,
    github: l.github_repos,
    so: l.so_questions,
    npm: l.npm_weekly,
  }))

  const tickColor = isDark ? '#71717a' : '#a1a1aa'

  return (
    <div className="space-y-6">
      {/* Composite Score Chart */}
      <div className="rounded-xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Composite Activity Score</h3>
            <p className="text-xs text-muted-foreground">
              Weighted: GitHub repos 40% · Stack Overflow 40% · npm 20%
            </p>
          </div>
          <span className="rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
            Live data
          </span>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 64 }}>
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: tickColor }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12, fill: isDark ? '#e4e4e7' : '#27272a', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              formatter={(value) => [`${value}/100`, 'Score']}
              contentStyle={{
                background: isDark ? '#111113' : '#fff',
                border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              cursor={{ fill: isDark ? '#27272a55' : '#f4f4f555' }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={28}>
              <LabelList
                dataKey="score"
                position="right"
                style={{ fontSize: 11, fontWeight: 600, fill: isDark ? '#a1a1aa' : '#71717a' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((v: number) => `${v}`) as any}
              />
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Language Detail Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {languages.map((lang, i) => (
          <motion.div
            key={lang.name}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="rounded-xl border bg-card p-4"
            style={{ borderColor: `${lang.color}33` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-bold text-foreground">{lang.name}</p>
                <p className="text-xs text-muted-foreground">{lang.vm}</p>
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ background: `${lang.color}22`, color: lang.color }}
              >
                {lang.composite_score}
              </span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {lang.description}
            </p>

            {/* Metrics */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">GitHub repos</span>
                <span className="font-mono font-medium">{fmtCount(lang.github_repos)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">SO questions</span>
                <span className="font-mono font-medium">{fmtCount(lang.so_questions)}</span>
              </div>
              {lang.npm_weekly > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">npm / week</span>
                  <span className="font-mono font-medium">{fmtCount(lang.npm_weekly)}</span>
                </div>
              )}
            </div>

            {/* Score bar */}
            <div className="mt-3 h-1 w-full rounded-full bg-muted">
              <div
                className="h-1 rounded-full transition-all duration-700"
                style={{ width: `${lang.composite_score}%`, backgroundColor: lang.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
