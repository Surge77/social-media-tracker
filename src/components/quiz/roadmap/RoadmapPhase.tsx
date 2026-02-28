'use client'

// src/components/quiz/roadmap/RoadmapPhase.tsx
// Individual phase card with collapsible nodes

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Award, Briefcase, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RoadmapNode } from './RoadmapNode'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { RoadmapPhase as RoadmapPhaseType } from '@/lib/quiz/roadmap-engine'

interface RoadmapPhaseProps {
  phase: RoadmapPhaseType
  isCurrent?: boolean
  defaultExpanded?: boolean
  onNodeClick?: (nodeId: string) => void
  className?: string
  roadmapId?: string
  checkedNodes?: Set<string>
  onNodeCheckedChange?: (nodeId: string, checked: boolean) => void
}

export function RoadmapPhase({
  phase,
  isCurrent = false,
  defaultExpanded = false,
  onNodeClick,
  className,
  roadmapId,
  checkedNodes = new Set(),
  onNodeCheckedChange,
}: RoadmapPhaseProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || isCurrent)
  const prefersReducedMotion = useReducedMotion()

  const totalNodes = phase.nodes.length
  const skippedNodes = phase.nodes.filter((n: any) => n.isSkipped).length
  const activeNodes = totalNodes - skippedNodes

  // Progress tracking
  const activeNodeIds = phase.nodes
    .filter((n: any) => !n.isSkipped)
    .map((n: any) => n.id as string)
  const completedCount = activeNodeIds.filter(id => checkedNodes.has(id)).length
  const isPhaseComplete = activeNodeIds.length > 0 && completedCount === activeNodeIds.length

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background to-muted/10 transition-all hover:shadow-xl hover:shadow-primary/5',
        isCurrent && !isPhaseComplete && 'ring-2 ring-primary/50 shadow-lg shadow-primary/10',
        isPhaseComplete && 'ring-2 ring-success/50 shadow-lg shadow-success/10',
        className
      )}
    >
      {/* Gradient accent bar on the left */}
      <div className={cn(
        'absolute left-0 top-0 h-full w-1 bg-gradient-to-b',
        isCurrent ? 'from-primary via-primary to-primary/50' : 'from-muted via-muted/50 to-transparent'
      )} />

      {/* Phase Header - Always visible */}
      <button
        className="w-full cursor-pointer p-6 pl-8 text-left transition-colors hover:bg-muted/30"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`phase-${phase.number}-content`}
        type="button"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-5">
            {/* Phase number */}
            <div className={cn(
              'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold transition-all',
              isCurrent
                ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30'
                : 'bg-muted/50 text-muted-foreground group-hover:bg-muted'
            )}>
              {phase.number}
              {isCurrent && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-success">
                  <Award className="h-3 w-3 text-success-foreground" />
                </div>
              )}
            </div>

            {/* Phase info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{phase.name}</h3>
                {isCurrent && (
                  <Badge className="shrink-0 bg-primary/20 text-primary hover:bg-primary/30">
                    Start here
                  </Badge>
                )}
                {phase.weeks && (
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {phase.weeks} {phase.weeks === 1 ? 'week' : 'weeks'}
                  </Badge>
                )}
              </div>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{phase.description}</p>

              {/* Node count + progress */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span className="font-medium text-foreground">
                    {activeNodes} {activeNodes === 1 ? 'technology' : 'technologies'}
                  </span>
                </div>
                {skippedNodes > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50" />
                    <span className="text-muted-foreground">{skippedNodes} already mastered</span>
                  </div>
                )}
                {activeNodes > 0 && (
                  <div className={cn(
                    'ml-auto flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                    isPhaseComplete
                      ? 'bg-success/20 text-success'
                      : 'bg-muted text-muted-foreground',
                  )}>
                    {isPhaseComplete && <Check className="w-3 h-3" />}
                    {isPhaseComplete ? 'Phase Complete' : `${completedCount}/${activeNodes} complete`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expand/collapse icon */}
          <div className="flex shrink-0 items-start pt-1">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
            )}
          </div>
        </div>
      </button>

      {/* Phase Content - Collapsible */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`phase-${phase.number}-content`}
            initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? {} : { height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-border/50 bg-muted/20 p-6 pl-8">
              {/* Nodes grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {phase.nodes.map((node: any, index: number) => {
                  const isSkipped = node.isSkipped
                  const isFirstNonSkipped = !isSkipped && phase.nodes.slice(0, index).every((n: any) => n.isSkipped)
                  const status = isSkipped ? 'skipped' : (isFirstNonSkipped && isCurrent ? 'current' : 'upcoming')

                  return (
                    <motion.div
                      key={node.id}
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <RoadmapNode
                        node={node}
                        status={status}
                        onViewDetails={onNodeClick ? () => onNodeClick(node.id) : undefined}
                        roadmapId={roadmapId}
                        checked={checkedNodes.has(node.id)}
                        onCheckedChange={onNodeCheckedChange}
                      />
                    </motion.div>
                  )
                })}
              </div>

              {/* Phase milestone */}
              {phase.milestone && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                      <Award className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">Phase Milestone</h4>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{phase.milestone}</p>
                      {phase.jobsUnlocked && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                          <Briefcase className="h-4 w-4" />
                          {phase.jobsUnlocked}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
