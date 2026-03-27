import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { bundleAndImport } from './module-loader.mjs'

function resolveFixturePath(fixturePath) {
  return fixturePath ?? path.resolve(process.cwd(), 'autoresearch', 'fixtures', 'scoring', 'baseline.json')
}

function compareValues(leftValue, operator, rightValue, tolerance = 0.000001) {
  switch (operator) {
    case 'gt':
      return leftValue > rightValue
    case 'gte':
      return leftValue >= rightValue
    case 'lt':
      return leftValue < rightValue
    case 'lte':
      return leftValue <= rightValue
    case 'eq':
      return leftValue === rightValue
    case 'approx':
      return Math.abs(leftValue - rightValue) <= tolerance
    default:
      throw new Error(`Unsupported operator: ${operator}`)
  }
}

function evaluateAssertions(subject, assertions, contextLabel) {
  const failures = []

  for (const assertion of assertions) {
    const leftValue = assertion.left === 'sum'
      ? Object.values(subject).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0)
      : subject[assertion.left]
    const rightValue = Object.prototype.hasOwnProperty.call(assertion, 'right')
      ? (typeof assertion.right === 'string' ? subject[assertion.right] : assertion.right)
      : assertion.value

    if (!compareValues(leftValue, assertion.operator, rightValue, assertion.tolerance)) {
      failures.push(
        `${contextLabel}: expected ${assertion.left} ${assertion.operator} ${
          Object.prototype.hasOwnProperty.call(assertion, 'right') ? assertion.right : assertion.value
        }`,
      )
    }
  }

  return failures
}

function scoreSection(id, weight, failures) {
  return {
    id,
    weight,
    passed: failures.length === 0,
    score: failures.length === 0 ? weight : 0,
    failures,
  }
}

export async function evaluateScoringFixtureSet(fixturePath) {
  const absoluteFixturePath = resolveFixturePath(fixturePath)
  const fixture = JSON.parse(await readFile(absoluteFixturePath, 'utf8'))

  const adaptiveWeightsModule = await bundleAndImport(
    path.resolve(process.cwd(), 'src', 'lib', 'scoring', 'adaptive-weights.ts'),
  )
  const momentumModule = await bundleAndImport(
    path.resolve(process.cwd(), 'src', 'lib', 'scoring', 'enhanced-momentum.ts'),
  )
  const compositeModule = await bundleAndImport(
    path.resolve(process.cwd(), 'src', 'lib', 'scoring', 'composite.ts'),
  )

  const sections = []
  const failures = []

  const weightFailures = []
  for (const check of fixture.weights) {
    const weights = adaptiveWeightsModule.getAdaptiveWeights(
      check.input.category,
      check.input.dataAgeDays,
      check.input.dataCompleteness,
    )
    weightFailures.push(...evaluateAssertions(weights, check.assertions, check.id))
  }
  sections.push(scoreSection('weights', fixture.sectionWeights.weights, weightFailures))
  failures.push(...weightFailures)

  const momentumFailures = []
  for (const check of fixture.momentum) {
    const analysis = momentumModule.analyzeMomentum(check.scores)
    momentumFailures.push(...evaluateAssertions(analysis, check.assertions, check.id))
  }
  sections.push(scoreSection('momentum', fixture.sectionWeights.momentum, momentumFailures))
  failures.push(...momentumFailures)

  const rankingFailures = []
  for (const check of fixture.rankings) {
    const computed = check.candidates.map((candidate) => {
      const weights = adaptiveWeightsModule.getAdaptiveWeights(
        candidate.category,
        candidate.dataAgeDays,
        candidate.dataCompleteness,
      )
      const result = compositeModule.computeCompositeScore(candidate.subScores, weights, candidate.category)
      return {
        id: candidate.id,
        composite: result.composite,
      }
    })

    const ranked = computed
      .sort((left, right) => right.composite - left.composite)
      .map((candidate) => candidate.id)

    if (JSON.stringify(ranked) !== JSON.stringify(check.expectedOrder)) {
      rankingFailures.push(
        `${check.id}: expected ${check.expectedOrder.join(' > ')}, got ${ranked.join(' > ')}`,
      )
    }
  }
  sections.push(scoreSection('ranking', fixture.sectionWeights.ranking, rankingFailures))
  failures.push(...rankingFailures)

  const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0)
  const earned = sections.reduce((sum, section) => sum + section.score, 0)

  return {
    track: 'scoring',
    metric: Math.round((earned / totalWeight) * 10000) / 100,
    failures,
    sections,
  }
}
