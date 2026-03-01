// src/lib/quiz/roadmap-engine.ts
// Core types and interfaces for Career Roadmap feature

import type { TechnologyWithScore } from '@/types'

/**
 * Individual technology node in the roadmap
 */
export interface RoadmapNode {
  id: string                       // e.g., 'html-css', 'react', 'typescript'
  technologySlug?: string          // Maps to our TechnologyWithScore data
  name: string
  category: 'foundation' | 'core' | 'framework' | 'tool' | 'advanced' | 'specialization'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: number           // Base hours to learn
  dependencies: string[]           // Node IDs that must be learned first
  optional: boolean                // Can be skipped
  skipIf?: string[]                // Skip if user already knows these
  priorityBoost?: {                // Boost priority based on motivation
    'get-first-job': number        // e.g., +20 for job-critical skills
    'build-product': number
    'future-proof': number
    'level-up': number
    'switch-specialty': number
  }
  milestone?: string               // e.g., "You can now build basic websites"
  projectIdea?: string             // e.g., "Build a portfolio site"
  whyLearnThis?: string            // Template reason, AI can override
  honestNote?: string              // "This is boring but necessary"
  resources?: {
    course?: string                // Top recommended course
    docs?: string                  // Official docs link
    project?: string               // Project tutorial link
    youtube?: {                    // Video resolved via video-lookup.ts
      videoId: string
      title: string
      channel: string
      views?: number
      thumbnail?: string | null
    }
  }
  // Fallback data for when TechnologyWithScore is unavailable
  fallbackScores?: {
    jobsScore: number              // Default job market score (0-100)
    momentum: number               // Default momentum estimate
    jobCount: number               // Estimated job count
  }
}

/**
 * Enriched node with real data injected
 */
export interface EnrichedRoadmapNode extends RoadmapNode {
  jobsScore: number
  momentum: number
  compositeScore: number | null
  communityScore: number | null
  jobCount: number
  isSkipped: boolean
  dataSource: 'real' | 'fallback'
}

/**
 * Phase in the learning roadmap
 */
export interface RoadmapPhase {
  number: number
  name: string                     // e.g., "Foundations", "Core Skills"
  description: string
  nodes: RoadmapNode[]
  milestone: string                // What they can do after this phase
  jobsUnlocked?: string            // "Qualifies for ~X jobs"
  weeks?: number                   // Calculated based on time commitment
}

/**
 * Milestone celebration
 */
export interface Milestone {
  afterPhase: number
  title: string
  description: string
  celebration: 'confetti' | 'fireworks' | 'rocket' | 'star'
  jobImpact?: string               // "You now qualify for 500+ junior jobs"
}

/**
 * Role template with all phases and nodes
 */
export interface RoleTemplate {
  id: string
  version: number                  // Template version for progress tracking compatibility
  role: string
  description: string
  totalNodes: number
  phases: RoadmapPhase[]
  milestones: Milestone[]
  minimumStartingPoint?: string    // e.g., 'basics' for AI/ML to warn complete beginners
  estimatedMonths: {               // Realistic timeline expectations
    beginner: number               // If starting from 'absolute-beginner'
    intermediate: number           // If starting from 'one-language'
    advanced: number               // If starting from 'junior'
  }
}

/**
 * User's quiz answers and context
 */
export interface UserContext {
  startingPoint: 'absolute-beginner' | 'basics' | 'one-language' | 'junior' | 'mid-level' | 'senior-pivoting'
  currentSkills: string[]          // Technology slugs
  targetRole: string               // Role template ID
  timeCommitment: '5hrs' | '10hrs' | '20hrs' | 'fulltime'
  motivation: 'get-first-job' | 'level-up' | 'switch-specialty' | 'build-product' | 'future-proof'
  learningStyle: 'build-projects' | 'structured-courses' | 'read-docs' | 'video-tutorials'
}

/**
 * Job impact metrics per phase
 */
export interface JobImpact {
  afterPhase: number
  jobsQualifiedFor: number
  skillCount: number
}

/**
 * AI-generated enhancements
 */
export interface RoadmapAIEnhancement {
  overallSummary: string           // "You're 6 months away from being a frontend dev..."
  phaseCommentary: string[]        // Per-phase personalized notes
  nodeReasonings: Map<string, string>  // Per-node "why THIS for YOU"
  honestWarnings: string[]         // "Phase 2 is where most people quit..."
  motivationalNote: string         // "Your JS background gives you a head start..."
  skipJustifications: Map<string, string>  // Why certain nodes are skipped
}

/**
 * Optimized roadmap with all enhancements
 */
export interface OptimizedRoadmap {
  phases: RoadmapPhase[]
  jobImpact: JobImpact[]
  totalWeeks: number
  totalNodes: number
  aiEnhancement?: RoadmapAIEnhancement
}

/**
 * Generated roadmap ready for display
 */
export interface GeneratedRoadmap extends OptimizedRoadmap {
  userContext: UserContext
  template: RoleTemplate
  generatedAt: number
  roadmapId: string                // Hash of quiz answers for storage
}

/**
 * Validation result for roadmap realism
 */
export interface ValidationResult {
  valid: boolean
  warning?: string
  severity?: 'info' | 'warning' | 'error'
}

/**
 * Progress tracking (localStorage + future server sync)
 */
export interface RoadmapProgress {
  roadmapId: string                // Hash of quiz answers
  templateVersion: number          // Lock to template version used
  userId?: string                  // Optional: for anonymous → logged-in migration
  startedAt: number
  completedNodes: string[]         // Node IDs
  currentPhase: number
  lastUpdated: number
  streakDays: number
  totalHoursLogged: number
  syncStatus?: 'local-only' | 'synced' | 'conflict'  // Future: for server sync
}

/**
 * Helper function to get hours per week from time commitment
 */
export function getHoursPerWeek(timeCommitment: UserContext['timeCommitment']): number {
  const hoursMap: Record<UserContext['timeCommitment'], number> = {
    '5hrs': 5,
    '10hrs': 10,
    '20hrs': 20,
    'fulltime': 40,
  }
  return hoursMap[timeCommitment]
}

/**
 * Helper function to calculate weeks needed for a set of hours
 */
export function calculateWeeks(totalHours: number, hoursPerWeek: number): number {
  return Math.ceil(totalHours / hoursPerWeek)
}

/**
 * Generate unique roadmap ID from user context
 */
export function generateRoadmapId(userContext: UserContext): string {
  const payload = JSON.stringify({
    startingPoint: userContext.startingPoint,
    targetRole: userContext.targetRole,
    skills: userContext.currentSkills.sort(),
    time: userContext.timeCommitment,
    motivation: userContext.motivation,
  })

  // Simple hash function (for production, use crypto.subtle.digest)
  let hash = 0
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `roadmap-${Math.abs(hash).toString(36)}`
}

/**
 * Get starting point level as number for comparison
 */
export function getStartingPointLevel(point: UserContext['startingPoint']): number {
  const levels: Record<UserContext['startingPoint'], number> = {
    'absolute-beginner': 0,
    'basics': 1,
    'one-language': 2,
    'junior': 3,
    'mid-level': 4,
    'senior-pivoting': 5,
  }
  return levels[point] ?? 0
}
