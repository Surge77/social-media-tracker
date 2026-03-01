'use client'

// src/components/quiz/roadmap/RoadmapNode.tsx
// Individual technology node in the roadmap

import React, { useCallback, useMemo } from 'react'
import { Check, Circle, Clock, TrendingUp, Briefcase, BookOpen, Play, ExternalLink, GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import { getTechResources, getTechVideos } from '@/lib/quiz/resources'
import type { YouTubeVideoEntry } from '@/lib/quiz/resources'
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

  // Look up curated resources for this technology
  const techResources = useMemo(() => {
    if (node.technologySlug) {
      return getTechResources(node.technologySlug)
    }
    // Try looking up by node id as fallback
    return getTechResources(node.id)
  }, [node.technologySlug, node.id])

  // Get all curated videos (multi-video support)
  const techVideos = useMemo(() => {
    return getTechVideos(node.technologySlug || node.id)
  }, [node.technologySlug, node.id])

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

        {/* Learning Resources */}
        {(techResources || techVideos.length > 0) && !isSkipped && (
          <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg bg-emerald-500/20 p-1.5">
                <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Learning Resources</p>
            </div>
            <div className="space-y-2">
              {/* Official Docs */}
              {techResources?.docsUrl && (
                <a
                  href={techResources.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-lg bg-background/60 px-3 py-2 text-sm transition-all hover:bg-background hover:shadow-sm group/link"
                >
                  <BookOpen className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span className="flex-1 text-muted-foreground group-hover/link:text-foreground transition-colors">
                    Official Docs
                  </span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/50 group-hover/link:text-muted-foreground transition-colors" aria-hidden="true" />
                </a>
              )}

              {/* YouTube Videos — show all curated videos */}
              {techVideos.length > 0 ? (
                techVideos.map((video) => (
                  <a
                    key={video.videoId}
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-lg bg-background/60 px-3 py-2 text-sm transition-all hover:bg-background hover:shadow-sm group/link"
                  >
                    <Play className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate text-muted-foreground group-hover/link:text-foreground transition-colors">
                        {video.title}
                      </span>
                      <span className="text-xs text-muted-foreground/70">
                        {video.channel} · {video.durationMinutes >= 60 ? `${Math.round(video.durationMinutes / 60)}h ${video.durationMinutes % 60}m` : `${video.durationMinutes} min`}
                      </span>
                    </div>
                    <VideoTypeBadge type={video.type} />
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/50 group-hover/link:text-muted-foreground transition-colors" aria-hidden="true" />
                  </a>
                ))
              ) : techResources?.youtube && (
                /* Fallback: single legacy video */
                <a
                  href={`https://www.youtube.com/watch?v=${techResources.youtube.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-lg bg-background/60 px-3 py-2 text-sm transition-all hover:bg-background hover:shadow-sm group/link"
                >
                  <Play className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <span className="block truncate text-muted-foreground group-hover/link:text-foreground transition-colors">
                      {techResources.youtube.title}
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      {techResources.youtube.channel} · {techResources.youtube.durationMinutes} min
                    </span>
                  </div>
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/50 group-hover/link:text-muted-foreground transition-colors" aria-hidden="true" />
                </a>
              )}

              {/* Primary Learn Resource */}
              {techResources?.primaryLearnResource && !techResources.docsUrl && (
                <div className="flex items-center gap-2.5 rounded-lg bg-background/60 px-3 py-2 text-sm">
                  <GraduationCap className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    {techResources.primaryLearnResource}
                  </span>
                </div>
              )}
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

/** Small badge showing the type of video (intro, crash-course, etc.) */
function VideoTypeBadge({ type }: { type: YouTubeVideoEntry['type'] }) {
  const config: Record<YouTubeVideoEntry['type'], { label: string; className: string }> = {
    'intro': { label: 'Quick Intro', className: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400' },
    'crash-course': { label: 'Crash Course', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    'full-tutorial': { label: 'Full Tutorial', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    'project-based': { label: 'Project', className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    'comparison': { label: 'Comparison', className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  }

  const { label, className } = config[type] ?? config['intro']

  return (
    <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', className)}>
      {label}
    </span>
  )
}
