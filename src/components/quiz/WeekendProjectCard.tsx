'use client'

import React, { useEffect, useState } from 'react'
import { Rocket, Clock, ChevronDown, ChevronUp, CheckCircle2, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ProjectIdea } from '@/lib/ai/generators/project-ideas'

interface WeekendProjectCardProps {
  slug: string
  goal?: string
  level?: string
  className?: string
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'bg-success/10 text-green-600 dark:text-green-400',
  intermediate: 'bg-warning/10 text-orange-600 dark:text-orange-400',
  advanced: 'bg-destructive/10 text-red-600 dark:text-red-400',
}

const STEP_COLORS = [
  'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
]

export function WeekendProjectCard({ slug, goal = 'side-project', level = 'intermediate', className }: WeekendProjectCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const [idea, setIdea] = useState<ProjectIdea | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load on first expand to avoid blocking render
  useEffect(() => {
    if (expanded && !loaded) {
      setLoaded(true)
      setLoading(true)
      fetch(`/api/quiz/projects?slug=${encodeURIComponent(slug)}&goal=${encodeURIComponent(goal)}&level=${encodeURIComponent(level)}`)
        .then(r => r.json())
        .then(data => {
          if (data.idea) setIdea(data.idea)
        })
        .catch(() => {
          // silently fail
        })
        .finally(() => setLoading(false))
    }
  }, [expanded, loaded, slug, goal, level])

  return (
    <div className={className}>
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Your Weekend Project</span>
          {!expanded && <span className="text-xs text-muted-foreground">(expand to generate)</span>}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? {} : { height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3">
              {loading && <LoadingSkeleton />}

              {!loading && idea && <ProjectIdeaContent idea={idea} prefersReducedMotion={prefersReducedMotion} />}

              {!loading && !idea && (
                <Card className="p-4 border-dashed border-border/50">
                  <p className="text-sm text-muted-foreground text-center">
                    Could not generate a project idea. Try refreshing.
                  </p>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-6 w-20 ml-4" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-8 w-full rounded" />
    </Card>
  )
}

function ProjectIdeaContent({ idea, prefersReducedMotion }: { idea: ProjectIdea; prefersReducedMotion: boolean }) {
  return (
    <Card className="border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">Build: &quot;{idea.name}&quot;</h4>
            <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{idea.estimatedHours}h</span>
            </div>
            <Badge className={cn('text-xs capitalize', DIFFICULTY_COLOR[idea.difficulty] ?? '')}>
              {idea.difficulty}
            </Badge>
          </div>
        </div>
      </div>

      {/* Build steps */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Build Plan</p>
        <div className="space-y-2">
          {(idea.buildSteps ?? []).map((step, i) => (
            <motion.div
              key={step.step}
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -8 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3"
            >
              <div className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border shrink-0 mt-0.5',
                STEP_COLORS[i % STEP_COLORS.length],
              )}>
                {step.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{step.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{step.hours}h</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.what}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skills */}
      {idea.skills && idea.skills.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills You&apos;ll Practice</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {idea.skills.map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Success condition */}
      <div className="p-4 bg-success/5 border-t border-success/20">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">{idea.successCondition}</p>
        </div>
      </div>
    </Card>
  )
}
