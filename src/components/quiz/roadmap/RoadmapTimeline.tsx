'use client'

// src/components/quiz/roadmap/RoadmapTimeline.tsx
// Main roadmap timeline with modern, polished UI

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Target, TrendingUp, Award } from 'lucide-react'
import { RoadmapPhase } from './RoadmapPhase'
import { RoadmapMilestone } from './RoadmapMilestone'
import { RoadmapStats } from './RoadmapStats'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { GeneratedRoadmap } from '@/lib/quiz/roadmap-engine'

interface RoadmapTimelineProps {
  roadmap: GeneratedRoadmap
  variant?: 'expanded' | 'collapsed'
  initialExpandedPhase?: number
  onNodeClick?: (nodeId: string) => void
  className?: string
}

export function RoadmapTimeline({
  roadmap,
  variant = 'expanded',
  initialExpandedPhase,
  onNodeClick,
  className
}: RoadmapTimelineProps) {
  const prefersReducedMotion = useReducedMotion()
  const storageKey = `devtrends_roadmap_${roadmap.roadmapId}_progress`

  // --- Checkbox progress state ---
  const [checkedNodes, setCheckedNodes] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? new Set<string>(JSON.parse(stored) as string[]) : new Set<string>()
    } catch {
      return new Set<string>()
    }
  })

  const handleNodeCheckedChange = useCallback((nodeId: string, checked: boolean) => {
    setCheckedNodes(prev => {
      const next = new Set(prev)
      if (checked) { next.add(nodeId) } else { next.delete(nodeId) }
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]))
      } catch { /* storage unavailable */ }
      return next
    })
  }, [storageKey])

  // --- Progress calculation ---
  const allActiveNodeIds: string[] = roadmap.phases.flatMap(phase =>
    phase.nodes.filter((n: any) => !n.isSkipped).map((n: any) => n.id as string)
  )
  const totalActive = allActiveNodeIds.length
  const totalChecked = allActiveNodeIds.filter(id => checkedNodes.has(id)).length
  const progressPercent = totalActive > 0 ? Math.round((totalChecked / totalActive) * 100) : 0

  // Find the first phase with non-skipped nodes as the current phase
  const currentPhaseNumber = initialExpandedPhase ?? (roadmap.phases.findIndex(phase =>
    phase.nodes.some((node: any) => !node.isSkipped)
  ) + 1 || 1)

  // Get milestones map for easy lookup
  const milestonesMap = new Map(
    roadmap.template.milestones.map(m => [m.afterPhase, m])
  )

  // Calculate stats for hero
  const totalNodes = roadmap.totalNodes
  const totalWeeks = roadmap.totalWeeks
  const estimatedMonths = Math.ceil(totalWeeks / 4)

  return (
    <div className={cn('space-y-8', className)}>
      {/* Hero Section */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-background via-background to-primary/10 p-8 sm:p-12"
      >
        {/* Decorative gradient orbs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-3xl" />

        <div className="relative">
          {/* Success badge */}
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 0 }}
            animate={prefersReducedMotion ? {} : { scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-4 py-1.5 text-sm font-medium text-success"
          >
            <Award className="h-4 w-4" />
            Roadmap Generated
          </motion.div>

          {/* Main title */}
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your Path to{' '}
            <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              {roadmap.template.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </h1>

          {/* Subtitle with user context */}
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            {formatStartingPoint(roadmap.userContext.startingPoint)} →{' '}
            <span className="font-semibold text-foreground">
              {roadmap.template.role.replace('-developer', '').replace('-engineer', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Ready
            </span>
            {' '} in {estimatedMonths} {estimatedMonths === 1 ? 'month' : 'months'}
          </p>

          {/* Quick stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Calendar, label: 'Duration', value: `${totalWeeks} weeks`, color: 'text-blue-500' },
              { icon: Target, label: 'Technologies', value: totalNodes.toString(), color: 'text-purple-500' },
              { icon: Clock, label: 'Per Week', value: getWeeklyHours(roadmap.userContext.timeCommitment), color: 'text-green-500' },
              { icon: TrendingUp, label: 'Difficulty', value: getDifficultyLabel(roadmap.userContext.startingPoint), color: 'text-orange-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-4 backdrop-blur-sm"
              >
                <div className={cn('rounded-lg bg-muted p-2', stat.color)}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Summary */}
          {roadmap.aiEnhancement?.overallSummary && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={prefersReducedMotion ? {} : { opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">AI Insight</p>
                  <p className="mt-1 text-sm italic leading-relaxed text-muted-foreground">
                    "{roadmap.aiEnhancement.overallSummary}"
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Warnings */}
          {roadmap.aiEnhancement?.honestWarnings && roadmap.aiEnhancement.honestWarnings.length > 0 && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={prefersReducedMotion ? {} : { opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 space-y-2"
            >
              {roadmap.aiEnhancement.honestWarnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
                  <span className="text-lg">⚠️</span>
                  <p className="text-sm text-warning-foreground">{warning}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Motivational note */}
          {roadmap.aiEnhancement?.motivationalNote && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={prefersReducedMotion ? {} : { opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-4 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4"
            >
              <span className="text-lg">💪</span>
              <p className="text-sm font-medium text-success-foreground">
                {roadmap.aiEnhancement.motivationalNote}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <RoadmapStats roadmap={roadmap} />
      </motion.div>

      {/* Phase Timeline */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={prefersReducedMotion ? {} : { opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="space-y-6"
      >
        {/* Global progress bar */}
        {totalActive > 0 && (
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {totalChecked > 0 ? 'Your progress' : 'Start learning'}
              </span>
              <span className="text-muted-foreground">
                {totalChecked} / {totalActive} technologies
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progressPercent === 0
                ? 'Check off technologies as you learn them'
                : progressPercent === 100
                ? '🎉 Roadmap complete!'
                : `${progressPercent}% complete — keep going!`}
            </p>
          </div>
        )}

        {/* Timeline header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Learning Timeline</h2>
          <Badge variant="secondary" className="text-sm">
            Phase {currentPhaseNumber} of {roadmap.phases.length}
          </Badge>
        </div>

        {/* Phases */}
        <div className="relative space-y-8">
          {roadmap.phases.map((phase, index) => {
            const phaseNumber = index + 1
            const isCurrent = phaseNumber === currentPhaseNumber
            const milestone = milestonesMap.get(phaseNumber)

            return (
              <motion.div
                key={phase.number}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
              >
                {/* Phase card */}
                <RoadmapPhase
                  phase={phase}
                  isCurrent={isCurrent}
                  defaultExpanded={variant === 'expanded' || isCurrent}
                  onNodeClick={onNodeClick}
                  roadmapId={roadmap.roadmapId}
                  checkedNodes={checkedNodes}
                  onNodeCheckedChange={handleNodeCheckedChange}
                />

                {/* Milestone after phase */}
                {milestone && (
                  <div className="mt-6">
                    <RoadmapMilestone milestone={milestone} />
                  </div>
                )}

                {/* Connector line (not after last phase) */}
                {index < roadmap.phases.length - 1 && (
                  <div className="flex justify-center py-4">
                    <div className="relative h-12 w-1">
                      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/50 to-muted" />
                      <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

// Helper functions
function formatStartingPoint(startingPoint: string): string {
  const map: Record<string, string> = {
    'absolute-beginner': 'Complete Beginner',
    'basics': 'The Basics',
    'one-language': 'One Language',
    'junior': 'Junior Dev',
    'mid-level': 'Mid-Level',
    'senior-pivoting': 'Senior (Pivoting)',
  }
  return map[startingPoint] ?? startingPoint
}

function getWeeklyHours(timeCommitment: string): string {
  const map: Record<string, string> = {
    '5hrs': '5 hrs',
    '10hrs': '10 hrs',
    '20hrs': '20 hrs',
    'fulltime': '40 hrs',
  }
  return map[timeCommitment] ?? timeCommitment
}

function getDifficultyLabel(startingPoint: string): string {
  const map: Record<string, string> = {
    'absolute-beginner': 'Beginner',
    'basics': 'Easy',
    'one-language': 'Medium',
    'junior': 'Moderate',
    'mid-level': 'Advanced',
    'senior-pivoting': 'Expert',
  }
  return map[startingPoint] ?? 'Medium'
}
