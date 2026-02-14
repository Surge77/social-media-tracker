'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TechnologyWithScore } from '@/types'
import { cn } from '@/lib/utils'

interface TechHeatmapProps {
  technologies: TechnologyWithScore[]
}

type SortColumn = 'name' | 'composite_score' | 'jobs_score' | 'community_score' | 'github_score' | 'ecosystem_score' | 'momentum'
type SortDirection = 'asc' | 'desc'

export function TechHeatmap({ technologies }: TechHeatmapProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [sortColumn, setSortColumn] = useState<SortColumn>('composite_score')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  // Sort technologies
  const sortedTechs = useMemo(() => {
    return [...technologies]
      .filter(t => t.composite_score !== null)
      .sort((a, b) => {
        let aVal: number | string = 0
        let bVal: number | string = 0

        if (sortColumn === 'name') {
          aVal = a.name
          bVal = b.name
        } else {
          aVal = a[sortColumn] ?? 0
          bVal = b[sortColumn] ?? 0
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        }

        return sortDirection === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number)
      })
      .slice(0, 50) // Show top 50
  }, [technologies, sortColumn, sortDirection])

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const getColor = (value: number | null, type: 'score' | 'momentum' = 'score'): string => {
    if (value === null) return 'hsl(var(--muted))'

    if (type === 'momentum') {
      // Momentum: red (negative) -> yellow (0) -> green (positive)
      if (value > 10) return 'hsl(142, 71%, 45%)' // Strong green
      if (value > 5) return 'hsl(142, 71%, 55%)' // Green
      if (value > 0) return 'hsl(84, 81%, 55%)' // Yellow-green
      if (value > -5) return 'hsl(48, 96%, 53%)' // Yellow
      if (value > -10) return 'hsl(25, 95%, 53%)' // Orange
      return 'hsl(0, 84%, 60%)' // Red
    }

    // Score: red (low) -> yellow (medium) -> green (high)
    if (value >= 75) return 'hsl(142, 71%, 45%)' // Dark green
    if (value >= 60) return 'hsl(142, 71%, 55%)' // Green
    if (value >= 50) return 'hsl(84, 81%, 55%)' // Yellow-green
    if (value >= 40) return 'hsl(48, 96%, 53%)' // Yellow
    if (value >= 25) return 'hsl(25, 95%, 53%)' // Orange
    return 'hsl(0, 84%, 60%)' // Red
  }

  const getTextColor = (value: number | null): string => {
    if (value === null) return 'hsl(var(--muted-foreground))'
    return 'white'
  }

  const columns = [
    { key: 'composite_score' as SortColumn, label: 'Overall', width: '80px' },
    { key: 'jobs_score' as SortColumn, label: 'Jobs', width: '80px' },
    { key: 'community_score' as SortColumn, label: 'Community', width: '100px' },
    { key: 'github_score' as SortColumn, label: 'GitHub', width: '80px' },
    { key: 'ecosystem_score' as SortColumn, label: 'Ecosystem', width: '100px' },
    { key: 'momentum' as SortColumn, label: 'Momentum', width: '90px' },
  ]

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Technology Heatmap</h3>
          <p className="text-sm text-muted-foreground">
            Top 50 technologies across all metrics • Click column headers to sort
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} />
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded" style={{ backgroundColor: 'hsl(48, 96%, 53%)' }} />
            <span className="text-muted-foreground">Mid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }} />
            <span className="text-muted-foreground">High</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-muted/50 backdrop-blur-sm">
          <div className="flex">
            {/* Technology Name Column */}
            <div
              className="flex min-w-[200px] cursor-pointer items-center gap-2 border-r px-4 py-3 font-semibold transition-colors hover:bg-muted"
              onClick={() => handleSort('name')}
            >
              <span className="text-sm">Technology</span>
              {sortColumn === 'name' && (
                sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
              )}
            </div>

            {/* Metric Columns */}
            {columns.map(col => (
              <div
                key={col.key}
                className="flex cursor-pointer items-center justify-center gap-1 border-r px-2 py-3 text-center font-semibold transition-colors hover:bg-muted"
                style={{ minWidth: col.width }}
                onClick={() => handleSort(col.key)}
              >
                <span className="text-xs">{col.label}</span>
                {sortColumn === col.key && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="max-h-[600px] overflow-y-auto">
          {sortedTechs.map((tech, index) => (
            <motion.div
              key={tech.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.5) }}
              className="group flex border-b last:border-b-0 transition-colors hover:bg-muted/30"
            >
              {/* Technology Name */}
              <div
                className="flex min-w-[200px] cursor-pointer items-center gap-3 border-r px-4 py-3"
                onClick={() => router.push(`/technologies/${tech.slug}`)}
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: tech.color }}
                />
                <span className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                  {tech.name}
                </span>
              </div>

              {/* Metric Cells */}
              {columns.map(col => {
                const value = tech[col.key]
                const numValue = typeof value === 'number' ? value : null
                const cellId = `${tech.id}-${col.key}`
                const isHovered = hoveredCell === cellId
                const isMomentum = col.key === 'momentum'

                return (
                  <div
                    key={col.key}
                    className="flex items-center justify-center border-r px-2 py-3 transition-all"
                    style={{
                      minWidth: col.width,
                      backgroundColor: getColor(numValue, isMomentum ? 'momentum' : 'score'),
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      zIndex: isHovered ? 5 : 1,
                    }}
                    onMouseEnter={() => setHoveredCell(cellId)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className="text-sm font-bold"
                        style={{ color: getTextColor(numValue) }}
                      >
                        {numValue !== null ? Math.round(numValue) : '—'}
                      </span>
                      {isMomentum && numValue !== null && (
                        numValue > 0 ? (
                          <TrendingUp className="h-3 w-3 text-white" />
                        ) : numValue < 0 ? (
                          <TrendingDown className="h-3 w-3 text-white" />
                        ) : null
                      )}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <p>Showing top 50 of {technologies.length} technologies</p>
        <p>Click any row to view details • Scroll to see more</p>
      </div>
    </motion.div>
  )
}
