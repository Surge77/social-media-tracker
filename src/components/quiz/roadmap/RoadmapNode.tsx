'use client'

// src/components/quiz/roadmap/RoadmapNode.tsx
// Individual technology node in the roadmap

import React, { useCallback } from 'react'
import { Check, Circle, Clock, TrendingUp, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { EnrichedRoadmapNode } from '@/lib/quiz/roadmap-engine'

interface RoadmapNodeProps {
  node: EnrichedRoadmapNode & {
    _recommended?: boolean
    _priority?: number
  }
  status?: 'skipped' | 'completed' | 'current' | 'upcoming'
  onViewDetails?: () => void
  className?: string
  roadmapId?: string
  checked?: boolean
  onCheckedChange?: (nodeId: string, checked: boolean) => void
}

export function RoadmapNode({ node, status = 'upcoming', onViewDetails, className, roadmapId, checked = false, onCheckedChange }: RoadmapNodeProps) {
  const prefersReducedMotion = useReducedMotion()

  const handleCheckboxChange = useCallback(() => {
    onCheckedChange?.(node.id, !checked)
  }, [node.id, checked, onCheckedChange])

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" aria-hidden="true" />
      case 'current':
        return <Clock className="h-4 w-4" aria-hidden="true" />
      case 'skipped':
        return <Circle className="h-4 w-4 opacity-50" aria-hidden="true" />
      default:
        return <Circle className="h-4 w-4" aria-hidden="true" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground'
      case 'current':
        return 'bg-primary text-primary-foreground'
      case 'skipped':
        return 'bg-muted text-muted-foreground opacity-60'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getDifficultyColor = () => {
    switch (node.difficulty) {
      case 'beginner':
        return 'text-green-600 dark:text-green-400'
      case 'intermediate':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'advanced':
        return 'text-red-600 dark:text-red-400'
    }
  }

  const isSkipped = node.isSkipped || status === 'skipped'

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('relative h-full', className)}
    >
      <Card
        className={cn(
          'group relative h-full overflow-hidden border border-border bg-gradient-to-br from-background to-background p-5 transition-all hover:shadow-lg hover:shadow-primary/5',
          isSkipped && 'opacity-60',
          checked && 'border-success/40 bg-success/5',
          status === 'current' && !checked && 'ring-2 ring-primary/50 shadow-lg shadow-primary/10',
          !isSkipped && 'hover:border-primary/30'
        )}
        role="article"
        aria-labelledby={`node-${node.id}-title`}
        aria-describedby={`node-${node.id}-description`}
      >
        {/* Checkbox — top right corner */}
        {!isSkipped && onCheckedChange && (
          <button
            onClick={handleCheckboxChange}
            className={cn(
              'absolute top-3 right-3 w-5 h-5 rounded flex items-center justify-center border-2 transition-all z-10',
              checked
                ? 'bg-success border-success text-success-foreground'
                : 'border-border hover:border-primary',
            )}
            aria-label={checked ? `Mark ${node.name} as incomplete` : `Mark ${node.name} as complete`}
            aria-checked={checked}
            role="checkbox"
          >
            {checked && <Check className="w-3 h-3" />}
          </button>
        )}
        {/* Status indicator bar */}
        {status === 'current' && (
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary to-primary/50" />
        )}
        {status === 'completed' && (
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-success via-success to-success/50" />
        )}
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {/* Status icon */}
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all',
                getStatusColor()
              )}
              aria-label={`Status: ${status}`}
            >
              {getStatusIcon()}
            </div>

            {/* Title and category */}
            <div className="min-w-0 flex-1">
              <h4 id={`node-${node.id}-title`} className={cn('break-words text-base font-bold tracking-tight sm:text-lg', checked && 'line-through text-muted-foreground')}>
                {node.name}
              </h4>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="sr-only">{node.category} technology, {node.difficulty} difficulty</span>
                <Badge variant="secondary" className={cn('shrink-0 text-xs font-medium', getDifficultyColor())}>
                  {node.difficulty}
                </Badge>
                <span className="shrink-0 text-muted-foreground">•</span>
                <span className="shrink-0 font-medium text-muted-foreground">{node.estimatedHours} hrs</span>
                {isSkipped && (
                  <>
                    <span className="shrink-0 text-muted-foreground">•</span>
                    <Badge variant="secondary" className="shrink-0 bg-muted text-xs text-muted-foreground">
                      ✓ Already mastered
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Optional badge */}
          {node.optional && !isSkipped && (
            <Badge
              variant={node._recommended ? 'default' : 'outline'}
              className="shrink-0"
            >
              {node._recommended ? '⭐ Recommended' : 'Optional'}
            </Badge>
          )}
        </div>

        {/* Data indicators */}
        {!isSkipped && (
          <div className="mb-4 flex flex-wrap gap-2">
            {/* Jobs score */}
            <div
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-blue-500/20"
              title={`Job market score: ${node.jobsScore}/100`}
              aria-label={`Job market score: ${node.jobsScore} out of 100`}
            >
              <Briefcase className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="text-blue-700 dark:text-blue-300">{node.jobsScore}</span>
              <span className="text-blue-600/60 dark:text-blue-400/60" aria-hidden="true">/100</span>
            </div>

            {/* Momentum */}
            <div
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                node.momentum > 0
                  ? 'bg-green-500/10 hover:bg-green-500/20'
                  : 'bg-orange-500/10 hover:bg-orange-500/20'
              )}
              title={`Momentum: ${node.momentum > 0 ? '+' : ''}${node.momentum}`}
              aria-label={`Momentum: ${node.momentum > 0 ? 'positive' : 'negative'} ${Math.abs(node.momentum)}`}
            >
              <TrendingUp
                className={cn(
                  'h-3.5 w-3.5',
                  node.momentum > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                )}
                aria-hidden="true"
              />
              <span className={cn(
                node.momentum > 0 ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
              )}>
                {node.momentum > 0 ? '+' : ''}{node.momentum}
              </span>
            </div>

            {/* Data source indicator */}
            {node.dataSource === 'fallback' && (
              <Badge variant="secondary" className="text-xs" aria-label="Estimated data">
                ~Est.
              </Badge>
            )}
          </div>
        )}

        {/* Honest note */}
        {node.honestNote && !isSkipped && (
          <div className="mb-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-2">
              <span className="text-sm">💭</span>
              <p id={`node-${node.id}-description`} className="text-sm leading-relaxed text-muted-foreground">
                {node.honestNote}
              </p>
            </div>
          </div>
        )}

        {/* Project idea */}
        {node.projectIdea && !isSkipped && (
          <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-500/20 p-1.5">
                <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">Project Idea</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{node.projectIdea}</p>
              </div>
            </div>
          </div>
        )}

        {/* Milestone */}
        {node.milestone && !isSkipped && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/20 p-1.5">
                <span className="text-base" aria-hidden="true">🎯</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Milestone</p>
                <p className="mt-1 text-sm font-medium leading-relaxed">{node.milestone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dependencies */}
        {node.dependencies && node.dependencies.length > 0 && !isSkipped && (
          <div className="mb-3 text-xs text-muted-foreground">
            <span>Depends on: {node.dependencies.join(', ')}</span>
          </div>
        )}

        {/* Actions */}
        {!isSkipped && onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="w-full"
            aria-label={`View details for ${node.name}`}
          >
            View Details →
          </Button>
        )}

        {/* Skipped message */}
        {isSkipped && (
          <p className="text-sm text-muted-foreground">
            We'll skip this since you already know it!
          </p>
        )}
      </Card>
    </motion.div>
  )
}
