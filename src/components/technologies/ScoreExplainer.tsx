'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---- Types ----

export interface SubScoreFactor {
    label: string
    /** The percentile rank (0-100) or ratio value (0-100 equivalent) */
    value: number | null
    /** Human-readable unit label */
    unit?: string
    /** Optional override direction: positive / negative / neutral */
    direction?: 'positive' | 'negative' | 'neutral'
}

export interface ExplainerDimension {
    key: 'github' | 'community' | 'jobs' | 'ecosystem' | 'onchain'
    score: number | null
    /** Weight % as an integer. e.g. 25 = 25% */
    weightPct: number
    factors: SubScoreFactor[]
}

interface ScoreExplainerProps {
    dimensions: ExplainerDimension[]
    compositeScore: number | null
    confidenceGrade?: string | null
    className?: string
}

// ---- Helpers ----

function getDirection(value: number | null): 'positive' | 'negative' | 'neutral' {
    if (value === null) return 'neutral'
    if (value >= 65) return 'positive'
    if (value <= 35) return 'negative'
    return 'neutral'
}

function getFactorLabel(value: number | null): string {
    if (value === null) return 'No data'
    if (value >= 80) return 'Excellent'
    if (value >= 65) return 'Strong'
    if (value >= 50) return 'Good'
    if (value >= 35) return 'Fair'
    if (value >= 20) return 'Weak'
    return 'Low'
}

function getScoreColor(score: number | null, lowConfidence = false): string {
    if (score === null) return 'text-muted-foreground'
    if (lowConfidence) return 'text-slate-400'
    if (score >= 70) return 'text-emerald-400'
    if (score >= 40) return 'text-amber-400'
    return 'text-red-400'
}

function getBarColor(score: number | null): string {
    if (score === null) return 'bg-muted-foreground/30'
    if (score >= 70) return 'bg-emerald-500/70'
    if (score >= 40) return 'bg-amber-500/70'
    return 'bg-red-500/70'
}

const DIMENSION_LABELS: Record<string, string> = {
    github: 'GitHub Activity',
    community: 'Community Buzz',
    jobs: 'Job Market',
    ecosystem: 'Ecosystem Health',
    onchain: 'On-Chain Health',
}

// ---- Factor Row ----

function FactorRow({ factor }: { factor: SubScoreFactor }) {
    const dir = factor.direction ?? getDirection(factor.value)
    const label = getFactorLabel(factor.value)
    const val = factor.value

    return (
        <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2 min-w-0">
                {dir === 'positive' && <TrendingUp size={12} className="shrink-0 text-emerald-400" />}
                {dir === 'negative' && <TrendingDown size={12} className="shrink-0 text-red-400" />}
                {dir === 'neutral' && <Minus size={12} className="shrink-0 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground truncate">{factor.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {val !== null && (
                    <div className="w-16 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <div
                            className={cn('h-full rounded-full transition-all', getBarColor(val))}
                            style={{ width: `${Math.min(100, val)}%` }}
                        />
                    </div>
                )}
                <span
                    className={cn(
                        'text-xs font-medium w-14 text-right font-mono',
                        dir === 'positive' && 'text-emerald-400',
                        dir === 'negative' && 'text-red-400',
                        dir === 'neutral' && 'text-muted-foreground'
                    )}
                >
                    {val !== null ? `${Math.round(val)}th pct` : '—'}
                </span>
                <span
                    className={cn(
                        'text-xs w-16 text-right hidden sm:block',
                        dir === 'positive' && 'text-emerald-400/70',
                        dir === 'negative' && 'text-red-400/70',
                        dir === 'neutral' && 'text-muted-foreground/60'
                    )}
                >
                    {val !== null ? label : ''}
                </span>
            </div>
        </div>
    )
}

// ---- Dimension Panel ----

function DimensionPanel({
    dim,
    isLowConfidence,
}: {
    dim: ExplainerDimension
    isLowConfidence: boolean
}) {
    const [open, setOpen] = React.useState(false)
    const score = dim.score

    return (
        <div className="rounded-lg border border-border/50 bg-card/30 overflow-hidden">
            {/* Header — always visible */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/10 transition-colors text-left"
                aria-expanded={open}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-semibold text-foreground">
                        {DIMENSION_LABELS[dim.key]}
                    </span>
                    <span className="text-xs text-muted-foreground opacity-70">
                        {dim.weightPct}% weight
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {/* Mini bar */}
                    {score !== null && (
                        <div className="w-20 h-1.5 rounded-full bg-muted/40 overflow-hidden hidden sm:block">
                            <div
                                className={cn('h-full rounded-full', getBarColor(score))}
                                style={{ width: `${score}%` }}
                            />
                        </div>
                    )}
                    <span
                        className={cn(
                            'text-sm font-bold font-mono tabular-nums',
                            getScoreColor(score, isLowConfidence)
                        )}
                    >
                        {score !== null ? Math.round(score) : '—'}
                    </span>
                    <span className="text-muted-foreground">
                        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                </div>
            </button>

            {/* Expanded factor breakdown */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-3 pt-1 border-t border-border/30 space-y-0.5">
                            {dim.factors.length > 0 ? (
                                dim.factors.map((f, idx) => <FactorRow key={idx} factor={f} />)
                            ) : (
                                <p className="text-xs text-muted-foreground py-1">No factor data available.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ---- Main Component ----

export function ScoreExplainer({
    dimensions,
    compositeScore,
    confidenceGrade,
    className,
}: ScoreExplainerProps) {
    const isLowConfidence = confidenceGrade === 'D' || confidenceGrade === 'F'

    // Identify biggest booster and biggest drag
    const scoredDims = dimensions.filter((d) => d.score !== null)
    const topBooster = scoredDims.length > 0
        ? scoredDims.reduce((a, b) => (a.score! > b.score! ? a : b))
        : null
    const topDrag = scoredDims.length > 0
        ? scoredDims.reduce((a, b) => (a.score! < b.score! ? a : b))
        : null

    return (
        <div className={cn('space-y-3', className)}>
            {/* Summary line */}
            {compositeScore !== null && topBooster && topDrag && topBooster.key !== topDrag.key && (
                <div className="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/5 px-4 py-2.5">
                    <Info size={14} className="shrink-0 text-primary/70 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="text-emerald-400 font-medium">
                            Boosted by {DIMENSION_LABELS[topBooster.key]} ({Math.round(topBooster.score!)}
                        </span>
                        {') '}
                        ·{' '}
                        <span className="text-amber-400 font-medium">
                            Dragged by {DIMENSION_LABELS[topDrag.key]} ({Math.round(topDrag.score!)}
                        </span>
                        {').'}
                        {isLowConfidence && (
                            <span className="ml-1 text-slate-400 italic">
                                (Low confidence — score may shift as more data arrives.)
                            </span>
                        )}
                    </p>
                </div>
            )}

            {/* Per-dimension expandable panels */}
            <div className="space-y-2">
                {dimensions.map((dim) => (
                    <DimensionPanel key={dim.key} dim={dim} isLowConfidence={isLowConfidence} />
                ))}
            </div>

            {/* Footer */}
            <p className="text-xs text-muted-foreground/60 px-1">
                Percentile ranks compare this technology against all tracked technologies in the same pipeline run.
                Click any dimension to see exactly which signals drove that score.
            </p>
        </div>
    )
}
