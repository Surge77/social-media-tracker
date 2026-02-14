// src/lib/quiz/roadmap-timeline.ts
// Timeline calculation utilities

import type { UserContext, RoadmapNode, RoadmapPhase } from './roadmap-engine'
import { getHoursPerWeek, calculateWeeks } from './roadmap-engine'

/**
 * Calculate timeline for a set of nodes
 */
export function calculateNodeTimeline(
  nodes: RoadmapNode[],
  timeCommitment: UserContext['timeCommitment'],
  skipNodeIds: string[] = []
): { weeks: number; hours: number } {
  const hoursPerWeek = getHoursPerWeek(timeCommitment)

  const totalHours = nodes.reduce((sum, node) => {
    if (skipNodeIds.includes(node.id)) return sum
    return sum + node.estimatedHours
  }, 0)

  const weeks = calculateWeeks(totalHours, hoursPerWeek)

  return { weeks, hours: totalHours }
}

/**
 * Calculate timeline breakdown by phase
 */
export interface PhaseTimeline {
  phaseNumber: number
  phaseName: string
  weeks: number
  hours: number
  startWeek: number
  endWeek: number
  nodeCount: number
  skippedCount: number
}

export function calculatePhaseTimelines(
  phases: RoadmapPhase[],
  timeCommitment: UserContext['timeCommitment'],
  skipNodeIds: string[] = []
): PhaseTimeline[] {
  let currentWeek = 1

  return phases.map(phase => {
    const timeline = calculateNodeTimeline(phase.nodes, timeCommitment, skipNodeIds)
    const nodeCount = phase.nodes.length
    const skippedCount = phase.nodes.filter(n => skipNodeIds.includes(n.id)).length

    const phaseTimeline: PhaseTimeline = {
      phaseNumber: phase.number,
      phaseName: phase.name,
      weeks: timeline.weeks,
      hours: timeline.hours,
      startWeek: currentWeek,
      endWeek: currentWeek + timeline.weeks - 1,
      nodeCount,
      skippedCount,
    }

    currentWeek += timeline.weeks

    return phaseTimeline
  })
}

/**
 * Format timeline for display
 */
export function formatTimeline(weeks: number, hoursPerWeek: number): string {
  const months = Math.floor(weeks / 4)
  const remainingWeeks = weeks % 4

  if (months === 0) {
    return `${weeks} week${weeks === 1 ? '' : 's'}`
  }

  if (remainingWeeks === 0) {
    return `${months} month${months === 1 ? '' : 's'}`
  }

  return `${months} month${months === 1 ? '' : 's'}, ${remainingWeeks} week${remainingWeeks === 1 ? '' : 's'}`
}

/**
 * Format hours for display
 */
export function formatHours(hours: number): string {
  if (hours < 10) {
    return `${hours} hour${hours === 1 ? '' : 's'}`
  }

  if (hours >= 1000) {
    return `${Math.round(hours / 10) / 100}k hours`
  }

  return `${hours} hours`
}

/**
 * Calculate estimated completion date
 */
export function estimateCompletionDate(
  weeks: number,
  startDate: Date = new Date()
): Date {
  const completionDate = new Date(startDate)
  completionDate.setDate(completionDate.getDate() + weeks * 7)
  return completionDate
}

/**
 * Format completion date for display
 */
export function formatCompletionDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    year: 'numeric',
  }

  return date.toLocaleDateString('en-US', options)
}

/**
 * Calculate pace description based on time commitment
 */
export function getPaceDescription(timeCommitment: UserContext['timeCommitment']): string {
  const paceMap: Record<UserContext['timeCommitment'], string> = {
    '5hrs': 'Casual pace — steady progress',
    '10hrs': 'Serious pace — 1-2 hrs/day',
    '20hrs': 'Intensive pace — part-time dedication',
    'fulltime': 'Bootcamp mode — all in',
  }

  return paceMap[timeCommitment]
}

/**
 * Calculate learning streak days
 */
export function calculateStreak(lastUpdated: number, currentTime: number = Date.now()): number {
  const daysDiff = Math.floor((currentTime - lastUpdated) / (1000 * 60 * 60 * 24))

  // If more than 1 day has passed, streak is broken
  if (daysDiff > 1) return 0

  // Otherwise, maintain streak
  return daysDiff
}
