'use client'

import React, { useState, useMemo, useRef, useCallback } from 'react'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TechnologyWithScore } from '@/types'
import { CATEGORY_LABELS } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TechHeatmapProps {
  technologies: TechnologyWithScore[]
}

type SortKey =
  | 'composite_score'
  | 'jobs_score'
  | 'community_score'
  | 'github_score'
  | 'ecosystem_score'
  | 'momentum'

// ─── Constants ────────────────────────────────────────────────────────────────

const METRICS: { key: SortKey; label: string }[] = [
  { key: 'github_score',    label: 'GitHub'    },
  { key: 'community_score', label: 'Community' },
  { key: 'jobs_score',      label: 'Jobs'      },
  { key: 'ecosystem_score', label: 'Ecosystem' },
  { key: 'momentum',        label: 'Momentum'  },
  { key: 'composite_score', label: 'Overall'   },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'composite_score', label: 'Overall'   },
  { value: 'jobs_score',      label: 'Jobs'      },
  { value: 'community_score', label: 'Community' },
  { value: 'github_score',    label: 'GitHub'    },
  { value: 'ecosystem_score', label: 'Ecosystem' },
  { value: 'momentum',        label: 'Momentum'  },
]

const SCORE_BARS: { key: keyof TechnologyWithScore; label: string }[] = [
  { key: 'github_score',    label: 'GitHub'    },
  { key: 'community_score', label: 'Community' },
  { key: 'jobs_score',      label: 'Jobs'      },
  { key: 'ecosystem_score', label: 'Ecosystem' },
  { key: 'composite_score', label: 'Overall'   },
]

const MAX_TECHS = 30

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreBarColor(val: number): string {
  if (val >= 70) return '#16a34a'
  if (val >= 45) return '#d97706'
  return '#dc2626'
}

function momentumLabel(m: number): string {
  if (m > 8)  return 'Rising fast'
  if (m > 2)  return 'Growing'
  if (m >= -2) return 'Stable'
  if (m > -8) return 'Cooling'
  return 'Declining'
}

function momentumColor(m: number, isDark: boolean): string {
  if (m > 2)  return '#22c55e'
  if (m < -2) return '#ef4444'
  return isDark ? '#71717a' : '#a1a1aa'
}

// ─── Hover Card ───────────────────────────────────────────────────────────────

interface HoverCardProps {
  tech: TechnologyWithScore
  isDark: boolean
}

function HoverCard({ tech, isDark }: HoverCardProps) {
  const bg      = isDark ? '#111113' : '#ffffff'
  const border  = isDark ? '#27272a' : '#e4e4e7'
  const fg      = isDark ? '#d4d4d8' : '#3f3f46'
  const fgMuted = isDark ? '#71717a' : '#a1a1aa'
  const trackBg = isDark ? '#27272a' : '#f4f4f5'

  const momentum = tech.momentum ?? 0
  const mColor   = momentumColor(momentum, isDark)
  const mLabel   = momentumLabel(momentum)
  const mArrow   = momentum > 2 ? '▲' : momentum < -2 ? '▼' : '→'

  const rankChange = tech.rank_change ?? null

  return (
    <div
      style={{
        width: 268,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: '14px 16px',
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.6)'
          : '0 8px 32px rgba(0,0,0,0.12)',
        fontFamily: 'inherit',
        pointerEvents: 'none',
      }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        {/* Color dot */}
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: tech.color,
            marginTop: 3,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + rank change */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: fg, lineHeight: 1.2 }}>
              {tech.name}
            </span>
            {rankChange !== null && rankChange !== 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: rankChange > 0 ? '#22c55e' : '#ef4444',
                  backgroundColor: rankChange > 0
                    ? (isDark ? '#14532d44' : '#dcfce744')
                    : (isDark ? '#7f1d1d44' : '#fee2e244'),
                  border: `1px solid ${rankChange > 0 ? '#16a34a44' : '#dc262644'}`,
                  borderRadius: 4,
                  padding: '1px 5px',
                  flexShrink: 0,
                }}
              >
                {rankChange > 0 ? `↑${rankChange}` : `↓${Math.abs(rankChange)}`}
              </span>
            )}
          </div>
          {/* Badges row */}
          <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: fgMuted,
                backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                borderRadius: 4,
                padding: '1px 6px',
              }}
            >
              {CATEGORY_LABELS[tech.category] ?? tech.category}
            </span>
            {tech.lifecycle_label && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: '#7c3aed',
                  backgroundColor: isDark ? '#3b0764aa' : '#f5f3ffaa',
                  border: '1px solid #7c3aed44',
                  borderRadius: 4,
                  padding: '1px 6px',
                }}
              >
                {tech.lifecycle_label}
              </span>
            )}
          </div>
        </div>
        {/* Overall score badge */}
        <div
          style={{
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: 8,
            background: `${tech.color}22`,
            border: `1.5px solid ${tech.color}55`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: tech.color, lineHeight: 1 }}>
            {Math.round(tech.composite_score ?? 0)}
          </span>
          <span style={{ fontSize: 8, color: fgMuted, marginTop: 1 }}>score</span>
        </div>
      </div>

      {/* ── AI summary ─────────────────────────────── */}
      {tech.ai_summary && (
        <p
          style={{
            fontSize: 11,
            color: fgMuted,
            lineHeight: 1.5,
            marginBottom: 12,
            paddingBottom: 12,
            borderBottom: `1px solid ${border}`,
            fontStyle: 'italic',
          }}
        >
          &ldquo;
          {tech.ai_summary.length > 90
            ? tech.ai_summary.slice(0, 87) + '…'
            : tech.ai_summary}
          &rdquo;
        </p>
      )}

      {/* ── Score bars ─────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {SCORE_BARS.map(({ key, label }) => {
          const val = Math.round((tech[key] as number | null) ?? 0)
          const color = key === 'composite_score' ? tech.color : scoreBarColor(val)
          const isOverall = key === 'composite_score'
          return (
            <div key={key}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 3,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: isOverall ? fg : fgMuted,
                    fontWeight: isOverall ? 600 : 400,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: color,
                  }}
                >
                  {val}
                </span>
              </div>
              <div
                style={{
                  height: isOverall ? 5 : 3,
                  borderRadius: 99,
                  background: trackBg,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${val}%`,
                    borderRadius: 99,
                    backgroundColor: color,
                    opacity: isOverall ? 1 : 0.85,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Momentum ───────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: 8,
          background: isDark ? '#1c1c1f' : '#f8f8f8',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 10, color: fgMuted }}>Momentum</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: mColor }}>
          {mArrow} {momentum > 0 ? '+' : ''}
          {momentum.toFixed(1)} &middot; {mLabel}
        </span>
      </div>

      {/* ── Footer hint ────────────────────────────── */}
      <div style={{ fontSize: 10, color: fgMuted, textAlign: 'center' }}>
        Click to view full details →
      </div>
    </div>
  )
}

// ─── Card positioning ─────────────────────────────────────────────────────────

const CARD_W = 268
const CARD_H = 380 // approximate — used for smart flipping only
const OFFSET  = 20 // distance from cursor

function cardPosition(cursorX: number, cursorY: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Prefer right of cursor; flip left if too close to right edge
  const left =
    cursorX + OFFSET + CARD_W > vw - 12
      ? cursorX - CARD_W - OFFSET
      : cursorX + OFFSET

  // Vertically centered on cursor; clamp to viewport
  let top = cursorY - CARD_H / 2
  if (top < 8)            top = 8
  if (top + CARD_H > vh - 8) top = vh - CARD_H - 8

  return { left, top }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TechHeatmap({ technologies }: TechHeatmapProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const prefersReducedMotion = useReducedMotion()
  const isDark = resolvedTheme === 'dark'

  const [sortKey, setSortKey] = useState<SortKey>('composite_score')

  // Custom tooltip state — bypasses nivo's clipped tooltip layer
  const [hoveredTech, setHoveredTech]   = useState<TechnologyWithScore | null>(null)
  const [cardPos, setCardPos]           = useState({ left: 0, top: 0 })
  // Ref lets nivo's tooltip render prop set the current tech without a setState-in-render
  const pendingTechRef = useRef<TechnologyWithScore | null>(null)

  const top = useMemo(
    () =>
      [...technologies]
        .filter((t) => t.composite_score !== null)
        .sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0))
        .slice(0, MAX_TECHS),
    [technologies, sortKey]
  )

  const techMap = useMemo(() => {
    const m = new Map<string, TechnologyWithScore>()
    for (const t of top) m.set(t.name, t)
    return m
  }, [top])

  const data = useMemo(
    () =>
      top.map((tech) => ({
        id: tech.name,
        data: METRICS.map((m) => ({
          x: m.label,
          y: Math.round((tech[m.key] as number | null) ?? 0),
        })),
      })),
    [top]
  )

  // ~26px per row, clamped to 300–720px
  const containerHeight = Math.min(720, Math.max(300, top.length * 26 + 60))

  const fg      = isDark ? '#d4d4d8' : '#3f3f46'
  const fgMuted = isDark ? '#71717a' : '#a1a1aa'
  const axisLabelColor = isDark ? '#c4c4cd' : '#27272a'

  const nivoTheme = {
    text: { fill: fg, fontFamily: 'inherit', fontSize: 11 },
    axis: { ticks: { text: { fill: axisLabelColor, fontSize: 12, fontWeight: 500 } } },
    // Zero out nivo's tooltip wrapper — we render our own fixed card instead
    tooltip: { container: { padding: 0, background: 'transparent', boxShadow: 'none' } },
  }

  const handleCellClick = (cell: { serieId: string | number }) => {
    const tech = techMap.get(String(cell.serieId))
    if (tech) router.push(`/technologies/${tech.slug}`)
  }

  // Called on every mouse move over the chart area
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setCardPos(cardPosition(e.clientX, e.clientY))
    // Flush whatever tech nivo's tooltip render set in the ref
    if (pendingTechRef.current !== hoveredTech) {
      setHoveredTech(pendingTechRef.current)
    }
  }, [hoveredTech])

  const handleMouseLeave = useCallback(() => {
    setHoveredTech(null)
    pendingTechRef.current = null
  }, [])

  const excluded = technologies.filter((t) => t.composite_score !== null).length - top.length

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Score Heatmap</h3>
          <p className="text-sm text-muted-foreground">
            Hover any row for details · click to open
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Sort by</span>
            <div className="flex overflow-hidden rounded-lg border border-border">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortKey(opt.value)}
                  className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    sortKey === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-right text-xs">
            <p className="font-medium text-primary">{top.length} shown</p>
            {excluded > 0 && (
              <p className="text-muted-foreground">{excluded} more in table</p>
            )}
          </div>
        </div>
      </div>

      {/* Chart — onMouseMove + onMouseLeave drive the fixed card below */}
      <div
        className="overflow-x-auto rounded-lg border bg-card"
        style={{ height: containerHeight }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ minWidth: 560, height: '100%' }}>
          <ResponsiveHeatMap
            data={data}
            margin={{ top: 36, right: 20, bottom: 12, left: 116 }}
            valueFormat=">-.0f"
            axisTop={{ tickSize: 0, tickPadding: 10 }}
            axisLeft={{ tickSize: 0, tickPadding: 10 }}
            axisBottom={null}
            axisRight={null}
            colors={{
              type: 'diverging',
              scheme: 'red_yellow_green',
              minValue: 0,
              divergeAt: 0.5,
              maxValue: 100,
            }}
            emptyColor={isDark ? '#1c1c1f' : '#f4f4f5'}
            borderRadius={3}
            borderWidth={2}
            borderColor={isDark ? '#09090b' : '#fafafa'}
            theme={nivoTheme}
            animate={!prefersReducedMotion}
            hoverTarget="row"
            activeOpacity={1}
            inactiveOpacity={0.5}
            onClick={handleCellClick}
            label={(datum) => (datum.value !== null ? String(datum.value) : '')}
            labelTextColor={(datum) => {
              const score = datum.value ?? 0
              if (score >= 72) return '#ffffff'
              if (score >= 40) return '#1a1a1a'
              return isDark ? '#9ca3af' : '#6b7280'
            }}
            tooltip={({ cell }) => {
              // Set the ref — no setState here to avoid render-loop
              pendingTechRef.current = techMap.get(String(cell.serieId)) ?? null
              // Return null: we render our own fixed card, not nivo's tooltip
              return null
            }}
          />
        </div>
      </div>

      {/* Fixed-position hover card — never clipped by ancestor overflow */}
      {hoveredTech && (
        <div
          style={{
            position: 'fixed',
            left: cardPos.left,
            top: cardPos.top,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <HoverCard tech={hoveredTech} isDark={isDark} />
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded-sm" style={{ background: '#d73027' }} />
          Low
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded-sm" style={{ background: '#fee08b' }} />
          Mid
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded-sm" style={{ background: '#1a9850' }} />
          High
        </div>
      </div>
    </motion.div>
  )
}
