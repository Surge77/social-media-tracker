import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { bundleAndImport } from './module-loader.mjs'

function resolveFixturePath(fixturePath) {
  return fixturePath ?? path.resolve(process.cwd(), 'autoresearch', 'fixtures', 'routing', 'baseline.json')
}

function scoreRoutingCase(testCase, routeTable) {
  const route = routeTable[testCase.useCase]
  const order = [route.preferredProvider, ...route.fallbackOrder]
  const attemptedProviders = []
  let chosenProvider = null
  let chosenOutcome = null

  for (const providerName of order) {
    const outcome = testCase.providers[providerName]
    if (!outcome || outcome.available === false) {
      continue
    }

    attemptedProviders.push(providerName)

    if (outcome.success) {
      chosenProvider = providerName
      chosenOutcome = outcome
      break
    }
  }

  const failures = []

  if (!chosenProvider || !chosenOutcome) {
    failures.push(`${testCase.id}: no provider satisfied the replay conditions`)
  } else {
    if (chosenProvider !== testCase.expectations.chosenProvider) {
      failures.push(
        `${testCase.id}: expected ${testCase.expectations.chosenProvider}, got ${chosenProvider}`,
      )
    }

    if (chosenOutcome.qualityScore < testCase.expectations.minimumQualityScore) {
      failures.push(`${testCase.id}: quality score ${chosenOutcome.qualityScore} below threshold`)
    }

    const maxLatencyMs = testCase.expectations.maxLatencyMs ?? route.maxLatencyMs
    if (chosenOutcome.latencyMs > maxLatencyMs) {
      failures.push(`${testCase.id}: latency ${chosenOutcome.latencyMs}ms exceeded ${maxLatencyMs}ms`)
    }

    if (chosenOutcome.costUsd > testCase.expectations.maxCostUsd) {
      failures.push(`${testCase.id}: cost ${chosenOutcome.costUsd} exceeded ${testCase.expectations.maxCostUsd}`)
    }
  }

  return {
    id: testCase.id,
    chosenProvider,
    attemptedProviders,
    passed: failures.length === 0,
    score: failures.length === 0 ? testCase.weight : 0,
    maxScore: testCase.weight,
    failures,
  }
}

export async function evaluateRoutingFixtureSet(fixturePath) {
  const absoluteFixturePath = resolveFixturePath(fixturePath)
  const fixture = JSON.parse(await readFile(absoluteFixturePath, 'utf8'))
  const routerModule = await bundleAndImport(
    path.resolve(process.cwd(), 'src', 'lib', 'ai', 'router.ts'),
  )

  const cases = fixture.cases.map((testCase) => scoreRoutingCase(testCase, routerModule.ROUTING_TABLE))
  const failures = cases.flatMap((testCase) => testCase.failures)
  const total = cases.reduce((sum, testCase) => sum + testCase.maxScore, 0)
  const earned = cases.reduce((sum, testCase) => sum + testCase.score, 0)

  return {
    track: 'routing',
    metric: Math.round((earned / total) * 10000) / 100,
    failures,
    cases,
  }
}
