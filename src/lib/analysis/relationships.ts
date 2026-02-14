/**
 * Technology Relationship Analyzer
 *
 * Analyzes co-occurrence patterns between technologies to determine relationships.
 */

export type RelationshipType = 'builds-on' | 'competes-with' | 'complements' | 'supersedes' | 'ecosystem'

interface TechnologyBasic {
  id: string
  name: string
  category: string
  ecosystem: string | null
}

export interface TechRelationship {
  sourceTechnologyId: string
  targetTechnologyId: string
  relationshipType: RelationshipType
  strength: number // 0-1
  coOccurrenceRate: number // 0-1
}

interface TechSignals {
  category: string
  compositeScore: number
  hnMentions?: number
  githubStars?: number
  communityScore?: number
}

/**
 * Analyze relationships between technologies
 */
export async function analyzeRelationships(
  technologies: TechnologyBasic[],
  signals: Map<string, TechSignals>
): Promise<TechRelationship[]> {
  const relationships: TechRelationship[] = []

  // Compare each technology with every other technology
  for (let i = 0; i < technologies.length; i++) {
    for (let j = i + 1; j < technologies.length; j++) {
      const tech1 = technologies[i]
      const tech2 = technologies[j]

      const tech1Signals = signals.get(tech1.id)
      const tech2Signals = signals.get(tech2.id)

      if (!tech1Signals || !tech2Signals) continue

      const relationship = detectRelationship(tech1, tech2, tech1Signals, tech2Signals)

      if (relationship) {
        relationships.push(relationship)

        // Add reverse relationship if bidirectional
        if (relationship.relationshipType === 'complements' || relationship.relationshipType === 'ecosystem') {
          relationships.push({
            ...relationship,
            sourceTechnologyId: tech2.id,
            targetTechnologyId: tech1.id
          })
        }
      }
    }
  }

  return relationships
}

/**
 * Detect relationship between two technologies
 */
function detectRelationship(
  tech1: TechnologyBasic,
  tech2: TechnologyBasic,
  signals1: TechSignals,
  signals2: TechSignals
): TechRelationship | null {
  let strength = 0
  let coOccurrenceRate = 0
  let relationshipType: RelationshipType | null = null

  // 1. Category overlap - base strength
  if (tech1.category === tech2.category) {
    strength += 0.3
  }

  // 2. Ecosystem relationship - same ecosystem
  if (tech1.ecosystem && tech2.ecosystem && tech1.ecosystem === tech2.ecosystem) {
    relationshipType = 'ecosystem'
    strength += 0.4
    coOccurrenceRate = 0.8
  }

  // 3. Competitive detection - same category and similar scores
  if (tech1.category === tech2.category && !relationshipType) {
    const scoreDiff = Math.abs(signals1.compositeScore - signals2.compositeScore)

    if (scoreDiff < 10) {
      relationshipType = 'competes-with'
      strength += 0.4
      coOccurrenceRate = 0.5
    }
  }

  // 4. Complementary detection - different categories but high co-occurrence
  // For MVP, we'll use heuristics based on common patterns
  if (!relationshipType) {
    const isComplementary = detectComplementaryPair(tech1, tech2)
    if (isComplementary) {
      relationshipType = 'complements'
      strength += 0.5
      coOccurrenceRate = 0.7
    }
  }

  // 5. Builds-on relationship detection
  if (!relationshipType) {
    const buildsOn = detectBuildsOnRelationship(tech1, tech2)
    if (buildsOn) {
      relationshipType = 'builds-on'
      strength += 0.6
      coOccurrenceRate = 0.9
    }
  }

  // Only return relationships with sufficient strength
  if (relationshipType && strength > 0.3) {
    return {
      sourceTechnologyId: tech1.id,
      targetTechnologyId: tech2.id,
      relationshipType,
      strength: Math.min(strength, 1.0),
      coOccurrenceRate: Math.min(coOccurrenceRate, 1.0)
    }
  }

  return null
}

/**
 * Detect if two technologies are complementary
 * (commonly used together but in different categories)
 */
function detectComplementaryPair(tech1: TechnologyBasic, tech2: TechnologyBasic): boolean {
  const name1 = tech1.name.toLowerCase()
  const name2 = tech2.name.toLowerCase()

  // Common complementary patterns
  const complementaryPairs = [
    // Frontend + Backend
    ['react', 'express'],
    ['react', 'nest'],
    ['vue', 'express'],
    ['angular', 'nest'],

    // Framework + Database
    ['next', 'postgres'],
    ['django', 'postgres'],
    ['rails', 'postgres'],

    // Language + Framework
    ['typescript', 'react'],
    ['typescript', 'vue'],
    ['typescript', 'angular'],
    ['typescript', 'nest'],

    // DevOps + Cloud
    ['docker', 'kubernetes'],
    ['terraform', 'aws'],

    // Frontend + State Management
    ['react', 'redux'],
    ['vue', 'vuex'],

    // Testing + Framework
    ['jest', 'react'],
    ['vitest', 'vue'],
  ]

  for (const [a, b] of complementaryPairs) {
    if ((name1.includes(a) && name2.includes(b)) || (name1.includes(b) && name2.includes(a))) {
      return true
    }
  }

  // Check if different categories but both popular (likely used together)
  if (tech1.category !== tech2.category) {
    // Frontend + Backend is always complementary
    if (
      (tech1.category === 'frontend' && tech2.category === 'backend') ||
      (tech1.category === 'backend' && tech2.category === 'frontend')
    ) {
      return true
    }

    // Database + (Frontend or Backend)
    if (
      (tech1.category === 'database' && (tech2.category === 'frontend' || tech2.category === 'backend')) ||
      (tech2.category === 'database' && (tech1.category === 'frontend' || tech1.category === 'backend'))
    ) {
      return true
    }
  }

  return false
}

/**
 * Detect if tech1 builds on tech2
 */
function detectBuildsOnRelationship(tech1: TechnologyBasic, tech2: TechnologyBasic): boolean {
  const name1 = tech1.name.toLowerCase()
  const name2 = tech2.name.toLowerCase()

  // Known "builds on" relationships
  const buildsOnPairs = [
    // Frameworks built on languages
    ['react', 'javascript'],
    ['vue', 'javascript'],
    ['angular', 'typescript'],
    ['next', 'react'],
    ['remix', 'react'],
    ['astro', 'javascript'],
    ['svelte', 'javascript'],
    ['solid', 'javascript'],

    // Meta-frameworks
    ['next', 'react'],
    ['nuxt', 'vue'],
    ['sveltekit', 'svelte'],

    // Backend frameworks built on languages
    ['express', 'node'],
    ['nest', 'node'],
    ['fastify', 'node'],
    ['django', 'python'],
    ['flask', 'python'],
    ['fastapi', 'python'],

    // Tools built on languages
    ['webpack', 'javascript'],
    ['vite', 'javascript'],
    ['esbuild', 'go'],
  ]

  for (const [derived, base] of buildsOnPairs) {
    if (name1.includes(derived) && name2.includes(base)) {
      return true
    }
  }

  return false
}
