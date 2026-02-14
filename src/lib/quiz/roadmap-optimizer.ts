// src/lib/quiz/roadmap-optimizer.ts
// Data-driven optimization and timeline calculation

import type {
  RoleTemplate,
  UserContext,
  OptimizedRoadmap,
  EnrichedRoadmapNode,
  RoadmapPhase,
  JobImpact,
  RoadmapNode,
} from './roadmap-engine'
import type { TechnologyWithScore } from '@/types'
import { getHoursPerWeek, calculateWeeks } from './roadmap-engine'
import { validateRoadmapRealism } from './roadmap-validation'

/**
 * Main optimization function: transforms template into personalized roadmap
 */
export function optimizeRoadmapWithData(
  template: RoleTemplate,
  userContext: UserContext,
  technologies: TechnologyWithScore[]
): OptimizedRoadmap {

  // 0. VALIDATE TEMPLATE COMPATIBILITY
  const validation = validateRoadmapRealism(
    userContext.startingPoint,
    userContext.targetRole,
    template
  )

  if (validation.warning) {
    console.warn('[Roadmap Optimizer]', validation.warning)
  }

  // 1. SKIP KNOWN TECHS
  const knownSlugs = userContext.currentSkills
  const nodesToSkip = template.phases
    .flatMap(p => p.nodes)
    .filter(n => {
      // Skip if user explicitly knows this tech
      if (n.technologySlug && knownSlugs.includes(n.technologySlug)) {
        return true
      }
      // Skip if node defines skipIf conditions
      if (n.skipIf && n.skipIf.some(slug => knownSlugs.includes(slug))) {
        return true
      }
      return false
    })

  const skipSet = new Set(nodesToSkip.map(n => n.id))

  // 2. INJECT REAL DATA INTO EACH NODE (with fallbacks)
  const allNodes = template.phases.flatMap(p => p.nodes)
  const enrichedNodesMap = new Map<string, EnrichedRoadmapNode>()

  allNodes.forEach(node => {
    const techData = node.technologySlug
      ? technologies.find(t => t.slug === node.technologySlug)
      : null

    // Use real data if available, fallback to node defaults, or conservative estimates
    const jobsScore = techData?.jobs_score ?? node.fallbackScores?.jobsScore ?? 50
    const momentum = techData?.momentum ?? node.fallbackScores?.momentum ?? 0
    const jobCount = techData?.job_postings ?? node.fallbackScores?.jobCount ?? 100

    // Log missing data for monitoring
    if (!techData && node.technologySlug && !node.optional) {
      console.warn(
        `[Roadmap Optimizer] Missing TechnologyWithScore data for critical node: ${node.technologySlug}`
      )
    }

    enrichedNodesMap.set(node.id, {
      ...node,
      jobsScore,
      momentum,
      compositeScore: techData?.composite_score ?? null,
      communityScore: techData?.community_score ?? null,
      jobCount,
      isSkipped: skipSet.has(node.id),
      dataSource: techData ? 'real' : 'fallback',
    })
  })

  // 3. REORDER BY MOTIVATION (within phase constraints)
  const sortedNodes = prioritizeNodesByMotivation(
    Array.from(enrichedNodesMap.values()),
    userContext.motivation
  )

  // 4. CALCULATE PERSONALIZED TIMELINES
  const hoursPerWeek = getHoursPerWeek(userContext.timeCommitment)
  const optimizedPhases = recalculatePhaseTimelines(
    template.phases,
    enrichedNodesMap,
    hoursPerWeek
  )

  // 5. MARK OPTIONAL NODES AS SKIP/RECOMMENDED
  const finalPhases = markOptionalNodes(
    optimizedPhases,
    userContext.motivation,
    enrichedNodesMap
  )

  // 6. CALCULATE JOB IMPACT PER PHASE
  const jobImpact = calculateCumulativeJobImpact(finalPhases, technologies)

  const totalWeeks = finalPhases.reduce((sum, phase) => sum + (phase.weeks ?? 0), 0)
  const totalNodes = finalPhases.reduce(
    (sum, phase) => sum + phase.nodes.filter(n => !enrichedNodesMap.get(n.id)?.isSkipped).length,
    0
  )

  return {
    phases: finalPhases,
    jobImpact,
    totalWeeks,
    totalNodes,
  }
}

/**
 * Prioritize nodes based on user's motivation
 */
function prioritizeNodesByMotivation(
  nodes: EnrichedRoadmapNode[],
  motivation: UserContext['motivation']
): EnrichedRoadmapNode[] {
  // Sort nodes by priority boost for this motivation
  // Keep dependency order intact (don't break dependencies)

  return nodes.map(node => {
    const boost = node.priorityBoost?.[motivation] ?? 0
    return {
      ...node,
      _priority: node.jobsScore + boost,
    }
  }).sort((a, b) => {
    // Preserve phase ordering (don't reorder across phases)
    // Within same phase, sort by priority
    return (b._priority ?? 0) - (a._priority ?? 0)
  })
}

/**
 * Recalculate phase timelines based on user's time commitment
 */
function recalculatePhaseTimelines(
  phases: RoadmapPhase[],
  enrichedNodes: Map<string, EnrichedRoadmapNode>,
  hoursPerWeek: number
): RoadmapPhase[] {
  return phases.map(phase => {
    // Calculate total hours for non-skipped nodes in this phase
    const totalHours = phase.nodes.reduce((sum, node) => {
      const enriched = enrichedNodes.get(node.id)
      if (enriched?.isSkipped) return sum
      return sum + node.estimatedHours
    }, 0)

    const weeks = calculateWeeks(totalHours, hoursPerWeek)

    return {
      ...phase,
      weeks,
      nodes: phase.nodes.map(n => {
        const enriched = enrichedNodes.get(n.id)!
        return { ...n, ...enriched }
      }) as RoadmapNode[],
    }
  })
}

/**
 * Mark optional nodes based on motivation and job market data
 */
function markOptionalNodes(
  phases: RoadmapPhase[],
  motivation: UserContext['motivation'],
  enrichedNodes: Map<string, EnrichedRoadmapNode>
): RoadmapPhase[] {
  return phases.map(phase => ({
    ...phase,
    nodes: phase.nodes.map(node => {
      if (!node.optional) return node

      const enriched = enrichedNodes.get(node.id)
      if (!enriched) return node

      // Determine if this optional node should be recommended
      let recommended = false

      if (motivation === 'get-first-job') {
        // Recommend if high jobs score
        recommended = enriched.jobsScore >= 60
      } else if (motivation === 'future-proof') {
        // Recommend if high momentum
        recommended = enriched.momentum >= 8
      } else if (motivation === 'build-product') {
        // Recommend if has priorityBoost for build-product
        recommended = (node.priorityBoost?.['build-product'] ?? 0) >= 15
      } else {
        // Default: recommend if composite score is decent
        recommended = (enriched.compositeScore ?? 0) >= 55
      }

      return {
        ...node,
        _recommended: recommended,
      }
    }),
  }))
}

/**
 * Calculate cumulative job impact for each phase
 */
export function calculateCumulativeJobImpact(
  phases: RoadmapPhase[],
  technologies: TechnologyWithScore[]
): JobImpact[] {
  return phases.map((phase, index) => {
    // Get all skills learned up to and including this phase
    const skillsSoFar = phases
      .slice(0, index + 1)
      .flatMap(p => p.nodes)
      .filter((n: RoadmapNode & Partial<EnrichedRoadmapNode>) => {
        // @ts-ignore - accessing isSkipped which may not exist
        return !n.isSkipped && n.technologySlug
      })
      .map(n => n.technologySlug!)

    // Use pre-calculated job counts from batch analysis
    // Fallback to rough estimate: sum of individual job counts * 0.6 (overlap factor)
    const estimatedJobs = skillsSoFar.reduce((total, slug) => {
      const tech = technologies.find(t => t.slug === slug)
      return total + (tech?.job_postings ?? 100)
    }, 0) * 0.6 // Adjust for job overlap (many jobs require multiple skills)

    return {
      afterPhase: index + 1,
      jobsQualifiedFor: Math.round(estimatedJobs),
      skillCount: skillsSoFar.length,
    }
  })
}

/**
 * Get helper for hours per week from time commitment
 */
export function getTimeCommitmentHours(timeCommitment: UserContext['timeCommitment']): number {
  return getHoursPerWeek(timeCommitment)
}

/**
 * Calculate completion percentage for a roadmap
 */
export function calculateCompletionPercentage(
  completedNodeIds: string[],
  allNodes: RoadmapNode[]
): number {
  if (allNodes.length === 0) return 0
  const completed = allNodes.filter(n => completedNodeIds.includes(n.id)).length
  return Math.round((completed / allNodes.length) * 100)
}
