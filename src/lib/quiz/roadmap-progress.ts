// src/lib/quiz/roadmap-progress.ts
// Progress tracking (localStorage + future server sync)

import type { RoadmapProgress } from './roadmap-engine'

const STORAGE_KEY = 'devtrends-roadmap-progress'

/**
 * Get progress for a roadmap
 */
export function getRoadmapProgress(roadmapId: string): RoadmapProgress | null {
  if (typeof window === 'undefined') return null

  try {
    const allProgress = getAllProgress()
    return allProgress[roadmapId] ?? null
  } catch (error) {
    console.error('[Progress] Error getting progress:', error)
    return null
  }
}

/**
 * Save progress for a roadmap
 */
export function saveRoadmapProgress(progress: RoadmapProgress): void {
  if (typeof window === 'undefined') return

  try {
    const allProgress = getAllProgress()
    allProgress[progress.roadmapId] = {
      ...progress,
      lastUpdated: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress))
  } catch (error) {
    console.error('[Progress] Error saving progress:', error)
  }
}

/**
 * Get all progress records
 */
export function getAllProgress(): Record<string, RoadmapProgress> {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('[Progress] Error parsing progress:', error)
    return {}
  }
}

/**
 * Mark a node as completed
 */
export function markNodeCompleted(roadmapId: string, nodeId: string): void {
  const progress = getRoadmapProgress(roadmapId)
  if (!progress) return

  if (!progress.completedNodes.includes(nodeId)) {
    progress.completedNodes.push(nodeId)
    saveRoadmapProgress(progress)
  }
}

/**
 * Mark a node as incomplete
 */
export function markNodeIncomplete(roadmapId: string, nodeId: string): void {
  const progress = getRoadmapProgress(roadmapId)
  if (!progress) return

  progress.completedNodes = progress.completedNodes.filter(id => id !== nodeId)
  saveRoadmapProgress(progress)
}

/**
 * Initialize progress for a new roadmap
 */
export function initializeProgress(
  roadmapId: string,
  templateVersion: number
): RoadmapProgress {
  const progress: RoadmapProgress = {
    roadmapId,
    templateVersion,
    startedAt: Date.now(),
    completedNodes: [],
    currentPhase: 1,
    lastUpdated: Date.now(),
    streakDays: 0,
    totalHoursLogged: 0,
    syncStatus: 'local-only',
  }

  saveRoadmapProgress(progress)
  return progress
}

/**
 * Calculate completion percentage
 */
export function calculateCompletion(
  completedNodes: string[],
  totalNodes: string[]
): number {
  if (totalNodes.length === 0) return 0
  return Math.round((completedNodes.length / totalNodes.length) * 100)
}

/**
 * Update streak
 */
export function updateStreak(roadmapId: string): void {
  const progress = getRoadmapProgress(roadmapId)
  if (!progress) return

  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const daysSinceLastUpdate = Math.floor((now - progress.lastUpdated) / oneDayMs)

  if (daysSinceLastUpdate === 0) {
    // Same day, maintain streak
    return
  } else if (daysSinceLastUpdate === 1) {
    // Next day, increment streak
    progress.streakDays += 1
  } else {
    // Streak broken
    progress.streakDays = 1
  }

  saveRoadmapProgress(progress)
}

/**
 * Log learning hours
 */
export function logHours(roadmapId: string, hours: number): void {
  const progress = getRoadmapProgress(roadmapId)
  if (!progress) return

  progress.totalHoursLogged += hours
  saveRoadmapProgress(progress)
  updateStreak(roadmapId)
}

/**
 * Clear all progress
 */
export function clearAllProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
