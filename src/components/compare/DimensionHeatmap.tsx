'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { scaleLinear } from 'd3-scale'
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { CompareData } from '@/types'

interface DimensionHeatmapProps {
  compareData: CompareData
  className?: string
}

const DIMENSIONS = [
  { key: 'github_score', label: 'GitHub', shortLabel: 'GH', description: 'Stars, forks, contributors, activity' },
  { key: 'community_score', label: 'Community', shortLabel: 'Comm', description: 'HN mentions, Reddit posts, dev.to articles' },
  { key: 'jobs_score', label: 'Jobs', shortLabel: 'Jobs', description: 'Job postings across multiple boards' },
  { key: 'ecosystem_score', label: 'Ecosystem', shortLabel: 'Eco', description: 'npm downloads, SO questions, libraries' },
] as const

export function DimensionHeatmap({ compareData, className }: DimensionHeatmapProps) {
  const prefersReducedMotion = useReducedMotion()
  const [hoveredCell, setHoveredCell] = useState<{ tech: string; dim: string } | null>(null)

  // Color scale: Red (0-40) -> Yellow (40-70) -> Green (70-100)
  const colorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain([0, 40, 70, 100])
      .range(['#ef4444', '#f59e0b', '#84cc16', '#10b981'])
      .clamp(true)
  }, [])

  // Get dimension leader and insight
  const getDimensionInsight = (dimension: typeof DIMENSIONS[number]): string => {
    const scores = compareData.technologies.map(t => ({
      name: t.name,
      score: t[dimension.key as keyof typeof t] as number || 0,
    }))

    const leader = scores.sort((a, b) => b.score - a.score)[0]
    const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
    const gap = Math.max(...scores.map(s => s.score)) - Math.min(...scores.map(s => s.score))

    if (gap < 10) {
      return `Very competitive — all within ${gap.toFixed(0)} points`
    }

    if (leader.score > avg + 20) {
      return `${leader.name} dominates (${leader.score.toFixed(0)}/100)`
    }

    if (leader.score < 40) {
      return `All score low — may indicate data limitations`
    }

    return `${leader.name} leads (${leader.score.toFixed(0)}/100)`
  }

  // Simulate trend (would use historical data in production)
  const getTrend = (techName: string, dimension: string): number => {
    const hash = techName.length + dimension.length
    return (hash % 7) - 3
  }

  const cellSize = {
    width: 120,
    height: 80,
    gap: 8,
  }

  const headerHeight = 60
  const labelWidth = 100

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Dimension Heatmap</h3>
        <p className="text-sm text-muted-foreground">
          Color intensity shows score strength (red: weak, yellow: moderate, green: strong)
        </p>
      </div>

      {/* Heatmap Container */}
      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{
            minWidth: labelWidth + (cellSize.width + cellSize.gap) * DIMENSIONS.length,
            minHeight: headerHeight + (cellSize.height + cellSize.gap) * compareData.technologies.length,
          }}
        >
          {/* Column Headers (Dimensions) */}
          <div className="flex" style={{ marginLeft: labelWidth }}>
            {DIMENSIONS.map((dim, idx) => (
              <motion.div
                key={dim.key}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex flex-col items-center justify-end px-2"
                style={{ width: cellSize.width, height: headerHeight }}
              >
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground">
                    <span className="hidden sm:inline">{dim.label}</span>
                    <span className="sm:hidden">{dim.shortLabel}</span>
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground line-clamp-2">
                    {dim.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Heatmap Grid */}
          {compareData.technologies.map((tech, techIdx) => (
            <div key={tech.slug} className="flex items-center" style={{ marginTop: cellSize.gap }}>
              {/* Row Label (Technology) */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: techIdx * 0.05 }}
                className="flex items-center gap-2 pr-3"
                style={{ width: labelWidth, height: cellSize.height }}
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: tech.color }}
                />
                <span className="text-sm font-medium text-foreground truncate">
                  {tech.name}
                </span>
              </motion.div>

              {/* Cells */}
              {DIMENSIONS.map((dim, dimIdx) => {
                const score = tech[dim.key as keyof typeof tech] as number || 0
                const trend = getTrend(tech.name, dim.key)
                const isHovered = hoveredCell?.tech === tech.slug && hoveredCell?.dim === dim.key

                return (
                  <motion.div
                    key={`${tech.slug}-${dim.key}`}
                    initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: (techIdx * DIMENSIONS.length + dimIdx) * 0.02 }}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05, zIndex: 10 }}
                    onHoverStart={() => setHoveredCell({ tech: tech.slug, dim: dim.key })}
                    onHoverEnd={() => setHoveredCell(null)}
                    className={cn(
                      'relative flex flex-col items-center justify-center rounded-lg border-2 transition-all cursor-pointer',
                      isHovered ? 'border-foreground shadow-lg' : 'border-transparent'
                    )}
                    style={{
                      width: cellSize.width,
                      height: cellSize.height,
                      backgroundColor: colorScale(score),
                      marginLeft: dimIdx === 0 ? 0 : cellSize.gap,
                    }}
                  >
                    {/* Score */}
                    <div className="text-2xl font-bold text-white drop-shadow-md">
                      {score.toFixed(0)}
                    </div>

                    {/* Trend indicator */}
                    <div className={cn(
                      "flex items-center gap-0.5 text-xs font-medium text-white/90 drop-shadow",
                      trend > 0 && "text-white",
                      trend < 0 && "text-white/80",
                    )}>
                      {trend > 0 ? <TrendingUp size={10} /> : trend < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                      <span>{trend > 0 ? '+' : ''}{trend}</span>
                    </div>

                    {/* Hover Tooltip */}
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 min-w-[140px] rounded-lg border border-border bg-card px-3 py-2 shadow-xl"
                      >
                        <p className="text-xs font-semibold text-foreground">{tech.name}</p>
                        <p className="text-[10px] text-muted-foreground">{dim.label}</p>
                        <p className="mt-1 text-sm font-bold text-primary">{score.toFixed(1)}/100</p>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          Trend: {trend > 0 ? '+' : ''}{trend} pts
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Dimension Insights */}
      <div className="grid gap-3 sm:grid-cols-2">
        {DIMENSIONS.map((dim, idx) => (
          <motion.div
            key={dim.key}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2"
          >
            <div className="flex items-start gap-2">
              <Info className="h-3.5 w-3.5 shrink-0 text-primary" style={{ marginTop: '2px' }} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">{dim.label}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {getDimensionInsight(dim)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-4 w-8 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span>Weak (0-40)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-4 w-8 rounded" style={{ backgroundColor: '#f59e0b' }} />
          <span>Moderate (40-70)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-4 w-8 rounded" style={{ backgroundColor: '#10b981' }} />
          <span>Strong (70-100)</span>
        </div>
      </div>
    </div>
  )
}
